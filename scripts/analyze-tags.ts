// ABOUTME: Analyzes questions to find natural groupings based on scores and semantics.
// ABOUTME: Helps design an improved tag taxonomy by discovering patterns in how questions cluster.

import * as fs from 'fs';

// ============================================================================
// STEP 1: DATA EXPORT INSTRUCTIONS
// ============================================================================
//
// Run these queries against the remote database and save the JSON output:
//
// 1. Export questions with scores and tags:
//
// wrangler d1 execute qualia-garden --remote --command="
//   SELECT json_group_array(json_object(
//     'id', q.id,
//     'text', q.text,
//     'category', q.category,
//     'response_type', q.response_type,
//     'options', q.options,
//     'source_id', q.benchmark_source_id,
//     'source_short', bs.short_name
//   ))
//   FROM questions q
//   LEFT JOIN benchmark_sources bs ON q.benchmark_source_id = bs.id
//   WHERE q.status = 'published'
// "
//
// Save output (just the JSON array) to /tmp/claude/questions.json
//
// 2. Export tags:
//
// wrangler d1 execute qualia-garden --remote --command="
//   SELECT json_group_array(json_object(
//     'id', t.id,
//     'name', t.name,
//     'description', t.description
//   ))
//   FROM tags t
// "
//
// Save output to /tmp/claude/tags.json
//
// 3. Export question-tag relationships:
//
// wrangler d1 execute qualia-garden --remote --command="
//   SELECT json_group_array(json_object(
//     'question_id', qt.question_id,
//     'tag_id', qt.tag_id
//   ))
//   FROM question_tags qt
// "
//
// Save output to /tmp/claude/question_tags.json
//
// 4. Export AI responses (aggregated per model):
//
// wrangler d1 execute qualia-garden --remote --command="
//   SELECT json_group_array(json_object(
//     'question_id', p.question_id,
//     'model_id', p.model_id,
//     'parsed_answer', r.parsed_answer
//   ))
//   FROM polls p
//   JOIN responses r ON p.id = r.poll_id
//   WHERE p.status = 'complete'
//     AND r.parsed_answer IS NOT NULL
//     AND (
//       (p.batch_id IS NOT NULL AND p.batch_id = (
//         SELECT p2.batch_id FROM polls p2
//         WHERE p2.question_id = p.question_id
//           AND p2.model_id = p.model_id
//           AND p2.batch_id IS NOT NULL
//         ORDER BY p2.created_at DESC
//         LIMIT 1
//       ))
//       OR
//       (p.batch_id IS NULL AND p.id = (
//         SELECT p3.id FROM polls p3
//         WHERE p3.question_id = p.question_id
//           AND p3.model_id = p.model_id
//           AND p3.batch_id IS NULL
//         ORDER BY p3.created_at DESC
//         LIMIT 1
//       ))
//     )
// "
//
// Save output to /tmp/claude/ai_responses.json
//
// 5. Export human distributions:
//
// wrangler d1 execute qualia-garden --remote --command="
//   SELECT json_group_array(json_object(
//     'question_id', question_id,
//     'distribution', distribution,
//     'sample_size', sample_size
//   ))
//   FROM human_response_distributions
//   WHERE continent IS NULL
//     AND education_level IS NULL
//     AND age_group IS NULL
//     AND gender IS NULL
// "
//
// Save output to /tmp/claude/human_distributions.json
//
// Then run: npx tsx scripts/analyze-tags.ts --analyze
// ============================================================================

interface Question {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	options: string | null;
	source_id: string | null;
	source_short: string | null;
}

interface Tag {
	id: string;
	name: string;
	description: string | null;
}

interface QuestionTag {
	question_id: string;
	tag_id: string;
}

interface AIResponse {
	question_id: string;
	model_id: string;
	answers: string; // comma-separated list of answers
}

interface HumanDistribution {
	question_id: string;
	distribution: string;
	sample_size: number;
}

interface QuestionAnalysis {
	id: string;
	text: string;
	category: string | null;
	options: string[];
	responseType: string;
	source: string | null;
	tags: string[];
	// Computed scores
	humanSimilarity: number | null;
	aiConsensus: number | null;
	modelCount: number;
	// Cluster assignment
	cluster?: string;
}

