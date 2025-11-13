-- Insert categories
INSERT INTO categories (slug, names, icon, display_order) VALUES
  ('restaurants', '{"en": "Restaurants", "tr": "Restoranlar", "es": "Restaurantes"}', 'utensils', 1),
  ('cafes', '{"en": "Cafes", "tr": "Kafeler", "es": "Cafeterías"}', 'coffee', 2),
  ('bars', '{"en": "Bars & Pubs", "tr": "Barlar", "es": "Bares"}', 'beer', 3),
  ('desserts', '{"en": "Desserts", "tr": "Tatlılar", "es": "Postres"}', 'ice-cream', 4),
  ('street-food', '{"en": "Street Food", "tr": "Sokak Lezzetleri", "es": "Comida Callejera"}', 'truck', 5),
  ('bakery', '{"en": "Bakery", "tr": "Fırın & Pastane", "es": "Panadería"}', 'croissant', 6);

-- Insert Turkey as country
INSERT INTO locations (type, slug, names, path, has_districts, latitude, longitude) VALUES
  ('country', 'turkey', '{"en": "Turkey", "tr": "Türkiye", "es": "Turquía"}', '/turkey', false, 38.9637, 35.2433);

-- Get Turkey ID for reference
DO $$
DECLARE
  turkey_id UUID;
BEGIN
  SELECT id INTO turkey_id FROM locations WHERE slug = 'turkey' AND type = 'country';

  -- Insert major Turkish cities

  -- Istanbul (with districts)
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'istanbul', '{"en": "Istanbul", "tr": "İstanbul", "es": "Estambul"}', '/turkey/istanbul', true, 41.0082, 28.9784);

  DECLARE istanbul_id UUID;
  BEGIN
    SELECT id INTO istanbul_id FROM locations WHERE slug = 'istanbul' AND type = 'city';

    -- Istanbul districts
    INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
      (istanbul_id, 'district', 'kadikoy', '{"en": "Kadikoy", "tr": "Kadıköy", "es": "Kadikoy"}', '/turkey/istanbul/kadikoy', false, 40.9904, 29.0254),
      (istanbul_id, 'district', 'besiktas', '{"en": "Besiktas", "tr": "Beşiktaş", "es": "Besiktas"}', '/turkey/istanbul/besiktas', false, 41.0422, 29.0092),
      (istanbul_id, 'district', 'beyoglu', '{"en": "Beyoglu", "tr": "Beyoğlu", "es": "Beyoglu"}', '/turkey/istanbul/beyoglu', false, 41.0351, 28.9770),
      (istanbul_id, 'district', 'sisli', '{"en": "Sisli", "tr": "Şişli", "es": "Sisli"}', '/turkey/istanbul/sisli', false, 41.0602, 28.9871),
      (istanbul_id, 'district', 'uskudar', '{"en": "Uskudar", "tr": "Üsküdar", "es": "Uskudar"}', '/turkey/istanbul/uskudar', false, 41.0226, 29.0200),
      (istanbul_id, 'district', 'bakirkoy', '{"en": "Bakirkoy", "tr": "Bakırköy", "es": "Bakirkoy"}', '/turkey/istanbul/bakirkoy', false, 40.9817, 28.8739),
      (istanbul_id, 'district', 'fatih', '{"en": "Fatih", "tr": "Fatih", "es": "Fatih"}', '/turkey/istanbul/fatih', false, 41.0195, 28.9493);
  END;

  -- Ankara
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'ankara', '{"en": "Ankara", "tr": "Ankara", "es": "Ankara"}', '/turkey/ankara', false, 39.9334, 32.8597);

  -- Izmir
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'izmir', '{"en": "Izmir", "tr": "İzmir", "es": "Esmirna"}', '/turkey/izmir', false, 38.4237, 27.1428);

  -- Antalya
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'antalya', '{"en": "Antalya", "tr": "Antalya", "es": "Antalya"}', '/turkey/antalya', false, 36.8969, 30.7133);

  -- Bursa
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'bursa', '{"en": "Bursa", "tr": "Bursa", "es": "Bursa"}', '/turkey/bursa', false, 40.1826, 29.0665);

  -- Adana
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'adana', '{"en": "Adana", "tr": "Adana", "es": "Adana"}', '/turkey/adana', false, 37.0000, 35.3213);

  -- Gaziantep
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'gaziantep', '{"en": "Gaziantep", "tr": "Gaziantep", "es": "Gaziantep"}', '/turkey/gaziantep', false, 37.0662, 37.3833);

  -- Konya
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'konya', '{"en": "Konya", "tr": "Konya", "es": "Konya"}', '/turkey/konya', false, 37.8746, 32.4932);

  -- Trabzon
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'trabzon', '{"en": "Trabzon", "tr": "Trabzon", "es": "Trebisonda"}', '/turkey/trabzon', false, 41.0015, 39.7178);

  -- Bodrum
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'bodrum', '{"en": "Bodrum", "tr": "Bodrum", "es": "Bodrum"}', '/turkey/bodrum', false, 37.0344, 27.4305);

END $$;
