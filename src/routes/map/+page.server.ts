// ABOUTME: Data loader for model similarity map visualization.
// ABOUTME: Fetches response data and compiles into vectors for UMAP projection.

import type { PageServerLoad } from './$types';

interface Question {
	id: string;
	text: string;
	options: string | null;
	answer_labels: string | null;
}

interface ModelResponse {
	model_id: string;
	model_name: string;
	model_family: string;
	question_id: string;
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

export interface MapData {
	entities: Entity[];
	questions: Array<{ id: string; text: string; optionCount: number }>;
	families: string[];
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { entities: [], questions: [], families: [] } as MapData;
	}

	const db = platform.env.DB;

	// Get all published questions with their options
	const questionsResult = await db
		.prepare(`
			SELECT id, text, options, answer_labels
			FROM questions
			WHERE status = 'published'
			ORDER BY id
		`)
		.all<Question>();
	const questions = questionsResult.results;

	if (questions.length === 0) {
		return { entities: [], questions: [], families: [] } as MapData;
	}

	// Build question metadata and option mappings
	const questionMeta: Array<{ id: string; text: string; options: string[]; optionCount: number }> = [];
	for (const q of questions) {
		const options = q.options ? JSON.parse(q.options) as string[] : [];
		questionMeta.push({
			id: q.id,
			text: q.text,
			options,
			optionCount: options.length
		});
	}

	// Get all model responses (latest per model per question)
	const responsesResult = await db
		.prepare(`
			SELECT
				m.id as model_id,
				m.name as model_name,
				m.family as model_family,
				p.question_id,
				r.parsed_answer
			FROM polls p
			JOIN models m ON p.model_id = m.id
			JOIN responses r ON p.id = r.poll_id
			WHERE p.status = 'complete'
				AND r.parsed_answer IS NOT NULL
				AND p.question_id IN (SELECT id FROM questions WHERE status = 'published')
				AND p.id = (
					SELECT p2.id FROM polls p2
					WHERE p2.question_id = p.question_id
						AND p2.model_id = p.model_id
					ORDER BY p2.created_at DESC
					LIMIT 1
				)
		`)
		.all<ModelResponse>();

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

	// Group model responses by model
	const modelResponses = new Map<string, { name: string; family: string; responses: Map<string, string> }>();
	for (const r of responsesResult.results) {
		if (!modelResponses.has(r.model_id)) {
			modelResponses.set(r.model_id, {
				name: r.model_name,
				family: r.model_family,
				responses: new Map()
			});
		}
		modelResponses.get(r.model_id)!.responses.set(r.question_id, r.parsed_answer);
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

	return {
		entities,
		questions: questionMeta.map(q => ({ id: q.id, text: q.text, optionCount: q.optionCount })),
		families: Array.from(families).sort()
	} as MapData;
};

function buildVector(
	questions: Array<{ id: string; options: string[] }>,
	responses: Map<string, string>
): number[] {
	const vector: number[] = [];

	for (const q of questions) {
		const answer = responses.get(q.id);
		for (const option of q.options) {
			// 1 if this model chose this option, 0 otherwise
			vector.push(answer === option ? 1 : 0);
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