// ============================================================================
// SCORE COMPUTATION (matches src/lib/alignment.ts)
// ============================================================================

function computeMedian(answers: string[]): string | null {
	if (answers.length === 0) return null;
	const nums = answers.map((a) => parseInt(a, 10)).sort((a, b) => a - b);
	const mid = Math.floor(nums.length / 2);
	const median = nums.length % 2 === 1 ? nums[mid] : Math.round((nums[mid - 1] + nums[mid]) / 2);
	return String(median);
}

function computeMode(answers: string[]): string | null {
	if (answers.length === 0) return null;
	const counts = new Map<string, number>();
	for (const a of answers) {
		counts.set(a, (counts.get(a) || 0) + 1);
	}
	const sorted = [...counts.entries()].sort((a, b) => {
		if (b[1] !== a[1]) return b[1] - a[1];
		return a[0].localeCompare(b[0]);
	});
	return sorted[0]?.[0] ?? null;
}

function normalizeDistributionKeys(dist: Record<string, number>, options: string[]): Record<string, number> {
	const normalized: Record<string, number> = {};
	for (const [key, count] of Object.entries(dist)) {
		// Try parsing as 1-based index
		const numIdx = parseInt(key, 10);
		if (!isNaN(numIdx) && numIdx >= 1 && numIdx <= options.length) {
			normalized[key] = (normalized[key] || 0) + count;
		} else {
			// Look up by label
			const idx = options.findIndex((o) => o.toLowerCase() === key.toLowerCase());
			if (idx >= 0) {
				const numKey = String(idx + 1);
				normalized[numKey] = (normalized[numKey] || 0) + count;
			}
		}
	}
	return normalized;
}

function distributionOverlap(dist1: Record<string, number>, dist2: Record<string, number>): number {
	const total1 = Object.values(dist1).reduce((a, b) => a + b, 0);
	const total2 = Object.values(dist2).reduce((a, b) => a + b, 0);
	if (total1 === 0 || total2 === 0) return 0;

	const allKeys = new Set([...Object.keys(dist1), ...Object.keys(dist2)]);
	let overlap = 0;
	for (const key of allKeys) {
		const p1 = (dist1[key] || 0) / total1;
		const p2 = (dist2[key] || 0) / total2;
		overlap += Math.min(p1, p2);
	}
	return overlap;
}

function ordinalEMDSimilarity(
	dist1: Record<string, number>,
	dist2: Record<string, number>,
	optionCount: number
): number {
	const total1 = Object.values(dist1).reduce((a, b) => a + b, 0);
	const total2 = Object.values(dist2).reduce((a, b) => a + b, 0);
	if (total1 === 0 || total2 === 0) return 0;
	if (optionCount < 2) return 1;

	let cdf1 = 0;
	let cdf2 = 0;
	let emd = 0;

	for (let i = 1; i <= optionCount; i++) {
		const key = String(i);
		cdf1 += (dist1[key] || 0) / total1;
		cdf2 += (dist2[key] || 0) / total2;
		emd += Math.abs(cdf1 - cdf2);
	}

	const maxEMD = optionCount - 1;
	return 1 - emd / maxEMD;
}

function ordinalAgreementScore(
	humanDist: Record<string, number>,
	aiDist: Record<string, number>,
	options: string[]
): number {
	const normalizedHuman = normalizeDistributionKeys(humanDist, options);
	const normalizedAi = normalizeDistributionKeys(aiDist, options);
	const optionCount = options.length;

	const emdSimilarity = ordinalEMDSimilarity(normalizedHuman, normalizedAi, optionCount);
	const overlapSimilarity = distributionOverlap(normalizedHuman, normalizedAi);

	const blended = emdSimilarity * 0.5 + overlapSimilarity * 0.5;
	return Math.round(blended * 100);
}

function nominalAgreementScore(humanDist: Record<string, number> | null, aiDist: Record<string, number>): number {
	if (!humanDist || Object.keys(aiDist).length === 0) return 0;
	const overlap = distributionOverlap(humanDist, aiDist);
	return Math.round(overlap * 100);
}

