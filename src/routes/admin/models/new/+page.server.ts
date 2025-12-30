// ABOUTME: Server actions for creating new models.
// ABOUTME: Handles form submission to add models to the database.

import { createModel, getFamilies, getModel } from '$lib/db/queries';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { families: [] };
	}

	const families = await getFamilies(platform.env.DB);
	return { families };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const id = (formData.get('id') as string)?.trim();
		const name = (formData.get('name') as string)?.trim();
		const family = (formData.get('family') as string)?.trim();
		const openrouter_id = (formData.get('openrouter_id') as string)?.trim();
		const supports_reasoning = formData.get('supports_reasoning') === 'true';

		if (!name || !family || !openrouter_id) {
			return fail(400, { error: 'Name, family, and OpenRouter ID are required' });
		}

		// Check if model ID already exists
		if (id) {
			const existing = await getModel(platform.env.DB, id);
			if (existing) {
				return fail(400, { error: 'A model with this ID already exists' });
			}
		}

		await createModel(platform.env.DB, { name, family, openrouter_id, supports_reasoning });

		redirect(303, '/admin/models');
	}
};
