-- General Social Survey Import
-- Generated: 2025-12-30T22:39:36.817Z
-- Source: NORC General Social Survey 1972-2024

-- Benchmark source
INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  'odK0oYEfdwRE',
  'General Social Survey',
  'GSS',
  'https://gss.norc.org/',
  75699,
  '1972-2024'
);

-- abany: Please tell me whether or not you think it should ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'lzTswbsW8B0q',
  'Please tell me whether or not you think it should be possible for a pregnant woman to obtain a legal abortion if the woman wants it for any reason.',
  'Ethics',
  'multiple_choice',
  '["no","yes"]',
  0,
  'odK0oYEfdwRE',
  'abany',
  '{"no":"no","yes":"yes"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'UjCdP4C4o8Jc',
  'lzTswbsW8B0q',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"yes":17933,"no":23465}',
  41398
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'b4cTZ88BrFur',
  'lzTswbsW8B0q',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"yes":2078,"no":5625}',
  7703
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'nQheiVi0VQpH',
  'lzTswbsW8B0q',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"yes":5900,"no":4141}',
  10041
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'OjU9jpfNs72d',
  'lzTswbsW8B0q',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"yes":9924,"no":13641}',
  23565
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'SVvOEF7aSmeG',
  'lzTswbsW8B0q',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"yes":5106,"no":8267}',
  13373
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ST7MVO114bKv',
  'lzTswbsW8B0q',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"yes":5776,"no":6989}',
  12765
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'rN2nRbyrdNLJ',
  'lzTswbsW8B0q',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"yes":6810,"no":7908}',
  14718
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '43YCHP4BoNFd',
  'lzTswbsW8B0q',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"yes":9862,"no":13315}',
  23177
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'hzChhEL4R2y5',
  'lzTswbsW8B0q',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"no":10131,"yes":8048}',
  18179
);

-- cappun: Do you favor or oppose the death penalty for perso...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'dHaIkEfJtuaw',
  'Do you favor or oppose the death penalty for persons convicted of murder?',
  'Ethics',
  'multiple_choice',
  '["favor","oppose"]',
  0,
  'odK0oYEfdwRE',
  'cappun',
  '{"favor":"favor","oppose":"oppose"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '04GaLVJgcW3h',
  'dHaIkEfJtuaw',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"favor":43424,"oppose":19490}',
  62914
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'MbZM4OFW3kHl',
  'dHaIkEfJtuaw',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"favor":26167,"oppose":9483}',
  35650
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'TCe9AcbajgPF',
  'dHaIkEfJtuaw',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"favor":9493,"oppose":6110}',
  15603
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'jVbeAbGpEOiW',
  'dHaIkEfJtuaw',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"favor":7679,"oppose":3853}',
  11532
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'modDHbDCDDhO',
  'dHaIkEfJtuaw',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"favor":12842,"oppose":6285}',
  19127
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '03DInTiKJkHT',
  'dHaIkEfJtuaw',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"favor":15668,"oppose":6567}',
  22235
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8mwz1wreyKry',
  'dHaIkEfJtuaw',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"favor":14248,"oppose":6236}',
  20484
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'RB1NjLV4EOzj',
  'dHaIkEfJtuaw',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"favor":20806,"oppose":7367}',
  28173
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'S87XMm4i29UL',
  'dHaIkEfJtuaw',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"favor":22548,"oppose":12066}',
  34614
);

