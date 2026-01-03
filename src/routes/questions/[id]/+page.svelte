<script lang="ts">
	// ABOUTME: Question results page with admin capabilities.
	// ABOUTME: Shows aggregate results, human comparison, per-model responses, and admin tools.

	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { getScoreLevel, getScoreLabel } from '$lib/alignment';

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

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	type ResponseType = (typeof data.responses)[number];
	type HumanDistribution = (typeof data.humanDistributions)[number];
	type PollType = (typeof data.allPolls)[number];

	let selectedFamily = $state<string | null>(null);
	let expandedModel = $state<string | null>(null);
	let selectedContinent = $state<string | null>(null);
	let selectedEducation = $state<string | null>(null);
	let selectedAgeGroup = $state<string | null>(null);
	let selectedGender = $state<string | null>(null);
	let showPollHistory = $state(false);
	let showPollTrigger = $state(false);
	let selectedModels = $state<Set<string>>(new Set());

	// Edit form state
	let editText = $state(data.question.text);
	let editCategory = $state(data.question.category || '');
	let editResponseType = $state(data.question.response_type);
	let editOptionsList = $state<string[]>(data.options || ['']);

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

	// Filter responses by family
	const filteredResponses = $derived(
		selectedFamily
			? data.responses.filter((r: ResponseType) => r.model_family === selectedFamily)
			: data.responses
	);

	// Get selected human distribution based on filters
	const selectedHumanDist = $derived(() => {
		if (!data.humanDistributions.length) return null;
		return data.humanDistributions.find(
			(d: HumanDistribution) =>
				d.continent === selectedContinent &&
				d.education_level === selectedEducation &&
				d.settlement_type === null &&
				d.age_group === selectedAgeGroup &&
				d.gender === selectedGender
		);
	});

	// Parse human distribution to aggregated format
	const humanAggregateResults = $derived(() => {
		const dist = selectedHumanDist();
		if (!dist) return [];

		const parsed = JSON.parse(dist.distribution) as Record<string, number>;
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

	function toggleExpanded(modelId: string) {
		expandedModel = expandedModel === modelId ? null : modelId;
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
	const pollsByModel = $derived(() => {
		const grouped: Record<string, PollType[]> = {};
		for (const poll of data.allPolls) {
			if (!grouped[poll.model_id]) grouped[poll.model_id] = [];
			grouped[poll.model_id].push(poll);
		}
		return grouped;
	});

	// Models that have already been polled
	const polledModelIds = $derived(new Set(data.allPolls.map((p: PollType) => p.model_id)));

	function toggleModelSelection(modelId: string) {
		const newSet = new Set(selectedModels);
		if (newSet.has(modelId)) {
			newSet.delete(modelId);
		} else {
			newSet.add(modelId);
		}
		selectedModels = newSet;
	}

	type ModelType = (typeof data.availableModels)[number];

	function selectAllUnpolled() {
		selectedModels = new Set(
			data.availableModels.filter((m: ModelType) => !polledModelIds.has(m.id)).map((m: ModelType) => m.id)
		);
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
	<title>{data.question.text.slice(0, 50)}... - Qualia Garden</title>
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
					<a href="/questions" class="text-gray-600 hover:text-gray-900">All Questions</a>
					<a href="/models" class="text-gray-600 hover:text-gray-900">Models</a>
					<a href="/map" class="text-gray-600 hover:text-gray-900">Model Map</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-12">
		<div class="mb-8">
			<a href="/questions" class="text-blue-600 hover:underline text-sm">← Back to questions</a>
		</div>

		{#if form?.error}
			<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
				{form.error}
			</div>
		{/if}

		{#if data.isAdmin && data.question.status !== 'published'}
			<div class="mb-4 p-4 rounded-lg {data.question.status === 'draft' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}">
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

					<div>
						<input type="hidden" name="options" value={serializedOptions} />
						<div class="flex items-center justify-between mb-2">
							<label class="block text-sm font-medium text-gray-700">
								{#if editResponseType === 'ordinal'}
									Options (ordered scale, first = lowest)
								{:else}
									Options (unordered choices)
								{/if}
							</label>
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
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								{/each}
								<div class="text-xs text-gray-500 mt-2">
									Options are ordered — first option is lowest on the scale
								</div>
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
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								{/each}
								<div class="text-xs text-gray-500 mt-2">
									Options are unordered — no inherent ranking or scale
								</div>
							</div>
						{/if}
					</div>

					<div class="flex justify-end">
						<button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
							Save Draft
						</button>
					</div>
				</div>
			</form>
		{:else}
			<!-- Read-only view -->
			<div class="bg-white rounded-lg shadow p-8 mb-8">
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<div class="mb-4 flex items-center gap-2">
							{#if data.question.category}
								<span class="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
									{data.question.category}
								</span>
							{/if}
							{#if data.isAdmin}
								<span class="px-2 py-1 rounded text-xs {getStatusBadgeClass(data.question.status)}">
									{data.question.status}
								</span>
							{/if}
						</div>
						<h2 class="text-2xl font-bold text-gray-900 mb-4">
							{data.question.text}
						</h2>
						<div class="text-sm text-gray-500">
							{data.question.response_type.replace('_', ' ')} •
							{data.totalResponses} response{data.totalResponses === 1 ? '' : 's'}
						</div>
					</div>
					{#if data.isAdmin && data.question.status === 'published'}
						<form method="POST" action="?/archive" use:enhance>
							<button type="submit" class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded">
								Archive
							</button>
						</form>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Scores Summary Section -->
		{#if data.totalResponses > 0 && (data.humanAiScore !== null || data.aiAgreementScore !== null)}
			{@const selfConsistencyValues = Object.values(data.modelSelfConsistency).filter((v): v is number => v !== null)}
			{@const avgSelfConsistency = selfConsistencyValues.length > 0
				? selfConsistencyValues.reduce((a: number, b: number) => a + b, 0) / selfConsistencyValues.length
				: null}
			<div class="bg-white rounded-lg shadow p-6 mb-8">
				<h3 class="font-bold text-gray-900 mb-4">Scores</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<!-- AI-Human Agreement -->
					<div class="text-center">
						<div class="text-sm text-gray-500 mb-2">AI-Human Agreement</div>
						{#if data.humanAiScore !== null}
							<div class="text-3xl font-bold {getScoreColor(data.humanAiScore)}">
								{Math.round(data.humanAiScore)}%
							</div>
							<div class="text-xs text-gray-400 mt-1">{getScoreLabel(data.humanAiScore)}</div>
							<div class="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
								<div
									class="h-full {getScoreBgColor(data.humanAiScore)} rounded-full transition-all"
									style="width: {data.humanAiScore}%"
								></div>
							</div>
						{:else}
							<div class="text-2xl text-gray-300">—</div>
							<div class="text-xs text-gray-400 mt-1">No human data</div>
						{/if}
					</div>

					<!-- AI Agreement -->
					<div class="text-center">
						<div class="text-sm text-gray-500 mb-2">AI Agreement</div>
						{#if data.aiConsensusScore !== null}
							<div class="text-3xl font-bold {getScoreColor(data.aiConsensusScore)}">
								{Math.round(data.aiConsensusScore)}%
							</div>
							<div class="text-xs text-gray-400 mt-1">{getScoreLabel(data.aiConsensusScore)}</div>
							<div class="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
								<div
									class="h-full {getScoreBgColor(data.aiConsensusScore)} rounded-full transition-all"
									style="width: {data.aiConsensusScore}%"
								></div>
							</div>
						{:else}
							<div class="text-2xl text-gray-300">—</div>
							<div class="text-xs text-gray-400 mt-1">Need 2+ models</div>
						{/if}
					</div>

					<!-- Average Self-Consistency -->
					<div class="text-center">
						<div class="text-sm text-gray-500 mb-2">Avg Self-Consistency</div>
						{#if avgSelfConsistency !== null}
							<div class="text-3xl font-bold {getScoreColor(avgSelfConsistency)}">
								{Math.round(avgSelfConsistency)}%
							</div>
							<div class="text-xs text-gray-400 mt-1">{getScoreLabel(avgSelfConsistency)}</div>
							<div class="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
								<div
									class="h-full {getScoreBgColor(avgSelfConsistency)} rounded-full transition-all"
									style="width: {avgSelfConsistency}%"
								></div>
							</div>
						{:else}
							<div class="text-2xl text-gray-300">—</div>
							<div class="text-xs text-gray-400 mt-1">No data</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		{#if data.benchmarkSource}
			<!-- Comparison View: AI vs Human -->
			<div class="bg-white rounded-lg shadow p-6 mb-8">
				<div class="flex flex-wrap items-center justify-between gap-4 mb-6">
					<h3 class="font-bold text-gray-900">AI vs Human Comparison</h3>
					<div class="flex flex-wrap gap-2 items-center text-sm">
						<span class="text-gray-500">Filter humans by:</span>
						{#if data.continents.length > 0}
							<select
								bind:value={selectedContinent}
								class="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value={null}>All Regions</option>
								{#each data.continents as continent}
									<option value={continent}>{continent}</option>
								{/each}
							</select>
						{/if}
						{#if data.educationLevels.length > 0}
							<select
								bind:value={selectedEducation}
								class="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value={null}>All Education</option>
								{#each data.educationLevels as level}
									<option value={level}>{level}</option>
								{/each}
							</select>
						{/if}
						{#if data.ageGroups.length > 0}
							<select
								bind:value={selectedAgeGroup}
								class="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value={null}>All Ages</option>
								{#each data.ageGroups as age}
									<option value={age}>{age}</option>
								{/each}
							</select>
						{/if}
						{#if data.genders.length > 0}
							<select
								bind:value={selectedGender}
								class="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value={null}>All Genders</option>
								{#each data.genders as g}
									<option value={g}>{g}</option>
								{/each}
							</select>
						{/if}
					</div>
				</div>

				{#if humanAggregateResults().length > 0 || data.totalResponses > 0}
				{@const humanResults = humanAggregateResults()}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<!-- AI Results -->
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
								{#if selectedHumanDist()}
									<span class="text-xs text-gray-500">({selectedHumanDist()?.sample_size.toLocaleString()} respondents)</span>
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
								<div class="text-center py-8 text-gray-400 text-sm">
									No human data for this filter combination
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="text-center py-8 text-gray-500">
						No response data available yet.
					</div>
				{/if}

				<div class="mt-6 pt-4 border-t text-xs text-gray-400">
					Human data from {data.benchmarkSource.name}
					{#if data.benchmarkSource.year_range}
						({data.benchmarkSource.year_range})
					{/if}
					{#if data.benchmarkSource.url}
						· <a href={data.benchmarkSource.url} target="_blank" rel="noopener" class="text-blue-500 hover:underline">Source</a>
					{/if}
				</div>
			</div>
		{:else if data.totalResponses > 0}
			<!-- Standard View: No human comparison -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				<div class="bg-white rounded-lg shadow p-6">
					<h3 class="font-bold text-gray-900 mb-6">Aggregate Results</h3>
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
									<div
										class="h-full bg-blue-500 rounded-full transition-all"
										style="width: {result.percentage}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				{#if data.options}
					<div class="bg-white rounded-lg shadow p-6">
						<h3 class="font-bold text-gray-900 mb-4">Answer Options</h3>
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

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between mb-6">
					<h3 class="font-bold text-gray-900">Individual Responses</h3>
					<div class="flex gap-2">
						<button
							onclick={() => (selectedFamily = null)}
							class="px-3 py-1 text-sm rounded {selectedFamily === null
								? 'bg-blue-100 text-blue-700'
								: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
						>
							All
						</button>
						{#each families as family}
							<button
								onclick={() => (selectedFamily = family)}
								class="px-3 py-1 text-sm rounded capitalize {selectedFamily === family
									? 'bg-blue-100 text-blue-700'
									: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
							>
								{family}
							</button>
						{/each}
					</div>
				</div>

				<div class="space-y-3">
					{#each filteredResponses as response}
						<div class="border rounded-lg overflow-hidden">
							<button
								onclick={() => toggleExpanded(response.model_id)}
								class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
							>
								<div class="flex items-center gap-3">
									<span class="font-medium text-gray-900">{response.model_name}</span>
									<span class="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 capitalize">
										{response.model_family}
									</span>
									{#if response.sample_count > 1}
										<span class="px-2 py-0.5 bg-blue-50 rounded text-xs text-blue-600">
											{response.complete_count}/{response.sample_count} samples
										</span>
									{/if}
								</div>
								<div class="flex items-center gap-4">
									{#if data.modelSelfConsistency[response.model_id] !== undefined}
										{@const sc = data.modelSelfConsistency[response.model_id]}
										<span class="text-xs {getScoreColor(sc)}" title="Self-consistency: {Math.round(sc)}%">
											{Math.round(sc)}%
										</span>
									{/if}
									{#if response.complete_count > 0 && response.aggregated_answer}
										<span class="text-sm font-medium text-gray-700">
											{getAnswerLabel(response.aggregated_answer)}
										</span>
									{:else if response.complete_count === 0 && response.sample_count > 0}
										{@const pendingCount = response.samples.filter((s: typeof response.samples[number]) => s.status === 'pending').length}
										{#if pendingCount > 0}
											<span class="text-sm text-yellow-600">Pending ({pendingCount})...</span>
										{:else}
											<span class="text-sm text-red-600">Failed</span>
										{/if}
									{:else}
										<span class="text-sm text-gray-400">No answer</span>
									{/if}
									<svg
										class="w-5 h-5 text-gray-400 transition-transform {expandedModel ===
										response.model_id
											? 'rotate-180'
											: ''}"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</button>
							{#if expandedModel === response.model_id}
								<div class="px-4 py-3 bg-gray-50 border-t space-y-3">
									{#each response.samples as sample, i}
										<div class="border-l-2 pl-3 {sample.status === 'complete' ? 'border-green-300' : sample.status === 'pending' ? 'border-yellow-300' : 'border-red-300'}">
											<div class="flex items-center gap-2 mb-1">
												<span class="text-xs text-gray-500">Sample {i + 1}</span>
												{#if sample.parsed_answer}
													<span class="text-sm font-medium text-gray-700">
														{getAnswerLabel(sample.parsed_answer)}
													</span>
												{:else if sample.status === 'pending'}
													<span class="text-xs text-yellow-600">Pending...</span>
												{:else}
													<span class="text-xs text-red-600">Failed</span>
												{/if}
												{#if sample.response_time_ms}
													<span class="text-xs text-gray-400 ml-auto">{sample.response_time_ms}ms</span>
												{/if}
											</div>
											{#if sample.justification}
												<p class="text-sm text-gray-600 whitespace-pre-wrap">{sample.justification}</p>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{:else}
						<div class="text-center py-8 text-gray-500">
							No responses from this model family.
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="bg-white rounded-lg shadow p-12 text-center">
				<p class="text-gray-500 mb-4">No responses yet for this question.</p>
				{#if data.isAdmin}
					<p class="text-sm text-gray-400 mb-4">
						Use the poll trigger below to get AI responses.
					</p>
				{:else}
					<p class="text-sm text-gray-400">
						Check back later for results.
					</p>
				{/if}
			</div>
		{/if}

		{#if data.isAdmin}
			<!-- Poll Trigger Section -->
			<div class="bg-white rounded-lg shadow p-6 mb-8">
				<button
					onclick={() => (showPollTrigger = !showPollTrigger)}
					class="w-full flex items-center justify-between text-left"
				>
					<h3 class="font-bold text-gray-900">Poll Models</h3>
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
							<button
								type="button"
								onclick={selectAllUnpolled}
								class="text-sm text-blue-600 hover:underline"
							>
								Select all unpolled
							</button>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4 max-h-64 overflow-y-auto">
							{#each data.availableModels as model}
								{@const hasPolled = polledModelIds.has(model.id)}
								<label
									class="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer {hasPolled ? 'opacity-60' : ''}"
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
				<div class="bg-white rounded-lg shadow p-6">
					<button
						onclick={() => (showPollHistory = !showPollHistory)}
						class="w-full flex items-center justify-between text-left"
					>
						<h3 class="font-bold text-gray-900">Poll History ({data.allPolls.length} polls)</h3>
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
							{#each Object.entries(pollsByModel()) as [modelId, polls]}
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
													<span class="text-xs px-2 py-0.5 rounded {poll.poll_status === 'complete'
														? 'bg-green-100 text-green-700'
														: poll.poll_status === 'pending'
															? 'bg-yellow-100 text-yellow-700'
															: 'bg-red-100 text-red-700'}">
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
