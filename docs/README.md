# Local Flavours - Documentation

Projeye hoş geldiniz! Bu klasör, projenin dokümantasyonunu içerir.

## 📚 Dokümantasyon İndeksi

### 1. **Environment Setup**
📄 [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md)
- Development ve production ortam kurulumu
- Environment variables yapılandırması
- Supabase bağlantı ayarları

### 2. **Production Database Seeding**
📄 [PRODUCTION-SEED.md](../PRODUCTION-SEED.md)
- Production database güncelleme rehberi
- Kategori ve şehir seed işlemleri
- Güvenlik kontrolleri ve backup stratejisi

### 3. **UI Component Best Practices**
📄 [UI-COMPONENT-BEST-PRACTICES.md](./UI-COMPONENT-BEST-PRACTICES.md)
- UI component geliştirme standartları
- Combobox, dropdown, form component'leri
- Width, scroll, responsive design kuralları
- Yaygın hatalar ve çözümleri

## 🚀 Hızlı Başlangıç

### Development Ortamı

1. **Dependencies yükleyin**:
   ```bash
   npm install
   ```

2. **Environment variables ayarlayın**:
   ```bash
   cp .env.example .env.local
   # .env.local dosyasını düzenleyin
   ```

3. **Database seed**:
   ```bash
   npm run seed
   ```

4. **Development server başlatın**:
   ```bash
   npm run dev
   ```

### Production Deploy

1. **Production environment ayarlayın**:
   ```bash
   # .env.production dosyasını oluşturun ve düzenleyin
   ```

2. **Build alın**:
   ```bash
   npm run build
   ```

3. **Production seed**:
   ```bash
   npm run seed:production
   ```

4. **Production server**:
   ```bash
   npm start
   ```

## 🛠️ Geliştirme Komutları

```bash
# Development
npm run dev              # Dev server (port 3001)
npm run build           # Production build
npm run start           # Production server
npm run lint            # ESLint check
npm run format          # Prettier format
npm run format:check    # Prettier check

# Database
npm run seed            # Local database seed
npm run seed:production # Production database seed
npm run seed:demo       # Demo data seed
```

## 📁 Proje Yapısı

```
local-flavours/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── collections/    # Collection related components
│   └── leaderboard/    # Leaderboard components
├── lib/                # Utilities and helpers
│   ├── api/           # API functions
│   ├── hooks/         # Custom React hooks
│   ├── contexts/      # React contexts
│   └── validations/   # Zod schemas
├── scripts/           # Database scripts
├── docs/              # Documentation (bu klasör)
└── public/            # Static assets
```

## 🎯 Önemli Dosyalar

- `components/ui/combobox.tsx` - Aranabilir dropdown component
- `lib/hooks/use-categories.ts` - Kategori data hook
- `lib/hooks/use-locations.ts` - Şehir data hook
- `scripts/seed-database.ts` - Database seed script
- `scripts/seed-production.ts` - Production seed script

## 🔍 Kod Standartları

### TypeScript
- Tüm componentler TypeScript ile yazılmalı
- `any` tipi kullanmaktan kaçının
- Interface ve type tanımları açık ve anlaşılır olmalı

### React
- Functional components kullanın
- Custom hooks ile logic'i ayırın
- Props için interface tanımlayın

### Styling
- Tailwind CSS utility classes
- Mobile-first responsive design
- Dark mode desteği

### Testing
- Component test checklist'i takip edin
- Build başarılı olmalı
- TypeScript hatasız olmalı

## 🐛 Yaygın Sorunlar

### Combobox scroll çalışmıyor
**Çözüm**: Combobox component'inde trigger width otomatik ölçülüyor. `max-h-[300px] overflow-auto` class'ı var.

### Kategoriler yüklenmyor
**Çözüm**: `npm run seed` ile database'i seed edin.

### Dark mode çalışmıyor
**Çözüm**: Tüm color class'larında `dark:` variant olmalı.

## 📝 Dokümantasyona Katkı

Yeni feature eklerken veya değişiklik yaparken:

1. İlgili dokümantasyonu güncelleyin
2. Code örneği ekleyin
3. Known issues bölümünü kontrol edin
4. Değişiklikleri commit message'a yazın

## 🔗 Faydalı Linkler

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev)

## 📮 Destek

Sorularınız veya sorunlarınız için:
- GitHub Issues açın
- Development team ile iletişime geçin
- Dokümantasyonu kontrol edin

---

**Son güncelleme**: 2025-01-20

Proje hakkında daha fazla bilgi için dokümantasyon dosyalarını inceleyin.
