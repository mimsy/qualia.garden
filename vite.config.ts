// ABOUTME: Vite configuration for SvelteKit.
// ABOUTME: Integrates Svelte plugin and configures build settings.

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()]
});
