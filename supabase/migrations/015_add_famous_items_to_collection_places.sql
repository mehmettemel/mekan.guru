-- Add famous_items column to collection_places table
ALTER TABLE collection_places
ADD COLUMN famous_items text[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN collection_places.famous_items IS 'Array of famous items/dishes for this place in the collection';
