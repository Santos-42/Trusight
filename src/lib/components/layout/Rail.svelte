<script lang="ts">
  export let role: 'buyer' | 'seller' | 'inspector' | 'admin' = 'buyer';
  import { page } from '$app/stores';
  import type { Component } from 'svelte';
  import {
    House, Plus, Mail, FileText, User, CalendarDays, Car, ClipboardCheck,
    LayoutDashboard, MessageSquare, Search, Award, Users, LogOut,
    PanelLeftClose, PanelLeftOpen
  } from '@lucide/svelte';
  import { authed, clearSession, loginModal, getSession } from '$lib/guest';
  import { api } from '$lib/api';
  import { onMount } from 'svelte';

  $: path = $page.url.pathname;
  let pendingCount = 0;
  let collapsed = false;
  let sessionUser = getSession();

  onMount(async () => {
    // Muat preferensi ukuran sidebar dari localStorage
    try {
      const saved = localStorage.getItem('trusight_sidebar_collapsed');
      if (saved !== null) {
        collapsed = saved === 'true';
      }
    } catch {
      // Abaikan bila di environment tertutup
    }
    sessionUser = getSession();

    if (role !== 'seller') return;
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<{ status: string }[]>(`/orders/incoming?sellerId=${encodeURIComponent(uid)}`);
    if (r.ok) pendingCount = r.data.filter((o) => o.status === 'pending').length;
  });

  function toggleSidebar() {
    collapsed = !collapsed;
    try {
      localStorage.setItem('trusight_sidebar_collapsed', String(collapsed));
    } catch {
      // Abaikan
    }
  }

  const roleLabels: Record<string, { title: string; subtitle: string }> = {
    buyer: { title: 'TruSight', subtitle: 'Pemeriksaan Mobil' },
    seller: { title: 'TruSight Seller', subtitle: 'Dealer Hub' },
    inspector: { title: 'TruSight Inspector', subtitle: 'Verifikasi Klinis' },
    admin: { title: 'TruSight Admin', subtitle: 'Operations Control' }
  };

  const sets: Record<string, { href: string; label: string; icon: Component<any> }[]> = {
    buyer: [
      { href: '/app/home', label: 'Home', icon: House },
      { href: '/app/search', label: 'Cari Mobil', icon: Search },
      { href: '/app/new-inspection', label: 'Order Baru', icon: Plus },
      { href: '/app/history', label: 'Riwayat', icon: FileText },
      { href: '/app/inbox', label: 'Inbox', icon: Mail },
      { href: '/app/settings', label: 'Profil', icon: User }
    ],
    seller: [
      { href: '/seller', label: 'Daftar Listing', icon: Car },
      { href: '/seller/schedule', label: 'Jadwal Masuk', icon: CalendarDays },
      { href: '/seller/certification', label: 'Sertifikasi', icon: Award },
      { href: '/seller/messages', label: 'Pesan', icon: MessageSquare },
      { href: '/seller/profile', label: 'Profil Showroom', icon: User }
    ],
    inspector: [
      { href: '/inspector', label: 'Tugas Lapangan', icon: ClipboardCheck },
      { href: '/inspector/messages', label: 'Pesan Masuk', icon: MessageSquare },
      { href: '/inspector/profile', label: 'Profil & Lisensi', icon: User }
    ],
    admin: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/orders', label: 'Manajemen Order', icon: FileText },
      { href: '/admin/inspectors', label: 'Daftar Inspektor', icon: Users },
      { href: '/admin/reports', label: 'Audit Laporan', icon: ClipboardCheck },
      { href: '/app/settings', label: 'Pengaturan', icon: User }
    ]
  };

  function logout() {
    clearSession();
    location.href = '/';
  }

  function askLogin() {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('trusight_return_to', path);
    loginModal.set({ open: true });
  }
</script>

<nav
  class="sticky top-0 flex h-dvh shrink-0 flex-col overflow-y-auto bg-ink-900 text-white transition-all duration-300 ease-in-out {collapsed ? 'w-20 items-center px-2 py-4' : 'w-64 px-4 py-5'}"
  aria-label="Navigasi desktop utama"
