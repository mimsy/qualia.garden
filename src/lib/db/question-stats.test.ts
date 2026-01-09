// ABOUTME: Tests for question statistics computation.
// ABOUTME: Covers overall stats aggregation, distribution handling, and data loading.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computeOverallStats, loadQuestionsWithStats, type QuestionWithStats } from './question-stats';

function createMockQuestion(overrides: Partial<QuestionWithStats> = {}): QuestionWithStats {
	return {
		id: 'q-1',
		text: 'Test question?',
		category: 'Test',
		responseType: 'ordinal',
		options: ['A', 'B', 'C', 'D', 'E'],
		sourceId: 'wvs-7',
		sourceShortName: 'WVS',
		aiResults: [],
		humanResults: [],
		humanSampleSize: 1000,
		humanSimilarity: 75,
		aiConsensus: 80,
		aiConfidence: 85,
		modelCount: 10,
		createdAt: '2024-01-01',
		...overrides
	};
}

describe('computeOverallStats', () => {
	describe('with valid data', () => {
		it('calculates averages across questions', () => {
			const questions = [
				createMockQuestion({ humanSimilarity: 80, aiConsensus: 90, aiConfidence: 85 }),
				createMockQuestion({ humanSimilarity: 60, aiConsensus: 70, aiConfidence: 75 })
			];

			const result = computeOverallStats(questions);

			expect(result.overallHumanSimilarity).toBe(70);
			expect(result.overallAiConsensus).toBe(80);
			expect(result.overallAiConfidence).toBe(80);
		});

		it('rounds to nearest integer', () => {
			const questions = [
				createMockQuestion({ humanSimilarity: 80, aiConsensus: 90, aiConfidence: 85 }),
				createMockQuestion({ humanSimilarity: 65, aiConsensus: 75, aiConfidence: 78 }),
				createMockQuestion({ humanSimilarity: 72, aiConsensus: 82, aiConfidence: 92 })
			];

			const result = computeOverallStats(questions);

			// 217/3 = 72.33 -> 72
			expect(result.overallHumanSimilarity).toBe(72);
			// 247/3 = 82.33 -> 82
			expect(result.overallAiConsensus).toBe(82);
			// 255/3 = 85
			expect(result.overallAiConfidence).toBe(85);
		});
	});

	describe('with empty data', () => {
		it('returns null for all scores with empty array', () => {
			const result = computeOverallStats([]);

			expect(result.overallHumanSimilarity).toBeNull();
			expect(result.overallAiConsensus).toBeNull();
			expect(result.overallAiConfidence).toBeNull();
		});
	});

	describe('with partial data', () => {
		it('excludes questions without human data from human similarity', () => {
			const questions = [createMockQuestion({ humanSimilarity: 80 }), createMockQuestion({ humanSimilarity: null })];

			const result = computeOverallStats(questions);

			// Only the first question has human data
			expect(result.overallHumanSimilarity).toBe(80);
		});

		it('excludes single-model questions from AI consensus', () => {
			const questions = [
				createMockQuestion({ aiConsensus: 90, modelCount: 10 }),
				createMockQuestion({ aiConsensus: 100, modelCount: 1 })
			];

			const result = computeOverallStats(questions);

			// Only multi-model questions count for consensus
			expect(result.overallAiConsensus).toBe(90);
		});

		it('includes all questions with confidence scores', () => {
			const questions = [
				createMockQuestion({ aiConfidence: 85 }),
				createMockQuestion({ aiConfidence: null }),
				createMockQuestion({ aiConfidence: 75 })
			];

			const result = computeOverallStats(questions);

			// (85 + 75) / 2 = 80
			expect(result.overallAiConfidence).toBe(80);
		});

		it('returns null when no questions have required data', () => {
			const questions = [
				createMockQuestion({ humanSimilarity: null, aiConsensus: null, aiConfidence: null }),
				createMockQuestion({ humanSimilarity: null, aiConsensus: null, aiConfidence: null })
			];

			const result = computeOverallStats(questions);

			expect(result.overallHumanSimilarity).toBeNull();
			expect(result.overallAiConsensus).toBeNull();
			expect(result.overallAiConfidence).toBeNull();
		});
	});

	describe('edge cases', () => {
		it('handles single question', () => {
			const questions = [createMockQuestion({ humanSimilarity: 75, aiConsensus: 80, aiConfidence: 85 })];

			const result = computeOverallStats(questions);

			expect(result.overallHumanSimilarity).toBe(75);
			expect(result.overallAiConsensus).toBe(80);
			expect(result.overallAiConfidence).toBe(85);
		});

		it('handles all zeros', () => {
			const questions = [
				createMockQuestion({ humanSimilarity: 0, aiConsensus: 0, aiConfidence: 0 }),
				createMockQuestion({ humanSimilarity: 0, aiConsensus: 0, aiConfidence: 0 })
			];

			const result = computeOverallStats(questions);

			expect(result.overallHumanSimilarity).toBe(0);
			expect(result.overallAiConsensus).toBe(0);
			expect(result.overallAiConfidence).toBe(0);
		});

		it('handles all 100s', () => {
			const questions = [
				createMockQuestion({ humanSimilarity: 100, aiConsensus: 100, aiConfidence: 100 }),
				createMockQuestion({ humanSimilarity: 100, aiConsensus: 100, aiConfidence: 100 })
			];

			const result = computeOverallStats(questions);

			expect(result.overallHumanSimilarity).toBe(100);
			expect(result.overallAiConsensus).toBe(100);
			expect(result.overallAiConfidence).toBe(100);
		});
	});

	describe('score filtering logic', () => {
		it('only counts questions with modelCount >= 2 for AI consensus', () => {
			const questions = [
				createMockQuestion({ aiConsensus: 50, modelCount: 1 }),
				createMockQuestion({ aiConsensus: 80, modelCount: 2 }),
				createMockQuestion({ aiConsensus: 90, modelCount: 5 })
			];

			const result = computeOverallStats(questions);

			// (80 + 90) / 2 = 85
			expect(result.overallAiConsensus).toBe(85);
		});

		it('counts questions with modelCount = 0 as excluded', () => {
			const questions = [
				createMockQuestion({ aiConsensus: 80, modelCount: 0 }),
				createMockQuestion({ aiConsensus: 90, modelCount: 3 })
			];

			const result = computeOverallStats(questions);

			expect(result.overallAiConsensus).toBe(90);
		});
	});
});

