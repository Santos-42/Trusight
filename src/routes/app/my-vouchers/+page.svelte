<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { ChevronLeft, TicketPercent, BadgeCheck } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession } from '$lib/guest';
  type V = { code: string; claimed_at?: string; used_at?: string | null; order_id?: string | null };
  const meta: Record<string, string> = {
    TRU20: 'Potongan 20% inspeksi bedah penuh.',
    HEMAT50: 'Potongan Rp50rb order standard.',
    FASTTRACK: 'Antrean prioritas ≤ 1×24 jam.',
    CERT15: 'Lencana Certified untuk penjual.'
  };
  let mine: V[] = [];
  onMount(async () => {
    if (browser) {
      try {
        const local: string[] = JSON.parse(localStorage.getItem('trusight_vouchers') ?? '[]');
        mine = local.map((code) => ({ code }));
      } catch { /* abaikan */ }
    }
    const uid = getSession()?.id;
    if (!uid) return;
    const r = await api.get<V[]>(`/vouchers/mine?userId=${encodeURIComponent(uid)}`);
    if (r.ok && r.data.length) {
      mine = r.data;
      if (browser) localStorage.setItem('trusight_vouchers', JSON.stringify(mine.map((v) => v.code)));
    }
  });
</script>
<svelte:head><title>Voucher Saya — TruSight</title></svelte:head>
<div class="mx-auto grid max-w-md gap-4 lg:max-w-2xl">
  <div class="ts-appbar-flush">
    <a href="/app/settings" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <p class="ts-appbar-title">Voucher Saya</p>
  </div>
  {#if !mine.length}
    <div class="ts-card text-center">
      <TicketPercent class="mx-auto size-10 text-slate-300" />
      <p class="mt-2 font-bold">Belum ada voucher</p>
      <p class="text-sm text-slate-500">Klaim dulu di halaman voucher, lalu pakai saat checkout.</p>
      <a href="/app/vouchers" class="btn-blue mt-3 inline-flex">Lihat Voucher</a>
    </div>
  {:else}
    {#each mine as v}
      <div class="ts-card flex items-center gap-3">
        <TicketPercent class="size-8 shrink-0 text-brand-600" />
        <div class="min-w-0 flex-1">
          <p class="font-extrabold">{v.code}</p>
          <p class="truncate text-[13px] text-slate-500">{meta[v.code] ?? ''}</p>
          {#if v.used_at}<p class="text-xs text-slate-400">Dipakai • order {v.order_id}</p>{/if}
        </div>
        {#if v.used_at}<span class="pill">Terpakai</span>{:else}<span class="pill-green inline-flex items-center gap-1"><BadgeCheck class="size-4" /> Aktif</span>{/if}
      </div>
    {/each}
  {/if}
</div>
