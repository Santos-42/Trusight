<script lang="ts">
  import { browser } from '$app/environment';
  import { ChevronLeft, TicketPercent, BadgeCheck } from '@lucide/svelte';
  import { api } from '$lib/api';
  import { getSession, requireAuth } from '$lib/guest';
  const vouchers = [
    { code: 'TRU20', title: '20% Off Verification', desc: 'Potongan inspeksi bedah penuh untuk pembelian berikutnya.', grad: 'from-brand-500 via-brand-600 to-brand-700' },
    { code: 'FASTTRACK', title: 'Fast-Track Queue', desc: 'Antrean prioritas — hasil ≤ 1×24 jam. Berlaku s.d. 30 Okt 2026.', grad: 'from-ink-800 to-ink-900' },
    { code: 'CERT15', title: 'Certified Upsell 15%', desc: 'Naikkan harga jual dengan lencana TruSight Certified.', grad: 'from-brand-600 to-brand-700' },
    { code: 'HEMAT50', title: 'Rp50rb Off Standard', desc: 'Untuk order pertama akun baru. Satu kali pakai.', grad: 'from-ink-700 to-ink-900' }
  ];
  let claimed: string[] = [];
  if (browser) {
    try {
      claimed = JSON.parse(localStorage.getItem('trusight_vouchers') ?? '[]');
    } catch {
      claimed = [];
    }
    const uid = getSession()?.id;
    if (uid) {
      api.get<{ code: string }[]>(`/vouchers/mine?userId=${encodeURIComponent(uid)}`).then((r) => {
        if (r.ok && r.data.length) {
          claimed = r.data.map((v) => v.code);
          localStorage.setItem('trusight_vouchers', JSON.stringify(claimed));
        }
      });
    }
  }
  async function claim(code: string) {
    requireAuth(async () => {
      if (claimed.includes(code)) return;
      const uid = getSession()?.id ?? '';
      const r = await api.post('/vouchers/claim', { userId: uid, code });
      if (r.ok) {
        claimed = [...claimed, code];
        if (browser) localStorage.setItem('trusight_vouchers', JSON.stringify(claimed));
      }
    }, '/app/vouchers');
  }
</script>
<svelte:head><title>Semua Voucher — TruSight</title></svelte:head>
<div class="grid gap-4">
  <div class="ts-appbar-flush">
    <a href="/app/home" class="ts-back" aria-label="Kembali"><ChevronLeft class="size-5" /></a>
    <p class="ts-appbar-title">Semua Voucher</p>
    <a href="/app/my-vouchers" class="pill ml-auto">Voucher Saya</a>
  </div>
  <div class="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
    {#each vouchers as v}
      <div class="relative overflow-hidden rounded-[20px] bg-gradient-to-br {v.grad} p-5 text-white">
        <p class="text-[11px] font-bold tracking-[0.18em]">VOUCHER • {v.code}</p>
        <p class="mt-1 text-lg font-extrabold">{v.title}</p>
        <p class="mt-1 text-[13px] text-white/80">{v.desc}</p>
        <button
          class="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold disabled:opacity-60"
          disabled={claimed.includes(v.code)}
          on:click={() => claim(v.code)}
        >
          {#if claimed.includes(v.code)}<BadgeCheck class="size-4" /> Terkait diklaim{:else}<TicketPercent class="size-4" /> Klaim Voucher{/if}
        </button>
      </div>
    {/each}
  </div>
</div>
