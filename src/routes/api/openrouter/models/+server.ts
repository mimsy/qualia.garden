// ABOUTME: API endpoint to fetch available models from OpenRouter.
// ABOUTME: Returns simplified model list with caching for autocomplete.

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface OpenRouterModelResponse {
	id: string;
	name: string;
	context_length: number;
	pricing: {
		prompt: string;
		completion: string;
	};
	supports_reasoning: boolean;
	release_date: string | null;
	description: string | null;
}

interface OpenRouterApiResponse {
	data: Array<{
		id: string;
		name: string;
		context_length: number;
		pricing: {
			prompt: string;
			completion: string;
		};
		supported_parameters?: string[];
		created?: number;
		description?: string;
	}>;
}

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';
const CACHE_TTL = 3600; // 1 hour

export const GET: RequestHandler = async ({ platform }) => {
	// Try to get from cache first
	if (platform?.caches) {
		const cache = platform.caches.default;
		const cacheKey = new Request(OPENROUTER_MODELS_URL);
		const cachedResponse = await cache.match(cacheKey);

		if (cachedResponse) {
			const data = await cachedResponse.json();
			return json(data);
		}
	}

	// Fetch from OpenRouter
	const response = await fetch(OPENROUTER_MODELS_URL, {
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		return json({ error: 'Failed to fetch models from OpenRouter' }, { status: 500 });
	}

	const apiResponse = (await response.json()) as OpenRouterApiResponse;

	// Simplify the response - only keep what we need
	const models: OpenRouterModelResponse[] = apiResponse.data.map((m) => ({
		id: m.id,
		name: m.name,
		context_length: m.context_length,
		pricing: {
			prompt: m.pricing?.prompt || '0',
			completion: m.pricing?.completion || '0'
		},
		supports_reasoning:
			m.supported_parameters?.includes('reasoning') || m.supported_parameters?.includes('include_reasoning') || false,
		release_date: m.created ? new Date(m.created * 1000).toISOString().split('T')[0] : null,
		description: m.description ?? null
	}));

	// Sort by name for easier browsing
	models.sort((a, b) => a.name.localeCompare(b.name));

	// Cache the response
	if (platform?.caches) {
		const cache = platform.caches.default;
		const cacheKey = new Request(OPENROUTER_MODELS_URL);
		const cacheResponse = new Response(JSON.stringify(models), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': `public, max-age=${CACHE_TTL}`
			}
		});
		platform.context.waitUntil(cache.put(cacheKey, cacheResponse));
	}

	return json(models, {
		headers: {
			'Cache-Control': `public, max-age=${CACHE_TTL}`
		}
	});
};
