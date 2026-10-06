<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ChevronLeft, CircleUserRound } from '@lucide/svelte';
  import ChatThread from '$lib/components/chat/ChatThread.svelte';
  import type { ChatMsg } from '$lib/components/chat/chat';
  import { loadMsgs, saveMsgs, bumpThread } from '$lib/chatStore';
  import { api } from '$lib/api';
  import { getSession, requireAuth } from '$lib/guest';
  $: id = $page.params.id ?? '1';
  $: isSeed = id === '1';
  const seedMsgs: ChatMsg[] = [{ me: false, text: 'Baik pak, saya tunggu di lokasi jam 2 siang ya.', time: '10:30' }];
  let msgs: ChatMsg[] = isSeed ? loadMsgs('buyer-1', seedMsgs) : [];
  let loading = !isSeed;
  let peer = 'Hendra Wijaya';
  let peerSub = 'PENJUAL • CIVIC TURBO 2021';
  onMount(async () => {
    if (isSeed) return;
    const uid = getSession()?.id;
    // Nama lawan bicara dari conversation bila tersedia
    if (uid) {
      const c = await api.get<{ id: string; seller_id: string }[]>(`/conversations?userId=${encodeURIComponent(uid)}`);
      if (c.ok) {
        const mine = c.data.find((x) => x.id === id);
        if (mine?.seller_id) {
          const u = await api.get<{ name: string }>(`/users/${encodeURIComponent(mine.seller_id)}`);
          if (u.ok && u.data?.name) peer = u.data.name;
        }
      }
    }
    const r = await api.get<{ sender_id: string; body: string; created_at: string }[]>(
      `/messages?conversationId=${encodeURIComponent(id)}`);
    loading = false;
    if (r.ok && r.data.length) {
      const myId = getSession()?.id;
      msgs = r.data.map((m) => ({ me: m.sender_id === myId, text: m.body, time: String(m.created_at ?? '').slice(11, 16) }));
    } else if (r.ok) {
      msgs = [];
    } else {
      msgs = loadMsgs(`buyer-${id}`, []);
    }
  });
  async function send(text: string) {
    requireAuth(async () => {
      const uid = getSession()?.id ?? 'u-mock';
      const optimistic: ChatMsg = { me: true, text, time: 'now' };
      msgs = [...msgs, optimistic];
      bumpThread(id);
      if (!isSeed) saveMsgs(`buyer-${id}`, msgs);
      if (!isSeed) {
        const r = await api.post('/messages', { conversationId: id, senderId: uid, body: text });
        if (!r.ok) {
          msgs = [...msgs.filter((m) => m !== optimistic), { ...optimistic, time: 'gagal, coba lagi' }];
          saveMsgs(`buyer-${id}`, msgs);
        }
      } else if (isSeed) {
        saveMsgs('buyer-1', msgs);
      }
    }, `/app/chat/${id}`);
  }
</script>
<svelte:head><title>Chat — TruSight</title></svelte:head>
<div class="mx-auto max-w-md lg:max-w-2xl">
  {#if loading}
    <div class="grid gap-2 py-8 text-center text-sm text-slate-400">
      <p>Memuat percakapan…</p>
    </div>
  {:else}
    <ChatThread
      messages={msgs}
      onSend={send}
      placeholder="Tulis pesan..."
      topNote={!msgs.length ? 'Belum ada pesan — mulai percakapan' : ''}
    >
      <div slot="header" class="flex items-center gap-3">
        <a href="/app/inbox" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
        <CircleUserRound class="size-10 shrink-0 text-slate-300" />
        <div class="min-w-0">
          <p class="truncate font-bold">{peer}</p>
          <p class="text-[11px] tracking-wide text-slate-400">{peerSub}</p>
        </div>
      </div>
    </ChatThread>
  {/if}
</div>
