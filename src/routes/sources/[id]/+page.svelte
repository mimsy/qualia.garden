<script lang="ts">
	// ABOUTME: Source detail page showing questions with full aggregate results.
	// ABOUTME: Displays AI vs Human distribution comparison for each question.

	import type { PageData } from './$types';
	import { marked } from 'marked';
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
	<title>{data.source.name} — Qualia Garden</title>
	<meta name="description" content="AI responses to questions from {data.source.name}" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
	<main class="max-w-6xl mx-auto px-6 py-8">
		<!-- Source Header Card -->
		<div class="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
			<!-- Body -->
			<div class="px-6 pt-5 pb-4">
				<div class="flex items-center gap-3 flex-wrap mb-3">
					<h1 class="text-2xl font-bold text-slate-900 tracking-tight">{data.source.name}</h1>
					<span class="px-2.5 py-1 bg-slate-100 text-slate-600 text-sm rounded-lg font-medium"
						>{data.source.short_name}</span
					>
				</div>
				<p class="text-slate-500 flex items-center gap-2 flex-wrap">
					{#if data.source.sample_size}
						<span>{data.source.sample_size.toLocaleString()} respondents</span>
					{/if}
					{#if data.source.year_range}
						<span class="text-slate-300">·</span>
						<span>{data.source.year_range}</span>
					{/if}
					{#if data.source.url}
						<span class="text-slate-300">·</span>
						<a
							href={data.source.url}
							target="_blank"
							rel="noopener"
							class="text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors">View source</a
						>
					{/if}
					<span class="text-slate-300">·</span>
					<span>{data.questionCount} question{data.questionCount === 1 ? '' : 's'}</span>
				</p>
			</div>

			<!-- About section (if description exists) -->
			{#if data.source.description}
				<div class="px-6 pb-4">
					<div class="prose prose-slate prose-sm max-w-none">
						{@html marked(data.source.description)}
					</div>
				</div>
			{/if}

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
				<QuestionCard {question} showCategory />
			{/each}
		</div>
		{#if sortedQuestions.length === 0}
			<div class="text-center py-16">
				<p class="text-slate-500">No questions in this source yet.</p>
			</div>
		{/if}
	</main>
</div>