>
  <!-- Header Sidebar: Logo & Tombol Toggle -->
  <div class="mb-5 flex items-center {collapsed ? 'flex-col gap-3 justify-center' : 'justify-between'} border-b border-white/10 pb-4">
    <a href="/app/home" class="flex items-center gap-3 min-w-0" title="TruSight Home">
      <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 shadow-sm">
        <img src="/logo.png" alt="TruSight" class="h-6 w-auto brightness-0 invert" />
      </span>
      {#if !collapsed}
        <div class="min-w-0">
          <p class="truncate text-base font-bold tracking-tight text-white">{roleLabels[role]?.title ?? 'TruSight'}</p>
          <p class="truncate text-[0.6875rem] font-medium text-white/50">{roleLabels[role]?.subtitle ?? 'Clinical Verification'}</p>
        </div>
      {/if}
    </a>

    <!-- Tombol Perbesar / Perkecil Sidebar -->
    <button
      class="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
      on:click={toggleSidebar}
      title={collapsed ? 'Perbesar sidebar (mode penuh)' : 'Perkecil sidebar (mode ikon)'}
      aria-label={collapsed ? 'Perbesar sidebar' : 'Perkecil sidebar'}
    >
      {#if collapsed}
        <PanelLeftOpen class="size-5" />
      {:else}
        <PanelLeftClose class="size-5" />
      {/if}
    </button>
  </div>

  <!-- Menu Navigasi -->
  <div class="flex flex-1 flex-col gap-1">
    {#each sets[role] ?? sets.buyer as m}
      {@const active = path === m.href}
      <a
        href={m.href}
        class="relative flex items-center rounded-xl transition-all font-medium {collapsed ? 'justify-center p-3 text-center' : 'gap-3 px-3.5 py-2.5 text-sm'} {active ? 'bg-white/15 text-white font-bold shadow-sm ring-1 ring-white/10' : 'text-white/65 hover:bg-white/5 hover:text-white'}"
        title={collapsed ? m.label : undefined}
      >
        <svelte:component this={m.icon} class="size-5 shrink-0 {active ? 'text-brand-400' : 'text-white/70'}" />
        {#if !collapsed}
          <span class="truncate flex-1">{m.label}</span>
        {/if}
        {#if m.href === '/seller/schedule' && pendingCount}
          <span class="{collapsed ? 'absolute -top-1 -right-1' : ''} grid size-5 place-items-center rounded-full bg-red-500 text-[0.625rem] font-bold text-white shadow">
            {pendingCount}
          </span>
        {/if}
      </a>
    {/each}
  </div>

  <!-- Footer User & Logout -->
  <div class="mt-auto border-t border-white/10 pt-4">
    {#if $authed}
      {#if !collapsed}
        <div class="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
          <span class="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {sessionUser?.name ? sessionUser.name.charAt(0).toUpperCase() : 'U'}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-bold text-white">{sessionUser?.name ?? 'User'}</p>
            <p class="truncate text-[0.625rem] capitalize text-white/50">{role}</p>
          </div>
        </div>
      {/if}

      <button
        class="flex w-full items-center rounded-xl font-bold text-red-300 transition-colors hover:bg-red-500/15 {collapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5 text-sm'}"
        on:click={logout}
        title="Keluar dari akun"
      >
        <LogOut class="size-5 shrink-0" />
        {#if !collapsed}<span>Keluar</span>{/if}
      </button>
    {:else}
      <button
        class="flex w-full items-center rounded-xl bg-brand-600 font-bold text-white transition-colors hover:bg-brand-500 shadow {collapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5 text-sm'}"
        on:click={askLogin}
        title="Masuk / Daftar"
      >
        <User class="size-5 shrink-0" />
        {#if !collapsed}<span>Masuk Akun</span>{/if}
      </button>
    {/if}
  </div>
</nav>
