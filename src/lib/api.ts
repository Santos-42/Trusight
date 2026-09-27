import { API_BASE } from './config';

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: { code: string; message: string } };
export type ApiRes<T> = ApiOk<T> | ApiErr;

async function req<T>(path: string, init?: RequestInit): Promise<ApiRes<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    ...init
  });
  try {
    return (await res.json()) as ApiRes<T>;
  } catch {
    return { ok: false, error: { code: 'UPSTREAM_ERROR', message: `HTTP ${res.status}` } };
  }
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
