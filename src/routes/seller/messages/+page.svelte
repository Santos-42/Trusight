<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, CircleUserRound } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  import { sortThreads } from '$lib/chatStore';
  type Thread = { id: string; n: string; t: string };
  let threads: Thread[] = [];
  onMount(async () => {
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<{ id: string; order_id: string; last_msg?: string }[]>(`/conversations?userId=${encodeURIComponent(uid)}`);
    if (r.ok) {
      threads = sortThreads(r.data.map((c) => ({ id: c.id, n: `Order ${c.order_id}`, t: c.last_msg ?? 'Belum ada pesan' })));
    }
  });
</script>
<svelte:head><title>Pesan Masuk — Seller</title></svelte:head>
<div class="mx-auto grid max-w-md gap-3 lg:max-w-2xl">
  <div class="ts-appbar-flush">
    <a href="/seller" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <p class="ts-appbar-title">Pesan Masuk</p>
  </div>
  {#if !threads.length}
    <div class="ts-card text-center">
      <p class="font-bold">Belum ada percakapan</p>
      <p class="text-sm text-slate-500">Chat dengan calon pembeli muncul di sini setelah ada order.</p>
    </div>
  {:else}
    {#each threads as m}
      <a href={`/seller/messages/${m.id}`} class="flex items-center gap-3 rounded-2xl border bg-white p-4"><CircleUserRound class="size-10 shrink-0 text-slate-300" /><span><p class="text-sm font-bold">{m.n}</p><p class="text-xs text-slate-500">{m.t}</p></span></a>
    {/each}
  {/if}
</div>