-- premarsx: There has been a lot of discussion about the way m...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'DBn7yrtUTJuG',
  'There has been a lot of discussion about the way morals and attitudes about sex are changing in this country. If a man and woman have sex relations before marriage, do you think it is always wrong, almost always wrong, wrong only sometimes, or not wrong at all?',
  'Ethics',
  'multiple_choice',
  '["almost always wrong","always wrong","not wrong at all","wrong only sometimes"]',
  0,
  'odK0oYEfdwRE',
  'premarsx',
  '{"almost always wrong":"almost always wrong","always wrong":"always wrong","not wrong at all":"not wrong at all","wrong only sometimes":"wrong only sometimes"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'mjLgyYM0G5Gm',
  'DBn7yrtUTJuG',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"not wrong at all":21806,"always wrong":11290,"wrong only sometimes":8707,"almost always wrong":3894}',
  45697
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '7eDFXmIGdYBh',
  'DBn7yrtUTJuG',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"not wrong at all":6076,"always wrong":1956,"wrong only sometimes":2301,"almost always wrong":798}',
  11131
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Kqw5ZpFxCTVg',
  'DBn7yrtUTJuG',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"always wrong":3192,"not wrong at all":3145,"wrong only sometimes":1501,"almost always wrong":875}',
  8713
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8L1q1uRGMqJn',
  'DBn7yrtUTJuG',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"always wrong":6114,"wrong only sometimes":4892,"not wrong at all":12536,"almost always wrong":2208}',
  25750
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '3oDutBOu57s9',
  'DBn7yrtUTJuG',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"not wrong at all":7844,"always wrong":2186,"wrong only sometimes":3016,"almost always wrong":902}',
  13948
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'XUsxbqvO4cGL',
  'DBn7yrtUTJuG',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"always wrong":5108,"wrong only sometimes":2661,"almost always wrong":1563,"not wrong at all":5455}',
  14787
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Fw1YEc2LDvuz',
  'DBn7yrtUTJuG',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"always wrong":3758,"not wrong at all":8147,"almost always wrong":1343,"wrong only sometimes":2909}',
  16157
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'PqFnyL2g9jjs',
  'DBn7yrtUTJuG',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"not wrong at all":11086,"always wrong":7116,"wrong only sometimes":4792,"almost always wrong":2388}',
  25382
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '1GJMJViLp1LA',
  'DBn7yrtUTJuG',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"always wrong":4159,"wrong only sometimes":3904,"not wrong at all":10672,"almost always wrong":1499}',
  20234
);

-- homosex: What about sexual relations between two adults of ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'eH4aluda0upg',
  'What about sexual relations between two adults of the same sex - do you think it is always wrong, almost always wrong, wrong only sometimes, or not wrong at all?',
  'Ethics',
  'multiple_choice',
  '["almost always wrong","always wrong","not wrong at all","other","wrong only sometimes"]',
  0,
  'odK0oYEfdwRE',
  'homosex',
  '{"almost always wrong":"almost always wrong","always wrong":"always wrong","not wrong at all":"not wrong at all","other":"other","wrong only sometimes":"wrong only sometimes"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'nxuRyw9VSRGh',
  'eH4aluda0upg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"always wrong":25544,"not wrong at all":14041,"almost always wrong":2037,"wrong only sometimes":3022,"other":82}',
  44726
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'EYzYc3nZ0W3C',
  'eH4aluda0upg',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"always wrong":6806,"almost always wrong":306,"other":12,"not wrong at all":1162,"wrong only sometimes":350}',
  8636
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'iu6zsbNZueT0',
  'eH4aluda0upg',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"always wrong":14724,"almost always wrong":1180,"wrong only sometimes":1584,"not wrong at all":7480,"other":52}',
  25020
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'M6x3ybLcnNlw',
  'eH4aluda0upg',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"not wrong at all":5380,"always wrong":3939,"almost always wrong":543,"wrong only sometimes":1076,"other":18}',
  10956
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'XTXt67tnQxJh',
  'eH4aluda0upg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"always wrong":8797,"almost always wrong":727,"wrong only sometimes":1081,"not wrong at all":5018,"other":35}',
  15658
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'g8peozhdzclr',
  'eH4aluda0upg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"always wrong":6721,"not wrong at all":5127,"wrong only sometimes":1077,"almost always wrong":656,"other":30}',
  13611
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'AeByYavZPt76',
  'eH4aluda0upg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"always wrong":9644,"almost always wrong":617,"wrong only sometimes":812,"not wrong at all":3640,"other":16}',
  14729
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'GgMzvZdhmBme',
  'eH4aluda0upg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"always wrong":11686,"not wrong at all":5899,"almost always wrong":959,"wrong only sometimes":1399,"other":36}',
  19979
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ghAwSmvQ2lJh',
  'eH4aluda0upg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"always wrong":13840,"almost always wrong":1070,"wrong only sometimes":1616,"not wrong at all":8101,"other":46}',
  24673
);

