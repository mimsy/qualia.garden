<script lang="ts">
	// ABOUTME: Admin polls list page.
	// ABOUTME: Displays recent polls with status.

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleString();
	}

	function statusColor(status: string): string {
		switch (status) {
			case 'complete':
				return 'bg-green-100 text-green-800';
			case 'failed':
				return 'bg-red-100 text-red-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<svelte:head>
	<title>Polls - Admin - Qualia Garden</title>
</svelte:head>

<div class="flex justify-between items-center mb-6">
	<h1 class="text-2xl font-bold">Polls</h1>
	<a
		href="/admin/polls/trigger"
		class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
	>
		Trigger Poll
	</a>
</div>

<div class="bg-white rounded-lg shadow overflow-hidden">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
			</tr>
		</thead>
		<tbody class="bg-white divide-y divide-gray-200">
			{#each data.polls as poll}
				<tr>
					<td class="px-6 py-4">
						<div class="text-sm text-gray-900 truncate max-w-xs">
							{poll.question_text}
						</div>
					</td>
					<td class="px-6 py-4 text-sm text-gray-500">
						{poll.model_name}
					</td>
					<td class="px-6 py-4">
						<span class="px-2 py-1 text-xs font-medium rounded {statusColor(poll.status)}">
							{poll.status}
						</span>
					</td>
					<td class="px-6 py-4 text-sm text-gray-500">
						{formatDate(poll.created_at)}
					</td>
					<td class="px-6 py-4 text-sm text-gray-500">
						{formatDate(poll.completed_at)}
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="5" class="px-6 py-8 text-center text-gray-500">
						No polls yet.
						<a href="/admin/polls/trigger" class="text-blue-600 hover:underline">Trigger one</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
