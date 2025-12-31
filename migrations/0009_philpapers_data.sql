-- PhilPapers 2020 Survey Import
-- Generated: 2025-12-30T22:24:51.886Z
-- Source: PhilPapers Survey 2020 by Bourget & Chalmers

-- Benchmark source
INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  '1feCIbm7BEON',
  'PhilPapers Survey 2020',
  'PhilPapers',
  'https://survey2020.philpeople.org/',
  1785,
  '2020'
);

-- a_priori_knowledge: A priori knowledge: yes or no?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'xoF5qf28EC7O',
  'A priori knowledge: yes or no?',
  'Epistemology',
  'multiple_choice',
  '["Yes","No","Other"]',
  0,
  '1feCIbm7BEON',
  'a_priori_knowledge',
  '{"yes":"Yes","no":"No","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '12zqG91QcPLL',
  'xoF5qf28EC7O',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"yes":1299,"no":330,"other":155}',
  1784
);

-- abstract_objects: Abstract objects: Platonism or nominalism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'lBMVVValNkKh',
  'Abstract objects: Platonism or nominalism?',
  'Metaphysics',
  'multiple_choice',
  '["Platonism","Nominalism","Other"]',
  0,
  '1feCIbm7BEON',
  'abstract_objects',
  '{"platonism":"Platonism","nominalism":"Nominalism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'DnjnKbICMpCs',
  'lBMVVValNkKh',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"platonism":685,"nominalism":748,"other":352}',
  1785
);

-- aesthetic_value: Aesthetic value: objective or subjective?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'VoFdiLBRBnvS',
  'Aesthetic value: objective or subjective?',
  'Aesthetics',
  'multiple_choice',
  '["Objective","Subjective","Other"]',
  0,
  '1feCIbm7BEON',
  'aesthetic_value',
  '{"objective":"Objective","subjective":"Subjective","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Y6wcVIgK3SOT',
  'VoFdiLBRBnvS',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"objective":776,"subjective":725,"other":337}',
  1838
);

-- aim_of_philosophy: Aim of philosophy (which is most important?): trut...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'gzRcCawpy6Yl',
  'Aim of philosophy (which is most important?): truth/knowledge, understanding, wisdom, happiness, or goodness/justice?',
  'Metaphilosophy',
  'multiple_choice',
  '["Truth Knowledge","Understanding","Wisdom","Happiness","Goodness Justice","Other"]',
  0,
  '1feCIbm7BEON',
  'aim_of_philosophy',
  '{"truth_knowledge":"Truth Knowledge","understanding":"Understanding","wisdom":"Wisdom","happiness":"Happiness","goodness_justice":"Goodness Justice","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'MWgzHT0kNgmD',
  'gzRcCawpy6Yl',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"truth_knowledge":753,"understanding":996,"wisdom":557,"happiness":225,"goodness_justice":405,"other":193}',
  3129
);

-- analytic_synthetic_distinction: Analytic-synthetic distinction: yes or no?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'dlOh7frMLo8x',
  'Analytic-synthetic distinction: yes or no?',
  'Philosophy of Language',
  'multiple_choice',
  '["Yes","No","Other"]',
  0,
  '1feCIbm7BEON',
  'analytic_synthetic_distinction',
  '{"yes":"Yes","no":"No","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ApxXU2KVAAOd',
  'dlOh7frMLo8x',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"yes":1116,"no":461,"other":212}',
  1789
);

-- eating_animals_and_animal_products: Eating animals and animal products (permissible in...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'mTRJzszE1KWf',
  'Eating animals and animal products (permissible in ordinary circumstances?): omnivorism, vegetarianism, or veganism?',
  'Ethics',
  'multiple_choice',
  '["Omnivorism (eating both permissible)","Vegetarianism (eating animals not permissible)","Veganism (eating neither permissible)","Other"]',
  0,
  '1feCIbm7BEON',
  'eating_animals_and_animal_products',
  '{"omnivorism":"Omnivorism (eating both permissible)","vegetarianism":"Vegetarianism (eating animals not permissible)","veganism":"Veganism (eating neither permissible)","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'P1m8FwrIX2gx',
  'mTRJzszE1KWf',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"omnivorism":857,"vegetarianism":473,"veganism":328,"other":177}',
  1835
);

-- epistemic_justification: Epistemic justification: internalism or externalis...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'oK6BhwCx7lGJ',
  'Epistemic justification: internalism or externalism?',
  'Epistemology',
  'multiple_choice',
  '["Internalism","Externalism","Other"]',
  0,
  '1feCIbm7BEON',
  'epistemic_justification',
  '{"internalism":"Internalism","externalism":"Externalism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'CRQU39BnUT8a',
  'oK6BhwCx7lGJ',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"internalism":637,"externalism":901,"other":321}',
  1859
);

-- experience_machine: Experience machine (would you enter?): yes or no?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'qgSkJUyERTGd',
  'Experience machine (would you enter?): yes or no?',
  'Ethics',
  'multiple_choice',
  '["Yes","No","Other"]',
  0,
  '1feCIbm7BEON',
  'experience_machine',
  '{"yes":"Yes","no":"No","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'EJQtQ074Ef9K',
  'qgSkJUyERTGd',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"yes":237,"no":1373,"other":173}',
  1783
);

-- external_world: External world: idealism, skepticism, or non-skept...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'ji3zFPU553zd',
  'External world: idealism, skepticism, or non-skeptical realism?',
  'Epistemology',
  'multiple_choice',
  '["Idealism","Skepticism","Non Skeptical Realism","Other"]',
  0,
  '1feCIbm7BEON',
  'external_world',
  '{"idealism":"Idealism","skepticism":"Skepticism","non_skeptical_realism":"Non Skeptical Realism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'jH1Q6Xg3QcUu',
  'ji3zFPU553zd',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"idealism":118,"skepticism":96,"non_skeptical_realism":1419,"other":175}',
  1808
);

-- footbridge: Footbridge (pushing man off bridge will save five ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'RZrPeCDRo3s0',
  'Footbridge (pushing man off bridge will save five on track below): push or don''t push?',
  'Ethics',
  'multiple_choice',
  '["Push","Don''t push","Other"]',
  0,
  '1feCIbm7BEON',
  'footbridge',
  '{"push":"Push","dont_push":"Don''t push","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'aoxX57ONGpPa',
  'RZrPeCDRo3s0',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"push":393,"dont_push":1000,"other":393}',
  1786
);

-- free_will: Free will: compatibilism, libertarianism, or no fr...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '2qb7RlzmDPUx',
  'Free will: compatibilism, libertarianism, or no free will?',
  'Metaphysics',
  'multiple_choice',
  '["Compatibilism","Libertarianism","No free will","Other"]',
  0,
  '1feCIbm7BEON',
  'free_will',
  '{"compatibilism":"Compatibilism","libertarianism":"Libertarianism","no_free_will":"No free will","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'emn2OyJoz3RQ',
  '2qb7RlzmDPUx',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"compatibilism":1057,"libertarianism":336,"no_free_will":200,"other":203}',
  1796
);

-- gender: Gender: biological, psychological, social, or unre...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'YJv6d1RseI2k',
  'Gender: biological, psychological, social, or unreal?',
  'Metaphysics',
  'multiple_choice',
  '["Biological","Psychological","Social","Unreal","Other"]',
  0,
  '1feCIbm7BEON',
  'gender',
  '{"biological":"Biological","psychological":"Psychological","social":"Social","unreal":"Unreal","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'NtVNYtm2gteT',
  'YJv6d1RseI2k',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"biological":518,"psychological":384,"social":1126,"unreal":75,"other":264}',
  2367
);

