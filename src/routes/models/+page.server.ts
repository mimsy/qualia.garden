// ABOUTME: Models index page data loader and actions.
// ABOUTME: Fetches all models with response counts and three aggregate scores. Admin actions for toggle.

import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { updateModel, createModel, getModel, getLatestPollFilter } from '$lib/db/queries';
import { computeMedian, computeMode } from '$lib/db/types';
import {
	ordinalAgreementScore,
	nominalAgreementScore,
	ordinalInternalAgreement,
	nominalInternalAgreement
} from '$lib/alignment';

interface ModelWithStats {
	id: string;
	name: string;
	family: string;
	supports_reasoning: boolean;
	active: boolean;
	questionCount: number;
	humanAlignmentScore: number | null;
	aiConsensusScore: number | null;
	selfConsistencyScore: number | null;
}

interface ResponseWithQuestionRow {
	model_id: string;
	question_id: string;
	parsed_answer: string;
	response_type: string;
	options: string | null;
	benchmark_source_id: string | null;
}

interface HumanDistRow {
	question_id: string;
	distribution: string;
}

export const load: PageServerLoad = async ({ platform, parent }) => {
	const { isAdmin } = await parent();

	if (!platform?.env?.DB) {
		return { models: [], isAdmin };
	}

	const db = platform.env.DB;

	// Get all models with their response counts
	const modelsQuery = `
		SELECT
			m.id,
			m.name,
			m.family,
			m.supports_reasoning,
			m.active,
			COUNT(DISTINCT p.question_id) as question_count
		FROM models m
		LEFT JOIN polls p ON m.id = p.model_id AND p.status = 'complete'
		LEFT JOIN questions q ON p.question_id = q.id AND q.status = 'published'
		GROUP BY m.id
		ORDER BY m.family, m.name
	`;

	const modelsResult = await db.prepare(modelsQuery).all<{
		id: string;
		name: string;
		family: string;
		supports_reasoning: number;
		active: number;
		question_count: number;
	}>();

	// Get all responses with question metadata in a single query (no IN clauses)
	const responsesResult = await db
		.prepare(
			`
			SELECT p.model_id, p.question_id, r.parsed_answer,
				   q.response_type, q.options, q.benchmark_source_id
			FROM polls p
			JOIN responses r ON p.id = r.poll_id
			JOIN questions q ON p.question_id = q.id
			WHERE p.status = 'complete'
				AND r.parsed_answer IS NOT NULL
				AND q.status = 'published'
				${getLatestPollFilter()}
		`
		)
		.all<ResponseWithQuestionRow>();

	// Build question metadata map from response data
	const questionMap = new Map<
		string,
		{ response_type: string; options: string | null; benchmark_source_id: string | null }
	>();
	for (const r of responsesResult.results) {
		if (!questionMap.has(r.question_id)) {
			questionMap.set(r.question_id, {
				response_type: r.response_type,
				options: r.options,
				benchmark_source_id: r.benchmark_source_id
			});
		}
	}

	const questionIds = [...questionMap.keys()];
	if (questionIds.length === 0) {
		// No responses yet, return models with null scores
		return {
			models: modelsResult.results.map((m) => ({
				id: m.id,
				name: m.name,
				family: m.family,
				supports_reasoning: Boolean(m.supports_reasoning),
				active: Boolean(m.active),
				questionCount: m.question_count,
				humanAlignmentScore: null,
				aiConsensusScore: null,
				selfConsistencyScore: null
			})),
			isAdmin
		};
	}

	// Get human distributions using a subquery to avoid IN clause with many IDs
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
				WHERE p.status = 'complete'
					AND q.status = 'published'
					AND q.benchmark_source_id IS NOT NULL
			)
				AND hrd.continent IS NULL
				AND hrd.education_level IS NULL
				AND hrd.age_group IS NULL
				AND hrd.gender IS NULL
		`
		)
		.all<HumanDistRow>();

	for (const d of humanResult.results) {
		humanDistMap.set(d.question_id, JSON.parse(d.distribution));
	}

	// Group responses by model and question
	const responsesByModel = new Map<string, Map<string, string[]>>();
	for (const r of responsesResult.results) {
		if (!responsesByModel.has(r.model_id)) {
			responsesByModel.set(r.model_id, new Map());
		}
		const modelQuestions = responsesByModel.get(r.model_id)!;
		if (!modelQuestions.has(r.question_id)) {
			modelQuestions.set(r.question_id, []);
		}
		modelQuestions.get(r.question_id)!.push(r.parsed_answer);
	}

	// Build distributions and aggregated answers per model per question
	const modelDistributions = new Map<string, Map<string, Record<string, number>>>();
	const modelResponses = new Map<string, Map<string, string | null>>();

	for (const [modelId, questionAnswers] of responsesByModel) {
		const distributions = new Map<string, Record<string, number>>();
		const responses = new Map<string, string | null>();

		for (const [qId, answers] of questionAnswers) {
			const qMeta = questionMap.get(qId);
			if (!qMeta) continue;

			// Aggregate answer
			responses.set(qId, qMeta.response_type === 'ordinal' ? computeMedian(answers) : computeMode(answers));

			// Build distribution
			const dist: Record<string, number> = {};
			for (const ans of answers) {
				dist[ans] = (dist[ans] || 0) + 1;
			}
			distributions.set(qId, dist);
		}

		modelDistributions.set(modelId, distributions);
		modelResponses.set(modelId, responses);
	}

	// Build aggregate AI distribution per question (all models combined)
	const aggregateAiDistributions = new Map<string, Record<string, number>>();
	for (const qId of questionIds) {
		const aggDist: Record<string, number> = {};
		for (const [, distributions] of modelDistributions) {
			const dist = distributions.get(qId);
			if (dist) {
				for (const [ans, count] of Object.entries(dist)) {
					aggDist[ans] = (aggDist[ans] || 0) + count;
				}
			}
		}
		if (Object.keys(aggDist).length > 0) {
			aggregateAiDistributions.set(qId, aggDist);
		}
	}

	// Compute scores for each model
	const models: ModelWithStats[] = modelsResult.results.map((m) => {
		const distributions = modelDistributions.get(m.id);
		const questionAnswersMap = responsesByModel.get(m.id);

		if (!distributions || distributions.size === 0) {
			return {
				id: m.id,
				name: m.name,
				family: m.family,
				supports_reasoning: Boolean(m.supports_reasoning),
				active: Boolean(m.active),
				questionCount: m.question_count,
				humanAlignmentScore: null,
				aiConsensusScore: null,
				selfConsistencyScore: null
			};
		}

		// Compute self-consistency scores per question
		const consistencyScores: number[] = [];
		if (questionAnswersMap) {
			for (const [qId, answers] of questionAnswersMap) {
				const qMeta = questionMap.get(qId);
				if (!qMeta) continue;

				const options = qMeta.options ? (JSON.parse(qMeta.options) as string[]) : [];
				if (answers.length >= 2 && options.length > 0) {
					const score =
						qMeta.response_type === 'ordinal'
							? ordinalInternalAgreement(answers, options.length)
							: nominalInternalAgreement(answers, options.length);
					consistencyScores.push(score);
				} else if (answers.length === 1) {
					consistencyScores.push(100); // Perfect consistency with one sample
				}
			}
		}

		// Compute human alignment scores per question
		const alignmentScores: number[] = [];
		for (const [qId, modelDist] of distributions) {
			const qMeta = questionMap.get(qId);
			if (!qMeta) continue;

			const humanDist = humanDistMap.get(qId);
			if (!humanDist) continue;

			const options = qMeta.options ? (JSON.parse(qMeta.options) as string[]) : [];
			if (options.length === 0) continue;

			const score =
				qMeta.response_type === 'ordinal'
					? ordinalAgreementScore(humanDist, modelDist, options)
					: nominalAgreementScore(humanDist, modelDist);
			alignmentScores.push(score);
		}

		// Compute AI consensus scores per question (this model vs aggregate AI excluding this model)
		const consensusScores: number[] = [];
		for (const [qId, modelDist] of distributions) {
			const qMeta = questionMap.get(qId);
			if (!qMeta) continue;

			const aggDist = aggregateAiDistributions.get(qId);
			if (!aggDist) continue;

			// Subtract this model's contribution from aggregate
			const otherAiDist: Record<string, number> = {};
			for (const [ans, count] of Object.entries(aggDist)) {
				const modelCount = modelDist[ans] || 0;
				const remaining = count - modelCount;
				if (remaining > 0) {
					otherAiDist[ans] = remaining;
				}
			}

			if (Object.keys(otherAiDist).length === 0) continue;

			const options = qMeta.options ? (JSON.parse(qMeta.options) as string[]) : [];
			if (options.length === 0) continue;

			const score =
				qMeta.response_type === 'ordinal'
					? ordinalAgreementScore(otherAiDist, modelDist, options)
					: nominalAgreementScore(otherAiDist, modelDist);
			consensusScores.push(score);
		}

		return {
			id: m.id,
			name: m.name,
			family: m.family,
			supports_reasoning: Boolean(m.supports_reasoning),
			active: Boolean(m.active),
			questionCount: m.question_count,
			humanAlignmentScore:
				alignmentScores.length > 0
					? Math.round((alignmentScores.reduce((a, b) => a + b, 0) / alignmentScores.length) * 10) / 10
					: null,
			aiConsensusScore:
				consensusScores.length > 0
					? Math.round((consensusScores.reduce((a, b) => a + b, 0) / consensusScores.length) * 10) / 10
					: null,
			selfConsistencyScore:
				consistencyScores.length > 0
					? Math.round((consistencyScores.reduce((a, b) => a + b, 0) / consistencyScores.length) * 10) / 10
					: null
		};
	});

	return { models, isAdmin };
};

export const actions: Actions = {
	toggle: async ({ request, platform, locals, url }) => {
		const isPreview = url.host.includes('.pages.dev') && url.host !== 'qualia-garden.pages.dev';
		const isAdmin = dev || isPreview || locals.user?.isAdmin;

		if (!isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const active = formData.get('active') === 'true';

		await updateModel(platform.env.DB, id, { active: !active });

		return { success: true };
	},

	create: async ({ request, platform, locals, url }) => {
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
		const release_date = (formData.get('release_date') as string)?.trim() || null;
		const description = (formData.get('description') as string)?.trim() || null;

		if (!name || !family || !openrouter_id) {
			return fail(400, { error: 'Name, family, and OpenRouter ID are required' });
		}

		// Use openrouter_id as the model id
		const id = openrouter_id;

		// Check if model ID already exists
		const existing = await getModel(platform.env.DB, id);
		if (existing) {
			return fail(400, { error: 'A model with this ID already exists' });
		}

		await createModel(platform.env.DB, { name, family, openrouter_id, supports_reasoning, release_date, description });

		return { success: true, created: true };
	},

	syncMetadata: async ({ platform, locals, url }) => {
		const isPreview = url.host.includes('.pages.dev') && url.host !== 'qualia-garden.pages.dev';
		const isAdmin = dev || isPreview || locals.user?.isAdmin;

		if (!isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const db = platform.env.DB;

		// Fetch current model data from OpenRouter
		const response = await fetch('https://openrouter.ai/api/v1/models', {
			headers: { 'Content-Type': 'application/json' }
		});

		if (!response.ok) {
			return fail(500, { error: 'Failed to fetch models from OpenRouter' });
		}

		interface OpenRouterModel {
			id: string;
			description?: string;
			created?: number;
			supported_parameters?: string[];
		}

		const apiResponse = (await response.json()) as { data: OpenRouterModel[] };

		// Build map of model ID -> metadata
		const metadataMap = new Map<
			string,
			{ supports_reasoning: boolean; release_date: string | null; description: string | null }
		>();
		for (const m of apiResponse.data) {
			const supportsReasoning =
				m.supported_parameters?.includes('reasoning') || m.supported_parameters?.includes('include_reasoning') || false;
			const releaseDate = m.created ? new Date(m.created * 1000).toISOString().split('T')[0] : null;
			metadataMap.set(m.id, {
				supports_reasoning: supportsReasoning,
				release_date: releaseDate,
				description: m.description ?? null
			});
		}

		// Get all models from our database
		const modelsResult = await db
			.prepare('SELECT id, openrouter_id, supports_reasoning, release_date, description FROM models')
			.all<{
				id: string;
				openrouter_id: string;
				supports_reasoning: number;
				release_date: string | null;
				description: string | null;
			}>();

		// Update models where metadata differs
		let updatedCount = 0;
		for (const model of modelsResult.results) {
			const orId = model.openrouter_id || model.id;
			const orData = metadataMap.get(orId);
			if (!orData) continue;

			const currentSupportsReasoning = Boolean(model.supports_reasoning);
			const needsUpdate =
				orData.supports_reasoning !== currentSupportsReasoning ||
				orData.release_date !== model.release_date ||
				orData.description !== model.description;

			if (needsUpdate) {
				await updateModel(db, model.id, {
					supports_reasoning: orData.supports_reasoning,
					release_date: orData.release_date,
					description: orData.description
				});
				updatedCount++;
			}
		}

		return { success: true, synced: true, updatedCount };
	}
};
