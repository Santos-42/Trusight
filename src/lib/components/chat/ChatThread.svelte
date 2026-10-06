<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Download, FileText, Send } from '@lucide/svelte';
  import type { ChatMsg } from './chat';
  export let messages: ChatMsg[] = [];
  export let placeholder = 'Tulis pesan…';
  /** Catatan kecil di atas pesan pertama (mis. tanggal). Ikut menempel pada aliran pesan. */
  export let topNote = '';
  export let onSend: (text: string) => void = () => {};
  let draft = '';
  let box: HTMLDivElement;
  async function stick() {
    await tick();
    if (box) box.scrollTop = box.scrollHeight;
  }
  onMount(stick);
  function submit() {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    draft = '';
    stick();
  }
</script>

<!-- Kolom chat setinggi viewport: header + input diam, hanya daftar pesan yang scroll. -->
<div class="flex h-[calc(100dvh-2rem)] flex-col lg:h-[calc(100dvh-4.5rem)]">
  <div class="shrink-0 pb-2"><slot name="header" /></div>
  <div bind:this={box} class="flex min-h-0 flex-1 flex-col overflow-y-auto">
    <div class="mt-auto grid gap-2 py-1">
      {#if topNote}<p class="mx-auto rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">{topNote}</p>{/if}
      {#each messages as m}
        {#if m.me}
          <div class="max-w-[85%] justify-self-end rounded-2xl rounded-tr-md bg-brand-600 p-3 text-[13px] text-white">
            {m.text}
            {#if m.time}<p class="mt-1 text-right text-[11px] text-brand-100">{m.time} <b class="font-extrabold text-sky-200">✓✓</b></p>{/if}
          </div>
        {:else}
          <div class="max-w-[85%] justify-self-start rounded-2xl rounded-tl-md bg-white p-3 text-[13px] shadow-sm ring-1 ring-slate-100">
            {#if m.file}
              <p class="flex items-center gap-2 font-semibold"><FileText class="size-5 text-teal-600" /> {m.file.name}</p>
              <p class="ml-7 text-[11px] text-slate-400">{m.file.meta}</p>
            {:else}{m.text}{/if}
            {#if m.time}<p class="mt-1 flex items-center justify-end gap-1 text-[11px] text-slate-400">{#if m.file}<Download class="size-4 text-teal-600" />{/if} {m.time}</p>{/if}
          </div>
        {/if}
      {/each}
    </div>
  </div>
  <form class="shrink-0 pt-2" on:submit|preventDefault={submit}>
    <div class="flex items-center gap-2">
      <input bind:value={draft} {placeholder} class="ts-field min-h-12 flex-1 !rounded-full" aria-label="Tulis pesan" />
      <button type="submit" class="grid size-12 shrink-0 place-items-center rounded-full bg-brand-600 text-white hover:bg-brand-500" aria-label="Kirim"><Send class="size-5" /></button>
    </div>
  </form>
</div>
