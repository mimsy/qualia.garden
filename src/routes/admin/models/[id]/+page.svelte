<script lang="ts">
	// ABOUTME: Edit model form with OpenRouter autocomplete.
	// ABOUTME: Allows updating or deleting existing models.

	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

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
	let confirmDelete = $state(false);
	let changingModel = $state(false);

	// Form field values (initialized from existing model)
	let selectedOpenRouterId = $state(data.model.openrouter_id);
	let displayName = $state(data.model.name);
	let reasoningEnabled = $state(data.model.supports_reasoning);

	// Track whether the currently selected OpenRouter model supports reasoning
	const modelSupportsReasoning = $derived(
		availableModels.find((m) => m.id === selectedOpenRouterId)?.supports_reasoning ?? false
	);

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

	const selectedModelDetails = $derived(
		availableModels.find((m) => m.id === selectedOpenRouterId)
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
		selectedOpenRouterId = model.id;
		displayName = model.name;
		// Default to enabled if the model supports reasoning
		reasoningEnabled = model.supports_reasoning;
		searchQuery = '';
		showDropdown = false;
		changingModel = false;
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
	<title>Edit {data.model.name} - Admin - Qualia Garden</title>
</svelte:head>

<div class="max-w-2xl">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold">Edit Model</h1>
		<a href="/admin/models" class="text-gray-500 hover:text-gray-700">
			← Back to models
		</a>
	</div>

	{#if form?.error}
		<div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">
			Model updated successfully.
		</div>
	{/if}

	<form method="POST" action="?/update" class="bg-white rounded-lg shadow">
		<div class="p-6 border-b border-gray-100">
			{#if changingModel}
				<!-- Search mode -->
				<div>
					<label for="search" class="block text-sm font-medium text-gray-700 mb-2">
						Search for a different model
					</label>
					<div class="relative">
						<input
							id="search"
							type="text"
							bind:value={searchQuery}
							onfocus={() => (showDropdown = true)}
							onblur={handleInputBlur}
							disabled={loading}
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder={loading ? 'Loading models...' : 'Search by name or ID...'}
							autocomplete="off"
						/>

						{#if showDropdown && filteredModels.length > 0}
							<div class="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
								{#each filteredModels as model}
									<button
										type="button"
										onclick={() => selectModel(model)}
										class="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
									>
										<div class="flex justify-between items-start">
											<div class="flex-1 min-w-0">
												<div class="font-medium text-gray-900 truncate">{model.name}</div>
												<div class="text-sm text-gray-500 truncate">{model.id}</div>
											</div>
											<div class="text-right text-sm text-gray-500 ml-4">
												<div>{(model.context_length / 1000).toFixed(0)}k ctx</div>
											</div>
										</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>
					<button
						type="button"
						onclick={() => (changingModel = false)}
						class="mt-3 text-sm text-gray-500 hover:text-gray-700"
					>
						Cancel
					</button>
				</div>
			{:else}
				<!-- Display mode -->
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<div class="text-sm text-gray-500 mb-1">OpenRouter Model</div>
						<div class="font-mono text-gray-900">{selectedOpenRouterId}</div>
						{#if selectedModelDetails}
							<div class="flex gap-4 mt-2 text-sm text-gray-500">
								<span>{(selectedModelDetails.context_length / 1000).toFixed(0)}k context</span>
								<span>•</span>
								<span>{formatPrice(selectedModelDetails.pricing.prompt)} input</span>
							</div>
						{/if}
					</div>
					<button
						type="button"
						onclick={() => (changingModel = true)}
						class="text-blue-600 hover:text-blue-700 text-sm font-medium"
					>
						Change
					</button>
				</div>
			{/if}
		</div>

		<input type="hidden" name="openrouter_id" value={selectedOpenRouterId} />
		<input type="hidden" name="family" value={selectedOpenRouterId.split('/')[0]} />
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
			</div>

			{#if modelSupportsReasoning}
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
				Save Changes
			</button>
			<a
				href="/admin/models"
				class="px-4 py-2 text-gray-600 hover:text-gray-900"
			>
				Cancel
			</a>
		</div>
	</form>

	<div class="mt-6 bg-white rounded-lg shadow">
		<div class="p-6">
			<h2 class="text-sm font-medium text-red-600 mb-4">Danger Zone</h2>

			{#if confirmDelete}
				<div class="bg-red-50 border border-red-200 rounded-lg p-4">
					<p class="text-red-700 mb-4">
						Are you sure you want to delete <strong>{data.model.name}</strong>? This cannot be undone.
					</p>
					<div class="flex gap-3">
						<form method="POST" action="?/delete">
							<button
								type="submit"
								class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
							>
								Yes, Delete
							</button>
						</form>
						<button
							type="button"
							onclick={() => (confirmDelete = false)}
							class="px-4 py-2 text-gray-600 hover:text-gray-900"
						>
							Cancel
						</button>
					</div>
				</div>
			{:else}
				<button
					type="button"
					onclick={() => (confirmDelete = true)}
					class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
				>
					Delete Model
				</button>
			{/if}
		</div>
	</div>

	<div class="mt-6 text-sm text-gray-500">
		<strong>Internal ID:</strong> {data.model.id}
	</div>
</div>
