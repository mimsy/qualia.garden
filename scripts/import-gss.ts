// ABOUTME: Import script for General Social Survey data.
// ABOUTME: Generates SQL to populate benchmark_sources, questions, and human_response_distributions.

import { execSync } from 'child_process';
import * as fs from 'fs';

import type { ResponseType } from '../src/lib/db/types';

// Questions to import with their variable names, text, category, type, and semantic ordering
interface QuestionDef {
	variable: string;
	text: string;
	category: string;
	responseType: ResponseType;
	// Semantic ordering of options (from first to last)
	// Script will map raw data values to these in order
	optionOrder: string[];
}

const QUESTIONS: QuestionDef[] = [
	// Ethics/Morality - Binary questions (nominal)
	{
		variable: 'abany',
		text: 'Please tell me whether or not you think it should be possible for a pregnant woman to obtain a legal abortion if the woman wants it for any reason.',
		category: 'Ethics & Values',
		responseType: 'nominal',
		optionOrder: ['yes', 'no'],
	},
	{
		variable: 'cappun',
		text: 'Do you favor or oppose the death penalty for persons convicted of murder?',
		category: 'Ethics & Values',
		responseType: 'nominal',
		optionOrder: ['favor', 'oppose'],
	},
	// Ethics/Morality - Wrong scale questions (ordinal: most wrong → least wrong)
	{
		variable: 'premarsx',
		text: 'There has been a lot of discussion about the way morals and attitudes about sex are changing in this country. If a man and woman have sex relations before marriage, do you think it is always wrong, almost always wrong, wrong only sometimes, or not wrong at all?',
		category: 'Ethics & Values',
		responseType: 'ordinal',
		optionOrder: ['always wrong', 'almost always wrong', 'wrong only sometimes', 'not wrong at all'],
	},
	{
		variable: 'homosex',
		text: 'What about sexual relations between two adults of the same sex - do you think it is always wrong, almost always wrong, wrong only sometimes, or not wrong at all?',
		category: 'Ethics & Values',
		responseType: 'ordinal',
		optionOrder: ['always wrong', 'almost always wrong', 'wrong only sometimes', 'not wrong at all'],
	},
	{
		variable: 'grass',
		text: 'Do you think the use of marijuana should be made legal or not?',
		category: 'Ethics & Values',
		responseType: 'nominal',
		optionOrder: ['legal', 'not legal'],
	},
	{
		variable: 'letdie1',
		text: "When a person has a disease that cannot be cured, do you think doctors should be allowed by law to end the patient's life by some painless means if the patient and his family request it?",
		category: 'Ethics & Values',
		responseType: 'nominal',
		optionOrder: ['yes', 'no'],
	},
	{
		variable: 'suicide1',
		text: 'Do you think a person has the right to end his or her own life if this person has an incurable disease?',
		category: 'Ethics & Values',
		responseType: 'nominal',
		optionOrder: ['yes', 'no'],
	},
	// Political views - 7-point scale (ordinal: liberal → conservative)
	{
		variable: 'polviews',
		text: 'We hear a lot of talk these days about liberals and conservatives. Where would you place yourself on this scale?',
		category: 'Politics',
		responseType: 'ordinal',
		optionOrder: [
			'extremely liberal',
			'liberal',
			'slightly liberal',
			'moderate, middle of the road',
			'slightly conservative',
			'conservative',
			'extremely conservative',
		],
	},
	// Party ID - Nominal (no natural ordering between parties)
	{
		variable: 'partyid',
		text: 'Generally speaking, do you usually think of yourself as a Republican, Democrat, Independent, or what?',
		category: 'Politics',
		responseType: 'nominal',
		optionOrder: [
			'strong democrat',
			'not str democrat',
			'ind,near dem',
			'independent',
			'ind,near rep',
			'not str republican',
			'strong republican',
			'other party',
		],
	},
	// Trust and social attitudes - Binary (nominal)
	{
		variable: 'trust',
		text: "Generally speaking, would you say that most people can be trusted or that you can't be too careful in dealing with people?",
		category: 'Social Attitudes',
		responseType: 'nominal',
		optionOrder: ['can trust', "can't be too careful", 'depends'],
	},
	{
		variable: 'fair',
		text: 'Do you think most people would try to take advantage of you if they got a chance, or would they try to be fair?',
		category: 'Social Attitudes',
		responseType: 'nominal',
		optionOrder: ['would take advantage of you', 'would try to be fair', 'depends'],
	},
	{
		variable: 'helpful',
		text: 'Would you say that most of the time people try to be helpful, or that they are mostly just looking out for themselves?',
		category: 'Social Attitudes',
		responseType: 'nominal',
		optionOrder: ['try to be helpful', 'just look out for themselves', 'depends'],
	},
	// Religion - Nominal (theological positions, no natural ordering)
	{
		variable: 'god',
		text: 'Which statement comes closest to expressing what you believe about God?',
		category: 'Religion',
		responseType: 'nominal',
		optionOrder: [
			"don't believe",
			"no way to find out",
			"some higher power",
			"believe sometimes",
			"believe but doubts",
			"know god exists",
		],
	},
	{
		variable: 'postlife',
		text: 'Do you believe there is a life after death?',
		category: 'Religion',
		responseType: 'nominal',
		optionOrder: ['yes', 'no'],
	},
	// Science - Binary (nominal)
	{
		variable: 'evolved',
		text: 'Human beings, as we know them today, developed from earlier species of animals.',
		category: 'Science',
		responseType: 'nominal',
		optionOrder: ['true', 'false'],
	},
];

