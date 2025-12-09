-- Ankara Döner Koleksiyonu
-- Transaction start
BEGIN;

DO $$
DECLARE
    v_user_id uuid;
    v_ankara_id uuid;
    v_category_id uuid;
    v_collection_id uuid;
    v_place_id uuid;
BEGIN

    -- 1. Get User ID (temel.dev1@gmail.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'temel.dev1@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User temel.dev1@gmail.com not found';
    END IF;

    -- 2. Get Location ID (Ankara)
    SELECT id INTO v_ankara_id FROM public.locations WHERE slug = 'ankara' OR names->>'tr' = 'Ankara' LIMIT 1;
    
    IF v_ankara_id IS NULL THEN
        INSERT INTO public.locations (type, slug, names, has_districts)
        VALUES ('city', 'ankara', '{"tr": "Ankara", "en": "Ankara"}', true)
        RETURNING id INTO v_ankara_id;
        RAISE NOTICE 'Created missing location: Ankara';
    END IF;

    -- 3. Get Category ID (Döner - c5c571db-fe27-4c3c-acc7-7faaf3da55a4)
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'doner' LIMIT 1;

    IF v_category_id IS NULL THEN
        RAISE EXCEPTION 'Category doner not found';
    END IF;

    -- 4. Create Collection
    INSERT INTO public.collections (
        names,
        descriptions,
        slug,
        category_id,
        location_id,
        creator_id,
        status,
        vote_score,
        vote_count,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Ankara''nın Efsane Dönercileri", "en": "Legendary Döner Spots in Ankara"}'::jsonb,
        '{"tr": "Level 10 Local Guide gözünden Ankara dönerinin hakkını veren mekanlar. Kuyruk yağı dengesi muazzam, saat 15:00''e kalmadan biten efsaneler ve sanayi köşelerinde gizli kalmış lezzet durakları."}'::jsonb,
        'ankara-efsane-donerciler',
        v_category_id,
        v_ankara_id,
        v_user_id,
        'active',
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO v_collection_id;

    -- Place 1: Peçenek Döner (İskitler)
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Peçenek Döner"}'::jsonb,
        'pecenek-doner-iskitler-ankara',
        'İskitler, Ankara',
        v_ankara_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Pe%C3%A7enek+D%C3%B6ner+%C4%B0skitler+Ankara',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'pecenek-doner-iskitler-ankara';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        1,
        ARRAY['Porsiyon Döner', 'Ev Yapımı Turşu', 'Köpüklü Ayran']
    );

    -- Place 2: Mutlu Döner (Ayrancı)
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Mutlu Döner"}'::jsonb,
        'mutlu-doner-ayranci-ankara',
        'Ayrancı, Çankaya/Ankara',
        v_ankara_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Mutlu+D%C3%B6ner+Ayranc%C4%B1+Ankara',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'mutlu-doner-ayranci-ankara';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        2,
        ARRAY['Yaprak Döner', 'Tereyağlı Pilav Üstü Döner']
    );

    -- Place 3: Cici Piknik (Kızılay/Kumrular)
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Cici Piknik"}'::jsonb,
        'cici-piknik-kizilay-ankara',
        'Kumrular Sokak, Kızılay, Çankaya/Ankara',
        v_ankara_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Cici+Piknik+K%C4%B1z%C4%B1lay+Ankara',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'cici-piknik-kizilay-ankara';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        3,
        ARRAY['Kömürde Döner Sandviç', 'Açık Ayran']
    );

    -- Place 4: Azim Beşiktaş Döner (Ulus)
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Azim Beşiktaş Döner"}'::jsonb,
        'azim-besiktas-doner-ulus-ankara',
        'Ulus, Altındağ/Ankara',
        v_ankara_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Azim+Be%C5%9Fikta%C5%9F+D%C3%B6ner+Ulus+Ankara',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'azim-besiktas-doner-ulus-ankara';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        4,
        ARRAY['Yarım Ekmek Döner', 'Soğanlı Sumaklı Garnitür']
    );

    -- Place 5: Nazım Usta Hacıbayram Kebapçısı
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Nazım Usta Hacıbayram Kebapçısı"}'::jsonb,
        'nazim-usta-hacibayram-ankara',
        'Hacı Bayram Mahallesi, Altındağ/Ankara',
        v_ankara_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Naz%C4%B1m+Usta+Hac%C4%B1bayram+Kebap%C3%A7%C4%B1s%C4%B1+Ankara',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'nazim-usta-hacibayram-ankara';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        5,
        ARRAY['Pilav Üstü Döner', 'Özel Kıymalı Pide']
    );

    -- Place 6: 326 Antakya Dürüm (Esat)
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "326 Antakya Dürüm"}'::jsonb,
        '326-antakya-durum-esat-ankara',
        'Esat, Çankaya/Ankara',
        v_ankara_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=326+Antakya+D%C3%BCr%C3%BCm+Esat+Ankara',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = '326-antakya-durum-esat-ankara';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        6,
        ARRAY['Zurna Dürüm', 'Soslu Tavuk Döner']
    );

    -- Place 7: Sabaha Kadar Döner (Eryaman)
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Sabaha Kadar Döner"}'::jsonb,
        'sabaha-kadar-doner-eryaman-ankara',
        'Eryaman, Etimesgut/Ankara',
        v_ankara_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Sabaha+Kadar+D%C3%B6ner+Eryaman+Ankara',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'sabaha-kadar-doner-eryaman-ankara';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        7,
        ARRAY['Gece Döneri', 'Özel Baharatlı Ayran']
    );

    -- Place 8: Çankaya Lokantası (Hoşdere)
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Çankaya Lokantası"}'::jsonb,
        'cankaya-lokantasi-hosdere-ankara',
        'Hoşdere Caddesi, Çankaya/Ankara',
        v_ankara_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=%C3%87ankaya+Lokantas%C4%B1+Ho%C5%9Fdere+Ankara',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'cankaya-lokantasi-hosdere-ankara';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        8,
        ARRAY['Tırnak Pide Üzerinde Döner', 'Kemik Suyu Çorba']
    );

    -- Place 9: Gözüm Döner (Macun/Yenimahalle)
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Gözüm Döner"}'::jsonb,
        'gozum-doner-macun-ankara',
        'Macun Mahallesi, Yenimahalle/Ankara',
        v_ankara_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=G%C3%B6z%C3%BCm+D%C3%B6ner+Macun+Ankara',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'gozum-doner-macun-ankara';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        9,
        ARRAY['Gobit Ekmek Arası Döner']
    );

    -- Place 10: Osman Usta (Kale)
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Osman Usta"}'::jsonb,
        'osman-usta-kale-ankara',
        'Ankara Kalesi, Altındağ/Ankara',
        v_ankara_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Osman+Usta+Kale+Ankara',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'osman-usta-kale-ankara';
    END IF;

    INSERT INTO public.collection_places (
        collection_id,
        place_id,
        display_order,
        famous_items
    ) VALUES (
        v_collection_id,
        v_place_id,
        10,
        ARRAY['Porsiyon Döner', 'Çoban Salata']
    );

    RAISE NOTICE 'Collection created successfully with 10 places!';

END $$;

COMMIT;
