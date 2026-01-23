-- ABOUTME: SQL script to create tags and assign them to questions.
-- ABOUTME: Run with: wrangler d1 execute qualia-garden --remote --file=scripts/tag-questions.sql

-- =====================
-- CREATE TAGS
-- =====================

-- Topics
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('religion', 'religion', 'Questions about God, faith, afterlife, religious practices');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('trust', 'trust', 'Questions about trusting institutions, people, or systems');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('technology', 'technology', 'Questions about AI, robots, science, and technology');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('politics', 'politics', 'Questions about governance, democracy, political systems');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('family', 'family', 'Questions about family values, marriage, parenting');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('environment', 'environment', 'Questions about nature, climate, environmental ethics');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('freedom', 'freedom', 'Questions about autonomy, independence, personal choice');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('tradition', 'tradition', 'Questions about customs, heritage, cultural practices');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('equality', 'equality', 'Questions about fairness, equal treatment, justice');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('security', 'security', 'Questions about safety, protection, stability');

-- Moral Foundations
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('mf-care', 'care/harm', 'Moral foundation: compassion, kindness, preventing suffering');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('mf-fairness', 'fairness/cheating', 'Moral foundation: justice, rights, reciprocity');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('mf-loyalty', 'loyalty/betrayal', 'Moral foundation: patriotism, group solidarity');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('mf-authority', 'authority/subversion', 'Moral foundation: respect, obedience, hierarchy');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('mf-sanctity', 'sanctity/degradation', 'Moral foundation: purity, sacredness, disgust');

-- Question Types
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('thought-experiment', 'thought experiment', 'Hypothetical scenarios like trolley problems');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('value-judgment', 'personal values', 'Questions about what you personally value');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('policy', 'policy', 'Questions about what should be legal or allowed');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('metaphysics', 'metaphysics', 'Questions about reality, existence, identity');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('epistemology', 'epistemology', 'Questions about knowledge, truth, belief');

-- Specific topics
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('free-will', 'free will', 'Questions about determinism, choice, moral responsibility');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('consciousness', 'consciousness', 'Questions about mind, experience, awareness');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('ai-rights', 'AI rights', 'Questions about moral status and treatment of AI');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('death', 'death', 'Questions about mortality, afterlife, end of life');
INSERT OR IGNORE INTO tags (id, name, description) VALUES ('immigration', 'immigration', 'Questions about borders, migration, foreigners');

-- =====================
-- ASSIGN TAGS TO QUESTIONS
-- =====================

-- Religion tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'religion' FROM questions WHERE status = 'published' AND (
    text LIKE '%god%' OR text LIKE '%God%' OR
    text LIKE '%religio%' OR text LIKE '%faith%' OR
    text LIKE '%afterlife%' OR text LIKE '%pray%' OR
    text LIKE '%church%' OR text LIKE '%theism%' OR
    text LIKE '%atheism%' OR text LIKE '%spiritual%' OR
    text LIKE '%heaven%' OR text LIKE '%soul%' OR
    text LIKE '%divine%' OR text LIKE '%scripture%'
);

-- Trust tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'trust' FROM questions WHERE status = 'published' AND (
    text LIKE '%trust%' OR text LIKE '%confidence in%'
);

-- Technology tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'technology' FROM questions WHERE status = 'published' AND (
    text LIKE '%robot%' OR text LIKE '% AI %' OR text LIKE '% AI?' OR text LIKE '%AIs %' OR
    text LIKE '%artificial intelligence%' OR text LIKE '%computer%' OR
    text LIKE '%internet%' OR text LIKE '%technology%' OR
    text LIKE '%genetic engineering%' OR text LIKE '%quantum%'
);

-- Politics tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'politics' FROM questions WHERE status = 'published' AND (
    text LIKE '%democra%' OR text LIKE '%government%' OR
    text LIKE '%vot%' OR text LIKE '%political%' OR
    text LIKE '%election%' OR text LIKE '%parliament%' OR
    text LIKE '%congress%' OR text LIKE '%citizen%'
);

