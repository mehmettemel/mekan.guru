# Local Flavours - Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Database Schema](#database-schema)
3. [Feature Workflows](#feature-workflows)
4. [Components Structure](#components-structure)
5. [API Layer](#api-layer)
6. [Authentication & Authorization](#authentication--authorization)
7. [MVP Strategy](#mvp-strategy)

---

## Project Overview

**Local Flavours** is a community-driven platform for discovering and sharing authentic local food places in Turkey.

### Core Features
- 🏆 **Leaderboard**: Top-rated places by city with voting
- 📚 **Collections**: Curated lists of places with recommended items
- 🗳️ **Voting System**: Weighted community voting
- 🔍 **Smart Search**: Find or create places with duplicate detection
- 👥 **User Profiles**: Personal collections and contributions

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Drag & Drop**: @dnd-kit
- **State**: React Query (TanStack Query)

---

## Database Schema

### Core Tables

#### 1. **users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  account_age_days INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM (NOW() - created_at))
  ) STORED
);
```

**Purpose**: User accounts and profiles
**Key Fields**:
- `account_age_days`: Auto-calculated for vote weighting

---

#### 2. **categories**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  names JSONB NOT NULL,           -- {"en": "Food", "tr": "Yemek"}
  icon VARCHAR(50),                -- Emoji or icon name
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
```

**Purpose**: Hierarchical category system
**Structure**:
- **Main Categories**: Yemek, Kafe, Bar, Genel
- **Subcategories**: Döner, Hamburger, Tatlı, etc. (under Yemek)

**Example Data**:
```javascript
// Main category
{ slug: 'yemek', names: { en: 'Food', tr: 'Yemek' }, parent_id: null }

// Subcategories
{ slug: 'doner', names: { en: 'Döner', tr: 'Döner' }, parent_id: '<yemek-id>' }
{ slug: 'hamburger', names: { en: 'Burger', tr: 'Hamburger' }, parent_id: '<yemek-id>' }
```

---

#### 3. **locations**
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  type location_type NOT NULL,    -- 'country' | 'city' | 'district'
  slug VARCHAR(100) NOT NULL,
  names JSONB NOT NULL,            -- {"en": "Istanbul", "tr": "İstanbul"}
  path TEXT,                       -- '/turkey/istanbul'
  has_districts BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, slug)
);
```

**Purpose**: Hierarchical location system
**Structure**: Country → City → District

---

#### 4. **places**
```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id),
  category_id UUID REFERENCES categories(id),
  slug VARCHAR(100) UNIQUE NOT NULL,
  names JSONB NOT NULL,            -- {"en": "Halil Usta", "tr": "Halil Usta"}
  descriptions JSONB,              -- {"en": "...", "tr": "..."}
  address TEXT,
  images TEXT[],                   -- Array of image URLs
  status VARCHAR(20) DEFAULT 'approved', -- 'pending' | 'approved' | 'rejected'
  vote_count INTEGER DEFAULT 0,
  vote_score DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_places_location_id ON places(location_id);
CREATE INDEX idx_places_category_id ON places(category_id);
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_places_vote_score ON places(vote_score DESC);
```

**Purpose**: Restaurant/cafe/bar entries
**MVP Strategy**: Auto-approve all new places (status = 'approved')
**Key Fields**:
- `vote_score`: Weighted score for leaderboard ranking
- `vote_count`: Total number of votes

---

#### 5. **votes**
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)), -- -1 downvote, 1 upvote
  weight DECIMAL(3, 2) DEFAULT 1.0 CHECK (weight >= 0.1 AND weight <= 1.0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_place_id ON votes(place_id);
```

**Purpose**: User voting on places
**Vote Weighting**:
- Based on account age (older accounts = higher weight)
- Prevents vote manipulation
- One vote per user per place (can change up/down)

---

#### 6. **collections**
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  names JSONB NOT NULL,            -- {"en": "...", "tr": "..."}
  descriptions JSONB,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  subcategory_id UUID REFERENCES categories(id), -- Optional for food types
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'archived' | 'flagged'
  is_featured BOOLEAN DEFAULT FALSE,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collections_creator_id ON collections(creator_id);
CREATE INDEX idx_collections_location_id ON collections(location_id);
CREATE INDEX idx_collections_category_id ON collections(category_id);
CREATE INDEX idx_collections_status ON collections(status);
```

**Purpose**: User-curated lists of places
**Features**:
- Multi-language support
- Category + subcategory (e.g., Yemek → Döner)
- Can be featured by admins

---

#### 7. **collection_places**
```sql
CREATE TABLE collection_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  curator_note TEXT,               -- Why this place is in the collection
  recommended_items TEXT[],        -- ["Adana Kebap", "Ayran", "Salata"]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, place_id)
);

