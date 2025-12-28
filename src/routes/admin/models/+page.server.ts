// ABOUTME: Models list page data loader.
// ABOUTME: Fetches all models for admin management.

import { getModels, updateModel } from '$lib/db/queries';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { models: [] };
	}

	const models = await getModels(platform.env.DB, false);
	return { models };
};

export const actions: Actions = {
	toggle: async ({ request, platform }) => {
		if (!platform?.env?.DB) {
			return fail(500, { error: 'Database not available' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const active = formData.get('active') === 'true';

		await updateModel(platform.env.DB, id, { active: !active });

		return { success: true };
	}
};
