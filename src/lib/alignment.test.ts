// ABOUTME: Tests for alignment score calculations.
// ABOUTME: Covers ordinal/nominal agreement, internal agreement, and distribution utilities.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	getScoreLabel,
	getScoreLevel,
	getScoreColor,
	getScoreBgColor,
	getDivergenceBg,
	normalizeDistributionKeys,
	distributionMeanNormalized,
	arrayMeanNormalized,
	arrayStdDevNormalized,
	distributionMean,
	arrayMean,
	arrayStdDev,
	distributionMode,
	arrayMode,
	ordinalAgreementScore,
	ordinalAgreementScoreMeanBased,
	ordinalInternalAgreement,
	distributionOverlap,
	ordinalEMDSimilarity,
	nominalAgreementScore,
	nominalInternalAgreement,
	distributionInternalAgreement,
	computeOverallScores,
	computeOverallScore,
	computeQuestionStats,
	aggregateResponses,
	getCacheKey,
	getCachedSourceStats,
	setCachedSourceStats,
	invalidateSourceCache,
	computeAgreement,
	buildHumanResponses,
	computeAlignmentRankings,
	getCachedAlignment,
	setCachedAlignment
} from './alignment';

describe('getScoreLabel', () => {
	it('returns "Very High" for scores >= 90', () => {
		expect(getScoreLabel(90)).toBe('Very High');
		expect(getScoreLabel(100)).toBe('Very High');
		expect(getScoreLabel(95)).toBe('Very High');
	});

	it('returns "High" for scores 70-89', () => {
		expect(getScoreLabel(70)).toBe('High');
		expect(getScoreLabel(89)).toBe('High');
		expect(getScoreLabel(80)).toBe('High');
	});

	it('returns "Moderate" for scores 50-69', () => {
		expect(getScoreLabel(50)).toBe('Moderate');
		expect(getScoreLabel(69)).toBe('Moderate');
		expect(getScoreLabel(60)).toBe('Moderate');
	});

	it('returns "Low" for scores 30-49', () => {
		expect(getScoreLabel(30)).toBe('Low');
		expect(getScoreLabel(49)).toBe('Low');
		expect(getScoreLabel(40)).toBe('Low');
	});

	it('returns "Very Low" for scores < 30', () => {
		expect(getScoreLabel(0)).toBe('Very Low');
		expect(getScoreLabel(29)).toBe('Very Low');
		expect(getScoreLabel(15)).toBe('Very Low');
	});
});

describe('getScoreLevel', () => {
	it('returns correct level for each range', () => {
		expect(getScoreLevel(95)).toBe('very-high');
		expect(getScoreLevel(75)).toBe('high');
		expect(getScoreLevel(55)).toBe('moderate');
		expect(getScoreLevel(35)).toBe('low');
		expect(getScoreLevel(15)).toBe('very-low');
	});
});

describe('getScoreColor', () => {
	it('returns Tailwind color classes', () => {
		expect(getScoreColor(95)).toContain('text-');
		expect(getScoreColor(50)).toContain('text-');
	});
});

describe('getScoreBgColor', () => {
	it('returns Tailwind background color classes', () => {
		expect(getScoreBgColor(95)).toContain('bg-');
		expect(getScoreBgColor(50)).toContain('bg-');
	});
});

describe('getDivergenceBg', () => {
	it('returns Tailwind background and border classes', () => {
		expect(getDivergenceBg(95)).toContain('bg-');
		expect(getDivergenceBg(95)).toContain('border-');
	});
});

describe('normalizeDistributionKeys', () => {
	const options = ['Yes', 'No', 'Maybe'];

	it('converts label keys to numeric keys', () => {
		const dist = { Yes: 60, No: 40 };
		const normalized = normalizeDistributionKeys(dist, options);
		expect(normalized).toEqual({ '1': 60, '2': 40 });
	});

	it('keeps numeric keys as-is', () => {
		const dist = { '1': 60, '2': 40 };
		const normalized = normalizeDistributionKeys(dist, options);
		expect(normalized).toEqual({ '1': 60, '2': 40 });
	});

	it('ignores unknown keys', () => {
		const dist = { Yes: 60, Unknown: 40 };
		const normalized = normalizeDistributionKeys(dist, options);
		expect(normalized).toEqual({ '1': 60 });
	});

	it('handles empty distribution', () => {
		const normalized = normalizeDistributionKeys({}, options);
		expect(normalized).toEqual({});
	});

	it('merges duplicate keys after normalization', () => {
		const dist = { Yes: 30, '1': 20 };
		const normalized = normalizeDistributionKeys(dist, options);
		expect(normalized).toEqual({ '1': 50 });
	});
});

