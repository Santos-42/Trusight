-- Migration 009: Hapus kendaraan porsche-911-2022 yang telah dihapus dari katalog
DELETE FROM certificates WHERE vehicle_id = 'porsche-911-2022';
DELETE FROM vehicle_photos WHERE vehicle_id = 'porsche-911-2022';
DELETE FROM orders WHERE vehicle_id = 'porsche-911-2022';
DELETE FROM vehicles WHERE id = 'porsche-911-2022';

