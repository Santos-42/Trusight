import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mockHandle } from '$lib/mockApi';

type Penv = App.Platform['env'];

const ok = (data: unknown) => json({ ok: true, data });
const err = (code: string, message: string, status = 400) =>
  json({ ok: false, error: { code, message } }, { status });

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
}

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

const handler: RequestHandler = async ({ request, params, platform }) => {
  const path = `/${params.path ?? ''}`;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const seg = path.split('?')[0].split('/').filter(Boolean);
  if (seg[0] === 'auth' && seg[1]) {
    return handleAuth(seg[1], body, platform?.env as Penv);
  }
  return json(mockHandle(path, request.method, body));
};

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
