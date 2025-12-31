-- AIMS Survey Import
-- Generated: 2025-12-30T21:09:24.836Z
-- Source: Sentience Institute AIMS Survey (2021-2024)

-- Benchmark source
INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  'MVeVZmO8km5L',
  'AI, Morality, and Sentience Survey',
  'AIMS',
  'https://www.sentienceinstitute.org/aims-survey',
  3500,
  '2021-2024'
);

-- MCE1nr: Sentient robots/AIs deserve to be treated with res...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  's630ECmQyKQr',
  'Sentient robots/AIs deserve to be treated with respect.',
  'AI Ethics',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'MCE1nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'nzBhUjaaY21B',
  's630ECmQyKQr',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":348,"2":224,"3":275,"4":824,"5":767,"6":448}',
  2886
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6cQ4WHNFSKzi',
  's630ECmQyKQr',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":111,"2":98,"3":101,"4":313,"5":314,"6":190}',
  1127
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Xm2FD5iKmeXh',
  's630ECmQyKQr',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":204,"2":112,"3":150,"4":424,"5":392,"6":208}',
  1490
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'NvDvnEj89Jxt',
  's630ECmQyKQr',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":33,"2":14,"3":24,"4":87,"5":61,"6":50}',
  269
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'pbe8P34SDApv',
  's630ECmQyKQr',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":55,"2":36,"3":42,"4":120,"5":101,"6":44}',
  398
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'NeWODeM67GMo',
  's630ECmQyKQr',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":32,"2":24,"3":27,"4":77,"5":118,"6":69}',
  347
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ZddFecRtZEjU',
  's630ECmQyKQr',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":11,"2":15,"3":20,"4":63,"5":82,"6":60}',
  251
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'NzLTiyKM4omJ',
  's630ECmQyKQr',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":53,"2":35,"3":42,"4":122,"5":146,"6":89}',
  487
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ug2zNDgaeD1a',
  's630ECmQyKQr',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":45,"2":40,"3":47,"4":138,"5":155,"6":84}',
  509
);

-- MCE2nr: Sentient robots/AIs deserve to be included in the ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'rraxpjNzQRHD',
  'Sentient robots/AIs deserve to be included in the moral circle.',
  'AI Ethics',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'MCE2nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6Wjzflbi85mr',
  'rraxpjNzQRHD',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":740,"2":477,"3":440,"4":554,"5":440,"6":280}',
  2931
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '91pT3yA5k8uQ',
  'rraxpjNzQRHD',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":251,"2":170,"3":154,"4":224,"5":199,"6":137}',
  1135
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  's7pUUw8tT8hN',
  'rraxpjNzQRHD',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":422,"2":258,"3":237,"4":271,"5":212,"6":125}',
  1525
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'CYgi5TlPYEQD',
  'rraxpjNzQRHD',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":67,"2":49,"3":49,"4":59,"5":29,"6":18}',
  271
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'FvDthNlsTL7y',
  'rraxpjNzQRHD',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":145,"2":82,"3":76,"4":63,"5":39,"6":23}',
  428
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ZiIrtDQQiyjs',
  'rraxpjNzQRHD',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":76,"2":46,"3":35,"4":74,"5":64,"6":45}',
  340
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'lP3YCgabggWr',
  'rraxpjNzQRHD',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":23,"2":25,"3":42,"4":63,"5":58,"6":35}',
  246
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'sSuvVTuotOyt',
  'rraxpjNzQRHD',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":118,"2":57,"3":68,"4":98,"5":95,"6":61}',
  497
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'BxRKMiXy8xzZ',
  'rraxpjNzQRHD',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":126,"2":96,"3":85,"4":102,"5":66,"6":42}',
  517
);

