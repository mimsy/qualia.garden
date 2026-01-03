<script lang="ts">
	// ABOUTME: Model exploration interface with multiple visualization methods.
	// ABOUTME: Includes UMAP map, agreement matrix, response heatmap, and human alignment.

	import { onMount } from 'svelte';
	import { UMAP } from 'umap-js';
	import type { PageData } from './$types';
	import type { Entity, QuestionInfo } from './+page.server';

	let { data } = $props<{ data: PageData }>();

	// Tab navigation
	type Tab = 'map' | 'agreement' | 'responses' | 'alignment';
	let activeTab = $state<Tab>('map');

	const tabs: Array<{ id: Tab; label: string; description: string }> = [
		{ id: 'map', label: 'Similarity Map', description: 'UMAP projection of response vectors' },
		{ id: 'agreement', label: 'Agreement Matrix', description: 'Pairwise agreement between entities' },
		{ id: 'responses', label: 'Response Grid', description: 'How each entity answered each question' },
		{ id: 'alignment', label: 'Human Alignment', description: 'Similarity to human responses' }
	];

	// UMAP state
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

	// UMAP parameters
	let nNeighbors = $state(Math.min(15, Math.max(2, data.entities.length - 1)));
	let minDist = $state(0.1);
	let spread = $state(1.0);

	// Hover state for other views
	let hoveredCell = $state<{ row: string; col: string; value: string | number } | null>(null);

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

	// Option colors for response grid
	const optionColors = [
		'#3B82F6', // blue
		'#10B981', // green
		'#F59E0B', // amber
		'#EF4444', // red
		'#8B5CF6', // violet
		'#EC4899', // pink
		'#06B6D4', // cyan
		'#84CC16', // lime
	];

	function getColor(family: string): string {
		return familyColors[family.toLowerCase()] || '#6B7280';
	}

	function getOptionColor(option: string, question: QuestionInfo): string {
		const idx = question.options.indexOf(option);
		return idx >= 0 ? optionColors[idx % optionColors.length] : '#9CA3AF';
	}

	function getAgreementColor(value: number): string {
		// Red (0%) -> White (50%) -> Green (100%)
		if (value <= 50) {
			const intensity = Math.round(255 * (value / 50));
			return `rgb(255, ${intensity}, ${intensity})`;
		} else {
			const intensity = Math.round(255 * ((100 - value) / 50));
			return `rgb(${intensity}, 255, ${intensity})`;
		}
	}

	// SVG dimensions
	const width = 800;
	const height = 600;
	const padding = 60;

	// Agreement matrix dimensions
	const agreementCellSize = 40;
	const agreementLabelWidth = 120;

	// Response grid dimensions
	const responseCellSize = 24;
	const responseLabelWidth = 140;

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
					y: scaleY(embedding[i][1]),
					metadata: entity.metadata
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

	function truncate(text: string, maxLen: number): string {
		return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
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
		<h1 class="text-2xl font-bold text-gray-900 mb-2">Model Explorer</h1>
		<p class="text-gray-600 mb-6">
			Compare AI models and human groups across {data.questions.length} questions using different visualization methods.
		</p>

		<!-- Tab Navigation -->
		<div class="flex gap-1 mb-6 border-b">
			{#each tabs as tab}
				<button
					onclick={() => activeTab = tab.id}
					class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
						{activeTab === tab.id
							? 'bg-white border border-b-white -mb-px text-blue-600'
							: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<!-- Tab Content -->
		{#if activeTab === 'map'}
			<!-- UMAP Similarity Map -->
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
									<g>
										<rect
											x={hoveredPoint.x + 12}
											y={hoveredPoint.y - 12}
											width={hoveredPoint.name.length * 7 + 16}
											height="24"
											rx="4"
											fill="rgba(0,0,0,0.8)"
										/>
										<text x={hoveredPoint.x + 20} y={hoveredPoint.y + 4} fill="white" font-size="12">
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

		{:else if activeTab === 'agreement'}
			<!-- Agreement Matrix -->
			<div class="bg-white rounded-lg shadow p-6">
				<p class="text-sm text-gray-500 mb-4">Percentage of questions where two entities gave the same answer.</p>
				<div class="overflow-x-auto">
					<svg width={agreementLabelWidth + data.entities.length * agreementCellSize} height={agreementLabelWidth + data.entities.length * agreementCellSize}>
						<!-- Column labels -->
						{#each data.entities as entity, i}
							<text
								x={agreementLabelWidth + i * agreementCellSize + agreementCellSize / 2}
								y={agreementLabelWidth - 5}
								text-anchor="end"
								transform="rotate(-45, {agreementLabelWidth + i * agreementCellSize + agreementCellSize / 2}, {agreementLabelWidth - 5})"
								font-size="10"
								fill="#374151"
							>
								{truncate(entity.name, 15)}
							</text>
						{/each}
						<!-- Row labels and cells -->
						{#each data.entities as rowEntity, rowIdx}
							<text
								x={agreementLabelWidth - 5}
								y={agreementLabelWidth + rowIdx * agreementCellSize + agreementCellSize / 2 + 4}
								text-anchor="end"
								font-size="10"
								fill="#374151"
							>
								{truncate(rowEntity.name, 15)}
							</text>
							{#each data.entities as colEntity, colIdx}
								{@const agreement = data.agreements[rowEntity.id]?.[colEntity.id] ?? 0}
								<rect
									x={agreementLabelWidth + colIdx * agreementCellSize}
									y={agreementLabelWidth + rowIdx * agreementCellSize}
									width={agreementCellSize - 1}
									height={agreementCellSize - 1}
									fill={getAgreementColor(agreement)}
									class="cursor-pointer"
									onmouseenter={() => hoveredCell = { row: rowEntity.name, col: colEntity.name, value: agreement }}
									onmouseleave={() => hoveredCell = null}
								/>
								<text
									x={agreementLabelWidth + colIdx * agreementCellSize + agreementCellSize / 2}
									y={agreementLabelWidth + rowIdx * agreementCellSize + agreementCellSize / 2 + 4}
									text-anchor="middle"
									font-size="9"
									fill={agreement > 70 || agreement < 30 ? 'white' : '#374151'}
								>
									{agreement}
								</text>
							{/each}
						{/each}
					</svg>
				</div>
				{#if hoveredCell}
					<div class="mt-4 p-3 bg-gray-100 rounded text-sm">
						<strong>{hoveredCell.row}</strong> and <strong>{hoveredCell.col}</strong> agree on <strong>{hoveredCell.value}%</strong> of questions
					</div>
				{/if}
			</div>

		{:else if activeTab === 'responses'}
			<!-- Response Heatmap -->
			<div class="bg-white rounded-lg shadow p-6">
				<p class="text-sm text-gray-500 mb-4">Each cell shows how an entity answered a question. Same color = same answer.</p>
				<div class="overflow-x-auto">
					<svg width={responseLabelWidth + data.questions.length * responseCellSize} height={30 + data.entities.length * responseCellSize}>
						<!-- Question column headers (abbreviated) -->
						{#each data.questions as question, i}
							<text
								x={responseLabelWidth + i * responseCellSize + responseCellSize / 2}
								y={20}
								text-anchor="middle"
								font-size="8"
								fill="#6B7280"
							>
								Q{i + 1}
							</text>
						{/each}
						<!-- Entity rows -->
						{#each data.entities as entity, rowIdx}
							<text
								x={responseLabelWidth - 5}
								y={30 + rowIdx * responseCellSize + responseCellSize / 2 + 3}
								text-anchor="end"
								font-size="10"
								fill="#374151"
							>
								{truncate(entity.name, 18)}
							</text>
							{#each data.questions as question, colIdx}
								{@const answer = data.responses[entity.id]?.[question.id]}
								<rect
									x={responseLabelWidth + colIdx * responseCellSize}
									y={30 + rowIdx * responseCellSize}
									width={responseCellSize - 1}
									height={responseCellSize - 1}
									fill={answer ? getOptionColor(answer, question) : '#E5E7EB'}
									class="cursor-pointer"
									onmouseenter={() => hoveredCell = { row: entity.name, col: question.text, value: answer || 'No response' }}
									onmouseleave={() => hoveredCell = null}
								/>
							{/each}
						{/each}
					</svg>
				</div>
				{#if hoveredCell}
					<div class="mt-4 p-3 bg-gray-100 rounded text-sm">
						<strong>{hoveredCell.row}</strong>: "{truncate(String(hoveredCell.col), 60)}" → <strong>{hoveredCell.value}</strong>
					</div>
				{/if}
			</div>

		{:else if activeTab === 'alignment'}
			<!-- Human Alignment -->
			<div class="bg-white rounded-lg shadow p-6">
				<p class="text-sm text-gray-500 mb-4">How often each entity agrees with the human plurality answer.</p>
				<div class="space-y-2">
					{#each data.humanAlignment as item}
						<div class="flex items-center gap-4">
							<div class="w-40 text-sm text-right truncate" title={item.name}>
								{truncate(item.name, 20)}
							</div>
							<div class="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
								<div
									class="h-full rounded transition-all"
									style="width: {item.score}; background-color: {item.type === 'human' ? '#374151' : getColor(data.entities.find((e: { id: string; family: string }) => e.id === item.id)?.family || '')}"
								></div>
							</div>
							<div class="w-12 text-sm text-gray-600 text-right">
								{item.score}
							</div>
						</div>
					{/each}
				</div>
				{#if data.humanAlignment.length === 0}
					<p class="text-gray-500 text-center py-8">No alignment data available</p>
				{/if}
			</div>
		{/if}

		<!-- Footer info -->
		<div class="mt-6 text-sm text-gray-500 text-center">
			{data.entities.length} entities · {data.questions.length} questions
		</div>
	</main>
</div>
