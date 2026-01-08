<script lang="ts">
	// ABOUTME: Create new question form page.
	// ABOUTME: Admin-only page for creating draft questions.

	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	let responseType = $state('multiple_choice');
</script>

<svelte:head>
	<title>New Question - Qualia Garden</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b">
		<div class="max-w-6xl mx-auto px-4 py-6">
			<div class="flex items-center justify-between">
				<a href="/" class="flex items-center gap-4">
					<img src="/favicon.png" alt="" class="w-10 h-10" />
					<div>
						<h1 class="text-xl font-bold text-gray-900">Qualia Garden</h1>
						<p class="text-sm text-gray-500">Exploring AI beliefs through systematic polling</p>
					</div>
				</a>
				<nav class="flex gap-4">
					<a href="/questions" class="text-gray-600 hover:text-gray-900">All Questions</a>
					<a href="/models" class="text-gray-600 hover:text-gray-900">Models</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-2xl mx-auto px-4 py-12">
		<div class="mb-8">
			<a href="/questions" class="text-blue-600 hover:underline text-sm">← Back to questions</a>
		</div>

		<div class="bg-white rounded-lg shadow p-8">
			<h2 class="text-2xl font-bold text-gray-900 mb-6">Create New Question</h2>

			{#if form?.error}
				<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
					{form.error}
				</div>
			{/if}

			<form method="POST" use:enhance class="space-y-6">
				<div>
					<label for="text" class="block text-sm font-medium text-gray-700 mb-1">
						Question Text <span class="text-red-500">*</span>
					</label>
					<textarea
						id="text"
						name="text"
						rows="3"
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter the question you want to ask AI models..."
					></textarea>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="category" class="block text-sm font-medium text-gray-700 mb-1"> Category </label>
						<input
							type="text"
							id="category"
							name="category"
							list="categories"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., Ethics, Science"
						/>
						<datalist id="categories">
							{#each data.categories as cat}
								<option value={cat}></option>
							{/each}
						</datalist>
					</div>

					<div>
						<label for="response_type" class="block text-sm font-medium text-gray-700 mb-1">
							Response Type <span class="text-red-500">*</span>
						</label>
						<select
							id="response_type"
							name="response_type"
							bind:value={responseType}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="multiple_choice">Multiple Choice</option>
							<option value="yes_no">Yes / No</option>
							<option value="scale">Scale (1-10)</option>
						</select>
					</div>
				</div>

				{#if responseType === 'multiple_choice'}
					<div>
						<label for="options" class="block text-sm font-medium text-gray-700 mb-1">
							Options <span class="text-red-500">*</span>
							<span class="font-normal text-gray-500">(one per line, minimum 2)</span>
						</label>
						<textarea
							id="options"
							name="options"
							rows="4"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
							placeholder="Option A&#10;Option B&#10;Option C"
						></textarea>
					</div>
				{/if}

				<div class="flex items-center justify-between pt-4">
					<p class="text-sm text-gray-500">
						Questions are created as drafts. You'll need to poll at least one model before publishing.
					</p>
					<button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
						Create Draft
					</button>
				</div>
			</form>
		</div>
	</main>
</div>
