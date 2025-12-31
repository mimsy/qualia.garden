// ABOUTME: Home page data loader.
// ABOUTME: Fetches benchmark sources with alignment stats and divergence highlights.

import type { PageServerLoad } from './$types';
import { computeMedian, computeMode } from '$lib/db/types';
import {
	computeQuestionStats,
	computeOverallScore,
	getCacheKey,
	getCachedSourceStats,
	setCachedSourceStats,
	type QuestionMeta,
	type SourceStats,
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

export interface SourceWithStats {
	id: string;
	name: string;
	short_name: string;
	url: string | null;
	sample_size: number | null;
	year_range: string | null;
	questionCount: number;
	overallScore: number | null;
	modelCount: number;
	// Highlight questions (lowest scores = most interesting disagreement)
	lowestHumanAiScore: { id: string; text: string; score: number } | null;
	lowestAiConsensus: { id: string; text: string; score: number } | null;
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { sources: [], unbenchmarkedQuestions: [] };
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
	for (const q of questionsResult.results) {
		if (q.benchmark_source_id) {
			if (!questionsBySource.has(q.benchmark_source_id)) {
				questionsBySource.set(q.benchmark_source_id, []);
			}
			questionsBySource.get(q.benchmark_source_id)!.push({
				id: q.id,
				text: q.text,
				options: q.options ? JSON.parse(q.options) as string[] : [],
				responseType: q.response_type
			});
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
		// Invalidate cache if it has old format (missing questionStats or using old divergence fields)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (sourceStats && (!sourceStats.questionStats || (sourceStats.questionStats[0] as any)?.humanAiDivergence !== undefined)) {
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
				const overallScore = computeOverallScore(questionStats);

				sourceStats = {
					overallScore,
					questionStats,
					modelCount: modelResponses.size,
					questionCount: questions.length,
					computedAt: new Date().toISOString()
				};

				// Cache the result
				await setCachedSourceStats(kv, cacheKey, sourceStats);
			}
		}

		// Find highlight questions (lowest scores = most interesting disagreement)
		let lowestHumanAiScore: SourceWithStats['lowestHumanAiScore'] = null;
		let lowestAiConsensus: SourceWithStats['lowestAiConsensus'] = null;

		if (sourceStats && sourceStats.questionStats.length > 0) {
			// Lowest AI-human agreement score (most disagreement with humans)
			const sortedByHumanAi = [...sourceStats.questionStats]
				.filter(q => q.humanAiScore > 0) // Has data
				.sort((a, b) => a.humanAiScore - b.humanAiScore); // Ascending (lowest first)
			if (sortedByHumanAi.length > 0) {
				const q = sortedByHumanAi[0];
				const qInfo = questions.find(x => x.id === q.questionId);
				if (qInfo) {
					lowestHumanAiScore = {
						id: q.questionId,
						text: qInfo.text,
						score: q.humanAiScore
					};
				}
			}

			// Lowest AI consensus score (most disagreement among AIs)
			const sortedByConsensus = [...sourceStats.questionStats]
				.filter(q => q.modelCount >= 2) // Need multiple models for meaningful consensus
				.sort((a, b) => a.aiConsensusScore - b.aiConsensusScore); // Ascending (lowest first)
			if (sortedByConsensus.length > 0) {
				const q = sortedByConsensus[0];
				const qInfo = questions.find(x => x.id === q.questionId);
				if (qInfo) {
					lowestAiConsensus = {
						id: q.questionId,
						text: qInfo.text,
						score: q.aiConsensusScore
					};
				}
			}
		}

		sources.push({
			id: source.id,
			name: source.name,
			short_name: source.short_name,
			url: source.url,
			sample_size: source.sample_size,
			year_range: source.year_range,
			questionCount: source.question_count,
			overallScore: sourceStats?.overallScore ?? null,
			modelCount: sourceStats?.modelCount ?? 0,
			lowestHumanAiScore,
			lowestAiConsensus
		});
	}

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
		unbenchmarkedQuestions: unbenchmarkedResult.results
	};
};
