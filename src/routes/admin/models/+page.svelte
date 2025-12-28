<script lang="ts">
	// ABOUTME: Admin models list page.
	// ABOUTME: Displays all models with toggle active/inactive.

	import type { PageData } from './$types';
	import type { Model } from '$lib/db/types';

	let { data } = $props<{ data: PageData }>();

	// Group models by family
	function groupByFamily(models: Model[]): Record<string, Model[]> {
		const result: Record<string, Model[]> = {};
		for (const model of models) {
			if (!result[model.family]) result[model.family] = [];
			result[model.family].push(model);
		}
		return result;
	}

	const modelsByFamily = $derived(groupByFamily(data.models));
</script>

<svelte:head>
	<title>Models - Admin - Qualia Garden</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">Models</h1>

<div class="space-y-6">
	{#each Object.entries(modelsByFamily) as [family, models]}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="bg-gray-50 px-6 py-3 border-b">
				<h2 class="font-medium text-gray-900 capitalize">{family}</h2>
			</div>
			<div class="divide-y divide-gray-200">
				{#each models as model}
					<div class="px-6 py-4 flex items-center justify-between">
						<div>
							<div class="font-medium text-gray-900">{model.name}</div>
							<div class="text-sm text-gray-500">{model.openrouter_id}</div>
						</div>
						<form method="POST" action="?/toggle">
							<input type="hidden" name="id" value={model.id} />
							<input type="hidden" name="active" value={model.active.toString()} />
							<button
								type="submit"
								class="px-3 py-1 text-sm rounded {model.active
									? 'bg-green-100 text-green-700 hover:bg-green-200'
									: 'bg-gray-100 text-gray-500 hover:bg-gray-200'}"
							>
								{model.active ? 'Active' : 'Inactive'}
							</button>
						</form>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
			No models configured. Run database migrations to seed initial models.
		</div>
	{/each}
</div>
