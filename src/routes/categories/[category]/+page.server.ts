// ABOUTME: Data loader for category detail page.
// ABOUTME: Returns questions with full aggregate results for display.

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { loadQuestionsWithStats, computeOverallStats } from '$lib/db/question-stats';
import { getCategoryDescription } from '$lib/db/queries';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		return error(500, 'Database not available');
	}

	const db = platform.env.DB;
	const category = decodeURIComponent(params.category);

	// Load questions with full statistics
	const questions = await loadQuestionsWithStats(db, {
		category,
		status: 'published'
	});

	if (questions.length === 0) {
		return error(404, 'Category not found or has no published questions');
	}

	// Get category description
	const description = await getCategoryDescription(db, category);

	// Compute overall scores
	const { overallHumanSimilarity, overallAiConsensus, overallAiConfidence } =
		computeOverallStats(questions);

	return {
		category,
		description,
		questions,
		overallHumanSimilarity,
		overallAiConsensus,
		overallAiConfidence,
		questionCount: questions.length
	};
};
