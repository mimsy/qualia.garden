// ABOUTME: Home page data loader.
// ABOUTME: Fetches benchmark sources with alignment stats and divergence highlights.

import type { PageServerLoad } from './$types';
import { computeMedian, computeMode } from '$lib/db/types';
import {
	computeQuestionStats,
	computeOverallScores,
	getCacheKey,
	getCachedSourceStats,
	setCachedSourceStats,
	CACHE_VERSION,
	ordinalAgreementScore,
	nominalAgreementScore,
	type QuestionMeta,
	type QuestionStats
} from '$lib/alignment';

interface BenchmarkSourceRow {
	id: string;
	name: string;
	short_name: string;
	url: string | null;
	sample_size: number | null;
	year_range: string | null;
	question_count: number;
}

interface QuestionRow {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	options: string | null;
	benchmark_source_id: string | null;
}

interface ModelResponseRow {
	model_id: string;
	model_name: string;
	question_id: string;
	response_type: string;
	parsed_answer: string;
	benchmark_source_id: string;
}

interface HumanDistributionRow {
	question_id: string;
	benchmark_source_id: string;
	distribution: string;
}

interface ExtremeQuestion {
	id: string;
	text: string;
	score: number;
	isHighAgreement: boolean;
}

export interface SourceWithStats {
	id: string;
	name: string;
	short_name: string;
	url: string | null;
	sample_size: number | null;
	year_range: string | null;
	questionCount: number;
	humanAiScore: number | null;
	aiAgreementScore: number | null;
	modelCount: number;
	extremeQuestion: ExtremeQuestion | null;
}

export interface CategoryStats {
	category: string;
	humanAiScore: number;
	aiAgreementScore: number;
	questionCount: number;
	modelCount: number;
	extremeQuestion: ExtremeQuestion | null;
}

export interface ModelRanking {
	id: string;
	name: string;
	family: string;
	humanAlignmentScore: number;
	questionsWithHumanData: number;
}

