<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ShieldCheck, X } from '@lucide/svelte';
  import { loginModal } from '$lib/guest';
  function close() {
    loginModal.set({ open: false });
  }
  function onBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }
  function go(href: string) {
    close();
    goto(href);
  }
  $: returnTo = $page.url.pathname + $page.url.search;
</script>

{#if $loginModal.open}
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 p-0 sm:items-center sm:p-6" tabindex={-1} on:click={onBackdrop} on:keydown={(e) => e.key === 'Escape' && close()} role="dialog" aria-modal="true" aria-label="Login untuk melanjutkan">
    <div class="w-full max-w-md rounded-t-[28px] bg-white p-6 pb-8 sm:rounded-[28px] sm:p-8">
      <div class="flex items-start justify-between">
        <span class="grid size-12 place-items-center rounded-2xl bg-ink-900 text-white"><ShieldCheck class="size-6" /></span>
        <button class="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500" on:click={close} aria-label="Tutup"><X class="size-5" /></button>
      </div>
      <h2 class="ts-h mt-4 text-[22px]">Login untuk melanjutkan</h2>
      <p class="mt-1 text-[14px] text-slate-500">Pemesanan, pembayaran, dan pelacakan inspeksi hanya untuk akun terdaftar. Lihat-lihat katalog tetap gratis.</p>
      <div class="mt-5 grid gap-2.5">
        <button class="btn-navy w-full" on:click={() => go(`/login?returnTo=${encodeURIComponent(returnTo)}`)}>Login</button>
        <button class="btn-outline w-full" on:click={() => go(`/register?returnTo=${encodeURIComponent(returnTo)}`)}>Register</button>
        <button class="mt-1 text-center text-sm font-semibold text-slate-500" on:click={close}>Lanjut sebagai tamu</button>
      </div>
    </div>
  </div>
{/if}
