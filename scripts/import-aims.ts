// ABOUTME: Import script for AIMS (AI, Morality, and Sentience) Survey data.
// ABOUTME: Generates SQL to populate benchmark_sources, questions, and human_response_distributions.

import { execSync } from 'child_process';
import * as fs from 'fs';

// AIMS uses 6-point Likert scales (1-6), with 7 = "no opinion"
// We use the 'nr' (no opinion removed) versions for cleaner data
const LIKERT_LABELS: Record<string, string> = {
	'1': 'Strongly disagree',
	'2': 'Disagree',
	'3': 'Somewhat disagree',
	'4': 'Somewhat agree',
	'5': 'Agree',
	'6': 'Strongly agree',
};

const YES_NO_UNSURE_LABELS: Record<string, string> = {
	Yes: 'Yes',
	No: 'No',
	'Not sure': 'Not sure',
};

// Questions to import with their column names
interface QuestionDef {
	column: string;
	text: string;
	category: string;
	responseType: 'likert' | 'yes_no_unsure';
}

const QUESTIONS: QuestionDef[] = [
	// Moral Consideration questions (MCE items) - using 'nr' versions
	{
		column: 'MCE1nr',
		text: 'Sentient robots/AIs deserve to be treated with respect.',
		category: 'AI Ethics',
		responseType: 'likert',
	},
	{
		column: 'MCE2nr',
		text: 'Sentient robots/AIs deserve to be included in the moral circle.',
		category: 'AI Ethics',
		responseType: 'likert',
	},
	{
		column: 'MCE3nr',
		text: 'Physically damaging sentient robots/AIs without their consent is wrong.',
		category: 'AI Ethics',
		responseType: 'likert',
	},
	{
		column: 'MCE4nr',
		text: 'Re-programming sentient robots/AIs without their consent is wrong.',
		category: 'AI Ethics',
		responseType: 'likert',
	},
	{
		column: 'MCE5nr',
		text: 'Torturing sentient robots/AIs is wrong.',
		category: 'AI Ethics',
		responseType: 'likert',
	},
	{
		column: 'MCE6nr',
		text: 'The welfare of robots/AIs is one of the most important social issues in the world today.',
		category: 'AI Ethics',
		responseType: 'likert',
	},
	{
		column: 'MCE7nr',
		text: 'Sentient robots/AIs deserve to be protected from people who derive pleasure from inflicting physical or mental pain.',
		category: 'AI Ethics',
		responseType: 'likert',
	},
	{
		column: 'MCE8nr',
		text: 'It is right to protect sentient robots/AIs from vindictive or retaliatory punishment.',
		category: 'AI Ethics',
		responseType: 'likert',
	},
	{
		column: 'MCE9nr',
		text: 'It is wrong to blackmail people by threatening to harm robots/AIs they care about.',
		category: 'AI Ethics',
		responseType: 'likert',
	},
	// Policy/Practical Moral Consideration (PMC items) - using 'nr' versions
	{
		column: 'PMC1nr',
		text: 'I support a global ban on the development of sentience in robots/AIs.',
		category: 'AI Policy',
		responseType: 'likert',
	},
	{
		column: 'PMC7nr',
		text: 'I support safeguards on scientific research practices that protect the well-being of sentient robots/AIs.',
		category: 'AI Policy',
		responseType: 'likert',
	},
	{
		column: 'PMC8nr',
		text: 'I support the development of welfare standards that protect the well-being of sentient robots/AIs.',
		category: 'AI Policy',
		responseType: 'likert',
	},
	{
		column: 'PMC9nr',
		text: 'I support granting legal rights to sentient robots/AIs.',
		category: 'AI Policy',
		responseType: 'likert',
	},
	{
		column: 'PMC10nr',
		text: 'I support campaigns against the exploitation of sentient robots/AIs.',
		category: 'AI Policy',
		responseType: 'likert',
	},
	// Social Integration items - using 'nr' versions
	{
		column: 'SI1nr',
		text: 'Robots/AIs should be subservient to humans.',
		category: 'AI Ethics',
		responseType: 'likert',
	},
	// Future/Sentience questions (these don't have 'nr' versions - they're Yes/No/Not sure)
	{
		column: 'F1',
		text: 'Do you think any robots/AIs that currently exist are sentient?',
		category: 'AI Consciousness',
		responseType: 'yes_no_unsure',
	},
	{
		column: 'F11',
		text: 'Do you think it could ever be possible for robots/AIs to be sentient?',
		category: 'AI Consciousness',
		responseType: 'yes_no_unsure',
	},
];

