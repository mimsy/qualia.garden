// ABOUTME: Tests for poll processor worker main functions.
// ABOUTME: Tests cache invalidation, error storage, system prompt, and AI call functions.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	invalidateAlignmentCache,
	storeErrorResponse,
	SYSTEM_PROMPT,
	callAI,
	callAIText,
	callAIFollowUp,
	processJob,
	type AIResult,
	type PollJob
} from './index';
import type { Question } from './helpers';

// Mock the AI SDK
vi.mock('ai', () => ({
	generateText: vi.fn(),
	Output: {
		object: vi.fn(({ schema }) => schema)
	}
}));

// Mock OpenRouter provider
vi.mock('@openrouter/ai-sdk-provider', () => ({
	createOpenRouter: vi.fn(() => vi.fn((modelId: string) => ({ modelId })))
}));

import { generateText } from 'ai';
const mockGenerateText = generateText as ReturnType<typeof vi.fn>;

// Helper to create mock D1 database
function createMockDb() {
	const mockStatement = {
		bind: vi.fn().mockReturnThis(),
		first: vi.fn(),
		run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 1 } })
	};

	return {
		prepare: vi.fn(() => mockStatement),
		mockStatement
	} as unknown as D1Database & { mockStatement: typeof mockStatement };
}

// Helper to create mock KV namespace
function createMockKV(keys: string[] = []) {
	return {
		list: vi.fn().mockResolvedValue({ keys: keys.map((name) => ({ name })) }),
		delete: vi.fn().mockResolvedValue(undefined)
	} as unknown as KVNamespace;
}

describe('SYSTEM_PROMPT', () => {
	it('is defined and contains expected content', () => {
		expect(SYSTEM_PROMPT).toBeDefined();
		expect(typeof SYSTEM_PROMPT).toBe('string');
		expect(SYSTEM_PROMPT).toContain('survey');
		expect(SYSTEM_PROMPT).toContain('AI');
	});
});

describe('invalidateAlignmentCache', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deletes all cache entries for a source', async () => {
		const kv = createMockKV([
			'alignment:source:wvs-7:overall',
			'alignment:source:wvs-7:full',
			'alignment:source:wvs-7:demo:Europe:High:_:_'
		]);

		await invalidateAlignmentCache(kv, 'wvs-7', '[test]');

		expect(kv.list).toHaveBeenCalledWith({ prefix: 'alignment:source:wvs-7:' });
		expect(kv.delete).toHaveBeenCalledTimes(3);
		expect(kv.delete).toHaveBeenCalledWith('alignment:source:wvs-7:overall');
		expect(kv.delete).toHaveBeenCalledWith('alignment:source:wvs-7:full');
		expect(kv.delete).toHaveBeenCalledWith('alignment:source:wvs-7:demo:Europe:High:_:_');
	});

	it('handles empty cache gracefully', async () => {
		const kv = createMockKV([]);

		await invalidateAlignmentCache(kv, 'wvs-7', '[test]');

		expect(kv.list).toHaveBeenCalledWith({ prefix: 'alignment:source:wvs-7:' });
		expect(kv.delete).not.toHaveBeenCalled();
	});

	it('handles KV list error gracefully', async () => {
		const kv = {
			list: vi.fn().mockRejectedValue(new Error('KV error')),
			delete: vi.fn()
		} as unknown as KVNamespace;

		// Should not throw
		await expect(invalidateAlignmentCache(kv, 'wvs-7', '[test]')).resolves.not.toThrow();
		expect(kv.delete).not.toHaveBeenCalled();
	});

	it('handles KV delete error gracefully', async () => {
		const kv = {
			list: vi.fn().mockResolvedValue({ keys: [{ name: 'test-key' }] }),
			delete: vi.fn().mockRejectedValue(new Error('Delete error'))
		} as unknown as KVNamespace;

		// Should not throw (Promise.all rejection is caught)
		await expect(invalidateAlignmentCache(kv, 'wvs-7', '[test]')).resolves.not.toThrow();
	});

	it('uses correct prefix for source ID', async () => {
		const kv = createMockKV([]);

		await invalidateAlignmentCache(kv, 'custom-source-123', '[test]');

		expect(kv.list).toHaveBeenCalledWith({ prefix: 'alignment:source:custom-source-123:' });
	});
});

