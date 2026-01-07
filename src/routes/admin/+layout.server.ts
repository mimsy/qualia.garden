// ABOUTME: Server-side auth check for admin routes.
// ABOUTME: Verifies user is authenticated and has admin privileges.

import { dev } from '$app/environment';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// In development, skip auth check
	if (dev) {
		return { user: 'dev@localhost' };
	}

	// Allow access on preview deployments (for testing)
	const host = url.host;
	if (host.includes('.pages.dev') && host !== 'qualia-garden.pages.dev') {
		return { user: 'preview@test' };
	}

	// Check if user is authenticated
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Check if user is admin
	if (!locals.user.isAdmin) {
		throw error(403, 'Forbidden: Admin access required');
	}

	return { user: locals.user.email };
};
