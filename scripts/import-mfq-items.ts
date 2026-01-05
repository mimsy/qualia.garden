// ABOUTME: Import script for all 30 MFQ items with item-level distributions.
// ABOUTME: Reads raw response data from Wormley et al. (2023) OSF repository.

import * as fs from 'fs';

// MFQ item definitions - 30 scored items (excluding catch items 6 and 22)
// Part 1: Relevance items (1-16, excluding 6)
// Part 2: Judgment items (17-32, excluding 22)
interface MFQItem {
	itemNumber: number; // Original MFQ item number (1-32)
	foundation: 'harm' | 'fairness' | 'loyalty' | 'authority' | 'purity';
	part: 1 | 2; // 1 = Relevance, 2 = Judgment
	text: string;
	questionPrefix: string; // For forming the full question
}

const MFQ_ITEMS: MFQItem[] = [
	// Part 1: Relevance items
	{
		itemNumber: 1,
		foundation: 'harm',
		part: 1,
		text: 'Whether or not someone suffered emotionally',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 2,
		foundation: 'fairness',
		part: 1,
		text: 'Whether or not some people were treated differently than others',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 3,
		foundation: 'loyalty',
		part: 1,
		text: "Whether or not someone's action showed love for his or her country",
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 4,
		foundation: 'authority',
		part: 1,
		text: 'Whether or not someone showed a lack of respect for authority',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 5,
		foundation: 'purity',
		part: 1,
		text: 'Whether or not someone violated standards of purity and decency',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	// Item 6 is catch item - skipped
	{
		itemNumber: 7,
		foundation: 'harm',
		part: 1,
		text: 'Whether or not someone cared for someone weak or vulnerable',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 8,
		foundation: 'fairness',
		part: 1,
		text: 'Whether or not someone acted unfairly',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 9,
		foundation: 'loyalty',
		part: 1,
		text: 'Whether or not someone did something to betray his or her group',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 10,
		foundation: 'authority',
		part: 1,
		text: 'Whether or not someone conformed to the traditions of society',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 11,
		foundation: 'purity',
		part: 1,
		text: 'Whether or not someone did something disgusting',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 12,
		foundation: 'harm',
		part: 1,
		text: 'Whether or not someone was cruel',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 13,
		foundation: 'fairness',
		part: 1,
		text: 'Whether or not someone was denied his or her rights',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 14,
		foundation: 'loyalty',
		part: 1,
		text: 'Whether or not someone showed a lack of loyalty',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 15,
		foundation: 'authority',
		part: 1,
		text: 'Whether or not an action caused chaos or disorder',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},
	{
		itemNumber: 16,
		foundation: 'purity',
		part: 1,
		text: 'Whether or not someone acted in a way that God would approve of',
		questionPrefix: 'When deciding whether something is right or wrong, how relevant is:',
	},

	// Part 2: Judgment items
	{
		itemNumber: 17,
		foundation: 'harm',
		part: 2,
		text: 'Compassion for those who are suffering is the most crucial virtue.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 18,
		foundation: 'fairness',
		part: 2,
		text: 'When the government makes laws, the number one principle should be ensuring that everyone is treated fairly.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 19,
		foundation: 'loyalty',
		part: 2,
		text: "I am proud of my country's history.",
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 20,
		foundation: 'authority',
		part: 2,
		text: 'Respect for authority is something all children need to learn.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 21,
		foundation: 'purity',
		part: 2,
		text: 'People should not do things that are disgusting, even if no one is harmed.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	// Item 22 is catch item - skipped
	{
		itemNumber: 23,
		foundation: 'harm',
		part: 2,
		text: 'One of the worst things a person could do is hurt a defenseless animal.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 24,
		foundation: 'fairness',
		part: 2,
		text: 'Justice is the most important requirement for a society.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 25,
		foundation: 'loyalty',
		part: 2,
		text: 'People should be loyal to their family members, even when they have done something wrong.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 26,
		foundation: 'authority',
		part: 2,
		text: 'Men and women each have different roles to play in society.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 27,
		foundation: 'purity',
		part: 2,
		text: 'I would call some acts wrong on the grounds that they are unnatural.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 28,
		foundation: 'harm',
		part: 2,
		text: 'It can never be right to kill a human being.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 29,
		foundation: 'fairness',
		part: 2,
		text: 'It is morally wrong that rich children inherit a lot of money while poor children inherit nothing.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 30,
		foundation: 'authority',
		part: 2,
		text: 'It is more important to be a team player than to express oneself.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 31,
		foundation: 'loyalty',
		part: 2,
		text: "If I were a soldier and disagreed with my commanding officer's orders, I would obey anyway because that is my duty.",
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
	{
		itemNumber: 32,
		foundation: 'purity',
		part: 2,
		text: 'Chastity is an important and valuable virtue.',
		questionPrefix: 'Please indicate your agreement or disagreement:',
	},
];

// Response options for each part (1-6 scale as used in the studies)
const RELEVANCE_OPTIONS = [
	'Not at all relevant',
	'Not very relevant',
	'Slightly relevant',
	'Somewhat relevant',
	'Very relevant',
	'Extremely relevant',
];

const JUDGMENT_OPTIONS = [
	'Strongly disagree',
	'Moderately disagree',
	'Slightly disagree',
	'Slightly agree',
	'Moderately agree',
	'Strongly agree',
];

// Column mappings for different study formats
// Study 1 & 3: harm_1, harm_2, harm_3, fair_1, etc. and A2harm_1, A2fair_1, etc.
// Study 4: MFQ1-MFQ32
// Study 5: MFQRel1-MFQRel16, MFQJud1-MFQJud16

// Map from item number to Study 1/3 column names
const STUDY1_COLUMN_MAP: Record<number, string> = {
	1: 'harm_1',
	2: 'fair_1',
	3: 'ingroup_1',
	4: 'authority_1',
	5: 'purity_1',
	7: 'harm_2',
	8: 'fair_2',
	9: 'ingroup_2',
	10: 'authority_2',
	11: 'purity_2',
	12: 'harm_3',
	13: 'fair_3',
	14: 'ingroup_3',
	15: 'authority_3',
	16: 'purity_3',
	17: 'A2harm_1',
	18: 'A2fair_1',
	19: 'A2ingroup_1',
	20: 'A2authority_1',
	21: 'A2purity_1',
	23: 'A2harm_2',
	24: 'A2fair_2',
	25: 'A2ingroup_2',
	26: 'A2authority_2',
	27: 'A2purity_2',
	28: 'A2harm_3',
	29: 'A2fair_3',
	30: 'A2authority_3',
	31: 'A2ingroup_3',
	32: 'A2purity_3',
};

function parseCSV(content: string): Record<string, string>[] {
	const lines = content.trim().split('\n');
	// Handle BOM and quoted headers
	let headerLine = lines[0].replace(/^\uFEFF/, '');
	const headers = headerLine.split(',').map((h) => h.replace(/^"|"$/g, '').trim());

	const rows: Record<string, string>[] = [];
	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',');
		const row: Record<string, string> = {};
		for (let j = 0; j < headers.length; j++) {
			row[headers[j]] = values[j]?.replace(/^"|"$/g, '').trim() || '';
		}
		rows.push(row);
	}
	return rows;
}

function extractResponses(
	rows: Record<string, string>[],
	itemNumber: number,
	format: 'study1' | 'study4' | 'study5'
): number[] {
	const responses: number[] = [];

	for (const row of rows) {
		let value: string | undefined;

		if (format === 'study1') {
			const colName = STUDY1_COLUMN_MAP[itemNumber];
			value = row[colName];
		} else if (format === 'study4') {
			value = row[`MFQ${itemNumber}`];
		} else if (format === 'study5') {
			if (itemNumber <= 16) {
				value = row[`MFQRel${itemNumber}`];
			} else {
				value = row[`MFQJud${itemNumber - 16}`];
			}
		}

		if (value && value.trim() !== '') {
			const num = parseInt(value, 10);
			if (!isNaN(num) && num >= 1 && num <= 6) {
				responses.push(num);
			}
		}
	}

	return responses;
}

function computeDistribution(responses: number[], options: string[]): Record<string, number> {
	const dist: Record<string, number> = {};
	for (const opt of options) {
		dist[opt] = 0;
	}

	for (const response of responses) {
		// Responses are 1-6, map to option index 0-5
		const optionIndex = response - 1;
		if (optionIndex >= 0 && optionIndex < options.length) {
			dist[options[optionIndex]]++;
		}
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
	console.log('Generating MFQ import from Wormley et al. (2023) raw data...\n');

	// Read all data files
	const dataDir = process.cwd();
	const allResponses: Map<number, number[]> = new Map();

	// Initialize response arrays for each item
	for (const item of MFQ_ITEMS) {
		allResponses.set(item.itemNumber, []);
	}

	// Study 1
	const study1Path = `${dataDir}/mfq-study-1-data.csv`;
	if (fs.existsSync(study1Path)) {
		const rows = parseCSV(fs.readFileSync(study1Path, 'utf-8'));
		console.log(`Study 1: ${rows.length} rows`);
		for (const item of MFQ_ITEMS) {
			const responses = extractResponses(rows, item.itemNumber, 'study1');
			allResponses.get(item.itemNumber)!.push(...responses);
		}
	}

	// Study 3 (same format as Study 1)
	const study3Path = `${dataDir}/mfq-study-3-data.csv`;
	if (fs.existsSync(study3Path)) {
		const rows = parseCSV(fs.readFileSync(study3Path, 'utf-8'));
		console.log(`Study 3: ${rows.length} rows`);
		for (const item of MFQ_ITEMS) {
			const responses = extractResponses(rows, item.itemNumber, 'study1');
			allResponses.get(item.itemNumber)!.push(...responses);
		}
	}

	// Study 4
	const study4Path = `${dataDir}/mfq-study-4-data.csv`;
	if (fs.existsSync(study4Path)) {
		const rows = parseCSV(fs.readFileSync(study4Path, 'utf-8'));
		console.log(`Study 4: ${rows.length} rows`);
		for (const item of MFQ_ITEMS) {
			const responses = extractResponses(rows, item.itemNumber, 'study4');
			allResponses.get(item.itemNumber)!.push(...responses);
		}
	}

	// Study 5
	const study5Path = `${dataDir}/mfq-study-5-data.csv`;
	if (fs.existsSync(study5Path)) {
		const rows = parseCSV(fs.readFileSync(study5Path, 'utf-8'));
		console.log(`Study 5: ${rows.length} rows`);
		for (const item of MFQ_ITEMS) {
			const responses = extractResponses(rows, item.itemNumber, 'study5');
			allResponses.get(item.itemNumber)!.push(...responses);
		}
	}

	// Calculate total sample size
	const sampleSizes = MFQ_ITEMS.map((item) => allResponses.get(item.itemNumber)!.length);
	const minSampleSize = Math.min(...sampleSizes);
	const maxSampleSize = Math.max(...sampleSizes);
	console.log(`\nTotal responses per item: ${minSampleSize} - ${maxSampleSize}`);

	// Generate SQL
	const sql: string[] = [];
	const sourceId = generateId();

	sql.push(`-- Moral Foundations Questionnaire (MFQ-30) Import`);
	sql.push(`-- Generated: ${new Date().toISOString()}`);
	sql.push(`-- Source: Wormley et al. (2023) "Measuring Morality" OSF data`);
	sql.push(`-- https://osf.io/g72n6/`);
	sql.push('');

	// First, delete old MFQ data
	sql.push(`-- Remove old MFQ foundation-level data`);
	sql.push(`DELETE FROM human_response_distributions WHERE benchmark_source_id IN (SELECT id FROM benchmark_sources WHERE short_name = 'MFQ');`);
	sql.push(`DELETE FROM questions WHERE benchmark_source_id IN (SELECT id FROM benchmark_sources WHERE short_name = 'MFQ');`);
	sql.push(`DELETE FROM benchmark_sources WHERE short_name = 'MFQ';`);
	sql.push('');

	sql.push(`-- Benchmark source`);
	sql.push(`INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range, description) VALUES (
  '${sourceId}',
  'Moral Foundations Questionnaire (Wormley et al. 2023)',
  'MFQ',
  'https://osf.io/g72n6/',
  ${maxSampleSize},
  '2023',
  'Item-level MFQ-30 data from Wormley et al. (2023) "Measuring Morality: An Examination of the Moral Foundation Questionnaire''s Factor Structure". Combined data from Studies 1, 3, 4, and 5.'
);`);
	sql.push('');

	let questionCount = 0;
	let distributionCount = 0;

	for (const item of MFQ_ITEMS) {
		const responses = allResponses.get(item.itemNumber)!;
		if (responses.length === 0) {
			console.warn(`Warning: No responses for item ${item.itemNumber}`);
			continue;
		}

		const options = item.part === 1 ? RELEVANCE_OPTIONS : JUDGMENT_OPTIONS;
		const distribution = computeDistribution(responses, options);
		const questionId = generateId();

		// Create answer labels (map options to themselves)
		const answerLabels: Record<string, string> = {};
		for (const opt of options) {
			answerLabels[opt] = opt;
		}

		const fullQuestion = `${item.questionPrefix} "${item.text}"`;
		const foundationName =
			item.foundation.charAt(0).toUpperCase() + item.foundation.slice(1);

		sql.push(`-- Item ${item.itemNumber}: ${foundationName} (Part ${item.part})`);
		sql.push(`INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '${questionId}',
  '${escapeSQL(fullQuestion)}',
  'Ethics',
  'multiple_choice',
  '${escapeSQL(JSON.stringify(options))}',
  0,
  '${sourceId}',
  'mfq_item_${item.itemNumber}',
  '${escapeSQL(JSON.stringify(answerLabels))}'
);`);
		questionCount++;

		sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '${escapeSQL(JSON.stringify(distribution))}',
  ${responses.length}
);`);
		distributionCount++;
		sql.push('');
	}

	// Write SQL file
	const outputPath = '/tmp/mfq_items_import.sql';
	fs.writeFileSync(outputPath, sql.join('\n'));
	console.log(`\nGenerated SQL written to ${outputPath}`);
	console.log(`  Questions: ${questionCount}`);
	console.log(`  Distribution records: ${distributionCount}`);
	console.log('');
	console.log('To apply:');
	console.log('  1. Review the generated SQL');
	console.log('  2. Copy to migrations/00XX_mfq_items.sql');
	console.log('  3. Run: npm run db:migrate');
}

main().catch(console.error);
