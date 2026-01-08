// ABOUTME: Server actions for creating new models.
// ABOUTME: Handles form submission to add models to the database with admin auth.

import { createModel, getModel } from '$lib/db/queries';
import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { isAdmin } = await parent();

	// Non-admins shouldn't access this page
	if (!isAdmin) {
		redirect(303, '/models');
	}

	return { isAdmin };
};

export const actions: Actions = {
	default: async ({ request, platform, locals, url }) => {
		const isPreview = url.host.includes('.pages.dev') && url.host !== 'qualia-garden.pages.dev';
		const isAdmin = dev || isPreview || locals.user?.isAdmin;

		if (!isAdmin) {
			return fail(403, { error: 'Admin access required' });
		}

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

		// Use openrouter_id as the model id
		const id = openrouter_id;

		// Check if model ID already exists
		const existing = await getModel(platform.env.DB, id);
		if (existing) {
			return fail(400, { error: 'A model with this ID already exists' });
		}

		await createModel(platform.env.DB, { name, family, openrouter_id, supports_reasoning });

		redirect(303, '/models');
	}
};
