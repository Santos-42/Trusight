<script lang="ts">
  /**
   * Daftar thread inbox dengan 2 tab lawan bicara (mis. Penjual | Inspektur).
   * Satu percakapan order bisa muncul di dua tab — nama yang tampil adalah
   * lawan bicara pada tab tersebut.
   */
  import { CircleUserRound } from '@lucide/svelte';
  export let threads: {
    id: string;
    name: string;
    snippet: string;
    with: ('a' | 'b')[];
    nameA?: string;
    nameB?: string;
  }[] = [];
  export let tabA = 'Penjual';
  export let tabB = 'Inspektur';
  export let base = '/app/chat';
  export let emptyHint = 'Percakapan dengan pihak ini akan muncul di sini.';
  let tab: 'a' | 'b' = 'a';
  $: shown = threads.filter((t) => t.with.includes(tab));
  const label = (tab: 'a' | 'b') => (tab === 'a' ? tabA : tabB);
</script>

<div class="grid gap-3">
  <div class="flex gap-2">
    <button class="pill {tab === 'a' ? 'pill-blue' : ''}" on:click={() => (tab = 'a')}>
      {tabA} <span class="opacity-60">{threads.filter((t) => t.with.includes('a')).length}</span>
    </button>
    <button class="pill {tab === 'b' ? 'pill-blue' : ''}" on:click={() => (tab = 'b')}>
      {tabB} <span class="opacity-60">{threads.filter((t) => t.with.includes('b')).length}</span>
    </button>
  </div>
  {#if !shown.length}
    <div class="ts-card text-center">
      <p class="font-bold">Tidak ada percakapan {label(tab).toLowerCase()}</p>
      <p class="text-sm text-slate-500">{emptyHint}</p>
    </div>
  {:else}
    {#each shown as m}
      <a href={`${base}/${m.id}`} class="flex items-center gap-3 rounded-2xl border bg-white p-4">
        <CircleUserRound class="size-10 shrink-0 text-slate-300" />
        <span class="min-w-0">
          <p class="truncate text-sm font-bold">{tab === 'a' ? (m.nameA ?? m.name) : (m.nameB ?? m.name)}</p>
          <p class="truncate text-xs text-slate-500">{m.snippet}</p>
        </span>
      </a>
    {/each}
  {/if}
</div>
