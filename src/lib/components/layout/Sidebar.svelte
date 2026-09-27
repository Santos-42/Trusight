<script lang="ts">
  export let role: 'buyer' | 'seller' | 'inspector' | 'admin' = 'buyer';
  import { page } from '$app/stores';
  import { LayoutDashboard, FileText, Users, ClipboardCheck, Settings, House, Search, Plus, Mail, Car, CalendarDays, Award, MessageSquare } from '@lucide/svelte';
  $: path = $page.url.pathname;

  const menus: Record<string, { href: string; label: string; icon: unknown }[]> = {
    buyer: [
      { href: '/app/home', label: 'Home', icon: House },
      { href: '/app/search', label: 'Cari Mobil', icon: Search },
      { href: '/app/new-inspection', label: 'Order', icon: Plus },
      { href: '/app/history', label: 'History', icon: FileText },
      { href: '/app/inbox', label: 'Inbox', icon: Mail }
    ],
    seller: [
      { href: '/seller', label: 'Listing', icon: Car },
      { href: '/seller/schedule', label: 'Jadwal', icon: CalendarDays },
      { href: '/seller/certification', label: 'Sertifikasi', icon: Award }
    ],
    inspector: [
      { href: '/inspector', label: 'Tugas', icon: ClipboardCheck },
      { href: '/app/inbox', label: 'Pesan', icon: MessageSquare }
    ],
    admin: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/orders', label: 'Orders', icon: FileText },
      { href: '/admin/inspectors', label: 'Inspectors', icon: Users },
      { href: '/admin/reports', label: 'Reports', icon: ClipboardCheck },
      { href: '/app/settings', label: 'Settings', icon: Settings }
    ]
  };
  const titles: Record<string, string> = { buyer: 'TruSight', seller: 'Seller Panel', inspector: 'Inspector', admin: 'TruSight Admin' };
</script>

<aside class="flex min-h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col bg-ink-900 p-4 text-white">
  <p class="px-2 text-[15px] font-bold">{titles[role]}</p>
  <nav class="mt-4 grid gap-1">
    {#each menus[role] as m}
      <a href={m.href} class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium {path === m.href ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}">
        <svelte:component this={m.icon} class="size-4" /> {m.label}
      </a>
    {/each}
  </nav>
  <div class="mt-auto flex items-center gap-2 rounded-xl bg-white/5 p-3">
    <span class="grid size-9 place-items-center rounded-full bg-gold-400 text-xs font-bold text-ink-900">AM</span>
    <div class="text-xs"><p class="font-bold">Alex Mercer</p><p class="text-white/50">Chief Admin</p></div>
  </div>
</aside>
