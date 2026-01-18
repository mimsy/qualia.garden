<!-- ABOUTME: Model detail page showing human alignment and AI similarity. -->
<!-- ABOUTME: Displays per-category scores, notable questions, and similar/different models. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import ScoreBadge from '$lib/components/ScoreBadge.svelte';
	import ScoreTooltip from '$lib/components/ScoreTooltip.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	// Admin edit state
	interface OpenRouterModel {
		id: string;
		name: string;
		context_length: number;
		pricing: { prompt: string; completion: string };
		supports_reasoning: boolean;
	}

	let searchQuery = $state('');
	let availableModels = $state<OpenRouterModel[]>([]);
	let loading = $state(true);
	let showDropdown = $state(false);
	let changingModel = $state(false);
	let confirmDelete = $state(false);

	// Modal state
	let showEditModal = $state(false);

	// Poll all sample count
	let pollAllSampleCount = $state(5);

	// Form state - editable values synced with data.model
	// Using $derived.by for the initial sync, then allowing user edits
	const initialFormState = $derived({
		openrouterId: data.model.openrouter_id || '',
		displayName: data.model.name,
		family: data.model.family,
		supportsReasoning: data.model.supports_reasoning,
		reasoningEnabled: data.model.supports_reasoning,
		description: data.model.description || ''
	});

	// Track form state separately for user editing
	let formState = $state({
		openrouterId: '',
		displayName: '',
		family: '',
		supportsReasoning: false,
		reasoningEnabled: false,
		description: ''
	});

	// Sync form state with initial values when data changes (e.g., after successful save)
	$effect(() => {
		formState.openrouterId = initialFormState.openrouterId;
		formState.displayName = initialFormState.displayName;
		formState.family = initialFormState.family;
		formState.supportsReasoning = initialFormState.supportsReasoning;
		formState.reasoningEnabled = initialFormState.reasoningEnabled;
		formState.description = initialFormState.description;
	});

	const filteredModels = $derived(
		searchQuery.length >= 2
			? availableModels
					.filter(
						(m) =>
							m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
							m.id.toLowerCase().includes(searchQuery.toLowerCase())
					)
					.slice(0, 15)
			: []
	);

	onMount(async () => {
		if (data.isAdmin) {
			try {
				const res = await fetch('/api/openrouter/models');
				if (res.ok) {
					availableModels = await res.json();
				}
			} catch (err) {
				console.error('Failed to load models:', err);
			}
		}
		loading = false;
	});

	function selectNewModel(model: OpenRouterModel) {
		formState.openrouterId = model.id;
		formState.family = model.id.split('/')[0];
		formState.supportsReasoning = model.supports_reasoning;
		formState.reasoningEnabled = model.supports_reasoning;
		// Update display name to match new model
		formState.displayName = model.name.includes(': ') ? model.name.split(': ').slice(1).join(': ') : model.name;
		searchQuery = '';
		showDropdown = false;
		changingModel = false;
	}

	function handleInputBlur() {
		setTimeout(() => {
			showDropdown = false;
		}, 200);
	}

	function formatPrice(price: string): string {
		const num = parseFloat(price);
		if (num === 0) return 'Free';
		if (num < 0.001) return `$${(num * 1000000).toFixed(2)}/M`;
		return `$${num.toFixed(4)}/1k`;
	}

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
	<main class="max-w-6xl mx-auto px-6 py-8">
		<!-- Model Header Card -->
		<div class="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
			<!-- Body -->
			<div class="px-6 pt-5 pb-4">
				<div class="flex items-center justify-between gap-3 mb-3">
					<div class="flex items-center gap-3 flex-wrap">
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
					{#if data.isAdmin}
						<button
							type="button"
							onclick={() => (showEditModal = true)}
							class="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
							Edit
						</button>
					{/if}
				</div>
				<p class="text-slate-500">
					{data.questionCount} questions answered
					{#if data.questionsWithHumanData > 0}
						<span class="text-slate-400">
							· {data.questionsWithHumanData} with human benchmark data
						</span>
					{/if}
					{#if data.model.release_date}
						<span class="text-slate-400">
							· Released {data.model.release_date}
						</span>
					{/if}
				</p>
				{#if data.model.description}
					<p class="text-sm text-slate-500 mt-3 leading-relaxed">{data.model.description}</p>
				{/if}
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

		<!-- Admin Status Messages -->
		{#if form?.success}
			<div class="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg mb-4 border border-emerald-200">
				Model updated successfully.
			</div>
		{/if}
		{#if form?.error}
			<div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 border border-red-200">
				{form.error}
			</div>
		{/if}

		<!-- Unpolled Questions Section (Admin Only) -->
		{#if data.isAdmin && data.unpolledQuestions.length > 0}
			<section class="mb-8">
				<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
					<div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
						<div>
							<h2 class="text-lg font-semibold text-slate-900">Unpolled Questions</h2>
							<p class="text-sm text-slate-500">
								{data.unpolledQuestions.length} published questions haven't been polled yet
							</p>
						</div>
						<form method="POST" action="?/pollAll" class="flex items-center gap-3">
							<div class="flex items-center gap-2">
								<label for="poll-all-sample-count" class="text-sm text-slate-600">Samples:</label>
								<input
									type="number"
									id="poll-all-sample-count"
									name="sample_count"
									bind:value={pollAllSampleCount}
									min="1"
									max="10"
									class="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>
							<button
								type="submit"
								class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
							>
								Poll All {data.unpolledQuestions.length} Questions
							</button>
						</form>
					</div>
					<div class="max-h-64 overflow-y-auto">
						{#each data.unpolledQuestions as question (question.id)}
							<div class="px-6 py-3 border-b border-slate-50 last:border-b-0 hover:bg-slate-50">
								<div class="flex items-start justify-between gap-4">
									<p class="text-sm text-slate-700 line-clamp-2">{question.text}</p>
									{#if question.category}
										<span class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded shrink-0">
											{question.category}
										</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}

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

	<Footer />
</div>

<!-- Edit Model Modal -->
{#if showEditModal && data.isAdmin}
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="edit-modal-title"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				showEditModal = false;
				changingModel = false;
				confirmDelete = false;
			}
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				showEditModal = false;
				changingModel = false;
				confirmDelete = false;
			}
		}}
	>
		<div
			class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 {changingModel
				? 'overflow-visible'
				: 'max-h-[90vh] overflow-auto'}"
		>
			<!-- Modal Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
				<h2 id="edit-modal-title" class="text-lg font-semibold text-slate-900">Edit Model</h2>
				<button
					type="button"
					aria-label="Close modal"
					onclick={() => {
						showEditModal = false;
						changingModel = false;
						confirmDelete = false;
					}}
					class="text-slate-400 hover:text-slate-600 transition-colors"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Modal Body -->
			<form method="POST" action="?/update" class="p-6 space-y-6">
				<!-- OpenRouter Model ID -->
				<div>
					<span class="block text-sm font-medium text-slate-700 mb-2">OpenRouter Model</span>
					{#if !changingModel}
						<div class="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
							<div>
								<div class="font-medium text-slate-900">{formState.openrouterId}</div>
								<div class="text-sm text-slate-500">{formState.family}</div>
							</div>
							<button
								type="button"
								onclick={() => (changingModel = true)}
								class="text-sm text-blue-600 hover:text-blue-700 font-medium"
							>
								Change
							</button>
						</div>
					{:else}
						<div class="relative">
							<input
								type="text"
								bind:value={searchQuery}
								onfocus={() => (showDropdown = true)}
								onblur={handleInputBlur}
								disabled={loading}
								class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder={loading ? 'Loading models...' : 'Search by name or ID...'}
								autocomplete="off"
							/>

							{#if showDropdown && filteredModels.length > 0}
								<div
									class="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-auto"
								>
									{#each filteredModels as model (model.id)}
										<button
											type="button"
											onclick={() => selectNewModel(model)}
											class="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
										>
											<div class="flex justify-between items-start">
												<div class="flex-1 min-w-0">
													<div class="font-medium text-slate-900 truncate">{model.name}</div>
													<div class="text-sm text-slate-500 truncate">{model.id}</div>
												</div>
												<div class="text-right text-sm text-slate-500 ml-4 flex-shrink-0">
													<div>{(model.context_length / 1000).toFixed(0)}k ctx</div>
													<div class="text-xs">{formatPrice(model.pricing.prompt)}</div>
												</div>
											</div>
										</button>
									{/each}
								</div>
							{/if}

							{#if showDropdown && searchQuery.length >= 2 && filteredModels.length === 0 && !loading}
								<div
									class="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-slate-500"
								>
									No models found matching "{searchQuery}"
								</div>
							{/if}
						</div>
						<div class="mt-2 flex items-center gap-2">
							<button
								type="button"
								onclick={() => (changingModel = false)}
								class="text-sm text-slate-500 hover:text-slate-700"
							>
								Cancel
							</button>
							{#if searchQuery.length > 0 && searchQuery.length < 2}
								<span class="text-sm text-slate-400">Type at least 2 characters to search...</span>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Hidden inputs for form submission -->
				<input type="hidden" name="openrouter_id" value={formState.openrouterId} />
				<input type="hidden" name="family" value={formState.family} />
				<input type="hidden" name="supports_reasoning" value={formState.reasoningEnabled} />

				<!-- Display Name -->
				<div>
					<label for="modal-name" class="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
					<input
						id="modal-name"
						name="name"
						type="text"
						bind:value={formState.displayName}
						required
						class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<p class="text-sm text-slate-500 mt-1">How this model appears in the UI</p>
				</div>

				<!-- Description -->
				<div>
					<label for="modal-description" class="block text-sm font-medium text-slate-700 mb-2">Description</label>
					<textarea
						id="modal-description"
						name="description"
						bind:value={formState.description}
						rows="3"
						class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
						placeholder="Brief description of this model..."
					></textarea>
				</div>

				<!-- Reasoning Toggle (only show if model supports it) -->
				{#if formState.supportsReasoning}
					<div class="flex items-center gap-3">
						<input
							id="modal-reasoning"
							type="checkbox"
							bind:checked={formState.reasoningEnabled}
							class="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
						/>
						<label for="modal-reasoning" class="text-sm text-slate-700">Enable extended thinking/reasoning</label>
					</div>
				{/if}

				<!-- Save Button -->
				<div class="pt-2">
					<button
						type="submit"
						class="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
					>
						Save Changes
					</button>
				</div>
			</form>

			<!-- Danger Zone -->
			<div class="px-6 pb-6 pt-2 border-t border-slate-200">
				<h3 class="text-sm font-semibold text-red-600 mb-4">Danger Zone</h3>
				{#if !confirmDelete}
					<button
						type="button"
						onclick={() => (confirmDelete = true)}
						class="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 font-medium transition-colors"
					>
						Delete Model
					</button>
				{:else}
					<div class="bg-red-50 border border-red-200 rounded-lg p-4">
						<p class="text-sm text-red-700 mb-4">
							Are you sure you want to delete <strong>{data.model.name}</strong>? This action cannot be undone.
						</p>
						<div class="flex gap-3">
							<form method="POST" action="?/delete">
								<button
									type="submit"
									class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
								>
									Yes, Delete
								</button>
							</form>
							<button
								type="button"
								onclick={() => (confirmDelete = false)}
								class="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
							>
								Cancel
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
