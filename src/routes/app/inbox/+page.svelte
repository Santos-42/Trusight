<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, CircleUserRound, Inbox as InboxIcon } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { authed, getSession } from '$lib/guest';
  import { sortThreads } from '$lib/chatStore';
  type Thread = { id: string; n: string; t: string };
  const seed: Thread[] = [
    { id: '1', n:'Firman Comstir', t:'The engine diagnostic for the 9… • 2M AGO' },
    { id: '1', n:'Adi Bengkel', t:"I've uploaded the paint thickness re… • 1H AGO" },
    { id: '1', n:'TruSight Support', t:'Your verification request #TS-9822 … • 3H AGO' }
  ];
  let threads: Thread[] = seed;
  onMount(async () => {
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<{ id: string; order_id: string; last_msg?: string }[]>(`/conversations?userId=${encodeURIComponent(uid)}`);
    if (r.ok && r.data.length) {
      threads = sortThreads(r.data.map((c) => ({ id: c.id, n: `Order ${c.order_id}`, t: c.last_msg ?? 'Belum ada pesan' })));
    }
  });
</script>
<svelte:head><title>Inbox — TruSight</title></svelte:head>
<div class="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
  <div class="flex items-center gap-3 sm:col-span-full">
    <a href="/app/home" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <h1 class="text-xl font-extrabold">Inbox</h1>
  </div>
  {#if $authed}
    {#each threads as m}
      <a href={`/app/chat/${m.id}`} class="flex items-center gap-3 rounded-2xl border bg-white p-4"><CircleUserRound class="size-10 shrink-0 text-slate-300" /><span><p class="font-bold text-sm">{m.n}</p><p class="text-xs text-slate-500">{m.t}</p></span></a>
    {/each}
  {:else}
    <div class="grid justify-items-center gap-2 rounded-2xl border bg-white p-10 text-center sm:col-span-full">
      <InboxIcon class="size-10 text-slate-300" />
      <p class="font-bold">No inbox available</p>
      <p class="max-w-xs text-[13px] text-slate-500">Login untuk melihat pesan verifikator dan notifikasi order.</p>
      <a href="/login?returnTo=%2Fapp%2Finbox" class="btn-navy mt-1">Login / Register</a>
    </div>
  {/if}
</div>
