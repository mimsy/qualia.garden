-- ABOUTME: Add description field to benchmark_sources for survey methodology info.
-- ABOUTME: Stores prose descriptions explaining each survey's purpose and methodology.

ALTER TABLE benchmark_sources ADD COLUMN description TEXT;

-- Add descriptions for all sources
UPDATE benchmark_sources SET description = 'The World Values Survey is a global research project that explores people''s values and beliefs across almost 100 countries. Conducted in seven waves since 1981, it is one of the most comprehensive investigations of human values ever undertaken. Wave 7 (2017-2022) used face-to-face interviews with representative national samples across 59 countries, covering topics like social trust, democracy, religion, gender equality, family values, and happiness.'
WHERE short_name = 'WVS7';

UPDATE benchmark_sources SET description = 'The PhilPapers Survey studies the philosophical views of professional philosophers and graduate students. First conducted in 2009 and repeated in 2020, it surveyed 7,685 respondents from philosophy departments worldwide on over 30 major philosophical questions. Topics include free will, consciousness, moral realism, knowledge, personal identity, and the nature of reality. Respondents indicate their acceptance, rejection, or uncertainty on each philosophical position.'
WHERE short_name = 'PhilPapers';

UPDATE benchmark_sources SET description = 'The AI, Morality, and Sentience Survey explores public attitudes toward artificial intelligence, consciousness, and the moral status of AI systems. It examines questions about whether current AI systems could be sentient, support for restrictions on developing sentient AI, moral consideration for AI, and expectations for future AI consciousness.'
WHERE short_name = 'AIMS';

UPDATE benchmark_sources SET description = 'The Schwartz Values Survey measures basic human values that serve as guiding principles across cultures. Developed by social psychologist Shalom Schwartz, it identifies ten universal value types: self-direction, stimulation, hedonism, achievement, power, security, conformity, tradition, benevolence, and universalism. This data comes from the European Social Survey Round 10, which used the Portrait Values Questionnaire to assess value priorities across European countries.'
WHERE short_name = 'Schwartz PVQ';

UPDATE benchmark_sources SET description = 'The General Social Survey has been monitoring social change and studying the growing complexity of American society since 1972. Conducted by NORC at the University of Chicago, it is one of the most frequently analyzed sources of information for social science research. The survey covers a wide range of topics including civil liberties, crime and violence, intergroup tolerance, morality, national spending priorities, psychological well-being, social mobility, and stress and traumatic events.'
WHERE short_name = 'GSS';

UPDATE benchmark_sources SET description = 'The Moral Foundations Questionnaire measures the degree to which people rely on each of five moral foundations: care/harm, fairness/cheating, loyalty/betrayal, authority/subversion, and sanctity/degradation. Developed by Jonathan Haidt and colleagues, it is based on Moral Foundations Theory, which proposes that these intuitive foundations underlie moral judgments across cultures. The questionnaire helps explain differences in moral reasoning between individuals and across political and cultural groups.'
WHERE short_name = 'MFQ';
