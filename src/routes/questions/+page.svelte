<script lang="ts">
	// ABOUTME: Questions browse page.
	// ABOUTME: Lists all questions with category, status, and source filtering plus sorting.

	import type { PageData } from './$types';
	import QuestionCard from '$lib/components/QuestionCard.svelte';

	let { data } = $props<{ data: PageData }>();

	function buildUrl(params: { category?: string | null; status?: string; source?: string | null }) {
		const url = new URL('/questions', 'http://localhost');
		if (params.category) url.searchParams.set('category', params.category);
		if (params.status && params.status !== 'published') url.searchParams.set('status', params.status);
		if (params.source) url.searchParams.set('source', params.source);
		return url.pathname + url.search;
	}

	const statusOptions = [
		{ value: 'published', label: 'Published' },
		{ value: 'draft', label: 'Drafts' },
		{ value: 'archived', label: 'Archived' },
		{ value: 'all', label: 'All' }
	];

	type SortKey = 'newest' | 'humanSimilarity' | 'aiConsensus' | 'aiConfidence';
	let sortBy = $state<SortKey>('newest');
	let sortAsc = $state(true);
	let currentPage = $state(1);
	const perPage = 20;

	const sortedQuestions = $derived.by(() => {
		const qs = [...data.questions];
		if (sortBy === 'newest') {
			return qs.sort((a, b) => {
				const cmp = b.createdAt.localeCompare(a.createdAt);
				return sortAsc ? cmp : -cmp;
			});
		}
		// For score sorts: nulls always go to bottom
		return qs.sort((a, b) => {
			const aVal = a[sortBy];
			const bVal = b[sortBy];
			if (aVal === null && bVal === null) return 0;
			if (aVal === null) return 1;
			if (bVal === null) return -1;
			// sortAsc true = lowest first (ascending)
			return sortAsc ? aVal - bVal : bVal - aVal;
		});
	});

	const totalPages = $derived(Math.ceil(sortedQuestions.length / perPage));
	const paginatedQuestions = $derived(
		sortedQuestions.slice((currentPage - 1) * perPage, currentPage * perPage)
	);

	// Reset to page 1 when sort changes
	$effect(() => {
		sortBy;
		sortAsc;
		currentPage = 1;
	});
</script>

