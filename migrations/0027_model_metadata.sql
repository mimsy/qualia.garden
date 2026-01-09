-- ABOUTME: Add release_date and description columns to models table.
-- ABOUTME: Stores metadata synced from OpenRouter API.

ALTER TABLE models ADD COLUMN release_date TEXT;
ALTER TABLE models ADD COLUMN description TEXT;
