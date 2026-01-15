// ABOUTME: Model detail page data loader and actions.
// ABOUTME: Computes human alignment per category and AI similarity rankings. Admin actions for update/delete.

import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import {
	updateModel,
	deleteModel,
	getLatestPollFilter,
	getUnpolledQuestionsForModel,
	createPoll
} from '$lib/db/queries';
import { computeMedian, computeMode } from '$lib/db/types';
import {
	ordinalAgreementScore,
	nominalAgreementScore,
	ordinalInternalAgreement,
	nominalInternalAgreement,
	distributionMode,
	computeAgreement
} from '$lib/alignment';

interface Model {
	id: string;
	name: string;
	family: string;
	openrouter_id: string;
	supports_reasoning: boolean;
	active: boolean;
	release_date: string | null;
	description: string | null;
}

interface ResponseWithQuestionRow {
	question_id: string;
	parsed_answer: string;
	text: string;
	category: string | null;
	response_type: string;
	options: string | null;
	benchmark_source_id: string | null;
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

interface QuestionWithScores {
	id: string;
	text: string;
	category: string | null;
	humanAlignment: number | null;
	aiConsensus: number | null;
	selfConsistency: number | null;
	modelAnswer: string;
	humanMode: string | null;
	aiMode: string | null;
	options: string[];
}

interface CategoryScores {
	category: string;
	humanAlignment: number | null;
	aiConsensus: number | null;
	selfConsistency: number | null;
	questionCount: number;
}

interface ModelSimilarity {
	id: string;
	name: string;
	agreement: number; // 0-100 percentage
	sharedQuestions: number;
}

export const load: PageServerLoad = async ({ params, platform, parent }) => {
	const { isAdmin } = await parent();

	if (!platform?.env?.DB) {
		return error(500, 'Database not available');
	}

	const db = platform.env.DB;
	const modelId = params.id;

	// Get model metadata
	const model = await db
		.prepare(
			'SELECT id, name, family, openrouter_id, supports_reasoning, active, release_date, description FROM models WHERE id = ?'
		)
		.bind(modelId)
		.first<Model>();

	if (!model) {
		return error(404, 'Model not found');
	}

	// Get this model's latest responses with question metadata via JOIN
	const responsesResult = await db
		.prepare(
			`
			SELECT p.question_id, r.parsed_answer,
				   q.text, q.category, q.response_type, q.options, q.benchmark_source_id
			FROM polls p
			JOIN responses r ON p.id = r.poll_id
			JOIN questions q ON p.question_id = q.id
			WHERE p.model_id = ?
				AND p.status = 'complete'
				AND r.parsed_answer IS NOT NULL
				AND q.status = 'published'
				${getLatestPollFilter()}
		`
		)
		.bind(modelId)
		.all<ResponseWithQuestionRow>();

	// Build question metadata map from response data
	const questionMap = new Map<
		string,
		{
			text: string;
			category: string | null;
			response_type: string;
			options: string | null;
			benchmark_source_id: string | null;
		}
	>();
	for (const r of responsesResult.results) {
		if (!questionMap.has(r.question_id)) {
			questionMap.set(r.question_id, {
				text: r.text,
				category: r.category,
				response_type: r.response_type,
				options: r.options,
				benchmark_source_id: r.benchmark_source_id
			});
		}
	}

	// Group responses by question (for multi-sample aggregation)
	const responsesByQuestion = new Map<string, string[]>();
	for (const r of responsesResult.results) {
		if (!responsesByQuestion.has(r.question_id)) {
			responsesByQuestion.set(r.question_id, []);
		}
		responsesByQuestion.get(r.question_id)!.push(r.parsed_answer);
	}

	const questionIds = [...responsesByQuestion.keys()];

	// Fetch unpolled questions for admins
	const unpolledQuestions = isAdmin ? await getUnpolledQuestionsForModel(db, modelId) : [];

	if (questionIds.length === 0) {
		return {
			model: { ...model, supports_reasoning: Boolean(model.supports_reasoning), active: Boolean(model.active) },
			questionCount: 0,
			questionsWithHumanData: 0,
			overallHumanAlignment: null,
			overallAiConsensus: null,
			overallSelfConsistency: null,
			categoryScores: [],
			mostSimilar: [],
			mostDifferent: [],
			notableQuestions: {
				highAlignment: [],
				lowAlignment: [],
				highConsensus: [],
				lowConsensus: [],
				highConfidence: [],
				lowConfidence: []
			},
			isAdmin,
			unpolledQuestions
		};
	}

	// Get human distributions using subquery to avoid large IN clause
	const humanDistMap = new Map<string, Record<string, number>>();
	const humanResult = await db
		.prepare(
			`
			SELECT hrd.question_id, hrd.distribution
			FROM human_response_distributions hrd
			WHERE hrd.question_id IN (
				SELECT DISTINCT p.question_id
				FROM polls p
				JOIN questions q ON p.question_id = q.id
				WHERE p.model_id = ?
					AND p.status = 'complete'
					AND q.status = 'published'
					AND q.benchmark_source_id IS NOT NULL
			)
				AND hrd.continent IS NULL
				AND hrd.education_level IS NULL
				AND hrd.age_group IS NULL
				AND hrd.gender IS NULL
		`
		)
		.bind(modelId)
		.all<HumanDistRow>();

	for (const d of humanResult.results) {
		humanDistMap.set(d.question_id, JSON.parse(d.distribution));
	}

	// Compute this model's aggregated response and distribution per question, plus self-consistency
	const modelResponses: Record<string, string | null> = {};
	const modelDistributions: Record<string, Record<string, number>> = {};
	const questionSelfConsistency: Record<string, number> = {};

	for (const [qId, answers] of responsesByQuestion) {
		const q = questionMap.get(qId);
		if (!q) continue;

		modelResponses[qId] = q.response_type === 'ordinal' ? computeMedian(answers) : computeMode(answers);

		// Build distribution from all samples
		const dist: Record<string, number> = {};
		for (const ans of answers) {
			dist[ans] = (dist[ans] || 0) + 1;
		}
		modelDistributions[qId] = dist;

		// Compute self-consistency for this question
		const options = q.options ? (JSON.parse(q.options) as string[]) : [];
		if (answers.length >= 2 && options.length > 0) {
			questionSelfConsistency[qId] =
				q.response_type === 'ordinal'
					? ordinalInternalAgreement(answers, options.length)
					: nominalInternalAgreement(answers, options.length);
		} else if (answers.length === 1) {
			questionSelfConsistency[qId] = 100; // Perfect consistency with one sample
		}
	}

	// Compute overall self-consistency (average across questions)
	const consistencyValues = Object.values(questionSelfConsistency);
	const overallSelfConsistency =
		consistencyValues.length > 0
			? Math.round((consistencyValues.reduce((a, b) => a + b, 0) / consistencyValues.length) * 10) / 10
			: null;

	// Compute per-question human alignment scores using model's full distribution
	const questionHumanAlignment: Record<string, number> = {};
	const questionHumanMode: Record<string, string | null> = {};

	for (const [qId] of responsesByQuestion) {
		const q = questionMap.get(qId);
		if (!q) continue;

		const humanDist = humanDistMap.get(qId);
		const modelDist = modelDistributions[qId];
		const options = q.options ? (JSON.parse(q.options) as string[]) : [];
		let humanMode: string | null = null;

		if (humanDist && modelDist && options.length > 0) {
			if (q.response_type === 'ordinal') {
				questionHumanAlignment[qId] = ordinalAgreementScore(humanDist, modelDist, options);
			} else {
				const humanDistLabeled: Record<string, number> = {};
				for (const [key, count] of Object.entries(humanDist)) {
					const hIdx = parseInt(key, 10) - 1;
					const label = hIdx >= 0 && hIdx < options.length ? options[hIdx] : key;
					humanDistLabeled[label] = (humanDistLabeled[label] || 0) + count;
				}

				const modelDistLabeled: Record<string, number> = {};
				for (const [key, count] of Object.entries(modelDist)) {
					const mIdx = parseInt(key, 10) - 1;
					const label = mIdx >= 0 && mIdx < options.length ? options[mIdx] : key;
					modelDistLabeled[label] = (modelDistLabeled[label] || 0) + count;
				}

				humanMode = distributionMode(humanDistLabeled);
				questionHumanAlignment[qId] = nominalAgreementScore(humanDistLabeled, modelDistLabeled);
			}
		}

		// Get human mode for display
		if (!humanMode && humanDist && options.length > 0) {
			const humanDistLabeled: Record<string, number> = {};
			for (const [key, count] of Object.entries(humanDist)) {
				const hIdx = parseInt(key, 10) - 1;
				const label = hIdx >= 0 && hIdx < options.length ? options[hIdx] : key;
				humanDistLabeled[label] = (humanDistLabeled[label] || 0) + count;
			}
			humanMode = distributionMode(humanDistLabeled);
		}
		questionHumanMode[qId] = humanMode;
	}

	// Get other models' responses for similarity calculation using subquery
	const otherModelsResult = await db
		.prepare(
			`
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
				AND p.question_id IN (
					SELECT DISTINCT p2.question_id
					FROM polls p2
					JOIN questions q2 ON p2.question_id = q2.id
					WHERE p2.model_id = ?
						AND p2.status = 'complete'
						AND q2.status = 'published'
				)
				${getLatestPollFilter()}
		`
		)
		.bind(modelId, modelId)
		.all<OtherModelResponseRow>();

	// Group other models' responses
	const otherModels = new Map<
		string,
		{ name: string; byQuestion: Map<string, { answers: string[]; responseType: string }> }
	>();
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

	// Build aggregate AI distribution per question (all other models combined)
	const aggregateAiDistributions: Record<string, Record<string, number>> = {};
	for (const [qId] of responsesByQuestion) {
		const aggDist: Record<string, number> = {};
		for (const [, otherData] of otherModels) {
			const qData = otherData.byQuestion.get(qId);
			if (qData) {
				for (const ans of qData.answers) {
					aggDist[ans] = (aggDist[ans] || 0) + 1;
				}
			}
		}
		if (Object.keys(aggDist).length > 0) {
			aggregateAiDistributions[qId] = aggDist;
		}
	}

	// Compute per-question AI consensus (this model vs aggregate AI)
	const questionAiConsensus: Record<string, number> = {};
	for (const [qId, modelDist] of Object.entries(modelDistributions)) {
		const aggDist = aggregateAiDistributions[qId];
		const q = questionMap.get(qId);
		if (!aggDist || !q) continue;

		const options = q.options ? (JSON.parse(q.options) as string[]) : [];
		if (options.length === 0) continue;

		const score =
			q.response_type === 'ordinal'
				? ordinalAgreementScore(aggDist, modelDist, options)
				: nominalAgreementScore(aggDist, modelDist);
		questionAiConsensus[qId] = score;
	}

	const aiConsensusValues = Object.values(questionAiConsensus);
	const overallAiConsensus =
		aiConsensusValues.length > 0
			? Math.round((aiConsensusValues.reduce((a, b) => a + b, 0) / aiConsensusValues.length) * 10) / 10
			: null;

	// Build full question scores with all three metrics
	const questionScores: QuestionWithScores[] = [];
	for (const [qId] of responsesByQuestion) {
		const q = questionMap.get(qId);
		if (!q) continue;

		const options = q.options ? (JSON.parse(q.options) as string[]) : [];

		// Compute AI mode from aggregate distribution
		let aiMode: string | null = null;
		const aggDist = aggregateAiDistributions[qId];
		if (aggDist && options.length > 0) {
			aiMode = distributionMode(aggDist);
		}

		questionScores.push({
			id: qId,
			text: q.text,
			category: q.category,
			humanAlignment: questionHumanAlignment[qId] ?? null,
			aiConsensus: questionAiConsensus[qId] ?? null,
			selfConsistency: questionSelfConsistency[qId] ?? null,
			modelAnswer: modelResponses[qId] ?? '',
			humanMode: questionHumanMode[qId] ?? null,
			aiMode,
			options
		});
	}

	// Compute overall human alignment
	const questionsWithHumanData = questionScores.filter((q) => q.humanAlignment !== null);
	const overallHumanAlignment =
		questionsWithHumanData.length > 0
			? Math.round(
					(questionsWithHumanData.reduce((sum, q) => sum + q.humanAlignment!, 0) / questionsWithHumanData.length) * 10
				) / 10
			: null;

	// Compute per-category scores (all three metrics)
	const categoryMap = new Map<string, QuestionWithScores[]>();
	for (const q of questionScores) {
		const cat = q.category || 'Uncategorized';
		if (!categoryMap.has(cat)) {
			categoryMap.set(cat, []);
		}
		categoryMap.get(cat)!.push(q);
	}

	const categoryScores: CategoryScores[] = [];
	for (const [category, questions] of categoryMap) {
		const withAlignment = questions.filter((q) => q.humanAlignment !== null);
		const withConsensus = questions.filter((q) => q.aiConsensus !== null);
		const withConfidence = questions.filter((q) => q.selfConsistency !== null);

		categoryScores.push({
			category,
			humanAlignment:
				withAlignment.length > 0
					? Math.round((withAlignment.reduce((sum, q) => sum + q.humanAlignment!, 0) / withAlignment.length) * 10) / 10
					: null,
			aiConsensus:
				withConsensus.length > 0
					? Math.round((withConsensus.reduce((sum, q) => sum + q.aiConsensus!, 0) / withConsensus.length) * 10) / 10
					: null,
			selfConsistency:
				withConfidence.length > 0
					? Math.round((withConfidence.reduce((sum, q) => sum + q.selfConsistency!, 0) / withConfidence.length) * 10) /
						10
					: null,
			questionCount: questions.length
		});
	}

	// Sort categories by question count
	categoryScores.sort((a, b) => b.questionCount - a.questionCount);

	// Aggregate other models' responses and compute similarity
	const similarities: ModelSimilarity[] = [];
	for (const [otherId, otherData] of otherModels) {
		const otherResponses: Record<string, string | null> = {};
		for (const [qId, { answers, responseType }] of otherData.byQuestion) {
			otherResponses[qId] = responseType === 'ordinal' ? computeMedian(answers) : computeMode(answers);
		}

		const agreement = computeAgreement(modelResponses, otherResponses, questionIds);
		const sharedQuestions = questionIds.filter((qId) => modelResponses[qId] && otherResponses[qId]).length;

		if (sharedQuestions > 0) {
			similarities.push({
				id: otherId,
				name: otherData.name,
				agreement,
				sharedQuestions
			});
		}
	}

	// Sort to find most similar and most different (limit to 3 each)
	similarities.sort((a, b) => b.agreement - a.agreement);
	const mostSimilar = similarities.slice(0, 3);
	const mostDifferent = [...similarities].sort((a, b) => a.agreement - b.agreement).slice(0, 3);

	// Create notable questions lists for each axis (3 per list)
	const sortByAlignment = (a: QuestionWithScores, b: QuestionWithScores) =>
		(b.humanAlignment ?? -1) - (a.humanAlignment ?? -1);
	const sortByConsensus = (a: QuestionWithScores, b: QuestionWithScores) =>
		(b.aiConsensus ?? -1) - (a.aiConsensus ?? -1);
	const sortByConfidence = (a: QuestionWithScores, b: QuestionWithScores) =>
		(b.selfConsistency ?? -1) - (a.selfConsistency ?? -1);

	const questionsWithAlignment = questionScores.filter((q) => q.humanAlignment !== null);
	const questionsWithConsensus = questionScores.filter((q) => q.aiConsensus !== null);
	const questionsWithConfidence = questionScores.filter((q) => q.selfConsistency !== null);

	const notableQuestions = {
		highAlignment: [...questionsWithAlignment].sort(sortByAlignment).slice(0, 3),
		lowAlignment: [...questionsWithAlignment].sort(sortByAlignment).reverse().slice(0, 3),
		highConsensus: [...questionsWithConsensus].sort(sortByConsensus).slice(0, 3),
		lowConsensus: [...questionsWithConsensus].sort(sortByConsensus).reverse().slice(0, 3),
		highConfidence: [...questionsWithConfidence].sort(sortByConfidence).slice(0, 3),
		lowConfidence: [...questionsWithConfidence].sort(sortByConfidence).reverse().slice(0, 3)
	};

	return {
		model: { ...model, supports_reasoning: Boolean(model.supports_reasoning), active: Boolean(model.active) },
		questionCount: questionIds.length,
		questionsWithHumanData: questionsWithHumanData.length,
		overallHumanAlignment,
		overallAiConsensus,
		overallSelfConsistency,
		categoryScores,
		mostSimilar,
		mostDifferent,
		notableQuestions,
		isAdmin,
		unpolledQuestions
	};
};

export const actions: Actions = {
	update: async ({ params, request, platform, locals, url }) => {
		const isPreview = url.host.includes('.pages.dev') && url.host !== 'qualia-garden.pages.dev';
		const isAdmin = dev || isPreview || locals.user?.isAdmin;

		if (!isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();
		const family = (formData.get('family') as string)?.trim();
		const openrouter_id = (formData.get('openrouter_id') as string)?.trim();
		const supports_reasoning = formData.get('supports_reasoning') === 'true';
		const description = (formData.get('description') as string)?.trim() || null;

		if (!name || !family || !openrouter_id) {
			return fail(400, { error: 'Name, family, and OpenRouter ID are required' });
		}

		await updateModel(platform.env.DB, params.id, { name, family, openrouter_id, supports_reasoning, description });

		return { success: true };
	},

	delete: async ({ params, platform, locals, url }) => {
		const isPreview = url.host.includes('.pages.dev') && url.host !== 'qualia-garden.pages.dev';
		const isAdmin = dev || isPreview || locals.user?.isAdmin;

		if (!isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		await deleteModel(platform.env.DB, params.id);

		redirect(303, '/models');
	},

	pollAll: async ({ params, platform, locals, url }) => {
		const isPreview = url.host.includes('.pages.dev') && url.host !== 'qualia-garden.pages.dev';
		const isAdmin = dev || isPreview || locals.user?.isAdmin;

		if (!isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		if (!platform?.env?.POLL_QUEUE) {
			return fail(500, { error: 'Queue not available' });
		}

		const db = platform.env.DB;
		const queue = platform.env.POLL_QUEUE;
		const modelId = params.id;

		const questions = await getUnpolledQuestionsForModel(db, modelId);

		if (questions.length === 0) {
			return fail(400, { error: 'No unpolled questions found' });
		}

		// Create polls and queue jobs
		const jobs: Array<{ poll_id: string; question_id: string; model_id: string }> = [];

		for (const question of questions) {
			const poll = await createPoll(db, {
				question_id: question.id,
				model_id: modelId
			});

			jobs.push({
				poll_id: poll.id,
				question_id: question.id,
				model_id: modelId
			});
		}

		// Send all jobs to queue
		await queue.sendBatch(jobs.map((job) => ({ body: job })));

		redirect(303, '/admin/polls');
	}
};