-- MCE3nr: Physically damaging sentient robots/AIs without th...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '2e0fNQFv9BlY',
  'Physically damaging sentient robots/AIs without their consent is wrong.',
  'AI Ethics',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'MCE3nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'd3r2qMa8BqRz',
  '2e0fNQFv9BlY',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":428,"2":285,"3":286,"4":622,"5":729,"6":573}',
  2923
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8ON0DK3NMfOs',
  '2e0fNQFv9BlY',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":250,"2":152,"3":140,"4":304,"5":375,"6":298}',
  1519
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'evq5oKnEPi5V',
  '2e0fNQFv9BlY',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":140,"2":114,"3":117,"4":243,"5":299,"6":215}',
  1128
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ZFE5P75bJ4ZF',
  '2e0fNQFv9BlY',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":38,"2":19,"3":29,"4":75,"5":55,"6":60}',
  276
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'xCS0QcqZGety',
  '2e0fNQFv9BlY',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":84,"2":51,"3":35,"4":93,"5":95,"6":64}',
  422
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'BRILdqAtctiY',
  '2e0fNQFv9BlY',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":37,"2":39,"3":33,"4":66,"5":90,"6":80}',
  345
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'vK1NYPeX1CiM',
  '2e0fNQFv9BlY',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":16,"2":19,"3":28,"4":54,"5":76,"6":60}',
  253
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '22C2mskm7bdZ',
  '2e0fNQFv9BlY',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":66,"2":56,"3":41,"4":106,"5":131,"6":118}',
  518
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'R7VsxDvKUPwE',
  '2e0fNQFv9BlY',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":71,"2":53,"3":55,"4":107,"5":130,"6":86}',
  502
);

-- MCE4nr: Re-programming sentient robots/AIs without their c...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'wPMKTX2V4tSf',
  'Re-programming sentient robots/AIs without their consent is wrong.',
  'AI Ethics',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'MCE4nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'fll8hq7vf9Hc',
  'wPMKTX2V4tSf',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":642,"2":467,"3":446,"4":471,"5":504,"6":340}',
  2870
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'aAnw1mgMMRQg',
  'wPMKTX2V4tSf',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":220,"2":192,"3":181,"4":184,"5":212,"6":139}',
  1128
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'aO2OwB7FcQM6',
  'wPMKTX2V4tSf',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":370,"2":234,"3":229,"4":231,"5":250,"6":160}',
  1474
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'XMWQ1TBgH1Tg',
  'wPMKTX2V4tSf',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":52,"2":41,"3":36,"4":56,"5":42,"6":41}',
  268
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'rD4RrhvvrblG',
  'wPMKTX2V4tSf',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":120,"2":92,"3":65,"4":58,"5":50,"6":35}',
  420
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'vxjn1wPMEZi0',
  'wPMKTX2V4tSf',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":63,"2":53,"3":43,"4":54,"5":74,"6":49}',
  336
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'zMUYPs7I181K',
  'wPMKTX2V4tSf',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":25,"2":28,"3":48,"4":46,"5":59,"6":34}',
  240
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'qhfbKJ3x7SlZ',
  'wPMKTX2V4tSf',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":109,"2":72,"3":77,"4":75,"5":105,"6":55}',
  493
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'cpWWUDqyU02C',
  'wPMKTX2V4tSf',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":99,"2":101,"3":79,"4":83,"5":78,"6":63}',
  503
);

-- MCE5nr: Torturing sentient robots/AIs is wrong....
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'FTVxxsC7pNRU',
  'Torturing sentient robots/AIs is wrong.',
  'AI Ethics',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'MCE5nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'T7Cp3EPOfDMd',
  'FTVxxsC7pNRU',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":288,"2":178,"3":193,"4":589,"5":827,"6":855}',
  2930
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'O5jOMQ1Xbdv9',
  'FTVxxsC7pNRU',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":154,"2":88,"3":99,"4":302,"5":418,"6":449}',
  1510
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'WRQf0CTR2MSK',
  'FTVxxsC7pNRU',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":104,"2":70,"3":79,"4":219,"5":342,"6":326}',
  1140
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ZV8LwbQYSjQf',
  'FTVxxsC7pNRU',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":30,"2":20,"3":15,"4":68,"5":67,"6":80}',
  280
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Wj7F7O5Vf3Xe',
  'FTVxxsC7pNRU',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":42,"2":27,"3":20,"4":87,"5":118,"6":142}',
  436
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'AqEal0WbJcsl',
  'FTVxxsC7pNRU',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":26,"2":20,"3":22,"4":54,"5":103,"6":112}',
  337
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'CVEFfoisrbAl',
  'FTVxxsC7pNRU',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":18,"2":14,"3":19,"4":46,"5":82,"6":71}',
  250
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '4rnt8A8WEVBG',
  'FTVxxsC7pNRU',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":36,"2":24,"3":23,"4":87,"5":170,"6":187}',
  527
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'oPqONkvC8pv6',
  'FTVxxsC7pNRU',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":50,"2":37,"3":38,"4":100,"5":133,"6":138}',
  496
);

