-- ABOUTME: Adds status column to questions table.
-- ABOUTME: Replaces active boolean with draft/published/archived lifecycle.

ALTER TABLE questions ADD COLUMN status TEXT DEFAULT 'draft';

UPDATE questions SET status = CASE
  WHEN active = 1 THEN 'published'
  ELSE 'draft'
END;

CREATE INDEX idx_questions_status ON questions(status);
