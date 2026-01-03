<script lang="ts">
	// ABOUTME: Models index page showing all AI models.
	// ABOUTME: Lists models with response counts and links to detail pages.

	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	type Model = typeof data.models[number];

	// Group models by family
	const modelsByFamily = $derived(() => {
		const grouped: Record<string, typeof data.models> = {};
		for (const model of data.models) {
			if (!grouped[model.family]) grouped[model.family] = [];
			grouped[model.family].push(model);
		}
		return grouped;
	});

	const families = $derived(Object.keys(modelsByFamily()).sort());

	const totalQuestions = $derived(data.models.reduce((sum: number, m: Model) => sum + m.questionCount, 0));
</script>

<svelte:head>
	<title>Models — Qualia Garden</title>
	<meta name="description" content="AI models polled by Qualia Garden" />
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
					<a href="/models" class="px-3 py-2 text-sm text-slate-900 font-medium bg-slate-100 rounded-lg">Models</a>
					<a href="/map" class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Map</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-6 py-12">
		<!-- Hero -->
		<div class="mb-12">
			<h1 class="text-3xl font-bold text-slate-900 tracking-tight mb-3">AI Models</h1>
			<p class="text-slate-600">
				{data.models.length} models surveyed · {totalQuestions.toLocaleString()} total responses
			</p>
		</div>

		<!-- Model families -->
		<div class="space-y-12">
			{#each families as family}
				{@const familyModels = modelsByFamily()[family]}
				<section>
					<div class="flex items-baseline justify-between mb-5">
						<a
							href="/models/families/{encodeURIComponent(family)}"
							class="text-xl font-semibold text-slate-800 capitalize hover:text-slate-600 transition-colors group flex items-center gap-2"
						>
							{family}
							<svg class="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</a>
						<span class="text-sm text-slate-400">{familyModels.length} model{familyModels.length === 1 ? '' : 's'}</span>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each familyModels as model}
							<a
								href="/models/{model.id}"
								class="group bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-200 {!model.active ? 'opacity-50' : ''}"
							>
								<div class="flex items-start justify-between gap-3">
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 flex-wrap mb-2">
											<span class="font-medium text-slate-900 group-hover:text-slate-700 transition-colors">{model.name}</span>
											{#if model.supports_reasoning}
												<span class="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md font-medium">
													reasoning
												</span>
											{/if}
											{#if !model.active}
												<span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
													inactive
												</span>
											{/if}
										</div>
										<div class="text-sm text-slate-500">
											{model.questionCount} question{model.questionCount === 1 ? '' : 's'} answered
										</div>
									</div>
									<svg class="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
									</svg>
								</div>
							</a>
						{/each}
					</div>
				</section>
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
