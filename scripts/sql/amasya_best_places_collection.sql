-- Transaction start
BEGIN;

-- Variables for IDs
DO $$
DECLARE
    v_user_id uuid;
    v_amasya_id uuid;
    v_category_id uuid;
    v_collection_id uuid;
    v_place_id uuid;
BEGIN

    -- 1. Get User ID (temel.dev1@gmail.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'temel.dev1@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User temel.dev1@gmail.com not found';
    END IF;

    -- 2. Get or Create Location ID (Amasya)
    SELECT id INTO v_amasya_id FROM public.locations WHERE slug = 'amasya' OR names->>'tr' = 'Amasya' LIMIT 1;
    
    IF v_amasya_id IS NULL THEN
        INSERT INTO public.locations (type, slug, names, has_districts)
        VALUES ('city', 'amasya', '{"tr": "Amasya", "en": "Amasya"}', false)
        RETURNING id INTO v_amasya_id;
        RAISE NOTICE 'Created missing location: Amasya';
    END IF;

    -- 3. Get Category ID (Genel / General)
    -- Using 'genel' because the list contains mixed types (Mantı, Local Cuisine, Burger, Kebab, Bistro)
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'genel' LIMIT 1;

    IF v_category_id IS NULL THEN
         RAISE EXCEPTION 'Category Genel not found';
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
        '{"tr": "Amasya''nın En İyi Mekanları", "en": "Best Places in Amasya"}'::jsonb,
        '{"tr": "Amasya''nın tarihi dokusunda lezzet turu. Yöresel Amasya mutfağından modern lezzetlere, manzaralı bistrolardan otantik konaklara kadar şehrin en iyileri.", "en": "A culinary tour in the historical texture of Amasya. From local Amasya cuisine to modern tastes, from bistros with views to authentic mansions, the best of the city."}'::jsonb,
        'amasya-en-iyi-mekanlar',
        v_category_id,
        v_amasya_id,
        v_user_id,
        'active',
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO v_collection_id;

    -- 5. Insert Places and Link to Collection

    -- Place 1: Amasya Anadolu Mantı Evi
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        vote_count,
        vote_score,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Amasya Anadolu Mantı Evi"}'::jsonb,
        'amasya-anadolu-manti-evi',
        'Hatuniye, Hazeranlar Sk. No:57, 05100 Amasya Merkez/Amasya',
        v_amasya_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Amasya+Anadolu+Manti+Evi',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'amasya-anadolu-manti-evi';
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
        ARRAY['Sinop Mantısı', 'Amasya Mantısı', 'Ev Yapımı Limonata']
    );

    -- Place 2: Amaseia Mutfağı (Fatih Yağcı)
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        vote_count,
        vote_score,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Amaseia Mutfağı (Fatih Yağcı)"}'::jsonb,
        'amaseia-mutfagi-fatih-yagci',
        'Hatuniye, Hazeranlar Sk. No:3, 05100 Amasya Merkez/Amasya',
        v_amasya_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Amaseia+Mutfagi+Fatih+Yagci',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'amaseia-mutfagi-fatih-yagci';
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
        ARRAY['Yöresel Keşkek', 'Etli Bamya Çorbası', 'Bakla Dolması']
    );

    -- Place 3: Meat Works Amasya
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        vote_count,
        vote_score,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Meat Works Amasya"}'::jsonb,
        'meat-works-amasya',
        'Hızırpaşa Mah, Kazım Karabekir, Aşık Paşa Sk. No: 17 D:1A, 05100 Amasya Merkez',
        v_amasya_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Meat+Works+Amasya',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'meat-works-amasya';
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
        ARRAY['Lokum Burger', 'Antrikot', 'Steak Çeşitleri']
    );

    -- Place 4: Küçükağa Restaurant
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        vote_count,
        vote_score,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Küçükağa Restaurant"}'::jsonb,
        'kucukaga-restaurant-amasya',
        'Şamlar, Zübeyde Hanım Cd. No:25, 05200 Amasya Merkez/Amasya',
        v_amasya_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Kucukaga+Restaurant+Amasya',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'kucukaga-restaurant-amasya';
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
        ARRAY['Kiremitte Köfte', 'Karışık Pide', 'Amasya Kebabı']
    );

    -- Place 5: Yamaç Bistro
    INSERT INTO public.places (
        names,
        slug,
        address,
        location_id,
        category_id,
        google_maps_url,
        status,
        vote_count,
        vote_score,
        created_at,
        updated_at
    ) VALUES (
        '{"tr": "Yamaç Bistro"}'::jsonb,
        'yamac-bistro-amasya',
        'Çakallar, Merkez, Çakallar Cd. No:131, 05100 Amasya Merkez/Amasya',
        v_amasya_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Yamac+Bistro+Amasya',
        'approved',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'yamac-bistro-amasya';
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
        ARRAY['Serpme Kahvaltı', 'Köri Soslu Tavuk']
    );

END $$;

COMMIT;