-- grass: Do you think the use of marijuana should be made l...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '9xD22wf7D8p4',
  'Do you think the use of marijuana should be made legal or not?',
  'Ethics',
  'multiple_choice',
  '["should be legal","should not be legal"]',
  0,
  'odK0oYEfdwRE',
  'grass',
  '{"should be legal":"should be legal","should not be legal":"should not be legal"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'C03BD7I0eZvf',
  '9xD22wf7D8p4',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"should not be legal":26270,"should be legal":13266}',
  39536
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'u2MXj44B3WaD',
  '9xD22wf7D8p4',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"should not be legal":6414,"should be legal":1765}',
  8179
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'VZA1V6wIFlWD',
  '9xD22wf7D8p4',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"should not be legal":14725,"should be legal":7799}',
  22524
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'D75VLTOAU6hR',
  '9xD22wf7D8p4',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"should be legal":3684,"should not be legal":5066}',
  8750
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'scyyPYAD30ES',
  '9xD22wf7D8p4',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"should not be legal":9381,"should be legal":4789}',
  14170
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'khGtlIeb54NY',
  '9xD22wf7D8p4',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"should not be legal":7358,"should be legal":5046}',
  12404
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'c88TkRwFDB29',
  '9xD22wf7D8p4',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"should not be legal":9231,"should be legal":3301}',
  12532
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'enrFoPDxvoIO',
  '9xD22wf7D8p4',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"should not be legal":10713,"should be legal":6708}',
  17421
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'FfEgy6ZLJL8F',
  '9xD22wf7D8p4',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"should not be legal":15557,"should be legal":6556}',
  22113
);

-- letdie1: When a person has a disease that cannot be cured, ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '0SHeshdseghj',
  'When a person has a disease that cannot be cured, do you think doctors should be allowed by law to end the patient''s life by some painless means if the patient and his family request it?',
  'Ethics',
  'multiple_choice',
  '["no","yes"]',
  0,
  'odK0oYEfdwRE',
  'letdie1',
  '{"no":"no","yes":"yes"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '0JnVXduP8DBQ',
  '0SHeshdseghj',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"yes":25087,"no":11508}',
  36595
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Q3PUYT9psUjm',
  '0SHeshdseghj',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"yes":3817,"no":2804}',
  6621
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'jIJSJLwZwLcR',
  '0SHeshdseghj',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"yes":6482,"no":2360}',
  8842
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'yyw4Rk2ejXMA',
  '0SHeshdseghj',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"yes":14749,"no":6312}',
  21061
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'g54wj5ZD5WnC',
  '0SHeshdseghj',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"yes":7416,"no":4314}',
  11730
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6sKd0Hg7Uzjz',
  '0SHeshdseghj',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"yes":8254,"no":2935}',
  11189
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'YkzpM2qqED6z',
  '0SHeshdseghj',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"yes":9098,"no":4040}',
  13138
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'V3aTxfeiU7nO',
  '0SHeshdseghj',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"yes":13339,"no":7178}',
  20517
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'eToLIa3bqM7H',
  '0SHeshdseghj',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"yes":11714,"no":4318}',
  16032
);

