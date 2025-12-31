-- Moral Foundations Questionnaire Import
-- Generated: 2025-12-30T22:55:44.197Z
-- Source: Graham et al. (2011) "Mapping the Moral Domain" JPSP 101(2):366-385
-- Data from YourMorals.org (n=34476)

-- Benchmark source
INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  'oO7FuqVf7NyN',
  'Moral Foundations Questionnaire (Graham et al. 2011)',
  'MFQ',
  'https://moralfoundations.org/',
  34476,
  '2007-2011'
);

-- Harm/Care
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'PYcLy4PRA6li',
  'When you decide whether something is right or wrong, how relevant is whether or not someone suffered emotionally?',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'oO7FuqVf7NyN',
  'mfq_harm_care',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'svNs0kFFWfaR',
  'PYcLy4PRA6li',
  'oO7FuqVf7NyN',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":6,"Not very relevant":400,"Slightly relevant":5571,"Somewhat relevant":16399,"Very relevant":10584,"Extremely relevant":1516}',
  34476
);

-- Fairness/Reciprocity
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '3i758IRobNsr',
  'When you decide whether something is right or wrong, how relevant is whether or not someone acted unfairly?',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'oO7FuqVf7NyN',
  'mfq_fairness_reciprocity',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'fgxkRme3VRNJ',
  '3i758IRobNsr',
  'oO7FuqVf7NyN',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":0,"Not very relevant":75,"Slightly relevant":3287,"Somewhat relevant":17400,"Very relevant":12513,"Extremely relevant":1201}',
  34476
);

-- Ingroup/Loyalty
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '7oZKm55NuJDy',
  'When you decide whether something is right or wrong, how relevant is whether or not someone showed a lack of loyalty?',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'oO7FuqVf7NyN',
  'mfq_ingroup_loyalty',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '1XVG6iVNIRlR',
  '7oZKm55NuJDy',
  'oO7FuqVf7NyN',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":580,"Not very relevant":6629,"Slightly relevant":16689,"Somewhat relevant":9391,"Very relevant":1157,"Extremely relevant":30}',
  34476
);

-- Authority/Respect
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'k0T0JmCBMbN3',
  'When you decide whether something is right or wrong, how relevant is whether or not someone showed a lack of respect for authority?',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'oO7FuqVf7NyN',
  'mfq_authority_respect',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '1DKpn6EhLRzl',
  'k0T0JmCBMbN3',
  'oO7FuqVf7NyN',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":553,"Not very relevant":6418,"Slightly relevant":16574,"Somewhat relevant":9653,"Very relevant":1244,"Extremely relevant":34}',
  34476
);

-- Purity/Sanctity
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '0E4xykN4Wsa9',
  'When you decide whether something is right or wrong, how relevant is whether or not someone violated standards of purity and decency?',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'oO7FuqVf7NyN',
  'mfq_purity_sanctity',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'RblGlYFKN2ew',
  '0E4xykN4Wsa9',
  'oO7FuqVf7NyN',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":4950,"Not very relevant":13126,"Slightly relevant":12340,"Somewhat relevant":3702,"Very relevant":348,"Extremely relevant":10}',
  34476
);
