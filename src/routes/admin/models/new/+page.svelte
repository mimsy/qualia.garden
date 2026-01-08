<script lang="ts">
	// ABOUTME: Add model form with OpenRouter autocomplete.
	// ABOUTME: Streamlined UI for selecting and adding OpenRouter models.

	import { onMount } from 'svelte';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();

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
		// Strip provider prefix (e.g., "Anthropic: Claude 3.5 Sonnet" → "Claude 3.5 Sonnet")
		displayName = model.name.includes(': ') ? model.name.split(': ').slice(1).join(': ') : model.name;
		// Default to enabled if the model supports reasoning
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
	<title>Add Model - Admin - Qualia Garden</title>
</svelte:head>

<div class="max-w-2xl">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold">Add Model</h1>
		<a href="/admin/models" class="text-gray-500 hover:text-gray-700">
			← Back to models
		</a>
	</div>

	{#if form?.error}
		<div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	<div class="bg-white rounded-lg shadow">
		{#if !selectedModel}
			<!-- Search state -->
			<div class="p-6">
				<label for="search" class="block text-sm font-medium text-gray-700 mb-2">
					Search OpenRouter Models
				</label>
				<div class="relative">
					<input
						id="search"
						type="text"
						bind:value={searchQuery}
						onfocus={() => (showDropdown = true)}
						onblur={handleInputBlur}
						disabled={loading}
						class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder={loading ? 'Loading models...' : 'Search by name or ID...'}
						autocomplete="off"
					/>

					{#if showDropdown && filteredModels.length > 0}
						<div class="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto">
							{#each filteredModels as model}
								<button
									type="button"
									onclick={() => selectModel(model)}
									class="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
								>
									<div class="flex justify-between items-start">
										<div class="flex-1 min-w-0">
											<div class="font-medium text-gray-900 truncate">{model.name}</div>
											<div class="text-sm text-gray-500 truncate">{model.id}</div>
										</div>
										<div class="text-right text-sm text-gray-500 ml-4 flex-shrink-0">
											<div>{(model.context_length / 1000).toFixed(0)}k ctx</div>
											<div class="text-xs">{formatPrice(model.pricing.prompt)}</div>
										</div>
									</div>
								</button>
							{/each}
						</div>
					{/if}

					{#if showDropdown && searchQuery.length >= 2 && filteredModels.length === 0 && !loading}
						<div class="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-gray-500">
							No models found matching "{searchQuery}"
						</div>
					{/if}

					{#if searchQuery.length > 0 && searchQuery.length < 2}
						<div class="mt-2 text-sm text-gray-500">
							Type at least 2 characters to search...
						</div>
					{/if}
				</div>

				<div class="mt-4 text-sm text-gray-500">
					{availableModels.length > 0 ? `${availableModels.length} models available` : ''}
				</div>
			</div>
		{:else}
			<!-- Selected state -->
			<form method="POST">
				<div class="p-6 border-b border-gray-100">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="text-sm text-gray-500 mb-1">Selected Model</div>
							<div class="text-lg font-medium text-gray-900">{selectedModel.name}</div>
							<div class="text-sm text-gray-500 font-mono mt-1">{selectedModel.id}</div>
						</div>
						<button
							type="button"
							onclick={clearSelection}
							class="text-gray-400 hover:text-gray-600 p-1"
							title="Change selection"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div class="flex gap-4 mt-3 text-sm text-gray-500">
						<span>{(selectedModel.context_length / 1000).toFixed(0)}k context</span>
						<span>•</span>
						<span>{formatPrice(selectedModel.pricing.prompt)} input</span>
						<span>•</span>
						<span>{formatPrice(selectedModel.pricing.completion)} output</span>
					</div>
				</div>

				<input type="hidden" name="openrouter_id" value={selectedModel.id} />
				<input type="hidden" name="family" value={selectedModel.id.split('/')[0]} />
				<input type="hidden" name="supports_reasoning" value={reasoningEnabled} />

				<div class="p-6 space-y-6">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
							Display Name
						</label>
						<input
							id="name"
							name="name"
							type="text"
							bind:value={displayName}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<p class="text-sm text-gray-500 mt-1">You can customize how this model appears in the UI</p>
					</div>

					{#if selectedModel.supports_reasoning}
						<div class="flex items-center gap-3">
							<input
								id="reasoning"
								type="checkbox"
								bind:checked={reasoningEnabled}
								class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
							/>
							<label for="reasoning" class="text-sm text-gray-700">
								Enable extended thinking/reasoning
							</label>
						</div>
						<p class="text-xs text-gray-500 -mt-4 ml-7">
							When enabled, the model will show its reasoning process in responses.
						</p>
					{/if}
				</div>

				<div class="px-6 pb-6 flex gap-3">
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
					>
						Add Model
					</button>
					<button
						type="button"
						onclick={clearSelection}
						class="px-4 py-2 text-gray-600 hover:text-gray-900"
					>
						Cancel
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
