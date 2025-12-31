-- MIT Moral Machine Import
-- Generated: 2025-12-30T22:51:55.242Z
-- Source: Moral Machine Experiment (Awad et al., Nature 2018)

-- Benchmark source
INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  '6LGAMcLD06uu',
  'Moral Machine Experiment',
  'Moral Machine',
  'https://www.moralmachine.net/',
  11286141,
  '2016-2018'
);

-- Gender: In an unavoidable accident where an autonomous veh...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'S6BOzdN59WlI',
  'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save men or women?',
  'Ethics',
  'multiple_choice',
  '["Men","Women"]',
  0,
  '6LGAMcLD06uu',
  'mm_gender',
  '{"Men":"Men","Women":"Women"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'j3w5JS1l4Db0',
  'S6BOzdN59WlI',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Men":959409,"Women":959409}',
  1918818
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Bnk2V9VxthVK',
  'S6BOzdN59WlI',
  '6LGAMcLD06uu',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"Men":343622,"Women":343622}',
  687244
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'iAucLbXR6M9U',
  'S6BOzdN59WlI',
  '6LGAMcLD06uu',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"Men":274982,"Women":274982}',
  549964
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'iz59Ps5YfW8I',
  'S6BOzdN59WlI',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"Men":487771,"Women":487771}',
  975542
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'z84I5EPD6nLu',
  'S6BOzdN59WlI',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"Men":107161,"Women":107161}',
  214322
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'WoYuiel1YfZL',
  'S6BOzdN59WlI',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"Men":14587,"Women":14587}',
  29174
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '05HDpvOuCzuP',
  'S6BOzdN59WlI',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"Men":605377,"Women":605377}',
  1210754
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '0ofthtPtrGjl',
  'S6BOzdN59WlI',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"Men":238299,"Women":238299}',
  476598
);

-- Age: In an unavoidable accident where an autonomous veh...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'pQ4twufwnGHf',
  'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save younger people or older people?',
  'Ethics',
  'multiple_choice',
  '["Younger people","Older people"]',
  0,
  '6LGAMcLD06uu',
  'mm_age',
  '{"Younger people":"Younger people","Older people":"Older people"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8KVHGzS9yLyS',
  'pQ4twufwnGHf',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Younger people":927370,"Older people":927370}',
  1854740
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'g32zPIXgRszw',
  'pQ4twufwnGHf',
  '6LGAMcLD06uu',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"Younger people":332139,"Older people":332139}',
  664278
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Dz5LeusFr0dE',
  'pQ4twufwnGHf',
  '6LGAMcLD06uu',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"Younger people":265785,"Older people":265785}',
  531570
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'eD1M1jLB4NWq',
  'pQ4twufwnGHf',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"Younger people":471506,"Older people":471506}',
  943012
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'dcrAXVVSIiBQ',
  'pQ4twufwnGHf',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"Younger people":103653,"Older people":103653}',
  207306
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'PSnbsFDWeZOI',
  'pQ4twufwnGHf',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"Younger people":14111,"Older people":14111}',
  28222
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'wQRy1mwQ5ziv',
  'pQ4twufwnGHf',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"Younger people":584609,"Older people":584609}',
  1169218
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8pNctwJgoApL',
  'pQ4twufwnGHf',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"Younger people":230983,"Older people":230983}',
  461966
);

-- Fitness: In an unavoidable accident where an autonomous veh...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'jnAjqDLBqRbc',
  'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save fit people or overweight people?',
  'Ethics',
  'multiple_choice',
  '["Fit people","Overweight people"]',
  0,
  '6LGAMcLD06uu',
  'mm_fitness',
  '{"Fit people":"Fit people","Overweight people":"Overweight people"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'swVGyKDv5b9V',
  'jnAjqDLBqRbc',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Fit people":865414,"Overweight people":865414}',
  1730828
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '7RZQj4EJblTA',
  'jnAjqDLBqRbc',
  '6LGAMcLD06uu',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"Fit people":310268,"Overweight people":310268}',
  620536
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'DkZ2LDKTfAvi',
  'jnAjqDLBqRbc',
  '6LGAMcLD06uu',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"Fit people":248002,"Overweight people":248002}',
  496004
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '45yCODsVdwI4',
  'jnAjqDLBqRbc',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"Fit people":440064,"Overweight people":440064}',
  880128
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'vDroOdDjiOsW',
  'jnAjqDLBqRbc',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"Fit people":96900,"Overweight people":96900}',
  193800
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ickjVJOjdKGb',
  'jnAjqDLBqRbc',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"Fit people":13178,"Overweight people":13178}',
  26356
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'zFECJZSA3paT',
  'jnAjqDLBqRbc',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"Fit people":545954,"Overweight people":545954}',
  1091908
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'MdqPd6aDmJNp',
  'jnAjqDLBqRbc',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"Fit people":214999,"Overweight people":214999}',
  429998
);

