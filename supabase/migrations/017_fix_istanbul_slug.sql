-- Fix Istanbul slug from 'i-stanbul' to 'istanbul'
-- Handles duplicate key violation if 'istanbul' already exists

DO $$
DECLARE
    bad_id uuid;
    good_id uuid;
BEGIN
    -- Get IDs
    SELECT id INTO bad_id FROM locations WHERE slug = 'i-stanbul';
    SELECT id INTO good_id FROM locations WHERE slug = 'istanbul';

    -- If we have the bad slug
    IF bad_id IS NOT NULL THEN
        -- If we ALSO have the good slug (conflict)
        IF good_id IS NOT NULL THEN
            RAISE NOTICE 'Both i-stanbul (%) and istanbul (%) exist. Merging...', bad_id, good_id;
            
            -- Move all references from bad_id to good_id
            
            -- 1. Update collections
            UPDATE collections SET location_id = good_id WHERE location_id = bad_id;
            
            -- 2. Update places
            UPDATE places SET location_id = good_id WHERE location_id = bad_id;
            
            -- 3. Update child locations (districts)
            UPDATE locations SET parent_id = good_id WHERE parent_id = bad_id;
            
            -- Now delete the bad one
            DELETE FROM locations WHERE id = bad_id;
            
            RAISE NOTICE 'Merge complete. Deleted i-stanbul.';
            
        ELSE
            -- No conflict, just rename
            RAISE NOTICE 'Renaming i-stanbul (%) to istanbul...', bad_id;
            UPDATE locations SET slug = 'istanbul' WHERE id = bad_id;
        END IF;
    ELSE
        RAISE NOTICE 'i-stanbul not found. Nothing to do.';
    END IF;
END $$;
