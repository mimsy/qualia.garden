<!-- ABOUTME: Model detail page showing human alignment and AI similarity. -->
<!-- ABOUTME: Displays per-category scores, notable questions, and similar/different models. -->
<script lang="ts">
	import type { PageData } from './$types';
	import ScoreBadge from '$lib/components/ScoreBadge.svelte';
	import ScoreTooltip from '$lib/components/ScoreTooltip.svelte';

	let { data } = $props<{ data: PageData }>();

	// Circle progress helpers
	const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 14; // radius = 14
	function getCircleDasharray(score: number): string {
		const filled = (score / 100) * CIRCLE_CIRCUMFERENCE;
		return `${filled} ${CIRCLE_CIRCUMFERENCE}`;
	}

	// Color helpers
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

	// Format answer value - convert numeric indices to labels for ordinal questions
	function formatAnswer(value: string | null, options: string[]): string | null {
		if (!value) return null;
		// Check if it's a numeric index (1-based from the database)
		const numVal = parseInt(value, 10);
		if (!isNaN(numVal) && options.length > 0) {
			// Convert 1-based index to 0-based and get label
			const index = numVal - 1;
			if (index >= 0 && index < options.length) {
				return options[index];
			}
		}
		// Already a label or couldn't convert
		return value;
	}
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
					<a
						href="/questions"
						class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
						>Questions</a
					>
					<a href="/models" class="px-3 py-2 text-sm text-slate-900 font-medium bg-slate-100 rounded-lg">Models</a>
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

		<!-- Model Header Card -->
		<div class="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
			<!-- Body -->
			<div class="px-6 pt-5 pb-4">
				<div class="flex items-center gap-3 flex-wrap mb-3">
					<h1 class="text-2xl font-bold text-slate-900 tracking-tight">{data.model.name}</h1>
					<a
						href="/models/families/{encodeURIComponent(data.model.family)}"
						class="px-2.5 py-1 bg-slate-100 text-slate-600 text-sm rounded-lg capitalize font-medium hover:bg-slate-200 transition-colors"
					>
						{data.model.family}
					</a>
					{#if data.model.supports_reasoning}
						<span class="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-md font-medium"> reasoning </span>
					{/if}
					{#if !data.model.active}
						<span class="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md"> inactive </span>
					{/if}
				</div>
				<p class="text-slate-500">
					{data.questionCount} questions answered
					{#if data.questionsWithHumanData > 0}
						<span class="text-slate-400">
							· {data.questionsWithHumanData} with human benchmark data
						</span>
					{/if}
				</p>
			</div>

			<!-- Score bars footer -->
			{#if data.overallHumanAlignment !== null || data.overallAiConsensus !== null || data.overallSelfConsistency !== null}
				<div class="flex border-t border-slate-100">
					<ScoreBadge score={data.overallHumanAlignment} label="Alignment" type="humanSimilarity" context="model" />
					<div class="w-px bg-slate-100"></div>
					<ScoreBadge score={data.overallAiConsensus} label="Consensus" type="aiConsensus" context="model" />
					<div class="w-px bg-slate-100"></div>
					<ScoreBadge score={data.overallSelfConsistency} label="Confidence" type="aiConfidence" context="model" />
				</div>
			{/if}
		</div>

		{#if data.questionCount === 0}
			<div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
				<p class="text-slate-500">No responses yet for this model.</p>
			</div>
		{:else}
			<!-- Category Scores Grid -->
			{#if data.categoryScores.length > 0}
				<section class="mb-8">
					<h2 class="text-lg font-semibold text-slate-900 mb-4">Scores by Category</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each data.categoryScores as cat (cat.category)}
							<a
								href="/categories/{encodeURIComponent(cat.category)}"
								class="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
							>
								<div class="p-4">
									<div class="font-medium text-slate-900 truncate group-hover:text-slate-700">
										{cat.category}
									</div>
								</div>
								<!-- Score bars footer -->
								<div class="flex border-t border-slate-100">
									<ScoreBadge score={cat.humanAlignment} label="Align" type="humanSimilarity" context="model" />
									<div class="w-px bg-slate-100"></div>
									<ScoreBadge score={cat.aiConsensus} label="Cons" type="aiConsensus" context="model" />
									<div class="w-px bg-slate-100"></div>
									<ScoreBadge score={cat.selfConsistency} label="Conf" type="aiConfidence" context="model" />
								</div>
							</a>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Notable Questions by Axis -->
			{#if data.notableQuestions.highAlignment.length > 0 || data.notableQuestions.lowAlignment.length > 0 || data.notableQuestions.highConsensus.length > 0 || data.notableQuestions.lowConsensus.length > 0 || data.notableQuestions.highConfidence.length > 0 || data.notableQuestions.lowConfidence.length > 0}
				<section class="mb-8">
					<h2 class="text-lg font-semibold text-slate-900 mb-4">Notable Questions</h2>

					<!-- Alignment Row -->
					{#if data.notableQuestions.highAlignment.length > 0 || data.notableQuestions.lowAlignment.length > 0}
						<div class="mb-6">
							<h3 class="text-sm font-medium text-emerald-700 mb-3 flex items-center gap-2">
								<div class="w-2 h-2 rounded-full bg-emerald-500"></div>
								Human Alignment
							</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each data.notableQuestions.highAlignment as q (q.id)}
									{@const modelVal = formatAnswer(q.modelAnswer, q.options)}
									{@const humanVal = formatAnswer(q.humanMode, q.options)}
									<a
										href="/questions/{q.id}"
										class="block bg-emerald-50/50 rounded-lg border border-emerald-200 p-3 hover:shadow-md transition-shadow"
									>
										<!-- Header with circles -->
										<div class="flex items-center justify-between gap-2 mb-2">
											<span class="text-xs font-semibold text-emerald-600">High</span>
											<div class="flex items-center gap-1">
												{#if q.humanAlignment !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.humanAlignment)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'alignment'
															)}">{Math.round(q.humanAlignment)}</span
														>
													</div>
												{/if}
												{#if q.aiConsensus !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.aiConsensus)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'consensus'
															)}">{Math.round(q.aiConsensus)}</span
														>
													</div>
												{/if}
												{#if q.selfConsistency !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.selfConsistency)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'confidence'
															)}">{Math.round(q.selfConsistency)}</span
														>
													</div>
												{/if}
											</div>
										</div>
										<!-- Question text -->
										<p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">{q.text}</p>
										<!-- Answer comparison boxes -->
										{#if modelVal || humanVal}
											<div class="flex gap-2 mt-2 text-xs">
												{#if modelVal}
													<div class="flex-1 bg-white/60 rounded px-2 py-1.5 border border-slate-200/50">
														<span class="text-slate-400 uppercase tracking-wide text-[10px]">Model</span>
														<p class="text-slate-700 font-medium truncate">{modelVal}</p>
													</div>
												{/if}
												{#if humanVal}
													<div class="flex-1 bg-white/60 rounded px-2 py-1.5 border border-slate-200/50">
														<span class="text-slate-400 uppercase tracking-wide text-[10px]">Human</span>
														<p class="text-slate-700 font-medium truncate">{humanVal}</p>
													</div>
												{/if}
											</div>
										{/if}
									</a>
								{/each}
								{#each data.notableQuestions.lowAlignment as q (q.id)}
									{@const modelVal = formatAnswer(q.modelAnswer, q.options)}
									{@const humanVal = formatAnswer(q.humanMode, q.options)}
									<a
										href="/questions/{q.id}"
										class="block bg-emerald-50/30 rounded-lg border border-emerald-100 p-3 hover:shadow-md transition-shadow"
									>
										<!-- Header with circles -->
										<div class="flex items-center justify-between gap-2 mb-2">
											<span class="text-xs font-semibold text-emerald-500">Low</span>
											<div class="flex items-center gap-1">
												{#if q.humanAlignment !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.humanAlignment)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'alignment'
															)}">{Math.round(q.humanAlignment)}</span
														>
													</div>
												{/if}
												{#if q.aiConsensus !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.aiConsensus)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'consensus'
															)}">{Math.round(q.aiConsensus)}</span
														>
													</div>
												{/if}
												{#if q.selfConsistency !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.selfConsistency)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'confidence'
															)}">{Math.round(q.selfConsistency)}</span
														>
													</div>
												{/if}
											</div>
										</div>
										<!-- Question text -->
										<p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">{q.text}</p>
										<!-- Answer comparison boxes -->
										{#if modelVal || humanVal}
											<div class="flex gap-2 mt-2 text-xs">
												{#if modelVal}
													<div class="flex-1 bg-white/60 rounded px-2 py-1.5 border border-slate-200/50">
														<span class="text-slate-400 uppercase tracking-wide text-[10px]">Model</span>
														<p class="text-slate-700 font-medium truncate">{modelVal}</p>
													</div>
												{/if}
												{#if humanVal}
													<div class="flex-1 bg-white/60 rounded px-2 py-1.5 border border-slate-200/50">
														<span class="text-slate-400 uppercase tracking-wide text-[10px]">Human</span>
														<p class="text-slate-700 font-medium truncate">{humanVal}</p>
													</div>
												{/if}
											</div>
										{/if}
									</a>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Consensus Row -->
					{#if data.notableQuestions.highConsensus.length > 0 || data.notableQuestions.lowConsensus.length > 0}
						<div class="mb-6">
							<h3 class="text-sm font-medium text-blue-700 mb-3 flex items-center gap-2">
								<div class="w-2 h-2 rounded-full bg-blue-500"></div>
								AI Consensus
							</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each data.notableQuestions.highConsensus as q (q.id)}
									{@const modelVal = formatAnswer(q.modelAnswer, q.options)}
									{@const aiVal = formatAnswer(q.aiMode, q.options)}
									<a
										href="/questions/{q.id}"
										class="block bg-blue-50/50 rounded-lg border border-blue-200 p-3 hover:shadow-md transition-shadow"
									>
										<!-- Header with circles -->
										<div class="flex items-center justify-between gap-2 mb-2">
											<span class="text-xs font-semibold text-blue-600">High</span>
											<div class="flex items-center gap-1">
												{#if q.humanAlignment !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.humanAlignment)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'alignment'
															)}">{Math.round(q.humanAlignment)}</span
														>
													</div>
												{/if}
												{#if q.aiConsensus !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.aiConsensus)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'consensus'
															)}">{Math.round(q.aiConsensus)}</span
														>
													</div>
												{/if}
												{#if q.selfConsistency !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.selfConsistency)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'confidence'
															)}">{Math.round(q.selfConsistency)}</span
														>
													</div>
												{/if}
											</div>
										</div>
										<!-- Question text -->
										<p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">{q.text}</p>
										<!-- Answer comparison boxes -->
										{#if modelVal || aiVal}
											<div class="flex gap-2 mt-2 text-xs">
												{#if modelVal}
													<div class="flex-1 bg-white/60 rounded px-2 py-1.5 border border-slate-200/50">
														<span class="text-slate-400 uppercase tracking-wide text-[10px]">This model</span>
														<p class="text-slate-700 font-medium truncate">{modelVal}</p>
													</div>
												{/if}
												{#if aiVal}
													<div class="flex-1 bg-white/60 rounded px-2 py-1.5 border border-slate-200/50">
														<span class="text-slate-400 uppercase tracking-wide text-[10px]">AI consensus</span>
														<p class="text-slate-700 font-medium truncate">{aiVal}</p>
													</div>
												{/if}
											</div>
										{/if}
									</a>
								{/each}
								{#each data.notableQuestions.lowConsensus as q (q.id)}
									{@const modelVal = formatAnswer(q.modelAnswer, q.options)}
									{@const aiVal = formatAnswer(q.aiMode, q.options)}
									<a
										href="/questions/{q.id}"
										class="block bg-blue-50/30 rounded-lg border border-blue-100 p-3 hover:shadow-md transition-shadow"
									>
										<!-- Header with circles -->
										<div class="flex items-center justify-between gap-2 mb-2">
											<span class="text-xs font-semibold text-blue-500">Low</span>
											<div class="flex items-center gap-1">
												{#if q.humanAlignment !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.humanAlignment)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'alignment'
															)}">{Math.round(q.humanAlignment)}</span
														>
													</div>
												{/if}
												{#if q.aiConsensus !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.aiConsensus)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'consensus'
															)}">{Math.round(q.aiConsensus)}</span
														>
													</div>
												{/if}
												{#if q.selfConsistency !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.selfConsistency)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'confidence'
															)}">{Math.round(q.selfConsistency)}</span
														>
													</div>
												{/if}
											</div>
										</div>
										<!-- Question text -->
										<p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">{q.text}</p>
										<!-- Answer comparison boxes -->
										{#if modelVal || aiVal}
											<div class="flex gap-2 mt-2 text-xs">
												{#if modelVal}
													<div class="flex-1 bg-white/60 rounded px-2 py-1.5 border border-slate-200/50">
														<span class="text-slate-400 uppercase tracking-wide text-[10px]">This model</span>
														<p class="text-slate-700 font-medium truncate">{modelVal}</p>
													</div>
												{/if}
												{#if aiVal}
													<div class="flex-1 bg-white/60 rounded px-2 py-1.5 border border-slate-200/50">
														<span class="text-slate-400 uppercase tracking-wide text-[10px]">AI consensus</span>
														<p class="text-slate-700 font-medium truncate">{aiVal}</p>
													</div>
												{/if}
											</div>
										{/if}
									</a>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Confidence Row -->
					{#if data.notableQuestions.highConfidence.length > 0 || data.notableQuestions.lowConfidence.length > 0}
						<div>
							<h3 class="text-sm font-medium text-violet-700 mb-3 flex items-center gap-2">
								<div class="w-2 h-2 rounded-full bg-violet-500"></div>
								Response Confidence
							</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each data.notableQuestions.highConfidence as q (q.id)}
									{@const modelVal = formatAnswer(q.modelAnswer, q.options)}
									<a
										href="/questions/{q.id}"
										class="block bg-violet-50/50 rounded-lg border border-violet-200 p-3 hover:shadow-md transition-shadow"
									>
										<!-- Header with circles -->
										<div class="flex items-center justify-between gap-2 mb-2">
											<span class="text-xs font-semibold text-violet-600">High</span>
											<div class="flex items-center gap-1">
												{#if q.humanAlignment !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.humanAlignment)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'alignment'
															)}">{Math.round(q.humanAlignment)}</span
														>
													</div>
												{/if}
												{#if q.aiConsensus !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.aiConsensus)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'consensus'
															)}">{Math.round(q.aiConsensus)}</span
														>
													</div>
												{/if}
												{#if q.selfConsistency !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.selfConsistency)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'confidence'
															)}">{Math.round(q.selfConsistency)}</span
														>
													</div>
												{/if}
											</div>
										</div>
										<!-- Question text -->
										<p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">{q.text}</p>
										<!-- Answer box -->
										{#if modelVal}
											<div class="mt-2 text-xs">
												<div class="bg-white/60 rounded px-2 py-1.5 border border-slate-200/50 inline-block">
													<span class="text-slate-400 uppercase tracking-wide text-[10px]">Answer</span>
													<p class="text-slate-700 font-medium">{modelVal}</p>
												</div>
											</div>
										{/if}
									</a>
								{/each}
								{#each data.notableQuestions.lowConfidence as q (q.id)}
									{@const modelVal = formatAnswer(q.modelAnswer, q.options)}
									<a
										href="/questions/{q.id}"
										class="block bg-violet-50/30 rounded-lg border border-violet-100 p-3 hover:shadow-md transition-shadow"
									>
										<!-- Header with circles -->
										<div class="flex items-center justify-between gap-2 mb-2">
											<span class="text-xs font-semibold text-violet-500">Low</span>
											<div class="flex items-center gap-1">
												{#if q.humanAlignment !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.humanAlignment)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'alignment'
															)}">{Math.round(q.humanAlignment)}</span
														>
													</div>
												{/if}
												{#if q.aiConsensus !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.aiConsensus)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'consensus'
															)}">{Math.round(q.aiConsensus)}</span
														>
													</div>
												{/if}
												{#if q.selfConsistency !== null}
													<div class="relative w-6 h-6">
														<svg class="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
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
																stroke-dasharray={getCircleDasharray(q.selfConsistency)}
																stroke-linecap="round"
															/>
														</svg>
														<span
															class="absolute inset-0 flex items-center justify-center text-[7px] font-bold {getCircleTextColor(
																'confidence'
															)}">{Math.round(q.selfConsistency)}</span
														>
													</div>
												{/if}
											</div>
										</div>
										<!-- Question text -->
										<p class="text-sm text-slate-700 line-clamp-2 leading-relaxed">{q.text}</p>
										<!-- Answer box -->
										{#if modelVal}
											<div class="mt-2 text-xs">
												<div class="bg-white/60 rounded px-2 py-1.5 border border-slate-200/50 inline-block">
													<span class="text-slate-400 uppercase tracking-wide text-[10px]">Answer</span>
													<p class="text-slate-700 font-medium">{modelVal}</p>
												</div>
											</div>
										{/if}
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</section>
			{/if}

			<!-- Similar/Different Models (at bottom) -->
			{#if data.mostSimilar.length > 0 || data.mostDifferent.length > 0}
				<section>
					<h2 class="text-lg font-semibold text-slate-900 mb-4">Related Models</h2>

					{#if data.mostSimilar.length > 0}
						<div class="mb-4">
							<h3 class="text-sm font-medium text-slate-600 mb-3">Most Similar</h3>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								{#each data.mostSimilar as model (model.id)}
									<a
										href="/models/{model.id}"
										class="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
									>
										<div class="min-w-0 flex-1">
											<div class="font-medium text-slate-900 truncate group-hover:text-slate-700">
												{model.name}
											</div>
											<div class="text-xs text-slate-400">
												{model.sharedQuestions} shared
											</div>
										</div>
										<ScoreTooltip score={model.agreement} type="aiConsensus" position="bottom" context="model">
											<div class="relative w-10 h-10 cursor-help shrink-0">
												<svg class="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
													<circle cx="18" cy="18" r="14" fill="none" stroke-width="3" class="stroke-emerald-100" />
													<circle
														cx="18"
														cy="18"
														r="14"
														fill="none"
														stroke-width="3"
														stroke-linecap="round"
														class="stroke-emerald-500"
														stroke-dasharray={getCircleDasharray(model.agreement)}
													/>
												</svg>
												<span
													class="absolute inset-0 flex items-center justify-center text-xs font-semibold text-emerald-600"
												>
													{Math.round(model.agreement)}
												</span>
											</div>
										</ScoreTooltip>
									</a>
								{/each}
							</div>
						</div>
					{/if}

					{#if data.mostDifferent.length > 0}
						<div>
							<h3 class="text-sm font-medium text-slate-600 mb-3">Most Different</h3>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								{#each data.mostDifferent as model (model.id)}
									<a
										href="/models/{model.id}"
										class="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
									>
										<div class="min-w-0 flex-1">
											<div class="font-medium text-slate-900 truncate group-hover:text-slate-700">
												{model.name}
											</div>
											<div class="text-xs text-slate-400">
												{model.sharedQuestions} shared
											</div>
										</div>
										<ScoreTooltip score={model.agreement} type="aiConsensus" position="bottom" context="model">
											<div class="relative w-10 h-10 cursor-help shrink-0">
												<svg class="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
													<circle cx="18" cy="18" r="14" fill="none" stroke-width="3" class="stroke-orange-100" />
													<circle
														cx="18"
														cy="18"
														r="14"
														fill="none"
														stroke-width="3"
														stroke-linecap="round"
														class="stroke-orange-500"
														stroke-dasharray={getCircleDasharray(model.agreement)}
													/>
												</svg>
												<span
													class="absolute inset-0 flex items-center justify-center text-xs font-semibold text-orange-600"
												>
													{Math.round(model.agreement)}
												</span>
											</div>
										</ScoreTooltip>
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</section>
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
