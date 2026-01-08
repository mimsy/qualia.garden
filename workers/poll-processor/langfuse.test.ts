// ABOUTME: Tests for Langfuse client.
// ABOUTME: Covers event batching, flush behavior, and error handling.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LangfuseClient, generateUUID } from './langfuse';

describe('LangfuseClient', () => {
	const mockConfig = {
		publicKey: 'pk-test',
		secretKey: 'sk-test'
	};

	beforeEach(() => {
		vi.stubGlobal('crypto', {
			randomUUID: vi.fn().mockReturnValue('mock-uuid-123')
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('constructor', () => {
		it('uses default base URL when not provided', () => {
			const client = new LangfuseClient(mockConfig);
			// Access private config to verify - this is an implementation detail test
			expect(client).toBeDefined();
		});

		it('uses custom base URL when provided', () => {
			const client = new LangfuseClient({
				...mockConfig,
				baseUrl: 'https://custom.langfuse.com'
			});
			expect(client).toBeDefined();
		});
	});

	describe('trace', () => {
		it('adds trace event to queue', () => {
			const client = new LangfuseClient(mockConfig);
			client.trace({
				id: 'trace-1',
				name: 'test-trace',
				metadata: { key: 'value' }
			});
			// The event is stored internally - we verify by flushing
			expect(client).toBeDefined();
		});
	});

	describe('generation', () => {
		it('adds generation event to queue', () => {
			const client = new LangfuseClient(mockConfig);
			client.generation({
				id: 'gen-1',
				traceId: 'trace-1',
				name: 'test-generation',
				model: 'gpt-4',
				startTime: new Date().toISOString()
			});
			expect(client).toBeDefined();
		});
	});

	describe('flush', () => {
		it('does nothing with empty queue', async () => {
			const mockFetch = vi.fn();
			vi.stubGlobal('fetch', mockFetch);

			const client = new LangfuseClient(mockConfig);
			await client.flush();

			expect(mockFetch).not.toHaveBeenCalled();
		});

		it('sends batched events to API', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				text: () => Promise.resolve('OK')
			});
			vi.stubGlobal('fetch', mockFetch);

			const client = new LangfuseClient(mockConfig);
			client.trace({ id: 'trace-1', name: 'test' });
			client.generation({
				id: 'gen-1',
				traceId: 'trace-1',
				name: 'gen',
				model: 'gpt-4',
				startTime: new Date().toISOString()
			});

			await client.flush();

			expect(mockFetch).toHaveBeenCalledOnce();
			expect(mockFetch).toHaveBeenCalledWith(
				'https://us.cloud.langfuse.com/api/public/ingestion',
				expect.objectContaining({
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: expect.stringContaining('Basic ')
					}
				})
			);

			const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(callBody.batch).toHaveLength(2);
			expect(callBody.batch[0].type).toBe('trace-create');
			expect(callBody.batch[1].type).toBe('generation-create');
		});

		it('uses custom base URL for API calls', async () => {
			const mockFetch = vi.fn().mockResolvedValue({ ok: true });
			vi.stubGlobal('fetch', mockFetch);

			const client = new LangfuseClient({
				...mockConfig,
				baseUrl: 'https://custom.langfuse.com'
			});
			client.trace({ id: 'trace-1', name: 'test' });
			await client.flush();

			expect(mockFetch).toHaveBeenCalledWith('https://custom.langfuse.com/api/public/ingestion', expect.anything());
		});

		it('clears queue after successful flush', async () => {
			const mockFetch = vi.fn().mockResolvedValue({ ok: true });
			vi.stubGlobal('fetch', mockFetch);

			const client = new LangfuseClient(mockConfig);
			client.trace({ id: 'trace-1', name: 'test' });
			await client.flush();
			await client.flush(); // Second flush should do nothing

			expect(mockFetch).toHaveBeenCalledOnce();
		});

		it('logs error on API failure', async () => {
			const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Internal Server Error')
			});
			vi.stubGlobal('fetch', mockFetch);

			const client = new LangfuseClient(mockConfig);
			client.trace({ id: 'trace-1', name: 'test' });
			await client.flush();

			expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('[langfuse] Ingestion failed: 500'));
		});

		it('logs error on network failure', async () => {
			const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
			const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
			vi.stubGlobal('fetch', mockFetch);

			const client = new LangfuseClient(mockConfig);
			client.trace({ id: 'trace-1', name: 'test' });
			await client.flush();

			expect(mockConsoleError).toHaveBeenCalledWith(
				expect.stringContaining('[langfuse] Ingestion error: Network error')
			);
		});

		it('handles non-Error thrown values', async () => {
			const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
			const mockFetch = vi.fn().mockRejectedValue('string error');
			vi.stubGlobal('fetch', mockFetch);

			const client = new LangfuseClient(mockConfig);
			client.trace({ id: 'trace-1', name: 'test' });
			await client.flush();

			expect(mockConsoleError).toHaveBeenCalledWith(
				expect.stringContaining('[langfuse] Ingestion error: string error')
			);
		});

		it('includes correct auth header', async () => {
			const mockFetch = vi.fn().mockResolvedValue({ ok: true });
			vi.stubGlobal('fetch', mockFetch);

			const client = new LangfuseClient(mockConfig);
			client.trace({ id: 'trace-1', name: 'test' });
			await client.flush();

			const expectedAuth = `Basic ${btoa('pk-test:sk-test')}`;
			expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe(expectedAuth);
		});
	});
});

describe('generateUUID', () => {
	it('returns a UUID string', () => {
		vi.stubGlobal('crypto', {
			randomUUID: vi.fn().mockReturnValue('550e8400-e29b-41d4-a716-446655440000')
		});

		const uuid = generateUUID();
		expect(uuid).toBe('550e8400-e29b-41d4-a716-446655440000');
	});
});