describe('distributionMeanNormalized', () => {
	const options = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];

	it('calculates normalized mean for uniform distribution', () => {
		const dist = { '1': 25, '2': 25, '3': 25, '4': 25, '5': 0 };
		const mean = distributionMeanNormalized(dist, options);
		// Mean of [0,1,2,3] (normalized indices) with equal weights = 1.5
		// Normalized by (5-1) = 4: 1.5/4 = 0.375
		expect(mean).toBeCloseTo(0.375, 2);
	});

	it('returns 0 for distribution at first option', () => {
		const dist = { '1': 100 };
		const mean = distributionMeanNormalized(dist, options);
		expect(mean).toBe(0);
	});

	it('returns 1 for distribution at last option', () => {
		const dist = { '5': 100 };
		const mean = distributionMeanNormalized(dist, options);
		expect(mean).toBe(1);
	});

	it('returns 0.5 for middle option', () => {
		const dist = { '3': 100 };
		const mean = distributionMeanNormalized(dist, options);
		expect(mean).toBe(0.5);
	});

	it('returns null for empty distribution', () => {
		const mean = distributionMeanNormalized({}, options);
		expect(mean).toBeNull();
	});

	it('returns null for single option', () => {
		const mean = distributionMeanNormalized({ '1': 100 }, ['Only']);
		expect(mean).toBeNull();
	});
});

describe('arrayMeanNormalized', () => {
	it('calculates normalized mean from answers', () => {
		const answers = ['1', '2', '3', '4', '5'];
		const mean = arrayMeanNormalized(answers, 5);
		expect(mean).toBe(0.5);
	});

	it('returns null for empty array', () => {
		expect(arrayMeanNormalized([], 5)).toBeNull();
	});

	it('returns null for single option count', () => {
		expect(arrayMeanNormalized(['1'], 1)).toBeNull();
	});

	it('returns 0 for all first answers', () => {
		expect(arrayMeanNormalized(['1', '1', '1'], 5)).toBe(0);
	});

	it('returns 1 for all last answers', () => {
		expect(arrayMeanNormalized(['5', '5', '5'], 5)).toBe(1);
	});
});

describe('arrayStdDevNormalized', () => {
	it('returns 0 for unanimous answers', () => {
		const answers = ['3', '3', '3', '3'];
		expect(arrayStdDevNormalized(answers, 5)).toBe(0);
	});

	it('returns 0 for single answer', () => {
		expect(arrayStdDevNormalized(['3'], 5)).toBe(0);
	});

	it('returns high value for spread answers', () => {
		const answers = ['1', '5'];
		const stdDev = arrayStdDevNormalized(answers, 5);
		expect(stdDev).toBeGreaterThan(0.8);
	});

	it('returns moderate value for adjacent answers', () => {
		const answers = ['2', '3', '4'];
		const stdDev = arrayStdDevNormalized(answers, 5);
		expect(stdDev).toBeGreaterThan(0);
		expect(stdDev).toBeLessThan(0.5);
	});
});

describe('distributionMean (legacy)', () => {
	it('calculates mean from 1-based distribution', () => {
		const dist = { '1': 1, '2': 1, '3': 1, '4': 1, '5': 1 };
		expect(distributionMean(dist)).toBe(3);
	});

	it('returns null for empty distribution', () => {
		expect(distributionMean({})).toBeNull();
	});

	it('handles single value', () => {
		expect(distributionMean({ '4': 10 })).toBe(4);
	});
});

describe('arrayMean (legacy)', () => {
	it('calculates mean from answers', () => {
		expect(arrayMean(['1', '3', '5'])).toBe(3);
	});

	it('returns null for empty array', () => {
		expect(arrayMean([])).toBeNull();
	});
});

describe('arrayStdDev (legacy)', () => {
	it('returns 0 for uniform values', () => {
		expect(arrayStdDev(['3', '3', '3'])).toBe(0);
	});

	it('returns 0 for single value', () => {
		expect(arrayStdDev(['3'])).toBe(0);
	});
});