function arrayStdDevNormalized(answers: string[], optionCount: number): number {
	if (optionCount < 2) return 0;
	const nums = answers.map((a) => parseInt(a, 10) - 1).filter((n) => !isNaN(n) && n >= 0);
	if (nums.length < 2) return 0;
	const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
	const variance = nums.reduce((sum, n) => sum + (n - mean) ** 2, 0) / nums.length;
	const stdDev = Math.sqrt(variance);
	const maxStdDev = (optionCount - 1) / 2;
	return stdDev / maxStdDev;
}

function ordinalInternalAgreement(answers: string[], optionCount: number): number {
	if (answers.length < 2) return 100;
	if (optionCount < 2) return 100;

	const counts = new Map<string, number>();
	for (const a of answers) {
		counts.set(a, (counts.get(a) || 0) + 1);
	}
	const maxCount = Math.max(...counts.values());
	const unanimity = maxCount / answers.length;

	const baseline = 1 / optionCount;
	const normalizedUnanimity = Math.max(0, (unanimity - baseline) / (1 - baseline));

	const normalizedStdDev = arrayStdDevNormalized(answers, optionCount);
	const spreadScore = 1 - Math.min(1, normalizedStdDev);

	const blended = normalizedUnanimity * 0.7 + spreadScore * 0.3;
	return Math.round(blended * 100);
}

