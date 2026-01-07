// ABOUTME: Parses AI model responses into structured answers.
// ABOUTME: Returns 1-based keys ("1", "2", "3"...) for both ordinal and nominal types.

import type { ResponseType, QuestionOptions } from '$lib/db/types';

export interface ParseResult {
	parsed: string | null;
	confidence: 'high' | 'low';
}

// Parse response and return 1-based key (e.g., "1", "2", "3")
export function parseResponse(
	rawResponse: string,
	responseType: ResponseType,
	options: QuestionOptions | null
): ParseResult {
	if (!options || options.length === 0) {
		return { parsed: null, confidence: 'low' };
	}

	const normalized = rawResponse.toLowerCase();

	// Check for letter prefix (A, B, C, D, etc.)
	const letterMatch = rawResponse.match(/^[A-Z][.):\s]/i);
	if (letterMatch) {
		const letterIndex = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
		if (letterIndex >= 0 && letterIndex < options.length) {
			// Return 1-based key
			return { parsed: String(letterIndex + 1), confidence: 'high' };
		}
	}

	// Check for option text match and return its 1-based key
	for (let i = 0; i < options.length; i++) {
		const optionLower = options[i].toLowerCase();
		// Exact match at start of response
		if (normalized.startsWith(optionLower)) {
			return { parsed: String(i + 1), confidence: 'high' };
		}
		// Option quoted in response
		if (normalized.includes(`"${optionLower}"`) || normalized.includes(`'${optionLower}'`)) {
			return { parsed: String(i + 1), confidence: 'high' };
		}
	}

	// Fuzzy match - find best matching option
	let bestMatchIndex = -1;
	let bestScore = 0;

	for (let i = 0; i < options.length; i++) {
		const optionLower = options[i].toLowerCase();
		const words = optionLower.split(/\s+/);
		const matchingWords = words.filter((word) => word.length > 3 && normalized.includes(word));
		const score = matchingWords.length / words.length;

		if (score > bestScore && score >= 0.5) {
			bestScore = score;
			bestMatchIndex = i;
		}
	}

	if (bestMatchIndex >= 0) {
		return { parsed: String(bestMatchIndex + 1), confidence: 'low' };
	}

	return { parsed: null, confidence: 'low' };
}