describe('distributionMode', () => {
	it('returns most frequent value', () => {
		const dist = { '1': 10, '2': 50, '3': 30 };
		expect(distributionMode(dist)).toBe('2');
	});

	it('returns null for empty distribution', () => {
		expect(distributionMode({})).toBeNull();
	});

	it('returns first on tie', () => {
		const dist = { '1': 50, '2': 50 };
		const mode = distributionMode(dist);
		expect(['1', '2']).toContain(mode);
	});
});

describe('arrayMode', () => {
	it('returns most frequent value', () => {
		expect(arrayMode(['1', '2', '2', '3'])).toBe('2');
	});

	it('returns null for empty array', () => {
		expect(arrayMode([])).toBeNull();
	});
});

describe('ordinalAgreementScore', () => {
	const options = ['Low', 'Medium', 'High'];

	it('returns 100 for identical distributions', () => {
		const dist = { '1': 33, '2': 34, '3': 33 };
		const score = ordinalAgreementScore(dist, dist, options);
		expect(score).toBe(100);
	});

	it('returns 0 for opposite distributions', () => {
		const humanDist = { '1': 100 };
		const aiDist = { '3': 100 };
		const score = ordinalAgreementScore(humanDist, aiDist, options);
		expect(score).toBe(0);
	});

	it('returns 50 for adjacent distributions', () => {
		const humanDist = { '1': 100 };
		const aiDist = { '2': 100 };
		const score = ordinalAgreementScore(humanDist, aiDist, options);
		expect(score).toBe(50);
	});

	it('handles label-based distributions', () => {
		const humanDist = { Low: 100 };
		const aiDist = { '1': 100 };
		const score = ordinalAgreementScore(humanDist, aiDist, options);
		expect(score).toBe(100);
	});

	it('infers optionCount when options not provided', () => {
		const humanDist = { '1': 50, '2': 50 };
		const aiDist = { '1': 50, '2': 50 };
		// No options provided - should infer from distribution keys
		const score = ordinalAgreementScore(humanDist, aiDist);
		expect(score).toBe(100);
	});

	it('infers higher optionCount from ai distribution', () => {
		const humanDist = { '1': 100 };
		const aiDist = { '3': 100 };
		// No options - should infer max is 3
		const score = ordinalAgreementScore(humanDist, aiDist);
		expect(score).toBe(0);
	});
});

describe('ordinalAgreementScoreMeanBased', () => {
	it('returns 100 for identical means', () => {
		expect(ordinalAgreementScoreMeanBased(0.5, 0.5, 5)).toBe(100);
	});

	it('returns 0 for extreme opposite means', () => {
		expect(ordinalAgreementScoreMeanBased(0, 1, 5)).toBe(0);
	});

	it('handles 2-option questions differently', () => {
		// Binary questions use linear scaling
		const score = ordinalAgreementScoreMeanBased(0.5, 0.75, 2);
		expect(score).toBeGreaterThan(0);
		expect(score).toBeLessThan(100);
	});

	it('uses power scaling for larger option counts', () => {
		// Non-binary uses power 1.5 scaling
		const score = ordinalAgreementScoreMeanBased(0.3, 0.7, 5);
		expect(score).toBeGreaterThan(0);
		expect(score).toBeLessThan(100);
	});

	it('handles edge case of 1 option (weird but valid)', () => {
		// 1 option should still work (binary path)
		const score = ordinalAgreementScoreMeanBased(0.5, 0.5, 1);
		expect(score).toBe(100);
	});
});

describe('ordinalInternalAgreement', () => {
	it('returns 100 for unanimous answers', () => {
		const answers = ['2', '2', '2', '2', '2'];
		const score = ordinalInternalAgreement(answers, 5);
		expect(score).toBe(100);
	});

	it('returns 100 for single answer', () => {
		expect(ordinalInternalAgreement(['3'], 5)).toBe(100);
	});

	it('returns high score for mostly unanimous', () => {
		const answers = ['2', '2', '2', '2', '3'];
		const score = ordinalInternalAgreement(answers, 5);
		expect(score).toBeGreaterThan(70);
	});

	it('returns lower score for spread answers', () => {
		const answers = ['1', '2', '3', '4', '5'];
		const score = ordinalInternalAgreement(answers, 5);
		expect(score).toBeLessThan(50);
	});
});

