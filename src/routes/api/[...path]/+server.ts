import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mockHandle } from '$lib/mockApi';
import {
  approveOrder, checkin, claimVoucher, createOrder, ensureConversation, getMe, getOrder, getReport,
  listConversations, listMessages, listOrders, listReports, listVouchers, postMessage, publishReport,
  quoteVoucher, resetDemo, submitInspection, uid, type Db
} from '$lib/server/d1';

type Penv = App.Platform['env'];

const ok = (data: unknown) => json({ ok: true, data });
const err = (code: string, message: string, status = 400) =>
  json({ ok: false, error: { code, message } }, { status });

const KNOWN: Record<string, { name: string; role: string }> = {
  'budi@mail.com': { name: 'Budi Perkasa', role: 'buyer' },
  'hendra@showroom.id': { name: 'Hendra Wijaya', role: 'seller' },
  'budi.s@trusight.id': { name: 'Budi Santoso', role: 'inspector' },
  'firman@trusight.id': { name: 'Firman Comstir', role: 'inspector' },
  'admin@trusight.id': { name: 'Admin TruSight', role: 'admin' }
};

/** Auth: D1 bila binding ada (produksi), mock bila tidak (dev/preview tanpa binding). */
async function handleAuth(action: string, body: Record<string, unknown>, penv: Penv) {
  const DB = penv?.DB;
  const SESSIONS = penv?.SESSIONS;
  try {
    if (action === 'register') {
      const { name, email, password } = body as Record<string, string>;
      if (!name || !email || !password) return err('VALIDATION_ERROR', 'Nama, email, password wajib diisi');
      if (String(password).length < 8) return err('VALIDATION_ERROR', 'Password minimal 8 karakter');
      // Register selalu buyer (inspektur via request-account, admin tak bisa daftar).
      if (!DB) return ok({ user: { id: 'u-mock', name, email, role: 'buyer', trust_score: 0 } });
      try {
        const id = uid('U');
        await DB.prepare('INSERT INTO users (id, role, name, email, password_hash) VALUES (?,?,?,?,?)')
          .bind(id, 'buyer', name, email, `hash:${password}`)
          .run();
        return ok({ user: { id, name, email, role: 'buyer', trust_score: 0 } });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '';
        if (msg.includes('UNIQUE')) return err('CONFLICT', 'Email sudah terdaftar', 409);
        // Dev lokal: binding D1 ada tapi tabel belum dimigrasi -> jawab mock.
        if (/no such table/i.test(msg)) return ok({ user: { id: 'u-mock', name, email, role: 'buyer', trust_score: 0 } });
        throw e;
      }
    }

    if (action === 'login') {
      const { email, password } = body as Record<string, string>;
      if (!email || !password) return err('VALIDATION_ERROR', 'Email dan password wajib diisi');
      if (!DB) {
        const k = KNOWN[String(email).toLowerCase()];
        return ok({ user: { id: 'u-mock', name: k?.name ?? 'Budi Perkasa', email, role: k?.role ?? 'buyer', trust_score: 98 } });
      }
      const row = await DB.prepare('SELECT id, name, email, role, trust_score FROM users WHERE email=?')
        .bind(email)
        .first()
        .catch((e: unknown) => {
          // Dev lokal: binding D1 ada tapi tabel belum dimigrasi -> jawab mock.
          const msg = e instanceof Error ? e.message : '';
          if (/no such table/i.test(msg)) return null;
          throw e;
        });
      if (!row) {
        // Tabel users belum ada (dev lokal tanpa migrasi): jawab mock dari email demo.
        const probe = await DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").first().catch(() => null);
        if (!probe) {
          const k = KNOWN[String(email).toLowerCase()];
          return ok({ user: { id: 'u-mock', name: k?.name ?? 'Budi Perkasa', email, role: k?.role ?? 'buyer', trust_score: 98 } });
        }
        return err('UNAUTHENTICATED', 'Email atau password salah', 401);
      }
      return ok({ user: row });
    }

    if (action === 'request-account') {
      const { name, email, license_no } = body as Record<string, string>;
      if (!name || !email || !license_no) return err('VALIDATION_ERROR', 'Nama, email, lisensi wajib diisi');
      return ok({ status: 'pending' });
    }

    if (action === 'send') {
      const { email } = body as Record<string, string>;
      if (!email) return err('VALIDATION_ERROR', 'Email wajib diisi');
      if (SESSIONS) {
        const count = Number((await SESSIONS.get(`rl:${email}`)) ?? 0);
        if (count >= 3) return err('RATE_LIMITED', 'Terlalu sering. Coba 10 menit lagi.', 429);
        await SESSIONS.put(`rl:${email}`, String(count + 1), { expirationTtl: 600 });
        await SESSIONS.put(`otp:${email}`, '067000', { expirationTtl: 300 });
      }
      return ok({ sent: true });
    }

    if (action === 'verify') {
      const { code } = body as Record<string, string>;
      if (!code) return err('VALIDATION_ERROR', 'Kode OTP wajib diisi');
      return ok({ verified: true });
    }

    if (action === 'reset') {
      return ok({ ok: true });
    }

    return err('NOT_FOUND', 'Auth action tidak dikenal', 404);
  } catch (e) {
    console.error(e);
    return err('UPSTREAM_ERROR', 'Server error', 500);
  }
}