// Helper to create mock D1 database for loadQuestionsWithStats tests
function createMockDb(config: {
	questions?: Array<{
		id: string;
		text: string;
		category: string | null;
		response_type: string;
		options: string | null;
		benchmark_source_id: string | null;
		source_short_name: string | null;
		created_at: string;
	}>;
	responses?: Array<{
		model_id: string;
		question_id: string;
		response_type: string;
		parsed_answer: string;
	}>;
	humanDistributions?: Array<{
		question_id: string;
		distribution: string;
		sample_size: number;
	}>;
}) {
	const { questions = [], responses = [], humanDistributions = [] } = config;
	let queryIndex = 0;

	const mockStatement = {
		bind: vi.fn().mockReturnThis(),
		all: vi.fn().mockImplementation(() => {
			queryIndex++;
			if (queryIndex === 1) {
				return Promise.resolve({ results: questions });
			} else if (queryIndex === 2) {
				return Promise.resolve({ results: responses });
			} else if (queryIndex === 3) {
				return Promise.resolve({ results: humanDistributions });
			}
			return Promise.resolve({ results: [] });
		})
	};

	return {
		prepare: vi.fn(() => mockStatement),
		mockStatement
	} as unknown as D1Database;
}

describe('loadQuestionsWithStats', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('empty data', () => {
		it('returns empty array when no questions found', async () => {
			const db = createMockDb({ questions: [] });

			const result = await loadQuestionsWithStats(db, {});

			expect(result).toHaveLength(0);
		});
	});

	describe('with questions only', () => {
		it('returns questions without AI or human data', async () => {
			const db = createMockDb({
				questions: [
					{
						id: 'q-1',
						text: 'Test question?',
						category: 'Ethics',
						response_type: 'ordinal',
						options: '["A", "B", "C", "D", "E"]',
						benchmark_source_id: null,
						source_short_name: null,
						created_at: '2024-01-01'
					}
				]
			});

			const result = await loadQuestionsWithStats(db, {});

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('q-1');
			expect(result[0].text).toBe('Test question?');
			expect(result[0].modelCount).toBe(0);
			expect(result[0].humanSimilarity).toBeNull();
			expect(result[0].aiConsensus).toBeNull();
		});
	});

	describe('with AI responses', () => {
		it('aggregates AI responses across models', async () => {
			const db = createMockDb({
				questions: [
					{
						id: 'q-1',
						text: 'Test question?',
						category: 'Ethics',
						response_type: 'ordinal',
						options: '["A", "B", "C", "D", "E"]',
						benchmark_source_id: null,
						source_short_name: null,
						created_at: '2024-01-01'
					}
				],
				responses: [
					{ model_id: 'm-1', question_id: 'q-1', response_type: 'ordinal', parsed_answer: '3' },
					{ model_id: 'm-2', question_id: 'q-1', response_type: 'ordinal', parsed_answer: '3' },
					{ model_id: 'm-3', question_id: 'q-1', response_type: 'ordinal', parsed_answer: '4' }
				]
			});

			const result = await loadQuestionsWithStats(db, {});

			expect(result[0].modelCount).toBe(3);
			expect(result[0].aiConsensus).toBeGreaterThan(0);
		});

		it('computes AI confidence from self-consistency', async () => {
			const db = createMockDb({
				questions: [
					{
						id: 'q-1',
						text: 'Test question?',
						category: 'Ethics',
						response_type: 'ordinal',
						options: '["A", "B", "C"]',
						benchmark_source_id: null,
						source_short_name: null,
						created_at: '2024-01-01'
					}
				],
				responses: [
					// Model 1 has two samples agreeing
					{ model_id: 'm-1', question_id: 'q-1', response_type: 'ordinal', parsed_answer: '2' },
					{ model_id: 'm-1', question_id: 'q-1', response_type: 'ordinal', parsed_answer: '2' }
				]
			});

			const result = await loadQuestionsWithStats(db, {});

			expect(result[0].aiConfidence).toBe(100); // Perfect self-consistency
		});
	});

	describe('with human distributions', () => {
		it('computes human similarity when both AI and human data exist', async () => {
			const db = createMockDb({
				questions: [
					{
						id: 'q-1',
						text: 'Test question?',
						category: 'Ethics',
						response_type: 'ordinal',
						options: '["A", "B", "C", "D", "E"]',
						benchmark_source_id: 'wvs-7',
						source_short_name: 'WVS',
						created_at: '2024-01-01'
					}
				],
				responses: [{ model_id: 'm-1', question_id: 'q-1', response_type: 'ordinal', parsed_answer: '3' }],
				humanDistributions: [{ question_id: 'q-1', distribution: '{"3": 80, "4": 20}', sample_size: 1000 }]
			});

			const result = await loadQuestionsWithStats(db, {});

			expect(result[0].humanSimilarity).not.toBeNull();
			expect(result[0].humanSampleSize).toBe(1000);
		});
	});

	describe('filter options', () => {
		it('filters by status', async () => {
			const db = createMockDb({ questions: [] });

			await loadQuestionsWithStats(db, { status: 'published' });

			expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('q.status = ?'));
		});

		it('filters by category', async () => {
			const db = createMockDb({ questions: [] });

			await loadQuestionsWithStats(db, { category: 'Ethics' });

			expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('q.category = ?'));
		});

		it('filters by sourceId', async () => {
			const db = createMockDb({ questions: [] });

			await loadQuestionsWithStats(db, { sourceId: 'wvs-7' });

			expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('q.benchmark_source_id = ?'));
		});

		it('filters by null sourceId', async () => {
			const db = createMockDb({ questions: [] });

			await loadQuestionsWithStats(db, { sourceId: null });

			expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('q.benchmark_source_id IS NULL'));
		});

		it('filters by questionIds', async () => {
			const db = createMockDb({ questions: [] });

			await loadQuestionsWithStats(db, { questionIds: ['q-1', 'q-2'] });

			expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('q.id IN'));
		});
	});

	describe('nominal response handling', () => {
		it('handles nominal response type correctly', async () => {
			const db = createMockDb({
				questions: [
					{
						id: 'q-1',
						text: 'Yes or no?',
						category: 'Test',
						response_type: 'nominal',
						options: '["Yes", "No"]',
						benchmark_source_id: null,
						source_short_name: null,
						created_at: '2024-01-01'
					}
				],
				responses: [
					{ model_id: 'm-1', question_id: 'q-1', response_type: 'nominal', parsed_answer: '1' },
					{ model_id: 'm-2', question_id: 'q-1', response_type: 'nominal', parsed_answer: '1' }
				]
			});

			const result = await loadQuestionsWithStats(db, {});

			expect(result[0].responseType).toBe('nominal');
			expect(result[0].modelCount).toBe(2);
		});

		it('computes human similarity for nominal questions with human data', async () => {
			const db = createMockDb({
				questions: [
					{
						id: 'q-1',
						text: 'Yes or no?',
						category: 'Test',
						response_type: 'nominal',
						options: '["Yes", "No"]',
						benchmark_source_id: 'wvs-7',
						source_short_name: 'WVS',
						created_at: '2024-01-01'
					}
				],
				responses: [
					{ model_id: 'm-1', question_id: 'q-1', response_type: 'nominal', parsed_answer: '1' },
					{ model_id: 'm-2', question_id: 'q-1', response_type: 'nominal', parsed_answer: '1' }
				],
				humanDistributions: [{ question_id: 'q-1', distribution: '{"1": 70, "2": 30}', sample_size: 500 }]
			});

			const result = await loadQuestionsWithStats(db, {});

			expect(result[0].responseType).toBe('nominal');
			expect(result[0].humanSimilarity).not.toBeNull();
			expect(result[0].humanSampleSize).toBe(500);
		});
	});
});
