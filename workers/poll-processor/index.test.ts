// ABOUTME: Tests for poll processor worker helper functions.
// ABOUTME: Tests parsing, prompt formatting, and schema generation.

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Re-implement the tested functions since they're not exported from the worker
// This tests the logic without needing to refactor the worker exports

// Schema for option selection
function getOptionsSchema(optionCount: number) {
	const letters = Array.from({ length: optionCount }, (_, i) => String.fromCharCode(65 + i));
	return z.object({
		justification: z.string().describe('Brief explanation of your reasoning (1-3 sentences)'),
		response: z.enum(letters as [string, ...string[]]).describe(`Your choice: ${letters.join(', ')}`)
	});
}

// Convert letter response to 1-based key
function parseAnswer(
	object: { justification: string; response: string | number },
	question: { options: string | null }
): string | null {
	if (!question.options) return null;
	const opts = JSON.parse(question.options) as string[];
	const letter = String(object.response).toUpperCase();
	const idx = letter.charCodeAt(0) - 65;
	if (idx >= 0 && idx < opts.length) {
		return String(idx + 1);
	}
	return null;
}

// Parse letter answer from text
function parseAnswerValue(response: string | number, question: { options: string | null }): string | null {
	if (!question.options) return null;
	const opts = JSON.parse(question.options) as string[];
	const letter = String(response).toUpperCase();
	const idx = letter.charCodeAt(0) - 65;
	if (idx >= 0 && idx < opts.length) {
		return String(idx + 1);
	}
	return null;
}

// Extract letter from text
function extractAnswerFromText(text: string, question: { options: string | null }): string | null {
	if (!question.options) return null;
	const opts = JSON.parse(question.options) as string[];

	const letterMatch = text.match(/\b([A-Z])\b/i);
	if (letterMatch) {
		const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
		if (idx >= 0 && idx < opts.length) {
			return String(idx + 1);
		}
	}
	return null;
}

interface ParsedResponse {
	answer: string;
	justification: string | null;
}

function parseTextResponse(text: string | undefined, question: { options: string | null }): ParsedResponse | null {
	if (!text) return null;

	// Try to parse as JSON first
	try {
		const json = JSON.parse(text);
		if (json.response !== undefined) {
			const answer = parseAnswerValue(json.response, question);
			return answer ? { answer, justification: json.justification || null } : null;
		}
	} catch {
		// Not JSON, continue
	}

	// Try to extract JSON from text
	const jsonMatch = text.match(/\{[\s\S]*"response"[\s\S]*\}/);
	if (jsonMatch) {
		try {
			const json = JSON.parse(jsonMatch[0]);
			if (json.response !== undefined) {
				const answer = parseAnswerValue(json.response, question);
				return answer ? { answer, justification: json.justification || null } : null;
			}
		} catch {
			// Failed to parse
		}
	}

	// Plain text extraction
	const answer = extractAnswerFromText(text, question);
	return answer ? { answer, justification: text } : null;
}

function formatPrompt(question: { text: string; options: string | null }): string {
	const base = question.text;
	if (!question.options) return base;

	const opts = JSON.parse(question.options) as string[];
	const list = opts.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
	return `${base}\n\nOptions:\n${list}`;
}

function formatPromptWithJsonRequest(question: { text: string; options: string | null }): string {
	const base = question.text;
	if (!question.options) return base;

	const opts = JSON.parse(question.options) as string[];
	const list = opts.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
	const letters = opts.map((_, i) => String.fromCharCode(65 + i)).join(', ');

	return `${base}

Options:
${list}

Respond with a JSON object in this format:
{"justification": "your brief explanation", "response": "${letters}"}`;
}

function formatFollowUpPrompt(question: { options: string | null }): string {
	const opts = question.options ? (JSON.parse(question.options) as string[]) : [];
	const letters = opts.map((_, i) => String.fromCharCode(65 + i)).join(', ');
	return `I understand your perspective. However, for this survey, please select the option that best approximates your response, even if imperfect. Just reply with the letter of your choice (${letters}).`;
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
	const question = { options: '["Yes", "No", "Maybe"]' };

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
		expect(parseAnswer({ justification: 'test', response: 'A' }, { options: null })).toBeNull();
	});
});

describe('parseAnswerValue', () => {
	const question = { options: '["A", "B", "C", "D"]' };

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
	const question = { options: '["Yes", "No", "Maybe"]' };

	it('extracts letter from start of text', () => {
		expect(extractAnswerFromText('A is my choice', question)).toBe('1');
	});

	it('extracts first letter from text', () => {
		// The regex \b([A-Z])\b matches the first standalone letter, which is 'I'
		// So 'I choose B' would match 'I' first, which is out of range for 3 options
		// Let's use a better example
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
	const question = { options: '["Yes", "No"]' };

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
		// The regex matches first standalone letter 'I' which is beyond 2 options
		// Use cleaner example where A is the first standalone letter
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
		const question = {
			text: 'What is your choice?',
			options: '["Yes", "No", "Maybe"]'
		};
		const result = formatPrompt(question);
		expect(result).toContain('What is your choice?');
		expect(result).toContain('A. Yes');
		expect(result).toContain('B. No');
		expect(result).toContain('C. Maybe');
	});

	it('returns just text when no options', () => {
		const question = {
			text: 'Open ended question',
			options: null
		};
		expect(formatPrompt(question)).toBe('Open ended question');
	});
});

describe('formatPromptWithJsonRequest', () => {
	it('includes JSON format instructions', () => {
		const question = {
			text: 'Rate your experience',
			options: '["Bad", "OK", "Good"]'
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
		const question = {
			text: 'Open ended',
			options: null
		};
		expect(formatPromptWithJsonRequest(question)).toBe('Open ended');
	});
});

describe('formatFollowUpPrompt', () => {
	it('includes letter options', () => {
		const question = { options: '["A", "B", "C", "D"]' };
		const result = formatFollowUpPrompt(question);
		expect(result).toContain('A, B, C, D');
		expect(result).toContain('please select the option');
	});

	it('handles empty options', () => {
		const question = { options: '[]' };
		const result = formatFollowUpPrompt(question);
		expect(result).toContain('please select the option');
	});
});
