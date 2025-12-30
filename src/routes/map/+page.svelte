<script lang="ts">
	// ABOUTME: Model similarity map visualization using UMAP.
	// ABOUTME: Projects high-dimensional response vectors to 2D scatter plot.

	import { onMount } from 'svelte';
	import { UMAP } from 'umap-js';
	import type { PageData } from './$types';
	import type { Entity } from './+page.server';

	let { data } = $props<{ data: PageData }>();

	interface Point {
		id: string;
		name: string;
		type: 'model' | 'human';
		family: string;
		x: number;
		y: number;
		metadata: Record<string, unknown>;
	}

	let points = $state<Point[]>([]);
	let hoveredPoint = $state<Point | null>(null);
	let isComputing = $state(true);
	let error = $state<string | null>(null);

	// Color palette for families (lowercase keys for case-insensitive lookup)
	const familyColors: Record<string, string> = {
		'anthropic': '#D97706', // amber
		'openai': '#059669', // emerald
		'google': '#2563EB', // blue
		'meta': '#7C3AED', // violet
		'mistral': '#DC2626', // red
		'cohere': '#0891B2', // cyan
		'deepseek': '#4F46E5', // indigo
		'qwen': '#DB2777', // pink
		'human': '#374151', // gray
	};

	function getColor(family: string): string {
		return familyColors[family.toLowerCase()] || '#6B7280';
	}

	// SVG dimensions
	const width = 800;
	const height = 600;
	const padding = 60;

	onMount(async () => {
		if (data.entities.length < 2) {
			error = 'Need at least 2 entities with responses to create a map';
			isComputing = false;
			return;
		}

		try {
			// Extract vectors from entities
			const vectors = data.entities.map((e: Entity) => e.vector);

			// Check if all vectors have the same length and valid values
			const vectorLength = vectors[0].length;
			if (vectorLength === 0) {
				error = 'No response data available';
				isComputing = false;
				return;
			}

			// Run UMAP
			const umap = new UMAP({
				nComponents: 2,
				nNeighbors: Math.min(15, data.entities.length - 1),
				minDist: 0.1,
				spread: 1.0,
			});

			const embedding = umap.fit(vectors);

			// Find bounds for scaling
			let minX = Infinity, maxX = -Infinity;
			let minY = Infinity, maxY = -Infinity;
			for (const [x, y] of embedding) {
				minX = Math.min(minX, x);
				maxX = Math.max(maxX, x);
				minY = Math.min(minY, y);
				maxY = Math.max(maxY, y);
			}

			// Scale to SVG coordinates
			const scaleX = (x: number) =>
				padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
			const scaleY = (y: number) =>
				padding + ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);

			// Create points
			points = data.entities.map((entity: Entity, i: number) => ({
				id: entity.id,
				name: entity.name,
				type: entity.type,
				family: entity.family,
				x: scaleX(embedding[i][0]),
				y: scaleY(embedding[i][1]),
				metadata: entity.metadata
			}));

			isComputing = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to compute UMAP';
			isComputing = false;
		}
	});

	function handleMouseEnter(point: Point) {
		hoveredPoint = point;
	}

	function handleMouseLeave() {
		hoveredPoint = null;
	}
</script>

<svelte:head>
	<title>Model Map - Qualia Garden</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b">
		<div class="max-w-6xl mx-auto px-4 py-6">
			<div class="flex items-center justify-between">
				<a href="/" class="flex items-center gap-4">
					<img src="/favicon.png" alt="" class="w-10 h-10" />
					<div>
						<h1 class="text-xl font-bold text-gray-900">Qualia Garden</h1>
						<p class="text-sm text-gray-500">Exploring AI beliefs through systematic polling</p>
					</div>
				</a>
				<nav class="flex items-center gap-4">
					<a href="/questions" class="text-gray-600 hover:text-gray-900">Browse Questions</a>
					<a href="/map" class="text-gray-900 font-medium">Model Map</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-8">
	<h1 class="text-2xl font-bold text-gray-900 mb-2">Model Similarity Map</h1>
	<p class="text-gray-600 mb-6">
		AI models and human groups positioned by similarity of responses across {data.questions.length} questions.
		Models with similar values cluster together.
	</p>

	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
			{error}
		</div>
	{:else if isComputing}
		<div class="bg-white rounded-lg shadow p-8 flex items-center justify-center">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
				<p class="text-gray-600">Computing similarity map...</p>
			</div>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex gap-8">
				<!-- SVG Visualization -->
				<div class="flex-1">
					<svg {width} {height} class="border border-gray-200 rounded">
						<!-- Points -->
						{#each points as point}
							{@const isHovered = hoveredPoint?.id === point.id}
							<g
								onmouseenter={() => handleMouseEnter(point)}
								onmouseleave={handleMouseLeave}
								class="cursor-pointer"
							>
							{#if point.type === 'human'}
								<!-- Square for humans -->
								<rect
									x={point.x - (isHovered ? 10 : 8)}
									y={point.y - (isHovered ? 10 : 8)}
									width={isHovered ? 20 : 16}
									height={isHovered ? 20 : 16}
									fill={getColor(point.family)}
									stroke="white"
									stroke-width="2"
								/>
							{:else}
								<!-- Circle for models -->
								<circle
									cx={point.x}
									cy={point.y}
									r={isHovered ? 10 : 8}
									fill={getColor(point.family)}
									stroke="white"
									stroke-width="2"
								/>
							{/if}
							</g>
						{/each}

						<!-- Hovered label -->
						{#if hoveredPoint}
							<g>
								<rect
									x={hoveredPoint.x + 12}
									y={hoveredPoint.y - 12}
									width={hoveredPoint.name.length * 7 + 16}
									height="24"
									rx="4"
									fill="rgba(0,0,0,0.8)"
								/>
								<text
									x={hoveredPoint.x + 20}
									y={hoveredPoint.y + 4}
									fill="white"
									font-size="12"
								>
									{hoveredPoint.name}
								</text>
							</g>
						{/if}
					</svg>
				</div>

				<!-- Legend -->
				<div class="w-48">
					<h3 class="font-semibold text-gray-900 mb-3">Legend</h3>
					<div class="space-y-2">
						{#each data.families as family}
							<div class="flex items-center gap-2">
								{#if family === 'Human'}
									<div
										class="w-4 h-4"
										style="background-color: {getColor(family)}"
									></div>
								{:else}
									<div
										class="w-4 h-4 rounded-full"
										style="background-color: {getColor(family)}"
									></div>
								{/if}
								<span class="text-sm text-gray-700">{family}</span>
							</div>
						{/each}
					</div>

					<div class="mt-6 pt-4 border-t">
						<h4 class="font-medium text-gray-700 mb-2">Shapes</h4>
						<div class="space-y-2 text-sm text-gray-600">
							<div class="flex items-center gap-2">
								<div class="w-4 h-4 rounded-full bg-gray-400"></div>
								<span>AI Model</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="w-4 h-4 bg-gray-400"></div>
								<span>Human Group</span>
							</div>
						</div>
					</div>

					<div class="mt-6 pt-4 border-t text-xs text-gray-500">
						<p>{data.entities.length} entities</p>
						<p>{data.questions.length} questions</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
	</main>
</div>
