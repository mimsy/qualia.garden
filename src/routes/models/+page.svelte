<script lang="ts">
	// ABOUTME: Models index page showing all AI models.
	// ABOUTME: Lists models with filter/sort controls and three score badges.

	import type { PageData } from './$types';
	import ScoreBadge from '$lib/components/ScoreBadge.svelte';

	let { data } = $props<{ data: PageData }>();

	type Model = typeof data.models[number];

	let selectedFamily = $state<string | null>(null);
	let sortBy = $state<'name' | 'alignment' | 'consensus' | 'confidence'>('name');
	let sortAscending = $state(true);

	// Get unique families for filter
	const families = $derived(() => {
		const familySet = new Set<string>();
		for (const m of data.models) {
			familySet.add(m.family);
		}
		return Array.from(familySet).sort();
	});

	// Filter and sort models
	const filteredModels = $derived.by(() => {
		let models = selectedFamily
			? data.models.filter((m: Model) => m.family === selectedFamily)
			: [...data.models];

		models.sort((a: Model, b: Model) => {
			let comparison = 0;
			switch (sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'alignment':
					const aAlign = a.humanAlignmentScore ?? -1;
					const bAlign = b.humanAlignmentScore ?? -1;
					comparison = bAlign - aAlign;
					break;
				case 'consensus':
					const aCons = a.aiConsensusScore ?? -1;
					const bCons = b.aiConsensusScore ?? -1;
					comparison = bCons - aCons;
					break;
				case 'confidence':
					const aConf = a.selfConsistencyScore ?? -1;
					const bConf = b.selfConsistencyScore ?? -1;
					comparison = bConf - aConf;
					break;
			}
			return sortAscending ? comparison : -comparison;
		});

		return models;
	});
</script>

<svelte:head>
	<title>Models — Qualia Garden</title>
	<meta name="description" content="AI models polled by Qualia Garden" />
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
					<a href="/questions" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Questions</a>
					<a href="/models" class="px-3 py-2 text-sm text-slate-900 font-medium bg-slate-100 rounded-lg">Models</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-6 py-12">
		<!-- Hero -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-slate-900 tracking-tight mb-3">AI Models</h1>
			<p class="text-slate-600">
				{data.models.length} models surveyed
			</p>
		</div>

		<!-- Filter and sort controls -->
		<div class="flex items-center justify-end gap-3 mb-6">
			<!-- Provider filter -->
			<select
				bind:value={selectedFamily}
				class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			>
				<option value={null}>All providers</option>
				{#each families() as family}
					<option value={family} class="capitalize">{family}</option>
				{/each}
			</select>

			<!-- Sort by -->
			<select
				bind:value={sortBy}
				class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			>
				<option value="name">Sort by name</option>
				<option value="alignment">Sort by alignment</option>
				<option value="consensus">Sort by consensus</option>
				<option value="confidence">Sort by confidence</option>
			</select>

			<!-- Sort direction -->
			<button
				onclick={() => (sortAscending = !sortAscending)}
				class="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
				title={sortAscending ? 'Ascending' : 'Descending'}
			>
				{#if sortAscending}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
					</svg>
				{:else}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				{/if}
			</button>
		</div>

		<!-- Models grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each filteredModels as model (model.id)}
				<a
					href="/models/{model.id}"
					class="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-200 {!model.active ? 'opacity-50' : ''}"
				>
					<div class="p-5">
						<div class="flex items-start justify-between gap-3">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 flex-wrap mb-1">
									<span class="font-medium text-slate-900 group-hover:text-slate-700 transition-colors">{model.name}</span>
									{#if model.supports_reasoning}
										<span class="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md font-medium">
											reasoning
										</span>
									{/if}
									{#if !model.active}
										<span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
											inactive
										</span>
									{/if}
								</div>
								<div class="text-xs text-slate-400 capitalize">{model.family}</div>
							</div>
							<svg class="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</div>
					{#if model.humanAlignmentScore !== null || model.aiConsensusScore !== null || model.selfConsistencyScore !== null}
						<div class="flex border-t border-slate-100">
							<ScoreBadge score={model.humanAlignmentScore} label="Alignment" type="humanSimilarity" context="model" />
							<div class="w-px bg-slate-100"></div>
							<ScoreBadge score={model.aiConsensusScore} label="Consensus" type="aiConsensus" context="model" />
							<div class="w-px bg-slate-100"></div>
							<ScoreBadge score={model.selfConsistencyScore} label="Confidence" type="aiConfidence" context="model" />
						</div>
					{/if}
				</a>
			{:else}
				<div class="col-span-full text-center py-12 text-slate-500">
					No models match the selected filter.
				</div>
			{/each}
		</div>
	</main>

	<footer class="border-t border-slate-200 py-8 px-6 mt-12">
		<div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
			<span>Qualia Garden</span>
			<span>Exploring AI values alignment</span>
		</div>
	</footer>
</div>
