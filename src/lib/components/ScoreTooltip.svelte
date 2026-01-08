<script lang="ts">
	// ABOUTME: Rich tooltip component for score displays.
	// ABOUTME: Shows score value, level label, and contextual description.

	import type { Snippet } from 'svelte';
	import { getScoreLabel } from '$lib/alignment';

	type ScoreType = 'humanSimilarity' | 'aiConsensus' | 'aiConfidence';

	interface Props {
		score: number | null;
		type: ScoreType;
		children: Snippet;
		position?: 'top' | 'bottom';
	}

	let { score, type, children, position = 'bottom' }: Props = $props();

	let showTooltip = $state(false);

	// Score type metadata
	const scoreInfo: Record<ScoreType, { title: string; color: string; descriptions: Record<string, string> }> = {
		humanSimilarity: {
			title: 'Human Alignment',
			color: 'emerald',
			descriptions: {
				'Very High': 'AI responses closely match human opinion distributions',
				'High': 'AI responses align well with human opinions',
				'Moderate': 'Some alignment between AI and human responses',
				'Low': 'AI responses diverge from human opinions',
				'Very Low': 'AI and human responses show little similarity'
			}
		},
		aiConsensus: {
			title: 'AI Consensus',
			color: 'blue',
			descriptions: {
				'Very High': 'AI models show strong agreement on this question',
				'High': 'Most AI models respond similarly',
				'Moderate': 'AI models show mixed opinions',
				'Low': 'AI models disagree on this question',
				'Very Low': 'AI models show significant disagreement'
			}
		},
		aiConfidence: {
			title: 'Response Confidence',
			color: 'violet',
			descriptions: {
				'Very High': 'Responses are highly consistent across samples',
				'High': 'Responses show good consistency',
				'Moderate': 'Some variation in responses',
				'Low': 'Responses vary between samples',
				'Very Low': 'High variability in responses'
			}
		}
	};

	const info = $derived(scoreInfo[type]);
	const label = $derived(score !== null ? getScoreLabel(score) : null);
	const description = $derived(label ? info.descriptions[label] : null);

	// Color classes
	const colorClasses = $derived({
		emerald: {
			bg: 'bg-emerald-50',
			border: 'border-emerald-200',
			title: 'text-emerald-700',
			score: 'text-emerald-600',
			label: 'bg-emerald-100 text-emerald-700'
		},
		blue: {
			bg: 'bg-blue-50',
			border: 'border-blue-200',
			title: 'text-blue-700',
			score: 'text-blue-600',
			label: 'bg-blue-100 text-blue-700'
		},
		violet: {
			bg: 'bg-violet-50',
			border: 'border-violet-200',
			title: 'text-violet-700',
			score: 'text-violet-600',
			label: 'bg-violet-100 text-violet-700'
		}
	}[info.color]);
</script>

<div
	class="relative inline-block"
	onmouseenter={() => (showTooltip = true)}
	onmouseleave={() => (showTooltip = false)}
	onfocus={() => (showTooltip = true)}
	onblur={() => (showTooltip = false)}
	role="button"
	tabindex="0"
>
	{@render children()}

	{#if showTooltip && score !== null}
		<div
			class="absolute z-50 w-56 p-3 rounded-lg border shadow-lg {colorClasses.bg} {colorClasses.border}
				{position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
				left-1/2 -translate-x-1/2"
		>
			<!-- Arrow -->
			<div
				class="absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 {colorClasses.bg} {colorClasses.border}
					{position === 'top' ? 'bottom-[-5px] border-t-0 border-l-0' : 'top-[-5px] border-b-0 border-r-0'}"
			></div>

			<!-- Content -->
			<div class="relative">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-semibold uppercase tracking-wide {colorClasses.title}">
						{info.title}
					</span>
					<span class="px-1.5 py-0.5 text-xs font-medium rounded {colorClasses.label}">
						{label}
					</span>
				</div>
				<div class="flex items-baseline gap-1 mb-2">
					<span class="text-2xl font-bold {colorClasses.score}">{Math.round(score)}</span>
					<span class="text-sm text-slate-400">/ 100</span>
				</div>
				<p class="text-xs text-slate-600 leading-relaxed">
					{description}
				</p>
			</div>
		</div>
	{/if}
</div>
