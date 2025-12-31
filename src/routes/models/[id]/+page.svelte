<!-- ABOUTME: Model detail page showing human alignment and AI similarity. -->
<!-- ABOUTME: Displays per-category scores, similar/different models, and biggest disagreements. -->
<script lang="ts">
	import type { PageData } from './$types';
	import ScoreDisplay from '$lib/components/ScoreDisplay.svelte';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>{data.model.name} - Qualia Garden</title>
	<meta name="description" content="AI alignment analysis for {data.model.name}" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b">
		<div class="max-w-6xl mx-auto px-4 py-6">
			<div class="flex items-center justify-between">
				<a href="/" class="flex items-center gap-4">
					<img src="/favicon.png" alt="" class="w-10 h-10" />
					<div>
						<h1 class="text-xl font-bold text-gray-900">Qualia Garden</h1>
						<p class="text-sm text-gray-500">Comparing AI opinions to human surveys</p>
					</div>
				</a>
				<nav class="flex gap-4">
					<a href="/questions" class="text-gray-600 hover:text-gray-900">All Questions</a>
					<a href="/models" class="text-gray-900 font-medium">Models</a>
					<a href="/map" class="text-gray-600 hover:text-gray-900">Model Map</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-8">
		<div class="mb-6">
			<a href="/models" class="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back to Models
			</a>
		</div>

		<!-- Model Header -->
		<div class="bg-white rounded-lg shadow p-6 mb-8">
			<div class="flex items-start justify-between">
				<div>
					<div class="flex items-center gap-3 flex-wrap">
						<h2 class="text-2xl font-bold text-gray-900">{data.model.name}</h2>
						<span class="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded capitalize">
							{data.model.family}
						</span>
						{#if data.model.supports_reasoning}
							<span class="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
								thinking
							</span>
						{/if}
						{#if !data.model.active}
							<span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
								inactive
							</span>
						{/if}
					</div>
					<p class="text-gray-600 mt-2">
						{data.questionCount} questions answered
						{#if data.questionsWithHumanData > 0}
							<span class="text-gray-400">
								({data.questionsWithHumanData} with human benchmark data)
							</span>
						{/if}
					</p>
				</div>
			</div>
		</div>

		{#if data.questionCount === 0}
			<div class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
				No responses yet for this model.
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				<!-- Human Alignment Card -->
				<div class="bg-white rounded-lg shadow p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">Human Alignment</h3>

					{#if data.overallHumanAlignment !== null}
						<div class="mb-6">
							<div class="text-sm text-gray-500 mb-2">Overall Score</div>
							<ScoreDisplay score={data.overallHumanAlignment} size="lg" />
						</div>

						{#if data.categoryScores.length > 0}
							<div>
								<div class="text-sm text-gray-500 mb-3">By Category</div>
								<div class="space-y-3">
									{#each data.categoryScores as cat}
										<div class="flex items-center justify-between">
											<span class="text-sm text-gray-700 flex-1">{cat.category}</span>
											<div class="flex items-center gap-2">
												<span class="text-xs text-gray-400">{cat.questionCount}q</span>
												<div class="w-24">
													<ScoreDisplay score={cat.score} size="sm" showBar={false} />
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					{:else}
						<p class="text-gray-500 text-sm">
							No benchmark data available for this model's answered questions.
						</p>
					{/if}
				</div>

				<!-- AI Similarity Card -->
				<div class="bg-white rounded-lg shadow p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">AI Similarity</h3>

					{#if data.mostSimilar.length > 0}
						<div class="mb-6">
							<div class="text-sm text-gray-500 mb-3">Most Similar</div>
							<div class="space-y-2">
								{#each data.mostSimilar as model}
									<a
										href="/models/{model.id}"
										class="flex items-center justify-between p-2 rounded hover:bg-gray-50"
									>
										<span class="text-sm text-gray-700">{model.name}</span>
										<div class="flex items-center gap-2">
											<span class="text-xs text-gray-400">{model.sharedQuestions}q</span>
											<span class="text-sm font-medium text-green-600">
												{model.agreement.toFixed(0)}%
											</span>
										</div>
									</a>
								{/each}
							</div>
						</div>

						<div>
							<div class="text-sm text-gray-500 mb-3">Most Different</div>
							<div class="space-y-2">
								{#each data.mostDifferent as model}
									<a
										href="/models/{model.id}"
										class="flex items-center justify-between p-2 rounded hover:bg-gray-50"
									>
										<span class="text-sm text-gray-700">{model.name}</span>
										<div class="flex items-center gap-2">
											<span class="text-xs text-gray-400">{model.sharedQuestions}q</span>
											<span class="text-sm font-medium text-orange-600">
												{model.agreement.toFixed(0)}%
											</span>
										</div>
									</a>
								{/each}
							</div>
						</div>
					{:else}
						<p class="text-gray-500 text-sm">
							Not enough shared questions with other models to compute similarity.
						</p>
					{/if}
				</div>
			</div>

			<!-- Biggest Disagreements -->
			{#if data.biggestDisagreements.length > 0}
				<div class="bg-white rounded-lg shadow p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">Biggest Disagreements with Humans</h3>
					<div class="space-y-4">
						{#each data.biggestDisagreements as q, i}
							<a
								href="/questions/{q.id}"
								class="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
							>
								<div class="flex items-start gap-3">
									<span class="text-lg font-bold text-gray-300">{i + 1}</span>
									<div class="flex-1 min-w-0">
										<p class="text-sm text-gray-900 mb-2 line-clamp-2">{q.text}</p>
										<div class="flex items-center gap-4 text-xs">
											{#if q.category}
												<span class="text-gray-500">{q.category}</span>
											{/if}
											<span class="text-gray-600">
												Model: <span class="font-medium">{q.modelAnswer}</span>
											</span>
											{#if q.humanMode}
												<span class="text-gray-600">
													Human mode: <span class="font-medium">{q.humanMode}</span>
												</span>
											{/if}
										</div>
									</div>
									<div class="shrink-0">
										<ScoreDisplay score={q.humanAiScore} size="sm" showBar={false} />
									</div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</main>
</div>
