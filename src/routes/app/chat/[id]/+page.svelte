<script lang="ts">
  import { page } from '$app/stores';
  import { CircleUserRound } from '@lucide/svelte';
  import ChatThread from '$lib/components/chat/ChatThread.svelte';
  import type { ChatMsg } from '$lib/components/chat/chat';
  import { requireAuth } from '$lib/guest';
  $: id = $page.params.id ?? '1';
  let msgs: ChatMsg[] = [{ me: false, text: 'Baik pak, saya tunggu di lokasi jam 2 siang ya.', time: '10:30' }];
  function send(text: string) {
    requireAuth(() => {
      msgs = [...msgs, { me: true, text, time: 'now' }];
    }, `/app/chat/${id}`);
  }
</script>
<svelte:head><title>Chat — TruSight</title></svelte:head>
<div class="mx-auto max-w-md lg:max-w-2xl">
  <ChatThread messages={msgs} onSend={send} placeholder="Tulis pesan...">
    <h1 slot="header" class="flex items-center gap-2 text-xl font-extrabold"><CircleUserRound class="size-7 shrink-0 text-slate-300" /> Chat Pembeli • Rian F. (Civic)</h1>
  </ChatThread>
</div>
