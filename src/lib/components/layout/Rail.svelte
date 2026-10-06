<script lang="ts">
  export let role: 'buyer' | 'seller' | 'inspector' | 'admin' = 'buyer';
  import { page } from '$app/stores';
  import type { Component } from 'svelte';
  import { House, Plus, Mail, FileText, User, CalendarDays, Car, ClipboardCheck, LayoutDashboard, MessageSquare, Search, Award, Users, LogOut } from '@lucide/svelte';
  import { authed, clearSession, loginModal } from '$lib/guest';
  $: path = $page.url.pathname;

  const sets: Record<string, { href: string; label: string; icon: Component<any> }[]> = {
    buyer: [
      { href: '/app/home', label: 'Home', icon: House },
      { href: '/app/search', label: 'Cari', icon: Search },
      { href: '/app/new-inspection', label: 'Order', icon: Plus },
      { href: '/app/history', label: 'Riwayat', icon: FileText },
      { href: '/app/inbox', label: 'Inbox', icon: Mail },
      { href: '/app/settings', label: 'Profil', icon: User }
    ],
    seller: [
      { href: '/seller', label: 'Listing', icon: Car },
      { href: '/seller/schedule', label: 'Jadwal', icon: CalendarDays },
      { href: '/seller/certification', label: 'Sertifikasi', icon: Award },
      { href: '/seller/messages', label: 'Pesan', icon: MessageSquare },
      { href: '/seller/profile', label: 'Profil', icon: User }
    ],
    inspector: [
      { href: '/inspector', label: 'Tugas', icon: ClipboardCheck },
      { href: '/inspector/messages', label: 'Pesan', icon: MessageSquare },
      { href: '/inspector/profile', label: 'Profil', icon: User }
    ],
    admin: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/orders', label: 'Orders', icon: FileText },
      { href: '/admin/inspectors', label: 'Inspectors', icon: Users },
      { href: '/admin/reports', label: 'Reports', icon: ClipboardCheck },
      { href: '/app/settings', label: 'Profil', icon: User }
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

<nav class="sticky top-0 flex h-dvh w-[84px] shrink-0 flex-col items-center gap-1 overflow-y-auto bg-ink-900 py-4 text-white" aria-label="Navigasi utama">
  <a href="/app/home" class="mb-3 grid size-11 place-items-center rounded-2xl bg-white/10">
    <img src="/logo.png" alt="TruSight" class="h-7 w-auto brightness-0 invert" />
  </a>
  {#each sets[role] as m}
    <a href={m.href} class="flex w-[68px] flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-center text-[10px] font-semibold leading-tight {path === m.href ? 'bg-white/12 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'}">
      <svelte:component this={m.icon} class="size-5" />
      {m.label}
    </a>
  {/each}
  <div class="mt-auto flex flex-col items-center gap-2 pt-3">
    {#if $authed}
      <button class="flex w-[68px] flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-center text-[10px] font-bold leading-tight text-red-300 hover:bg-red-500/15" on:click={logout} title="Keluar">
        <LogOut class="size-5" /> Keluar
      </button>
    {:else}
      <button class="flex w-[68px] flex-col items-center gap-1 rounded-2xl bg-brand-600 px-1 py-2.5 text-[10px] font-bold text-white hover:bg-brand-500" on:click={askLogin}>
        <User class="size-5" /> Masuk
      </button>
    {/if}
  </div>
</nav>
