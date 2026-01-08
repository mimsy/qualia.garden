<script lang="ts">
	// ABOUTME: Category detail page showing questions with full aggregate results.
	// ABOUTME: Displays AI vs Human distribution comparison for each question.

	import type { PageData } from './$types';
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	import ScoreBadge from '$lib/components/ScoreBadge.svelte';

	let { data } = $props<{ data: PageData }>();

	type SortKey = 'newest' | 'humanSimilarity' | 'aiConsensus' | 'aiConfidence';
	let sortBy = $state<SortKey>('newest');
	let sortAsc = $state(true);

	const sortedQuestions = $derived.by(() => {
		const qs = [...data.questions];
		if (sortBy === 'newest') {
			return qs.sort((a, b) => {
				const cmp = b.createdAt.localeCompare(a.createdAt);
				return sortAsc ? cmp : -cmp;
			});
		}
		// For score sorts: nulls always go to bottom
		return qs.sort((a, b) => {
			const aVal = a[sortBy];
			const bVal = b[sortBy];
			if (aVal === null && bVal === null) return 0;
			if (aVal === null) return 1;
			if (bVal === null) return -1;
			// sortAsc true = lowest first (ascending)
			return sortAsc ? aVal - bVal : bVal - aVal;
		});
	});
</script>

<svelte:head>
	<title>{data.category} — Qualia Garden</title>
	<meta name="description" content={data.description ?? `AI responses to ${data.category} questions`} />
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
					<a
						href="/models"
						class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
						>Models</a
					>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-6 py-8">
		<!-- Category Header Card -->
		<div class="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
			<!-- Body -->
			<div class="px-6 pt-5 pb-4">
				<h1 class="text-2xl font-bold text-slate-900 tracking-tight mb-2">{data.category}</h1>
				{#if data.description}
					<p class="text-slate-600 mb-3">{data.description}</p>
				{/if}
				<p class="text-slate-500 text-sm">
					{data.questionCount} question{data.questionCount === 1 ? '' : 's'}
				</p>
			</div>

			<!-- Score bars footer -->
			{#if data.overallHumanSimilarity !== null || data.overallAiConsensus !== null || data.overallAiConfidence !== null}
				<div class="flex border-t border-slate-100">
					<ScoreBadge
						score={data.overallHumanSimilarity}
						label="Alignment"
						type="humanSimilarity"
						context="aggregate"
					/>
					<div class="w-px bg-slate-100"></div>
					<ScoreBadge score={data.overallAiConsensus} label="Consensus" type="aiConsensus" context="aggregate" />
					<div class="w-px bg-slate-100"></div>
					<ScoreBadge score={data.overallAiConfidence} label="Confidence" type="aiConfidence" context="aggregate" />
				</div>
			{/if}
		</div>

		<!-- Controls -->
		<div class="flex flex-wrap gap-4 items-center justify-end mb-6">
			<div class="flex items-center gap-2">
				<span class="text-sm text-slate-500">Sort by</span>
				<select
					bind:value={sortBy}
					class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
				>
					<option value="newest">Date</option>
					<option value="humanSimilarity">Alignment</option>
					<option value="aiConsensus">AI Consensus</option>
					<option value="aiConfidence">AI Confidence</option>
				</select>
				<button
					onclick={() => (sortAsc = !sortAsc)}
					class="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
					title={sortAsc ? 'Ascending' : 'Descending'}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if sortAsc}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						{/if}
					</svg>
				</button>
			</div>
		</div>

		<!-- Questions with Full Results -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
			{#each sortedQuestions as question (question.id)}
				<QuestionCard {question} showSource />
			{/each}
		</div>
		{#if sortedQuestions.length === 0}
			<div class="text-center py-16">
				<p class="text-slate-500">No questions in this category.</p>
			</div>
		{/if}
	</main>
</div>
