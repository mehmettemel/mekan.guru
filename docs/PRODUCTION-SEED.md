# Production Database Seeding Guide

Bu rehber production (üretim) ortamında veritabanını güncelleme adımlarını açıklar.

## 🚨 Önemli Uyarılar

- **Backup alın**: Production seed çalıştırmadan önce mutlaka database backup alın
- **Test edin**: Önce local/staging ortamda test edin
- **Downtime**: Seed sırasında database değişiklikleri olacaktır

## 📋 Ne Yapılacak?

Production seed script şunları yapacak:

1. ✅ Eski/kullanılmayan kategorileri sil
2. ✅ Yeni flat kategori yapısına güncelle (23 kategori, hiyerarşi yok)
3. ✅ 81 Türkiye şehrinin tamamını ekle/kontrol et
4. ✅ Mevcut verileri koru (mekanlar, koleksiyonlar, oylar, vb.)

## 🔧 Kurulum Adımları

### 1. Environment Variables

`.env.production` dosyanızda şu değişkenlerin olduğundan emin olun:

```bash
# Production Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=your_production_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

### 2. Local Test (Önce!)

Production'a gitmeden önce local ortamda test edin:

```bash
npm run seed
```

### 3. Production Seed

#### Yöntem 1: npm script ile (önerilen)

```bash
npm run seed:production
```

Script size onay isteyecektir:

```
🚨 PRODUCTION DATABASE SEEDING 🚨

Environment file: /path/to/.env.production
Supabase URL: https://your-project.supabase.co

⚠️  WARNING: This will modify the PRODUCTION database!
This script will:
  1. Delete old/unused categories
  2. Update to flat category structure (23 categories at same level)
  3. Ensure all 81 Turkish cities are present
  4. Keep existing data (places, collections, etc.)

Are you sure you want to continue? (yes/no):
```

`yes` yazıp Enter'a basın.

#### Yöntem 2: Manuel çalıştırma

```bash
DOTENV_CONFIG_PATH=.env.production npx tsx scripts/seed-production.ts
```

## 📊 Değişiklikler

### Kategori Yapısı

**Eski Yapı** (5 ana + 22 alt kategori):
```
- Yemek (parent)
  - Kebap & Ocakbaşı (child)
  - Esnaf Lokantası (child)
  - ...
- Kafe (parent)
  - Nitelikli Kahve (child)
  - ...
```

**Yeni Yapı** (23 kategori, tümü eşit seviyede):
```
- Kebap & Ocakbaşı (display_order: 1)
- Esnaf Lokantası (display_order: 2)
- Döner (display_order: 3)
- Pide & Lahmacun (display_order: 4)
- Burger (display_order: 5)
- Sokak Lezzetleri (display_order: 6)
- Çorbacı (display_order: 7)
- Kahvaltı & Börek (display_order: 8)
- Balık & Deniz Ürünleri (display_order: 9)
- Dünya Mutfağı (display_order: 10)
- Nitelikli Kahve (display_order: 11)
- Türk Kahvesi & Çay (display_order: 12)
- Kitap Kafe (display_order: 13)
- Çalışma Dostu (display_order: 14)
- Pub & Bar (display_order: 15)
- Meyhane (display_order: 16)
- Şarap Evi (display_order: 17)
- Kokteyl Bar (display_order: 18)
- Baklava & Şerbetli (display_order: 19)
- Pastane & Fırın (display_order: 20)
- Dondurma (display_order: 21)
- Çikolatacı (display_order: 22)
- Genel / Diğer (display_order: 99)
```

### Şehirler

Türkiye'nin 81 şehrinin tamamı eklenecek/kontrol edilecek.

## 🔍 Seed Sonrası Kontroller

1. **Kategori sayısını kontrol edin**:
   ```sql
   SELECT COUNT(*) FROM categories;
   -- Sonuç: 23 olmalı
   ```

2. **Parent-child ilişkisini kontrol edin**:
   ```sql
   SELECT COUNT(*) FROM categories WHERE parent_id IS NOT NULL;
   -- Sonuç: 0 olmalı (artık flat yapı)
   ```

3. **Şehir sayısını kontrol edin**:
   ```sql
   SELECT COUNT(*) FROM locations WHERE type = 'city';
   -- Sonuç: 81 olmalı
   ```

4. **Mevcut verilerin korunduğunu kontrol edin**:
   ```sql
   SELECT COUNT(*) FROM places;
   SELECT COUNT(*) FROM collections;
   SELECT COUNT(*) FROM votes;
   -- Sayılar değişmemeli
   ```

## ❗ Sorun Giderme

### "Missing environment variables" hatası

`.env.production` dosyasının doğru yolda olduğundan ve içinde gerekli değişkenlerin olduğundan emin olun.

### "Permission denied" hatası

`SUPABASE_SERVICE_ROLE_KEY` kullandığınızdan emin olun (anon key değil).

### Script askıda kalıyor

Seed script onay bekliyor olabilir. Terminal'de `yes` yazıp Enter'a basın.

## 🔄 Rollback (Geri Alma)

Bir sorun olursa:

1. **Backup'tan geri yükleyin**: Önceden aldığınız backup'ı restore edin
2. **Manuel cleanup**: Gerekirse yeni eklenen kategorileri manuel silin

## 📞 Destek

Herhangi bir sorun yaşarsanız:
- Seed logs'ları kontrol edin
- Supabase dashboard'tan database durumunu kontrol edin
- Gerekirse development ekibiyle iletişime geçin

## ✅ Tamamlandı!

Seed başarılı bir şekilde tamamlandıysa:

```
🎉 Database seeding completed successfully!

📊 Database Summary:
  Categories:
    - 23 total categories (flat structure)
  Locations:
    - 82 total locations
    - 1 country (Turkey)
    - 81 cities
    - 0 districts
```

Tebrikler! Production database'iniz güncellendi. 🚀
