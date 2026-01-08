<script lang="ts">
  // ABOUTME: Unified question card component with full statistics display.
  // ABOUTME: Shows question text, butterfly chart, score bars, and source/category footer.

  import type { QuestionWithStats } from '$lib/db/question-stats';
  import ButterflyChart from './ButterflyChart.svelte';
  import ScoreBadge from './ScoreBadge.svelte';

  let { question, showCategory = false, showSource = false } = $props<{
    question: QuestionWithStats;
    showCategory?: boolean;
    showSource?: boolean;
  }>();
</script>

<div class="bg-white rounded-xl border border-slate-200 overflow-hidden h-full flex flex-col">
  <!-- Question Header -->
  <div class="p-5 pb-4">
    <a
      href="/questions/{question.id}"
      class="text-slate-800 hover:text-blue-600 transition-colors font-medium leading-relaxed text-sm"
    >
      {question.text}
    </a>
  </div>

  <!-- Butterfly Chart or Fallback -->
  <div class="px-5">
    {#if question.modelCount > 0 && question.options.length > 0}
      <ButterflyChart
        aiResults={question.aiResults}
        humanResults={question.humanResults}
        options={question.options}
      />
    {:else if question.modelCount > 0}
      <div class="text-xs text-slate-400 py-2 text-center">
        Results available on detail page
      </div>
    {:else}
      <div class="text-xs text-slate-400 py-4 text-center">
        No AI responses yet
      </div>
    {/if}
  </div>

  <!-- Score Bars Footer -->
  <div class="flex border-t border-slate-100 mt-auto pt-1">
    <ScoreBadge score={question.humanSimilarity} label="Human Sim" type="humanSimilarity" />
    <div class="w-px bg-slate-100"></div>
    <ScoreBadge score={question.aiConsensus} label="AI Consensus" type="aiConsensus" />
    <div class="w-px bg-slate-100"></div>
    <ScoreBadge score={question.aiConfidence} label="AI Confidence" type="aiConfidence" />
  </div>

  <!-- Footer with source/category links -->
  {#if (showSource && question.sourceShortName && question.sourceId) || (showCategory && question.category)}
    <div class="flex border-t border-slate-100 text-xs">
      {#if showSource && question.sourceShortName && question.sourceId}
        <a
          href="/sources/{question.sourceId}"
          class="flex-1 py-2 px-4 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors truncate"
        >
          <span class="text-slate-400">Source:</span> {question.sourceShortName}
        </a>
      {/if}
      {#if showCategory && question.category}
        <a
          href="/categories/{encodeURIComponent(question.category)}"
          class="flex-1 py-2 px-4 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors truncate {showSource && question.sourceShortName ? 'border-l border-slate-100' : ''}"
        >
          <span class="text-slate-400">Category:</span> {question.category}
        </a>
      {/if}
    </div>
  {/if}
</div>