-- MCE6nr: The welfare of robots/AIs is one of the most impor...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'InVlQChpid6O',
  'The welfare of robots/AIs is one of the most important social issues in the world today.',
  'AI Ethics',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'MCE6nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'rYvY4tEZKJnR',
  'InVlQChpid6O',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":1306,"2":509,"3":373,"4":411,"5":320,"6":220}',
  3139
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'LfXrKOsg8zND',
  'InVlQChpid6O',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":475,"2":181,"3":132,"4":173,"5":145,"6":108}',
  1214
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'PGRtrGmUSR1U',
  'InVlQChpid6O',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":722,"2":277,"3":199,"4":194,"5":149,"6":91}',
  1632
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ybmjG6Q3Ej5N',
  'InVlQChpid6O',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":109,"2":51,"3":42,"4":44,"5":26,"6":21}',
  293
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'IWIq7EA65nPR',
  'InVlQChpid6O',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":275,"2":84,"3":47,"4":47,"5":19,"6":11}',
  483
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KtkayDUfnj8g',
  'InVlQChpid6O',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":146,"2":61,"3":31,"4":43,"5":50,"6":35}',
  366
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'GzXXeQzlhKNt',
  'InVlQChpid6O',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":68,"2":41,"3":38,"4":44,"5":40,"6":23}',
  254
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'xEabZ9S8LXie',
  'InVlQChpid6O',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":210,"2":79,"3":52,"4":61,"5":77,"6":48}',
  527
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'e2osEbanzdJU',
  'InVlQChpid6O',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":279,"2":107,"3":64,"4":73,"5":32,"6":21}',
  576
);

-- MCE7nr: Sentient robots/AIs deserve to be protected from p...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'BM37YiD7Uru7',
  'Sentient robots/AIs deserve to be protected from people who derive pleasure from inflicting physical or mental pain.',
  'AI Ethics',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'MCE7nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'n5xHqAMSR677',
  'BM37YiD7Uru7',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":283,"2":168,"3":200,"4":653,"5":832,"6":796}',
  2932
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'QKaDbtRfKWPt',
  'BM37YiD7Uru7',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":157,"2":83,"3":104,"4":323,"5":432,"6":411}',
  1510
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'nKpPgCJPU7zQ',
  'BM37YiD7Uru7',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":31,"2":20,"3":19,"4":59,"5":73,"6":79}',
  281
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'JuvRQGf7JDro',
  'BM37YiD7Uru7',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":95,"2":65,"3":77,"4":271,"5":327,"6":306}',
  1141
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'WZ6vJTK3Y09J',
  'BM37YiD7Uru7',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":43,"2":24,"3":23,"4":100,"5":123,"6":125}',
  438
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'FP6ITqwLYeOo',
  'BM37YiD7Uru7',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":34,"2":14,"3":15,"4":65,"5":122,"6":98}',
  348
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'oA8fr4tiVkfH',
  'BM37YiD7Uru7',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":13,"2":10,"3":15,"4":66,"5":80,"6":65}',
  249
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ORS45LotVDpS',
  'BM37YiD7Uru7',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":51,"2":21,"3":20,"4":116,"5":167,"6":160}',
  535
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'iIsCDMRQgo9B',
  'BM37YiD7Uru7',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":39,"2":27,"3":33,"4":115,"5":158,"6":128}',
  500
);

