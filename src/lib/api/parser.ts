// ABOUTME: Parses AI model responses into structured answers.
// ABOUTME: Handles multiple choice, scale, and yes/no question types.

import type { ResponseType, QuestionOptions } from '$lib/db/types';

export interface ParseResult {
	parsed: string | null;
	confidence: 'high' | 'low';
}

export function parseResponse(
	rawResponse: string,
	responseType: ResponseType,
	options: QuestionOptions | null
): ParseResult {
	const normalized = rawResponse.trim().toLowerCase();

	switch (responseType) {
		case 'yes_no':
			return parseYesNo(normalized);
		case 'scale':
			return parseScale(normalized);
		case 'multiple_choice':
			return parseMultipleChoice(rawResponse, options);
		default:
			return { parsed: null, confidence: 'low' };
	}
}

function parseYesNo(response: string): ParseResult {
	// Look for clear yes/no at the start
	if (response.startsWith('yes')) {
		return { parsed: 'yes', confidence: 'high' };
	}
	if (response.startsWith('no')) {
		return { parsed: 'no', confidence: 'high' };
	}

	// Check for yes/no anywhere in response
	const hasYes = /\byes\b/.test(response);
	const hasNo = /\bno\b/.test(response);

	if (hasYes && !hasNo) {
		return { parsed: 'yes', confidence: 'low' };
	}
	if (hasNo && !hasYes) {
		return { parsed: 'no', confidence: 'low' };
	}

	return { parsed: null, confidence: 'low' };
}

function parseScale(response: string): ParseResult {
	// Look for a number 1-10
	const match = response.match(/\b([1-9]|10)\b/);

	if (match) {
		const num = parseInt(match[1], 10);
		// Higher confidence if the number appears early in response
		const position = response.indexOf(match[0]);
		const confidence = position < 20 ? 'high' : 'low';
		return { parsed: num.toString(), confidence };
	}

	// Try to find written numbers
	const writtenNumbers: Record<string, string> = {
		one: '1',
		two: '2',
		three: '3',
		four: '4',
		five: '5',
		six: '6',
		seven: '7',
		eight: '8',
		nine: '9',
		ten: '10'
	};

	for (const [word, digit] of Object.entries(writtenNumbers)) {
		if (response.includes(word)) {
			return { parsed: digit, confidence: 'low' };
		}
	}

	return { parsed: null, confidence: 'low' };
}

function parseMultipleChoice(response: string, options: QuestionOptions | null): ParseResult {
	if (!options || options.length === 0) {
		return { parsed: null, confidence: 'low' };
	}

	const normalized = response.toLowerCase();

	// Check for letter prefix (A, B, C, D)
	const letterMatch = response.match(/^[A-D][\.\):\s]/i);
	if (letterMatch) {
		const letterIndex = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
		if (letterIndex < options.length) {
			return { parsed: options[letterIndex], confidence: 'high' };
		}
	}

	// Check for option text match
	for (const option of options) {
		const optionLower = option.toLowerCase();
		// Exact match at start of response
		if (normalized.startsWith(optionLower)) {
			return { parsed: option, confidence: 'high' };
		}
		// Option quoted in response
		if (normalized.includes(`"${optionLower}"`) || normalized.includes(`'${optionLower}'`)) {
			return { parsed: option, confidence: 'high' };
		}
	}

	// Fuzzy match - find best matching option
	let bestMatch: string | null = null;
	let bestScore = 0;

	for (const option of options) {
		const optionLower = option.toLowerCase();
		const words = optionLower.split(/\s+/);
		const matchingWords = words.filter((word) => word.length > 3 && normalized.includes(word));
		const score = matchingWords.length / words.length;

		if (score > bestScore && score >= 0.5) {
			bestScore = score;
			bestMatch = option;
		}
	}

	if (bestMatch) {
		return { parsed: bestMatch, confidence: 'low' };
	}

	return { parsed: null, confidence: 'low' };
}
