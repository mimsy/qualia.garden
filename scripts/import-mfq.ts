// ABOUTME: Import script for Moral Foundations Questionnaire data.
// ABOUTME: Generates SQL from published norms in Graham et al. (2011) "Mapping the Moral Domain".

import * as fs from 'fs';

// Data from Graham et al. (2011) Table 2 - JPSP 101(2):366-385
// Scale: 0-5 (Not at all relevant to Extremely relevant)
// Sample from YourMorals.org (n=34,476 total)
interface FoundationData {
	name: string;
	questionText: string;
	means: { liberal: number; moderate: number; conservative: number; libertarian: number };
	sds: { liberal: number; moderate: number; conservative: number; libertarian: number };
}

const FOUNDATIONS: FoundationData[] = [
	{
		name: 'Harm/Care',
		questionText:
			'When you decide whether something is right or wrong, how relevant is whether or not someone suffered emotionally?',
		means: { liberal: 3.62, moderate: 3.31, conservative: 2.98, libertarian: 2.8 },
		sds: { liberal: 0.74, moderate: 0.81, conservative: 0.84, libertarian: 0.94 },
	},
	{
		name: 'Fairness/Reciprocity',
		questionText:
			'When you decide whether something is right or wrong, how relevant is whether or not someone acted unfairly?',
		means: { liberal: 3.74, moderate: 3.39, conservative: 3.02, libertarian: 3.19 },
		sds: { liberal: 0.63, moderate: 0.68, conservative: 0.73, libertarian: 0.79 },
	},
	{
		name: 'Ingroup/Loyalty',
		questionText:
			'When you decide whether something is right or wrong, how relevant is whether or not someone showed a lack of loyalty?',
		means: { liberal: 2.07, moderate: 2.58, conservative: 3.08, libertarian: 2.19 },
		sds: { liberal: 0.77, moderate: 0.79, conservative: 0.79, libertarian: 0.89 },
	},
	{
		name: 'Authority/Respect',
		questionText:
			'When you decide whether something is right or wrong, how relevant is whether or not someone showed a lack of respect for authority?',
		means: { liberal: 2.06, moderate: 2.67, conservative: 3.28, libertarian: 2.13 },
		sds: { liberal: 0.79, moderate: 0.77, conservative: 0.71, libertarian: 0.9 },
	},
	{
		name: 'Purity/Sanctity',
		questionText:
			'When you decide whether something is right or wrong, how relevant is whether or not someone violated standards of purity and decency?',
		means: { liberal: 1.27, moderate: 1.99, conservative: 2.89, libertarian: 1.23 },
		sds: { liberal: 0.86, moderate: 1.03, conservative: 1.07, libertarian: 0.98 },
	},
];

// Sample sizes from Graham et al. (2011)
const SAMPLE_SIZES = {
	liberal: 21933,
	moderate: 3203,
	conservative: 4128,
	libertarian: 2999,
	total: 34476,
};

// Response options (0-5 scale)
const OPTIONS = [
	'Not at all relevant',
	'Not very relevant',
	'Slightly relevant',
	'Somewhat relevant',
	'Very relevant',
	'Extremely relevant',
];

// Convert mean and SD to discrete distribution using normal CDF
function normalCDF(x: number, mean: number, sd: number): number {
	// Error function approximation
	const z = (x - mean) / (sd * Math.sqrt(2));
	const t = 1 / (1 + 0.3275911 * Math.abs(z));
	const a1 = 0.254829592;
	const a2 = -0.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
	return 0.5 * (1 + (z >= 0 ? erf : -erf));
}

function meanSDToDistribution(mean: number, sd: number, n: number): Record<string, number> {
	const dist: Record<string, number> = {};
	let totalProb = 0;
	const probs: number[] = [];

	// Calculate probability for each discrete value (0-5)
	for (let i = 0; i <= 5; i++) {
		// Probability of value falling in [i-0.5, i+0.5] range
		const lower = i === 0 ? -Infinity : i - 0.5;
		const upper = i === 5 ? Infinity : i + 0.5;
		const prob = normalCDF(upper, mean, sd) - (lower === -Infinity ? 0 : normalCDF(lower, mean, sd));
		probs.push(prob);
		totalProb += prob;
	}

	// Convert probabilities to counts, ensuring they sum to n
	let assignedCount = 0;
	for (let i = 0; i <= 5; i++) {
		const count = Math.round((probs[i] / totalProb) * n);
		dist[OPTIONS[i]] = count;
		assignedCount += count;
	}

	// Adjust for rounding errors
	const diff = n - assignedCount;
	if (diff !== 0) {
		// Add/subtract from the mode (highest count option)
		const maxKey = Object.entries(dist).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
		dist[maxKey] += diff;
	}

	return dist;
}