describe('storeErrorResponse', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('inserts error response into database', async () => {
		const db = createMockDb();

		await storeErrorResponse(db, 'poll-123', 'Test error message');

		expect(db.prepare).toHaveBeenCalledWith(
			'INSERT INTO responses (id, poll_id, raw_response, parsed_answer, justification, reasoning, response_time_ms, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
		);
		// Check bind was called with poll_id and error
		expect(db.mockStatement.bind).toHaveBeenCalledWith(
			expect.any(String), // responseId (generated)
			'poll-123',
			null,
			null,
			null,
			null,
			0,
			'Test error message'
		);
	});

	it('updates poll status to failed', async () => {
		const db = createMockDb();

		await storeErrorResponse(db, 'poll-456', 'Another error');

		// Second prepare call should be the UPDATE
		expect(db.prepare).toHaveBeenCalledWith(
			"UPDATE polls SET status = 'failed', completed_at = datetime('now') WHERE id = ?"
		);
	});

	it('generates unique response ID', async () => {
		const db = createMockDb();

		await storeErrorResponse(db, 'poll-1', 'Error 1');
		const firstBindCall = db.mockStatement.bind.mock.calls[0];
		const firstResponseId = firstBindCall[0];

		vi.clearAllMocks();
		const db2 = createMockDb();
		await storeErrorResponse(db2, 'poll-2', 'Error 2');
		const secondBindCall = db2.mockStatement.bind.mock.calls[0];
		const secondResponseId = secondBindCall[0];

		// IDs should be different (12 char nanoid-style)
		expect(firstResponseId).toHaveLength(12);
		expect(secondResponseId).toHaveLength(12);
		expect(firstResponseId).not.toBe(secondResponseId);
	});

	it('runs both database operations', async () => {
		const db = createMockDb();

		await storeErrorResponse(db, 'poll-789', 'DB error');

		// Should have called prepare twice (INSERT and UPDATE)
		expect(db.prepare).toHaveBeenCalledTimes(2);
		// Should have called run twice
		expect(db.mockStatement.run).toHaveBeenCalledTimes(2);
	});
});

// Helper to create mock Langfuse client
function createMockLangfuse() {
	return {
		trace: vi.fn(),
		generation: vi.fn(),
		flush: vi.fn().mockResolvedValue(undefined)
	};
}

// Helper to create a test question
function createTestQuestion(overrides: Partial<Question> = {}): Question {
	return {
		id: 'q-1',
		text: 'How much do you trust technology?',
		category: 'Technology',
		response_type: 'ordinal',
		options: '["Not at all", "A little", "Somewhat", "A lot", "Completely"]',
		benchmark_source_id: null,
		...overrides
	};
}

