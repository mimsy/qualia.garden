// ABOUTME: Model detail page data loader.
// ABOUTME: Computes human alignment per category and AI similarity rankings.

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { computeMedian, computeMode } from '$lib/db/types';
import {
	ordinalAgreementScore,
	nominalAgreementScore,
	ordinalConsensusScore,
	nominalConsensusScore,
	distributionMeanNormalized,
	arrayMeanNormalized,
	distributionMode,
	arrayMode,
	getScoreLabel,
	computeAgreement
} from '$lib/alignment';

interface Model {
	id: string;
	name: string;
	family: string;
	supports_reasoning: boolean;
	active: boolean;
}

interface QuestionRow {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	options: string | null;
	benchmark_source_id: string | null;
}

interface ResponseRow {
	question_id: string;
	parsed_answer: string;
}

interface HumanDistRow {
	question_id: string;
	distribution: string;
}

interface OtherModelResponseRow {
	model_id: string;
	model_name: string;
	question_id: string;
	response_type: string;
	parsed_answer: string;
}

interface QuestionWithScore {
	id: string;
	text: string;
	category: string | null;
	humanAiScore: number;
	modelAnswer: string;
	humanMode: string | null;
	options: string[];
}

interface CategoryScore {
	category: string;
	score: number;
	questionCount: number;
}

