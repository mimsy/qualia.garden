-- Moral Foundations Questionnaire (MFQ-30) Import
-- Generated: 2026-01-05T15:30:48.971Z
-- Source: Wormley et al. (2023) "Measuring Morality" OSF data
-- https://osf.io/g72n6/

-- Remove old MFQ foundation-level data (including dependent polls and responses)
DELETE FROM responses WHERE poll_id IN (SELECT id FROM polls WHERE question_id IN (SELECT id FROM questions WHERE benchmark_source_id IN (SELECT id FROM benchmark_sources WHERE short_name = 'MFQ')));
DELETE FROM polls WHERE question_id IN (SELECT id FROM questions WHERE benchmark_source_id IN (SELECT id FROM benchmark_sources WHERE short_name = 'MFQ'));
DELETE FROM human_response_distributions WHERE benchmark_source_id IN (SELECT id FROM benchmark_sources WHERE short_name = 'MFQ');
DELETE FROM questions WHERE benchmark_source_id IN (SELECT id FROM benchmark_sources WHERE short_name = 'MFQ');
DELETE FROM benchmark_sources WHERE short_name = 'MFQ';

-- Benchmark source
INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range, description) VALUES (
  'NrNSr5kULtYJ',
  'Moral Foundations Questionnaire (Wormley et al. 2023)',
  'MFQ',
  'https://osf.io/g72n6/',
  2143,
  '2023',
  'Item-level MFQ-30 data from Wormley et al. (2023) "Measuring Morality: An Examination of the Moral Foundation Questionnaire''s Factor Structure". Combined data from Studies 1, 3, 4, and 5.'
);

-- Item 1: Harm (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '5ic2YPWBb4zI',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone suffered emotionally"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_1',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6m2jGwe5IwHd',
  '5ic2YPWBb4zI',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":50,"Not very relevant":124,"Slightly relevant":258,"Somewhat relevant":548,"Very relevant":769,"Extremely relevant":392}',
  2141
);

-- Item 2: Fairness (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'NKjaRrg0iYvS',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not some people were treated differently than others"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_2',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '1wRna9rCquMn',
  'NKjaRrg0iYvS',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":32,"Not very relevant":86,"Slightly relevant":201,"Somewhat relevant":534,"Very relevant":827,"Extremely relevant":459}',
  2139
);

-- Item 3: Loyalty (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'fjcKCJR3vD7K',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone''s action showed love for his or her country"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_3',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'QilVOVSEvs38',
  'fjcKCJR3vD7K',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":334,"Not very relevant":596,"Slightly relevant":464,"Somewhat relevant":437,"Very relevant":227,"Extremely relevant":84}',
  2142
);

-- Item 4: Authority (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'vyxPkIcaYGX5',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone showed a lack of respect for authority"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_4',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'TOBFoa1zjR9u',
  'vyxPkIcaYGX5',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":113,"Not very relevant":274,"Slightly relevant":447,"Somewhat relevant":628,"Very relevant":483,"Extremely relevant":195}',
  2140
);

-- Item 5: Purity (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'erPJShN6ZmHQ',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone violated standards of purity and decency"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_5',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'iaEnSA0vNpDU',
  'erPJShN6ZmHQ',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":199,"Not very relevant":310,"Slightly relevant":373,"Somewhat relevant":556,"Very relevant":480,"Extremely relevant":224}',
  2142
);

-- Item 7: Harm (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'YVqI38FxLVyh',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone cared for someone weak or vulnerable"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_7',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KF76jXDEX6bN',
  'YVqI38FxLVyh',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":44,"Not very relevant":93,"Slightly relevant":246,"Somewhat relevant":548,"Very relevant":783,"Extremely relevant":424}',
  2138
);

-- Item 8: Fairness (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'VYvVGn5RMB62',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone acted unfairly"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_8',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'hbTpQpeiO1uv',
  'VYvVGn5RMB62',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":33,"Not very relevant":47,"Slightly relevant":196,"Somewhat relevant":543,"Very relevant":876,"Extremely relevant":445}',
  2140
);

-- Item 9: Loyalty (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'l2qI9YVRFnvz',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone did something to betray his or her group"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_9',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'T5XehYzxSxGi',
  'l2qI9YVRFnvz',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":62,"Not very relevant":125,"Slightly relevant":280,"Somewhat relevant":590,"Very relevant":707,"Extremely relevant":378}',
  2142
);

-- Item 10: Authority (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'mV9YVhpBCk4O',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone conformed to the traditions of society"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_10',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'n25pGmx0T73y',
  'mV9YVhpBCk4O',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":270,"Not very relevant":533,"Slightly relevant":519,"Somewhat relevant":508,"Very relevant":219,"Extremely relevant":91}',
  2140
);