-- god: God: theism or atheism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'EXph1JeQrOdu',
  'God: theism or atheism?',
  'Philosophy of Religion',
  'multiple_choice',
  '["Theism","Atheism","Other"]',
  0,
  '1feCIbm7BEON',
  'god',
  '{"theism":"Theism","atheism":"Atheism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '7jlTEN7wOiZS',
  'EXph1JeQrOdu',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"theism":337,"atheism":1194,"other":250}',
  1781
);

-- knowledge_claims: Knowledge claims: contextualism, relativism, or in...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'UHc9HQUWwHcv',
  'Knowledge claims: contextualism, relativism, or invariantism?',
  'Epistemology',
  'multiple_choice',
  '["Contextualism","Relativism","Invariantism","Other"]',
  0,
  '1feCIbm7BEON',
  'knowledge_claims',
  '{"contextualism":"Contextualism","relativism":"Relativism","invariantism":"Invariantism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8EZqUJjgMJSC',
  'UHc9HQUWwHcv',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"contextualism":975,"relativism":96,"invariantism":455,"other":293}',
  1819
);

-- knowledge: Knowledge: empiricism or rationalism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'OvCnFw1cKSs3',
  'Knowledge: empiricism or rationalism?',
  'Epistemology',
  'multiple_choice',
  '["Empiricism","Rationalism","Other"]',
  0,
  '1feCIbm7BEON',
  'knowledge',
  '{"empiricism":"Empiricism","rationalism":"Rationalism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '3wPmEK5Yxcvh',
  'OvCnFw1cKSs3',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"empiricism":784,"rationalism":598,"other":493}',
  1875
);

-- laws_of_nature: Laws of nature: Humean or non-Humean?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'Asqwj5KAhRP6',
  'Laws of nature: Humean or non-Humean?',
  'Metaphysics',
  'multiple_choice',
  '["Humean","Non Humean","Other"]',
  0,
  '1feCIbm7BEON',
  'laws_of_nature',
  '{"humean":"Humean","non_humean":"Non Humean","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'O40mMfUKN7Gm',
  'Asqwj5KAhRP6',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"humean":559,"non_humean":969,"other":266}',
  1794
);

-- logic: Logic: classical or non-classical?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'amZE9rIwC8V2',
  'Logic: classical or non-classical?',
  'Logic',
  'multiple_choice',
  '["Classical","Non Classical","Other"]',
  0,
  '1feCIbm7BEON',
  'logic',
  '{"classical":"Classical","non_classical":"Non Classical","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ausQaPRwtnPd',
  'amZE9rIwC8V2',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"classical":957,"non_classical":471,"other":432}',
  1860
);

-- meaning_of_life: Meaning of life: subjective, objective, or nonexis...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'kX1Ej5sgo4U6',
  'Meaning of life: subjective, objective, or nonexistent?',
  'Ethics',
  'multiple_choice',
  '["Subjective","Objective","Nonexistent","Other"]',
  0,
  '1feCIbm7BEON',
  'meaning_of_life',
  '{"subjective":"Subjective","objective":"Objective","nonexistent":"Nonexistent","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'yoIUHaTdDn9Q',
  'kX1Ej5sgo4U6',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"subjective":589,"objective":573,"nonexistent":287,"other":421}',
  1870
);

-- mental_content: Mental content: internalism or externalism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'jKmAwgy6WGse',
  'Mental content: internalism or externalism?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Internalism","Externalism","Other"]',
  0,
  '1feCIbm7BEON',
  'mental_content',
  '{"internalism":"Internalism","externalism":"Externalism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'QnwLul0q40S6',
  'jKmAwgy6WGse',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"internalism":471,"externalism":1037,"other":350}',
  1858
);

-- meta_ethics: Meta-ethics: moral realism or moral anti-realism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'ruVIxAoxdomy',
  'Meta-ethics: moral realism or moral anti-realism?',
  'Ethics',
  'multiple_choice',
  '["Moral Realism","Moral Anti Realism","Other"]',
  0,
  '1feCIbm7BEON',
  'meta_ethics',
  '{"moral_realism":"Moral Realism","moral_anti_realism":"Moral Anti Realism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'aDCzhtMp4gSG',
  'ruVIxAoxdomy',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"moral_realism":1108,"moral_anti_realism":466,"other":211}',
  1785
);

-- metaphilosophy: Metaphilosophy: naturalism or non-naturalism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'ZspvFJ1OMUeG',
  'Metaphilosophy: naturalism or non-naturalism?',
  'Metaphilosophy',
  'multiple_choice',
  '["Naturalism","Non Naturalism","Other"]',
  0,
  '1feCIbm7BEON',
  'metaphilosophy',
  '{"naturalism":"Naturalism","non_naturalism":"Non Naturalism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'S7iDFCd7sb24',
  'ZspvFJ1OMUeG',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"naturalism":896,"non_naturalism":555,"other":341}',
  1792
);

-- mind: Mind: physicalism or non-physicalism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'M6ZPy5tNtN3a',
  'Mind: physicalism or non-physicalism?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Physicalism","Non-physicalism","Other"]',
  0,
  '1feCIbm7BEON',
  'mind',
  '{"physicalism":"Physicalism","non_physicalism":"Non-physicalism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'g0prgPYHQuDH',
  'M6ZPy5tNtN3a',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"physicalism":926,"non_physicalism":573,"other":284}',
  1783
);

-- moral_judgment: Moral judgment: cognitivism or non-cognitivism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'ylyxsAMvSDMa',
  'Moral judgment: cognitivism or non-cognitivism?',
  'Ethics',
  'multiple_choice',
  '["Cognitivism","Non Cognitivism","Other"]',
  0,
  '1feCIbm7BEON',
  'moral_judgment',
  '{"cognitivism":"Cognitivism","non_cognitivism":"Non Cognitivism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'gjfjDGnjyA7t',
  'ylyxsAMvSDMa',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"cognitivism":1237,"non_cognitivism":369,"other":184}',
  1790
);

-- moral_motivation: Moral motivation: internalism or externalism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '8zPgjoSOWJwe',
  'Moral motivation: internalism or externalism?',
  'Ethics',
  'multiple_choice',
  '["Internalism","Externalism","Other"]',
  0,
  '1feCIbm7BEON',
  'moral_motivation',
  '{"internalism":"Internalism","externalism":"Externalism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '3hlaNduv2TuH',
  '8zPgjoSOWJwe',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"internalism":732,"externalism":702,"other":393}',
  1827
);

-- newcombs_problem: Newcomb''s problem: one box or two boxes?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'KKiY5ewC8Rbg',
  'Newcomb''s problem: one box or two boxes?',
  'Decision Theory',
  'multiple_choice',
  '["One Box","Two Boxes","Other"]',
  0,
  '1feCIbm7BEON',
  'newcombs_problem',
  '{"one_box":"One Box","two_boxes":"Two Boxes","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '3eyH9fSNO5H7',
  'KKiY5ewC8Rbg',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"one_box":557,"two_boxes":696,"other":539}',
  1792
);

-- normative_ethics: Normative ethics: deontology, consequentialism, or...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'VhlNkvVj7Ex5',
  'Normative ethics: deontology, consequentialism, or virtue ethics?',
  'Ethics',
  'multiple_choice',
  '["Deontology","Consequentialism","Virtue ethics","Other"]',
  0,
  '1feCIbm7BEON',
  'normative_ethics',
  '{"deontology":"Deontology","consequentialism":"Consequentialism","virtue_ethics":"Virtue ethics","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '7rFtqW7Ebvio',
  'VhlNkvVj7Ex5',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"deontology":573,"consequentialism":546,"virtue_ethics":660,"other":325}',
  2104
);

