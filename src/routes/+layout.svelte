<script lang="ts">
	// ABOUTME: Root layout component for the application.
	// ABOUTME: Imports global styles, renders shared header, and wraps all pages.

	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/state';

	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<Header isAdmin={data.isAdmin} currentPath={page.url.pathname} />
{@render children()}