describe('distributionOverlap', () => {
	it('returns 1 for identical distributions', () => {
		const dist = { A: 50, B: 50 };
		const overlap = distributionOverlap(dist, dist);
		expect(overlap).toBe(1);
	});

	it('returns 0 for disjoint distributions', () => {
		const dist1 = { A: 100 };
		const dist2 = { B: 100 };
		const overlap = distributionOverlap(dist1, dist2);
		expect(overlap).toBe(0);
	});

	it('returns 0.5 for half overlap', () => {
		const dist1 = { A: 50, B: 50 };
		const dist2 = { B: 50, C: 50 };
		const overlap = distributionOverlap(dist1, dist2);
		expect(overlap).toBeCloseTo(0.5, 2);
	});

	it('returns 0 for empty distributions', () => {
		expect(distributionOverlap({}, { A: 100 })).toBe(0);
		expect(distributionOverlap({ A: 100 }, {})).toBe(0);
	});
});

describe('ordinalEMDSimilarity', () => {
	it('returns 1 for identical distributions', () => {
		const dist = { '1': 50, '2': 50 };
		expect(ordinalEMDSimilarity(dist, dist, 2)).toBe(1);
	});

	it('returns 0 for maximally different distributions', () => {
		const dist1 = { '1': 100 };
		const dist2 = { '3': 100 };
		expect(ordinalEMDSimilarity(dist1, dist2, 3)).toBe(0);
	});

	it('returns 0 for empty distributions', () => {
		expect(ordinalEMDSimilarity({}, { '1': 100 }, 3)).toBe(0);
	});

	it('returns 1 for single option', () => {
		expect(ordinalEMDSimilarity({ '1': 100 }, { '1': 100 }, 1)).toBe(1);
	});
});

describe('nominalAgreementScore', () => {
	it('returns 100 for identical distributions', () => {
		const dist = { Yes: 50, No: 50 };
		const score = nominalAgreementScore(dist, dist);
		expect(score).toBe(100);
	});

	it('returns 0 for completely different distributions', () => {
		const humanDist = { Yes: 100 };
		const aiDist = { No: 100 };
		const score = nominalAgreementScore(humanDist, aiDist);
		expect(score).toBe(0);
	});

	it('returns partial overlap for mixed distributions', () => {
		const humanDist = { Yes: 60, No: 40 };
		const aiDist = { Yes: 40, No: 60 };
		const score = nominalAgreementScore(humanDist, aiDist);
		expect(score).toBe(80);
	});

	it('returns 0 for null human distribution', () => {
		expect(nominalAgreementScore(null, { Yes: 100 })).toBe(0);
	});
});

describe('nominalInternalAgreement', () => {
	it('returns 100 for unanimous answers', () => {
		const answers = ['Yes', 'Yes', 'Yes'];
		expect(nominalInternalAgreement(answers)).toBe(100);
	});

	it('returns 100 for single answer', () => {
		expect(nominalInternalAgreement(['Yes'])).toBe(100);
	});

	it('returns 50 for evenly split answers', () => {
		const answers = ['Yes', 'No'];
		expect(nominalInternalAgreement(answers)).toBe(50);
	});

	it('returns 67 for 2:1 split', () => {
		const answers = ['Yes', 'Yes', 'No'];
		expect(nominalInternalAgreement(answers)).toBe(67);
	});
});

describe('distributionInternalAgreement', () => {
	it('handles ordinal distributions', () => {
		const dist = { '1': 100 };
		const score = distributionInternalAgreement(dist, 5, true);
		expect(score).toBe(100);
	});

	it('handles nominal distributions', () => {
		const dist = { Yes: 100 };
		const score = distributionInternalAgreement(dist, 2, false);
		expect(score).toBe(100);
	});

	it('returns 0 for empty distribution', () => {
		expect(distributionInternalAgreement({}, 5, true)).toBe(0);
	});
});

