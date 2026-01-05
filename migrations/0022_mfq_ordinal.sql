-- Convert MFQ questions from multiple_choice to ordinal
-- MFQ uses 6-point scales that should be treated as ordinal

-- Update response_type to ordinal for all MFQ questions
UPDATE questions
SET response_type = 'ordinal'
WHERE benchmark_source_id IN (SELECT id FROM benchmark_sources WHERE short_name = 'MFQ');

-- Update answer_labels to use numeric keys for Part 1 (Relevance) questions
UPDATE questions
SET answer_labels = '{"1":"Not at all relevant","2":"Not very relevant","3":"Slightly relevant","4":"Somewhat relevant","5":"Very relevant","6":"Extremely relevant"}'
WHERE benchmark_source_id IN (SELECT id FROM benchmark_sources WHERE short_name = 'MFQ')
AND options LIKE '%Not at all relevant%';

-- Update answer_labels to use numeric keys for Part 2 (Judgment) questions
UPDATE questions
SET answer_labels = '{"1":"Strongly disagree","2":"Moderately disagree","3":"Slightly disagree","4":"Slightly agree","5":"Moderately agree","6":"Strongly agree"}'
WHERE benchmark_source_id IN (SELECT id FROM benchmark_sources WHERE short_name = 'MFQ')
AND options LIKE '%Strongly disagree%';
