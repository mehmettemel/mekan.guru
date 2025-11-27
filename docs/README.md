# LocalFlavors Dokümantasyonu

LocalFlavors, topluluk destekli yerel restoran ve mekan öneri platformudur. Kullanıcılar kendi koleksiyonlarını oluşturabilir, mekanları oyabilir ve şehir bazlı sıralamalar görebilir.

## 📚 Dokümantasyon İçeriği

1. **[Proje Genel Bakış](./01-overview.md)** - Proje hakkında genel bilgi, amaç ve özellikler
2. **[Teknik Mimari](./02-architecture.md)** - Teknoloji yığını ve proje yapısı
3. **[Veritabanı Şeması](./03-database.md)** - Tablo yapıları ve ilişkiler
4. **[Kurulum ve Geliştirme](./04-setup.md)** - Projeyi ayağa kaldırma ve geliştirme
5. **[API Referansı](./05-api.md)** - Backend fonksiyonlar ve endpoint'ler
6. **[SEO Rehberi](./06-seo-guide.md)** - SEO iyileştirmeleri ve optimizasyon stratejisi
7. **[SEO Roadmap](./07-seo-roadmap.md)** - Adım adım SEO uygulama planı (3-12 ay)
8. **[Animasyon Sistemi](./08-animations.md)** - Page transitions ve animasyon kullanımı

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# .env.local dosyasını oluştur
cp .env.example .env.local

# Geliştirme sunucusunu başlat
npm run dev
```

Daha detaylı kurulum için [Kurulum ve Geliştirme](./04-setup.md) bölümüne bakın.

## 🎯 Temel Özellikler

- ✅ Kullanıcı kayıt/giriş sistemi
- ✅ Koleksiyon oluşturma ve düzenleme
- ✅ Mekan yönetimi (CRUD)
- ✅ Şehir bazlı liderlik tablosu
- ✅ Oylama sistemi (upvote/downvote)
- ✅ Admin paneli
- ✅ Çoklu dil desteği (TR/EN)
- ✅ Karanlık mod
- ✅ Mobil uyumlu tasarım

## 🛠️ Teknoloji Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **State Management:** TanStack Query, Zustand
- **UI Components:** shadcn/ui (Radix UI)
- **Form & Validation:** React Hook Form, Zod

## 📁 Proje Yapısı

```
/
├── app/              # Next.js App Router sayfaları
├── components/       # React bileşenleri
├── lib/              # API ve yardımcı fonksiyonlar
├── supabase/         # Veritabanı migration'ları
├── types/            # TypeScript tip tanımları
└── public/           # Statik dosyalar
```

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen önce dokümantasyonu okuyun ve kod standartlarına uyun.

## 📝 Lisans

Bu proje özel bir projedir.
