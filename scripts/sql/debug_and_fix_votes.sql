-- DEBUG: Check Vote Behavior
-- Run this to see what's happening with votes

-- ============================================
-- 1. Check recent votes
-- ============================================
SELECT 
  cv.id,
  cv.user_id,
  cv.collection_id,
  cv.value,
  cv.weight,
  cv.value * cv.weight AS calculated_score,
  cv.created_at
FROM collection_votes cv
ORDER BY cv.created_at DESC
LIMIT 10;

-- ============================================
-- 2. Check collection scores
-- ============================================
SELECT 
  c.id,
  c.names->>'tr' AS name,
  c.vote_count,
  c.vote_score
FROM collections c
ORDER BY c.updated_at DESC
LIMIT 10;

-- ============================================
-- 3. Recalculate scores from actual votes
-- ============================================
SELECT 
  c.id,
  c.names->>'tr' AS name,
  c.vote_count AS current_vote_count,
  c.vote_score AS current_vote_score,
  COUNT(cv.id) AS actual_vote_count,
  COALESCE(SUM(cv.value * cv.weight), 0) AS calculated_vote_score
FROM collections c
LEFT JOIN collection_votes cv ON c.id = cv.collection_id
GROUP BY c.id
ORDER BY c.updated_at DESC
LIMIT 10;

-- ============================================
-- 4. FIX: Recalculate ALL collection scores from votes
-- ============================================
UPDATE collections c SET
  vote_count = COALESCE(sub.actual_count, 0),
  vote_score = COALESCE(sub.actual_score, 0),
  updated_at = NOW()
FROM (
  SELECT 
    collection_id,
    COUNT(*) AS actual_count,
    SUM(value * weight) AS actual_score
  FROM collection_votes
  GROUP BY collection_id
) sub
WHERE c.id = sub.collection_id;

-- Also reset collections with no votes
UPDATE collections SET
  vote_count = 0,
  vote_score = 0,
  updated_at = NOW()
WHERE id NOT IN (SELECT DISTINCT collection_id FROM collection_votes);

-- ============================================
-- 5. Verify after fix
-- ============================================
SELECT 
  c.id,
  c.names->>'tr' AS name,
  c.vote_count,
  c.vote_score
FROM collections c
ORDER BY c.vote_score DESC
LIMIT 10;

DO $$
BEGIN
  RAISE NOTICE '✅ Vote scores recalculated from actual votes!';
END $$;
