<script lang="ts">
	// ABOUTME: Source detail page showing questions with agreement scores.
	// ABOUTME: Supports sorting by AI-human and AI agreement scores.

	import type { PageData } from './$types';
	import { getScoreLevel, getScoreLabel } from '$lib/alignment';
	import { marked } from 'marked';

	let { data } = $props<{ data: PageData }>();

	type SortKey = 'default' | 'humanAiScore' | 'aiAgreementScore';
	let sortBy = $state<SortKey>('default');
	let selectedCategory = $state('');

	const filteredQuestions = $derived(() => {
		let qs = selectedCategory
			? data.questions.filter((q: { category: string | null }) => q.category === selectedCategory)
			: data.questions;

		if (sortBy === 'humanAiScore') {
			qs = [...qs].sort((a, b) => a.humanAiScore - b.humanAiScore);
		} else if (sortBy === 'aiAgreementScore') {
			qs = [...qs].sort((a, b) => a.aiAgreementScore - b.aiAgreementScore);
		}

		return qs;
	});

	function getClosestOption(normalizedMean: number | null, options: string[]): string {
		if (normalizedMean === null || options.length === 0) return '—';
		if (options.length === 1) return options[0];
		// Convert normalized mean (0-1) back to option index
		const index = Math.round(normalizedMean * (options.length - 1));
		const clampedIndex = Math.max(0, Math.min(options.length - 1, index));
		return options[clampedIndex];
	}

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
		<!-- Breadcrumb -->
		<div class="mb-8">
			<a href="/" class="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1.5 transition-colors">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				All Sources
			</a>
		</div>

		<!-- Source Header -->
		<div class="bg-white rounded-xl border border-slate-200 p-6 mb-8">
			<div class="flex items-start justify-between gap-6">
				<div class="flex-1">
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
					</p>
				</div>
				{#if data.overallScore !== null || data.overallAiAgreement !== null}
					<div class="flex gap-6 shrink-0">
						{#if data.overallScore !== null}
							<div class="text-center">
								<div class="text-xs text-slate-500 mb-1">AI-Human</div>
								<div class="text-2xl font-bold {getScoreColor(data.overallScore)}">
									{Math.round(data.overallScore)}
								</div>
								<div class="text-xs {getScoreColor(data.overallScore)} font-medium">
									{getScoreLabel(data.overallScore)}
								</div>
							</div>
						{/if}
						{#if data.overallAiAgreement !== null}
							<div class="text-center">
								<div class="text-xs text-slate-500 mb-1">AI Agreement</div>
								<div class="text-2xl font-bold {getScoreColor(data.overallAiAgreement)}">
									{Math.round(data.overallAiAgreement)}
								</div>
								<div class="text-xs {getScoreColor(data.overallAiAgreement)} font-medium">
									{getScoreLabel(data.overallAiAgreement)}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- About This Survey -->
		{#if data.source.description}
			<div class="bg-white rounded-xl border border-slate-200 p-6 mb-8">
				<h2 class="text-lg font-semibold text-slate-900 mb-4">About This Survey</h2>
				<div class="prose prose-slate prose-sm max-w-none">
					{@html marked(data.source.description)}
				</div>
			</div>
		{/if}

		<!-- Controls -->
		<div class="flex flex-wrap gap-4 items-center mb-6">
			<div class="flex items-center gap-2">
				<span class="text-sm text-slate-500">Sort by</span>
				<select
					bind:value={sortBy}
					class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
				>
					<option value="default">Default</option>
					<option value="humanAiScore">Lowest AI-Human Agreement</option>
					<option value="aiAgreementScore">Lowest AI Agreement</option>
				</select>
			</div>
			{#if data.categories && data.categories.length > 1}
				<div class="flex items-center gap-2">
					<span class="text-sm text-slate-500">Category</span>
					<select
						bind:value={selectedCategory}
						class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
					>
						<option value="">All</option>
						{#each data.categories as cat}
							<option value={cat}>{cat}</option>
						{/each}
					</select>
				</div>
			{/if}
			<div class="text-sm text-slate-400 ml-auto">
				{filteredQuestions().length} question{filteredQuestions().length === 1 ? '' : 's'}
			</div>
		</div>

		<!-- Questions List -->
		<div class="space-y-4">
			{#each filteredQuestions() as question}
				<a
					href="/questions/{question.id}"
					class="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-200 group"
				>
					<div class="flex items-start gap-6">
						<div class="flex-1 min-w-0">
							<p class="text-slate-800 mb-3 leading-relaxed group-hover:text-slate-700 transition-colors">{question.text}</p>
							{#if question.category}
								<span class="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{question.category}</span>
							{/if}
						</div>
						<div class="flex gap-6 shrink-0">
							<!-- AI-Human Agreement Score -->
							<div class="text-center w-20">
								<div class="text-xs text-slate-400 mb-1.5">AI-Human</div>
								{#if question.humanAiScore > 0}
									<div class="text-xl font-bold {getScoreColor(question.humanAiScore)}">
										{Math.round(question.humanAiScore)}
									</div>
									<div class="text-xs {getScoreColor(question.humanAiScore)} font-medium">{getScoreLabel(question.humanAiScore)}</div>
								{:else}
									<div class="text-xl text-slate-200">—</div>
								{/if}
							</div>
							<!-- AI Agreement Score -->
							<div class="text-center w-20">
								<div class="text-xs text-slate-400 mb-1.5">AI Agreement</div>
								{#if question.modelCount >= 2}
									<div class="text-xl font-bold {getScoreColor(question.aiAgreementScore)}">
										{Math.round(question.aiAgreementScore)}
									</div>
									<div class="text-xs {getScoreColor(question.aiAgreementScore)} font-medium">{getScoreLabel(question.aiAgreementScore)}</div>
								{:else}
									<div class="text-xl text-slate-200">—</div>
								{/if}
							</div>
						</div>
					</div>

					<!-- Summary row -->
					{#if question.modelCount > 0}
						<div class="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500 flex gap-6 flex-wrap">
							{#if question.responseType === 'ordinal'}
								<div>
									<span class="text-slate-400">Human:</span>
									<span class="font-medium text-slate-600">{getClosestOption(question.humanMean, question.options)}</span>
								</div>
								<div>
									<span class="text-slate-400">AI:</span>
									<span class="font-medium text-slate-600">{getClosestOption(question.aiMean, question.options)}</span>
								</div>
							{:else}
								{#if question.humanMode}
									<div>
										<span class="text-slate-400">Human:</span>
										<span class="font-medium text-slate-600">{question.humanMode}</span>
									</div>
								{/if}
								{#if question.aiMode}
									<div>
										<span class="text-slate-400">AI:</span>
										<span class="font-medium text-slate-600">{question.aiMode}</span>
									</div>
								{/if}
							{/if}
							<div class="text-slate-400">
								{question.modelCount} model{question.modelCount === 1 ? '' : 's'}
							</div>
						</div>
					{:else}
						<div class="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-400">
							No AI responses yet
						</div>
					{/if}
				</a>
			{:else}
				<div class="text-center py-16">
					<p class="text-slate-500">No questions in this source yet.</p>
				</div>
			{/each}
		</div>
	</main>

	<footer class="border-t border-slate-200 py-8 px-6 mt-12">
		<div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
			<span>Qualia Garden</span>
			<span>Exploring AI values alignment</span>
		</div>
	</footer>
</div>