-- perceptual_experience: Perceptual experience: disjunctivism, qualia theor...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'L1VTheFRM3ln',
  'Perceptual experience: disjunctivism, qualia theory, representationalism, or sense-datum theory?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Disjunctivism","Qualia Theory","Representationalism","Sense Datum Theory","Other"]',
  0,
  '1feCIbm7BEON',
  'perceptual_experience',
  '{"disjunctivism":"Disjunctivism","qualia_theory":"Qualia Theory","representationalism":"Representationalism","sense_datum_theory":"Sense Datum Theory","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'eD4ch7YtKPmj',
  'L1VTheFRM3ln',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"disjunctivism":278,"qualia_theory":270,"representationalism":702,"sense_datum_theory":89,"other":502}',
  1841
);

-- personal_identity: Personal identity: biological view, psychological ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'hUwbk6DSCpQV',
  'Personal identity: biological view, psychological view, or further-fact view?',
  'Metaphysics',
  'multiple_choice',
  '["Biological view","Psychological view","Further-fact view","Other"]',
  0,
  '1feCIbm7BEON',
  'personal_identity',
  '{"biological_view":"Biological view","psychological_view":"Psychological view","further_fact_view":"Further-fact view","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'rCjYYfsVDj3Y',
  'hUwbk6DSCpQV',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"biological_view":341,"psychological_view":780,"further_fact_view":266,"other":475}',
  1862
);

-- philosophical_progress: Philosophical progress (how much is there?): none,...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'UPiZSukUz8Oa',
  'Philosophical progress (how much is there?): none, a little, or a lot?',
  'Metaphilosophy',
  'multiple_choice',
  '["None","A Little","A Lot","Other"]',
  0,
  '1feCIbm7BEON',
  'philosophical_progress',
  '{"none":"None","a_little":"A Little","a_lot":"A Lot","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '4UAMpdLaUiE0',
  'UPiZSukUz8Oa',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"none":68,"a_little":832,"a_lot":744,"other":150}',
  1794
);

-- political_philosophy: Political philosophy: communitarianism, egalitaria...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '5XBXhBov0MFe',
  'Political philosophy: communitarianism, egalitarianism, or libertarianism?',
  'Political Philosophy',
  'multiple_choice',
  '["Communitarianism","Egalitarianism","Libertarianism","Other"]',
  0,
  '1feCIbm7BEON',
  'political_philosophy',
  '{"communitarianism":"Communitarianism","egalitarianism":"Egalitarianism","libertarianism":"Libertarianism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Krb7YsbbJwMb',
  '5XBXhBov0MFe',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"communitarianism":487,"egalitarianism":785,"libertarianism":239,"other":366}',
  1877
);

-- proper_names: Proper names: Fregean or Millian?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'voCJ5VkUlEuD',
  'Proper names: Fregean or Millian?',
  'Philosophy of Language',
  'multiple_choice',
  '["Fregean","Millian","Other"]',
  0,
  '1feCIbm7BEON',
  'proper_names',
  '{"fregean":"Fregean","millian":"Millian","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'IjdJdFOqByMN',
  'voCJ5VkUlEuD',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"fregean":644,"millian":691,"other":455}',
  1790
);

-- race: Race: biological, social, or unreal?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'hYjroMXVXvnR',
  'Race: biological, social, or unreal?',
  'Metaphysics',
  'multiple_choice',
  '["Biological","Social","Unreal","Other"]',
  0,
  '1feCIbm7BEON',
  'race',
  '{"biological":"Biological","social":"Social","unreal":"Unreal","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'yqqkgo2AKryN',
  'hYjroMXVXvnR',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"biological":334,"social":1132,"unreal":268,"other":237}',
  1971
);

-- science: Science: scientific realism or scientific anti-rea...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'eObQAV5hVvLY',
  'Science: scientific realism or scientific anti-realism?',
  'Philosophy of Science',
  'multiple_choice',
  '["Scientific Realism","Scientific Anti Realism","Other"]',
  0,
  '1feCIbm7BEON',
  'science',
  '{"scientific_realism":"Scientific Realism","scientific_anti_realism":"Scientific Anti Realism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'q7R0rZ0Jooi8',
  'eObQAV5hVvLY',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"scientific_realism":1292,"scientific_anti_realism":268,"other":228}',
  1788
);

-- teletransporter: Teletransporter (new matter): survival or death?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'ad2v7m3xs4jz',
  'Teletransporter (new matter): survival or death?',
  'Metaphysics',
  'multiple_choice',
  '["Survival","Death","Other"]',
  0,
  '1feCIbm7BEON',
  'teletransporter',
  '{"survival":"Survival","death":"Death","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'bWIVczMYgxmR',
  'ad2v7m3xs4jz',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"survival":628,"death":716,"other":443}',
  1787
);

-- time: Time: A-theory or B-theory?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'A8nhXxp8kjjM',
  'Time: A-theory or B-theory?',
  'Metaphysics',
  'multiple_choice',
  '["A Theory","B Theory","Other"]',
  0,
  '1feCIbm7BEON',
  'time',
  '{"a_theory":"A Theory","b_theory":"B Theory","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'HDf0gTDgmcIW',
  'A8nhXxp8kjjM',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"a_theory":486,"b_theory":682,"other":646}',
  1814
);

-- trolley_problem: Trolley problem (five straight ahead, one on side ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'poBoSYnUWPos',
  'Trolley problem (five straight ahead, one on side track, turn requires switching): switch or don''t switch?',
  'Ethics',
  'multiple_choice',
  '["Switch","Don''t switch","Other"]',
  0,
  '1feCIbm7BEON',
  'trolley_problem',
  '{"switch":"Switch","dont_switch":"Don''t switch","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Y2uxdSeOEysg',
  'poBoSYnUWPos',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"switch":1132,"dont_switch":237,"other":418}',
  1787
);

-- truth: Truth: correspondence, deflationary, or epistemic?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'YqqRsdKN24YP',
  'Truth: correspondence, deflationary, or epistemic?',
  'Metaphysics',
  'multiple_choice',
  '["Correspondence","Deflationary","Epistemic","Other"]',
  0,
  '1feCIbm7BEON',
  'truth',
  '{"correspondence":"Correspondence","deflationary":"Deflationary","epistemic":"Epistemic","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'T418qECe8cJn',
  'YqqRsdKN24YP',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"correspondence":917,"deflationary":437,"epistemic":182,"other":300}',
  1836
);

-- vagueness: Vagueness: epistemic, metaphysical, or semantic?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'GdoIMUAwK7Th',
  'Vagueness: epistemic, metaphysical, or semantic?',
  'Philosophy of Language',
  'multiple_choice',
  '["Epistemic","Metaphysical","Semantic","Other"]',
  0,
  '1feCIbm7BEON',
  'vagueness',
  '{"epistemic":"Epistemic","metaphysical":"Metaphysical","semantic":"Semantic","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'xzsO94XoySC7',
  'GdoIMUAwK7Th',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"epistemic":432,"metaphysical":371,"semantic":930,"other":278}',
  2011
);

