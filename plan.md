# TruSight — Plan Implementasi Website (Cloudflare Pages) — v2.0 FINAL

> Versi: 2.0 (27 Sep 2026) — FINAL SvelteKit
> Sumber kebenaran: `Ideate/Trusight-ideate.png`, `Ideate/Trusight-Overall.pdf` (29 hlm), `Ideate/TruSight.pdf` (66 hlm mockup)
> Tujuan: wujudkan TruSight jadi website nyata, responsif mobile + desktop, deploy ke Cloudflare Pages.
> Status: PLAN ONLY — belum ada kode, jangan implementasi sebelum plan disetujui.

**Changelog v2.0:**
- Stack FINAL: SvelteKit (Svelte 5) + TS + Tailwind v4 + `adapter-cloudflare` (bukan React)
- Icon FINAL: `lucide-svelte`
- Storage FINAL: D1 + R2 + KV dengan rincian free tier
- ERD + DDL D1 lengkap (§8)
- Kontrak API lengkap per tabel/fitur (§9) — baru di v2.0
- Perbaikan sisa referensi React/Vite → SvelteKit di arsitektur, struktur, deploy, fase

---

## 0. Ringkasan Eksekutif

**TruSight = verifikasi mobil bekas independen, on-demand, berbasis lokasi (Jabodetabek dulu).**
Buyer tahu kondisi nyata tanpa datang dulu. Inspektur bersertifikat cek 150+ titik di lokasi penjual, kirim laporan + skor risiko + estimasi perbaikan + rekomendasi: BELI / NEGO / HINDARI.

**Keputusan teknis inti (FINAL, jangan diubah tanpa revisi plan):**
- Frontend: **SvelteKit (Svelte 5) + TypeScript strict + Tailwind CSS v4 + `adapter-cloudflare`**. State: Svelte Runes (`$state`) + SvelteKit `load`, form: Superforms + Zod. Icon: `lucide-svelte`. Komponen: shadcn-svelte.
- Backend: **Cloudflare Pages Functions (`functions/api/*`) + D1 (SQL) + R2 (foto/PDF) + KV (OTP/session/cache)** — semua ada free tier (§3.2).
- Auth: email+password + OTP via Functions + Resend/MailChannels, session cookie HttpOnly.
- Payment: Midtrans/Xendit via Functions server-to-server, webhook di `functions/api/webhooks/*`.
- Desain: **mobile-first, 1 codebase responsif**, BottomNav di mobile, TopNav+Sidebar di desktop.

**MVP deploy pertama (minggu 1-2):** Landing + Auth + Home Buyer + Detail Mobil + Order Inspeksi + Checkout dummy + History + Profil. Seller/Inspektur/Admin fase 2-3.

---

## 1. Tujuan & Kriteria Sukses

### 1.1 Tujuan bisnis (dari Ideate)
1. Hilangkan jarak & ketidakpastian transaksi mobil bekas.
2. Transparansi: cocokkan iklan vs kondisi aktual.
3. Bangun trust: inspektor independen, bersertifikat, foto live GPS+timestamp, garansi laporan.
4. Fokus awal: **Jabodetabek, titik JBA/IBID/showroom/OLX/Mobil123**, usia 25-55, Rp7jt++.

### 1.2 Kriteria sukses teknis
- [ ] Deploy hijau di `*.pages.dev` + domain custom.
- [ ] Lighthouse mobile ≥ 90 (perf, a11y, SEO).
- [ ] 100% halaman lolos uji responsif: 360px, 768px, 1024px, 1440px tanpa scroll horizontal.
- [ ] Alur kritis E2E jalan: register → login → cari mobil → order → bayar (sandbox) → history → lihat laporan PDF.
- [ ] Foto R2 + laporan via signed URL, bukan public bucket.

### 1.3 Non-goals MVP
- Tanpa aplikasi native (cukup PWA-ready web).
- Tanpa AI deteksi mobil (Phase 4).
- Tanpa video inspection realtime (cukup foto live dulu).
- Tanpa multi-kota (kunci Jabodetabek).

---

## 2. Scope — Apa yang Dibangun

### 2.1 Persona & Hak akses
| Peran | Akses MVP | Contoh |
|---|---|---|
| Guest | Landing, katalog, detail terbatas | CTA login saat checkout |
| Buyer | Home, Search, Detail, New Inspection, Checkout, Success, History, Tracking, Report, Inbox/Chat, Settings/Profile | Budi Perkasa |
| Seller | Dashboard (Mobil Anda 1), Jadwal, Sertifikasi Mandiri +15%, Persetujuan Jadwal, Profil 4.8/5 | Hendra Wijaya + Civic Turbo 2021 |
| Inspector | Tugas Hari Ini, Detail + GPS 50m, Form Klinis, Terbit Laporan + TTD | Budi Santoso #1294, Firman Comstir |
| Admin | Overview, Orders, Inspectors, Reports | Tim TruSight |

### 2.2 Peta fitur dari 66 mockup → modul web
1. **Landing (p1-6):** hero + 3 CTA (Login/Register/Continue as guest), USP 150-point, trust badges.
2. **Auth (p8-26):** login, register, request-account (inspektor), forgot, OTP `067`, reset, success.
3. **Buyer Home (p31,34):** Verified Precision, Summer Offer 20% Off, list verified, filter.
4. **Vehicle Detail (p32,35):** 911 Carrera 2022 Rp4,75B, Verified Partner, spec, Passed 150-point.
5. **New Inspection (p43):** form kendaraan → estimasi → submit.
6. **Checkout & Success (p44-45):** summary, fast-track priority, CARD/QRIS/TRANSFER, success #TS-98211.
7. **History/Archive (p46,48-50):** empty, list IN PROGRESS/DONE, Live + auditor card, Report Skor 94.
8. **Seller (p27-30,36-37):** permintaan Rian F., jadwal 4 Juni 14:00, sertifikasi emas, setuju/alternatif, salin link, profil.
9. **Inspector (p38-42,52):** kredibilitas DB otoritas, 2 tugas + navigasi, form Mesin/Bodi/Interior + foto GPS `-6.2581,106.84`, skor B+ + TTD + garansi 30 hari.
10. **Chat/Inbox (p47,51,53-54):** chat, inbox list, detail + PDF.
11. **Account (p55-60,65-66):** guest, Budi Perkasa (10 verif/07 saved), ID #TRU-882-910, Trust 98%, security HIGH, payment, help.
12. **Admin (p61-64):** overview realtime, orders #TS-9021/9022, inspectors #LIC-7890 142 jobs, reports 1.105 live #REP-3401.