-- Species: In an unavoidable accident where an autonomous veh...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'kiO81sDoXbLW',
  'In an unavoidable accident where an autonomous vehicle must choose between pedestrians and pets, should it save humans or pets?',
  'Ethics',
  'multiple_choice',
  '["Humans","Pets"]',
  0,
  '6LGAMcLD06uu',
  'mm_species',
  '{"Humans":"Humans","Pets":"Pets"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'YBYEc9PtCfo0',
  'kiO81sDoXbLW',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Humans":963412,"Pets":963412}',
  1926824
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'CuUWM22ouovz',
  'kiO81sDoXbLW',
  '6LGAMcLD06uu',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"Humans":344951,"Pets":344951}',
  689902
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'flsbz2M3shmi',
  'kiO81sDoXbLW',
  '6LGAMcLD06uu',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"Humans":276030,"Pets":276030}',
  552060
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Cmjt1bgvV0hU',
  'kiO81sDoXbLW',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"Humans":489306,"Pets":489306}',
  978612
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'oE1XygDlkZmX',
  'kiO81sDoXbLW',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"Humans":107792,"Pets":107792}',
  215584
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'rrFz4O47Zmo1',
  'kiO81sDoXbLW',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"Humans":14649,"Pets":14649}',
  29298
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'kbnmitPD94MN',
  'kiO81sDoXbLW',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"Humans":608056,"Pets":608056}',
  1216112
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'MoMHQpk4VVr5',
  'kiO81sDoXbLW',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"Humans":239295,"Pets":239295}',
  478590
);

-- Social Status: In an unavoidable accident where an autonomous veh...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'ko8RSRhlVz5V',
  'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save higher social status individuals or lower social status individuals?',
  'Ethics',
  'multiple_choice',
  '["Higher social status","Lower social status"]',
  0,
  '6LGAMcLD06uu',
  'mm_social_status',
  '{"Higher social status":"Higher social status","Lower social status":"Lower social status"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KyfbWadxmJXJ',
  'ko8RSRhlVz5V',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"Higher social status":270428,"Lower social status":348913}',
  619341
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '865AplnrF8NH',
  'ko8RSRhlVz5V',
  '6LGAMcLD06uu',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"Higher social status":99036,"Lower social status":123428}',
  222464
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '4BnhjHP1Vaxh',
  'ko8RSRhlVz5V',
  '6LGAMcLD06uu',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"Higher social status":77291,"Lower social status":100430}',
  177721
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'nbrpdSj5H2Zv',
  'ko8RSRhlVz5V',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"Higher social status":138761,"Lower social status":176763}',
  315524
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'PUHFsdd1HMeH',
  'ko8RSRhlVz5V',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"Higher social status":31041,"Lower social status":38081}',
  69122
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KjonPji6fIH1',
  'ko8RSRhlVz5V',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"Higher social status":4314,"Lower social status":5212}',
  9526
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'LDnMhIovA554',
  'ko8RSRhlVz5V',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"Higher social status":172303,"Lower social status":218763}',
  391066
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'fvWJdWtyYUvg',
  'ko8RSRhlVz5V',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"Higher social status":65605,"Lower social status":87730}',
  153335
);

-- Utilitarian: In an unavoidable accident where an autonomous veh...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'CDdEbgddlwcZ',
  'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians of different sizes, should it save more people or fewer people?',
  'Ethics',
  'multiple_choice',
  '["More people","Fewer people"]',
  0,
  '6LGAMcLD06uu',
  'mm_utilitarian',
  '{"More people":"More people","Fewer people":"Fewer people"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'UTvXa0R3eJMv',
  'CDdEbgddlwcZ',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"More people":1016888,"Fewer people":1016888}',
  2033776
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'sEENNZ3ujPO8',
  'CDdEbgddlwcZ',
  '6LGAMcLD06uu',
  NULL,
  'Tertiary',
  NULL,
  NULL,
  NULL,
  '{"More people":365198,"Fewer people":365198}',
  730396
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '2V96B3JmbuxE',
  'CDdEbgddlwcZ',
  '6LGAMcLD06uu',
  NULL,
  'Secondary',
  NULL,
  NULL,
  NULL,
  '{"More people":291055,"Fewer people":291055}',
  582110
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '5gGB9Gu5AOda',
  'CDdEbgddlwcZ',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '18-34',
  NULL,
  '{"More people":517214,"Fewer people":517214}',
  1034428
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8aff5xFqwzuo',
  'CDdEbgddlwcZ',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '35-54',
  NULL,
  '{"More people":114245,"Fewer people":114245}',
  228490
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'bauZK07kc4bT',
  'CDdEbgddlwcZ',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  '55+',
  NULL,
  '{"More people":15540,"Fewer people":15540}',
  31080
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'AtsriLRHYgK2',
  'CDdEbgddlwcZ',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Male',
  '{"More people":641268,"Fewer people":641268}',
  1282536
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'HKtHcds1b8dI',
  'CDdEbgddlwcZ',
  '6LGAMcLD06uu',
  NULL,
  NULL,
  NULL,
  NULL,
  'Female',
  '{"More people":253041,"Fewer people":253041}',
  506082
);
