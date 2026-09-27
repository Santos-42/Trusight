<script lang="ts">
  import { recoColor, recoLabel } from '$lib/format';
  export let score: number | null = null;
  export let grade: string | null = null;
  export let recommendation: string | null = null;
</script>

<div class="flex flex-wrap items-center gap-2">
  {#if score != null}
    <span class="rounded-2xl bg-slate-900 px-4 py-2 text-white font-extrabold text-lg">{score}<span class="text-xs font-medium text-slate-300">/100</span></span>
  {/if}
  {#if grade}<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">Grade {grade}</span>{/if}
  {#if recommendation}<span class="rounded-full px-3 py-1 text-xs font-bold {recoColor(recommendation)}">{recoLabel(recommendation)}</span>{/if}
</div>
