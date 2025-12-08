-- DIAGNOSE AND FIX: Votes Not Updating Scores
-- Run each section one at a time to diagnose the issue

-- ============================================
-- PART 1: CHECK CURRENT STATE
-- ============================================

-- Check if triggers exist on collection_votes
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  CASE t.tgenabled 
    WHEN 'O' THEN 'ENABLED (Origin)'
    WHEN 'D' THEN 'DISABLED'
    WHEN 'R' THEN 'ENABLED (Replica)'
    WHEN 'A' THEN 'ENABLED (Always)'
    ELSE t.tgenabled::text
  END AS status
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.collection_votes'::regclass
AND NOT t.tgisinternal;

-- ============================================
-- PART 2: FIX - Recreate trigger function with SECURITY DEFINER
-- ============================================

-- Drop existing function and recreate
DROP FUNCTION IF EXISTS update_collection_votes() CASCADE;

CREATE OR REPLACE FUNCTION update_collection_votes()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE collections SET
      vote_count = GREATEST(vote_count - 1, 0),
      vote_score = vote_score - COALESCE(OLD.value::numeric * OLD.weight, 0),
      updated_at = NOW()
    WHERE id = OLD.collection_id;
    RETURN OLD;
    
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE collections SET
      vote_score = vote_score - COALESCE(OLD.value::numeric * OLD.weight, 0) + COALESCE(NEW.value::numeric * NEW.weight, 0),
      updated_at = NOW()
    WHERE id = NEW.collection_id;
    RETURN NEW;
    
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE collections SET
      vote_count = vote_count + 1,
      vote_score = vote_score + COALESCE(NEW.value::numeric * NEW.weight, 0),
      updated_at = NOW()
    WHERE id = NEW.collection_id;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- ============================================
-- PART 3: FIX - Recreate the trigger
-- ============================================

DROP TRIGGER IF EXISTS update_collection_vote_stats ON collection_votes;

CREATE TRIGGER update_collection_vote_stats
AFTER INSERT OR UPDATE OR DELETE ON collection_votes
FOR EACH ROW
EXECUTE FUNCTION update_collection_votes();

-- ============================================
-- PART 4: FIX - Also fix vote weight function
-- ============================================

DROP FUNCTION IF EXISTS update_collection_vote_weight() CASCADE;

CREATE OR REPLACE FUNCTION update_collection_vote_weight()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_created_at TIMESTAMPTZ;
BEGIN
  SELECT created_at INTO user_created_at FROM users WHERE id = NEW.user_id;
  
  IF user_created_at IS NULL THEN
    NEW.weight := 1.0;
  ELSE
    NEW.weight := calculate_vote_weight(user_created_at);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_collection_vote_weight ON collection_votes;

CREATE TRIGGER set_collection_vote_weight
BEFORE INSERT OR UPDATE ON collection_votes
FOR EACH ROW
EXECUTE FUNCTION update_collection_vote_weight();

-- ============================================
-- PART 5: ENABLE REALTIME
-- ============================================

-- Enable realtime for collections table (ignore errors if already added)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE collections;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, ignore
    NULL;
  END;
END $$;

-- ============================================
-- PART 6: VERIFY TRIGGERS ARE NOW WORKING
-- ============================================

-- Check triggers again
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  'ENABLED' AS status
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.collection_votes'::regclass
AND NOT t.tgisinternal;

-- ============================================
-- PART 7: MANUAL TEST (Optional)
-- ============================================

-- Uncomment and modify to test:
/*
-- Get a collection and user to test with
SELECT id, vote_count, vote_score FROM collections LIMIT 1;
SELECT id FROM auth.users LIMIT 1;

-- Insert a test vote (replace with real IDs)
INSERT INTO collection_votes (user_id, collection_id, value)
VALUES ('USER_ID_HERE', 'COLLECTION_ID_HERE', 1);

-- Check if score updated
SELECT id, vote_count, vote_score FROM collections WHERE id = 'COLLECTION_ID_HERE';
*/

DO $$
BEGIN
  RAISE NOTICE '✅ Vote trigger fix completed! Please test voting now.';
END $$;
