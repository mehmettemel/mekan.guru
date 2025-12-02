-- Migration: Remove icon columns from categories table
-- This migration removes icon-related columns as we're moving to a simpler design

-- Remove icon column from categories
ALTER TABLE categories DROP COLUMN IF EXISTS icon;

-- Note: If there are other tables with icon columns, they can be removed here as well
