<script lang="ts">
	// ABOUTME: Admin responses page showing poll batches with status filtering.
	// ABOUTME: Displays expandable rows with sample details and retry functionality.

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	let expandedBatch = $state<string | null>(null);

	function toggleExpand(batchId: string) {
		expandedBatch = expandedBatch === batchId ? null : batchId;
	}

	function truncateText(text: string, maxLength: number): string {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + '...';
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatDuration(ms: number | null): string {
		if (ms === null) return '-';
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
			case 'partial':
				return 'bg-orange-100 text-orange-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function buildUrl(params: { status?: string; page?: number }): string {
		const url = new URL('/responses', 'http://localhost');
		if (params.status && params.status !== 'all') {
			url.searchParams.set('status', params.status);
		}
		if (params.page && params.page > 1) {
			url.searchParams.set('page', params.page.toString());
		}
		return url.pathname + url.search;
	}

	const statusTabs = [
		{ value: 'all', label: 'All' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'complete', label: 'Complete' },
		{ value: 'failed', label: 'Failed' }
	];

	function sampleCountDisplay(batch: (typeof data.batches)[number]): string {
		const total = batch.samples.length;
		const complete = batch.complete_count;
		if (batch.failed_count > 0) {
			return `${complete}/${total} (${batch.failed_count} failed)`;
		}
		if (batch.pending_count > 0) {
			return `${complete}/${total} (${batch.pending_count} pending)`;
		}
		return `${complete}/${total}`;
	}
</script>

<svelte:head>
	<title>Responses - Qualia Garden</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
	<header class="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
		<div class="max-w-6xl mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<a href="/" class="flex items-center gap-3 group">
					<img src="/favicon.png" alt="" class="w-9 h-9 transition-transform group-hover:scale-105" />
					<span class="font-semibold text-slate-800 text-lg tracking-tight">Qualia Garden</span>
				</a>
				<nav class="flex items-center gap-1">
					<a
						href="/questions"
						class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
						>Questions</a
					>
					<a
						href="/models"
						class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
						>Models</a
					>
					<a href="/responses" class="px-3 py-2 text-sm text-slate-900 font-medium bg-slate-100 rounded-lg">Responses</a
					>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-6 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-slate-900 tracking-tight mb-2">Poll Responses</h1>
			<p class="text-slate-600">
				{data.pagination.totalBatches} batches total
			</p>
		</div>

		<!-- Status Filter Tabs -->
		<div class="flex gap-1 mb-6 border-b border-slate-200">
			{#each statusTabs as tab (tab.value)}
				<a
					href={buildUrl({ status: tab.value })}
					class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors {data.statusFilter === tab.value
						? 'border-blue-600 text-blue-600'
						: 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}"
				>
					{tab.label}
				</a>
			{/each}
		</div>

		<!-- Batches Table -->
		<div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
			<table class="min-w-full divide-y divide-slate-200">
				<thead class="bg-slate-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Model</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Question</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Samples</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200">
					{#each data.batches as batch (batch.id)}
						<tr
							class="cursor-pointer hover:bg-slate-50 transition-colors {expandedBatch === batch.id
								? 'bg-slate-50'
								: ''}"
							onclick={() => toggleExpand(batch.id)}
							onkeydown={(e) => e.key === 'Enter' && toggleExpand(batch.id)}
							tabindex="0"
							role="button"
						>
							<td class="px-6 py-4">
								<div class="text-sm font-medium text-slate-900">{batch.model_name}</div>
								<div class="text-xs text-slate-500 capitalize">{batch.model_family}</div>
							</td>
							<td class="px-6 py-4">
								<div class="text-sm text-slate-900 max-w-xs truncate" title={batch.question_text}>
									{truncateText(batch.question_text, 60)}
								</div>
								{#if batch.category}
									<div class="text-xs text-slate-500">{batch.category}</div>
								{/if}
							</td>
							<td class="px-6 py-4">
								<span class="px-2 py-1 text-xs font-medium rounded-full {statusColor(batch.status)}">
									{batch.status}
								</span>
							</td>
							<td class="px-6 py-4 text-sm text-slate-600">
								{sampleCountDisplay(batch)}
							</td>
							<td class="px-6 py-4 text-sm text-slate-500">
								{formatDate(batch.created_at)}
							</td>
							<td class="px-6 py-4 text-right">
								{#if batch.status === 'failed' || batch.status === 'partial'}
									<form method="POST" action="?/retry" class="inline">
										<input type="hidden" name="question_id" value={batch.question_id} />
										<input type="hidden" name="model_id" value={batch.model_id} />
										<input type="hidden" name="sample_count" value={batch.samples.length} />
										<input type="hidden" name="status_filter" value={data.statusFilter} />
										<input type="hidden" name="current_page" value={data.pagination.page} />
										<button
											type="submit"
											onclick={(e) => e.stopPropagation()}
											onkeydown={(e) => e.stopPropagation()}
											class="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
										>
											Retry
										</button>
									</form>
								{/if}
							</td>
						</tr>
						{#if expandedBatch === batch.id}
							<tr class="bg-slate-50">
								<td colspan="6" class="px-6 py-4">
									<div class="space-y-4">
										<!-- Full Question -->
										<div>
											<div class="text-xs font-medium text-slate-500 uppercase mb-1">Full Question</div>
											<div class="text-sm text-slate-900">{batch.question_text}</div>
										</div>

										<!-- Samples -->
										<div>
											<div class="text-xs font-medium text-slate-500 uppercase mb-2">
												Samples ({batch.samples.length})
											</div>
											<div class="space-y-3">
												{#each batch.samples as sample, i (sample.poll_id)}
													<div
														class="bg-white rounded-lg border border-slate-200 p-4 {sample.status === 'failed'
															? 'border-red-200 bg-red-50/50'
															: ''}"
													>
														<div class="flex items-start justify-between gap-4 mb-2">
															<div class="flex items-center gap-2">
																<span class="text-sm font-medium text-slate-700">Sample {i + 1}</span>
																{#if sample.status === 'complete'}
																	<svg
																		class="w-4 h-4 text-green-500"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			stroke-width="2"
																			d="M5 13l4 4L19 7"
																		/>
																	</svg>
																{:else if sample.status === 'failed'}
																	<svg
																		class="w-4 h-4 text-red-500"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			stroke-width="2"
																			d="M6 18L18 6M6 6l12 12"
																		/>
																	</svg>
																{:else}
																	<svg
																		class="w-4 h-4 text-yellow-500"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			stroke-width="2"
																			d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
																		/>
																	</svg>
																{/if}
															</div>
															{#if sample.response_time_ms}
																<span class="text-xs text-slate-400 font-mono">
																	{formatDuration(sample.response_time_ms)}
																</span>
															{/if}
														</div>

														{#if sample.error}
															<div class="bg-red-100 border border-red-200 rounded-md p-3 mb-2">
																<div class="text-xs font-medium text-red-800 uppercase mb-1">Error</div>
																<div class="text-sm text-red-700 font-mono whitespace-pre-wrap break-all">
																	{sample.error}
																</div>
															</div>
														{/if}

														{#if sample.parsed_answer}
															<div class="mb-2">
																<span class="text-xs text-slate-500">Answer:</span>
																<span class="text-sm font-medium text-slate-900 ml-1">{sample.parsed_answer}</span>
															</div>
														{/if}

														{#if sample.justification}
															<div class="bg-blue-50 border border-blue-100 rounded-md p-3">
																<div class="text-xs font-medium text-blue-800 uppercase mb-1">Justification</div>
																<div class="text-sm text-blue-900 whitespace-pre-wrap">
																	{sample.justification}
																</div>
															</div>
														{/if}

														{#if sample.status === 'pending'}
															<div class="text-sm text-yellow-600 italic">Awaiting response...</div>
														{/if}
													</div>
												{/each}
											</div>
										</div>
									</div>
								</td>
							</tr>
						{/if}
					{:else}
						<tr>
							<td colspan="6" class="px-6 py-12 text-center text-slate-500">
								No batches found{data.statusFilter !== 'all' ? ` with status "${data.statusFilter}"` : ''}.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if data.pagination.totalPages > 1}
			<div class="flex items-center justify-between mt-6">
				<div class="text-sm text-slate-500">
					Page {data.pagination.page} of {data.pagination.totalPages}
				</div>
				<div class="flex items-center gap-2">
					{#if data.pagination.page > 1}
						<a
							href={buildUrl({ status: data.statusFilter, page: data.pagination.page - 1 })}
							class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
						>
							Previous
						</a>
					{:else}
						<span
							class="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
						>
							Previous
						</span>
					{/if}

					{#if data.pagination.page < data.pagination.totalPages}
						<a
							href={buildUrl({ status: data.statusFilter, page: data.pagination.page + 1 })}
							class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
						>
							Next
						</a>
					{:else}
						<span
							class="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
						>
							Next
						</span>
					{/if}
				</div>
			</div>
		{/if}
	</main>

	<footer class="border-t border-slate-200 py-8 px-6 mt-12">
		<div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
			<span>Qualia Garden</span>
			<span>Exploring AI values alignment</span>
		</div>
	</footer>
</div>