-- suicide1: Do you think a person has the right to end his or ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '8TXki7xsOcCF',
  'Do you think a person has the right to end his or her own life if this person has an incurable disease?',
  'Ethics',
  'multiple_choice',
  '["no","yes"]',
  0,
  'odK0oYEfdwRE',
  'suicide1',
  '{"no":"no","yes":"yes"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'FKOTo0AXWwTL',
  '8TXki7xsOcCF',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"no":15889,"yes":21703}',
  37592
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Ngqy5QRPfEvs',
  '8TXki7xsOcCF',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"no":4147,"yes":2664}',
  6811
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'iUmg9tW6EvlK',
  '8TXki7xsOcCF',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"yes":6438,"no":2685}',
  9123
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Sz9LB3Ahayqt',
  '8TXki7xsOcCF',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"yes":12571,"no":9022}',
  21593
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '1sZDCcVUfD8H',
  '8TXki7xsOcCF',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"no":5989,"yes":6114}',
  12103
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'LHL2c0i2XGEY',
  '8TXki7xsOcCF',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"yes":7147,"no":4325}',
  11472
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'wnxWpXslmR9U',
  '8TXki7xsOcCF',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"yes":8176,"no":5312}',
  13488
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Pl9RQuEtG4Lk',
  '8TXki7xsOcCF',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"no":9651,"yes":11363}',
  21014
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'yNpDcd0N0vjh',
  '8TXki7xsOcCF',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"no":6225,"yes":10324}',
  16549
);

-- polviews: We hear a lot of talk these days about liberals an...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'PZ5s0TcIaSL3',
  'We hear a lot of talk these days about liberals and conservatives. Where would you place yourself on this scale?',
  'Politics',
  'multiple_choice',
  '["conservative","extremely conservative","extremely liberal","liberal","moderate, middle of the road","slightly conservative","slightly liberal"]',
  0,
  'odK0oYEfdwRE',
  'polviews',
  '{"conservative":"conservative","extremely conservative":"extremely conservative","extremely liberal":"extremely liberal","liberal":"liberal","moderate, middle of the road":"moderate, middle of the road","slightly conservative":"slightly conservative","slightly liberal":"slightly liberal"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'PVtd2Xrf2Db1',
  'PZ5s0TcIaSL3',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"moderate, middle of the road":25140,"slightly conservative":9977,"conservative":9877,"liberal":8044,"extremely conservative":2351,"slightly liberal":8268,"extremely liberal":2221}',
  65878
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'vsFKLT2Jq2Iz',
  'PZ5s0TcIaSL3',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"moderate, middle of the road":15693,"conservative":5649,"extremely conservative":1371,"slightly conservative":5625,"slightly liberal":4316,"liberal":3882,"extremely liberal":1023}',
  37559
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'gvyCCNrYxgud',
  'PZ5s0TcIaSL3',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"slightly conservative":2874,"slightly liberal":2607,"liberal":2959,"moderate, middle of the road":4605,"conservative":2644,"extremely liberal":782,"extremely conservative":445}',
  16916
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'HfA9AP4M8uBp',
  'PZ5s0TcIaSL3',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"conservative":1562,"slightly conservative":1465,"moderate, middle of the road":4795,"liberal":1197,"extremely conservative":527,"slightly liberal":1329,"extremely liberal":414}',
  11289
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'dmhlAnDLCOEV',
  'PZ5s0TcIaSL3',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"moderate, middle of the road":7641,"slightly conservative":2773,"conservative":2157,"slightly liberal":3047,"liberal":2813,"extremely conservative":473,"extremely liberal":781}',
  19685
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'BLMfBsHrZG9A',
  'PZ5s0TcIaSL3',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"slightly conservative":3860,"conservative":3521,"liberal":2806,"moderate, middle of the road":8858,"extremely conservative":774,"slightly liberal":2935,"extremely liberal":783}',
  23537
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'eIzvYaTptE2w',
  'PZ5s0TcIaSL3',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"conservative":3996,"slightly conservative":3223,"liberal":2303,"moderate, middle of the road":8146,"extremely conservative":1045,"slightly liberal":2193,"extremely liberal":614}',
  21520
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Dkk4GiuSvfIj',
  'PZ5s0TcIaSL3',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"moderate, middle of the road":10452,"slightly conservative":4915,"liberal":3478,"conservative":4761,"slightly liberal":3686,"extremely conservative":1151,"extremely liberal":1009}',
  29452
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'MZrBMM717lPE',
  'PZ5s0TcIaSL3',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"conservative":5099,"moderate, middle of the road":14642,"extremely conservative":1191,"liberal":4557,"slightly liberal":4572,"slightly conservative":5053,"extremely liberal":1207}',
  36321
);

