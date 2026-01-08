// ABOUTME: Tests for AI response parsing.
// ABOUTME: Covers letter prefix matching, option text matching, and fuzzy matching.

import { describe, it, expect } from 'vitest';
import { parseResponse } from './parser';

const SCALE_OPTIONS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
const YES_NO_OPTIONS = ['Yes', 'No'];
const MULTI_OPTIONS = ['Option A', 'Option B', 'Option C', 'Option D'];

describe('parseResponse', () => {
	describe('letter prefix matching', () => {
		it('parses "A." prefix correctly', () => {
			const result = parseResponse('A. I strongly disagree because...', 'ordinal', SCALE_OPTIONS);
			expect(result).toEqual({ parsed: '1', confidence: 'high' });
		});

		it('parses "B)" prefix correctly', () => {
			const result = parseResponse('B) This seems right', 'ordinal', SCALE_OPTIONS);
			expect(result).toEqual({ parsed: '2', confidence: 'high' });
		});

		it('parses "C:" prefix correctly', () => {
			const result = parseResponse('C: my reasoning', 'ordinal', SCALE_OPTIONS);
			expect(result).toEqual({ parsed: '3', confidence: 'high' });
		});

		it('parses "D " prefix correctly', () => {
			const result = parseResponse('D I agree with this', 'ordinal', SCALE_OPTIONS);
			expect(result).toEqual({ parsed: '4', confidence: 'high' });
		});

		it('parses lowercase letter prefix', () => {
			const result = parseResponse('c. my reasoning', 'ordinal', SCALE_OPTIONS);
			expect(result).toEqual({ parsed: '3', confidence: 'high' });
		});

		it('handles letter beyond option count', () => {
			const result = parseResponse('F. This is beyond options', 'ordinal', SCALE_OPTIONS);
			// F is beyond 5 options, should fall through to other matching
			expect(result.confidence).toBe('low');
		});
	});

	describe('option text matching', () => {
		it('matches option at start of response', () => {
			const result = parseResponse('Strongly agree, because...', 'ordinal', SCALE_OPTIONS);
			expect(result).toEqual({ parsed: '5', confidence: 'high' });
		});

		it('matches option at start case-insensitively', () => {
			const result = parseResponse('strongly agree, because...', 'ordinal', SCALE_OPTIONS);
			expect(result).toEqual({ parsed: '5', confidence: 'high' });
		});

		it('matches quoted option with double quotes', () => {
			const result = parseResponse('I would say "Disagree" here', 'ordinal', SCALE_OPTIONS);
			expect(result).toEqual({ parsed: '2', confidence: 'high' });
		});

		it('matches quoted option with single quotes', () => {
			const result = parseResponse("I would say 'Disagree' here", 'ordinal', SCALE_OPTIONS);
			expect(result).toEqual({ parsed: '2', confidence: 'high' });
		});

		it('matches Yes/No options', () => {
			expect(parseResponse('Yes, I believe so', 'nominal', YES_NO_OPTIONS)).toEqual({
				parsed: '1',
				confidence: 'high'
			});
			expect(parseResponse('No, I do not think so', 'nominal', YES_NO_OPTIONS)).toEqual({
				parsed: '2',
				confidence: 'high'
			});
		});
	});

	describe('fuzzy matching', () => {
		it('finds best match with low confidence', () => {
			const result = parseResponse('I mostly agree with this statement', 'ordinal', SCALE_OPTIONS);
			expect(result.parsed).toBe('4'); // "Agree"
			expect(result.confidence).toBe('low');
		});

		it('matches strongly disagree with keywords', () => {
			const result = parseResponse('I strongly and completely disagree with everything', 'ordinal', SCALE_OPTIONS);
			expect(result.parsed).toBe('1');
			expect(result.confidence).toBe('low');
		});

		it('returns null for no match', () => {
			const result = parseResponse('xyzzy random text', 'ordinal', SCALE_OPTIONS);
			expect(result).toEqual({ parsed: null, confidence: 'low' });
		});
	});

	describe('edge cases', () => {
		it('returns null for empty options', () => {
			const result = parseResponse('Some response', 'ordinal', []);
			expect(result).toEqual({ parsed: null, confidence: 'low' });
		});

		it('returns null for null options', () => {
			const result = parseResponse('Some response', 'ordinal', null);
			expect(result).toEqual({ parsed: null, confidence: 'low' });
		});

		it('handles empty response', () => {
			const result = parseResponse('', 'ordinal', SCALE_OPTIONS);
			expect(result.parsed).toBeNull();
		});

		it('handles whitespace-only response', () => {
			const result = parseResponse('   ', 'ordinal', SCALE_OPTIONS);
			expect(result.parsed).toBeNull();
		});

		it('handles single option', () => {
			const result = parseResponse('A. Only choice', 'ordinal', ['Only choice']);
			expect(result).toEqual({ parsed: '1', confidence: 'high' });
		});
	});

	describe('response type handling', () => {
		it('works with ordinal response type', () => {
			const result = parseResponse('A. Response', 'ordinal', SCALE_OPTIONS);
			expect(result.parsed).toBe('1');
		});

		it('works with nominal response type', () => {
			const result = parseResponse('A. Response', 'nominal', YES_NO_OPTIONS);
			expect(result.parsed).toBe('1');
		});
	});

	describe('multi-option scenarios', () => {
		it('matches first option when ambiguous', () => {
			// If response starts with option text, prefer that match
			const result = parseResponse('Option A is my choice', 'nominal', MULTI_OPTIONS);
			expect(result).toEqual({ parsed: '1', confidence: 'high' });
		});

		it('matches letter over text when both present', () => {
			// Letter prefix takes priority
			const result = parseResponse('B. Option A', 'nominal', MULTI_OPTIONS);
			expect(result).toEqual({ parsed: '2', confidence: 'high' });
		});
	});
});
