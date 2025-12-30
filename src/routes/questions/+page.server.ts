// ABOUTME: Questions browse page data loader.
// ABOUTME: Fetches questions with optional category and status filters.

import type { PageServerLoad } from './$types';
import type { QuestionStatus } from '$lib/db/types';

interface QuestionWithResponseCount {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	status: QuestionStatus;
	response_count: number;
}

export const load: PageServerLoad = async ({ url, platform, parent }) => {
	const { isAdmin } = await parent();

	if (!platform?.env?.DB) {
		return { questions: [], categories: [], selectedCategory: null, selectedStatus: 'published' };
	}

	const db = platform.env.DB;
	const selectedCategory = url.searchParams.get('category');
	const selectedStatus = (url.searchParams.get('status') as QuestionStatus | 'all') || 'published';

	// Non-admins always see published only
	const effectiveStatus = isAdmin ? selectedStatus : 'published';

	// Build query based on filters
	const conditions: string[] = [];
	const bindings: string[] = [];

	if (effectiveStatus !== 'all') {
		conditions.push('q.status = ?');
		bindings.push(effectiveStatus);
	}

	if (selectedCategory) {
		conditions.push('q.category = ?');
		bindings.push(selectedCategory);
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

	const questionsQuery = `
		SELECT
			q.id,
			q.text,
			q.category,
			q.response_type,
			q.status,
			COUNT(CASE WHEN p.status = 'complete' THEN 1 END) as response_count
		FROM questions q
		LEFT JOIN polls p ON q.id = p.question_id
		${whereClause}
		GROUP BY q.id
		ORDER BY q.category, q.created_at DESC
	`;

	const questionsStmt = db.prepare(questionsQuery);
	const questionsResult =
		bindings.length > 0
			? await questionsStmt.bind(...bindings).all<QuestionWithResponseCount>()
			: await questionsStmt.all<QuestionWithResponseCount>();

	// Get categories - for admins, include all; for public, only from published questions
	const categoriesQuery = isAdmin
		? 'SELECT DISTINCT category FROM questions WHERE category IS NOT NULL ORDER BY category'
		: "SELECT DISTINCT category FROM questions WHERE category IS NOT NULL AND status = 'published' ORDER BY category";
	const categoriesResult = await db.prepare(categoriesQuery).all<{ category: string }>();

	return {
		questions: questionsResult.results,
		categories: categoriesResult.results.map((r) => r.category),
		selectedCategory,
		selectedStatus: effectiveStatus
	};
};
