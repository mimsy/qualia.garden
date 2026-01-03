// ABOUTME: Alignment and agreement score calculations for comparing AI responses to human data.
// ABOUTME: Returns scores on 0-5 scale with labels and colors for display.

import { computeMedian, computeMode } from './db/types';

const CACHE_TTL_SECONDS = 3600; // 1 hour

export interface QuestionMeta {
	id: string;
	options: string[];
	responseType: string;
}

export interface QuestionStats {
	questionId: string;
	humanMean: number | null;       // For ordinal: normalized mean (0-1)
	aiMean: number | null;          // For ordinal: normalized mean (0-1)
	humanMode: string | null;       // For nominal: most common human answer
	aiMode: string | null;          // For nominal: most common AI answer
	humanAiScore: number;           // 0-100: AI-human agreement score
	aiAgreementScore: number;       // 0-100: how much AI models agree with each other
	humanAgreementScore: number | null; // 0-100: how much humans agree with each other
	responseType: string;
	modelCount: number;
}

// Cache version - increment when calculation method changes
export const CACHE_VERSION = 3;

export interface SourceStats {
	overallScore: number;           // 0-100: aggregate AI-human agreement
	overallAiAgreement: number;     // 0-100: aggregate AI agreement
	overallHumanAgreement: number | null; // 0-100: aggregate human agreement
	questionStats: QuestionStats[];
	modelCount: number;
	questionCount: number;
	computedAt: string;
	cacheVersion?: number;          // Added in v2 for cache invalidation
}

// Score display helpers (0-100 scale)
export type ScoreLevel = 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';

export function getScoreLabel(score: number): string {
	if (score >= 90) return 'Very High';
	if (score >= 70) return 'High';
	if (score >= 50) return 'Moderate';
	if (score >= 30) return 'Low';
	return 'Very Low';
}

export function getScoreLevel(score: number): ScoreLevel {
	if (score >= 90) return 'very-high';
	if (score >= 70) return 'high';
	if (score >= 50) return 'moderate';
	if (score >= 30) return 'low';
	return 'very-low';
}

// Convert a key to a 0-based index, handling both numeric ("1", "2") and string ("Yes", "No") keys
function keyToIndex(key: string, options: string[]): number {
	// First try parsing as 1-based numeric index
	const numIdx = parseInt(key, 10);
	if (!isNaN(numIdx) && numIdx >= 1 && numIdx <= options.length) {
		return numIdx - 1;
	}
	// Otherwise look up by option label
	const labelIdx = options.indexOf(key);
	return labelIdx >= 0 ? labelIdx : -1;
}

// Normalize a distribution to use 1-indexed numeric keys
// This ensures human distributions (which may use label keys) and AI distributions
// (which use numeric keys) can be compared properly
export function normalizeDistributionKeys(
	dist: Record<string, number>,
	options: string[]
): Record<string, number> {
	const normalized: Record<string, number> = {};
	for (const [key, count] of Object.entries(dist)) {
		const idx = keyToIndex(key, options);
		if (idx >= 0) {
			const numKey = String(idx + 1); // Convert to 1-indexed string
			normalized[numKey] = (normalized[numKey] || 0) + count;
		}
	}
	return normalized;
}

// Calculate normalized mean (0-1) from a distribution
// Handles both numeric keys ("1", "2") and string keys ("Yes", "No")
export function distributionMeanNormalized(
	distribution: Record<string, number>,
	options: string[]
): number | null {
	if (options.length < 2) return null;

	let total = 0;
	let count = 0;
	for (const [key, n] of Object.entries(distribution)) {
		const idx = keyToIndex(key, options);
		if (idx >= 0 && n > 0) {
			total += idx * n;
			count += n;
		}
	}
	if (count === 0) return null;

	const mean = total / count;
	// Normalize to 0-1 scale
	return mean / (options.length - 1);
}

// Calculate normalized mean (0-1) from an array of 1-based string indices
export function arrayMeanNormalized(answers: string[], optionCount: number): number | null {
	if (answers.length === 0 || optionCount < 2) return null;
	const nums = answers.map(a => parseInt(a, 10) - 1).filter(n => !isNaN(n) && n >= 0);
	if (nums.length === 0) return null;
	const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
	return mean / (optionCount - 1);
}

