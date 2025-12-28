<script lang="ts">
	// ABOUTME: Root layout component for the application.
	// ABOUTME: Imports global styles and wraps all pages.

	import '../app.css';

	let { children } = $props();
</script>

{@render children()}
