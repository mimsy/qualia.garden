-- Fix PhilPapers distributions corrupted by normalize script
-- The normalize script's fuzzy matching incorrectly mapped multiple keys to the same option

-- zombies: "metaphysically_possible" was incorrectly mapped to option 2 instead of 3
-- Correct: 1=Inconceivable, 2=Conceivable but not metaphysically possible, 3=Metaphysically possible, 4=Other
UPDATE human_response_distributions
SET distribution = '{"1":293,"2":652,"3":436,"4":402}'
WHERE id = 'm8jA3WNjGoag';

-- analysis_of_knowledge: "other" was incorrectly mapped to option 2 instead of 4
-- Correct: 1=Justified True Belief, 2=Other Analysis, 3=No Analysis, 4=Other
UPDATE human_response_distributions
SET distribution = '{"1":421,"2":575,"3":546,"4":248}'
WHERE id = 'kGGz0mUuAhPR';
