-- ABOUTME: Cleanup script for removing low-quality tags and fixing misassignments.
-- ABOUTME: Run with: wrangler d1 execute qualia-garden --remote --file=scripts/tag-cleanup.sql

-- =====================
-- PHASE 1: DELETE LOW-QUALITY TAGS
-- These tags have too few questions and/or don't form natural groupings
-- =====================

-- free-will: Only 1 question, too narrow (question already has metaphysics, phil-academic)
DELETE FROM question_tags WHERE tag_id = 'free-will';
DELETE FROM tags WHERE id = 'free-will';

-- immigration: Only 2 questions, redundant with economic-views and neighbor-tolerance
DELETE FROM question_tags WHERE tag_id = 'immigration';
DELETE FROM tags WHERE id = 'immigration';

-- tradition: Only 2 questions, overlaps with mf-authority
DELETE FROM question_tags WHERE tag_id = 'tradition';
DELETE FROM tags WHERE id = 'tradition';

-- freedom: 3 questions that don't relate to each other (politics, values, child-rearing)
DELETE FROM question_tags WHERE tag_id = 'freedom';
DELETE FROM tags WHERE id = 'freedom';

-- =====================
-- PHASE 2: FIX MISASSIGNED QUESTIONS
-- Remove tags from questions where keyword matching was too aggressive
-- =====================

-- ENVIRONMENT tag: Remove from non-environment questions
-- "Human beings developed from earlier species" = evolution, not environment
DELETE FROM question_tags
WHERE tag_id = 'environment'
AND question_id IN (
  SELECT id FROM questions WHERE text LIKE '%Human beings%developed from earlier species%'
);

-- "Laws of nature: Humean or non-Humean?" = metaphysics, not environment
DELETE FROM question_tags
WHERE tag_id = 'environment'
AND question_id IN (
  SELECT id FROM questions WHERE text LIKE '%Laws of nature%Humean%'
);

-- CONSCIOUSNESS tag: Remove from non-consciousness questions
-- "Environmental ethics" matched due to "non-anthropocentric" but isn't about consciousness
DELETE FROM question_tags
WHERE tag_id = 'consciousness'
AND question_id IN (
  SELECT id FROM questions WHERE text LIKE '%Environmental ethics%'
);

-- "How much confidence...Environmental organizations" isn't about consciousness
DELETE FROM question_tags
WHERE tag_id = 'consciousness'
AND question_id IN (
  SELECT id FROM questions WHERE text LIKE '%confidence%Environmental organizations%'
);

-- EQUALITY tag: Remove from non-equality questions
-- "Aim of philosophy" matched on "justice" but isn't about equality
DELETE FROM question_tags
WHERE tag_id = 'equality'
AND question_id IN (
  SELECT id FROM questions WHERE text LIKE '%Aim of philosophy%'
);

-- SECURITY tag: Remove from AI rights questions that matched on "protect"
-- These are about AI welfare, not personal security
DELETE FROM question_tags
WHERE tag_id = 'security'
AND question_id IN (
  SELECT id FROM questions WHERE
    text LIKE '%sentient robot%' OR
    text LIKE '%sentient AI%' OR
    text LIKE '%robots/AIs%'
);

-- POLICY tag: Remove from questions that aren't really about policy
-- "Aim of philosophy" matched but isn't policy
DELETE FROM question_tags
WHERE tag_id = 'policy'
AND question_id IN (
  SELECT id FROM questions WHERE text LIKE '%Aim of philosophy%'
);

-- =====================
-- PHASE 3: ADD MISSING TAGS
-- Questions that lost tags need replacements where appropriate
-- =====================

-- Add neighbor-tolerance to immigrants question
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'neighbor-tolerance' FROM questions
WHERE text LIKE '%immigrants/foreign workers as neighbors%';

-- Add mf-authority to tradition-related MFQ questions
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'mf-authority' FROM questions
WHERE text LIKE '%conformed to the traditions%';

-- =====================
-- VERIFICATION QUERIES (run after to check results)
-- =====================
-- SELECT t.name, COUNT(qt.question_id) as count
-- FROM tags t
-- LEFT JOIN question_tags qt ON t.id = qt.tag_id
-- LEFT JOIN questions q ON qt.question_id = q.id AND q.status = 'published'
-- GROUP BY t.id
-- ORDER BY count DESC;
