// ABOUTME: New question form handler.
// ABOUTME: Creates questions in the database.

import { fail, redirect } from '@sveltejs/kit';
import { createQuestion, getCategories } from '$lib/db/queries';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
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
		const category = formData.get('category') as string | null;
		const response_type = formData.get('response_type') as 'multiple_choice' | 'scale' | 'yes_no';
		const optionsRaw = formData.get('options') as string | null;

		if (!text || !response_type) {
			return fail(400, { error: 'Text and response type are required' });
		}

		// Parse options for multiple choice
		let options: string | null = null;
		if (response_type === 'multiple_choice' && optionsRaw) {
			const optionsList = optionsRaw
				.split('\n')
				.map((o) => o.trim())
				.filter((o) => o.length > 0);
			if (optionsList.length < 2) {
				return fail(400, { error: 'Multiple choice requires at least 2 options' });
			}
			options = JSON.stringify(optionsList);
		}

		await createQuestion(platform.env.DB, {
			text,
			category: category || null,
			response_type,
			options
		});

		throw redirect(303, '/admin/questions');
	}
};
