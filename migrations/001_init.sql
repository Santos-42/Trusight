CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK(role IN ('buyer','seller','inspector','admin')),
  name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT,
  password_hash TEXT NOT NULL, avatar_r2_key TEXT,
  trust_score INTEGER DEFAULT 0, status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE inspector_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  license_no TEXT UNIQUE NOT NULL, license_r2_key TEXT,
  rating REAL DEFAULT 0, total_inspections INTEGER DEFAULT 0,
  region TEXT, status TEXT DEFAULT 'pending'
);
CREATE TABLE seller_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  showroom_name TEXT, address TEXT, rating REAL DEFAULT 0, bank_account TEXT
);
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY, seller_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL, brand TEXT, model TEXT, year INTEGER,
  mileage INTEGER, transmission TEXT, fuel TEXT, plate_no TEXT,
  color TEXT, location TEXT, price INTEGER NOT NULL,
  status TEXT DEFAULT 'draft', certified_report_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_vehicles_seller ON vehicles(seller_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE TABLE vehicle_photos (
  id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  r2_key TEXT NOT NULL, sort_order INTEGER DEFAULT 0
);
CREATE TABLE orders (
  id TEXT PRIMARY KEY, buyer_id TEXT NOT NULL REFERENCES users(id),
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  type TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'pending', total INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_vehicle ON orders(vehicle_id);
CREATE TABLE payments (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
  provider TEXT, external_id TEXT, amount INTEGER NOT NULL,
  method TEXT, status TEXT DEFAULT 'pending', webhook_at TEXT
);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE TABLE schedules (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
  proposed_by TEXT, datetime TEXT NOT NULL, duration_min INTEGER DEFAULT 90,
  inspector_id TEXT REFERENCES users(id),
  gps_lat REAL, gps_lng REAL, status TEXT DEFAULT 'proposed'
);
CREATE TABLE inspections (
  id TEXT PRIMARY KEY, order_id TEXT UNIQUE NOT NULL REFERENCES orders(id),
  inspector_id TEXT NOT NULL REFERENCES users(id),
  checkin_at TEXT, checkin_lat REAL, checkin_lng REAL, checkin_valid INTEGER DEFAULT 0,
  score INTEGER, grade TEXT, recommendation TEXT, repair_estimate INTEGER,
  summary TEXT, signature_r2_key TEXT, published_at TEXT, guarantee_until TEXT
);
CREATE TABLE inspection_items (
  id TEXT PRIMARY KEY, inspection_id TEXT NOT NULL REFERENCES inspections(id),
  category TEXT NOT NULL, item_key TEXT NOT NULL, item_label TEXT,
  condition TEXT, note TEXT
);
CREATE INDEX idx_items_inspection ON inspection_items(inspection_id, category);
CREATE TABLE inspection_photos (
  id TEXT PRIMARY KEY, inspection_id TEXT NOT NULL REFERENCES inspections(id),
  r2_key TEXT NOT NULL, lat REAL, lng REAL, taken_at TEXT,
  exif_valid INTEGER DEFAULT 0, category TEXT
);
CREATE TABLE reports (
  id TEXT PRIMARY KEY, inspection_id TEXT UNIQUE NOT NULL REFERENCES inspections(id),
  order_id TEXT NOT NULL REFERENCES orders(id),
  pdf_r2_key TEXT NOT NULL, score_snapshot INTEGER, grade_snapshot TEXT,
  published INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE certificates (
  id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  report_id TEXT NOT NULL REFERENCES reports(id),
  cert_no TEXT UNIQUE NOT NULL, share_token TEXT UNIQUE,
  issued_at TEXT DEFAULT (datetime('now')), expires_at TEXT
);
CREATE TABLE conversations (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
  buyer_id TEXT NOT NULL, seller_id TEXT NOT NULL, inspector_id TEXT
);
CREATE TABLE messages (
  id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id),
  sender_id TEXT NOT NULL REFERENCES users(id),
  body TEXT, attachment_r2_key TEXT, created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_messages_conv ON messages(conversation_id, created_at);
CREATE TABLE notifications (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT, title TEXT, body TEXT, ref_id TEXT, read_at TEXT
);
CREATE INDEX idx_notif_user ON notifications(user_id, read_at);
CREATE TABLE reviews (
  id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
  inspector_id TEXT NOT NULL, buyer_id TEXT NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5), comment TEXT
);
