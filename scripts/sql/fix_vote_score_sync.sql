-- Diagnose and Fix Vote/Score Synchronization
-- Run this script in the Supabase SQL Editor

-- ============================================
-- STEP 1: Verify trigger functions exist with SECURITY DEFINER
-- ============================================

-- Re-create update_collection_votes with SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_collection_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE collections SET
      vote_count = vote_count - 1,
      vote_score = vote_score - (OLD.value * OLD.weight),
      updated_at = NOW()
    WHERE id = OLD.collection_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE collections SET
      vote_score = vote_score - (OLD.value * OLD.weight) + (NEW.value * NEW.weight),
      updated_at = NOW()
    WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE collections SET
      vote_count = vote_count + 1,
      vote_score = vote_score + (NEW.value * NEW.weight),
      updated_at = NOW()
    WHERE id = NEW.collection_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create update_collection_vote_weight with SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_collection_vote_weight()
RETURNS TRIGGER AS $$
DECLARE
  user_created_at TIMESTAMPTZ;
BEGIN
  SELECT created_at INTO user_created_at FROM users WHERE id = NEW.user_id;
  NEW.weight := calculate_vote_weight(user_created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 2: Ensure triggers are attached correctly
-- ============================================

-- Drop and recreate triggers to ensure they're properly attached
DROP TRIGGER IF EXISTS set_collection_vote_weight ON collection_votes;
CREATE TRIGGER set_collection_vote_weight
BEFORE INSERT OR UPDATE ON collection_votes
FOR EACH ROW
EXECUTE FUNCTION update_collection_vote_weight();

DROP TRIGGER IF EXISTS update_collection_vote_stats ON collection_votes;
CREATE TRIGGER update_collection_vote_stats
AFTER INSERT OR UPDATE OR DELETE ON collection_votes
FOR EACH ROW
EXECUTE FUNCTION update_collection_votes();

-- ============================================
-- STEP 3: Enable Supabase Realtime for collections table
-- ============================================

-- This enables realtime broadcasts for UPDATE events on collections
ALTER PUBLICATION supabase_realtime ADD TABLE collections;

-- ============================================
-- STEP 4: Test the vote flow (optional - run manually)
-- ============================================

-- To test, first find a collection ID and user ID:
-- SELECT id FROM collections LIMIT 1;
-- SELECT id FROM users LIMIT 1;

-- Then insert a test vote (replace UUIDs):
-- INSERT INTO collection_votes (user_id, collection_id, value)
-- VALUES ('your-user-id', 'your-collection-id', 1);

-- Check if vote_count and vote_score updated:
-- SELECT id, vote_count, vote_score FROM collections WHERE id = 'your-collection-id';

-- ============================================
-- STEP 5: Verify current state
-- ============================================

-- Check if triggers exist
SELECT 
  tgname AS trigger_name,
  proname AS function_name,
  tgenabled AS enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'collection_votes'::regclass;

-- Check if realtime is enabled for collections
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'collections';

DO $$
BEGIN
  RAISE NOTICE 'Vote/Score sync fix script completed successfully!';
END $$;
