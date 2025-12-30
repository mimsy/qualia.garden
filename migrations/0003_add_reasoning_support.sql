-- ABOUTME: Add supports_reasoning column to models table.
-- ABOUTME: Tracks whether a model supports reasoning/thinking mode.

ALTER TABLE models ADD COLUMN supports_reasoning INTEGER DEFAULT 0;
