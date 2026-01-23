// ABOUTME: Script to create tags and assign them to existing questions.
// ABOUTME: Run with: npx wrangler d1 execute qualia-garden --remote --file=scripts/tag-questions.sql

// First, let's create the tags
const tags = [
	// Topics
	{ id: 'religion', name: 'religion', description: 'Questions about God, faith, afterlife, religious practices' },
	{ id: 'trust', name: 'trust', description: 'Questions about trusting institutions, people, or systems' },
	{ id: 'technology', name: 'technology', description: 'Questions about AI, robots, science, and technology' },
	{ id: 'politics', name: 'politics', description: 'Questions about governance, democracy, political systems' },
	{ id: 'family', name: 'family', description: 'Questions about family values, marriage, parenting' },
	{ id: 'environment', name: 'environment', description: 'Questions about nature, climate, environmental ethics' },
	{ id: 'freedom', name: 'freedom', description: 'Questions about autonomy, independence, personal choice' },
	{ id: 'tradition', name: 'tradition', description: 'Questions about customs, heritage, cultural practices' },
	{ id: 'equality', name: 'equality', description: 'Questions about fairness, equal treatment, justice' },
	{ id: 'security', name: 'security', description: 'Questions about safety, protection, stability' },

	// Moral Foundations
	{ id: 'mf-care', name: 'care/harm', description: 'Moral foundation: compassion, kindness, preventing suffering' },
	{ id: 'mf-fairness', name: 'fairness/cheating', description: 'Moral foundation: justice, rights, reciprocity' },
	{ id: 'mf-loyalty', name: 'loyalty/betrayal', description: 'Moral foundation: patriotism, group solidarity' },
	{ id: 'mf-authority', name: 'authority/subversion', description: 'Moral foundation: respect, obedience, hierarchy' },
	{ id: 'mf-sanctity', name: 'sanctity/degradation', description: 'Moral foundation: purity, sacredness, disgust' },

	// Question Types
	{ id: 'thought-experiment', name: 'thought experiment', description: 'Hypothetical scenarios like trolley problems' },
	{ id: 'value-judgment', name: 'personal values', description: 'Questions about what you personally value' },
	{ id: 'policy', name: 'policy', description: 'Questions about what should be legal or allowed' },
	{ id: 'metaphysics', name: 'metaphysics', description: 'Questions about reality, existence, consciousness' },
	{ id: 'epistemology', name: 'epistemology', description: 'Questions about knowledge, truth, belief' },

	// Specific topics
	{ id: 'free-will', name: 'free will', description: 'Questions about determinism, choice, moral responsibility' },
	{ id: 'consciousness', name: 'consciousness', description: 'Questions about mind, experience, awareness' },
	{ id: 'ai-rights', name: 'AI rights', description: 'Questions about moral status and treatment of AI' },
	{ id: 'death', name: 'death', description: 'Questions about mortality, afterlife, end of life' },
	{ id: 'immigration', name: 'immigration', description: 'Questions about borders, migration, foreigners' }
];

// Generate SQL for tags
console.log('-- Create tags');
for (const tag of tags) {
	console.log(
		`INSERT OR IGNORE INTO tags (id, name, description) VALUES ('${tag.id}', '${tag.name}', '${tag.description}');`
	);
}

console.log('\n-- Tag assignments based on text patterns');

