// ABOUTME: Data loader for tag detail page.
// ABOUTME: Returns questions with the specified tag and aggregate stats.

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getTag, getQuestionsByTag, getTagsForQuestions } from '$lib/db/queries';
import { loadQuestionsWithStats, computeOverallStats } from '$lib/db/question-stats';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		return error(500, 'Database not available');
	}

	const db = platform.env.DB;
	const tagId = params.id;

	// Get tag metadata
	const tag = await getTag(db, tagId);

	if (!tag) {
		return error(404, 'Tag not found');
	}

	// Get question IDs for this tag
	const tagQuestions = await getQuestionsByTag(db, tagId);
	const questionIds = tagQuestions.map((q) => q.id);

	if (questionIds.length === 0) {
		return {
			tag,
			questions: [],
			tagMap: new Map(),
			categories: [],
			overallHumanSimilarity: null,
			overallAiConsensus: null,
			overallAiConfidence: null,
			questionCount: 0
		};
	}

	// Load questions with full statistics
	const questions = await loadQuestionsWithStats(db, {
		questionIds,
		status: 'published'
	});

	// Get tags for questions to display on cards
	const tagMap = await getTagsForQuestions(
		db,
		questions.map((q) => q.id)
	);

	// Get unique categories
	const categories = [...new Set(questions.filter((q) => q.category).map((q) => q.category as string))].sort();

	// Compute overall scores
	const { overallHumanSimilarity, overallAiConsensus, overallAiConfidence } = computeOverallStats(questions);

	return {
		tag,
		questions,
		tagMap,
		categories,
		overallHumanSimilarity,
		overallAiConsensus,
		overallAiConfidence,
		questionCount: questions.length
	};
};
