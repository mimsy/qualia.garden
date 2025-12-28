<script lang="ts">
	// ABOUTME: Questions browse page.
	// ABOUTME: Lists all questions with category filtering.

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
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
				<nav class="flex gap-4">
					<a href="/questions" class="text-gray-900 font-medium">Browse Questions</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-12">
		<div class="flex flex-col md:flex-row gap-8">
			<aside class="md:w-48 flex-shrink-0">
				<h2 class="font-medium text-gray-900 mb-4">Categories</h2>
				<nav class="space-y-2">
					<a
						href="/questions"
						class="block px-3 py-2 rounded {data.selectedCategory === null
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-600 hover:bg-gray-100'}"
					>
						All
					</a>
					{#each data.categories as category}
						<a
							href="/questions?category={encodeURIComponent(category)}"
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
										{#if question.category}
											<span class="px-2 py-1 bg-gray-100 rounded text-xs">
												{question.category}
											</span>
										{/if}
										<span>
											{question.response_type.replace('_', ' ')}
										</span>
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
							No questions in this category.
						</div>
					{/each}
				</div>
			</div>
		</div>
	</main>
</div>
