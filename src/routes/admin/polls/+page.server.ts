// ABOUTME: Polls list page data loader.
// ABOUTME: Fetches recent polls with question and model info.

import type { PageServerLoad } from './$types';

interface PollWithDetails {
	id: string;
	question_text: string;
	model_name: string;
	model_openrouter_id: string;
	status: string;
	created_at: string;
	completed_at: string | null;
	parsed_answer: string | null;
	justification: string | null;
	reasoning: string | null;
	raw_response: string | null;
	response_time_ms: number | null;
	error: string | null;
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { polls: [] };
	}

	const result = await platform.env.DB.prepare(
		`
		SELECT
			p.id,
			q.text as question_text,
			m.name as model_name,
			m.openrouter_id as model_openrouter_id,
			p.status,
			p.created_at,
			p.completed_at,
			r.parsed_answer,
			r.justification,
			r.reasoning,
			r.raw_response,
			r.response_time_ms,
			r.error
		FROM polls p
		JOIN questions q ON p.question_id = q.id
		JOIN models m ON p.model_id = m.id
		LEFT JOIN responses r ON r.poll_id = p.id
		ORDER BY p.created_at DESC
		LIMIT 100
	`
	).all<PollWithDetails>();

	return { polls: result.results };
};
