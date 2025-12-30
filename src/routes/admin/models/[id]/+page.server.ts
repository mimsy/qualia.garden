// ABOUTME: Server actions for editing and deleting models.
// ABOUTME: Handles model updates and deletion.

import { getModel, updateModel, deleteModel, getFamilies } from '$lib/db/queries';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const model = await getModel(platform.env.DB, params.id);
	if (!model) {
		throw error(404, 'Model not found');
	}

	const families = await getFamilies(platform.env.DB);
	return { model, families };
};

export const actions: Actions = {
	update: async ({ params, request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();
		const family = (formData.get('family') as string)?.trim();
		const openrouter_id = (formData.get('openrouter_id') as string)?.trim();
		const supports_reasoning = formData.get('supports_reasoning') === 'true';

		if (!name || !family || !openrouter_id) {
			return fail(400, { error: 'Name, family, and OpenRouter ID are required' });
		}

		await updateModel(platform.env.DB, params.id, { name, family, openrouter_id, supports_reasoning });

		return { success: true };
	},

	delete: async ({ params, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		await deleteModel(platform.env.DB, params.id);

		redirect(303, '/admin/models');
	}
};