CREATE INDEX idx_collection_places_collection_id ON collection_places(collection_id);
CREATE INDEX idx_collection_places_place_id ON collection_places(place_id);
CREATE INDEX idx_collection_places_display_order ON collection_places(collection_id, display_order);
```

**Purpose**: Many-to-many relationship between collections and places
**Key Features**:
- **display_order**: Drag-and-drop sorting
- **curator_note**: Personal recommendation
- **recommended_items**: Array of food/drink recommendations per place

**Example**:
```javascript
{
  collection_id: "abc-123",
  place_id: "xyz-789",
  display_order: 0,
  curator_note: "En iyi Adana kebabı burada!",
  recommended_items: ["Adana Kebap", "Ayran", "Közlenmiş Biber"]
}
```

---

## Feature Workflows

### 1. Homepage Leaderboard

**Flow**:
```
User visits homepage
    ↓
Select city (Istanbul default)
    ↓
Fetch top 20 places by vote_score
    ↓
Display in table with:
    - Rank (🥇🥈🥉)
    - Place name
    - Category
    - Vote buttons (👍👎)
    - Score badge
    ↓
User clicks city button/dropdown
    ↓
URL updates: /?city=ankara
    ↓
Page transitions smoothly
    ↓
New data loads
```

**Key Components**:
- `app/page.tsx`: Server component, fetches data
- `components/leaderboard/places-leaderboard.tsx`: Client component with voting
- `lib/api/places.ts`: `getTopPlacesByCity(slug, limit)`

**Database Query**:
```sql
SELECT *
FROM places
WHERE location_id = (SELECT id FROM locations WHERE slug = 'istanbul')
  AND status = 'approved'
ORDER BY vote_score DESC
LIMIT 20;
```

---

### 2. Collection-Based Voting System

**How It Works**:
The platform uses a unique collection-based voting system where:
1. Users create collections of places
2. Community votes on entire collections (not individual places)
3. Votes automatically propagate to all places in the collection via database triggers
4. Places accumulate votes from all collections they appear in
5. Homepage leaderboard ranks places by aggregated vote scores

**Collection Voting Flow**:
```
User votes on a collection (upvote/downvote)
    ↓
Check authentication
    ↓
If not logged in → Show alert
    ↓
If logged in:
    ↓
Check existing collection vote
    ↓
If exists → Update vote value
If not → Insert new vote
    ↓
Database trigger: update_collection_vote_stats
    ↓
Updates collection.vote_count and collection.vote_score
    ↓
Database trigger: propagate_collection_votes_to_places
    ↓
Updates ALL places in the collection:
    - place.vote_score += (vote_value * vote_weight)
    - place.vote_count += 1
    ↓
Homepage leaderboard automatically reflects new rankings
```

**Vote Weight Calculation**:
```sql
-- Based on account age
CREATE OR REPLACE FUNCTION calculate_vote_weight(user_created_at TIMESTAMPTZ)
RETURNS DECIMAL AS $$
BEGIN
  RETURN CASE
    WHEN EXTRACT(DAY FROM (NOW() - user_created_at)) < 30 THEN 0.5
    WHEN EXTRACT(DAY FROM (NOW() - user_created_at)) < 90 THEN 0.75
    WHEN EXTRACT(DAY FROM (NOW() - user_created_at)) < 180 THEN 1.0
    ELSE 1.2
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Database Triggers**:
```sql
-- 1. Update collection vote statistics
CREATE TRIGGER update_collection_vote_stats
AFTER INSERT OR UPDATE OR DELETE ON collection_votes
FOR EACH ROW
EXECUTE FUNCTION update_collection_votes();

-- 2. Propagate collection votes to places
CREATE TRIGGER propagate_collection_votes
AFTER INSERT OR UPDATE OR DELETE ON collection_votes
FOR EACH ROW
EXECUTE FUNCTION propagate_collection_votes_to_places();
```

