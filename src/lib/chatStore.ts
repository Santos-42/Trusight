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