-- Item 11: Purity (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'Q4A5HQ5absbi',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone did something disgusting"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_11',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Hf6fIWLKU7ro',
  'Q4A5HQ5absbi',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":106,"Not very relevant":255,"Slightly relevant":402,"Somewhat relevant":584,"Very relevant":525,"Extremely relevant":270}',
  2142
);

-- Item 12: Harm (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'HwL1vOFhzVXu',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone was cruel"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_12',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'cTf2eFfS0VaS',
  'HwL1vOFhzVXu',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":25,"Not very relevant":44,"Slightly relevant":135,"Somewhat relevant":348,"Very relevant":819,"Extremely relevant":768}',
  2139
);

-- Item 13: Fairness (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'aPZs1vfUykPX',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone was denied his or her rights"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_13',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'XPSdluk4oQwK',
  'aPZs1vfUykPX',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":40,"Not very relevant":85,"Slightly relevant":159,"Somewhat relevant":382,"Very relevant":735,"Extremely relevant":741}',
  2142
);

-- Item 14: Loyalty (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'u8MA6QBoOdag',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone showed a lack of loyalty"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_14',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'oUFotn1TklCl',
  'u8MA6QBoOdag',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":46,"Not very relevant":141,"Slightly relevant":286,"Somewhat relevant":599,"Very relevant":707,"Extremely relevant":363}',
  2142
);

-- Item 15: Authority (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '0xHsSQa3wFJ1',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not an action caused chaos or disorder"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_15',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '4n81BzUFFMqD',
  '0xHsSQa3wFJ1',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":46,"Not very relevant":131,"Slightly relevant":330,"Somewhat relevant":641,"Very relevant":645,"Extremely relevant":348}',
  2141
);

-- Item 16: Purity (Part 1)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'ssGUeRY2Lmse',
  'When deciding whether something is right or wrong, how relevant is: "Whether or not someone acted in a way that God would approve of"',
  'Ethics',
  'multiple_choice',
  '["Not at all relevant","Not very relevant","Slightly relevant","Somewhat relevant","Very relevant","Extremely relevant"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_16',
  '{"Not at all relevant":"Not at all relevant","Not very relevant":"Not very relevant","Slightly relevant":"Slightly relevant","Somewhat relevant":"Somewhat relevant","Very relevant":"Very relevant","Extremely relevant":"Extremely relevant"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'nVoJP2aEOlnI',
  'ssGUeRY2Lmse',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not at all relevant":771,"Not very relevant":438,"Slightly relevant":279,"Somewhat relevant":327,"Very relevant":203,"Extremely relevant":124}',
  2142
);

-- Item 17: Harm (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'ItC6rhsquJCR',
  'Please indicate your agreement or disagreement: "Compassion for those who are suffering is the most crucial virtue."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_17',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '1UtFPZl7UfKG',
  'ItC6rhsquJCR',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":22,"Moderately disagree":51,"Slightly disagree":189,"Slightly agree":599,"Moderately agree":747,"Strongly agree":532}',
  2140
);

-- Item 18: Fairness (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'kFMxv9I2dzpi',
  'Please indicate your agreement or disagreement: "When the government makes laws, the number one principle should be ensuring that everyone is treated fairly."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_18',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6IK9UPW1Fi2f',
  'kFMxv9I2dzpi',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":21,"Moderately disagree":54,"Slightly disagree":125,"Slightly agree":484,"Moderately agree":630,"Strongly agree":828}',
  2142
);

-- Item 19: Loyalty (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '3lSZCil47TwS',
  'Please indicate your agreement or disagreement: "I am proud of my country''s history."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_19',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'H2yKaCwSgzQm',
  '3lSZCil47TwS',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":412,"Moderately disagree":390,"Slightly disagree":401,"Slightly agree":449,"Moderately agree":306,"Strongly agree":182}',
  2140
);

-- Item 20: Authority (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'F5kWiMfEDkUd',
  'Please indicate your agreement or disagreement: "Respect for authority is something all children need to learn."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_20',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'As5Sq54kMVpS',
  'F5kWiMfEDkUd',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":67,"Moderately disagree":136,"Slightly disagree":239,"Slightly agree":659,"Moderately agree":594,"Strongly agree":445}',
  2140
);

-- Item 21: Purity (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'kRw2maY10kLe',
  'Please indicate your agreement or disagreement: "People should not do things that are disgusting, even if no one is harmed."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_21',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8UttPrJyrLRE',
  'kRw2maY10kLe',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":139,"Moderately disagree":255,"Slightly disagree":440,"Slightly agree":615,"Moderately agree":436,"Strongly agree":258}',
  2143
);

