-- Insert categories
INSERT INTO categories (slug, names, icon, display_order) VALUES
  ('restaurant', '{"en": "Restaurant", "tr": "Restoran"}', 'utensils', 1),
  ('cafe', '{"en": "Cafe", "tr": "Kafe"}', 'coffee', 2),
  ('bar', '{"en": "Bar & Pub", "tr": "Bar & Pub"}', 'beer', 3),
  ('dessert', '{"en": "Dessert", "tr": "Tatlı"}', 'ice-cream', 4),
  ('street-food', '{"en": "Street Food", "tr": "Sokak Lezzetleri"}', 'truck', 5),
  ('bakery', '{"en": "Bakery", "tr": "Fırın & Pastane"}', 'croissant', 6);

-- Insert Turkey as country
INSERT INTO locations (type, slug, names, path, has_districts, latitude, longitude) VALUES
  ('country', 'turkey', '{"en": "Turkey", "tr": "Türkiye"}', '/turkey', false, 38.9637, 35.2433);

-- Get Turkey ID for reference
DO $$
DECLARE
  turkey_id UUID;
BEGIN
  SELECT id INTO turkey_id FROM locations WHERE slug = 'turkey' AND type = 'country';

  -- Insert major Turkish cities

  -- Istanbul (with districts)
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'istanbul', '{"en": "Istanbul", "tr": "İstanbul"}', '/turkey/istanbul', true, 41.0082, 28.9784);

  DECLARE istanbul_id UUID;
  BEGIN
    SELECT id INTO istanbul_id FROM locations WHERE slug = 'istanbul' AND type = 'city';

    -- Istanbul districts
    INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
      (istanbul_id, 'district', 'kadikoy', '{"en": "Kadikoy", "tr": "Kadıköy"}', '/turkey/istanbul/kadikoy', false, 40.9904, 29.0254),
      (istanbul_id, 'district', 'besiktas', '{"en": "Besiktas", "tr": "Beşiktaş"}', '/turkey/istanbul/besiktas', false, 41.0422, 29.0092),
      (istanbul_id, 'district', 'beyoglu', '{"en": "Beyoglu", "tr": "Beyoğlu"}', '/turkey/istanbul/beyoglu', false, 41.0351, 28.9770),
      (istanbul_id, 'district', 'sisli', '{"en": "Sisli", "tr": "Şişli"}', '/turkey/istanbul/sisli', false, 41.0602, 28.9871),
      (istanbul_id, 'district', 'uskudar', '{"en": "Uskudar", "tr": "Üsküdar"}', '/turkey/istanbul/uskudar', false, 41.0226, 29.0200),
      (istanbul_id, 'district', 'bakirkoy', '{"en": "Bakirkoy", "tr": "Bakırköy"}', '/turkey/istanbul/bakirkoy', false, 40.9817, 28.8739),
      (istanbul_id, 'district', 'fatih', '{"en": "Fatih", "tr": "Fatih"}', '/turkey/istanbul/fatih', false, 41.0195, 28.9493);
  END;

  -- Ankara
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'ankara', '{"en": "Ankara", "tr": "Ankara"}', '/turkey/ankara', false, 39.9334, 32.8597);

  -- Izmir
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'izmir', '{"en": "Izmir", "tr": "İzmir"}', '/turkey/izmir', false, 38.4237, 27.1428);

  -- Antalya
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'antalya', '{"en": "Antalya", "tr": "Antalya"}', '/turkey/antalya', false, 36.8969, 30.7133);

  -- Bursa
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'bursa', '{"en": "Bursa", "tr": "Bursa"}', '/turkey/bursa', false, 40.1826, 29.0665);

  -- Adana
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'adana', '{"en": "Adana", "tr": "Adana"}', '/turkey/adana', false, 37.0000, 35.3213);

  -- Gaziantep
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'gaziantep', '{"en": "Gaziantep", "tr": "Gaziantep"}', '/turkey/gaziantep', false, 37.0662, 37.3833);

  -- Konya
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'konya', '{"en": "Konya", "tr": "Konya"}', '/turkey/konya', false, 37.8746, 32.4932);

  -- Trabzon
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'trabzon', '{"en": "Trabzon", "tr": "Trabzon"}', '/turkey/trabzon', false, 41.0015, 39.7178);

  -- Bodrum
  INSERT INTO locations (parent_id, type, slug, names, path, has_districts, latitude, longitude) VALUES
    (turkey_id, 'city', 'bodrum', '{"en": "Bodrum", "tr": "Bodrum"}', '/turkey/bodrum', false, 37.0344, 27.4305);

END $$;
