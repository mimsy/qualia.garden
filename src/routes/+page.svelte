<script lang="ts">
	// ABOUTME: Home page for Qualia Garden.
	// ABOUTME: Shows benchmark sources with agreement scores and divergence highlights.

	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { getScoreColor } from '$lib/alignment';
	import ScoreBadge from '$lib/components/ScoreBadge.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { data } = $props<{ data: PageData }>();

	// Get styling for extreme question based on metric type and score
	type MetricType = 'alignment' | 'consensus' | 'confidence';

	function getMetricLabel(metric: MetricType, isHigh: boolean): string {
		if (metric === 'alignment') return isHigh ? 'High Alignment' : 'Low Alignment';
		if (metric === 'consensus') return isHigh ? 'High Consensus' : 'Low Consensus';
		return isHigh ? 'High Confidence' : 'Low Confidence';
	}

	function getMetricBg(metric: MetricType, isHigh: boolean): string {
		// Keep same color family, use lighter shade for low
		if (metric === 'alignment')
			return isHigh ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-50/50 border-emerald-200';
		if (metric === 'consensus') return isHigh ? 'bg-blue-50 border-blue-300' : 'bg-blue-50/50 border-blue-200';
		return isHigh ? 'bg-violet-50 border-violet-300' : 'bg-violet-50/50 border-violet-200';
	}

	function getMetricTextColor(metric: MetricType, isHigh: boolean): string {
		// Keep same color family, use lighter shade for low
		if (metric === 'alignment') return isHigh ? 'text-emerald-600' : 'text-emerald-500';
		if (metric === 'consensus') return isHigh ? 'text-blue-600' : 'text-blue-500';
		return isHigh ? 'text-violet-600' : 'text-violet-500';
	}

	// Circle progress colors
	function getCircleColor(type: 'alignment' | 'consensus' | 'confidence'): string {
		if (type === 'alignment') return 'stroke-emerald-500';
		if (type === 'consensus') return 'stroke-blue-500';
		return 'stroke-violet-500';
	}

	function getCircleBgColor(type: 'alignment' | 'consensus' | 'confidence'): string {
		if (type === 'alignment') return 'stroke-emerald-100';
		if (type === 'consensus') return 'stroke-blue-100';
		return 'stroke-violet-100';
	}

	function getCircleTextColor(type: 'alignment' | 'consensus' | 'confidence'): string {
		if (type === 'alignment') return 'text-emerald-600';
		if (type === 'consensus') return 'text-blue-600';
		return 'text-violet-600';
	}

	// Calculate stroke-dasharray for circle progress
	const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 14; // radius = 14
	function getCircleDasharray(score: number): string {
		const filled = (score / 100) * CIRCLE_CIRCUMFERENCE;
		return `${filled} ${CIRCLE_CIRCUMFERENCE}`;
	}

	// Format response value for display
	// For ordinal: find the option closest to the mean
	// For nominal: return the mode label directly
	function formatResponseValue(
		mode: string | null,
		mean: number | null,
		responseType: string,
		options: string[]
	): string | null {
		if (responseType === 'ordinal' && mean !== null && options.length > 0) {
			// Convert normalized mean (0-1) to index (0 to N-1)
			const index = Math.round(mean * (options.length - 1));
			const clampedIndex = Math.max(0, Math.min(options.length - 1, index));
			return options[clampedIndex];
		}
		return mode;
	}
</script>

