<script lang="ts">
	// ABOUTME: Question results page with admin capabilities.
	// ABOUTME: Shows aggregate results, human comparison, per-model responses, and admin tools.

	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { SvelteSet } from 'svelte/reactivity';
	import ScoreBadge from '$lib/components/ScoreBadge.svelte';
	import ScoreTooltip from '$lib/components/ScoreTooltip.svelte';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	type ResponseType = (typeof data.responses)[number];
	type PollType = (typeof data.allPolls)[number];

	let selectedFamily = $state<string | null>(null);
	let sortBy = $state<'name' | 'alignment' | 'consensus' | 'confidence'>('name');
	let sortAscending = $state(true);
	let showPollHistory = $state(false);
	let showPollTrigger = $state(false);
	let selectedModels = new SvelteSet<string>();
	let modalResponse = $state<ResponseType | null>(null);
	let viewMode = $state<'model' | 'response'>('model');

	// Edit form state - derived initial values
	const initialText = $derived(data.question.text);
	const initialCategory = $derived(data.question.category || '');
	const initialResponseType = $derived(data.question.response_type);
	const initialOptions = $derived(data.options || ['']);

	// Editable state
	let editText = $state('');
	let editCategory = $state('');
	let editResponseType = $state('ordinal');
	let editOptionsList = $state<string[]>(['']);

	// Initialize form values when question data changes
	$effect(() => {
		editText = initialText;
		editCategory = initialCategory;
		editResponseType = initialResponseType;
		editOptionsList = [...initialOptions];
	});

	function addOption() {
		editOptionsList = [...editOptionsList, ''];
	}

	function removeOption(index: number) {
		if (editOptionsList.length > 1) {
			editOptionsList = editOptionsList.filter((_, i) => i !== index);
		}
	}

	function updateOption(index: number, value: string) {
		editOptionsList = editOptionsList.map((opt, i) => (i === index ? value : opt));
	}

	// Move option up in the list (for ordinal)
	function moveOptionUp(index: number) {
		if (index > 0) {
			const newList = [...editOptionsList];
			[newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
			editOptionsList = newList;
		}
	}

	// Move option down in the list (for ordinal)
	function moveOptionDown(index: number) {
		if (index < editOptionsList.length - 1) {
			const newList = [...editOptionsList];
			[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
			editOptionsList = newList;
		}
	}

	// Serialize options for form submission
	const serializedOptions = $derived(editOptionsList.filter((o) => o.trim()).join('\n'));

	function getUniqueFamilies(responses: ResponseType[]): string[] {
		const familySet = new Set<string>();
		for (const r of responses) {
			familySet.add(r.model_family);
		}
		return Array.from(familySet).sort();
	}

	// Get unique families for filter
	const families = $derived(getUniqueFamilies(data.responses));

	// Filter and sort responses
	const filteredResponses = $derived.by(() => {
		let responses = selectedFamily
			? data.responses.filter((r: ResponseType) => r.model_family === selectedFamily)
			: [...data.responses];

		// Sort responses
		responses.sort((a: ResponseType, b: ResponseType) => {
			let comparison = 0;
			switch (sortBy) {
				case 'name':
					comparison = a.model_name.localeCompare(b.model_name);
					break;
				case 'alignment': {
					const aAlign = data.modelHumanAlignment[a.model_id] ?? -1;
					const bAlign = data.modelHumanAlignment[b.model_id] ?? -1;
					comparison = bAlign - aAlign; // Higher is better
					break;
				}
				case 'consensus': {
					const aCons = data.modelAiConsensus[a.model_id] ?? -1;
					const bCons = data.modelAiConsensus[b.model_id] ?? -1;
					comparison = bCons - aCons; // Higher is better
					break;
				}
				case 'confidence': {
					const aConf = data.modelSelfConsistency[a.model_id] ?? -1;
					const bConf = data.modelSelfConsistency[b.model_id] ?? -1;
					comparison = bConf - aConf; // Higher is better
					break;
				}
			}
			return sortAscending ? comparison : -comparison;
		});

		return responses;
	});

	// Parse human distribution to aggregated format
	const humanAggregateResults = $derived.by(() => {
		if (!data.humanDistribution) return [];

		const parsed = JSON.parse(data.humanDistribution.distribution) as Record<string, number>;
		const total = Object.values(parsed).reduce((a, b) => a + b, 0);

		return Object.entries(parsed)
			.map(([answer, count]) => ({
				answer,
				label: getAnswerLabel(answer),
				count,
				percentage: total > 0 ? (count / total) * 100 : 0
			}))
			.sort((a, b) => parseInt(a.answer) - parseInt(b.answer));
	});

	// Get a representative justification for a response (one where answer matches the modal answer)
	type SampleType = ResponseType['samples'][number];
	function getRepresentativeJustification(response: ResponseType): string | null {
		if (!response.aggregated_answer) return null;
		// Find a sample with matching answer that has a justification
		const matchingSample = response.samples.find(
			(s: SampleType) => s.parsed_answer === response.aggregated_answer && s.justification
		);
		return (
			matchingSample?.justification ?? response.samples.find((s: SampleType) => s.justification)?.justification ?? null
		);
	}

	// Circle progress helpers
	const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 14; // radius = 14
	function getCircleDasharray(score: number): string {
		const filled = (score / 100) * CIRCLE_CIRCUMFERENCE;
		return `${filled} ${CIRCLE_CIRCUMFERENCE}`;
	}

	// Sample count for polling (default 5, max 10)
	let sampleCount = $state(5);

	// Convert 1-based key to display label using options array
	function getAnswerLabel(answer: string): string {
		if (!data.options) return answer;
		const index = parseInt(answer, 10) - 1;
		return index >= 0 && index < data.options.length ? data.options[index] : answer;
	}

	// Group polls by model for history view
	const pollsByModel = $derived.by(() => {
		const grouped: Record<string, PollType[]> = {};
		for (const poll of data.allPolls) {
			if (!grouped[poll.model_id]) grouped[poll.model_id] = [];
			grouped[poll.model_id].push(poll);
		}
		return grouped;
	});

	// Models that have already been polled
	const polledModelIds = $derived(new SvelteSet(data.allPolls.map((p: PollType) => p.model_id)));

	function toggleModelSelection(modelId: string) {
		if (selectedModels.has(modelId)) {
			selectedModels.delete(modelId);
		} else {
			selectedModels.add(modelId);
		}
	}

	type ModelType = (typeof data.availableModels)[number];

	function selectAllUnpolled() {
		selectedModels.clear();
		for (const m of data.availableModels.filter((m: ModelType) => !polledModelIds.has(m.id))) {
			selectedModels.add(m.id);
		}
	}

	function getStatusBadgeClass(status: string) {
		switch (status) {
			case 'draft':
				return 'bg-yellow-100 text-yellow-800';
			case 'published':
				return 'bg-green-100 text-green-800';
			case 'archived':
				return 'bg-gray-100 text-gray-600';
			default:
				return 'bg-gray-100 text-gray-600';
		}
	}

	const canPublish = $derived(data.totalResponses > 0);
</script>

<svelte:head>
	<title>{data.question.text.slice(0, 50)}... — Qualia Garden</title>
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
					<a href="/questions" class="px-3 py-2 text-sm text-slate-900 font-medium bg-slate-100 rounded-lg">Questions</a
					>
					<a
						href="/models"
						class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
						>Models</a
					>
					{#if data.isAdmin}
						<a
							href="/responses"
							class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
							>Responses</a
						>
					{/if}
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-6 py-8">
		{#if form?.error}
			<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
				{form.error}
			</div>
		{/if}

		{#if data.isAdmin && data.question.status !== 'published'}
			<div
				class="mb-4 p-4 rounded-lg {data.question.status === 'draft'
					? 'bg-yellow-50 border border-yellow-200'
					: 'bg-gray-50 border border-gray-200'}"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="px-2 py-1 rounded text-xs font-medium {getStatusBadgeClass(data.question.status)}">
							{data.question.status}
						</span>
						<span class="text-sm text-gray-600">
							{#if data.question.status === 'draft'}
								This question is not yet published and won't appear publicly.
							{:else}
								This question is archived and hidden from the main list.
							{/if}
						</span>
					</div>
					<div class="flex gap-2">
						{#if data.question.status === 'draft'}
							<form method="POST" action="?/publish" use:enhance>
								<button
									type="submit"
									disabled={!canPublish}
									class="px-3 py-1 text-sm rounded {canPublish
										? 'bg-green-600 text-white hover:bg-green-700'
										: 'bg-gray-200 text-gray-500 cursor-not-allowed'}"
									title={canPublish ? 'Publish question' : 'Need at least one AI response to publish'}
								>
									Publish
								</button>
							</form>
						{:else if data.question.status === 'archived'}
							<form method="POST" action="?/unarchive" use:enhance>
								<button type="submit" class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
									Republish
								</button>
							</form>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		{#if data.isAdmin && data.question.status === 'draft'}
			<!-- Editable draft view -->
			<form method="POST" action="?/update" use:enhance class="bg-white rounded-lg shadow p-8 mb-8">
				<div class="space-y-4">
					<div>
						<label for="text" class="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
						<textarea
							id="text"
							name="text"
							bind:value={editText}
							rows="3"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						></textarea>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
							<input
								type="text"
								id="category"
								name="category"
								bind:value={editCategory}
								list="categories"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<datalist id="categories">
								{#each data.categories as cat}
									<option value={cat}></option>
								{/each}
							</datalist>
						</div>

						<div>
							<label for="response_type" class="block text-sm font-medium text-gray-700 mb-1">Response Type</label>
							<select
								id="response_type"
								name="response_type"
								bind:value={editResponseType}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="ordinal">Ordinal (ordered scale)</option>
								<option value="nominal">Nominal (unordered choices)</option>
							</select>
						</div>
					</div>

					<fieldset>
						<input type="hidden" name="options" value={serializedOptions} />
						<div class="flex items-center justify-between mb-2">
							<legend class="block text-sm font-medium text-gray-700">
								{#if editResponseType === 'ordinal'}
									Options (ordered scale, first = lowest)
								{:else}
									Options (unordered choices)
								{/if}
							</legend>
							<button
								type="button"
								onclick={addOption}
								class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
								Add option
							</button>
						</div>

						{#if editResponseType === 'ordinal'}
							<!-- Ordinal: numbered scale with up/down reordering -->
							<div class="space-y-2 bg-blue-50 rounded p-3 border border-blue-200">
								{#each editOptionsList as option, i}
									<div class="flex items-center gap-2">
										<span class="w-6 text-center text-sm font-medium text-blue-600">{i + 1}.</span>
										<input
											type="text"
											value={option}
											oninput={(e) => updateOption(i, e.currentTarget.value)}
											placeholder="Option {i + 1}"
											class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
										/>
										<div class="flex flex-col gap-0.5">
											<button
												type="button"
												onclick={() => moveOptionUp(i)}
												disabled={i === 0}
												class="p-0.5 rounded hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed"
												title="Move up"
											>
												<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
												</svg>
											</button>
											<button
												type="button"
												onclick={() => moveOptionDown(i)}
												disabled={i === editOptionsList.length - 1}
												class="p-0.5 rounded hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed"
												title="Move down"
											>
												<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
												</svg>
											</button>
										</div>
										<button
											type="button"
											onclick={() => removeOption(i)}
											disabled={editOptionsList.length <= 1}
											class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
											title="Remove option"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>
								{/each}
								<div class="text-xs text-gray-500 mt-2">Options are ordered — first option is lowest on the scale</div>
							</div>
						{:else}
							<!-- Nominal: unordered choices with bullet points -->
							<div class="space-y-2 bg-gray-50 rounded p-3 border border-gray-200">
								{#each editOptionsList as option, i}
									<div class="flex items-center gap-2">
										<span class="w-6 text-center text-gray-400">•</span>
										<input
											type="text"
											value={option}
											oninput={(e) => updateOption(i, e.currentTarget.value)}
											placeholder="Option"
											class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
										/>
										<button
											type="button"
											onclick={() => removeOption(i)}
											disabled={editOptionsList.length <= 1}
											class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
											title="Remove option"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>
								{/each}
								<div class="text-xs text-gray-500 mt-2">Options are unordered — no inherent ranking or scale</div>
							</div>
						{/if}
					</fieldset>

					<div class="flex justify-end">
						<button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
							Save Draft
						</button>
					</div>
				</div>
			</form>
		{:else}
			<!-- Read-only view - unified question card -->
			{@const selfConsistencyValues = Object.values(data.modelSelfConsistency).filter((v): v is number => v !== null)}
			{@const avgSelfConsistency =
				selfConsistencyValues.length > 0
					? selfConsistencyValues.reduce((a: number, b: number) => a + b, 0) / selfConsistencyValues.length
					: null}
			{@const humanResults = humanAggregateResults}
			{@const _maxPercentage = Math.max(
				...data.aggregateResults.map((r: { percentage: number }) => r.percentage),
				...humanResults.map((r: { percentage: number }) => r.percentage),
				1
			)}
			{@const aiMaxPct = Math.max(...data.aggregateResults.map((r: { percentage: number }) => r.percentage), 0)}
			{@const humanMaxPct = Math.max(...humanResults.map((r: { percentage: number }) => r.percentage), 0)}
			{@const _aiTopAnswer = data.aggregateResults.find(
				(r: { percentage: number }) => r.percentage === aiMaxPct
			)?.answer}
			{@const humanTopAnswer = humanResults.find((r: { percentage: number }) => r.percentage === humanMaxPct)?.answer}
			<div class="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
				<!-- Header with source/category links -->
				{#if data.benchmarkSource || data.question.category}
					<div class="flex border-b border-slate-100 text-xs">
						{#if data.benchmarkSource}
							<a
								href="/sources/{data.benchmarkSource.id}"
								class="flex-1 py-2 px-5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors truncate"
							>
								<span class="text-slate-400">Source:</span>
								{data.benchmarkSource.short_name}
							</a>
						{/if}
						{#if data.question.category}
							<a
								href="/categories/{encodeURIComponent(data.question.category)}"
								class="flex-1 py-2 px-5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors truncate {data.benchmarkSource
									? 'border-l border-slate-100'
									: ''}"
							>
								<span class="text-slate-400">Category:</span>
								{data.question.category}
							</a>
						{/if}
					</div>
				{/if}

				<!-- Question text and admin controls -->
				<div class="px-8 pt-6 pb-4">
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1">
							<h2 class="text-2xl font-bold text-slate-900">
								{data.question.text}
							</h2>
							{#if data.isAdmin && data.question.status !== 'published'}
								<span class="inline-block mt-2 px-2 py-1 rounded text-xs {getStatusBadgeClass(data.question.status)}">
									{data.question.status}
								</span>
							{/if}
						</div>
						{#if data.isAdmin && data.question.status === 'published'}
							<form method="POST" action="?/archive" use:enhance>
								<button
									type="submit"
									class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
								>
									Archive
								</button>
							</form>
						{/if}
					</div>
				</div>

				<!-- Butterfly chart (inside card) -->
				{#if data.benchmarkSource && (humanResults.length > 0 || data.totalResponses > 0)}
					{@const currentAiResults = viewMode === 'model' ? data.aggregateResults : data.individualResponseResults}
					{@const aiCount = viewMode === 'model' ? data.totalResponses : data.totalIndividualResponses}
					{@const aiCountLabel = viewMode === 'model' ? 'models' : 'responses'}
					{@const currentMaxPercentage = Math.max(
						...currentAiResults.map((r: { percentage: number }) => r.percentage),
						...humanResults.map((r: { percentage: number }) => r.percentage),
						1
					)}
					{@const currentAiMaxPct = Math.max(...currentAiResults.map((r: { percentage: number }) => r.percentage), 0)}
					{@const currentAiTopAnswer = currentAiResults.find(
						(r: { percentage: number }) => r.percentage === currentAiMaxPct
					)?.answer}
					<div class="px-8 pb-6">
						{#if data.options && data.options.length > 0}
							<!-- Column headers with side-aligned labels -->
							<div class="flex items-center gap-2 mb-3">
								<div class="flex-1 flex items-center justify-end gap-2">
									<div class="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
										<div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
										<span>AI</span>
										<span class="text-gray-400 font-normal">({aiCount} {aiCountLabel})</span>
									</div>
								</div>
								<div class="w-32 sm:w-40 text-center px-2"></div>
								<div class="flex-1 flex items-center gap-2">
									<div class="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
										<div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
										<span>Human</span>
										{#if data.humanDistribution}
											<span class="text-gray-400 font-normal"
												>({data.humanDistribution.sample_size.toLocaleString()})</span
											>
										{/if}
									</div>
								</div>
							</div>

							<div class="space-y-2">
								{#each data.options as option, i}
									{@const optionKey = String(i + 1)}
									{@const aiResult = currentAiResults.find((r: { answer: string }) => r.answer === optionKey)}
									{@const humanResult = humanResults.find(
										(r: { answer: string; label: string }) => r.answer === optionKey || r.label === option
									)}
									{@const aiPct = aiResult?.percentage ?? 0}
									{@const humanPct = humanResult?.percentage ?? 0}
									{@const isAiTop = optionKey === currentAiTopAnswer}
									{@const isHumanTop =
										optionKey === humanTopAnswer ||
										option === humanResults.find((r: { percentage: number }) => r.percentage === humanMaxPct)?.label}
									{@const isBothTop = isAiTop && isHumanTop}
									<div class="flex items-center gap-2">
										<!-- AI bar (right-aligned, grows left) -->
										<div class="flex-1 flex items-center justify-end gap-2">
											<span
												class="text-xs tabular-nums w-10 text-right {isAiTop
													? 'text-blue-600 font-semibold'
													: 'text-gray-500'}"
											>
												{aiPct.toFixed(0)}%
											</span>
											<div class="w-32 sm:w-48 h-6 bg-gray-100 rounded-l overflow-hidden flex justify-end">
												<div
													class="h-full bg-blue-500 rounded-l transition-all"
													style="width: {(aiPct / currentMaxPercentage) * 100}%"
												></div>
											</div>
										</div>
										<!-- Center label with conditional styling -->
										<div class="w-32 sm:w-40 text-center px-2">
											{#if isBothTop}
												<span
													class="text-sm font-bold leading-tight"
													style="background: linear-gradient(90deg, #2563eb, #10b981); -webkit-background-clip: text; background-clip: text; color: transparent;"
													>{option}</span
												>
											{:else if isAiTop}
												<span class="text-sm font-bold text-blue-600 leading-tight">{option}</span>
											{:else if isHumanTop}
												<span class="text-sm font-bold text-emerald-600 leading-tight">{option}</span>
											{:else}
												<span class="text-sm text-gray-700 leading-tight">{option}</span>
											{/if}
										</div>
										<!-- Human bar (left-aligned, grows right) -->
										<div class="flex-1 flex items-center gap-2">
											<div class="w-32 sm:w-48 h-6 bg-gray-100 rounded-r overflow-hidden">
												<div
													class="h-full bg-emerald-500 rounded-r transition-all"
													style="width: {(humanPct / currentMaxPercentage) * 100}%"
												></div>
											</div>
											<span
												class="text-xs tabular-nums w-10 {isHumanTop
													? 'text-emerald-600 font-semibold'
													: 'text-gray-500'}"
											>
												{humanPct.toFixed(0)}%
											</span>
										</div>
									</div>
								{/each}
							</div>

							<!-- View mode toggle (centered below results) -->
							<div class="flex justify-center mt-4">
								<div class="flex items-center gap-1 text-xs">
									<button
										onclick={() => (viewMode = 'model')}
										class="px-2 py-1 rounded transition-colors {viewMode === 'model'
											? 'bg-blue-100 text-blue-700 font-medium'
											: 'text-slate-400 hover:text-slate-600'}"
									>
										By Model
									</button>
									<span class="text-slate-300">|</span>
									<button
										onclick={() => (viewMode = 'response')}
										class="px-2 py-1 rounded transition-colors {viewMode === 'response'
											? 'bg-blue-100 text-blue-700 font-medium'
											: 'text-slate-400 hover:text-slate-600'}"
									>
										By Response
									</button>
								</div>
							</div>
						{:else}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
								<!-- AI Results (fallback) -->
								<div>
									<div class="flex items-center gap-2 mb-4">
										<div class="w-3 h-3 rounded-full bg-blue-500"></div>
										<span class="font-medium text-gray-700">AI Models</span>
										<span class="text-xs text-gray-500">({data.totalResponses} models)</span>
									</div>
									<div class="space-y-3">
										{#each data.aggregateResults as result}
											<div>
												<div class="flex justify-between text-sm mb-1">
													<span class="text-gray-700 truncate pr-2">
														{getAnswerLabel(result.answer)}
													</span>
													<span class="text-gray-500 flex-shrink-0">
														{result.percentage.toFixed(0)}%
													</span>
												</div>
												<div class="h-5 bg-gray-100 rounded overflow-hidden">
													<div
														class="h-full bg-blue-500 rounded transition-all"
														style="width: {result.percentage}%"
													></div>
												</div>
											</div>
										{/each}
									</div>
								</div>

								<!-- Human Results -->
								<div>
									<div class="flex items-center gap-2 mb-4">
										<div class="w-3 h-3 rounded-full bg-emerald-500"></div>
										<span class="font-medium text-gray-700">Humans</span>
										{#if data.humanDistribution}
											<span class="text-xs text-gray-500"
												>({data.humanDistribution.sample_size.toLocaleString()} respondents)</span
											>
										{/if}
									</div>
									{#if humanResults.length > 0}
										<div class="space-y-3">
											{#each humanResults as result}
												<div>
													<div class="flex justify-between text-sm mb-1">
														<span class="text-gray-700 truncate pr-2">{result.label}</span>
														<span class="text-gray-500 flex-shrink-0">
															{result.percentage.toFixed(0)}%
														</span>
													</div>
													<div class="h-5 bg-gray-100 rounded overflow-hidden">
														<div
															class="h-full bg-emerald-500 rounded transition-all"
															style="width: {result.percentage}%"
														></div>
													</div>
												</div>
											{/each}
										</div>
									{:else}
										<div class="text-center py-8 text-gray-400 text-sm">No human data for this filter combination</div>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Score bars footer -->
				{#if data.totalResponses > 0}
					<div class="flex border-t border-slate-100">
						<ScoreBadge score={data.humanAiScore} label="Alignment" type="humanSimilarity" />
						<div class="w-px bg-slate-100"></div>
						<ScoreBadge score={data.aiConsensusScore} label="Consensus" type="aiConsensus" />
						<div class="w-px bg-slate-100"></div>
						<ScoreBadge score={avgSelfConsistency} label="Confidence" type="aiConfidence" />
					</div>
				{/if}
			</div>
		{/if}

		{#if !data.benchmarkSource && data.totalResponses > 0}
			<!-- Standard View: No human comparison -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				<div class="bg-white rounded-xl border border-slate-200 p-6">
					<h3 class="font-semibold text-slate-900 mb-6">Aggregate Results</h3>
					<div class="space-y-4">
						{#each data.aggregateResults as result}
							<div>
								<div class="flex justify-between text-sm mb-1">
									<span class="text-gray-700 truncate pr-4">{result.answer}</span>
									<span class="text-gray-500 flex-shrink-0">
										{result.count} ({result.percentage.toFixed(0)}%)
									</span>
								</div>
								<div class="h-6 bg-gray-100 rounded-full overflow-hidden">
									<div class="h-full bg-blue-500 rounded-full transition-all" style="width: {result.percentage}%"></div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				{#if data.options}
					<div class="bg-white rounded-xl border border-slate-200 p-6">
						<h3 class="font-semibold text-slate-900 mb-4">Answer Options</h3>
						<ol class="list-none space-y-2">
							{#each data.options as option, i}
								<li class="flex gap-2 text-sm">
									<span class="font-medium text-gray-500">{String.fromCharCode(65 + i)}.</span>
									<span class="text-gray-700">{option}</span>
								</li>
							{/each}
						</ol>
					</div>
				{/if}
			</div>
		{/if}

		{#if data.totalResponses > 0}
			<div class="mb-8">
				<div class="flex items-center justify-between mb-5">
					<h3 class="font-semibold text-slate-900 text-lg">Model Responses</h3>
					<div class="flex items-center gap-3">
						<!-- Provider filter -->
						<select
							bind:value={selectedFamily}
							class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value={null}>All providers</option>
							{#each families as family}
								<option value={family} class="capitalize">{family}</option>
							{/each}
						</select>

						<!-- Sort by -->
						<select
							bind:value={sortBy}
							class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="name">Sort by name</option>
							<option value="alignment">Sort by alignment</option>
							<option value="consensus">Sort by consensus</option>
							<option value="confidence">Sort by confidence</option>
						</select>

						<!-- Sort direction -->
						<button
							onclick={() => (sortAscending = !sortAscending)}
							class="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
							title={sortAscending ? 'Ascending' : 'Descending'}
						>
							{#if sortAscending}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
								</svg>
							{:else}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							{/if}
						</button>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{#each filteredResponses as response}
						{@const sc = data.modelSelfConsistency[response.model_id]}
						{@const ha = data.modelHumanAlignment[response.model_id]}
						{@const ac = data.modelAiConsensus[response.model_id]}
						{@const justification = getRepresentativeJustification(response)}
						<button
							onclick={() => (modalResponse = response)}
							class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
						>
							<!-- Header: Model name, family, score circles -->
							<div class="flex items-start justify-between gap-3 mb-4">
								<div class="min-w-0 flex-1">
									<a
										href="/models/{response.model_id}"
										onclick={(e: MouseEvent) => e.stopPropagation()}
										class="font-medium text-slate-900 truncate group-hover:text-slate-700 hover:text-blue-600 hover:underline block"
									>
										{response.model_name}
									</a>
									<div class="text-xs text-slate-400 capitalize">{response.model_family}</div>
								</div>

								<!-- Score circles -->
								<div class="flex gap-1.5 shrink-0">
									<!-- Human alignment circle (emerald) -->
									{#if ha !== undefined && ha !== null}
										<ScoreTooltip score={ha} type="humanSimilarity" position="bottom" context="model">
											<div class="relative w-9 h-9 cursor-help">
												<svg class="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
													<circle cx="18" cy="18" r="14" fill="none" stroke-width="3" class="stroke-emerald-100" />
													<circle
														cx="18"
														cy="18"
														r="14"
														fill="none"
														stroke-width="3"
														stroke-linecap="round"
														class="stroke-emerald-500"
														stroke-dasharray={getCircleDasharray(ha)}
													/>
												</svg>
												<span
													class="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-emerald-600"
												>
													{Math.round(ha)}
												</span>
											</div>
										</ScoreTooltip>
									{/if}

									<!-- AI consensus circle (blue) -->
									{#if ac !== undefined && ac !== null}
										<ScoreTooltip score={ac} type="aiConsensus" position="bottom" context="model">
											<div class="relative w-9 h-9 cursor-help">
												<svg class="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
													<circle cx="18" cy="18" r="14" fill="none" stroke-width="3" class="stroke-blue-100" />
													<circle
														cx="18"
														cy="18"
														r="14"
														fill="none"
														stroke-width="3"
														stroke-linecap="round"
														class="stroke-blue-500"
														stroke-dasharray={getCircleDasharray(ac)}
													/>
												</svg>
												<span
													class="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-blue-600"
												>
													{Math.round(ac)}
												</span>
											</div>
										</ScoreTooltip>
									{/if}

									<!-- Self-consistency circle (violet) -->
									{#if sc !== undefined && sc !== null}
										<ScoreTooltip score={sc} type="aiConfidence" position="bottom" context="model">
											<div class="relative w-9 h-9 cursor-help">
												<svg class="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
													<circle cx="18" cy="18" r="14" fill="none" stroke-width="3" class="stroke-violet-100" />
													<circle
														cx="18"
														cy="18"
														r="14"
														fill="none"
														stroke-width="3"
														stroke-linecap="round"
														class="stroke-violet-500"
														stroke-dasharray={getCircleDasharray(sc)}
													/>
												</svg>
												<span
													class="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-violet-600"
												>
													{Math.round(sc)}
												</span>
											</div>
										</ScoreTooltip>
									{/if}
								</div>
							</div>

							<!-- Answer -->
							{#if response.complete_count > 0 && response.aggregated_answer}
								<div class="mb-3">
									<div class="text-xs text-slate-400 uppercase tracking-wide mb-1">Answer</div>
									<div class="text-sm font-medium text-slate-800">
										{getAnswerLabel(response.aggregated_answer)}
									</div>
								</div>
							{:else if response.complete_count === 0 && response.sample_count > 0}
								{@const pendingCount = response.samples.filter(
									(s: (typeof response.samples)[number]) => s.status === 'pending'
								).length}
								<div class="mb-3">
									{#if pendingCount > 0}
										<span class="text-sm text-amber-600">Pending ({pendingCount})...</span>
									{:else}
										<span class="text-sm text-red-500">Failed</span>
									{/if}
								</div>
							{/if}

							<!-- Justification preview -->
							{#if justification}
								<p class="text-sm text-slate-500 line-clamp-3 leading-relaxed">
									{justification}
								</p>
							{/if}

							<!-- Footer: sample count hint -->
							<div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
								<span class="text-xs text-slate-400">
									{response.complete_count} sample{response.complete_count === 1 ? '' : 's'}
								</span>
								<span
									class="text-xs text-slate-400 group-hover:text-slate-600 transition-colors flex items-center gap-1"
								>
									View all
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
									</svg>
								</span>
							</div>
						</button>
					{:else}
						<div class="col-span-full text-center py-12 text-slate-500">No responses from this model family.</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
				<p class="text-slate-500 mb-4">No responses yet for this question.</p>
				{#if data.isAdmin}
					<p class="text-sm text-gray-400 mb-4">Use the poll trigger below to get AI responses.</p>
				{:else}
					<p class="text-sm text-gray-400">Check back later for results.</p>
				{/if}
			</div>
		{/if}

		{#if data.isAdmin}
			<!-- Poll Trigger Section -->
			<div class="bg-white rounded-xl border border-slate-200 p-6 mb-8">
				<button
					onclick={() => (showPollTrigger = !showPollTrigger)}
					class="w-full flex items-center justify-between text-left"
				>
					<h3 class="font-semibold text-slate-900">Poll Models</h3>
					<svg
						class="w-5 h-5 text-gray-400 transition-transform {showPollTrigger ? 'rotate-180' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if showPollTrigger}
					<form method="POST" action="?/poll" use:enhance class="mt-4">
						<div class="flex items-center justify-between mb-4">
							<span class="text-sm text-gray-500">
								Select models to poll ({selectedModels.size} selected)
							</span>
							<button type="button" onclick={selectAllUnpolled} class="text-sm text-blue-600 hover:underline">
								Select all unpolled
							</button>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4 max-h-64 overflow-y-auto">
							{#each data.availableModels as model}
								{@const hasPolled = polledModelIds.has(model.id)}
								<label
									class="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer {hasPolled
										? 'opacity-60'
										: ''}"
								>
									<input
										type="checkbox"
										name="model_ids"
										value={model.id}
										checked={selectedModels.has(model.id)}
										onchange={() => toggleModelSelection(model.id)}
										class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span class="text-sm text-gray-700">{model.name}</span>
									{#if hasPolled}
										<span class="text-xs text-gray-400">(polled)</span>
									{/if}
								</label>
							{/each}
						</div>

						<div class="flex items-center gap-4">
							<div class="flex items-center gap-2">
								<label for="sample_count" class="text-sm text-gray-600">Samples per model:</label>
								<input
									type="number"
									id="sample_count"
									name="sample_count"
									bind:value={sampleCount}
									min="1"
									max="10"
									class="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<button
								type="submit"
								disabled={selectedModels.size === 0}
								class="px-4 py-2 rounded {selectedModels.size > 0
									? 'bg-blue-600 text-white hover:bg-blue-700'
									: 'bg-gray-200 text-gray-500 cursor-not-allowed'}"
							>
								Poll {selectedModels.size} Model{selectedModels.size === 1 ? '' : 's'} × {sampleCount} samples
							</button>
						</div>
					</form>
				{/if}
			</div>

			<!-- Poll History Section -->
			{#if data.allPolls.length > 0}
				<div class="bg-white rounded-xl border border-slate-200 p-6">
					<button
						onclick={() => (showPollHistory = !showPollHistory)}
						class="w-full flex items-center justify-between text-left"
					>
						<h3 class="font-semibold text-slate-900">Poll History ({data.allPolls.length} polls)</h3>
						<svg
							class="w-5 h-5 text-gray-400 transition-transform {showPollHistory ? 'rotate-180' : ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					{#if showPollHistory}
						<div class="mt-4 space-y-4">
							{#each Object.entries(pollsByModel) as [_modelId, polls]}
								{@const model = polls[0]}
								<div class="border rounded-lg overflow-hidden">
									<div class="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
										<span class="font-medium text-gray-900">{model.model_name}</span>
										<span class="px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-600">{model.model_family}</span>
										<span class="text-xs text-gray-500">({polls.length} poll{polls.length === 1 ? '' : 's'})</span>
									</div>
									<div class="divide-y">
										{#each polls as poll}
											<div class="px-4 py-3">
												<div class="flex items-center justify-between mb-1">
													<span class="text-sm text-gray-500">
														{new Date(poll.poll_created_at).toLocaleString()}
													</span>
													<span
														class="text-xs px-2 py-0.5 rounded {poll.poll_status === 'complete'
															? 'bg-green-100 text-green-700'
															: poll.poll_status === 'pending'
																? 'bg-yellow-100 text-yellow-700'
																: 'bg-red-100 text-red-700'}"
													>
														{poll.poll_status}
													</span>
												</div>
												{#if poll.parsed_answer}
													<div class="text-sm font-medium text-gray-700 mb-1">
														Answer: {poll.parsed_answer}
													</div>
												{/if}
												{#if poll.justification}
													<p class="text-sm text-gray-600 whitespace-pre-wrap">{poll.justification}</p>
												{/if}
												{#if poll.error}
													<p class="text-sm text-red-600">{poll.error}</p>
												{/if}
												{#if poll.response_time_ms}
													<p class="text-xs text-gray-400 mt-1">Response time: {poll.response_time_ms}ms</p>
												{/if}
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</main>
</div>

<!-- Sample details modal -->
{#if modalResponse}
	{@const sc = data.modelSelfConsistency[modalResponse.model_id]}
	{@const ha = data.modelHumanAlignment[modalResponse.model_id]}
	{@const ac = data.modelAiConsensus[modalResponse.model_id]}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
		onclick={() => (modalResponse = null)}
		onkeydown={(e) => e.key === 'Escape' && (modalResponse = null)}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<!-- Modal header -->
			<div class="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4">
				<div class="flex-1 min-w-0">
					<h3 class="text-lg font-semibold text-slate-900 truncate">{modalResponse.model_name}</h3>
					<div class="flex items-center gap-3 mt-2 flex-wrap">
						<span class="text-sm text-slate-500 capitalize">{modalResponse.model_family}</span>
						{#if ha !== undefined && ha !== null}
							<span
								class="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium"
								title="How closely this model's response distribution matches human responses"
							>
								{Math.round(ha)}% human
							</span>
						{/if}
						{#if ac !== undefined && ac !== null}
							<span
								class="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium"
								title="How closely this model's response distribution matches other AI models"
							>
								{Math.round(ac)}% AI
							</span>
						{/if}
						{#if sc !== undefined && sc !== null}
							<span
								class="text-xs px-2 py-1 rounded-full bg-violet-50 text-violet-700 font-medium"
								title="How consistently this model gives the same answer across samples"
							>
								{Math.round(sc)}% confidence
							</span>
						{/if}
					</div>
				</div>
				<button
					onclick={() => (modalResponse = null)}
					aria-label="Close modal"
					class="p-2 -m-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Modal answer summary -->
			{#if modalResponse.aggregated_answer}
				<div class="px-6 py-4 bg-slate-50 border-b border-slate-200">
					<div class="text-xs text-slate-500 uppercase tracking-wide mb-1">Modal Answer</div>
					<div class="font-medium text-slate-900">{getAnswerLabel(modalResponse.aggregated_answer)}</div>
				</div>
			{/if}

			<!-- Samples list -->
			<div class="flex-1 overflow-y-auto px-6 py-4">
				<div class="text-xs text-slate-500 uppercase tracking-wide mb-3">
					All Samples ({modalResponse.complete_count}/{modalResponse.sample_count})
				</div>
				<div class="space-y-4">
					{#each modalResponse.samples as sample, i}
						<div
							class="rounded-xl border {sample.status === 'complete'
								? 'border-slate-200 bg-white'
								: sample.status === 'pending'
									? 'border-amber-200 bg-amber-50'
									: 'border-red-200 bg-red-50'} p-4"
						>
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<span class="text-xs font-medium text-slate-500">Sample {i + 1}</span>
									{#if sample.parsed_answer}
										<span
											class="px-2 py-0.5 rounded text-xs font-medium {sample.parsed_answer ===
											modalResponse.aggregated_answer
												? 'bg-emerald-100 text-emerald-700'
												: 'bg-slate-100 text-slate-600'}"
										>
											{getAnswerLabel(sample.parsed_answer)}
										</span>
									{:else if sample.status === 'pending'}
										<span class="text-xs text-amber-600">Pending...</span>
									{:else}
										<span class="text-xs text-red-600">Failed</span>
									{/if}
								</div>
								{#if sample.response_time_ms}
									<span class="text-xs text-slate-400">{sample.response_time_ms}ms</span>
								{/if}
							</div>
							{#if sample.justification}
								<p class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{sample.justification}</p>
							{:else if sample.error}
								<p class="text-sm text-red-600">{sample.error}</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
