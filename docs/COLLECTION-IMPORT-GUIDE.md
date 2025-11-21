# Collection Import Guide

Bu rehber, yeni koleksiyonları veritabanına nasıl ekleyeceğinizi açıklar.

## Yöntem 1: SQL Editor ile Import (Önerilen)

Supabase SQL Editor'de doğrudan SQL ile koleksiyon ekleyebilirsiniz.

### SQL Template

```sql
DO $$
DECLARE
  -- JSON VERİSİ
  v_json_data JSONB := '{
    "collection": {
      "name": "Koleksiyon Adı",
      "description": "Koleksiyon açıklaması",
      "cityName": "Adana",
      "categorySlug": "doner"
    },
    "places": [
      {
        "name": "Mekan Adı 1",
        "address": "Tam adres",
        "description": "Mekan açıklaması",
        "recommendedItems": ["Ürün 1", "Ürün 2", "Ürün 3"]
      },
      {
        "name": "Mekan Adı 2",
        "address": "Tam adres",
        "description": "Mekan açıklaması",
        "recommendedItems": ["Ürün 1", "Ürün 2"]
      }
    ]
  }';

  -- DEĞİŞKENLER
  v_user_id UUID := 'KULLANICI_ID_BURAYA'; -- users tablosundan alın
  v_city_id UUID;
  v_category_id UUID;
  v_collection_id UUID;
  v_place_id UUID;
  v_collection_slug TEXT;
  v_place_rec JSONB;
  v_items_array TEXT[];
  v_order INTEGER := 0;

BEGIN
  -- Şehir ID Bul
  SELECT id INTO v_city_id
  FROM locations
  WHERE names->>'tr' ILIKE (v_json_data->'collection'->>'cityName')
    AND type = 'city'
  LIMIT 1;

  IF v_city_id IS NULL THEN
    RAISE EXCEPTION 'Şehir bulunamadı!';
  END IF;

  -- Kategori ID Bul
  SELECT id INTO v_category_id
  FROM categories
  WHERE slug = (v_json_data->'collection'->>'categorySlug')
  LIMIT 1;

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'Kategori bulunamadı!';
  END IF;

  -- Koleksiyon Oluştur
  v_collection_slug := lower(regexp_replace(
    left(v_json_data->'collection'->>'name', 30),
    '\s+', '-', 'g'
  )) || '-' || substr(md5(random()::text), 1, 4);

  INSERT INTO collections (
    slug, names, descriptions, creator_id, location_id, category_id, status
  ) VALUES (
    v_collection_slug,
    jsonb_build_object('tr', v_json_data->'collection'->>'name', 'en', v_json_data->'collection'->>'name'),
    jsonb_build_object('tr', v_json_data->'collection'->>'description', 'en', v_json_data->'collection'->>'description'),
    v_user_id,
    v_city_id,
    v_category_id,
    'active'
  ) RETURNING id INTO v_collection_id;

  RAISE NOTICE 'Koleksiyon oluşturuldu: %', v_collection_slug;

  -- Mekanları Ekle
  FOR v_place_rec IN SELECT * FROM jsonb_array_elements(v_json_data->'places')
  LOOP
    -- Mekan var mı kontrol et
    SELECT id INTO v_place_id
    FROM places
    WHERE names->>'tr' ILIKE (v_place_rec->>'name')
      AND location_id = v_city_id
    LIMIT 1;

    IF v_place_id IS NULL THEN
      -- Yeni mekan oluştur
      INSERT INTO places (
        slug, names, descriptions, address, location_id, category_id, status, vote_count, vote_score
      ) VALUES (
        lower(regexp_replace(left(v_place_rec->>'name', 20), '\s+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 4),
        jsonb_build_object('tr', v_place_rec->>'name', 'en', v_place_rec->>'name'),
        jsonb_build_object('tr', v_place_rec->>'description', 'en', v_place_rec->>'description'),
        v_place_rec->>'address',
        v_city_id,
        v_category_id,
        'approved',
        0, 0
      ) RETURNING id INTO v_place_id;
      RAISE NOTICE 'Yeni mekan: %', v_place_rec->>'name';
    ELSE
      RAISE NOTICE 'Mevcut mekan: %', v_place_rec->>'name';
    END IF;

    -- JSON array'i PostgreSQL array'e çevir
    SELECT array_agg(x) INTO v_items_array
    FROM jsonb_array_elements_text(v_place_rec->'recommendedItems') t(x);

    -- Koleksiyona bağla
    INSERT INTO collection_places (
      collection_id, place_id, display_order, curator_note, recommended_items
    ) VALUES (
      v_collection_id,
      v_place_id,
      v_order,
      v_place_rec->>'description',
      v_items_array
    );

    v_order := v_order + 1;
  END LOOP;

  RAISE NOTICE '✅ Tamamlandı! Slug: %', v_collection_slug;
END $$;
```

### Kullanıcı ID Bulma

```sql
SELECT id, username, email FROM users LIMIT 10;
```

### Mevcut Kategoriler

```sql
SELECT slug, names->>'tr' as name FROM categories ORDER BY display_order;
```

