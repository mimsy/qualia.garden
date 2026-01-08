<script lang="ts">
	// ABOUTME: Poll trigger form page.
	// ABOUTME: Select question and models to poll.

	import type { PageData, ActionData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	let selectAll = $state(true);

	function toggleAll() {
		selectAll = !selectAll;
	}
</script>

<svelte:head>
	<title>Trigger Poll - Admin - Qualia Garden</title>
</svelte:head>

<div class="max-w-2xl">
	<h1 class="text-2xl font-bold mb-6">Trigger Poll</h1>

	{#if form?.error}
		<div class="bg-red-50 text-red-700 px-4 py-3 rounded mb-6">
			{form.error}
		</div>
	{/if}

	<form method="POST" class="bg-white rounded-lg shadow p-6 space-y-6">
		<div>
			<label for="question_id" class="block text-sm font-medium text-gray-700 mb-1">
				Question
			</label>
			<select
				id="question_id"
				name="question_id"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				<option value="">Select a question...</option>
				{#each data.questions as question}
					<option value={question.id}>
						{question.text.slice(0, 80)}{question.text.length > 80 ? '...' : ''}
					</option>
				{/each}
			</select>
		</div>

		<fieldset>
			<div class="flex justify-between items-center mb-2">
				<legend class="block text-sm font-medium text-gray-700">Models</legend>
				<button
					type="button"
					onclick={toggleAll}
					class="text-sm text-blue-600 hover:underline"
				>
					{selectAll ? 'Deselect all' : 'Select all'}
				</button>
			</div>
			<div class="border border-gray-300 rounded-md p-4 max-h-64 overflow-y-auto space-y-3">
				{#each data.models as model}
					<label class="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							name="model_ids"
							value={model.id}
							checked={selectAll}
							class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
						/>
						<span class="text-sm">
							<span class="font-medium">{model.name}</span>
							<span class="text-gray-500 ml-2">({model.family})</span>
						</span>
					</label>
				{:else}
					<p class="text-gray-500 text-sm">No active models. Enable some in the Models page.</p>
				{/each}
			</div>
		</fieldset>

		<div class="flex gap-4">
			<button
				type="submit"
				class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
			>
				Trigger Poll
			</button>
			<a href="/admin/polls" class="px-4 py-2 text-gray-600 hover:text-gray-900">
				Cancel
			</a>
		</div>
	</form>
</div>