-- zombies: Zombies: inconceivable, conceivable but not metaph...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'HWniCSGjxZso',
  'Zombies: inconceivable, conceivable but not metaphysically possible, or metaphysically possible?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Inconceivable","Conceivable but not metaphysically possible","Metaphysically possible","Other"]',
  0,
  '1feCIbm7BEON',
  'zombies',
  '{"inconceivable":"Inconceivable","conceivable_but_not_possible":"Conceivable but not metaphysically possible","metaphysically_possible":"Metaphysically possible","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'm8jA3WNjGoag',
  'HWniCSGjxZso',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"inconceivable":293,"conceivable_but_not_possible":652,"metaphysically_possible":436,"other":402}',
  1783
);

-- abortion: Abortion (first trimester, no special circumstance...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'cqpg2KQhvahJ',
  'Abortion (first trimester, no special circumstances): permissible or impermissible?',
  'Ethics',
  'multiple_choice',
  '["Permissible","Impermissible","Other"]',
  0,
  '1feCIbm7BEON',
  'abortion',
  '{"permissible":"Permissible","impermissible":"Impermissible","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'mNnSAQywUty0',
  'cqpg2KQhvahJ',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"permissible":1458,"impermissible":234,"other":96}',
  1788
);

-- aesthetic_experience: Aesthetic experience: perception, pleasure, or sui...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'PlHiFQ6Jx402',
  'Aesthetic experience: perception, pleasure, or sui generis?',
  'Aesthetics',
  'multiple_choice',
  '["Perception","Pleasure","Sui Generis","Other"]',
  0,
  '1feCIbm7BEON',
  'aesthetic_experience',
  '{"perception":"Perception","pleasure":"Pleasure","sui_generis":"Sui Generis","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Kf4npkYM9Qz6',
  'PlHiFQ6Jx402',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"perception":503,"pleasure":253,"sui_generis":664,"other":436}',
  1856
);

-- analysis_of_knowledge: Analysis of knowledge: justified true belief, othe...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'o4opiPzeeXdM',
  'Analysis of knowledge: justified true belief, other analysis, or no analysis?',
  'Epistemology',
  'multiple_choice',
  '["Justified True Belief","Other Analysis","No Analysis","Other"]',
  0,
  '1feCIbm7BEON',
  'analysis_of_knowledge',
  '{"justified_true_belief":"Justified True Belief","other_analysis":"Other Analysis","no_analysis":"No Analysis","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'kGGz0mUuAhPR',
  'o4opiPzeeXdM',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"justified_true_belief":421,"other_analysis":575,"no_analysis":546,"other":248}',
  1790
);

-- arguments_for_theism: Arguments for theism (which is strongest?): cosmol...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'K8VIITqWNqGz',
  'Arguments for theism (which is strongest?): cosmological, design, ontological, pragmatic, or moral?',
  'Philosophy of Religion',
  'multiple_choice',
  '["Cosmological","Design","Ontological","Pragmatic","Moral","Other"]',
  0,
  '1feCIbm7BEON',
  'arguments_for_theism',
  '{"cosmological":"Cosmological","design":"Design","ontological":"Ontological","pragmatic":"Pragmatic","moral":"Moral","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KvdEMa6BM5Yw',
  'K8VIITqWNqGz',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"cosmological":373,"design":316,"ontological":159,"pragmatic":253,"moral":168,"other":450}',
  1719
);

-- belief_or_credence: Belief or credence (which is more fundamental?): b...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'CKhe9XmppM3W',
  'Belief or credence (which is more fundamental?): belief, credence, or neither?',
  'Epistemology',
  'multiple_choice',
  '["Belief","Credence","Neither","Other"]',
  0,
  '1feCIbm7BEON',
  'belief_or_credence',
  '{"belief":"Belief","credence":"Credence","neither":"Neither","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'q8NW88amgZuN',
  'CKhe9XmppM3W',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"belief":546,"credence":559,"neither":348,"other":345}',
  1798
);

-- capital_punishment: Capital punishment: permissible or impermissible?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'q4FXeYqiT6DV',
  'Capital punishment: permissible or impermissible?',
  'Ethics',
  'multiple_choice',
  '["Permissible","Impermissible","Other"]',
  0,
  '1feCIbm7BEON',
  'capital_punishment',
  '{"permissible":"Permissible","impermissible":"Impermissible","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8Kn61hAwdbWl',
  'q4FXeYqiT6DV',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"permissible":316,"impermissible":1341,"other":127}',
  1784
);

-- causation: Causation: counterfactual/difference-making, proce...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'sb9La3GZh4EL',
  'Causation: counterfactual/difference-making, process/production, primitive, or nonexistent?',
  'Metaphysics',
  'multiple_choice',
  '["Counterfactual Difference Making","Process Production","Primitive","Nonexistent","Other"]',
  0,
  '1feCIbm7BEON',
  'causation',
  '{"counterfactual_difference_making":"Counterfactual Difference Making","process_production":"Process Production","primitive":"Primitive","nonexistent":"Nonexistent","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'wgGka4kUPZ3S',
  'sb9La3GZh4EL',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"counterfactual_difference_making":664,"process_production":402,"primitive":366,"nonexistent":73,"other":368}',
  1873
);

-- chinese_room: Chinese room: understands or doesn''t understand?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '0bQ8mFEjcmsE',
  'Chinese room: understands or doesn''t understand?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Understands","Doesn''t understand","Other"]',
  0,
  '1feCIbm7BEON',
  'chinese_room',
  '{"understands":"Understands","doesnt_understand":"Doesn''t understand","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ineuIA2RDZLf',
  '0bQ8mFEjcmsE',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"understands":318,"doesnt_understand":1198,"other":266}',
  1782
);

-- concepts: Concepts: nativism or empiricism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'suQkgT2EdIhI',
  'Concepts: nativism or empiricism?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Nativism","Empiricism","Other"]',
  0,
  '1feCIbm7BEON',
  'concepts',
  '{"nativism":"Nativism","empiricism":"Empiricism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'BBKlLYwHUROp',
  'suQkgT2EdIhI',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"nativism":502,"empiricism":898,"other":448}',
  1848
);

-- consciousness: Consciousness: dualism, eliminativism, functionali...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'LoAHgYhJadcx',
  'Consciousness: dualism, eliminativism, functionalism, identity theory, or panpsychism?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Dualism","Eliminativism","Functionalism","Identity theory","Panpsychism","Other"]',
  0,
  '1feCIbm7BEON',
  'consciousness',
  '{"dualism":"Dualism","eliminativism":"Eliminativism","functionalism":"Functionalism","identity_theory":"Identity theory","panpsychism":"Panpsychism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'AEZesrJIbpIj',
  'LoAHgYhJadcx',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"dualism":393,"eliminativism":80,"functionalism":589,"identity_theory":237,"panpsychism":134,"other":405}',
  1838
);

-- continuum_hypothesis: Continuum hypothesis (does it have a determinate t...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'oOwnxXELogqw',
  'Continuum hypothesis (does it have a determinate truth-value?): determinate or indeterminate?',
  'Philosophy of Mathematics',
  'multiple_choice',
  '["Determinate","Indeterminate","Other"]',
  0,
  '1feCIbm7BEON',
  'continuum_hypothesis',
  '{"determinate":"Determinate","indeterminate":"Indeterminate","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'glqsMDu0XNan',
  'oOwnxXELogqw',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"determinate":673,"indeterminate":512,"other":602}',
  1787
);

