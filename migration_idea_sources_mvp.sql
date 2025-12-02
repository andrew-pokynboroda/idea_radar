-- Migration: Fix idea_sources schema and add mvp to ideas
-- This migration should be run in Supabase SQL Editor

-- Step 1: Update idea_sources table structure
-- First, add the new columns
ALTER TABLE idea_sources 
  ADD COLUMN IF NOT EXISTS idea_id INTEGER,
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS insight TEXT;

-- Step 2: Migrate existing data (if any exists)
-- Copy extracted_insight to insight
UPDATE idea_sources 
SET insight = extracted_insight 
WHERE insight IS NULL;

-- Step 3: Drop old columns
ALTER TABLE idea_sources 
  DROP COLUMN IF EXISTS theme_id,
  DROP COLUMN IF EXISTS extracted_insight;

-- Step 4: Make idea_id NOT NULL and add foreign key constraint
ALTER TABLE idea_sources 
  ALTER COLUMN idea_id SET NOT NULL,
  ADD CONSTRAINT fk_idea_sources_idea_id 
    FOREIGN KEY (idea_id) 
    REFERENCES ideas(id) 
    ON DELETE CASCADE;

-- Step 5: Add mvp column to ideas table
ALTER TABLE ideas 
  ADD COLUMN IF NOT EXISTS mvp TEXT;

-- Step 6: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_idea_sources_idea_id ON idea_sources(idea_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'idea_sources' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ideas' 
ORDER BY ordinal_position;
