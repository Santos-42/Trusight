<script lang="ts">
  import { House, Search, ClipboardList, History, User } from '@lucide/svelte';
  import { page } from '$app/stores';
  $: path = $page.url.pathname;
  const items = [
    { href: '/app/home', label: 'Home', icon: House },
    { href: '/app/search', label: 'Cari', icon: Search },
    { href: '/app/new-inspection', label: 'Order', icon: ClipboardList },
    { href: '/app/history', label: 'Riwayat', icon: History },
    { href: '/app/settings', label: 'Profil', icon: User }
  ];
</script>

<nav class="fixed bottom-0 inset-x-0 z-40 border-t bg-white/95 backdrop-blur">
  <div class="mx-auto max-w-7xl grid grid-cols-5 px-2">
    {#each items as it}
      <a
        href={it.href}
        class="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium {path.startsWith(it.href) ? 'text-brand-700' : 'text-slate-500'}"
      >
        <svelte:component this={it.icon} class="size-5" />
        {it.label}
      </a>
    {/each}
  </div>
</nav>
