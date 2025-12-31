<script lang="ts">
	// ABOUTME: Home page for Qualia Garden.
	// ABOUTME: Shows benchmark sources with agreement scores and divergence highlights.

	import type { PageData } from './$types';
	import ScoreDisplay from '$lib/components/ScoreDisplay.svelte';
	import { getScoreLevel, getScoreLabel } from '$lib/alignment';

	let { data } = $props<{ data: PageData }>();

	function getScoreColor(score: number): string {
		const level = getScoreLevel(score);
		const colors = {
			'very-high': 'text-green-600',
			'high': 'text-green-500',
			'moderate': 'text-amber-500',
			'low': 'text-orange-500',
			'very-low': 'text-red-500'
		};
		return colors[level];
	}

	function getBgColor(score: number): string {
		const level = getScoreLevel(score);
		const colors = {
			'very-high': 'bg-green-50',
			'high': 'bg-green-50',
			'moderate': 'bg-amber-50',
			'low': 'bg-orange-50',
			'very-low': 'bg-red-50'
		};
		return colors[level];
	}
</script>

<svelte:head>
	<title>Qualia Garden</title>
	<meta name="description" content="Comparing AI opinions to human surveys" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b">
		<div class="max-w-6xl mx-auto px-4 py-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<img src="/favicon.png" alt="" class="w-10 h-10" />
					<div>
						<h1 class="text-xl font-bold text-gray-900">Qualia Garden</h1>
						<p class="text-sm text-gray-500">Comparing AI opinions to human surveys</p>
					</div>
				</div>
				<nav class="flex gap-4">
					<a href="/questions" class="text-gray-600 hover:text-gray-900">All Questions</a>
					<a href="/map" class="text-gray-600 hover:text-gray-900">Model Map</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-12">
		<!-- Benchmark Sources Section -->
		<section class="mb-12">
			<h2 class="text-2xl font-bold text-gray-900 mb-6">Human Surveys</h2>
			<p class="text-gray-600 mb-8">
				We poll AI models on questions from established human surveys, then measure how closely their responses align with human data.
			</p>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each data.sources as source}
					<a
						href="/sources/{source.id}"
						class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
					>
						<div class="flex items-start justify-between mb-3">
							<div>
								<h3 class="font-semibold text-gray-900">{source.name}</h3>
								<span class="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{source.short_name}</span>
							</div>
							{#if source.overallScore !== null}
								<div class="text-right">
									<ScoreDisplay score={source.overallScore} size="md" showBar={false} />
								</div>
							{/if}
						</div>

						<div class="text-sm text-gray-500 mb-4">
							{#if source.sample_size}
								{source.sample_size.toLocaleString()} respondents
							{/if}
							{#if source.year_range}
								• {source.year_range}
							{/if}
							• {source.questionCount} question{source.questionCount === 1 ? '' : 's'}
							{#if source.modelCount > 0}
								• {source.modelCount} models
							{/if}
						</div>

						{#if source.lowestHumanAiScore || source.lowestAiConsensus}
							<div class="space-y-2 text-sm">
								{#if source.lowestHumanAiScore}
									<div class="{getBgColor(source.lowestHumanAiScore.score)} rounded p-2">
										<div class="text-xs font-medium {getScoreColor(source.lowestHumanAiScore.score)}">
											Lowest AI-Human Agreement ({source.lowestHumanAiScore.score.toFixed(1)}/5 - {getScoreLabel(source.lowestHumanAiScore.score)})
										</div>
										<div class="text-gray-700 line-clamp-1">{source.lowestHumanAiScore.text}</div>
									</div>
								{/if}
								{#if source.lowestAiConsensus}
									<div class="{getBgColor(source.lowestAiConsensus.score)} rounded p-2">
										<div class="text-xs font-medium {getScoreColor(source.lowestAiConsensus.score)}">
											Lowest AI Consensus ({source.lowestAiConsensus.score.toFixed(1)}/5 - {getScoreLabel(source.lowestAiConsensus.score)})
										</div>
										<div class="text-gray-700 line-clamp-1">{source.lowestAiConsensus.text}</div>
									</div>
								{/if}
							</div>
						{:else if source.questionCount > 0 && source.overallScore === null}
							<div class="bg-gray-50 rounded p-3 text-sm text-gray-500">
								No AI responses yet
							</div>
						{:else if source.questionCount === 0}
							<div class="bg-gray-50 rounded p-3 text-sm text-gray-500">
								Questions coming soon
							</div>
						{/if}
					</a>
				{:else}
					<div class="col-span-full text-center py-12 text-gray-500">
						No benchmark sources configured.
					</div>
				{/each}
			</div>
		</section>

		<!-- AI-Only Questions Section -->
		{#if data.unbenchmarkedQuestions.length > 0}
			<section>
				<div class="flex items-center justify-between mb-6">
					<div>
						<h2 class="text-2xl font-bold text-gray-900">AI-Only Questions</h2>
						<p class="text-sm text-gray-500 mt-1">Questions without human benchmark data</p>
					</div>
					<a href="/questions" class="text-blue-600 hover:underline text-sm">View all →</a>
				</div>

				<div class="bg-white rounded-lg shadow divide-y">
					{#each data.unbenchmarkedQuestions as question}
						<a
							href="/questions/{question.id}"
							class="block p-4 hover:bg-gray-50"
						>
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="text-sm text-gray-900">{question.text}</div>
									{#if question.category}
										<div class="text-xs text-gray-500 mt-1">{question.category}</div>
									{/if}
								</div>
								<div class="text-xs text-gray-400 ml-4">
									{question.response_count} response{question.response_count === 1 ? '' : 's'}
								</div>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>
