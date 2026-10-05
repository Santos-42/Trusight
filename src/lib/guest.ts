import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

const KEY = 'trusight_session';
const RETURN_KEY = 'trusight_return_to';

/** True jika user sudah login (mockup: token di localStorage). */
export const authed = writable<boolean>(false);
/** State global modal penawaran login. */
export const loginModal = writable<{ open: boolean }>({ open: false });

export function isLoggedIn(): boolean {
  if (!browser) return false;
  return !!localStorage.getItem(KEY);
}

export function syncSession() {
  authed.set(isLoggedIn());
}

export function setSession(name: string) {
  if (!browser) return;
  localStorage.setItem(KEY, JSON.stringify({ name, at: Date.now() }));
  authed.set(true);
}

export function clearSession() {
  if (!browser) return;
  localStorage.removeItem(KEY);
  authed.set(false);
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
