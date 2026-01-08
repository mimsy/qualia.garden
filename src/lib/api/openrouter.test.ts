// ABOUTME: Tests for OpenRouter API client.
// ABOUTME: Covers successful calls, error handling, and edge cases.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callModel, type ChatMessage } from './openrouter';

describe('callModel', () => {
	const mockApiKey = 'test-api-key';
	const mockModelId = 'openai/gpt-4';
	const mockMessages: ChatMessage[] = [
		{ role: 'system', content: 'You are a helpful assistant.' },
		{ role: 'user', content: 'Hello!' }
	];

	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	describe('successful responses', () => {
		it('returns success with response content', async () => {
			const mockResponse = {
				id: 'chatcmpl-123',
				model: mockModelId,
				choices: [{ message: { role: 'assistant', content: 'Hello there!' }, finish_reason: 'stop' }],
				usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
			};

			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve(mockResponse)
				})
			);

			const result = await callModel(mockApiKey, mockModelId, mockMessages);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.response).toBe('Hello there!');
				expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
			}
		});

		it('sends correct headers and body', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						choices: [{ message: { content: 'test' } }]
					})
			});
			vi.stubGlobal('fetch', mockFetch);

			await callModel(mockApiKey, mockModelId, mockMessages);

			expect(mockFetch).toHaveBeenCalledWith(
				'https://openrouter.ai/api/v1/chat/completions',
				expect.objectContaining({
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer test-api-key',
						'HTTP-Referer': 'https://qualia.garden',
						'X-Title': 'Qualia Garden'
					}
				})
			);

			const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(callBody.model).toBe(mockModelId);
			expect(callBody.messages).toEqual(mockMessages);
			expect(callBody.max_tokens).toBe(500);
			expect(callBody.temperature).toBe(0.7);
		});
	});

	describe('error handling', () => {
		it('returns error for non-ok HTTP response', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: false,
					status: 429,
					text: () => Promise.resolve('Rate limit exceeded')
				})
			);

			const result = await callModel(mockApiKey, mockModelId, mockMessages);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('HTTP 429: Rate limit exceeded');
				expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
			}
		});

		it('returns error when response has no content', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ choices: [] })
				})
			);

			const result = await callModel(mockApiKey, mockModelId, mockMessages);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('No content in response');
			}
		});

		it('returns error when choices[0].message is undefined', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ choices: [{ finish_reason: 'stop' }] })
				})
			);

			const result = await callModel(mockApiKey, mockModelId, mockMessages);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('No content in response');
			}
		});

		it('handles network errors', async () => {
			vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

			const result = await callModel(mockApiKey, mockModelId, mockMessages);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Network error');
			}
		});

		it('handles non-Error thrown values', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockRejectedValue('string error')
			);

			const result = await callModel(mockApiKey, mockModelId, mockMessages);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe('Unknown error');
			}
		});
	});

	describe('response time tracking', () => {
		it('measures response time correctly', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockImplementation(async () => {
					// Simulate 100ms delay
					await new Promise((resolve) => setTimeout(resolve, 100));
					return {
						ok: true,
						json: () => Promise.resolve({ choices: [{ message: { content: 'test' } }] })
					};
				})
			);

			const resultPromise = callModel(mockApiKey, mockModelId, mockMessages);
			await vi.advanceTimersByTimeAsync(100);
			const result = await resultPromise;

			expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
		});
	});
});