interface ModelSimilarity {
	id: string;
	name: string;
	agreement: number; // 0-100 percentage
	sharedQuestions: number;
}

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		return error(500, 'Database not available');
	}

	const db = platform.env.DB;
	const modelId = params.id;

	// Get model metadata
	const model = await db
		.prepare('SELECT id, name, family, supports_reasoning, active FROM models WHERE id = ?')
		.bind(modelId)
		.first<Model>();

	if (!model) {
		return error(404, 'Model not found');
	}

	// Get this model's latest responses per question
	const responsesResult = await db
		.prepare(`
			SELECT p.question_id, r.parsed_answer
			FROM polls p
			JOIN responses r ON p.id = r.poll_id
			WHERE p.model_id = ?
				AND p.status = 'complete'
				AND r.parsed_answer IS NOT NULL
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
		.bind(modelId)
		.all<ResponseRow>();

	// Group responses by question (for multi-sample aggregation)
	const responsesByQuestion = new Map<string, string[]>();
	for (const r of responsesResult.results) {
		if (!responsesByQuestion.has(r.question_id)) {
			responsesByQuestion.set(r.question_id, []);
		}
		responsesByQuestion.get(r.question_id)!.push(r.parsed_answer);
	}

	const questionIds = [...responsesByQuestion.keys()];
	if (questionIds.length === 0) {
		return {
			model: { ...model, supports_reasoning: Boolean(model.supports_reasoning), active: Boolean(model.active) },
			questionCount: 0,
			overallHumanAlignment: null,
			overallSelfConsistency: null,
			categoryScores: [],
			mostSimilar: [],
			mostDifferent: [],
			biggestDisagreements: []
		};
	}

	// Get question metadata
	const questionsResult = await db
		.prepare(`
			SELECT id, text, category, response_type, options, benchmark_source_id
			FROM questions
			WHERE id IN (${questionIds.map(() => '?').join(',')})
				AND status = 'published'
		`)
		.bind(...questionIds)
		.all<QuestionRow>();

	const questionMap = new Map<string, QuestionRow>();
	for (const q of questionsResult.results) {
		questionMap.set(q.id, q);
	}

	// Get human distributions for benchmarked questions
	const benchmarkedIds = questionsResult.results
		.filter(q => q.benchmark_source_id)
		.map(q => q.id);

	let humanDistMap = new Map<string, Record<string, number>>();
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

	// Compute this model's aggregated response per question and self-consistency
	const modelResponses: Record<string, string | null> = {};
	const questionSelfConsistency: Record<string, number> = {};

	for (const [qId, answers] of responsesByQuestion) {
		const q = questionMap.get(qId);
		if (!q) continue;

		modelResponses[qId] = q.response_type === 'ordinal'
			? computeMedian(answers)
			: computeMode(answers);

		// Compute self-consistency for this question
		const options = q.options ? JSON.parse(q.options) as string[] : [];
		if (answers.length >= 2 && options.length > 0) {
			questionSelfConsistency[qId] = q.response_type === 'ordinal'
				? ordinalConsensusScore(answers, options.length)
				: nominalConsensusScore(answers);
		} else if (answers.length === 1) {
			questionSelfConsistency[qId] = 5; // Perfect consistency with one sample
		}
	}

	// Compute overall self-consistency (average across questions)
	const consistencyValues = Object.values(questionSelfConsistency);
	const overallSelfConsistency = consistencyValues.length > 0
		? Math.round((consistencyValues.reduce((a, b) => a + b, 0) / consistencyValues.length) * 10) / 10
		: null;

	// Compute per-question human alignment scores
	const questionScores: QuestionWithScore[] = [];
	for (const [qId, answer] of Object.entries(modelResponses)) {
		if (!answer) continue;
		const q = questionMap.get(qId);
		if (!q) continue;

		const humanDist = humanDistMap.get(qId);
		const options = q.options ? JSON.parse(q.options) as string[] : [];
		let humanAiScore = 0;
		let humanMode: string | null = null;

		if (humanDist && options.length > 0) {
			if (q.response_type === 'ordinal') {
				// Build single-answer AI distribution for overlap calculation
				const aiDist: Record<string, number> = { [answer]: 1 };
				humanAiScore = ordinalAgreementScore(humanDist, aiDist);
			} else {
				// Convert to labels for comparison
				const idx = parseInt(answer, 10) - 1;
				const answerLabel = (idx >= 0 && idx < options.length) ? options[idx] : answer;

				const humanDistLabeled: Record<string, number> = {};
				for (const [key, count] of Object.entries(humanDist)) {
					const hIdx = parseInt(key, 10) - 1;
					const label = (hIdx >= 0 && hIdx < options.length) ? options[hIdx] : key;
					humanDistLabeled[label] = (humanDistLabeled[label] || 0) + count;
				}

				humanMode = distributionMode(humanDistLabeled);
				const aiDist: Record<string, number> = { [answerLabel]: 1 };
				humanAiScore = nominalAgreementScore(humanDistLabeled, aiDist);
			}
		}

		// Get human mode for display
		if (!humanMode && humanDist && options.length > 0) {
			const humanDistLabeled: Record<string, number> = {};
			for (const [key, count] of Object.entries(humanDist)) {
				const hIdx = parseInt(key, 10) - 1;
				const label = (hIdx >= 0 && hIdx < options.length) ? options[hIdx] : key;
				humanDistLabeled[label] = (humanDistLabeled[label] || 0) + count;
			}
			humanMode = distributionMode(humanDistLabeled);
		}

		// Convert model answer to label
		const idx = parseInt(answer, 10) - 1;
		const modelAnswerLabel = (idx >= 0 && idx < options.length) ? options[idx] : answer;

		questionScores.push({
			id: qId,
			text: q.text,
			category: q.category,
			humanAiScore,
			modelAnswer: modelAnswerLabel,
			humanMode,
			options
		});
	}

	// Compute overall human alignment (only for questions with human data)
	const questionsWithHumanData = questionScores.filter(q => humanDistMap.has(q.id));
	const overallHumanAlignment = questionsWithHumanData.length > 0
		? Math.round((questionsWithHumanData.reduce((sum, q) => sum + q.humanAiScore, 0) / questionsWithHumanData.length) * 10) / 10
		: null;

	// Compute per-category scores
	const categoryMap = new Map<string, { total: number; count: number }>();
	for (const q of questionsWithHumanData) {
		const cat = q.category || 'Uncategorized';
		if (!categoryMap.has(cat)) {
			categoryMap.set(cat, { total: 0, count: 0 });
		}
		const entry = categoryMap.get(cat)!;
		entry.total += q.humanAiScore;
		entry.count++;
	}

	const categoryScores: CategoryScore[] = [...categoryMap.entries()]
		.map(([category, { total, count }]) => ({
			category,
			score: Math.round((total / count) * 10) / 10,
			questionCount: count
		}))
		.sort((a, b) => b.score - a.score);

	// Get other models' responses for similarity calculation
	const otherModelsResult = await db
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
				AND m.id != ?
				AND q.status = 'published'
				AND p.question_id IN (${questionIds.map(() => '?').join(',')})
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
		.bind(modelId, ...questionIds)
		.all<OtherModelResponseRow>();

	// Group other models' responses
	const otherModels = new Map<string, { name: string; byQuestion: Map<string, { answers: string[]; responseType: string }> }>();
	for (const r of otherModelsResult.results) {
		if (!otherModels.has(r.model_id)) {
			otherModels.set(r.model_id, { name: r.model_name, byQuestion: new Map() });
		}
		const model = otherModels.get(r.model_id)!;
		if (!model.byQuestion.has(r.question_id)) {
			model.byQuestion.set(r.question_id, { answers: [], responseType: r.response_type });
		}
		model.byQuestion.get(r.question_id)!.answers.push(r.parsed_answer);
	}

	// Aggregate other models' responses and compute similarity
	const similarities: ModelSimilarity[] = [];
	for (const [otherId, otherData] of otherModels) {
		const otherResponses: Record<string, string | null> = {};
		for (const [qId, { answers, responseType }] of otherData.byQuestion) {
			otherResponses[qId] = responseType === 'ordinal'
				? computeMedian(answers)
				: computeMode(answers);
		}

		const agreement = computeAgreement(modelResponses, otherResponses, questionIds);
		const sharedQuestions = questionIds.filter(qId =>
			modelResponses[qId] && otherResponses[qId]
		).length;

		if (sharedQuestions > 0) {
			similarities.push({
				id: otherId,
				name: otherData.name,
				agreement,
				sharedQuestions
			});
		}
	}

	// Sort to find most similar and most different
	similarities.sort((a, b) => b.agreement - a.agreement);
	const mostSimilar = similarities.slice(0, 5);
	const mostDifferent = [...similarities].sort((a, b) => a.agreement - b.agreement).slice(0, 5);

	// Find biggest disagreements (lowest human alignment scores)
	const biggestDisagreements = questionsWithHumanData
		.sort((a, b) => a.humanAiScore - b.humanAiScore)
		.slice(0, 5);

	return {
		model: { ...model, supports_reasoning: Boolean(model.supports_reasoning), active: Boolean(model.active) },
		questionCount: questionIds.length,
		questionsWithHumanData: questionsWithHumanData.length,
		overallHumanAlignment,
		overallSelfConsistency,
		categoryScores,
		mostSimilar,
		mostDifferent,
		biggestDisagreements
	};
};
