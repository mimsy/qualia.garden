// ABOUTME: Questions browse page data loader.
// ABOUTME: Fetches questions with full statistics, category, status, and source filters.

import type { PageServerLoad } from './$types';
import type { QuestionStatus } from '$lib/db/types';
import { loadQuestionsWithStats } from '$lib/db/question-stats';

interface BenchmarkSource {
	id: string;
	name: string;
	short_name: string;
}

export const load: PageServerLoad = async ({ url, platform, parent }) => {
	const { isAdmin } = await parent();

	if (!platform?.env?.DB) {
		return {
			questions: [],
			categories: [],
			sources: [],
			selectedCategory: null,
			selectedSource: null,
			selectedStatus: 'published'
		};
	}

	const db = platform.env.DB;
	const selectedCategory = url.searchParams.get('category');
	const selectedSource = url.searchParams.get('source');
	const selectedStatus = (url.searchParams.get('status') as QuestionStatus | 'all') || 'published';

	// Non-admins always see published only
	const effectiveStatus = isAdmin ? selectedStatus : 'published';

	// Load questions with full statistics
	const questions = await loadQuestionsWithStats(db, {
		category: selectedCategory,
		sourceId: selectedSource === 'none' ? null : selectedSource || undefined,
		status: effectiveStatus === 'all' ? undefined : effectiveStatus
	});

	// Get categories - for admins, include all; for public, only from published questions
	const categoriesQuery = isAdmin
		? 'SELECT DISTINCT category FROM questions WHERE category IS NOT NULL ORDER BY category'
		: "SELECT DISTINCT category FROM questions WHERE category IS NOT NULL AND status = 'published' ORDER BY category";
	const categoriesResult = await db.prepare(categoriesQuery).all<{ category: string }>();

	// Get benchmark sources
	const sourcesResult = await db
		.prepare('SELECT id, name, short_name FROM benchmark_sources ORDER BY name')
		.all<BenchmarkSource>();

	return {
		questions,
		categories: categoriesResult.results.map((r) => r.category),
		sources: sourcesResult.results,
		selectedCategory,
		selectedSource,
		selectedStatus: effectiveStatus
	};
};
