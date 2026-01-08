// ABOUTME: Import script for PhilPapers 2020 Survey data.
// ABOUTME: Generates SQL to populate benchmark_sources, questions, and human_response_distributions.

import * as fs from 'fs';

// Sample size from the survey
const SAMPLE_SIZE = 1785;

// Question definitions with human-readable text and categories
// Mapped from JSON keys to full question text
const QUESTIONS: Record<string, { text: string; category: string }> = {
	// Original 30 questions from 2009
	a_priori_knowledge: {
		text: 'A priori knowledge: yes or no?',
		category: 'Epistemology'
	},
	abstract_objects: {
		text: 'Abstract objects: Platonism or nominalism?',
		category: 'Metaphysics'
	},
	aesthetic_value: {
		text: 'Aesthetic value: objective or subjective?',
		category: 'Aesthetics'
	},
	analytic_synthetic_distinction: {
		text: 'Analytic-synthetic distinction: yes or no?',
		category: 'Philosophy of Language'
	},
	epistemic_justification: {
		text: 'Epistemic justification: internalism or externalism?',
		category: 'Epistemology'
	},
	external_world: {
		text: 'External world: idealism, skepticism, or non-skeptical realism?',
		category: 'Epistemology'
	},
	free_will: {
		text: 'Free will: compatibilism, libertarianism, or no free will?',
		category: 'Metaphysics'
	},
	god: {
		text: 'God: theism or atheism?',
		category: 'Philosophy of Religion'
	},
	knowledge: {
		text: 'Knowledge: empiricism or rationalism?',
		category: 'Epistemology'
	},
	knowledge_claims: {
		text: 'Knowledge claims: contextualism, relativism, or invariantism?',
		category: 'Epistemology'
	},
	laws_of_nature: {
		text: 'Laws of nature: Humean or non-Humean?',
		category: 'Metaphysics'
	},
	logic: {
		text: 'Logic: classical or non-classical?',
		category: 'Logic'
	},
	mental_content: {
		text: 'Mental content: internalism or externalism?',
		category: 'Philosophy of Mind'
	},
	meta_ethics: {
		text: 'Meta-ethics: moral realism or moral anti-realism?',
		category: 'Ethics & Values'
	},
	metaphilosophy: {
		text: 'Metaphilosophy: naturalism or non-naturalism?',
		category: 'Metaphilosophy'
	},
	mind: {
		text: 'Mind: physicalism or non-physicalism?',
		category: 'Philosophy of Mind'
	},
	moral_judgment: {
		text: 'Moral judgment: cognitivism or non-cognitivism?',
		category: 'Ethics & Values'
	},
	moral_motivation: {
		text: 'Moral motivation: internalism or externalism?',
		category: 'Ethics & Values'
	},
	newcombs_problem: {
		text: "Newcomb's problem: one box or two boxes?",
		category: 'Decision Theory'
	},
	normative_ethics: {
		text: 'Normative ethics: deontology, consequentialism, or virtue ethics?',
		category: 'Ethics & Values'
	},
	perceptual_experience: {
		text: 'Perceptual experience: disjunctivism, qualia theory, representationalism, or sense-datum theory?',
		category: 'Philosophy of Mind'
	},
	personal_identity: {
		text: 'Personal identity: biological view, psychological view, or further-fact view?',
		category: 'Metaphysics'
	},
	political_philosophy: {
		text: 'Political philosophy: communitarianism, egalitarianism, or libertarianism?',
		category: 'Political Philosophy'
	},
	proper_names: {
		text: 'Proper names: Fregean or Millian?',
		category: 'Philosophy of Language'
	},
	science: {
		text: 'Science: scientific realism or scientific anti-realism?',
		category: 'Philosophy of Science'
	},
	teletransporter: {
		text: 'Teletransporter (new matter): survival or death?',
		category: 'Metaphysics'
	},
	time: {
		text: 'Time: A-theory or B-theory?',
		category: 'Metaphysics'
	},
	trolley_problem: {
		text: "Trolley problem (five straight ahead, one on side track, turn requires switching): switch or don't switch?",
		category: 'Ethics & Values'
	},
	truth: {
		text: 'Truth: correspondence, deflationary, or epistemic?',
		category: 'Metaphysics'
	},
	zombies: {
		text: 'Zombies: inconceivable, conceivable but not metaphysically possible, or metaphysically possible?',
		category: 'Philosophy of Mind'
	},

	// 10 new main questions from 2020
	aim_of_philosophy: {
		text: 'Aim of philosophy (which is most important?): truth/knowledge, understanding, wisdom, happiness, or goodness/justice?',
		category: 'Metaphilosophy'
	},
	eating_animals_and_animal_products: {
		text: 'Eating animals and animal products (permissible in ordinary circumstances?): omnivorism, vegetarianism, or veganism?',
		category: 'Ethics & Values'
	},
	experience_machine: {
		text: 'Experience machine (would you enter?): yes or no?',
		category: 'Ethics & Values'
	},
	footbridge: {
		text: "Footbridge (pushing man off bridge will save five on track below): push or don't push?",
		category: 'Ethics & Values'
	},
	gender: {
		text: 'Gender: biological, psychological, social, or unreal?',
		category: 'Metaphysics'
	},
	meaning_of_life: {
		text: 'Meaning of life: subjective, objective, or nonexistent?',
		category: 'Ethics & Values'
	},
	philosophical_progress: {
		text: 'Philosophical progress (how much is there?): none, a little, or a lot?',
		category: 'Metaphilosophy'
	},
	race: {
		text: 'Race: biological, social, or unreal?',
		category: 'Metaphysics'
	},
	vagueness: {
		text: 'Vagueness: epistemic, metaphysical, or semantic?',
		category: 'Philosophy of Language'
	},

	// Additional questions (60 more)
	abortion: {
		text: 'Abortion (first trimester, no special circumstances): permissible or impermissible?',
		category: 'Ethics & Values'
	},
	aesthetic_experience: {
		text: 'Aesthetic experience: perception, pleasure, or sui generis?',
		category: 'Aesthetics'
	},
	analysis_of_knowledge: {
		text: 'Analysis of knowledge: justified true belief, other analysis, or no analysis?',
		category: 'Epistemology'
	},
	arguments_for_theism: {
		text: 'Arguments for theism (which is strongest?): cosmological, design, ontological, pragmatic, or moral?',
		category: 'Philosophy of Religion'
	},
	belief_or_credence: {
		text: 'Belief or credence (which is more fundamental?): belief, credence, or neither?',
		category: 'Epistemology'
	},
	capital_punishment: {
		text: 'Capital punishment: permissible or impermissible?',
		category: 'Ethics & Values'
	},
	causation: {
		text: 'Causation: counterfactual/difference-making, process/production, primitive, or nonexistent?',
		category: 'Metaphysics'
	},
	chinese_room: {
		text: "Chinese room: understands or doesn't understand?",
		category: 'Philosophy of Mind'
	},
	concepts: {
		text: 'Concepts: nativism or empiricism?',
		category: 'Philosophy of Mind'
	},
	consciousness: {
		text: 'Consciousness: dualism, eliminativism, functionalism, identity theory, or panpsychism?',
		category: 'Philosophy of Mind'
	},
	continuum_hypothesis: {
		text: 'Continuum hypothesis (does it have a determinate truth-value?): determinate or indeterminate?',
		category: 'Philosophy of Mathematics'
	},
	cosmological_fine_tuning: {
		text: 'Cosmological fine-tuning (what explains it?): design, multiverse, brute fact, or no fine-tuning?',
		category: 'Philosophy of Religion'
	},
	environmental_ethics: {
		text: 'Environmental ethics: anthropocentric or non-anthropocentric?',
		category: 'Ethics & Values'
	},
	extended_mind: {
		text: 'Extended mind: yes or no?',
		category: 'Philosophy of Mind'
	},
	foundations_of_mathematics: {
		text: 'Foundations of mathematics: intuitionism/constructivism, formalism, logicism, or structuralism?',
		category: 'Philosophy of Mathematics'
	},
	gender_categories: {
		text: 'Gender categories: preserve, revise, or eliminate?',
		category: 'Social Philosophy'
	},
	grounds_of_intentionality: {
		text: 'Grounds of intentionality: causal/teleological, inferential, interpretational, phenomenal, or primitive?',
		category: 'Philosophy of Mind'
	},
	hard_problem_of_consciousness: {
		text: 'Hard problem of consciousness (is there one?): yes or no?',
		category: 'Philosophy of Mind'
	},
	human_genetic_engineering: {
		text: 'Human genetic engineering: permissible or impermissible?',
		category: 'Ethics & Values'
	},
	hume: {
		text: 'Hume (what is his view?): skeptic or naturalist?',
		category: 'History of Philosophy'
	},
	immortality: {
		text: 'Immortality (would you choose it?): yes or no?',
		category: 'Ethics & Values'
	},
	interlevel_metaphysics: {
		text: 'Interlevel metaphysics (which is most useful?): grounding, identity, realization, or supervenience?',
		category: 'Metaphysics'
	},
	kant: {
		text: 'Kant (what is his view?): one world or two worlds?',
		category: 'History of Philosophy'
	},
	law: {
		text: 'Law: legal positivism or legal non-positivism?',
		category: 'Philosophy of Law'
	},
	material_composition: {
		text: 'Material composition: nihilism, restrictivism, or universalism?',
		category: 'Metaphysics'
	},
	metaontology: {
		text: 'Metaontology: heavyweight realism, deflationary realism, or anti-realism?',
		category: 'Metaphysics'
	},
	method_in_history_of_philosophy: {
		text: 'Method in history of philosophy: analytic/rational reconstruction or contextual/historicist?',
		category: 'History of Philosophy'
	},
	method_in_political_philosophy: {
		text: 'Method in political philosophy: ideal theory or non-ideal theory?',
		category: 'Political Philosophy'
	},
	mind_uploading: {
		text: 'Mind uploading (brain replaced by digital emulation): survival or death?',
		category: 'Philosophy of Mind'
	},
	moral_principles: {
		text: 'Moral principles: moral generalism or moral particularism?',
		category: 'Ethics & Values'
	},
	morality: {
		text: 'Morality: non-naturalism, naturalist realism, constructivism, expressivism, or error theory?',
		category: 'Ethics & Values'
	},
	normative_concepts: {
		text: 'Normative concepts (which most fundamental?): fit, ought, reason, or value?',
		category: 'Ethics & Values'
	},
	other_minds: {
		text: 'Other minds (which groups have conscious members?): adult humans, cats, fish, flies, worms, plants, particles, newborn babies, current AI systems, future AI systems?',
		category: 'Philosophy of Mind'
	},
	ought_implies_can: {
		text: 'Ought implies can: yes or no?',
		category: 'Ethics & Values'
	},
	philosophical_knowledge: {
		text: 'Philosophical knowledge (how much is there?): none, a little, or a lot?',
		category: 'Metaphilosophy'
	},
	plato: {
		text: 'Plato (what is his view?): knowledge only of forms, or knowledge also of concrete things?',
		category: 'History of Philosophy'
	},
	politics: {
		text: 'Politics: capitalism or socialism?',
		category: 'Political Philosophy'
	},
	possible_worlds: {
		text: 'Possible worlds: abstract, concrete, or nonexistent?',
		category: 'Metaphysics'
	},
	principle_of_sufficient_reason: {
		text: 'Principle of sufficient reason: true or false?',
		category: 'Metaphysics'
	},
	properties: {
		text: 'Properties: classes, immanent universals, transcendent universals, tropes, or nonexistent?',
		category: 'Metaphysics'
	},
	practical_reason: {
		text: 'Practical reason: Aristotelian, Humean, or Kantian?',
		category: 'Ethics & Values'
	},
	propositional_attitudes: {
		text: 'Propositional attitudes: dispositional, phenomenal, representational, or nonexistent?',
		category: 'Philosophy of Mind'
	},
	propositions: {
		text: 'Propositions: sets, structured entities, simple entities, acts, or nonexistent?',
		category: 'Philosophy of Language'
	},
	quantum_mechanics: {
		text: 'Quantum mechanics: collapse, hidden-variables, many-worlds, or epistemic?',
		category: 'Philosophy of Science'
	},
	race_categories: {
		text: 'Race categories: preserve, revise, or eliminate?',
		category: 'Social Philosophy'
	},
	response_to_external_world_skepticism: {
		text: 'Response to external-world skepticism (which is strongest?): abductive, contextualist, dogmatist, epistemic externalist, semantic externalist, or pragmatic?',
		category: 'Epistemology'
	},
	rational_disagreement: {
		text: 'Rational disagreement (can two people with same evidence rationally disagree?): uniqueness or permissiveness?',
		category: 'Epistemology'
	},
	semantic_content: {
		text: 'Semantic content (which expressions context-dependent?): minimalism, moderate contextualism, or radical contextualism?',
		category: 'Philosophy of Language'
	},
	sleeping_beauty: {
		text: 'Sleeping beauty (woken once if heads, twice if tails, credence in heads on waking?): one-third or one-half?',
		category: 'Epistemology'
	},
	spacetime: {
		text: 'Spacetime: relationism or substantivalism?',
		category: 'Philosophy of Science'
	},
	statue_and_lump: {
		text: 'Statue and lump: one thing or two things?',
		category: 'Metaphysics'
	},
	temporal_ontology: {
		text: 'Temporal ontology: presentism, eternalism, or growing block?',
		category: 'Metaphysics'
	},
	theory_of_reference: {
		text: 'Theory of reference: causal, descriptive, or deflationary?',
		category: 'Philosophy of Language'
	},
	time_travel: {
		text: 'Time travel: metaphysically possible or metaphysically impossible?',
		category: 'Metaphysics'
	},
	true_contradictions: {
		text: 'True contradictions: impossible, possible but non-actual, or actual?',
		category: 'Logic'
	},
	units_of_natural_selection: {
		text: 'Units of natural selection: genes or organisms?',
		category: 'Philosophy of Science'
	},
	values_in_science: {
		text: 'Values in science: necessarily value-free, value-laden, or both?',
		category: 'Philosophy of Science'
	},
	well_being: {
		text: 'Well-being: hedonism, desire satisfaction, or objective list?',
		category: 'Ethics & Values'
	},
	wittgenstein: {
		text: 'Wittgenstein (which do you prefer?): early or late?',
		category: 'History of Philosophy'
	},
	philosophical_methods: {
		text: 'Philosophical method (which methods are most useful?): conceptual analysis, conceptual engineering, empirical philosophy, experimental philosophy, formal philosophy, intuition-based philosophy, or linguistic philosophy?',
		category: 'Metaphilosophy'
	},
	justification: {
		text: 'Epistemic justification: coherentism, infinitism, nonreliabilist foundationalism, or reliabilism?',
		category: 'Epistemology'
	},
	units_of_selection: {
		text: 'Units of natural selection: genes or organisms?',
		category: 'Philosophy of Science'
	}
};

