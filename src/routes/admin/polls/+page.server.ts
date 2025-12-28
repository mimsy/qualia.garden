// ABOUTME: Polls list page data loader.
// ABOUTME: Fetches recent polls with question and model info.

import type { PageServerLoad } from './$types';

interface PollWithDetails {
	id: string;
	question_text: string;
	model_name: string;
	status: string;
	created_at: string;
	completed_at: string | null;
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { polls: [] };
	}

	const result = await platform.env.DB.prepare(`
		SELECT
			p.id,
			q.text as question_text,
			m.name as model_name,
			p.status,
			p.created_at,
			p.completed_at
		FROM polls p
		JOIN questions q ON p.question_id = q.id
		JOIN models m ON p.model_id = m.id
		ORDER BY p.created_at DESC
		LIMIT 100
	`).all<PollWithDetails>();

	return { polls: result.results };
};
