// ABOUTME: Dashboard data loader.
// ABOUTME: Fetches stats for questions, models, and polls.

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return {
			stats: { questions: 0, models: 0, completedPolls: 0 }
		};
	}

	const db = platform.env.DB;

	const [questionsResult, modelsResult, pollsResult] = await Promise.all([
		db.prepare('SELECT COUNT(*) as count FROM questions WHERE active = 1').first<{ count: number }>(),
		db.prepare('SELECT COUNT(*) as count FROM models WHERE active = 1').first<{ count: number }>(),
		db.prepare("SELECT COUNT(*) as count FROM polls WHERE status = 'complete'").first<{ count: number }>()
	]);

	return {
		stats: {
			questions: questionsResult?.count ?? 0,
			models: modelsResult?.count ?? 0,
			completedPolls: pollsResult?.count ?? 0
		}
	};
};
