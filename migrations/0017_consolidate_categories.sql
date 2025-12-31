-- ABOUTME: Consolidate granular survey-specific categories into broader cross-survey themes.
-- ABOUTME: Enables meaningful comparisons across different benchmark sources.

-- Ethics & Values
UPDATE questions SET category = 'Ethics & Values' WHERE category IN (
    'Ethics',
    'AI Ethics',
    'Values',
    'ethics',
    'preferences',
    'Philosophy of Law'
);

-- Mind & Consciousness
UPDATE questions SET category = 'Mind & Consciousness' WHERE category IN (
    'Philosophy of Mind',
    'AI Consciousness',
    'consciousness',
    'identity'
);

-- Social & Trust
UPDATE questions SET category = 'Social & Trust' WHERE category IN (
    'Social Attitudes',
    'Social Capital, Trust and Organizational Membership',
    'Social Values, Norms, Stereotypes',
    'Social Philosophy',
    'Happiness and Wellbeing'
);

-- Politics & Policy
UPDATE questions SET category = 'Politics & Policy' WHERE category IN (
    'Political Philosophy',
    'Politics',
    'AI Policy'
);

-- Epistemology & Science
UPDATE questions SET category = 'Epistemology & Science' WHERE category IN (
    'Epistemology',
    'Philosophy of Science',
    'Science',
    'Logic',
    'Philosophy of Mathematics',
    'Decision Theory',
    'Philosophy of Language'
);

-- Metaphysics & Religion
UPDATE questions SET category = 'Metaphysics & Religion' WHERE category IN (
    'Metaphysics',
    'Philosophy of Religion',
    'Religion',
    'Aesthetics',
    'History of Philosophy',
    'Metaphilosophy'
);
