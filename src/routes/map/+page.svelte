<script lang="ts">
	// ABOUTME: Model similarity map visualization using UMAP projection.
	// ABOUTME: Shows AI models and human groups positioned by response similarity.

	import { onMount } from 'svelte';
	import { UMAP } from 'umap-js';
	import type { PageData } from './$types';
	import type { Entity } from './+page.server';

	let { data } = $props<{ data: PageData }>();

	// UMAP state
	interface Point {
		id: string;
		name: string;
		type: 'model' | 'human';
		family: string;
		x: number;
		y: number;
	}

	let points = $state<Point[]>([]);
	let hoveredPoint = $state<Point | null>(null);
	let isComputing = $state(true);
	let error = $state<string | null>(null);

	// UMAP parameters
	let nNeighbors = $state(Math.min(5, Math.max(2, data.entities.length - 1)));
	let minDist = $state(0.1);
	let spread = $state(1.0);

	// Color palette for families
	const familyColors: Record<string, string> = {
		'anthropic': '#D97706',
		'openai': '#059669',
		'google': '#2563EB',
		'meta': '#7C3AED',
		'mistral': '#DC2626',
		'cohere': '#0891B2',
		'deepseek': '#4F46E5',
		'qwen': '#DB2777',
		'human': '#374151',
	};

	function getColor(family: string): string {
		return familyColors[family.toLowerCase()] || '#6B7280';
	}

	// SVG dimensions
	const width = 800;
	const height = 600;
	const padding = 60;

	function computeUMAP() {
		if (data.entities.length < 2) {
			error = 'Need at least 2 entities with responses to create a map';
			isComputing = false;
			return;
		}

		isComputing = true;
		error = null;

		setTimeout(() => {
			try {
				const vectors = data.entities.map((e: Entity) => e.vector);
				const vectorLength = vectors[0].length;
				if (vectorLength === 0) {
					error = 'No response data available';
					isComputing = false;
					return;
				}

				const umap = new UMAP({
					nComponents: 2,
					nNeighbors: Math.min(nNeighbors, data.entities.length - 1),
					minDist,
					spread,
				});

				const embedding = umap.fit(vectors);

				let minX = Infinity, maxX = -Infinity;
				let minY = Infinity, maxY = -Infinity;
				for (const [x, y] of embedding) {
					minX = Math.min(minX, x);
					maxX = Math.max(maxX, x);
					minY = Math.min(minY, y);
					maxY = Math.max(maxY, y);
				}

				const scaleX = (x: number) =>
					padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
				const scaleY = (y: number) =>
					padding + ((y - minY) / (maxY - minY || 1)) * (height - 2 * padding);

				points = data.entities.map((entity: Entity, i: number) => ({
					id: entity.id,
					name: entity.name,
					type: entity.type,
					family: entity.family,
					x: scaleX(embedding[i][0]),
					y: scaleY(embedding[i][1])
				}));

				isComputing = false;
			} catch (err) {
				error = err instanceof Error ? err.message : 'Failed to compute UMAP';
				isComputing = false;
			}
		}, 10);
	}

	onMount(() => {
		computeUMAP();
	});

	function handleMouseEnter(point: Point) {
		hoveredPoint = point;
	}

	function handleMouseLeave() {
		hoveredPoint = null;
	}

	// Calculate tooltip position to avoid clipping at edges
	function getTooltipPosition(point: Point): { x: number; anchorLeft: boolean } {
		const tooltipWidth = point.name.length * 7 + 16;
		const rightEdge = point.x + 12 + tooltipWidth;
		if (rightEdge > width - 10) {
			return { x: point.x - 12 - tooltipWidth, anchorLeft: true };
		}
		return { x: point.x + 12, anchorLeft: false };
	}
</script>

<svelte:head>
	<title>Model Explorer - Qualia Garden</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b">
		<div class="max-w-7xl mx-auto px-4 py-6">
			<div class="flex items-center justify-between">
				<a href="/" class="flex items-center gap-4">
					<img src="/favicon.png" alt="" class="w-10 h-10" />
					<div>
						<h1 class="text-xl font-bold text-gray-900">Qualia Garden</h1>
						<p class="text-sm text-gray-500">Exploring AI beliefs through systematic polling</p>
					</div>
				</a>
				<nav class="flex items-center gap-4">
					<a href="/questions" class="text-gray-600 hover:text-gray-900">All Questions</a>
					<a href="/models" class="text-gray-600 hover:text-gray-900">Models</a>
					<a href="/map" class="text-gray-900 font-medium">Model Map</a>
				</nav>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 py-8">
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Model Similarity Map</h1>
		<p class="text-gray-600 mb-6">
			AI models and human groups positioned by response similarity across {data.questionCount} questions.
		</p>

		{#if error}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
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
					<div class="flex-1">
						<svg {width} {height} class="border border-gray-200 rounded">
							{#each points as point}
								{@const isHovered = hoveredPoint?.id === point.id}
								<g
									onmouseenter={() => handleMouseEnter(point)}
									onmouseleave={handleMouseLeave}
									class="cursor-pointer"
								>
									{#if point.type === 'human'}
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
							{#if hoveredPoint}
								{@const tooltipPos = getTooltipPosition(hoveredPoint)}
								{@const tooltipWidth = hoveredPoint.name.length * 7 + 16}
								<g>
									<rect
										x={tooltipPos.x}
										y={hoveredPoint.y - 12}
										width={tooltipWidth}
										height="24"
										rx="4"
										fill="rgba(0,0,0,0.8)"
									/>
									<text x={tooltipPos.x + 8} y={hoveredPoint.y + 4} fill="white" font-size="12">
										{hoveredPoint.name}
									</text>
								</g>
							{/if}
						</svg>
					</div>
					<div class="w-56">
						<h3 class="font-semibold text-gray-900 mb-3">Parameters</h3>
						<div class="space-y-4">
							<div>
								<label class="block text-sm text-gray-600 mb-1">Neighbors: {nNeighbors}</label>
								<input type="range" min="2" max={Math.max(2, data.entities.length - 1)} bind:value={nNeighbors} class="w-full" />
							</div>
							<div>
								<label class="block text-sm text-gray-600 mb-1">Min Distance: {minDist.toFixed(2)}</label>
								<input type="range" min="0.01" max="1" step="0.01" bind:value={minDist} class="w-full" />
							</div>
							<div>
								<label class="block text-sm text-gray-600 mb-1">Spread: {spread.toFixed(1)}</label>
								<input type="range" min="0.5" max="3" step="0.1" bind:value={spread} class="w-full" />
							</div>
							<button onclick={computeUMAP} disabled={isComputing} class="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50">
								{isComputing ? 'Computing...' : 'Recompute'}
							</button>
						</div>
						<div class="mt-6 pt-4 border-t">
							<h3 class="font-semibold text-gray-900 mb-3">Legend</h3>
							<div class="space-y-2">
								{#each data.families as family}
									<div class="flex items-center gap-2">
										<div class="w-4 h-4 {family === 'Human' ? '' : 'rounded-full'}" style="background-color: {getColor(family)}"></div>
										<span class="text-sm text-gray-700">{family}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Footer info -->
		<div class="mt-6 text-sm text-gray-500 text-center">
			{data.entities.length} entities · {data.questionCount} questions
			{#if data.excludedModelCount > 0}
				<span class="text-gray-400">· {data.excludedModelCount} models excluded (below {Math.round(data.minCoverageThreshold * 100)}% coverage)</span>
			{/if}
		</div>
	</main>
</div>
