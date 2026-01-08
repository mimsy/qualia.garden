// ABOUTME: Normalizes human response distribution keys to 1-based integers.
// ABOUTME: Generates SQL to update distributions for consistency across sources.

import * as fs from 'fs';

// This script reads the current database state and generates SQL to normalize
// distribution keys from various formats (text labels, lowercase, etc.) to
// consistent 1-based integer keys ("1", "2", "3", ...).
//
// Run this to generate the SQL, then apply as a migration.

interface Question {
	id: string;
	options: string;
	benchmark_source_id: string;
}

interface Distribution {
	id: string;
	question_id: string;
	distribution: string;
}

interface BenchmarkSource {
	id: string;
	short_name: string;
}

function escapeSQL(str: string): string {
	return str.replace(/'/g, "''");
}

// Parse the export from a query like:
// SELECT json_group_array(json_object('id', id, 'options', options, ...)) FROM questions
async function main() {
	console.log('Distribution Key Normalization Script');
	console.log('=====================================\n');
	console.log('This script generates SQL to normalize distribution keys to 1-based integers.\n');
	console.log('To use:');
	console.log('1. Run these queries against the database and save the JSON output:');
	console.log('');
	console.log("   SELECT json_group_array(json_object('id', q.id, 'options', q.options, 'short_name', bs.short_name))");
	console.log('   FROM questions q');
	console.log('   JOIN benchmark_sources bs ON q.benchmark_source_id = bs.id;');
	console.log('');
	console.log(
		"   SELECT json_group_array(json_object('id', id, 'question_id', question_id, 'distribution', distribution))"
	);
	console.log('   FROM human_response_distributions;');
	console.log('');
	console.log('2. Save the output to /tmp/questions.json and /tmp/distributions.json');
	console.log('3. Run this script again with: npx tsx scripts/normalize-distributions.ts --apply\n');

	const applyMode = process.argv.includes('--apply');

	if (!applyMode) {
		console.log('Exiting. Use --apply after creating the JSON files.\n');
		process.exit(0);
	}

	// Check for input files
	const questionsPath = '/tmp/questions.json';
	const distributionsPath = '/tmp/distributions.json';

	if (!fs.existsSync(questionsPath) || !fs.existsSync(distributionsPath)) {
		console.error('Missing input files. Please create /tmp/questions.json and /tmp/distributions.json');
		process.exit(1);
	}

	const questions: Array<{ id: string; options: string; short_name: string }> = JSON.parse(
		fs.readFileSync(questionsPath, 'utf-8')
	);
	const distributions: Distribution[] = JSON.parse(fs.readFileSync(distributionsPath, 'utf-8'));

	console.log(`Loaded ${questions.length} questions and ${distributions.length} distributions\n`);

	// Build question map
	const questionMap = new Map<string, { options: string[]; source: string }>();
	for (const q of questions) {
		const options = q.options ? (JSON.parse(q.options) as string[]) : [];
		questionMap.set(q.id, { options, source: q.short_name });
	}

	// Sources that already use numeric keys
	const numericSources = new Set(['AIMS', 'WVS7']);

	// Generate SQL updates
	const sql: string[] = [];
	sql.push('-- Distribution Key Normalization');
	sql.push(`-- Generated: ${new Date().toISOString()}`);
	sql.push('-- Converts distribution keys to 1-based integers\n');

	let updateCount = 0;
	let skippedCount = 0;

	for (const dist of distributions) {
		const question = questionMap.get(dist.question_id);
		if (!question) {
			console.log(`Warning: No question found for distribution ${dist.id}`);
			continue;
		}

		// Skip if source already uses numeric keys
		if (numericSources.has(question.source)) {
			skippedCount++;
			continue;
		}

		const oldDist = JSON.parse(dist.distribution) as Record<string, number>;
		const newDist: Record<string, number> = {};
		let needsUpdate = false;

		// Map each key to its 1-based index
		for (const [key, count] of Object.entries(oldDist)) {
			// Check if key is already numeric
			if (/^\d+$/.test(key)) {
				newDist[key] = count;
				continue;
			}

			// Find the option index (case-insensitive match)
			// Also handle snake_case to space conversion for PhilPapers
			const keyLower = key.toLowerCase();
			// Convert underscores to spaces, and also try with hyphens
			const keyWithSpaces = keyLower.replace(/_/g, ' ');
			const keyWithHyphens = keyLower.replace(/_/g, '-');
			// Also handle apostrophes: "dont" -> "don't"
			const keyWithApostrophe = keyWithSpaces.replace(/\bdont\b/g, "don't").replace(/\bdoesnt\b/g, "doesn't");
			let foundIndex = -1;

			for (let i = 0; i < question.options.length; i++) {
				const optLower = question.options[i].toLowerCase();
				// Normalize option too (remove hyphens, convert to spaces)
				const optNormalized = optLower.replace(/-/g, ' ');
				// Exact match
				if (
					keyLower === optLower ||
					keyWithSpaces === optLower ||
					keyWithHyphens === optLower ||
					keyWithApostrophe === optLower ||
					keyWithSpaces === optNormalized
				) {
					foundIndex = i;
					break;
				}
				// StartsWith match for options with extra text in parentheses
				if (
					optLower.startsWith(keyWithSpaces + ' ') ||
					optLower.startsWith(keyWithHyphens + ' ') ||
					optLower.startsWith(keyWithSpaces + '(') ||
					optNormalized.startsWith(keyWithSpaces + ' ')
				) {
					foundIndex = i;
					break;
				}
				// Contains match - option contains all the key words in order
				const keyWords = keyWithSpaces.split(' ');
				let optRemaining = optNormalized;
				let allWordsFound = true;
				for (const word of keyWords) {
					const wordIdx = optRemaining.indexOf(word);
					if (wordIdx === -1) {
						allWordsFound = false;
						break;
					}
					optRemaining = optRemaining.slice(wordIdx + word.length);
				}
				if (allWordsFound && keyWords.length >= 2) {
					foundIndex = i;
					break;
				}
			}

			if (foundIndex >= 0) {
				const newKey = String(foundIndex + 1);
				newDist[newKey] = count;
				needsUpdate = true;
			} else {
				// Key doesn't match any option - keep as is (shouldn't happen)
				console.log(`Warning: Key "${key}" not found in options for question ${dist.question_id}`);
				newDist[key] = count;
			}
		}

		if (needsUpdate) {
			const newDistJson = JSON.stringify(newDist);
			sql.push(
				`UPDATE human_response_distributions SET distribution = '${escapeSQL(newDistJson)}' WHERE id = '${dist.id}';`
			);
			updateCount++;
		}
	}

	console.log(`Generated ${updateCount} UPDATE statements (skipped ${skippedCount} numeric sources)\n`);

	// Write SQL file
	const outputPath = '/tmp/normalize_distributions.sql';
	fs.writeFileSync(outputPath, sql.join('\n'));
	console.log(`SQL written to ${outputPath}`);
	console.log('Review and copy to migrations/0015_normalize_distributions.sql');
}

main().catch(console.error);