-- partyid: Generally speaking, do you usually think of yourse...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'kcV5biAbj7bP',
  'Generally speaking, do you usually think of yourself as a Republican, Democrat, Independent, or what?',
  'Politics',
  'multiple_choice',
  '["independent (neither, no response)","independent, close to democrat","independent, close to republican","not very strong democrat","not very strong republican","other party","strong democrat","strong republican"]',
  0,
  'odK0oYEfdwRE',
  'partyid',
  '{"independent (neither, no response)":"independent (neither, no response)","independent, close to democrat":"independent, close to democrat","independent, close to republican":"independent, close to republican","not very strong democrat":"not very strong democrat","not very strong republican":"not very strong republican","other party":"other party","strong democrat":"strong democrat","strong republican":"strong republican"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '51FIh3yAnHXZ',
  'kcV5biAbj7bP',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"independent, close to democrat":9003,"not very strong democrat":14658,"independent (neither, no response)":12369,"strong democrat":12327,"not very strong republican":11056,"independent, close to republican":6652,"strong republican":7733,"other party":1375}',
  75173
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'CcrEIxrbD8ms',
  'kcV5biAbj7bP',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"independent, close to democrat":2460,"not very strong democrat":3153,"strong republican":2278,"strong democrat":3159,"not very strong republican":2920,"other party":431,"independent (neither, no response)":2122,"independent, close to republican":1776}',
  18299
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'FsKBy8ECuEs7',
  'kcV5biAbj7bP',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"not very strong democrat":3224,"not very strong republican":1570,"strong democrat":3081,"independent, close to republican":931,"strong republican":1051,"independent, close to democrat":1447,"other party":191,"independent (neither, no response)":2865}',
  14360
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '70gThqMnydbG',
  'kcV5biAbj7bP',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"independent (neither, no response)":7340,"strong democrat":6057,"independent, close to democrat":5086,"independent, close to republican":3939,"not very strong democrat":8240,"not very strong republican":6546,"other party":750,"strong republican":4387}',
  42345
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Ag5btZr3JF2u',
  'kcV5biAbj7bP',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"independent, close to democrat":3315,"not very strong democrat":4701,"strong democrat":2524,"independent, close to republican":2190,"independent (neither, no response)":4628,"not very strong republican":3340,"strong republican":1485,"other party":480}',
  22663
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '3J0mfzax7hHu',
  'kcV5biAbj7bP',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"not very strong democrat":4408,"strong democrat":5381,"not very strong republican":3541,"independent, close to republican":1974,"independent, close to democrat":2409,"strong republican":3529,"independent (neither, no response)":2943,"other party":358}',
  24543
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'pKqXvmadUF5l',
  'kcV5biAbj7bP',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"independent (neither, no response)":4512,"strong democrat":4169,"not very strong democrat":5379,"independent, close to democrat":3185,"independent, close to republican":2394,"not very strong republican":4014,"other party":508,"strong republican":2568}',
  26729
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'SbGqG1MiXQZ5',
  'kcV5biAbj7bP',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"independent, close to democrat":4736,"independent (neither, no response)":6940,"not very strong democrat":8907,"strong democrat":7426,"independent, close to republican":3131,"strong republican":4016,"not very strong republican":6048,"other party":608}',
  41812
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'RF2i6kMfQ6Co',
  'kcV5biAbj7bP',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"not very strong democrat":5744,"independent, close to democrat":4257,"not very strong republican":5006,"strong democrat":4886,"independent, close to republican":3512,"independent (neither, no response)":5386,"strong republican":3701,"other party":761}',
  33253
);

