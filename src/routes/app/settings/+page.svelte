<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ChevronRight, CircleUserRound, CreditCard, LifeBuoy, LogOut, UserCog } from '@lucide/svelte';
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
  let section: string | null = 'account';
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
      <div class="mx-auto grid w-full max-w-md gap-4">
        <div class="ts-card grid justify-items-center gap-1 py-6 text-center">
          <CircleUserRound class="size-20 text-slate-300" />
          <p class="mt-1 text-lg font-bold">Budi Perkasa</p>
          <p class="text-xs text-slate-400">ID #TRU-882-910 • Authenticated</p>
        </div>
        <div class="ts-card grid grid-cols-2 divide-x divide-slate-100 py-4 text-center">
          <div><p class="text-lg font-extrabold">10</p><p class="text-xs text-slate-500">Verifikasi</p></div>
          <div><p class="text-lg font-extrabold">07</p><p class="text-xs text-slate-500">Mobil Tersimpan</p></div>
        </div>
        <p class="ts-eyebrow">General Settings</p>
        <div class="ts-card divide-y divide-slate-100 !p-0">
          <a href="/app/settings/account" class="flex w-full items-center gap-3 p-4 text-left">
            <UserCog class="size-5 text-slate-400" />
            <span class="flex-1"><span class="block text-sm font-bold">Account Settings</span><span class="block text-xs text-slate-400">ID, email, telepon, status</span></span>
            <ChevronRight class="size-4 text-slate-300" />
          </a>
          <button class="flex w-full items-center gap-3 p-4 text-left" on:click={() => (section = section === 'payment' ? null : 'payment')}>
            <CreditCard class="size-5 text-slate-400" />
            <span class="flex-1"><span class="block text-sm font-bold">Payment Methods</span><span class="block text-xs text-slate-400">VISA •••• 4242, QRIS</span></span>
            <ChevronRight class="size-4 text-slate-300" />
          </button>
          {#if section === 'payment'}
            <div class="grid gap-1 bg-slate-50 px-4 py-3 text-[13px] text-slate-600">
              <p>VISA •••• 4242 (utama)</p>
              <p>QRIS • GoPay • Transfer bank</p>
            </div>
          {/if}
          <button class="flex w-full items-center gap-3 p-4 text-left" on:click={() => (section = section === 'help' ? null : 'help')}>
            <LifeBuoy class="size-5 text-slate-400" />
            <span class="flex-1"><span class="block text-sm font-bold">Help Center</span><span class="block text-xs text-slate-400">Bantuan dan panduan</span></span>
            <ChevronRight class="size-4 text-slate-300" />
          </button>
          {#if section === 'help'}
            <div class="grid gap-1 bg-slate-50 px-4 py-3 text-[13px] text-slate-600">
              <p>Help Center tersedia ≤1×24 jam.</p>
              <p>Komplain garansi via halaman Garansi.</p>
            </div>
          {/if}
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
