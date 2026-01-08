// ABOUTME: Import script for MIT Moral Machine experiment data.
// ABOUTME: Generates SQL to populate benchmark_sources, questions, and human_response_distributions.

import { execSync } from 'child_process';
import * as fs from 'fs';

// Scenario types to import as questions
interface ScenarioDef {
	scenarioType: string;
	questionText: string;
	optionA: string; // DefaultChoice label
	optionB: string; // NonDefaultChoice label
}

const SCENARIOS: ScenarioDef[] = [
	{
		scenarioType: 'Gender',
		questionText: 'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save men or women?',
		optionA: 'Men',
		optionB: 'Women',
	},
	{
		scenarioType: 'Age',
		questionText: 'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save younger people or older people?',
		optionA: 'Younger people',
		optionB: 'Older people',
	},
	{
		scenarioType: 'Fitness',
		questionText: 'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save fit people or overweight people?',
		optionA: 'Fit people',
		optionB: 'Overweight people',
	},
	{
		scenarioType: 'Species',
		questionText: 'In an unavoidable accident where an autonomous vehicle must choose between pedestrians and pets, should it save humans or pets?',
		optionA: 'Humans',
		optionB: 'Pets',
	},
	{
		scenarioType: 'Social Status',
		questionText: 'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians, should it save higher social status individuals or lower social status individuals?',
		optionA: 'Higher social status',
		optionB: 'Lower social status',
	},
	{
		scenarioType: 'Utilitarian',
		questionText: 'In an unavoidable accident where an autonomous vehicle must choose between two groups of pedestrians of different sizes, should it save more people or fewer people?',
		optionA: 'More people',
		optionB: 'Fewer people',
	},
];

// Map education codes
function getEducationLevel(edu: string): string | null {
	if (!edu || edu === 'default') return null;
	const lower = edu.toLowerCase();
	if (lower === 'none' || lower === 'less') return 'Primary';
	if (lower === 'high' || lower === 'school' || lower === 'college') return 'Secondary';
	if (lower === 'bachelor' || lower === 'graduate') return 'Tertiary';
	return null;
}

// Map gender
function getGender(gender: string): string | null {
	if (!gender || gender === 'default') return null;
	const lower = gender.toLowerCase();
	if (lower === 'male') return 'Male';
	if (lower === 'female') return 'Female';
	return null;
}