-- trust: Generally speaking, would you say that most people...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'K3nYBVgo1wjq',
  'Generally speaking, would you say that most people can be trusted or that you can''t be too careful in dealing with people?',
  'Social Attitudes',
  'multiple_choice',
  '["can''t be too careful","depends","most people can be trusted"]',
  0,
  'odK0oYEfdwRE',
  'trust',
  '{"can''t be too careful":"can''t be too careful","depends":"depends","most people can be trusted":"most people can be trusted"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'gcemcfDIE8Xm',
  'K3nYBVgo1wjq',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"depends":2114,"most people can be trusted":15926,"can''t be too careful":25383}',
  43423
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'TRIMEFtTLtlD',
  'K3nYBVgo1wjq',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"depends":659,"can''t be too careful":3638,"most people can be trusted":5287}',
  9584
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'eQ9fTLlyLaof',
  'K3nYBVgo1wjq',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"most people can be trusted":2087,"can''t be too careful":6618,"depends":354}',
  9059
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'bjl3CO4l4Vzs',
  'K3nYBVgo1wjq',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"can''t be too careful":15052,"most people can be trusted":8520,"depends":1096}',
  24668
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'wtAhSS8o2Ter',
  'K3nYBVgo1wjq',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"depends":659,"can''t be too careful":8893,"most people can be trusted":3998}',
  13550
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'dyLNGh20DzaS',
  'K3nYBVgo1wjq',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"most people can be trusted":5538,"can''t be too careful":7560,"depends":678}',
  13776
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'rmGU9GtaTIwO',
  'K3nYBVgo1wjq',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"can''t be too careful":8648,"most people can be trusted":6229,"depends":730}',
  15607
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'MRNWnn50bnGE',
  'K3nYBVgo1wjq',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"depends":1154,"can''t be too careful":14656,"most people can be trusted":8283}',
  24093
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'HyDNvrf7p4SO',
  'K3nYBVgo1wjq',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"most people can be trusted":7643,"can''t be too careful":10724,"depends":959}',
  19326
);

-- fair: Do you think most people would try to take advanta...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'S0ZMTPF0RuNU',
  'Do you think most people would try to take advantage of you if they got a chance, or would they try to be fair?',
  'Social Attitudes',
  'multiple_choice',
  '["depends","would take advantage of you","would try to be fair"]',
  0,
  'odK0oYEfdwRE',
  'fair',
  '{"depends":"depends","would take advantage of you":"would take advantage of you","would try to be fair":"would try to be fair"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'adud6aV3jsdJ',
  'S0ZMTPF0RuNU',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"would try to be fair":23646,"would take advantage of you":16439,"depends":2944}',
  43029
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'FzwDquNAaqHT',
  'S0ZMTPF0RuNU',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"would try to be fair":6517,"would take advantage of you":2137,"depends":748}',
  9402
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'U7qEgRXA6p25',
  'S0ZMTPF0RuNU',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"would try to be fair":4098,"would take advantage of you":4388,"depends":589}',
  9075
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KI84aRlniWZo',
  'S0ZMTPF0RuNU',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"would take advantage of you":9862,"would try to be fair":12987,"depends":1589}',
  24438
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'rKb64YHFcwJf',
  'S0ZMTPF0RuNU',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"would try to be fair":6238,"would take advantage of you":6355,"depends":923}',
  13516
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KKxCgr5d4MhI',
  'S0ZMTPF0RuNU',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"would try to be fair":8492,"would take advantage of you":4247,"depends":909}',
  13648
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '5i9KIYTgNGxu',
  'S0ZMTPF0RuNU',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"would take advantage of you":5681,"would try to be fair":8642,"depends":1058}',
  15381
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '3zlLvyupXfVh',
  'S0ZMTPF0RuNU',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"would try to be fair":13404,"would take advantage of you":8877,"depends":1701}',
  23982
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'josyGHwLlfVL',
  'S0ZMTPF0RuNU',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"would try to be fair":10240,"would take advantage of you":7561,"depends":1242}',
  19043
);

