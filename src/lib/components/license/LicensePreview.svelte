<script lang="ts">
  import { X, ShieldCheck } from '@lucide/svelte';

  /** URL/data-URL gambar lisensi. Null = belum ada, tampil fallback inisial. */
  export let src: string | null = null;
  export let alt = 'Foto lisensi inspektur';
  export let initials = '';
  /** Lebar thumbnail: 'sm' untuk sel tabel, 'md' untuk kartu profil. */
  export let size: 'sm' | 'md' = 'sm';

  let open = false;
  // File bisa saja belum ada di static/licenses — saat gagal dimuat, jatuh ke inisial.
  let failed = false;
  $: shown = src && !failed ? src : null;
</script>

{#if shown}
  <button
    type="button"
    class="block shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 {size === 'sm' ? 'h-11 w-16' : 'h-40 w-full'}"
    on:click={() => (open = true)}
    title="Klik untuk memperbesar"
  >
    <img src={shown} {alt} class="h-full w-full object-cover" on:error={() => (failed = true)} />
  </button>
{:else}
  <span
    class="grid shrink-0 place-items-center rounded-full bg-ink-900 font-bold text-white {size === 'sm' ? 'size-8 text-[0.6875rem]' : 'size-16 text-xl'}"
    title="Belum ada foto lisensi"
  >
    {#if initials}{initials}{:else}<ShieldCheck class="size-5" />{/if}
  </span>
{/if}

{#if open && shown}
  <div
    class="fixed inset-0 z-50 grid place-items-center p-4"
    role="dialog"
    aria-modal="true"
    aria-label={alt}
    tabindex="-1"
    on:keydown={(e) => e.key === 'Escape' && (open = false)}
  >
    <button type="button" class="absolute inset-0 bg-black/75" aria-label="Tutup pratinjau" on:click={() => (open = false)}></button>
    <div class="relative grid w-full max-w-lg gap-3">
      <div class="flex items-center justify-between">
        <p class="font-bold text-white">{alt}</p>
        <button type="button" class="rounded-full bg-white/15 p-2 text-white" on:click={() => (open = false)} aria-label="Tutup">
          <X class="size-5" />
        </button>
      </div>
      <img src={shown} {alt} class="w-full rounded-2xl bg-white" />
    </div>
  </div>
{/if}
