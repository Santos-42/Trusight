<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, CircleUserRound } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  type Thread = { id: string; n: string; s: string; t: string };
  const seed: Thread[] = [
    { id: '1', n: 'Firman Comstir', s: 'EXPERT VERIFIER', t: 'The RMS is bone dry… • 10:47 AM' },
    { id: '2', n: 'Rian F.', s: 'PEMBELI • CIVIC TURBO 2021', t: 'Baik pak, saya tunggu… • 10:30' }
  ];
  let threads: Thread[] = seed;
  onMount(async () => {
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<{ id: string; order_id: string; last_msg?: string }[]>(`/conversations?userId=${encodeURIComponent(uid)}`);
    if (r.ok && r.data.length) {
      threads = r.data.map((c) => ({ id: c.id, n: `Order ${c.order_id}`, s: 'PERCAKAPAN ORDER', t: c.last_msg ?? 'Belum ada pesan' }));
    }
  });
</script>
<svelte:head><title>Chat Pembeli — Inspector</title></svelte:head>
<div class="mx-auto grid max-w-md gap-3 px-1 pb-6 lg:max-w-2xl">
  <div class="flex items-center gap-3">
    <a href="/inspector" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <h1 class="text-xl font-extrabold">Chat Pembeli</h1>
  </div>
  {#each threads as th}
    <a href={`/inspector/messages/${th.id}`} class="flex items-center gap-3 rounded-2xl border bg-white p-4">
      <CircleUserRound class="size-10 shrink-0 text-slate-300" />
      <span class="min-w-0"><p class="truncate font-bold text-sm">{th.n}</p><p class="truncate text-[11px] text-slate-400">{th.s}</p><p class="truncate text-xs text-slate-500">{th.t}</p></span>
    </a>
  {/each}
</div>
