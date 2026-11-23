<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ChevronLeft, CircleUserRound } from '@lucide/svelte';
  import ChatThread from '$lib/components/chat/ChatThread.svelte';
  import type { ChatMsg } from '$lib/components/chat/chat';
  import { api } from '$lib/api';
  import { getSession, requireAuth } from '$lib/guest';
  import { bumpThread, loadMsgs, saveMsgs } from '$lib/chatStore';
  $: id = $page.params.id ?? '';
  let msgs: ChatMsg[] = loadMsgs(`seller-${id}`, []);
  let loading = true;
  let peer = 'Calon Pembeli';
  let peerSub = 'CALON PEMBELI';
  onMount(async () => {
    const uid = getSession()?.id;
    // Detail percakapan live
    try {
      const conv = await api.get<{
        id: string; kind?: string; buyer_name?: string; vehicle_title?: string;
      }>(`/conversations/${encodeURIComponent(id)}`);
      if (conv.ok && conv.data) {
        const c = conv.data;
        const vTitle = c.vehicle_title ? c.vehicle_title.toUpperCase() : '';
        peer = c.buyer_name || 'Calon Pembeli';
        peerSub = vTitle ? `CALON PEMBELI • ${vTitle}` : 'CALON PEMBELI';
      }
    } catch {
      // Abaikan
    }

    const r = await api.get<{ sender_id: string; body: string; created_at: string }[]>(
      `/messages?conversationId=${encodeURIComponent(id)}`);
    loading = false;
    if (r.ok) {
      const myId = getSession()?.id;
      msgs = r.data.map((m) => ({ me: m.sender_id === myId, text: m.body, time: String(m.created_at ?? '').slice(11, 16) }));
      saveMsgs(`seller-${id}`, msgs);
    }
  });
  async function send(text: string) {
    requireAuth(async () => {
      const uid = getSession()?.id ?? 'u-hendra';
      const optimistic: ChatMsg = { me: true, text, time: 'now' };
      msgs = [...msgs, optimistic];
      saveMsgs(`seller-${id}`, msgs);
      bumpThread(id);
      const r = await api.post('/messages', { conversationId: id, senderId: uid, body: text });
      if (!r.ok) {
        msgs = [...msgs.filter((m) => m !== optimistic), { ...optimistic, time: 'gagal, coba lagi' }];
        saveMsgs(`seller-${id}`, msgs);
      }
    }, `/seller/messages/${id}`);
  }
</script>
<svelte:head><title>Chat Pembeli — Seller</title></svelte:head>
<div class="mx-auto max-w-md lg:max-w-2xl">
  {#if loading}
    <div class="py-8 text-center text-sm text-slate-400"><p>Memuat percakapan…</p></div>
  {:else}
    <ChatThread
      messages={msgs}
      onSend={send}
      placeholder="Balas pembeli..."
      topNote={!msgs.length ? 'Belum ada pesan — mulai percakapan' : ''}
    >
      <div slot="header" class="flex items-center gap-3">
        <a href="/seller/messages" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
        <CircleUserRound class="size-10 shrink-0 text-slate-300" />
        <div class="min-w-0">
          <p class="truncate font-bold">{peer}</p>
          <p class="text-[0.6875rem] tracking-wide text-slate-400">{peerSub}</p>
        </div>
      </div>
    </ChatThread>
  {/if}
</div>
