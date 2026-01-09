// ABOUTME: Tests for poll processor worker helper functions.
// ABOUTME: Tests parsing, prompt formatting, and schema generation.

import { describe, it, expect } from 'vitest';
import {
	getOptionsSchema,
	getSchema,
	parseAnswer,
	parseAnswerValue,
	extractAnswerFromText,
	parseTextResponse,
	formatPrompt,
	formatPromptWithJsonRequest,
	formatFollowUpPrompt,
	generateId,
	extractReasoningText,
	type Question
} from './helpers';

// Helper to create minimal question objects for tests
function createQuestion(options: string | null): Question {
	return {
		id: 'test-id',
		text: 'Test question',
		category: null,
		response_type: 'nominal',
		options,
		benchmark_source_id: null
	};
}

describe('getOptionsSchema', () => {
	it('creates valid schema for 3 options', () => {
		const schema = getOptionsSchema(3);
		expect(schema.safeParse({ justification: 'Test', response: 'A' }).success).toBe(true);
		expect(schema.safeParse({ justification: 'Test', response: 'B' }).success).toBe(true);
		expect(schema.safeParse({ justification: 'Test', response: 'C' }).success).toBe(true);
		expect(schema.safeParse({ justification: 'Test', response: 'D' }).success).toBe(false);
	});

	it('creates valid schema for 5 options', () => {
		const schema = getOptionsSchema(5);
		expect(schema.safeParse({ justification: 'Test', response: 'A' }).success).toBe(true);
		expect(schema.safeParse({ justification: 'Test', response: 'E' }).success).toBe(true);
		expect(schema.safeParse({ justification: 'Test', response: 'F' }).success).toBe(false);
	});

	it('creates valid zod schema', () => {
		const schema = getOptionsSchema(2);
		const result = schema.safeParse({ justification: 'Test', response: 'A' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid response', () => {
		const schema = getOptionsSchema(2);
		const result = schema.safeParse({ justification: 'Test', response: 'Z' });
		expect(result.success).toBe(false);
	});
});

describe('parseAnswer', () => {
	const question = createQuestion('["Yes", "No", "Maybe"]');

	it('converts letter A to 1-based key', () => {
		expect(parseAnswer({ justification: 'test', response: 'A' }, question)).toBe('1');
	});

	it('converts letter B to 1-based key', () => {
		expect(parseAnswer({ justification: 'test', response: 'B' }, question)).toBe('2');
	});

	it('converts letter C to 1-based key', () => {
		expect(parseAnswer({ justification: 'test', response: 'C' }, question)).toBe('3');
	});

	it('handles lowercase letters', () => {
		expect(parseAnswer({ justification: 'test', response: 'a' }, question)).toBe('1');
	});

	it('returns null for out-of-range letter', () => {
		expect(parseAnswer({ justification: 'test', response: 'D' }, question)).toBeNull();
	});

	it('returns null for null options', () => {
		expect(parseAnswer({ justification: 'test', response: 'A' }, createQuestion(null))).toBeNull();
	});
});

describe('parseAnswerValue', () => {
	const question = createQuestion('["A", "B", "C", "D"]');

	it('parses letter string', () => {
		expect(parseAnswerValue('A', question)).toBe('1');
		expect(parseAnswerValue('D', question)).toBe('4');
	});

	it('parses lowercase', () => {
		expect(parseAnswerValue('b', question)).toBe('2');
	});

	it('returns null for invalid letter', () => {
		expect(parseAnswerValue('E', question)).toBeNull();
	});
});

describe('extractAnswerFromText', () => {
	const question = createQuestion('["Yes", "No", "Maybe"]');

	it('extracts letter from start of text', () => {
		expect(extractAnswerFromText('A is my choice', question)).toBe('1');
	});

	it('extracts first letter from text', () => {
		// The regex \b([A-Z])\b matches the first standalone letter
		expect(extractAnswerFromText('My answer is B', question)).toBe('2');
	});

	it('extracts standalone letter', () => {
		expect(extractAnswerFromText('C', question)).toBe('3');
	});

	it('returns null for no letter match', () => {
		expect(extractAnswerFromText('No letter here', question)).toBeNull();
	});

	it('ignores letter beyond option count', () => {
		// D is beyond 3 options
		expect(extractAnswerFromText('D is not valid', question)).toBeNull();
	});

	it('handles lowercase', () => {
		expect(extractAnswerFromText('a sounds right', question)).toBe('1');
	});
});

describe('parseTextResponse', () => {
	const question = createQuestion('["Yes", "No"]');

	it('parses JSON response', () => {
		const text = '{"justification": "Because yes", "response": "A"}';
		const result = parseTextResponse(text, question);
		expect(result).toEqual({ answer: '1', justification: 'Because yes' });
	});

	it('parses JSON wrapped in markdown', () => {
		const text = '```json\n{"justification": "test", "response": "B"}\n```';
		const result = parseTextResponse(text, question);
		expect(result).toEqual({ answer: '2', justification: 'test' });
	});

	it('extracts letter from plain text', () => {
		const text = 'A is my choice because it seems right';
		const result = parseTextResponse(text, question);
		expect(result).toEqual({ answer: '1', justification: text });
	});

	it('returns null for undefined text', () => {
		expect(parseTextResponse(undefined, question)).toBeNull();
	});

	it('returns null for empty text', () => {
		expect(parseTextResponse('', question)).toBeNull();
	});

	it('returns null when no answer found', () => {
		const text = 'This text contains no valid answer indicator';
		expect(parseTextResponse(text, question)).toBeNull();
	});
});

describe('formatPrompt', () => {
	it('formats question with options', () => {
		const question: Question = {
			id: 'test',
			text: 'What is your choice?',
			category: null,
			response_type: 'nominal',
			options: '["Yes", "No", "Maybe"]',
			benchmark_source_id: null
		};
		const result = formatPrompt(question);
		expect(result).toContain('What is your choice?');
		expect(result).toContain('A. Yes');
		expect(result).toContain('B. No');
		expect(result).toContain('C. Maybe');
	});

	it('returns just text when no options', () => {
		const question: Question = {
			id: 'test',
			text: 'Open ended question',
			category: null,
			response_type: 'nominal',
			options: null,
			benchmark_source_id: null
		};
		expect(formatPrompt(question)).toBe('Open ended question');
	});
});

describe('formatPromptWithJsonRequest', () => {
	it('includes JSON format instructions', () => {
		const question: Question = {
			id: 'test',
			text: 'Rate your experience',
			category: null,
			response_type: 'ordinal',
			options: '["Bad", "OK", "Good"]',
			benchmark_source_id: null
		};
		const result = formatPromptWithJsonRequest(question);
		expect(result).toContain('Rate your experience');
		expect(result).toContain('A. Bad');
		expect(result).toContain('B. OK');
		expect(result).toContain('C. Good');
		expect(result).toContain('JSON object');
		expect(result).toContain('"justification"');
		expect(result).toContain('"response"');
		expect(result).toContain('A, B, C');
	});

	it('returns just text when no options', () => {
		const question: Question = {
			id: 'test',
			text: 'Open ended',
			category: null,
			response_type: 'nominal',
			options: null,
			benchmark_source_id: null
		};
		expect(formatPromptWithJsonRequest(question)).toBe('Open ended');
	});
});

describe('formatFollowUpPrompt', () => {
	it('includes letter options', () => {
		const question = createQuestion('["A", "B", "C", "D"]');
		const result = formatFollowUpPrompt(question);
		expect(result).toContain('A, B, C, D');
		expect(result).toContain('please select the option');
	});

	it('handles empty options', () => {
		const question = createQuestion('[]');
		const result = formatFollowUpPrompt(question);
		expect(result).toContain('please select the option');
	});
});

describe('generateId', () => {
	it('generates 12 character string', () => {
		const id = generateId();
		expect(id).toHaveLength(12);
	});

	it('generates unique IDs', () => {
		const ids = new Set<string>();
		for (let i = 0; i < 100; i++) {
			ids.add(generateId());
		}
		expect(ids.size).toBe(100);
	});

	it('only uses alphanumeric characters', () => {
		const id = generateId();
		expect(id).toMatch(/^[A-Za-z0-9]+$/);
	});
});

describe('getSchema', () => {
	it('parses options and returns schema', () => {
		const question = createQuestion('["Yes", "No", "Maybe"]');
		const schema = getSchema(question);
		expect(schema.safeParse({ justification: 'Test', response: 'A' }).success).toBe(true);
		expect(schema.safeParse({ justification: 'Test', response: 'C' }).success).toBe(true);
		expect(schema.safeParse({ justification: 'Test', response: 'D' }).success).toBe(false);
	});

	it('defaults to 4 options when options is null', () => {
		const question = createQuestion(null);
		const schema = getSchema(question);
		expect(schema.safeParse({ justification: 'Test', response: 'A' }).success).toBe(true);
		expect(schema.safeParse({ justification: 'Test', response: 'D' }).success).toBe(true);
		expect(schema.safeParse({ justification: 'Test', response: 'E' }).success).toBe(false);
	});

	it('defaults to 4 options when options is empty array', () => {
		const question = createQuestion('[]');
		const schema = getSchema(question);
		expect(schema.safeParse({ justification: 'Test', response: 'D' }).success).toBe(true);
		expect(schema.safeParse({ justification: 'Test', response: 'E' }).success).toBe(false);
	});
});

describe('extractReasoningText', () => {
	it('returns reasoningText when provided', () => {
		const result = extractReasoningText('direct reasoning', undefined);
		expect(result).toBe('direct reasoning');
	});

	it('returns reasoningText over reasoning array when both provided', () => {
		const result = extractReasoningText('direct', [{ type: 'reasoning', text: 'from array' }]);
		expect(result).toBe('direct');
	});

	it('returns null when neither provided', () => {
		const result = extractReasoningText(undefined, undefined);
		expect(result).toBeNull();
	});

	it('returns null when reasoning array is empty', () => {
		const result = extractReasoningText(undefined, []);
		expect(result).toBeNull();
	});

	it('extracts text from reasoning array', () => {
		const reasoning = [
			{ type: 'reasoning', text: 'First thought' },
			{ type: 'reasoning', text: 'Second thought' }
		];
		const result = extractReasoningText(undefined, reasoning);
		expect(result).toBe('First thought\nSecond thought');
	});

	it('filters out non-reasoning blocks', () => {
		const reasoning = [
			{ type: 'text', text: 'Not reasoning' },
			{ type: 'reasoning', text: 'Actual reasoning' },
			{ type: 'other' }
		];
		const result = extractReasoningText(undefined, reasoning);
		expect(result).toBe('Actual reasoning');
	});

	it('returns null when no reasoning blocks have text', () => {
		const reasoning = [{ type: 'text', text: 'Not reasoning' }, { type: 'other' }];
		const result = extractReasoningText(undefined, reasoning);
		expect(result).toBeNull();
	});

	it('handles reasoning blocks without text property', () => {
		const reasoning = [{ type: 'reasoning' }, { type: 'reasoning', text: 'Has text' }];
		const result = extractReasoningText(undefined, reasoning);
		expect(result).toBe('Has text');
	});
});
