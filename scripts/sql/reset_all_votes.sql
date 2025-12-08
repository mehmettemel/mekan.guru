-- Reset All Votes and Scores
-- WARNING: This will permanently delete all vote data!

-- ============================================
-- STEP 1: Delete all collection votes
-- ============================================
DELETE FROM collection_votes;

-- ============================================
-- STEP 2: Reset collection vote counts and scores
-- ============================================
UPDATE collections SET
  vote_count = 0,
  vote_score = 0,
  updated_at = NOW();

-- ============================================
-- STEP 3: Delete all place votes
-- ============================================
DELETE FROM votes;

-- ============================================
-- STEP 4: Reset place vote counts and scores
-- ============================================
UPDATE places SET
  vote_count = 0,
  vote_score = 0,
  updated_at = NOW();

-- ============================================
-- Verification
-- ============================================
SELECT 'Collections reset:' as info, COUNT(*) as total, SUM(vote_count) as total_votes FROM collections;
SELECT 'Places reset:' as info, COUNT(*) as total, SUM(vote_count) as total_votes FROM places;
SELECT 'Collection votes remaining:' as info, COUNT(*) as count FROM collection_votes;
SELECT 'Place votes remaining:' as info, COUNT(*) as count FROM votes;

DO $$
BEGIN
  RAISE NOTICE 'All votes and scores have been reset to zero!';
END $$;
