import { KVEnv, err, getJSON, ok, putJSON, uid } from '../_db';

type User = {
  id: string; role: string; name: string; email: string;
  password_hash: string; trust_score: number; status: string;
};

const MOCK_USER = { id: 'u-budi', name: 'Budi Perkasa', email: 'budi@mail.com', role: 'buyer', trust_score: 98 };

export async function onRequestPost({ request, env }: { request: Request; env: KVEnv }) {
  const url = new URL(request.url);
  const action = url.pathname.split('/').pop();
  const kv = env.KV;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, string>;

    // Tanpa binding KV (preview statis) → mock agar UI tetap hijau
    if (!kv) {
      if (action === 'register' || action === 'login') {
        if (action === 'register' && (!body.name || !body.email || !body.password))
          return err('VALIDATION_ERROR', 'Nama, email, password wajib diisi');
        return ok({ user: { ...MOCK_USER, name: body.name ?? MOCK_USER.name, email: body.email ?? MOCK_USER.email } });
      }
      if (action === 'request-account') return ok({ status: 'pending' });
      if (action === 'send') return ok({ sent: true, hint: 'mockup: pakai kode 067000' });
      if (action === 'verify' || action === 'reset') return ok({ verified: true });
      return err('NOT_FOUND', 'Auth action tidak dikenal', 404);
    }

    if (action === 'register') {
      const { name, email, password, role } = body;
      if (!name || !email || !password) return err('VALIDATION_ERROR', 'Nama, email, password wajib diisi');
      if (password.length < 8) return err('VALIDATION_ERROR', 'Password minimal 8 karakter');
      const taken = await getJSON<{ id: string }>(kv, `user:email:${email}`);
      if (taken) return err('CONFLICT', 'Email sudah terdaftar', 409);
      const user: User = {
        id: uid('U'), role: role ?? 'buyer', name, email,
        password_hash: `hash:${password}`, trust_score: 0, status: 'active'
      };
      // 2 writes — hemat kuota 1000/hari
      await putJSON(kv, `user:${user.id}`, user);
      await putJSON(kv, `user:email:${email}`, { id: user.id });
      const { password_hash: _h, ...pub } = user;
      return ok({ user: pub });
    }

    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) return err('VALIDATION_ERROR', 'Email dan password wajib diisi');
      const ref = await getJSON<{ id: string }>(kv, `user:email:${email}`);
      if (!ref) return err('UNAUTHENTICATED', 'Email atau password salah', 401);
      const user = await getJSON<User>(kv, `user:${ref.id}`);
      if (!user || user.password_hash !== `hash:${password}`)
        return err('UNAUTHENTICATED', 'Email atau password salah', 401);
      const token = uid('SES');
      await putJSON(kv, `session:${token}`, { userId: user.id }, 7 * 86400);
      const { password_hash: _h, ...pub } = user;
      return ok({ user: pub, token });
    }

    if (action === 'request-account') {
      const { name, email, license_no } = body;
      if (!name || !email || !license_no) return err('VALIDATION_ERROR', 'Nama, email, lisensi wajib diisi');
      await putJSON(kv, `request:${uid('REQ')}`, { name, email, license_no, status: 'pending' });
      return ok({ status: 'pending' });
    }

    if (action === 'send') {
      const { email } = body;
      if (!email) return err('VALIDATION_ERROR', 'Email wajib diisi');
      const rlKey = `rl:otp:${email}`;
      const count = Number((await kv.get(rlKey)) ?? 0);
      if (count >= 3) return err('RATE_LIMITED', 'Terlalu sering. Coba 10 menit lagi.', 429);
      await kv.put(rlKey, String(count + 1), { expirationTtl: 600 });
      await putJSON(kv, `otp:${email}`, { code: '067000' }, 300);
      return ok({ sent: true, hint: 'mockup: pakai kode 067000' });
    }

    if (action === 'verify') {
      const { email, code } = body;
      const saved = email ? await getJSON<{ code: string }>(kv, `otp:${email}`) : null;
      if (saved && code !== saved.code) return err('VALIDATION_ERROR', 'Kode OTP salah', 401);
      return ok({ verified: true });
    }

    if (action === 'reset') return ok({ ok: true });

    return err('NOT_FOUND', 'Auth action tidak dikenal', 404);
  } catch (e) {
    console.error(e);
    return err('UPSTREAM_ERROR', 'Server error', 500);
  }
}
