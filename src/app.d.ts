// ABOUTME: TypeScript declarations for SvelteKit app.
// ABOUTME: Defines Cloudflare platform bindings, auth locals, and secrets.

declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				name: string;
				email: string;
				emailVerified: boolean;
				image?: string | null;
				isAdmin: boolean;
				createdAt: Date;
				updatedAt: Date;
			} | null;
			session: {
				id: string;
				userId: string;
				token: string;
				expiresAt: Date;
				ipAddress?: string | null;
				userAgent?: string | null;
				createdAt?: Date;
				updatedAt?: Date;
			} | null;
		}
		interface Platform {
			env: {
				DB: D1Database;
				POLL_QUEUE: Queue;
				ALIGNMENT_CACHE: KVNamespace;
				OPENROUTER_API_KEY: string;
				BETTER_AUTH_SECRET: string;
				GOOGLE_CLIENT_ID: string;
				GOOGLE_CLIENT_SECRET: string;
				GITHUB_CLIENT_ID: string;
				GITHUB_CLIENT_SECRET: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
