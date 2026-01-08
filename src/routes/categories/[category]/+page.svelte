<script lang="ts">
	// ABOUTME: Category detail page showing questions with full aggregate results.
	// ABOUTME: Displays AI vs Human distribution comparison for each question.

	import type { PageData } from './$types';
	import { getScoreLabel } from '$lib/alignment';
	import QuestionCard from '$lib/components/QuestionCard.svelte';

	let { data } = $props<{ data: PageData }>();

	type SortKey = 'default' | 'humanSimilarity' | 'aiConsensus' | 'aiConfidence';
	let sortBy = $state<SortKey>('default');

	const sortedQuestions = $derived.by(() => {
		if (sortBy === 'default') {
			return data.questions;
		}
		return [...data.questions].sort((a, b) => {
			const aVal = a[sortBy];
			const bVal = b[sortBy];
			if (aVal === null && bVal === null) return 0;
			if (aVal === null) return 1;
			if (bVal === null) return -1;
			return aVal - bVal;
		});
	});
</script>

<svelte:head>
	<title>{data.category} — Qualia Garden</title>
	<meta name="description" content="AI responses to {data.category} questions" />
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
					<a href="/questions" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Questions</a>
					<a href="/models" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Models</a>
					<a href="/map" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Map</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-6 py-8">
		<!-- Breadcrumb -->
		<div class="mb-8">
			<a href="/questions" class="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1.5 transition-colors">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				All Questions
			</a>
		</div>

		<!-- Category Header -->
		<div class="bg-white rounded-xl border border-slate-200 p-6 mb-8">
			<div class="flex items-start justify-between gap-6">
				<div class="flex-1">
					<h1 class="text-2xl font-bold text-slate-900 tracking-tight mb-2">{data.category}</h1>
					<p class="text-slate-500">
						{data.questionCount} question{data.questionCount === 1 ? '' : 's'}
					</p>
				</div>
				{#if data.overallHumanSimilarity !== null || data.overallAiConsensus !== null || data.overallAiConfidence !== null}
					<div class="flex gap-4 shrink-0">
						{#if data.overallHumanSimilarity !== null}
							<div class="text-center p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
								<div class="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">Alignment</div>
								<div class="text-2xl font-bold text-emerald-600">
									{data.overallHumanSimilarity}
								</div>
								<div class="text-xs text-emerald-500/70 font-medium">
									{getScoreLabel(data.overallHumanSimilarity)}
								</div>
							</div>
						{/if}
						{#if data.overallAiConsensus !== null}
							<div class="text-center p-3 rounded-lg bg-blue-50/50 border border-blue-100">
								<div class="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Consensus</div>
								<div class="text-2xl font-bold text-blue-600">
									{data.overallAiConsensus}
								</div>
								<div class="text-xs text-blue-500/70 font-medium">
									{getScoreLabel(data.overallAiConsensus)}
								</div>
							</div>
						{/if}
						{#if data.overallAiConfidence !== null}
							<div class="text-center p-3 rounded-lg bg-violet-50/50 border border-violet-100">
								<div class="text-xs text-violet-600 font-medium uppercase tracking-wide mb-1">Confidence</div>
								<div class="text-2xl font-bold text-violet-600">
									{data.overallAiConfidence}
								</div>
								<div class="text-xs text-violet-500/70 font-medium">
									{getScoreLabel(data.overallAiConfidence)}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Controls -->
		<div class="flex flex-wrap gap-4 items-center mb-6">
			<div class="flex items-center gap-2">
				<span class="text-sm text-slate-500">Sort by</span>
				<select
					bind:value={sortBy}
					class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
				>
					<option value="default">Default</option>
					<option value="humanSimilarity">Lowest Alignment</option>
					<option value="aiConsensus">Lowest AI Consensus</option>
					<option value="aiConfidence">Lowest AI Confidence</option>
				</select>
			</div>
			<div class="text-sm text-slate-400 ml-auto">
				{sortedQuestions.length} question{sortedQuestions.length === 1 ? '' : 's'}
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

	<footer class="border-t border-slate-200 py-8 px-6 mt-12">
		<div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
			<span>Qualia Garden</span>
			<span>Exploring AI values alignment</span>
		</div>
	</footer>
</div>
