// ABOUTME: Vite configuration for SvelteKit.
// ABOUTME: Integrates Svelte plugin and configures build/test settings.

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: ['dreamscape']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'workers/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/tests/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/lib/**/*.ts', 'workers/**/*.ts'],
			exclude: ['**/*.d.ts', '**/*.test.ts', '**/*.spec.ts']
		}
	}
});
