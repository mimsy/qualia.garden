// ABOUTME: Shared data loading utility for questions with full statistics.
// ABOUTME: Computes AI distributions, human distributions, and all three core scores.

import { computeMedian, computeMode } from './types';
import {
	ordinalAgreementScore,
	nominalAgreementScore,
	ordinalConsensusScore,
	nominalConsensusScore,
	normalizeDistributionKeys
} from '$lib/alignment';

export interface AggregateResult {
	answer: string;
	label: string;
	count: number;
	percentage: number;
}

export interface QuestionWithStats {
	id: string;
	text: string;
	category: string | null;
	responseType: string;
	options: string[];
	sourceId: string | null;
	sourceShortName: string | null;
	// Distribution data
	aiResults: AggregateResult[];
	humanResults: AggregateResult[];
	humanSampleSize: number | null;
	// Scores (0-100, null if not applicable)
	humanSimilarity: number | null;
	aiConsensus: number | null;
	aiConfidence: number | null;
	modelCount: number;
	createdAt: string;
}

interface QuestionRow {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	options: string | null;
	benchmark_source_id: string | null;
	source_short_name: string | null;
	created_at: string;
}

interface ModelResponseRow {
	model_id: string;
	question_id: string;
	response_type: string;
	parsed_answer: string;
}

interface HumanDistributionRow {
	question_id: string;
	distribution: string;
	sample_size: number;
}

