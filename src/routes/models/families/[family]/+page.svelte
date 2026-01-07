<!-- ABOUTME: Family page showing all models in a family with aggregated stats. -->
<!-- ABOUTME: Displays family-level averages and per-model human alignment and self-consistency. -->
<script lang="ts">
	import type { PageData } from './$types';
	import { getScoreLevel, getScoreLabel } from '$lib/alignment';

	let { data } = $props<{ data: PageData }>();

	function getScoreColor(score: number): string {
		const level = getScoreLevel(score);
		const colors = {
			'very-high': 'text-emerald-600',
			high: 'text-emerald-500',
			moderate: 'text-amber-600',
			low: 'text-orange-500',
			'very-low': 'text-rose-500'
		};
		return colors[level];
	}

	function getScoreBgColor(score: number): string {
		const level = getScoreLevel(score);
		const colors = {
			'very-high': 'bg-emerald-500',
			high: 'bg-emerald-400',
			moderate: 'bg-amber-400',
			low: 'bg-orange-400',
			'very-low': 'bg-rose-400'
		};
		return colors[level];
	}
</script>

<svelte:head>
	<title>{data.family} Models — Qualia Garden</title>
	<meta name="description" content="AI alignment analysis for {data.family} models" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
	<header class="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
		<div class="max-w-6xl mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<a href="/" class="flex items-center gap-3 group">
					<img
						src="/favicon.png"
						alt=""
						class="w-9 h-9 transition-transform group-hover:scale-105"
					/>
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
						class="px-3 py-2 text-sm text-slate-900 font-medium bg-slate-100 rounded-lg">Models</a
					>
					<a
						href="/map"
						class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
						>Map</a
					>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-6 py-8">
		<!-- Breadcrumb -->
		<div class="mb-8">
			<a
				href="/models"
				class="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1.5 transition-colors"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				All Models
			</a>
		</div>

		<!-- Family Header -->
		<div class="bg-white rounded-xl border border-slate-200 p-6 mb-8">
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1">
					<h1 class="text-2xl font-bold text-slate-900 tracking-tight capitalize mb-2">
						{data.family}
					</h1>
					<p class="text-slate-600">
						{data.models.length} model{data.models.length === 1 ? '' : 's'}
						{#if data.totalResponses > 0}
							<span class="text-slate-400">· {data.totalResponses} total responses</span>
						{/if}
					</p>
				</div>

				<!-- Family Stats -->
				{#if data.avgHumanAlignment !== null || data.avgSelfConsistency !== null}
					<div class="flex gap-6">
						{#if data.avgHumanAlignment !== null}
							<div class="text-center">
								<div class="text-xs text-slate-500 mb-1">Avg Human Similarity</div>
								<div class="text-2xl font-bold {getScoreColor(data.avgHumanAlignment)}">
									{Math.round(data.avgHumanAlignment)}
								</div>
							</div>
						{/if}
						{#if data.avgSelfConsistency !== null}
							<div class="text-center">
								<div class="text-xs text-slate-500 mb-1">Avg AI Confidence</div>
								<div class="text-2xl font-bold {getScoreColor(data.avgSelfConsistency)}">
									{Math.round(data.avgSelfConsistency)}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Models Grid -->
		<div class="bg-white rounded-xl border border-slate-200 p-6">
			<h2 class="text-lg font-semibold text-slate-900 mb-5">Models</h2>

			{#if data.models.length === 0}
				<p class="text-slate-500">No models in this family.</p>
			{:else}
				<div class="space-y-2">
					{#each data.models as model}
						<a
							href="/models/{model.id}"
							class="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100 transition-all group"
						>
							<div class="flex items-center gap-3 flex-1 min-w-0">
								<span class="font-medium text-slate-800 group-hover:text-slate-900 truncate">
									{model.name}
								</span>
								{#if model.supports_reasoning}
									<span class="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
										reasoning
									</span>
								{/if}
								{#if !model.active}
									<span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
										inactive
									</span>
								{/if}
								<span class="text-xs text-slate-400">{model.questionCount}q</span>
							</div>

							<div class="flex items-center gap-6 shrink-0">
								{#if model.humanAlignment !== null}
									<div class="text-center w-20">
										<div class="text-xs text-slate-400 mb-0.5">Human</div>
										<div class="text-lg font-semibold {getScoreColor(model.humanAlignment)}">
											{Math.round(model.humanAlignment)}
										</div>
									</div>
								{:else}
									<div class="text-center w-20">
										<div class="text-xs text-slate-400 mb-0.5">Human</div>
										<div class="text-lg text-slate-300">—</div>
									</div>
								{/if}

								{#if model.selfConsistency !== null}
									<div class="text-center w-20">
										<div class="text-xs text-slate-400 mb-0.5">Consistency</div>
										<div class="text-lg font-semibold {getScoreColor(model.selfConsistency)}">
											{Math.round(model.selfConsistency)}
										</div>
									</div>
								{:else}
									<div class="text-center w-20">
										<div class="text-xs text-slate-400 mb-0.5">Consistency</div>
										<div class="text-lg text-slate-300">—</div>
									</div>
								{/if}

								<svg
									class="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</main>

	<footer class="border-t border-slate-200 py-8 px-6 mt-12">
		<div class="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
			<span>Qualia Garden</span>
			<span>Exploring AI values alignment</span>
		</div>
	</footer>
</div>