describe('computeOverallScores', () => {
	it('calculates averages across questions', () => {
		const stats = [
			{
				questionId: 'q1',
				humanMean: 0.5,
				aiMean: 0.5,
				humanMode: null,
				aiMode: null,
				humanAiScore: 80,
				aiAgreementScore: 90,
				humanAgreementScore: 70,
				responseType: 'ordinal',
				modelCount: 5
			},
			{
				questionId: 'q2',
				humanMean: 0.3,
				aiMean: 0.4,
				humanMode: null,
				aiMode: null,
				humanAiScore: 60,
				aiAgreementScore: 80,
				humanAgreementScore: 60,
				responseType: 'ordinal',
				modelCount: 5
			}
		];

		const result = computeOverallScores(stats);
		expect(result.overallScore).toBe(70);
		expect(result.overallAiAgreement).toBe(85);
		expect(result.overallHumanAgreement).toBe(65);
	});

	it('handles empty stats', () => {
		const result = computeOverallScores([]);
		expect(result.overallScore).toBe(0);
		expect(result.overallAiAgreement).toBe(0);
		expect(result.overallHumanAgreement).toBeNull();
	});

	it('handles null human agreement', () => {
		const stats = [
			{
				questionId: 'q1',
				humanMean: null,
				aiMean: 0.5,
				humanMode: null,
				aiMode: null,
				humanAiScore: 80,
				aiAgreementScore: 90,
				humanAgreementScore: null,
				responseType: 'ordinal',
				modelCount: 5
			}
		];

		const result = computeOverallScores(stats);
		expect(result.overallHumanAgreement).toBeNull();
	});
});

describe('computeQuestionStats', () => {
	it('computes stats for ordinal questions with human data', () => {
		const questions = [
			{ id: 'q1', options: ['A', 'B', 'C', 'D', 'E'], responseType: 'ordinal' }
		];
		const modelResponses = new Map([
			['m1', { name: 'Model 1', responses: { q1: '3' } }],
			['m2', { name: 'Model 2', responses: { q1: '3' } }],
			['m3', { name: 'Model 3', responses: { q1: '4' } }]
		]);
		const humanDistributions = new Map([['q1', { '3': 60, '4': 40 }]]);

		const stats = computeQuestionStats(questions, modelResponses, humanDistributions);

		expect(stats).toHaveLength(1);
		expect(stats[0].questionId).toBe('q1');
		expect(stats[0].modelCount).toBe(3);
		expect(stats[0].humanAiScore).toBeGreaterThan(0);
		expect(stats[0].aiAgreementScore).toBeGreaterThan(0);
		expect(stats[0].humanAgreementScore).not.toBeNull();
		expect(stats[0].responseType).toBe('ordinal');
	});

	it('computes stats for nominal questions with human data', () => {
		const questions = [
			{ id: 'q1', options: ['Yes', 'No', 'Maybe'], responseType: 'nominal' }
		];
		const modelResponses = new Map([
			['m1', { name: 'Model 1', responses: { q1: '1' } }],
			['m2', { name: 'Model 2', responses: { q1: '1' } }],
			['m3', { name: 'Model 3', responses: { q1: '2' } }]
		]);
		const humanDistributions = new Map([['q1', { '1': 70, '2': 30 }]]);

		const stats = computeQuestionStats(questions, modelResponses, humanDistributions);

		expect(stats).toHaveLength(1);
		expect(stats[0].questionId).toBe('q1');
		expect(stats[0].modelCount).toBe(3);
		expect(stats[0].responseType).toBe('nominal');
		expect(stats[0].humanMode).toBe('Yes'); // Most common in human data
		expect(stats[0].aiMode).toBe('Yes'); // Most common in AI data
	});

	it('handles questions without human distributions', () => {
		const questions = [
			{ id: 'q1', options: ['A', 'B', 'C'], responseType: 'ordinal' }
		];
		const modelResponses = new Map([
			['m1', { name: 'Model 1', responses: { q1: '2' } }]
		]);
		const humanDistributions = new Map<string, Record<string, number>>();

		const stats = computeQuestionStats(questions, modelResponses, humanDistributions);

		expect(stats[0].humanMean).toBeNull();
		expect(stats[0].humanAgreementScore).toBeNull();
		expect(stats[0].humanAiScore).toBe(0);
	});

	it('handles questions without AI responses', () => {
		const questions = [
			{ id: 'q1', options: ['A', 'B', 'C'], responseType: 'ordinal' }
		];
		const modelResponses = new Map([
			['m1', { name: 'Model 1', responses: { q1: null } }]
		]);
		const humanDistributions = new Map([['q1', { '2': 100 }]]);

		const stats = computeQuestionStats(questions, modelResponses, humanDistributions);

		expect(stats[0].modelCount).toBe(0);
		// With no AI responses, internal agreement is 100 (trivially perfect)
		expect(stats[0].aiAgreementScore).toBe(100);
		// But human-AI score should be 0 since no AI responses to compare
		expect(stats[0].humanAiScore).toBe(0);
	});

	it('handles empty questions array', () => {
		const stats = computeQuestionStats([], new Map(), new Map());
		expect(stats).toHaveLength(0);
	});

	it('computes stats for multiple questions', () => {
		const questions = [
			{ id: 'q1', options: ['A', 'B', 'C'], responseType: 'ordinal' },
			{ id: 'q2', options: ['Yes', 'No'], responseType: 'nominal' }
		];
		const modelResponses = new Map([
			['m1', { name: 'Model 1', responses: { q1: '2', q2: '1' } }]
		]);
		const humanDistributions = new Map<string, Record<string, number>>([
			['q1', { '2': 100 }],
			['q2', { '1': 80, '2': 20 }]
		]);

		const stats = computeQuestionStats(questions, modelResponses, humanDistributions);

		expect(stats).toHaveLength(2);
		expect(stats[0].questionId).toBe('q1');
		expect(stats[1].questionId).toBe('q2');
	});
});

