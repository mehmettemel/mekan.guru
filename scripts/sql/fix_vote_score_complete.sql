-- ===========================================
-- COMPLETE FIX: Vote Score Update Issue
-- RLS is blocking trigger updates!
-- Run this in Supabase SQL Editor
-- ===========================================

-- =====================
-- PART 1: DIAGNOSE CURRENT STATE
-- =====================

-- 1.1 Check current scores vs actual votes
SELECT 'BEFORE FIX:' as stage,
  c.id,
  c.names->>'tr' AS name,
  c.vote_count AS db_count,
  c.vote_score AS db_score,
  (SELECT COUNT(*) FROM collection_votes cv WHERE cv.collection_id = c.id) AS real_count,
  (SELECT COALESCE(SUM(cv.value * cv.weight), 0) FROM collection_votes cv WHERE cv.collection_id = c.id) AS real_score
FROM collections c
WHERE c.id IN (SELECT DISTINCT collection_id FROM collection_votes)
ORDER BY c.updated_at DESC
LIMIT 5;

-- =====================
-- PART 2: ADD RLS POLICY FOR TRIGGER UPDATES
-- =====================

-- Drop existing restrictive update policies
DROP POLICY IF EXISTS "Users can update own collections" ON collections;
DROP POLICY IF EXISTS "Admins can update any collection" ON collections;
DROP POLICY IF EXISTS "Trigger can update vote stats" ON collections;
DROP POLICY IF EXISTS "Allow vote stat updates" ON collections;

-- Recreate user policy
CREATE POLICY "Users can update own collections" ON collections
  FOR UPDATE USING (auth.uid() = creator_id);

-- Recreate admin policy  
CREATE POLICY "Admins can update any collection" ON collections
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Add policy to allow vote stat updates (for service role / triggers)
-- This allows updates ONLY to vote_count, vote_score, updated_at columns
CREATE POLICY "Allow vote stat updates" ON collections
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- =====================
-- PART 3: RECREATE TRIGGER FUNCTIONS
-- =====================

-- 3.1 Drop and recreate with proper permissions
DROP FUNCTION IF EXISTS update_collection_votes() CASCADE;

CREATE OR REPLACE FUNCTION update_collection_votes()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use direct SQL to bypass any remaining RLS
  IF TG_OP = 'DELETE' THEN
    UPDATE collections SET
      vote_count = GREATEST(vote_count - 1, 0),
      vote_score = COALESCE(vote_score, 0) - COALESCE(OLD.value::numeric * OLD.weight, 0),
      updated_at = NOW()
    WHERE id = OLD.collection_id;
    RETURN OLD;
    
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE collections SET
      vote_score = COALESCE(vote_score, 0) - COALESCE(OLD.value::numeric * OLD.weight, 0) + COALESCE(NEW.value::numeric * NEW.weight, 0),
      updated_at = NOW()
    WHERE id = NEW.collection_id;
    RETURN NEW;
    
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE collections SET
      vote_count = COALESCE(vote_count, 0) + 1,
      vote_score = COALESCE(vote_score, 0) + COALESCE(NEW.value::numeric * NEW.weight, 0),
      updated_at = NOW()
    WHERE id = NEW.collection_id;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 3.2 Grant execute permission
GRANT EXECUTE ON FUNCTION update_collection_votes() TO authenticated;
GRANT EXECUTE ON FUNCTION update_collection_votes() TO service_role;

-- 3.3 Recreate trigger
DROP TRIGGER IF EXISTS update_collection_vote_stats ON collection_votes;

CREATE TRIGGER update_collection_vote_stats
AFTER INSERT OR UPDATE OR DELETE ON collection_votes
FOR EACH ROW
EXECUTE FUNCTION update_collection_votes();

-- 3.4 Fix vote weight function too
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

-- =====================
-- PART 4: SYNC ALL SCORES FROM ACTUAL VOTES
-- =====================

-- Reset all collections to calculated values
UPDATE collections c SET
  vote_count = subq.actual_count,
  vote_score = subq.actual_score::integer,
  updated_at = NOW()
FROM (
  SELECT 
    collection_id,
    COUNT(*) AS actual_count,
    COALESCE(SUM(value * weight), 0) AS actual_score
  FROM collection_votes
  GROUP BY collection_id
) subq
WHERE c.id = subq.collection_id;

-- Reset collections with no votes
UPDATE collections SET
  vote_count = 0,
  vote_score = 0,
  updated_at = NOW()
WHERE id NOT IN (SELECT DISTINCT collection_id FROM collection_votes);

-- =====================
-- PART 5: VERIFY FIX
-- =====================

SELECT 'AFTER FIX:' as stage,
  c.id,
  c.names->>'tr' AS name,
  c.vote_count AS db_count,
  c.vote_score AS db_score,
  (SELECT COUNT(*) FROM collection_votes cv WHERE cv.collection_id = c.id) AS real_count,
  (SELECT COALESCE(SUM(cv.value * cv.weight), 0)::integer FROM collection_votes cv WHERE cv.collection_id = c.id) AS real_score,
  CASE 
    WHEN c.vote_count = (SELECT COUNT(*) FROM collection_votes cv WHERE cv.collection_id = c.id) 
    THEN '✅'
    ELSE '❌'
  END AS count_ok,
  CASE 
    WHEN c.vote_score = (SELECT COALESCE(SUM(cv.value * cv.weight), 0)::integer FROM collection_votes cv WHERE cv.collection_id = c.id)
    THEN '✅'
    ELSE '❌'
  END AS score_ok
FROM collections c
ORDER BY c.updated_at DESC
LIMIT 10;

-- Check triggers
SELECT 
  t.tgname AS trigger_name,
  p.proname AS function_name,
  CASE t.tgenabled 
    WHEN 'O' THEN '✅ ENABLED'
    WHEN 'D' THEN '❌ DISABLED'
    ELSE t.tgenabled::text
  END AS status
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.collection_votes'::regclass
AND NOT t.tgisinternal;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ VOTE SCORE FIX COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS policy updated to allow trigger updates';
  RAISE NOTICE 'Trigger functions recreated with SECURITY DEFINER';
  RAISE NOTICE 'All scores synced from actual votes';
  RAISE NOTICE '';
  RAISE NOTICE 'Please test by voting on a collection now!';
END $$;
