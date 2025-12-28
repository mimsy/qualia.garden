// ABOUTME: TypeScript declarations for SvelteKit app.
// ABOUTME: Defines Cloudflare platform bindings (D1, Queues, secrets).

declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				POLL_QUEUE: Queue;
				OPENROUTER_API_KEY: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
