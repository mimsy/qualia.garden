// ABOUTME: Question results page data loader and actions.
// ABOUTME: Fetches question details, model responses, human benchmark data, and handles admin actions.

import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getModels, updateQuestion, createPollBatch, getLatestPollFilter } from '$lib/db/queries';
import type { QuestionStatus, Model, AggregatedResponse } from '$lib/db/types';
import { computeMedian, computeMode } from '$lib/db/types';
import {
	ordinalAgreementScore,
	nominalAgreementScore,
	ordinalInternalAgreement,
	nominalInternalAgreement
} from '$lib/alignment';

interface PollResponseRow {
	model_id: string;
	model_name: string;
	model_family: string;
	poll_id: string;
	batch_id: string | null;
	poll_status: string;
	poll_created_at: string;
	parsed_answer: string | null;
	justification: string | null;
	response_time_ms: number | null;
}

interface PollWithDetails {
	poll_id: string;
	model_id: string;
	model_name: string;
	model_family: string;
	poll_status: string;
	poll_created_at: string;
	poll_completed_at: string | null;
	parsed_answer: string | null;
	justification: string | null;
	reasoning: string | null;
	response_time_ms: number | null;
	error: string | null;
}

interface Question {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	options: string | null;
	status: QuestionStatus;
	benchmark_source_id: string | null;
}

interface BenchmarkSource {
	id: string;
	name: string;
	short_name: string;
	url: string | null;
	sample_size: number | null;
	year_range: string | null;
}

interface HumanDistribution {
	id: string;
	continent: string | null;
	education_level: string | null;
	settlement_type: string | null;
	age_group: string | null;
	gender: string | null;
	distribution: string;
	sample_size: number;
}

