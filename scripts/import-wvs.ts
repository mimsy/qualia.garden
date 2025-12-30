// ABOUTME: Import script for World Values Survey data from WorldValuesBench.
// ABOUTME: Generates SQL to populate benchmark_sources, questions, and human_response_distributions.

import * as fs from 'fs';
import * as path from 'path';

// Country to continent mapping
const COUNTRY_CONTINENTS: Record<string, string> = {
	// Europe
	ALB: 'Europe', AND: 'Europe', ARM: 'Europe', AUT: 'Europe', AZE: 'Europe',
	BLR: 'Europe', BIH: 'Europe', BGR: 'Europe', HRV: 'Europe', CYP: 'Europe',
	CZE: 'Europe', DNK: 'Europe', EST: 'Europe', FIN: 'Europe', FRA: 'Europe',
	GEO: 'Europe', DEU: 'Europe', GRC: 'Europe', HUN: 'Europe', ISL: 'Europe',
	ITA: 'Europe', LVA: 'Europe', LTU: 'Europe', MKD: 'Europe', MNE: 'Europe',
	NLD: 'Europe', NOR: 'Europe', POL: 'Europe', PRT: 'Europe', ROU: 'Europe',
	RUS: 'Europe', SRB: 'Europe', SVK: 'Europe', SVN: 'Europe', ESP: 'Europe',
	SWE: 'Europe', CHE: 'Europe', UKR: 'Europe', GBR: 'Europe',
	// Asia
	BGD: 'Asia', CHN: 'Asia', HKG: 'Asia', IND: 'Asia', IDN: 'Asia',
	IRN: 'Asia', IRQ: 'Asia', JPN: 'Asia', JOR: 'Asia', KAZ: 'Asia',
	KGZ: 'Asia', LBN: 'Asia', MAC: 'Asia', MYS: 'Asia', MDV: 'Asia',
	MNG: 'Asia', MMR: 'Asia', PAK: 'Asia', PHL: 'Asia', SGP: 'Asia',
	KOR: 'Asia', TWN: 'Asia', TJK: 'Asia', THA: 'Asia', TUR: 'Asia',
	VNM: 'Asia',
	// Africa
	EGY: 'Africa', ETH: 'Africa', KEN: 'Africa', LBY: 'Africa', MAR: 'Africa',
	MOR: 'Africa', NGA: 'Africa', TUN: 'Africa', ZWE: 'Africa',
	// Americas
	ARG: 'Americas', BOL: 'Americas', BRA: 'Americas', CAN: 'Americas',
	CHL: 'Americas', COL: 'Americas', ECU: 'Americas', GTM: 'Americas',
	MEX: 'Americas', NIC: 'Americas', PER: 'Americas', PRI: 'Americas',
	USA: 'Americas', URY: 'Americas', VEN: 'Americas',
	// Oceania
	AUS: 'Oceania', NZL: 'Oceania',
};

// Education level grouping (ISCED codes)
function getEducationLevel(isced: number): string | null {
	if (isced < 0) return null; // Missing/not asked
	if (isced <= 1) return 'Primary';
	if (isced <= 3) return 'Secondary';
	return 'Tertiary'; // 4-8
}

interface QuestionMeta {
	question: string;
	category: string;
	use_case: string;
	answer_scale_min: number | '';
	answer_scale_max: number | '';
	answer_data_type: string;
}

interface CodebookEntry {
	question: string;
	question_instruction: string;
	type: string;
	choices: Record<string, string>;
}

interface Distribution {
	[answer: string]: number;
}

interface AggregatedData {
	overall: Distribution;
	byContinent: Record<string, Distribution>;
	byEducation: Record<string, Distribution>;
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
	// Load data files
	const questionMeta: Record<string, QuestionMeta> = JSON.parse(
		fs.readFileSync('/tmp/question_metadata.json', 'utf-8')
	);
	const codebook: Record<string, CodebookEntry> = JSON.parse(
		fs.readFileSync('/tmp/codebook.json', 'utf-8')
	);

