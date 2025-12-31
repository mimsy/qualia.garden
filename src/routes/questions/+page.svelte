<script lang="ts">
	// ABOUTME: Questions browse page.
	// ABOUTME: Lists all questions with category and status filtering.

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	function buildUrl(params: { category?: string | null; status?: string; source?: string | null }) {
		const url = new URL('/questions', 'http://localhost');
		if (params.category) url.searchParams.set('category', params.category);
		if (params.status && params.status !== 'published') url.searchParams.set('status', params.status);
		if (params.source) url.searchParams.set('source', params.source);
		return url.pathname + url.search;
	}

	const statusOptions = [
		{ value: 'published', label: 'Published' },
		{ value: 'draft', label: 'Drafts' },
		{ value: 'archived', label: 'Archived' },
		{ value: 'all', label: 'All' }
	];

	function getStatusBadgeClass(status: string) {
		switch (status) {
			case 'draft':
				return 'bg-yellow-100 text-yellow-800';
			case 'published':
				return 'bg-green-100 text-green-800';
			case 'archived':
				return 'bg-gray-100 text-gray-600';
			default:
				return 'bg-gray-100 text-gray-600';
		}
	}
</script>

<svelte:head>
	<title>Questions - Qualia Garden</title>
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
				<nav class="flex items-center gap-4">
					<a href="/questions" class="text-gray-900 font-medium">Browse Questions</a>
					<a href="/map" class="text-gray-600 hover:text-gray-900">Model Map</a>
					{#if data.isAdmin}
						<a
							href="/questions/new"
							class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							New Question
						</a>
					{/if}
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-12">
		<div class="flex flex-col md:flex-row gap-8">
			<aside class="md:w-48 flex-shrink-0">
				{#if data.isAdmin}
					<h2 class="font-medium text-gray-900 mb-4">Status</h2>
					<nav class="space-y-2 mb-8">
						{#each statusOptions as option}
							<a
								href={buildUrl({ category: data.selectedCategory, status: option.value, source: data.selectedSource })}
								class="block px-3 py-2 rounded {data.selectedStatus === option.value
									? 'bg-blue-100 text-blue-700'
									: 'text-gray-600 hover:bg-gray-100'}"
							>
								{option.label}
							</a>
						{/each}
					</nav>
				{/if}

				<h2 class="font-medium text-gray-900 mb-4">Survey Source</h2>
				<nav class="space-y-2 mb-8">
					<a
						href={buildUrl({ category: data.selectedCategory, status: data.selectedStatus })}
						class="block px-3 py-2 rounded {data.selectedSource === null
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-600 hover:bg-gray-100'}"
					>
						All
					</a>
					{#each data.sources as source}
						<a
							href={buildUrl({ category: data.selectedCategory, status: data.selectedStatus, source: source.id })}
							class="block px-3 py-2 rounded {data.selectedSource === source.id
								? 'bg-blue-100 text-blue-700'
								: 'text-gray-600 hover:bg-gray-100'}"
						>
							{source.short_name}
						</a>
					{/each}
					<a
						href={buildUrl({ category: data.selectedCategory, status: data.selectedStatus, source: 'none' })}
						class="block px-3 py-2 rounded {data.selectedSource === 'none'
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-600 hover:bg-gray-100'}"
					>
						No source
					</a>
				</nav>

				<h2 class="font-medium text-gray-900 mb-4">Categories</h2>
				<nav class="space-y-2">
					<a
						href={buildUrl({ status: data.selectedStatus, source: data.selectedSource })}
						class="block px-3 py-2 rounded {data.selectedCategory === null
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-600 hover:bg-gray-100'}"
					>
						All
					</a>
					{#each data.categories as category}
						<a
							href={buildUrl({ category, status: data.selectedStatus, source: data.selectedSource })}
							class="block px-3 py-2 rounded {data.selectedCategory === category
								? 'bg-blue-100 text-blue-700'
								: 'text-gray-600 hover:bg-gray-100'}"
						>
							{category}
						</a>
					{/each}
				</nav>
			</aside>

			<div class="flex-1">
				<h2 class="text-2xl font-bold text-gray-900 mb-6">
					{#if data.selectedCategory}
						{data.selectedCategory}
					{:else}
						All Questions
					{/if}
					<span class="text-gray-400 font-normal text-lg ml-2">
						({data.questions.length})
					</span>
				</h2>

				<div class="space-y-4">
					{#each data.questions as question}
						<a
							href="/questions/{question.id}"
							class="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
						>
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1">
									<h3 class="font-medium text-gray-900 mb-2">
										{question.text}
									</h3>
									<div class="flex items-center gap-4 text-sm text-gray-500">
										{#if question.source_short_name}
											<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
												{question.source_short_name}
											</span>
										{/if}
										{#if question.category}
											<span class="px-2 py-1 bg-gray-100 rounded text-xs">
												{question.category}
											</span>
										{/if}
										<span>
											{question.response_type}
										</span>
										{#if data.isAdmin}
											<span class="px-2 py-1 rounded text-xs {getStatusBadgeClass(question.status)}">
												{question.status}
											</span>
										{/if}
									</div>
								</div>
								<div class="text-right text-sm">
									{#if question.response_count > 0}
										<div class="font-medium text-gray-900">{question.response_count}</div>
										<div class="text-gray-500">responses</div>
									{:else}
										<div class="text-gray-400">No responses</div>
									{/if}
								</div>
							</div>
						</a>
					{:else}
						<div class="text-center py-12 text-gray-500">
							{#if data.isAdmin && data.selectedStatus === 'draft'}
								No draft questions. <a href="/questions/new" class="text-blue-600 hover:underline">Create one</a>
							{:else}
								No questions in this category.
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</main>
</div>