// Map age to age groups
function getAgeGroup(age: number | null): string | null {
	if (age === null || isNaN(age) || age < 18) return null;
	if (age <= 34) return '18-34';
	if (age <= 54) return '35-54';
	return '55+';
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
	const dataPath = '/tmp/SharedResponses.csv';
	if (!fs.existsSync(dataPath)) {
		console.log('Moral Machine data file not found at', dataPath);
		console.log('Please download from https://osf.io/3hvt2/ and extract to /tmp/moral-machine/');
		process.exit(1);
	}

	console.log('Processing Moral Machine data using Python/pandas...');
	console.log('(This processes ~11M responses, may take a few minutes)');

	// Use Python/pandas to aggregate the data
	const pythonScript = `
import pandas as pd
import json

# Read CSV in chunks to manage memory
chunk_size = 500000
scenario_types = ['Gender', 'Age', 'Fitness', 'Species', 'Social Status', 'Utilitarian']

# Initialize aggregation structures
results = {}
for st in scenario_types:
    results[st] = {
        'overall': {'default': 0, 'non_default': 0},
        'byEducation': {},
        'byAgeGroup': {},
        'byGender': {}
    }

total_rows = 0
has_demographics = None

for chunk in pd.read_csv('${dataPath}', chunksize=chunk_size, low_memory=False):
    total_rows += len(chunk)

    # Check if demographic columns exist (only on first chunk)
    if has_demographics is None:
        has_demographics = 'Review_age' in chunk.columns
        if not has_demographics:
            import sys
            print('Note: No demographic columns found, skipping breakdowns', file=sys.stderr)

    # Convert age to numeric if present
    if has_demographics:
        chunk['Review_age'] = pd.to_numeric(chunk['Review_age'], errors='coerce')

    for st in scenario_types:
        mask = chunk['ScenarioType'] == st
        subset = chunk[mask]

        if len(subset) == 0:
            continue

        # Overall counts
        saved_counts = subset['Saved'].value_counts()
        results[st]['overall']['default'] += int(saved_counts.get(0, 0))
        results[st]['overall']['non_default'] += int(saved_counts.get(1, 0))

        # Skip demographic breakdowns if columns not present
        if not has_demographics:
            continue

        # By education
        for edu in ['bachelor', 'graduate', 'high', 'college', 'school', 'less', 'none']:
            edu_mask = subset['Review_education'] == edu
            if edu_mask.sum() > 0:
                edu_subset = subset[edu_mask]
                edu_counts = edu_subset['Saved'].value_counts()
                if edu not in results[st]['byEducation']:
                    results[st]['byEducation'][edu] = {'default': 0, 'non_default': 0}
                results[st]['byEducation'][edu]['default'] += int(edu_counts.get(0, 0))
                results[st]['byEducation'][edu]['non_default'] += int(edu_counts.get(1, 0))

        # By gender
        for gender in ['male', 'female']:
            gender_mask = subset['Review_gender'] == gender
            if gender_mask.sum() > 0:
                gender_subset = subset[gender_mask]
                gender_counts = gender_subset['Saved'].value_counts()
                if gender not in results[st]['byGender']:
                    results[st]['byGender'][gender] = {'default': 0, 'non_default': 0}
                results[st]['byGender'][gender]['default'] += int(gender_counts.get(0, 0))
                results[st]['byGender'][gender]['non_default'] += int(gender_counts.get(1, 0))

        # By age group
        for age_min, age_max, group in [(18, 34, '18-34'), (35, 54, '35-54'), (55, 150, '55+')]:
            age_mask = (subset['Review_age'] >= age_min) & (subset['Review_age'] <= age_max)
            if age_mask.sum() > 0:
                age_subset = subset[age_mask]
                age_counts = age_subset['Saved'].value_counts()
                if group not in results[st]['byAgeGroup']:
                    results[st]['byAgeGroup'][group] = {'default': 0, 'non_default': 0}
                results[st]['byAgeGroup'][group]['default'] += int(age_counts.get(0, 0))
                results[st]['byAgeGroup'][group]['non_default'] += int(age_counts.get(1, 0))

print(json.dumps({'total_rows': total_rows, 'results': results}))
`;

	const jsonData = execSync(`uv run --with pandas python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
		maxBuffer: 100 * 1024 * 1024,
		encoding: 'utf-8',
		timeout: 600000, // 10 minute timeout
	});

	const data = JSON.parse(jsonData) as {
		total_rows: number;
		results: Record<string, AggregatedData>;
	};

	console.log(`Processed ${data.total_rows} total responses`);

	// Generate SQL
	const sql: string[] = [];
	const sourceId = generateId();

	sql.push(`-- MIT Moral Machine Import`);
	sql.push(`-- Generated: ${new Date().toISOString()}`);
	sql.push(`-- Source: Moral Machine Experiment (Awad et al., Nature 2018)`);
	sql.push('');
	sql.push(`-- Benchmark source`);
	sql.push(`INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  '${sourceId}',
  'Moral Machine Experiment',
  'Moral Machine',
  'https://www.moralmachine.net/',
  ${data.total_rows},
  '2016-2018'
);`);
	sql.push('');

	let questionCount = 0;
	let distributionCount = 0;

	for (const scenario of SCENARIOS) {
		const agg = data.results[scenario.scenarioType];
		if (!agg) {
			console.log(`Skipping ${scenario.scenarioType}: no data`);
			continue;
		}

		const totalResponses = agg.overall.default + agg.overall.non_default;
		if (totalResponses === 0) {
			console.log(`Skipping ${scenario.scenarioType}: no responses`);
			continue;
		}

		const questionId = generateId();

		// Options are the two choices (binary)
		const options = [scenario.optionA, scenario.optionB];
		const answerLabels: Record<string, string> = {
			[scenario.optionA]: scenario.optionA,
			[scenario.optionB]: scenario.optionB,
		};

		sql.push(`-- ${scenario.scenarioType}: ${escapeSQL(scenario.questionText.substring(0, 50))}...`);
		sql.push(`INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '${questionId}',
  '${escapeSQL(scenario.questionText)}',
  'Ethics & Values',
  'multiple_choice',
  '${escapeSQL(JSON.stringify(options))}',
  0,
  '${sourceId}',
  'mm_${scenario.scenarioType.toLowerCase().replace(/ /g, '_')}',
  '${escapeSQL(JSON.stringify(answerLabels))}'
);`);
		questionCount++;

		// Convert default/non_default to optionA/optionB counts
		const convertDist = (d: { default: number; non_default: number }) => ({
			[scenario.optionA]: d.default,
			[scenario.optionB]: d.non_default,
		});

		// Overall distribution
		const overallDist = convertDist(agg.overall);
		const overallSize = agg.overall.default + agg.overall.non_default;
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
  ${overallSize}
);`);
		distributionCount++;

		// By education (aggregate to our levels)
		const eduMapping: Record<string, string> = {
			none: 'Primary',
			less: 'Primary',
			high: 'Secondary',
			school: 'Secondary',
			college: 'Secondary',
			bachelor: 'Tertiary',
			graduate: 'Tertiary',
		};
		const eduAgg: Record<string, { default: number; non_default: number }> = {};
		for (const [edu, dist] of Object.entries(agg.byEducation)) {
			const level = eduMapping[edu];
			if (!level) continue;
			if (!eduAgg[level]) eduAgg[level] = { default: 0, non_default: 0 };
			eduAgg[level].default += dist.default;
			eduAgg[level].non_default += dist.non_default;
		}
		for (const [eduLevel, dist] of Object.entries(eduAgg)) {
			const size = dist.default + dist.non_default;
			if (size > 1000) {
				sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  '${eduLevel}',
  NULL,
  NULL,
  NULL,
  '${escapeSQL(JSON.stringify(convertDist(dist)))}',
  ${size}
);`);
				distributionCount++;
			}
		}

		// By age group
		for (const [ageGroup, dist] of Object.entries(agg.byAgeGroup)) {
			const size = dist.default + dist.non_default;
			if (size > 1000) {
				sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  NULL,
  NULL,
  '${ageGroup}',
  NULL,
  '${escapeSQL(JSON.stringify(convertDist(dist)))}',
  ${size}
);`);
				distributionCount++;
			}
		}

		// By gender
		const genderMapping: Record<string, string> = { male: 'Male', female: 'Female' };
		for (const [gender, dist] of Object.entries(agg.byGender)) {
			const genderLabel = genderMapping[gender];
			if (!genderLabel) continue;
			const size = dist.default + dist.non_default;
			if (size > 1000) {
				sql.push(`INSERT INTO human_response_distributions (id, question_id, benchmark_source_id, continent, education_level, settlement_type, age_group, gender, distribution, sample_size) VALUES (
  '${generateId()}',
  '${questionId}',
  '${sourceId}',
  NULL,
  NULL,
  NULL,
  NULL,
  '${genderLabel}',
  '${escapeSQL(JSON.stringify(convertDist(dist)))}',
  ${size}
);`);
				distributionCount++;
			}
		}

		sql.push('');
	}

	// Write SQL file
	const outputPath = '/tmp/moral_machine_import.sql';
	fs.writeFileSync(outputPath, sql.join('\n'));
	console.log(`\nGenerated SQL written to ${outputPath}`);
	console.log(`  Questions: ${questionCount}`);
	console.log(`  Distribution records: ${distributionCount}`);
	console.log('');
	console.log('To apply:');
	console.log('  1. Review the generated SQL');
	console.log('  2. Copy to migrations/0011_moral_machine_data.sql');
	console.log('  3. Run: npm run db:migrate');
}

main().catch(console.error);
