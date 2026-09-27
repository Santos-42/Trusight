<script lang="ts">
  export let role: 'buyer' | 'seller' | 'inspector' | 'admin' = 'buyer';
  import { page } from '$app/stores';
  $: path = $page.url.pathname;

  const menus: Record<string, { href: string; label: string }[]> = {
    buyer: [
      { href: '/app/home', label: 'Home' },
      { href: '/app/search', label: 'Cari Mobil' },
      { href: '/app/new-inspection', label: 'Inspeksi Baru' },
      { href: '/app/history', label: 'Riwayat' },
      { href: '/app/inbox', label: 'Inbox' },
      { href: '/app/settings', label: 'Pengaturan' }
    ],
    seller: [
      { href: '/seller', label: 'Dashboard' },
      { href: '/seller/schedule', label: 'Jadwal' },
      { href: '/seller/certification', label: 'Sertifikasi' }
    ],
    inspector: [
      { href: '/inspector', label: 'Tugas' },
      { href: '/app/inbox', label: 'Pesan' }
    ],
    admin: [
      { href: '/admin', label: 'Overview' },
      { href: '/admin/orders', label: 'Orders' },
      { href: '/admin/inspectors', label: 'Inspectors' },
      { href: '/admin/reports', label: 'Reports' }
    ]
  };
</script>

<aside class="w-60 shrink-0 border-r bg-white p-4">
  <p class="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{role}</p>
  <nav class="mt-2 grid gap-1">
    {#each menus[role] as m}
      <a
        href={m.href}
        class="rounded-lg px-3 py-2.5 text-sm font-medium {path === m.href ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}"
      >{m.label}</a>
    {/each}
  </nav>
</aside>
