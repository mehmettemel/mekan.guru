-- Transaction start
BEGIN;

DO $$
DECLARE
    -- DEĞİŞTİRİLECEK ALAN: Silinecek kullanıcının e-posta adresi
    v_user_email text := 'silinecek_email@example.com'; 
    v_user_id uuid;
BEGIN
    -- 1. Kullanıcı ID'sini bul
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Kullanıcı bulunamadı: %', v_user_email;
        RETURN;
    END IF;

    RAISE NOTICE 'Kullanıcı siliniyor: % (ID: %)', v_user_email, v_user_id;

    -- 2. İlişkili verileri sil (Foreign Key sırasına dikkat ederek)

    -- User Preferences
    DELETE FROM public.user_preferences WHERE user_id = v_user_id;
    
    -- User Follows (Takipçi ve Takip edilen kayıtları)
    DELETE FROM public.user_follows WHERE follower_id = v_user_id OR following_id = v_user_id;
    
    -- Collection Votes (Kullanıcının verdiği oylar)
    DELETE FROM public.collection_votes WHERE user_id = v_user_id;
    
    -- Place Votes (Mekan oyları)
    DELETE FROM public.votes WHERE user_id = v_user_id;
    
    -- Reports (Kullanıcının oluşturduğu raporlar)
    DELETE FROM public.reports WHERE user_id = v_user_id;
    
    -- Collections (Kullanıcının oluşturduğu koleksiyonlar)
    -- Önce bu koleksiyonlara ait alt verileri temizle
    DELETE FROM public.collection_places 
    WHERE collection_id IN (SELECT id FROM public.collections WHERE creator_id = v_user_id);
    
    DELETE FROM public.collection_votes 
    WHERE collection_id IN (SELECT id FROM public.collections WHERE creator_id = v_user_id);
    
    DELETE FROM public.collections WHERE creator_id = v_user_id;

    -- Places (Mekanlar)
    -- Kullanıcının eklediği veya onayladığı mekanları silmiyoruz, sadece referansı kaldırıyoruz.
    UPDATE public.places SET submitted_by = NULL WHERE submitted_by = v_user_id::text;
    UPDATE public.places SET approved_by = NULL WHERE approved_by = v_user_id::text;

    -- Reports (Resolved by)
    UPDATE public.reports SET resolved_by = NULL WHERE resolved_by = v_user_id::text;

    -- 3. Public Users tablosundan sil
    DELETE FROM public.users WHERE id = v_user_id;

    -- 4. Auth Users tablosundan sil (En son)
    DELETE FROM auth.users WHERE id = v_user_id;

    RAISE NOTICE 'Kullanıcı ve ilişkili tüm veriler başarıyla silindi.';
END $$;

COMMIT;