// Find the question with score furthest from 50 (most extreme agreement or disagreement)
function findMostExtreme(
	stats: QuestionStats[],
	questionTextMap: Map<string, string>
): ExtremeQuestion | null {
	let mostExtreme: QuestionStats | null = null;
	let maxDistance = -1;

	for (const q of stats) {
		if (q.humanAiScore === 0) continue;
		const distance = Math.abs(q.humanAiScore - 50);
		if (distance > maxDistance) {
			maxDistance = distance;
			mostExtreme = q;
		}
	}

	if (!mostExtreme) return null;

	const text = questionTextMap.get(mostExtreme.questionId);
	if (!text) return null;

	return {
		id: mostExtreme.questionId,
		text,
		score: mostExtreme.humanAiScore,
		isHighAgreement: mostExtreme.humanAiScore > 50
	};
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { sources: [], categories: [], topModels: [], bottomModels: [], unbenchmarkedQuestions: [] };
	}

	const db = platform.env.DB;
	const kv = platform.env.ALIGNMENT_CACHE;

	// Get all benchmark sources with question counts
	const sourcesResult = await db
		.prepare(`
			SELECT
				bs.*,
				COUNT(DISTINCT CASE WHEN q.status = 'published' THEN q.id END) as question_count
			FROM benchmark_sources bs
			LEFT JOIN questions q ON q.benchmark_source_id = bs.id
			GROUP BY bs.id
			ORDER BY bs.name
		`)
		.all<BenchmarkSourceRow>();

	// Get all published questions with their source assignments
	const questionsResult = await db
		.prepare(`
			SELECT id, text, category, response_type, options, benchmark_source_id
			FROM questions
			WHERE status = 'published'
		`)
		.all<QuestionRow>();

	const questionsBySource = new Map<string, Array<QuestionMeta & { text: string }>>();
	const questionTextMap = new Map<string, string>();
	const questionCategoryMap = new Map<string, string>();
	const allBenchmarkedQuestions: Array<QuestionMeta & { text: string }> = [];

	for (const q of questionsResult.results) {
		questionTextMap.set(q.id, q.text);
		if (q.category) {
			questionCategoryMap.set(q.id, q.category);
		}

		if (q.benchmark_source_id) {
			const questionMeta = {
				id: q.id,
				text: q.text,
				options: q.options ? JSON.parse(q.options) as string[] : [],
				responseType: q.response_type
			};

			if (!questionsBySource.has(q.benchmark_source_id)) {
				questionsBySource.set(q.benchmark_source_id, []);
			}
			questionsBySource.get(q.benchmark_source_id)!.push(questionMeta);
			allBenchmarkedQuestions.push(questionMeta);
		}
	}

	// Get AI responses for all benchmarked questions
	const responsesResult = await db
		.prepare(`
			SELECT
				m.id as model_id,
				m.name as model_name,
				p.question_id,
				q.response_type,
				r.parsed_answer,
				q.benchmark_source_id
			FROM polls p
			JOIN models m ON p.model_id = m.id
			JOIN responses r ON p.id = r.poll_id
			JOIN questions q ON p.question_id = q.id
			WHERE p.status = 'complete'
				AND r.parsed_answer IS NOT NULL
				AND q.status = 'published'
				AND q.benchmark_source_id IS NOT NULL
				AND (
					(p.batch_id IS NOT NULL AND p.batch_id = (
						SELECT p2.batch_id FROM polls p2
						WHERE p2.question_id = p.question_id
							AND p2.model_id = p.model_id
							AND p2.batch_id IS NOT NULL
						ORDER BY p2.created_at DESC
						LIMIT 1
					))
					OR
					(p.batch_id IS NULL AND p.id = (
						SELECT p3.id FROM polls p3
						WHERE p3.question_id = p.question_id
							AND p3.model_id = p.model_id
							AND p3.batch_id IS NULL
						ORDER BY p3.created_at DESC
						LIMIT 1
					))
				)
		`)
		.all<ModelResponseRow>();

	// Get human distributions (overall only)
	const humanResult = await db
		.prepare(`
			SELECT question_id, benchmark_source_id, distribution
			FROM human_response_distributions
			WHERE continent IS NULL
				AND education_level IS NULL
				AND age_group IS NULL
				AND gender IS NULL
		`)
		.all<HumanDistributionRow>();

	// Group responses by source
	const responsesBySource = new Map<string, Map<string, {
		name: string;
		byQuestion: Map<string, { answers: string[]; responseType: string }>
	}>>();

	for (const r of responsesResult.results) {
		if (!r.benchmark_source_id) continue;
		if (!responsesBySource.has(r.benchmark_source_id)) {
			responsesBySource.set(r.benchmark_source_id, new Map());
		}
		const sourceResponses = responsesBySource.get(r.benchmark_source_id)!;
		if (!sourceResponses.has(r.model_id)) {
			sourceResponses.set(r.model_id, { name: r.model_name, byQuestion: new Map() });
		}
		const model = sourceResponses.get(r.model_id)!;
		if (!model.byQuestion.has(r.question_id)) {
			model.byQuestion.set(r.question_id, { answers: [], responseType: r.response_type });
		}
		model.byQuestion.get(r.question_id)!.answers.push(r.parsed_answer);
	}

	// Group human distributions by source
	const humanBySource = new Map<string, Map<string, Record<string, number>>>();
	for (const h of humanResult.results) {
		if (!humanBySource.has(h.benchmark_source_id)) {
			humanBySource.set(h.benchmark_source_id, new Map());
		}
		humanBySource.get(h.benchmark_source_id)!.set(h.question_id, JSON.parse(h.distribution));
	}

	// Compute stats for each source
	const sources: SourceWithStats[] = [];

	for (const source of sourcesResult.results) {
		const cacheKey = getCacheKey(source.id, 'full');
		let sourceStats = await getCachedSourceStats(kv, cacheKey);
		// Invalidate cache if version mismatch or old format
		if (sourceStats && sourceStats.cacheVersion !== CACHE_VERSION) {
			sourceStats = null;
		}

		const questions = questionsBySource.get(source.id) || [];

		if (!sourceStats) {
			const rawResponses = responsesBySource.get(source.id);
			const humanDist = humanBySource.get(source.id);

			if (questions.length > 0 && rawResponses && rawResponses.size > 0 && humanDist) {
				// Aggregate model responses
				const modelResponses = new Map<string, { name: string; responses: Record<string, string | null> }>();
				for (const [modelId, data] of rawResponses) {
					const responses: Record<string, string | null> = {};
					for (const [questionId, { answers, responseType }] of data.byQuestion) {
						responses[questionId] = responseType === 'ordinal'
							? computeMedian(answers)
							: computeMode(answers);
					}
					modelResponses.set(modelId, { name: data.name, responses });
				}

				// Compute question stats
				const questionStats = computeQuestionStats(questions, modelResponses, humanDist);
				const { overallScore, overallAiAgreement, overallHumanAgreement } = computeOverallScores(questionStats);

				sourceStats = {
					overallScore,
					overallAiAgreement,
					overallHumanAgreement,
					questionStats,
					modelCount: modelResponses.size,
					questionCount: questions.length,
					computedAt: new Date().toISOString(),
					cacheVersion: CACHE_VERSION
				};

				// Cache the result
				await setCachedSourceStats(kv, cacheKey, sourceStats);
			}
		}

		// Use cached AI agreement score
		const aiAgreementScore = sourceStats?.overallAiAgreement ?? null;

		// Find the most extreme question (furthest from 50)
		const extremeQuestion = sourceStats
			? findMostExtreme(sourceStats.questionStats, questionTextMap)
			: null;

		sources.push({
			id: source.id,
			name: source.name,
			short_name: source.short_name,
			url: source.url,
			sample_size: source.sample_size,
			year_range: source.year_range,
			questionCount: source.question_count,
			humanAiScore: sourceStats?.overallScore ?? null,
			aiAgreementScore,
			modelCount: sourceStats?.modelCount ?? 0,
			extremeQuestion
		});
	}

	// Compute category aggregations
	// First, collect all question stats across all sources
	const allQuestionStats = new Map<string, QuestionStats>();
	for (const source of sourcesResult.results) {
		const cacheKey = getCacheKey(source.id, 'full');
		const sourceStats = await getCachedSourceStats(kv, cacheKey);
		// Only use cached stats if version matches
		if (sourceStats && sourceStats.cacheVersion === CACHE_VERSION) {
			for (const stat of sourceStats.questionStats) {
				allQuestionStats.set(stat.questionId, stat);
			}
		}
	}

	// Group stats by category
	const categoryAggregates = new Map<string, {
		totalHumanAiScore: number;
		totalAiAgreementScore: number;
		count: number;
		modelIds: Set<string>;
		stats: QuestionStats[];
	}>();

	for (const [questionId, stat] of allQuestionStats) {
		const category = questionCategoryMap.get(questionId);
		if (!category) continue;

		if (!categoryAggregates.has(category)) {
			categoryAggregates.set(category, {
				totalHumanAiScore: 0,
				totalAiAgreementScore: 0,
				count: 0,
				modelIds: new Set(),
				stats: []
			});
		}
		const agg = categoryAggregates.get(category)!;
		agg.totalHumanAiScore += stat.humanAiScore;
		agg.totalAiAgreementScore += stat.aiAgreementScore;
		agg.count++;
		agg.stats.push(stat);
	}

	// Get model counts per category
	const categoryModelCounts = await db
		.prepare(`
			SELECT
				q.category,
				COUNT(DISTINCT m.id) as model_count
			FROM questions q
			JOIN polls p ON q.id = p.question_id
			JOIN models m ON p.model_id = m.id
			WHERE q.status = 'published'
				AND q.benchmark_source_id IS NOT NULL
				AND q.category IS NOT NULL
				AND p.status = 'complete'
			GROUP BY q.category
		`)
		.all<{ category: string; model_count: number }>();

	const modelCountByCategory = new Map<string, number>();
	for (const row of categoryModelCounts.results) {
		modelCountByCategory.set(row.category, row.model_count);
	}

	// Build category stats
	const categories: CategoryStats[] = [];
	for (const [category, agg] of categoryAggregates) {
		if (agg.count === 0) continue;
		categories.push({
			category,
			humanAiScore: Math.round(agg.totalHumanAiScore / agg.count),
			aiAgreementScore: Math.round(agg.totalAiAgreementScore / agg.count),
			questionCount: agg.count,
			modelCount: modelCountByCategory.get(category) ?? 0,
			extremeQuestion: findMostExtreme(agg.stats, questionTextMap)
		});
	}
	categories.sort((a, b) => a.category.localeCompare(b.category));

	// Compute model rankings
	// Group all responses by model and compute per-model alignment scores
	const modelAlignmentData = new Map<string, {
		name: string;
		family: string;
		totalScore: number;
		questionCount: number;
	}>();

	// Get model family info
	const modelsResult = await db
		.prepare(`SELECT id, name, family FROM models WHERE active = 1`)
		.all<{ id: string; name: string; family: string }>();

	const modelFamilies = new Map<string, string>();
	for (const m of modelsResult.results) {
		modelFamilies.set(m.id, m.family);
	}

	// For each model, compute their average humanAiScore across all questions with human data
	// We need to get individual model responses and compare to human data
	// Merge all human distributions
	const allHumanDist = new Map<string, Record<string, number>>();
	for (const [, sourceDist] of humanBySource) {
		for (const [qId, dist] of sourceDist) {
			allHumanDist.set(qId, dist);
		}
	}

	// Get all model responses (not aggregated) for computing per-model scores
	for (const [, sourceResponses] of responsesBySource) {
		for (const [modelId, modelData] of sourceResponses) {
			// Aggregate this model's responses to single answers per question
			const aggregatedResponses: Record<string, string | null> = {};
			for (const [questionId, { answers, responseType }] of modelData.byQuestion) {
				aggregatedResponses[questionId] = responseType === 'ordinal'
					? computeMedian(answers)
					: computeMode(answers);
			}

			// Compute alignment score for this model
			for (const [questionId, answer] of Object.entries(aggregatedResponses)) {
				if (!answer) continue;
				const humanDist = allHumanDist.get(questionId);
				if (!humanDist) continue;

				const q = allBenchmarkedQuestions.find(x => x.id === questionId);
				if (!q) continue;

				let score: number;
				if (q.responseType === 'ordinal') {
					// Build single-answer AI distribution for overlap calculation
					const aiDist: Record<string, number> = { [answer]: 1 };
					score = ordinalAgreementScore(humanDist, aiDist, q.options);
				} else {
					// Nominal: convert AI answer to label and compute overlap
					const idx = parseInt(answer, 10) - 1;
					const label = (idx >= 0 && idx < q.options.length) ? q.options[idx] : answer;
					const aiDist: Record<string, number> = { [label]: 1 };

					// Convert human distribution keys to labels
					const humanDistLabeled: Record<string, number> = {};
					for (const [key, count] of Object.entries(humanDist)) {
						const keyIdx = parseInt(key, 10) - 1;
						const keyLabel = (keyIdx >= 0 && keyIdx < q.options.length) ? q.options[keyIdx] : key;
						humanDistLabeled[keyLabel] = (humanDistLabeled[keyLabel] || 0) + count;
					}
					score = nominalAgreementScore(humanDistLabeled, aiDist);
				}

				if (!modelAlignmentData.has(modelId)) {
					modelAlignmentData.set(modelId, {
						name: modelData.name,
						family: modelFamilies.get(modelId) ?? '',
						totalScore: 0,
						questionCount: 0
					});
				}
				const data = modelAlignmentData.get(modelId)!;
				data.totalScore += score;
				data.questionCount++;
			}
		}
	}

	// Build rankings
	const modelRankings: ModelRanking[] = [];
	for (const [modelId, data] of modelAlignmentData) {
		if (data.questionCount === 0) continue;
		modelRankings.push({
			id: modelId,
			name: data.name,
			family: data.family,
			humanAlignmentScore: Math.round(data.totalScore / data.questionCount),
			questionsWithHumanData: data.questionCount
		});
	}
	modelRankings.sort((a, b) => b.humanAlignmentScore - a.humanAlignmentScore);

	const topModels = modelRankings.slice(0, 3);
	const bottomModels = modelRankings.slice(-3).reverse();

	// Get unbenchmarked questions (questions without a benchmark source)
	const unbenchmarkedResult = await db
		.prepare(`
			SELECT
				q.id,
				q.text,
				q.category,
				COUNT(CASE WHEN p.status = 'complete' THEN 1 END) as response_count
			FROM questions q
			LEFT JOIN polls p ON q.id = p.question_id
			WHERE q.status = 'published'
				AND q.benchmark_source_id IS NULL
			GROUP BY q.id
			ORDER BY response_count DESC, q.created_at DESC
			LIMIT 10
		`)
		.all<{ id: string; text: string; category: string | null; response_count: number }>();

	return {
		sources,
		categories,
		topModels,
		bottomModels,
		unbenchmarkedQuestions: unbenchmarkedResult.results
	};
};
