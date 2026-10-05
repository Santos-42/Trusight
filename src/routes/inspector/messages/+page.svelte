<script lang="ts">
  import { ChevronLeft } from '@lucide/svelte';
  import ChatThread from '$lib/components/chat/ChatThread.svelte';
  import type { ChatMsg } from '$lib/components/chat/chat';
  import { requireAuth } from '$lib/guest';
  let msgs: ChatMsg[] = [
    { me: false, text: "I've just completed the cold start and bore scope inspection on the Porsche 911 engine. The diagnostic is looking very healthy; compression values are within 2% across all cylinders.", time: '10:42 AM' },
    { me: false, text: '', time: '10:43 AM', file: { name: 'Engine_Diagnostic_Full.pdf', meta: '2.4 MB • PDF' } },
    { me: true, text: "That's fantastic news. Did you notice any particular moisture in the rear main seal area during the lift inspection?", time: '10:45 AM' },
    { me: false, text: 'The RMS is bone dry. I also checked the intermediate shaft (IMS) bearing flange — it appears to be the upgraded ceramic version installed in 2021.', time: '10:47 AM' }
  ];
  function send(text: string) {
    requireAuth(() => {
      msgs = [...msgs, { me: true, text, time: 'now' }];
    }, '/inspector/messages');
  }
</script>
<svelte:head><title>Pesan Kerja — Inspector</title></svelte:head>
<div class="mx-auto max-w-md lg:max-w-2xl">
  <ChatThread messages={msgs} onSend={send} placeholder="Type a message…" topNote="TODAY, OCT 24">
    <div slot="header" class="flex items-center gap-3">
      <a href="/inspector" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
      <span class="grid size-10 shrink-0 place-items-center rounded-full bg-ink-900 text-sm font-bold text-white">FC</span>
      <div class="min-w-0">
        <p class="truncate font-bold">Firman Comstir</p>
        <p class="text-[11px] tracking-wide text-slate-400">EXPERT VERIFIER</p>
      </div>
    </div>
  </ChatThread>
</div>
