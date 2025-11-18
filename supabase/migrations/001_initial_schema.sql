-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE place_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
CREATE TYPE location_type AS ENUM ('country', 'city', 'district');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  trust_score INTEGER DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 1000),
  role user_role DEFAULT 'user',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  names JSONB NOT NULL, -- {"en": "Restaurant", "tr": "Restoran"}
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table (hierarchical structure)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  type location_type NOT NULL,
  slug VARCHAR(100) NOT NULL,
  names JSONB NOT NULL, -- {"en": "Istanbul", "tr": "İstanbul"}
  path TEXT, -- Materialized path: /turkey/istanbul/kadikoy
  has_districts BOOLEAN DEFAULT FALSE, -- If true, show districts instead of places
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, slug)
);

-- Create index on path for faster hierarchical queries
CREATE INDEX idx_locations_path ON locations USING BTREE (path);
CREATE INDEX idx_locations_parent_id ON locations(parent_id);
CREATE INDEX idx_locations_type ON locations(type);

-- Places table
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug VARCHAR(200) UNIQUE NOT NULL,
  names JSONB NOT NULL, -- {"en": "Cafe Nero", "tr": "Cafe Nero"}
  descriptions JSONB, -- {"en": "Great coffee...", "tr": "Harika kahve..."}
  address TEXT,
  phone VARCHAR(50),
  website VARCHAR(255),
  google_maps_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  images JSONB, -- Array of image URLs
  status place_status DEFAULT 'pending',
  vote_count INTEGER DEFAULT 0,
  vote_score INTEGER DEFAULT 0, -- Sum of weighted votes
  rank INTEGER, -- Calculated rank within location/category
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_places_location_id ON places(location_id);
CREATE INDEX idx_places_category_id ON places(category_id);
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_places_rank ON places(rank) WHERE status = 'approved';
CREATE INDEX idx_places_vote_score ON places(vote_score DESC) WHERE status = 'approved';

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)), -- -1 for downvote, 1 for upvote
  weight DECIMAL(3, 2) DEFAULT 1.0 CHECK (weight >= 0.1 AND weight <= 1.0), -- Vote weight based on account age
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_place_id ON votes(place_id);
CREATE INDEX idx_votes_created_at ON votes(created_at);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status report_status DEFAULT 'pending',
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_place_id ON reports(place_id);
CREATE INDEX idx_reports_status ON reports(status);

-- Rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'vote', 'place_submit', 'report'
  action_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action_type, window_start)
);

CREATE INDEX idx_rate_limits_user_action ON rate_limits(user_id, action_type, window_start);

-- Function to calculate vote weight based on account age
CREATE OR REPLACE FUNCTION calculate_vote_weight(user_created_at TIMESTAMPTZ)
RETURNS DECIMAL(3, 2) AS $$
DECLARE
  account_age_hours INTEGER;
  weight DECIMAL(3, 2);
BEGIN
  account_age_hours := EXTRACT(EPOCH FROM (NOW() - user_created_at)) / 3600;

  IF account_age_hours < 24 THEN
    weight := 0.3; -- New accounts (< 24 hours)
  ELSIF account_age_hours < 168 THEN -- < 1 week
    weight := 0.5;
  ELSIF account_age_hours < 720 THEN -- < 1 month
    weight := 0.7;
  ELSE
    weight := 1.0; -- Accounts older than 1 month
  END IF;

  RETURN weight;
END;
$$ LANGUAGE plpgsql;

-- Function to update vote weight
CREATE OR REPLACE FUNCTION update_vote_weight()
RETURNS TRIGGER AS $$
DECLARE
  user_created_at TIMESTAMPTZ;
BEGIN
  SELECT created_at INTO user_created_at FROM users WHERE id = NEW.user_id;
  NEW.weight := calculate_vote_weight(user_created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set vote weight on insert/update
CREATE TRIGGER set_vote_weight
BEFORE INSERT OR UPDATE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_vote_weight();

-- Function to update place vote statistics
CREATE OR REPLACE FUNCTION update_place_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE places SET
      vote_count = vote_count - 1,
      vote_score = vote_score - (OLD.value * OLD.weight),
      updated_at = NOW()
    WHERE id = OLD.place_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE places SET
      vote_score = vote_score - (OLD.value * OLD.weight) + (NEW.value * NEW.weight),
      updated_at = NOW()
    WHERE id = NEW.place_id;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE places SET
      vote_count = vote_count + 1,
      vote_score = vote_score + (NEW.value * NEW.weight),
      updated_at = NOW()
    WHERE id = NEW.place_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update place votes
CREATE TRIGGER update_place_vote_stats
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_place_votes();

-- Function to calculate and update place ranks
CREATE OR REPLACE FUNCTION update_place_ranks()
RETURNS void AS $$
BEGIN
  WITH ranked_places AS (
    SELECT
      id,
      location_id,
      category_id,
      ROW_NUMBER() OVER (
        PARTITION BY location_id, category_id
        ORDER BY vote_score DESC, vote_count DESC, created_at ASC
      ) AS new_rank
    FROM places
    WHERE status = 'approved'
  )
  UPDATE places p
  SET rank = rp.new_rank, updated_at = NOW()
  FROM ranked_places rp
  WHERE p.id = rp.id AND (p.rank IS NULL OR p.rank != rp.new_rank);
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);

-- Locations policies (public read)
CREATE POLICY "Anyone can view locations" ON locations FOR SELECT USING (true);

-- Places policies
CREATE POLICY "Anyone can view approved places" ON places FOR SELECT USING (status = 'approved' OR auth.uid() = submitted_by);
CREATE POLICY "Authenticated users can submit places" ON places FOR INSERT WITH CHECK (auth.uid() = submitted_by AND status = 'pending');
CREATE POLICY "Users can update own pending places" ON places FOR UPDATE USING (auth.uid() = submitted_by AND status = 'pending');
CREATE POLICY "Admins can update any place" ON places FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Votes policies
CREATE POLICY "Users can view own votes" ON votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
CREATE POLICY "Admins can update reports" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Rate limits policies
CREATE POLICY "Users can view own rate limits" ON rate_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage rate limits" ON rate_limits FOR ALL USING (true);