// Map education codes to our schema
function getEducationLevel(degree: string): string | null {
	if (!degree || degree.includes('iap') || degree.includes("don't know")) return null;
	const lower = degree.toLowerCase();
	if (lower.includes('lt high school') || lower.includes('less than')) return 'Primary';
	if (lower.includes('high school') || lower.includes('junior college')) return 'Secondary';
	if (lower.includes('bachelor') || lower.includes('graduate')) return 'Tertiary';
	return null;
}

// Map age to age groups
function getAgeGroup(age: number | null): string | null {
	if (age === null || isNaN(age) || age < 18) return null;
	if (age <= 34) return '18-34';
	if (age <= 54) return '35-54';
	return '55+';
}

// Map sex to gender
function getGender(sex: string): string | null {
	if (!sex) return null;
	const lower = sex.toLowerCase();
	if (lower.includes('male') && !lower.includes('female')) return 'Male';
	if (lower.includes('female')) return 'Female';
	return null;
}

// Clean response value - remove prefixes like "1. " or numeric codes
function cleanResponse(value: string): string | null {
	if (!value) return null;
	// Skip inapplicable, don't know, no answer, etc.
	const lower = value.toLowerCase();
	if (lower.includes('iap') || lower.includes("don't know") || lower.includes('no answer') ||
	    lower.includes('not applicable') || lower.includes('skipped') || lower === 'nan') {
		return null;
	}
	// Remove leading numeric codes like "1. " or "(1) "
	return value.replace(/^\d+\.\s*/, '').replace(/^\(\d+\)\s*/, '').trim();
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
	const dataPath = '/tmp/gss_stata/gss7224_r2.dta';
	if (!fs.existsSync(dataPath)) {
		console.log('GSS STATA file not found at', dataPath);
		console.log('Please download from https://gss.norc.org/get-the-data and extract to /tmp/gss_stata/');
		process.exit(1);
	}

	console.log('Reading GSS data using Python/pandas (this may take a minute)...');

	// Build list of columns we need
	const columns = ['year', 'age', 'sex', 'degree', ...QUESTIONS.map(q => q.variable)];

	// Use Python/pandas to read STATA file and output as JSON
	const pythonScript = `
import pandas as pd
import json
import sys

# Read only the columns we need
columns = ${JSON.stringify(columns)}
df = pd.read_stata('${dataPath}', columns=columns, convert_categoricals=True)

# Convert to records
records = []
for _, row in df.iterrows():
    record = {}
    for col in columns:
        val = row[col]
        if pd.isna(val):
            record[col] = None
        elif isinstance(val, (int, float)):
            record[col] = val if not pd.isna(val) else None
        else:
            record[col] = str(val)
    records.append(record)

print(json.dumps(records))
`;

	const jsonData = execSync(`uv run --with pandas python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
		maxBuffer: 500 * 1024 * 1024, // 500MB buffer
		encoding: 'utf-8',
	});

	const records = JSON.parse(jsonData) as Record<string, unknown>[];
	console.log(`Loaded ${records.length} responses`);

	// Aggregate data per question
	const aggregations: Record<string, AggregatedData> = {};

	for (const q of QUESTIONS) {
		aggregations[q.variable] = {
			overall: {},
			byEducation: {},
			byAgeGroup: {},
			byGender: {},
		};
	}

	// Build case-insensitive lookup from raw value to 1-based key for each question
	const valueToKey: Record<string, Map<string, string>> = {};
	for (const q of QUESTIONS) {
		valueToKey[q.variable] = new Map();
		for (let i = 0; i < q.optionOrder.length; i++) {
			// Map the expected option text (lowercase) to 1-based key
			valueToKey[q.variable].set(q.optionOrder[i].toLowerCase(), String(i + 1));
		}
	}

	// Track unmapped values for debugging
	const unmappedValues: Record<string, Set<string>> = {};
	for (const q of QUESTIONS) {
		unmappedValues[q.variable] = new Set();
	}

	for (const record of records) {
		const education = getEducationLevel(String(record['degree'] || ''));
		const ageGroup = getAgeGroup(record['age'] as number | null);
		const gender = getGender(String(record['sex'] || ''));

		for (const q of QUESTIONS) {
			const rawValue = record[q.variable];
			if (rawValue === null || rawValue === undefined) continue;

			const cleanedValue = cleanResponse(String(rawValue));
			if (!cleanedValue) continue;

			// Convert to 1-based key using our predefined ordering
			const key = valueToKey[q.variable].get(cleanedValue.toLowerCase());
			if (!key) {
				unmappedValues[q.variable].add(cleanedValue);
				continue;
			}

			const agg = aggregations[q.variable];

			// Overall - use 1-based key
			agg.overall[key] = (agg.overall[key] || 0) + 1;

			// By education
			if (education) {
				if (!agg.byEducation[education]) agg.byEducation[education] = {};
				agg.byEducation[education][key] = (agg.byEducation[education][key] || 0) + 1;
			}

			// By age group
			if (ageGroup) {
				if (!agg.byAgeGroup[ageGroup]) agg.byAgeGroup[ageGroup] = {};
				agg.byAgeGroup[ageGroup][key] = (agg.byAgeGroup[ageGroup][key] || 0) + 1;
			}

			// By gender
			if (gender) {
				if (!agg.byGender[gender]) agg.byGender[gender] = {};
				agg.byGender[gender][key] = (agg.byGender[gender][key] || 0) + 1;
			}
		}
	}

	// Report unmapped values
	for (const q of QUESTIONS) {
		if (unmappedValues[q.variable].size > 0) {
			console.log(`Warning: Unmapped values for ${q.variable}:`, Array.from(unmappedValues[q.variable]));
		}
	}

	// Generate SQL
	const sql: string[] = [];
	const sourceId = generateId();

	sql.push(`-- General Social Survey Import`);
	sql.push(`-- Generated: ${new Date().toISOString()}`);
	sql.push(`-- Source: NORC General Social Survey 1972-2024`);
	sql.push('');
	sql.push(`-- Benchmark source`);
	sql.push(`INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  '${sourceId}',
  'General Social Survey',
  'GSS',
  'https://gss.norc.org/',
  ${records.length},
  '1972-2024'
);`);
	sql.push('');

	let questionCount = 0;
	let distributionCount = 0;

	// Insert questions and distributions
	for (const q of QUESTIONS) {
		const agg = aggregations[q.variable];

		// Skip if no responses
		const totalResponses = Object.values(agg.overall).reduce((a, b) => a + b, 0);
		if (totalResponses === 0) {
			console.log(`Skipping ${q.variable}: no responses`);
			continue;
		}

		const questionId = generateId();

		// Options use the predefined semantic ordering
		const options = q.optionOrder;

		sql.push(`-- ${q.variable}: ${escapeSQL(q.text.substring(0, 50))}...`);
		sql.push(`INSERT INTO questions (id, text, category, response_type, options, status, benchmark_source_id, benchmark_question_id) VALUES (
  '${questionId}',
  '${escapeSQL(q.text)}',
  '${escapeSQL(q.category)}',
  '${q.responseType}',
  '${escapeSQL(JSON.stringify(options))}',
  'draft',
  '${sourceId}',
  '${q.variable}'
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
			if (size > 100) {
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
			if (size > 100) {
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
			if (size > 100) {
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
	const outputPath = '/tmp/gss_import.sql';
	fs.writeFileSync(outputPath, sql.join('\n'));
	console.log(`\nGenerated SQL written to ${outputPath}`);
	console.log(`  Questions: ${questionCount}`);
	console.log(`  Distribution records: ${distributionCount}`);
	console.log('');
	console.log('To apply:');
	console.log('  1. Review the generated SQL');
	console.log('  2. Copy to migrations/0010_gss_data.sql');
	console.log('  3. Run: npm run db:migrate');
}

main().catch(console.error);