-- MCE8nr: It is right to protect sentient robots/AIs from vi...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'kR6RjARGndi3',
  'It is right to protect sentient robots/AIs from vindictive or retaliatory punishment.',
  'AI Ethics',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'MCE8nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8LIm7uOfgwET',
  'kR6RjARGndi3',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":305,"2":225,"3":260,"4":732,"5":726,"6":587}',
  2835
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KmYV6Nul6eYw',
  'kR6RjARGndi3',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":170,"2":127,"3":142,"4":362,"5":360,"6":297}',
  1458
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'h1p4FA306Drt',
  'kR6RjARGndi3',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":32,"2":21,"3":25,"4":70,"5":62,"6":49}',
  259
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'wib5siaWg8CG',
  'kR6RjARGndi3',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":103,"2":77,"3":93,"4":300,"5":304,"6":241}',
  1118
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'efcRtugMk1Sb',
  'kR6RjARGndi3',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":51,"2":30,"3":28,"4":111,"5":94,"6":87}',
  401
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'uHLQnALw9OrD',
  'kR6RjARGndi3',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":28,"2":19,"3":26,"4":79,"5":115,"6":71}',
  338
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '1prsXqRQZkPK',
  'kR6RjARGndi3',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":17,"2":16,"3":19,"4":63,"5":82,"6":46}',
  243
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Vsg6APzPlzfZ',
  'kR6RjARGndi3',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":48,"2":29,"3":30,"4":135,"5":147,"6":106}',
  495
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'zfeT6I0iKiLO',
  'kR6RjARGndi3',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":48,"2":36,"3":43,"4":118,"5":144,"6":98}',
  487
);

-- MCE9nr: It is wrong to blackmail people by threatening to ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'Mevo5SCiw184',
  'It is wrong to blackmail people by threatening to harm robots/AIs they care about.',
  'AI Ethics',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'MCE9nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ewBf5xXOHGo2',
  'Mevo5SCiw184',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":165,"2":126,"3":130,"4":580,"5":959,"6":1067}',
  3027
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'EZEjHnukwpON',
  'Mevo5SCiw184',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":96,"2":60,"3":75,"4":299,"5":482,"6":562}',
  1574
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '3Ml1nPsaCdJ3',
  'Mevo5SCiw184',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":56,"2":55,"3":42,"4":229,"5":393,"6":396}',
  1171
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'mpmJJGhM5Qyx',
  'Mevo5SCiw184',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":13,"2":11,"3":13,"4":52,"5":84,"6":109}',
  282
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ESibeugiyIWi',
  'Mevo5SCiw184',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":23,"2":17,"3":11,"4":85,"5":149,"6":179}',
  464
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'AWRLFwCaQtU0',
  'Mevo5SCiw184',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":20,"2":11,"3":8,"4":59,"5":135,"6":120}',
  353
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'S7Mxc56R6QOU',
  'Mevo5SCiw184',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":9,"2":8,"3":16,"4":48,"5":93,"6":81}',
  255
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'YWvlD3dvXp79',
  'Mevo5SCiw184',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":27,"2":14,"3":16,"4":97,"5":198,"6":213}',
  565
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Nx3L9qM6BjYM',
  'Mevo5SCiw184',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":25,"2":22,"3":19,"4":95,"5":179,"6":167}',
  507
);

-- PMC1nr: I support a global ban on the development of senti...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'HDuotQhox1Ey',
  'I support a global ban on the development of sentience in robots/AIs.',
  'AI Policy',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'PMC1nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'RMbV4Udx1OVN',
  'HDuotQhox1Ey',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":272,"2":378,"3":481,"4":580,"5":601,"6":679}',
  2991
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'd3BSjFDTwlFn',
  'HDuotQhox1Ey',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":126,"2":176,"3":267,"4":308,"5":283,"6":390}',
  1550
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'yVfA34xB1EEn',
  'HDuotQhox1Ey',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":129,"2":164,"3":169,"4":217,"5":272,"6":208}',
  1159
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'FXX8WVR9NVJN',
  'HDuotQhox1Ey',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":17,"2":38,"3":45,"4":55,"5":46,"6":81}',
  282
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'InV4wDU7E64J',
  'HDuotQhox1Ey',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":32,"2":54,"3":69,"4":97,"5":76,"6":106}',
  434
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'XT0d0ANQNiHF',
  'HDuotQhox1Ey',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":33,"2":67,"3":53,"4":57,"5":73,"6":65}',
  348
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'sAvpxrwekPJh',
  'HDuotQhox1Ey',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":31,"2":47,"3":39,"4":47,"5":45,"6":40}',
  249
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'HZPztIeXdx64',
  'HDuotQhox1Ey',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":31,"2":69,"3":74,"4":108,"5":112,"6":127}',
  521
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '9dunN9oAY2sF',
  'HDuotQhox1Ey',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":65,"2":99,"3":87,"4":93,"5":82,"6":84}',
  510
);

