-- Penyimpanan media (foto lapangan inspeksi) langsung di D1 sebagai base64 TEXT.
--
-- Alasan: filesystem Cloudflare Pages read-only, jadi file yang diunggah saat
-- runtime TIDAK bisa ditulis ke static/. Foto listing seller tetap memakai
-- static/ (repo-managed: dibuat lokal, di-commit, lalu di-deploy), tapi foto
-- lapangan diambil inspector di lokasi — tidak bisa masuk repo.
--
-- Batas: 1.000.000 byte per nilai TEXT di D1. Foto dikompresi client-side ke
-- <= 500 KB (base64 jadi ~667 KB) supaya aman.
CREATE TABLE media_blobs (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  data TEXT NOT NULL,
  bytes INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_media_blobs_created ON media_blobs(created_at);