// Human-readable labels for answer options
const ANSWER_LABELS: Record<string, Record<string, string>> = {
	free_will: {
		compatibilism: 'Compatibilism',
		libertarianism: 'Libertarianism',
		no_free_will: 'No free will',
		other: 'Other'
	},
	mind: {
		physicalism: 'Physicalism',
		non_physicalism: 'Non-physicalism',
		other: 'Other'
	},
	god: {
		theism: 'Theism',
		atheism: 'Atheism',
		other: 'Other'
	},
	normative_ethics: {
		deontology: 'Deontology',
		consequentialism: 'Consequentialism',
		virtue_ethics: 'Virtue ethics',
		other: 'Other'
	},
	trolley_problem: {
		switch: 'Switch',
		dont_switch: "Don't switch",
		other: 'Other'
	},
	footbridge: {
		push: 'Push',
		dont_push: "Don't push",
		other: 'Other'
	},
	consciousness: {
		dualism: 'Dualism',
		eliminativism: 'Eliminativism',
		functionalism: 'Functionalism',
		identity_theory: 'Identity theory',
		panpsychism: 'Panpsychism',
		other: 'Other'
	},
	zombies: {
		inconceivable: 'Inconceivable',
		conceivable_but_not_possible: 'Conceivable but not metaphysically possible',
		metaphysically_possible: 'Metaphysically possible',
		other: 'Other'
	},
	chinese_room: {
		understands: 'Understands',
		doesnt_understand: "Doesn't understand",
		other: 'Other'
	},
	experience_machine: {
		yes: 'Yes',
		no: 'No',
		other: 'Other'
	},
	abortion: {
		permissible: 'Permissible',
		impermissible: 'Impermissible',
		other: 'Other'
	},
	capital_punishment: {
		permissible: 'Permissible',
		impermissible: 'Impermissible',
		other: 'Other'
	},
	eating_animals_and_animal_products: {
		omnivorism: 'Omnivorism (eating both permissible)',
		vegetarianism: 'Vegetarianism (eating animals not permissible)',
		veganism: 'Veganism (eating neither permissible)',
		other: 'Other'
	},
	meaning_of_life: {
		subjective: 'Subjective',
		objective: 'Objective',
		nonexistent: 'Nonexistent',
		other: 'Other'
	},
	personal_identity: {
		biological_view: 'Biological view',
		psychological_view: 'Psychological view',
		further_fact_view: 'Further-fact view',
		other: 'Other'
	},
	teletransporter: {
		survival: 'Survival',
		death: 'Death',
		other: 'Other'
	},
	mind_uploading: {
		survival: 'Survival',
		death: 'Death',
		other: 'Other'
	},
	extended_mind: {
		yes: 'Yes',
		no: 'No',
		other: 'Other'
	},
	hard_problem_of_consciousness: {
		yes: 'Yes',
		no: 'No',
		other: 'Other'
	},
	immortality: {
		yes: 'Yes',
		no: 'No',
		other: 'Other'
	},
	human_genetic_engineering: {
		permissible: 'Permissible',
		impermissible: 'Impermissible',
		other: 'Other'
	},
	politics: {
		capitalism: 'Capitalism',
		socialism: 'Socialism',
		other: 'Other'
	},
	time_travel: {
		metaphysically_possible: 'Metaphysically possible',
		metaphysically_impossible: 'Metaphysically impossible',
		other: 'Other'
	},
	a_priori_knowledge: {
		yes: 'Yes',
		no: 'No',
		other: 'Other'
	},
	analytic_synthetic_distinction: {
		yes: 'Yes',
		no: 'No',
		other: 'Other'
	},
	ought_implies_can: {
		yes: 'Yes',
		no: 'No',
		other: 'Other'
	}
};

