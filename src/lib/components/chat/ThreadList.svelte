<script lang="ts">
  /**
   * Daftar thread inbox.
   * - Mode tab (default): 2 lawan bicara (mis. Penjual | Inspektor). Satu percakapan
   *   order bisa muncul di dua tab — nama yang tampil adalah lawan bicara tab tersebut.
   * - Mode `single`: tanpa tab, satu daftar. Dipakai seller yang hanya punya satu
   *   lawan bicara (calon pembeli — yaitu inspektor yang sedang bertugas).
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
  export let tabB = 'Inspektor';
  export let base = '/app/chat';
  export let emptyHint = 'Percakapan dengan pihak ini akan muncul di sini.';
  /** Sembunyikan tab — seluruh thread jadi satu daftar. */
  export let single = false;
  let tab: 'a' | 'b' = 'a';
  $: shown = single ? threads : threads.filter((t) => t.with.includes(tab));
  $: emptyTitle = single ? 'Belum ada percakapan' : `Tidak ada percakapan ${(tab === 'a' ? tabA : tabB).toLowerCase()}`;
  const nameOf = (m: (typeof threads)[number]) => (single ? m.name : tab === 'a' ? (m.nameA ?? m.name) : (m.nameB ?? m.name));
</script>

<div class="grid gap-3">
  {#if !single}
    <div class="flex gap-2">
      <button class="pill {tab === 'a' ? 'pill-blue' : ''}" on:click={() => (tab = 'a')}>
        {tabA} <span class="opacity-60">{threads.filter((t) => t.with.includes('a')).length}</span>
      </button>
      <button class="pill {tab === 'b' ? 'pill-blue' : ''}" on:click={() => (tab = 'b')}>
        {tabB} <span class="opacity-60">{threads.filter((t) => t.with.includes('b')).length}</span>
      </button>
    </div>
  {/if}
  {#if !shown.length}
    <div class="ts-card text-center">
      <p class="font-bold">{emptyTitle}</p>
      <p class="text-sm text-slate-500">{emptyHint}</p>
    </div>
  {:else}
    {#each shown as m}
      <a href={`${base}/${m.id}`} class="flex items-center gap-3 rounded-2xl border bg-white p-4">
        <CircleUserRound class="size-10 shrink-0 text-slate-300" />
        <span class="min-w-0">
          <p class="truncate text-sm font-bold">{nameOf(m)}</p>
          <p class="truncate text-xs text-slate-500">{m.snippet}</p>
        </span>
      </a>
    {/each}
  {/if}
</div>
