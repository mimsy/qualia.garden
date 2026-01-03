<!-- ABOUTME: Reusable component for displaying agreement scores. -->
<!-- ABOUTME: Shows score value, colored bar, and descriptive label (0-100 scale). -->
<script lang="ts">
	import { getScoreLabel, getScoreLevel, type ScoreLevel } from '$lib/alignment';

	interface Props {
		score: number;
		label?: string;
		size?: 'sm' | 'md' | 'lg';
		showBar?: boolean;
	}

	let { score, label = '', size = 'md', showBar = true }: Props = $props();

	const level: ScoreLevel = $derived(getScoreLevel(score));
	const displayLabel: string = $derived(getScoreLabel(score));

	const colorClasses = {
		'very-high': 'text-green-600 bg-green-500',
		'high': 'text-green-500 bg-green-400',
		'moderate': 'text-amber-500 bg-amber-400',
		'low': 'text-orange-500 bg-orange-400',
		'very-low': 'text-red-500 bg-red-400'
	};

	const bgColorClasses = {
		'very-high': 'bg-green-100',
		'high': 'bg-green-50',
		'moderate': 'bg-amber-50',
		'low': 'bg-orange-50',
		'very-low': 'bg-red-50'
	};

	const sizeClasses = {
		sm: { text: 'text-sm', bar: 'h-1.5', container: 'gap-1' },
		md: { text: 'text-base', bar: 'h-2', container: 'gap-1.5' },
		lg: { text: 'text-lg', bar: 'h-2.5', container: 'gap-2' }
	};
</script>

<div class="flex flex-col {sizeClasses[size].container}">
	{#if label}
		<div class="text-xs text-gray-500">{label}</div>
	{/if}
	<div class="flex items-center gap-2">
		<span class="font-semibold {sizeClasses[size].text} {colorClasses[level].split(' ')[0]}">
			{Math.round(score)}
		</span>
		<span class="text-xs {colorClasses[level].split(' ')[0]}">{displayLabel}</span>
	</div>
	{#if showBar}
		<div class="w-full rounded-full {bgColorClasses[level]} {sizeClasses[size].bar}">
			<div
				class="h-full rounded-full {colorClasses[level].split(' ')[1]}"
				style="width: {score}%"
			></div>
		</div>
	{/if}
</div>