### 2.3 Prioritas fase
- **P0 MVP:** 1,2,3,4,5,6,7 parsial, 11 parsial.
- **P1:** 8 Seller + 9 Inspector dasar (check-in manual dulu).
- **P2:** 10 Chat (polling), 12 Admin.
- **P3:** GPS 50m strict, TTD digital, garansi/komplain, share OLX, PDF resmi.
- **P4:** AI deteksi, video inspection, multi-kota.

---

## 3. Tech Stack — SvelteKit FINAL

**Frontend:**
- SvelteKit + Svelte 5 + TypeScript strict + `adapter-cloudflare`
- Tailwind CSS v4 (mobile-first) + shadcn-svelte
- File-based routing di `src/routes`
- Svelte Runes + SvelteKit `load` + stores untuk UI state
- Superforms + Zod untuk semua form
- `date-fns`, `clsx`, `lucide-svelte`

**Kenapa SvelteKit:** bundle ±30-50% lebih kecil dari React → Lighthouse mobile ≥90 lebih mudah. SSR/SSG bawaan bagus untuk Landing + Detail (SEO). 1 framework untuk routing + SSR + prerender.

### 3.1 Icon — `lucide-svelte` (FINAL)
```bash
npm i lucide-svelte
```
```svelte
<script>import { Car, ShieldCheck, MapPin, Camera } from 'lucide-svelte';</script>
<Car class="w-5 h-5 sm:w-6 sm:h-6" />
```
- 1 set outline konsisten. Awal: `Car, ShieldCheck, MapPin, Camera, FileCheck, Star, Wallet, Bell, Search, ClipboardList, Wrench, History, Settings`.
- Logo TruSight tetap dari `Logo.png` (header/favicon).

### 3.2 Database & Storage — D1 + R2 + KV (semua ADA FREE TIER)
- **D1 (SQL utama) Free:** 5 GB/akun (max 500 MB per DB), 5 juta rows read/hari, 100 ribu rows write/hari. Sejak 1 Sep 2026 di-enforce (gagal sampai reset UTC + email alert). Estimasi MVP: 100 order/hari × 50 rows = 5rb reads → aman.
- **R2 (file) Free:** 10 GB-month, 1 juta Class A (write/list)/bln, 10 juta Class B (read)/bln, **egress gratis**. Untuk foto live + PDF.
- **KV (sementara) Free:** 100 ribu reads/hari, 1.000 writes/deletes/lists/hari, 1 GB. Untuk OTP 5 mnt, session, rate-limit.
- **Pages + Functions Free:** 100k req/hari. Tanpa kartu kredit. Paid $5/bln jika lewat.
- Aturan: relasional → D1, file → R2 (simpan key di D1), sementara → KV. Jangan BLOB di D1, jangan data kritis di KV.

**Backend (edge):**
- `functions/api/*` (TypeScript, runtime workers) + D1 + R2 + KV + Queues opsional (email OTP/notif)

**Auth & Payment:**
- Auth sendiri: hash server-side + session cookie HttpOnly + OTP. Jangan JWT di localStorage.
- Payment Midtrans/Xendit via Functions. Webhook di `functions/api/webhooks/*`.

**Tooling:** Node 20, pnpm, ESLint, Prettier, Vitest + Playwright, `wrangler`, Sentry + Cloudflare Logs.

---

## 4. Arsitektur

```
Browser (mobile/desktop, 1 codebase SvelteKit)
  ↓ HTTPS
Cloudflare Pages (SvelteKit + adapter-cloudflare)
  ├─ / → SvelteKit routes (prerender Landing + SSR edge untuk Detail/Dashboard)
  ├─ /api/* → Pages Functions (Workers)
  │    ├─ auth/*, vehicles/*, orders/*, inspections/*, reports/*, uploads/*, webhooks/*
  │    ├─ D1 (data) ── R2 (file) ── KV (otp/session/cache)
  │    └─ Midtrans/Xendit, Resend (email)
  └─ Custom domain + HTTPS + Cache + WAF
```

**Prinsip:**
- Secret hanya di Functions env. Di SvelteKit hanya `PUBLIC_*` untuk yang publik (nama app, mode sandbox). Jangan `PUBLIC_*` untuk secret.
- Upload: SvelteKit → `GET /api/uploads/sign` → PUT langsung ke R2 signed URL → simpan key via API. Validasi size/type di server.
- PDF laporan dibuat server-side (template HTML → PDF) atau client-generate lalu verifikasi server.
- SvelteKit `load` untuk data awal (SEO), `fetch('/api/...')` untuk interaksi. Jangan query D1 langsung dari SvelteKit route — selalu lewat `/api/*` supaya RBAC + rate-limit satu pintu.

---

## 5. Struktur Proyek SvelteKit

