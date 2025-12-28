// ABOUTME: Edit question page handler.
// ABOUTME: Updates and toggles question status.

import { error, fail, redirect } from '@sveltejs/kit';
import { getQuestion, updateQuestion, getCategories } from '$lib/db/queries';
import { parseOptions } from '$lib/db/types';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const question = await getQuestion(platform.env.DB, params.id);
	if (!question) {
		throw error(404, 'Question not found');
	}

	const categories = await getCategories(platform.env.DB);
	const options = parseOptions(question.options);

	return { question, categories, optionsText: options?.join('\n') ?? '' };
};

export const actions: Actions = {
	update: async ({ params, request, platform }) => {
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

		await updateQuestion(platform.env.DB, params.id, {
			text,
			category: category || null,
			response_type,
			options
		});

		throw redirect(303, '/admin/questions');
	},

	toggle: async ({ params, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const question = await getQuestion(platform.env.DB, params.id);
		if (!question) {
			return fail(404, { error: 'Question not found' });
		}

		await updateQuestion(platform.env.DB, params.id, {
			active: !question.active
		});

		return { success: true };
	}
};
