<script lang="ts">
	// ABOUTME: Admin models list page.
	// ABOUTME: Displays models grouped by provider with management actions.

	import type { PageData } from './$types';
	import type { Model } from '$lib/db/types';

	let { data } = $props<{ data: PageData }>();

	function groupByFamily(models: Model[]): Record<string, Model[]> {
		const result: Record<string, Model[]> = {};
		for (const model of models) {
			if (!result[model.family]) result[model.family] = [];
			result[model.family].push(model);
		}
		return result;
	}

	const modelsByFamily = $derived(groupByFamily(data.models));
	const familyCount = $derived(Object.keys(modelsByFamily).length);
	const activeCount = $derived(data.models.filter((m: Model) => m.active).length);
</script>

<svelte:head>
	<title>Models - Admin - Qualia Garden</title>
</svelte:head>

<div class="flex items-center justify-between mb-6">
	<div>
		<h1 class="text-2xl font-bold">Models</h1>
		<p class="text-sm text-gray-500 mt-1">
			{data.models.length} models across {familyCount} providers • {activeCount} active
		</p>
	</div>
	<a
		href="/admin/models/new"
		class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
		Add Model
	</a>
</div>

{#if Object.keys(modelsByFamily).length > 0}
	<div class="space-y-4">
		{#each Object.entries(modelsByFamily).sort((a, b) => a[0].localeCompare(b[0])) as [family, models]}
			<div class="bg-white rounded-lg shadow overflow-hidden">
				<div class="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
					<div class="flex items-center gap-3">
						<h2 class="font-medium text-gray-900">{family}</h2>
						<span class="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
							{models.length}
						</span>
					</div>
					<span class="text-xs text-gray-500">
						{models.filter((m) => m.active).length} active
					</span>
				</div>
				<div class="divide-y divide-gray-100">
					{#each models as model}
						<a
							href="/admin/models/{model.id}"
							class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
						>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<span class="font-medium text-gray-900 truncate">{model.name}</span>
									{#if model.supports_reasoning}
										<span class="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded" title="Extended thinking enabled">
											thinking
										</span>
									{/if}
									{#if !model.active}
										<span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
											inactive
										</span>
									{/if}
								</div>
								<div class="text-sm text-gray-500 font-mono truncate">{model.openrouter_id}</div>
							</div>
							<div class="flex items-center gap-3 ml-4">
								<form method="POST" action="?/toggle">
									<input type="hidden" name="id" value={model.id} />
									<input type="hidden" name="active" value={model.active.toString()} />
									<button
										type="submit"
										onclick={(e) => e.stopPropagation()}
										onkeydown={(e) => e.stopPropagation()}
										class="w-12 h-6 rounded-full transition-colors relative {model.active
											? 'bg-green-500'
											: 'bg-gray-300'}"
										title={model.active ? 'Click to deactivate' : 'Click to activate'}
									>
										<span
											class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform {model.active
												? 'left-6'
												: 'left-0.5'}"
										></span>
									</button>
								</form>
								<svg
									class="w-5 h-5 text-gray-400 group-hover:text-gray-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div class="bg-white rounded-lg shadow p-12 text-center">
		<div class="text-gray-400 mb-4">
			<svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
			</svg>
		</div>
		<h3 class="text-lg font-medium text-gray-900 mb-2">No models configured</h3>
		<p class="text-gray-500 mb-6">Add your first AI model to start polling</p>
		<a
			href="/admin/models/new"
			class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add Model
		</a>
	</div>
{/if}