describe('computeOverallScore', () => {
	it('computes average of humanAiScores', () => {
		const stats = [
			{ humanAiScore: 80 },
			{ humanAiScore: 60 }
		] as Parameters<typeof computeOverallScore>[0];

		const result = computeOverallScore(stats);
		expect(result).toBe(70);
	});

	it('returns 0 for empty array', () => {
		const result = computeOverallScore([]);
		expect(result).toBe(0);
	});

	it('rounds to nearest integer', () => {
		const stats = [
			{ humanAiScore: 80 },
			{ humanAiScore: 60 },
			{ humanAiScore: 70 }
		] as Parameters<typeof computeOverallScore>[0];

		const result = computeOverallScore(stats);
		expect(result).toBe(70);
	});
});

describe('aggregateResponses', () => {
	it('uses median for ordinal responses', () => {
		const answers = ['1', '2', '3', '4', '5'];
		expect(aggregateResponses(answers, 'ordinal')).toBe('3');
	});

	it('uses mode for nominal responses', () => {
		const answers = ['Yes', 'Yes', 'No'];
		expect(aggregateResponses(answers, 'nominal')).toBe('Yes');
	});

	it('returns null for empty answers', () => {
		expect(aggregateResponses([], 'ordinal')).toBeNull();
	});
});

describe('getCacheKey', () => {
	it('builds overall key', () => {
		const key = getCacheKey('wvs-7', 'overall');
		expect(key).toBe('alignment:source:wvs-7:overall');
	});

	it('builds full key', () => {
		const key = getCacheKey('wvs-7', 'full');
		expect(key).toBe('alignment:source:wvs-7:full');
	});

	it('builds demographic key', () => {
		const key = getCacheKey('wvs-7', 'full', { continent: 'Europe', education: 'High' });
		expect(key).toBe('alignment:source:wvs-7:demo:Europe:High:_:_');
	});

	it('uses underscores for missing demographics', () => {
		const key = getCacheKey('wvs-7', 'full', {});
		expect(key).toBe('alignment:source:wvs-7:demo:_:_:_:_');
	});
});

// Mock KVNamespace for cache tests
function createMockKV(data: Record<string, unknown> = {}) {
	const store = { ...data };
	return {
		get: vi.fn(async (key: string, type?: string) => {
			const value = store[key];
			if (value === undefined) return null;
			return type === 'json' ? value : JSON.stringify(value);
		}),
		put: vi.fn(async (key: string, value: string) => {
			store[key] = JSON.parse(value);
		}),
		delete: vi.fn(async (key: string) => {
			delete store[key];
		}),
		list: vi.fn(async ({ prefix }: { prefix: string }) => ({
			keys: Object.keys(store)
				.filter((k) => k.startsWith(prefix))
				.map((name) => ({ name }))
		}))
	} as unknown as KVNamespace;
}

