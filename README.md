# TruSight — Transparency You Can Trust

Verifikasi mobil bekas independen, on-demand, berbasis lokasi (Jabodetabek).
Stack: **SvelteKit 5 + Tailwind v4 + lucide + Cloudflare Pages + D1/R2/KV**. Plan lengkap: `plan.md` v2.0.

## Jalankan lokal

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build + adapter-cloudflare
npm run preview
```

## Data (KV-only)

Akun ini hanya punya Workers KV, jadi D1/R2 tidak dipakai. Satu binding `KV` untuk semua data JSON (lihat skema key di `functions/api/_db.ts`). Blob foto/PDF tetap di IndexedDB client (mockup).

```bash
wrangler kv namespace create KV
# isi id ke wrangler.toml, lalu:
wrangler kv bulk put --binding=KV seed/kv-seed.json
```

Batas free tier: 1000 writes/hari (tiap request dihemat: register 2 writes, order 2 writes, payment digabung ke dokumen order), 100rb reads/hari, 1GB. KV eventual-consistent ±60 detik — cukup untuk mockup; pindah ke D1 nanti tanpa ubah frontend (kontrak API sama).

## Deploy Cloudflare Pages

1. Push ke `main`, Connect Git di Dashboard → Pages → SvelteKit, build `npm run build`.
2. Pasang bindings di Settings → Functions: `DB` (D1), `PHOTOS`/`REPORTS` (R2), `SESSIONS` (KV).
3. Isi env: `PUBLIC_API_BASE=/api` (secret Midtrans/Xendit/Resend hanya di dashboard).
4. Custom domain `trusight.id` → HTTPS otomatis.

Atau manual: `npm run deploy` (butuh `wrangler login`).

## Struktur

- `src/routes/` — Landing, auth (login/register/request-account/forgot/otp/reset), buyer (`app/*`), seller, inspector, admin. Responsif: BottomNav mobile, Sidebar desktop.
- `src/lib/` — `config`, `api` typed (§9), `format` (Rp), `gps` (50m), `upload` (compress <1MB + R2 sign), `mocks`, komponen `ui/layout/vehicle`.
- `functions/api/` — Auth, vehicles, orders, inspections, reports, uploads/sign, webhooks/payment, me. Mock fallback jika DB belum di-bind agar preview hijau.
- `migrations/`, `wrangler.toml`, `svelte.config.js` (adapter-cloudflare).

## Status vs Plan

- [x] Fase 0 setup + build hijau
- [x] Fase 1 buyer MVP (semua layar mockup ada, data mock + API kontrak §9)
- [x] Fase 2 stub (order/pay webhook, R2 sign, report) — tinggal isi kredensial Midtrans/Xendit + R2 signed URL produksi
- [x] Fase 3 seller/inspector/admin dasar + GPS check-in demo
- [x] Fase 4 mockup-first + OSS (tanpa API key berbayar):
  - GPS strict 50m + peta Leaflet/OSM + reverse-geocode Nominatim
  - Foto anti-fraud: EXIF `exifr` + kompres `browser-image-compression`
  - TTD digital `signature_pad`, PDF laporan `pdf-lib`, share/clipboard Web standard
  - Garansi/komplain mockup (`/app/warranty/[orderId]`), chart admin `chart.js`
  - PWA manifest + OG meta, session JWT `jose` (helper siap pakai)
  - Unit `vitest` hijau (5 test), E2E `playwright` spec mockup (tanpa download browser)
