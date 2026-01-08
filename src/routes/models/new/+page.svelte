<!-- ABOUTME: Add model form with OpenRouter autocomplete. -->
<!-- ABOUTME: Allows admins to add new OpenRouter models to the database. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';

	let { form } = $props<{ data: PageData; form: ActionData }>();

	interface OpenRouterModel {
		id: string;
		name: string;
		context_length: number;
		pricing: { prompt: string; completion: string };
		supports_reasoning: boolean;
	}

	let searchQuery = $state('');
	let availableModels = $state<OpenRouterModel[]>([]);
	let loading = $state(true);
	let showDropdown = $state(false);

	// Selected model state
	let selectedModel = $state<OpenRouterModel | null>(null);
	let displayName = $state('');
	let reasoningEnabled = $state(false);

	const filteredModels = $derived(
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
		loading = false;
	});

	function selectModel(model: OpenRouterModel) {
		selectedModel = model;
		// Strip provider prefix (e.g., "Anthropic: Claude 3.5 Sonnet" -> "Claude 3.5 Sonnet")
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
</script>

<svelte:head>
	<title>Add Model — Qualia Garden</title>
	<meta name="description" content="Add a new AI model to Qualia Garden" />
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

	<main class="max-w-2xl mx-auto px-6 py-8">
		<!-- Breadcrumb -->
		<div class="mb-8">
			<a href="/models" class="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1.5 transition-colors">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				All Models
			</a>
		</div>

		<!-- Page Header -->
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-slate-900 tracking-tight">Add Model</h1>
			<p class="text-slate-500 mt-1">Search and add an OpenRouter model to the platform.</p>
		</div>

		<!-- Error Message -->
		{#if form?.error}
			<div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 border border-red-200">
				{form.error}
			</div>
		{/if}

		<!-- Main Form Card -->
		<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
							disabled={loading}
							class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder={loading ? 'Loading models...' : 'Search by name or ID...'}
							autocomplete="off"
						/>

						{#if showDropdown && filteredModels.length > 0}
							<div
								class="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-auto"
							>
								{#each filteredModels as model (model.id)}
									<button
										type="button"
										onclick={() => selectModel(model)}
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

						{#if showDropdown && searchQuery.length >= 2 && filteredModels.length === 0 && !loading}
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
							<h2 class="text-lg font-semibold text-slate-900 mt-1">{selectedModel.name}</h2>
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
				<form method="POST" class="p-6 space-y-6">
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
					<div class="pt-2">
						<button
							type="submit"
							class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
						>
							Add Model
						</button>
					</div>
				</form>
			{/if}
		</div>
	</main>

	<footer class="border-t border-slate-200 py-8 px-6 mt-12">
		<div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
			<span>Qualia Garden</span>
			<span>Exploring AI values alignment</span>
		</div>
	</footer>
</div>
