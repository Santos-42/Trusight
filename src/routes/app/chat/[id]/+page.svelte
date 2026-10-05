<script lang="ts">
  import { page } from '$app/stores';
  import { requireAuth } from '$lib/guest';
  $: id = $page.params.id ?? '1';
  let msgs = [{from:'Rian F.', text:'Baik pak, saya tunggu di lokasi jam 2 siang ya.'}];
  let draft='';
  function doSend(){ if(!draft.trim()) return; msgs=[...msgs,{from:'Saya', text:draft}]; draft=''; }
  function send(){ requireAuth(() => doSend(), `/app/chat/${id}`); }
</script>
<svelte:head><title>Chat — TruSight</title></svelte:head>
<div class="grid gap-3">
  <h1 class="text-xl font-extrabold">Chat Pembeli • Rian F. (Civic)</h1>
  <div class="rounded-2xl border bg-white p-4 grid gap-2 min-h-64">
    {#each msgs as m}<div class="rounded-xl bg-slate-100 px-3 py-2 text-sm"><b>{m.from}:</b> {m.text}</div>{/each}
  </div>
  <form class="flex gap-2" on:submit|preventDefault={send}>
    <input class="flex-1 min-h-12 rounded-xl border px-4" placeholder="Tulis pesan..." bind:value={draft} />
    <button class="min-h-12 rounded-xl bg-brand-600 px-5 font-bold text-white">Kirim</button>
  </form>
</div>
