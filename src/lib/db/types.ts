// ABOUTME: TypeScript types matching the D1 database schema.
// ABOUTME: Provides type safety for database operations.

export type ResponseType = 'ordinal' | 'nominal';
export type PollStatus = 'pending' | 'complete' | 'failed';
export type QuestionStatus = 'draft' | 'published' | 'archived';

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
	options: string | null; // JSON array, index+1 is the key ("1", "2", ...)
	active: boolean;
	status: QuestionStatus;
	created_at: string;
	// Benchmark fields (for questions imported from external surveys)
	benchmark_source_id: string | null;
	benchmark_question_id: string | null;
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
	age_group: string | null;
	gender: string | null;
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

// Get display label from 1-based key (e.g., "1" -> "Strongly agree")
export function getOptionLabel(options: string[] | null, key: string): string {
	if (!options) return key;
	const index = parseInt(key, 10) - 1;
	return index >= 0 && index < options.length ? options[index] : key;
}

// Get 1-based key from option label (e.g., "Strongly agree" -> "1")
export function getOptionKey(options: string[] | null, label: string): string {
	if (!options) return label;
	const index = options.indexOf(label);
	return index >= 0 ? String(index + 1) : label;
}

// Parsed distribution (maps 1-based key to count)
export type Distribution = Record<string, number>;

// Helper to parse human response distribution
export function parseDistribution(distribution: string): Distribution {
	return JSON.parse(distribution) as Distribution;
}
