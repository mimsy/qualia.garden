// ABOUTME: Questions list page data loader.
// ABOUTME: Fetches all questions for admin management.

import { getQuestions } from '$lib/db/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { questions: [] };
	}

	const questions = await getQuestions(platform.env.DB, false);
	return { questions };
};