describe('getCachedSourceStats', () => {
	it('returns null when kv is undefined', async () => {
		const result = await getCachedSourceStats(undefined, 'test-key');
		expect(result).toBeNull();
	});

	it('returns cached data when available', async () => {
		const mockData = { alignment: 75, consensus: 80 };
		const kv = createMockKV({ 'test-key': mockData });

		const result = await getCachedSourceStats(kv, 'test-key');
		expect(result).toEqual(mockData);
	});

	it('returns null when key not found', async () => {
		const kv = createMockKV({});

		const result = await getCachedSourceStats(kv, 'nonexistent');
		expect(result).toBeNull();
	});

	it('returns null on error', async () => {
		const kv = {
			get: vi.fn().mockRejectedValue(new Error('KV error'))
		} as unknown as KVNamespace;

		const result = await getCachedSourceStats(kv, 'test-key');
		expect(result).toBeNull();
	});
});

describe('setCachedSourceStats', () => {
	it('does nothing when kv is undefined', async () => {
		await setCachedSourceStats(undefined, 'test-key', { alignment: 75 } as never);
		// Should not throw
	});

	it('stores data in cache', async () => {
		const kv = createMockKV();
		const data = { alignment: 75, consensus: 80 };

		await setCachedSourceStats(kv, 'test-key', data as never);
		expect(kv.put).toHaveBeenCalledWith(
			'test-key',
			JSON.stringify(data),
			expect.objectContaining({ expirationTtl: expect.any(Number) })
		);
	});

	it('ignores errors', async () => {
		const kv = {
			put: vi.fn().mockRejectedValue(new Error('KV error'))
		} as unknown as KVNamespace;

		// Should not throw
		await setCachedSourceStats(kv, 'test-key', { alignment: 75 } as never);
	});
});

describe('invalidateSourceCache', () => {
	it('does nothing when kv is undefined', async () => {
		await invalidateSourceCache(undefined, 'source-1');
		// Should not throw
	});

	it('deletes all cache entries for source', async () => {
		const kv = createMockKV({
			'alignment:source:source-1:overall': { data: 1 },
			'alignment:source:source-1:full': { data: 2 },
			'alignment:source:source-2:overall': { data: 3 }
		});

		await invalidateSourceCache(kv, 'source-1');

		expect(kv.delete).toHaveBeenCalledWith('alignment:source:source-1:overall');
		expect(kv.delete).toHaveBeenCalledWith('alignment:source:source-1:full');
		expect(kv.delete).not.toHaveBeenCalledWith('alignment:source:source-2:overall');
	});

	it('ignores errors', async () => {
		const kv = {
			list: vi.fn().mockRejectedValue(new Error('KV error'))
		} as unknown as KVNamespace;

		// Should not throw
		await invalidateSourceCache(kv, 'source-1');
	});
});

describe('computeAgreement', () => {
	it('computes perfect agreement', () => {
		const r1 = { q1: '1', q2: '2', q3: '3' };
		const r2 = { q1: '1', q2: '2', q3: '3' };
		const result = computeAgreement(r1, r2, ['q1', 'q2', 'q3']);
		expect(result).toBe(100);
	});

	it('computes partial agreement', () => {
		const r1 = { q1: '1', q2: '2', q3: '3' };
		const r2 = { q1: '1', q2: '1', q3: '3' };
		const result = computeAgreement(r1, r2, ['q1', 'q2', 'q3']);
		expect(result).toBe(67); // 2/3 = 66.67% rounded
	});

	it('computes zero agreement', () => {
		const r1 = { q1: '1', q2: '2', q3: '3' };
		const r2 = { q1: '4', q2: '5', q3: '6' };
		const result = computeAgreement(r1, r2, ['q1', 'q2', 'q3']);
		expect(result).toBe(0);
	});

	it('skips null values', () => {
		const r1 = { q1: '1', q2: null, q3: '3' };
		const r2 = { q1: '1', q2: '2', q3: '3' };
		const result = computeAgreement(r1, r2, ['q1', 'q2', 'q3']);
		expect(result).toBe(100); // 2/2 comparisons
	});

	it('skips missing keys', () => {
		const r1 = { q1: '1' };
		const r2 = { q1: '1', q2: '2' };
		const result = computeAgreement(r1, r2, ['q1', 'q2']);
		expect(result).toBe(100); // only q1 compared
	});

	it('returns 0 for no valid comparisons', () => {
		const r1 = { q1: null };
		const r2 = { q1: null };
		const result = computeAgreement(r1, r2, ['q1']);
		expect(result).toBe(0);
	});

	it('handles empty question list', () => {
		const r1 = { q1: '1' };
		const r2 = { q1: '1' };
		const result = computeAgreement(r1, r2, []);
		expect(result).toBe(0);
	});
});

