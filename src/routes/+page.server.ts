// ABOUTME: Home page data loader.
// ABOUTME: Fetches benchmark sources with alignment stats and divergence highlights.

import type { PageServerLoad } from './$types';
import { computeMedian, computeMode } from '$lib/db/types';
import { getLatestPollFilter } from '$lib/db/queries';
import {
	computeQuestionStats,
	computeOverallScores,
	getCacheKey,
	getCachedSourceStats,
	setCachedSourceStats,
	CACHE_VERSION,
	ordinalAgreementScore,
	nominalAgreementScore,
	ordinalInternalAgreement,
	nominalInternalAgreement,
	type QuestionMeta,
	type QuestionStats,
	type SourceStats
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

type MetricType = 'alignment' | 'consensus' | 'confidence';

interface ExtremeQuestion {
	id: string;
	text: string;
	score: number;
	metric: MetricType;
	isHigh: boolean;
	// Additional data for display
	alignment: number | null;
	consensus: number | null;
	confidence: number | null;
	humanMode: string | null;
	aiMode: string | null;
	// For ordinal questions
	humanMean: number | null;
	aiMean: number | null;
	responseType: string;
	options: string[];
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
	aiConfidenceScore: number | null;
	modelCount: number;
	extremeQuestion: ExtremeQuestion | null;
}

export interface CategoryStats {
	category: string;
	description: string | null;
	humanAiScore: number;
	aiAgreementScore: number;
	aiConfidenceScore: number | null;
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

// Compute per-question self-consistency (confidence) from raw responses
function computeQuestionConfidence(
	rawResponses: Map<string, { name: string; byQuestion: Map<string, { answers: string[]; responseType: string }> }>,
	questions: Array<{ id: string; options: string[] }>
): Map<string, number> {
	const questionOptionsMap = new Map(questions.map((q) => [q.id, q.options.length]));
	const questionConfidences = new Map<string, { total: number; count: number }>();

	for (const [, data] of rawResponses) {
		for (const [questionId, { answers, responseType }] of data.byQuestion) {
			let sc: number;
			if (answers.length < 2) {
				sc = 100; // Perfect consistency with 1 sample
			} else {
				const optionCount = questionOptionsMap.get(questionId) ?? 5;
				sc =
					responseType === 'ordinal'
						? ordinalInternalAgreement(answers, optionCount)
						: nominalInternalAgreement(answers, optionCount);
			}

			if (!questionConfidences.has(questionId)) {
				questionConfidences.set(questionId, { total: 0, count: 0 });
			}
			const agg = questionConfidences.get(questionId)!;
			agg.total += sc;
			agg.count++;
		}
	}

	// Average confidence per question across all models
	const result = new Map<string, number>();
	for (const [questionId, { total, count }] of questionConfidences) {
		result.set(questionId, Math.round(total / count));
	}
	return result;
}

// Compute average self-consistency (confidence) from raw responses
function computeSourceConfidence(
	rawResponses: Map<string, { name: string; byQuestion: Map<string, { answers: string[]; responseType: string }> }>,
	questions: Array<{ id: string; options: string[] }>
): number | null {
	const perQuestion = computeQuestionConfidence(rawResponses, questions);
	if (perQuestion.size === 0) return null;
	const values = Array.from(perQuestion.values());
	return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

interface GlobalBounds {
	alignmentMin: number;
	alignmentMax: number;
	consensusMin: number;
	consensusMax: number;
	confidenceMin: number;
	confidenceMax: number;
}

// Find the "most interesting" question - the one with the most extreme score relative to GLOBAL bounds
// This highlights questions that stand out globally, not just within their source/category
// Priority for ties: alignment → consensus → confidence
function findMostInteresting(
	stats: QuestionStats[],
	questionTextMap: Map<string, string>,
	questionOptionsMap: Map<string, string[]>,
	globalBounds: GlobalBounds,
	questionConfidence?: Map<string, number>
): ExtremeQuestion | null {
	if (stats.length === 0) return null;

	const { alignmentMin, alignmentMax, consensusMin, consensusMax, confidenceMin, confidenceMax } = globalBounds;
	const alignmentMid = (alignmentMin + alignmentMax) / 2;
	const consensusMid = (consensusMin + consensusMax) / 2;
	const confidenceMid = (confidenceMin + confidenceMax) / 2;
	const alignmentRange = alignmentMax - alignmentMin;
	const consensusRange = consensusMax - consensusMin;
	const confidenceRange = confidenceMax - confidenceMin;

	let best: { stat: QuestionStats; metric: MetricType; normalizedDist: number; score: number } | null = null;

	for (const q of stats) {
		// Check alignment - normalize distance to 0-1 scale based on GLOBAL range
		if (q.humanAiScore > 0 && alignmentRange > 0) {
			const dist = Math.abs(q.humanAiScore - alignmentMid);
			const normalizedDist = dist / (alignmentRange / 2); // 1.0 = at global min or max
			if (
				!best ||
				normalizedDist > best.normalizedDist ||
				(normalizedDist === best.normalizedDist && best.metric !== 'alignment')
			) {
				best = { stat: q, metric: 'alignment', normalizedDist, score: q.humanAiScore };
			}
		}

		// Check consensus
		if (q.aiAgreementScore > 0 && consensusRange > 0) {
			const dist = Math.abs(q.aiAgreementScore - consensusMid);
			const normalizedDist = dist / (consensusRange / 2);
			if (
				!best ||
				normalizedDist > best.normalizedDist ||
				(normalizedDist === best.normalizedDist && best.metric === 'confidence')
			) {
				best = { stat: q, metric: 'consensus', normalizedDist, score: q.aiAgreementScore };
			}
		}

		// Check confidence (if available)
		const confidence = questionConfidence?.get(q.questionId);
		if (confidence !== undefined && confidenceRange > 0) {
			const dist = Math.abs(confidence - confidenceMid);
			const normalizedDist = dist / (confidenceRange / 2);
			if (!best || normalizedDist > best.normalizedDist) {
				best = { stat: q, metric: 'confidence', normalizedDist, score: confidence };
			}
		}
	}

	if (!best) return null;

	const text = questionTextMap.get(best.stat.questionId);
	if (!text) return null;

	// Determine if high or low relative to the global midpoint
	let isHigh: boolean;
	if (best.metric === 'alignment') {
		isHigh = best.score > alignmentMid;
	} else if (best.metric === 'consensus') {
		isHigh = best.score > consensusMid;
	} else {
		isHigh = best.score > confidenceMid;
	}

	// Get confidence for this question
	const confidence = questionConfidence?.get(best.stat.questionId) ?? null;
	const options = questionOptionsMap.get(best.stat.questionId) ?? [];

	return {
		id: best.stat.questionId,
		text,
		score: best.score,
		metric: best.metric,
		isHigh,
		alignment: best.stat.humanAiScore > 0 ? best.stat.humanAiScore : null,
		consensus: best.stat.aiAgreementScore > 0 ? best.stat.aiAgreementScore : null,
		confidence,
		humanMode: best.stat.humanMode,
		aiMode: best.stat.aiMode,
		humanMean: best.stat.humanMean,
		aiMean: best.stat.aiMean,
		responseType: best.stat.responseType,
		options
	};
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { sources: [], categories: [], topModels: [], bottomModels: [], unbenchmarkedQuestions: [] };
	}

	const db = platform.env.DB;
	const kv = platform.env.ALIGNMENT_CACHE;

	// Get category descriptions
	const categoryDescriptionsResult = await db
		.prepare('SELECT name, description, display_order FROM categories ORDER BY display_order')
		.all<{ name: string; description: string; display_order: number }>();
	const categoryDescriptions = new Map<string, { description: string; order: number }>();
	for (const row of categoryDescriptionsResult.results) {
		categoryDescriptions.set(row.name, { description: row.description, order: row.display_order });
	}

	// Get all benchmark sources with question counts
	const sourcesResult = await db
		.prepare(
			`
			SELECT
				bs.*,
				COUNT(DISTINCT CASE WHEN q.status = 'published' THEN q.id END) as question_count
			FROM benchmark_sources bs
			LEFT JOIN questions q ON q.benchmark_source_id = bs.id
			GROUP BY bs.id
			ORDER BY bs.name
		`
		)
		.all<BenchmarkSourceRow>();

	// Get all published questions with their source assignments
	const questionsResult = await db
		.prepare(
			`
			SELECT id, text, category, response_type, options, benchmark_source_id
			FROM questions
			WHERE status = 'published'
		`
		)
		.all<QuestionRow>();

	const questionsBySource = new Map<string, Array<QuestionMeta & { text: string }>>();
	const questionTextMap = new Map<string, string>();
	const questionOptionsMap = new Map<string, string[]>();
	const questionCategoryMap = new Map<string, string>();
	const allBenchmarkedQuestions: Array<QuestionMeta & { text: string }> = [];

	for (const q of questionsResult.results) {
		questionTextMap.set(q.id, q.text);
		const options = q.options ? (JSON.parse(q.options) as string[]) : [];
		questionOptionsMap.set(q.id, options);
		if (q.category) {
			questionCategoryMap.set(q.id, q.category);
		}

		if (q.benchmark_source_id) {
			const questionMeta = {
				id: q.id,
				text: q.text,
				options,
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
		.prepare(
			`
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
				${getLatestPollFilter()}
		`
		)
		.all<ModelResponseRow>();

	// Get human distributions (overall only)
	const humanResult = await db
		.prepare(
			`
			SELECT question_id, benchmark_source_id, distribution
			FROM human_response_distributions
			WHERE continent IS NULL
				AND education_level IS NULL
				AND age_group IS NULL
				AND gender IS NULL
		`
		)
		.all<HumanDistributionRow>();

	// Group responses by source
	const responsesBySource = new Map<
		string,
		Map<
			string,
			{
				name: string;
				byQuestion: Map<string, { answers: string[]; responseType: string }>;
			}
		>
	>();

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

	// First pass: compute/collect stats for each source (without extremeQuestion yet)
	const sourceStatsMap = new Map<string, SourceStats>();
	const allQuestionStats = new Map<string, QuestionStats>();

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
						responses[questionId] = responseType === 'ordinal' ? computeMedian(answers) : computeMode(answers);
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

		if (sourceStats) {
			sourceStatsMap.set(source.id, sourceStats);
			// Collect all question stats for global bounds
			for (const stat of sourceStats.questionStats) {
				allQuestionStats.set(stat.questionId, stat);
			}
		}
	}

	// Compute per-question confidence for all sources
	const allQuestionConfidence = new Map<string, number>();
	const sourceQuestionConfidence = new Map<string, Map<string, number>>();
	for (const source of sourcesResult.results) {
		const questions = questionsBySource.get(source.id) || [];
		const rawResponses = responsesBySource.get(source.id);
		if (rawResponses && questions.length > 0) {
			const confidence = computeQuestionConfidence(rawResponses, questions);
			sourceQuestionConfidence.set(source.id, confidence);
			for (const [qId, score] of confidence) {
				allQuestionConfidence.set(qId, score);
			}
		}
	}

	// Calculate global bounds across ALL questions (including confidence)
	let globalAlignmentMin = 100,
		globalAlignmentMax = 0;
	let globalConsensusMin = 100,
		globalConsensusMax = 0;
	let globalConfidenceMin = 100,
		globalConfidenceMax = 0;
	for (const stat of allQuestionStats.values()) {
		if (stat.humanAiScore > 0) {
			globalAlignmentMin = Math.min(globalAlignmentMin, stat.humanAiScore);
			globalAlignmentMax = Math.max(globalAlignmentMax, stat.humanAiScore);
		}
		if (stat.aiAgreementScore > 0) {
			globalConsensusMin = Math.min(globalConsensusMin, stat.aiAgreementScore);
			globalConsensusMax = Math.max(globalConsensusMax, stat.aiAgreementScore);
		}
	}
	for (const confidence of allQuestionConfidence.values()) {
		globalConfidenceMin = Math.min(globalConfidenceMin, confidence);
		globalConfidenceMax = Math.max(globalConfidenceMax, confidence);
	}
	const globalBounds: GlobalBounds = {
		alignmentMin: globalAlignmentMin,
		alignmentMax: globalAlignmentMax,
		consensusMin: globalConsensusMin,
		consensusMax: globalConsensusMax,
		confidenceMin: globalConfidenceMin,
		confidenceMax: globalConfidenceMax
	};

	// Second pass: build sources array with extremeQuestion using global bounds
	const sources: SourceWithStats[] = [];
	for (const source of sourcesResult.results) {
		const sourceStats = sourceStatsMap.get(source.id);
		const questions = questionsBySource.get(source.id) || [];

		// Get pre-computed confidence data
		const rawResponses = responsesBySource.get(source.id);
		const questionConfidence = sourceQuestionConfidence.get(source.id);
		const aiConfidenceScore =
			rawResponses && questions.length > 0 ? computeSourceConfidence(rawResponses, questions) : null;

		// Find the most interesting question using GLOBAL bounds (including confidence)
		const extremeQuestion = sourceStats
			? findMostInteresting(
					sourceStats.questionStats,
					questionTextMap,
					questionOptionsMap,
					globalBounds,
					questionConfidence
				)
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
			aiAgreementScore: sourceStats?.overallAiAgreement ?? null,
			aiConfidenceScore,
			modelCount: sourceStats?.modelCount ?? 0,
			extremeQuestion
		});
	}

	// Group stats by category
	const categoryAggregates = new Map<
		string,
		{
			totalHumanAiScore: number;
			totalAiAgreementScore: number;
			count: number;
			stats: QuestionStats[];
		}
	>();

	for (const [questionId, stat] of allQuestionStats) {
		const category = questionCategoryMap.get(questionId);
		if (!category) continue;

		if (!categoryAggregates.has(category)) {
			categoryAggregates.set(category, {
				totalHumanAiScore: 0,
				totalAiAgreementScore: 0,
				count: 0,
				stats: []
			});
		}
		const agg = categoryAggregates.get(category)!;
		agg.totalHumanAiScore += stat.humanAiScore;
		agg.totalAiAgreementScore += stat.aiAgreementScore;
		agg.count++;
		agg.stats.push(stat);
	}

	// Pre-group responses by category once (instead of nested O(n³) loop)
	// Also track model IDs per category (avoids separate SQL query)
	const responsesByCategory = new Map<
		string,
		Array<{ answers: string[]; responseType: string; optionCount: number }>
	>();
	const modelIdsByCategory = new Map<string, Set<string>>();
	for (const [, sourceResponses] of responsesBySource) {
		for (const [modelId, modelData] of sourceResponses) {
			for (const [questionId, { answers, responseType }] of modelData.byQuestion) {
				const category = questionCategoryMap.get(questionId);
				if (!category) continue;
				if (!responsesByCategory.has(category)) {
					responsesByCategory.set(category, []);
					modelIdsByCategory.set(category, new Set());
				}
				const options = questionOptionsMap.get(questionId);
				responsesByCategory.get(category)!.push({
					answers,
					responseType,
					optionCount: options?.length ?? 5
				});
				modelIdsByCategory.get(category)!.add(modelId);
			}
		}
	}

	// Compute confidence per category from pre-grouped responses
	const categoryConfidence = new Map<string, number>();
	for (const [category] of categoryAggregates) {
		const responses = responsesByCategory.get(category) || [];
		const consistencies = responses.map(({ answers, responseType, optionCount }) => {
			if (answers.length < 2) return 100;
			return responseType === 'ordinal'
				? ordinalInternalAgreement(answers, optionCount)
				: nominalInternalAgreement(answers, optionCount);
		});

		if (consistencies.length > 0) {
			categoryConfidence.set(category, Math.round(consistencies.reduce((a, b) => a + b, 0) / consistencies.length));
		}
	}

	// Build category stats
	const categories: CategoryStats[] = [];
	for (const [category, agg] of categoryAggregates) {
		if (agg.count === 0) continue;
		const catInfo = categoryDescriptions.get(category);
		categories.push({
			category,
			description: catInfo?.description ?? null,
			humanAiScore: Math.round(agg.totalHumanAiScore / agg.count),
			aiAgreementScore: Math.round(agg.totalAiAgreementScore / agg.count),
			aiConfidenceScore: categoryConfidence.get(category) ?? null,
			questionCount: agg.count,
			modelCount: modelIdsByCategory.get(category)?.size ?? 0,
			extremeQuestion: findMostInteresting(
				agg.stats,
				questionTextMap,
				questionOptionsMap,
				globalBounds,
				allQuestionConfidence
			)
		});
	}
	// Sort by display_order from categories table, fallback to alphabetical
	categories.sort((a, b) => {
		const orderA = categoryDescriptions.get(a.category)?.order ?? 999;
		const orderB = categoryDescriptions.get(b.category)?.order ?? 999;
		if (orderA !== orderB) return orderA - orderB;
		return a.category.localeCompare(b.category);
	});

	// Compute model rankings
	// Group all responses by model and compute per-model alignment scores
	const modelAlignmentData = new Map<
		string,
		{
			name: string;
			family: string;
			totalScore: number;
			questionCount: number;
		}
	>();

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
				aggregatedResponses[questionId] = responseType === 'ordinal' ? computeMedian(answers) : computeMode(answers);
			}

			// Compute alignment score for this model
			for (const [questionId, answer] of Object.entries(aggregatedResponses)) {
				if (!answer) continue;
				const humanDist = allHumanDist.get(questionId);
				if (!humanDist) continue;

				const q = allBenchmarkedQuestions.find((x) => x.id === questionId);
				if (!q) continue;

				let score: number;
				if (q.responseType === 'ordinal') {
					// Build single-answer AI distribution for overlap calculation
					const aiDist: Record<string, number> = { [answer]: 1 };
					score = ordinalAgreementScore(humanDist, aiDist, q.options);
				} else {
					// Nominal: convert AI answer to label and compute overlap
					const idx = parseInt(answer, 10) - 1;
					const label = idx >= 0 && idx < q.options.length ? q.options[idx] : answer;
					const aiDist: Record<string, number> = { [label]: 1 };

					// Convert human distribution keys to labels
					const humanDistLabeled: Record<string, number> = {};
					for (const [key, count] of Object.entries(humanDist)) {
						const keyIdx = parseInt(key, 10) - 1;
						const keyLabel = keyIdx >= 0 && keyIdx < q.options.length ? q.options[keyIdx] : key;
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
		.prepare(
			`
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
		`
		)
		.all<{ id: string; text: string; category: string | null; response_count: number }>();

	return {
		sources,
		categories,
		topModels,
		bottomModels,
		unbenchmarkedQuestions: unbenchmarkedResult.results
	};
};
