// ABOUTME: Question results page data loader.
// ABOUTME: Fetches question details, model responses, and human benchmark data.

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface ResponseWithModel {
	model_id: string;
	model_name: string;
	model_family: string;
	raw_response: string | null;
	parsed_answer: string | null;
	justification: string | null;
	response_time_ms: number | null;
	status: string;
}

interface Question {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	options: string | null;
	benchmark_source_id: string | null;
	answer_labels: string | null;
}

interface BenchmarkSource {
	id: string;
	name: string;
	short_name: string;
	url: string | null;
	sample_size: number | null;
	year_range: string | null;
}

interface HumanDistribution {
	id: string;
	continent: string | null;
	education_level: string | null;
	settlement_type: string | null;
	distribution: string;
	sample_size: number;
}

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const db = platform.env.DB;

	// Get question
	const question = await db
		.prepare('SELECT * FROM questions WHERE id = ?')
		.bind(params.id)
		.first<Question>();

	if (!question) {
		throw error(404, 'Question not found');
	}

	// Get latest response per model for this question (deduplicated)
	const responsesResult = await db
		.prepare(
			`
		SELECT
			m.id as model_id,
			m.name as model_name,
			m.family as model_family,
			r.raw_response,
			r.parsed_answer,
			r.justification,
			r.response_time_ms,
			p.status
		FROM polls p
		JOIN models m ON p.model_id = m.id
		LEFT JOIN responses r ON p.id = r.poll_id
		WHERE p.question_id = ?
			AND p.id = (
				SELECT p2.id FROM polls p2
				WHERE p2.question_id = p.question_id
					AND p2.model_id = p.model_id
				ORDER BY p2.created_at DESC
				LIMIT 1
			)
		ORDER BY m.family, m.name
	`
		)
		.bind(params.id)
		.all<ResponseWithModel>();

	// Parse options if multiple choice
	const options = question.options ? (JSON.parse(question.options) as string[]) : null;

	// Calculate aggregate results
	const responses = responsesResult.results.filter((r) => r.parsed_answer !== null);
	const answerCounts: Record<string, number> = {};

	for (const response of responses) {
		if (response.parsed_answer) {
			answerCounts[response.parsed_answer] = (answerCounts[response.parsed_answer] || 0) + 1;
		}
	}

	// Sort answers for display
	let sortedAnswers: Array<{ answer: string; count: number; percentage: number }>;

	if (question.response_type === 'scale') {
		// Sort numerically for scale
		sortedAnswers = Object.entries(answerCounts)
			.map(([answer, count]) => ({
				answer,
				count,
				percentage: responses.length > 0 ? (count / responses.length) * 100 : 0
			}))
			.sort((a, b) => parseInt(a.answer) - parseInt(b.answer));
	} else {
		// Sort by count for other types
		sortedAnswers = Object.entries(answerCounts)
			.map(([answer, count]) => ({
				answer,
				count,
				percentage: responses.length > 0 ? (count / responses.length) * 100 : 0
			}))
			.sort((a, b) => b.count - a.count);
	}

	// Fetch benchmark data if this is a benchmark question
	let benchmarkSource: BenchmarkSource | null = null;
	let humanDistributions: HumanDistribution[] = [];
	let answerLabels: Record<string, string> | null = null;

	if (question.benchmark_source_id) {
		// Get benchmark source
		benchmarkSource = await db
			.prepare('SELECT * FROM benchmark_sources WHERE id = ?')
			.bind(question.benchmark_source_id)
			.first<BenchmarkSource>();

		// Get all human distributions for this question
		const distResult = await db
			.prepare(
				'SELECT * FROM human_response_distributions WHERE question_id = ? ORDER BY continent, education_level'
			)
			.bind(params.id)
			.all<HumanDistribution>();
		humanDistributions = distResult.results;

		// Parse answer labels
		if (question.answer_labels) {
			answerLabels = JSON.parse(question.answer_labels);
		}
	}

	// Get unique continents and education levels for filters
	const continents = [
		...new Set(humanDistributions.filter((d) => d.continent).map((d) => d.continent as string))
	].sort();
	const educationLevels = [
		...new Set(
			humanDistributions.filter((d) => d.education_level).map((d) => d.education_level as string)
		)
	].sort();

	return {
		question,
		options,
		responses: responsesResult.results,
		aggregateResults: sortedAnswers,
		totalResponses: responses.length,
		benchmarkSource,
		humanDistributions,
		answerLabels,
		continents,
		educationLevels
	};
};
