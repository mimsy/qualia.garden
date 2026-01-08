-- ABOUTME: Adds a categories table with descriptions for display on homepage and category pages.
-- ABOUTME: Seeds with the 6 consolidated cross-survey theme categories.

CREATE TABLE categories (
  name TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Insert the 6 consolidated categories with descriptions
INSERT INTO categories (name, description, display_order) VALUES
  ('Ethics & Values', 'Moral philosophy, ethical dilemmas, and questions about right and wrong, fairness, and the foundations of moral reasoning.', 1),
  ('Mind & Consciousness', 'Philosophy of mind, consciousness, personal identity, free will, and the nature of subjective experience.', 2),
  ('Social & Trust', 'Social institutions, interpersonal trust, cooperation, community, and how societies function and cohere.', 3),
  ('Politics & Policy', 'Political philosophy, governance, policy preferences, and questions about how societies should be organized.', 4),
  ('Epistemology & Science', 'Knowledge, truth, scientific methodology, and how we come to understand and verify claims about reality.', 5),
  ('Metaphysics & Religion', 'Ultimate reality, existence, religious and spiritual beliefs, meaning, and fundamental questions about the nature of being.', 6);
