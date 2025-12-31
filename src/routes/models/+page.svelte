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
</script>

<svelte:head>
	<title>Models - Qualia Garden</title>
	<meta name="description" content="AI models polled by Qualia Garden" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b">
		<div class="max-w-6xl mx-auto px-4 py-6">
			<div class="flex items-center justify-between">
				<a href="/" class="flex items-center gap-4">
					<img src="/favicon.png" alt="" class="w-10 h-10" />
					<div>
						<h1 class="text-xl font-bold text-gray-900">Qualia Garden</h1>
						<p class="text-sm text-gray-500">Comparing AI opinions to human surveys</p>
					</div>
				</a>
				<nav class="flex gap-4">
					<a href="/questions" class="text-gray-600 hover:text-gray-900">All Questions</a>
					<a href="/models" class="text-gray-900 font-medium">Models</a>
					<a href="/map" class="text-gray-600 hover:text-gray-900">Model Map</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-12">
		<div class="mb-8">
			<h2 class="text-2xl font-bold text-gray-900 mb-2">AI Models</h2>
			<p class="text-gray-600">
				{data.models.length} models polled across {data.models.reduce((sum: number, m: Model) => sum + m.questionCount, 0)} question-model pairs
			</p>
		</div>

		<div class="space-y-8">
			{#each families as family}
				{@const familyModels = modelsByFamily()[family]}
				<section>
					<h3 class="text-lg font-semibold text-gray-700 mb-4 capitalize">{family}</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each familyModels as model}
							<a
								href="/models/{model.id}"
								class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow {!model.active ? 'opacity-60' : ''}"
							>
								<div class="flex items-start justify-between">
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 flex-wrap">
											<span class="font-medium text-gray-900 truncate">{model.name}</span>
											{#if model.supports_reasoning}
												<span class="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
													thinking
												</span>
											{/if}
											{#if !model.active}
												<span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
													inactive
												</span>
											{/if}
										</div>
										<div class="text-sm text-gray-500 mt-1">
											{model.questionCount} question{model.questionCount === 1 ? '' : 's'} answered
										</div>
									</div>
									<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
</div>
