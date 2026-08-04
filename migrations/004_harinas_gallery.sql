-- Fija las imágenes de galería de las harinas Tipo 000 y 0000.
-- Idempotente: si una imagen ya existe se conserva tal cual.
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (1, 'gallery', '/images/harina-000-25kg-b.jpg', 'Harina de Trigo Tipo 000 - Bolsa 25kg', 10);
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (1, 'gallery', '/images/harina-000-50kg-b.jpg', 'Harina de Trigo Tipo 000 - Bolsa 50kg', 11);
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (1, 'gallery', '/images/harina-000-0000-5kg-pack.jpg', 'Harina de Trigo Tipo 000 - Pack 5kg', 12);
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (1, 'gallery', '/images/harina-000-nutricional.jpg', 'Harina de Trigo Tipo 000 - Información Nutricional', 13);
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (2, 'gallery', '/images/harina-0000-25kg-b.jpg', 'Harina de Trigo Tipo 0000 - Bolsa 25kg', 10);
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (2, 'gallery', '/images/harina-0000-50kg-b.jpg', 'Harina de Trigo Tipo 0000 - Bolsa 50kg', 11);
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (2, 'gallery', '/images/harina-0000-5kg-b.jpg', 'Harina de Trigo Tipo 0000 - Bolsa 5kg', 12);
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (2, 'gallery', '/images/harina-0000-nutricional.jpg', 'Harina de Trigo Tipo 0000 - Información Nutricional', 13);