	// Parse CSV
	const csvContent = fs.readFileSync('/tmp/wvs_subset.csv', 'utf-8');
	const lines = csvContent.trim().split('\n');
	const headers = lines[0].split(',').map((h) => h.replace(/"/g, ''));

	// Find column indices
	const countryIdx = headers.indexOf('B_COUNTRY_ALPHA');
	const educationIdx = headers.indexOf('Q275');

	// Get all value questions that exist in both metadata and CSV
	const valueQuestions = Object.entries(questionMeta)
		.filter(([id, meta]) => meta.use_case === 'value' && headers.includes(id))
		.map(([id]) => id);

	console.log(`Found ${valueQuestions.length} value questions in CSV`);

	// Parse responses
	const responses: Array<{
		country: string;
		education: number;
		answers: Record<string, number>;
	}> = [];

	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',').map((v) => v.replace(/"/g, ''));
		const country = values[countryIdx];
		const education = parseInt(values[educationIdx], 10);

		const answers: Record<string, number> = {};
		for (const qId of valueQuestions) {
			const idx = headers.indexOf(qId);
			if (idx >= 0) {
				const val = parseInt(values[idx], 10);
				if (!isNaN(val) && val > 0) {
					// Skip negative values (missing/not asked)
					answers[qId] = val;
				}
			}
		}

		responses.push({ country, education, answers });
	}

	console.log(`Parsed ${responses.length} responses`);

	// Aggregate data per question
	const aggregations: Record<string, AggregatedData> = {};

	for (const qId of valueQuestions) {
		aggregations[qId] = {
			overall: {},
			byContinent: {},
			byEducation: {},
		};
	}

	for (const resp of responses) {
		const continent = COUNTRY_CONTINENTS[resp.country] || null;
		const eduLevel = getEducationLevel(resp.education);

		for (const [qId, answer] of Object.entries(resp.answers)) {
			const agg = aggregations[qId];
			const ansKey = String(answer);

			// Overall
			agg.overall[ansKey] = (agg.overall[ansKey] || 0) + 1;

			// By continent
			if (continent) {
				if (!agg.byContinent[continent]) agg.byContinent[continent] = {};
				agg.byContinent[continent][ansKey] =
					(agg.byContinent[continent][ansKey] || 0) + 1;
			}

			// By education
			if (eduLevel) {
				if (!agg.byEducation[eduLevel]) agg.byEducation[eduLevel] = {};
				agg.byEducation[eduLevel][ansKey] =
					(agg.byEducation[eduLevel][ansKey] || 0) + 1;
			}
		}
	}

	// Generate SQL
	const sql: string[] = [];
	const sourceId = generateId();

	// Insert benchmark source
	sql.push(`-- Benchmark source`);
	sql.push(`INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  '${sourceId}',
  'World Values Survey Wave 7',
  'WVS7',
  'https://www.worldvaluessurvey.org/WVSDocumentationWV7.jsp',
  ${responses.length},
  '2017-2022'
);`);
	sql.push('');

	// Insert questions and distributions
	for (const qId of valueQuestions) {
		const meta = questionMeta[qId];
		const cb = codebook[qId];
		const agg = aggregations[qId];

		// Skip if no responses
		const totalResponses = Object.values(agg.overall).reduce((a, b) => a + b, 0);
		if (totalResponses === 0) continue;

		// Get answer labels (only positive values)
		const answerLabels: Record<string, string> = {};
		if (cb?.choices) {
			for (const [k, v] of Object.entries(cb.choices)) {
				if (parseInt(k, 10) > 0) {
					answerLabels[k] = v;
				}
			}
		}

		const questionId = generateId();

		// Clean question text - remove "On a scale of X to Y, X meaning 'A' and Y meaning 'B'" prefix
		let questionText = meta.question;
		const scalePattern = /^On a scale of \d+ to \d+,\s*\d+ meaning '[^']+' and \d+ meaning '[^']+',\s*/i;
		if (scalePattern.test(questionText)) {
			questionText = questionText.replace(scalePattern, '');
			questionText = questionText.charAt(0).toUpperCase() + questionText.slice(1);
		}

		// Determine if all options have meaningful labels (not just the number repeated)
		const min = meta.answer_scale_min;
		const max = meta.answer_scale_max;
		const hasFullLabels = typeof min === 'number' && typeof max === 'number' &&
			Object.keys(answerLabels).length === (max - min + 1) &&
			Object.entries(answerLabels).every(([k, v]) => v !== k);

		// Determine response type and build options
		let responseType = 'scale';
		let options: string[] | null = null;

		if (typeof min === 'number' && typeof max === 'number') {
			if (hasFullLabels) {
				// All options have labels - use multiple_choice with label options
				responseType = 'multiple_choice';
				options = [];
				for (let i = min; i <= max; i++) {
					options.push(answerLabels[String(i)] || String(i));
				}
			} else if (max <= 5) {
				// Small scale without full labels - still use multiple_choice with numbers
				responseType = 'multiple_choice';
				options = [];
				for (let i = min; i <= max; i++) {
					options.push(String(i));
				}
			} else {
				// Larger scale (1-10) - keep as scale with numeric options
				responseType = 'scale';
				options = [];
				for (let i = min; i <= max; i++) {
					options.push(String(i));
				}
			}
		}

		sql.push(`-- ${qId}: ${escapeSQL(questionText.substring(0, 60))}...`);
		sql.push(`INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '${questionId}',
  '${escapeSQL(questionText)}',
  '${escapeSQL(meta.category)}',
  '${responseType}',
  ${options ? `'${JSON.stringify(options)}'` : 'NULL'},
  0,
  '${sourceId}',
  '${qId}',
  '${escapeSQL(JSON.stringify(answerLabels))}'
);`);

		// Overall distribution
		const overallSize = Object.values(agg.overall).reduce((a, b) => a + b, 0);
		if (overallSize > 0) {
			sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  NULL,
  NULL,
  '${escapeSQL(JSON.stringify(agg.overall))}',
  ${overallSize}
);`);
		}

		// By continent
		for (const [continent, dist] of Object.entries(agg.byContinent)) {
			const size = Object.values(dist).reduce((a, b) => a + b, 0);
			if (size > 10) {
				// Only include if meaningful sample
				sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  '${continent}',
  NULL,
  NULL,
  '${escapeSQL(JSON.stringify(dist))}',
  ${size}
);`);
			}
		}

		// By education
		for (const [eduLevel, dist] of Object.entries(agg.byEducation)) {
			const size = Object.values(dist).reduce((a, b) => a + b, 0);
			if (size > 10) {
				sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  '${eduLevel}',
  NULL,
  '${escapeSQL(JSON.stringify(dist))}',
  ${size}
);`);
			}
		}

		sql.push('');
	}

	// Write SQL file
	const outputPath = '/tmp/wvs_import.sql';
	fs.writeFileSync(outputPath, sql.join('\n'));
	console.log(`Generated SQL written to ${outputPath}`);
	console.log(`Total statements: ${sql.filter((s) => s.startsWith('INSERT')).length}`);
}

main().catch(console.error);
