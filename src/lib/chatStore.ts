import { browser } from '$app/environment';
import type { ChatMsg } from './components/chat/chat';

export const chatKey = (id: string) => `chat:${id}`;

/** Muat pesan thread: localStorage bila ada, defaults bila kosong/tamu-SSR. */
export function loadMsgs(id: string, defaults: ChatMsg[]): ChatMsg[] {
  if (!browser) return defaults;
  try {
    const raw = localStorage.getItem(chatKey(id));
    if (!raw) return defaults;
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) && arr.length ? (arr as ChatMsg[]) : defaults;
  } catch {
    return defaults;
  }
}

/** Simpan pesan thread (abaikan bila storage tak tersedia). */
export function saveMsgs(id: string, msgs: ChatMsg[]) {
  if (!browser) return;
  try {
    localStorage.setItem(chatKey(id), JSON.stringify(msgs));
  } catch {
    /* abaikan */
  }
}

const ORDER_KEY = 'trusight_thread_order';

/** Urutan thread ala WhatsApp: id yang baru dikirim naik ke posisi 1. */
export function bumpThread(id: string) {
  if (!browser) return;
  try {
    const raw = JSON.parse(localStorage.getItem(ORDER_KEY) ?? '[]') as unknown;
    const arr = Array.isArray(raw) ? (raw as string[]).filter((x) => x !== id) : [];
    localStorage.setItem(ORDER_KEY, JSON.stringify([id, ...arr].slice(0, 30)));
  } catch {
    /* abaikan */
  }
}

export function sortThreads<T extends { id: string }>(threads: T[]): T[] {
  if (!browser) return threads;
  try {
    const raw = JSON.parse(localStorage.getItem(ORDER_KEY) ?? '[]') as unknown;
    if (!Array.isArray(raw) || !raw.length) return threads;
    const rank = new Map((raw as string[]).map((x, i) => [x, i]));
    return [...threads].sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999));
  } catch {
    return threads;
  }
}