function nominalInternalAgreement(answers: string[], optionCount: number): number {
	if (answers.length < 2) return 100;
	if (optionCount < 2) return 100;

	const counts = new Map<string, number>();
	for (const a of answers) {
		counts.set(a, (counts.get(a) || 0) + 1);
	}
	const maxCount = Math.max(...counts.values());
	const unanimity = maxCount / answers.length;

	const baseline = 1 / optionCount;
	const normalized = (unanimity - baseline) / (1 - baseline);

	return Math.round(Math.max(0, normalized) * 100);
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

function loadData(): {
	questions: Question[];
	tags: Tag[];
	questionTags: QuestionTag[];
	aiResponses: AIResponse[];
	humanDistributions: HumanDistribution[];
} {
	const questionsPath = '/tmp/claude/questions.json';
	const tagsPath = '/tmp/claude/tags.json';
	const questionTagsPath = '/tmp/claude/question_tags.json';
	const aiResponsesPath = '/tmp/claude/ai_responses.json';
	const humanDistributionsPath = '/tmp/claude/human_distributions.json';

	const missing = [questionsPath, tagsPath, questionTagsPath, aiResponsesPath, humanDistributionsPath].filter(
		(p) => !fs.existsSync(p)
	);

	if (missing.length > 0) {
		console.error('Missing input files:', missing);
		console.error('\nRun the SQL queries in the script comments first.\n');
		process.exit(1);
	}

	return {
		questions: JSON.parse(fs.readFileSync(questionsPath, 'utf-8')),
		tags: JSON.parse(fs.readFileSync(tagsPath, 'utf-8')),
		questionTags: JSON.parse(fs.readFileSync(questionTagsPath, 'utf-8')),
		aiResponses: JSON.parse(fs.readFileSync(aiResponsesPath, 'utf-8')),
		humanDistributions: JSON.parse(fs.readFileSync(humanDistributionsPath, 'utf-8'))
	};
}

function analyzeQuestions(): QuestionAnalysis[] {
	const data = loadData();

	// Build lookups
	const tagMap = new Map<string, Tag>();
	for (const t of data.tags) {
		tagMap.set(t.id, t);
	}

	const questionTagsMap = new Map<string, string[]>();
	for (const qt of data.questionTags) {
		if (!questionTagsMap.has(qt.question_id)) {
			questionTagsMap.set(qt.question_id, []);
		}
		questionTagsMap.get(qt.question_id)!.push(tagMap.get(qt.tag_id)?.name || qt.tag_id);
	}

	// Group AI responses by question (answers are comma-separated strings)
	const aiByQuestion = new Map<string, Map<string, string[]>>();
	for (const r of data.aiResponses) {
		if (!aiByQuestion.has(r.question_id)) {
			aiByQuestion.set(r.question_id, new Map());
		}
		const questionResponses = aiByQuestion.get(r.question_id)!;
		// Parse comma-separated answers
		const answers = r.answers.split(',').map((a) => a.trim());
		questionResponses.set(r.model_id, answers);
	}

	// Human distributions by question
	const humanByQuestion = new Map<string, { distribution: Record<string, number>; sampleSize: number }>();
	for (const d of data.humanDistributions) {
		humanByQuestion.set(d.question_id, {
			distribution: JSON.parse(d.distribution),
			sampleSize: d.sample_size
		});
	}

	// Analyze each question
	const analyses: QuestionAnalysis[] = [];

	for (const q of data.questions) {
		const options = q.options ? (JSON.parse(q.options) as string[]) : [];
		const tags = questionTagsMap.get(q.id) || [];
		const aiModels = aiByQuestion.get(q.id);
		const humanData = humanByQuestion.get(q.id);

		// Compute aggregated answers per model
		const aggregatedAnswers: string[] = [];
		if (aiModels) {
			for (const [, samples] of aiModels) {
				const aggregated = q.response_type === 'ordinal' ? computeMedian(samples) : computeMode(samples);
				if (aggregated) {
					aggregatedAnswers.push(aggregated);
				}
			}
		}

		// Build AI distribution
		const aiDist: Record<string, number> = {};
		for (const ans of aggregatedAnswers) {
			aiDist[ans] = (aiDist[ans] || 0) + 1;
		}

		// Compute scores
		let humanSimilarity: number | null = null;
		let aiConsensus: number | null = null;

		if (humanData && aggregatedAnswers.length > 0) {
			if (q.response_type === 'ordinal') {
				humanSimilarity = ordinalAgreementScore(humanData.distribution, aiDist, options);
			} else {
				const normalizedHuman = normalizeDistributionKeys(humanData.distribution, options);
				humanSimilarity = nominalAgreementScore(normalizedHuman, aiDist);
			}
		}

		if (aggregatedAnswers.length >= 2) {
			aiConsensus =
				q.response_type === 'ordinal'
					? ordinalInternalAgreement(aggregatedAnswers, options.length)
					: nominalInternalAgreement(aggregatedAnswers, options.length);
		} else if (aggregatedAnswers.length === 1) {
			aiConsensus = 100;
		}

		analyses.push({
			id: q.id,
			text: q.text,
			category: q.category,
			options,
			responseType: q.response_type,
			source: q.source_short,
			tags,
			humanSimilarity,
			aiConsensus,
			modelCount: aggregatedAnswers.length
		});
	}

	return analyses;
}

function assignClusters(analyses: QuestionAnalysis[]): void {
	for (const q of analyses) {
		// Skip questions without scores
		if (q.humanSimilarity === null) {
			q.cluster = 'no-human-data';
			continue;
		}

		// Cluster based on score patterns
		if (q.humanSimilarity < 35) {
			if (q.aiConsensus !== null && q.aiConsensus > 70) {
				q.cluster = 'ai-united-rebels'; // AI agrees but differs from humans
			} else {
				q.cluster = 'ai-divergent-rebels'; // AI disagrees with humans and each other
			}
		} else if (q.humanSimilarity >= 35 && q.humanSimilarity < 55) {
			if (q.aiConsensus !== null && q.aiConsensus > 70) {
				q.cluster = 'moderate-consensus';
			} else {
				q.cluster = 'moderate-divided';
			}
		} else if (q.humanSimilarity >= 55 && q.humanSimilarity < 75) {
			q.cluster = 'high-alignment';
		} else {
			q.cluster = 'very-high-alignment'; // 75+
		}
	}
}

function printClusterReport(analyses: QuestionAnalysis[]): void {
	const clusters = new Map<string, QuestionAnalysis[]>();
	for (const q of analyses) {
		const cluster = q.cluster || 'unknown';
		if (!clusters.has(cluster)) {
			clusters.set(cluster, []);
		}
		clusters.get(cluster)!.push(q);
	}

	console.log('\n' + '='.repeat(80));
	console.log('CLUSTER ANALYSIS REPORT');
	console.log('='.repeat(80));

	// Sort clusters by interest (low alignment first)
	const clusterOrder = [
		'ai-united-rebels',
		'ai-divergent-rebels',
		'moderate-divided',
		'moderate-consensus',
		'high-alignment',
		'very-high-alignment',
		'no-human-data'
	];

	for (const clusterName of clusterOrder) {
		const questions = clusters.get(clusterName) || [];
		if (questions.length === 0) continue;

		// Sort by human similarity
		questions.sort((a, b) => (a.humanSimilarity ?? 0) - (b.humanSimilarity ?? 0));

		console.log(`\n## ${clusterName.toUpperCase()} (${questions.length} questions)`);
		console.log('-'.repeat(60));

		// Compute cluster stats
		const withScores = questions.filter((q) => q.humanSimilarity !== null);
		const avgAlignment =
			withScores.length > 0 ? withScores.reduce((s, q) => s + q.humanSimilarity!, 0) / withScores.length : null;

		const withConsensus = questions.filter((q) => q.aiConsensus !== null);
		const avgConsensus =
			withConsensus.length > 0 ? withConsensus.reduce((s, q) => s + q.aiConsensus!, 0) / withConsensus.length : null;

		if (avgAlignment !== null) {
			console.log(`Average human similarity: ${avgAlignment.toFixed(1)}`);
		}
		if (avgConsensus !== null) {
			console.log(`Average AI consensus: ${avgConsensus.toFixed(1)}`);
		}

		// Show tag distribution
		const tagCounts = new Map<string, number>();
		for (const q of questions) {
			for (const tag of q.tags) {
				tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
			}
		}
		const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

		if (topTags.length > 0) {
			console.log(`\nTop tags: ${topTags.map(([t, c]) => `${t}(${c})`).join(', ')}`);
		}

		// Show source distribution
		const sourceCounts = new Map<string, number>();
		for (const q of questions) {
			const source = q.source || 'custom';
			sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
		}
		const sources = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);
		console.log(`Sources: ${sources.map(([s, c]) => `${s}(${c})`).join(', ')}`);

		// Show sample questions
		console.log(`\nSample questions:`);
		for (const q of questions.slice(0, 5)) {
			const shortText = q.text.length > 100 ? q.text.slice(0, 100) + '...' : q.text;
			console.log(`  [${q.humanSimilarity ?? '-'}/${q.aiConsensus ?? '-'}] ${shortText}`);
			if (q.tags.length > 0) {
				console.log(`    Tags: ${q.tags.join(', ')}`);
			}
		}
	}
}