<svelte:head>
	<title>Questions - Qualia Garden</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
	<header class="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
		<div class="max-w-6xl mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<a href="/" class="flex items-center gap-3 group">
					<img src="/favicon.png" alt="" class="w-9 h-9 transition-transform group-hover:scale-105" />
					<span class="font-semibold text-slate-800 text-lg tracking-tight">Qualia Garden</span>
				</a>
				<nav class="flex items-center gap-1">
					<a href="/questions" class="px-3 py-2 text-sm text-slate-900 font-medium bg-slate-100 rounded-lg">Questions</a>
					<a href="/models" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Models</a>
					<a href="/map" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Map</a>
					{#if data.isAdmin}
						<a
							href="/questions/new"
							class="ml-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
						>
							New Question
						</a>
					{/if}
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-6 py-8">
		<div class="flex flex-col md:flex-row gap-8">
			<aside class="md:w-48 flex-shrink-0">
				{#if data.isAdmin}
					<h2 class="font-medium text-slate-900 mb-3 text-sm">Status</h2>
					<nav class="space-y-1 mb-6">
						{#each statusOptions as option (option.value)}
							<a
								href={buildUrl({ category: data.selectedCategory, status: option.value, source: data.selectedSource })}
								class="block px-3 py-2 rounded-lg text-sm {data.selectedStatus === option.value
									? 'bg-blue-100 text-blue-700 font-medium'
									: 'text-slate-600 hover:bg-slate-100'}"
							>
								{option.label}
							</a>
						{/each}
					</nav>
				{/if}

				<h2 class="font-medium text-slate-900 mb-3 text-sm">Survey Source</h2>
				<nav class="space-y-1 mb-6">
					<a
						href={buildUrl({ category: data.selectedCategory, status: data.selectedStatus })}
						class="block px-3 py-2 rounded-lg text-sm {data.selectedSource === null
							? 'bg-blue-100 text-blue-700 font-medium'
							: 'text-slate-600 hover:bg-slate-100'}"
					>
						All
					</a>
					{#each data.sources as source (source.id)}
						<a
							href={buildUrl({ category: data.selectedCategory, status: data.selectedStatus, source: source.id })}
							class="block px-3 py-2 rounded-lg text-sm {data.selectedSource === source.id
								? 'bg-blue-100 text-blue-700 font-medium'
								: 'text-slate-600 hover:bg-slate-100'}"
						>
							{source.short_name}
						</a>
					{/each}
					<a
						href={buildUrl({ category: data.selectedCategory, status: data.selectedStatus, source: 'none' })}
						class="block px-3 py-2 rounded-lg text-sm {data.selectedSource === 'none'
							? 'bg-blue-100 text-blue-700 font-medium'
							: 'text-slate-600 hover:bg-slate-100'}"
					>
						No source
					</a>
				</nav>

				<h2 class="font-medium text-slate-900 mb-3 text-sm">Categories</h2>
				<nav class="space-y-1">
					<a
						href={buildUrl({ status: data.selectedStatus, source: data.selectedSource })}
						class="block px-3 py-2 rounded-lg text-sm {data.selectedCategory === null
							? 'bg-blue-100 text-blue-700 font-medium'
							: 'text-slate-600 hover:bg-slate-100'}"
					>
						All
					</a>
					{#each data.categories as category (category)}
						<a
							href={buildUrl({ category, status: data.selectedStatus, source: data.selectedSource })}
							class="block px-3 py-2 rounded-lg text-sm {data.selectedCategory === category
								? 'bg-blue-100 text-blue-700 font-medium'
								: 'text-slate-600 hover:bg-slate-100'}"
						>
							{category}
						</a>
					{/each}
				</nav>
			</aside>

			<div class="flex-1">
				<!-- Header with title and sort -->
				<div class="flex flex-wrap items-center justify-between gap-4 mb-6">
					<h2 class="text-2xl font-bold text-slate-900">
						{#if data.selectedCategory}
							{data.selectedCategory}
						{:else}
							All Questions
						{/if}
						<span class="text-slate-400 font-normal text-lg ml-2">
							({sortedQuestions.length})
						</span>
					</h2>
					<div class="flex items-center gap-2">
						<span class="text-sm text-slate-500">Sort by</span>
						<select
							bind:value={sortBy}
							class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
						>
							<option value="newest">Date</option>
							<option value="humanSimilarity">Alignment</option>
							<option value="aiConsensus">AI Consensus</option>
							<option value="aiConfidence">AI Confidence</option>
						</select>
						<button
							onclick={() => (sortAsc = !sortAsc)}
							class="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
							title={sortAsc ? 'Ascending' : 'Descending'}
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{#if sortAsc}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
								{:else}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								{/if}
							</svg>
						</button>
					</div>
				</div>

				<!-- Questions Grid -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
					{#each paginatedQuestions as question (question.id)}
						<QuestionCard {question} showCategory showSource />
					{/each}
				</div>

				{#if sortedQuestions.length === 0}
					<div class="text-center py-16">
						{#if data.isAdmin && data.selectedStatus === 'draft'}
							<p class="text-slate-500">No draft questions. <a href="/questions/new" class="text-blue-600 hover:underline">Create one</a></p>
						{:else}
							<p class="text-slate-500">No questions found.</p>
						{/if}
					</div>
				{:else if totalPages > 1}
					<!-- Pagination -->
					<div class="flex items-center justify-center gap-2 mt-8">
						<button
							onclick={() => (currentPage = Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							class="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Previous
						</button>
						<div class="flex items-center gap-1">
							{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
								{#if page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
									<button
										onclick={() => (currentPage = page)}
										class="w-8 h-8 text-sm rounded-lg {currentPage === page
											? 'bg-blue-600 text-white'
											: 'text-slate-600 hover:bg-slate-100'}"
									>
										{page}
									</button>
								{:else if page === currentPage - 2 || page === currentPage + 2}
									<span class="text-slate-400">…</span>
								{/if}
							{/each}
						</div>
						<button
							onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
							disabled={currentPage === totalPages}
							class="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
				{/if}
			</div>
		</div>
	</main>

	<footer class="border-t border-slate-200 py-8 px-6 mt-12">
		<div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
			<span>Qualia Garden</span>
			<span>Exploring AI values alignment</span>
		</div>
	</footer>
</div>
