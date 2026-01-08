<script lang="ts">
	// ABOUTME: Rich tooltip component for score displays.
	// ABOUTME: Shows score value, level label, and contextual description.

	import type { Snippet } from 'svelte';
	import { getScoreLabel } from '$lib/alignment';

	type ScoreType = 'humanSimilarity' | 'aiConsensus' | 'aiConfidence';

	type Context = 'question' | 'model' | 'aggregate';

	interface Props {
		score: number | null;
		type: ScoreType;
		children: Snippet;
		position?: 'top' | 'bottom';
		flex?: boolean;
		context?: Context;
	}

	let { score, type, children, position = 'bottom', flex = false, context = 'question' }: Props = $props();

	let showTooltip = $state(false);
	let triggerEl: HTMLDivElement | null = $state(null);
	let tooltipPosition = $state({ top: 0, left: 0 });

	// Update tooltip position when showing
	function updatePosition() {
		if (!triggerEl) return;
		const rect = triggerEl.getBoundingClientRect();
		const tooltipWidth = 224; // w-56 = 14rem = 224px

		let left = rect.left + rect.width / 2 - tooltipWidth / 2;
		// Keep tooltip within viewport
		left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));

		const top = position === 'top'
			? rect.top - 8 // Will be positioned above with bottom-full
			: rect.bottom + 8;

		tooltipPosition = { top, left };
	}

	function handleMouseEnter() {
		updatePosition();
		showTooltip = true;
	}

	// Score type metadata with context-specific descriptions
	const scoreInfo: Record<ScoreType, { title: string; color: string; descriptions: Record<Context, Record<string, string>> }> = {
		humanSimilarity: {
			title: 'Human Alignment',
			color: 'emerald',
			descriptions: {
				question: {
					'Very High': 'AI responses closely match human opinion distributions',
					'High': 'AI responses align well with human opinions',
					'Moderate': 'Some alignment between AI and human responses',
					'Low': 'AI responses diverge from human opinions',
					'Very Low': 'AI and human responses show little similarity'
				},
				model: {
					'Very High': 'This model closely matches human opinion distributions',
					'High': 'This model aligns well with human opinions',
					'Moderate': 'Some alignment with human responses',
					'Low': 'This model diverges from human opinions',
					'Very Low': 'This model shows little similarity to humans'
				},
				aggregate: {
					'Very High': 'AI responses closely match human opinions across these questions',
					'High': 'AI responses generally align with human opinions',
					'Moderate': 'Mixed alignment between AI and human responses',
					'Low': 'AI responses tend to diverge from human opinions',
					'Very Low': 'AI and human responses show little similarity overall'
				}
			}
		},
		aiConsensus: {
			title: 'AI Consensus',
			color: 'blue',
			descriptions: {
				question: {
					'Very High': 'AI models show strong agreement on this question',
					'High': 'Most AI models respond similarly',
					'Moderate': 'AI models show mixed opinions',
					'Low': 'AI models disagree on this question',
					'Very Low': 'AI models show significant disagreement'
				},
				model: {
					'Very High': 'This model strongly agrees with other AI models',
					'High': 'This model mostly agrees with other AI models',
					'Moderate': 'This model partially agrees with other AI models',
					'Low': 'This model disagrees with most other AI models',
					'Very Low': 'This model is an outlier among AI models'
				},
				aggregate: {
					'Very High': 'AI models show strong agreement across these questions',
					'High': 'AI models generally agree across these questions',
					'Moderate': 'AI models show mixed agreement',
					'Low': 'AI models tend to disagree across these questions',
					'Very Low': 'AI models show significant disagreement overall'
				}
			}
		},
		aiConfidence: {
			title: 'Response Confidence',
			color: 'violet',
			descriptions: {
				question: {
					'Very High': 'Responses are highly consistent across samples',
					'High': 'Responses show good consistency',
					'Moderate': 'Some variation in responses',
					'Low': 'Responses vary between samples',
					'Very Low': 'High variability in responses'
				},
				model: {
					'Very High': 'This model responds very consistently',
					'High': 'This model responds consistently',
					'Moderate': 'This model shows some variation in responses',
					'Low': 'This model gives varying answers',
					'Very Low': 'This model is highly inconsistent'
				},
				aggregate: {
					'Very High': 'AI responses are highly consistent across these questions',
					'High': 'AI responses show good consistency overall',
					'Moderate': 'Some variation in AI responses across questions',
					'Low': 'AI responses vary across these questions',
					'Very Low': 'High variability in AI responses overall'
				}
			}
		}
	};

	const info = $derived(scoreInfo[type]);
	const label = $derived(score !== null ? getScoreLabel(score) : null);
	const description = $derived(label ? info.descriptions[context][label] : null);

	// Color classes
	const colorMap = {
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
	} as const;
	const colorClasses = $derived(colorMap[info.color as keyof typeof colorMap]);
</script>

<div
	bind:this={triggerEl}
	class="relative {flex ? 'flex-1' : 'inline-block'}"
	onmouseenter={handleMouseEnter}
	onmouseleave={() => (showTooltip = false)}
	onfocus={handleMouseEnter}
	onblur={() => (showTooltip = false)}
	role="button"
	tabindex="0"
>
	{@render children()}
</div>

{#if showTooltip && score !== null}
	<div
		class="fixed z-[100] w-56 p-3 rounded-lg border shadow-lg {colorClasses.bg} {colorClasses.border}"
		style="top: {tooltipPosition.top}px; left: {tooltipPosition.left}px;"
	>
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
