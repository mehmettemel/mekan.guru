-- ===========================================
-- FIX: Vote Score Data Type Mismatch
-- The vote_score columns are INTEGER but weights are DECIMAL.
-- This causes scores like 0.3 to be rounded to 0.
-- Run this in Supabase SQL Editor
-- ===========================================

-- =====================
-- PART 1: ALTER TABLE TYPES
-- =====================

-- 1.1 Change collections.vote_score to DECIMAL
ALTER TABLE collections 
ALTER COLUMN vote_score TYPE DECIMAL(10, 2);

-- 1.2 Change places.vote_score to DECIMAL
ALTER TABLE places 
ALTER COLUMN vote_score TYPE DECIMAL(10, 2);

-- =====================
-- PART 2: RECALCULATE SCORES
-- =====================

-- 2.1 Recalculate collection scores
UPDATE collections c SET
  vote_score = subq.actual_score,
  updated_at = NOW()
FROM (
  SELECT 
    collection_id,
    COALESCE(SUM(value * weight), 0) AS actual_score
  FROM collection_votes
  GROUP BY collection_id
) subq
WHERE c.id = subq.collection_id;

-- 2.2 Recalculate place scores
UPDATE places p SET
  vote_score = subq.actual_score,
  updated_at = NOW()
FROM (
  SELECT 
    place_id,
    COALESCE(SUM(value * weight), 0) AS actual_score
  FROM votes
  GROUP BY place_id
) subq
WHERE p.id = subq.place_id;

-- =====================
-- PART 3: VERIFY
-- =====================

SELECT 'COLLECTIONS CHECK:' as info,
  c.id,
  c.names->>'tr' AS name,
  c.vote_count,
  c.vote_score,
  (SELECT COALESCE(SUM(cv.value * cv.weight), 0) FROM collection_votes cv WHERE cv.collection_id = c.id) AS calculated_score
FROM collections c
WHERE c.vote_count > 0
ORDER BY c.updated_at DESC
LIMIT 5;

DO $$
BEGIN
  RAISE NOTICE '✅ Vote score columns changed to DECIMAL(10, 2) and scores recalculated!';
END $$;
