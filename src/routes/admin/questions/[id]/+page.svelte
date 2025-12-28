<script lang="ts">
	// ABOUTME: Edit question form page.
	// ABOUTME: Updates question text, category, type, and options.

	import type { PageData, ActionData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	let responseType = $state(data.question.response_type);
</script>

<svelte:head>
	<title>Edit Question - Admin - Qualia Garden</title>
</svelte:head>

<div class="max-w-2xl">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold">Edit Question</h1>
		<form method="POST" action="?/toggle">
			<button
				type="submit"
				class="px-3 py-1 text-sm rounded {data.question.active
					? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
					: 'bg-green-100 text-green-700 hover:bg-green-200'}"
			>
				{data.question.active ? 'Deactivate' : 'Activate'}
			</button>
		</form>
	</div>

	{#if form?.error}
		<div class="bg-red-50 text-red-700 px-4 py-3 rounded mb-6">
			{form.error}
		</div>
	{/if}

	<form method="POST" action="?/update" class="bg-white rounded-lg shadow p-6 space-y-6">
		<div>
			<label for="text" class="block text-sm font-medium text-gray-700 mb-1">
				Question Text
			</label>
			<textarea
				id="text"
				name="text"
				rows="3"
				required
				value={data.question.text}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			></textarea>
		</div>

		<div>
			<label for="category" class="block text-sm font-medium text-gray-700 mb-1">
				Category
			</label>
			<input
				id="category"
				name="category"
				type="text"
				list="categories"
				value={data.question.category ?? ''}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<datalist id="categories">
				{#each data.categories as cat}
					<option value={cat}></option>
				{/each}
			</datalist>
		</div>

		<div>
			<label for="response_type" class="block text-sm font-medium text-gray-700 mb-1">
				Response Type
			</label>
			<select
				id="response_type"
				name="response_type"
				bind:value={responseType}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				<option value="multiple_choice">Multiple Choice</option>
				<option value="yes_no">Yes / No</option>
				<option value="scale">Scale (1-10)</option>
			</select>
		</div>

		{#if responseType === 'multiple_choice'}
			<div>
				<label for="options" class="block text-sm font-medium text-gray-700 mb-1">
					Options (one per line)
				</label>
				<textarea
					id="options"
					name="options"
					rows="4"
					value={data.optionsText}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				></textarea>
				<p class="text-sm text-gray-500 mt-1">At least 2 options required</p>
			</div>
		{/if}

		<div class="flex gap-4">
			<button
				type="submit"
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
			>
				Save Changes
			</button>
			<a href="/admin/questions" class="px-4 py-2 text-gray-600 hover:text-gray-900">
				Cancel
			</a>
		</div>
	</form>
</div>
