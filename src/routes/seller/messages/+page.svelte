<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft } from '@lucide/svelte';
  import ThreadList from '$lib/components/chat/ThreadList.svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  import { sortThreads } from '$lib/chatStore';
  type Thread = { id: string; name: string; snippet: string; with: ('a' | 'b')[]; nameA?: string; nameB?: string };
  // Tab A = Pembeli, Tab B = Inspektur
  let threads: Thread[] = [];
  onMount(async () => {
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<{
      id: string; order_id: string; last_msg?: string;
      buyer_name?: string | null; inspector_name?: string | null;
    }[]>(`/conversations?userId=${encodeURIComponent(uid)}`);
    if (r.ok) {
      const mapped: Thread[] = r.data.map((c) => {
        const with_ = ([] as ('a' | 'b')[]).concat(c.buyer_name ? ['a'] : [], c.inspector_name ? ['b'] : []);
        return {
          id: c.id, name: c.buyer_name ?? c.inspector_name ?? `Order ${c.order_id}`,
          snippet: c.last_msg ?? 'Belum ada pesan', with: with_.length ? with_ : ['a'],
          nameA: c.buyer_name ?? 'Pembeli', nameB: c.inspector_name ?? 'Belum ada inspektur'
        };
      });
      threads = sortThreads(mapped);
    }
  });
</script>
<svelte:head><title>Pesan Masuk — Seller</title></svelte:head>
<div class="grid gap-3">
  <div class="flex items-center gap-3">
    <a href="/seller" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <h1 class="text-xl font-extrabold">Pesan Masuk</h1>
  </div>
  <ThreadList {threads} tabA="Pembeli" tabB="Inspektur" base="/seller/messages"
    emptyHint="Percakapan dengan pihak ini akan muncul di sini." />
</div>
