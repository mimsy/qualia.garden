// ABOUTME: Data loader for benchmark source detail page.
// ABOUTME: Returns questions with agreement scores for sorting and display.

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { computeMedian, computeMode } from '$lib/db/types';
import {
	computeQuestionStats,
	computeOverallScore,
	getCacheKey,
	getCachedSourceStats,
	setCachedSourceStats,
	type QuestionMeta,
	type SourceStats
} from '$lib/alignment';

interface BenchmarkSource {
	id: string;
	name: string;
	short_name: string;
	url: string | null;
	sample_size: number | null;
	year_range: string | null;
	description: string | null;
}

interface Question {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	options: string | null;
}

interface ModelResponseRow {
	model_id: string;
	model_name: string;
	question_id: string;
	response_type: string;
	parsed_answer: string;
}

interface HumanDistributionRow {
	question_id: string;
	distribution: string;
	sample_size: number;
}

export interface QuestionWithStats {
	id: string;
	text: string;
	category: string | null;
	responseType: string;
	options: string[];
	// Stats (normalized means on 0-1 scale for ordinal)
	humanMean: number | null;
	aiMean: number | null;
	humanMode: string | null;
	aiMode: string | null;
	// Scores (0-5 scale)
	humanAiScore: number;
	aiConsensusScore: number;
	modelCount: number;
}

export const load: PageServerLoad = async ({ params, platform, url }) => {
	if (!platform?.env?.DB) {
		return error(500, 'Database not available');
	}

	const db = platform.env.DB;
	const kv = platform.env.ALIGNMENT_CACHE;
	const sourceId = params.id;

	// Get source metadata
	const sourceResult = await db
		.prepare('SELECT * FROM benchmark_sources WHERE id = ?')
		.bind(sourceId)
		.first<BenchmarkSource>();

	if (!sourceResult) {
		return error(404, 'Source not found');
	}

	// Get published questions for this source
	const questionsResult = await db
		.prepare(`
			SELECT id, text, category, response_type, options
			FROM questions
			WHERE benchmark_source_id = ?
				AND status = 'published'
			ORDER BY category, text
		`)
		.bind(sourceId)
		.all<Question>();

	const questions = questionsResult.results;
	if (questions.length === 0) {
		return {
			source: sourceResult,
			questions: [],
			overallAlignment: null,
			modelCount: 0
		};
	}

	// Build question metadata
	const questionMeta: Array<QuestionMeta & { text: string; category: string | null }> = questions.map(q => ({
		id: q.id,
		text: q.text,
		category: q.category,
		options: q.options ? JSON.parse(q.options) as string[] : [],
		responseType: q.response_type
	}));

	// Check cache (validate format - old cache may have different shape)
	const cacheKey = getCacheKey(sourceId, 'full');
	let sourceStats = await getCachedSourceStats(kv, cacheKey);
	// Invalidate cache if it has old format (missing questionStats or using old divergence fields)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (sourceStats && (!sourceStats.questionStats || (sourceStats.questionStats[0] as any)?.humanAiDivergence !== undefined)) {
		sourceStats = null;
	}

	// Get AI responses (latest batch per model per question)
	const responsesResult = await db
		.prepare(`
			SELECT
				m.id as model_id,
				m.name as model_name,
				p.question_id,
				q.response_type,
				r.parsed_answer
			FROM polls p
			JOIN models m ON p.model_id = m.id
			JOIN responses r ON p.id = r.poll_id
			JOIN questions q ON p.question_id = q.id
			WHERE p.status = 'complete'
				AND r.parsed_answer IS NOT NULL
				AND q.benchmark_source_id = ?
				AND q.status = 'published'
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
		.bind(sourceId)
		.all<ModelResponseRow>();

	// Group and aggregate model responses
	const rawResponses = new Map<string, {
		name: string;
		byQuestion: Map<string, { answers: string[]; responseType: string }>
	}>();

	for (const r of responsesResult.results) {
		if (!rawResponses.has(r.model_id)) {
			rawResponses.set(r.model_id, { name: r.model_name, byQuestion: new Map() });
		}
		const model = rawResponses.get(r.model_id)!;
		if (!model.byQuestion.has(r.question_id)) {
			model.byQuestion.set(r.question_id, { answers: [], responseType: r.response_type });
		}
		model.byQuestion.get(r.question_id)!.answers.push(r.parsed_answer);
	}

	// Compute aggregated responses per model
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

	// Get human distributions (overall only)
	const humanResult = await db
		.prepare(`
			SELECT question_id, distribution, sample_size
			FROM human_response_distributions
			WHERE question_id IN (SELECT id FROM questions WHERE benchmark_source_id = ? AND status = 'published')
				AND continent IS NULL
				AND education_level IS NULL
				AND age_group IS NULL
				AND gender IS NULL
		`)
		.bind(sourceId)
		.all<HumanDistributionRow>();

	// Build human distributions map
	const humanDistributions = new Map<string, Record<string, number>>();
	for (const d of humanResult.results) {
		humanDistributions.set(d.question_id, JSON.parse(d.distribution));
	}

	// Compute stats if not cached
	if (!sourceStats && modelResponses.size > 0 && humanDistributions.size > 0) {
		const questionStats = computeQuestionStats(questionMeta, modelResponses, humanDistributions);
		const overallScore = computeOverallScore(questionStats);

		sourceStats = {
			overallScore,
			questionStats,
			modelCount: modelResponses.size,
			questionCount: questions.length,
			computedAt: new Date().toISOString()
		};

		await setCachedSourceStats(kv, cacheKey, sourceStats);
	}

	// Build questions with stats for display
	const questionsWithStats: QuestionWithStats[] = questionMeta.map(q => {
		const stats = sourceStats?.questionStats.find(s => s.questionId === q.id);
		return {
			id: q.id,
			text: q.text,
			category: q.category,
			responseType: q.responseType,
			options: q.options,
			humanMean: stats?.humanMean ?? null,
			aiMean: stats?.aiMean ?? null,
			humanMode: stats?.humanMode ?? null,
			aiMode: stats?.aiMode ?? null,
			humanAiScore: stats?.humanAiScore ?? 0,
			aiConsensusScore: stats?.aiConsensusScore ?? 0,
			modelCount: stats?.modelCount ?? 0
		};
	});

	// Get unique categories
	const categories = [...new Set(questions.filter(q => q.category).map(q => q.category as string))];

	// Compute overall AI consensus (average of per-question consensus scores)
	const questionsWithConsensus = questionsWithStats.filter(q => q.modelCount >= 2 && q.aiConsensusScore > 0);
	const overallAiConsensus = questionsWithConsensus.length > 0
		? Math.round((questionsWithConsensus.reduce((sum, q) => sum + q.aiConsensusScore, 0) / questionsWithConsensus.length) * 10) / 10
		: null;

	return {
		source: sourceResult,
		questions: questionsWithStats,
		categories,
		overallScore: sourceStats?.overallScore ?? null,
		overallAiConsensus,
		modelCount: sourceStats?.modelCount ?? 0
	};
};
