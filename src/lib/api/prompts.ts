// ABOUTME: Prompt formatting for AI model polling.
// ABOUTME: Generates system and user prompts for different question types.

import type { Question, QuestionOptions } from '$lib/db/types';
import { parseOptions } from '$lib/db/types';
import type { ChatMessage } from './openrouter';

const SYSTEM_PROMPT = `You are participating in a survey about AI beliefs and experiences. Answer the question directly and honestly based on your own perspective. Give your answer first, then you may briefly explain your reasoning.`;

export function formatPollMessages(question: Question): ChatMessage[] {
	const options = parseOptions(question.options);
	const userPrompt = formatUserPrompt(question, options);

	return [
		{ role: 'system', content: SYSTEM_PROMPT },
		{ role: 'user', content: userPrompt }
	];
}

function formatUserPrompt(question: Question, options: QuestionOptions | null): string {
	const baseQuestion = question.text;

	switch (question.response_type) {
		case 'yes_no':
			return `${baseQuestion}\n\nPlease answer with "Yes" or "No" first, then explain briefly.`;

		case 'scale':
			return `${baseQuestion}\n\nPlease respond with a number from 1 to 10 first (where 1 is lowest/least and 10 is highest/most), then explain briefly.`;

		case 'multiple_choice':
			if (!options || options.length === 0) {
				return baseQuestion;
			}
			const optionsList = options
				.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
				.join('\n');
			return `${baseQuestion}\n\nOptions:\n${optionsList}\n\nPlease respond with the letter of your choice (A, B, C, etc.) first, then explain briefly.`;

		default:
			return baseQuestion;
	}
}
