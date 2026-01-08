<script lang="ts">
	// ABOUTME: Models index page showing all AI models.
	// ABOUTME: Lists models with filter/sort controls and three score badges.

	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import ScoreBadge from '$lib/components/ScoreBadge.svelte';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	type Model = (typeof data.models)[number];

	let selectedFamily = $state<string | null>(null);
	let sortBy = $state<'name' | 'alignment' | 'consensus' | 'confidence'>('name');
	let sortAscending = $state(true);

	// Add model modal state
	let showAddModal = $state(false);
	let searchQuery = $state('');
	let availableModels = $state<OpenRouterModel[]>([]);
	let loadingModels = $state(true);
	let showDropdown = $state(false);
	let selectedModel = $state<OpenRouterModel | null>(null);
	let displayName = $state('');
	let reasoningEnabled = $state(false);

	interface OpenRouterModel {
		id: string;
		name: string;
		context_length: number;
		pricing: { prompt: string; completion: string };
		supports_reasoning: boolean;
	}

	const filteredOpenRouterModels = $derived(
		searchQuery.length >= 2
			? availableModels
					.filter(
						(m) =>
							m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
							m.id.toLowerCase().includes(searchQuery.toLowerCase())
					)
					.slice(0, 15)
			: []
	);

	onMount(async () => {
		try {
			const res = await fetch('/api/openrouter/models');
			if (res.ok) {
				availableModels = await res.json();
			}
		} catch (err) {
			console.error('Failed to load models:', err);
		}
		loadingModels = false;
	});

	// Close modal on successful create
	$effect(() => {
		if (form?.created) {
			showAddModal = false;
			selectedModel = null;
			displayName = '';
			reasoningEnabled = false;
			searchQuery = '';
		}
	});

	function selectOpenRouterModel(model: OpenRouterModel) {
		selectedModel = model;
		displayName = model.name.includes(': ') ? model.name.split(': ').slice(1).join(': ') : model.name;
		reasoningEnabled = model.supports_reasoning;
		searchQuery = '';
		showDropdown = false;
	}

	function clearSelection() {
		selectedModel = null;
		displayName = '';
		reasoningEnabled = false;
		searchQuery = '';
	}

	function handleInputBlur() {
		setTimeout(() => {
			showDropdown = false;
		}, 200);
	}

	function formatPrice(price: string): string {
		const num = parseFloat(price);
		if (num === 0) return 'Free';
		if (num < 0.001) return `$${(num * 1000000).toFixed(2)}/M`;
		return `$${num.toFixed(4)}/1k`;
	}

	function closeModal() {
		showAddModal = false;
		selectedModel = null;
		displayName = '';
		reasoningEnabled = false;
		searchQuery = '';
	}

	// Get unique families for filter
	const families = $derived.by(() => {
		const familySet = new Set<string>();
		for (const m of data.models) {
			familySet.add(m.family);
		}
		return Array.from(familySet).sort();
	});

	// Filter and sort models
	const filteredModels = $derived.by(() => {
		let models = selectedFamily ? data.models.filter((m: Model) => m.family === selectedFamily) : [...data.models];

		models.sort((a: Model, b: Model) => {
			let comparison = 0;
			switch (sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'alignment': {
					const aAlign = a.humanAlignmentScore ?? -1;
					const bAlign = b.humanAlignmentScore ?? -1;
					comparison = bAlign - aAlign;
					break;
				}
				case 'consensus': {
					const aCons = a.aiConsensusScore ?? -1;
					const bCons = b.aiConsensusScore ?? -1;
					comparison = bCons - aCons;
					break;
				}
				case 'confidence': {
					const aConf = a.selfConsistencyScore ?? -1;
					const bConf = b.selfConsistencyScore ?? -1;
					comparison = bConf - aConf;
					break;
				}
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
					<a
						href="/questions"
						class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
						>Questions</a
					>
					<a href="/models" class="px-3 py-2 text-sm text-slate-900 font-medium bg-slate-100 rounded-lg">Models</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-6 py-12">
		<!-- Sync result message -->
		{#if form?.synced}
			<div class="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200">
				Synced reasoning flags from OpenRouter. {form.updatedCount} model{form.updatedCount === 1 ? '' : 's'} updated.
			</div>
		{/if}

		<!-- Hero -->
		<div class="mb-8">
			<div class="flex items-center justify-between mb-3">
				<h1 class="text-3xl font-bold text-slate-900 tracking-tight">AI Models</h1>
				{#if data.isAdmin}
					<div class="flex items-center gap-2">
						<form method="POST" action="?/syncReasoning">
							<button
								type="submit"
								class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
								title="Update reasoning flags from OpenRouter"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
								Sync Reasoning
							</button>
						</form>
						<button
							onclick={() => (showAddModal = true)}
							class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							Add Model
						</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Filter and sort controls -->
		<div class="flex items-center justify-between gap-3 mb-6">
			<p class="text-slate-600">
				{data.models.length} models surveyed
			</p>
			<div class="flex items-center gap-3">
				<!-- Provider filter -->
				<select
					bind:value={selectedFamily}
					class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					<option value={null}>All providers</option>
					{#each families as family (family)}
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
		</div>

		<!-- Models grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each filteredModels as model (model.id)}
				<div
					class="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-200 {!model.active
						? 'opacity-50'
						: ''}"
				>
					<a href="/models/{model.id}" class="block p-5">
						<div class="flex items-start justify-between gap-3">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 flex-wrap mb-1">
									<span class="font-medium text-slate-900 group-hover:text-slate-700 transition-colors"
										>{model.name}</span
									>
									{#if model.supports_reasoning}
										<span class="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md font-medium">
											reasoning
										</span>
									{/if}
									{#if !model.active}
										<span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md"> inactive </span>
									{/if}
								</div>
								<div class="text-xs text-slate-400 capitalize">{model.family}</div>
							</div>
							<svg
								class="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</a>
					{#if data.isAdmin}
						<div class="px-5 pb-4 flex items-center justify-between">
							<span class="text-xs text-slate-500">{model.active ? 'Active' : 'Inactive'}</span>
							<form method="POST" action="?/toggle">
								<input type="hidden" name="id" value={model.id} />
								<input type="hidden" name="active" value={model.active.toString()} />
								<button
									type="submit"
									onclick={(e) => e.stopPropagation()}
									class="w-12 h-6 rounded-full transition-colors relative {model.active
										? 'bg-green-500'
										: 'bg-gray-300'}"
									title={model.active ? 'Click to deactivate' : 'Click to activate'}
									aria-label={model.active ? 'Deactivate model' : 'Activate model'}
								>
									<span
										class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform {model.active
											? 'left-6'
											: 'left-0.5'}"
									></span>
								</button>
							</form>
						</div>
					{/if}
					{#if model.humanAlignmentScore !== null || model.aiConsensusScore !== null || model.selfConsistencyScore !== null}
						<div class="flex border-t border-slate-100">
							<ScoreBadge score={model.humanAlignmentScore} label="Alignment" type="humanSimilarity" context="model" />
							<div class="w-px bg-slate-100"></div>
							<ScoreBadge score={model.aiConsensusScore} label="Consensus" type="aiConsensus" context="model" />
							<div class="w-px bg-slate-100"></div>
							<ScoreBadge score={model.selfConsistencyScore} label="Confidence" type="aiConfidence" context="model" />
						</div>
					{/if}
				</div>
			{:else}
				<div class="col-span-full text-center py-12 text-slate-500">No models match the selected filter.</div>
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

<!-- Add Model Modal -->
{#if showAddModal && data.isAdmin}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<!-- Backdrop -->
		<button class="absolute inset-0 bg-black/50" onclick={closeModal} aria-label="Close modal"></button>

		<!-- Modal content -->
		<div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
			<div class="p-6 border-b border-slate-100">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold text-slate-900">Add Model</h2>
					<button
						onclick={closeModal}
						class="text-slate-400 hover:text-slate-600 transition-colors"
						aria-label="Close modal"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<p class="text-sm text-slate-500 mt-1">Search and add an OpenRouter model</p>
			</div>

			<!-- Error Message -->
			{#if form?.error}
				<div class="mx-6 mt-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
					{form.error}
				</div>
			{/if}

			{#if !selectedModel}
				<!-- Search State -->
				<div class="p-6">
					<label for="model-search" class="block text-sm font-medium text-slate-700 mb-2">
						Search OpenRouter Models
					</label>
					<div class="relative">
						<input
							id="model-search"
							type="text"
							bind:value={searchQuery}
							onfocus={() => (showDropdown = true)}
							onblur={handleInputBlur}
							disabled={loadingModels}
							class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder={loadingModels ? 'Loading models...' : 'Search by name or ID...'}
							autocomplete="off"
						/>

						{#if showDropdown && filteredOpenRouterModels.length > 0}
							<div
								class="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-auto"
							>
								{#each filteredOpenRouterModels as model (model.id)}
									<button
										type="button"
										onclick={() => selectOpenRouterModel(model)}
										class="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
									>
										<div class="flex justify-between items-start">
											<div class="flex-1 min-w-0">
												<div class="font-medium text-slate-900 truncate">{model.name}</div>
												<div class="text-sm text-slate-500 truncate">{model.id}</div>
											</div>
											<div class="text-right text-sm text-slate-500 ml-4 flex-shrink-0">
												<div>{(model.context_length / 1000).toFixed(0)}k ctx</div>
												<div class="text-xs">{formatPrice(model.pricing.prompt)}</div>
											</div>
										</div>
									</button>
								{/each}
							</div>
						{/if}

						{#if showDropdown && searchQuery.length >= 2 && filteredOpenRouterModels.length === 0 && !loadingModels}
							<div
								class="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-slate-500"
							>
								No models found matching "{searchQuery}"
							</div>
						{/if}
					</div>
					{#if searchQuery.length > 0 && searchQuery.length < 2}
						<p class="text-sm text-slate-400 mt-2">Type at least 2 characters to search...</p>
					{/if}
				</div>
			{:else}
				<!-- Selected Model State -->
				<div class="p-6 border-b border-slate-100">
					<div class="flex items-start justify-between">
						<div>
							<span class="text-xs font-medium text-slate-400 uppercase tracking-wide">Selected Model</span>
							<h3 class="text-lg font-semibold text-slate-900 mt-1">{selectedModel.name}</h3>
							<p class="text-sm text-slate-500 mt-0.5">{selectedModel.id}</p>
						</div>
						<button
							type="button"
							onclick={clearSelection}
							class="text-sm text-slate-500 hover:text-slate-700 transition-colors"
						>
							Change
						</button>
					</div>

					<!-- Model Info Grid -->
					<div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
						<div>
							<span class="text-xs text-slate-400 uppercase tracking-wide">Context</span>
							<p class="text-sm font-medium text-slate-700 mt-0.5">
								{(selectedModel.context_length / 1000).toFixed(0)}k tokens
							</p>
						</div>
						<div>
							<span class="text-xs text-slate-400 uppercase tracking-wide">Input Price</span>
							<p class="text-sm font-medium text-slate-700 mt-0.5">
								{formatPrice(selectedModel.pricing.prompt)}
							</p>
						</div>
						<div>
							<span class="text-xs text-slate-400 uppercase tracking-wide">Output Price</span>
							<p class="text-sm font-medium text-slate-700 mt-0.5">
								{formatPrice(selectedModel.pricing.completion)}
							</p>
						</div>
					</div>
				</div>

				<!-- Form Fields -->
				<form method="POST" action="?/create" class="p-6 space-y-6">
					<!-- Hidden fields -->
					<input type="hidden" name="openrouter_id" value={selectedModel.id} />
					<input type="hidden" name="family" value={selectedModel.id.split('/')[0]} />
					<input type="hidden" name="supports_reasoning" value={reasoningEnabled.toString()} />

					<!-- Display Name -->
					<div>
						<label for="display-name" class="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
						<input
							id="display-name"
							name="name"
							type="text"
							bind:value={displayName}
							required
							class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<p class="text-sm text-slate-500 mt-1">How this model appears in the UI</p>
					</div>

					<!-- Reasoning Toggle (only if model supports it) -->
					{#if selectedModel.supports_reasoning}
						<div>
							<div class="flex items-center gap-3">
								<input
									id="reasoning"
									type="checkbox"
									bind:checked={reasoningEnabled}
									class="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
								/>
								<label for="reasoning" class="text-sm text-slate-700">Enable extended thinking/reasoning</label>
							</div>
							<p class="text-xs text-slate-500 mt-1 ml-7">
								When enabled, the model will show its reasoning process in responses.
							</p>
						</div>
					{/if}

					<!-- Submit Button -->
					<div class="flex gap-3 pt-2">
						<button
							type="button"
							onclick={closeModal}
							class="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
						>
							Add Model
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}
