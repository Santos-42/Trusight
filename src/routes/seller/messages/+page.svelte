<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft } from '@lucide/svelte';
  import ThreadList from '$lib/components/chat/ThreadList.svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  import { sortThreads } from '$lib/chatStore';
  type Thread = { id: string; name: string; snippet: string; with: ('a' | 'b')[]; nameA?: string; nameB?: string };
  // Seller hanya punya SATU lawan bicara: calon pembeli (yaitu inspektor yang sedang
  // bertugas, menyamar sebagai calon pembeli biasa). Tidak ada tab, tidak ada
  // percakapan dengan pembeli sungguhan — itu justru yang membahayakan kerahasiaan.
  let threads: Thread[] = [];
  onMount(async () => {
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<{
      id: string; order_id: string; last_msg?: string; kind?: string;
      buyer_name?: string | null; inspector_name?: string | null;
    }[]>(`/conversations?userId=${encodeURIComponent(uid)}`);
    if (r.ok) {
      const mapped: Thread[] = r.data
        .filter((c) => c.kind === 'sale')
        .map((c) => ({
          id: c.id,
          name: c.inspector_name ?? 'Calon pembeli',
          snippet: c.last_msg ?? 'Belum ada pesan',
          with: ['a'] as ('a' | 'b')[]
        }));
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
  <ThreadList {threads} single base="/seller/messages"
    emptyHint="Percakapan dengan calon pembeli akan muncul di sini." />
</div>
