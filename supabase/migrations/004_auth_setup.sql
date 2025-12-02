-- Auth Setup Migration
-- This migration sets up authentication triggers and policies

-- Function to create user profile when auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_value TEXT;
BEGIN
  -- Extract username from email (before @)
  username_value := SPLIT_PART(NEW.email, '@', 1);

  -- Ensure username is unique by appending random suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = username_value) LOOP
    username_value := SPLIT_PART(NEW.email, '@', 1) || '_' || FLOOR(RANDOM() * 10000)::TEXT;
  END LOOP;

  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    username,
    trust_score,
    role,
    email_verified,
    followers_count,
    following_count,
    collections_count,
    reputation_score,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    username_value,
    100, -- Default trust score
    'user', -- Default role
    NEW.email_confirmed_at IS NOT NULL,
    0, -- Default followers_count
    0, -- Default following_count
    0, -- Default collections_count
    0, -- Default reputation_score
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update email_verified when user confirms email
CREATE OR REPLACE FUNCTION public.handle_user_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.users
    SET email_verified = TRUE, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update email verification status
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_verified();

-- Function to delete user profile when auth user is deleted
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to delete user profile
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

-- Update RLS policies for users table to allow users to view and update their own profile
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add policy to prevent users from changing their role
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow role changes from admins
  IF OLD.role != NEW.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    ) THEN
      RAISE EXCEPTION 'Only administrators can change user roles';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_unauthorized_role_change ON users;
CREATE TRIGGER prevent_unauthorized_role_change
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();

-- Create a view for user profiles with auth data
CREATE OR REPLACE VIEW user_profiles AS
SELECT
  u.id,
  u.username,
  u.trust_score,
  u.role,
  u.email_verified,
  u.followers_count,
  u.following_count,
  u.collections_count,
  u.reputation_score,
  u.created_at,
  u.updated_at,
  au.email,
  au.email_confirmed_at,
  au.last_sign_in_at,
  au.created_at as auth_created_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id;

-- Grant access to authenticated users
GRANT SELECT ON user_profiles TO authenticated;

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is the owner or admin
CREATE OR REPLACE FUNCTION public.is_owner_or_admin(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = resource_user_id OR is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add email notifications table for future use
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'welcome', 'collection_vote', 'new_follower', etc.
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent ON email_notifications(sent);

-- Enable RLS on email_notifications
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON email_notifications;
CREATE POLICY "Users can view own notifications"
  ON email_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Function to send welcome email notification (queued)
CREATE OR REPLACE FUNCTION public.queue_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_notifications (user_id, type, subject, body)
  VALUES (
    NEW.id,
    'welcome',
    'Welcome to mekan.guru!',
    'Thank you for joining mekan.guru. Start exploring collections of the best local places!'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_welcome_email ON users;
CREATE TRIGGER on_user_welcome_email
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_welcome_email();

-- Add user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  collection_vote_notifications BOOLEAN DEFAULT TRUE,
  new_follower_notifications BOOLEAN DEFAULT TRUE,
  locale VARCHAR(5) DEFAULT 'en',
  theme VARCHAR(10) DEFAULT 'system', -- 'light', 'dark', 'system'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create default preferences when user is created
CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_create_preferences ON users;
CREATE TRIGGER on_user_create_preferences
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_preferences();

-- Update timestamp trigger for user_preferences
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();