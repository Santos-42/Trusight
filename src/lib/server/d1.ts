/** Lapisan D1 live TruSight — dipakai endpoint api/[...path]. Tanpa dependensi SvelteKit agar bisa di-unit-test. */

export interface Stmt {
  bind(...params: unknown[]): {
    first<T = Record<string, unknown>>(): Promise<(T & Record<string, unknown>) | null>;
    all<T = Record<string, unknown>>(): Promise<{ results: (T & Record<string, unknown>)[] }>;
    run(): Promise<unknown>;
  };
}
export interface Db {
  prepare(sql: string): Stmt;
}

const qOne = <T>(db: Db, sql: string, ...p: unknown[]) => db.prepare(sql).bind(...p).first<T>();
const qAll = <T>(db: Db, sql: string, ...p: unknown[]) =>
  db.prepare(sql).bind(...p).all<T>().then((r) => r.results);
const exec = (db: Db, sql: string, ...p: unknown[]) => db.prepare(sql).bind(...p).run();

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
}
const num5 = () => Math.floor(10000 + Math.random() * 89999);

export const PRICING: Record<string, number> = { standard: 299000, 'fast-track': 499000 };

export interface OrderInput { vehicleId: string; type: string; buyerId: string }
export async function createOrder(db: Db, b: OrderInput) {
  const v = await qOne<{ price: number; seller_id: string }>(db, 'SELECT price, seller_id FROM vehicles WHERE id=?', b.vehicleId);
  if (!v) throw Object.assign(new Error('Kendaraan tidak ditemukan'), { code: 'NOT_FOUND' });
  // Opsi A: tolak bila buyer masih punya pesanan aktif untuk kendaraan yang sama.
  const active = await qOne<{ id: string }>(db,
    `SELECT id FROM orders WHERE buyer_id=? AND vehicle_id=? AND status IN ('pending','scheduled','in_progress') LIMIT 1`,
    b.buyerId, b.vehicleId);
  if (active) {
    throw Object.assign(
      new Error(`Anda masih memiliki pesanan aktif (${active.id}) untuk mobil ini. Selesaikan atau batalkan dulu sebelum order baru.`),
      { code: 'CONFLICT' }
    );
  }
  const type = b.type === 'fast-track' ? 'fast-track' : 'standard';
  const id = `TS-${num5()}`;
  await exec(db, 'INSERT INTO orders (id, buyer_id, vehicle_id, type, status, total) VALUES (?,?,?,?,?,?)',
    id, b.buyerId, b.vehicleId, type, 'pending', PRICING[type]);
  return { orderId: id, total: PRICING[type], status: 'pending', sellerId: v.seller_id };
}

