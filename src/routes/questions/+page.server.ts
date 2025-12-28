// ABOUTME: Questions browse page data loader.
// ABOUTME: Fetches questions with optional category filter.

import type { PageServerLoad } from './$types';

interface QuestionWithResponseCount {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	response_count: number;
}

export const load: PageServerLoad = async ({ url, platform }) => {
	if (!platform?.env?.DB) {
		return { questions: [], categories: [], selectedCategory: null };
	}

	const db = platform.env.DB;
	const selectedCategory = url.searchParams.get('category');

	// Build query based on category filter
	let questionsQuery = `
		SELECT
			q.id,
			q.text,
			q.category,
			q.response_type,
			COUNT(CASE WHEN p.status = 'complete' THEN 1 END) as response_count
		FROM questions q
		LEFT JOIN polls p ON q.id = p.question_id
		WHERE q.active = 1
	`;

	if (selectedCategory) {
		questionsQuery += ` AND q.category = ?`;
	}

	questionsQuery += ` GROUP BY q.id ORDER BY q.category, q.created_at DESC`;

	const questionsStmt = db.prepare(questionsQuery);
	const questionsResult = selectedCategory
		? await questionsStmt.bind(selectedCategory).all<QuestionWithResponseCount>()
		: await questionsStmt.all<QuestionWithResponseCount>();

	// Get all categories for filter
	const categoriesResult = await db
		.prepare(
			'SELECT DISTINCT category FROM questions WHERE category IS NOT NULL AND active = 1 ORDER BY category'
		)
		.all<{ category: string }>();

	return {
		questions: questionsResult.results,
		categories: categoriesResult.results.map((r) => r.category),
		selectedCategory
	};
};
