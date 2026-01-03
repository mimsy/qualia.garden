// ABOUTME: Family page data loader for model groupings.
// ABOUTME: Aggregates stats for all models in a family (human alignment, self-consistency).

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { computeMedian, computeMode } from '$lib/db/types';
import {
	ordinalAgreementScore,
	nominalAgreementScore,
	ordinalConsensusScore,
	nominalConsensusScore,
	distributionMeanNormalized,
	arrayMeanNormalized
} from '$lib/alignment';

interface ModelRow {
	id: string;
	name: string;
	supports_reasoning: number;
	active: number;
}

interface ResponseRow {
	model_id: string;
	question_id: string;
	parsed_answer: string;
}

interface QuestionRow {
	id: string;
	response_type: string;
	options: string | null;
	benchmark_source_id: string | null;
}

interface HumanDistRow {
	question_id: string;
	distribution: string;
}

interface ModelStats {
	id: string;
	name: string;
	supports_reasoning: boolean;
	active: boolean;
	questionCount: number;
	humanAlignment: number | null;
	selfConsistency: number | null;
}

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		return error(500, 'Database not available');
	}

	const db = platform.env.DB;
	const family = decodeURIComponent(params.family);

	// Get all models in this family
	const modelsResult = await db
		.prepare('SELECT id, name, supports_reasoning, active FROM models WHERE family = ? ORDER BY name')
		.bind(family)
		.all<ModelRow>();

	if (modelsResult.results.length === 0) {
		return error(404, 'Family not found');
	}

	const modelIds = modelsResult.results.map((m) => m.id);

	// Get all responses for these models
	const responsesResult = await db
		.prepare(`
			SELECT p.model_id, p.question_id, r.parsed_answer
			FROM polls p
			JOIN responses r ON p.id = r.poll_id
			JOIN questions q ON p.question_id = q.id
			WHERE p.model_id IN (${modelIds.map(() => '?').join(',')})
				AND p.status = 'complete'
				AND r.parsed_answer IS NOT NULL
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
		.bind(...modelIds)
		.all<ResponseRow>();

	// Group responses by model and question
	const responsesByModel = new Map<string, Map<string, string[]>>();
	for (const r of responsesResult.results) {
		if (!responsesByModel.has(r.model_id)) {
			responsesByModel.set(r.model_id, new Map());
		}
		const modelResponses = responsesByModel.get(r.model_id)!;
		if (!modelResponses.has(r.question_id)) {
			modelResponses.set(r.question_id, []);
		}
		modelResponses.get(r.question_id)!.push(r.parsed_answer);
	}

	// Get all question IDs
	const allQuestionIds = new Set<string>();
	for (const modelResponses of responsesByModel.values()) {
		for (const qId of modelResponses.keys()) {
			allQuestionIds.add(qId);
		}
	}

	if (allQuestionIds.size === 0) {
		const modelStats: ModelStats[] = modelsResult.results.map((m) => ({
			id: m.id,
			name: m.name,
			supports_reasoning: Boolean(m.supports_reasoning),
			active: Boolean(m.active),
			questionCount: 0,
			humanAlignment: null,
			selfConsistency: null
		}));

		return {
			family,
			models: modelStats,
			avgHumanAlignment: null,
			avgSelfConsistency: null,
			totalResponses: 0
		};
	}

	// Get question metadata
	const questionIds = [...allQuestionIds];
	const questionsResult = await db
		.prepare(`
			SELECT id, response_type, options, benchmark_source_id
			FROM questions
			WHERE id IN (${questionIds.map(() => '?').join(',')})
		`)
		.bind(...questionIds)
		.all<QuestionRow>();

	const questionMap = new Map<string, QuestionRow>();
	for (const q of questionsResult.results) {
		questionMap.set(q.id, q);
	}

	// Get human distributions
	const benchmarkedIds = questionsResult.results
		.filter((q) => q.benchmark_source_id)
		.map((q) => q.id);

	const humanDistMap = new Map<string, Record<string, number>>();
	if (benchmarkedIds.length > 0) {
		const humanResult = await db
			.prepare(`
				SELECT question_id, distribution
				FROM human_response_distributions
				WHERE question_id IN (${benchmarkedIds.map(() => '?').join(',')})
					AND continent IS NULL
					AND education_level IS NULL
					AND age_group IS NULL
					AND gender IS NULL
			`)
			.bind(...benchmarkedIds)
			.all<HumanDistRow>();

		for (const d of humanResult.results) {
			humanDistMap.set(d.question_id, JSON.parse(d.distribution));
		}
	}

	// Compute stats for each model
	const modelStats: ModelStats[] = [];

	for (const modelRow of modelsResult.results) {
		const modelResponses = responsesByModel.get(modelRow.id);

		if (!modelResponses || modelResponses.size === 0) {
			modelStats.push({
				id: modelRow.id,
				name: modelRow.name,
				supports_reasoning: Boolean(modelRow.supports_reasoning),
				active: Boolean(modelRow.active),
				questionCount: 0,
				humanAlignment: null,
				selfConsistency: null
			});
			continue;
		}

		const humanAlignmentScores: number[] = [];
		const selfConsistencyScores: number[] = [];

		for (const [qId, answers] of modelResponses) {
			const q = questionMap.get(qId);
			if (!q) continue;

			const options = q.options ? (JSON.parse(q.options) as string[]) : [];
			if (options.length === 0) continue;

			// Aggregate answer
			const aggregatedAnswer =
				q.response_type === 'ordinal' ? computeMedian(answers) : computeMode(answers);

			// Self-consistency
			if (answers.length >= 2) {
				const sc =
					q.response_type === 'ordinal'
						? ordinalConsensusScore(answers, options.length)
						: nominalConsensusScore(answers);
				selfConsistencyScores.push(sc);
			} else if (answers.length === 1) {
				selfConsistencyScores.push(100);
			}

			// Human alignment
			const humanDist = humanDistMap.get(qId);
			if (humanDist && aggregatedAnswer) {
				if (q.response_type === 'ordinal') {
					// Build single-answer AI distribution for overlap calculation
					const aiDist: Record<string, number> = { [aggregatedAnswer]: 1 };
					humanAlignmentScores.push(ordinalAgreementScore(humanDist, aiDist));
				} else {
					const idx = parseInt(aggregatedAnswer, 10) - 1;
					const answerLabel = idx >= 0 && idx < options.length ? options[idx] : aggregatedAnswer;

					const humanDistLabeled: Record<string, number> = {};
					for (const [key, count] of Object.entries(humanDist)) {
						const hIdx = parseInt(key, 10) - 1;
						const label = hIdx >= 0 && hIdx < options.length ? options[hIdx] : key;
						humanDistLabeled[label] = (humanDistLabeled[label] || 0) + count;
					}

					const aiDist: Record<string, number> = { [answerLabel]: 1 };
					humanAlignmentScores.push(nominalAgreementScore(humanDistLabeled, aiDist));
				}
			}
		}

		const avgHumanAlignment =
			humanAlignmentScores.length > 0
				? Math.round(
						(humanAlignmentScores.reduce((a, b) => a + b, 0) / humanAlignmentScores.length) * 10
					) / 10
				: null;

		const avgSelfConsistency =
			selfConsistencyScores.length > 0
				? Math.round(
						(selfConsistencyScores.reduce((a, b) => a + b, 0) / selfConsistencyScores.length) * 10
					) / 10
				: null;

		modelStats.push({
			id: modelRow.id,
			name: modelRow.name,
			supports_reasoning: Boolean(modelRow.supports_reasoning),
			active: Boolean(modelRow.active),
			questionCount: modelResponses.size,
			humanAlignment: avgHumanAlignment,
			selfConsistency: avgSelfConsistency
		});
	}

	// Compute family-level averages
	const modelsWithAlignment = modelStats.filter((m) => m.humanAlignment !== null);
	const modelsWithConsistency = modelStats.filter((m) => m.selfConsistency !== null);

	const avgHumanAlignment =
		modelsWithAlignment.length > 0
			? Math.round(
					(modelsWithAlignment.reduce((sum, m) => sum + m.humanAlignment!, 0) /
						modelsWithAlignment.length) *
						10
				) / 10
			: null;

	const avgSelfConsistency =
		modelsWithConsistency.length > 0
			? Math.round(
					(modelsWithConsistency.reduce((sum, m) => sum + m.selfConsistency!, 0) /
						modelsWithConsistency.length) *
						10
				) / 10
			: null;

	const totalResponses = modelStats.reduce((sum, m) => sum + m.questionCount, 0);

	// Sort models by human alignment (best first), then by question count
	modelStats.sort((a, b) => {
		if (a.humanAlignment !== null && b.humanAlignment !== null) {
			return b.humanAlignment - a.humanAlignment;
		}
		if (a.humanAlignment !== null) return -1;
		if (b.humanAlignment !== null) return 1;
		return b.questionCount - a.questionCount;
	});

	return {
		family,
		models: modelStats,
		avgHumanAlignment,
		avgSelfConsistency,
		totalResponses
	};
};
