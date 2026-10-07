<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ChevronLeft, CircleUserRound } from '@lucide/svelte';
  import ChatThread from '$lib/components/chat/ChatThread.svelte';
  import type { ChatMsg } from '$lib/components/chat/chat';
  import { api } from '$lib/api';
  import { getSession, requireAuth } from '$lib/guest';
  import { bumpThread, loadMsgs, saveMsgs } from '$lib/chatStore';
  $: id = $page.params.id ?? '1';
  const peers: Record<string, { n: string; s: string }> = {
    '1': { n: 'Firman Comstir', s: 'EXPERT VERIFIER' },
    '2': { n: 'Rian F.', s: 'PEMBELI • CIVIC TURBO 2021' }
  };
  const defaults: Record<string, ChatMsg[]> = {
    '1': [
      { me: false, text: "I've just completed the cold start and bore scope inspection on the Porsche 911 engine. The diagnostic is looking very healthy; compression values are within 2% across all cylinders.", time: '10:42 AM' },
      { me: false, text: '', time: '10:43 AM', file: { name: 'Engine_Diagnostic_Full.pdf', meta: '2.4 MB • PDF' } },
      { me: true, text: "That's fantastic news. Did you notice any particular moisture in the rear main seal area during the lift inspection?", time: '10:45 AM' },
      { me: false, text: 'The RMS is bone dry. I also checked the intermediate shaft (IMS) bearing flange — it appears to be the upgraded ceramic version installed in 2021.', time: '10:47 AM' }
    ],
    '2': [{ me: false, text: 'Baik pak, saya tunggu di lokasi jam 2 siang ya.', time: '10:30' }]
  };
  $: peer = peers[id] ?? peers['1'];
  // Riwayat selalu persist lokal — tidak hilang walau keluar obrolan
  let msgs: ChatMsg[] = loadMsgs(`insp-${id}`, defaults[id] ?? defaults['1']);
  let live = false;
  onMount(async () => {
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<{ sender_id: string; body: string; created_at: string }[]>(
      `/messages?conversationId=${encodeURIComponent(id)}`);
    if (r.ok && r.data.length) {
      live = true;
      msgs = r.data.map((m) => ({ me: m.sender_id === uid, text: m.body, time: String(m.created_at ?? '').slice(11, 16) }));
      saveMsgs(`insp-${id}`, msgs);
    }
  });
  async function send(text: string) {
    requireAuth(async () => {
      const uid = getSession()?.id ?? 'u-bsantoso';
      const optimistic: ChatMsg = { me: true, text, time: 'now' };
      msgs = [...msgs, optimistic];
      saveMsgs(`insp-${id}`, msgs);
      bumpThread(id);
      if (!live) return;
      const r = await api.post('/messages', { conversationId: id, senderId: uid, body: text });
      if (!r.ok) {
        msgs = [...msgs.filter((m) => m !== optimistic), { ...optimistic, time: 'gagal, coba lagi' }];
        saveMsgs(`insp-${id}`, msgs);
      }
    }, `/inspector/messages/${id}`);
  }
</script>
<svelte:head><title>Pesan Kerja — Inspector</title></svelte:head>
<div class="mx-auto max-w-md lg:max-w-2xl">
  <ChatThread messages={msgs} onSend={send} placeholder="Type a message…" topNote={id === '1' ? 'TODAY, OCT 24' : ''}>
    <div slot="header" class="flex items-center gap-3">
      <a href="/inspector/messages" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
      <CircleUserRound class="size-10 shrink-0 text-slate-300" />
      <div class="min-w-0">
        <p class="truncate font-bold">{peer.n}</p>
        <p class="text-[11px] tracking-wide text-slate-400">{peer.s}</p>
      </div>
    </div>
  </ChatThread>
</div>