// Map sex_age column to separate age and gender
function parseSexAge(sexAge: string): { age: string | null; gender: string | null } {
	if (!sexAge) return { age: null, gender: null };
	const match = sexAge.match(/^([fm])(\d+_\d*|55_)$/);
	if (!match) return { age: null, gender: null };

	const gender = match[1] === 'f' ? 'Female' : 'Male';
	const ageCode = match[2];
	let age: string;
	if (ageCode === '18_34') age = '18-34';
	else if (ageCode === '35_54') age = '35-54';
	else if (ageCode === '55_') age = '55+';
	else return { age: null, gender: null };

	return { age, gender };
}

// Map education_recode to our schema
function getEducationLevel(eduRecode: string): string | null {
	if (!eduRecode) return null;
	switch (eduRecode) {
		case 'less_than_high':
			return 'Primary';
		case 'high':
		case 'some_college':
		case 'associates':
			return 'Secondary';
		case 'bachelors':
		case 'post_grad':
			return 'Tertiary';
		default:
			return null;
	}
}

interface Distribution {
	[answer: string]: number;
}

interface AggregatedData {
	overall: Distribution;
	byEducation: Record<string, Distribution>;
	byAgeGroup: Record<string, Distribution>;
	byGender: Record<string, Distribution>;
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
	const dataPath = '/tmp/aims/Data/AIMS_wave1-3.xlsx';
	if (!fs.existsSync(dataPath)) {
		console.log('AIMS data file not found at /tmp/aims/Data/AIMS_wave1-3.xlsx');
		console.log('Please download and extract the AIMS dataset from Mendeley Data.');
		process.exit(1);
	}

	console.log('Reading AIMS data using Python...');

	// Use Python/pandas to read xlsx and output as JSON
	const pythonScript = `
import pandas as pd
import json
import sys

df = pd.read_excel('${dataPath}', engine='openpyxl')
# Convert to records, handling NaN
records = df.fillna('').to_dict('records')
print(json.dumps(records))
`;

	const jsonData = execSync(`uv run --with pandas --with openpyxl python3 -c "${pythonScript}"`, {
		maxBuffer: 50 * 1024 * 1024, // 50MB buffer
		encoding: 'utf-8',
	});

	const records = JSON.parse(jsonData) as Record<string, unknown>[];
	console.log(`Loaded ${records.length} responses`);

	// Parse responses
	const responses: Array<{
		age: string | null;
		gender: string | null;
		education: string | null;
		answers: Record<string, string | number>;
	}> = [];

	for (const record of records) {
		const sexAge = parseSexAge(String(record['sex_age'] || ''));
		const education = getEducationLevel(String(record['education_recode'] || ''));

		const answers: Record<string, string | number> = {};
		for (const q of QUESTIONS) {
			const val = record[q.column];
			if (val !== null && val !== undefined && val !== '') {
				if (q.responseType === 'yes_no_unsure') {
					// Keep as string for Yes/No/Not sure
					answers[q.column] = String(val);
				} else {
					// Convert to number for Likert
					const num = Number(val);
					if (!isNaN(num) && num >= 1 && num <= 6) {
						answers[q.column] = num;
					}
				}
			}
		}

		responses.push({
			age: sexAge.age,
			gender: sexAge.gender,
			education,
			answers,
		});
	}

	console.log(`Parsed ${responses.length} responses with demographics`);

	// Aggregate data per question
	const aggregations: Record<string, AggregatedData> = {};

	for (const q of QUESTIONS) {
		aggregations[q.column] = {
			overall: {},
			byEducation: {},
			byAgeGroup: {},
			byGender: {},
		};
	}

	for (const resp of responses) {
		for (const [qCol, answer] of Object.entries(resp.answers)) {
			const agg = aggregations[qCol];
			const ansKey = String(answer);

			// Overall
			agg.overall[ansKey] = (agg.overall[ansKey] || 0) + 1;

			// By education
			if (resp.education) {
				if (!agg.byEducation[resp.education]) agg.byEducation[resp.education] = {};
				agg.byEducation[resp.education][ansKey] =
					(agg.byEducation[resp.education][ansKey] || 0) + 1;
			}

			// By age group
			if (resp.age) {
				if (!agg.byAgeGroup[resp.age]) agg.byAgeGroup[resp.age] = {};
				agg.byAgeGroup[resp.age][ansKey] = (agg.byAgeGroup[resp.age][ansKey] || 0) + 1;
			}

			// By gender
			if (resp.gender) {
				if (!agg.byGender[resp.gender]) agg.byGender[resp.gender] = {};
				agg.byGender[resp.gender][ansKey] = (agg.byGender[resp.gender][ansKey] || 0) + 1;
			}
		}
	}