// Calculate normalized standard deviation (0-1) from an array of 1-based indices
export function arrayStdDevNormalized(answers: string[], optionCount: number): number {
	if (optionCount < 2) return 0;
	const nums = answers.map(a => parseInt(a, 10) - 1).filter(n => !isNaN(n) && n >= 0);
	if (nums.length < 2) return 0;
	const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
	const variance = nums.reduce((sum, n) => sum + (n - mean) ** 2, 0) / nums.length;
	const stdDev = Math.sqrt(variance);
	// Max std dev is (optionCount-1)/2 for a perfectly bimodal distribution
	const maxStdDev = (optionCount - 1) / 2;
	return stdDev / maxStdDev;
}

// Legacy: Calculate mean from a distribution (1-based keys) - kept for map page
export function distributionMean(distribution: Record<string, number>): number | null {
	let total = 0;
	let count = 0;
	for (const [key, n] of Object.entries(distribution)) {
		const val = parseInt(key, 10);
		if (!isNaN(val) && n > 0) {
			total += val * n;
			count += n;
		}
	}
	return count > 0 ? total / count : null;
}

// Legacy: Calculate mean from an array of 1-based string keys - kept for map page
export function arrayMean(answers: string[]): number | null {
	if (answers.length === 0) return null;
	const nums = answers.map(a => parseInt(a, 10)).filter(n => !isNaN(n));
	if (nums.length === 0) return null;
	return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// Legacy: Calculate standard deviation - kept for reference
export function arrayStdDev(answers: string[]): number {
	const nums = answers.map(a => parseInt(a, 10)).filter(n => !isNaN(n));
	if (nums.length < 2) return 0;
	const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
	const variance = nums.reduce((sum, n) => sum + (n - mean) ** 2, 0) / nums.length;
	return Math.sqrt(variance);
}

// Get mode (most common answer) from a distribution
export function distributionMode(distribution: Record<string, number>): string | null {
	let maxCount = 0;
	let maxKey: string | null = null;
	for (const [key, count] of Object.entries(distribution)) {
		if (count > maxCount) {
			maxCount = count;
			maxKey = key;
		}
	}
	return maxKey;
}

// Get mode from an array of answers
export function arrayMode(answers: string[]): string | null {
	if (answers.length === 0) return null;
	const counts = new Map<string, number>();
	for (const a of answers) {
		counts.set(a, (counts.get(a) || 0) + 1);
	}
	let maxCount = 0;
	let maxKey: string | null = null;
	for (const [key, count] of counts) {
		if (count > maxCount) {
			maxCount = count;
			maxKey = key;
		}
	}
	return maxKey;
}

// Calculate agreement score (0-100) for ordinal questions using distribution overlap
// This properly handles cases where means are similar but distributions differ
// (e.g., AI picks middle while humans are spread across spectrum)
// Both distributions are normalized to numeric keys before comparison
export function ordinalAgreementScore(
	humanDist: Record<string, number>,
	aiDist: Record<string, number>,
	options?: string[]
): number {
	// Normalize both distributions to numeric keys if options provided
	const normalizedHuman = options ? normalizeDistributionKeys(humanDist, options) : humanDist;
	const normalizedAi = options ? normalizeDistributionKeys(aiDist, options) : aiDist;
	const overlap = distributionOverlap(normalizedHuman, normalizedAi);
	return Math.round(overlap * 100);
}

// Legacy mean-based ordinal agreement (kept for reference, not used)
export function ordinalAgreementScoreMeanBased(humanMean: number, aiMean: number, optionCount: number): number {
	const diff = Math.abs(humanMean - aiMean);
	if (optionCount <= 2) {
		return Math.round(Math.max(0, (1 - diff * 2)) * 100);
	}
	return Math.round(Math.pow(1 - diff, 1.5) * 100);
}

// Calculate internal agreement score (0-100) for ordinal questions
// Measures how much a group of responses agree with each other
// Blends mode dominance (unanimity) with spread penalty
export function ordinalInternalAgreement(answers: string[], optionCount: number): number {
	if (answers.length < 2) return 100; // Perfect agreement if only one answer

	// Mode dominance (unanimity) - what percentage chose the most common answer
	const counts = new Map<string, number>();
	for (const a of answers) {
		counts.set(a, (counts.get(a) || 0) + 1);
	}
	const maxCount = Math.max(...counts.values());
	const unanimity = maxCount / answers.length;

	// Spread penalty based on normalized std dev
	const normalizedStdDev = arrayStdDevNormalized(answers, optionCount);
	const spreadScore = 1 - Math.min(1, normalizedStdDev);

	// Blend: 70% unanimity, 30% spread
	const blended = unanimity * 0.7 + spreadScore * 0.3;
	return Math.round(blended * 100);
}

// Calculate overlap between two distributions (0-1 scale)
// 1 = identical distributions, 0 = no overlap
export function distributionOverlap(
	dist1: Record<string, number>,
	dist2: Record<string, number>
): number {
	const total1 = Object.values(dist1).reduce((a, b) => a + b, 0);
	const total2 = Object.values(dist2).reduce((a, b) => a + b, 0);
	if (total1 === 0 || total2 === 0) return 0;

	const allKeys = new Set([...Object.keys(dist1), ...Object.keys(dist2)]);
	let overlap = 0;
	for (const key of allKeys) {
		const p1 = (dist1[key] || 0) / total1;
		const p2 = (dist2[key] || 0) / total2;
		overlap += Math.min(p1, p2);
	}
	return overlap;
}

// Calculate agreement score (0-100) for nominal questions
// Based on distribution overlap
export function nominalAgreementScore(
	humanDist: Record<string, number> | null,
	aiDist: Record<string, number>
): number {
	if (!humanDist || Object.keys(aiDist).length === 0) return 0;
	const overlap = distributionOverlap(humanDist, aiDist);
	return Math.round(overlap * 100);
}

// Calculate internal agreement score (0-100) for nominal questions
// Based on how concentrated the answers are (unanimity)
export function nominalInternalAgreement(answers: string[]): number {
	if (answers.length < 2) return 100; // Perfect agreement if only one answer
	const counts = new Map<string, number>();
	for (const a of answers) {
		counts.set(a, (counts.get(a) || 0) + 1);
	}
	const maxCount = Math.max(...counts.values());
	const unanimity = maxCount / answers.length;
	return Math.round(unanimity * 100);
}

// Calculate internal agreement from a distribution (0-100)
// Used for computing human agreement from survey data
export function distributionInternalAgreement(dist: Record<string, number>, optionCount: number, isOrdinal: boolean): number {
	const total = Object.values(dist).reduce((a, b) => a + b, 0);
	if (total === 0) return 0;

	if (isOrdinal) {
		// For ordinal: use the same unanimity + spread formula
		// Convert distribution to array of answers for calculation
		const answers: string[] = [];
		for (const [key, count] of Object.entries(dist)) {
			for (let i = 0; i < count; i++) {
				answers.push(key);
			}
		}
		return ordinalInternalAgreement(answers, optionCount);
	} else {
		// For nominal: pure unanimity
		const maxCount = Math.max(...Object.values(dist));
		return Math.round((maxCount / total) * 100);
	}
}

// Compute per-question stats for a source
export function computeQuestionStats(
	questions: QuestionMeta[],
	modelResponses: Map<string, { name: string; responses: Record<string, string | null> }>,
	humanDistributions: Map<string, Record<string, number>>
): QuestionStats[] {
	const stats: QuestionStats[] = [];

	for (const q of questions) {
		const humanDist = humanDistributions.get(q.id);

		// Collect all AI answers for this question
		const aiAnswers: string[] = [];
		for (const [, data] of modelResponses) {
			const ans = data.responses[q.id];
			if (ans !== null && ans !== undefined) {
				aiAnswers.push(ans);
			}
		}

		let humanMean: number | null = null;
		let aiMean: number | null = null;
		let humanMode: string | null = null;
		let aiMode: string | null = null;
		let humanAiScore = 0;
		let aiAgreementScore = 0;
		let humanAgreementScore: number | null = null;
		const isOrdinal = q.responseType === 'ordinal';

		if (isOrdinal) {
			// Ordinal: use distribution overlap for AI-Human agreement
			humanMean = humanDist ? distributionMeanNormalized(humanDist, q.options) : null;
			aiMean = arrayMeanNormalized(aiAnswers, q.options.length);

			// Build AI distribution for overlap calculation
			const aiDist: Record<string, number> = {};
			for (const ans of aiAnswers) {
				aiDist[ans] = (aiDist[ans] || 0) + 1;
			}

			if (humanDist && Object.keys(aiDist).length > 0) {
				humanAiScore = ordinalAgreementScore(humanDist, aiDist, q.options);
			}
			aiAgreementScore = ordinalInternalAgreement(aiAnswers, q.options.length);

			// Compute human internal agreement
			if (humanDist) {
				humanAgreementScore = distributionInternalAgreement(humanDist, q.options.length, true);
			}
		} else {
			// Nominal: use distribution overlap
			// Convert AI answers from 1-indexed numbers to option labels
			const aiAnswersLabeled = aiAnswers.map(ans => {
				const idx = parseInt(ans, 10) - 1;
				return (idx >= 0 && idx < q.options.length) ? q.options[idx] : ans;
			});

			// Convert human distribution keys to option labels
			let humanDistLabeled: Record<string, number> | null = null;
			if (humanDist) {
				humanDistLabeled = {};
				for (const [key, count] of Object.entries(humanDist)) {
					const idx = parseInt(key, 10) - 1;
					const label = (idx >= 0 && idx < q.options.length) ? q.options[idx] : key;
					humanDistLabeled[label] = (humanDistLabeled[label] || 0) + count;
				}
			}

			humanMode = humanDistLabeled ? distributionMode(humanDistLabeled) : null;
			aiMode = arrayMode(aiAnswersLabeled);

			// Build AI distribution for overlap calculation
			const aiDist: Record<string, number> = {};
			for (const ans of aiAnswersLabeled) {
				aiDist[ans] = (aiDist[ans] || 0) + 1;
			}

			humanAiScore = nominalAgreementScore(humanDistLabeled, aiDist);
			aiAgreementScore = nominalInternalAgreement(aiAnswersLabeled);

			// Compute human internal agreement
			if (humanDistLabeled) {
				humanAgreementScore = distributionInternalAgreement(humanDistLabeled, q.options.length, false);
			}
		}

		stats.push({
			questionId: q.id,
			humanMean,
			aiMean,
			humanMode,
			aiMode,
			humanAiScore,
			aiAgreementScore,
			humanAgreementScore,
			responseType: q.responseType,
			modelCount: aiAnswers.length
		});
	}

	return stats;
}

// Compute overall scores (averages of question scores)
export function computeOverallScores(questionStats: QuestionStats[]): {
	overallScore: number;
	overallAiAgreement: number;
	overallHumanAgreement: number | null;
} {
	if (questionStats.length === 0) {
		return { overallScore: 0, overallAiAgreement: 0, overallHumanAgreement: null };
	}

	const totalHumanAi = questionStats.reduce((sum, q) => sum + q.humanAiScore, 0);
	const totalAiAgreement = questionStats.reduce((sum, q) => sum + q.aiAgreementScore, 0);

	const humanAgreementStats = questionStats.filter(q => q.humanAgreementScore !== null);
	const totalHumanAgreement = humanAgreementStats.reduce((sum, q) => sum + (q.humanAgreementScore ?? 0), 0);

	return {
		overallScore: Math.round(totalHumanAi / questionStats.length),
		overallAiAgreement: Math.round(totalAiAgreement / questionStats.length),
		overallHumanAgreement: humanAgreementStats.length > 0
			? Math.round(totalHumanAgreement / humanAgreementStats.length)
			: null
	};
}

// Legacy: Compute overall score only (for backwards compatibility)
export function computeOverallScore(questionStats: QuestionStats[]): number {
	if (questionStats.length === 0) return 0;
	const totalScore = questionStats.reduce((sum, q) => sum + q.humanAiScore, 0);
	return Math.round(totalScore / questionStats.length);
}

// Aggregate multiple raw answers into a single representative answer
export function aggregateResponses(
	answers: string[],
	responseType: string
): string | null {
	if (answers.length === 0) return null;
	return responseType === 'ordinal' ? computeMedian(answers) : computeMode(answers);
}

// Legacy function for backwards compatibility with map page
export function getPluralityAnswer(
	optionCount: number,
	distribution: Record<string, number> | undefined
): string | null {
	if (!distribution) return null;
	return distributionMode(distribution);
}

// Legacy function for backwards compatibility with map page
export function computeAgreement(
	responses1: Record<string, string | null>,
	responses2: Record<string, string | null>,
	questionIds: string[]
): number {
	let agreements = 0;
	let comparisons = 0;

	for (const qId of questionIds) {
		const r1 = responses1?.[qId];
		const r2 = responses2?.[qId];

		if (r1 !== null && r1 !== undefined && r2 !== null && r2 !== undefined) {
			comparisons++;
			if (r1 === r2) {
				agreements++;
			}
		}
	}

	return comparisons > 0 ? Math.round((agreements / comparisons) * 100) : 0;
}

// Legacy function for backwards compatibility
export function buildHumanResponses(
	distributions: Map<string, Record<string, number>>,
	questions: QuestionMeta[]
): Record<string, string | null> {
	const responses: Record<string, string | null> = {};
	for (const q of questions) {
		responses[q.id] = getPluralityAnswer(q.options.length, distributions.get(q.id));
	}
	return responses;
}

// Cache key builders
export function getCacheKey(
	sourceId: string,
	variant: 'overall' | 'full',
	demographic?: { continent?: string; education?: string; age?: string; gender?: string }
): string {
	if (variant === 'overall') {
		return `alignment:source:${sourceId}:overall`;
	}
	if (demographic) {
		const parts = [
			demographic.continent || '_',
			demographic.education || '_',
			demographic.age || '_',
			demographic.gender || '_'
		];
		return `alignment:source:${sourceId}:demo:${parts.join(':')}`;
	}
	return `alignment:source:${sourceId}:full`;
}

// Get cached source stats
export async function getCachedSourceStats(
	kv: KVNamespace | undefined,
	cacheKey: string
): Promise<SourceStats | null> {
	if (!kv) return null;
	try {
		const cached = await kv.get(cacheKey, 'json');
		return cached as SourceStats | null;
	} catch {
		return null;
	}
}

// Set cached source stats
export async function setCachedSourceStats(
	kv: KVNamespace | undefined,
	cacheKey: string,
	data: SourceStats
): Promise<void> {
	if (!kv) return;
	try {
		await kv.put(cacheKey, JSON.stringify(data), { expirationTtl: CACHE_TTL_SECONDS });
	} catch {
		// Ignore cache write failures
	}
}

// Invalidate all cache entries for a source
export async function invalidateSourceCache(
	kv: KVNamespace | undefined,
	sourceId: string
): Promise<void> {
	if (!kv) return;
	try {
		const prefix = `alignment:source:${sourceId}:`;
		const list = await kv.list({ prefix });
		for (const key of list.keys) {
			await kv.delete(key.name);
		}
	} catch {
		// Ignore cache invalidation failures
	}
}

// ---- Backward compatibility aliases ----
// These map old function names to new ones during migration

export const ordinalConsensusScore = ordinalInternalAgreement;
export const nominalConsensusScore = nominalInternalAgreement;

// ---- Legacy exports for backwards compatibility ----
// These are used by the map page and will be removed once it's updated

export interface AlignmentScore {
	id: string;
	name: string;
	score: number;
	type: 'model' | 'human';
}

export interface SourceAlignmentData {
	rankings: AlignmentScore[];
	topModel: AlignmentScore | null;
	questionCount: number;
	modelCount: number;
	computedAt: string;
}

export function computeAlignmentRankings(
	modelResponses: Map<string, { name: string; responses: Record<string, string | null> }>,
	humanResponses: Record<string, string | null>,
	questionIds: string[]
): AlignmentScore[] {
	const rankings: AlignmentScore[] = [];

	for (const [modelId, data] of modelResponses) {
		const score = computeAgreement(data.responses, humanResponses, questionIds);
		rankings.push({
			id: modelId,
			name: data.name,
			score,
			type: 'model'
		});
	}

	rankings.sort((a, b) => b.score - a.score);
	return rankings;
}

export async function getCachedAlignment(
	kv: KVNamespace | undefined,
	cacheKey: string
): Promise<SourceAlignmentData | null> {
	if (!kv) return null;
	try {
		const cached = await kv.get(cacheKey, 'json');
		return cached as SourceAlignmentData | null;
	} catch {
		return null;
	}
}

export async function setCachedAlignment(
	kv: KVNamespace | undefined,
	cacheKey: string,
	data: SourceAlignmentData
): Promise<void> {
	if (!kv) return;
	try {
		await kv.put(cacheKey, JSON.stringify(data), { expirationTtl: CACHE_TTL_SECONDS });
	} catch {
		// Ignore cache write failures
	}
}
