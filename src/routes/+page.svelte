<script lang="ts">
	// ABOUTME: Home page for Qualia Garden.
	// ABOUTME: Shows benchmark sources with agreement scores and divergence highlights.

	import type { PageData } from './$types';
	import { getScoreColor, getScoreBgColor, getDivergenceBg } from '$lib/alignment';

	let { data } = $props<{ data: PageData }>();
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
							<!-- Header -->
							<div class="mb-4">
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

							<!-- Dual score bars -->
							{#if source.humanAiScore !== null}
								<div class="flex gap-6 mb-4">
									<div class="flex-1">
										<div class="flex items-center justify-between mb-1">
											<span class="text-xs text-slate-500">Human Similarity</span>
											<span class="text-sm font-semibold {getScoreColor(source.humanAiScore)}">{Math.round(source.humanAiScore)}</span>
										</div>
										<div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
											<div
												class="h-full rounded-full {getScoreBgColor(source.humanAiScore)}"
												style="width: {source.humanAiScore}%"
											></div>
										</div>
									</div>
									{#if source.aiAgreementScore !== null}
										<div class="flex-1">
											<div class="flex items-center justify-between mb-1">
												<span class="text-xs text-slate-500">AI Consensus</span>
												<span class="text-sm font-semibold {getScoreColor(source.aiAgreementScore)}">{Math.round(source.aiAgreementScore)}</span>
											</div>
											<div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
												<div
													class="h-full rounded-full {getScoreBgColor(source.aiAgreementScore)}"
													style="width: {source.aiAgreementScore}%"
												></div>
											</div>
										</div>
									{/if}
								</div>
							{/if}

							<!-- Stats row -->
							<div class="flex items-center gap-4 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
								<span>{source.questionCount} question{source.questionCount === 1 ? '' : 's'}</span>
								{#if source.modelCount > 0}
									<span>{source.modelCount} models polled</span>
								{/if}
							</div>

							<!-- Extreme question highlight -->
							{#if source.extremeQuestion}
								<div class="rounded-lg border p-3 {getDivergenceBg(source.extremeQuestion.score)}">
									<div class="flex items-center gap-2 mb-1">
										{#if source.extremeQuestion.isHighAgreement}
											<svg class="w-3.5 h-3.5 {getScoreColor(source.extremeQuestion.score)}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
												<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<span class="text-xs font-medium {getScoreColor(source.extremeQuestion.score)}">
												Strong Alignment · {Math.round(source.extremeQuestion.score)}
											</span>
										{:else}
											<svg class="w-3.5 h-3.5 {getScoreColor(source.extremeQuestion.score)}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
												<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
											</svg>
											<span class="text-xs font-medium {getScoreColor(source.extremeQuestion.score)}">
												Divergence · {Math.round(source.extremeQuestion.score)}
											</span>
										{/if}
									</div>
									<p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">{source.extremeQuestion.text}</p>
								</div>
							{:else if source.questionCount > 0 && source.humanAiScore === null}
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

		<!-- Categories Section -->
		{#if data.categories.length > 0}
			<section class="px-6 pb-16">
				<div class="max-w-6xl mx-auto">
					<div class="flex items-baseline justify-between mb-8">
						<div>
							<h2 class="text-2xl font-semibold text-slate-900">Categories</h2>
							<p class="text-slate-500 mt-1">Agreement scores by topic area</p>
						</div>
						<span class="text-sm text-slate-400">{data.categories.length} categories</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each data.categories as category}
							<a
								href="/categories/{encodeURIComponent(category.category)}"
								class="group bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-200"
							>
								<h3 class="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors mb-3">
									{category.category}
								</h3>

								<!-- Dual score bars -->
								<div class="flex gap-4 mb-3">
									<div class="flex-1">
										<div class="flex items-center justify-between mb-1">
											<span class="text-xs text-slate-500">Human Similarity</span>
											<span class="text-sm font-semibold {getScoreColor(category.humanAiScore)}">{Math.round(category.humanAiScore)}</span>
										</div>
										<div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
											<div
												class="h-full rounded-full {getScoreBgColor(category.humanAiScore)}"
												style="width: {category.humanAiScore}%"
											></div>
										</div>
									</div>
									<div class="flex-1">
										<div class="flex items-center justify-between mb-1">
											<span class="text-xs text-slate-500">AI Consensus</span>
											<span class="text-sm font-semibold {getScoreColor(category.aiAgreementScore)}">{Math.round(category.aiAgreementScore)}</span>
										</div>
										<div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
											<div
												class="h-full rounded-full {getScoreBgColor(category.aiAgreementScore)}"
												style="width: {category.aiAgreementScore}%"
											></div>
										</div>
									</div>
								</div>

								<div class="text-xs text-slate-400 mb-3">
									{category.questionCount} question{category.questionCount === 1 ? '' : 's'} · {category.modelCount} models
								</div>

								<!-- Extreme question -->
								{#if category.extremeQuestion}
									<div class="rounded-lg border p-2.5 {getDivergenceBg(category.extremeQuestion.score)}">
										<div class="flex items-center gap-1.5 mb-1">
											{#if category.extremeQuestion.isHighAgreement}
												<svg class="w-3 h-3 {getScoreColor(category.extremeQuestion.score)}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
													<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<span class="text-xs font-medium {getScoreColor(category.extremeQuestion.score)}">
													{Math.round(category.extremeQuestion.score)}
												</span>
											{:else}
												<svg class="w-3 h-3 {getScoreColor(category.extremeQuestion.score)}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
													<path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
												</svg>
												<span class="text-xs font-medium {getScoreColor(category.extremeQuestion.score)}">
													{Math.round(category.extremeQuestion.score)}
												</span>
											{/if}
										</div>
										<p class="text-xs text-slate-600 line-clamp-2">{category.extremeQuestion.text}</p>
									</div>
								{/if}
							</a>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<!-- Model Rankings Section -->
		{#if data.topModels.length > 0 || data.bottomModels.length > 0}
			<section class="px-6 pb-16">
				<div class="max-w-6xl mx-auto">
					<div class="mb-8">
						<h2 class="text-2xl font-semibold text-slate-900">Model Rankings</h2>
						<p class="text-slate-500 mt-1">Human alignment scores by model</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- Top 3 -->
						{#if data.topModels.length > 0}
							<div class="bg-white rounded-xl border border-slate-200 p-5">
								<h3 class="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
									<svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
									</svg>
									Most Human-Aligned
								</h3>
								<div class="space-y-3">
									{#each data.topModels as model, i}
										<a
											href="/models/{model.id}"
											class="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors group"
										>
											<span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
												{i + 1}
											</span>
											<div class="flex-1 min-w-0">
												<div class="font-medium text-slate-900 group-hover:text-slate-600 truncate">{model.name}</div>
												<div class="text-xs text-slate-400">{model.family} · {model.questionsWithHumanData} questions</div>
											</div>
											<div class="text-right">
												<div class="font-semibold {getScoreColor(model.humanAlignmentScore)}">{Math.round(model.humanAlignmentScore)}</div>
											</div>
										</a>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Bottom 3 -->
						{#if data.bottomModels.length > 0}
							<div class="bg-white rounded-xl border border-slate-200 p-5">
								<h3 class="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
									<svg class="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
									</svg>
									Least Human-Aligned
								</h3>
								<div class="space-y-3">
									{#each data.bottomModels as model, i}
										<a
											href="/models/{model.id}"
											class="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors group"
										>
											<span class="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
												{i + 1}
											</span>
											<div class="flex-1 min-w-0">
												<div class="font-medium text-slate-900 group-hover:text-slate-600 truncate">{model.name}</div>
												<div class="text-xs text-slate-400">{model.family} · {model.questionsWithHumanData} questions</div>
											</div>
											<div class="text-right">
												<div class="font-semibold {getScoreColor(model.humanAlignmentScore)}">{Math.round(model.humanAlignmentScore)}</div>
											</div>
										</a>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<div class="text-center mt-4">
						<a href="/models" class="text-sm text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1">
							View all models
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					</div>
				</div>
			</section>
		{/if}

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
