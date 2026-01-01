<script lang="ts">
	// ABOUTME: Home page for Qualia Garden.
	// ABOUTME: Shows benchmark sources with agreement scores and divergence highlights.

	import type { PageData } from './$types';
	import { getScoreLevel, getScoreLabel } from '$lib/alignment';

	let { data } = $props<{ data: PageData }>();

	function getScoreColor(score: number): string {
		const level = getScoreLevel(score);
		const colors = {
			'very-high': 'text-emerald-600',
			'high': 'text-emerald-500',
			'moderate': 'text-amber-600',
			'low': 'text-orange-500',
			'very-low': 'text-rose-500'
		};
		return colors[level];
	}

	function getScoreBgColor(score: number): string {
		const level = getScoreLevel(score);
		const colors = {
			'very-high': 'bg-emerald-500',
			'high': 'bg-emerald-400',
			'moderate': 'bg-amber-400',
			'low': 'bg-orange-400',
			'very-low': 'bg-rose-400'
		};
		return colors[level];
	}

	function getDivergenceBg(score: number): string {
		const level = getScoreLevel(score);
		const colors = {
			'very-high': 'bg-emerald-50 border-emerald-200',
			'high': 'bg-emerald-50 border-emerald-100',
			'moderate': 'bg-amber-50 border-amber-100',
			'low': 'bg-orange-50 border-orange-100',
			'very-low': 'bg-rose-50 border-rose-100'
		};
		return colors[level];
	}
</script>

