<script lang="ts">
  import { Eye } from '@lucide/svelte';
  import { authed, loginModal } from '$lib/guest';
  import { page } from '$app/stores';
  function askLogin() {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('trusight_return_to', $page.url.pathname + $page.url.search);
    loginModal.set({ open: true });
  }
</script>

{#if !$authed}
  <div class="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-ink-900 px-4 py-2.5 text-white">
    <p class="flex min-w-0 items-center gap-2 text-[13px]"><Eye class="size-4 shrink-0 text-brand-500" /><span class="truncate"><b>Mode Tamu</b><span class="hidden sm:inline text-white/60"> — bebas lihat-lihat, login untuk memesan</span></span></p>
    <button class="shrink-0 rounded-lg bg-white px-4 py-1.5 text-[13px] font-bold text-ink-900" on:click={askLogin}>Masuk</button>
  </div>
{/if}
