-- ABOUTME: Add justification and reasoning columns to responses table.
-- ABOUTME: Stores model explanations and thinking separately from raw response.

ALTER TABLE responses ADD COLUMN justification TEXT;
ALTER TABLE responses ADD COLUMN reasoning TEXT;