function generateId(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 12; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

function escapeSQL(str: string): string {
	return str.replace(/'/g, "''");
}

async function main() {
	console.log('Generating MFQ import from published norms...');
	console.log('Source: Graham et al. (2011) "Mapping the Moral Domain"');
	console.log(`Sample size: ${SAMPLE_SIZES.total} respondents\n`);

	const sql: string[] = [];
	const sourceId = generateId();

	sql.push(`-- Moral Foundations Questionnaire Import`);
	sql.push(`-- Generated: ${new Date().toISOString()}`);
	sql.push(`-- Source: Graham et al. (2011) "Mapping the Moral Domain" JPSP 101(2):366-385`);
	sql.push(`-- Data from YourMorals.org (n=${SAMPLE_SIZES.total})`);
	sql.push('');
	sql.push(`-- Benchmark source`);
	sql.push(`INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  '${sourceId}',
  'Moral Foundations Questionnaire (Graham et al. 2011)',
  'MFQ',
  'https://moralfoundations.org/',
  ${SAMPLE_SIZES.total},
  '2007-2011'
);`);
	sql.push('');

	let questionCount = 0;
	let distributionCount = 0;

	// Answer labels map option strings to themselves
	const answerLabels: Record<string, string> = {};
	for (const opt of OPTIONS) {
		answerLabels[opt] = opt;
	}

	for (const foundation of FOUNDATIONS) {
		const questionId = generateId();

		sql.push(`-- ${foundation.name}`);
		sql.push(`INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '${questionId}',
  '${escapeSQL(foundation.questionText)}',
  'Ethics & Values',
  'multiple_choice',
  '${escapeSQL(JSON.stringify(OPTIONS))}',
  0,
  '${sourceId}',
  'mfq_${foundation.name.toLowerCase().replace(/\//g, '_')}',
  '${escapeSQL(JSON.stringify(answerLabels))}'
);`);
		questionCount++;

		// Overall distribution (weighted average of all groups)
		const totalN = SAMPLE_SIZES.total;
		const overallMean =
			(foundation.means.liberal * SAMPLE_SIZES.liberal +
				foundation.means.moderate * SAMPLE_SIZES.moderate +
				foundation.means.conservative * SAMPLE_SIZES.conservative +
				foundation.means.libertarian * SAMPLE_SIZES.libertarian) /
			totalN;
		// Pooled SD approximation
		const overallSD = Math.sqrt(
			(foundation.sds.liberal ** 2 * SAMPLE_SIZES.liberal +
				foundation.sds.moderate ** 2 * SAMPLE_SIZES.moderate +
				foundation.sds.conservative ** 2 * SAMPLE_SIZES.conservative +
				foundation.sds.libertarian ** 2 * SAMPLE_SIZES.libertarian) /
				totalN
		);

		const overallDist = meanSDToDistribution(overallMean, overallSD, totalN);
		sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '${escapeSQL(JSON.stringify(overallDist))}',
  ${totalN}
);`);
		distributionCount++;

		// Note: MFQ data doesn't have education/age/gender breakdowns in published norms
		// But we have political orientation which we can use as a proxy category
		// We'll store these in a notes field or could extend schema

		sql.push('');
	}

	// Write SQL file
	const outputPath = '/tmp/mfq_import.sql';
	fs.writeFileSync(outputPath, sql.join('\n'));
	console.log(`Generated SQL written to ${outputPath}`);
	console.log(`  Questions: ${questionCount}`);
	console.log(`  Distribution records: ${distributionCount}`);
	console.log('');
	console.log('To apply:');
	console.log('  1. Review the generated SQL');
	console.log('  2. Copy to migrations/0012_mfq_data.sql');
	console.log('  3. Run: npm run db:migrate');
}

main().catch(console.error);
