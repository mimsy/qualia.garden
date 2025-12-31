// ABOUTME: Create new question page data loader and action.
// ABOUTME: Handles question creation with draft status.

import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createQuestion, getCategories } from '$lib/db/queries';

export const load: PageServerLoad = async ({ platform, parent }) => {
	const { isAdmin } = await parent();

	if (!isAdmin) {
		throw redirect(302, '/questions');
	}

	if (!platform?.env?.DB) {
		return { categories: [] };
	}

	const categories = await getCategories(platform.env.DB);
	return { categories };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const text = formData.get('text') as string;
		const category = formData.get('category') as string;
		const responseType = formData.get('response_type') as string;
		const optionsRaw = formData.get('options') as string;

		if (!text?.trim()) {
			return fail(400, { error: 'Question text is required' });
		}

		if (!responseType) {
			return fail(400, { error: 'Response type is required' });
		}

		// Parse options (required for both ordinal and nominal)
		const optionsList = optionsRaw
			.split('\n')
			.map((o) => o.trim())
			.filter(Boolean);
		if (optionsList.length < 2) {
			return fail(400, { error: 'At least 2 options are required' });
		}
		const options = JSON.stringify(optionsList);

		const question = await createQuestion(platform.env.DB, {
			text: text.trim(),
			category: category?.trim() || null,
			response_type: responseType as 'ordinal' | 'nominal',
			options,
			status: 'draft'
		});

		throw redirect(302, `/questions/${question.id}`);
	}
};