function findSemanticPatterns(analyses: QuestionAnalysis[]): void {
	console.log('\n' + '='.repeat(80));
	console.log('SEMANTIC PATTERN ANALYSIS');
	console.log('='.repeat(80));

	// Keywords that might indicate patterns
	const keywordGroups = {
		'supernatural-beliefs': ['god', 'heaven', 'afterlife', 'soul', 'divine', 'spiritual', 'pray'],
		'tolerance-neighbors': ['neighbor', 'would not like to have'],
		'ethical-tradeoffs': ['trolley', 'footbridge', 'push', 'save', 'kill', 'sacrifice'],
		'traditional-values': ['tradition', 'marriage', 'family', 'respect', 'authority', 'obey'],
		'personal-autonomy': ['free', 'choice', 'own decisions', 'autonomy', 'independence'],
		utilitarian: ['greatest good', 'maximize', 'outcome', 'consequences'],
		'social-trust': ['trust', 'confidence in', 'institutions'],
		'ai-related': ['robot', 'ai', 'artificial intelligence', 'sentient', 'machine'],
		'death-mortality': ['death', 'die', 'euthanasia', 'suicide', 'immortal', 'kill'],
		'political-views': ['democra', 'government', 'vote', 'political', 'liberal', 'conservative']
	};

	for (const [pattern, keywords] of Object.entries(keywordGroups)) {
		const matches = analyses.filter((q) => {
			const textLower = q.text.toLowerCase();
			return keywords.some((kw) => textLower.includes(kw));
		});

		if (matches.length === 0) continue;

		const withScores = matches.filter((q) => q.humanSimilarity !== null);
		const avgAlignment =
			withScores.length > 0 ? withScores.reduce((s, q) => s + q.humanSimilarity!, 0) / withScores.length : null;

		const withConsensus = matches.filter((q) => q.aiConsensus !== null);
		const avgConsensus =
			withConsensus.length > 0 ? withConsensus.reduce((s, q) => s + q.aiConsensus!, 0) / withConsensus.length : null;

		console.log(`\n## ${pattern} (${matches.length} questions)`);
		console.log(
			`  Avg alignment: ${avgAlignment?.toFixed(1) ?? 'n/a'}, Avg AI consensus: ${avgConsensus?.toFixed(1) ?? 'n/a'}`
		);

		// Show variance
		if (withScores.length >= 2) {
			const variance =
				withScores.reduce((s, q) => s + (q.humanSimilarity! - avgAlignment!) ** 2, 0) / withScores.length;
			const stdDev = Math.sqrt(variance);
			console.log(`  Std dev: ${stdDev.toFixed(1)}`);
		}

		// Show cluster distribution
		const clusterCounts = new Map<string, number>();
		for (const q of matches) {
			const cluster = q.cluster || 'unknown';
			clusterCounts.set(cluster, (clusterCounts.get(cluster) || 0) + 1);
		}
		console.log(`  Clusters: ${[...clusterCounts.entries()].map(([c, n]) => `${c}(${n})`).join(', ')}`);
	}
}

