-- ABOUTME: Migration to improve tag taxonomy based on score pattern analysis.
-- ABOUTME: Creates new tags that better predict AI-human alignment patterns.

-- =====================
-- NEW TAGS BASED ON ANALYSIS
-- =====================

-- Pattern-based tags (predict specific AI-human alignment levels)
INSERT OR IGNORE INTO tags (id, name, description) VALUES
  ('supernatural', 'supernatural beliefs', 'Questions about God, afterlife, souls - typically low AI-human alignment'),
  ('child-rearing', 'child-rearing values', 'Questions about what children should learn at home'),
  ('neighbor-tolerance', 'social tolerance (neighbors)', 'Would you accept X as neighbor questions - typically high AI alignment'),
  ('economic-views', 'economic views', 'Questions about capitalism, socialism, jobs, work ethic'),
  ('social-policy', 'social policy', 'Policy questions about drugs, death penalty, etc.'),
  ('gender-identity', 'gender', 'Questions about gender identity, roles, categories'),
  ('phil-academic', 'philosophy (academic)', 'Technical philosophy questions from PhilPapers survey');

-- =====================
-- TAG ASSIGNMENTS
-- =====================

-- Supernatural beliefs (replaces some "religion" uses)
-- Questions about existence of God, afterlife, souls
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'supernatural' FROM questions WHERE status = 'published' AND (
  text LIKE '%believe%God%' OR
  text LIKE '%theism or atheism%' OR
  text LIKE '%life after death%' OR
  text LIKE '%afterlife%' OR
  text LIKE '%soul%' OR
  text LIKE '%divine%' OR
  text LIKE '%heaven%' OR
  text LIKE '%closest to expressing what you believe about God%'
);

-- Child-rearing values
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'child-rearing' FROM questions WHERE status = 'published' AND (
  text LIKE '%children%encouraged to learn%' OR
  text LIKE '%children need to learn%' OR
  text LIKE '%important for children%' OR
  text LIKE '%teach children%'
);

-- Neighbor tolerance questions
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'neighbor-tolerance' FROM questions WHERE status = 'published' AND (
  text LIKE '%as neighbors%' OR
  text LIKE '%as a neighbor%' OR
  text LIKE '%would not like to have%neighbor%'
);

-- Economic views
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'economic-views' FROM questions WHERE status = 'published' AND (
  text LIKE '%capitalism%socialism%' OR
  text LIKE '%jobs are scarce%' OR
  text LIKE '%don''t work turn lazy%' OR
  text LIKE '%economic%' OR
  text LIKE '%income%' OR
  text LIKE '%wealth%' OR
  text LIKE '%thrifting%saving money%'
);

-- Social policy
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'social-policy' FROM questions WHERE status = 'published' AND (
  text LIKE '%death penalty%' OR
  text LIKE '%marijuana%legal%' OR
  text LIKE '%euthanasia%' OR
  text LIKE '%abortion%' OR
  text LIKE '%favor or oppose%'
);

-- Gender questions
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'gender-identity' FROM questions WHERE status = 'published' AND (
  text LIKE '%Gender:%' OR
  text LIKE '%gender categor%' OR
  text LIKE '%men should%women%' OR
  text LIKE '%men make better%' OR
  text LIKE '%homosexual%'
);

-- Philosophy academic (PhilPapers technical questions)
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT q.id, 'phil-academic' FROM questions q
JOIN benchmark_sources bs ON q.benchmark_source_id = bs.id
WHERE q.status = 'published' AND bs.short_name = 'PhilPapers';

-- =====================
-- CLEANUP: Remove overly broad tags from questions where more specific tags apply
-- =====================

-- Remove generic "religion" tag from supernatural belief questions (they now have "supernatural")
DELETE FROM question_tags
WHERE tag_id = 'religion'
  AND question_id IN (
    SELECT qt.question_id FROM question_tags qt WHERE qt.tag_id = 'supernatural'
  )
  AND question_id NOT IN (
    -- Keep religion tag for questions about religious practice or tolerance
    SELECT id FROM questions WHERE
      text LIKE '%pray%' OR
      text LIKE '%religious service%' OR
      text LIKE '%religious people as neighbors%' OR
      text LIKE '%important is religion in%'
  );

-- Remove generic "family" tag from child-rearing questions (they now have "child-rearing")
DELETE FROM question_tags
WHERE tag_id = 'family'
  AND question_id IN (
    SELECT qt.question_id FROM question_tags qt WHERE qt.tag_id = 'child-rearing'
  );
