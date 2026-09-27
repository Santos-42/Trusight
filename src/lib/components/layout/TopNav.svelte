<script lang="ts">
  import { Car, ShieldCheck } from '@lucide/svelte';
  import { APP_NAME } from '$lib/config';
</script>

<header class="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
    <a href="/" class="flex items-center gap-2 font-bold text-brand-700">
      <span class="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
        <Car class="size-5" />
      </span>
      <span class="text-lg tracking-tight">{APP_NAME}</span>
      <span class="hidden sm:inline text-xs font-medium text-slate-500">Transparency You Can Trust</span>
    </a>
    <nav class="hidden md:flex items-center gap-5 text-sm text-slate-600">
      <a href="/app/search" class="hover:text-brand-700">Cari Mobil</a>
      <a href="/app/new-inspection" class="hover:text-brand-700">Ajukan Inspeksi</a>
      <a href="/app/history" class="hover:text-brand-700">Riwayat</a>
    </nav>
    <div class="flex items-center gap-2">
      <a href="/login" class="hidden sm:inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50">Masuk</a>
      <a href="/register" class="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
        <ShieldCheck class="size-4" /> Mulai Verifikasi
      </a>
    </div>
  </div>
</header>
