// ABOUTME: Tests for prompt formatting.
// ABOUTME: Covers system prompt generation and option formatting.

import { describe, it, expect } from 'vitest';
import { formatPollMessages } from './prompts';
import type { Question } from '$lib/db/types';

function createQuestion(overrides: Partial<Question> = {}): Question {
	return {
		id: 'test-q',
		text: 'Do you believe AI can be conscious?',
		category: 'Consciousness',
		response_type: 'ordinal',
		options: JSON.stringify(['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']),
		active: true,
		status: 'published',
		created_at: '2024-01-01T00:00:00Z',
		benchmark_source_id: null,
		benchmark_question_id: null,
		...overrides
	};
}

describe('formatPollMessages', () => {
	it('returns system and user messages', () => {
		const question = createQuestion();
		const messages = formatPollMessages(question);

		expect(messages).toHaveLength(2);
		expect(messages[0].role).toBe('system');
		expect(messages[1].role).toBe('user');
	});

	it('includes survey context in system prompt', () => {
		const question = createQuestion();
		const messages = formatPollMessages(question);

		expect(messages[0].content).toContain('survey');
		expect(messages[0].content).toContain('AI');
	});

	it('includes question text in user prompt', () => {
		const question = createQuestion({
			text: 'What is your favorite color?'
		});
		const messages = formatPollMessages(question);

		expect(messages[1].content).toContain('What is your favorite color?');
	});

	it('formats options with letter prefixes', () => {
		const question = createQuestion({
			options: JSON.stringify(['Red', 'Blue', 'Green'])
		});
		const messages = formatPollMessages(question);

		expect(messages[1].content).toContain('A. Red');
		expect(messages[1].content).toContain('B. Blue');
		expect(messages[1].content).toContain('C. Green');
	});

	it('includes instruction to respond with letter', () => {
		const question = createQuestion();
		const messages = formatPollMessages(question);

		expect(messages[1].content).toContain('letter');
		expect(messages[1].content).toMatch(/A, B, C/i);
	});

	it('handles question with no options', () => {
		const question = createQuestion({ options: null });
		const messages = formatPollMessages(question);

		expect(messages[1].content).toBe(question.text);
	});

	it('handles question with empty options array', () => {
		const question = createQuestion({ options: '[]' });
		const messages = formatPollMessages(question);

		expect(messages[1].content).toBe(question.text);
	});

	it('handles yes/no options', () => {
		const question = createQuestion({
			response_type: 'nominal',
			options: JSON.stringify(['Yes', 'No'])
		});
		const messages = formatPollMessages(question);

		expect(messages[1].content).toContain('A. Yes');
		expect(messages[1].content).toContain('B. No');
	});

	it('handles many options', () => {
		const options = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
		const question = createQuestion({
			options: JSON.stringify(options)
		});
		const messages = formatPollMessages(question);

		expect(messages[1].content).toContain('A. A');
		expect(messages[1].content).toContain('J. J');
	});
});
