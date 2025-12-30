// ABOUTME: Root layout server load function.
// ABOUTME: Provides isAdmin flag based on Cloudflare Access auth.

import { dev } from '$app/environment';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request, url }) => {
	const userEmail = request.headers.get('CF-Access-Authenticated-User-Email');
	const host = url.host;
	const isPreview = host.includes('.pages.dev') && host !== 'qualia-garden.pages.dev';

	return {
		isAdmin: dev || isPreview || !!userEmail,
		user: userEmail
	};
};
