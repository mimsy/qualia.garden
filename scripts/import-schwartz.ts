// ABOUTME: Import script for Schwartz Values Survey (PVQ-21) from European Social Survey.
// ABOUTME: Generates SQL to populate benchmark_sources, questions, and human_response_distributions.

import { execSync } from 'child_process';
import * as fs from 'fs';

// PVQ-21 items with their value mappings
// Scale: 1 = Very much like me, 6 = Not like me at all
interface PVQItem {
	variable: string;
	label: string;
	questionText: string;
	value: string;
}

const PVQ_ITEMS: PVQItem[] = [
	// Self-Direction
	{
		variable: 'ipcrtiv',
		label: 'Important to think new ideas and being creative',
		questionText: 'How important is it to you to think up new ideas and be creative, to do things your own way?',
		value: 'Self-Direction'
	},
	{
		variable: 'impfree',
		label: 'Important to make own decisions and be free',
		questionText:
			'How important is it to you to make your own decisions about what you do, to be free and not depend on others?',
		value: 'Self-Direction'
	},
	// Stimulation
	{
		variable: 'impdiff',
		label: 'Important to try new and different things in life',
		questionText: 'How important is it to you to try new and different things in life, to have surprises?',
		value: 'Stimulation'
	},
	{
		variable: 'ipadvnt',
		label: 'Important to seek adventures and have an exciting life',
		questionText: 'How important is it to you to seek adventures and have an exciting life, to take risks?',
		value: 'Stimulation'
	},
	// Hedonism
	{
		variable: 'ipgdtim',
		label: 'Important to have a good time',
		questionText: 'How important is it to you to have a good time, to spoil yourself and enjoy life?',
		value: 'Hedonism'
	},
	{
		variable: 'impfun',
		label: 'Important to seek fun and things that give pleasure',
		questionText: 'How important is it to you to seek fun and things that give you pleasure, to enjoy yourself?',
		value: 'Hedonism'
	},
	// Achievement
	{
		variable: 'ipshabt',
		label: 'Important to show abilities and be admired',
		questionText: 'How important is it to you to show your abilities, so that people would admire what you do?',
		value: 'Achievement'
	},
	{
		variable: 'ipsuces',
		label: 'Important to be successful and that people recognise achievements',
		questionText: 'How important is it to you to be successful and have people recognize your achievements?',
		value: 'Achievement'
	},
	// Power
	{
		variable: 'imprich',
		label: 'Important to be rich, have money and expensive things',
		questionText: 'How important is it to you to be rich, have a lot of money and expensive things?',
		value: 'Power'
	},
	{
		variable: 'iprspot',
		label: 'Important to get respect from others',
		questionText: 'How important is it to you that people do what you say, to be in charge and tell others what to do?',
		value: 'Power'
	},
	// Security
	{
		variable: 'impsafe',
		label: 'Important to live in secure and safe surroundings',
		questionText:
			'How important is it to you to live in secure surroundings, to avoid anything that might be dangerous?',
		value: 'Security'
	},
	{
		variable: 'ipstrgv',
		label: 'Important that government is strong and ensures safety',
		questionText:
			'How important is it to you that the government ensures your safety against all threats, to have a strong state?',
		value: 'Security'
	},
	// Conformity
	{
		variable: 'ipfrule',
		label: 'Important to do what is told and follow rules',
		questionText: 'How important is it to you to do what you are told and follow rules, even when no one is watching?',
		value: 'Conformity'
	},
	{
		variable: 'ipbhprp',
		label: 'Important to behave properly',
		questionText: 'How important is it to you to behave properly, to avoid doing anything people would say is wrong?',
		value: 'Conformity'
	},
	// Tradition
	{
		variable: 'ipmodst',
		label: 'Important to be humble and modest, not draw attention',
		questionText: 'How important is it to you to be humble and modest, not to draw attention to yourself?',
		value: 'Tradition'
	},
	{
		variable: 'imptrad',
		label: 'Important to follow traditions and customs',
		questionText: 'How important is it to you to follow traditions and customs handed down by your religion or family?',
		value: 'Tradition'
	},
	// Benevolence
	{
		variable: 'iphlppl',
		label: 'Important to help people and care for others well-being',
		questionText: 'How important is it to you to help the people dear to you, to care for their well-being?',
		value: 'Benevolence'
	},
	{
		variable: 'iplylfr',
		label: 'Important to be loyal to friends and devote to people close',
		questionText: 'How important is it to you to be loyal to your friends, to devote yourself to people close to you?',
		value: 'Benevolence'
	},
	// Universalism
	{
		variable: 'ipeqopt',
		label: 'Important that people are treated equally and have equal opportunities',
		questionText: 'How important is it to you that people are treated equally and have equal opportunities?',
		value: 'Universalism'
	},
	{
		variable: 'ipudrst',
		label: 'Important to understand different people',
		questionText:
			'How important is it to you to listen to people who are different from you and try to understand them?',
		value: 'Universalism'
	},
	{
		variable: 'impenv',
		label: 'Important to care for nature and environment',
		questionText: 'How important is it to you to care for nature and the environment, to look after it?',
		value: 'Universalism'
	}
];

