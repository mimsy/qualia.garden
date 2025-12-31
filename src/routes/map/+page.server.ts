// ABOUTME: Data loader for model exploration interface.
// ABOUTME: Computes response vectors, agreement matrices, and human alignment scores.

import type { PageServerLoad } from './$types';
import { computeMedian, computeMode } from '$lib/db/types';

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
	continent: string | null;
	education_level: string | null;
	distribution: string;
	sample_size: number;
}

export interface Entity {
	id: string;
	name: string;
	type: 'model' | 'human';
	family: string; // model family or demographic category
	vector: number[];
	metadata: Record<string, unknown>;
}

export interface QuestionInfo {
	id: string;
	text: string;
	options: string[];
	optionCount: number;
}

export interface MapData {
	entities: Entity[];
	questions: QuestionInfo[];
	families: string[];
	// Raw responses: entityId → questionId → answer
	responses: Record<string, Record<string, string | null>>;
	// Pairwise agreement: entityId → entityId → percentage (0-100)
	agreements: Record<string, Record<string, number>>;
	// Human alignment scores (sorted by score descending)
	humanAlignment: Array<{ id: string; name: string; score: number; type: 'model' | 'human' }>;
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { entities: [], questions: [], families: [], responses: {}, agreements: {}, humanAlignment: [] } as MapData;
	}

	const db = platform.env.DB;

	// Get all published questions with their options
	const questionsResult = await db
		.prepare(`
			SELECT id, text, options, response_type
			FROM questions
			WHERE status = 'published'
			ORDER BY id
		`)
		.all<Question>();
	const questions = questionsResult.results;

	if (questions.length === 0) {
		return { entities: [], questions: [], families: [], responses: {}, agreements: {}, humanAlignment: [] } as MapData;
	}

	// Build question metadata and option mappings
	const questionMeta: Array<{ id: string; text: string; options: string[]; optionCount: number; responseType: string }> = [];
	for (const q of questions) {
		const options = q.options ? JSON.parse(q.options) as string[] : [];
		questionMeta.push({
			id: q.id,
			text: q.text,
			options,
			optionCount: options.length,
			responseType: q.response_type
		});
	}

	// Get all model responses from the latest batch per model per question
	// This handles both batched (batch_id NOT NULL) and legacy (batch_id NULL) polls
	const responsesResult = await db
		.prepare(`
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
				AND (
					-- For batched polls: get all polls from the latest batch per model per question
					(p.batch_id IS NOT NULL AND p.batch_id = (
						SELECT p2.batch_id FROM polls p2
						WHERE p2.question_id = p.question_id
							AND p2.model_id = p.model_id
							AND p2.batch_id IS NOT NULL
						ORDER BY p2.created_at DESC
						LIMIT 1
					))
					OR
					-- For legacy single polls: get the latest poll where batch_id is NULL
					(p.batch_id IS NULL AND p.id = (
						SELECT p3.id FROM polls p3
						WHERE p3.question_id = p.question_id
							AND p3.model_id = p.model_id
							AND p3.batch_id IS NULL
						ORDER BY p3.created_at DESC
						LIMIT 1
					))
				)
		`)
		.all<ModelResponseRow>();

	// Get human distributions (overall only for now)
	const humanResult = await db
		.prepare(`
			SELECT question_id, continent, education_level, distribution, sample_size
			FROM human_response_distributions
			WHERE question_id IN (SELECT id FROM questions WHERE status = 'published')
				AND continent IS NULL
				AND education_level IS NULL
		`)
		.all<HumanDistribution>();

	// Group model responses by model and question, then aggregate
	// First, collect all answers for each model+question combination
	const rawResponses = new Map<string, {
		name: string;
		family: string;
		byQuestion: Map<string, { answers: string[]; responseType: string }>
	}>();

	for (const r of responsesResult.results) {
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

	// Now compute aggregated answer for each model+question
	const modelResponses = new Map<string, { name: string; family: string; responses: Map<string, string> }>();
	for (const [modelId, data] of rawResponses) {
		const aggregatedResponses = new Map<string, string>();
		for (const [questionId, { answers, responseType }] of data.byQuestion) {
			const aggregated = responseType === 'ordinal'
				? computeMedian(answers)
				: computeMode(answers);
			if (aggregated) {
				aggregatedResponses.set(questionId, aggregated);
			}
		}
		modelResponses.set(modelId, {
			name: data.name,
			family: data.family,
			responses: aggregatedResponses
		});
	}

	// Build response vectors for models
	const entities: Entity[] = [];
	const families = new Set<string>();

	for (const [modelId, data] of modelResponses) {
		const vector = buildVector(questionMeta, data.responses);
		if (vector.some(v => v > 0)) { // Only include if has at least one response
			entities.push({
				id: modelId,
				name: data.name,
				type: 'model',
				family: data.family,
				vector,
				metadata: {
					responseCount: data.responses.size
				}
			});
			families.add(data.family);
		}
	}

	// Build response vectors for human overall distribution
	for (const dist of humanResult.results) {
		// For now, just use overall human data
		const humanResponses = new Map<string, Record<string, number>>();

		// Group distributions by question
		for (const d of humanResult.results) {
			const distribution = JSON.parse(d.distribution) as Record<string, number>;
			humanResponses.set(d.question_id, distribution);
		}

		// Build vector from distributions
		const vector = buildVectorFromDistributions(questionMeta, humanResponses);
		if (vector.some(v => v > 0)) {
			entities.push({
				id: 'human-overall',
				name: 'Humans (Overall)',
				type: 'human',
				family: 'Human',
				vector,
				metadata: {
					sampleSize: dist.sample_size
				}
			});
			families.add('Human');
		}
		break; // Only add one overall human entity
	}

	// Also add human distributions by continent
	const continentResult = await db
		.prepare(`
			SELECT question_id, continent, distribution, sample_size
			FROM human_response_distributions
			WHERE question_id IN (SELECT id FROM questions WHERE status = 'published')
				AND continent IS NOT NULL
				AND education_level IS NULL
		`)
		.all<HumanDistribution>();

	const continentData = new Map<string, Map<string, Record<string, number>>>();
	const continentSamples = new Map<string, number>();

	for (const d of continentResult.results) {
		if (!d.continent) continue;
		if (!continentData.has(d.continent)) {
			continentData.set(d.continent, new Map());
			continentSamples.set(d.continent, 0);
		}
		continentData.get(d.continent)!.set(d.question_id, JSON.parse(d.distribution));
		continentSamples.set(d.continent, (continentSamples.get(d.continent) || 0) + d.sample_size);
	}

	for (const [continent, responses] of continentData) {
		const vector = buildVectorFromDistributions(questionMeta, responses);
		if (vector.some(v => v > 0)) {
			entities.push({
				id: `human-${continent.toLowerCase()}`,
				name: `Humans (${continent})`,
				type: 'human',
				family: 'Human',
				vector,
				metadata: {
					continent,
					sampleSize: continentSamples.get(continent)
				}
			});
		}
	}

	// Build responses map for all entities
	const responses: Record<string, Record<string, string | null>> = {};

	// Add model responses
	for (const [modelId, data] of modelResponses) {
		responses[modelId] = {};
		for (const q of questionMeta) {
			responses[modelId][q.id] = data.responses.get(q.id) || null;
		}
	}

	// Add human responses (plurality answer from distribution)
	const humanOverallResponses = new Map<string, Record<string, number>>();
	for (const d of humanResult.results) {
		humanOverallResponses.set(d.question_id, JSON.parse(d.distribution));
	}

	responses['human-overall'] = {};
	for (const q of questionMeta) {
		responses['human-overall'][q.id] = getPluralityAnswer(q, humanOverallResponses.get(q.id));
	}

	// Add continent human responses
	for (const [continent, distMap] of continentData) {
		const entityId = `human-${continent.toLowerCase()}`;
		responses[entityId] = {};
		for (const q of questionMeta) {
			responses[entityId][q.id] = getPluralityAnswer(q, distMap.get(q.id));
		}
	}

	// Compute pairwise agreement matrix
	const agreements: Record<string, Record<string, number>> = {};
	for (const e1 of entities) {
		agreements[e1.id] = {};
		for (const e2 of entities) {
			agreements[e1.id][e2.id] = computeAgreement(
				responses[e1.id],
				responses[e2.id],
				questionMeta
			);
		}
	}

	// Compute human alignment scores (agreement with human-overall)
	const humanAlignment: Array<{ id: string; name: string; score: number; type: 'model' | 'human' }> = [];
	const humanOverallId = 'human-overall';

	for (const entity of entities) {
		if (entity.id === humanOverallId) continue; // Skip comparing human-overall to itself
		const score = agreements[entity.id]?.[humanOverallId] ?? 0;
		humanAlignment.push({
			id: entity.id,
			name: entity.name,
			score,
			type: entity.type
		});
	}

	// Sort by score descending (most human-aligned first)
	humanAlignment.sort((a, b) => b.score - a.score);

	return {
		entities,
		questions: questionMeta.map(q => ({ id: q.id, text: q.text, options: q.options, optionCount: q.optionCount })),
		families: Array.from(families).sort(),
		responses,
		agreements,
		humanAlignment
	} as MapData;
};