export async function loadQuestionsWithStats(
	db: D1Database,
	filter: {
		category?: string | null;
		sourceId?: string | null;
		status?: string;
		questionIds?: string[];
	}
): Promise<QuestionWithStats[]> {
	// Build WHERE clause based on filters
	const conditions: string[] = [];
	const params: (string | null)[] = [];

	if (filter.status && filter.status !== 'all') {
		conditions.push('q.status = ?');
		params.push(filter.status);
	}

	if (filter.category) {
		conditions.push('q.category = ?');
		params.push(filter.category);
	}

	if (filter.sourceId === null) {
		conditions.push('q.benchmark_source_id IS NULL');
	} else if (filter.sourceId) {
		conditions.push('q.benchmark_source_id = ?');
		params.push(filter.sourceId);
	}

	if (filter.questionIds && filter.questionIds.length > 0) {
		conditions.push(`q.id IN (${filter.questionIds.map(() => '?').join(',')})`);
		params.push(...filter.questionIds);
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

	// Build a subquery for filtering questions (used by responses and human distributions)
	// This avoids SQLite's variable limit when there are many questions
	const questionSubquery = `
		SELECT q.id FROM questions q
		LEFT JOIN benchmark_sources bs ON q.benchmark_source_id = bs.id
		${whereClause}
	`;

	// Get questions with source info
	const questionsResult = await db
		.prepare(
			`
			SELECT q.id, q.text, q.category, q.response_type, q.options,
				   q.benchmark_source_id, q.created_at,
				   bs.short_name as source_short_name
			FROM questions q
			LEFT JOIN benchmark_sources bs ON q.benchmark_source_id = bs.id
			${whereClause}
			ORDER BY q.created_at DESC
		`
		)
		.bind(...params)
		.all<QuestionRow>();

	const questions = questionsResult.results;
	if (questions.length === 0) {
		return [];
	}

	// Get AI responses (latest batch per model per question)
	// This fetches ALL individual samples for computing self-consistency
	// Uses subquery to filter questions to avoid SQLite variable limit
	const responsesResult = await db
		.prepare(
			`
			SELECT
				m.id as model_id,
				p.question_id,
				q.response_type,
				r.parsed_answer
			FROM polls p
			JOIN models m ON p.model_id = m.id
			JOIN responses r ON p.id = r.poll_id
			JOIN questions q ON p.question_id = q.id
			WHERE p.status = 'complete'
				AND r.parsed_answer IS NOT NULL
				AND p.question_id IN (${questionSubquery})
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
		`
		)
		.bind(...params)
		.all<ModelResponseRow>();

	// Group responses by question, then by model (keeping all samples per model)
	const responsesByQuestion = new Map<
		string,
		Map<string, { answers: string[]; responseType: string }>
	>();
	for (const r of responsesResult.results) {
		if (!responsesByQuestion.has(r.question_id)) {
			responsesByQuestion.set(r.question_id, new Map());
		}
		const questionResponses = responsesByQuestion.get(r.question_id)!;
		if (!questionResponses.has(r.model_id)) {
			questionResponses.set(r.model_id, { answers: [], responseType: r.response_type });
		}
		questionResponses.get(r.model_id)!.answers.push(r.parsed_answer);
	}

	// Get human distributions (overall only)
	// Uses subquery to filter questions to avoid SQLite variable limit
	const humanResult = await db
		.prepare(
			`
			SELECT question_id, distribution, sample_size
			FROM human_response_distributions
			WHERE question_id IN (${questionSubquery})
				AND continent IS NULL
				AND education_level IS NULL
				AND age_group IS NULL
				AND gender IS NULL
		`
		)
		.bind(...params)
		.all<HumanDistributionRow>();

	const humanDistributions = new Map<
		string,
		{ distribution: Record<string, number>; sampleSize: number }
	>();
	for (const d of humanResult.results) {
		humanDistributions.set(d.question_id, {
			distribution: JSON.parse(d.distribution),
			sampleSize: d.sample_size
		});
	}

	// Build questions with full results
	const questionsWithStats: QuestionWithStats[] = questions.map((q) => {
		const options = q.options ? (JSON.parse(q.options) as string[]) : [];
		const questionResponses = responsesByQuestion.get(q.id);
		const humanData = humanDistributions.get(q.id);

		// Aggregate AI responses per model, collecting both aggregated answers and self-consistency
		const aggregatedAnswers: string[] = [];
		const modelSelfConsistencies: number[] = [];

		if (questionResponses) {
			for (const [, data] of questionResponses) {
				// Compute aggregated answer for this model
				const aggregated =
					data.responseType === 'ordinal'
						? computeMedian(data.answers)
						: computeMode(data.answers);

				if (aggregated) {
					aggregatedAnswers.push(aggregated);
				}

				// Compute self-consistency for this model
				if (data.answers.length >= 2) {
					const selfConsistency =
						data.responseType === 'ordinal'
							? ordinalConsensusScore(data.answers, options.length)
							: nominalConsensusScore(data.answers);
					modelSelfConsistencies.push(selfConsistency);
				} else if (data.answers.length === 1) {
					// Perfect consistency with only one sample
					modelSelfConsistencies.push(100);
				}
			}
		}

		// Build AI distribution from aggregated answers
		const aiDist: Record<string, number> = {};
		for (const ans of aggregatedAnswers) {
			aiDist[ans] = (aiDist[ans] || 0) + 1;
		}
		const modelCount = aggregatedAnswers.length;

		// Build AI results for display
		const aiResults: AggregateResult[] = options.map((opt, i) => {
			const key = String(i + 1);
			const count = aiDist[key] || 0;
			return {
				answer: key,
				label: opt,
				count,
				percentage: modelCount > 0 ? (count / modelCount) * 100 : 0
			};
		});

		// Build human results for display
		let humanResults: AggregateResult[] = [];
		let humanSampleSize: number | null = null;
		if (humanData) {
			const normalizedDist = normalizeDistributionKeys(humanData.distribution, options);
			const humanTotal = Object.values(normalizedDist).reduce((a, b) => a + b, 0);
			humanSampleSize = humanData.sampleSize;

			humanResults = options.map((opt, i) => {
				const key = String(i + 1);
				const count = normalizedDist[key] || 0;
				return {
					answer: key,
					label: opt,
					count,
					percentage: humanTotal > 0 ? (count / humanTotal) * 100 : 0
				};
			});
		}

		// Compute scores
		let humanSimilarity: number | null = null;
		let aiConsensus: number | null = null;
		let aiConfidence: number | null = null;

		// Human Similarity (AI-Human agreement)
		if (humanData && modelCount > 0) {
			const normalizedHuman = normalizeDistributionKeys(humanData.distribution, options);
			if (q.response_type === 'ordinal') {
				humanSimilarity = ordinalAgreementScore(normalizedHuman, aiDist, options);
			} else {
				humanSimilarity = nominalAgreementScore(normalizedHuman, aiDist);
			}
		}

		// AI Consensus (how much AI models agree with each other)
		if (modelCount >= 2) {
			aiConsensus =
				q.response_type === 'ordinal'
					? ordinalConsensusScore(aggregatedAnswers, options.length)
					: nominalConsensusScore(aggregatedAnswers);
		} else if (modelCount === 1) {
			aiConsensus = 100; // Perfect agreement with only one model
		}

		// AI Confidence (average self-consistency across models)
		if (modelSelfConsistencies.length > 0) {
			aiConfidence = Math.round(
				modelSelfConsistencies.reduce((a, b) => a + b, 0) / modelSelfConsistencies.length
			);
		}

		return {
			id: q.id,
			text: q.text,
			category: q.category,
			responseType: q.response_type,
			options,
			sourceId: q.benchmark_source_id,
			sourceShortName: q.source_short_name,
			aiResults,
			humanResults,
			humanSampleSize,
			humanSimilarity,
			aiConsensus,
			aiConfidence,
			modelCount,
			createdAt: q.created_at
		};
	});

	return questionsWithStats;
}

// Compute overall averages across questions
export function computeOverallStats(questions: QuestionWithStats[]): {
	overallHumanSimilarity: number | null;
	overallAiConsensus: number | null;
	overallAiConfidence: number | null;
} {
	const questionsWithHumanData = questions.filter((q) => q.humanSimilarity !== null);
	const questionsWithAiData = questions.filter((q) => q.aiConsensus !== null && q.modelCount >= 2);
	const questionsWithConfidence = questions.filter((q) => q.aiConfidence !== null);

	const overallHumanSimilarity =
		questionsWithHumanData.length > 0
			? Math.round(
					questionsWithHumanData.reduce((sum, q) => sum + q.humanSimilarity!, 0) /
						questionsWithHumanData.length
				)
			: null;

	const overallAiConsensus =
		questionsWithAiData.length > 0
			? Math.round(
					questionsWithAiData.reduce((sum, q) => sum + q.aiConsensus!, 0) /
						questionsWithAiData.length
				)
			: null;

	const overallAiConfidence =
		questionsWithConfidence.length > 0
			? Math.round(
					questionsWithConfidence.reduce((sum, q) => sum + q.aiConfidence!, 0) /
						questionsWithConfidence.length
				)
			: null;

	return {
		overallHumanSimilarity,
		overallAiConsensus,
		overallAiConfidence
	};
}