// Response options (1-6 scale)
const OPTIONS = [
	'Very much like me',
	'Like me',
	'Somewhat like me',
	'A little like me',
	'Not like me',
	'Not like me at all'
];

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
	const dataPath = '/tmp/ESS10e03_3.dta';
	if (!fs.existsSync(dataPath)) {
		console.log('ESS data file not found at', dataPath);
		console.log('Please download ESS Round 10 from https://ess.sikt.no/ and extract to /tmp/');
		process.exit(1);
	}

	console.log('Processing ESS Round 10 data for Schwartz Values (PVQ-21)...');

	// Get variable names for Python
	const varNames = PVQ_ITEMS.map((item) => item.variable);

	// Use Python/pandas to extract distributions
	const pythonScript = `
import pandas as pd
import json

df = pd.read_stata('${dataPath}', convert_categoricals=False)
print(f"Loaded {len(df)} responses", file=__import__('sys').stderr)

vars = ${JSON.stringify(varNames)}
results = {}

for var in vars:
    counts = df[var].value_counts().sort_index()
    # Only include valid responses (1-6)
    dist = {}
    total = 0
    for val in range(1, 7):
        count = int(counts.get(val, 0))
        dist[str(val)] = count
        total += count
    results[var] = {'distribution': dist, 'sample_size': total}

print(json.dumps(results))
`;

	const jsonData = execSync(`uv run --with pandas python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
		maxBuffer: 100 * 1024 * 1024,
		encoding: 'utf-8',
		timeout: 300000
	});

	const data = JSON.parse(jsonData.trim()) as Record<
		string,
		{ distribution: Record<string, number>; sample_size: number }
	>;

	// Get total sample size (average across items, they're all ~37k)
	const totalSampleSize = Math.round(
		Object.values(data).reduce((sum, d) => sum + d.sample_size, 0) / Object.keys(data).length
	);

	console.log(`Processed ${totalSampleSize} responses per item (average)`);

	// Generate SQL
	const sql: string[] = [];
	const sourceId = generateId();

	sql.push(`-- Schwartz Values Survey (PVQ-21) Import from European Social Survey`);
	sql.push(`-- Generated: ${new Date().toISOString()}`);
	sql.push(`-- Source: European Social Survey Round 10 (2020-2022)`);
	sql.push(`-- Based on Schwartz Portrait Values Questionnaire (PVQ-21)`);
	sql.push('');
	sql.push(`-- Benchmark source`);
	sql.push(`INSERT INTO benchmark_sources (id, name, short_name, url, sample_size, year_range) VALUES (
  '${sourceId}',
  'Schwartz Values Survey (European Social Survey Round 10)',
  'Schwartz PVQ',
  'https://ess.sikt.no/',
  ${totalSampleSize},
  '2020-2022'
);`);
	sql.push('');

	let questionCount = 0;
	let distributionCount = 0;

	// Answer labels map option strings to themselves
	const answerLabels: Record<string, string> = {};
	for (const opt of OPTIONS) {
		answerLabels[opt] = opt;
	}

	for (const item of PVQ_ITEMS) {
		const questionId = generateId();
		const itemData = data[item.variable];

		if (!itemData || itemData.sample_size === 0) {
			console.log(`Skipping ${item.variable}: no data`);
			continue;
		}

		// Convert numeric keys (1-6) to option labels
		const labeledDist: Record<string, number> = {};
		for (let i = 1; i <= 6; i++) {
			labeledDist[OPTIONS[i - 1]] = itemData.distribution[String(i)] || 0;
		}

		sql.push(`-- ${item.value}: ${item.variable}`);
		sql.push(`INSERT INTO questions (id, text, category, response_type, options, active, benchmark_source_id, benchmark_question_id, answer_labels) VALUES (
  '${questionId}',
  '${escapeSQL(item.questionText)}',
  'Values',
  'multiple_choice',
  '${escapeSQL(JSON.stringify(OPTIONS))}',
  0,
  '${sourceId}',
  'schwartz_${item.variable}',
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
  '${escapeSQL(JSON.stringify(labeledDist))}',
  ${itemData.sample_size}
);`);
		distributionCount++;

		sql.push('');
	}

	// Write SQL file
	const outputPath = '/tmp/schwartz_import.sql';
	fs.writeFileSync(outputPath, sql.join('\n'));
	console.log(`\nGenerated SQL written to ${outputPath}`);
	console.log(`  Questions: ${questionCount}`);
	console.log(`  Distribution records: ${distributionCount}`);
	console.log('');
	console.log('To apply:');
	console.log('  1. Review the generated SQL');
	console.log('  2. Copy to migrations/0013_schwartz_data.sql');
	console.log('  3. Run: npm run db:migrate');
}

main().catch(console.error);
