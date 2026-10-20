/**
 * Katalog listing (iklan mobil) untuk feed buyer.
 *
 * `location`      = alamat detail — hanya boleh tampil SETELAH pembayaran,
 *                   dan hanya untuk pembeli + inspektor (lihat Fase 3).
 * `locationArea`  = kota/kecamatan — aman ditampilkan publik sebelum bayar.
 *
 * `cover` menunjuk ke `static/vehicles/<id>/hero.jpg`. Kalau filenya belum ada,
 * VehicleCard jatuh ke ikon mobil — jadi katalog tetap tampil.
 */
export type MockVehicle = {
  id: string;
  title: string;
  year: number;
  mileage: number;
  price: number;
  location: string;
  locationArea: string;
  status: 'listed' | 'certified';
  score: number | null;
  grade: string | null;
  recommendation: string | null;
  cover: string;
  coverR2: string | null;
};

export const mockVehicles: MockVehicle[] = [
  {
    id: 'civic-2021',
    title: 'Honda Civic Turbo 2021',
    year: 2021,
    mileage: 45000,
    price: 385000000,
    location: 'Kalibata, Jakarta Selatan',
    locationArea: 'Jakarta Selatan',
    status: 'listed',
    score: null,
    grade: null,
    recommendation: null,
    cover: '/vehicles/civic-2021/hero.jpg',
    coverR2: null
  },
  {
    id: 'porsche-911-2022',
    title: 'Porsche 911 Carrera S 2022',
    year: 2022,
    mileage: 12400,
    price: 4750000000,
    location: 'Pantai Indah Kapuk, Jakarta Utara',
    locationArea: 'Jakarta Utara',
    status: 'certified',
    score: 94,
    grade: 'A',
    recommendation: 'beli',
    cover: '/vehicles/porsche-911-2022/hero.jpg',
    coverR2: null
  },
  {
    id: 'avanza-2022',
    title: 'Toyota Avanza Veloz 2022',
    year: 2022,
    mileage: 32000,
    price: 235000000,
    location: 'Tebet, Jakarta Selatan',
    locationArea: 'Jakarta Selatan',
    status: 'listed',
    score: 82,
    grade: 'B+',
    recommendation: 'nego',
    cover: '/vehicles/avanza-2022/hero.jpg',
    coverR2: null
  },
  {
    id: 'innova-2020',
    title: 'Toyota Kijang Innova Venturer 2020',
    year: 2020,
    mileage: 68000,
    price: 335000000,
    location: 'Bintaro, Tangerang Selatan',
    locationArea: 'Tangerang Selatan',
    status: 'certified',
    score: 88,
    grade: 'A-',
    recommendation: 'beli',
    cover: '/vehicles/innova-2020/hero.jpg',
    coverR2: null
  },
  {
    id: 'xpander-2021',
    title: 'Mitsubishi Xpander Ultimate 2021',
    year: 2021,
    mileage: 41000,
    price: 268000000,
    location: 'Bekasi Timur, Kota Bekasi',
    locationArea: 'Kota Bekasi',
    status: 'listed',
    score: null,
    grade: null,
    recommendation: null,
    cover: '/vehicles/xpander-2021/hero.jpg',
    coverR2: null
  },
  {
    id: 'hrv-2022',
    title: 'Honda HR-V SE 2022',
    year: 2022,
    mileage: 27000,
    price: 372000000,
    location: 'Kemang, Jakarta Selatan',
    locationArea: 'Jakarta Selatan',
    status: 'certified',
    score: 91,
    grade: 'A',
    recommendation: 'beli',
    cover: '/vehicles/hrv-2022/hero.jpg',
    coverR2: null
  },
  {
    id: 'brio-2021',
    title: 'Honda Brio RS 2021',
    year: 2021,
    mileage: 38000,
    price: 178000000,
    location: 'Margonda, Kota Depok',
    locationArea: 'Kota Depok',
    status: 'listed',
    score: 79,
    grade: 'B',
    recommendation: 'nego',
    cover: '/vehicles/brio-2021/hero.jpg',
    coverR2: null
  },
  {
    id: 'ertiga-2020',
    title: 'Suzuki Ertiga GX 2020',
    year: 2020,
    mileage: 52000,
    price: 212000000,
    location: 'Cibinong, Kabupaten Bogor',
    locationArea: 'Bogor',
    status: 'listed',
    score: null,
    grade: null,
    recommendation: null,
    cover: '/vehicles/ertiga-2020/hero.jpg',
    coverR2: null
  },
  {
    id: 'pajero-2019',
    title: 'Mitsubishi Pajero Sport Dakar 2019',
    year: 2019,
    mileage: 74000,
    price: 445000000,
    location: 'Bintaro, Tangerang Selatan',
    locationArea: 'Tangerang Selatan',
    status: 'certified',
    score: 86,
    grade: 'B+',
    recommendation: 'nego',
    cover: '/vehicles/pajero-2019/hero.jpg',
    coverR2: null
  },
  {
    id: 'crv-2021',
    title: 'Honda CR-V Turbo 2021',
    year: 2021,
    mileage: 36000,
    price: 428000000,
    location: 'Kelapa Gading, Jakarta Utara',
    locationArea: 'Jakarta Utara',
    status: 'listed',
    score: 90,
    grade: 'A-',
    recommendation: 'beli',
    cover: '/vehicles/crv-2021/hero.jpg',
    coverR2: null
  },
  {
    id: 'calya-2021',
    title: 'Toyota Calya G 2021',
    year: 2021,
    mileage: 44000,
    price: 152000000,
    location: 'Ciledug, Kota Tangerang',
    locationArea: 'Tangerang',
    status: 'listed',
    score: null,
    grade: null,
    recommendation: null,
    cover: '/vehicles/calya-2021/hero.jpg',
    coverR2: null
  },
  {
    id: 'jazz-2018',
    title: 'Honda Jazz RS 2018',
    year: 2018,
    mileage: 61000,
    price: 219000000,
    location: 'Tebet, Jakarta Selatan',
    locationArea: 'Jakarta Selatan',
    status: 'listed',
    score: 77,
    grade: 'B',
    recommendation: 'hindari',
    cover: '/vehicles/jazz-2018/hero.jpg',
    coverR2: null
  },
  {
    id: 'fortuner-2020',
    title: 'Toyota Fortuner VRZ 2020',
    year: 2020,
    mileage: 58000,
    price: 487000000,
    location: 'Cilandak, Jakarta Selatan',
    locationArea: 'Jakarta Selatan',
    status: 'certified',
    score: 89,
    grade: 'A-',
    recommendation: 'beli',
    cover: '/vehicles/fortuner-2020/hero.jpg',
    coverR2: null
  },
  {
    id: 'camry-2021',
    title: 'Toyota Camry 2.5 V 2021',
    year: 2021,
    mileage: 29000,
    price: 725000000,
    location: 'Senayan, Jakarta Pusat',
    locationArea: 'Jakarta Pusat',
    status: 'certified',
    score: 93,
    grade: 'A',
    recommendation: 'beli',
    cover: '/vehicles/camry-2021/hero.jpg',
    coverR2: null
  },
  {
    id: 'alphard-2019',
    title: 'Toyota Alphard SC 2019',
    year: 2019,
    mileage: 47000,
    price: 1150000000,
    location: 'Pluit, Jakarta Utara',
    locationArea: 'Jakarta Utara',
    status: 'certified',
    score: 92,
    grade: 'A',
    recommendation: 'beli',
    cover: '/vehicles/alphard-2019/hero.jpg',
    coverR2: null
  }
];

/** Cari kendaraan berdasarkan id; fallback ke yang pertama. */
export function findVehicle(id: string): MockVehicle {
  return mockVehicles.find((v) => v.id === id) ?? mockVehicles[0];
}

/** Cocokkan teks bebas (mis. hasil tempel link iklan) ke kendaraan terdekat. */
export function matchVehicleByText(text: string): MockVehicle {
  const low = text.toLowerCase();
  const hit = mockVehicles.find((v) => v.title.toLowerCase().includes(low) || low.includes(v.title.toLowerCase()));
  if (hit) return hit;
  const byWord = mockVehicles.find((v) => v.title.toLowerCase().split(' ').some((w) => w.length > 3 && low.includes(w)));
  return byWord ?? mockVehicles[0];
}
