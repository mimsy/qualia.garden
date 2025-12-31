-- Multi-sample polling support
-- Groups multiple polls for the same model+question into batches

-- Add batch_id column to polls table
ALTER TABLE polls ADD COLUMN batch_id TEXT;

-- Index for efficient batch queries
CREATE INDEX idx_polls_batch ON polls(batch_id);

-- Index for efficient aggregation queries
CREATE INDEX idx_polls_question_model_status ON polls(question_id, model_id, status);
