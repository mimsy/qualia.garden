// ABOUTME: Better Auth server configuration.
// ABOUTME: Configures OAuth providers and D1 database adapter with Kysely.

import { betterAuth } from 'better-auth';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { nanoid } from 'nanoid';

// Database schema types for Kysely (Better Auth uses camelCase columns)
interface Database {
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: number;
		image: string | null;
		isAdmin: number;
		createdAt: string;
		updatedAt: string;
	};
	session: {
		id: string;
		userId: string;
		token: string;
		expiresAt: string;
		ipAddress: string | null;
		userAgent: string | null;
		createdAt: string;
		updatedAt: string;
	};
	account: {
		id: string;
		userId: string;
		accountId: string;
		providerId: string;
		accessToken: string | null;
		refreshToken: string | null;
		accessTokenExpiresAt: string | null;
		refreshTokenExpiresAt: string | null;
		scope: string | null;
		idToken: string | null;
		password: string | null;
		createdAt: string;
		updatedAt: string;
	};
	verification: {
		id: string;
		identifier: string;
		value: string;
		expiresAt: string;
		createdAt: string;
		updatedAt: string;
	};
}

interface AuthEnv {
	BETTER_AUTH_SECRET: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
}

export function createAuth(d1: D1Database, baseURL: string, env: AuthEnv) {
	const db = new Kysely<Database>({
		dialect: new D1Dialect({ database: d1 })
	});

	return betterAuth({
		baseURL,
		secret: env.BETTER_AUTH_SECRET,
		database: {
			db,
			type: 'sqlite'
		},
		// Generate IDs matching existing pattern (nanoid 12 chars)
		generateId: () => nanoid(12),
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET
			},
			github: {
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET
			}
		},
		user: {
			additionalFields: {
				isAdmin: {
					type: 'boolean',
					defaultValue: false,
					input: false // Cannot be set by user
				}
			}
		},
		callbacks: {
			// Make first user an admin
			onUserCreated: async ({ user }: { user: { id: string } }) => {
				const existingUsers = await db.selectFrom('user').select('id').limit(2).execute();

				// If only one user exists (the one just created), make them admin
				if (existingUsers.length === 1) {
					await db.updateTable('user').set({ isAdmin: 1 }).where('id', '=', user.id).execute();
				}
			}
		}
	});
}

export type Auth = ReturnType<typeof createAuth>;
