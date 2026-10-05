<script lang="ts">
  import { page } from '$app/stores';
  import { authed, clearSession } from '$lib/guest';
  $: path = $page.url.pathname;
  function logout() {
    clearSession();
    location.href = '/app/home';
  }
</script>
<svelte:head><title>Settings — TruSight</title></svelte:head>
<div class="grid gap-4">
  <h1 class="text-xl font-extrabold">Account Settings • Budi Perkasa</h1>
  <div class="grid gap-4 lg:grid-cols-2">
    <div class="ts-card grid gap-2 text-sm">
      <p class="ts-eyebrow">Account</p>
      <p><b>ID:</b> #TRU-882-910 • <b>Status:</b> Authenticated</p>
      <p>Email: budi.perks@gmail.com</p>
      <p>Phone: +62 856-1908-7645</p>
    </div>
    <div class="ts-card grid gap-2 text-sm">
      <p class="ts-eyebrow">Trust & Protection</p>
      <p><b>Verifications:</b> 10 • <b>Saved cars:</b> 07 • <b>Trust score:</b> 98%</p>
      <p>Protection level: HIGH • Payment: VISA •••• 4242, QRIS</p>
      <p class="text-slate-500">Help Center tersedia.</p>
    </div>
  </div>
  <div class="ts-card grid content-start gap-2 text-sm">
    <p class="ts-eyebrow">Sesi</p>
    {#if $authed}
      <p>Sudah login (mockup lokal).</p>
      <button class="btn-outline justify-self-start" on:click={logout}>Keluar (kembali mode tamu)</button>
    {:else}
      <p class="text-slate-500">Mode Tamu — login untuk memesan & melacak.</p>
      <a href="/login?returnTo={encodeURIComponent(path)}" class="btn-navy justify-self-start">Login / Register</a>
    {/if}
  </div>
</div>
