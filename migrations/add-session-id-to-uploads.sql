-- Add session_id column to uploads table
ALTER TABLE uploads ADD COLUMN session_id TEXT;

-- Update existing uploads to have a default session_id
-- This is a temporary fix for existing data
UPDATE uploads SET session_id = 'legacy-session-' || id WHERE session_id IS NULL;