<svelte:head>
	<title>Qualia Garden — AI Opinion Research</title>
	<meta name="description" content="Exploring how AI models respond to human values surveys. Compare AI opinions across models and with human benchmark data." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
	<!-- Header -->
	<header class="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
		<div class="max-w-6xl mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<a href="/" class="flex items-center gap-3 group">
					<img src="/favicon.png" alt="" class="w-9 h-9 transition-transform group-hover:scale-105" />
					<span class="font-semibold text-slate-800 text-lg tracking-tight">Qualia Garden</span>
				</a>
				<nav class="flex items-center gap-1">
					<a href="/questions" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Questions</a>
					<a href="/models" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Models</a>
					<a href="/map" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Map</a>
				</nav>
			</div>
		</div>
	</header>

	<main>
		<!-- Hero Section -->
		<section class="py-16 px-6">
			<div class="max-w-3xl mx-auto text-center">
				<h1 class="text-4xl font-bold text-slate-900 tracking-tight mb-4">
					How do AI models think about human values?
				</h1>
				<p class="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
					We survey AI systems using questions from established human research, then measure where they agree with humans—and where they diverge.
				</p>
			</div>
		</section>

		<!-- Survey Sources -->
		<section class="px-6 pb-16">
			<div class="max-w-6xl mx-auto">
				<div class="flex items-baseline justify-between mb-8">
					<div>
						<h2 class="text-2xl font-semibold text-slate-900">Benchmark Surveys</h2>
						<p class="text-slate-500 mt-1">Questions from established human values research</p>
					</div>
					<span class="text-sm text-slate-400">{data.sources.length} sources</span>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
					{#each data.sources as source}
						<a
							href="/sources/{source.id}"
							class="group bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-200"
						>
							<!-- Header with score -->
							<div class="flex items-start justify-between gap-4 mb-4">
								<div class="flex-1 min-w-0">
									<h3 class="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors leading-snug">
										{source.name}
									</h3>
									<div class="flex items-center gap-2 mt-2">
										<span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
											{source.short_name}
										</span>
										<span class="text-xs text-slate-400">
											{#if source.sample_size}
												{source.sample_size.toLocaleString()} respondents
											{/if}
											{#if source.year_range}
												 · {source.year_range}
											{/if}
										</span>
									</div>
								</div>
								{#if source.overallScore !== null}
									<div class="flex flex-col items-end">
										<div class="flex items-baseline gap-1">
											<span class="text-2xl font-bold {getScoreColor(source.overallScore)}">
												{source.overallScore.toFixed(1)}
											</span>
											<span class="text-sm text-slate-400">/5</span>
										</div>
										<div class="text-xs {getScoreColor(source.overallScore)} font-medium">
											{getScoreLabel(source.overallScore)}
										</div>
										<div class="mt-1.5 w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
											<div
												class="h-full rounded-full {getScoreBgColor(source.overallScore)}"
												style="width: {(source.overallScore / 5) * 100}%"
											></div>
										</div>
									</div>
								{/if}
							</div>

							<!-- Stats row -->
							<div class="flex items-center gap-4 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
								<span>{source.questionCount} question{source.questionCount === 1 ? '' : 's'}</span>
								{#if source.modelCount > 0}
									<span>{source.modelCount} models polled</span>
								{/if}
							</div>

							<!-- Divergence highlights -->
							{#if source.lowestHumanAiScore || source.lowestAiConsensus}
								<div class="space-y-2.5">
									{#if source.lowestHumanAiScore}
										<div class="rounded-lg border p-3 {getDivergenceBg(source.lowestHumanAiScore.score)}">
											<div class="flex items-center gap-2 mb-1">
												<svg class="w-3.5 h-3.5 {getScoreColor(source.lowestHumanAiScore.score)}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
													<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
												</svg>
												<span class="text-xs font-medium {getScoreColor(source.lowestHumanAiScore.score)}">
													AI-Human Gap · {source.lowestHumanAiScore.score.toFixed(1)}/5
												</span>
											</div>
											<p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">{source.lowestHumanAiScore.text}</p>
										</div>
									{/if}
									{#if source.lowestAiConsensus}
										<div class="rounded-lg border p-3 {getDivergenceBg(source.lowestAiConsensus.score)}">
											<div class="flex items-center gap-2 mb-1">
												<svg class="w-3.5 h-3.5 {getScoreColor(source.lowestAiConsensus.score)}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
													<path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
												</svg>
												<span class="text-xs font-medium {getScoreColor(source.lowestAiConsensus.score)}">
													AI Disagreement · {source.lowestAiConsensus.score.toFixed(1)}/5
												</span>
											</div>
											<p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">{source.lowestAiConsensus.text}</p>
										</div>
									{/if}
								</div>
							{:else if source.questionCount > 0 && source.overallScore === null}
								<div class="rounded-lg bg-slate-50 border border-slate-100 p-4 text-center">
									<p class="text-sm text-slate-500">Awaiting AI responses</p>
								</div>
							{:else if source.questionCount === 0}
								<div class="rounded-lg bg-slate-50 border border-slate-100 p-4 text-center">
									<p class="text-sm text-slate-500">Questions coming soon</p>
								</div>
							{/if}
						</a>
					{:else}
						<div class="col-span-full text-center py-16">
							<p class="text-slate-500">No benchmark sources configured yet.</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- AI-Only Questions Section -->
		{#if data.unbenchmarkedQuestions.length > 0}
			<section class="px-6 pb-20">
				<div class="max-w-6xl mx-auto">
					<div class="flex items-baseline justify-between mb-6">
						<div>
							<h2 class="text-2xl font-semibold text-slate-900">Exploratory Questions</h2>
							<p class="text-slate-500 mt-1">Questions without human benchmark data</p>
						</div>
						<a href="/questions" class="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1">
							View all
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					</div>

					<div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
						{#each data.unbenchmarkedQuestions as question}
							<a
								href="/questions/{question.id}"
								class="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
							>
								<div class="flex-1 min-w-0 pr-4">
									<p class="text-slate-800 group-hover:text-slate-600 transition-colors line-clamp-1">
										{question.text}
									</p>
									{#if question.category}
										<span class="text-xs text-slate-400 mt-1">{question.category}</span>
									{/if}
								</div>
								<div class="flex items-center gap-3 text-xs text-slate-400 shrink-0">
									<span class="tabular-nums">
										{question.response_count} response{question.response_count === 1 ? '' : 's'}
									</span>
									<svg class="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
									</svg>
								</div>
							</a>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="border-t border-slate-200 py-8 px-6">
		<div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
			<span>Qualia Garden</span>
			<span>Exploring AI values alignment</span>
		</div>
	</footer>
</div>
