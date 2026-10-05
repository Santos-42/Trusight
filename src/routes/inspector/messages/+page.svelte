<script lang="ts">
  import { ChevronLeft, FileText, Download, Send } from '@lucide/svelte';
  import { requireAuth } from '$lib/guest';
  let draft = '';
  function send() {
    requireAuth(() => {
      draft = '';
    }, '/inspector/messages');
  }
</script>
<svelte:head><title>Pesan Kerja — Inspector</title></svelte:head>
<div class="mx-auto grid max-w-md gap-3 px-1 pb-6 lg:max-w-2xl">
  <div class="flex items-center gap-3">
    <a href="/inspector" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <span class="grid size-10 shrink-0 place-items-center rounded-full bg-ink-900 text-sm font-bold text-white">FC</span>
    <div class="min-w-0">
      <p class="truncate font-bold">Firman Comstir</p>
      <p class="text-[11px] tracking-wide text-slate-400">EXPERT VERIFIER</p>
    </div>
  </div>
  <p class="mx-auto rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">TODAY, OCT 24</p>
  <div class="grid gap-2">
    <div class="max-w-[85%] rounded-2xl rounded-tl-md bg-white p-3 text-[13px] shadow-sm ring-1 ring-slate-100">
      I've just completed the cold start and bore scope inspection on the Porsche 911 engine. The diagnostic is looking very healthy; compression values are within 2% across all cylinders.
      <p class="mt-1 text-right text-[11px] text-slate-400">10:42 AM</p>
    </div>
    <div class="max-w-[85%] rounded-2xl rounded-tl-md bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <p class="flex items-center gap-2 text-[13px] font-semibold"><FileText class="size-5 text-teal-600" /> Engine_Diagnostic_Full.pdf</p>
      <p class="ml-7 text-[11px] text-slate-400">2.4 MB • PDF</p>
      <p class="mt-1 flex items-center justify-end gap-2 text-[11px] text-slate-400"><Download class="size-4 text-teal-600" /> 10:43 AM</p>
    </div>
    <div class="max-w-[85%] justify-self-end rounded-2xl rounded-tr-md bg-brand-600 p-3 text-[13px] text-white">
      That's fantastic news. Did you notice any particular moisture in the rear main seal area during the lift inspection?
      <p class="mt-1 text-right text-[11px] text-brand-100">10:45 AM ✓✓</p>
    </div>
    <div class="max-w-[85%] rounded-2xl rounded-tl-md bg-white p-3 text-[13px] shadow-sm ring-1 ring-slate-100">
      The RMS is bone dry. I also checked the intermediate shaft (IMS) bearing flange — it appears to be the upgraded ceramic version installed in 2021.
      <p class="mt-1 text-right text-[11px] text-slate-400">10:47 AM</p>
    </div>
  </div>
  <form class="sticky bottom-24 flex items-center gap-2 lg:bottom-6" on:submit|preventDefault={send}>
    <input bind:value={draft} placeholder="Type a message…" class="ts-field flex-1" />
    <button type="submit" class="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white" aria-label="Kirim"><Send class="size-5" /></button>
  </form>
</div>
