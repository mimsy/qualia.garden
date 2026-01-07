// ABOUTME: SvelteKit server hooks for authentication.
// ABOUTME: Handles auth routes and populates session in locals.

import { svelteKitHandler } from 'better-auth/svelte-kit';
import { createAuth } from '$lib/server/auth';
import { dev, building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Skip during build
	if (building) {
		return resolve(event);
	}

	const db = event.platform?.env?.DB;

	if (!db) {
		// No database available
		return resolve(event);
	}

	// Determine base URL
	const baseURL = dev ? 'http://localhost:5173' : `https://${event.url.host}`;

	// Get auth secrets from environment
	const env = event.platform?.env;
	if (!env?.BETTER_AUTH_SECRET) {
		console.warn('BETTER_AUTH_SECRET not configured');
		return resolve(event);
	}

	// Create auth instance with request context
	const auth = createAuth(db, baseURL, {
		BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
		GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
		GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
		GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET
	});

	// Get session and populate locals BEFORE calling svelteKitHandler
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.user = session.user;
		event.locals.session = session.session;
	}

	// Handle all requests (including auth routes)
	return svelteKitHandler({ event, resolve, auth, building });
};
