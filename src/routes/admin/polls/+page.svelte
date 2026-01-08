<script lang="ts">
	// ABOUTME: Admin polls list page.
	// ABOUTME: Displays recent polls with status and error details.

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let expandedPoll = $state<string | null>(null);

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleString();
	}

	function formatDuration(ms: number | null): string {
		if (ms === null) return '—';
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(1)}s`;
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

	function toggleExpand(pollId: string) {
		expandedPoll = expandedPoll === pollId ? null : pollId;
	}
</script>

<svelte:head>
	<title>Polls - Admin - Qualia Garden</title>
</svelte:head>

<div class="flex justify-between items-center mb-6">
	<h1 class="text-2xl font-bold">Polls</h1>
	<a href="/admin/polls/trigger" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"> Trigger Poll </a>
</div>

<div class="bg-white rounded-lg shadow overflow-hidden">
	<table class="min-w-full divide-y divide-gray-200">
		<thead class="bg-gray-50">
			<tr>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
				<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
			</tr>
		</thead>
		<tbody class="bg-white divide-y divide-gray-200">
			{#each data.polls as poll}
				<tr
					class="cursor-pointer hover:bg-gray-50 {poll.error ? 'bg-red-50/50' : ''}"
					onclick={() => toggleExpand(poll.id)}
				>
					<td class="px-6 py-4">
						<div class="text-sm text-gray-900 truncate max-w-xs">
							{poll.question_text}
						</div>
					</td>
					<td class="px-6 py-4">
						<div class="text-sm text-gray-900">{poll.model_name}</div>
						<div class="text-xs text-gray-500 font-mono">{poll.model_openrouter_id}</div>
					</td>
					<td class="px-6 py-4">
						<span class="px-2 py-1 text-xs font-medium rounded {statusColor(poll.status)}">
							{poll.status}
						</span>
						{#if poll.error}
							<svg class="inline-block w-4 h-4 ml-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						{/if}
					</td>
					<td class="px-6 py-4 text-sm text-gray-500 font-mono">
						{formatDuration(poll.response_time_ms)}
					</td>
					<td class="px-6 py-4 text-sm text-gray-500">
						{formatDate(poll.completed_at)}
					</td>
				</tr>
				{#if expandedPoll === poll.id}
					<tr class="bg-gray-50">
						<td colspan="5" class="px-6 py-4">
							<div class="space-y-4">
								<div>
									<div class="text-xs font-medium text-gray-500 uppercase mb-1">Full Question</div>
									<div class="text-sm text-gray-900">{poll.question_text}</div>
								</div>
								<div class="grid grid-cols-3 gap-4">
									<div>
										<div class="text-xs font-medium text-gray-500 uppercase mb-1">Poll ID</div>
										<div class="text-sm font-mono text-gray-700">{poll.id}</div>
									</div>
									<div>
										<div class="text-xs font-medium text-gray-500 uppercase mb-1">Created</div>
										<div class="text-sm text-gray-700">{formatDate(poll.created_at)}</div>
									</div>
									{#if poll.parsed_answer}
										<div>
											<div class="text-xs font-medium text-gray-500 uppercase mb-1">Answer</div>
											<div class="text-sm font-medium text-gray-900">{poll.parsed_answer}</div>
										</div>
									{/if}
								</div>
								{#if poll.justification}
									<div class="bg-blue-50 border border-blue-100 rounded-lg p-3">
										<div class="text-xs font-medium text-blue-800 uppercase mb-1">Justification</div>
										<div class="text-sm text-blue-900 whitespace-pre-wrap">{poll.justification}</div>
									</div>
								{/if}
								{#if poll.reasoning}
									<div class="bg-purple-50 border border-purple-100 rounded-lg p-3">
										<div class="text-xs font-medium text-purple-800 uppercase mb-1">Model Reasoning</div>
										<div class="text-sm text-purple-900 whitespace-pre-wrap">{poll.reasoning}</div>
									</div>
								{/if}
								{#if poll.raw_response}
									<details class="bg-gray-100 border border-gray-200 rounded-lg">
										<summary
											class="px-3 py-2 text-xs font-medium text-gray-600 uppercase cursor-pointer hover:bg-gray-200"
										>
											Raw Response
										</summary>
										<div
											class="px-3 py-2 text-sm font-mono text-gray-700 whitespace-pre-wrap break-all border-t border-gray-200"
										>
											{poll.raw_response}
										</div>
									</details>
								{/if}
								{#if poll.error}
									<div class="bg-red-100 border border-red-200 rounded-lg p-3">
										<div class="text-xs font-medium text-red-800 uppercase mb-1">Error</div>
										<div class="text-sm text-red-700 font-mono whitespace-pre-wrap break-all">{poll.error}</div>
									</div>
								{/if}
							</div>
						</td>
					</tr>
				{/if}
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
