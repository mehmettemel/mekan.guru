-- Migration to add hierarchical support to categories table
-- This allows categories to have parent-child relationships (e.g., Yemek -> Döner, Hamburger, etc.)

-- Add parent_id column to categories table
ALTER TABLE categories
ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- Add comment to explain the hierarchy
COMMENT ON COLUMN categories.parent_id IS 'Reference to parent category for hierarchical structure. NULL for main categories.';