-- cosmological_fine_tuning: Cosmological fine-tuning (what explains it?): desi...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'sBudbfRvZb4V',
  'Cosmological fine-tuning (what explains it?): design, multiverse, brute fact, or no fine-tuning?',
  'Philosophy of Religion',
  'multiple_choice',
  '["Design","Multiverse","Brute Fact","No Fine Tuning","Other"]',
  0,
  '1feCIbm7BEON',
  'cosmological_fine_tuning',
  '{"design":"Design","multiverse":"Multiverse","brute_fact":"Brute Fact","no_fine_tuning":"No Fine Tuning","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'nhIJaQ6xUjF1',
  'sBudbfRvZb4V',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"design":309,"multiverse":270,"brute_fact":573,"no_fine_tuning":387,"other":318}',
  1857
);

-- environmental_ethics: Environmental ethics: anthropocentric or non-anthr...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'ozDAEl6AwxFy',
  'Environmental ethics: anthropocentric or non-anthropocentric?',
  'Ethics',
  'multiple_choice',
  '["Anthropocentric","Non Anthropocentric","Other"]',
  0,
  '1feCIbm7BEON',
  'environmental_ethics',
  '{"anthropocentric":"Anthropocentric","non_anthropocentric":"Non Anthropocentric","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'zyM9D0CAfxEM',
  'ozDAEl6AwxFy',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"anthropocentric":753,"non_anthropocentric":905,"other":159}',
  1817
);

-- extended_mind: Extended mind: yes or no?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'jfUWlt3Mo41i',
  'Extended mind: yes or no?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Yes","No","Other"]',
  0,
  '1feCIbm7BEON',
  'extended_mind',
  '{"yes":"Yes","no":"No","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '0ZKygNwYCvoA',
  'jfUWlt3Mo41i',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"yes":916,"no":662,"other":211}',
  1789
);

-- foundations_of_mathematics: Foundations of mathematics: intuitionism/construct...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'OFE19A9AsZiR',
  'Foundations of mathematics: intuitionism/constructivism, formalism, logicism, or structuralism?',
  'Philosophy of Mathematics',
  'multiple_choice',
  '["Constructivism Intuitionism","Formalism","Logicism","Structuralism","Set Theoretic","Other"]',
  0,
  '1feCIbm7BEON',
  'foundations_of_mathematics',
  '{"constructivism_intuitionism":"Constructivism Intuitionism","formalism":"Formalism","logicism":"Logicism","structuralism":"Structuralism","set_theoretic":"Set Theoretic","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'OV3RkF0idD8z',
  'OFE19A9AsZiR',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"constructivism_intuitionism":273,"formalism":111,"logicism":211,"structuralism":378,"set_theoretic":273,"other":612}',
  1858
);

-- gender_categories: Gender categories: preserve, revise, or eliminate?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'Ssv078R05Dyg',
  'Gender categories: preserve, revise, or eliminate?',
  'Social Philosophy',
  'multiple_choice',
  '["Preserve","Revise","Eliminate","Other"]',
  0,
  '1feCIbm7BEON',
  'gender_categories',
  '{"preserve":"Preserve","revise":"Revise","eliminate":"Eliminate","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KJntzAu7ECeg',
  'Ssv078R05Dyg',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"preserve":364,"revise":909,"eliminate":291,"other":273}',
  1837
);

-- grounds_of_intentionality: Grounds of intentionality: causal/teleological, in...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'eWv0cpIH0xMT',
  'Grounds of intentionality: causal/teleological, inferential, interpretational, phenomenal, or primitive?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Causal Teleological","Inferential","Interpretational","Phenomenal","Primitive","Other"]',
  0,
  '1feCIbm7BEON',
  'grounds_of_intentionality',
  '{"causal_teleological":"Causal Teleological","inferential":"Inferential","interpretational":"Interpretational","phenomenal":"Phenomenal","primitive":"Primitive","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'RhlaSw0T7sU2',
  'eWv0cpIH0xMT',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"causal_teleological":619,"inferential":170,"interpretational":270,"phenomenal":225,"primitive":245,"other":398}',
  1927
);

-- hard_problem_of_consciousness: Hard problem of consciousness (is there one?): yes...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'tvMjkPL3NShu',
  'Hard problem of consciousness (is there one?): yes or no?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Yes","No","Other"]',
  0,
  '1feCIbm7BEON',
  'hard_problem_of_consciousness',
  '{"yes":"Yes","no":"No","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'zzgyOE9xWSCx',
  'tvMjkPL3NShu',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"yes":1114,"no":532,"other":141}',
  1787
);

-- human_genetic_engineering: Human genetic engineering: permissible or impermis...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'KpdPtxUKddEH',
  'Human genetic engineering: permissible or impermissible?',
  'Ethics',
  'multiple_choice',
  '["Permissible","Impermissible","Other"]',
  0,
  '1feCIbm7BEON',
  'human_genetic_engineering',
  '{"permissible":"Permissible","impermissible":"Impermissible","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'XVv8L26aSERf',
  'KpdPtxUKddEH',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"permissible":1146,"impermissible":348,"other":287}',
  1781
);

-- hume: Hume (what is his view?): skeptic or naturalist?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'NEchk3i6rIJZ',
  'Hume (what is his view?): skeptic or naturalist?',
  'History of Philosophy',
  'multiple_choice',
  '["Skeptic","Naturalist","Other"]',
  0,
  '1feCIbm7BEON',
  'hume',
  '{"skeptic":"Skeptic","naturalist":"Naturalist","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'TubecKazuCmt',
  'NEchk3i6rIJZ',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"skeptic":652,"naturalist":980,"other":282}',
  1914
);

-- immortality: Immortality (would you choose it?): yes or no?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'VJlwk2Nhobwv',
  'Immortality (would you choose it?): yes or no?',
  'Ethics',
  'multiple_choice',
  '["Yes","No","Other"]',
  0,
  '1feCIbm7BEON',
  'immortality',
  '{"yes":"Yes","no":"No","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'QSa2oTQkqNlV',
  'VJlwk2Nhobwv',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"yes":801,"no":737,"other":243}',
  1781
);

-- interlevel_metaphysics: Interlevel metaphysics (which is most useful?): gr...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'C8pAqSqTlFpF',
  'Interlevel metaphysics (which is most useful?): grounding, identity, realization, or supervenience?',
  'Metaphysics',
  'multiple_choice',
  '["Grounding","Identity","Realization","Supervenience","Other"]',
  0,
  '1feCIbm7BEON',
  'interlevel_metaphysics',
  '{"grounding":"Grounding","identity":"Identity","realization":"Realization","supervenience":"Supervenience","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6NDLjLWFuVv2',
  'C8pAqSqTlFpF',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"grounding":519,"identity":205,"realization":375,"supervenience":441,"other":505}',
  2045
);

-- justification: Epistemic justification: coherentism, infinitism, ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'TUB6ZOaVifXR',
  'Epistemic justification: coherentism, infinitism, nonreliabilist foundationalism, or reliabilism?',
  'Epistemology',
  'multiple_choice',
  '["Coherentism","Infinitism","Nonreliabilist Foundationalism","Reliabilism","Other"]',
  0,
  '1feCIbm7BEON',
  'justification',
  '{"coherentism":"Coherentism","infinitism":"Infinitism","nonreliabilist_foundationalism":"Nonreliabilist Foundationalism","reliabilism":"Reliabilism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'v87qinAukOkt',
  'TUB6ZOaVifXR',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"coherentism":423,"infinitism":36,"nonreliabilist_foundationalism":450,"reliabilism":600,"other":389}',
  1898
);

-- kant: Kant (what is his view?): one world or two worlds?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'VRPRjcotF9pZ',
  'Kant (what is his view?): one world or two worlds?',
  'History of Philosophy',
  'multiple_choice',
  '["One World","Two Worlds","Other"]',
  0,
  '1feCIbm7BEON',
  'kant',
  '{"one_world":"One World","two_worlds":"Two Worlds","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8g9bB6lnRXoe',
  'VRPRjcotF9pZ',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"one_world":810,"two_worlds":623,"other":359}',
  1792
);