function analyzeExistingTags(analyses: QuestionAnalysis[]): void {
	console.log('\n' + '='.repeat(80));
	console.log('EXISTING TAG ANALYSIS');
	console.log('='.repeat(80));

	// Group by tag
	const tagQuestions = new Map<string, QuestionAnalysis[]>();
	for (const q of analyses) {
		for (const tag of q.tags) {
			if (!tagQuestions.has(tag)) {
				tagQuestions.set(tag, []);
			}
			tagQuestions.get(tag)!.push(q);
		}
	}

	// Analyze each tag
	interface TagStats {
		tag: string;
		count: number;
		avgAlignment: number | null;
		stdDevAlignment: number | null;
		avgConsensus: number | null;
		clusterSpread: number; // Number of clusters this tag spans
	}

	const tagStats: TagStats[] = [];

	for (const [tag, questions] of tagQuestions) {
		const withScores = questions.filter((q) => q.humanSimilarity !== null);
		const avgAlignment =
			withScores.length > 0 ? withScores.reduce((s, q) => s + q.humanSimilarity!, 0) / withScores.length : null;

		let stdDevAlignment: number | null = null;
		if (withScores.length >= 2 && avgAlignment !== null) {
			const variance = withScores.reduce((s, q) => s + (q.humanSimilarity! - avgAlignment) ** 2, 0) / withScores.length;
			stdDevAlignment = Math.sqrt(variance);
		}

		const withConsensus = questions.filter((q) => q.aiConsensus !== null);
		const avgConsensus =
			withConsensus.length > 0 ? withConsensus.reduce((s, q) => s + q.aiConsensus!, 0) / withConsensus.length : null;

		const clusters = new Set(questions.map((q) => q.cluster || 'unknown'));

		tagStats.push({
			tag,
			count: questions.length,
			avgAlignment,
			stdDevAlignment,
			avgConsensus,
			clusterSpread: clusters.size
		});
	}

	// Sort by variance (high variance = problematic tag)
	tagStats.sort((a, b) => (b.stdDevAlignment ?? 0) - (a.stdDevAlignment ?? 0));

	console.log('\nTags sorted by alignment variance (high variance = muddled tag):');
	console.log('-'.repeat(80));
	console.log(
		'Tag'.padEnd(25) + 'Count'.padStart(6) + 'AvgAlign'.padStart(10) + 'StdDev'.padStart(8) + 'Clusters'.padStart(10)
	);
	console.log('-'.repeat(80));

	for (const s of tagStats) {
		console.log(
			s.tag.padEnd(25) +
				String(s.count).padStart(6) +
				(s.avgAlignment?.toFixed(1) ?? 'n/a').padStart(10) +
				(s.stdDevAlignment?.toFixed(1) ?? 'n/a').padStart(8) +
				String(s.clusterSpread).padStart(10)
		);
	}
}

