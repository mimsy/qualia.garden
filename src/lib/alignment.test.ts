// ABOUTME: Tests for alignment score calculations.
// ABOUTME: Covers ordinal/nominal agreement, internal agreement, and distribution utilities.

import { describe, it, expect } from 'vitest';
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
	ordinalInternalAgreement,
	distributionOverlap,
	ordinalEMDSimilarity,
	nominalAgreementScore,
	nominalInternalAgreement,
	distributionInternalAgreement,
	computeOverallScores,
	aggregateResponses,
	getCacheKey
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