-- helpful: Would you say that most of the time people try to ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'vHpHJmo0eNrg',
  'Would you say that most of the time people try to be helpful, or that they are mostly just looking out for themselves?',
  'Social Attitudes',
  'multiple_choice',
  '["depends","looking out for themselves","try to be helpful"]',
  0,
  'odK0oYEfdwRE',
  'helpful',
  '{"depends":"depends","looking out for themselves":"looking out for themselves","try to be helpful":"try to be helpful"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '5aKTEDeIFxVq',
  'vHpHJmo0eNrg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"looking out for themselves":19249,"try to be helpful":20831,"depends":3081}',
  43161
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'CSZFOz3NajOb',
  'vHpHJmo0eNrg',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"looking out for themselves":3033,"try to be helpful":5621,"depends":770}',
  9424
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'TqUYrVrrHOKn',
  'vHpHJmo0eNrg',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"try to be helpful":3563,"looking out for themselves":4955,"depends":604}',
  9122
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Yq0ttVf8V8Kf',
  'vHpHJmo0eNrg',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"looking out for themselves":11200,"try to be helpful":11608,"depends":1695}',
  24503
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6gtpD7L6mQpx',
  'vHpHJmo0eNrg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"looking out for themselves":7156,"try to be helpful":5423,"depends":978}',
  13557
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '92okFm2rhue8',
  'vHpHJmo0eNrg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"try to be helpful":7550,"looking out for themselves":5179,"depends":962}',
  13691
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'RTakFKszTV7J',
  'vHpHJmo0eNrg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"looking out for themselves":6734,"try to be helpful":7619,"depends":1078}',
  15431
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KabilOvwuLHx',
  'vHpHJmo0eNrg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"looking out for themselves":10088,"try to be helpful":12227,"depends":1753}',
  24068
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '0GKUjWtWA7XH',
  'vHpHJmo0eNrg',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"try to be helpful":8603,"looking out for themselves":9159,"depends":1327}',
  19089
);

-- god: Which statement comes closest to expressing what y...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'mp1RnsSZtkgy',
  'Which statement comes closest to expressing what you believe about God?',
  'Religion',
  'multiple_choice',
  '["believe sometimes","believe with doubts","don''t believe","higher power","no doubts"]',
  0,
  'odK0oYEfdwRE',
  'god',
  '{"believe sometimes":"believe sometimes","believe with doubts":"believe with doubts","don''t believe":"don''t believe","higher power":"higher power","no doubts":"no doubts"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'scmIZQKNqJ57',
  'mp1RnsSZtkgy',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"no doubts":18569,"believe with doubts":5201,"believe sometimes":1351,"higher power":3566,"don''t believe":1235}',
  29922
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'xRRoTFX1Ny8u',
  'mp1RnsSZtkgy',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"no doubts":4454,"believe sometimes":416,"higher power":1381,"don''t believe":541,"believe with doubts":1687}',
  8479
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6dgkm7HtAZvq',
  'mp1RnsSZtkgy',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"higher power":1916,"no doubts":11032,"believe with doubts":3002,"believe sometimes":730,"don''t believe":586}',
  17266
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '5UeWPX9oZ8Ks',
  'mp1RnsSZtkgy',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"higher power":267,"no doubts":3053,"believe sometimes":204,"believe with doubts":506,"don''t believe":106}',
  4136
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'obuLISxROrr6',
  'mp1RnsSZtkgy',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"no doubts":6728,"believe sometimes":471,"higher power":1269,"don''t believe":442,"believe with doubts":1840}',
  10750
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '2xmDTFpiM0lE',
  'mp1RnsSZtkgy',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"believe with doubts":1701,"no doubts":7123,"believe sometimes":450,"higher power":1081,"don''t believe":363}',
  10718
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6PCYLspS0s3k',
  'mp1RnsSZtkgy',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"no doubts":4295,"higher power":1140,"believe with doubts":1589,"believe sometimes":403,"don''t believe":400}',
  7827
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'jMjYxTK2NNmc',
  'mp1RnsSZtkgy',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"no doubts":11480,"believe with doubts":2661,"believe sometimes":668,"higher power":1753,"don''t believe":454}',
  17016
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'yqsTcH6nAD0B',
  'mp1RnsSZtkgy',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"no doubts":7056,"higher power":1808,"don''t believe":776,"believe with doubts":2535,"believe sometimes":680}',
  12855
);

