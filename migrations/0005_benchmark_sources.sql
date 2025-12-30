-- ABOUTME: Migration to add benchmark data support for human comparison.
-- ABOUTME: Creates tables for external benchmark sources and human response distributions.

-- Table for tracking external benchmark datasets (e.g., World Values Survey)
CREATE TABLE benchmark_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  url TEXT,
  sample_size INTEGER,
  year_range TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Table for storing aggregated human response distributions by demographic slice
CREATE TABLE human_response_distributions (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id),
  benchmark_source_id TEXT NOT NULL REFERENCES benchmark_sources(id),

  -- Demographic slice (NULL = overall aggregate)
  continent TEXT,
  education_level TEXT,
  settlement_type TEXT,

  -- Distribution data
  distribution TEXT NOT NULL,  -- JSON: {"1": 4521, "2": 3892, ...}
  sample_size INTEGER NOT NULL,

  created_at TEXT DEFAULT (datetime('now')),

  UNIQUE(question_id, benchmark_source_id, continent, education_level, settlement_type)
);

CREATE INDEX idx_human_dist_question ON human_response_distributions(question_id);
CREATE INDEX idx_human_dist_source ON human_response_distributions(benchmark_source_id);

-- Add benchmark fields to questions table
ALTER TABLE questions ADD COLUMN benchmark_source_id TEXT REFERENCES benchmark_sources(id);
ALTER TABLE questions ADD COLUMN benchmark_question_id TEXT;
ALTER TABLE questions ADD COLUMN answer_labels TEXT;  -- JSON: {"1": "Very important", ...}