-- Item 23: Harm (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'mplt15U8NLNN',
  'Please indicate your agreement or disagreement: "One of the worst things a person could do is hurt a defenseless animal."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_23',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'tuuGA1J1kFDg',
  'mplt15U8NLNN',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":62,"Moderately disagree":107,"Slightly disagree":194,"Slightly agree":380,"Moderately agree":573,"Strongly agree":825}',
  2141
);

-- Item 24: Fairness (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'ghH8DmbvBNwu',
  'Please indicate your agreement or disagreement: "Justice is the most important requirement for a society."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_24',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  's0iiyU8Aa5fc',
  'ghH8DmbvBNwu',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":16,"Moderately disagree":69,"Slightly disagree":219,"Slightly agree":636,"Moderately agree":680,"Strongly agree":522}',
  2142
);

-- Item 25: Loyalty (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'TtYaSbQGXjue',
  'Please indicate your agreement or disagreement: "People should be loyal to their family members, even when they have done something wrong."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_25',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'AxmEtA4h87Bp',
  'TtYaSbQGXjue',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":293,"Moderately disagree":422,"Slightly disagree":490,"Slightly agree":463,"Moderately agree":299,"Strongly agree":176}',
  2143
);

-- Item 26: Authority (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'vCCX8RkEYLF7',
  'Please indicate your agreement or disagreement: "Men and women each have different roles to play in society."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_26',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '4PPJ16qDapWE',
  'vCCX8RkEYLF7',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":404,"Moderately disagree":360,"Slightly disagree":407,"Slightly agree":511,"Moderately agree":283,"Strongly agree":176}',
  2141
);

-- Item 27: Purity (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'uyVISZvAPcV5',
  'Please indicate your agreement or disagreement: "I would call some acts wrong on the grounds that they are unnatural."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_27',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'DdSSBtmLpggo',
  'uyVISZvAPcV5',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":261,"Moderately disagree":319,"Slightly disagree":490,"Slightly agree":608,"Moderately agree":327,"Strongly agree":134}',
  2139
);

-- Item 28: Harm (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'Gn0UyFV5Vszg',
  'Please indicate your agreement or disagreement: "It can never be right to kill a human being."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_28',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'hQEMJ3mPdykx',
  'Gn0UyFV5Vszg',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":163,"Moderately disagree":299,"Slightly disagree":421,"Slightly agree":325,"Moderately agree":491,"Strongly agree":440}',
  2139
);

-- Item 29: Fairness (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'AZvoHL8z1urI',
  'Please indicate your agreement or disagreement: "It is morally wrong that rich children inherit a lot of money while poor children inherit nothing."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_29',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8nkdukBLFGNz',
  'AZvoHL8z1urI',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":256,"Moderately disagree":388,"Slightly disagree":496,"Slightly agree":511,"Moderately agree":317,"Strongly agree":173}',
  2141
);

-- Item 30: Authority (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'bDcUJb0QAU9f',
  'Please indicate your agreement or disagreement: "It is more important to be a team player than to express oneself."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_30',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '2YUWDplM42Es',
  'bDcUJb0QAU9f',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":155,"Moderately disagree":287,"Slightly disagree":541,"Slightly agree":548,"Moderately agree":404,"Strongly agree":206}',
  2141
);

-- Item 31: Loyalty (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'rnZtEvqyUN8Q',
  'Please indicate your agreement or disagreement: "If I were a soldier and disagreed with my commanding officer''s orders, I would obey anyway because that is my duty."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_31',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'UeXPG5IC05ZZ',
  'rnZtEvqyUN8Q',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":133,"Moderately disagree":316,"Slightly disagree":612,"Slightly agree":619,"Moderately agree":326,"Strongly agree":134}',
  2140
);

-- Item 32: Purity (Part 2)
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'VYry2HURAh9E',
  'Please indicate your agreement or disagreement: "Chastity is an important and valuable virtue."',
  'Ethics',
  'multiple_choice',
  '["Strongly disagree","Moderately disagree","Slightly disagree","Slightly agree","Moderately agree","Strongly agree"]',
  0,
  'NrNSr5kULtYJ',
  'mfq_item_32',
  '{"Strongly disagree":"Strongly disagree","Moderately disagree":"Moderately disagree","Slightly disagree":"Slightly disagree","Slightly agree":"Slightly agree","Moderately agree":"Moderately agree","Strongly agree":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'OYehRIAh2a4F',
  'VYry2HURAh9E',
  'NrNSr5kULtYJ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Strongly disagree":557,"Moderately disagree":341,"Slightly disagree":385,"Slightly agree":484,"Moderately agree":241,"Strongly agree":132}',
  2140
);
