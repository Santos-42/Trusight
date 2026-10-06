import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

const KEY = 'trusight_session';
const RETURN_KEY = 'trusight_return_to';

/** True jika user sudah login (mockup: token di localStorage). */
export const authed = writable<boolean>(false);
/** Role user login. Tamu = buyer (menu buyer + tombol Masuk). */
export type Role = 'buyer' | 'seller' | 'inspector' | 'admin';
export const role = writable<Role>('buyer');
type Session = { id: string; name: string; email: string; role: Role; at: number };
const VALID_ROLES: Role[] = ['buyer', 'seller', 'inspector', 'admin'];
/** State global modal penawaran login. */
export const loginModal = writable<{ open: boolean }>({ open: false });

export function isLoggedIn(): boolean {
  if (!browser) return false;
  return !!localStorage.getItem(KEY);
}

export function syncSession() {
  const s = readSession();
  authed.set(!!s);
  role.set(s?.role ?? 'buyer');
}

function readSession(): Session | null {
  if (!browser) return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Session>;
    if (!s.email) return null;
    const r = (s.role ?? 'buyer') as Role;
    return { id: s.id ?? 'u-mock', name: s.name ?? s.email, email: s.email, role: VALID_ROLES.includes(r) ? r : 'buyer', at: s.at ?? Date.now() };
  } catch {
    return null;
  }
}

export function setSession(user: { id?: string; name?: string; email: string; role?: string }) {
  if (!browser) return;
  const r = (user.role ?? 'buyer') as Role;
  const s: Session = { id: user.id ?? 'u-mock', name: user.name ?? user.email, email: user.email, role: VALID_ROLES.includes(r) ? r : 'buyer', at: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(s));
  authed.set(true);
  role.set(s.role);
}

export function clearSession() {
  if (!browser) return;
  localStorage.removeItem(KEY);
  authed.set(false);
  role.set('buyer');
}

/**
 * Jalankan `fn` hanya jika sudah login.
 * Jika masih guest: simpan returnTo lalu buka modal penawaran login.
 */
export function requireAuth(fn: () => void, returnTo?: string) {
  if (get(authed) || isLoggedIn()) {
    fn();
    return;
  }
  if (browser && returnTo) sessionStorage.setItem(RETURN_KEY, returnTo);
  loginModal.set({ open: true });
}

/** Ambil (dan hapus) returnTo untuk redirect setelah login. */
export function consumeReturnTo(fallback = '/app/home'): string {
  if (!browser) return fallback;
  const v = sessionStorage.getItem(RETURN_KEY);
  sessionStorage.removeItem(RETURN_KEY);
  return v && v.startsWith('/') ? v : fallback;
}

/** Sesi login saat ini (null bila tamu). */
export function getSession(): Session | null {
  return readSession();
}

/** Home per role. */
export function roleHome(r: Role): string {
  return r === 'seller' ? '/seller' : r === 'inspector' ? '/inspector' : r === 'admin' ? '/admin' : '/app/home';
}

/** Apakah path boleh dibuka role ini? Admin boleh semua; auth/landing boleh semua. */
export function pathAllowedForRole(path: string, r: Role): boolean {
  if (r === 'admin') return true;
  if (path === '/' || path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot') || path.startsWith('/otp') || path.startsWith('/reset') || path.startsWith('/request-account')) return true;
  if (r === 'seller') return path.startsWith('/seller');
  if (r === 'inspector') return path.startsWith('/inspector');
  return path.startsWith('/app') || path.startsWith('/login');
}

/** Tujuan post-login: returnTo hanya dipakai bila rolenya boleh; selebihnya "halaman role menang". */
export function resolvePostLogin(returnTo: string, r: Role): string {
  if (returnTo && pathAllowedForRole(returnTo, r)) return returnTo;
  return roleHome(r);
}

/** Guard untuk layout role. Admin lolos semua. Kembalikan true bila boleh render. */
export function checkRole(allowed: Role[], path: string): boolean {
  if (!browser) return false;
  const s = readSession();
  if (!s) {
    location.href = `/login?returnTo=${encodeURIComponent(path)}`;
    return false;
  }
  if (allowed.includes(s.role) || s.role === 'admin') return true;
  location.href = roleHome(s.role);
  return false;
}
