// ABOUTME: Server-side auth check for admin routes.
// ABOUTME: Verifies Cloudflare Access authentication header.

import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
	// In development, skip auth check
	if (dev) {
		return { user: 'dev@localhost' };
	}

	// Check for Cloudflare Access header
	const userEmail = request.headers.get('CF-Access-Authenticated-User-Email');

	if (!userEmail) {
		throw error(401, 'Unauthorized: Cloudflare Access required');
	}

	return { user: userEmail };
};