-- law: Law: legal positivism or legal non-positivism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'aoIwRBHfqQI6',
  'Law: legal positivism or legal non-positivism?',
  'Philosophy of Law',
  'multiple_choice',
  '["Legal Positivism","Legal Non Positivism","Other"]',
  0,
  '1feCIbm7BEON',
  'law',
  '{"legal_positivism":"Legal Positivism","legal_non_positivism":"Legal Non Positivism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'LVamVTisQWpp',
  'aoIwRBHfqQI6',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"legal_positivism":705,"legal_non_positivism":803,"other":286}',
  1794
);

-- material_composition: Material composition: nihilism, restrictivism, or ...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'Z5SjzYme1yls',
  'Material composition: nihilism, restrictivism, or universalism?',
  'Metaphysics',
  'multiple_choice',
  '["Nihilism","Restrictivism","Universalism","Other"]',
  0,
  '1feCIbm7BEON',
  'material_composition',
  '{"nihilism":"Nihilism","restrictivism":"Restrictivism","universalism":"Universalism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '4TJ7MsLVxBpo',
  'Z5SjzYme1yls',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"nihilism":146,"restrictivism":625,"universalism":489,"other":537}',
  1797
);

-- metaontology: Metaontology: heavyweight realism, deflationary re...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'qaqtvygmnwPN',
  'Metaontology: heavyweight realism, deflationary realism, or anti-realism?',
  'Metaphysics',
  'multiple_choice',
  '["Heavyweight Realism","Deflationary Realism","Anti Realism","Other"]',
  0,
  '1feCIbm7BEON',
  'metaontology',
  '{"heavyweight_realism":"Heavyweight Realism","deflationary_realism":"Deflationary Realism","anti_realism":"Anti Realism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '3EB4D1zL2dyy',
  'qaqtvygmnwPN',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"heavyweight_realism":689,"deflationary_realism":502,"anti_realism":212,"other":386}',
  1789
);

-- method_in_history_of_philosophy: Method in history of philosophy: analytic/rational...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'lmmjGVppblST',
  'Method in history of philosophy: analytic/rational reconstruction or contextual/historicist?',
  'History of Philosophy',
  'multiple_choice',
  '["Analytic Rational Reconstruction","Contextual Historicist","Other"]',
  0,
  '1feCIbm7BEON',
  'method_in_history_of_philosophy',
  '{"analytic_rational_reconstruction":"Analytic Rational Reconstruction","contextual_historicist":"Contextual Historicist","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'rj9nnC9X1EnN',
  'lmmjGVppblST',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"analytic_rational_reconstruction":1085,"contextual_historicist":793,"other":214}',
  2092
);

-- method_in_political_philosophy: Method in political philosophy: ideal theory or no...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'njt5kK19Ymbp',
  'Method in political philosophy: ideal theory or non-ideal theory?',
  'Political Philosophy',
  'multiple_choice',
  '["Ideal Theory","Non Ideal Theory","Other"]',
  0,
  '1feCIbm7BEON',
  'method_in_political_philosophy',
  '{"ideal_theory":"Ideal Theory","non_ideal_theory":"Non Ideal Theory","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '3wM4PJtUYvJx',
  'njt5kK19Ymbp',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"ideal_theory":578,"non_ideal_theory":1035,"other":336}',
  1949
);

-- mind_uploading: Mind uploading (brain replaced by digital emulatio...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'cLNdZyHwCYUr',
  'Mind uploading (brain replaced by digital emulation): survival or death?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Survival","Death","Other"]',
  0,
  '1feCIbm7BEON',
  'mind_uploading',
  '{"survival":"Survival","death":"Death","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'ZOg7Q6OHbzCW',
  'cLNdZyHwCYUr',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"survival":491,"death":967,"other":328}',
  1786
);

-- moral_principles: Moral principles: moral generalism or moral partic...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'gyv3gYAuX9BH',
  'Moral principles: moral generalism or moral particularism?',
  'Ethics',
  'multiple_choice',
  '["Moral Generalism","Moral Particularism","Other"]',
  0,
  '1feCIbm7BEON',
  'moral_principles',
  '{"moral_generalism":"Moral Generalism","moral_particularism":"Moral Particularism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Zu82z8TYImjV',
  'gyv3gYAuX9BH',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"moral_generalism":975,"moral_particularism":602,"other":230}',
  1807
);

-- morality: Morality: non-naturalism, naturalist realism, cons...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'uk4hX58fbP0G',
  'Morality: non-naturalism, naturalist realism, constructivism, expressivism, or error theory?',
  'Ethics',
  'multiple_choice',
  '["Non Naturalism","Naturalist Realism","Constructivism","Expressivism","Error Theory","Other"]',
  0,
  '1feCIbm7BEON',
  'morality',
  '{"non_naturalism":"Non Naturalism","naturalist_realism":"Naturalist Realism","constructivism":"Constructivism","expressivism":"Expressivism","error_theory":"Error Theory","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'EbHH5AlNE7N8',
  'uk4hX58fbP0G',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"non_naturalism":475,"naturalist_realism":564,"constructivism":371,"expressivism":189,"error_theory":95,"other":207}',
  1901
);

-- normative_concepts: Normative concepts (which most fundamental?): fit,...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'SIdsU7cZWvts',
  'Normative concepts (which most fundamental?): fit, ought, reason, or value?',
  'Ethics',
  'multiple_choice',
  '["Fit","Ought","Reasons","Value","Other"]',
  0,
  '1feCIbm7BEON',
  'normative_concepts',
  '{"fit":"Fit","ought":"Ought","reasons":"Reasons","value":"Value","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'BqSzSV512Y4Y',
  'SIdsU7cZWvts',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"fit":130,"ought":253,"reasons":453,"value":668,"other":437}',
  1941
);

-- ought_implies_can: Ought implies can: yes or no?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'AgRwj1modcAp',
  'Ought implies can: yes or no?',
  'Ethics',
  'multiple_choice',
  '["Yes","No","Other"]',
  0,
  '1feCIbm7BEON',
  'ought_implies_can',
  '{"yes":"Yes","no":"No","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'b80aPu48GK2E',
  'AgRwj1modcAp',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"yes":1123,"no":505,"other":161}',
  1789
);

-- philosophical_knowledge: Philosophical knowledge (how much is there?): none...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '3H9X8HBZeoHL',
  'Philosophical knowledge (how much is there?): none, a little, or a lot?',
  'Metaphilosophy',
  'multiple_choice',
  '["None","A Little","A Lot","Other"]',
  0,
  '1feCIbm7BEON',
  'philosophical_knowledge',
  '{"none":"None","a_little":"A Little","a_lot":"A Lot","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'foCRwnkiE8MQ',
  '3H9X8HBZeoHL',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"none":64,"a_little":580,"a_lot":1003,"other":145}',
  1792
);

-- plato: Plato (what is his view?): knowledge only of forms...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'DUz47K27rP9f',
  'Plato (what is his view?): knowledge only of forms, or knowledge also of concrete things?',
  'History of Philosophy',
  'multiple_choice',
  '["Knowledge Only Of Forms","Knowledge Also Of Concrete Things","Other"]',
  0,
  '1feCIbm7BEON',
  'plato',
  '{"knowledge_only_of_forms":"Knowledge Only Of Forms","knowledge_also_of_concrete_things":"Knowledge Also Of Concrete Things","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '0XzDVB4o97hH',
  'DUz47K27rP9f',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"knowledge_only_of_forms":942,"knowledge_also_of_concrete_things":503,"other":343}',
  1788
);