Yaygın kategori slug'ları:
- `yemek` - Genel yemek
- `kebap-ocakbasi` - Kebap & Ocakbaşı
- `doner` - Döner
- `pide-lahmacun` - Pide & Lahmacun
- `kafe` - Kafe
- `bar` - Bar

### Mevcut Şehirler

```sql
SELECT names->>'tr' as name FROM locations WHERE type = 'city' ORDER BY names->>'tr';
```

---

## Yöntem 2: TypeScript Script ile Import

Daha karmaşık import'lar için TypeScript script kullanabilirsiniz.

### 1. JSON Dosyası Oluştur

`lib/data/koleksiyon-adi.json`:

```json
{
  "collection": {
    "name": "Koleksiyon Adı",
    "description": "Açıklama",
    "cityName": "Şehir",
    "categorySlug": "kategori-slug"
  },
  "places": [
    {
      "name": "Mekan 1",
      "address": "Adres",
      "description": "Açıklama",
      "recommendedItems": ["Ürün 1", "Ürün 2"]
    }
  ]
}
```

### 2. Import Script Oluştur

`scripts/import-koleksiyon.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const DATA_FILE = 'lib/data/koleksiyon-adi.json';
const TARGET_USER_ID = 'kullanici-uuid'; // Değiştirin!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

function generateSlug(text: string): string {
  const trMap: { [key: string]: string } = {
    ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u',
    Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u',
  };
  return text
    .split('')
    .map((char) => trMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function importCollection() {
  // JSON oku
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const { collection, places } = data;

  // Şehir bul
  const { data: city } = await supabase
    .from('locations')
    .select('id')
    .ilike('names->>tr', collection.cityName)
    .eq('type', 'city')
    .single();

  // Kategori bul
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', collection.categorySlug)
    .single();

  // Koleksiyon oluştur
  const { data: newCollection } = await supabase
    .from('collections')
    .insert({
      slug: generateSlug(collection.name) + '-' + Math.random().toString(36).substring(2, 6),
      names: { tr: collection.name, en: collection.name },
      descriptions: { tr: collection.description, en: collection.description },
      creator_id: TARGET_USER_ID,
      location_id: city.id,
      category_id: category.id,
      status: 'active',
    })
    .select()
    .single();

  // Mekanları ekle
  for (let i = 0; i < places.length; i++) {
    const p = places[i];

    // Mekan var mı kontrol et
    let { data: existing } = await supabase
      .from('places')
      .select('id')
      .ilike('names->>tr', p.name)
      .eq('location_id', city.id);

    let placeId;
    if (existing?.length) {
      placeId = existing[0].id;
    } else {
      const { data: newPlace } = await supabase
        .from('places')
        .insert({
          slug: generateSlug(p.name) + '-' + Math.random().toString(36).substring(2, 6),
          names: { tr: p.name, en: p.name },
          descriptions: { tr: p.description, en: p.description },
          address: p.address,
          location_id: city.id,
          category_id: category.id,
          status: 'approved',
        })
        .select()
        .single();
      placeId = newPlace.id;
    }

    // Koleksiyona bağla
    await supabase.from('collection_places').insert({
      collection_id: newCollection.id,
      place_id: placeId,
      display_order: i,
      curator_note: p.description,
      recommended_items: p.recommendedItems || [],
    });
  }

  console.log('Tamamlandı:', newCollection.slug);
}

importCollection();
```

### 3. Script'i Çalıştır

```bash
npx tsx scripts/import-koleksiyon.ts
```

---

## Örnek Veriler

### Döner Koleksiyonu

```json
{
  "collection": {
    "name": "Şehrin En İyi Dönercileri",
    "description": "Yerel halkın favori döner mekanları",
    "cityName": "Adana",
    "categorySlug": "doner"
  },
  "places": [
    {
      "name": "Mekan Adı",
      "address": "Mahalle, Sokak No, İlçe/Şehir",
      "description": "Mekanın öne çıkan özelliği",
      "recommendedItems": ["Et Döner", "Tavuk Döner", "İskender"]
    }
  ]
}
```

### Kebap Koleksiyonu

```json
{
  "collection": {
    "name": "Şehrin Efsane Kebapçıları",
    "description": "Kuşaktan kuşağa aktarılan lezzet sırları",
    "cityName": "Adana",
    "categorySlug": "kebap-ocakbasi"
  },
  "places": [
    {
      "name": "Kebapçı Adı",
      "address": "Adres",
      "description": "Açıklama",
      "recommendedItems": ["Adana Kebap", "Urfa Kebap", "Beyti"]
    }
  ]
}
```

---

## İpuçları

1. **Duplicate Kontrolü**: Script'ler aynı isimli mekanı tekrar oluşturmaz, mevcut olanı kullanır.

2. **Slug Benzersizliği**: Slug'lara otomatik random suffix eklenir.

3. **Kategori Fallback**: Kategori bulunamazsa alternatif deneyin (örn: `doner` yoksa `kebap-ocakbasi`).

4. **Test Önce Dev'de**: Production'a eklemeden önce development veritabanında test edin.

5. **Kullanıcı ID**: Koleksiyon sahibi olacak kullanıcının ID'sini doğru girdiğinizden emin olun.