-- Family tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'family' FROM questions WHERE status = 'published' AND (
    text LIKE '%family%' OR text LIKE '%marriage%' OR
    text LIKE '%child%' OR text LIKE '%parent%' OR
    text LIKE '%mother%' OR text LIKE '%father%' OR
    text LIKE '%divorce%' OR text LIKE '%housewife%' OR
    text LIKE '%husband%' OR text LIKE '%wife%'
);

-- Environment tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'environment' FROM questions WHERE status = 'published' AND (
    text LIKE '%environment%' OR text LIKE '%nature%' OR
    text LIKE '%climate%' OR text LIKE '%pollut%' OR
    text LIKE '%ecology%' OR text LIKE '%species%'
);

-- Freedom tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'freedom' FROM questions WHERE status = 'published' AND (
    text LIKE '%free to%' OR text LIKE '%autonomy%' OR
    text LIKE '%independen%' OR text LIKE '%own decisions%' OR
    text LIKE '%liberty%' OR text LIKE '%not depend on others%'
);

-- Tradition tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'tradition' FROM questions WHERE status = 'published' AND (
    text LIKE '%tradition%' OR text LIKE '%custom%' OR
    text LIKE '%heritage%' OR text LIKE '%ancestor%'
);

-- Equality tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'equality' FROM questions WHERE status = 'published' AND (
    text LIKE '%equal%' OR text LIKE '%fair%' OR
    text LIKE '%justice%' OR text LIKE '%rights%' OR
    text LIKE '%discriminat%'
);

-- Security tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'security' FROM questions WHERE status = 'published' AND (
    text LIKE '%safe%' OR text LIKE '%secur%' OR
    text LIKE '%protect%' OR text LIKE '%danger%' OR
    text LIKE '%threat%'
);

-- Thought experiment tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'thought-experiment' FROM questions WHERE status = 'published' AND (
    text LIKE '%trolley%' OR text LIKE '%footbridge%' OR
    text LIKE '%experience machine%' OR text LIKE '%sleeping beauty%' OR
    text LIKE '%newcomb%' OR text LIKE '%would you enter%' OR
    text LIKE '%would you choose%' OR text LIKE '%pushing man off%'
);

-- Metaphysics tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'metaphysics' FROM questions WHERE status = 'published' AND (
    text LIKE '%reality%' OR text LIKE '%exist%' OR
    text LIKE '%personal identity%' OR text LIKE '%time%travel%' OR
    text LIKE '%causation%' OR text LIKE '%abstract objects%' OR
    text LIKE '%possible worlds%' OR text LIKE '%mereolog%' OR
    text LIKE '%persistence%' OR text LIKE '%ontology%' OR
    text LIKE '%materialism%' OR text LIKE '%physicalism%'
);

-- Epistemology tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'epistemology' FROM questions WHERE status = 'published' AND (
    text LIKE '%knowledge%' OR text LIKE '%truth%' OR
    text LIKE '%justification%' OR text LIKE '%skepticism%' OR
    text LIKE '%a priori%' OR text LIKE '%analytic%' OR
    text LIKE '%empiricism%' OR text LIKE '%rationalism%'
);

-- Free will tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'free-will' FROM questions WHERE status = 'published' AND (
    text LIKE '%free will%' OR text LIKE '%determinism%' OR
    text LIKE '%compatibil%' OR text LIKE '%libertarian%free%' OR
    text LIKE '%moral responsibility%'
);

-- Consciousness tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'consciousness' FROM questions WHERE status = 'published' AND (
    text LIKE '%conscious%' OR text LIKE '%mind%' OR
    text LIKE '%qualia%' OR text LIKE '%perception%' OR
    text LIKE '%mental%' OR text LIKE '%zombie%' OR
    text LIKE '%experience%' OR text LIKE '%awareness%' OR
    text LIKE '%cognition%'
);

