-- Seed data for Molipar S.A.

-- Admin user creado automaticamente en src/index.js via ensureDatabase()
-- con PBKDF2 + salt aleatorio. Este seed ya no incluye el usuario admin
-- para evitar inconsistencias de hash.

-- Product types
INSERT INTO product_types (name, slug, description, icon, sort_order) VALUES
('Harinas', 'harinas', 'Harinas de trigo de alta calidad para panificación, repostería y uso industrial', 'flour', 1),
('Fideos', 'fideos', 'Pastas y fideos elaborados con harinas seleccionadas', 'pasta', 2);

-- Categories for Harinas
INSERT INTO categories (product_type_id, name, slug, description, sort_order) VALUES
(1, 'Harinas Panaderas', 'harinas-panaderas', 'Harinas especiales para panificación artesanal e industrial', 1),
(1, 'Harinas Reposteras', 'harinas-reposteras', 'Harinas finas para repostería y pastelería', 2),
(1, 'Harinas Industriales', 'harinas-industriales', 'Harinas para uso industrial y procesos productivos', 3);

-- Categories for Fideos
INSERT INTO categories (product_type_id, name, slug, description, sort_order) VALUES
(2, 'Fideos Cortos', 'fideos-cortos', 'Pastas cortas como coditos, mostacholes, tirabuzones', 1),
(2, 'Fideos Largos', 'fideos-largos', 'Pastas largas como espaguetis, tallarines, fetuccinis', 2),
(2, 'Fideos Especiales', 'fideos-especiales', 'Pastas especiales con huevo, vegetales o sémola', 3);

-- Site settings defaults
INSERT INTO site_settings (setting_key, setting_value, setting_group) VALUES
('company_name', 'Molipar S.A.', 'company'),
('company_slogan', 'Calidad desde el origen', 'company'),
('company_description', 'Empresa dedicada a la producción y comercialización de harinas y fideos de la más alta calidad.', 'company'),
('company_history', 'Molipar S.A. nace de la pasión por la molienda y la tradición panadera. Desde nuestros inicios, nos hemos comprometido con la excelencia en cada etapa del proceso productivo, seleccionando los mejores granos de trigo y aplicando tecnología de vanguardia para ofrecer harinas y fideos que superan las expectativas de nuestros clientes.', 'company'),
('company_mission', 'Producir harinas y fideos de la más alta calidad, satisfaciendo las necesidades de nuestros clientes con productos confiables, innovadores y nutritivos, contribuyendo al desarrollo de la industria alimentaria.', 'company'),
('company_vision', 'Ser líderes en el mercado nacional de harinas y pastas, reconocidos por nuestra calidad, innovación y compromiso con el cliente, expandiendo nuestra presencia a mercados internacionales.', 'company'),
('company_values', '[{"title":"Calidad","description":"Compromiso absoluto con la excelencia en cada producto que elaboramos.","icon":"quality"},{"title":"Innovación","description":"Mejora continua e incorporación de tecnología de vanguardia en nuestros procesos.","icon":"innovation"},{"title":"Tradición","description":"Respeto por la herencia molinera y el saber hacer transmitido por generaciones.","icon":"tradition"},{"title":"Responsabilidad","description":"Compromiso con el medio ambiente, nuestros colaboradores y la comunidad.","icon":"responsibility"}]', 'company'),
('address', 'Ruta PY02 Km 211,5 - J.E. Estigarribia (Campo 9), Paraguay', 'contact'),
('phone', '+595 986 288006', 'contact'),
('whatsapp', '595986288006', 'contact'),
('email', 'info@molipar.com', 'contact'),
('facebook', 'https://facebook.com/molipar', 'social'),
('instagram', 'https://instagram.com/molipar', 'social'),
('linkedin', 'https://linkedin.com/company/molipar', 'social'),
('youtube', 'https://youtube.com/@molipar', 'social'),
('schedule', 'Lunes a Viernes: 8:00 - 18:00 hs | Sábados: 8:00 - 13:00 hs', 'contact'),
('hero_title', 'La calidad del trigo, el sabor de siempre', 'home'),
('hero_subtitle', 'Producimos harinas y fideos con los más altos estándares de calidad, llevando tradición y sabor a tu mesa.', 'home'),
('hero_cta_text', 'Conocé nuestros productos', 'home');

-- Products
INSERT INTO products (name, slug, product_type_id, category_id, short_description, full_description, nutritional_info, status, sort_order, main_image) VALUES
('Harina de Trigo Tipo 000', 'harina-trigo-000', 1, 1, 'Harina de trigo enriquecida con hierro y vitaminas, ideal para panificación artesanal e industrial.', 'Harina de trigo tipo 000 enriquecida con hierro y vitaminas. Perfecta para la elaboración de panes, facturas y masas fermentadas. Su granulometría media permite una óptima absorción de agua y un desarrollo de gluten equilibrado, garantizando productos de excelente volumen y textura.', '<strong>Información Nutricional (por 50g / media taza)</strong><br>Valor Energético: 170 kcal<br>Carbohidratos: 35g<br>Proteínas: 5g<br>Grasas Totales: 0.5g<br>Hierro: 2.5mg<br>Vitaminas del complejo B: B1 (0.3mg), B2 (0.2mg), B3 (3mg)', 'active', 1, '/images/harina-000-25kg.jpg'),
('Harina de Trigo Tipo 0000', 'harina-trigo-0000', 1, 2, 'Harina de trigo extra fina enriquecida con hierro y vitaminas, especial para repostería y pastelería.', 'Harina de trigo tipo 0000 enriquecida con hierro y vitaminas. De granulometría extra fina, ideal para repostería fina, pastelería, galletitas y masas de hojaldre. Su textura suave y sedosa garantiza una incorporación homogénea con grasas y líquidos, logrando preparaciones delicadas y de gran fineza.', '<strong>Información Nutricional (por 50g / media taza)</strong><br>Valor Energético: 170 kcal<br>Carbohidratos: 35g<br>Proteínas: 4.5g<br>Grasas Totales: 0.5g<br>Hierro: 2.5mg<br>Vitaminas del complejo B: B1 (0.3mg), B2 (0.2mg), B3 (3mg)', 'active', 2, '/images/harina-0000.jpg');

-- Product presentations
INSERT INTO product_presentations (product_id, name, weight, price, is_primary, sort_order) VALUES
(1, 'Bolsa de 5kg', '5 kg', NULL, 0, 1),
(1, 'Bolsa de 25kg', '25 kg', NULL, 1, 2),
(1, 'Bolsa de 50kg', '50 kg', NULL, 0, 3),
(2, 'Bolsa de 25kg', '25 kg', NULL, 1, 1),
(2, 'Bolsa de 50kg', '50 kg', NULL, 0, 2);