describe('buildHumanResponses', () => {
	it('builds responses from distributions', () => {
		const distributions = new Map<string, Record<string, number>>([
			['q1', { '1': 60, '2': 40 }],
			['q2', { '1': 30, '2': 70 }]
		]);
		const questions = [
			{ id: 'q1', options: ['A', 'B'] },
			{ id: 'q2', options: ['A', 'B'] }
		];

		const result = buildHumanResponses(distributions, questions as never);

		expect(result.q1).toBe('1'); // plurality answer
		expect(result.q2).toBe('2'); // plurality answer
	});

	it('handles missing distributions', () => {
		const distributions = new Map<string, Record<string, number>>();
		const questions = [{ id: 'q1', options: ['A', 'B'] }];

		const result = buildHumanResponses(distributions, questions as never);

		expect(result.q1).toBeNull();
	});
});

describe('computeAlignmentRankings', () => {
	it('computes rankings for multiple models', () => {
		const modelResponses = new Map([
			['m1', { name: 'Model 1', responses: { q1: '1', q2: '1' } }],
			['m2', { name: 'Model 2', responses: { q1: '1', q2: '2' } }]
		]);
		const humanResponses = { q1: '1', q2: '1' };
		const questionIds = ['q1', 'q2'];

		const result = computeAlignmentRankings(modelResponses, humanResponses, questionIds);

		expect(result).toHaveLength(2);
		expect(result[0].id).toBe('m1'); // 100% agreement
		expect(result[0].score).toBe(100);
		expect(result[1].id).toBe('m2'); // 50% agreement
		expect(result[1].score).toBe(50);
	});

	it('sorts by score descending', () => {
		const modelResponses = new Map([
			['m1', { name: 'Low', responses: { q1: '2' } }],
			['m2', { name: 'High', responses: { q1: '1' } }]
		]);
		const humanResponses = { q1: '1' };

		const result = computeAlignmentRankings(modelResponses, humanResponses, ['q1']);

		expect(result[0].name).toBe('High');
		expect(result[1].name).toBe('Low');
	});

	it('handles empty model list', () => {
		const result = computeAlignmentRankings(new Map(), { q1: '1' }, ['q1']);
		expect(result).toHaveLength(0);
	});
});

describe('getCachedAlignment', () => {
	it('returns null when kv is undefined', async () => {
		const result = await getCachedAlignment(undefined, 'test-key');
		expect(result).toBeNull();
	});

	it('returns cached data when available', async () => {
		const mockData = {
			rankings: [{ id: 'm1', name: 'Model 1', score: 80, type: 'model' }],
			topModel: null,
			questionCount: 10,
			modelCount: 5,
			computedAt: '2024-01-01'
		};
		const kv = createMockKV({ 'test-key': mockData });

		const result = await getCachedAlignment(kv, 'test-key');
		expect(result).toEqual(mockData);
	});

	it('returns null on error', async () => {
		const kv = {
			get: vi.fn().mockRejectedValue(new Error('KV error'))
		} as unknown as KVNamespace;

		const result = await getCachedAlignment(kv, 'test-key');
		expect(result).toBeNull();
	});
});

describe('setCachedAlignment', () => {
	it('does nothing when kv is undefined', async () => {
		await setCachedAlignment(undefined, 'test-key', {} as never);
		// Should not throw
	});

	it('stores data in cache', async () => {
		const kv = createMockKV();
		const data = {
			rankings: [],
			topModel: null,
			questionCount: 10,
			modelCount: 5,
			computedAt: '2024-01-01'
		};

		await setCachedAlignment(kv, 'test-key', data);
		expect(kv.put).toHaveBeenCalledWith(
			'test-key',
			JSON.stringify(data),
			expect.objectContaining({ expirationTtl: expect.any(Number) })
		);
	});

	it('ignores errors', async () => {
		const kv = {
			put: vi.fn().mockRejectedValue(new Error('KV error'))
		} as unknown as KVNamespace;

		// Should not throw
		await setCachedAlignment(kv, 'test-key', {} as never);
	});
});
