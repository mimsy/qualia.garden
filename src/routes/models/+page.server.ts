// ABOUTME: Models index page data loader.
// ABOUTME: Fetches all models with response counts and human alignment scores.

import type { PageServerLoad } from './$types';

interface ModelWithStats {
	id: string;
	name: string;
	family: string;
	supports_reasoning: boolean;
	active: boolean;
	questionCount: number;
	humanAlignmentScore: number | null;
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { models: [] };
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

	const models: ModelWithStats[] = modelsResult.results.map((m) => ({
		id: m.id,
		name: m.name,
		family: m.family,
		supports_reasoning: Boolean(m.supports_reasoning),
		active: Boolean(m.active),
		questionCount: m.question_count,
		humanAlignmentScore: null // Will compute on detail page for now
	}));

	return { models };
};