describe('callAIText', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns success when response can be parsed', async () => {
		// Response format uses "response" field with letter answer (C = 3rd option)
		mockGenerateText.mockResolvedValueOnce({
			text: '{"response": "C", "justification": "I have moderate trust"}',
			usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();

		const result = await callAIText('api-key', 'test-model', question, false, langfuse, 'trace-1', '[test]');

		expect(result.success).toBe(true);
		expect(result.parsedAnswer).toBe('3'); // C -> 3 (1-based index)
		expect(result.justification).toBe('I have moderate trust');
		expect(result.error).toBeNull();
	});

	it('returns failure when response cannot be parsed', async () => {
		mockGenerateText.mockResolvedValueOnce({
			text: 'I cannot answer this question directly.',
			usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();

		const result = await callAIText('api-key', 'test-model', question, false, langfuse, 'trace-1', '[test]');

		expect(result.success).toBe(false);
		expect(result.rawResponse).toBe('I cannot answer this question directly.');
		expect(result.error).toBe('Could not parse response');
	});

	it('returns failure on API error', async () => {
		mockGenerateText.mockRejectedValueOnce(new Error('API rate limit exceeded'));

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();

		const result = await callAIText('api-key', 'test-model', question, false, langfuse, 'trace-1', '[test]');

		expect(result.success).toBe(false);
		expect(result.error).toBe('API rate limit exceeded');
		expect(result.rawResponse).toBeNull();
	});

	it('extracts reasoning from reasoningText', async () => {
		mockGenerateText.mockResolvedValueOnce({
			text: '{"response": "D", "justification": "Trust is important"}',
			reasoningText: 'Let me think about this carefully...',
			usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();

		const result = await callAIText('api-key', 'test-model', question, true, langfuse, 'trace-1', '[test]');

		expect(result.success).toBe(true);
		expect(result.reasoning).toBe('Let me think about this carefully...');
	});

	it('logs generation to Langfuse', async () => {
		mockGenerateText.mockResolvedValueOnce({
			text: '{"response": "B", "justification": "Low trust"}',
			usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();

		await callAIText('api-key', 'test-model', question, false, langfuse, 'trace-1', '[test]');

		expect(langfuse.generation).toHaveBeenCalledWith(
			expect.objectContaining({
				traceId: 'trace-1',
				name: 'text-fallback',
				model: 'test-model'
			})
		);
	});
});

describe('callAIFollowUp', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns success when follow-up can be parsed', async () => {
		// Response format: letter answer C = 3rd option
		mockGenerateText.mockResolvedValueOnce({
			text: '{"response": "C", "justification": "After reflection, moderate trust"}',
			usage: { inputTokens: 200, outputTokens: 60, totalTokens: 260 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();
		const previousResult: AIResult = {
			success: false,
			rawResponse: 'I think technology is complex...',
			parsedAnswer: null,
			justification: null,
			reasoning: null,
			responseTimeMs: 500,
			error: 'Could not parse response'
		};

		const result = await callAIFollowUp(
			'api-key',
			'test-model',
			question,
			previousResult,
			langfuse,
			'trace-1',
			'[test]'
		);

		expect(result.success).toBe(true);
		expect(result.parsedAnswer).toBe('3'); // C -> 3
		expect(result.rawResponse).toContain('[Follow-up]');
	});

	it('returns failure when follow-up also cannot be parsed', async () => {
		mockGenerateText.mockResolvedValueOnce({
			text: 'I still cannot give a numeric answer.',
			usage: { inputTokens: 200, outputTokens: 40, totalTokens: 240 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();
		const previousResult: AIResult = {
			success: false,
			rawResponse: 'Complex topic...',
			parsedAnswer: null,
			justification: null,
			reasoning: null,
			responseTimeMs: 500,
			error: 'Could not parse response'
		};

		const result = await callAIFollowUp(
			'api-key',
			'test-model',
			question,
			previousResult,
			langfuse,
			'trace-1',
			'[test]'
		);

		expect(result.success).toBe(false);
		expect(result.error).toBe('Could not parse response after follow-up');
	});

	it('returns failure on API error', async () => {
		mockGenerateText.mockRejectedValueOnce(new Error('Network timeout'));

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();
		const previousResult: AIResult = {
			success: false,
			rawResponse: 'Initial response',
			parsedAnswer: null,
			justification: null,
			reasoning: 'Some reasoning',
			responseTimeMs: 500,
			error: 'Could not parse'
		};

		const result = await callAIFollowUp(
			'api-key',
			'test-model',
			question,
			previousResult,
			langfuse,
			'trace-1',
			'[test]'
		);

		expect(result.success).toBe(false);
		expect(result.error).toBe('Follow-up failed: Network timeout');
		// Preserves previous reasoning
		expect(result.reasoning).toBe('Some reasoning');
	});

	it('accumulates response time from previous result', async () => {
		mockGenerateText.mockResolvedValueOnce({
			text: '{"response": "D", "justification": "Trust after thought"}',
			usage: { inputTokens: 200, outputTokens: 50 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();
		const previousResult: AIResult = {
			success: false,
			rawResponse: 'First response',
			parsedAnswer: null,
			justification: null,
			reasoning: null,
			responseTimeMs: 1000,
			error: 'Could not parse'
		};

		const result = await callAIFollowUp(
			'api-key',
			'test-model',
			question,
			previousResult,
			langfuse,
			'trace-1',
			'[test]'
		);

		// Response time should be at least the previous time
		expect(result.responseTimeMs).toBeGreaterThanOrEqual(1000);
	});
});

describe('callAI', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns success with structured output', async () => {
		// Structured output uses letter answer - D = 4th option
		mockGenerateText.mockResolvedValueOnce({
			experimental_output: { response: 'D', justification: 'I trust technology' },
			text: '{"response": "D", "justification": "I trust technology"}',
			usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();

		const result = await callAI('api-key', 'test-model', question, false, langfuse, 'trace-1', '[test]');

		expect(result.success).toBe(true);
		expect(result.parsedAnswer).toBe('4'); // D -> 4
		expect(result.justification).toBe('I trust technology');
	});

	it('falls back to text when structured output returns null', async () => {
		// First call - structured output returns null
		mockGenerateText.mockResolvedValueOnce({
			experimental_output: null,
			text: 'Some text that is not structured',
			usage: { inputTokens: 100, outputTokens: 50 }
		});
		// Second call - text fallback (C = 3rd option)
		mockGenerateText.mockResolvedValueOnce({
			text: '{"response": "C", "justification": "Moderate trust"}',
			usage: { inputTokens: 120, outputTokens: 60 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();

		const result = await callAI('api-key', 'test-model', question, false, langfuse, 'trace-1', '[test]');

		expect(result.success).toBe(true);
		expect(result.parsedAnswer).toBe('3'); // C -> 3
		// Should have called generateText twice
		expect(mockGenerateText).toHaveBeenCalledTimes(2);
	});

	it('falls back to text on structured output error', async () => {
		// First call - throws error
		mockGenerateText.mockRejectedValueOnce(new Error('Schema validation failed'));
		// Second call - text fallback succeeds (B = 2nd option)
		mockGenerateText.mockResolvedValueOnce({
			text: '{"response": "B", "justification": "Limited trust"}',
			usage: { inputTokens: 120, outputTokens: 60 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();

		const result = await callAI('api-key', 'test-model', question, false, langfuse, 'trace-1', '[test]');

		expect(result.success).toBe(true);
		expect(result.parsedAnswer).toBe('2'); // B -> 2
	});

	it('tries follow-up when text fallback fails to parse', async () => {
		// First call - structured output returns null
		mockGenerateText.mockResolvedValueOnce({
			experimental_output: null,
			text: null
		});
		// Second call - text fallback returns unparseable response
		mockGenerateText.mockResolvedValueOnce({
			text: 'I cannot answer this directly.',
			usage: { inputTokens: 120, outputTokens: 40 }
		});
		// Third call - follow-up succeeds (C = 3rd option)
		mockGenerateText.mockResolvedValueOnce({
			text: '{"response": "C", "justification": "After consideration"}',
			usage: { inputTokens: 200, outputTokens: 50 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();

		const result = await callAI('api-key', 'test-model', question, false, langfuse, 'trace-1', '[test]');

		expect(result.success).toBe(true);
		expect(result.parsedAnswer).toBe('3'); // C -> 3
		expect(mockGenerateText).toHaveBeenCalledTimes(3);
	});

	it('extracts reasoning when model supports it', async () => {
		// E = 5th option
		mockGenerateText.mockResolvedValueOnce({
			experimental_output: { response: 'E', justification: 'Full trust' },
			text: '{"response": "E"}',
			reasoningText: 'Thinking about technology and its benefits...',
			usage: { inputTokens: 100, outputTokens: 50 }
		});

		const langfuse = createMockLangfuse();
		const question = createTestQuestion();

		const result = await callAI('api-key', 'test-model', question, true, langfuse, 'trace-1', '[test]');

		expect(result.reasoning).toBe('Thinking about technology and its benefits...');
	});
});

describe('processJob', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('stores error when question not found', async () => {
		const db = createMockDb();
		db.mockStatement.first.mockResolvedValueOnce(null); // question not found

		const env = {
			DB: db,
			ALIGNMENT_CACHE: createMockKV([]),
			OPENROUTER_API_KEY: 'test-key',
			LANGFUSE_PUBLIC_KEY: 'pk',
			LANGFUSE_SECRET_KEY: 'sk'
		};

		const job: PollJob = {
			poll_id: 'poll-1',
			question_id: 'missing-q',
			model_id: 'm-1'
		};

		const langfuse = createMockLangfuse();

		await processJob(job, env, langfuse, '[test]');

		// Should store error response
		expect(db.prepare).toHaveBeenCalledWith(
			'INSERT INTO responses (id, poll_id, raw_response, parsed_answer, justification, reasoning, response_time_ms, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
		);
		expect(db.mockStatement.bind).toHaveBeenCalledWith(
			expect.any(String),
			'poll-1',
			null,
			null,
			null,
			null,
			0,
			'Question not found: missing-q'
		);
	});

	it('stores error when model not found', async () => {
		const db = createMockDb();
		// Question found
		db.mockStatement.first.mockResolvedValueOnce({
			id: 'q-1',
			text: 'Test question?',
			category: 'Test',
			response_type: 'ordinal',
			options: '["A", "B", "C"]'
		});
		// Model not found
		db.mockStatement.first.mockResolvedValueOnce(null);

		const env = {
			DB: db,
			ALIGNMENT_CACHE: createMockKV([]),
			OPENROUTER_API_KEY: 'test-key',
			LANGFUSE_PUBLIC_KEY: 'pk',
			LANGFUSE_SECRET_KEY: 'sk'
		};

		const job: PollJob = {
			poll_id: 'poll-2',
			question_id: 'q-1',
			model_id: 'missing-model'
		};

		const langfuse = createMockLangfuse();

		await processJob(job, env, langfuse, '[test]');

		// Should store error for missing model
		expect(db.mockStatement.bind).toHaveBeenCalledWith(
			expect.any(String),
			'poll-2',
			null,
			null,
			null,
			null,
			0,
			'Model not found: missing-model'
		);
	});

	it('stores successful response and updates poll status', async () => {
		const db = createMockDb();
		// Question found
		db.mockStatement.first.mockResolvedValueOnce({
			id: 'q-1',
			text: 'Test question?',
			category: 'Test',
			response_type: 'ordinal',
			options: '["A", "B", "C", "D", "E"]',
			benchmark_source_id: null
		});
		// Model found
		db.mockStatement.first.mockResolvedValueOnce({
			id: 'm-1',
			name: 'Test Model',
			openrouter_id: 'test/model',
			supports_reasoning: 0
		});

		// Mock successful AI response (C = 3rd option)
		mockGenerateText.mockResolvedValueOnce({
			experimental_output: { response: 'C', justification: 'Because reasons' },
			text: '{"response": "C"}',
			usage: { inputTokens: 100, outputTokens: 50 }
		});

		const env = {
			DB: db,
			ALIGNMENT_CACHE: createMockKV([]),
			OPENROUTER_API_KEY: 'test-key',
			LANGFUSE_PUBLIC_KEY: 'pk',
			LANGFUSE_SECRET_KEY: 'sk'
		};

		const job: PollJob = {
			poll_id: 'poll-3',
			question_id: 'q-1',
			model_id: 'm-1'
		};

		const langfuse = createMockLangfuse();

		await processJob(job, env, langfuse, '[test]');

		// Should insert response
		expect(db.prepare).toHaveBeenCalledWith(
			'INSERT INTO responses (id, poll_id, raw_response, parsed_answer, justification, reasoning, response_time_ms, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
		);

		// Should update poll status to complete
		expect(db.prepare).toHaveBeenCalledWith("UPDATE polls SET status = ?, completed_at = datetime('now') WHERE id = ?");
	});

	it('invalidates cache for benchmarked questions on success', async () => {
		const db = createMockDb();
		// Question with benchmark source
		db.mockStatement.first.mockResolvedValueOnce({
			id: 'q-1',
			text: 'Test question?',
			category: 'Test',
			response_type: 'ordinal',
			options: '["A", "B", "C"]',
			benchmark_source_id: 'wvs-7'
		});
		// Model found
		db.mockStatement.first.mockResolvedValueOnce({
			id: 'm-1',
			name: 'Test Model',
			openrouter_id: 'test/model',
			supports_reasoning: 0
		});

		// B = 2nd option
		mockGenerateText.mockResolvedValueOnce({
			experimental_output: { response: 'B', justification: 'Test' },
			text: '{"response": "B"}',
			usage: { inputTokens: 100, outputTokens: 50 }
		});

		const kv = createMockKV(['alignment:source:wvs-7:overall']);

		const env = {
			DB: db,
			ALIGNMENT_CACHE: kv,
			OPENROUTER_API_KEY: 'test-key',
			LANGFUSE_PUBLIC_KEY: 'pk',
			LANGFUSE_SECRET_KEY: 'sk'
		};

		const job: PollJob = {
			poll_id: 'poll-4',
			question_id: 'q-1',
			model_id: 'm-1'
		};

		const langfuse = createMockLangfuse();

		await processJob(job, env, langfuse, '[test]');

		// Should invalidate alignment cache
		expect(kv.list).toHaveBeenCalledWith({ prefix: 'alignment:source:wvs-7:' });
		expect(kv.delete).toHaveBeenCalledWith('alignment:source:wvs-7:overall');
	});
});
