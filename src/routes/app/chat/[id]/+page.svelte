<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ChevronLeft, CircleUserRound } from '@lucide/svelte';
  import ChatThread from '$lib/components/chat/ChatThread.svelte';
  import type { ChatMsg } from '$lib/components/chat/chat';
  import { loadMsgs, saveMsgs } from '$lib/chatStore';
  import { api } from '$lib/api';
  import { getSession, requireAuth } from '$lib/guest';
  $: id = $page.params.id ?? '1';
  const defaults: ChatMsg[] = [{ me: false, text: 'Baik pak, saya tunggu di lokasi jam 2 siang ya.', time: '10:30' }];
  let msgs: ChatMsg[] = loadMsgs(`buyer-${id}`, defaults);
  let live = false;
  onMount(async () => {
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<{ sender_id: string; sender: string; body: string; created_at: string }[]>(
      `/messages?conversationId=${encodeURIComponent(id)}`);
    if (r.ok) {
      live = true;
      msgs = r.data.map((m) => ({ me: m.sender_id === uid, text: m.body, time: String(m.created_at ?? '').slice(11, 16) }));
    }
  });
  function send(text: string) {
    requireAuth(() => {
      const uid = getSession()?.id ?? 'u-mock';
      if (live) {
        void api.post('/messages', { conversationId: id, senderId: uid, body: text }).then((r) => {
          if (r.ok) msgs = [...msgs, { me: true, text, time: 'now' }];
        });
      } else {
        msgs = [...msgs, { me: true, text, time: 'now' }];
        saveMsgs(`buyer-${id}`, msgs);
      }
    }, `/app/chat/${id}`);
  }
</script>
<svelte:head><title>Chat — TruSight</title></svelte:head>
<div class="mx-auto max-w-md lg:max-w-2xl">
  <ChatThread messages={msgs} onSend={send} placeholder="Tulis pesan...">
    <div slot="header" class="flex items-center gap-3">
      <a href="/app/inbox" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
      <CircleUserRound class="size-10 shrink-0 text-slate-300" />
      <div class="min-w-0">
        <p class="truncate font-bold">Rian F. (Civic)</p>
        <p class="text-[11px] tracking-wide text-slate-400">CALON PEMBELI</p>
      </div>
    </div>
  </ChatThread>
</div>