export const load: PageServerLoad = async ({ params, platform, parent }) => {
	const { isAdmin } = await parent();

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;

	// Get question
	const question = await db.prepare('SELECT * FROM questions WHERE id = ?').bind(params.id).first<Question>();

	if (!question) {
		throw error(404, 'Question not found');
	}

	// Get all polls from the latest batch per model for this question
	// This query handles both batched (batch_id NOT NULL) and legacy (batch_id NULL) polls
	const pollsResult = await db
		.prepare(
			`
		SELECT
			m.id as model_id,
			m.name as model_name,
			m.family as model_family,
			p.id as poll_id,
			p.batch_id,
			p.status as poll_status,
			p.created_at as poll_created_at,
			r.parsed_answer,
			r.justification,
			r.response_time_ms
		FROM polls p
		JOIN models m ON p.model_id = m.id
		LEFT JOIN responses r ON p.id = r.poll_id
		WHERE p.question_id = ?
			${getLatestPollFilter()}
		ORDER BY m.family, m.name, p.created_at
	`
		)
		.bind(params.id)
		.all<PollResponseRow>();

	// Parse options
	const options = question.options ? (JSON.parse(question.options) as string[]) : null;

	// Group polls by model and build aggregated responses
	const modelMap = new Map<string, AggregatedResponse>();

	for (const row of pollsResult.results) {
		if (!modelMap.has(row.model_id)) {
			modelMap.set(row.model_id, {
				model_id: row.model_id,
				model_name: row.model_name,
				model_family: row.model_family,
				aggregated_answer: null,
				sample_count: 0,
				complete_count: 0,
				samples: []
			});
		}

		const agg = modelMap.get(row.model_id)!;
		agg.sample_count++;
		if (row.poll_status === 'complete') {
			agg.complete_count++;
		}
		agg.samples.push({
			poll_id: row.poll_id,
			parsed_answer: row.parsed_answer,
			justification: row.justification,
			response_time_ms: row.response_time_ms,
			status: row.poll_status,
			created_at: row.poll_created_at
		});
	}

	// Compute aggregated answer for each model
	const aggregatedResponses: AggregatedResponse[] = [];
	for (const agg of modelMap.values()) {
		const answers = agg.samples.filter((s) => s.parsed_answer !== null).map((s) => s.parsed_answer!);

		if (answers.length > 0) {
			agg.aggregated_answer = question.response_type === 'ordinal' ? computeMedian(answers) : computeMode(answers);
		}
		aggregatedResponses.push(agg);
	}

	// Sort by family then name
	aggregatedResponses.sort((a, b) => {
		const familyCompare = a.model_family.localeCompare(b.model_family);
		return familyCompare !== 0 ? familyCompare : a.model_name.localeCompare(b.model_name);
	});

	// Calculate aggregate results across all models (using aggregated answers)
	const answerCounts: Record<string, number> = {};
	const respondedModels = aggregatedResponses.filter((r) => r.aggregated_answer !== null);

	for (const response of respondedModels) {
		if (response.aggregated_answer) {
			answerCounts[response.aggregated_answer] = (answerCounts[response.aggregated_answer] || 0) + 1;
		}
	}

	// Sort answers for display
	let sortedAnswers: Array<{ answer: string; count: number; percentage: number }>;

	if (question.response_type === 'ordinal') {
		sortedAnswers = Object.entries(answerCounts)
			.map(([answer, count]) => ({
				answer,
				count,
				percentage: respondedModels.length > 0 ? (count / respondedModels.length) * 100 : 0
			}))
			.sort((a, b) => parseInt(a.answer) - parseInt(b.answer));
	} else {
		sortedAnswers = Object.entries(answerCounts)
			.map(([answer, count]) => ({
				answer,
				count,
				percentage: respondedModels.length > 0 ? (count / respondedModels.length) * 100 : 0
			}))
			.sort((a, b) => b.count - a.count);
	}

	// Calculate individual response distribution (counting all samples, not per-model aggregates)
	const individualAnswerCounts: Record<string, number> = {};
	let totalIndividualResponses = 0;

	for (const response of aggregatedResponses) {
		for (const sample of response.samples) {
			if (sample.parsed_answer && sample.status === 'complete') {
				individualAnswerCounts[sample.parsed_answer] = (individualAnswerCounts[sample.parsed_answer] || 0) + 1;
				totalIndividualResponses++;
			}
		}
	}

	// Sort individual response results same as aggregate results
	let individualResponseResults: Array<{ answer: string; count: number; percentage: number }>;

	if (question.response_type === 'ordinal') {
		individualResponseResults = Object.entries(individualAnswerCounts)
			.map(([answer, count]) => ({
				answer,
				count,
				percentage: totalIndividualResponses > 0 ? (count / totalIndividualResponses) * 100 : 0
			}))
			.sort((a, b) => parseInt(a.answer) - parseInt(b.answer));
	} else {
		individualResponseResults = Object.entries(individualAnswerCounts)
			.map(([answer, count]) => ({
				answer,
				count,
				percentage: totalIndividualResponses > 0 ? (count / totalIndividualResponses) * 100 : 0
			}))
			.sort((a, b) => b.count - a.count);
	}

	// Fetch benchmark data if this is a benchmark question
	let benchmarkSource: BenchmarkSource | null = null;
	let overallHumanDist: HumanDistribution | null = null;

	if (question.benchmark_source_id) {
		// Get benchmark source
		benchmarkSource = await db
			.prepare('SELECT * FROM benchmark_sources WHERE id = ?')
			.bind(question.benchmark_source_id)
			.first<BenchmarkSource>();

		// Get the overall human distribution (no demographic filters)
		overallHumanDist = await db
			.prepare(
				`SELECT * FROM human_response_distributions
				 WHERE question_id = ?
				 AND continent IS NULL AND education_level IS NULL AND age_group IS NULL AND gender IS NULL`
			)
			.bind(params.id)
			.first<HumanDistribution>();
	}

	// Compute question-level scores
	let humanAiScore: number | null = null;
	let aiConsensusScore: number | null = null;
	const modelSelfConsistency: Record<string, number> = {};
	const modelHumanAlignment: Record<string, number> = {};
	const modelAiConsensus: Record<string, number> = {};

	if (options && respondedModels.length > 0) {
		// Get all aggregated answers for AI consensus
		const allAggregatedAnswers = respondedModels.map((r) => r.aggregated_answer).filter((a): a is string => a !== null);

		// Compute AI agreement score (how much AI models agree with each other)
		if (allAggregatedAnswers.length >= 2) {
			aiConsensusScore =
				question.response_type === 'ordinal'
					? ordinalInternalAgreement(allAggregatedAnswers, options.length)
					: nominalInternalAgreement(allAggregatedAnswers, options.length);
		} else if (allAggregatedAnswers.length === 1) {
			aiConsensusScore = 100; // Perfect agreement with only one model
		}

		// Compute human-AI agreement score (using overall human distribution)
		if (overallHumanDist) {
			const humanDist = JSON.parse(overallHumanDist.distribution) as Record<string, number>;

			if (question.response_type === 'ordinal') {
				// Build AI distribution for overlap calculation
				const aiDist: Record<string, number> = {};
				for (const ans of allAggregatedAnswers) {
					aiDist[ans] = (aiDist[ans] || 0) + 1;
				}
				if (Object.keys(aiDist).length > 0) {
					humanAiScore = ordinalAgreementScore(humanDist, aiDist, options);
				}
			} else {
				// Nominal: convert AI answers to labels and build distribution
				const aiAnswersLabeled = allAggregatedAnswers.map((ans) => {
					const idx = parseInt(ans, 10) - 1;
					return idx >= 0 && idx < options.length ? options[idx] : ans;
				});
				const aiDist: Record<string, number> = {};
				for (const ans of aiAnswersLabeled) {
					aiDist[ans] = (aiDist[ans] || 0) + 1;
				}

				// Convert human distribution keys to labels
				const humanDistLabeled: Record<string, number> = {};
				for (const [key, count] of Object.entries(humanDist)) {
					const idx = parseInt(key, 10) - 1;
					const label = idx >= 0 && idx < options.length ? options[idx] : key;
					humanDistLabeled[label] = (humanDistLabeled[label] || 0) + count;
				}
				humanAiScore = nominalAgreementScore(humanDistLabeled, aiDist);
			}
		}

		// Compute per-model self-consistency scores
		for (const response of aggregatedResponses) {
			const answers = response.samples.map((s) => s.parsed_answer).filter((a): a is string => a !== null);

			if (answers.length < 2) {
				modelSelfConsistency[response.model_id] = 100; // Perfect if only one sample
			} else {
				modelSelfConsistency[response.model_id] =
					question.response_type === 'ordinal'
						? ordinalInternalAgreement(answers, options.length)
						: nominalInternalAgreement(answers, options.length);
			}
		}

		// Build the aggregate AI distribution (across all models' samples)
		const aggregateAiDist: Record<string, number> = {};
		for (const response of aggregatedResponses) {
			for (const sample of response.samples) {
				if (sample.parsed_answer) {
					aggregateAiDist[sample.parsed_answer] = (aggregateAiDist[sample.parsed_answer] || 0) + 1;
				}
			}
		}

		// Compute per-model human alignment scores (using full sample distribution)
		if (overallHumanDist) {
			const humanDist = JSON.parse(overallHumanDist.distribution) as Record<string, number>;

			for (const response of aggregatedResponses) {
				// Build this model's sample distribution
				const modelDist: Record<string, number> = {};
				for (const sample of response.samples) {
					if (sample.parsed_answer) {
						modelDist[sample.parsed_answer] = (modelDist[sample.parsed_answer] || 0) + 1;
					}
				}

				if (Object.keys(modelDist).length === 0) continue;

				if (question.response_type === 'ordinal') {
					modelHumanAlignment[response.model_id] = ordinalAgreementScore(humanDist, modelDist, options);
				} else {
					// Nominal: convert to labels
					const modelDistLabeled: Record<string, number> = {};
					for (const [key, count] of Object.entries(modelDist)) {
						const idx = parseInt(key, 10) - 1;
						const label = idx >= 0 && idx < options.length ? options[idx] : key;
						modelDistLabeled[label] = (modelDistLabeled[label] || 0) + count;
					}

					const humanDistLabeled: Record<string, number> = {};
					for (const [key, count] of Object.entries(humanDist)) {
						const keyIdx = parseInt(key, 10) - 1;
						const keyLabel = keyIdx >= 0 && keyIdx < options.length ? options[keyIdx] : key;
						humanDistLabeled[keyLabel] = (humanDistLabeled[keyLabel] || 0) + count;
					}
					modelHumanAlignment[response.model_id] = nominalAgreementScore(humanDistLabeled, modelDistLabeled);
				}
			}
		}

		// Compute per-model AI consensus scores (comparing model distribution to aggregate AI)
		for (const response of aggregatedResponses) {
			// Build this model's sample distribution
			const modelDist: Record<string, number> = {};
			for (const sample of response.samples) {
				if (sample.parsed_answer) {
					modelDist[sample.parsed_answer] = (modelDist[sample.parsed_answer] || 0) + 1;
				}
			}

			if (Object.keys(modelDist).length === 0) continue;

			if (question.response_type === 'ordinal') {
				modelAiConsensus[response.model_id] = ordinalAgreementScore(aggregateAiDist, modelDist, options);
			} else {
				// Nominal: convert to labels
				const modelDistLabeled: Record<string, number> = {};
				for (const [key, count] of Object.entries(modelDist)) {
					const idx = parseInt(key, 10) - 1;
					const label = idx >= 0 && idx < options.length ? options[idx] : key;
					modelDistLabeled[label] = (modelDistLabeled[label] || 0) + count;
				}

				const aiDistLabeled: Record<string, number> = {};
				for (const [key, count] of Object.entries(aggregateAiDist)) {
					const keyIdx = parseInt(key, 10) - 1;
					const keyLabel = keyIdx >= 0 && keyIdx < options.length ? options[keyIdx] : key;
					aiDistLabeled[keyLabel] = (aiDistLabeled[keyLabel] || 0) + count;
				}
				modelAiConsensus[response.model_id] = nominalAgreementScore(aiDistLabeled, modelDistLabeled);
			}
		}
	}

	// For admins: load all polls (for history) and active models (for poll trigger)
	let allPolls: PollWithDetails[] = [];
	let availableModels: Model[] = [];
	let categories: string[] = [];

	if (isAdmin) {
		const allPollsResult = await db
			.prepare(
				`
			SELECT
				p.id as poll_id,
				p.status as poll_status,
				p.created_at as poll_created_at,
				p.completed_at as poll_completed_at,
				m.id as model_id,
				m.name as model_name,
				m.family as model_family,
				r.parsed_answer,
				r.justification,
				r.reasoning,
				r.response_time_ms,
				r.error
			FROM polls p
			JOIN models m ON p.model_id = m.id
			LEFT JOIN responses r ON p.id = r.poll_id
			WHERE p.question_id = ?
			ORDER BY m.family, m.name, p.created_at DESC
		`
			)
			.bind(params.id)
			.all<PollWithDetails>();
		allPolls = allPollsResult.results;

		availableModels = await getModels(db, true);

		// Get categories for edit form
		const categoriesResult = await db
			.prepare('SELECT DISTINCT category FROM questions WHERE category IS NOT NULL ORDER BY category')
			.all<{ category: string }>();
		categories = categoriesResult.results.map((r) => r.category);
	}

	return {
		question,
		options,
		responses: aggregatedResponses,
		aggregateResults: sortedAnswers,
		individualResponseResults,
		totalResponses: respondedModels.length,
		totalIndividualResponses,
		benchmarkSource,
		humanDistribution: overallHumanDist,
		humanAiScore,
		aiConsensusScore,
		modelSelfConsistency,
		modelHumanAlignment,
		modelAiConsensus,
		allPolls,
		availableModels,
		categories
	};
};

