// ABOUTME: Questions browse page data loader.
// ABOUTME: Fetches questions with full statistics, category, status, source, and tag filters.

import type { PageServerLoad } from './$types';
import type { QuestionStatus, Tag } from '$lib/db/types';
import { loadQuestionsWithStats } from '$lib/db/question-stats';
import { getTagsWithCounts, getTagsForQuestionsWithFilter, getQuestionsByTag } from '$lib/db/queries';

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
			tags: [],
			tagMap: new Map<string, Tag[]>(),
			selectedCategory: null,
			selectedSource: null,
			selectedTag: null,
			selectedStatus: 'published'
		};
	}

	const db = platform.env.DB;
	const selectedCategory = url.searchParams.get('category');
	const selectedSource = url.searchParams.get('source');
	const selectedTag = url.searchParams.get('tag');
	const selectedStatus = (url.searchParams.get('status') as QuestionStatus | 'all') || 'published';

	// Non-admins always see published only
	const effectiveStatus = isAdmin ? selectedStatus : 'published';

	// Load questions with full statistics
	// If filtering by tag, first get the question IDs for that tag
	let questionIds: string[] | undefined;
	if (selectedTag) {
		const tagQuestions = await getQuestionsByTag(db, selectedTag);
		questionIds = tagQuestions.map((q) => q.id);
		// If no questions have this tag, return empty results early
		if (questionIds.length === 0) {
			const tagsWithCounts = await getTagsWithCounts(db);
			return {
				questions: [],
				categories: [],
				sources: [],
				tags: tagsWithCounts,
				tagMap: new Map<string, Tag[]>(),
				selectedCategory,
				selectedSource,
				selectedTag,
				selectedStatus: effectiveStatus
			};
		}
	}

	const questions = await loadQuestionsWithStats(db, {
		category: selectedCategory,
		sourceId: selectedSource === 'none' ? null : selectedSource || undefined,
		status: effectiveStatus === 'all' ? undefined : effectiveStatus,
		questionIds
	});

	// Get tags for questions to display on cards (using subquery to avoid parameter limit)
	const tagMap = await getTagsForQuestionsWithFilter(db, {
		category: selectedCategory,
		sourceId: selectedSource === 'none' ? null : selectedSource || undefined,
		status: effectiveStatus === 'all' ? undefined : effectiveStatus,
		tagId: selectedTag || undefined
	});

	// Get tags with counts for sidebar filter
	const tagsWithCounts = await getTagsWithCounts(db);

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
		tags: tagsWithCounts,
		tagMap,
		selectedCategory,
		selectedSource,
		selectedTag,
		selectedStatus: effectiveStatus
	};
};
