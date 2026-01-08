<script lang="ts">
	// ABOUTME: Source detail page showing questions with full aggregate results.
	// ABOUTME: Displays AI vs Human distribution comparison for each question.

	import type { PageData } from './$types';
	import type { QuestionWithStats } from '$lib/db/question-stats';
	import { marked } from 'marked';
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	import ScoreBadge from '$lib/components/ScoreBadge.svelte';

	let { data } = $props<{ data: PageData }>();

	type SortKey = 'default' | 'humanSimilarity' | 'aiConsensus' | 'aiConfidence';
	let sortBy = $state<SortKey>('default');
	let selectedCategory = $state('');

	type ScoreKey = 'humanSimilarity' | 'aiConsensus' | 'aiConfidence';

	const filteredQuestions = $derived.by(() => {
		let qs: QuestionWithStats[] = selectedCategory
			? data.questions.filter((q: QuestionWithStats) => q.category === selectedCategory)
			: data.questions;

		if (sortBy === 'default') {
			return qs;
		}
		const key = sortBy as ScoreKey;
		return [...qs].sort((a, b) => {
			const aVal = a[key];
			const bVal = b[key];
			if (aVal === null && bVal === null) return 0;
			if (aVal === null) return 1;
			if (bVal === null) return -1;
			return aVal - bVal;
		});
	});
</script>

<svelte:head>
	<title>{data.source.name} — Qualia Garden</title>
	<meta name="description" content="AI responses to questions from {data.source.name}" />
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
		<!-- Source Header Card -->
		<div class="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
			<!-- Header bar with category count -->
			{#if data.categories && data.categories.length > 1}
				<div class="flex border-b border-slate-100 text-xs">
					<div class="py-2 px-5 text-slate-500">
						<span class="text-slate-400">Categories:</span> {data.categories.length}
					</div>
				</div>
			{/if}

			<!-- Body -->
			<div class="px-6 pt-5 pb-4">
				<div class="flex items-center gap-3 flex-wrap mb-3">
					<h1 class="text-2xl font-bold text-slate-900 tracking-tight">{data.source.name}</h1>
					<span class="px-2.5 py-1 bg-slate-100 text-slate-600 text-sm rounded-lg font-medium">{data.source.short_name}</span>
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
						<a href={data.source.url} target="_blank" rel="noopener" class="text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors">View source</a>
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
					<ScoreBadge score={data.overallHumanSimilarity} label="Alignment" type="humanSimilarity" />
					<div class="w-px bg-slate-100"></div>
					<ScoreBadge score={data.overallAiConsensus} label="Consensus" type="aiConsensus" />
					<div class="w-px bg-slate-100"></div>
					<ScoreBadge score={data.overallAiConfidence} label="Confidence" type="aiConfidence" />
				</div>
			{/if}
		</div>

		<!-- Controls -->
		<div class="flex flex-wrap gap-4 items-center mb-6">
			<div class="flex items-center gap-2">
				<span class="text-sm text-slate-500">Sort by</span>
				<select
					bind:value={sortBy}
					class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					<option value="default">Default</option>
					<option value="humanSimilarity">Lowest Alignment</option>
					<option value="aiConsensus">Lowest AI Consensus</option>
					<option value="aiConfidence">Lowest AI Confidence</option>
				</select>
			</div>
			{#if data.categories && data.categories.length > 1}
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">Category</span>
					<select
						bind:value={selectedCategory}
						class="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="">All</option>
						{#each data.categories as cat (cat)}
							<option value={cat}>{cat}</option>
						{/each}
					</select>
				</div>
			{/if}
			<div class="text-sm text-slate-400 ml-auto">
				{filteredQuestions.length} question{filteredQuestions.length === 1 ? '' : 's'}
			</div>
		</div>

		<!-- Questions with Full Results -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
			{#each filteredQuestions as question (question.id)}
				<QuestionCard {question} showCategory />
			{/each}
		</div>
		{#if filteredQuestions.length === 0}
			<div class="text-center py-16">
				<p class="text-slate-500">No questions in this source yet.</p>
			</div>
		{/if}
	</main>
</div>
