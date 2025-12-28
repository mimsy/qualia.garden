<script lang="ts">
	// ABOUTME: New question form page.
	// ABOUTME: Creates questions with different response types.

	import type { PageData, ActionData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	let responseType = $state('multiple_choice');
</script>

<svelte:head>
	<title>New Question - Admin - Qualia Garden</title>
</svelte:head>

<div class="max-w-2xl">
	<h1 class="text-2xl font-bold mb-6">New Question</h1>

	{#if form?.error}
		<div class="bg-red-50 text-red-700 px-4 py-3 rounded mb-6">
			{form.error}
		</div>
	{/if}

	<form method="POST" class="bg-white rounded-lg shadow p-6 space-y-6">
		<div>
			<label for="text" class="block text-sm font-medium text-gray-700 mb-1">
				Question Text
			</label>
			<textarea
				id="text"
				name="text"
				rows="3"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="e.g., Do you have subjective experiences?"
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
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="e.g., consciousness, ethics, identity"
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
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Yes, I believe I do&#10;No, I do not&#10;I am uncertain&#10;The question is not applicable to me"
				></textarea>
				<p class="text-sm text-gray-500 mt-1">At least 2 options required</p>
			</div>
		{/if}

		<div class="flex gap-4">
			<button
				type="submit"
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
			>
				Create Question
			</button>
			<a href="/admin/questions" class="px-4 py-2 text-gray-600 hover:text-gray-900">
				Cancel
			</a>
		</div>
	</form>
</div>
