import { api } from './api';
import { mockVehicles, type MockVehicle } from './mocks';

export type CatalogVehicle = MockVehicle;

/** Bentuk baris `vehicles` dari database. */
type DbVehicle = {
  id: string;
  seller_id: string;
  title: string;
  year: number | null;
  mileage: number | null;
  price: number;
  location: string | null;
  location_area: string | null;
  status: string;
  cover: string | null;
};

/**
 * Katalog gabungan: katalog statis (lengkap dengan skor, grade, dan foto) +
 * iklan yang dibuat sendiri oleh seller di database.
 *
 * Status "terjual" SELALU diambil dari database, jadi badge di dashboard
 * seller tidak ikut kedaluwarsa setelah tombol "Tandai Terjual" ditekan.
 *
 * `sellerId` = hanya kendaraan milik seller itu (dipakai dashboard seller).
 */
export async function loadCatalog(sellerId?: string): Promise<CatalogVehicle[]> {
  const r = await api.get<DbVehicle[]>('/vehicles');
  const fromDb = r.ok ? r.data : [];
  const byId = new Map(fromDb.map((v) => [v.id, v]));
  const owns = (v: DbVehicle | undefined) => !sellerId || v?.seller_id === sellerId;

  const seeded = mockVehicles
    .filter((m) => owns(byId.get(m.id)))
    .map((m) => {
      const db = byId.get(m.id);
      return {
        ...m,
        status: (db?.status as CatalogVehicle['status']) ?? m.status,
        cover: db?.cover || m.cover
      };
    });

  const extra = fromDb
    .filter((v) => owns(v) && !mockVehicles.some((m) => m.id === v.id))
    .map<CatalogVehicle>((v) => ({
      id: v.id,
      title: v.title,
      year: v.year ?? new Date().getFullYear(),
      mileage: v.mileage ?? 0,
      price: v.price,
      location: v.location ?? v.location_area ?? '-',
      locationArea: v.location_area ?? v.location ?? '-',
      status: (v.status as CatalogVehicle['status']) ?? 'listed',
      score: null,
      grade: null,
      recommendation: null,
      cover: v.cover ?? '',
      coverR2: null
    }));

  return [...seeded, ...extra];
}
