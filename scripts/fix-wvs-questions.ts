// ABOUTME: Migration script to fix WVS questions for better AI clarity.
// ABOUTME: Generates SQL to update options, clean text, and delete existing polls.

import * as fs from 'fs';
import { execSync } from 'child_process';

interface Question {
	id: string;
	text: string;
	response_type: string;
	options: string | null;
	answer_labels: string | null;
}

function escapeSQL(str: string): string {
	return str.replace(/'/g, "''");
}

// Query local D1 database
function queryDB(sql: string): string {
	const result = execSync(
		`npx wrangler d1 execute qualia-garden-db --local --command "${sql.replace(/"/g, '\\"')}"`,
		{ encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
	);
	return result;
}

// Get all WVS questions via wrangler
const questionsJson = execSync(
	`npx wrangler d1 execute qualia-garden --local --json --command "SELECT id, text, response_type, options, answer_labels FROM questions WHERE benchmark_source_id IS NOT NULL"`,
	{ encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
);

const parsed = JSON.parse(questionsJson);
const questions: Question[] = parsed[0]?.results || [];

console.log(`Found ${questions.length} WVS questions to process\n`);

const sqlStatements: string[] = [];

// Track what we're changing
const changes: Array<{ id: string; desc: string }> = [];

for (const q of questions) {
	let newText = q.text;
	let newOptions = q.options;
	let newResponseType = q.response_type;

	const answerLabels: Record<string, string> | null = q.answer_labels ? JSON.parse(q.answer_labels) : null;
	const options: string[] | null = q.options ? JSON.parse(q.options) : null;

	// 1. Clean question text - remove "On a scale of X to Y, X meaning 'A' and Y meaning 'B'" prefix
	const scalePattern = /^On a scale of \d+ to \d+,\s*\d+ meaning '[^']+' and \d+ meaning '[^']+',\s*/i;
	if (scalePattern.test(newText)) {
		newText = newText.replace(scalePattern, '');
		// Capitalize first letter
		newText = newText.charAt(0).toUpperCase() + newText.slice(1);
	}

	// 2. Determine if all options have meaningful labels (not just the number repeated)
	const hasFullLabels = answerLabels && options && options.every((opt) => {
		const label = answerLabels[opt];
		return label && label !== opt; // Label exists and isn't just the number
	});

	// 3. Handle response type and options based on current type
	if (q.response_type === 'yes_no' && answerLabels && options) {
		// Convert yes_no to multiple_choice with label options
		newResponseType = 'multiple_choice';
		const labelOptions = options.map((opt) => answerLabels[opt] || opt);
		newOptions = JSON.stringify(labelOptions);
		changes.push({ id: q.id, desc: `yes_no -> multiple_choice, options: ${newOptions}` });
	} else if (q.response_type === 'scale' && hasFullLabels && options && options.length <= 5) {
		// 1-5 scales with full labels become multiple_choice
		newResponseType = 'multiple_choice';
		const labelOptions = options.map((opt) => answerLabels![opt] || opt);
		newOptions = JSON.stringify(labelOptions);
		changes.push({ id: q.id, desc: `scale -> multiple_choice, options: ${newOptions}` });
	} else if (q.response_type === 'multiple_choice' && hasFullLabels && options) {
		// Already multiple_choice, just update options to use labels
		const labelOptions = options.map((opt) => answerLabels![opt] || opt);
		newOptions = JSON.stringify(labelOptions);
		changes.push({ id: q.id, desc: `options: ${newOptions}` });
	} else if (newText !== q.text) {
		// Only text changed
		changes.push({ id: q.id, desc: `text cleaned` });
	}
	// For 1-10 scales, keep as-is (only endpoint labels)

	// Generate UPDATE statement if anything changed
	if (newText !== q.text || newOptions !== q.options || newResponseType !== q.response_type) {
		sqlStatements.push(
			`UPDATE questions SET text = '${escapeSQL(newText)}', options = '${escapeSQL(newOptions || '')}', response_type = '${newResponseType}' WHERE id = '${q.id}';`
		);
	}
}

// Add statements to delete existing polls and responses
const questionIds = questions.map((q) => `'${q.id}'`).join(',');
sqlStatements.push(`DELETE FROM responses WHERE poll_id IN (SELECT id FROM polls WHERE question_id IN (${questionIds}));`);
sqlStatements.push(`DELETE FROM polls WHERE question_id IN (${questionIds});`);

// Output summary
console.log('Changes to be made:');
for (const c of changes) {
	console.log(`  ${c.id}: ${c.desc}`);
}
console.log(`\nTotal: ${changes.length} questions updated`);
console.log(`Will delete all existing polls/responses for ${questions.length} WVS questions\n`);

// Write SQL file
const sqlFile = 'scripts/fix-wvs-questions.sql';
fs.writeFileSync(sqlFile, sqlStatements.join('\n'));
console.log(`SQL written to ${sqlFile}`);
console.log(`\nTo apply locally:  npx wrangler d1 execute qualia-garden --local --file=${sqlFile}`);
console.log(`To apply to prod:  npx wrangler d1 execute qualia-garden --remote --file=${sqlFile}`);
