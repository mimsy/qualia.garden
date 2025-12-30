// ABOUTME: TypeScript types matching the D1 database schema.
// ABOUTME: Provides type safety for database operations.

export type ResponseType = 'multiple_choice' | 'scale' | 'yes_no';
export type PollStatus = 'pending' | 'complete' | 'failed';

export interface Model {
	id: string;
	name: string;
	family: string;
	openrouter_id: string;
	active: boolean;
	supports_reasoning: boolean;
	created_at: string;
}

export interface Question {
	id: string;
	text: string;
	category: string | null;
	response_type: ResponseType;
	options: string | null; // JSON array for multiple choice
	active: boolean;
	created_at: string;
}

export interface Poll {
	id: string;
	question_id: string;
	model_id: string;
	status: PollStatus;
	created_at: string;
	completed_at: string | null;
}

export interface Response {
	id: string;
	poll_id: string;
	raw_response: string | null;
	parsed_answer: string | null;
	justification: string | null;
	reasoning: string | null;
	response_time_ms: number | null;
	error: string | null;
	created_at: string;
}

// Parsed options from JSON
export type QuestionOptions = string[];

// Helper to parse question options
export function parseOptions(options: string | null): QuestionOptions | null {
	if (!options) return null;
	return JSON.parse(options) as QuestionOptions;
}
