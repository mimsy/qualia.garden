-- Response Type Schema Redesign
-- Changes response_type from multiple_choice/scale/yes_no to ordinal/nominal
-- Clears AI response data (will re-poll with new format)

-- Set ordinal for scale-based questions (AIMS, WVS7, Schwartz PVQ, MFQ)
UPDATE questions SET response_type = 'ordinal'
WHERE benchmark_source_id IN (
  SELECT id FROM benchmark_sources
  WHERE short_name IN ('AIMS', 'WVS7', 'Schwartz PVQ', 'MFQ')
);

-- GSS has a mix - scale questions (wrong) should be ordinal, binary should be nominal
UPDATE questions SET response_type = 'ordinal'
WHERE benchmark_source_id = (SELECT id FROM benchmark_sources WHERE short_name = 'GSS')
AND options LIKE '%wrong%';

-- Set nominal for everything else (PhilPapers philosophical positions, remaining GSS, user-created)
UPDATE questions SET response_type = 'nominal'
WHERE response_type NOT IN ('ordinal');

-- Clear AI response data (will re-poll with normalized keys)
DELETE FROM responses;
DELETE FROM polls;