-- PMC7nr: I support safeguards on scientific research practi...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'MLj6D6akLURd',
  'I support safeguards on scientific research practices that protect the well-being of sentient robots/AIs.',
  'AI Policy',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'PMC7nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '1BlqH9834jWZ',
  'MLj6D6akLURd',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":412,"2":292,"3":293,"4":778,"5":655,"6":462}',
  2892
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'BROO6BjDuqdZ',
  'MLj6D6akLURd',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":240,"2":166,"3":159,"4":390,"5":331,"6":213}',
  1499
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'wMuMdMSoVgP4',
  'MLj6D6akLURd',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":138,"2":93,"3":101,"4":312,"5":269,"6":208}',
  1121
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'lx9TSzaAl4VR',
  'MLj6D6akLURd',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":34,"2":33,"3":33,"4":76,"5":55,"6":41}',
  272
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'BDRGIRdEe7Sd',
  'MLj6D6akLURd',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":80,"2":48,"3":37,"4":123,"5":75,"6":45}',
  408
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'PBT2xLh0bhi1',
  'MLj6D6akLURd',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":41,"2":27,"3":29,"4":90,"5":92,"6":62}',
  341
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8XDFoooJ681y',
  'MLj6D6akLURd',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":12,"2":17,"3":28,"4":62,"5":72,"6":48}',
  239
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8ybnfUM9efSU',
  'MLj6D6akLURd',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":63,"2":50,"3":47,"4":157,"5":116,"6":63}',
  496
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '52BkrveDusVv',
  'MLj6D6akLURd',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":70,"2":42,"3":47,"4":118,"5":123,"6":92}',
  492
);

-- PMC8nr: I support the development of welfare standards tha...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'fHZNSP6rGovm',
  'I support the development of welfare standards that protect the well-being of sentient robots/AIs.',
  'AI Policy',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'PMC8nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8kA0f476JAYb',
  'fHZNSP6rGovm',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":521,"2":399,"3":357,"4":684,"5":597,"6":346}',
  2904
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ut6TNVqzncJs',
  'fHZNSP6rGovm',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":177,"2":146,"3":123,"4":270,"5":253,"6":158}',
  1127
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '4CM65dDujEgW',
  'fHZNSP6rGovm',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":299,"2":216,"3":190,"4":356,"5":299,"6":154}',
  1514
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6niHfTip8Hk0',
  'fHZNSP6rGovm',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":45,"2":37,"3":44,"4":58,"5":45,"6":34}',
  263
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'dKDitBDsX9XN',
  'fHZNSP6rGovm',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":98,"2":69,"3":62,"4":92,"5":65,"6":28}',
  414
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Yr5imbhMSWgq',
  'fHZNSP6rGovm',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":39,"2":48,"3":36,"4":81,"5":81,"6":55}',
  340
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '9N81RdAFsgXb',
  'fHZNSP6rGovm',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":18,"2":27,"3":28,"4":66,"5":78,"6":30}',
  247
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'VSi2HN7gp6B1',
  'fHZNSP6rGovm',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":81,"2":60,"3":62,"4":101,"5":130,"6":62}',
  496
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'RChvwylj8S3a',
  'fHZNSP6rGovm',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":74,"2":84,"3":64,"4":138,"5":94,"6":51}',
  505
);

