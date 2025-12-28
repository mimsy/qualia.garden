<script lang="ts">
	// ABOUTME: Home page for Qualia Garden.
	// ABOUTME: Shows featured questions and navigation to browse all.

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>Qualia Garden</title>
	<meta name="description" content="Exploring AI beliefs through systematic polling" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b">
		<div class="max-w-6xl mx-auto px-4 py-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<img src="/favicon.png" alt="" class="w-10 h-10" />
					<div>
						<h1 class="text-xl font-bold text-gray-900">Qualia Garden</h1>
						<p class="text-sm text-gray-500">Exploring AI beliefs through systematic polling</p>
					</div>
				</div>
				<nav class="flex gap-4">
					<a href="/questions" class="text-gray-600 hover:text-gray-900">Browse Questions</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-12">
		<section class="mb-12">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-bold text-gray-900">Featured Questions</h2>
				<a href="/questions" class="text-blue-600 hover:underline">View all →</a>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.featuredQuestions as question}
					<a
						href="/questions/{question.id}"
						class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
					>
						<div class="text-sm text-gray-500 mb-2">
							{#if question.category}
								<span class="px-2 py-1 bg-gray-100 rounded text-xs">{question.category}</span>
							{/if}
						</div>
						<h3 class="font-medium text-gray-900 mb-3 line-clamp-2">
							{question.text}
						</h3>
						<div class="text-sm text-gray-500">
							{#if question.response_count > 0}
								{question.response_count} model{question.response_count === 1 ? '' : 's'} responded
							{:else}
								No responses yet
							{/if}
						</div>
					</a>
				{:else}
					<div class="col-span-full text-center py-12 text-gray-500">
						No questions yet. Check back soon!
					</div>
				{/each}
			</div>
		</section>

		{#if data.categories.length > 0}
			<section>
				<h2 class="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
				<div class="flex flex-wrap gap-3">
					{#each data.categories as category}
						<a
							href="/questions?category={encodeURIComponent(category)}"
							class="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700"
						>
							{category}
						</a>
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>
