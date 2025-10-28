-- Remove upload_id column from sessions table if it exists
-- This migration handles the case where the remote database still has the old schema

-- First, check if the column exists and drop it if it does
-- Note: SQLite doesn't support DROP COLUMN directly, so we need to recreate the table

-- Create a new sessions table without upload_id
CREATE TABLE sessions_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO sessions_new (id, user_id, created_at)
SELECT id, user_id, created_at FROM sessions;

-- Drop the old table
DROP TABLE sessions;

-- Rename the new table to the original name
ALTER TABLE sessions_new RENAME TO sessions;
