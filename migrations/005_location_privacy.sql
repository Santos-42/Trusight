-- Privasi lokasi: lokasi detail tidak boleh bocor ke publik/seller sebelum pembayaran.
--
--   location       = alamat detail (mis. "Kalibata, Jakarta Selatan")
--                    → hanya untuk PEMBELI order itu + INSPEKTUR yang bertugas,
--                      dan hanya SETELAH ada pembayaran 'paid'.
--   location_area  = kota/kecamatan (mis. "Jakarta Selatan")
--                    → aman ditampilkan di listing sebelum pembayaran.
--
-- Seller tidak pernah berhak atas location detail (lihat listOrders di
-- src/lib/server/d1.ts yang hanya mengirim location_area).
ALTER TABLE vehicles ADD COLUMN location_area TEXT;

UPDATE vehicles SET location_area = 'Jakarta Selatan'    WHERE id = 'civic-2021';
UPDATE vehicles SET location_area = 'Jakarta Utara'      WHERE id = 'porsche-911-2022';
UPDATE vehicles SET location_area = 'Jakarta Selatan'    WHERE id = 'avanza-2022';
UPDATE vehicles SET location_area = 'Tangerang Selatan'  WHERE id = 'innova-2020';
UPDATE vehicles SET location_area = 'Kota Bekasi'        WHERE id = 'xpander-2021';
UPDATE vehicles SET location_area = 'Jakarta Selatan'    WHERE id = 'hrv-2022';
UPDATE vehicles SET location_area = 'Kota Depok'         WHERE id = 'brio-2021';
UPDATE vehicles SET location_area = 'Bogor'              WHERE id = 'ertiga-2020';
UPDATE vehicles SET location_area = 'Tangerang Selatan'  WHERE id = 'pajero-2019';
UPDATE vehicles SET location_area = 'Jakarta Utara'      WHERE id = 'crv-2021';
UPDATE vehicles SET location_area = 'Tangerang'          WHERE id = 'calya-2021';
UPDATE vehicles SET location_area = 'Jakarta Selatan'    WHERE id = 'jazz-2018';
UPDATE vehicles SET location_area = 'Jakarta Selatan'    WHERE id = 'fortuner-2020';
UPDATE vehicles SET location_area = 'Jakarta Pusat'      WHERE id = 'camry-2021';
UPDATE vehicles SET location_area = 'Jakarta Utara'      WHERE id = 'alphard-2019';

-- Jaring pengaman: kalau ada kendaraan lain yang belum punya location_area,
-- turunkan otomatis dari location (teks sebelum koma pertama).
UPDATE vehicles
  SET location_area = substr(location, 1, instr(location || ',', ',') - 1)
  WHERE location_area IS NULL OR location_area = '';
