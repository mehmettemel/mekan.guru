-- Migration to add recommended_items to collection_places
-- This allows curators to specify popular foods/products for each place in their collection

-- Add recommended_items column as an array of text
ALTER TABLE collection_places
ADD COLUMN recommended_items TEXT[] DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN collection_places.recommended_items IS 'Array of recommended food items or products that are popular at this place (e.g., ["Adana Kebap", "Ayran", "Közlenmiş Biber"])';
