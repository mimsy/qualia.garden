// ABOUTME: ESLint configuration for Svelte 5 + TypeScript project.
// ABOUTME: Uses flat config format with svelte and typescript-eslint plugins.

import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default [
	// Global ignores
	{
		ignores: ['.svelte-kit/**', 'build/**', 'dist/**', 'node_modules/**', '.wrangler/**', '*.config.js', '*.config.ts']
	},

	// Base JS/TS config
	js.configs.recommended,

	// TypeScript files (src directory)
	{
		files: ['src/**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				extraFileExtensions: ['.svelte']
			},
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		plugins: {
			'@typescript-eslint': ts
		},
		rules: {
			...ts.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'no-undef': 'off' // TypeScript handles this
		}
	},

	// Workers TypeScript files (separate tsconfig)
	{
		files: ['workers/**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './workers/poll-processor/tsconfig.json'
			},
			globals: {
				...globals.node
			}
		},
		plugins: {
			'@typescript-eslint': ts
		},
		rules: {
			...ts.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'no-undef': 'off' // TypeScript handles this
		}
	},

	// Svelte files
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				project: './tsconfig.json',
				extraFileExtensions: ['.svelte']
			},
			globals: {
				...globals.browser
			}
		},
		plugins: {
			svelte,
			'@typescript-eslint': ts
		},
		rules: {
			...svelte.configs.recommended.rules,
			...ts.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'no-undef': 'off', // TypeScript handles this
			'svelte/no-at-html-tags': 'warn',
			// Svelte compiler warnings - downgrade to warnings for lint
			// state_referenced_locally: intentional for form initialization from props
			// a11y warnings: valid but not critical blockers
			'svelte/valid-compile': ['warn', { ignoreWarnings: true }]
		}
	},

	// JavaScript files (config files, etc.)
	{
		files: ['**/*.js', '**/*.mjs'],
		languageOptions: {
			globals: {
				...globals.node
			}
		}
	},

	// Prettier - must be last to override conflicting rules
	prettierConfig
];
