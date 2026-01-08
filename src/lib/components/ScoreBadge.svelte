<script lang="ts">
	// ABOUTME: Horizontal progress bar component for displaying metric scores.
	// ABOUTME: Shows label, score value, and colored progress bar with rich tooltip.

	import ScoreTooltip from './ScoreTooltip.svelte';

	type ScoreType = 'humanSimilarity' | 'aiConsensus' | 'aiConfidence';
	type Context = 'question' | 'model' | 'aggregate';

	interface Props {
		score: number | null;
		label: string;
		type?: ScoreType;
		context?: Context;
	}

	let { score, label, type: scoreType = 'humanSimilarity', context = 'question' }: Props = $props();

	// Get intensity level based on score (low/med/high)
	type Intensity = 'low' | 'med' | 'high';
	const intensity = $derived<Intensity>(
		score === null ? 'med' : score < 40 ? 'low' : score < 70 ? 'med' : 'high'
	);

	// Color schemes per type with intensity variations
	const colorSchemes: Record<
		ScoreType,
		Record<Intensity, { bar: string; text: string; bg: string }>
	> = {
		humanSimilarity: {
			low: { bar: 'bg-emerald-300', text: 'text-emerald-600', bg: 'bg-emerald-100' },
			med: { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-100' },
			high: { bar: 'bg-emerald-600', text: 'text-emerald-800', bg: 'bg-emerald-100' }
		},
		aiConsensus: {
			low: { bar: 'bg-blue-300', text: 'text-blue-600', bg: 'bg-blue-100' },
			med: { bar: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-100' },
			high: { bar: 'bg-blue-600', text: 'text-blue-800', bg: 'bg-blue-100' }
		},
		aiConfidence: {
			low: { bar: 'bg-violet-300', text: 'text-violet-600', bg: 'bg-violet-100' },
			med: { bar: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-100' },
			high: { bar: 'bg-violet-600', text: 'text-violet-800', bg: 'bg-violet-100' }
		}
	};

	const colors = $derived(colorSchemes[scoreType][intensity]);
	const width = $derived(score !== null ? `${score}%` : '0%');
</script>

<ScoreTooltip {score} type={scoreType} {context} flex>
	<div class="px-3 py-2 cursor-help">
		<div class="flex items-center justify-between mb-1">
			<span class="text-[10px] text-slate-500 uppercase tracking-wide">{label}</span>
			<span class="text-xs font-semibold {score !== null ? colors.text : 'text-slate-400'}">
				{score !== null ? Math.round(score) : '—'}
			</span>
		</div>
		<div class="h-1.5 rounded-full {colors.bg} overflow-hidden">
			{#if score !== null}
				<div class="h-full rounded-full {colors.bar} transition-all" style="width: {width}"></div>
			{/if}
		</div>
	</div>
</ScoreTooltip>
