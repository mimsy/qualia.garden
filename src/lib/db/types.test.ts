// ABOUTME: Tests for database type utilities.
// ABOUTME: Covers option parsing, label conversion, and statistical functions.

import { describe, it, expect } from 'vitest';
import { parseOptions, getOptionLabel, getOptionKey, parseDistribution, computeMedian, computeMode } from './types';

describe('parseOptions', () => {
	it('parses valid JSON array', () => {
		const result = parseOptions('["Yes", "No", "Maybe"]');
		expect(result).toEqual(['Yes', 'No', 'Maybe']);
	});

	it('parses empty array', () => {
		const result = parseOptions('[]');
		expect(result).toEqual([]);
	});

	it('returns null for null input', () => {
		expect(parseOptions(null)).toBeNull();
	});

	it('parses complex options', () => {
		const result = parseOptions('["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]');
		expect(result).toHaveLength(5);
		expect(result?.[0]).toBe('Strongly disagree');
		expect(result?.[4]).toBe('Strongly agree');
	});
});

describe('getOptionLabel', () => {
	const options = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];

	it('converts 1-based key to label', () => {
		expect(getOptionLabel(options, '1')).toBe('Strongly disagree');
		expect(getOptionLabel(options, '3')).toBe('Neutral');
		expect(getOptionLabel(options, '5')).toBe('Strongly agree');
	});

	it('returns key for out-of-range index', () => {
		expect(getOptionLabel(options, '0')).toBe('0');
		expect(getOptionLabel(options, '6')).toBe('6');
		expect(getOptionLabel(options, '-1')).toBe('-1');
	});

	it('returns key for null options', () => {
		expect(getOptionLabel(null, '2')).toBe('2');
	});

	it('handles non-numeric keys', () => {
		expect(getOptionLabel(options, 'abc')).toBe('abc');
	});
});

describe('getOptionKey', () => {
	const options = ['Yes', 'No', 'Maybe'];

	it('converts label to 1-based key', () => {
		expect(getOptionKey(options, 'Yes')).toBe('1');
		expect(getOptionKey(options, 'No')).toBe('2');
		expect(getOptionKey(options, 'Maybe')).toBe('3');
	});

	it('returns label for unknown option', () => {
		expect(getOptionKey(options, 'Unknown')).toBe('Unknown');
	});

	it('returns label for null options', () => {
		expect(getOptionKey(null, 'Test')).toBe('Test');
	});

	it('is case-sensitive', () => {
		expect(getOptionKey(options, 'yes')).toBe('yes');
		expect(getOptionKey(options, 'YES')).toBe('YES');
	});
});

describe('parseDistribution', () => {
	it('parses valid distribution JSON', () => {
		const result = parseDistribution('{"1": 100, "2": 200, "3": 150}');
		expect(result).toEqual({ '1': 100, '2': 200, '3': 150 });
	});

	it('parses empty distribution', () => {
		const result = parseDistribution('{}');
		expect(result).toEqual({});
	});

	it('handles string keys with spaces', () => {
		const result = parseDistribution('{"Option A": 50, "Option B": 50}');
		expect(result).toEqual({ 'Option A': 50, 'Option B': 50 });
	});
});

describe('computeMedian', () => {
	it('returns median for odd count', () => {
		expect(computeMedian(['1', '2', '3', '4', '5'])).toBe('3');
	});

	it('returns rounded median for even count', () => {
		// [1,2,3,4] -> median is (2+3)/2 = 2.5, rounded to 3
		expect(computeMedian(['1', '2', '3', '4'])).toBe('3');
	});

	it('handles unsorted input', () => {
		expect(computeMedian(['5', '1', '3', '4', '2'])).toBe('3');
	});

	it('returns null for empty array', () => {
		expect(computeMedian([])).toBeNull();
	});

	it('returns single value for single element', () => {
		expect(computeMedian(['7'])).toBe('7');
	});

	it('handles duplicate values', () => {
		expect(computeMedian(['2', '2', '2', '2', '5'])).toBe('2');
	});

	it('handles two elements', () => {
		// [1,2] -> (1+2)/2 = 1.5, rounded to 2
		expect(computeMedian(['1', '2'])).toBe('2');
	});

	it('handles two same elements', () => {
		expect(computeMedian(['3', '3'])).toBe('3');
	});
});

describe('computeMode', () => {
	it('returns most frequent value', () => {
		expect(computeMode(['1', '2', '2', '3'])).toBe('2');
	});

	it('returns first alphabetically on tie', () => {
		// Both have count 1, '1' < '2' alphabetically
		expect(computeMode(['1', '2'])).toBe('1');
	});

	it('returns null for empty array', () => {
		expect(computeMode([])).toBeNull();
	});

	it('returns single value for single element', () => {
		expect(computeMode(['Yes'])).toBe('Yes');
	});

	it('handles string values', () => {
		expect(computeMode(['Yes', 'No', 'Yes', 'Maybe'])).toBe('Yes');
	});

	it('handles all same values', () => {
		expect(computeMode(['A', 'A', 'A'])).toBe('A');
	});

	it('breaks ties alphabetically', () => {
		// 'A' and 'B' both appear twice, 'A' < 'B'
		expect(computeMode(['A', 'B', 'A', 'B'])).toBe('A');
	});

	it('handles three-way tie', () => {
		// 'A', 'B', 'C' all appear once, 'A' is first alphabetically
		expect(computeMode(['C', 'B', 'A'])).toBe('A');
	});
});