function dbErr(e: unknown) {
  const code = (e as { code?: string })?.code;
  const msg = e instanceof Error ? e.message : 'Server error';
  if (code === 'NOT_FOUND') return err('NOT_FOUND', msg, 404);
  if (code === 'VALIDATION_ERROR') return err('VALIDATION_ERROR', msg);
  if (code === 'CONFLICT') return err('CONFLICT', msg, 409);
  console.error(e);
  return err('UPSTREAM_ERROR', 'Server error', 500);
}

/** API live D1 (Fase 1–4 integrasi). Tanpa DB -> fallback mockHandle (dev). */
async function handleLive(path: string, method: string, body: Record<string, unknown>, query: URLSearchParams, penv: Penv) {
  const DB = penv?.DB as Db | undefined;
  const seg = path.split('?')[0].split('/').filter(Boolean);
  if (!DB) return json(mockHandle(path, method, body));

  try {
    // --- orders ---
    if (seg[0] === 'orders' && seg.length === 1 && method === 'POST') {
      const { vehicleId, type, buyerId } = body as Record<string, string>;
      if (!vehicleId || !buyerId) return err('VALIDATION_ERROR', 'vehicleId dan buyerId wajib diisi');
      return ok(await createOrder(DB, { vehicleId, type: type ?? 'standard', buyerId }));
    }
    if (seg[0] === 'orders' && seg[1] === 'mine' && method === 'GET') {
      const buyerId = query.get('buyerId') ?? '';
      if (!buyerId) return err('VALIDATION_ERROR', 'buyerId wajib diisi');
      return ok(await listOrders(DB, { buyerId, status: query.get('status') ?? undefined }));
    }
    if (seg[0] === 'orders' && seg[1] === 'incoming' && method === 'GET') {
      const sellerId = query.get('sellerId') ?? '';
      if (!sellerId) return err('VALIDATION_ERROR', 'sellerId wajib diisi');
      return ok(await listOrders(DB, { sellerId, status: query.get('status') ?? undefined }));
    }
    if (seg[0] === 'orders' && seg[1] === 'assigned' && method === 'GET') {
      const inspectorId = query.get('inspectorId') ?? '';
      if (!inspectorId) return err('VALIDATION_ERROR', 'inspectorId wajib diisi');
      return ok(await listOrders(DB, { inspectorId, status: query.get('status') ?? undefined }));
    }
    if (seg[0] === 'orders' && seg.length === 1 && method === 'GET') {
      return ok(await listOrders(DB, { status: query.get('status') ?? undefined }));
    }
    if (seg[0] === 'orders' && seg[1] && seg[2] === 'approve' && method === 'POST') {
      const { inspectorId, action, slot } = body as Record<string, string>;
      if (!inspectorId) return err('VALIDATION_ERROR', 'inspectorId wajib diisi');
      return ok(await approveOrder(DB, { orderId: seg[1], inspectorId, action: action === 'alternative' ? 'alternative' : 'approve', slot }));
    }
    if (seg[0] === 'orders' && seg[1] && seg[2] === 'pay' && method === 'POST') {
      const o = await getOrder(DB, seg[1]);
      if (!o) return err('NOT_FOUND', 'Order tidak ditemukan', 404);
      const b = body as Record<string, string>;
      let amount = (o as { total: number }).total;
      let voucher: string | null = null;
      let discount = 0;
      if (b.voucherCode) {
        try {
          const q = await quoteVoucher(DB, b.buyerId ?? '', String(b.voucherCode), amount);
          discount = q.discount; amount = q.total; voucher = q.code;
        } catch (e) {
          const ce = e as { message?: string; status?: number };
          return err('VALIDATION_ERROR', ce.message ?? 'Voucher tidak valid', ce.status ?? 400);
        }
      }
      await DB.prepare('INSERT INTO payments (id, order_id, provider, amount, method, status) VALUES (?,?,?,?,?,?)')
        .bind(uid('PAY'), seg[1], 'mock', amount, b.method ?? 'QRIS', 'paid').run();
      if (voucher) {
        await DB.prepare('UPDATE user_vouchers SET used_at=datetime(\'now\'), order_id=? WHERE user_id=? AND code=?')
          .bind(seg[1], b.buyerId ?? '', voucher).run();
      }
      return ok({ paymentId: 'pay-live', redirectUrl: `/app/success/${seg[1]}`, amount, discount, voucher });
    }
    if (seg[0] === 'orders' && seg[1] && method === 'GET') {
      const o = await getOrder(DB, seg[1]);
      if (!o) return err('NOT_FOUND', 'Order tidak ditemukan', 404);
      return ok(o);
    }

    // --- vouchers ---
    if (seg[0] === 'vouchers' && seg[1] === 'claim' && method === 'POST') {
      const { userId, code } = body as Record<string, string>;
      if (!userId || !code) return err('VALIDATION_ERROR', 'userId dan code wajib diisi');
      try {
        return ok(await claimVoucher(DB, userId, code));
      } catch (e) {
        const ce = e as { message?: string; status?: number };
        return err('NOT_FOUND', ce.message ?? 'Voucher tidak dikenal', ce.status ?? 404);
      }
    }
    if (seg[0] === 'vouchers' && seg[1] === 'mine' && method === 'GET') {
      const userId = query.get('userId') ?? '';
      if (!userId) return err('VALIDATION_ERROR', 'userId wajib diisi');
      return ok(await listVouchers(DB, userId));
    }

    // --- inspections ---
    if (seg[0] === 'inspections' && seg[1] === 'checkin' && method === 'POST') {
      const { orderId, inspectorId, lat, lng, valid } = body as unknown as { orderId: string; inspectorId: string; lat: number; lng: number; valid: boolean };
      if (!orderId || !inspectorId) return err('VALIDATION_ERROR', 'orderId dan inspectorId wajib diisi');
      return ok(await checkin(DB, { orderId, inspectorId, lat: Number(lat), lng: Number(lng), valid: !!valid }));
    }
    if (seg[0] === 'inspections' && seg[1] === 'submit' && method === 'POST') {
      const b = body as Record<string, unknown> as unknown as Parameters<typeof submitInspection>[1];
      if (!b.orderId || !b.inspectorId || !b.score) return err('VALIDATION_ERROR', 'orderId, inspectorId, score wajib diisi');
      return ok(await submitInspection(DB, b));
    }

    // --- reports ---
    if (seg[0] === 'reports' && seg.length === 1 && method === 'GET') {
      return ok(await listReports(DB));
    }
    if (seg[0] === 'reports' && seg[1] && seg[2] === 'publish' && method === 'POST') {
      return ok(await publishReport(DB, seg[1]));
    }
    if (seg[0] === 'reports' && seg[1] && method === 'GET') {
      const r = await getReport(DB, seg[1]);
      if (!r) return err('NOT_FOUND', 'Report tidak ditemukan', 404);
      return ok(r);
    }

    // --- chat ---
    if (seg[0] === 'conversations' && method === 'POST') {
      const { orderId, buyerId, sellerId, inspectorId } = body as Record<string, string>;
      if (!orderId || !buyerId || !sellerId) return err('VALIDATION_ERROR', 'orderId, buyerId, sellerId wajib diisi');
      return ok(await ensureConversation(DB, { orderId, buyerId, sellerId, inspectorId }));
    }
    if (seg[0] === 'conversations' && method === 'GET') {
      const userId = query.get('userId') ?? '';
      if (!userId) return err('VALIDATION_ERROR', 'userId wajib diisi');
      return ok(await listConversations(DB, userId));
    }
    if (seg[0] === 'messages' && method === 'GET') {
      const conversationId = query.get('conversationId') ?? '';
      if (!conversationId) return err('VALIDATION_ERROR', 'conversationId wajib diisi');
      return ok(await listMessages(DB, conversationId));
    }
    if (seg[0] === 'messages' && method === 'POST') {
      const { conversationId, senderId, body: text } = body as Record<string, string>;
      if (!conversationId || !senderId) return err('VALIDATION_ERROR', 'conversationId dan senderId wajib diisi');
      return ok(await postMessage(DB, { conversationId, senderId, body: text ?? '' }));
    }

    // --- me & users ---
    if (seg[0] === 'me' && method === 'GET') {
      const userId = query.get('userId') ?? '';
      if (!userId) return err('VALIDATION_ERROR', 'userId wajib diisi');
      const u = await getMe(DB, userId);
      if (!u) return err('NOT_FOUND', 'User tidak ditemukan', 404);
      return ok(u);
    }
    if (seg[0] === 'users' && seg[1] && method === 'GET') {
      const u = await getMe(DB, seg[1]);
      if (!u) return err('NOT_FOUND', 'User tidak ditemukan', 404);
      return ok(u);
    }

    // --- demo reset (Fase 4): endpoint khusus, key via env. Tanpa RESET_KEY -> mati total. ---
    if (seg[0] === 'demo' && seg[1] === 'reset' && (method === 'POST' || method === 'GET')) {
      const RESET_KEY = (penv as Record<string, string> | undefined)?.['RESET_KEY'];
      if (!RESET_KEY) return err('NOT_FOUND', 'Reset tidak tersedia', 404);
      const key = query.get('key') ?? (body as Record<string, string>).key ?? '';
      if (key !== RESET_KEY) return err('FORBIDDEN', 'Key salah', 403);
      const SESSIONS = penv?.SESSIONS;
      if (SESSIONS) {
        const n = Number((await SESSIONS.get('rl:reset')) ?? 0);
        if (n >= 5) return err('RATE_LIMITED', 'Reset max 5x per 10 menit', 429);
        await SESSIONS.put('rl:reset', String(n + 1), { expirationTtl: 600 });
      }
      const mode = query.get('mode') === 'transaksi' ? 'transaksi' : 'full';
      console.log(`[demo-reset] mode=${mode}`);
      return ok(await resetDemo(DB, mode));
    }
  } catch (e) {
    // D1 lokal dev (simulasi wrangler) kosong / tabel belum dibuat: jatuhkan ke mock,
    // bukan error generik. Produksi dengan tabel ada tidak terpengaruh.
    const msg = e instanceof Error ? e.message : '';
    if (/no such table|not authorized|DB is not defined/i.test(msg)) {
      return json(mockHandle(path, method, body));
    }
    return dbErr(e);
  }
  return json(mockHandle(path, method, body));
}

const handler: RequestHandler = async ({ request, params, platform, url }) => {
  const path = `/${params.path ?? ''}`;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const seg = path.split('?')[0].split('/').filter(Boolean);
  if (seg[0] === 'auth' && seg[1]) {
    return handleAuth(seg[1], body, platform?.env as Penv);
  }
  return handleLive(path, request.method, body, url.searchParams, platform?.env as Penv);
};

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
