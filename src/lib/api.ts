import { API_BASE } from './config';
import { mockHandle } from './mockApi';

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: { code: string; message: string } };
export type ApiRes<T> = ApiOk<T> | ApiErr;

async function req<T>(path: string, init?: RequestInit): Promise<ApiRes<T>> {
  let res: Response | null = null;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      ...init
    });
    if (res.ok) {
      try {
        return (await res.json()) as ApiRes<T>;
      } catch {
        /* jatuh ke fallback DEV di bawah */
      }
    } else if (!import.meta.env.DEV) {
      try {
        return (await res.json()) as ApiRes<T>;
      } catch {
        return { ok: false, error: { code: 'UPSTREAM_ERROR', message: `HTTP ${res.status}` } };
      }
    }
  } catch {
    /* offline / functions tidak jalan (vite dev) -> fallback DEV di bawah */
  }
  // DEV saja: functions/ tidak hidup di `npm run dev`, jawab dengan mock lokal.
  if (import.meta.env.DEV) {
    let body: Record<string, unknown> = {};
    try {
      body = init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : {};
    } catch {
      body = {};
    }
    return mockHandle(path, init?.method ?? 'GET', body) as ApiRes<T>;
  }
  return { ok: false, error: { code: 'UPSTREAM_ERROR', message: `HTTP ${res?.status ?? 'OFFLINE'}` } };
}

export const api = {
  get: <T>(p: string) => req<T>(p),
  post: <T>(p: string, body?: unknown) =>
    req<T>(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(p: string, body?: unknown) =>
    req<T>(p, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined })
};

export type VehicleCard = {
  id: string;
  title: string;
  year: number;
  mileage: number;
  price: number;
  location: string;
  status: string;
  score: number | null;
  coverR2: string | null;
};

export type OrderDetail = {
  order: { id: string; status: string; total: number; type: string; created_at: string };
  vehicle: VehicleCard;
};
