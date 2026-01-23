// ABOUTME: Tags index page data loader.
// ABOUTME: Returns all tags with question counts and aggregate statistics.

import type { PageServerLoad } from './$types';
import { getTagsWithCounts } from '$lib/db/queries';
import { loadQuestionsWithStats, computeOverallStats } from '$lib/db/question-stats';

export interface TagWithStats {
	id: string;
	name: string;
	description: string | null;
	questionCount: number;
	humanSimilarity: number | null;
	aiConsensus: number | null;
	aiConfidence: number | null;
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { tags: [] };
	}

	const db = platform.env.DB;

	// Get all tags with counts
	const tagsWithCounts = await getTagsWithCounts(db);

	// For each tag, compute aggregate stats
	const tagsWithStats: TagWithStats[] = await Promise.all(
		tagsWithCounts.map(async (tag) => {
			if (tag.question_count === 0) {
				return {
					id: tag.id,
					name: tag.name,
					description: tag.description,
					questionCount: 0,
					humanSimilarity: null,
					aiConsensus: null,
					aiConfidence: null
				};
			}

			// Load questions for this tag to compute stats
			// Use a subquery approach by filtering with the tag
			const questions = await loadQuestionsWithStats(db, {
				status: 'published',
				questionIds: await getQuestionIdsForTag(db, tag.id)
			});

			const { overallHumanSimilarity, overallAiConsensus, overallAiConfidence } = computeOverallStats(questions);

			return {
				id: tag.id,
				name: tag.name,
				description: tag.description,
				questionCount: tag.question_count,
				humanSimilarity: overallHumanSimilarity,
				aiConsensus: overallAiConsensus,
				aiConfidence: overallAiConfidence
			};
		})
	);

	// Sort by question count descending
	tagsWithStats.sort((a, b) => b.questionCount - a.questionCount);

	return { tags: tagsWithStats };
};

async function getQuestionIdsForTag(db: D1Database, tagId: string): Promise<string[]> {
	const result = await db
		.prepare('SELECT question_id FROM question_tags WHERE tag_id = ?')
		.bind(tagId)
		.all<{ question_id: string }>();
	return result.results.map((r) => r.question_id);
}
