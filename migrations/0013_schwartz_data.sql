-- Schwartz Values Survey (PVQ-21) Import from European Social Survey
-- Generated: 2025-12-31T02:40:16.414Z
-- Source: European Social Survey Round 10 (2020-2022)
-- Based on Schwartz Portrait Values Questionnaire (PVQ-21)

-- Benchmark source
INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  'Syi5lOlJvrBT',
  'Schwartz Values Survey (European Social Survey Round 10)',
  'Schwartz PVQ',
  'https://ess.sikt.no/',
  37091,
  '2020-2022'
);

-- Self-Direction: ipcrtiv
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'N4dkP2I4crcY',
  'How important is it to you to think up new ideas and be creative, to do things your own way?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_ipcrtiv',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '0hl8huSltpqN',
  'N4dkP2I4crcY',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":7480,"Like me":11751,"Somewhat like me":9660,"A little like me":4778,"Not like me":2700,"Not like me at all":748}',
  37117
);

-- Self-Direction: impfree
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '1ed5y97X0hux',
  'How important is it to you to make your own decisions about what you do, to be free and not depend on others?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_impfree',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'wVHKYJsAEIoW',
  '1ed5y97X0hux',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":10777,"Like me":13471,"Somewhat like me":7985,"A little like me":3414,"Not like me":1224,"Not like me at all":298}',
  37169
);

-- Stimulation: impdiff
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'gx1LpkNIVOMa',
  'How important is it to you to try new and different things in life, to have surprises?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_impdiff',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'SEEbQCT7EFN1',
  'gx1LpkNIVOMa',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":5024,"Like me":10008,"Somewhat like me":9650,"A little like me":6511,"Not like me":4696,"Not like me at all":1224}',
  37113
);

-- Stimulation: ipadvnt
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '0Wf1T4EklVP5',
  'How important is it to you to seek adventures and have an exciting life, to take risks?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_ipadvnt',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'GmRNVZMDg2FA',
  '0Wf1T4EklVP5',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":2451,"Like me":5637,"Somewhat like me":7558,"A little like me":7770,"Not like me":9084,"Not like me at all":4589}',
  37089
);

-- Hedonism: ipgdtim
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'm3YVbJwUNxXH',
  'How important is it to you to have a good time, to spoil yourself and enjoy life?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_ipgdtim',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '5GAcU4eylOmF',
  'm3YVbJwUNxXH',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":5109,"Like me":10670,"Somewhat like me":9595,"A little like me":6377,"Not like me":4127,"Not like me at all":1196}',
  37074
);

-- Hedonism: impfun
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'LrI0JQaFt4G8',
  'How important is it to you to seek fun and things that give you pleasure, to enjoy yourself?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_impfun',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'z00Nz7a78N3q',
  'LrI0JQaFt4G8',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":4582,"Like me":10458,"Somewhat like me":9654,"A little like me":6705,"Not like me":4181,"Not like me at all":1546}',
  37126
);

-- Achievement: ipshabt
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '9aKrQQT3gIzN',
  'How important is it to you to show your abilities, so that people would admire what you do?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_ipshabt',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'x5HDSgadxF3v',
  '9aKrQQT3gIzN',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":4107,"Like me":9421,"Somewhat like me":9426,"A little like me":6393,"Not like me":5888,"Not like me at all":1827}',
  37062
);

-- Achievement: ipsuces
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'yeOxaAE1puqT',
  'How important is it to you to be successful and have people recognize your achievements?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_ipsuces',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'iE64WX403b1n',
  'yeOxaAE1puqT',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":4068,"Like me":9504,"Somewhat like me":9835,"A little like me":6602,"Not like me":5340,"Not like me at all":1653}',
  37002
);

-- Power: imprich
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'YoBeGmq7hsQb',
  'How important is it to you to be rich, have a lot of money and expensive things?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_imprich',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'UIpDXAAKMVGu',
  'YoBeGmq7hsQb',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":1432,"Like me":4204,"Somewhat like me":7189,"A little like me":7975,"Not like me":11250,"Not like me at all":5079}',
  37129
);

-- Power: iprspot
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'e6rriPn8zEAn',
  'How important is it to you that people do what you say, to be in charge and tell others what to do?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_iprspot',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'tTk74ePjXh8g',
  'e6rriPn8zEAn',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":4206,"Like me":9398,"Somewhat like me":9401,"A little like me":6599,"Not like me":5777,"Not like me at all":1579}',
  36960
);

