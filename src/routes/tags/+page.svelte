<script lang="ts">
	// ABOUTME: Tags index page showing all tags with aggregate statistics.
	// ABOUTME: Displays tags in a grid with question counts and score metrics.

	import type { PageData } from './$types';
	import ScoreBadge from '$lib/components/ScoreBadge.svelte';

	let { data } = $props<{ data: PageData }>();

	type SortKey = 'count' | 'name' | 'humanSimilarity' | 'aiConsensus' | 'aiConfidence';
	let sortBy = $state<SortKey>('count');
	let sortAsc = $state(false);

	const sortedTags = $derived.by(() => {
		const tags = [...data.tags];
		return tags.sort((a, b) => {
			if (sortBy === 'name') {
				const cmp = a.name.localeCompare(b.name);
				return sortAsc ? cmp : -cmp;
			}
			if (sortBy === 'count') {
				const cmp = a.questionCount - b.questionCount;
				return sortAsc ? cmp : -cmp;
			}
			// For score sorts: nulls always go to bottom
			const aVal = a[sortBy];
			const bVal = b[sortBy];
			if (aVal === null && bVal === null) return 0;
			if (aVal === null) return 1;
			if (bVal === null) return -1;
			return sortAsc ? aVal - bVal : bVal - aVal;
		});
	});
</script>

<svelte:head>
	<title>Tags — Qualia Garden</title>
	<meta name="description" content="Browse questions by tag and see aggregate AI response statistics" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
	<main class="max-w-6xl mx-auto px-6 py-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-slate-900 tracking-tight mb-2">Tags</h1>
			<p class="text-slate-500">Browse questions by topic and see how AI models respond across different themes.</p>
		</div>

		<!-- Controls -->
		<div class="flex flex-wrap gap-4 items-center justify-between mb-6">
			<p class="text-sm text-slate-500">{data.tags.length} tags</p>
			<div class="flex items-center gap-2">
				<span class="text-sm text-slate-500">Sort by</span>
				<select
					bind:value={sortBy}
					class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
				>
					<option value="count">Question count</option>
					<option value="name">Name</option>
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

		<!-- Tags Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each sortedTags as tag (tag.id)}
				<a
					href="/tags/{tag.id}"
					class="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all"
				>
					<!-- Tag Header -->
					<div class="px-5 py-4">
						<div class="flex items-center justify-between mb-1">
							<h2 class="text-lg font-semibold text-slate-900">{tag.name}</h2>
							<span class="text-sm text-slate-500"
								>{tag.questionCount} question{tag.questionCount === 1 ? '' : 's'}</span
							>
						</div>
						{#if tag.description}
							<p class="text-sm text-slate-500 line-clamp-2">{tag.description}</p>
						{/if}
					</div>

					<!-- Score bars footer -->
					{#if tag.humanSimilarity !== null || tag.aiConsensus !== null || tag.aiConfidence !== null}
						<div class="flex border-t border-slate-100">
							<ScoreBadge score={tag.humanSimilarity} label="Alignment" type="humanSimilarity" context="aggregate" />
							<div class="w-px bg-slate-100"></div>
							<ScoreBadge score={tag.aiConsensus} label="Consensus" type="aiConsensus" context="aggregate" />
							<div class="w-px bg-slate-100"></div>
							<ScoreBadge score={tag.aiConfidence} label="Confidence" type="aiConfidence" context="aggregate" />
						</div>
					{:else}
						<div class="px-5 py-3 border-t border-slate-100 text-sm text-slate-400">No responses yet</div>
					{/if}
				</a>
			{/each}
		</div>

		{#if sortedTags.length === 0}
			<div class="text-center py-16">
				<p class="text-slate-500">No tags have been created yet.</p>
			</div>
		{/if}
	</main>
</div>
