-- ABOUTME: Initial database schema for Qualia Garden.
-- ABOUTME: Creates tables for models, questions, polls, and responses.

-- Models available for polling
CREATE TABLE models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  family TEXT NOT NULL,
  openrouter_id TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Questions to ask
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT,
  response_type TEXT NOT NULL,
  options TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Individual poll runs (one question × one model)
CREATE TABLE polls (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (model_id) REFERENCES models(id)
);

-- Responses from models
CREATE TABLE responses (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  raw_response TEXT,
  parsed_answer TEXT,
  response_time_ms INTEGER,
  error TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (poll_id) REFERENCES polls(id)
);

-- Indexes for common queries
CREATE INDEX idx_polls_question ON polls(question_id);
CREATE INDEX idx_polls_model ON polls(model_id);
CREATE INDEX idx_polls_status ON polls(status);
CREATE INDEX idx_responses_poll ON responses(poll_id);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_models_family ON models(family);
