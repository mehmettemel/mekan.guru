# SEO Roadmap - Adım Adım Rehber

Google'da üst sıralara çıkmak için izlemen gereken adım adım yol haritası.

---

## 🎯 Hedef

**3 ayda:** Google'da görünmeye başla
**6 ayda:** Şehir bazlı aramalarda ilk sayfa
**12 ayda:** Ana keywords'te top 10

---

## 📅 Hafta 1: Teknik Altyapı (Başlamadan Önce)

### Gün 1-2: OG Image ve Favicon Oluştur

**OG Image (Social Media Önizleme)**
```
Boyut: 1200x630 piksel
Format: JPG veya PNG
Maks boyut: 300KB
İçerik: Logo + "Türkiye'nin En İyi Mekanları" tagline
```

**Nasıl yapılır:**
1. [Canva](https://canva.com) hesabı aç (ücretsiz)
2. "Social Media" > "Facebook Post" template seç (1200x630)
3. Tasarla:
   - Arka plan: Gradient (turuncu-beyaz)
   - Logo ortada
   - Alt yazı: "LocalFlavours - Türkiye'nin En İyi Restoranları"
4. Download → JPG
5. `public/og-image.jpg` olarak kaydet

**Favicon Seti**
1. [Real Favicon Generator](https://realfavicongenerator.net/) aç
2. Logo'nu yükle (en az 512x512 PNG)
3. "Generate favicons" tıkla
4. Tüm dosyaları download et
5. `public/` klasörüne kopyala:
   - `favicon.ico`
   - `apple-touch-icon.png`
   - `favicon-16x16.png`
   - `favicon-32x32.png`

**Kontrol et:**
```bash
ls -la public/*.{ico,png}
```

---

### Gün 3: Domain ve Hosting Ayarla

**1. Domain Al (Eğer yoksa)**
```
Önerilen: .com veya .co
Örnek: localflavours.com
Alternatif: localflavors.co
```

**2. Vercel'e Deploy Et**
```bash
# 1. Vercel hesabı aç: vercel.com
# 2. GitHub repo'yu bağla
# 3. Environment variables ekle:

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://localflavours.com
GOOGLE_PLACES_API_KEY=...
NODE_ENV=production

# 4. Deploy et
```

**3. Custom Domain Bağla**
- Vercel dashboard > Settings > Domains
- Domain ekle
- DNS ayarlarını yap (Vercel yönlendirme verir)
- SSL otomatik aktif olur

---

### Gün 4-5: Google Tools Kurulumu

#### **Google Search Console**

**Adım 1: Hesap Oluştur**
1. [Google Search Console](https://search.google.com/search-console) aç
2. "Add Property" tıkla
3. "Domain" seç (tüm subdomain'leri kapsar)
4. Domain gir: `localflavours.com`

**Adım 2: Doğrula**
```
Yöntem 1: DNS TXT Record (Önerilen)
- Google'ın verdiği TXT record'u kopyala
- Domain sağlayıcına git (GoDaddy, Namecheap, vs.)
- DNS Management > TXT Record ekle
- 15-30 dakika bekle
- Google'da "Verify" tıkla

Yöntem 2: HTML Tag (Kolay)
- Google'ın verdiği meta tag'i kopyala
- app/layout.tsx'e ekle:
  verification: {
    google: 'BURAYA-KOD'
  }
- Deploy et
- "Verify" tıkla
```

**Adım 3: Sitemap Submit Et**
```
1. Search Console > Sitemaps (sol menü)
2. "Add a new sitemap" kutusuna yaz: sitemap.xml
3. "Submit" tıkla
4. Durum: "Success" olmalı
```

**Adım 4: URL Inspection**
```
1. Search Console > URL Inspection
2. Ana sayfa URL'ini test et: https://localflavours.com
3. "Request Indexing" tıkla
4. 5-10 farklı sayfayı da ekle:
   - /turkey/istanbul
   - /collections/...
   - /places/...
```

---

#### **Google Analytics 4**

**Kurulum:**
```bash
# 1. https://analytics.google.com aç
# 2. Yeni property oluştur
# 3. Measurement ID'yi kopyala (G-XXXXXXXXXX)
# 4. Kodu projeye ekle:
```

**app/layout.tsx'e ekle:**
```typescript
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Kontrol:**
- Site'yi aç → F12 (DevTools)
- Network tab > Filter: "gtag"
- Request gidiyor mu kontrol et

---

### Gün 6-7: Bing & Diğer Arama Motorları

#### **Bing Webmaster Tools**
```
1. https://www.bing.com/webmasters aç
2. "Add Site" tıkla
3. Google Search Console'dan import et (kolay yol)
4. Veya manuel doğrula (DNS/HTML tag)
5. Sitemap ekle: https://localflavours.com/sitemap.xml
```

#### **Yandex Webmaster** (Opsiyonel - Türkiye'de kullanılıyor)
```
1. https://webmaster.yandex.com aç
2. Site ekle
3. Doğrula
4. Sitemap ekle
```

---

## 📅 Hafta 2-4: İçerik Hazırlığı (Kritik!)

### Hedef: İlk 100 Mekan + 30 Koleksiyon

Google **fresh content** sever. Boş site index edilmez!

---

### Gün 8-14: İlk 50 Mekan Ekle

**Strateji: En Popüler Şehirler Önce**

**Öncelikli Şehirler:**
1. İstanbul (20 mekan)
2. Ankara (10 mekan)
3. İzmir (10 mekan)
4. Antalya (5 mekan)
5. Bursa (5 mekan)

**Hangi Kategoriler:**
- Kebap (10 mekan)
- Kahvaltı (10 mekan)
- Pizza (5 mekan)
- Burger (5 mekan)
- Kafe (10 mekan)
- Fine Dining (5 mekan)
- Fast Food (5 mekan)

**Veri Kaynakları:**
```
1. Google Maps'te ara: "istanbul kebap"
   - En popüler 5'i al
   - Adres, telefon, koordinat kaydet

2. TripAdvisor'dan ilham al
   - Top rated mekanlar

3. Yerel blog'lardan
   - "İstanbul'da en iyi kebapçılar" google'la
   - Önerilen mekanları ekle
```

**Ekleme Scripti Kullan:**
```bash
npm run seed  # Hızlı test verisi için

# Veya admin panelinden manuel:
# /admin/places > "Mekan Ekle"
```

**Her Mekan İçin:**
```typescript
{
  names: { tr: "Sultanahmet Köftecisi", en: "Sultanahmet Meatballs" },
  address: "Tam adres",
  location_id: "istanbul-uuid",
  category_id: "kebab-uuid",
  phone: "+90 212 123 45 67",
  latitude: 41.0082,
  longitude: 28.9784,
  descriptions: {
    tr: "1920'den beri hizmet veren tarihi mekan. Meşhur köftesi ile ünlü.",
    en: "Historic venue serving since 1920. Famous for its meatballs."
  }
}
```

**Günde 7 mekan ekle → 7 günde 50 mekan**

---

### Gün 15-21: İlk 30 Koleksiyon Oluştur

**Strateji: SEO-Friendly Başlıklar**

**Örnek Koleksiyon Başlıkları:**
```
1. "İstanbul'daki En İyi 10 Kebapçı"
2. "Ankara'da Mutlaka Gidilmesi Gereken Kahvaltı Mekanları"
3. "İzmir'de Deniz Manzaralı Restoranlar"
4. "Kadıköy'ün Gizli Kalmış Kafeleri"
5. "Beşiktaş'ta Öğrenci Dostu Ucuz Mekanlar"
6. "Şişli'de Fine Dining Restoranlar"
7. "Beyoğlu'nda Gece Hayatı İçin En İyi Barlar"
8. "Antalya'da Deniz Ürünleri Restoranları"
9. "Ankara Çankaya'da Brunch Yapılacak Yerler"
10. "İstanbul Avrupa Yakası Burger Mekanları"
... (30'a kadar devam)
```

**Her Koleksiyon:**
- 5-10 mekan içermeli
- Her mekana küratör notu ekle
- Famous items belirt (örn: "Adana Kebap", "Ayran")
- Açıklama 2-3 cümle olsun

**Neden Önemli:**
- Google long-tail keywords'ü sever
- "istanbul en iyi kebapçı" → Senin koleksiyonun çıkar
- User intent'e tam uygun

**Günde 4-5 koleksiyon → 7 günde 30 koleksiyon**

---

### Gün 22-28: Kalan 50 Mekan + 20 Koleksiyon

**İkinci Dalga Şehirler:**
- Antalya (10 mekan)
- Bursa (10 mekan)
- Adana (10 mekan)
- Gaziantep (10 mekan)
- Konya (10 mekan)

**Daha Niche Koleksiyonlar:**
```
11. "Gaziantep'te Baklava Yiyebileceğiniz Yerler"
12. "Konya'da Etli Ekmek Adresleri"
13. "Adana'da Adana Kebap'ın En İyisini Yapan 7 Mekan"
14. "İstanbul'da Vejetaryen/Vegan Restoranlar"
15. "Ankara'da Ailenizle Gidebileceğiniz Mekanlar"
... (toplam 50 koleksiyon)
```

---

## 📅 Ay 2: Optimizasyon ve Teknoloji

### Hafta 5: Performance Audit

**Lighthouse Testi:**
```bash
# 1. Production build al
npm run build
npm run start

# 2. Chrome'da aç: https://localflavours.com
# 3. F12 > Lighthouse tab
# 4. "Analyze page load" tıkla

Hedef skorlar:
- Performance: 90+
- SEO: 95+
- Accessibility: 90+
- Best Practices: 90+
```

**Eğer Skorlar Düşükse:**

**Performance < 90:**
```typescript
// next.config.ts
export default {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  // Compression
  compress: true,
  // SWC minify (default zaten)
  swcMinify: true,
}
```

**SEO < 95:**
```
- Eksik meta tag var mı kontrol et
- Sitemap hatasız mı
- Canonical URLs doğru mu
```

**Accessibility < 90:**
```
- Alt text'ler eksiksiz mi
- Color contrast yeterli mi
- Keyboard navigation çalışıyor mu
```

---

### Hafta 6: Internal Linking Stratejisi

**Hedef: Her Sayfa Birbirine Bağlı**

**1. Footer'a Linkler Ekle:**
```typescript
// components/layout/footer.tsx
<footer>
  <div>
    <h4>Popüler Şehirler</h4>
    <Link href="/turkey/istanbul">İstanbul</Link>
    <Link href="/turkey/ankara">Ankara</Link>
    <Link href="/turkey/izmir">İzmir</Link>
  </div>
  <div>
    <h4>Kategoriler</h4>
    <Link href="/categories/kebab">Kebap</Link>
    <Link href="/categories/breakfast">Kahvaltı</Link>
  </div>
</footer>
```

**2. Mekan Sayfalarına İlgili Linkler:**
```typescript
// app/places/[slug]/page.tsx
<div className="related-links">
  <Link href={`/turkey/${place.location.slug}`}>
    {place.location.names.tr}'deki diğer mekanlar
  </Link>
  <Link href={`/categories/${place.category.slug}`}>
    {place.category.names.tr} kategorisindeki mekanlar
  </Link>
</div>
```

**3. Breadcrumb Navigation Ekle:**
```typescript
// components/ui/breadcrumb.tsx
<nav aria-label="breadcrumb">
  Ana Sayfa > İstanbul > Kebap > Sultanahmet Köftecisi
</nav>
```

**Neden Önemli:**
- Google site'ni daha iyi tarar (crawlability)
- PageRank distribute olur
- User experience iyileşir

---

### Hafta 7-8: Schema.org Validation

**Rich Results Test:**
```bash
1. https://search.google.com/test/rich-results aç
2. URL'leri test et:

Test edilecek sayfalar:
- https://localflavours.com
- https://localflavours.com/turkey/istanbul
- https://localflavours.com/collections/[slug]
- https://localflavours.com/places/[slug]

Beklenen sonuçlar:
✅ WebSite schema geçerli
✅ ItemList schema geçerli
✅ Restaurant schema geçerli
✅ AggregateRating görünüyor
```

**Eğer Hata Varsa:**
```
- JSON-LD syntax hatası → JSON validator kullan
- Eksik required field → Schema.org docs kontrol et
- Invalid property → Tip uyumsuzluğu (string/number)
```

**Structured Data Types Preview:**
```
Görünecek olanlar:
- ⭐ Rating (yıldızlar)
- 📍 Location
- 💰 Price Range (gelecekte eklenebilir)
- 📞 Phone Number
- 🕒 Opening Hours (gelecekte eklenebilir)
```

---

## 📅 Ay 3: Büyüme ve Otomasyon

### Hafta 9-10: Content Automation

**Hedef: Haftada 20 yeni mekan**

**Stratejiler:**

**1. User-Generated Content Teşvik Et:**
```
- Koleksiyon oluşturma basit olmalı
- Gamification: "İlk 100 koleksiyon oluşturana rozet"
- Sosyal paylaşım butonları ekle
```

**2. Import Tooling (Gelecek):**
```typescript
// Admin paneline CSV import özelliği ekle
// Google Sheets'ten toplu mekan aktarımı
```

**3. Düzenli İçerik Programı:**
```
Pazartesi: 5 yeni mekan ekle (İstanbul)
Çarşamba: 5 yeni mekan ekle (Ankara)
Cuma: 5 yeni mekan ekle (İzmir)
Cumartesi: 2 yeni koleksiyon oluştur
Pazar: 3 yeni koleksiyon oluştur
```

---

### Hafta 11-12: Backlink Stratejisi

**Hedef: İlk 10 Backlink**

**Nerede Backlink Alabilirim:**

**1. Sosyal Medya Profilleri:**
```
✅ Twitter/X bio'ya link
✅ Instagram bio (link in bio)
✅ Facebook sayfa
✅ LinkedIn company page
✅ Reddit profile (r/turkey'de paylaş)
✅ Ekşi Sözlük entry'leri (organik)
```

**2. Directory Submissions:**
```
- Startup dizinleri:
  - Product Hunt (launch yap)
  - BetaList
  - Startup Istanbul

- Türk dizinler:
  - Webrazzi (haber yap)
  - ShiftDelete (teknoloji haberi)
  - KızlarSoruyor (popüler mekanlar konusu)
```

**3. Guest Blogging:**
```
"İstanbul'da En İyi 10 Kebapçı" başlıklı yazı yaz:
- Medium'da yayınla
- Blogger'da yayınla
- Kendi blog'unda paylaş
- Yazının sonunda: "Kaynak: LocalFlavours.com"
```

**4. İşbirlikleri:**
```
- Food blogger'larla iletişime geç
- "Koleksiyonunuzu bizde paylaşın" teklifi
- Influencer'lara özel liste oluştur
```

**5. Forum & Q&A Siteleri:**
```
- Quora'da sor/cevapla: "İstanbul'da nerede yemek yenir?"
- Reddit r/Turkey: "Best restaurants in Istanbul?"
- Ekşi Sözlük: Organik bahset
```

**Backlink Quality Metrikleri:**
```
✅ Do-follow link (SEO değeri var)
✅ İlgili site (yemek/seyahat kategorisi)
✅ Yüksek Domain Authority (40+)
❌ Spam siteler (zarar verir)
❌ Link farm'lar (Google cezası)
```

---

## 📅 Ay 4-6: Büyüme ve Optimizasyon

### Her Hafta Yapılacaklar:

**Pazartesi: Analytics Review**
```bash
# Google Analytics kontrol et:
1. Organic traffic artıyor mu?
2. Hangi sayfalar en çok ziyaret edildi?
3. Bounce rate kabul edilebilir mi? (<60%)
4. Hangi keywords'ten geliniyor?

# Aksiyon:
- Az ziyaret alan sayfaları iyileştir
- Popüler sayfaları daha fazla promo et
```

**Çarşamba: Search Console Review**
```bash
# Google Search Console kontrol et:
1. İmpression artıyor mu?
2. Average position iyileşiyor mu?
3. Hangi queries var?
4. Hangi sayfalar index dışı?

# Aksiyon:
- Düşük CTR'li sayfaların title'ını iyileştir
- Index dışı sayfaları düzelt
- Yeni keywords keşfet → İçerik üret
```

**Cuma: Content Publishing**
```bash
1. 10 yeni mekan ekle
2. 3 yeni koleksiyon oluştur
3. Eski koleksiyonları güncelle (fresh content signal)
```

**Pazar: Competitor Analysis**
```bash
# Rakipleri incele:
1. Google'da ara: "istanbul restoranlar"
2. Üst sıralardaki sitelere bak:
   - Ne yapıyorlar farklı?
   - Hangi keywords'te güçlüler?
   - İçerik stratejileri ne?

# Aksiyon:
- Onların güçlü olduğu alanlarda içerik üret
- Farklılaş: Senin unique value proposition'ın ne?
```

---

### Ay 5-6: Advanced Tactics

**1. Long-Tail Keywords Hedefle**
```
"istanbul restoranlar" → Çok rekabetçi
"kadıköy moda'da vegan restoranlar" → Az rekabet, yüksek intent

Strateji:
- Google Search Console'da long-tail queries bul
- Her biri için özel koleksiyon oluştur
- Title'da exact match kullan
```

**2. Featured Snippets İçin Optimize Et**
```
Google'ın "Position Zero" sonuçları:

Örnek query: "İstanbul'da en iyi kebapçılar"
Featured snippet format:
1. Heading: <h2>İstanbul'da En İyi Kebapçılar</h2>
2. List: <ol> ile numaralı liste
3. Kısa açıklama: Her mekan için 1 cümle

Koleksiyon sayfalarını bu formatta düzenle!
```

**3. Local SEO (Gelecek)**
```
- Google My Business profili oluştur
- Her şehir için location page optimize et
- "Near me" aramaları için optimize et
- Local citations (yerel dizinlere kayıt)
```

**4. Video Content (Gelecek)**
```
- YouTube kanalı aç
- "İstanbul'da En İyi 10 Kebapçı" video çek
- Video'nun description'ında site link'i
- Video SEO: Title, tags, description optimize et
```

---

## 📅 Ay 7-12: Scale ve Dominance

### Hedefler:

**Ay 7:**
- 500+ mekan
- 200+ koleksiyon
- 1000+ organik ziyaret/ay

**Ay 9:**
- 1000+ mekan
- 500+ koleksiyon
- 5000+ organik ziyaret/ay
- 50+ backlinks

**Ay 12:**
- 2000+ mekan
- 1000+ koleksiyon
- 10,000+ organik ziyaret/ay
- 100+ backlinks
- Ana keywords'te top 10

---

### Scale Stratejileri:

**1. Coğrafi Genişleme**
```
Faz 1: İstanbul, Ankara, İzmir (✅ tamamlandı)
Faz 2: Antalya, Bursa, Adana, Gaziantep
Faz 3: 20+ şehir
Faz 4: Tüm il merkezleri (81 il)

Her şehir için:
- 20+ mekan
- 10+ koleksiyon
- Şehir landing page optimize
```

**2. Kategori Derinleştirme**
```
Ana kategoriler: Kebap, Kahvaltı, Pizza...

Alt kategoriler ekle:
- Kebap → Adana Kebap, Urfa Kebap, İskender
- Kahvaltı → Serpme Kahvaltı, Van Kahvaltısı
- Pizza → İtalyan Pizza, Amerikan Pizza

Her alt kategori = Yeni keyword opportunity!
```

**3. Content Hub Stratejisi**
```
Blog bölümü ekle: /blog

Örnek içerikler:
- "İstanbul'da Yemek Kültürü Rehberi"
- "Türk Mutfağının 10 Vazgeçilmezi"
- "Restoran Seçerken Dikkat Edilmesi Gerekenler"
- "En İyi Kebap Nasıl Anlaşılır?"

SEO benefit:
- Informational keywords'te rank et
- Backlink çeker (kaynakça)
- E-A-T signals (expertise)
```

**4. User Engagement Artır**
```
Engagement = SEO signal!

Taktikler:
- Yorum sistemi ekle (mekan reviews)
- User rating sistemi (5 yıldız)
- Sosyal paylaşım butonları
- "Favorilere ekle" özelliği
- Email newsletter (returning users)

Metrikler:
- Time on site: 2+ dakika
- Pages per session: 3+
- Bounce rate: <50%
```

---

## 📊 KPI Takibi (Key Performance Indicators)

### Her Hafta Kontrol Et:

**Traffic Metrikleri:**
```
Google Analytics:
- [ ] Organic traffic
- [ ] Total users
- [ ] New vs returning users
- [ ] Avg session duration
- [ ] Pages per session
- [ ] Bounce rate
```

**SEO Metrikleri:**
```
Google Search Console:
- [ ] Total impressions
- [ ] Total clicks
- [ ] Average CTR
- [ ] Average position
- [ ] Number of indexed pages
```

**Content Metrikleri:**
```
Database:
- [ ] Toplam mekan sayısı
- [ ] Toplam koleksiyon sayısı
- [ ] Aktif kullanıcı sayısı
- [ ] Toplam oy sayısı
```

**Backlink Metrikleri:**
```
Ahrefs/Moz (ücretsiz tools):
- [ ] Domain Authority (hedef: 30+ ilk yıl)
- [ ] Backlink sayısı
- [ ] Referring domains
```

---

## 🎯 Milestone Celebrations

**İlk Google Indexing:**
🎉 Site Google'da görünmeye başladı!

**İlk Organik Ziyaret:**
🎉 İlk SEO trafiği geldi!

**İlk Sayfa (Top 10):**
🎉 Bir keyword'te ilk sayfaya çıktık!

**100 Mekan:**
🎉 İçerik hedefi tamamlandı!

**1000 Aylık Ziyaret:**
🎉 SEO momentum kazandı!

**Featured Snippet:**
🎉 Position Zero'ya çıktık!

---

## 🚨 Kaçınılması Gerekenler

### ❌ Black Hat SEO (Asla Yapma!)

**1. Keyword Stuffing**
```
❌ Yanlış:
"İstanbul restoranlar istanbul en iyi restoranlar istanbul
yemek istanbul mekanlar istanbul restoran önerileri istanbul"

✅ Doğru:
"İstanbul'daki en iyi restoranları keşfedin. Kullanıcı
önerileri ile şehrin en popüler mekanlarını bulun."
```

**2. Hidden Text**
```
❌ Beyaz yazıyı beyaz arka plana yazmak
❌ Font size: 0 ile keyword gizlemek
❌ CSS ile off-screen content
```

**3. Link Schemes**
```
❌ Link satın almak
❌ Link exchange (karşılıklı link değişimi)
❌ Link farm'lara katılmak
❌ Comment spam (blog yorumlarına link)
```

**4. Cloaking**
```
❌ Google'a farklı, kullanıcıya farklı içerik göstermek
```

**5. Duplicate Content**
```
❌ Başka sitelerden içerik kopyalamak
❌ Aynı içeriği birden fazla sayfada kullanmak
```

**Sonucu:** Google manual action (ceza) → Site ban!

---

## ✅ White Hat SEO (Her Zaman Yap!)

**1. Quality Content**
```
✅ Unique, orijinal içerik
✅ Kullanıcı için değer üret
✅ Düzenli güncelle (fresh content)
```

**2. Natural Link Building**
```
✅ Kaliteli içerik üret → Organik backlink
✅ Guest posting (değerli makaleler)
✅ İlişkiler kur (networking)
```

**3. User Experience**
```
✅ Fast loading
✅ Mobile-friendly
✅ Easy navigation
✅ Clear CTAs
```

**4. Technical SEO**
```
✅ Clean URL structure
✅ Proper heading hierarchy (H1, H2, H3)
✅ Alt text for images
✅ Internal linking
```

---

## 🎓 SEO Eğitim Kaynakları

**Ücretsiz Kaynaklar:**
```
1. Google Search Central Docs
   https://developers.google.com/search/docs

2. Moz Beginner's Guide to SEO
   https://moz.com/beginners-guide-to-seo

3. Ahrefs Blog
   https://ahrefs.com/blog

4. Backlinko (Brian Dean)
   https://backlinko.com/blog

5. YouTube Channels:
   - Ahrefs
   - Moz
   - Neil Patel
```

**Türkçe Kaynaklar:**
```
1. Webrazzi Blog
2. ShiftDelete SEO kategorisi
3. Dijital Pazarlama Derneği
```

---

## 📞 Yardım ve Destek

**SEO Sorunları:**
```
1. Google Search Console Help Forum
2. Reddit r/SEO
3. Stack Overflow (technical SEO)
```

**Next.js SEO:**
```
1. Next.js Docs: SEO section
2. Vercel Discord
3. GitHub Discussions
```

---

## 🎯 Son Kontrol Listesi

Başlamadan önce bu checklist'i tamamla:

### Teknik:
- [ ] OG image oluşturuldu
- [ ] Favicon seti eklendi
- [ ] Domain ayarlandı
- [ ] HTTPS aktif
- [ ] Google Search Console kuruldu
- [ ] Sitemap submit edildi
- [ ] Google Analytics kuruldu
- [ ] Robots.txt doğru yapılandırıldı

### İçerik:
- [ ] İlk 50 mekan eklendi
- [ ] İlk 30 koleksiyon oluşturuldu
- [ ] Her mekan için description var
- [ ] Her koleksiyon için açıklama var
- [ ] Fotoğraflar eklendi (varsa)

### SEO:
- [ ] Tüm sayfalar unique title'a sahip
- [ ] Meta descriptions yazıldı
- [ ] JSON-LD her sayfada
- [ ] Canonical URLs doğru
- [ ] Internal linking stratejisi var

### Monitoring:
- [ ] Analytics çalışıyor
- [ ] Search Console veri alıyor
- [ ] Haftalık review takvimi kuruldu

---

## 🚀 Başlıyoruz!

**Bugün Yap:**
1. ✅ OG image oluştur (30 dk)
2. ✅ Favicon seti ekle (15 dk)
3. ✅ Google Search Console kur (1 saat)
4. ✅ İlk 10 mekan ekle (2 saat)

**Bu Hafta Yap:**
- 50 mekan
- 10 koleksiyon
- Analytics kurulumu

**Bu Ay Yap:**
- 100 mekan
- 30 koleksiyon
- İlk backlink'ler

**Başarılar! 🎉**

Google'da üst sıralara çıkman 3-6 ay alacak. Sabırlı ol, düzenli çalış!
