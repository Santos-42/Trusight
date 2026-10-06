<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ChevronLeft, CircleUserRound } from '@lucide/svelte';
  import ChatThread from '$lib/components/chat/ChatThread.svelte';
  import type { ChatMsg } from '$lib/components/chat/chat';
  import { api } from '$lib/api';
  import { getSession, requireAuth } from '$lib/guest';
  import { bumpThread } from '$lib/chatStore';
  $: id = $page.params.id ?? '';
  let msgs: ChatMsg[] = [];
  let loading = true;
  let peer = 'Calon Pembeli';
  onMount(async () => {
    const uid = getSession()?.id;
    if (uid) {
      const c = await api.get<{ id: string; buyer_id: string }[]>(`/conversations?userId=${encodeURIComponent(uid)}`);
      if (c.ok) {
        const mine = c.data.find((x) => x.id === id);
        if (mine?.buyer_id) {
          const u = await api.get<{ name: string }>(`/users/${encodeURIComponent(mine.buyer_id)}`);
          if (u.ok && u.data?.name) peer = u.data.name;
        }
      }
    }
    const r = await api.get<{ sender_id: string; body: string; created_at: string }[]>(
      `/messages?conversationId=${encodeURIComponent(id)}`);
    loading = false;
    if (r.ok) {
      const myId = getSession()?.id;
      msgs = r.data.map((m) => ({ me: m.sender_id === myId, text: m.body, time: String(m.created_at ?? '').slice(11, 16) }));
    }
  });
  async function send(text: string) {
    requireAuth(async () => {
      const uid = getSession()?.id ?? 'u-hendra';
      const optimistic: ChatMsg = { me: true, text, time: 'now' };
      msgs = [...msgs, optimistic];
      bumpThread(id);
      const r = await api.post('/messages', { conversationId: id, senderId: uid, body: text });
      if (!r.ok) msgs = [...msgs.filter((m) => m !== optimistic), { ...optimistic, time: 'gagal, coba lagi' }];
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
          <p class="text-[11px] tracking-wide text-slate-400">CALON PEMBELI</p>
        </div>
      </div>
    </ChatThread>
  {/if}
</div>
