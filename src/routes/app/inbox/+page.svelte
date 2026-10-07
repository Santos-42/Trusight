<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, Inbox as InboxIcon } from '@lucide/svelte';
  import ThreadList from '$lib/components/chat/ThreadList.svelte';
  import { api } from '$lib/api';
  import { authed, getSession } from '$lib/guest';
  import { sortThreads } from '$lib/chatStore';
  type Thread = { id: string; name: string; snippet: string; with: ('a' | 'b')[]; nameA?: string; nameB?: string };
  // Tab A = Penjual, Tab B = Inspektur
  const seed: Thread[] = [
    { id: '1', name: 'Firman Comstir', snippet: 'The engine diagnostic for the 9… • 2M AGO', with: ['b'] },
    { id: '1', name: 'Adi Bengkel', snippet: "I've uploaded the paint thickness re… • 1H AGO", with: ['a'] },
    { id: '1', name: 'TruSight Support', snippet: 'Your verification request #TS-9822 … • 3H AGO', with: ['a'] }
  ];
  let threads: Thread[] = seed;
  onMount(async () => {
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<{
      id: string; order_id: string; last_msg?: string;
      seller_name?: string | null; inspector_name?: string | null;
    }[]>(`/conversations?userId=${encodeURIComponent(uid)}`);
    if (r.ok && r.data.length) {
      const mapped: Thread[] = r.data.map((c) => {
        const with_ = ([] as ('a' | 'b')[]).concat(c.seller_name ? ['a'] : [], c.inspector_name ? ['b'] : []);
        return {
          id: c.id, name: c.seller_name ?? c.inspector_name ?? `Order ${c.order_id}`,
          snippet: c.last_msg ?? 'Belum ada pesan', with: with_.length ? with_ : ['a'],
          nameA: c.seller_name ?? `Order ${c.order_id}`, nameB: c.inspector_name ?? 'Belum ada inspektur'
        };
      });
      threads = sortThreads(mapped);
    }
  });
</script>
<svelte:head><title>Inbox — TruSight</title></svelte:head>
<div class="grid gap-3">
  <div class="flex items-center gap-3">
    <a href="/app/home" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <h1 class="text-xl font-extrabold">Inbox</h1>
  </div>
  {#if $authed}
    <ThreadList {threads} tabA="Penjual" tabB="Inspektur" base="/app/chat" />
  {:else}
    <div class="grid justify-items-center gap-2 rounded-2xl border bg-white p-10 text-center">
      <InboxIcon class="size-10 text-slate-300" />
      <p class="font-bold">No inbox available</p>
      <p class="max-w-xs text-[13px] text-slate-500">Login untuk melihat pesan verifikator dan notifikasi order.</p>
      <a href="/login?returnTo=%2Fapp%2Finbox" class="btn-navy mt-1">Login / Register</a>
    </div>
  {/if}
</div>