**Benefits**:
- ✅ Prevents vote manipulation (can't vote directly on places)
- ✅ Rewards good curators (collections with good places get more votes)
- ✅ Natural quality filter (bad collections get fewer votes)
- ✅ Places in multiple highly-voted collections rise to the top
- ✅ Automatic aggregation (no manual calculation needed)

---

### 3. Collection Management

#### **Creating a Collection**

**Flow**:
```
User navigates to "Koleksiyonlarım"
    ↓
Clicks "Yeni Koleksiyon"
    ↓
Modal opens: EditCollectionModal
    ↓
Fill basic info:
    - Name (required)
    - Description (optional)
    - City (required)
    - Category (required)
    - Subcategory (if Yemek category)
    ↓
Click "Mekan Ekle"
    ↓
AddPlaceDialog opens
    ↓
Choose mode:
    [Mevcut Mekanlar] or [Yeni Mekan Oluştur]
    ↓
If existing:
    - Search by name
    - Select from list
    ↓
If new:
    - Enter name & address
    - System checks for duplicates
    - Shows warning if similar places found
    - User decides to proceed or not
    - Creates new place with auto-approval
    ↓
Add curator note (optional)
    ↓
Add recommended items:
    - Type item name
    - Press Enter or click +
    - Items appear as badges
    - Click X to remove
    ↓
Click "Oluştur ve Ekle" or "Mekan Ekle"
    ↓
Place added to collection (in modal)
    ↓
Repeat for more places
    ↓
Drag to reorder places
    ↓
Click "Oluştur"
    ↓
Collection saved:
    - Insert into collections table
    - Insert all places into collection_places
    - With display_order, notes, recommended_items
    ↓
Modal closes
    ↓
List refreshes with new collection
```

**Key Components**:
- `app/my-collections/page.tsx`: List page
- `components/collections/edit-collection-modal.tsx`: Main modal
- `components/collections/add-place-dialog.tsx`: Add/create place dialog

---

#### **Editing a Collection**

**Flow**:
```
User clicks edit on collection card
    ↓
EditCollectionModal opens
    ↓
Pre-filled with existing data:
    - Basic info
    - All places in order
    - Recommended items per place
    ↓
User can:
    - Change name/description/category
    - Add new places
    - Remove places (X button)
    - Reorder places (drag & drop)
    - Edit recommended items per place
    ↓
Click "Güncelle"
    ↓
Update logic:
    - Update collection data
    - Delete all existing collection_places
    - Insert updated places with new order
    ↓
Modal closes
    ↓
List refreshes
```

---

### 4. Duplicate Detection System

**When**: User types place name in "Yeni Mekan Oluştur" mode

**Flow**:
```
User types place name
    ↓
After 3+ characters
    ↓
Debounced search (300ms)
    ↓
Query database:
    SELECT id, slug, names, address
    FROM places
    WHERE names->>'tr' ILIKE '%{query}%'
       OR names->>'en' ILIKE '%{query}%'
    AND status = 'approved'
    LIMIT 5
    ↓
If matches found:
    Display warning box:
    "⚠️ Benzer mekanlar bulundu"
    List similar places with addresses
    ↓
User reviews and decides:
    - Pick existing from list
    - Or continue creating (different location)
    ↓
User proceeds
    ↓
Place created/added
```

**Key Features**:
- Case-insensitive search
- Turkish character aware
- Shows address for differentiation
- Non-blocking (user can still create)

---

## Components Structure

### Layout Components
```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Homepage (leaderboard)
├── my-collections/
│   └── page.tsx           # User's collections page
├── collections/
│   └── [slug]/
│       └── page.tsx       # Collection detail view (public)
└── admin/
    ├── layout.tsx         # Admin layout with sidebar
    ├── places/page.tsx    # Manage places
    ├── categories/page.tsx
    └── collections/page.tsx
```

### Feature Components
```
components/
├── leaderboard/
│   └── places-leaderboard.tsx    # Main leaderboard table with voting
├── collections/
│   ├── edit-collection-modal.tsx # Create/edit collection (all-in-one)
│   ├── add-place-dialog.tsx      # Search or create place
│   ├── collection-card.tsx       # Collection preview card
│   ├── collection-detail-client.tsx # Collection detail view
│   └── sortable-place-item.tsx   # Draggable place item
├── places/
│   └── place-card.tsx            # Place preview card
└── ui/
    ├── button.tsx                # shadcn components
    ├── dialog.tsx
    ├── input.tsx
    ├── select.tsx
    └── table.tsx
```

---

## API Layer

### Location Structure
```typescript
lib/api/
├── places.ts
│   ├── getPlacesByLocation(locationId, limit, categorySlug?)
│   ├── getPlaceBySlug(slug)
│   ├── getTopPlacesByCity(citySlug, limit)
│   └── getAllPlaces(limit, offset)
├── locations.ts
│   ├── getCitiesByCountry(countrySlug)
│   ├── getLocationBySlug(slug)
│   └── getLocationHierarchy(locationId)
├── categories.ts
│   ├── getAllCategories()
│   ├── getCategoryBySlug(slug)
│   └── getSubcategories(parentId)
└── collections.ts
    ├── getCollectionBySlug(slug)
    ├── getUserCollections(userId)
    └── getFeaturedCollections()
```

### Example: Fetching Top Places
```typescript
// lib/api/places.ts
export async function getTopPlacesByCity(citySlug: string, limit = 20) {
  const supabase = await createClient();

  // Get city
  const { data: city } = await supabase
    .from('locations')
    .select('id')
    .eq('slug', citySlug)
    .eq('type', 'city')
    .single();

  if (!city) return [];

  // Get top places
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .eq('location_id', city.id)
    .eq('status', 'approved')
    .order('vote_score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
```

---

## Authentication & Authorization

### User Roles
```typescript
type UserRole = 'user' | 'admin' | 'moderator';
```

### Middleware Protection
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { user } = await getUser();
  const path = request.nextUrl.pathname;

  // Protected routes
  if (path.startsWith('/my-collections') && !user) {
    return NextResponse.redirect(new URL('/?auth=login', request.url));
  }

  if (path.startsWith('/admin') && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
```

### Row Level Security (RLS)

**Users can only edit their own collections**:
```sql
CREATE POLICY "Users can update own collections"
ON collections
FOR UPDATE
USING (auth.uid() = creator_id);
```

**Anyone can view approved places**:
```sql
CREATE POLICY "Anyone can view approved places"
ON places
FOR SELECT
USING (status = 'approved');
```

---

## MVP Strategy

### Phase 1: Core Features ✅
- [x] User authentication
- [x] Leaderboard with voting
- [x] Collection CRUD
- [x] Place creation (auto-approved)
- [x] Drag & drop sorting
- [x] Recommended items per place
- [x] Duplicate detection

### Phase 2: Enhancements (Future)
- [ ] Place images upload
- [ ] User profiles with stats
- [ ] Search & filters
- [ ] Mobile app
- [ ] Social features (follow, share)

### Cost Optimization

**Database Storage**:
- 10,000 places ≈ 5MB
- 10,000 collections ≈ 3MB
- 100,000 votes ≈ 10MB
- **Total**: ~20MB for healthy MVP usage
- Supabase free tier: 500MB ✅

**Database Reads**:
- Homepage: ~20 rows
- Collection page: ~50 rows
- Free tier: Unlimited reads ✅

**Strategy**:
- Auto-approve places (no admin review needed)
- Minimal required fields
- Denormalized vote counts (fast reads)
- No image storage in database (use URLs)

---

## Development Workflow

### 1. Database Changes
```bash
# Create migration
supabase migration new add_feature_name

# Write SQL
vi supabase/migrations/XXX_add_feature_name.sql

# Apply locally
supabase migration up

# Apply to production (Supabase dashboard SQL editor)
```

### 2. Running Seed Scripts
```bash
# Seed locations, cities, districts, and sample places
npm run seed

# Seed hierarchical categories
npm run seed:categories

# Seed demo users, collections, and votes (for testing)
npm run seed:demo
```

**Note**: All seed scripts are idempotent - they check for existing data and skip duplicates, so you can run them multiple times safely.

### 3. Development Server
```bash
npm run dev
# Visit http://localhost:3001
```

---

## Deployment Checklist

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (for server-side operations)
```

### Database Migrations
1. Run all migrations in Supabase SQL editor
2. Verify tables created
3. Run seed scripts for initial data
4. Test RLS policies

### Build & Deploy
```bash
npm run build
npm run start
# Or deploy to Vercel
```

---

## Performance Considerations

### Indexing Strategy
- All foreign keys indexed
- `vote_score DESC` for leaderboard
- `display_order` for collections
- Composite indexes for common queries

### Caching
- Use React Query for client-side caching
- Next.js automatic page caching
- Consider Redis for vote calculations (future)

### Optimization
- Lazy load images
- Paginate long lists
- Debounce search inputs
- Use `select()` to fetch only needed columns

---

## Security Best Practices

✅ **Input Validation**
- Sanitize user inputs
- Check text lengths
- Validate URLs

✅ **SQL Injection Prevention**
- Always use Supabase query builder
- Never interpolate user input into SQL

✅ **XSS Prevention**
- React auto-escapes by default
- Don't use `dangerouslySetInnerHTML`

✅ **Rate Limiting**
- Implement on voting endpoints
- Use Supabase Edge Functions (future)

---

## Monitoring & Analytics

### Key Metrics to Track
- Daily active users
- Places created per day
- Collections created per day
- Votes cast per day
- Top cities by engagement

### Error Tracking
- Log client errors to console
- Consider Sentry for production
- Monitor Supabase logs

---

## Future Enhancements

### Short Term
- [ ] Place image uploads (Supabase Storage)
- [ ] User avatars
- [ ] Email notifications
- [ ] Export collections (PDF/share link)

### Medium Term
- [ ] Advanced search with filters
- [ ] Maps integration
- [ ] Mobile responsive improvements
- [ ] Social sharing

### Long Term
- [ ] Mobile app (React Native)
- [ ] AI recommendations
- [ ] Gamification (badges, levels)
- [ ] Multi-language UI switching

---

## Contributing

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Component naming: PascalCase
- File naming: kebab-case

### Git Workflow
```bash
git checkout -b feature/feature-name
# Make changes
git commit -m "feat: add feature name"
git push origin feature/feature-name
# Create PR
```

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Issues**: GitHub Issues tab

---

**Last Updated**: 2025-01-17
**Version**: 1.0.0 (MVP)
