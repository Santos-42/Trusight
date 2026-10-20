-- Seed MVP: users (id tetap agar relasi valid) + katalog kendaraan.
-- Katalog harus senada dengan src/lib/mocks.ts (15 kendaraan).
INSERT INTO users (id, role, name, email, password_hash, trust_score) VALUES
  ('u-budi', 'buyer', 'Budi Perkasa', 'budi@mail.com', 'hash:demo', 98),
  ('u-hendra', 'seller', 'Hendra Wijaya', 'hendra@showroom.id', 'hash:demo', 80),
  ('u-bsantoso', 'inspector', 'Budi Santoso', 'budi.s@trusight.id', 'hash:demo', 95),
  ('u-firman', 'inspector', 'Firman Comstir', 'firman@trusight.id', 'hash:demo', 97),
  ('u-admin', 'admin', 'Admin TruSight', 'admin@trusight.id', 'hash:demo', 100);

INSERT INTO inspector_profiles (user_id, license_no, rating, total_inspections, region, status) VALUES
  ('u-bsantoso', '#1294', 4.9, 420, 'DKI Jakarta', 'verified'),
  ('u-firman', '#2100', 4.9, 242, 'DKI Jakarta', 'verified');

INSERT INTO seller_profiles (user_id, showroom_name, address, rating) VALUES
  ('u-hendra', 'Hendra Auto', 'Kalibata, Jakarta Selatan', 4.8);

INSERT INTO vehicles (id, seller_id, title, brand, model, year, mileage, transmission, fuel, plate_no, color, location, price, status) VALUES
  ('civic-2021', 'u-hendra', 'Honda Civic Turbo 2021', 'Honda', 'Civic Turbo', 2021, 45000, 'Matic', 'Bensin', 'B 1234 SG', 'Hitam', 'Kalibata, Jakarta Selatan', 385000000, 'listed'),
  ('porsche-911-2022', 'u-hendra', 'Porsche 911 Carrera S 2022', 'Porsche', '911 Carrera S', 2022, 12400, 'Manual', 'Bensin', 'B 992 TS', 'Putih', 'Pantai Indah Kapuk, Jakarta Utara', 4750000000, 'certified'),
  ('avanza-2022', 'u-hendra', 'Toyota Avanza Veloz 2022', 'Toyota', 'Avanza Veloz', 2022, 32000, 'Matic', 'Bensin', 'B 2211 AV', 'Silver', 'Tebet, Jakarta Selatan', 235000000, 'listed'),
  ('innova-2020', 'u-hendra', 'Toyota Kijang Innova Venturer 2020', 'Toyota', 'Kijang Innova Venturer', 2020, 68000, 'Matic', 'Diesel', 'B 1010 IN', 'Hitam', 'Bintaro, Tangerang Selatan', 335000000, 'certified'),
  ('xpander-2021', 'u-hendra', 'Mitsubishi Xpander Ultimate 2021', 'Mitsubishi', 'Xpander Ultimate', 2021, 41000, 'Matic', 'Bensin', 'B 3030 XP', 'Abu-abu', 'Bekasi Timur, Kota Bekasi', 268000000, 'listed'),
  ('hrv-2022', 'u-hendra', 'Honda HR-V SE 2022', 'Honda', 'HR-V SE', 2022, 27000, 'Matic', 'Bensin', 'B 2626 HR', 'Putih', 'Kemang, Jakarta Selatan', 372000000, 'certified'),
  ('brio-2021', 'u-hendra', 'Honda Brio RS 2021', 'Honda', 'Brio RS', 2021, 38000, 'Matic', 'Bensin', 'B 7788 BR', 'Merah', 'Margonda, Kota Depok', 178000000, 'listed'),
  ('ertiga-2020', 'u-hendra', 'Suzuki Ertiga GX 2020', 'Suzuki', 'Ertiga GX', 2020, 52000, 'Matic', 'Bensin', 'F 1212 ER', 'Silver', 'Cibinong, Kabupaten Bogor', 212000000, 'listed'),
  ('pajero-2019', 'u-hendra', 'Mitsubishi Pajero Sport Dakar 2019', 'Mitsubishi', 'Pajero Sport Dakar', 2019, 74000, 'Matic', 'Diesel', 'B 8080 PJ', 'Hitam', 'Bintaro, Tangerang Selatan', 445000000, 'certified'),
  ('crv-2021', 'u-hendra', 'Honda CR-V Turbo 2021', 'Honda', 'CR-V Turbo', 2021, 36000, 'Matic', 'Bensin', 'B 4545 CV', 'Putih', 'Kelapa Gading, Jakarta Utara', 428000000, 'listed'),
  ('calya-2021', 'u-hendra', 'Toyota Calya G 2021', 'Toyota', 'Calya G', 2021, 44000, 'Matic', 'Bensin', 'B 5151 CL', 'Silver', 'Ciledug, Kota Tangerang', 152000000, 'listed'),
  ('jazz-2018', 'u-hendra', 'Honda Jazz RS 2018', 'Honda', 'Jazz RS', 2018, 61000, 'Matic', 'Bensin', 'B 1818 JZ', 'Biru', 'Tebet, Jakarta Selatan', 219000000, 'listed'),
  ('fortuner-2020', 'u-hendra', 'Toyota Fortuner VRZ 2020', 'Toyota', 'Fortuner VRZ', 2020, 58000, 'Matic', 'Diesel', 'B 2020 FT', 'Hitam', 'Cilandak, Jakarta Selatan', 487000000, 'certified'),
  ('camry-2021', 'u-hendra', 'Toyota Camry 2.5 V 2021', 'Toyota', 'Camry 2.5 V', 2021, 29000, 'Matic', 'Bensin', 'B 2525 CM', 'Putih', 'Senayan, Jakarta Pusat', 725000000, 'certified'),
  ('alphard-2019', 'u-hendra', 'Toyota Alphard SC 2019', 'Toyota', 'Alphard SC', 2019, 47000, 'Matic', 'Bensin', 'B 1919 AL', 'Hitam', 'Pluit, Jakarta Utara', 1150000000, 'certified');