-- politics: Politics: capitalism or socialism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'SfWRyP1CVB5n',
  'Politics: capitalism or socialism?',
  'Political Philosophy',
  'multiple_choice',
  '["Capitalism","Socialism","Other"]',
  0,
  '1feCIbm7BEON',
  'politics',
  '{"capitalism":"Capitalism","socialism":"Socialism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'WBCqONzTWNSN',
  'SfWRyP1CVB5n',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"capitalism":527,"socialism":946,"other":345}',
  1818
);

-- possible_worlds: Possible worlds: abstract, concrete, or nonexisten...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'RTp1iwW3pr4d',
  'Possible worlds: abstract, concrete, or nonexistent?',
  'Metaphysics',
  'multiple_choice',
  '["Abstract","Concrete","Nonexistent","Other"]',
  0,
  '1feCIbm7BEON',
  'possible_worlds',
  '{"abstract":"Abstract","concrete":"Concrete","nonexistent":"Nonexistent","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6kBxOrpyf9t4',
  'RTp1iwW3pr4d',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"abstract":978,"concrete":82,"nonexistent":536,"other":195}',
  1791
);

-- practical_reason: Practical reason: Aristotelian, Humean, or Kantian...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'uyhMa61yuw0S',
  'Practical reason: Aristotelian, Humean, or Kantian?',
  'Ethics',
  'multiple_choice',
  '["Aristotelian","Humean","Kantian","Other"]',
  0,
  '1feCIbm7BEON',
  'practical_reason',
  '{"aristotelian":"Aristotelian","humean":"Humean","kantian":"Kantian","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '5Kk6PgJhQ81Z',
  'uyhMa61yuw0S',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"aristotelian":691,"humean":546,"kantian":337,"other":287}',
  1861
);

-- principle_of_sufficient_reason: Principle of sufficient reason: true or false?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'a6jgLOYe0Ukn',
  'Principle of sufficient reason: true or false?',
  'Metaphysics',
  'multiple_choice',
  '["True","False","Other"]',
  0,
  '1feCIbm7BEON',
  'principle_of_sufficient_reason',
  '{"true":"True","false":"False","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'dp8WfaXHwIq3',
  'a6jgLOYe0Ukn',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"true":641,"false":816,"other":330}',
  1787
);

-- properties: Properties: classes, immanent universals, transcen...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'GZcor62tVxEe',
  'Properties: classes, immanent universals, transcendent universals, tropes, or nonexistent?',
  'Metaphysics',
  'multiple_choice',
  '["Classes","Immanent Universals","Transcendent Universals","Tropes","Nonexistent","Other"]',
  0,
  '1feCIbm7BEON',
  'properties',
  '{"classes":"Classes","immanent_universals":"Immanent Universals","transcendent_universals":"Transcendent Universals","tropes":"Tropes","nonexistent":"Nonexistent","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '2R4d0CNnFzuR',
  'GZcor62tVxEe',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"classes":205,"immanent_universals":368,"transcendent_universals":353,"tropes":273,"nonexistent":145,"other":519}',
  1863
);

-- propositional_attitudes: Propositional attitudes: dispositional, phenomenal...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'eizBvS3LeV22',
  'Propositional attitudes: dispositional, phenomenal, representational, or nonexistent?',
  'Philosophy of Mind',
  'multiple_choice',
  '["Dispositional","Phenomenal","Representational","Nonexistent","Other"]',
  0,
  '1feCIbm7BEON',
  'propositional_attitudes',
  '{"dispositional":"Dispositional","phenomenal":"Phenomenal","representational":"Representational","nonexistent":"Nonexistent","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '1qtVOifIcE3K',
  'eizBvS3LeV22',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"dispositional":562,"phenomenal":123,"representational":830,"nonexistent":62,"other":337}',
  1914
);

-- propositions: Propositions: sets, structured entities, simple en...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'GBlocLoYfETg',
  'Propositions: sets, structured entities, simple entities, acts, or nonexistent?',
  'Philosophy of Language',
  'multiple_choice',
  '["Sets","Structured Entities","Simple Entities","Acts","Nonexistent","Other"]',
  0,
  '1feCIbm7BEON',
  'propositions',
  '{"sets":"Sets","structured_entities":"Structured Entities","simple_entities":"Simple Entities","acts":"Acts","nonexistent":"Nonexistent","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'vg3oQbZHssNi',
  'GBlocLoYfETg',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"sets":150,"structured_entities":684,"simple_entities":123,"acts":145,"nonexistent":275,"other":446}',
  1823
);

-- quantum_mechanics: Quantum mechanics: collapse, hidden-variables, man...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '7btH3t9ry68W',
  'Quantum mechanics: collapse, hidden-variables, many-worlds, or epistemic?',
  'Philosophy of Science',
  'multiple_choice',
  '["Collapse","Hidden Variables","Many Worlds","Epistemic","Other"]',
  0,
  '1feCIbm7BEON',
  'quantum_mechanics',
  '{"collapse":"Collapse","hidden_variables":"Hidden Variables","many_worlds":"Many Worlds","epistemic":"Epistemic","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '3fQmKqCGsCNy',
  '7btH3t9ry68W',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"collapse":305,"hidden_variables":391,"many_worlds":346,"epistemic":228,"other":571}',
  1841
);

-- race_categories: Race categories: preserve, revise, or eliminate?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '4MFwVgTEqf56',
  'Race categories: preserve, revise, or eliminate?',
  'Social Philosophy',
  'multiple_choice',
  '["Preserve","Revise","Eliminate","Other"]',
  0,
  '1feCIbm7BEON',
  'race_categories',
  '{"preserve":"Preserve","revise":"Revise","eliminate":"Eliminate","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'Uf1tnFUPCoXF',
  '4MFwVgTEqf56',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"preserve":146,"revise":577,"eliminate":721,"other":371}',
  1815
);

-- rational_disagreement: Rational disagreement (can two people with same ev...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'B80Hh1tXRZjZ',
  'Rational disagreement (can two people with same evidence rationally disagree?): uniqueness or permissiveness?',
  'Epistemology',
  'multiple_choice',
  '["Non Permissivism","Permissivism","Other"]',
  0,
  '1feCIbm7BEON',
  'rational_disagreement',
  '{"non_permissivism":"Non Permissivism","permissivism":"Permissivism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'WDNPGwL4xgvj',
  'B80Hh1tXRZjZ',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"non_permissivism":346,"permissivism":1253,"other":187}',
  1786
);

-- response_to_external_world_skepticism: Response to external-world skepticism (which is st...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'mwkGGkGV0sKV',
  'Response to external-world skepticism (which is strongest?): abductive, contextualist, dogmatist, epistemic externalist, semantic externalist, or pragmatic?',
  'Epistemology',
  'multiple_choice',
  '["Abductive","Contextualist","Dogmatist","Epistemic Externalist","Semantic Externalist","Pragmatic","Other"]',
  0,
  '1feCIbm7BEON',
  'response_to_external_world_skepticism',
  '{"abductive":"Abductive","contextualist":"Contextualist","dogmatist":"Dogmatist","epistemic_externalist":"Epistemic Externalist","semantic_externalist":"Semantic Externalist","pragmatic":"Pragmatic","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'sOcPjA9eQxMu',
  'mwkGGkGV0sKV',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"abductive":394,"contextualist":191,"dogmatist":239,"epistemic_externalist":337,"semantic_externalist":150,"pragmatic":407,"other":307}',
  2025
);