<svelte:head>
	<title>Qualia Garden — AI Opinion Research</title>
	<meta
		name="description"
		content="Exploring how AI models respond to human values surveys. Compare AI opinions across models and with human benchmark data."
	/>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
	<main>
		<!-- Hero Section -->
		<section class="py-16 px-6">
			<div class="max-w-3xl mx-auto text-center">
				<h1 class="text-4xl font-bold text-slate-900 tracking-tight mb-4">
					How do AI models think about human values?
				</h1>
				<p class="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
					We survey AI systems using questions from established human research, then measure where they agree with
					humans—and where they diverge.
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

							<!-- Score bars -->
							{#if source.humanAiScore !== null}
								<div class="flex border border-slate-100 rounded-lg mb-4 -mx-1">
									<ScoreBadge score={source.humanAiScore} label="Alignment" type="humanSimilarity" />
									{#if source.aiAgreementScore !== null}
										<div class="w-px bg-slate-100"></div>
										<ScoreBadge score={source.aiAgreementScore} label="Consensus" type="aiConsensus" />
									{/if}
									{#if source.aiConfidenceScore !== null}
										<div class="w-px bg-slate-100"></div>
										<ScoreBadge score={source.aiConfidenceScore} label="Confidence" type="aiConfidence" />
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

							<!-- Most interesting question -->
							{#if source.extremeQuestion}
								{@const eq = source.extremeQuestion}
								{@const metric = eq.metric}
								{@const isHigh = eq.isHigh}
								{@const humanValue = formatResponseValue(eq.humanMode, eq.humanMean, eq.responseType, eq.options)}
								{@const aiValue = formatResponseValue(eq.aiMode, eq.aiMean, eq.responseType, eq.options)}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									onclick={(e: MouseEvent) => {
										e.preventDefault();
										e.stopPropagation();
										goto(`/questions/${eq.id}`);
									}}
									onkeydown={(e: KeyboardEvent) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											e.stopPropagation();
											goto(`/questions/${eq.id}`);
										}
									}}
									role="link"
									tabindex="0"
									class="rounded-lg border p-3 cursor-pointer {getMetricBg(
										metric,
										isHigh
									)} hover:shadow-md transition-shadow"
								>
									<!-- Header with label and circle meters -->
									<div class="flex items-center justify-between gap-2 mb-2">
										<div class="flex items-center gap-1.5">
											<svg
												class="w-3.5 h-3.5 {getMetricTextColor(metric, isHigh)}"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												stroke-width="2.5"
											>
												{#if isHigh}
													<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
												{:else}
													<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
												{/if}
											</svg>
											<span class="text-xs font-semibold {getMetricTextColor(metric, isHigh)}">
												{getMetricLabel(metric, isHigh)}
											</span>
										</div>
										<!-- Circle progress meters -->
										<div class="flex items-center gap-1">
											{#if eq.alignment !== null}
												<div class="relative w-7 h-7">
													<svg class="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
														<circle
															cx="18"
															cy="18"
															r="14"
															fill="none"
															class={getCircleBgColor('alignment')}
															stroke-width="3"
														/>
														<circle
															cx="18"
															cy="18"
															r="14"
															fill="none"
															class={getCircleColor('alignment')}
															stroke-width="3"
															stroke-dasharray={getCircleDasharray(eq.alignment)}
															stroke-linecap="round"
														/>
													</svg>
													<span
														class="absolute inset-0 flex items-center justify-center text-[8px] font-bold {getCircleTextColor(
															'alignment'
														)}">{Math.round(eq.alignment)}</span
													>
												</div>
											{/if}
											{#if eq.consensus !== null}
												<div class="relative w-7 h-7">
													<svg class="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
														<circle
															cx="18"
															cy="18"
															r="14"
															fill="none"
															class={getCircleBgColor('consensus')}
															stroke-width="3"
														/>
														<circle
															cx="18"
															cy="18"
															r="14"
															fill="none"
															class={getCircleColor('consensus')}
															stroke-width="3"
															stroke-dasharray={getCircleDasharray(eq.consensus)}
															stroke-linecap="round"
														/>
													</svg>
													<span
														class="absolute inset-0 flex items-center justify-center text-[8px] font-bold {getCircleTextColor(
															'consensus'
														)}">{Math.round(eq.consensus)}</span
													>
												</div>
											{/if}
											{#if eq.confidence !== null}
												<div class="relative w-7 h-7">
													<svg class="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
														<circle
															cx="18"
															cy="18"
															r="14"
															fill="none"
															class={getCircleBgColor('confidence')}
															stroke-width="3"
														/>
														<circle
															cx="18"
															cy="18"
															r="14"
															fill="none"
															class={getCircleColor('confidence')}
															stroke-width="3"
															stroke-dasharray={getCircleDasharray(eq.confidence)}
															stroke-linecap="round"
														/>
													</svg>
													<span
														class="absolute inset-0 flex items-center justify-center text-[8px] font-bold {getCircleTextColor(
															'confidence'
														)}">{Math.round(eq.confidence)}</span
													>
												</div>
											{/if}
										</div>
									</div>

									<!-- Question text -->
									<p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">{eq.text}</p>

									<!-- AI vs Human choices (if available) -->
									{#if humanValue || aiValue}
										<div class="flex gap-3 mt-2 text-xs">
											{#if humanValue}
												<div class="flex-1 bg-white/60 rounded px-2 py-1.5 border border-slate-200/50">
													<span class="text-slate-400 uppercase tracking-wide text-[10px]">Human</span>
													<p class="text-slate-700 font-medium truncate">{humanValue}</p>
												</div>
											{/if}
											{#if aiValue}
												<div class="flex-1 bg-white/60 rounded px-2 py-1.5 border border-slate-200/50">
													<span class="text-slate-400 uppercase tracking-wide text-[10px]">AI</span>
													<p class="text-slate-700 font-medium truncate">{aiValue}</p>
												</div>
											{/if}
										</div>
									{/if}
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
								<h3 class="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors mb-1">
									{category.category}
								</h3>
								{#if category.description}
									<p class="text-xs text-slate-500 mb-3 line-clamp-2">{category.description}</p>
								{:else}
									<div class="mb-3"></div>
								{/if}

								<!-- Score bars -->
								<div class="flex border border-slate-100 rounded-lg mb-3 -mx-1">
									<ScoreBadge score={category.humanAiScore} label="Alignment" type="humanSimilarity" />
									<div class="w-px bg-slate-100"></div>
									<ScoreBadge score={category.aiAgreementScore} label="Consensus" type="aiConsensus" />
									{#if category.aiConfidenceScore !== null}
										<div class="w-px bg-slate-100"></div>
										<ScoreBadge score={category.aiConfidenceScore} label="Confidence" type="aiConfidence" />
									{/if}
								</div>

								<div class="text-xs text-slate-400 mb-3">
									{category.questionCount} question{category.questionCount === 1 ? '' : 's'} · {category.modelCount} models
								</div>

								<!-- Most interesting question -->
								{#if category.extremeQuestion}
									{@const eq = category.extremeQuestion}
									{@const metric = eq.metric}
									{@const isHigh = eq.isHigh}
									{@const humanVal = formatResponseValue(eq.humanMode, eq.humanMean, eq.responseType, eq.options)}
									{@const aiVal = formatResponseValue(eq.aiMode, eq.aiMean, eq.responseType, eq.options)}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										onclick={(e: MouseEvent) => {
											e.preventDefault();
											e.stopPropagation();
											goto(`/questions/${eq.id}`);
										}}
										onkeydown={(e: KeyboardEvent) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												e.stopPropagation();
												goto(`/questions/${eq.id}`);
											}
										}}
										role="link"
										tabindex="0"
										class="rounded-lg border p-2.5 cursor-pointer {getMetricBg(
											metric,
											isHigh
										)} hover:shadow-md transition-shadow"
									>
										<!-- Header with label and circle meters -->
										<div class="flex items-center justify-between gap-1 mb-1.5">
											<div class="flex items-center gap-1">
												<svg
													class="w-3 h-3 {getMetricTextColor(metric, isHigh)}"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													stroke-width="2.5"
												>
													{#if isHigh}
														<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
													{:else}
														<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
													{/if}
												</svg>
												<span class="text-[10px] font-semibold {getMetricTextColor(metric, isHigh)}">
													{getMetricLabel(metric, isHigh)}
												</span>
											</div>
											<!-- Circle meters -->
											<div class="flex items-center gap-0.5">
												{#if eq.alignment !== null}
													<div class="relative w-5 h-5">
														<svg class="w-5 h-5 -rotate-90" viewBox="0 0 36 36">
															<circle
																cx="18"
																cy="18"
																r="14"
																fill="none"
																class={getCircleBgColor('alignment')}
																stroke-width="4"
															/>
															<circle
																cx="18"
																cy="18"
																r="14"
																fill="none"
																class={getCircleColor('alignment')}
																stroke-width="4"
																stroke-dasharray={getCircleDasharray(eq.alignment)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[6px] font-bold {getCircleTextColor(
																'alignment'
															)}">{Math.round(eq.alignment)}</span
														>
													</div>
												{/if}
												{#if eq.consensus !== null}
													<div class="relative w-5 h-5">
														<svg class="w-5 h-5 -rotate-90" viewBox="0 0 36 36">
															<circle
																cx="18"
																cy="18"
																r="14"
																fill="none"
																class={getCircleBgColor('consensus')}
																stroke-width="4"
															/>
															<circle
																cx="18"
																cy="18"
																r="14"
																fill="none"
																class={getCircleColor('consensus')}
																stroke-width="4"
																stroke-dasharray={getCircleDasharray(eq.consensus)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[6px] font-bold {getCircleTextColor(
																'consensus'
															)}">{Math.round(eq.consensus)}</span
														>
													</div>
												{/if}
												{#if eq.confidence !== null}
													<div class="relative w-5 h-5">
														<svg class="w-5 h-5 -rotate-90" viewBox="0 0 36 36">
															<circle
																cx="18"
																cy="18"
																r="14"
																fill="none"
																class={getCircleBgColor('confidence')}
																stroke-width="4"
															/>
															<circle
																cx="18"
																cy="18"
																r="14"
																fill="none"
																class={getCircleColor('confidence')}
																stroke-width="4"
																stroke-dasharray={getCircleDasharray(eq.confidence)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[6px] font-bold {getCircleTextColor(
																'confidence'
															)}">{Math.round(eq.confidence)}</span
														>
													</div>
												{/if}
											</div>
										</div>

										<!-- Question text -->
										<p class="text-xs text-slate-600 line-clamp-2">{eq.text}</p>

										<!-- Compact AI vs Human -->
										{#if humanVal || aiVal}
											<div class="flex gap-2 mt-1.5 text-[10px]">
												{#if humanVal}
													<div class="flex-1 truncate">
														<span class="text-slate-400">H:</span>
														<span class="text-slate-600 font-medium">{humanVal}</span>
													</div>
												{/if}
												{#if aiVal}
													<div class="flex-1 truncate">
														<span class="text-slate-400">AI:</span>
														<span class="text-slate-600 font-medium">{aiVal}</span>
													</div>
												{/if}
											</div>
										{/if}
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
									<svg
										class="w-4 h-4 text-emerald-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
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
											<span
												class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center"
											>
												{i + 1}
											</span>
											<div class="flex-1 min-w-0">
												<div class="font-medium text-slate-900 group-hover:text-slate-600 truncate">{model.name}</div>
												<div class="text-xs text-slate-400">
													{model.family} · {model.questionsWithHumanData} questions
												</div>
											</div>
											<div class="text-right">
												<div class="font-semibold {getScoreColor(model.humanAlignmentScore)}">
													{Math.round(model.humanAlignmentScore)}
												</div>
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
									<svg
										class="w-4 h-4 text-rose-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
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
											<span
												class="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center"
											>
												{i + 1}
											</span>
											<div class="flex-1 min-w-0">
												<div class="font-medium text-slate-900 group-hover:text-slate-600 truncate">{model.name}</div>
												<div class="text-xs text-slate-400">
													{model.family} · {model.questionsWithHumanData} questions
												</div>
											</div>
											<div class="text-right">
												<div class="font-semibold {getScoreColor(model.humanAlignmentScore)}">
													{Math.round(model.humanAlignmentScore)}
												</div>
											</div>
										</a>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<div class="text-center mt-4">
						<a
							href="/models"
							class="text-sm text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1"
						>
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
						<a
							href="/questions"
							class="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
						>
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
									<svg
										class="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
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

	<Footer />
</div>
