<script lang="ts">
  import { onMount } from 'svelte';
  export let onSave: (pngBlob: Blob) => void = () => {};
  let canvas: HTMLCanvasElement;
  let pad: { clear(): void; isEmpty(): boolean; toDataURL(t: string): string } | null = null;
  let empty = true;

  onMount(async () => {
    const { default: SignaturePad } = await import('signature_pad');
    pad = new SignaturePad(canvas, { minWidth: 1.5, maxWidth: 3 });
    pad.addEventListener?.('endStroke', () => (empty = pad?.isEmpty() ?? true));
  });

  function save() {
    if (!pad || pad.isEmpty()) return;
    const url = pad.toDataURL('image/png');
    fetch(url).then(r => r.blob()).then(b => onSave(b));
  }
</script>
<div class="rounded-2xl border bg-white p-4">
  <p class="text-sm font-bold">Tanda Tangan Digital <span class="font-normal text-slate-500">(OSS: signature_pad, MIT)</span></p>
  <canvas bind:this={canvas} class="mt-2 h-40 w-full rounded-xl border bg-slate-50 touch-none"></canvas>
  <div class="mt-2 flex gap-2">
    <button class="min-h-11 flex-1 rounded-xl border text-sm font-bold" on:click={() => { pad?.clear(); empty = true; }}>Hapus</button>
    <button class="min-h-11 flex-1 rounded-xl bg-slate-900 text-sm font-bold text-white" on:click={save}>Simpan TTD</button>
  </div>
  {#if empty}<p class="mt-1 text-xs text-slate-400">Tulis di atas kanvas — mockup tersimpan lokal, belum di-notarisasi.</p>{/if}
</div>
