<script lang="ts">
	// ABOUTME: Category detail page showing questions with full aggregate results.
	// ABOUTME: Displays AI vs Human distribution comparison for each question.

	import type { PageData } from './$types';
	import { getScoreLevel, getScoreLabel } from '$lib/alignment';

	let { data } = $props<{ data: PageData }>();

	type SortKey = 'default' | 'humanAiScore' | 'aiAgreementScore';
	let sortBy = $state<SortKey>('default');

	const sortedQuestions = $derived(() => {
		if (sortBy === 'humanAiScore') {
			return [...data.questions].sort((a, b) => a.humanAiScore - b.humanAiScore);
		} else if (sortBy === 'aiAgreementScore') {
			return [...data.questions].sort((a, b) => a.aiAgreementScore - b.aiAgreementScore);
		}
		return data.questions;
	});

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
				{#if data.overallHumanAiScore !== null || data.overallAiAgreement !== null}
					<div class="flex gap-6 shrink-0">
						{#if data.overallHumanAiScore !== null}
							<div class="text-center">
								<div class="text-xs text-slate-500 mb-1">AI-Human</div>
								<div class="text-2xl font-bold {getScoreColor(data.overallHumanAiScore)}">
									{data.overallHumanAiScore}
								</div>
								<div class="text-xs {getScoreColor(data.overallHumanAiScore)} font-medium">
									{getScoreLabel(data.overallHumanAiScore)}
								</div>
							</div>
						{/if}
						{#if data.overallAiAgreement !== null}
							<div class="text-center">
								<div class="text-xs text-slate-500 mb-1">AI Agreement</div>
								<div class="text-2xl font-bold {getScoreColor(data.overallAiAgreement)}">
									{data.overallAiAgreement}
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
			<div class="text-sm text-slate-400 ml-auto">
				{sortedQuestions().length} question{sortedQuestions().length === 1 ? '' : 's'}
			</div>
		</div>

		<!-- Questions with Full Results -->
		<div class="space-y-6">
			{#each sortedQuestions() as question}
				<div class="bg-white rounded-xl border border-slate-200 p-6">
					<!-- Question Header -->
					<div class="flex items-start justify-between gap-4 mb-6">
						<div class="flex-1">
							<a href="/questions/{question.id}" class="text-slate-800 hover:text-blue-600 transition-colors font-medium leading-relaxed">
								{question.text}
							</a>
							<div class="mt-2 text-sm text-slate-500">
								{question.modelCount} model{question.modelCount === 1 ? '' : 's'}
								{#if question.humanSampleSize}
									· {question.humanSampleSize.toLocaleString()} human respondents
								{/if}
							</div>
						</div>
						<div class="flex gap-4 shrink-0">
							{#if question.humanResults.length > 0}
								<div class="text-center w-16">
									<div class="text-xs text-slate-400 mb-1">AI-Human</div>
									<div class="text-lg font-bold {getScoreColor(question.humanAiScore)}">
										{Math.round(question.humanAiScore)}
									</div>
								</div>
							{/if}
							{#if question.modelCount >= 2}
								<div class="text-center w-16">
									<div class="text-xs text-slate-400 mb-1">AI Agree</div>
									<div class="text-lg font-bold {getScoreColor(question.aiAgreementScore)}">
										{Math.round(question.aiAgreementScore)}
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Results Comparison -->
					{#if question.modelCount > 0}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<!-- AI Results -->
							<div>
								<div class="flex items-center gap-2 mb-3">
									<div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
									<span class="text-sm font-medium text-slate-600">AI Models</span>
								</div>
								<div class="space-y-2">
									{#each question.aiResults as result}
										<div>
											<div class="flex justify-between text-sm mb-1">
												<span class="text-slate-600 truncate pr-2">{result.label}</span>
												<span class="text-slate-400 flex-shrink-0">{result.percentage.toFixed(0)}%</span>
											</div>
											<div class="h-4 bg-slate-100 rounded overflow-hidden">
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
								<div class="flex items-center gap-2 mb-3">
									<div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
									<span class="text-sm font-medium text-slate-600">Humans</span>
								</div>
								{#if question.humanResults.length > 0}
									<div class="space-y-2">
										{#each question.humanResults as result}
											<div>
												<div class="flex justify-between text-sm mb-1">
													<span class="text-slate-600 truncate pr-2">{result.label}</span>
													<span class="text-slate-400 flex-shrink-0">{result.percentage.toFixed(0)}%</span>
												</div>
												<div class="h-4 bg-slate-100 rounded overflow-hidden">
													<div
														class="h-full bg-emerald-500 rounded transition-all"
														style="width: {result.percentage}%"
													></div>
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<div class="text-sm text-slate-400 py-4 text-center">
										No human data available
									</div>
								{/if}
							</div>
						</div>
					{:else}
						<div class="text-sm text-slate-400 py-4 text-center">
							No AI responses yet
						</div>
					{/if}
				</div>
			{:else}
				<div class="text-center py-16">
					<p class="text-slate-500">No questions in this category.</p>
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
