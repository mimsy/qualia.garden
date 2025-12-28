// ABOUTME: Home page data loader.
// ABOUTME: Fetches featured questions and recent poll activity.

import type { PageServerLoad } from './$types';

interface QuestionWithResponseCount {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	response_count: number;
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { featuredQuestions: [], categories: [] };
	}

	const db = platform.env.DB;

	// Get questions with response counts
	const questionsResult = await db
		.prepare(
			`
		SELECT
			q.id,
			q.text,
			q.category,
			q.response_type,
			COUNT(CASE WHEN p.status = 'complete' THEN 1 END) as response_count
		FROM questions q
		LEFT JOIN polls p ON q.id = p.question_id
		WHERE q.active = 1
		GROUP BY q.id
		ORDER BY response_count DESC, q.created_at DESC
		LIMIT 6
	`
		)
		.all<QuestionWithResponseCount>();

	// Get categories
	const categoriesResult = await db
		.prepare(
			'SELECT DISTINCT category FROM questions WHERE category IS NOT NULL AND active = 1 ORDER BY category'
		)
		.all<{ category: string }>();

	return {
		featuredQuestions: questionsResult.results,
		categories: categoriesResult.results.map((r) => r.category)
	};
};