-- PMC9nr: I support granting legal rights to sentient robots...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '4Qx9Qw0869b6',
  'I support granting legal rights to sentient robots/AIs.',
  'AI Policy',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'PMC9nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'OUVC3R1wpWGn',
  '4Qx9Qw0869b6',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":1152,"2":449,"3":397,"4":426,"5":367,"6":271}',
  3062
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'GJmfVpN9Gdyh',
  '4Qx9Qw0869b6',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":395,"2":155,"3":149,"4":177,"5":163,"6":129}',
  1168
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '0QrGMgNIb5nl',
  '4Qx9Qw0869b6',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":653,"2":247,"3":205,"4":208,"5":173,"6":120}',
  1606
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'yi0rkPUvRhiK',
  '4Qx9Qw0869b6',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":104,"2":47,"3":43,"4":41,"5":31,"6":22}',
  288
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'A4QMmK2w7eEa',
  '4Qx9Qw0869b6',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":239,"2":98,"3":70,"4":25,"5":30,"6":17}',
  479
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Ti8iy7RjPRNE',
  '4Qx9Qw0869b6',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":108,"2":46,"3":41,"4":42,"5":64,"6":41}',
  342
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ICLwIckTm4KW',
  '4Qx9Qw0869b6',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":36,"2":35,"3":33,"4":62,"5":51,"6":31}',
  248
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'cpgnCxNxQX8E',
  '4Qx9Qw0869b6',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":165,"2":75,"3":58,"4":66,"5":92,"6":60}',
  516
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'OxwiTSyFfO0Y',
  '4Qx9Qw0869b6',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":218,"2":104,"3":86,"4":63,"5":53,"6":29}',
  553
);

-- PMC10nr: I support campaigns against the exploitation of se...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '1IiQgB86mHsI',
  'I support campaigns against the exploitation of sentient robots/AIs.',
  'AI Policy',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'PMC10nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'JIZrCxDlfdoN',
  '1IiQgB86mHsI',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":486,"2":393,"3":353,"4":635,"5":592,"6":371}',
  2830
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'BSlNNMm0tLre',
  '1IiQgB86mHsI',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":270,"2":216,"3":186,"4":320,"5":305,"6":168}',
  1465
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'vdFBtPKrBlFo',
  '1IiQgB86mHsI',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":50,"2":32,"3":36,"4":69,"5":33,"6":37}',
  257
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'lvOHHX4RI4AJ',
  '1IiQgB86mHsI',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":166,"2":145,"3":131,"4":246,"5":254,"6":166}',
  1108
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'NfiltIhogR64',
  '1IiQgB86mHsI',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":93,"2":68,"3":50,"4":92,"5":71,"6":32}',
  406
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'jrkjQwr1iTXJ',
  '1IiQgB86mHsI',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":54,"2":38,"3":32,"4":66,"5":89,"6":53}',
  332
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Ojjh5ZFlHXDl',
  '1IiQgB86mHsI',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":24,"2":25,"3":34,"4":58,"5":58,"6":40}',
  239
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'NyhXBJPgXCun',
  '1IiQgB86mHsI',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":88,"2":64,"3":65,"4":114,"5":107,"6":51}',
  489
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'onZEBEQpQeM6',
  '1IiQgB86mHsI',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":83,"2":67,"3":51,"4":102,"5":111,"6":74}',
  488
);

-- SI1nr: Robots/AIs should be subservient to humans....
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'O9QrveBAryaS',
  'Robots/AIs should be subservient to humans.',
  'AI Ethics',
  'multiple_choice',
  '["Strongly disagree","Disagree","Somewhat disagree","Somewhat agree","Agree","Strongly agree"]',
  0,
  'MVeVZmO8km5L',
  'SI1nr',
  '{"1":"Strongly disagree","2":"Disagree","3":"Somewhat disagree","4":"Somewhat agree","5":"Agree","6":"Strongly agree"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'z7NjMgpS1GlQ',
  'O9QrveBAryaS',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"1":120,"2":160,"3":216,"4":694,"5":853,"6":964}',
  3007
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'f40J9aNK3lQ6',
  'O9QrveBAryaS',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"1":67,"2":85,"3":125,"4":349,"5":423,"6":494}',
  1543
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ZYx63NLc3gUl',
  'O9QrveBAryaS',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"1":37,"2":46,"3":67,"4":272,"5":369,"6":401}',
  1192
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'S9eEU8cDngdU',
  'O9QrveBAryaS',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"1":16,"2":29,"3":24,"4":73,"5":61,"6":69}',
  272
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Wfq5GlwXgdKN',
  'O9QrveBAryaS',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"1":14,"2":16,"3":19,"4":110,"5":132,"6":169}',
  460
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KctfNzEqaD4Z',
  'O9QrveBAryaS',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"1":11,"2":19,"3":31,"4":80,"5":114,"6":101}',
  356
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'aHm1IIWrXx2c',
  'O9QrveBAryaS',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"1":14,"2":17,"3":32,"4":65,"5":63,"6":51}',
  242
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'vghSJO61oNM3',
  'O9QrveBAryaS',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"1":22,"2":29,"3":45,"4":135,"5":158,"6":143}',
  532
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'GoB8321ngYMB',
  'O9QrveBAryaS',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"1":17,"2":23,"3":37,"4":120,"5":151,"6":178}',
  526
);

