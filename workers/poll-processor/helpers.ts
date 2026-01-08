// ABOUTME: Helper functions for poll processor worker.
// ABOUTME: Contains parsing, formatting, and schema generation utilities.

import { z } from 'zod';

export interface Question {
	id: string;
	text: string;
	category: string | null;
	response_type: 'ordinal' | 'nominal';
	options: string | null;
	benchmark_source_id: string | null;
}

export interface ParsedResponse {
	answer: string;
	justification: string | null;
}

// Schema for option selection (both ordinal and nominal use letter choices)
export function getOptionsSchema(optionCount: number) {
	const letters = Array.from({ length: optionCount }, (_, i) => String.fromCharCode(65 + i));
	return z.object({
		justification: z.string().describe('Brief explanation of your reasoning (1-3 sentences)'),
		response: z.enum(letters as [string, ...string[]]).describe(`Your choice: ${letters.join(', ')}`)
	});
}

// Get schema based on question options
export function getSchema(question: Question) {
	const opts = question.options ? (JSON.parse(question.options) as string[]) : [];
	return getOptionsSchema(opts.length || 4);
}

// Convert letter response (A, B, C) to 1-based key ("1", "2", "3")
export function parseAnswer(
	object: { justification: string; response: string | number },
	question: Question
): string | null {
	if (!question.options) return null;
	const opts = JSON.parse(question.options) as string[];
	const letter = String(object.response).toUpperCase();
	const idx = letter.charCodeAt(0) - 65;
	if (idx >= 0 && idx < opts.length) {
		return String(idx + 1); // Return 1-based key
	}
	return null;
}

// Convert letter response to 1-based key
export function parseAnswerValue(response: string | number, question: Question): string | null {
	if (!question.options) return null;
	const opts = JSON.parse(question.options) as string[];
	const letter = String(response).toUpperCase();
	const idx = letter.charCodeAt(0) - 65;
	if (idx >= 0 && idx < opts.length) {
		return String(idx + 1); // Return 1-based key
	}
	return null;
}

// Extract letter answer from text and convert to 1-based key
export function extractAnswerFromText(text: string, question: Question): string | null {
	if (!question.options) return null;
	const opts = JSON.parse(question.options) as string[];

	// Look for letter answer like "A" or "B"
	const letterMatch = text.match(/\b([A-Z])\b/i);
	if (letterMatch) {
		const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
		if (idx >= 0 && idx < opts.length) {
			return String(idx + 1); // Return 1-based key
		}
	}
	return null;
}

// Parse text response to extract answer and justification
export function parseTextResponse(text: string | undefined, question: Question): ParsedResponse | null {
	if (!text) return null;

	// Try to parse as JSON first
	try {
		const json = JSON.parse(text);
		if (json.response !== undefined) {
			const answer = parseAnswerValue(json.response, question);
			return answer ? { answer, justification: json.justification || null } : null;
		}
	} catch {
		// Not JSON, continue to text parsing
	}

	// Try to extract JSON from text (models sometimes wrap JSON in markdown)
	const jsonMatch = text.match(/\{[\s\S]*"response"[\s\S]*\}/);
	if (jsonMatch) {
		try {
			const json = JSON.parse(jsonMatch[0]);
			if (json.response !== undefined) {
				const answer = parseAnswerValue(json.response, question);
				return answer ? { answer, justification: json.justification || null } : null;
			}
		} catch {
			// Failed to parse extracted JSON
		}
	}

	// Plain text extraction based on question type
	const answer = extractAnswerFromText(text, question);
	return answer ? { answer, justification: text } : null;
}

// Format prompt with options
export function formatPrompt(question: Question): string {
	const base = question.text;
	if (!question.options) return base;

	const opts = JSON.parse(question.options) as string[];
	const list = opts.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
	return `${base}\n\nOptions:\n${list}`;
}

// Format prompt with JSON request
export function formatPromptWithJsonRequest(question: Question): string {
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

// Format follow-up prompt
export function formatFollowUpPrompt(question: Question): string {
	const opts = question.options ? (JSON.parse(question.options) as string[]) : [];
	const letters = opts.map((_, i) => String.fromCharCode(65 + i)).join(', ');
	return `I understand your perspective. However, for this survey, please select the option that best approximates your response, even if imperfect. Just reply with the letter of your choice (${letters}).`;
}

// Generate random ID
export function generateId(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 12; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}
