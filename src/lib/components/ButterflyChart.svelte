<script lang="ts">
	// ABOUTME: Butterfly chart component for AI vs Human distribution comparison.
	// ABOUTME: Shows side-by-side bars with AI (blue) on left, Human (green) on right.

	interface Result {
		answer: string;
		label: string;
		percentage: number;
	}

	let {
		aiResults,
		humanResults,
		options
	}: {
		aiResults: Result[];
		humanResults: Result[];
		options: string[];
	} = $props();

	const maxPct = $derived(Math.max(...aiResults.map((r) => r.percentage), ...humanResults.map((r) => r.percentage), 1));

	// Track mode (highest percentage) for each side
	const aiMaxPct = $derived(Math.max(...aiResults.map((r) => r.percentage), 0));
	const humanMaxPct = $derived(Math.max(...humanResults.map((r) => r.percentage), 0));

	// Find top answer keys for highlighting
	const aiTopAnswer = $derived(aiResults.find((r) => r.percentage === aiMaxPct)?.answer);
	const humanTopAnswer = $derived(humanResults.find((r) => r.percentage === humanMaxPct)?.answer);

	// Calculate center column width based on longest option (~7px per char at text-[11px])
	const maxOptionLength = $derived(Math.max(...options.map((o) => o.length), 3));
	const centerWidth = $derived(Math.min(Math.max(maxOptionLength * 7 + 12, 40), 140));
</script>

<!-- Column headers -->
<div class="flex items-center text-xs text-slate-500 mb-1">
	<span class="w-9 shrink-0"></span>
	<div class="flex-1 text-right pr-1 font-medium text-blue-600">AI</div>
	<div class="shrink-0" style="width: {centerWidth}px"></div>
	<div class="flex-1 text-left pl-1 font-medium text-emerald-600">Human</div>
	<span class="w-9 shrink-0"></span>
</div>

<!-- Chart rows -->
<div class="space-y-0.5">
	{#each options as option, i (option)}
		{@const optionKey = String(i + 1)}
		{@const aiResult = aiResults.find((r) => r.answer === optionKey)}
		{@const humanResult = humanResults.find((r) => r.answer === optionKey || r.label === option)}
		{@const aiPct = aiResult?.percentage ?? 0}
		{@const humanPct = humanResult?.percentage ?? 0}
		{@const isAiTop = optionKey === aiTopAnswer}
		{@const isHumanTop =
			optionKey === humanTopAnswer || option === humanResults.find((r) => r.percentage === humanMaxPct)?.label}
		{@const isBothTop = isAiTop && isHumanTop}
		<div class="flex items-center text-xs">
			<span class="w-9 text-right tabular-nums shrink-0 {isAiTop ? 'text-blue-600 font-semibold' : 'text-slate-400'}">
				{aiPct.toFixed(0)}%
			</span>
			<div class="flex-1 h-2 bg-slate-100 rounded-l overflow-hidden flex justify-end ml-1">
				<div class="h-full bg-blue-500 rounded-l transition-all" style="width: {(aiPct / maxPct) * 100}%"></div>
			</div>
			<div class="text-center truncate px-1 shrink-0 text-[11px]" style="width: {centerWidth}px" title={option}>
				{#if isBothTop}
					<span
						class="font-bold"
						style="background: linear-gradient(90deg, #2563eb, #10b981); -webkit-background-clip: text; background-clip: text; color: transparent;"
						>{option}</span
					>
				{:else if isAiTop}
					<span class="font-bold text-blue-600">{option}</span>
				{:else if isHumanTop}
					<span class="font-bold text-emerald-600">{option}</span>
				{:else}
					<span class="text-slate-600">{option}</span>
				{/if}
			</div>
			<div class="flex-1 h-2 bg-slate-100 rounded-r overflow-hidden mr-1">
				<div class="h-full bg-emerald-500 rounded-r transition-all" style="width: {(humanPct / maxPct) * 100}%"></div>
			</div>
			<span class="w-9 tabular-nums shrink-0 {isHumanTop ? 'text-emerald-600 font-semibold' : 'text-slate-400'}">
				{humanPct.toFixed(0)}%
			</span>
		</div>
	{/each}
</div>
