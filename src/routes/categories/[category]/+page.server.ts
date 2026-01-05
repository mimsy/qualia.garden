// ABOUTME: Data loader for category detail page.
// ABOUTME: Returns questions with full aggregate results for display.

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { computeMedian, computeMode } from '$lib/db/types';
import {
	ordinalAgreementScore,
	nominalAgreementScore,
	ordinalInternalAgreement,
	nominalInternalAgreement,
	distributionMeanNormalized,
	arrayMeanNormalized,
	normalizeDistributionKeys
} from '$lib/alignment';

interface Question {
	id: string;
	text: string;
	category: string | null;
	response_type: string;
	options: string | null;
	benchmark_source_id: string | null;
}

interface ModelResponseRow {
	model_id: string;
	model_name: string;
	question_id: string;
	response_type: string;
	parsed_answer: string;
}

interface HumanDistributionRow {
	question_id: string;
	distribution: string;
	sample_size: number;
}

interface AggregateResult {
	answer: string;
	label: string;
	count: number;
	percentage: number;
}

export interface QuestionWithResults {
	id: string;
	text: string;
	category: string | null;
	responseType: string;
	options: string[];
	// Aggregate results
	aiResults: AggregateResult[];
	humanResults: AggregateResult[];
	humanSampleSize: number | null;
	// Scores
	humanAiScore: number;
	aiAgreementScore: number;
	modelCount: number;
}

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		return error(500, 'Database not available');
	}

	const db = platform.env.DB;
	const category = decodeURIComponent(params.category);

	// Get published questions for this category
	const questionsResult = await db
		.prepare(`
			SELECT id, text, category, response_type, options, benchmark_source_id
			FROM questions
			WHERE category = ?
				AND status = 'published'
			ORDER BY text
		`)
		.bind(category)
		.all<Question>();

	const questions = questionsResult.results;
	if (questions.length === 0) {
		return error(404, 'Category not found or has no published questions');
	}

	const questionIds = questions.map(q => q.id);

	// Get AI responses (latest batch per model per question)
	const responsesResult = await db
		.prepare(`
			SELECT
				m.id as model_id,
				m.name as model_name,
				p.question_id,
				q.response_type,
				r.parsed_answer
			FROM polls p
			JOIN models m ON p.model_id = m.id
			JOIN responses r ON p.id = r.poll_id
			JOIN questions q ON p.question_id = q.id
			WHERE p.status = 'complete'
				AND r.parsed_answer IS NOT NULL
				AND q.category = ?
				AND q.status = 'published'
				AND (
					(p.batch_id IS NOT NULL AND p.batch_id = (
						SELECT p2.batch_id FROM polls p2
						WHERE p2.question_id = p.question_id
							AND p2.model_id = p.model_id
							AND p2.batch_id IS NOT NULL
						ORDER BY p2.created_at DESC
						LIMIT 1
					))
					OR
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
		.bind(category)
		.all<ModelResponseRow>();

	// Group responses by question, then by model
	const responsesByQuestion = new Map<string, Map<string, { answers: string[]; responseType: string }>>();
	for (const r of responsesResult.results) {
		if (!responsesByQuestion.has(r.question_id)) {
			responsesByQuestion.set(r.question_id, new Map());
		}
		const questionResponses = responsesByQuestion.get(r.question_id)!;
		if (!questionResponses.has(r.model_id)) {
			questionResponses.set(r.model_id, { answers: [], responseType: r.response_type });
		}
		questionResponses.get(r.model_id)!.answers.push(r.parsed_answer);
	}

	// Get human distributions (overall only)
	const humanResult = await db
		.prepare(`
			SELECT question_id, distribution, sample_size
			FROM human_response_distributions
			WHERE question_id IN (${questionIds.map(() => '?').join(',')})
				AND continent IS NULL
				AND education_level IS NULL
				AND age_group IS NULL
				AND gender IS NULL
		`)
		.bind(...questionIds)
		.all<HumanDistributionRow>();

	const humanDistributions = new Map<string, { distribution: Record<string, number>; sampleSize: number }>();
	for (const d of humanResult.results) {
		humanDistributions.set(d.question_id, {
			distribution: JSON.parse(d.distribution),
			sampleSize: d.sample_size
		});
	}

	// Build questions with full results
	const questionsWithResults: QuestionWithResults[] = questions.map(q => {
		const options = q.options ? JSON.parse(q.options) as string[] : [];
		const questionResponses = responsesByQuestion.get(q.id);
		const humanData = humanDistributions.get(q.id);

		// Aggregate AI responses per model, then collect all aggregated answers
		const aggregatedAnswers: string[] = [];
		if (questionResponses) {
			for (const [, data] of questionResponses) {
				const aggregated = data.responseType === 'ordinal'
					? computeMedian(data.answers)
					: computeMode(data.answers);
				if (aggregated) {
					aggregatedAnswers.push(aggregated);
				}
			}
		}

		// Build AI distribution from aggregated answers
		const aiDist: Record<string, number> = {};
		for (const ans of aggregatedAnswers) {
			aiDist[ans] = (aiDist[ans] || 0) + 1;
		}
		const aiTotal = aggregatedAnswers.length;

		// Build AI results for display
		const aiResults: AggregateResult[] = options.map((opt, i) => {
			const key = String(i + 1);
			const count = aiDist[key] || 0;
			return {
				answer: key,
				label: opt,
				count,
				percentage: aiTotal > 0 ? (count / aiTotal) * 100 : 0
			};
		});

		// Build human results for display
		let humanResults: AggregateResult[] = [];
		let humanSampleSize: number | null = null;
		if (humanData) {
			const normalizedDist = normalizeDistributionKeys(humanData.distribution, options);
			const humanTotal = Object.values(normalizedDist).reduce((a, b) => a + b, 0);
			humanSampleSize = humanData.sampleSize;

			humanResults = options.map((opt, i) => {
				const key = String(i + 1);
				const count = normalizedDist[key] || 0;
				return {
					answer: key,
					label: opt,
					count,
					percentage: humanTotal > 0 ? (count / humanTotal) * 100 : 0
				};
			});
		}

		// Compute scores
		let humanAiScore = 0;
		let aiAgreementScore = 0;

		if (humanData && aiTotal > 0) {
			const normalizedHuman = normalizeDistributionKeys(humanData.distribution, options);
			if (q.response_type === 'ordinal') {
				humanAiScore = ordinalAgreementScore(normalizedHuman, aiDist, options);
				aiAgreementScore = ordinalInternalAgreement(aggregatedAnswers, options.length);
			} else {
				humanAiScore = nominalAgreementScore(normalizedHuman, aiDist);
				aiAgreementScore = nominalInternalAgreement(aggregatedAnswers);
			}
		} else if (aiTotal >= 2) {
			aiAgreementScore = q.response_type === 'ordinal'
				? ordinalInternalAgreement(aggregatedAnswers, options.length)
				: nominalInternalAgreement(aggregatedAnswers);
		}

		return {
			id: q.id,
			text: q.text,
			category: q.category,
			responseType: q.response_type,
			options,
			aiResults,
			humanResults,
			humanSampleSize,
			humanAiScore,
			aiAgreementScore,
			modelCount: aiTotal
		};
	});

	// Compute overall scores
	const questionsWithHumanData = questionsWithResults.filter(q => q.humanResults.length > 0);
	const overallHumanAiScore = questionsWithHumanData.length > 0
		? Math.round(questionsWithHumanData.reduce((sum, q) => sum + q.humanAiScore, 0) / questionsWithHumanData.length)
		: null;

	const questionsWithAiData = questionsWithResults.filter(q => q.modelCount >= 2);
	const overallAiAgreement = questionsWithAiData.length > 0
		? Math.round(questionsWithAiData.reduce((sum, q) => sum + q.aiAgreementScore, 0) / questionsWithAiData.length)
		: null;

	return {
		category,
		questions: questionsWithResults,
		overallHumanAiScore,
		overallAiAgreement,
		questionCount: questions.length
	};
};