-- postlife: Do you believe there is a life after death?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'Z5gsiDJclSrr',
  'Do you believe there is a life after death?',
  'Religion',
  'multiple_choice',
  '["no","yes"]',
  0,
  'odK0oYEfdwRE',
  'postlife',
  '{"no":"no","yes":"yes"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KQBc7HksryQ7',
  'Z5gsiDJclSrr',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"yes":36400,"no":9031}',
  45431
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'SbEE9XnL0jCu',
  'Z5gsiDJclSrr',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"yes":6492,"no":2139}',
  8631
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'MRBJTOAVaMuk',
  'Z5gsiDJclSrr',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"yes":21548,"no":4738}',
  26286
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'zpjwxHmbkHxe',
  'Z5gsiDJclSrr',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"no":2135,"yes":8304}',
  10439
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'q8jZTCgk5o6p',
  'Z5gsiDJclSrr',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"yes":13199,"no":3128}',
  16327
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Tgr2DOJZSRGv',
  'Z5gsiDJclSrr',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"yes":11052,"no":2897}',
  13949
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'yUma7FrBUNTq',
  'Z5gsiDJclSrr',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"yes":11724,"no":2903}',
  14627
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'M8N0A3RGkE37',
  'Z5gsiDJclSrr',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"yes":15186,"no":4716}',
  19902
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'sjIh7TG8WWda',
  'Z5gsiDJclSrr',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"yes":21210,"no":4314}',
  25524
);

-- evolved: Human beings, as we know them today, developed fro...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'PEN3oM2qtwoR',
  'Human beings, as we know them today, developed from earlier species of animals.',
  'Science',
  'multiple_choice',
  '["false","true"]',
  0,
  'odK0oYEfdwRE',
  'evolved',
  '{"false":"false","true":"true"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'tHPUSAe0glE8',
  'PEN3oM2qtwoR',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"false":3002,"true":3373}',
  6375
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'BhB2uuozbq3h',
  'PEN3oM2qtwoR',
  'odK0oYEfdwRE',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"false":1945,"true":1776}',
  3721
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'tjynPROWC1GW',
  'PEN3oM2qtwoR',
  'odK0oYEfdwRE',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"false":635,"true":1251}',
  1886
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'vF8sBedLjFKo',
  'PEN3oM2qtwoR',
  'odK0oYEfdwRE',
  NULL,
  'Primary',
  NULL,
  NULL,
  NULL,
  '{"false":421,"true":345}',
  766
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'NZ5j1dN0Ihp9',
  'PEN3oM2qtwoR',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"false":704,"true":1067}',
  1771
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ub7rt1oVc0Cg',
  'PEN3oM2qtwoR',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"false":1131,"true":1243}',
  2374
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'xAIYvyixTrn6',
  'PEN3oM2qtwoR',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"false":1125,"true":1036}',
  2161
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'l6Hbj3zfUtpv',
  'PEN3oM2qtwoR',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"false":1128,"true":1629}',
  2757
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'J4xI5NjhD3Yc',
  'PEN3oM2qtwoR',
  'odK0oYEfdwRE',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"false":1874,"true":1744}',
  3618
);