function buildVector(
	questions: Array<{ id: string; options: string[] }>,
	responses: Map<string, string>
): number[] {
	const vector: number[] = [];

	for (const q of questions) {
		const answer = responses.get(q.id);
		// Answer is now a 1-based key like "1", "2", etc.
		const answerIndex = answer ? parseInt(answer, 10) - 1 : -1;
		for (let i = 0; i < q.options.length; i++) {
			// 1 if this model chose this option, 0 otherwise
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
			// No data for this question, fill with zeros
			for (let i = 0; i < q.options.length; i++) {
				vector.push(0);
			}
			continue;
		}

		// Normalize distribution to percentages
		const total = Object.values(dist).reduce((a, b) => a + b, 0);
		for (const option of q.options) {
			// For human data, the keys are usually "1", "2", etc. but options are labels
			// We need to find the matching key by index
			const optionIndex = q.options.indexOf(option);
			const key = String(optionIndex + 1);
			const count = dist[key] || dist[option] || 0;
			vector.push(total > 0 ? count / total : 0);
		}
	}

	return vector;
}

// Returns the 1-based key of the most popular answer
function getPluralityAnswer(
	question: { id: string; options: string[] },
	distribution: Record<string, number> | undefined
): string | null {
	if (!distribution) return null;

	let maxCount = 0;
	let maxKey: string | null = null;

	for (let i = 0; i < question.options.length; i++) {
		const key = String(i + 1);
		const count = distribution[key] || 0;
		if (count > maxCount) {
			maxCount = count;
			maxKey = key;
		}
	}

	return maxKey;
}

function computeAgreement(
	responses1: Record<string, string | null>,
	responses2: Record<string, string | null>,
	questions: Array<{ id: string }>
): number {
	let agreements = 0;
	let comparisons = 0;

	for (const q of questions) {
		const r1 = responses1?.[q.id];
		const r2 = responses2?.[q.id];

		// Only count if both have a response
		if (r1 !== null && r1 !== undefined && r2 !== null && r2 !== undefined) {
			comparisons++;
			if (r1 === r2) {
				agreements++;
			}
		}
	}

	return comparisons > 0 ? Math.round((agreements / comparisons) * 100) : 0;
}
