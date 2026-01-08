// ABOUTME: Data loader for benchmark source detail page.
// ABOUTME: Returns questions with full aggregate results for display.

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { loadQuestionsWithStats, computeOverallStats } from '$lib/db/question-stats';

interface BenchmarkSource {
	id: string;
	name: string;
	short_name: string;
	url: string | null;
	sample_size: number | null;
	year_range: string | null;
	description: string | null;
}

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		return error(500, 'Database not available');
	}

	const db = platform.env.DB;
	const sourceId = params.id;

	// Get source metadata
	const sourceResult = await db
		.prepare('SELECT * FROM benchmark_sources WHERE id = ?')
		.bind(sourceId)
		.first<BenchmarkSource>();

	if (!sourceResult) {
		return error(404, 'Source not found');
	}

	// Load questions with full statistics
	const questions = await loadQuestionsWithStats(db, {
		sourceId,
		status: 'published'
	});

	if (questions.length === 0) {
		return {
			source: sourceResult,
			questions: [],
			categories: [],
			overallHumanSimilarity: null,
			overallAiConsensus: null,
			overallAiConfidence: null,
			questionCount: 0
		};
	}

	// Get unique categories
	const categories = [
		...new Set(questions.filter((q) => q.category).map((q) => q.category as string))
	].sort();

	// Compute overall scores
	const { overallHumanSimilarity, overallAiConsensus, overallAiConfidence } =
		computeOverallStats(questions);

	return {
		source: sourceResult,
		questions,
		categories,
		overallHumanSimilarity,
		overallAiConsensus,
		overallAiConfidence,
		questionCount: questions.length
	};
};
