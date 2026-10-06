<script lang="ts">
  import { House, Plus, Mail, FileText, User, CalendarDays, Car, ClipboardCheck, LayoutDashboard, MessageSquare } from '@lucide/svelte';
  import { page } from '$app/stores';
  import type { Component } from 'svelte';
  export let role: 'buyer' | 'seller' | 'inspector' | 'admin' = 'buyer';
  $: path = $page.url.pathname;
  const sets: Record<string, { href: string; label: string; icon: Component<any> }[]> = {
    buyer: [
      { href: '/app/settings', label: 'Profile', icon: User },
      { href: '/app/home', label: 'Home', icon: House },
      { href: '/app/new-inspection', label: 'Order', icon: Plus },
      { href: '/app/history', label: 'History', icon: FileText },
      { href: '/app/inbox', label: 'Inbox', icon: Mail }
    ],
    seller: [
      { href: '/seller', label: 'Listing', icon: Car },
      { href: '/seller/schedule', label: 'Jadwal', icon: CalendarDays },
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
      { href: '/admin/reports', label: 'Reports', icon: ClipboardCheck },
      { href: '/app/settings', label: 'Profil', icon: User }
    ]
  };
  $: items = sets[role] ?? sets.buyer;
  $: cols = items.length === 3 ? 'grid-cols-3' : items.length === 4 ? 'grid-cols-4' : 'grid-cols-5';
</script>

<nav class="fixed bottom-0 inset-x-0 z-40 border-t border-black/5 bg-white">
  <div class="mx-auto grid max-w-7xl {cols} px-2 pb-[env(safe-area-inset-bottom)]">
    {#each items as it}
      {@const active = path === it.href || (it.href !== '/app/home' && it.href !== '/seller' && it.href !== '/inspector' && it.href !== '/admin' && path.startsWith(it.href))}
      <a href={it.href} class="flex min-h-[68px] flex-col items-center justify-center gap-1 text-[11px] {active ? 'font-bold text-ink-900' : 'font-medium text-slate-400'}">
        {#if active}
          <span class="grid size-11 place-items-center rounded-full bg-ink-900 text-white">
            <svelte:component this={it.icon} class="size-5" />
          </span>
        {:else}
          <svelte:component this={it.icon} class="size-6" />
        {/if}
        {it.label}
      </a>
    {/each}
  </div>
</nav>