export const actions: Actions = {
	update: async ({ params, request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const text = formData.get('text') as string;
		const category = formData.get('category') as string;
		const responseType = formData.get('response_type') as string;
		const optionsRaw = formData.get('options') as string;

		if (!text?.trim()) {
			return fail(400, { error: 'Question text is required' });
		}

		// Parse options (required for both ordinal and nominal)
		const optionsList = optionsRaw
			.split('\n')
			.map((o) => o.trim())
			.filter(Boolean);
		if (optionsList.length < 2) {
			return fail(400, { error: 'At least 2 options are required' });
		}
		const options = JSON.stringify(optionsList);

		await updateQuestion(platform.env.DB, params.id, {
			text: text.trim(),
			category: category?.trim() || null,
			response_type: responseType as 'ordinal' | 'nominal',
			options
		});

		return { success: true };
	},

	publish: async ({ params, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		// Check if question has at least one complete response
		const countResult = await platform.env.DB.prepare(
			"SELECT COUNT(*) as cnt FROM polls WHERE question_id = ? AND status = 'complete'"
		)
			.bind(params.id)
			.first<{ cnt: number }>();

		if (!countResult || countResult.cnt === 0) {
			return fail(400, { error: 'Cannot publish: question needs at least one AI response' });
		}

		await updateQuestion(platform.env.DB, params.id, { status: 'published' });
		return { success: true };
	},

	archive: async ({ params, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}
		await updateQuestion(platform.env.DB, params.id, { status: 'archived' });
		return { success: true };
	},

	unarchive: async ({ params, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}
		await updateQuestion(platform.env.DB, params.id, { status: 'published' });
		return { success: true };
	},

	poll: async ({ params, request, platform }) => {
		if (!platform?.env?.DB || !platform?.env?.POLL_QUEUE) {
			return fail(500, { error: 'Platform not available' });
		}

		const formData = await request.formData();
		const modelIds = formData.getAll('model_ids') as string[];
		const sampleCountRaw = formData.get('sample_count') as string;
		const sampleCount = Math.max(1, Math.min(parseInt(sampleCountRaw || '5', 10) || 5, 10));

		if (modelIds.length === 0) {
			return fail(400, { error: 'Select at least one model to poll' });
		}

		// Create poll batches and queue them
		let totalPolls = 0;
		for (const modelId of modelIds) {
			const polls = await createPollBatch(platform.env.DB, {
				question_id: params.id,
				model_id: modelId,
				sample_count: sampleCount
			});

			// Queue each poll in the batch
			for (const poll of polls) {
				await platform.env.POLL_QUEUE.send({
					poll_id: poll.id,
					question_id: params.id,
					model_id: modelId
				});
			}
			totalPolls += polls.length;
		}

		return { success: true, polled: modelIds.length, samples: sampleCount, totalPolls };
	},

	retry: async ({ params, request, platform }) => {
		if (!platform?.env?.DB || !platform?.env?.POLL_QUEUE) {
			return fail(500, { error: 'Platform not available' });
		}

		const formData = await request.formData();
		const modelId = formData.get('model_id') as string;
		const sampleCountRaw = formData.get('sample_count') as string;
		const sampleCount = Math.max(1, Math.min(parseInt(sampleCountRaw || '5', 10) || 5, 10));

		if (!modelId) {
			return fail(400, { error: 'Model ID required' });
		}

		// Create new poll batch and queue them
		const polls = await createPollBatch(platform.env.DB, {
			question_id: params.id,
			model_id: modelId,
			sample_count: sampleCount
		});

		// Queue each poll in the batch
		for (const poll of polls) {
			await platform.env.POLL_QUEUE.send({
				poll_id: poll.id,
				question_id: params.id,
				model_id: modelId
			});
		}

		return { success: true, retried: sampleCount };
	}
};
