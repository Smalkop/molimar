-- Migration 003: Fideos Apetito + galería de imágenes para harinas

-- ============================================================
-- NUEVOS PRODUCTOS: Fideos Apetito (5 variedades, 400g c/u)
-- ============================================================
INSERT OR IGNORE INTO products (id, name, slug, product_type_id, category_id, short_description, full_description, status, sort_order, main_image) VALUES
(3, 'Fideos Apetito - Tallarín', 'apetito-tallarin', 2, 5,
 'Tallarines de pasta de sémola, cocción rápida y textura firme. Ideal para acompañar con salsas rojas, cremas o simplemente con aceite de oliva.',
 'Tallarines elaborados con sémola de trigo seleccionada, brindando una textura firme y una cocción uniforme. Perfectos para todo tipo de salsas, desde las más clásicas hasta preparaciones gourmet. Presentación de 400g.',
 'active', 1, '/images/fideos/apetito-tallarin.jpg'),

(4, 'Fideos Apetito - Spaguetti', 'apetito-spaguetti', 2, 5,
 'Spaguetti de pasta de sémola, el clásico de la cocina italiana. Ideal para salsas tradicionales y platos al horno.',
 'Spaguetti de sémola de trigo de alta calidad. Su cocción pareja y textura al dente los convierten en la opción ideal para espagueteadas, pastas con salsa bolognesa, pesto o mariscos. Presentación de 400g.',
 'active', 2, '/images/fideos/apetito-spaguetti.jpg'),

(5, 'Fideos Apetito - Tirabuzón', 'apetito-tirabuzon', 2, 4,
 'Tirabuzones de pasta de sémola, ideales para ensaladas de pasta y salsas espesas que se adhieren a su forma.',
 'Tirabuzones elaborados con sémola de trigo seleccionada. Su forma helicoidal atrapa las salsas perfectamente, ideales para ensaladas de pasta frías o calientes con salsas espesas. Presentación de 400g.',
 'active', 3, '/images/fideos/apetito-tirabuzon.jpg'),

(6, 'Fideos Apetito - Cinta Ancha', 'apetito-cinta-ancha', 2, 6,
 'Cinta ancha de pasta de sémola, ideal para lasañas y pastas horneadas con abundante salsa.',
 'Cinta ancha de sémola de trigo de primera calidad. Su formato ancho y plano es perfecto para lasañas, pastelones de pasta y platos horneados con abundante salsa y queso. Presentación de 400g.',
 'active', 4, '/images/fideos/apetito-cinta-ancha.jpg'),

(7, 'Fideos Apetito - Cortadito', 'apetito-cortadito', 2, 4,
 'Cortaditos de pasta de sémola, el clásico acompañante para sopas y guisos tradicionales.',
 'Cortaditos elaborados con sémola de trigo de alta calidad. Su tamaño pequeño los hace ideales para sopas, guisos y caldos tradicionales. Cocción rápida y textura firme. Presentación de 400g.',
 'active', 5, '/images/fideos/apetito-cortadito.jpg');

-- ============================================================
-- PRESENTACIONES: 400g para cada fideo
-- ============================================================
INSERT OR IGNORE INTO product_presentations (product_id, name, weight, price, is_primary, sort_order) VALUES
(3, 'Paquete de 400g', '400 g', NULL, 1, 1),
(4, 'Paquete de 400g', '400 g', NULL, 1, 1),
(5, 'Paquete de 400g', '400 g', NULL, 1, 1),
(6, 'Paquete de 400g', '400 g', NULL, 1, 1),
(7, 'Paquete de 400g', '400 g', NULL, 1, 1);

-- ============================================================
-- IMÁGENES PRINCIPALES: Fideos
-- ============================================================
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES
(3, 'main', '/images/fideos/apetito-tallarin.jpg', 'Fideos Apetito - Tallarín 400g', 1),
(4, 'main', '/images/fideos/apetito-spaguetti.jpg', 'Fideos Apetito - Spaguetti 400g', 1),
(5, 'main', '/images/fideos/apetito-tirabuzon.jpg', 'Fideos Apetito - Tirabuzón 400g', 1),
(6, 'main', '/images/fideos/apetito-cinta-ancha.jpg', 'Fideos Apetito - Cinta Ancha 400g', 1),
(7, 'main', '/images/fideos/apetito-cortadito.jpg', 'Fideos Apetito - Cortadito 400g', 1);

-- Galería: collage de todas las variedades
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES
(3, 'gallery', '/images/fideos/apetito-collage.jpg', 'Fideos Apetito - Todas las variedades', 2),
(4, 'gallery', '/images/fideos/apetito-collage.jpg', 'Fideos Apetito - Todas las variedades', 2),
(5, 'gallery', '/images/fideos/apetito-collage.jpg', 'Fideos Apetito - Todas las variedades', 2),
(6, 'gallery', '/images/fideos/apetito-collage.jpg', 'Fideos Apetito - Todas las variedades', 2),
(7, 'gallery', '/images/fideos/apetito-collage.jpg', 'Fideos Apetito - Todas las variedades', 2);

-- ============================================================
-- GALERÍA: Nuevas imágenes para Harina 000 (product_id = 1)
-- ============================================================
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES
(1, 'gallery', '/images/harina-000-25kg-b.jpg', 'Harina de Trigo Tipo 000 - Bolsa 25kg', 10),
(1, 'gallery', '/images/harina-000-50kg-b.jpg', 'Harina de Trigo Tipo 000 - Bolsa 50kg', 11),
(1, 'gallery', '/images/harina-000-0000-5kg-pack.jpg', 'Harina de Trigo Tipo 000 - Pack 5kg', 12),
(1, 'gallery', '/images/harina-000-nutricional.jpg', 'Harina de Trigo Tipo 000 - Información Nutricional', 13);

-- ============================================================
-- GALERÍA: Nuevas imágenes para Harina 0000 (product_id = 2)
-- ============================================================
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES
(2, 'gallery', '/images/harina-0000-25kg-b.jpg', 'Harina de Trigo Tipo 0000 - Bolsa 25kg', 10),
(2, 'gallery', '/images/harina-0000-50kg-b.jpg', 'Harina de Trigo Tipo 0000 - Bolsa 50kg', 11),
(2, 'gallery', '/images/harina-0000-5kg-b.jpg', 'Harina de Trigo Tipo 0000 - Bolsa 5kg', 12),
(2, 'gallery', '/images/harina-0000-nutricional.jpg', 'Harina de Trigo Tipo 0000 - Información Nutricional', 13);
