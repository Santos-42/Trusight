<script lang="ts">
  import { page } from '$app/stores';
  import { LogOut } from '@lucide/svelte';
  import { authed, clearSession } from '$lib/guest';
  $: path = $page.url.pathname;
  function logout() {
    clearSession();
    location.href = '/app/home';
  }
</script>
<svelte:head><title>Settings — TruSight</title></svelte:head>
<div class="grid gap-4">
  {#if $authed}
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
  {/if}
  {#if $authed}
    <button class="inline-flex min-h-12 items-center justify-center gap-2 justify-self-start rounded-xl bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-700" on:click={logout}><LogOut class="size-4" /> Logout</button>
  {:else}
    <h1 class="text-xl font-extrabold">Account Settings</h1>
    <a href="/login?returnTo={encodeURIComponent(path)}" class="btn-navy justify-self-start">Login / Register</a>
  {/if}
</div>