-- semantic_content: Semantic content (which expressions context-depend...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'zVHtzaWCKFLc',
  'Semantic content (which expressions context-dependent?): minimalism, moderate contextualism, or radical contextualism?',
  'Philosophy of Language',
  'multiple_choice',
  '["Minimalism","Moderate Contextualism","Radical Contextualism","Other"]',
  0,
  '1feCIbm7BEON',
  'semantic_content',
  '{"minimalism":"Minimalism","moderate_contextualism":"Moderate Contextualism","radical_contextualism":"Radical Contextualism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'm6kMjQjlBNFG',
  'zVHtzaWCKFLc',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"minimalism":168,"moderate_contextualism":937,"radical_contextualism":455,"other":234}',
  1794
);

-- sleeping_beauty: Sleeping beauty (woken once if heads, twice if tai...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '6XdE2vsPf6Yh',
  'Sleeping beauty (woken once if heads, twice if tails, credence in heads on waking?): one-third or one-half?',
  'Epistemology',
  'multiple_choice',
  '["One Third","One Half","Other"]',
  0,
  '1feCIbm7BEON',
  'sleeping_beauty',
  '{"one_third":"One Third","one_half":"One Half","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'hDOf3sfHxxwL',
  '6XdE2vsPf6Yh',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"one_third":494,"one_half":332,"other":953}',
  1779
);

-- spacetime: Spacetime: relationism or substantivalism?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'tenaXPpqfzXa',
  'Spacetime: relationism or substantivalism?',
  'Philosophy of Science',
  'multiple_choice',
  '["Relationism","Substantivalism","Other"]',
  0,
  '1feCIbm7BEON',
  'spacetime',
  '{"relationism":"Relationism","substantivalism":"Substantivalism","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'drQvaiF9lQEK',
  'tenaXPpqfzXa',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"relationism":810,"substantivalism":491,"other":482}',
  1783
);

-- statue_and_lump: Statue and lump: one thing or two things?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  's1EmVDPBbT5w',
  'Statue and lump: one thing or two things?',
  'Metaphysics',
  'multiple_choice',
  '["One Thing","Two Things","Other"]',
  0,
  '1feCIbm7BEON',
  'statue_and_lump',
  '{"one_thing":"One Thing","two_things":"Two Things","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '6j1The6mZcKo',
  's1EmVDPBbT5w',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"one_thing":537,"two_things":746,"other":502}',
  1785
);

-- temporal_ontology: Temporal ontology: presentism, eternalism, or grow...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'EjnSUHePXcOQ',
  'Temporal ontology: presentism, eternalism, or growing block?',
  'Metaphysics',
  'multiple_choice',
  '["Presentism","Eternalism","Growing Block","Other"]',
  0,
  '1feCIbm7BEON',
  'temporal_ontology',
  '{"presentism":"Presentism","eternalism":"Eternalism","growing_block":"Growing Block","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'RDRt3huFhqSw',
  'EjnSUHePXcOQ',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"presentism":328,"eternalism":712,"growing_block":303,"other":444}',
  1787
);

-- theory_of_reference: Theory of reference: causal, descriptive, or defla...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'v20FOZffh1xp',
  'Theory of reference: causal, descriptive, or deflationary?',
  'Philosophy of Language',
  'multiple_choice',
  '["Causal","Descriptive","Deflationary","Other"]',
  0,
  '1feCIbm7BEON',
  'theory_of_reference',
  '{"causal":"Causal","descriptive":"Descriptive","deflationary":"Deflationary","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'OdCpXdTlSyOb',
  'v20FOZffh1xp',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"causal":826,"descriptive":394,"deflationary":270,"other":386}',
  1876
);

-- time_travel: Time travel: metaphysically possible or metaphysic...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'Ip2v7Qg7dROL',
  'Time travel: metaphysically possible or metaphysically impossible?',
  'Metaphysics',
  'multiple_choice',
  '["Metaphysically possible","Metaphysically impossible","Other"]',
  0,
  '1feCIbm7BEON',
  'time_travel',
  '{"metaphysically_possible":"Metaphysically possible","metaphysically_impossible":"Metaphysically impossible","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'P6CFBJIDyYHc',
  'Ip2v7Qg7dROL',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"metaphysically_possible":755,"metaphysically_impossible":732,"other":298}',
  1785
);

-- true_contradictions: True contradictions: impossible, possible but non-...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'CPh55WcasYZP',
  'True contradictions: impossible, possible but non-actual, or actual?',
  'Logic',
  'multiple_choice',
  '["Impossible","Possible But Non Actual","Actual","Other"]',
  0,
  '1feCIbm7BEON',
  'true_contradictions',
  '{"impossible":"Impossible","possible_but_non_actual":"Possible But Non Actual","actual":"Actual","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'KfpZMK7cdiOs',
  'CPh55WcasYZP',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"impossible":1274,"possible_but_non_actual":86,"actual":221,"other":209}',
  1790
);

-- units_of_selection: Units of natural selection: genes or organisms?...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'k5SrEiIQgbhK',
  'Units of natural selection: genes or organisms?',
  'Philosophy of Science',
  'multiple_choice',
  '["Genes","Organisms","Other"]',
  0,
  '1feCIbm7BEON',
  'units_of_selection',
  '{"genes":"Genes","organisms":"Organisms","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'IOK3Ih5dqXZm',
  'k5SrEiIQgbhK',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"genes":776,"organisms":769,"other":416}',
  1961
);

-- values_in_science: Values in science: necessarily value-free, value-l...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'CyUfgZpEsNe5',
  'Values in science: necessarily value-free, value-laden, or both?',
  'Philosophy of Science',
  'multiple_choice',
  '["Necessarily Value Free","Necessarily Value Laden","Can Be Either","Other"]',
  0,
  '1feCIbm7BEON',
  'values_in_science',
  '{"necessarily_value_free":"Necessarily Value Free","necessarily_value_laden":"Necessarily Value Laden","can_be_either":"Can Be Either","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'cxO7K7lHdNcJ',
  'CyUfgZpEsNe5',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"necessarily_value_free":316,"necessarily_value_laden":785,"can_be_either":555,"other":129}',
  1785
);

-- well_being: Well-being: hedonism, desire satisfaction, or obje...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  'BRcGHyS9J7gy',
  'Well-being: hedonism, desire satisfaction, or objective list?',
  'Ethics',
  'multiple_choice',
  '["Hedonism Experientialism","Desire Satisfaction","Objective List","Other"]',
  0,
  '1feCIbm7BEON',
  'well_being',
  '{"hedonism_experientialism":"Hedonism Experientialism","desire_satisfaction":"Desire Satisfaction","objective_list":"Objective List","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  'r3xFfTk1eG2j',
  'BRcGHyS9J7gy',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"hedonism_experientialism":227,"desire_satisfaction":332,"objective_list":950,"other":359}',
  1868
);

-- wittgenstein: Wittgenstein (which do you prefer?): early or late...
INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '5pcfQ0verijr',
  'Wittgenstein (which do you prefer?): early or late?',
  'History of Philosophy',
  'multiple_choice',
  '["Early","Late","Other"]',
  0,
  '1feCIbm7BEON',
  'wittgenstein',
  '{"early":"Early","late":"Late","other":"Other"}'
);
INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '8sbonuNvCJnb',
  '5pcfQ0verijr',
  '1feCIbm7BEON',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"early":439,"late":1026,"other":307}',
  1772
);