```
/
├── plan.md
├── Ideate/
├── static/                      # favicon.svg, Logo.png, manifest.webmanifest
├── src/
│   ├── app.html
│   ├── app.css                  # tailwind v4 + tokens brand/emas/sukses
│   ├── lib/
│   │   ├── config.ts            # PUBLIC_* env, tarif, kota allowed
│   │   ├── api.ts               # fetch wrapper {ok,data}, typed per §9
│   │   ├── auth.ts              # session guard, role check
│   │   ├── format.ts            # Rp, tanggal id-ID, grade/warna
│   │   ├── gps.ts               # jarak haversine, validasi 50m
│   │   ├── upload.ts            # compress <1MB + PUT R2
│   │   └── components/
│   │       ├── ui/              # button, input, card, badge, dialog, sheet, skeleton (shadcn-svelte)
│   │       ├── layout/          # AppShell, TopNav, BottomNav, Sidebar, Container
│   │       ├── vehicle/         # VehicleCard, ScoreBadge BELI/NEGO/HINDARI, SpecList
│   │       └── forms/           # InspectionForm, SchedulePicker, SignaturePad
│   ├── routes/
│   │   ├── +page.svelte                 # / Landing (prerender)
│   │   ├── +layout.svelte               # AppShell responsif
│   │   ├── login/+page.svelte
│   │   ├── register/+page.svelte
│   │   ├── request-account/+page.svelte # inspektor
│   │   ├── forgot/+page.svelte
│   │   ├── otp/+page.svelte
│   │   ├── reset/+page.svelte
│   │   ├── app/+layout.svelte           # RequireAuth buyer
│   │   ├── app/home/+page.svelte
│   │   ├── app/search/+page.svelte
│   │   ├── app/vehicle/[id]/+page.svelte
│   │   ├── app/new-inspection/+page.svelte
│   │   ├── app/checkout/[orderId]/+page.svelte
│   │   ├── app/success/[orderId]/+page.svelte
│   │   ├── app/history/+page.svelte
│   │   ├── app/tracking/[orderId]/+page.svelte
│   │   ├── app/report/[id]/+page.svelte
│   │   ├── app/inbox/+page.svelte
│   │   ├── app/chat/[id]/+page.svelte
│   │   ├── app/settings/+page.svelte
│   │   ├── seller/+layout.svelte        # RequireRole seller
│   │   ├── seller/+page.svelte
│   │   ├── seller/schedule/+page.svelte
│   │   ├── seller/certification/+page.svelte
│   │   ├── inspector/+layout.svelte     # RequireRole inspector
│   │   ├── inspector/+page.svelte
│   │   ├── inspector/task/[id]/+page.svelte
│   │   ├── inspector/form/[id]/+page.svelte
│   │   ├── admin/+layout.svelte         # RequireRole admin
│   │   ├── admin/+page.svelte
│   │   ├── admin/orders/+page.svelte
│   │   ├── admin/inspectors/+page.svelte
│   │   └── admin/reports/+page.svelte
├── functions/
│   └── api/                     # lihat §9, 1 folder per resource
├── migrations/
│   └── 001_init.sql             # dari §8.3
├── svelte.config.js             # adapter-cloudflare
├── wrangler.toml                # bindings D1/R2/KV
├── package.json
└── .env.example
```

**File kunci sebelum deploy:**
- `svelte.config.js` pakai `adapter-cloudflare`, `package.json` script `build: vite build`, Node 20, `.env.example` (berisi `PUBLIC_API_BASE=/api`, `PUBLIC_APP_NAME`, `PUBLIC_PAYMENT_MODE`).

---

## 6. Sistem Desain Responsif (wajib mobile + desktop)

### 6.1 Prinsip
- Mobile-first: 360px dulu, naik via `sm: md: lg: xl:`.
- 1 codebase adaptif. Sentuh ≥44px. Tanpa scroll-x di 360px. Tipografi fluid `clamp()`.

### 6.2 Breakpoints & layout
| Token | Lebar | Layout |
|---|---|---|
| base | 0-639 | 1 kolom, BottomNav, sheet full-screen, CTA sticky bottom |
| sm | 640+ | 2 kolom cards |
| md | 768+ | top-nav, filter collapsible |
| lg | 1024+ | sidebar seller/inspector/admin, 3 kolom katalog, max-w-7xl |
| xl | 1280+ | 4 kolom, detail 2 kolom (galeri + summary sticky) |

- Container `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`, katalog `grid-cols-1 sm:2 lg:3 xl:4`, detail `lg:grid-cols-[1.2fr_.8fr]`, form inspeksi stepper mobile → side-tabs desktop, admin `hidden md:table` + cards `md:hidden`.

### 6.3 Navigasi adaptif (SvelteKit)
- Satu `AppShell` di `+layout.svelte`: `BottomNav` (mobile, 5 item: Home/Search/Order/History/Profile) vs `TopNav` + `Sidebar` (desktop). Switch via CSS `md:hidden` / `hidden md:flex`, bukan 2 app.
- Guard di `+layout.server.ts` / `+page.server.ts` + cek ulang di Functions.

### 6.4 Komponen & token
- Token: `brand-*` (navy/biru dari Logo), `accent-*` (emas Certified), `success/warn/danger` (BELI/NEGO/HINDARI). CSS vars di `app.css`.
- Wajib: skeleton, empty (No History/No Inbox), error retry — semua responsif.
- Gambar `aspect-[4/3] object-cover`, lazy, `srcset`. Foto lapangan compress <1MB sebelum upload.

### 6.5 QA responsif per halaman
- [ ] 360×800 CTA terlihat, form 1 step/layar
- [ ] 768 tak kepotong, filter buka/tutup
- [ ] 1024/1440 max-w seimbang
- [ ] Sentuh, keyboard, kontras AA, body ≥14px

---

## 7. Rute (URL) — mapping mockup

```
/ → Landing
/login /register /request-account /forgot /otp /reset
/app → redirect /app/home
/app/home, /app/search, /app/vehicle/[id]
/app/new-inspection, /app/checkout/[orderId], /app/success/[orderId]
/app/history, /app/tracking/[orderId], /app/report/[id]
/app/inbox, /app/chat/[id], /app/settings (+profile/payments/help tab)
/seller, /seller/schedule, /seller/certification
/inspector, /inspector/task/[id], /inspector/form/[id]
/admin, /admin/orders, /admin/inspectors, /admin/reports
/404
```
Guard: `GuestOnly`, `RequireAuth`, `RequireRole`. Guest cookie `guest=1`, wajib login saat checkout.

---

## 8. Model Data + ERD (D1 SQLite, file di R2, sementara di KV)

### 8.1 ERD (Mermaid — render di GitHub)

