// ABOUTME: Tests for question statistics computation.
// ABOUTME: Covers overall stats aggregation and distribution handling.

import { describe, it, expect } from 'vitest';
import { computeOverallStats, type QuestionWithStats } from './question-stats';

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
			const questions = [
				createMockQuestion({ humanSimilarity: 80 }),
				createMockQuestion({ humanSimilarity: null })
			];

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
