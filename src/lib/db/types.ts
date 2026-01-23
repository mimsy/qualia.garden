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
	release_date: string | null;
	description: string | null;
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

export interface Category {
	name: string;
	description: string;
	display_order: number;
}

export interface Tag {
	id: string;
	name: string;
	description: string | null;
	created_at: string;
}

export interface TagWithCount extends Tag {
	question_count: number;
}

export interface QuestionWithTags extends Question {
	tags: Tag[];
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
	batch_id: string | null;
	created_at: string;
	completed_at: string | null;
}

// Aggregated response across multiple samples for a model
export interface AggregatedResponse {
	model_id: string;
	model_name: string;
	model_family: string;
	aggregated_answer: string | null;
	sample_count: number;
	complete_count: number;
	samples: Array<{
		poll_id: string;
		parsed_answer: string | null;
		justification: string | null;
		response_time_ms: number | null;
		status: string;
		created_at: string;
	}>;
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

// Compute median for ordinal responses (1-based string keys)
export function computeMedian(answers: string[]): string | null {
	if (answers.length === 0) return null;
	const nums = answers.map((a) => parseInt(a, 10)).sort((a, b) => a - b);
	const mid = Math.floor(nums.length / 2);
	const median = nums.length % 2 === 1 ? nums[mid] : Math.round((nums[mid - 1] + nums[mid]) / 2);
	return String(median);
}

// Compute mode for nominal responses (most frequent answer)
export function computeMode(answers: string[]): string | null {
	if (answers.length === 0) return null;
	const counts = new Map<string, number>();
	for (const a of answers) {
		counts.set(a, (counts.get(a) || 0) + 1);
	}
	// Sort by count descending, then by answer ascending for tie-breaking
	const sorted = [...counts.entries()].sort((a, b) => {
		if (b[1] !== a[1]) return b[1] - a[1];
		return a[0].localeCompare(b[0]);
	});
	return sorted[0]?.[0] ?? null;
}
