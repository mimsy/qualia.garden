// ABOUTME: Data loader for model similarity map.
// ABOUTME: Computes response vectors for UMAP projection, filtered to shared questions.

import type { PageServerLoad } from './$types';
import { computeMedian, computeMode } from '$lib/db/types';
import { getLatestPollFilter } from '$lib/db/queries';

interface Question {
	id: string;
	text: string;
	options: string | null;
	response_type: string;
}

interface ModelResponseRow {
	model_id: string;
	model_name: string;
	model_family: string;
	question_id: string;
	response_type: string;
	batch_id: string | null;
	parsed_answer: string;
}

interface HumanDistribution {
	question_id: string;
	distribution: string;
	sample_size: number;
}

export interface Entity {
	id: string;
	name: string;
	type: 'model' | 'human';
	family: string;
	vector: number[];
	responseCount: number;
}

export interface MapData {
	entities: Entity[];
	questionCount: number;
	families: string[];
	excludedModelCount: number;
	minCoverageThreshold: number;
}

const MIN_COVERAGE_THRESHOLD = 0.8; // Models must have answered 80% of questions with human data

export const load: PageServerLoad = async ({ platform }) => {
	const emptyResult: MapData = {
		entities: [],
		questionCount: 0,
		families: [],
		excludedModelCount: 0,
		minCoverageThreshold: MIN_COVERAGE_THRESHOLD
	};

	if (!platform?.env?.DB) {
		return emptyResult;
	}

	const db = platform.env.DB;

	// Get human overall distributions first - these define our question set
	const humanResult = await db
		.prepare(
			`
			SELECT h.question_id, h.distribution, h.sample_size
			FROM human_response_distributions h
			JOIN questions q ON h.question_id = q.id
			WHERE q.status = 'published'
				AND h.continent IS NULL
				AND h.education_level IS NULL
		`
		)
		.all<HumanDistribution>();

	if (humanResult.results.length === 0) {
		return emptyResult;
	}

	// Build set of questions with human data
	const humanQuestionIds = new Set(humanResult.results.map((h) => h.question_id));
	const humanDistributions = new Map<string, Record<string, number>>();
	for (const h of humanResult.results) {
		humanDistributions.set(h.question_id, JSON.parse(h.distribution));
	}

	// Get question metadata using subquery to avoid large IN clause
	const questionsResult = await db
		.prepare(
			`
			SELECT q.id, q.text, q.options, q.response_type
			FROM questions q
			WHERE q.status = 'published'
				AND q.id IN (
					SELECT h.question_id
					FROM human_response_distributions h
					JOIN questions q2 ON h.question_id = q2.id
					WHERE q2.status = 'published'
						AND h.continent IS NULL
						AND h.education_level IS NULL
				)
			ORDER BY q.id
		`
		)
		.all<Question>();

	const questionMeta = questionsResult.results.map((q) => ({
		id: q.id,
		text: q.text,
		options: q.options ? (JSON.parse(q.options) as string[]) : [],
		responseType: q.response_type
	}));

	if (questionMeta.length === 0) {
		return emptyResult;
	}

	// Get all model responses
	const responsesResult = await db
		.prepare(
			`
			SELECT
				m.id as model_id,
				m.name as model_name,
				m.family as model_family,
				p.question_id,
				q.response_type,
				p.batch_id,
				r.parsed_answer
			FROM polls p
			JOIN models m ON p.model_id = m.id
			JOIN responses r ON p.id = r.poll_id
			JOIN questions q ON p.question_id = q.id
			WHERE p.status = 'complete'
				AND r.parsed_answer IS NOT NULL
				AND q.status = 'published'
				${getLatestPollFilter()}
		`
		)
		.all<ModelResponseRow>();

	// Group and aggregate model responses
	const rawResponses = new Map<
		string,
		{
			name: string;
			family: string;
			byQuestion: Map<string, { answers: string[]; responseType: string }>;
		}
	>();

	for (const r of responsesResult.results) {
		if (!humanQuestionIds.has(r.question_id)) continue; // Only count questions with human data

		if (!rawResponses.has(r.model_id)) {
			rawResponses.set(r.model_id, {
				name: r.model_name,
				family: r.model_family,
				byQuestion: new Map()
			});
		}
		const model = rawResponses.get(r.model_id)!;
		if (!model.byQuestion.has(r.question_id)) {
			model.byQuestion.set(r.question_id, { answers: [], responseType: r.response_type });
		}
		model.byQuestion.get(r.question_id)!.answers.push(r.parsed_answer);
	}

	// Aggregate responses and filter by coverage
	const modelResponses = new Map<string, { name: string; family: string; responses: Map<string, string> }>();
	let excludedModelCount = 0;

	for (const [modelId, data] of rawResponses) {
		const aggregatedResponses = new Map<string, string>();
		for (const [questionId, { answers, responseType }] of data.byQuestion) {
			const aggregated = responseType === 'ordinal' ? computeMedian(answers) : computeMode(answers);
			if (aggregated) {
				aggregatedResponses.set(questionId, aggregated);
			}
		}

		// Check coverage threshold
		const coverage = aggregatedResponses.size / humanQuestionIds.size;
		if (coverage >= MIN_COVERAGE_THRESHOLD) {
			modelResponses.set(modelId, {
				name: data.name,
				family: data.family,
				responses: aggregatedResponses
			});
		} else {
			excludedModelCount++;
		}
	}

	// Build entities with vectors
	const entities: Entity[] = [];
	const families = new Set<string>();

	// Add human overall entity
	const humanVector = buildVectorFromDistributions(questionMeta, humanDistributions);
	entities.push({
		id: 'human-overall',
		name: 'Humans (Overall)',
		type: 'human',
		family: 'Human',
		vector: humanVector,
		responseCount: humanQuestionIds.size
	});
	families.add('Human');

	// Add model entities
	for (const [modelId, data] of modelResponses) {
		const vector = buildVector(questionMeta, data.responses);
		entities.push({
			id: modelId,
			name: data.name,
			type: 'model',
			family: data.family,
			vector,
			responseCount: data.responses.size
		});
		families.add(data.family);
	}

	return {
		entities,
		questionCount: questionMeta.length,
		families: Array.from(families).sort(),
		excludedModelCount,
		minCoverageThreshold: MIN_COVERAGE_THRESHOLD
	} as MapData;
};

function buildVector(questions: Array<{ id: string; options: string[] }>, responses: Map<string, string>): number[] {
	const vector: number[] = [];

	for (const q of questions) {
		const answer = responses.get(q.id);
		const answerIndex = answer ? parseInt(answer, 10) - 1 : -1;
		for (let i = 0; i < q.options.length; i++) {
			vector.push(answerIndex === i ? 1 : 0);
		}
	}

	return vector;
}

function buildVectorFromDistributions(
	questions: Array<{ id: string; options: string[] }>,
	distributions: Map<string, Record<string, number>>
): number[] {
	const vector: number[] = [];

	for (const q of questions) {
		const dist = distributions.get(q.id);
		if (!dist) {
			for (let i = 0; i < q.options.length; i++) {
				vector.push(0);
			}
			continue;
		}

		const total = Object.values(dist).reduce((a, b) => a + b, 0);
		for (let i = 0; i < q.options.length; i++) {
			const key = String(i + 1);
			const count = dist[key] || 0;
			vector.push(total > 0 ? count / total : 0);
		}
	}

	return vector;
}
