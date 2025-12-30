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
	// Benchmark fields (for questions imported from external surveys)
	benchmark_source_id: string | null;
	benchmark_question_id: string | null;
	answer_labels: string | null; // JSON: {"1": "Very important", ...}
}

export interface BenchmarkSource {
	id: string;
	name: string;
	short_name: string;
	url: string | null;
	sample_size: number | null;
	year_range: string | null;
	created_at: string;
}

export interface HumanResponseDistribution {
	id: string;
	question_id: string;
	benchmark_source_id: string;
	continent: string | null;
	education_level: string | null;
	settlement_type: string | null;
	distribution: string; // JSON: {"1": 4521, "2": 3892, ...}
	sample_size: number;
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

// Parsed answer labels (maps answer value to human-readable label)
export type AnswerLabels = Record<string, string>;

// Helper to parse answer labels
export function parseAnswerLabels(labels: string | null): AnswerLabels | null {
	if (!labels) return null;
	return JSON.parse(labels) as AnswerLabels;
}

// Parsed distribution (maps answer value to count)
export type Distribution = Record<string, number>;

// Helper to parse human response distribution
export function parseDistribution(distribution: string): Distribution {
	return JSON.parse(distribution) as Distribution;
}
