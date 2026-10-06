CREATE TABLE user_vouchers (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  code TEXT NOT NULL, claimed_at TEXT DEFAULT (datetime('now')),
  used_at TEXT, order_id TEXT REFERENCES orders(id)
);
CREATE INDEX idx_vouchers_user ON user_vouchers(user_id, code);
