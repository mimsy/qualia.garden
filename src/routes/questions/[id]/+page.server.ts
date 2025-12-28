// ABOUTME: Question results page data loader.
// ABOUTME: Fetches question details and all model responses.

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface ResponseWithModel {
	model_id: string;
	model_name: string;
	model_family: string;
	raw_response: string | null;
	parsed_answer: string | null;
	response_time_ms: number | null;
	status: string;
}

interface Question {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	options: string | null;
}

export const load: PageServerLoad = async ({ params, platform }) => {
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

	// Get all responses for this question
	const responsesResult = await db
		.prepare(
			`
		SELECT
			m.id as model_id,
			m.name as model_name,
			m.family as model_family,
			r.raw_response,
			r.parsed_answer,
			r.response_time_ms,
			p.status
		FROM polls p
		JOIN models m ON p.model_id = m.id
		LEFT JOIN responses r ON p.id = r.poll_id
		WHERE p.question_id = ?
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

	if (question.response_type === 'scale') {
		// Sort numerically for scale
		sortedAnswers = Object.entries(answerCounts)
			.map(([answer, count]) => ({
				answer,
				count,
				percentage: responses.length > 0 ? (count / responses.length) * 100 : 0
			}))
			.sort((a, b) => parseInt(a.answer) - parseInt(b.answer));
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

	return {
		question,
		options,
		responses: responsesResult.results,
		aggregateResults: sortedAnswers,
		totalResponses: responses.length
	};
};
