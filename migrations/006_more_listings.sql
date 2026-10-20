-- Tambahan katalog listing (12 mobil).
--
-- Kenapa file ini ada: 002_seed.sql sudah pernah ke-apply di beberapa environment, dan
-- Wrangler mencatat migrasi berdasarkan NAMA file — jadi versi 002 yang sudah diperbarui
-- tidak akan dijalankan ulang di sana. Migrasi ini memastikan 12 listing tambahan tetap
-- masuk di environment mana pun.
--
-- INSERT OR IGNORE membuatnya idempoten: aman dijalankan setelah 002 versi baru
-- (sudah ada, diabaikan) maupun setelah 002 versi lama (belum ada, disisipkan).
INSERT OR IGNORE INTO vehicles (id, seller_id, title, brand, model, year, mileage, transmission, fuel, plate_no, color, location, location_area, price, status) VALUES
  ('innova-2020', 'u-hendra', 'Toyota Kijang Innova Venturer 2020', 'Toyota', 'Kijang Innova Venturer', 2020, 68000, 'Matic', 'Diesel', 'B 1010 IN', 'Hitam', 'Bintaro, Tangerang Selatan', 'Tangerang Selatan', 335000000, 'certified'),
  ('xpander-2021', 'u-hendra', 'Mitsubishi Xpander Ultimate 2021', 'Mitsubishi', 'Xpander Ultimate', 2021, 41000, 'Matic', 'Bensin', 'B 3030 XP', 'Abu-abu', 'Bekasi Timur, Kota Bekasi', 'Kota Bekasi', 268000000, 'listed'),
  ('hrv-2022', 'u-hendra', 'Honda HR-V SE 2022', 'Honda', 'HR-V SE', 2022, 27000, 'Matic', 'Bensin', 'B 2626 HR', 'Putih', 'Kemang, Jakarta Selatan', 'Jakarta Selatan', 372000000, 'certified'),
  ('brio-2021', 'u-hendra', 'Honda Brio RS 2021', 'Honda', 'Brio RS', 2021, 38000, 'Matic', 'Bensin', 'B 7788 BR', 'Merah', 'Margonda, Kota Depok', 'Kota Depok', 178000000, 'listed'),
  ('ertiga-2020', 'u-hendra', 'Suzuki Ertiga GX 2020', 'Suzuki', 'Ertiga GX', 2020, 52000, 'Matic', 'Bensin', 'F 1212 ER', 'Silver', 'Cibinong, Kabupaten Bogor', 'Bogor', 212000000, 'listed'),
  ('pajero-2019', 'u-hendra', 'Mitsubishi Pajero Sport Dakar 2019', 'Mitsubishi', 'Pajero Sport Dakar', 2019, 74000, 'Matic', 'Diesel', 'B 8080 PJ', 'Hitam', 'Bintaro, Tangerang Selatan', 'Tangerang Selatan', 445000000, 'certified'),
  ('crv-2021', 'u-hendra', 'Honda CR-V Turbo 2021', 'Honda', 'CR-V Turbo', 2021, 36000, 'Matic', 'Bensin', 'B 4545 CV', 'Putih', 'Kelapa Gading, Jakarta Utara', 'Jakarta Utara', 428000000, 'listed'),
  ('calya-2021', 'u-hendra', 'Toyota Calya G 2021', 'Toyota', 'Calya G', 2021, 44000, 'Matic', 'Bensin', 'B 5151 CL', 'Silver', 'Ciledug, Kota Tangerang', 'Tangerang', 152000000, 'listed'),
  ('jazz-2018', 'u-hendra', 'Honda Jazz RS 2018', 'Honda', 'Jazz RS', 2018, 61000, 'Matic', 'Bensin', 'B 1818 JZ', 'Biru', 'Tebet, Jakarta Selatan', 'Jakarta Selatan', 219000000, 'listed'),
  ('fortuner-2020', 'u-hendra', 'Toyota Fortuner VRZ 2020', 'Toyota', 'Fortuner VRZ', 2020, 58000, 'Matic', 'Diesel', 'B 2020 FT', 'Hitam', 'Cilandak, Jakarta Selatan', 'Jakarta Selatan', 487000000, 'certified'),
  ('camry-2021', 'u-hendra', 'Toyota Camry 2.5 V 2021', 'Toyota', 'Camry 2.5 V', 2021, 29000, 'Matic', 'Bensin', 'B 2525 CM', 'Putih', 'Senayan, Jakarta Pusat', 'Jakarta Pusat', 725000000, 'certified'),
  ('alphard-2019', 'u-hendra', 'Toyota Alphard SC 2019', 'Toyota', 'Alphard SC', 2019, 47000, 'Matic', 'Bensin', 'B 1919 AL', 'Hitam', 'Pluit, Jakarta Utara', 'Jakarta Utara', 1150000000, 'certified');

-- Jaring pengaman: kendaraan yang masuk lewat 002 versi LAMA tidak punya location_area
-- (kolomnya baru ditambah 005). Isi dari location agar tampilan publik tidak kosong.
UPDATE vehicles
  SET location_area = substr(location, 1, instr(location || ',', ',') - 1)
  WHERE location_area IS NULL OR location_area = '';