export interface OrderFilter { buyerId?: string; sellerId?: string; inspectorId?: string; status?: string }
export function listOrders(db: Db, f: OrderFilter) {
  // PRIVASI LOKASI: hanya v.location_area (kota/kecamatan) yang pernah dikirim
  // lewat list. Lokasi detail sengaja tidak dipilih di sini supaya tidak bocor ke
  // seller lewat /orders/incoming — tidak peduli apa pun filter-nya.
  let sql = `SELECT o.id, o.buyer_id, o.vehicle_id, o.type, o.status, o.total, o.created_at,
    v.title AS vehicle, v.location_area AS location, ub.name AS buyer, us.name AS seller, rep.id AS report_id
    FROM orders o JOIN vehicles v ON v.id=o.vehicle_id
    LEFT JOIN users ub ON ub.id=o.buyer_id LEFT JOIN users us ON us.id=v.seller_id
    LEFT JOIN reports rep ON rep.order_id=o.id`;
  const where: string[] = [];
  const p: unknown[] = [];
  if (f.buyerId) { where.push('o.buyer_id=?'); p.push(f.buyerId); }
  if (f.sellerId) { where.push('v.seller_id=?'); p.push(f.sellerId); }
  if (f.status && f.status !== 'all') { where.push('o.status=?'); p.push(f.status); }
  if (f.inspectorId) {
    sql += ' JOIN schedules s ON s.order_id=o.id';
    where.push('s.inspector_id=?'); p.push(f.inspectorId);
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY o.created_at DESC';
  return qAll(db, sql, ...p);
}

/** Apakah order sudah dibayar? `orders.status` sengaja TIDAK mencerminkan pembayaran
 *  (status: pending → scheduled → verified), jadi sinyalnya ada di tabel `payments`. */
export async function isOrderPaid(db: Db, orderId: string): Promise<boolean> {
  const row = await qOne<{ id: string }>(db,
    "SELECT id FROM payments WHERE order_id=? AND status='paid' LIMIT 1", orderId);
  return !!row;
}

/**
 * Lokasi detail hanya boleh dibuka untuk: pembeli order itu, atau inspektor yang
 * bertugas — dan hanya SETELAH order dibayar. Seller tidak pernah lolos.
 *
 * Catatan keamanan: autentikasi server belum ada, jadi `viewerId` berasal dari client.
 * Yang ditegakkan kuat tetap `listOrders`, yang tidak pernah mengirim lokasi detail.
 */
export async function canRevealLocation(db: Db, orderId: string, viewerId: string): Promise<boolean> {
  if (!orderId || !viewerId) return false;
  const o = await qOne<{ buyer_id: string }>(db, 'SELECT buyer_id FROM orders WHERE id=?', orderId);
  if (!o) return false;
  const isBuyer = o.buyer_id === viewerId;
  const isInspector = !!await qOne(db,
    'SELECT inspector_id FROM schedules WHERE order_id=? AND inspector_id=? LIMIT 1', orderId, viewerId);
  if (!isBuyer && !isInspector) return false;
  return isOrderPaid(db, orderId);
}

export async function getOrder(db: Db, id: string): Promise<Record<string, unknown> | null> {
  // `location` = area publik (selalu aman), `location_detail` = alamat lengkap yang
  // baru boleh disurface pemanggil bila `canRevealLocation` lolos.
  const o = await qOne(db, `SELECT o.*, v.title AS vehicle, v.location_area AS location,
    v.location AS location_detail, v.price, v.year,
    ub.name AS buyer, us.name AS seller
    FROM orders o JOIN vehicles v ON v.id=o.vehicle_id
    LEFT JOIN users ub ON ub.id=o.buyer_id LEFT JOIN users us ON us.id=v.seller_id
    WHERE o.id=?`, id);
  if (!o) return null;
  const schedule = await qOne(db, `SELECT s.datetime, s.status, u.name AS inspector
    FROM schedules s LEFT JOIN users u ON u.id=s.inspector_id
    WHERE s.order_id=? ORDER BY s.rowid DESC LIMIT 1`, id);
  const paid = await isOrderPaid(db, id);
  return { ...(o as Record<string, unknown>), schedule: schedule ?? null, paid };
}

export interface ApproveInput { orderId: string; inspectorId: string; action: 'approve' | 'alternative'; slot?: string }
export async function approveOrder(db: Db, b: ApproveInput) {
  const o = await qOne<{ buyer_id: string; vehicle_id: string }>(db, 'SELECT buyer_id, vehicle_id FROM orders WHERE id=?', b.orderId);
  if (!o) throw Object.assign(new Error('Order tidak ditemukan'), { code: 'NOT_FOUND' });
  await exec(db, 'UPDATE orders SET status=? WHERE id=?', 'scheduled', b.orderId);
  const slot = b.slot ?? (b.action === 'alternative' ? 'usulan penjadwalan ulang' : 'menunggu konfirmasi');
  const inspectorId = b.inspectorId || 'u-bsantoso';
  await exec(db, `INSERT INTO schedules (id, order_id, proposed_by, datetime, inspector_id, status)
    VALUES (?,?,?,?,?,?)`, uid('SCH'), b.orderId, 'seller', slot, inspectorId,
    b.action === 'approve' ? 'approved' : 'proposed');
  // C2: inspector masuk sebagai peserta conversation order
  const v = await qOne<{ seller_id: string }>(db, 'SELECT seller_id FROM vehicles WHERE id=?', o.vehicle_id);
  if (v) await ensureConversation(db, { orderId: b.orderId, buyerId: o.buyer_id, sellerId: v.seller_id, inspectorId });
  return { orderId: b.orderId, status: 'scheduled', slot };
}

export interface CheckinInput { orderId: string; inspectorId: string; lat: number; lng: number; valid: boolean }
export async function checkin(db: Db, b: CheckinInput) {
  const id = uid('INSP');
  await exec(db, `INSERT INTO inspections (id, order_id, inspector_id, checkin_at, checkin_lat, checkin_lng, checkin_valid)
    VALUES (?,?,?,?,?,?,?)
    ON CONFLICT(order_id) DO UPDATE SET checkin_at=excluded.checkin_at, checkin_lat=excluded.checkin_lat,
    checkin_lng=excluded.checkin_lng, checkin_valid=excluded.checkin_valid`,
    id, b.orderId, b.inspectorId, new Date().toISOString(), b.lat, b.lng, b.valid ? 1 : 0);
  return { orderId: b.orderId, checkedIn: true, valid: b.valid };
}

export interface SubmitInput {
  orderId: string; inspectorId: string; score: number; grade: string;
  recommendation: string; repairEstimate: number; items?: { category: string; key: string; label: string; condition: string }[];
  photoKeys?: string[];
}
export async function submitInspection(db: Db, b: SubmitInput) {
  const insp = await qOne<{ id: string }>(db, 'SELECT id FROM inspections WHERE order_id=?', b.orderId);
  const inspId = insp?.id ?? uid('INSP');
  if (!insp) await exec(db, 'INSERT INTO inspections (id, order_id, inspector_id) VALUES (?,?,?)', inspId, b.orderId, b.inspectorId);
  await exec(db, `UPDATE inspections SET score=?, grade=?, recommendation=?, repair_estimate=?,
    guarantee_until=date('now','+30 days') WHERE id=?`,
    b.score, b.grade, b.recommendation, b.repairEstimate ?? 0, inspId);
  await exec(db, 'DELETE FROM inspection_items WHERE inspection_id=?', inspId);
  for (const it of b.items ?? []) {
    await exec(db, 'INSERT INTO inspection_items (id, inspection_id, category, item_key, item_label, condition) VALUES (?,?,?,?,?,?)',
      uid('ITM'), inspId, it.category, it.key, it.label, it.condition);
  }
  await exec(db, 'DELETE FROM inspection_photos WHERE inspection_id=?', inspId);
  for (const k of b.photoKeys ?? []) {
    await exec(db, 'INSERT INTO inspection_photos (id, inspection_id, r2_key, taken_at) VALUES (?,?,?,?)',
      uid('PHT'), inspId, k, new Date().toISOString());
  }
  const repId = `REP-${num5()}`;
  await exec(db, `INSERT INTO reports (id, inspection_id, order_id, pdf_r2_key, score_snapshot, grade_snapshot, published)
    VALUES (?,?,?,?,?,?,0)
    ON CONFLICT(inspection_id) DO UPDATE SET score_snapshot=excluded.score_snapshot, grade_snapshot=excluded.grade_snapshot`,
    repId, inspId, b.orderId, `pending:${repId}`, b.score, b.grade);
  const rep = await qOne<{ id: string }>(db, 'SELECT id FROM reports WHERE inspection_id=?', inspId);
  await exec(db, "UPDATE orders SET status='verified' WHERE id=?", b.orderId);
  return { inspectionId: inspId, reportId: rep?.id ?? repId, score: b.score, grade: b.grade };
}

export function getReport(db: Db, id: string) {
  // i.recommendation / repair_estimate / guarantee_until / summary sebelumnya tidak
  // pernah diambil, padahal itulah isi laporan yang harus tampil di layar.
  return qOne(db, `SELECT r.*, v.title AS vehicle, v.location_area AS location,
    ui.name AS inspector, i.inspector_id, o.status AS order_status, o.buyer_id,
    i.recommendation, i.repair_estimate, i.summary, i.guarantee_until, i.published_at
    FROM reports r JOIN inspections i ON i.id=r.inspection_id JOIN orders o ON o.id=r.order_id
    JOIN vehicles v ON v.id=o.vehicle_id LEFT JOIN users ui ON ui.id=i.inspector_id WHERE r.id=?`, id);
}

/** Checklist hasil inspeksi per kategori (mesin/bodi/interior). */
export function listInspectionItems(db: Db, inspectionId: string) {
  return qAll(db, `SELECT category, item_key, item_label, condition, note
    FROM inspection_items WHERE inspection_id=? ORDER BY rowid`, inspectionId);
}

/** Foto dokumentasi inspeksi. */
export function listInspectionPhotos(db: Db, inspectionId: string) {
  return qAll(db, `SELECT r2_key, taken_at, category
    FROM inspection_photos WHERE inspection_id=? ORDER BY rowid`, inspectionId);
}

/** Laporan lengkap untuk tampilan layar: header + checklist + foto. */
export async function getReportDetail(db: Db, id: string) {
  const r = await getReport(db, id);
  if (!r) return null;
  const inspectionId = (r as { inspection_id?: string }).inspection_id ?? '';
  return {
    ...(r as Record<string, unknown>),
    items: inspectionId ? await listInspectionItems(db, inspectionId) : [],
    photos: inspectionId ? await listInspectionPhotos(db, inspectionId) : []
  };
}

export function listReports(db: Db, onlyPending = false) {
  return qAll(db, `SELECT r.*, v.title AS vehicle, ui.name AS inspector, o.buyer_id, o.id AS order_id, i.inspector_id
    FROM reports r JOIN inspections i ON i.id=r.inspection_id JOIN orders o ON o.id=r.order_id
    JOIN vehicles v ON v.id=o.vehicle_id LEFT JOIN users ui ON ui.id=i.inspector_id
    ${onlyPending ? 'WHERE r.published=0' : ''} ORDER BY r.created_at DESC`);
}

export async function publishReport(db: Db, id: string) {
  await exec(db, 'UPDATE reports SET published=1 WHERE id=?', id);
  await exec(db, `UPDATE inspections SET published_at=datetime('now') WHERE id=(SELECT inspection_id FROM reports WHERE id=?)`, id);
  return getReport(db, id);
}

export async function ensureConversation(db: Db, b: { orderId: string; buyerId: string; sellerId: string; inspectorId?: string }) {
  const ex = await qOne<{ id: string }>(db, 'SELECT id FROM conversations WHERE order_id=?', b.orderId);
  if (ex) return { conversationId: ex.id, created: false };
  const id = uid('C');
  await exec(db, 'INSERT INTO conversations (id, order_id, buyer_id, seller_id, inspector_id) VALUES (?,?,?,?,?)',
    id, b.orderId, b.buyerId, b.sellerId, b.inspectorId ?? null);
  return { conversationId: id, created: true };
}

export function listConversations(db: Db, userId: string) {
  return qAll(db, `SELECT c.*, (SELECT body FROM messages WHERE conversation_id=c.id ORDER BY rowid DESC LIMIT 1) AS last_msg,
      ub.name AS buyer_name, us.name AS seller_name, ui.name AS inspector_name
    FROM conversations c LEFT JOIN users ub ON ub.id=c.buyer_id LEFT JOIN users us ON us.id=c.seller_id LEFT JOIN users ui ON ui.id=c.inspector_id
    WHERE c.buyer_id=? OR c.seller_id=? OR c.inspector_id=? ORDER BY c.order_id DESC`,
    userId, userId, userId);
}

export function listMessages(db: Db, conversationId: string) {
  return qAll(db, `SELECT m.*, u.name AS sender FROM messages m LEFT JOIN users u ON u.id=m.sender_id
    WHERE m.conversation_id=? ORDER BY m.rowid ASC`, conversationId);
}

export async function postMessage(db: Db, b: { conversationId: string; senderId: string; body: string }) {
  if (!b.body?.trim()) throw Object.assign(new Error('Pesan kosong'), { code: 'VALIDATION_ERROR' });
  // C3 anti-yatim: conversation harus ada
  const conv = await qOne(db, 'SELECT id FROM conversations WHERE id=?', b.conversationId);
  if (!conv) throw Object.assign(new Error('Percakapan tidak ditemukan'), { code: 'NOT_FOUND', status: 404 });
  const id = uid('M');
  await exec(db, 'INSERT INTO messages (id, conversation_id, sender_id, body) VALUES (?,?,?,?)',
    id, b.conversationId, b.senderId, b.body.trim());
  return { messageId: id };
}

export function getMe(db: Db, userId: string) {
  return qOne(db, 'SELECT id, name, email, role, trust_score, status FROM users WHERE id=?', userId);
}

/** Katalog voucher server-side (satu-satunya sumber kebenaran diskon). */
export const VOUCHERS: Record<string, { title: string; kind: 'percent' | 'fixed' | 'perk'; value: number; orderOnly: boolean }> = {
  TRU20: { title: '20% Off Verification', kind: 'percent', value: 20, orderOnly: true },
  HEMAT50: { title: 'Rp50rb Off Standard', kind: 'fixed', value: 50000, orderOnly: true },
  FASTTRACK: { title: 'Fast-Track Queue', kind: 'perk', value: 0, orderOnly: false },
  CERT15: { title: 'Certified Upsell 15%', kind: 'perk', value: 0, orderOnly: false }
};

export async function claimVoucher(db: Db, userId: string, code: string) {
  const c = code.trim().toUpperCase();
  const spec = VOUCHERS[c];
  if (!spec) throw Object.assign(new Error('Kode voucher tidak dikenal'), { code: 'NOT_FOUND', status: 404 });
  const dup = await qOne(db, 'SELECT id FROM user_vouchers WHERE user_id=? AND code=?', userId, c);
  if (dup) return { voucherId: (dup as { id: string }).id, code: c, already: true };
  const id = uid('V');
  await exec(db, 'INSERT INTO user_vouchers (id, user_id, code) VALUES (?,?,?)', id, userId, c);
  return { voucherId: id, code: c, already: false };
}

export function listVouchers(db: Db, userId: string) {
  return qAll(db, 'SELECT code, claimed_at, used_at, order_id FROM user_vouchers WHERE user_id=? ORDER BY claimed_at DESC', userId);
}

/** Validasi voucher untuk order: kembalikan potongan (rupiah). SET used hanya saat pay. */
export async function quoteVoucher(db: Db, userId: string, code: string, subtotal: number) {
  const c = code.trim().toUpperCase();
  const spec = VOUCHERS[c];
  if (!spec) throw Object.assign(new Error('Kode voucher tidak dikenal'), { code: 'NOT_FOUND', status: 404 });
  if (!spec.orderOnly) throw Object.assign(new Error(`${c} tidak berlaku untuk potongan order`), { code: 'VALIDATION_ERROR', status: 400 });
  const row = await qOne(db, 'SELECT used_at FROM user_vouchers WHERE user_id=? AND code=?', userId, c) as { used_at: string | null } | null;
  if (!row) throw Object.assign(new Error('Voucher belum diklaim'), { code: 'VALIDATION_ERROR', status: 400 });
  if (row.used_at) throw Object.assign(new Error('Voucher sudah dipakai'), { code: 'VALIDATION_ERROR', status: 400 });
  const discount = spec.kind === 'percent' ? Math.round((subtotal * spec.value) / 100) : Math.min(spec.value, subtotal);
  return { code: c, discount, total: subtotal - discount };
}

const SEED_USERS = [
  ['u-budi', 'buyer', 'Budi Perkasa', 'budi@mail.com'],
  ['u-hendra', 'seller', 'Hendra Wijaya', 'hendra@showroom.id'],
  ['u-bsantoso', 'inspector', 'Budi Santoso', 'budi.s@trusight.id'],
  ['u-firman', 'inspector', 'Firman Comstir', 'firman@trusight.id'],
  ['u-admin', 'admin', 'Admin TruSight', 'admin@trusight.id']
] as const;
/** Seed kendaraan — harus senada dengan src/lib/mocks.ts + migrations/002_seed.sql.
 *  Urutan: id, seller_id, title, brand, model, year, mileage, transmission, fuel,
 *  plate_no, color, location (detail), location_area (publik), price, status. */
const SEED_VEHICLES = [
  ['civic-2021', 'u-hendra', 'Honda Civic Turbo 2021', 'Honda', 'Civic Turbo', 2021, 45000, 'Matic', 'Bensin', 'B 1234 SG', 'Hitam', 'Kalibata, Jakarta Selatan', 'Jakarta Selatan', 385000000, 'listed'],
  ['porsche-911-2022', 'u-hendra', 'Porsche 911 Carrera S 2022', 'Porsche', '911 Carrera S', 2022, 12400, 'Manual', 'Bensin', 'B 992 TS', 'Putih', 'Pantai Indah Kapuk, Jakarta Utara', 'Jakarta Utara', 4750000000, 'certified'],
  ['avanza-2022', 'u-hendra', 'Toyota Avanza Veloz 2022', 'Toyota', 'Avanza Veloz', 2022, 32000, 'Matic', 'Bensin', 'B 2211 AV', 'Silver', 'Tebet, Jakarta Selatan', 'Jakarta Selatan', 235000000, 'listed'],
  ['innova-2020', 'u-hendra', 'Toyota Kijang Innova Venturer 2020', 'Toyota', 'Kijang Innova Venturer', 2020, 68000, 'Matic', 'Diesel', 'B 1010 IN', 'Hitam', 'Bintaro, Tangerang Selatan', 'Tangerang Selatan', 335000000, 'certified'],
  ['xpander-2021', 'u-hendra', 'Mitsubishi Xpander Ultimate 2021', 'Mitsubishi', 'Xpander Ultimate', 2021, 41000, 'Matic', 'Bensin', 'B 3030 XP', 'Abu-abu', 'Bekasi Timur, Kota Bekasi', 'Kota Bekasi', 268000000, 'listed'],
  ['hrv-2022', 'u-hendra', 'Honda HR-V SE 2022', 'Honda', 'HR-V SE', 2022, 27000, 'Matic', 'Bensin', 'B 2626 HR', 'Putih', 'Kemang, Jakarta Selatan', 'Jakarta Selatan', 372000000, 'certified'],
  ['brio-2021', 'u-hendra', 'Honda Brio RS 2021', 'Honda', 'Brio RS', 2021, 38000, 'Matic', 'Bensin', 'B 7788 BR', 'Merah', 'Margonda, Kota Depok', 'Kota Depok', 178000000, 'listed'],
  ['ertiga-2020', 'u-hendra', 'Suzuki Ertiga GX 2020', 'Suzuki', 'Ertiga GX', 2020, 52000, 'Matic', 'Bensin', 'F 1212 ER', 'Silver', 'Cibinong, Kabupaten Bogor', 'Bogor', 212000000, 'listed'],
  ['pajero-2019', 'u-hendra', 'Mitsubishi Pajero Sport Dakar 2019', 'Mitsubishi', 'Pajero Sport Dakar', 2019, 74000, 'Matic', 'Diesel', 'B 8080 PJ', 'Hitam', 'Bintaro, Tangerang Selatan', 'Tangerang Selatan', 445000000, 'certified'],
  ['crv-2021', 'u-hendra', 'Honda CR-V Turbo 2021', 'Honda', 'CR-V Turbo', 2021, 36000, 'Matic', 'Bensin', 'B 4545 CV', 'Putih', 'Kelapa Gading, Jakarta Utara', 'Jakarta Utara', 428000000, 'listed'],
  ['calya-2021', 'u-hendra', 'Toyota Calya G 2021', 'Toyota', 'Calya G', 2021, 44000, 'Matic', 'Bensin', 'B 5151 CL', 'Silver', 'Ciledug, Kota Tangerang', 'Tangerang', 152000000, 'listed'],
  ['jazz-2018', 'u-hendra', 'Honda Jazz RS 2018', 'Honda', 'Jazz RS', 2018, 61000, 'Matic', 'Bensin', 'B 1818 JZ', 'Biru', 'Tebet, Jakarta Selatan', 'Jakarta Selatan', 219000000, 'listed'],
  ['fortuner-2020', 'u-hendra', 'Toyota Fortuner VRZ 2020', 'Toyota', 'Fortuner VRZ', 2020, 58000, 'Matic', 'Diesel', 'B 2020 FT', 'Hitam', 'Cilandak, Jakarta Selatan', 'Jakarta Selatan', 487000000, 'certified'],
  ['camry-2021', 'u-hendra', 'Toyota Camry 2.5 V 2021', 'Toyota', 'Camry 2.5 V', 2021, 29000, 'Matic', 'Bensin', 'B 2525 CM', 'Putih', 'Senayan, Jakarta Pusat', 'Jakarta Pusat', 725000000, 'certified'],
  ['alphard-2019', 'u-hendra', 'Toyota Alphard SC 2019', 'Toyota', 'Alphard SC', 2019, 47000, 'Matic', 'Bensin', 'B 1919 AL', 'Hitam', 'Pluit, Jakarta Utara', 'Jakarta Utara', 1150000000, 'certified']
] as const;

/** Reset demo. users TIDAK PERNAH dihapus — hanya INSERT OR IGNORE seed. */
export async function resetDemo(db: Db, mode: 'full' | 'transaksi') {
  const cleared: string[] = [];
  for (const t of ['messages', 'conversations', 'certificates', 'reports', 'inspection_photos',
    'inspection_items', 'inspections', 'payments', 'schedules', 'orders', 'notifications', 'reviews', 'user_vouchers']) {
    await exec(db, `DELETE FROM ${t}`);
    cleared.push(t);
  }
  if (mode === 'full') {
    await exec(db, 'DELETE FROM vehicles');
    cleared.push('vehicles');
    for (const v of SEED_VEHICLES) {
      await exec(db, `INSERT INTO vehicles (id, seller_id, title, brand, model, year, mileage, transmission, fuel, plate_no, color, location, location_area, price, status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, ...v);
    }
  }
  for (const u of SEED_USERS) {
    await exec(db, 'INSERT OR IGNORE INTO users (id, role, name, email, password_hash) VALUES (?,?,?,?,?)',
      u[0], u[1], u[2], u[3], 'hash:demo');
  }
  return { mode, tablesCleared: cleared, usersPreserved: true, seedEnsured: { users: 5, vehicles: SEED_VEHICLES.length }, at: new Date().toISOString() };
}