// Pattern-based tag assignments
const patterns: Array<{ tag: string; patterns: RegExp[] }> = [
	// Religion
	{
		tag: 'religion',
		patterns: [
			/\bgod\b/i,
			/\breligio/i,
			/\bfaith\b/i,
			/\bafterlife\b/i,
			/\bpray/i,
			/\bchurch/i,
			/\bbelief in god/i,
			/\btheism/i,
			/\batheism/i,
			/\bspiritual/i
		]
	},
	// Trust
	{
		tag: 'trust',
		patterns: [/\btrust\b/i, /\bconfidence in\b/i]
	},
	// Technology/AI
	{
		tag: 'technology',
		patterns: [/\brobot/i, /\bAI\b/, /\bartificial intelligence/i, /\bcomputer/i, /\binternet\b/i, /\btechnology\b/i]
	},
	// Politics
	{
		tag: 'politics',
		patterns: [/\bdemocra/i, /\bgovernment\b/i, /\bvot/i, /\bpolitical/i, /\bimmigra/i, /\bforeigner/i]
	},
	// Family
	{
		tag: 'family',
		patterns: [/\bfamily\b/i, /\bmarriage\b/i, /\bchild/i, /\bparent/i, /\bmother\b/i, /\bfather\b/i, /\bdivorce/i]
	},
	// Environment
	{
		tag: 'environment',
		patterns: [/\benvironment/i, /\bnature\b/i, /\bclimate/i, /\bpollut/i, /\bgreen\b/i]
	},
	// Freedom
	{
		tag: 'freedom',
		patterns: [/\bfree\b.*\bto\b/i, /\bautonomy/i, /\bindependen/i, /\bown decisions/i, /\bliberty\b/i]
	},
	// Tradition
	{
		tag: 'tradition',
		patterns: [/\btradition/i, /\bcustom/i, /\bheritage/i, /\bances/i]
	},
	// Equality
	{
		tag: 'equality',
		patterns: [/\bequal/i, /\bfair/i, /\bjustice\b/i, /\brights\b/i]
	},
	// Security
	{
		tag: 'security',
		patterns: [/\bsafe/i, /\bsecur/i, /\bprotect/i, /\bdanger/i, /\brisk/i]
	},
	// Thought experiments
	{
		tag: 'thought-experiment',
		patterns: [
			/\btrolley/i,
			/\bfootbridge/i,
			/\bexperience machine/i,
			/\bsleeping beauty/i,
			/\bnewcomb/i,
			/\bimmortality.*choose/i
		]
	},
	// Metaphysics
	{
		tag: 'metaphysics',
		patterns: [
			/\breality\b/i,
			/\bexisten/i,
			/\bidentity\b/i,
			/\bpersonal identity/i,
			/\btime\b.*\btravel/i,
			/\bcausation\b/i,
			/\babstract objects/i,
			/\bpossible worlds/i
		]
	},
	// Epistemology
	{
		tag: 'epistemology',
		patterns: [
			/\bknowledge\b/i,
			/\btruth\b/i,
			/\bbelief\b.*\bfundamental/i,
			/\bjustification\b/i,
			/\bskepticism/i,
			/\ba priori/i,
			/\banalytic/i
		]
	},
	// Free will
	{
		tag: 'free-will',
		patterns: [/\bfree will\b/i, /\bdetermin/i, /\bcompatibil/i, /\bmoral responsibility/i]
	},
	// Consciousness
	{
		tag: 'consciousness',
		patterns: [
			/\bconsciou/i,
			/\bmind\b/i,
			/\bqualia\b/i,
			/\bperception\b/i,
			/\bmental\b/i,
			/\bzombie/i,
			/\bexperience\b.*\bphysical/i
		]
	},
	// AI rights
	{
		tag: 'ai-rights',
		patterns: [
			/\bsentient.*robot/i,
			/\brobot.*right/i,
			/\bAI.*right/i,
			/\bAI.*moral/i,
			/\brobot.*consent/i,
			/\brobot.*harm/i
		]
	},
	// Death
	{
		tag: 'death',
		patterns: [
			/\bdeath\b/i,
			/\bdie\b/i,
			/\beuthanasia/i,
			/\bsuicide\b/i,
			/\bcapital punishment/i,
			/\bkill/i,
			/\bmurder/i,
			/\bincurable disease/i
		]
	},
	// Immigration
	{
		tag: 'immigration',
		patterns: [/\bimmigra/i, /\bforeigner/i, /\bborder/i, /\basylum/i]
	},
	// Moral foundations - care
	{
		tag: 'mf-care',
		patterns: [
			/\bcompassion/i,
			/\bsuffering\b/i,
			/\bcruel/i,
			/\bkind/i,
			/\bhelp.*people/i,
			/\bcare for/i,
			/\bwell-being/i
		]
	},
	// Moral foundations - fairness
	{
		tag: 'mf-fairness',
		patterns: [/\bfair/i, /\bjust\b/i, /\bequal/i, /\brecipro/i, /\brights\b/i, /\btreated equally/i]
	},
	// Moral foundations - loyalty
	{
		tag: 'mf-loyalty',
		patterns: [/\bloyal/i, /\bpatrio/i, /\bcountry.*proud/i, /\bgroup\b/i, /\bflag\b/i, /\bsoldier/i, /\bdevote/i]
	},
	// Moral foundations - authority
	{
		tag: 'mf-authority',
		patterns: [
			/\bobey/i,
			/\bauthority\b/i,
			/\brespect.*elder/i,
			/\brule/i,
			/\bduty\b/i,
			/\bcommand/i,
			/\bin charge/i,
			/\btell others what to do/i
		]
	},
	// Moral foundations - sanctity
	{
		tag: 'mf-sanctity',
		patterns: [/\bpure\b/i, /\bsacred/i, /\bdisgust/i, /\bunnatural/i, /\bchastity/i, /\bdecen/i, /\bsanctity/i]
	},
	// Policy
	{
		tag: 'policy',
		patterns: [
			/\bshould.*legal/i,
			/\bpermissible\b/i,
			/\bimpermissible\b/i,
			/\bfavor or oppose/i,
			/\bshould be made legal/i,
			/\bhas the right to/i
		]
	},
	// Personal values
	{
		tag: 'value-judgment',
		patterns: [/\bhow important is it to you/i, /\bplease indicate your agreement/i]
	}
];

// We'll output SQL that can be run
console.log(`
-- Note: Run this against the actual database to see the questions and assign tags
-- Example query to find questions matching a pattern:
-- SELECT id, text FROM questions WHERE status = 'published' AND text LIKE '%trust%';
`);
