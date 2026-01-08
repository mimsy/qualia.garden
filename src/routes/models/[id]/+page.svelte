<!-- ABOUTME: Model detail page showing human alignment and AI similarity. -->
<!-- ABOUTME: Displays per-category scores, similar/different models, and biggest disagreements. -->
<script lang="ts">
	import type { PageData } from './$types';
	import { getScoreLabel, getScoreColor, getScoreBgColor } from '$lib/alignment';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>{data.model.name} — Qualia Garden</title>
	<meta name="description" content="AI alignment analysis for {data.model.name}" />
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
					<a href="/questions" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Questions</a>
					<a href="/models" class="px-3 py-2 text-sm text-slate-900 font-medium bg-slate-100 rounded-lg">Models</a>
					<a href="/map" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Map</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-6 py-8">
		<!-- Breadcrumb -->
		<div class="mb-8">
			<a href="/models" class="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1.5 transition-colors">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				All Models
			</a>
		</div>

		<!-- Model Header -->
		<div class="bg-white rounded-xl border border-slate-200 p-6 mb-8">
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1">
					<div class="flex items-center gap-3 flex-wrap mb-3">
						<h1 class="text-2xl font-bold text-slate-900 tracking-tight">{data.model.name}</h1>
						<a
							href="/models/families/{encodeURIComponent(data.model.family)}"
							class="px-2.5 py-1 bg-slate-100 text-slate-600 text-sm rounded-lg capitalize font-medium hover:bg-slate-200 transition-colors"
						>
							{data.model.family}
						</a>
						{#if data.model.supports_reasoning}
							<span class="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-md font-medium">
								reasoning
							</span>
						{/if}
						{#if !data.model.active}
							<span class="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
								inactive
							</span>
						{/if}
					</div>
					<p class="text-slate-600">
						{data.questionCount} questions answered
						{#if data.questionsWithHumanData > 0}
							<span class="text-slate-400">
								· {data.questionsWithHumanData} with human benchmark data
							</span>
						{/if}
					</p>
				</div>

				<!-- Quick Stats -->
				{#if data.overallHumanAlignment !== null || data.overallSelfConsistency !== null}
					<div class="flex gap-6">
						{#if data.overallHumanAlignment !== null}
							<div class="text-center">
								<div class="text-xs text-slate-500 mb-1">Alignment</div>
								<div class="text-2xl font-bold {getScoreColor(data.overallHumanAlignment)}">
									{Math.round(data.overallHumanAlignment)}
								</div>
							</div>
						{/if}
						{#if data.overallSelfConsistency !== null}
							<div class="text-center">
								<div class="text-xs text-slate-500 mb-1">AI Confidence</div>
								<div class="text-2xl font-bold {getScoreColor(data.overallSelfConsistency)}">
									{Math.round(data.overallSelfConsistency)}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		{#if data.questionCount === 0}
			<div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
				<p class="text-slate-500">No responses yet for this model.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				<!-- Human Similarity Card -->
				<div class="bg-white rounded-xl border border-slate-200 p-6">
					<h2 class="text-lg font-semibold text-slate-900 mb-5">Alignment</h2>

					{#if data.overallHumanAlignment !== null}
						<div class="mb-6 pb-6 border-b border-slate-100">
							<div class="text-sm text-slate-500 mb-2">Overall Score</div>
							<div class="flex items-baseline gap-2">
								<span class="text-3xl font-bold {getScoreColor(data.overallHumanAlignment)}">
									{Math.round(data.overallHumanAlignment)}
								</span>
								<span class="text-sm {getScoreColor(data.overallHumanAlignment)} font-medium ml-1">
									{getScoreLabel(data.overallHumanAlignment)}
								</span>
							</div>
							<div class="mt-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
								<div
									class="h-full rounded-full {getScoreBgColor(data.overallHumanAlignment)}"
									style="width: {data.overallHumanAlignment}%"
								></div>
							</div>
						</div>

						{#if data.categoryScores.length > 0}
							<div>
								<div class="text-sm text-slate-500 mb-4">By Category</div>
								<div class="space-y-3">
									{#each data.categoryScores as cat}
										<div class="flex items-center justify-between gap-4">
											<span class="text-sm text-slate-700 flex-1 truncate">{cat.category}</span>
											<div class="flex items-center gap-3">
												<span class="text-xs text-slate-400">{cat.questionCount}q</span>
												<span class="text-sm font-semibold {getScoreColor(cat.score)} w-14 text-right">
													{Math.round(cat.score)}
												</span>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					{:else}
						<p class="text-slate-500 text-sm">
							No benchmark data available for this model's answered questions.
						</p>
					{/if}
				</div>

				<!-- AI Similarity Card -->
				<div class="bg-white rounded-xl border border-slate-200 p-6">
					<h2 class="text-lg font-semibold text-slate-900 mb-5">AI Similarity</h2>

					{#if data.mostSimilar.length > 0}
						<div class="mb-6">
							<div class="text-sm text-slate-500 mb-3">Most Similar</div>
							<div class="space-y-1">
								{#each data.mostSimilar as model}
									<a
										href="/models/{model.id}"
										class="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
									>
										<span class="text-sm text-slate-700 group-hover:text-slate-900">{model.name}</span>
										<div class="flex items-center gap-3">
											<span class="text-xs text-slate-400">{model.sharedQuestions}q</span>
											<span class="text-sm font-semibold text-emerald-600 w-12 text-right">
												{model.agreement.toFixed(0)}
											</span>
										</div>
									</a>
								{/each}
							</div>
						</div>

						<div>
							<div class="text-sm text-slate-500 mb-3">Most Different</div>
							<div class="space-y-1">
								{#each data.mostDifferent as model}
									<a
										href="/models/{model.id}"
										class="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
									>
										<span class="text-sm text-slate-700 group-hover:text-slate-900">{model.name}</span>
										<div class="flex items-center gap-3">
											<span class="text-xs text-slate-400">{model.sharedQuestions}q</span>
											<span class="text-sm font-semibold text-orange-500 w-12 text-right">
												{model.agreement.toFixed(0)}
											</span>
										</div>
									</a>
								{/each}
							</div>
						</div>
					{:else}
						<p class="text-slate-500 text-sm">
							Not enough shared questions with other models to compute similarity.
						</p>
					{/if}
				</div>
			</div>

			<!-- Biggest Disagreements -->
			{#if data.biggestDisagreements.length > 0}
				<div class="bg-white rounded-xl border border-slate-200 p-6">
					<h2 class="text-lg font-semibold text-slate-900 mb-5">Biggest Disagreements with Humans</h2>
					<div class="space-y-3">
						{#each data.biggestDisagreements as q, i}
							<a
								href="/questions/{q.id}"
								class="block p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100 transition-all group"
							>
								<div class="flex items-start gap-4">
									<span class="text-xl font-bold text-slate-200 group-hover:text-slate-300 transition-colors w-6">{i + 1}</span>
									<div class="flex-1 min-w-0">
										<p class="text-slate-800 mb-2 line-clamp-2 leading-relaxed">{q.text}</p>
										<div class="flex items-center gap-4 text-xs flex-wrap">
											{#if q.category}
												<span class="text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{q.category}</span>
											{/if}
											<span class="text-slate-500">
												Model: <span class="font-medium text-slate-700">{q.modelAnswer}</span>
											</span>
											{#if q.humanMode}
												<span class="text-slate-500">
													Human: <span class="font-medium text-slate-700">{q.humanMode}</span>
												</span>
											{/if}
										</div>
									</div>
									<div class="shrink-0 text-right">
										<div class="text-lg font-bold {getScoreColor(q.humanAiScore)}">
											{Math.round(q.humanAiScore)}
										</div>
										<div class="text-xs {getScoreColor(q.humanAiScore)}">{getScoreLabel(q.humanAiScore)}</div>
									</div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</main>

	<footer class="border-t border-slate-200 py-8 px-6 mt-12">
		<div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
			<span>Qualia Garden</span>
			<span>Exploring AI values alignment</span>
		</div>
	</footer>
</div>
