-- Mode order: rahasia (covert) vs purna-beli (post-purchase).
--
--   covert        = inspeksi mobil yang SEDANG dijual. Seller tidak boleh tahu.
--                   Inspektor datang seperti calon pembeli biasa.
--   post-purchase = pembeli sudah memiliki mobil (garansi, sertifikasi ulang).
--                   Seller ikut tahu — approve/negosiasi jadwal seperti alur lama.
--
-- Ditentukan OTOMATIS dari jalur order: dari listing/detail kendaraan = covert,
-- dari menu garansi/sertifikasi = post-purchase.
ALTER TABLE orders ADD COLUMN mode TEXT NOT NULL DEFAULT 'covert';

-- Order yang sudah terjadwal sebelumnya berasal dari alur purna-beli (seller approve),
-- jangan sampai ikut tersembunyi setelah migrasi ini.
UPDATE orders SET mode = 'post-purchase' WHERE id IN (SELECT order_id FROM schedules);

CREATE INDEX IF NOT EXISTS idx_orders_mode ON orders(mode);

-- ---------------------------------------------------------------------------
-- Percakapan: satu order bisa punya LEBIH DARI SATU thread, dipisah `kind`
-- supaya obrolan soal inspeksi tidak bocor ke seller.
--
--   inspection = pembeli <-> inspektor (bahas inspeksi, atur ikut datang)
--   sale       = pembeli <-> penjual (murni jual-beli: harga, kondisi, lihat mobil)
--
-- CATATAN PENTING: migrasi ini sengaja TIDAK membangun ulang tabel `conversations`.
-- Percobaan pertama mengganti `seller_id` jadi NULLABLE dengan cara rebuild tabel
-- (buat conversations_new → DROP conversations → RENAME) dan GAGAL dengan
-- "FOREIGN KEY constraint failed": `DROP TABLE conversations` memicu DELETE implisit
-- yang divalidasi dari `messages.conversation_id`.
--
-- Sebagai gantinya `seller_id` tetap NOT NULL, dan thread tanpa penjual memakai
-- string kosong (''). Secara perilaku identik: `listConversations` memakai
-- `WHERE c.seller_id=?` yang tidak akan pernah cocok dengan '' untuk user sungguhan,
-- dan JOIN ke `users` tidak menemukan id '' sehingga `seller_name` tetap kosong.
-- Kalau suatu saat perlu NULL sungguhan, bangun ulang `messages` BERSAMAAN dengan
-- `conversations` dalam satu migrasi.
-- CATATAN PENTING — jangan tambahkan foreign key ke buyer_id / seller_id.
--
-- Thread 'inspection' (pembeli <-> inspektor) dan thread 'sale' (inspektor <-> penjual)
-- masing-masing TIDAK melibatkan semua pihak. Yang tidak ikut diisi string kosong '',
-- bukan NULL — karena kedua kolom itu NOT NULL.
--
-- Kalau nanti ditambah REFERENCES users(id), string '' tidak lagi ada di tabel users
-- dan INSERT-nya akan gagal dengan "FOREIGN KEY constraint failed". Pakai '' karena
-- listConversations mencocokkan `c.seller_id = ?` dengan id user sungguhan, jadi ''
-- tidak akan pernah cocok dan pihak yang tidak ikut otomatis tidak melihat thread.
ALTER TABLE conversations ADD COLUMN kind TEXT NOT NULL DEFAULT 'sale';

CREATE INDEX IF NOT EXISTS idx_conversations_order_kind ON conversations(order_id, kind);
