-- Iklan yang dibuat sendiri oleh seller butuh kolom cover (foto utama).
-- Kolom ini dipakai juga untuk listing yang sudah ada, supaya foto mobilnya
-- tetap muncul di katalog.
ALTER TABLE vehicles ADD COLUMN cover TEXT;

-- Backfill: foto seed berada di static/vehicles/<id>/hero.jpg
UPDATE vehicles SET cover = '/vehicles/' || id || '/hero.jpg' WHERE cover IS NULL OR cover = '';

CREATE INDEX IF NOT EXISTS idx_vehicles_seller_status ON vehicles(seller_id, status);
