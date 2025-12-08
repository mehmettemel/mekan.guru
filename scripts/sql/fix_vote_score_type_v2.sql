-- ===========================================
-- FIX: Vote Score Data Type Mismatch (v2)
-- Handles dependent view 'collection_details'
-- Run this in Supabase SQL Editor
-- ===========================================

-- =====================
-- PART 1: DROP DEPENDENT VIEW
-- =====================

DROP VIEW IF EXISTS collection_details;

-- =====================
-- PART 2: ALTER TABLE TYPES
-- =====================

-- 2.1 Change collections.vote_score to DECIMAL
ALTER TABLE collections 
ALTER COLUMN vote_score TYPE DECIMAL(10, 2);

-- 2.2 Change places.vote_score to DECIMAL
ALTER TABLE places 
ALTER COLUMN vote_score TYPE DECIMAL(10, 2);

-- =====================
-- PART 3: RECREATE VIEW
-- =====================

CREATE OR REPLACE VIEW collection_details AS
SELECT
  c.id,
  c.slug,
  c.names,
  c.descriptions,
  c.creator_id,
  c.location_id,
  c.category_id,
  c.subcategory_id,
  c.status,
  c.vote_count,
  c.vote_score,
  c.tags,
  c.is_featured,
  c.created_at,
  c.updated_at,
  u.username AS creator_username,
  l.names AS location_names,
  cat.names AS category_names,
  subcat.names AS subcategory_names,
  COUNT(cp.place_id) AS places_count
FROM collections c
JOIN users u ON c.creator_id = u.id
JOIN locations l ON c.location_id = l.id
JOIN categories cat ON c.category_id = cat.id
LEFT JOIN categories subcat ON c.subcategory_id = subcat.id
LEFT JOIN collection_places cp ON c.id = cp.collection_id
GROUP BY c.id, u.username, l.names, cat.names, subcat.names;

-- =====================
-- PART 4: RECALCULATE SCORES
-- =====================

-- 4.1 Recalculate collection scores
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

-- 4.2 Recalculate place scores
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
-- PART 5: VERIFY
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
  RAISE NOTICE '✅ View dropped, types changed, view recreated, and scores recalculated!';
END $$;
