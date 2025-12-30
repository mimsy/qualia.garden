<script lang="ts">
	// ABOUTME: Question results page.
	// ABOUTME: Shows aggregate results and per-model responses.

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	type ResponseType = (typeof data.responses)[number];

	let selectedFamily = $state<string | null>(null);
	let expandedModel = $state<string | null>(null);

	function getUniqueFamilies(responses: ResponseType[]): string[] {
		const familySet = new Set<string>();
		for (const r of responses) {
			familySet.add(r.model_family);
		}
		return Array.from(familySet).sort();
	}

	// Get unique families for filter
	const families = $derived(getUniqueFamilies(data.responses));

	// Filter responses by family
	const filteredResponses = $derived(
		selectedFamily
			? data.responses.filter((r: ResponseType) => r.model_family === selectedFamily)
			: data.responses
	);

	function toggleExpanded(modelId: string) {
		expandedModel = expandedModel === modelId ? null : modelId;
	}

	// Get justification from response, parsing legacy raw_response JSON if needed
	function getJustification(response: ResponseType): string | null {
		if (response.justification) return response.justification;
		if (!response.raw_response) return null;
		try {
			const parsed = JSON.parse(response.raw_response);
			return parsed.justification || null;
		} catch {
			// Not JSON, return raw_response as-is
			return response.raw_response;
		}
	}
</script>

<svelte:head>
	<title>{data.question.text.slice(0, 50)}... - Qualia Garden</title>
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
					<a href="/questions" class="text-gray-600 hover:text-gray-900">Browse Questions</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-12">
		<div class="mb-8">
			<a href="/questions" class="text-blue-600 hover:underline text-sm">← Back to questions</a>
		</div>

		<div class="bg-white rounded-lg shadow p-8 mb-8">
			<div class="mb-4">
				{#if data.question.category}
					<span class="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
						{data.question.category}
					</span>
				{/if}
			</div>
			<h2 class="text-2xl font-bold text-gray-900 mb-4">
				{data.question.text}
			</h2>
			<div class="text-sm text-gray-500">
				{data.question.response_type.replace('_', ' ')} •
				{data.totalResponses} response{data.totalResponses === 1 ? '' : 's'}
			</div>
		</div>

		{#if data.totalResponses > 0}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				<div class="bg-white rounded-lg shadow p-6">
					<h3 class="font-bold text-gray-900 mb-6">Aggregate Results</h3>
					<div class="space-y-4">
						{#each data.aggregateResults as result}
							<div>
								<div class="flex justify-between text-sm mb-1">
									<span class="text-gray-700 truncate pr-4">{result.answer}</span>
									<span class="text-gray-500 flex-shrink-0">
										{result.count} ({result.percentage.toFixed(0)}%)
									</span>
								</div>
								<div class="h-6 bg-gray-100 rounded-full overflow-hidden">
									<div
										class="h-full bg-blue-500 rounded-full transition-all"
										style="width: {result.percentage}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				{#if data.options}
					<div class="bg-white rounded-lg shadow p-6">
						<h3 class="font-bold text-gray-900 mb-4">Answer Options</h3>
						<ol class="list-none space-y-2">
							{#each data.options as option, i}
								<li class="flex gap-2 text-sm">
									<span class="font-medium text-gray-500">{String.fromCharCode(65 + i)}.</span>
									<span class="text-gray-700">{option}</span>
								</li>
							{/each}
						</ol>
					</div>
				{/if}
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between mb-6">
					<h3 class="font-bold text-gray-900">Individual Responses</h3>
					<div class="flex gap-2">
						<button
							onclick={() => (selectedFamily = null)}
							class="px-3 py-1 text-sm rounded {selectedFamily === null
								? 'bg-blue-100 text-blue-700'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
						>
							All
						</button>
						{#each families as family}
							<button
								onclick={() => (selectedFamily = family)}
								class="px-3 py-1 text-sm rounded capitalize {selectedFamily === family
									? 'bg-blue-100 text-blue-700'
									: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
							>
								{family}
							</button>
						{/each}
					</div>
				</div>

				<div class="space-y-3">
					{#each filteredResponses as response}
						<div class="border rounded-lg overflow-hidden">
							<button
								onclick={() => toggleExpanded(response.model_id)}
								class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
							>
								<div class="flex items-center gap-3">
									<span class="font-medium text-gray-900">{response.model_name}</span>
									<span class="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 capitalize">
										{response.model_family}
									</span>
								</div>
								<div class="flex items-center gap-4">
									{#if response.status === 'complete' && response.parsed_answer}
										<span class="text-sm font-medium text-gray-700">
											{response.parsed_answer}
										</span>
									{:else if response.status === 'pending'}
										<span class="text-sm text-yellow-600">Pending...</span>
									{:else if response.status === 'failed'}
										<span class="text-sm text-red-600">Failed</span>
									{:else}
										<span class="text-sm text-gray-400">No answer</span>
									{/if}
									<svg
										class="w-5 h-5 text-gray-400 transition-transform {expandedModel ===
										response.model_id
											? 'rotate-180'
											: ''}"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</button>
							{#if expandedModel === response.model_id}
								{@const justification = getJustification(response)}
								{#if justification}
									<div class="px-4 py-3 bg-gray-50 border-t">
										<p class="text-sm text-gray-600 whitespace-pre-wrap">
											{justification}
										</p>
										{#if response.response_time_ms}
											<p class="text-xs text-gray-400 mt-2">
												Response time: {response.response_time_ms}ms
											</p>
										{/if}
									</div>
								{/if}
							{/if}
						</div>
					{:else}
						<div class="text-center py-8 text-gray-500">
							No responses from this model family.
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="bg-white rounded-lg shadow p-12 text-center">
				<p class="text-gray-500 mb-4">No responses yet for this question.</p>
				<p class="text-sm text-gray-400">
					Check back later or trigger a poll from the admin interface.
				</p>
			</div>
		{/if}
	</main>
</div>
