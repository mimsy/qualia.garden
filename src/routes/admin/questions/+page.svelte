<script lang="ts">
	// ABOUTME: Admin questions list page.
	// ABOUTME: Displays all questions with edit/delete actions.

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>Questions - Admin - Qualia Garden</title>
</svelte:head>

<div class="flex justify-between items-center mb-6">
	<h1 class="text-2xl font-bold">Questions</h1>
	<a href="/admin/questions/new" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
		Create Question
	</a>
</div>

<div class="bg-white rounded-lg shadow overflow-hidden">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
				<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
			</tr>
		</thead>
		<tbody class="bg-white divide-y divide-gray-200">
			{#each data.questions as question}
				<tr>
					<td class="px-6 py-4">
						<div class="text-sm font-medium text-gray-900 truncate max-w-md">
							{question.text}
						</div>
					</td>
					<td class="px-6 py-4 text-sm text-gray-500">
						{question.category ?? '—'}
					</td>
					<td class="px-6 py-4 text-sm text-gray-500">
						{question.response_type.replace('_', ' ')}
					</td>
					<td class="px-6 py-4">
						<form method="POST" action="?/toggle" class="inline">
							<input type="hidden" name="question_id" value={question.id} />
							<input type="hidden" name="current_active" value={question.active} />
							<button
								type="submit"
								class="px-2 py-1 text-xs font-medium rounded transition-colors {question.active
									? 'bg-green-100 text-green-800 hover:bg-green-200'
									: 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
							>
								{question.active ? 'Active' : 'Inactive'}
							</button>
						</form>
						{#if question.benchmark_source_id}
							<span class="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
								WVS
							</span>
						{/if}
					</td>
					<td class="px-6 py-4 text-right text-sm">
						<a href="/admin/questions/{question.id}" class="text-blue-600 hover:underline">
							Edit
						</a>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="5" class="px-6 py-8 text-center text-gray-500">
						No questions yet. <a href="/admin/questions/new" class="text-blue-600 hover:underline">Create one</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
