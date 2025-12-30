// ABOUTME: Question results page data loader and actions.
// ABOUTME: Fetches question details, model responses, human benchmark data, and handles admin actions.

import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getModels, updateQuestion, createPoll } from '$lib/db/queries';
import type { QuestionStatus, Model } from '$lib/db/types';

interface ResponseWithModel {
	model_id: string;
	model_name: string;
	model_family: string;
	raw_response: string | null;
	parsed_answer: string | null;
	justification: string | null;
	response_time_ms: number | null;
	status: string;
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
	answer_labels: string | null;
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
	const question = await db
		.prepare('SELECT * FROM questions WHERE id = ?')
		.bind(params.id)
		.first<Question>();

	if (!question) {
		throw error(404, 'Question not found');
	}

	// Get latest response per model for this question (deduplicated)
	const responsesResult = await db
		.prepare(
			`
		SELECT
			m.id as model_id,
			m.name as model_name,
			m.family as model_family,
			r.raw_response,
			r.parsed_answer,
			r.justification,
			r.response_time_ms,
			p.status
		FROM polls p
		JOIN models m ON p.model_id = m.id
		LEFT JOIN responses r ON p.id = r.poll_id
		WHERE p.question_id = ?
			AND p.id = (
				SELECT p2.id FROM polls p2
				WHERE p2.question_id = p.question_id
					AND p2.model_id = p.model_id
				ORDER BY p2.created_at DESC
				LIMIT 1
			)
		ORDER BY m.family, m.name
	`
		)
		.bind(params.id)
		.all<ResponseWithModel>();

	// Parse options if multiple choice
	const options = question.options ? (JSON.parse(question.options) as string[]) : null;

	// Calculate aggregate results
	const responses = responsesResult.results.filter((r) => r.parsed_answer !== null);
	const answerCounts: Record<string, number> = {};

	for (const response of responses) {
		if (response.parsed_answer) {
			answerCounts[response.parsed_answer] = (answerCounts[response.parsed_answer] || 0) + 1;
		}
	}

	// Sort answers for display
	let sortedAnswers: Array<{ answer: string; count: number; percentage: number }>;

	// Parse answer labels for sorting (need this before the benchmark fetch)
	const questionAnswerLabels: Record<string, string> | null = question.answer_labels
		? JSON.parse(question.answer_labels)
		: null;
	const questionLabelToKey: Record<string, string> | null = questionAnswerLabels
		? Object.fromEntries(Object.entries(questionAnswerLabels).map(([k, v]) => [v, k]))
		: null;

	if (question.response_type === 'scale') {
		// Sort numerically for scale
		sortedAnswers = Object.entries(answerCounts)
			.map(([answer, count]) => ({
				answer,
				count,
				percentage: responses.length > 0 ? (count / responses.length) * 100 : 0
			}))
			.sort((a, b) => parseInt(a.answer) - parseInt(b.answer));
	} else if (questionLabelToKey) {
		// For benchmark questions, sort by key order to match human data
		sortedAnswers = Object.entries(answerCounts)
			.map(([answer, count]) => ({
				answer,
				count,
				percentage: responses.length > 0 ? (count / responses.length) * 100 : 0
			}))
			.sort((a, b) => {
				const keyA = questionLabelToKey[a.answer] || a.answer;
				const keyB = questionLabelToKey[b.answer] || b.answer;
				return parseInt(keyA) - parseInt(keyB);
			});
	} else {
		// Sort by count for other types
		sortedAnswers = Object.entries(answerCounts)
			.map(([answer, count]) => ({
				answer,
				count,
				percentage: responses.length > 0 ? (count / responses.length) * 100 : 0
			}))
			.sort((a, b) => b.count - a.count);
	}

	// Fetch benchmark data if this is a benchmark question
	let benchmarkSource: BenchmarkSource | null = null;
	let humanDistributions: HumanDistribution[] = [];

	if (question.benchmark_source_id) {
		// Get benchmark source
		benchmarkSource = await db
			.prepare('SELECT * FROM benchmark_sources WHERE id = ?')
			.bind(question.benchmark_source_id)
			.first<BenchmarkSource>();

		// Get all human distributions for this question
		const distResult = await db
			.prepare(
				'SELECT * FROM human_response_distributions WHERE question_id = ? ORDER BY continent, education_level'
			)
			.bind(params.id)
			.all<HumanDistribution>();
		humanDistributions = distResult.results;
	}

	// Get unique continents and education levels for filters
	const continents = [
		...new Set(humanDistributions.filter((d) => d.continent).map((d) => d.continent as string))
	].sort();
	const educationLevels = [
		...new Set(
			humanDistributions.filter((d) => d.education_level).map((d) => d.education_level as string)
		)
	].sort();

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
		responses: responsesResult.results,
		aggregateResults: sortedAnswers,
		totalResponses: responses.length,
		benchmarkSource,
		humanDistributions,
		answerLabels: questionAnswerLabels,
		labelToKey: questionLabelToKey,
		continents,
		educationLevels,
		allPolls,
		availableModels,
		categories
	};
};

export const actions: Actions = {
	update: async ({ params, request, platform, locals }) => {
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

		// Parse options for multiple choice
		let options: string | null = null;
		if (responseType === 'multiple_choice') {
			const optionsList = optionsRaw
				.split('\n')
				.map((o) => o.trim())
				.filter(Boolean);
			if (optionsList.length < 2) {
				return fail(400, { error: 'Multiple choice requires at least 2 options' });
			}
			options = JSON.stringify(optionsList);
		}

		await updateQuestion(platform.env.DB, params.id, {
			text: text.trim(),
			category: category?.trim() || null,
			response_type: responseType as 'multiple_choice' | 'scale' | 'yes_no',
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

		if (modelIds.length === 0) {
			return fail(400, { error: 'Select at least one model to poll' });
		}

		// Create polls and queue them
		for (const modelId of modelIds) {
			const poll = await createPoll(platform.env.DB, {
				question_id: params.id,
				model_id: modelId
			});

			await platform.env.POLL_QUEUE.send({
				poll_id: poll.id,
				question_id: params.id,
				model_id: modelId
			});
		}

		return { success: true, polled: modelIds.length };
	}
};
