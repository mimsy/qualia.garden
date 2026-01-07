// ABOUTME: Root layout server load function.
// ABOUTME: Provides user and isAdmin from session.

import { dev } from '$app/environment';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const host = url.host;
	const isPreview = host.includes('.pages.dev') && host !== 'qualia-garden.pages.dev';

	// In dev or preview, allow admin access for testing
	if (dev || isPreview) {
		return {
			isAdmin: true,
			user: locals.user ?? {
				id: 'dev',
				name: 'Developer',
				email: 'dev@localhost',
				isAdmin: true
			}
		};
	}

	return {
		isAdmin: locals.user?.isAdmin ?? false,
		user: locals.user
	};
};
