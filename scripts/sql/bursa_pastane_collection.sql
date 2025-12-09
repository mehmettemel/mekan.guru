-- Bursa Hamur İşi ve Tatlı Koleksiyonu
-- Transaction start
BEGIN;

DO $$
DECLARE
    v_user_id uuid;
    v_bursa_id uuid;
    v_category_id uuid;
    v_collection_id uuid;
    v_place_id uuid;
BEGIN

    -- 1. Get User ID (temel.dev1@gmail.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'temel.dev1@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User temel.dev1@gmail.com not found';
    END IF;

    -- 2. Get Location ID (Bursa)
    SELECT id INTO v_bursa_id FROM public.locations WHERE slug = 'bursa' OR names->>'tr' = 'Bursa' LIMIT 1;
    
    IF v_bursa_id IS NULL THEN
        INSERT INTO public.locations (type, slug, names, has_districts)
        VALUES ('city', 'bursa', '{"tr": "Bursa", "en": "Bursa"}', true)
        RETURNING id INTO v_bursa_id;
        RAISE NOTICE 'Created missing location: Bursa';
    END IF;

    -- 3. Get Category ID (Pastane & Fırın - 6e2fd0aa-2173-44e9-b4af-94a315331e39)
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'pastane' LIMIT 1;

    IF v_category_id IS NULL THEN
        RAISE EXCEPTION 'Category pastane not found';
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
        '{"tr": "Bursa''nın Efsane Fırın ve Pastahaneleri", "en": "Legendary Bakeries and Patisseries in Bursa"}'::jsonb,
        '{"tr": "Level 10 Local Guide gözünden Bursa''nın hamur işi ve tatlı kültürünün en özel durakları. Tahinli pideden ekşi mayalı ekmeğe, kestane şekerinden pastaların en iyilerine."}'::jsonb,
        'bursa-efsane-firin-pastane',
        v_category_id,
        v_bursa_id,
        v_user_id,
        'active',
        0,
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO v_collection_id;

    -- Place 1: Abdal Simit Fırını (Tuzpazarı)
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
        '{"tr": "Abdal Simit Fırını"}'::jsonb,
        'abdal-simit-firini-tuzpazari-bursa',
        'Tuzpazarı, Osmangazi/Bursa',
        v_bursa_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Abdal+Simit+F%C4%B1r%C4%B1n%C4%B1+Tuzpazar%C4%B1+Bursa',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'abdal-simit-firini-tuzpazari-bursa';
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
        ARRAY['Tarihi Taş Fırın Simidi', 'Tahinli Pide']
    );

    -- Place 2: Tarihi Taş Fırın Gürsel Kavan (Tuzpazarı)
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
        '{"tr": "Tarihi Taş Fırın Gürsel Kavan"}'::jsonb,
        'tarihi-tas-firin-gursel-kavan-bursa',
        'Tuzpazarı, Osmangazi/Bursa',
        v_bursa_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Tarihi+Ta%C5%9F+F%C4%B1r%C4%B1n+G%C3%BCrsel+Kavan+Bursa',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'tarihi-tas-firin-gursel-kavan-bursa';
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
        ARRAY['Bol Tahinli ve Şekerli Pide', 'Tahanlı']
    );

    -- Place 3: Pasto (Akpınar)
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
        '{"tr": "Pasto"}'::jsonb,
        'pasto-akpinar-bursa',
        'Akpınar, Osmangazi/Bursa',
        v_bursa_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Pasto+Akp%C4%B1nar+Bursa',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'pasto-akpinar-bursa';
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
        ARRAY['Ekşi Mayalı Köy Ekmeği', 'Kruvasan Çeşitleri', 'Vişneli Ekmek']
    );

    -- Place 4: Uzay Pastanesi (FSM Bulvarı)
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
        '{"tr": "Uzay Pastanesi"}'::jsonb,
        'uzay-pastanesi-fsm-bursa',
        'Fatih Sultan Mehmet Bulvarı, Osmangazi/Bursa',
        v_bursa_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=Uzay+Pastanesi+FSM+Bursa',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'uzay-pastanesi-fsm-bursa';
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
        ARRAY['Polonez Pasta', 'Çilekli Spesiyaller', 'Dondurma']
    );

    -- Place 5: Ülkü Pastanesi (İhsaniye)
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
        '{"tr": "Ülkü Pastanesi"}'::jsonb,
        'ulku-pastanesi-ihsaniye-bursa',
        'İhsaniye, Osmangazi/Bursa',
        v_bursa_id,
        v_category_id,
        'https://www.google.com/maps/search/?api=1&query=%C3%9Clk%C3%BC+Pastanesi+%C4%B0hsaniye+Bursa',
        'approved',
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_place_id;

    IF v_place_id IS NULL THEN
        SELECT id INTO v_place_id FROM public.places WHERE slug = 'ulku-pastanesi-ihsaniye-bursa';
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
        ARRAY['Kestane Şekeri', 'Ekler', 'Tuzlu Kuru Pastalar']
    );

    RAISE NOTICE 'Collection created successfully with 5 places!';

END $$;

COMMIT;
