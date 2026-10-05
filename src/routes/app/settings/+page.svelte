<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { LogOut } from '@lucide/svelte';
  import { authed, clearSession, getSession, type Role } from '$lib/guest';
  $: path = $page.url.pathname;
  let email = '';
  let role: Role = 'buyer';
  onMount(() => {
    const s = getSession();
    if (s) {
      email = s.email;
      role = s.role;
    }
  });
  function logout() {
    clearSession();
    location.href = '/app/home';
  }
</script>
<svelte:head><title>Settings — TruSight</title></svelte:head>
<div class="grid gap-4">
  {#if $authed}
    {#if role === 'admin'}
      <h1 class="text-xl font-extrabold">Admin Settings • Alex Mercer</h1>
      <div class="ts-card grid gap-2 text-sm">
        <p class="ts-eyebrow">Administrator</p>
        <p><b>Role:</b> Chief Admin • <b>Email:</b> {email || 'admin@trusight.id'}</p>
        <p class="text-slate-500">Kelola order, inspektur, dan laporan lewat Rail di sisi kiri.</p>
      </div>
    {:else if role === 'seller'}
      <h1 class="text-xl font-extrabold">Account Settings • Hendra Wijaya</h1>
      <div class="ts-card grid gap-2 text-sm">
        <p class="ts-eyebrow">Seller Account</p>
        <p><b>Email:</b> {email || 'hendra@showroom.id'} • <b>Rating:</b> 4.8/5.0</p>
        <p class="text-slate-500">Showroom: Hendra Auto • Jakarta Selatan</p>
      </div>
    {:else if role === 'inspector'}
      <h1 class="text-xl font-extrabold">Account Settings • Budi Santoso</h1>
      <div class="ts-card grid gap-2 text-sm">
        <p class="ts-eyebrow">Inspector Account</p>
        <p><b>Email:</b> {email || 'budi.s@trusight.id'} • <b>Lisensi:</b> Utama #1294</p>
        <a href="/inspector/profile" class="font-bold text-brand-600">Buka Profil &amp; Sertifikat →</a>
      </div>
    {:else}
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
  {/if}
  {#if $authed}
    <button class="inline-flex min-h-12 items-center justify-center gap-2 justify-self-start rounded-xl bg-red-600 px-6 text-sm font-bold text-white hover:bg-red-700" on:click={logout}><LogOut class="size-4" /> Logout</button>
  {:else}
    <h1 class="text-xl font-extrabold">Account Settings</h1>
    <a href="/login?returnTo={encodeURIComponent(path)}" class="btn-navy justify-self-start">Login / Register</a>
  {/if}
</div>
