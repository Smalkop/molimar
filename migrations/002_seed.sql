-- Seed data for Molipar S.A.

-- Admin user (password: admin123 - hashed with SHA-256)
INSERT INTO users (name, email, password, role) VALUES
('Administrador', 'admin@molipar.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmKcVq9FJwJcYpXJxKqy', 'admin');

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
('address', 'Av. Industrial 1234, Parque Industrial, Ciudad', 'contact'),
('phone', '+54 11 4567-8901', 'contact'),
('whatsapp', '+5491145678901', 'contact'),
('email', 'info@molipar.com', 'contact'),
('facebook', 'https://facebook.com/molipar', 'social'),
('instagram', 'https://instagram.com/molipar', 'social'),
('linkedin', 'https://linkedin.com/company/molipar', 'social'),
('youtube', 'https://youtube.com/@molipar', 'social'),
('schedule', 'Lunes a Viernes: 8:00 - 18:00 hs | Sábados: 8:00 - 13:00 hs', 'contact'),
('hero_title', 'La calidad del trigo, el sabor de siempre', 'home'),
('hero_subtitle', 'Producimos harinas y fideos con los más altos estándares de calidad, llevando tradición y sabor a tu mesa.', 'home'),
('hero_cta_text', 'Conocé nuestros productos', 'home');
