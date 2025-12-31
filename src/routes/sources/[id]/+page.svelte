<script lang="ts">
	// ABOUTME: Source detail page showing questions with agreement scores.
	// ABOUTME: Supports sorting by AI-human and AI consensus scores.

	import type { PageData } from './$types';
	import ScoreDisplay from '$lib/components/ScoreDisplay.svelte';
	import { getScoreLevel, getScoreLabel } from '$lib/alignment';

	let { data } = $props<{ data: PageData }>();

	type SortKey = 'default' | 'humanAiScore' | 'aiConsensusScore';
	let sortBy = $state<SortKey>('default');
	let selectedCategory = $state('');

	const filteredQuestions = $derived(() => {
		let qs = selectedCategory
			? data.questions.filter((q: { category: string | null }) => q.category === selectedCategory)
			: data.questions;

		if (sortBy === 'humanAiScore') {
			// Sort by lowest score first (most interesting disagreement)
			qs = [...qs].sort((a, b) => a.humanAiScore - b.humanAiScore);
		} else if (sortBy === 'aiConsensusScore') {
			// Sort by lowest consensus first (most AI disagreement)
			qs = [...qs].sort((a, b) => a.aiConsensusScore - b.aiConsensusScore);
		}

		return qs;
	});

	function formatMean(val: number | null): string {
		if (val === null) return '—';
		// Show as percentage for normalized 0-1 values
		return `${Math.round(val * 100)}%`;
	}

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
</script>

<svelte:head>
	<title>{data.source.name} - Qualia Garden</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b">
		<div class="max-w-6xl mx-auto px-4 py-6">
			<div class="flex items-center gap-4">
				<a href="/" class="text-gray-500 hover:text-gray-700">← Back</a>
				<div class="flex-1">
					<div class="flex items-center gap-3">
						<h1 class="text-xl font-bold text-gray-900">{data.source.name}</h1>
						<span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{data.source.short_name}</span>
					</div>
					<p class="text-sm text-gray-500 mt-1">
						{#if data.source.sample_size}
							{data.source.sample_size.toLocaleString()} respondents
						{/if}
						{#if data.source.year_range}
							• {data.source.year_range}
						{/if}
						{#if data.source.url}
							• <a href={data.source.url} target="_blank" rel="noopener" class="text-blue-600 hover:underline">Source</a>
						{/if}
					</p>
				</div>
				{#if data.overallScore !== null}
					<div class="text-right">
						<ScoreDisplay score={data.overallScore} label="AI-Human Agreement" size="lg" />
						<div class="text-xs text-gray-400 mt-1">{data.modelCount} models</div>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-8">
		<!-- Controls -->
		<div class="flex flex-wrap gap-4 items-center mb-6">
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-600">Sort by:</span>
				<select
					bind:value={sortBy}
					class="text-sm border rounded px-2 py-1"
				>
					<option value="default">Default</option>
					<option value="humanAiScore">Lowest AI-Human Agreement</option>
					<option value="aiConsensusScore">Lowest AI Consensus</option>
				</select>
			</div>
			{#if data.categories && data.categories.length > 1}
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-600">Category:</span>
					<select
						bind:value={selectedCategory}
						class="text-sm border rounded px-2 py-1"
					>
						<option value="">All</option>
						{#each data.categories as cat}
							<option value={cat}>{cat}</option>
						{/each}
					</select>
				</div>
			{/if}
			<div class="text-sm text-gray-500">
				{filteredQuestions().length} question{filteredQuestions().length === 1 ? '' : 's'}
			</div>
		</div>

		<!-- Questions List -->
		<div class="space-y-4">
			{#each filteredQuestions() as question}
				<a
					href="/questions/{question.id}"
					class="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
				>
					<div class="flex items-start gap-4">
						<div class="flex-1">
							<div class="text-gray-900 mb-2">{question.text}</div>
							{#if question.category}
								<span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{question.category}</span>
							{/if}
						</div>
						<div class="flex gap-6 shrink-0">
							<!-- AI-Human Agreement Score -->
							<div class="text-center w-24">
								<div class="text-xs text-gray-500 mb-1">AI-Human</div>
								{#if question.humanAiScore > 0}
									<div class="text-lg font-semibold {getScoreColor(question.humanAiScore)}">
										{question.humanAiScore.toFixed(1)}/5
									</div>
									<div class="text-xs {getScoreColor(question.humanAiScore)}">{getScoreLabel(question.humanAiScore)}</div>
								{:else}
									<div class="text-lg text-gray-300">—</div>
								{/if}
							</div>
							<!-- AI Consensus Score -->
							<div class="text-center w-24">
								<div class="text-xs text-gray-500 mb-1">AI Consensus</div>
								{#if question.modelCount >= 2}
									<div class="text-lg font-semibold {getScoreColor(question.aiConsensusScore)}">
										{question.aiConsensusScore.toFixed(1)}/5
									</div>
									<div class="text-xs {getScoreColor(question.aiConsensusScore)}">{getScoreLabel(question.aiConsensusScore)}</div>
								{:else}
									<div class="text-lg text-gray-300">—</div>
								{/if}
							</div>
						</div>
					</div>

					<!-- Summary row -->
					{#if question.modelCount > 0}
						<div class="mt-3 pt-3 border-t text-sm text-gray-600 flex gap-6">
							{#if question.responseType === 'ordinal'}
								<div>
									<span class="text-gray-400">Human avg:</span>
									<span class="font-medium">{formatMean(question.humanMean)}</span>
								</div>
								<div>
									<span class="text-gray-400">AI avg:</span>
									<span class="font-medium">{formatMean(question.aiMean)}</span>
								</div>
							{:else}
								{#if question.humanMode}
									<div>
										<span class="text-gray-400">Human:</span>
										<span class="font-medium">{question.humanMode}</span>
									</div>
								{/if}
								{#if question.aiMode}
									<div>
										<span class="text-gray-400">AI:</span>
										<span class="font-medium">{question.aiMode}</span>
									</div>
								{/if}
							{/if}
							<div>
								<span class="text-gray-400">{question.modelCount} model{question.modelCount === 1 ? '' : 's'}</span>
							</div>
						</div>
					{:else}
						<div class="mt-3 pt-3 border-t text-sm text-gray-400">
							No AI responses yet
						</div>
					{/if}
				</a>
			{:else}
				<div class="text-center py-12 text-gray-500">
					No questions in this source yet.
				</div>
			{/each}
		</div>
	</main>
</div>