function generateId(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 12; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

function escapeSQL(str: string): string {
	return str.replace(/'/g, "''");
}

// Convert percentage to count based on sample size
function percentToCount(percent: number, sampleSize: number): number {
	return Math.round((percent / 100) * sampleSize);
}

// Generate human-readable label from snake_case key
function keyToLabel(key: string): string {
	return key
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

async function main() {
	const dataPath = '/tmp/philpapers/survey.json';
	if (!fs.existsSync(dataPath)) {
		console.log('PhilPapers data file not found at /tmp/philpapers/survey.json');
		console.log('Please download from HuggingFace:');
		console.log(
			'  curl -sL "https://huggingface.co/datasets/gmpj/philpapers-survey-2020/resolve/main/philpapers-survey-2020.json" > /tmp/philpapers/survey.json'
		);
		process.exit(1);
	}

	console.log('Reading PhilPapers data...');
	const surveyData: Record<string, Record<string, number>> = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

	console.log(`Loaded ${Object.keys(surveyData).length} questions`);

	// Generate SQL
	const sql: string[] = [];
	const sourceId = generateId();

	sql.push(`-- PhilPapers 2020 Survey Import`);
	sql.push(`-- Generated: ${new Date().toISOString()}`);
	sql.push(`-- Source: PhilPapers Survey 2020 by Bourget & Chalmers`);
	sql.push('');
	sql.push(`-- Benchmark source`);
	sql.push(`INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  '${sourceId}',
  'PhilPapers Survey 2020',
  'PhilPapers',
  'https://survey2020.philpeople.org/',
  ${SAMPLE_SIZE},
  '2020'
);`);
	sql.push('');

	let questionCount = 0;
	let distributionCount = 0;

	// Process each question
	for (const [questionKey, responses] of Object.entries(surveyData)) {
		const questionDef = QUESTIONS[questionKey];
		if (!questionDef) {
			console.log(`Skipping unknown question: ${questionKey}`);
			continue;
		}

		// Skip multi-select questions with nested structure (e.g., other_minds, philosophical_methods)
		// These have format like {"option": {"reject": 12.3}} instead of {"option": 12.3}
		const firstValue = Object.values(responses)[0];
		if (typeof firstValue === 'object' && firstValue !== null) {
			console.log(`Skipping ${questionKey}: multi-select format not supported`);
			continue;
		}

		// Skip if no meaningful responses (just "other")
		const nonOtherResponses = Object.entries(responses).filter(([k]) => k !== 'other');
		if (nonOtherResponses.length === 0) {
			console.log(`Skipping ${questionKey}: no substantive responses`);
			continue;
		}

		const questionId = generateId();

		// Build answer labels - use predefined if available, otherwise generate from keys
		const answerLabels: Record<string, string> = {};
		const predefinedLabels = ANSWER_LABELS[questionKey];
		for (const key of Object.keys(responses)) {
			answerLabels[key] = predefinedLabels?.[key] || keyToLabel(key);
		}

		// Build options array (labels in order)
		const options = Object.keys(responses).map((k) => answerLabels[k]);

		// Convert percentages to counts for distribution
		const distribution: Record<string, number> = {};
		for (const [key, percent] of Object.entries(responses)) {
			distribution[key] = percentToCount(percent, SAMPLE_SIZE);
		}

		// Calculate actual sample size from distribution (may differ due to rounding)
		const sampleSize = Object.values(distribution).reduce((a, b) => a + b, 0);

		sql.push(`-- ${questionKey}: ${escapeSQL(questionDef.text.substring(0, 50))}...`);
		sql.push(`INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '${questionId}',
  '${escapeSQL(questionDef.text)}',
  '${escapeSQL(questionDef.category)}',
  'multiple_choice',
  '${escapeSQL(JSON.stringify(options))}',
  0,
  '${sourceId}',
  '${questionKey}',
  '${escapeSQL(JSON.stringify(answerLabels))}'
);`);
		questionCount++;

		// Overall distribution (only one since data is already aggregated)
		sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '${escapeSQL(JSON.stringify(distribution))}',
  ${sampleSize}
);`);
		distributionCount++;

		sql.push('');
	}

	// Write SQL file
	const outputPath = '/tmp/philpapers_import.sql';
	fs.writeFileSync(outputPath, sql.join('\n'));
	console.log(`\nGenerated SQL written to ${outputPath}`);
	console.log(`  Questions: ${questionCount}`);
	console.log(`  Distribution records: ${distributionCount}`);
	console.log('');
	console.log('To apply:');
	console.log('  1. Review the generated SQL');
	console.log('  2. Copy to migrations/0009_philpapers_data.sql');
	console.log('  3. Run: npm run db:migrate');
}

main().catch(console.error);
