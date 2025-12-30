// ABOUTME: Server-side auth check for admin routes.
// ABOUTME: Verifies Cloudflare Access authentication header.

import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request, url }) => {
	// In development, skip auth check
	if (dev) {
		return { user: 'dev@localhost' };
	}

	// Allow access on preview deployments (for testing)
	const host = url.host;
	if (host.includes('.pages.dev') && host !== 'qualia-garden.pages.dev') {
		return { user: 'preview@test' };
	}

	// Check for Cloudflare Access header
	const userEmail = request.headers.get('CF-Access-Authenticated-User-Email');

	if (!userEmail) {
		throw error(401, 'Unauthorized: Cloudflare Access required');
	}

	return { user: userEmail };
};
