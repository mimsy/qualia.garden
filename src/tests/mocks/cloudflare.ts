// ABOUTME: Mock implementations for Cloudflare bindings.
// ABOUTME: Provides D1Database, KVNamespace, and Queue mocks for testing.

import { vi } from 'vitest';

// Mock D1 Database
export function createMockD1Database(data: Record<string, unknown[]> = {}) {
	const mockDb = {
		prepare: vi.fn((sql: string) => ({
			bind: vi.fn((..._params: unknown[]) => ({
				first: vi.fn(async <T>() => {
					return data[sql]?.[0] as T | null;
				}),
				all: vi.fn(async <T>() => ({
					results: (data[sql] || []) as T[],
					success: true
				})),
				run: vi.fn(async () => ({
					success: true,
					meta: { changes: 1 }
				}))
			})),
			first: vi.fn(async <T>() => data[sql]?.[0] as T | null),
			all: vi.fn(async <T>() => ({ results: (data[sql] || []) as T[] })),
			run: vi.fn(async () => ({ success: true, meta: { changes: 1 } }))
		})),
		batch: vi.fn(async (statements: unknown[]) => statements.map(() => ({ success: true }))),
		exec: vi.fn(async () => ({ success: true }))
	};
	return mockDb as unknown as D1Database;
}

// Mock KV Namespace
export function createMockKVNamespace(initialData: Record<string, string> = {}) {
	const store = new Map(Object.entries(initialData));

	return {
		get: vi.fn(async (key: string, type?: string) => {
			const value = store.get(key);
			if (!value) return null;
			return type === 'json' ? JSON.parse(value) : value;
		}),
		put: vi.fn(async (key: string, value: string) => {
			store.set(key, value);
		}),
		delete: vi.fn(async (key: string) => {
			store.delete(key);
		}),
		list: vi.fn(async (options?: { prefix?: string }) => {
			const keys = [...store.keys()]
				.filter((k) => !options?.prefix || k.startsWith(options.prefix))
				.map((name) => ({ name }));
			return { keys };
		})
	} as unknown as KVNamespace;
}

// Mock Queue
export function createMockQueue() {
	const messages: unknown[] = [];

	return {
		send: vi.fn(async (message: unknown) => {
			messages.push(message);
		}),
		sendBatch: vi.fn(async (batch: { body: unknown }[]) => {
			messages.push(...batch.map((b) => b.body));
		}),
		getMessages: () => messages
	} as unknown as Queue & { getMessages: () => unknown[] };
}