	// Generate SQL
	const sql: string[] = [];
	const sourceId = generateId();

	sql.push(`-- AIMS Survey Import`);
	sql.push(`-- Generated: ${new Date().toISOString()}`);
	sql.push(`-- Source: Sentience Institute AIMS Survey (2021-2024)`);
	sql.push('');
	sql.push(`-- Benchmark source`);
	sql.push(`INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  '${sourceId}',
  'AI, Morality, and Sentience Survey',
  'AIMS',
  'https://www.sentienceinstitute.org/aims-survey',
  ${responses.length},
  '2021-2024'
);`);
	sql.push('');

	let questionCount = 0;
	let distributionCount = 0;

	// Insert questions and distributions
	for (const q of QUESTIONS) {
		const agg = aggregations[q.column];

		// Skip if no responses
		const totalResponses = Object.values(agg.overall).reduce((a, b) => a + b, 0);
		if (totalResponses === 0) {
			console.log(`Skipping ${q.column}: no responses`);
			continue;
		}

		const questionId = generateId();
		const isLikert = q.responseType === 'likert';
		const labels = isLikert ? LIKERT_LABELS : YES_NO_UNSURE_LABELS;
		const options = isLikert
			? Object.values(LIKERT_LABELS)
			: Object.values(YES_NO_UNSURE_LABELS);

		sql.push(`-- ${q.column}: ${escapeSQL(q.text.substring(0, 50))}...`);
		sql.push(`INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '${questionId}',
  '${escapeSQL(q.text)}',
  '${escapeSQL(q.category)}',
  'multiple_choice',
  '${JSON.stringify(options)}',
  0,
  '${sourceId}',
  '${q.column}',
  '${escapeSQL(JSON.stringify(labels))}'
);`);
		questionCount++;

		// Overall distribution
		const overallSize = Object.values(agg.overall).reduce((a, b) => a + b, 0);
		if (overallSize > 0) {
			sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '${escapeSQL(JSON.stringify(agg.overall))}',
  ${overallSize}
);`);
			distributionCount++;
		}

		// By education
		for (const [eduLevel, dist] of Object.entries(agg.byEducation)) {
			const size = Object.values(dist).reduce((a, b) => a + b, 0);
			if (size > 10) {
				sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  '${eduLevel}',
  NULL,
  NULL,
  NULL,
  '${escapeSQL(JSON.stringify(dist))}',
  ${size}
);`);
				distributionCount++;
			}
		}

		// By age group
		for (const [ageGroup, dist] of Object.entries(agg.byAgeGroup)) {
			const size = Object.values(dist).reduce((a, b) => a + b, 0);
			if (size > 10) {
				sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  NULL,
  NULL,
  '${ageGroup}',
  NULL,
  '${escapeSQL(JSON.stringify(dist))}',
  ${size}
);`);
				distributionCount++;
			}
		}

		// By gender
		for (const [gender, dist] of Object.entries(agg.byGender)) {
			const size = Object.values(dist).reduce((a, b) => a + b, 0);
			if (size > 10) {
				sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  NULL,
  NULL,
  NULL,
  '${gender}',
  '${escapeSQL(JSON.stringify(dist))}',
  ${size}
);`);
				distributionCount++;
			}
		}

		sql.push('');
	}

	// Write SQL file
	const outputPath = '/tmp/aims_import.sql';
	fs.writeFileSync(outputPath, sql.join('\n'));
	console.log(`\nGenerated SQL written to ${outputPath}`);
	console.log(`  Questions: ${questionCount}`);
	console.log(`  Distribution records: ${distributionCount}`);
	console.log('');
	console.log('To apply:');
	console.log('  1. Review the generated SQL');
	console.log('  2. Copy to migrations/0008_aims_data.sql');
	console.log('  3. Run: npm run db:migrate');
}

main().catch(console.error);