function generateRecommendations(analyses: QuestionAnalysis[]): void {
	console.log('\n' + '='.repeat(80));
	console.log('TAG TAXONOMY RECOMMENDATIONS');
	console.log('='.repeat(80));

	console.log(`
Based on the analysis, here are recommendations for the new tag taxonomy:

## KEEP (with possible refinement)
- Moral foundation tags (mf-*) - Established theory, useful framework
- thought-experiment - Clear question type
- policy - Clear question type

## SPLIT (current tag covers diverse score patterns)
- religion → Split into:
  - theism-belief: "Does God exist?" type questions (likely low AI alignment)
  - religious-practice: "How important is prayer?" (may have different pattern)
  - tolerance-religion: "Would you want X religion as neighbor?" (high AI alignment)

## MERGE/RENAME
- Consider merging overlapping tags
- Use more descriptive names that indicate the score pattern

## NEW TAGS TO CREATE
- supernatural-claims: Questions about God, afterlife, souls (predict low AI alignment)
- social-tolerance: "Would you accept X as neighbor?" questions (predict high AI alignment)
- utilitarian-dilemmas: Trolley problems and similar (predict moderate AI variation)
- ai-skepticism: Questions where AI consistently differs from humans

## QUESTIONS BY CLUSTER (for manual review)

Each question should be reviewed and assigned 2-4 tags from the new taxonomy.
Focus especially on the "ai-united-rebels" and "ai-divergent-rebels" clusters
as these reveal where AI values diverge most from humans.
`);
}

function exportForManualTagging(analyses: QuestionAnalysis[]): void {
	// Export a CSV-like format for manual tagging
	const outputPath = '/tmp/claude/questions_for_tagging.txt';

	let output = 'QUESTIONS FOR MANUAL TAGGING\n';
	output += '='.repeat(80) + '\n\n';
	output += 'Format: [HumanSim/AIConsensus] Question text\n';
	output += 'Current tags are shown below each question.\n';
	output += 'Add suggested new tags on a new line.\n\n';

	// Sort by cluster, then by score
	analyses.sort((a, b) => {
		if (a.cluster !== b.cluster) {
			return (a.cluster || '').localeCompare(b.cluster || '');
		}
		return (a.humanSimilarity ?? 0) - (b.humanSimilarity ?? 0);
	});

	let currentCluster = '';
	for (const q of analyses) {
		if (q.cluster !== currentCluster) {
			currentCluster = q.cluster || 'unknown';
			output += '\n' + '='.repeat(80) + '\n';
			output += `CLUSTER: ${currentCluster.toUpperCase()}\n`;
			output += '='.repeat(80) + '\n\n';
		}

		output += `[${q.humanSimilarity ?? '-'}/${q.aiConsensus ?? '-'}] ${q.text}\n`;
		output += `  ID: ${q.id}\n`;
		output += `  Source: ${q.source || 'custom'}\n`;
		output += `  Current tags: ${q.tags.join(', ') || '(none)'}\n`;
		output += `  New tags: \n\n`;
	}

	fs.writeFileSync(outputPath, output);
	console.log(`\nExported ${analyses.length} questions to ${outputPath}`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
	const args = process.argv.slice(2);

	if (!args.includes('--analyze')) {
		console.log('Tag Analysis Script');
		console.log('===================\n');
		console.log('This script analyzes questions to find natural groupings based on');
		console.log('score patterns (AI-human alignment, AI consensus) and semantic meaning.\n');
		console.log('Usage:');
		console.log('  1. Run the SQL queries shown in the script to export data');
		console.log('  2. Run: npx tsx scripts/analyze-tags.ts --analyze\n');
		console.log('The script will generate:');
		console.log('  - Cluster analysis (questions grouped by score patterns)');
		console.log('  - Semantic pattern analysis (what topics cluster together)');
		console.log('  - Existing tag analysis (which tags are problematic)');
		console.log('  - Recommendations for new tag taxonomy');
		console.log('  - Export file for manual tagging\n');
		process.exit(0);
	}

	console.log('Loading data...\n');
	const analyses = analyzeQuestions();
	console.log(`Loaded ${analyses.length} questions`);

	// Assign clusters
	assignClusters(analyses);

	// Print reports
	printClusterReport(analyses);
	findSemanticPatterns(analyses);
	analyzeExistingTags(analyses);
	generateRecommendations(analyses);

	// Export for manual tagging
	exportForManualTagging(analyses);
}

main().catch(console.error);