```mermaid
erDiagram
  users ||--o{ vehicles : "sells (seller_id)"
  users ||--o{ orders : "buys (buyer_id)"
  users ||--o| inspector_profiles : "has"
  users ||--o| seller_profiles : "has"
  users ||--o{ inspections : "inspects"
  users ||--o{ messages : "sends"
  users ||--o{ notifications : "receives"
  users ||--o{ reviews : "gives"
  vehicles ||--o{ vehicle_photos : "has"
  vehicles ||--o{ orders : "ordered"
  vehicles ||--o| certificates : "certified"
  orders ||--o{ payments : "paid_by"
  orders ||--o{ schedules : "scheduled"
  orders ||--o| inspections : "inspected_in"
  orders ||--o{ conversations : "discussed_in"
  orders ||--o{ reviews : "reviewed"
  inspections ||--o{ inspection_items : "150-point"
  inspections ||--o{ inspection_photos : "evidence"
  inspections ||--o| reports : "published_as"
  reports ||--o| certificates : "issued_from"
  conversations ||--o{ messages : "contains"
  users {
    TEXT id PK
    TEXT role "buyer|seller|inspector|admin"
    TEXT name
    TEXT email UK
    TEXT phone
    TEXT password_hash
    TEXT avatar_r2_key "R2 nullable"
    INTEGER trust_score "0-100"
    TEXT status "active|suspended"
    TEXT created_at
  }
  inspector_profiles {
    TEXT user_id PK_FK
    TEXT license_no UK "#1294"
    TEXT license_r2_key "R2"
    REAL rating "4.9"
    INTEGER total_inspections "420+"
    TEXT region "DKI Jakarta"
    TEXT status "pending|verified|suspended"
  }
  seller_profiles {
    TEXT user_id PK_FK
    TEXT showroom_name
    TEXT address
    REAL rating "4.8/5"
    TEXT bank_account "masked"
  }
  vehicles {
    TEXT id PK
    TEXT seller_id FK
    TEXT title "Civic Turbo 2021"
    TEXT brand
    TEXT model
    INTEGER year
    INTEGER mileage
    TEXT transmission "Manual|Matic"
    TEXT fuel
    TEXT plate_no "B 1234 SG"
    TEXT color
    TEXT location "Kalibata"
    INTEGER price "Rp"
    TEXT status "draft|listed|certified|rejected"
    TEXT certified_report_id FK "nullable"
    TEXT created_at
  }
  vehicle_photos {
    TEXT id PK
    TEXT vehicle_id FK
    TEXT r2_key "R2"
    INTEGER sort_order
  }
  orders {
    TEXT id PK "#TS-98211"
    TEXT buyer_id FK
    TEXT vehicle_id FK
    TEXT type "standard|fast-track"
    TEXT status "pending|paid|scheduled|in_progress|verified|failed|cancelled"
    INTEGER total "Rp"
    TEXT created_at
  }
  payments {
    TEXT id PK
    TEXT order_id FK
    TEXT provider "midtrans|xendit"
    TEXT external_id
    INTEGER amount
    TEXT method "CARD|QRIS|TRANSFER"
    TEXT status "pending|settlement|expire|failed"
    TEXT webhook_at
  }
  schedules {
    TEXT id PK
    TEXT order_id FK
    TEXT proposed_by "buyer|seller"
    TEXT datetime "2026-06-04 14:00+07"
    INTEGER duration_min "90"
    TEXT inspector_id FK "nullable"
    REAL gps_lat
    REAL gps_lng
    TEXT status "proposed|approved|alternative|completed"
  }
  inspections {
    TEXT id PK
    TEXT order_id FK_UK
    TEXT inspector_id FK
    TEXT checkin_at
    REAL checkin_lat
    REAL checkin_lng
    INTEGER checkin_valid "0|1 50m"
    INTEGER score "0-100"
    TEXT grade "A|B+"
    TEXT recommendation "beli|nego|hindari"
    INTEGER repair_estimate "Rp"
    TEXT summary
    TEXT signature_r2_key "R2"
    TEXT published_at
    TEXT guarantee_until "+30 hari"
  }
  inspection_items {
    TEXT id PK
    TEXT inspection_id FK
    TEXT category "mesin|bodi|interior|legalitas"
    TEXT item_key "oli_mesin"
    TEXT item_label "Oli Mesin"
    TEXT condition "normal|rembesan|aus|rusak"
    TEXT note
  }
  inspection_photos {
    TEXT id PK
    TEXT inspection_id FK
    TEXT r2_key "R2"
    REAL lat
    REAL lng
    TEXT taken_at
    INTEGER exif_valid "0|1"
    TEXT category
  }
  reports {
    TEXT id PK "#REP-3401"
    TEXT inspection_id FK_UK
    TEXT order_id FK
    TEXT pdf_r2_key "R2"
    INTEGER score_snapshot
    TEXT grade_snapshot
    INTEGER published "0|1"
    TEXT created_at
  }
  certificates {
    TEXT id PK
    TEXT vehicle_id FK
    TEXT report_id FK
    TEXT cert_no UK
    TEXT share_token "link OLX"
    TEXT issued_at
    TEXT expires_at
  }
  conversations {
    TEXT id PK
    TEXT order_id FK
    TEXT buyer_id FK
    TEXT seller_id FK
    TEXT inspector_id FK "nullable"
  }
  messages {
    TEXT id PK
    TEXT conversation_id FK
    TEXT sender_id FK
    TEXT body
    TEXT attachment_r2_key "R2 nullable"
    TEXT created_at
  }
  notifications {
    TEXT id PK
    TEXT user_id FK
    TEXT type "order|schedule|report|chat|payment"
    TEXT title
    TEXT body
    TEXT ref_id
    TEXT read_at "nullable"
  }
  reviews {
    TEXT id PK
    TEXT order_id FK
    TEXT inspector_id FK
    TEXT buyer_id FK
    INTEGER rating "1-5"
    TEXT comment
  }
```

### 8.2 Aturan relasi
- 1 seller → N vehicles. 1 vehicle → N orders (histori, 1 aktif).
- 1 order → N payments (retry), N schedules (nego), 1 inspections, N conversations.
- 1 inspections → N items (query per `category` biar hemat read), N photos, 1 reports → 0/1 certificates.
- File hanya `r2_key` di D1. OTP/session di KV (`otp:{email}`, `sess:{token}`) + TTL.

