// ABOUTME: Catch-all route for Better Auth API endpoints.
// ABOUTME: Required for Cloudflare Workers to recognize auth routes.

import { createAuth } from '$lib/server/auth';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';

const handleAuthRequest: RequestHandler = async ({ request, platform, url }) => {
	const db = platform?.env?.DB;
	if (!db) {
		return new Response('Database not available', { status: 500 });
	}

	const baseURL = dev ? 'http://localhost:5173' : `https://${url.host}`;
	const env = platform?.env;

	if (!env?.BETTER_AUTH_SECRET) {
		return new Response('Auth not configured', { status: 500 });
	}

	const auth = createAuth(db, baseURL, {
		BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
		GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
		GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
		GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET
	});

	return auth.handler(request);
};

export const GET = handleAuthRequest;
export const POST = handleAuthRequest;
