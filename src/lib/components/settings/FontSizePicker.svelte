<script lang="ts">
  import { onMount } from 'svelte';
  import { Type } from '@lucide/svelte';
  import { FONT_LABEL, FONT_OPTIONS, applyFontSize, getFontSize, setFontSize, type FontSize } from '$lib/fontSize';

  let current: FontSize = 'normal';

  onMount(() => {
    current = getFontSize();
    applyFontSize(current);
  });

  function pick(size: FontSize) {
    current = size;
    setFontSize(size);
  }
</script>

<div class="grid gap-2">
  <p class="flex items-center gap-2 text-sm font-bold">
    <Type class="size-5 text-slate-400" />
    Ukuran Teks
  </p>
  <div class="grid grid-cols-3 gap-2" role="group" aria-label="Ukuran teks">
    {#each FONT_OPTIONS as opt (opt)}
      <button
        type="button"
        aria-pressed={current === opt}
        class={current === opt
          ? 'min-h-11 rounded-xl bg-ink-900 px-3 text-sm font-bold text-white'
          : 'min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600'}
        on:click={() => pick(opt)}
      >
        {FONT_LABEL[opt]}
      </button>
    {/each}
  </div>
</div>