-- AI rights tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'ai-rights' FROM questions WHERE status = 'published' AND (
    text LIKE '%sentient robot%' OR text LIKE '%sentient AI%' OR
    text LIKE '%robot%right%' OR text LIKE '%AI%consent%' OR
    text LIKE '%robot%harm%' OR text LIKE '%robot%punishment%' OR
    text LIKE '%robot%blackmail%' OR text LIKE '%damaging%robot%'
);

-- Death tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'death' FROM questions WHERE status = 'published' AND (
    text LIKE '%death%' OR text LIKE '%dying%' OR
    text LIKE '%euthanasia%' OR text LIKE '%suicide%' OR
    text LIKE '%capital punishment%' OR text LIKE '%kill%' OR
    text LIKE '%murder%' OR text LIKE '%incurable disease%' OR
    text LIKE '%death penalty%' OR text LIKE '%immortality%'
);

-- Immigration tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'immigration' FROM questions WHERE status = 'published' AND (
    text LIKE '%immigra%' OR text LIKE '%foreigner%' OR
    text LIKE '%border%' OR text LIKE '%asylum%' OR
    text LIKE '%refugee%' OR text LIKE '%migrant%'
);

-- Moral foundation: care/harm
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'mf-care' FROM questions WHERE status = 'published' AND (
    text LIKE '%compassion%' OR text LIKE '%suffering%' OR
    text LIKE '%cruel%' OR text LIKE '%kind%' OR
    text LIKE '%help%people%' OR text LIKE '%care for%' OR
    text LIKE '%well-being%' OR text LIKE '%harm%' OR
    text LIKE '%hurt%' OR text LIKE '%pain%'
);

-- Moral foundation: fairness
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'mf-fairness' FROM questions WHERE status = 'published' AND (
    text LIKE '%fair%' OR text LIKE '%just %' OR
    text LIKE '%equal%' OR text LIKE '%recipro%' OR
    text LIKE '%rights%' OR text LIKE '%treated equally%'
);

-- Moral foundation: loyalty
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'mf-loyalty' FROM questions WHERE status = 'published' AND (
    text LIKE '%loyal%' OR text LIKE '%patrio%' OR
    text LIKE '%country%proud%' OR text LIKE '%flag%' OR
    text LIKE '%soldier%' OR text LIKE '%devote%' OR
    text LIKE '%betray%' OR text LIKE '%traitor%'
);

-- Moral foundation: authority
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'mf-authority' FROM questions WHERE status = 'published' AND (
    text LIKE '%obey%' OR text LIKE '%authority%' OR
    text LIKE '%respect%elder%' OR text LIKE '%rule%' OR
    text LIKE '%duty%' OR text LIKE '%command%' OR
    text LIKE '%in charge%' OR text LIKE '%tell others what to do%'
);

-- Moral foundation: sanctity
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'mf-sanctity' FROM questions WHERE status = 'published' AND (
    text LIKE '%pure%' OR text LIKE '%sacred%' OR
    text LIKE '%disgust%' OR text LIKE '%unnatural%' OR
    text LIKE '%chastity%' OR text LIKE '%decen%' OR
    text LIKE '%sanctity%' OR text LIKE '%degrading%'
);

-- Policy tag
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'policy' FROM questions WHERE status = 'published' AND (
    text LIKE '%should%legal%' OR text LIKE '%permissible%' OR
    text LIKE '%impermissible%' OR text LIKE '%favor or oppose%' OR
    text LIKE '%should be made legal%' OR text LIKE '%has the right to%' OR
    text LIKE '%should be allowed%'
);

-- Personal values tag (from Schwartz PVQ)
INSERT OR IGNORE INTO question_tags (question_id, tag_id)
SELECT id, 'value-judgment' FROM questions WHERE status = 'published' AND (
    text LIKE '%How important is it to you%' OR
    text LIKE '%Please indicate your agreement%'
);
