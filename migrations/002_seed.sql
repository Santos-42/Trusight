-- Seed MVP: Civic, 911, users (id tetap agar relasi valid)
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
  ('porsche-911-2022', 'u-hendra', 'Porsche 911 Carrera S 2022', 'Porsche', '911 Carrera S', 2022, 12400, 'Manual', 'Bensin', 'B 992 TS', 'Putih', 'Jakarta Utara', 4750000000, 'certified'),
  ('avanza-2022', 'u-hendra', 'Toyota Avanza Veloz 2022', 'Toyota', 'Avanza Veloz', 2022, 32000, 'Matic', 'Bensin', 'B 2211 AV', 'Silver', 'Tebet, Jakarta Selatan', 235000000, 'listed');