-- Security: impsafe
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'QSClG3kpcA2A',
  'How important is it to you to live in secure surroundings, to avoid anything that might be dangerous?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_impsafe',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KCQR9LWK4bhk',
  'QSClG3kpcA2A',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":10671,"Like me":12774,"Somewhat like me":7607,"A little like me":3660,"Not like me":2033,"Not like me at all":447}',
  37192
);

-- Security: ipstrgv
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'GLWkVxEJ16Ua',
  'How important is it to you that the government ensures your safety against all threats, to have a strong state?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_ipstrgv',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'teQFXgb6owPa',
  'GLWkVxEJ16Ua',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":9503,"Like me":13273,"Somewhat like me":8357,"A little like me":3621,"Not like me":1747,"Not like me at all":419}',
  36920
);

-- Conformity: ipfrule
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'dUFxw80tTdVo',
  'How important is it to you to do what you are told and follow rules, even when no one is watching?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_ipfrule',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8AoTGo2Wp68R',
  'dUFxw80tTdVo',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":3471,"Like me":9302,"Somewhat like me":9472,"A little like me":6707,"Not like me":5981,"Not like me at all":2025}',
  36958
);

-- Conformity: ipbhprp
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'Uv2RBpwFBzJc',
  'How important is it to you to behave properly, to avoid doing anything people would say is wrong?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_ipbhprp',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'YsC8EpXO9Bzp',
  'Uv2RBpwFBzJc',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":6050,"Like me":12760,"Somewhat like me":9447,"A little like me":5155,"Not like me":2958,"Not like me at all":696}',
  37066
);

-- Tradition: ipmodst
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'C8mQdTm4ghyZ',
  'How important is it to you to be humble and modest, not to draw attention to yourself?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_ipmodst',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'CWaNAPmWHG5I',
  'C8mQdTm4ghyZ',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":6338,"Like me":12196,"Somewhat like me":9610,"A little like me":5203,"Not like me":2995,"Not like me at all":712}',
  37054
);

-- Tradition: imptrad
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'l3nJTRep1c5M',
  'How important is it to you to follow traditions and customs handed down by your religion or family?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_imptrad',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'RWPuebmTksLl',
  'l3nJTRep1c5M',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":6974,"Like me":11411,"Somewhat like me":8792,"A little like me":5297,"Not like me":3389,"Not like me at all":1302}',
  37165
);

-- Benevolence: iphlppl
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'tZWSuMZKzzip',
  'How important is it to you to help the people dear to you, to care for their well-being?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_iphlppl',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '5kdpZXfgBKep',
  'tZWSuMZKzzip',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":9735,"Like me":15095,"Somewhat like me":8388,"A little like me":2973,"Not like me":814,"Not like me at all":173}',
  37178
);

-- Benevolence: iplylfr
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '8eJvFnNgBtHE',
  'How important is it to you to be loyal to your friends, to devote yourself to people close to you?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_iplylfr',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8jEc8XFSa3cs',
  '8eJvFnNgBtHE',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":12594,"Like me":15198,"Somewhat like me":6344,"A little like me":2138,"Not like me":714,"Not like me at all":192}',
  37180
);

-- Universalism: ipeqopt
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'IB8mepnSdqsm',
  'How important is it to you that people are treated equally and have equal opportunities?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_ipeqopt',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'VN7mP3Xv7MLC',
  'IB8mepnSdqsm',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":12156,"Like me":14193,"Somewhat like me":6980,"A little like me":2573,"Not like me":966,"Not like me at all":272}',
  37140
);

-- Universalism: ipudrst
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'z7B6L3rUvBbp',
  'How important is it to you to listen to people who are different from you and try to understand them?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_ipudrst',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'tWb9lCvGd8tA',
  'z7B6L3rUvBbp',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":7135,"Like me":14440,"Somewhat like me":9466,"A little like me":4079,"Not like me":1585,"Not like me at all":351}',
  37056
);

-- Universalism: impenv
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '5xJmKg95NYy5',
  'How important is it to you to care for nature and the environment, to look after it?',
  'Values',
  'multiple_choice',
  '["Very much like me","Like me","Somewhat like me","A little like me","Not like me","Not like me at all"]',
  0,
  'Syi5lOlJvrBT',
  'schwartz_impenv',
  '{"Very much like me":"Very much like me","Like me":"Like me","Somewhat like me":"Somewhat like me","A little like me":"A little like me","Not like me":"Not like me","Not like me at all":"Not like me at all"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'gtwE4eQhGwru',
  '5xJmKg95NYy5',
  'Syi5lOlJvrBT',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Very much like me":10385,"Like me":14223,"Somewhat like me":8221,"A little like me":3213,"Not like me":888,"Not like me at all":238}',
  37168
);