### 8.3 DDL awal (`migrations/001_init.sql`)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK(role IN ('buyer','seller','inspector','admin')),
  name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT,
  password_hash TEXT NOT NULL, avatar_r2_key TEXT,
  trust_score INTEGER DEFAULT 0, status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE inspector_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  license_no TEXT UNIQUE NOT NULL, license_r2_key TEXT,
  rating REAL DEFAULT 0, total_inspections INTEGER DEFAULT 0,
  region TEXT, status TEXT DEFAULT 'pending'
);
CREATE TABLE seller_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  showroom_name TEXT, address TEXT, rating REAL DEFAULT 0, bank_account TEXT
);
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY, seller_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL, brand TEXT, model TEXT, year INTEGER,
  mileage INTEGER, transmission TEXT, fuel TEXT, plate_no TEXT,
  color TEXT, location TEXT, price INTEGER NOT NULL,
  status TEXT DEFAULT 'draft', certified_report_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_vehicles_seller ON vehicles(seller_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE TABLE vehicle_photos (
  id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  r2_key TEXT NOT NULL, sort_order INTEGER DEFAULT 0
);
CREATE TABLE orders (
  id TEXT PRIMARY KEY, buyer_id TEXT NOT NULL REFERENCES users(id),
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  type TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'pending', total INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_vehicle ON orders(vehicle_id);
CREATE TABLE payments (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
  provider TEXT, external_id TEXT, amount INTEGER NOT NULL,
  method TEXT, status TEXT DEFAULT 'pending', webhook_at TEXT
);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE TABLE schedules (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
  proposed_by TEXT, datetime TEXT NOT NULL, duration_min INTEGER DEFAULT 90,
  inspector_id TEXT REFERENCES users(id),
  gps_lat REAL, gps_lng REAL, status TEXT DEFAULT 'proposed'
);
CREATE TABLE inspections (
  id TEXT PRIMARY KEY, order_id TEXT UNIQUE NOT NULL REFERENCES orders(id),
  inspector_id TEXT NOT NULL REFERENCES users(id),
  checkin_at TEXT, checkin_lat REAL, checkin_lng REAL, checkin_valid INTEGER DEFAULT 0,
  score INTEGER, grade TEXT, recommendation TEXT, repair_estimate INTEGER,
  summary TEXT, signature_r2_key TEXT, published_at TEXT, guarantee_until TEXT
);
CREATE TABLE inspection_items (
  id TEXT PRIMARY KEY, inspection_id TEXT NOT NULL REFERENCES inspections(id),
  category TEXT NOT NULL, item_key TEXT NOT NULL, item_label TEXT,
  condition TEXT, note TEXT
);
CREATE INDEX idx_items_inspection ON inspection_items(inspection_id, category);
CREATE TABLE inspection_photos (
  id TEXT PRIMARY KEY, inspection_id TEXT NOT NULL REFERENCES inspections(id),
  r2_key TEXT NOT NULL, lat REAL, lng REAL, taken_at TEXT,
  exif_valid INTEGER DEFAULT 0, category TEXT
);
CREATE TABLE reports (
  id TEXT PRIMARY KEY, inspection_id TEXT UNIQUE NOT NULL REFERENCES inspections(id),
  order_id TEXT NOT NULL REFERENCES orders(id),
  pdf_r2_key TEXT NOT NULL, score_snapshot INTEGER, grade_snapshot TEXT,
  published INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE certificates (
  id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  report_id TEXT NOT NULL REFERENCES reports(id),
  cert_no TEXT UNIQUE NOT NULL, share_token TEXT UNIQUE,
  issued_at TEXT DEFAULT (datetime('now')), expires_at TEXT
);
CREATE TABLE conversations (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
  buyer_id TEXT NOT NULL, seller_id TEXT NOT NULL, inspector_id TEXT
);
CREATE TABLE messages (
  id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id),
  sender_id TEXT NOT NULL REFERENCES users(id),
  body TEXT, attachment_r2_key TEXT, created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_messages_conv ON messages(conversation_id, created_at);
CREATE TABLE notifications (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT, title TEXT, body TEXT, ref_id TEXT, read_at TEXT
);
CREATE INDEX idx_notif_user ON notifications(user_id, read_at);
CREATE TABLE reviews (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
  inspector_id TEXT NOT NULL, buyer_id TEXT NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5), comment TEXT
);
```

Seed: Civic Turbo 2021 (Belum Bersertifikat), 911 Carrera 2022 (Verified 94), Budi Perkasa, Hendra Wijaya, Budi Santoso #1294.

---

## 9. Kontrak API Lengkap per Tabel/Fitur (FINAL)

### 9.0 Konvensi global (berlaku semua)
- Base: `/api/*` (Pages Functions). SvelteKit memanggil via `lib/api.ts` (`fetch`).
- Envelope: sukses `{ok:true, data:...}`, gagal `{ok:false, error:{code, message}}`.
- Validasi: Zod di client (Superforms) + server (Functions). Pesan Indo.
- Pagination list: `?q=&limit=20&cursor=` → `{items, nextCursor}`. Default `limit=20`, max 50 (hemat D1 read).
- ID: order `#TS-xxxxx`, report `#REP-xxxx`, lainnya `nanoid`. Harga integer Rupiah.
- Error codes standar: `UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, RATE_LIMITED, CONFLICT, PAYMENT_REQUIRED, UPSTREAM_ERROR`.
- Rate-limit di KV: login 10/menit/IP, OTP kirim 3/10 mnt/email, sign-upload 30/menit/user.
- Semua yang butuh file: 2 langkah — `POST /api/uploads/sign` → PUT R2 → kirim `r2_key` ke API utama.

### 9.1 Auth + Users (`users`, KV session/OTP)
| Method & Path | Auth | Body / Query | Sukses | Error | Tabel |
|---|---|---|---|---|---|
| `POST /api/auth/register` | guest | `{name, email, phone?, password>=8, role: buyer\|seller}` (Zod) | `{user:{id,name,email,role,trust_score:0}}` + set cookie session | `CONFLICT` email dipakai | `users` insert, KV `sess` |
| `POST /api/auth/login` | guest | `{email, password}` | `{user}` + cookie | `UNAUTHENTICATED` | `users` read, KV sess |
| `POST /api/auth/request-account` | guest | `{name,email,phone,password,license_no,license_r2_key,region}` | `{status:"pending"}` | `CONFLICT` | `users(role=inspector)` + `inspector_profiles(pending)` |
| `POST /api/auth/logout` | any | — | `{ok:true}` + clear cookie | — | KV delete sess |
| `GET /api/me` | any login | — | `{user + profile (seller/inspector)}` | `UNAUTHENTICATED` | `users` + profile join |
| `POST /api/auth/otp/send` | guest | `{email}` | `{sent:true}` (dev: tampilkan kode di log saja) | `RATE_LIMITED` | KV `otp:{email}` TTL 5 mnt |
| `POST /api/auth/otp/verify` | guest | `{email, code6}` | `{verified:true}` + boleh reset | `VALIDATION_ERROR` max 5x | KV get/del |
| `POST /api/auth/password/reset` | otp-verified | `{email, code, newPassword}` | `{ok:true}` | `VALIDATION_ERROR` | `users` update hash |
| `PATCH /api/me` | login | `{name?, phone?, avatar_r2_key?}` | `{user}` | `VALIDATION_ERROR` | `users` update |
| `GET /api/me/notifications?cursor=` | login | — | `{items:[{id,type,title,body,ref_id,read_at}]}` | — | `notifications` |

Dipakai SvelteKit: `login/register/request-account/forgot/otp/reset/+page.svelte`, `app/settings`.

### 9.2 Vehicles + Photos (`vehicles`, `vehicle_photos`, `certificates`)
| Method & Path | Auth | Body / Query | Sukses | Error |
|---|---|---|---|---|
| `GET /api/vehicles?q=&status=listed&brand=&maxPrice=&limit=&cursor=` | public (guest boleh) | query | `{items:[{id,title,year,mileage,price,location,status,score?,coverR2}], nextCursor}` | — |
| `GET /api/vehicles/:id` | public | — | `{vehicle, photos:[{r2_key}], certificate:{cert_no,grade}|null, seller:{name,rating}}` | `NOT_FOUND` |
| `POST /api/seller/vehicles` | seller | `{title,brand,model,year,mileage,transmission,fuel,plate_no,color,location,price,photoKeys[]}` kota wajib Jabodetabek | `{vehicleId}` | `FORBIDDEN, VALIDATION_ERROR` |
| `PATCH /api/seller/vehicles/:id` | seller pemilik | parsial sama | `{vehicle}` | `FORBIDDEN` |
| `GET /api/certificates/:shareToken` | public | — | `{cert_no, vehicle, report:{score,grade}, issued_at}` (untuk share OLX) | `NOT_FOUND` |

D1 hemat: list hanya `SELECT` kolom card + `LIMIT`, detail baru join foto/sertifikat. R2: `vehicle_photos.r2_key` → signed URL.

Dipakai: `/app/home`, `/app/search`, `/app/vehicle/[id]`, `/seller`.

### 9.3 Orders (`orders`)
| Method & Path | Auth | Body | Sukses | Error |
|---|---|---|---|---|
| `POST /api/orders` | buyer login | `{vehicleId, type:"standard"\|"fast-track"}` | `{orderId:"#TS-xxxxx", total, status:"pending"}` tarif tetap dari `lib/config` | `NOT_FOUND` vehicle, `PAYMENT_REQUIRED` jika ada order aktif sama |
| `GET /api/orders/mine?status=&cursor=` | buyer | — | `{items:[{id,vehicleTitle,total,status,created_at}]}` | — |
| `GET /api/orders/:id` | buyer pemilik / seller terkait / inspector assigned / admin | — | `{order, vehicle, schedule, payment, inspectionStatus}` | `FORBIDDEN` |
| `POST /api/orders/:id/cancel` | buyer pemilik, hanya `pending/paid` | `{reason?}` | `{status:"cancelled"}` | `CONFLICT` jika sudah scheduled+ |

Status machine: `pending → paid → scheduled → in_progress → verified | failed | cancelled`.

Dipakai: `new-inspection`, `checkout`, `history`, `tracking`.

### 9.4 Payments + Webhook (`payments`)
| Method & Path | Auth | Body | Sukses | Error |
|---|---|---|---|---|
| `POST /api/orders/:id/pay` | buyer pemilik | `{method:"CARD"\|"QRIS"\|"TRANSFER", provider:"midtrans"}` | `{paymentId, redirectUrl\|snapToken, amount}` | `CONFLICT` sudah paid |
| `POST /api/webhooks/payment` | signature Midtrans/Xendit | provider payload | `{ok:true}` + update `payments.status=settlement` + `orders.status=paid` + notif | `FORBIDDEN` signature invalid |
| `GET /api/orders/:id/payment` | buyer pemilik | — | `{status, method, amount}` | `NOT_FOUND` |

Secret provider hanya di Functions env. SvelteKit hanya terima redirect/token.

Dipakai: `checkout/[orderId]`, `success/[orderId]`.

### 9.5 Schedules (`schedules`)
| Method & Path | Auth | Body | Sukses |
|---|---|---|---|
| `POST /api/orders/:id/schedules` | buyer/seller terkait | `{datetimeISO+07, duration_min=90, gps_lat, gps_lng, note?}` | `{scheduleId, status:"proposed"}` |
| `POST /api/schedules/:id/approve` | seller (atau buyer jika seller yang propose) | — | `{status:"approved"}` + `orders.status=scheduled` + assign inspector (P1 manual, P3 auto) |
| `POST /api/schedules/:id/alternative` | lawan propose | `{datetimeISO}` | `{scheduleId baru, status:"proposed"}` |
| `GET /api/seller/schedules?scope=mine` | seller | — | list jadwal mobilnya |
| `GET /api/inspector/schedules` | inspector | — | list tugas (join orders+vehicles) |

Dipakai: `seller/schedule`, `tracking`.

### 9.6 Inspections (`inspections`, `inspection_items`, `inspection_photos`)
| Method & Path | Auth | Body | Sukses |
|---|---|---|---|
| `GET /api/inspector/tasks` | inspector | `?status=scheduled` | `[{orderId, vehicleTitle, datetime, location, distance_km}]` |
| `GET /api/inspections/:id` | inspector assigned / buyer / admin | — | `{inspection, items grouped by category, photos[]}` |
| `POST /api/inspections/:id/checkin` | inspector assigned | `{lat, lng}` → server hitung jarak ke `schedules.gps` (P0 log saja, P3 tolak jika >50m) | `{checkin_valid:0\|1, distance_m}` + `orders.status=in_progress` |
| `POST /api/inspections/:id/items` | inspector assigned | `{items:[{category,item_key,item_label,condition,note}]}` boleh parsial/draft | `{saved: n}` |
| `POST /api/inspections/:id/photos/confirm` | inspector assigned | `{keys:[{r2_key, lat, lng, taken_at, category}]}` server cek EXIF/time-mismatch (P3 strict) | `{confirmed:n}` |
| `POST /api/inspections/:id/submit` | inspector assigned | `{score 0-100, grade, recommendation: beli\|nego\|hindari, repair_estimate, summary, signature_r2_key}` + syarat items≥min & foto≥min | `{inspectionId, score, grade}` + buat `reports` draft + `orders.status=verified` (atau pending-review jika admin mode) |

Aturan hemat D1: `GET items?category=mesin` untuk tab form, jangan load 150 sekaligus di mobile.

Dipakai: `inspector/task/[id]`, `inspector/form/[id]`.

### 9.7 Reports + Certificates (`reports`, `certificates`)
| Method & Path | Auth | Body | Sukses |
|---|---|---|---|
| `GET /api/reports/:id` | buyer pemilik / seller terkait / admin | — | `{report:{score,grade,pdfUrl signed 10 mnt, items_summary, photos[]}}` |
| `POST /api/inspections/:id/publish` | inspector assigned atau admin | `{published:1}` | `{reportId:"#REP-xxxx", pdf_r2_key}` + `guarantee_until=+30d` |
| `POST /api/certificates` | admin (atau auto saat publish grade A) | `{vehicle_id, report_id}` | `{cert_no, share_token}` |
| `GET /api/certificates/by-vehicle/:vehicleId` | public | — | `{cert_no, grade, pdfUrl}|null` |

Dipakai: `app/report/[id]`, `app/vehicle/[id]` (badge Certified), `seller/certification`.

### 9.8 Uploads (`vehicle_photos`, `inspection_photos`, avatar/lisensi/TTD)
| Method & Path | Auth | Body | Sukses |
|---|---|---|---|
| `POST /api/uploads/sign` | login | `{purpose:"vehicle\|inspection\|avatar\|license\|signature\|chat", contentType:"image/jpeg\|image/png\|application/pdf", size<=5MB}` | `{signedUrl, r2_key, expires_in:600}` |

Server validasi MIME+size, prefix key per purpose: `vehicles/{id}/`, `inspections/{id}/`, dst. R2 private.

Dipakai semua form berfoto.

### 9.9 Chat + Inbox (`conversations`, `messages`, `notifications`)
| Method & Path | Auth | Body | Sukses |
|---|---|---|---|
| `POST /api/conversations` | buyer/seller | `{orderId}` (idempoten per order+pasangan) | `{conversationId}` |
| `GET /api/conversations/mine` | login | — | `{items:[{id, orderId, lastMessage, unread}]}` (polling 10s di P2) |
| `GET /api/conversations/:id/messages?cursor=` | anggota | — | `{items:[{sender, body, attachmentUrl?, created_at}]}` |
| `POST /api/conversations/:id/messages` | anggota | `{body<=1000, attachment_r2_key?}` | `{messageId}` + buat `notifications` untuk lawan |
| `POST /api/notifications/:id/read` | pemilik | — | `{ok:true}` |

Realtime (Durable Objects/WebSocket) P4. P2 cukup polling.

Dipakai: `app/inbox`, `app/chat/[id]`.

### 9.10 Seller (`seller_profiles`, `vehicles` miliknya)
| Method & Path | Auth | Body | Sukses |
|---|---|---|---|
| `GET /api/seller/overview` | seller | — | `{totalVehicles, pendingRequests, certifiedCount, rating}` |
| `GET /api/seller/vehicles` | seller | — | list mobilnya + status sertifikasi |
| `PATCH /api/seller/profile` | seller | `{showroom_name, address, bank_account}` | `{profile}` |

Dipakai: `/seller`.

### 9.11 Inspector (`inspector_profiles`)
| Method & Path | Auth | Body | Sukses |
|---|---|---|---|
| `GET /api/inspector/me` | inspector | — | `{license_no, rating, total_inspections, status}` |
| `PATCH /api/inspector/me` | inspector | `{region?, avatar_r2_key?}` | `{profile}` |
| `GET /api/inspectors?region=&q=` | admin / public terbatas | — | `{items:[{license_no, rating, total, region}]}` tanpa data sensitif |

Dipakai: `/inspector`, profil inspektor di report.

### 9.12 Admin (`users`, `orders`, `inspections`, `reports`)
| Method & Path | Auth | Ket |
|---|---|---|
| `GET /api/admin/overview` | admin | `{counts:{orders, pending, inspections_today, revenue}, recentOrders[]}` |
| `GET /api/admin/orders?status=&cursor=` | admin | filter + pagination |
| `POST /api/admin/orders/:id/assign` | admin | `{inspector_id}` → update `schedules.inspector_id` |
| `GET /api/admin/inspectors?status=` | admin | kelola lisensi |
| `POST /api/admin/inspectors/:id/verify` | admin | `{status:"verified"\|"suspended"}` |
| `GET /api/admin/reports?published=` | admin | audit |
| `POST /api/admin/reports/:id/publish` | admin | publish final + buat sertifikat jika layak |

Dipakai: `/admin/*` (tabel → cards di mobile).

### 9.13 Reviews (`reviews`)
| Method & Path | Auth | Body | Sukses |
|---|---|---|---|
| `POST /api/orders/:id/review` | buyer pemilik, hanya jika `verified` | `{rating 1-5, comment?}` 1x per order | `{reviewId}` + update `inspector_profiles.rating` (avg) |
| `GET /api/inspectors/:id/reviews` | public | — | list ulasan |

### 9.14 Contoh end-to-end (Civic Turbo)
1. Buyer `POST /api/orders {vehicleId:civic, type:fast-track}` → `#TS-98211`
2. `POST /api/orders/#TS/pay {QRIS}` → webhook → `paid`
3. Buyer `POST schedules {2026-06-04 14:00, Kalibata}` → seller approve → `scheduled` + assign Budi Santoso
4. Inspector `POST checkin {lat,lng}` → `in_progress`, `POST items` + `photos/confirm`, `POST submit {B+, nego}` → `verified` + draft report
5. `POST publish` → `#REP-3401` + PDF signed URL, buyer baca di `/app/report/#REP-3401`, seller dapat badge Certified + share OLX.

---

## 10. Auth, Roles & Keamanan

- Cookie `__Host-trusight` HttpOnly Secure SameSite=Lax 7 hari. CSRF double-submit untuk POST. Cek `role` di setiap Function. Admin via seed env.
- Password ≥8 hash server-side. OTP 6 digit TTL 5 mnt max 5x. Rate-limit KV.
- Anti-fraud P0 log saja; P3: `capture="environment"`, tolak EXIF galeri, tolak GPS/time mismatch >5 mnt. Simpan lat/lng+timestamp per foto.
- R2 private signed URL 10 mnt. Validasi MIME & 5MB/foto. Compress client <1MB.

---

## 11. Deployment Cloudflare Pages (SvelteKit)

### 11.1 Prasyarat
Akun Cloudflare + repo `Trusight` branch `main`, `wrangler` login, Node 20.

### 11.2 Konfigurasi build
- Framework preset: **SvelteKit**.
- Build command: `npm run build`. Node `20`.
- `svelte.config.js`:
```js
import adapter from '@sveltejs/adapter-cloudflare';
export default { kit: { adapter: adapter() } };
```
- Env: `PUBLIC_API_BASE=/api`, `PUBLIC_APP_NAME=TruSight`, `PUBLIC_PAYMENT_MODE=sandbox`. Secret hanya di Pages → Settings → Environment Variables (bukan `PUBLIC_*`).

### 11.3 Wrangler + bindings
```toml
name = "trusight"
compatibility_date = "2025-09-01"

[[d1_databases]]
binding = "DB"
database_name = "trusight-db"
database_id = "ISI_DARI_WRANGLER"

[[r2_buckets]]
binding = "PHOTOS"
bucket_name = "trusight-photos"

[[r2_buckets]]
binding = "REPORTS"
bucket_name = "trusight-reports"

[[kv_namespaces]]
binding = "SESSIONS"
id = "ISI_DARI_WRANGLER"
```
```bash
npm i -g wrangler
wrangler login
wrangler d1 create trusight-db
wrangler kv:namespace create SESSIONS
wrangler r2 bucket create trusight-photos
wrangler r2 bucket create trusight-reports
wrangler d1 migrations apply trusight-db --local
npm run dev
npm run build
wrangler pages deploy .svelte-kit/cloudflare
```

### 11.4 Connect Git → Pages
1. Dashboard → Workers & Pages → Create → Pages → Connect Git → repo → `main`.
2. Build `npm run build`, output via adapter (ikuti docs adapter-cloudflare terbaru).
3. Tambah bindings D1/R2/KV + env di Settings → Functions → Bindings/Variables.
4. Custom domain `trusight.id` → HTTPS otomatis.
5. Preview per-PR `*.trusight.pages.dev`, production hanya `main`.

### 11.5 Go-live
- [ ] Headers: `X-Content-Type-Options, Referrer-Policy, Permissions-Policy=camera`.
- [ ] Webhook sandbox lolos.
- [ ] Rollback via Deployments → Rollback.

---

## 12. Fase Implementasi (3-5 orang)

**Fase 0 — Setup (0.5 mgg):** `npm create svelte`, Tailwind v4, shadcn-svelte, `lucide-svelte`, `adapter-cloudflare`, AppShell responsif, `wrangler.toml`, `001_init.sql` + seed, CI lint+build, Pages preview. Deliverable: landing kosong hijau.

**Fase 1 — Buyer MVP (1.5 mgg):** Landing, Auth+guest, Home+Search+Filter, Detail+ScoreBadge, New Inspection, Checkout dummy, History+Report statis, Profile. QA 4 viewport. Deliverable: demo buyer E2E di preview URL.

**Fase 2 — Transaksi nyata (1 mgg):** Midtrans/Xendit sandbox + webhook (§9.4), status machine (§9.3), R2 signed URL (§9.8), PDF sederhana, Inbox list. Deliverable: bayar → status berubah → unduh laporan.

**Fase 3 — Seller+Inspector+Admin (1.5 mgg):** Seller (§9.10), Inspector tasks/checkin/form/submit (§9.6), Admin (§9.12), TTD canvas. Validasi longgar. Deliverable: 1 alur Civic penuh.

**Fase 4 — Hardening (1 mgg):** GPS 50m strict, EXIF guard, garansi/komplain 30d, share sertifikat, rate-limit, Sentry, PWA, SEO/OG, polish warna, empty/error. Load ringan + Lighthouse. Go-live domain.

Total ±5 mgg full, 2 mgg jika hanya Buyer MVP.

---

## 13. Testing

- Unit Vitest: skor, format Rp, guard role, haversine 50m, validasi Zod (§9).
- E2E Playwright 390px & 1280px: guest→register→order→pay; seller approve; inspector submit→buyer lihat laporan.
- Visual: screenshot 360/768/1280 per rute. Payment webhook replay. Checklist §6.5.

---

## 14. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Login dipaksa sebelum paham value | Guest lihat katalog, login wajib saat checkout |
| Serakah luar kota | Validasi Jabodetabek di form + server (§9.2) |
| Bagi hasil bocor | Tarif tetap standard/fast-track di config |
| Verifikator tak dipercaya | Profil+lisensi+rating+foto live+garansi sejak MVP |
| Monoton/ambigu jual-beli | Token brand + badge Certified tegas |
| Foto galeri | EXIF+GPS guard P3 + compress client |
| Jebol limit D1 gratis | Pagination + filter category + index §8.3, alert email |

---

## 15. DoD per Halaman/Endpoint

- Responsif 4 viewport, tanpa scroll-x, CTA ≥44px.
- Loading/empty/error ada. Form Zod pesan Indo.
- API ikut §9 (envelope, code, pagination). Bukan mock kecuali label `MOCK` di PR.
- Lighthouse ≥90 mobile. Preview URL + screenshot mobile+desktop di PR.

---

## 16. Langkah Berikutnya

1. Setujui v2.0 ini (atau revisi).
2. Saya init SvelteKit Fase 0 + migrasi §8.3 + `lib/api.ts` typed dari §9 — butuh konfirmasi.
3. Siapkan: `Logo.png` HD, palet final, copy landing Indo, tarif Standard vs Fast-Track, kredensial Midtrans sandbox + email OTP.
4. Branch `feat/mvp-buyer` + Pages preview → mulai Fase 0.

---

*v2.0 FINAL. Tidak ada kode diubah. Setujui / revisi dulu sebelum eksekusi.*
