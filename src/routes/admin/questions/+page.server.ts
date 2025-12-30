// ABOUTME: Questions list page data loader.
// ABOUTME: Fetches all questions for admin management with toggle action.

import { fail } from '@sveltejs/kit';
import { getQuestions, updateQuestion } from '$lib/db/queries';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { questions: [] };
	}

	const questions = await getQuestions(platform.env.DB, false);
	return { questions };
};

export const actions: Actions = {
	toggle: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const questionId = formData.get('question_id') as string;
		const currentActive = formData.get('current_active') === 'true';

		if (!questionId) {
			return fail(400, { error: 'Question ID required' });
		}

		await updateQuestion(platform.env.DB, questionId, { active: !currentActive });
		return { success: true };
	}
};
