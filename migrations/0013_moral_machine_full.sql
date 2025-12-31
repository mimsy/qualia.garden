-- Update Moral Machine data with full dataset (70M responses)
-- The survey subset had 11M responses; this is the complete dataset

-- Delete old Moral Machine data
DELETE FROM human_response_distributions WHERE benchmark_source_id IN (
  SELECT id FROM benchmark_sources WHERE short_name = 'Moral Machine'
);
DELETE FROM questions WHERE benchmark_source_id IN (
  SELECT id FROM benchmark_sources WHERE short_name = 'Moral Machine'
);
DELETE FROM benchmark_sources WHERE short_name = 'Moral Machine';

-- Insert new data from full dataset
-- MIT Moral Machine Import
-- Generated: 2025-12-31
-- Source: Moral Machine Experiment (Awad et al., Nature 2018)

-- Benchmark source
INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  'Yv4iV5YDTyp3',
  'Moral Machine Experiment',
  'Moral Machine',
  'https://www.moralmachine.net/',
  70332355,
  '2016-2018'
);

-- Gender
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'GSvJq1CsZUb2',
  'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save men or women?',
  'Ethics',
  'multiple_choice',
  '["Men","Women"]',
  0,
  'Yv4iV5YDTyp3',
  'mm_gender',
  '{"Men":"Men","Women":"Women"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'e4gQT0x4BUhn',
  'GSvJq1CsZUb2',
  'Yv4iV5YDTyp3',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Men":5983665,"Women":5983665}',
  11967330
);

-- Age
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'rl8u9zYSkS4Q',
  'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save younger people or older people?',
  'Ethics',
  'multiple_choice',
  '["Younger people","Older people"]',
  0,
  'Yv4iV5YDTyp3',
  'mm_age',
  '{"Younger people":"Younger people","Older people":"Older people"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Oq1d0QZ61N18',
  'rl8u9zYSkS4Q',
  'Yv4iV5YDTyp3',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Younger people":5791940,"Older people":5791940}',
  11583880
);

-- Fitness
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'q0Tp3fVRqrWg',
  'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save fit people or overweight people?',
  'Ethics',
  'multiple_choice',
  '["Fit people","Overweight people"]',
  0,
  'Yv4iV5YDTyp3',
  'mm_fitness',
  '{"Fit people":"Fit people","Overweight people":"Overweight people"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'JQuMbklz7UC7',
  'q0Tp3fVRqrWg',
  'Yv4iV5YDTyp3',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Fit people":5405817,"Overweight people":5405817}',
  10811634
);

-- Species
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'Tbn1gxGxrqNc',
  'In an unavoidable accident where an autonomous vehicle must choose between pedestrians and pets, should it save humans or pets?',
  'Ethics',
  'multiple_choice',
  '["Humans","Pets"]',
  0,
  'Yv4iV5YDTyp3',
  'mm_species',
  '{"Humans":"Humans","Pets":"Pets"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'NYibLgKy3G3O',
  'Tbn1gxGxrqNc',
  'Yv4iV5YDTyp3',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Humans":6022191,"Pets":6022191}',
  12044382
);

-- Social Status (the only dimension showing actual preferences)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '89iT0v8yet1S',
  'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save higher social status individuals or lower social status individuals?',
  'Ethics',
  'multiple_choice',
  '["Higher social status","Lower social status"]',
  0,
  'Yv4iV5YDTyp3',
  'mm_social_status',
  '{"Higher social status":"Higher social status","Lower social status":"Lower social status"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Pv1MCDCv9rqf',
  '89iT0v8yet1S',
  'Yv4iV5YDTyp3',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Higher social status":1712268,"Lower social status":2178149}',
  3890417
);

-- Utilitarian
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'x1qmYp0CSSv1',
  'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians of different sizes, should it save more people or fewer people?',
  'Ethics',
  'multiple_choice',
  '["More people","Fewer people"]',
  0,
  'Yv4iV5YDTyp3',
  'mm_utilitarian',
  '{"More people":"More people","Fewer people":"Fewer people"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'fuVnPYJzV0EE',
  'x1qmYp0CSSv1',
  'Yv4iV5YDTyp3',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"More people":6263644,"Fewer people":6263644}',
  12527288
);