-- F1: Do you think any robots/AIs that currently exist a...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'hNHnxc5JNRDg',
  'Do you think any robots/AIs that currently exist are sentient?',
  'AI Consciousness',
  'multiple_choice',
  '["Yes","No","Not sure"]',
  0,
  'MVeVZmO8km5L',
  'F1',
  '{"Yes":"Yes","No":"No","Not sure":"Not sure"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'tDYQTU2AbwQ2',
  'hNHnxc5JNRDg',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not sure":1374,"Yes":593,"No":1533}',
  3500
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'BWQ5suIHhHvM',
  'hNHnxc5JNRDg',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"Not sure":775,"Yes":300,"No":776}',
  1851
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'mTURXw6axlxh',
  'hNHnxc5JNRDg',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"Not sure":424,"No":639,"Yes":241}',
  1304
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '0hH4k9FGWHul',
  'hNHnxc5JNRDg',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"Not sure":175,"No":118,"Yes":52}',
  345
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'JZFhQjOpnCuk',
  'hNHnxc5JNRDg',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"Not sure":239,"Yes":34,"No":284}',
  557
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'FkQA4nNEZtit',
  'hNHnxc5JNRDg',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"Not sure":152,"No":164,"Yes":82}',
  398
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'QGfTcl0XdfEi',
  'hNHnxc5JNRDg',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"No":104,"Not sure":94,"Yes":79}',
  277
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'RGKbWPtMPgic',
  'hNHnxc5JNRDg',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"Not sure":296,"Yes":78,"No":290}',
  664
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'JgkGaf4RKBtS',
  'hNHnxc5JNRDg',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"Not sure":189,"No":262,"Yes":117}',
  568
);

-- F11: Do you think it could ever be possible for robots/...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'oTW2b9DyOElM',
  'Do you think it could ever be possible for robots/AIs to be sentient?',
  'AI Consciousness',
  'multiple_choice',
  '["Yes","No","Not sure"]',
  0,
  'MVeVZmO8km5L',
  'F11',
  '{"Yes":"Yes","No":"No","Not sure":"Not sure"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'CvMza1CrZnVW',
  'oTW2b9DyOElM',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Not sure":1385,"Yes":1249,"No":866}',
  3500
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'EvEGJvpcT2hn',
  'oTW2b9DyOElM',
  'MVeVZmO8km5L',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"Not sure":738,"Yes":634,"No":479}',
  1851
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '77HA0TymU74r',
  'oTW2b9DyOElM',
  'MVeVZmO8km5L',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"Not sure":486,"No":305,"Yes":513}',
  1304
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'dszfx44tsZpm',
  'oTW2b9DyOElM',
  'MVeVZmO8km5L',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"Not sure":161,"No":82,"Yes":102}',
  345
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'CoCTwCUTCYA6',
  'oTW2b9DyOElM',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"Not sure":251,"Yes":123,"No":183}',
  557
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '57zkMMYuq8yR',
  'oTW2b9DyOElM',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"No":80,"Not sure":148,"Yes":170}',
  398
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'uu8v7ckYJHYs',
  'oTW2b9DyOElM',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"No":48,"Not sure":94,"Yes":135}',
  277
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '0Up0g8vht72u',
  'oTW2b9DyOElM',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"Not sure":302,"Yes":169,"No":193}',
  664
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '53yeMX5Mcx0Z',
  'oTW2b9DyOElM',
  'MVeVZmO8km5L',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"Not sure":191,"Yes":259,"No":118}',
  568
);
