# Animasyon ve Transition Sistemi

Projede Framer Motion kullanılarak profesyonel sayfa geçişleri ve animasyonlar implementé edilmiştir.

---

## 🎬 Kurulum

Animasyon sistemi otomatik olarak tüm sayfalarda çalışır. Ek bir kurulum gerektirmez.

**Kullanılan Teknolojiler:**
- **Framer Motion** v12.23.24
- **Next.js App Router** template.tsx sistemi
- **Custom hooks** (usePageTransition)

---

## 📦 Mevcut Animasyonlar

### 1. **Page Transitions** (Sayfa Geçişleri)

Otomatik olarak tüm sayfalarda aktif.

#### **Varsayılan: PageTransition**
```typescript
// app/template.tsx (otomatik çalışıyor)
<PageTransition>
  {children}
</PageTransition>
```

**Özellikler:**
- Fade + Slide Up animasyonu
- 0.5s süre
- Custom easing (easeOutExpo)
- Opacity: 0 → 1
- Y axis: 20px → 0
- Scale: 0.98 → 1

#### **Alternatif Transition Tipleri:**

```typescript
import {
  FadeTransition,      // Sadece fade
  ScaleTransition,     // Scale + fade
  BlurFadeTransition,  // Blur + fade (modern)
} from '@/components/transitions';

// Kullanım:
<FadeTransition>{children}</FadeTransition>
<ScaleTransition>{children}</ScaleTransition>
<BlurFadeTransition>{children}</BlurFadeTransition>
```

**FadeTransition:**
- Hafif, minimal
- Sadece opacity değişimi
- 0.4s süre

**ScaleTransition:**
- Dramatik etki
- Scale: 0.95 → 1.05
- Zoom-in effect

**BlurFadeTransition:**
- Modern, smooth
- Blur: 10px → 0
- 0.6s süre
- Premium his

---

### 2. **Route Progress Bar**

Otomatik olarak aktif (üst çubuk).

```typescript
// app/layout.tsx (zaten ekli)
<RouteProgress />
```

**Özellikler:**
- Turuncu gradient loading bar
- Glow effect (box-shadow)
- Simulated progress (0% → 30% → 60% → 90% → 100%)
- Auto-hide on complete
- z-index: 9999 (en üstte)

**Renk Değiştirme:**
```typescript
// components/transitions/route-progress.tsx
style={{
  background: 'linear-gradient(90deg, #f97316, #fb923c, #fdba74)',
  // Kendi renginle değiştir:
  // background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
}}
```

---

### 3. **Curtain Transition** (Perde Efekti)

Dramtik, full-screen geçiş efekti.

```typescript
import { CurtainTransition } from '@/components/transitions';

// Layout'a ekle:
<CurtainTransition />
```

**Özellikler:**
- İki taraflı perde (üst/alt)
- Turuncu gradient
- Center logo animasyonu
- 0.8s süre
- Çok profesyonel görünüm

**Not:** Şu an aktif değil. Aktifleştirmek için:
```typescript
// app/layout.tsx
import { CurtainTransition } from '@/components/transitions/curtain-transition';

// Return içine ekle:
<CurtainTransition />
```

---

### 4. **Stagger Animations** (Sıralı Animasyon)

Liste elemanları için sıralı görünme efekti.

#### **Temel Kullanım:**

```typescript
import { StaggerContainer, StaggerItem } from '@/components/transitions';

function MyList() {
  return (
    <StaggerContainer>
      {items.map((item, index) => (
        <StaggerItem key={item.id} index={index}>
          <div>{item.name}</div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
```

**Özellikler:**
- Her element 0.1s arayla görünür
- Fade + Slide up
- Scale: 0.95 → 1
- Smooth easing

#### **Horizontal Stagger:**

```typescript
import { HorizontalStaggerItem } from '@/components/transitions';

<StaggerContainer>
  {items.map((item) => (
    <HorizontalStaggerItem key={item.id}>
      <div>{item.name}</div>
    </HorizontalStaggerItem>
  ))}
</StaggerContainer>
```

Soldan sağa görünme efekti (x-axis).

---

### 5. **Scroll Reveal Animations**

Scroll ile görünmeye başlayan elementler.

#### **ScrollReveal (Yön Bazlı):**

```typescript
import { ScrollReveal } from '@/components/transitions';

<ScrollReveal direction="up" delay={0.2}>
  <h2>Bu başlık scroll'da görünür</h2>
</ScrollReveal>
```

**Props:**
- `direction`: 'up' | 'down' | 'left' | 'right'
- `delay`: Gecikme (saniye)
- `threshold`: Görünme eşiği (0-1)

**Örnek Kullanımlar:**

```typescript
// Yukarıdan görünme
<ScrollReveal direction="up">
  <Card>...</Card>
</ScrollReveal>

// Soldan görünme + gecikme
<ScrollReveal direction="left" delay={0.3}>
  <Image src="..." />
</ScrollReveal>

// Threshold ayarı (element %50 görünür olunca başla)
<ScrollReveal threshold={0.5}>
  <Section>...</Section>
</ScrollReveal>
```

#### **ScrollFade (Sadece Fade):**

```typescript
import { ScrollFade } from '@/components/transitions';

<ScrollFade delay={0.1}>
  <p>Bu paragraf scroll'da fade-in olur</p>
</ScrollFade>
```

Hafif, minimal efekt.

#### **ScrollScale (Zoom Efekti):**

```typescript
import { ScrollScale } from '@/components/transitions';

<ScrollScale delay={0.2}>
  <Card>Bu kart zoom-in olur</Card>
</ScrollScale>
```

Scale: 0.8 → 1 (zoom effect)

---

## 🎨 Özelleştirme

### Custom Easing Functions

Projedeki easing:
```typescript
ease: [0.22, 1, 0.36, 1] // easeOutExpo (smooth, premium his)
```

**Diğer popüler easings:**
```typescript
// Hızlı başla, yavaş bitir
ease: [0.16, 1, 0.3, 1] // easeOutQuart

// Daha dramatik
ease: [0.34, 1.56, 0.64, 1] // easeOutBack

// Linear (basit)
ease: "linear"

// Built-in easings
ease: "easeIn"
ease: "easeOut"
ease: "easeInOut"
```

### Transition Süreleri

```typescript
// Varsayılan süreler:
PageTransition: 0.5s
FadeTransition: 0.4s
ScaleTransition: 0.5s
BlurFadeTransition: 0.6s
RouteProgress: 0.6s
CurtainTransition: 0.8s

// Değiştirmek için:
transition={{
  duration: 0.8, // Yeni süre (saniye)
  ease: [0.22, 1, 0.36, 1]
}}
```

---

## 📖 Kullanım Örnekleri

### Örnek 1: Ana Sayfa Sections

```typescript
// app/page.tsx
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/transitions';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <ScrollReveal direction="up">
        <section className="hero">
          <h1>Ana Başlık</h1>
        </section>
      </ScrollReveal>

      {/* Collection Cards */}
      <section>
        <ScrollReveal direction="up" delay={0.2}>
          <h2>Koleksiyonlar</h2>
        </ScrollReveal>

        <StaggerContainer>
          {collections.map((item, index) => (
            <StaggerItem key={item.id} index={index}>
              <CollectionCard collection={item} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </>
  );
}
```

### Örnek 2: Mekan Detay Sayfası

```typescript
// app/places/[slug]/page.tsx
import { ScrollReveal, ScrollScale } from '@/components/transitions';

export default function PlacePage() {
  return (
    <div>
      {/* Header */}
      <ScrollReveal direction="down">
        <header>
          <h1>{place.name}</h1>
        </header>
      </ScrollReveal>

      {/* Image */}
      <ScrollScale delay={0.2}>
        <img src={place.image} alt={place.name} />
      </ScrollScale>

      {/* Description */}
      <ScrollReveal direction="up" delay={0.3}>
        <p>{place.description}</p>
      </ScrollReveal>
    </div>
  );
}
```

### Örnek 3: Liderlik Tablosu

```typescript
// components/leaderboard/collections-leaderboard.tsx
import { StaggerContainer, StaggerItem } from '@/components/transitions';

export function CollectionsLeaderboard({ collections }) {
  return (
    <StaggerContainer>
      {collections.map((collection, index) => (
        <StaggerItem key={collection.id} index={index}>
          <div className="leaderboard-row">
            <span className="rank">{index + 1}</span>
            <span className="name">{collection.name}</span>
            <span className="score">{collection.score}</span>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
```

---

## 🚀 Performance

### Optimizasyon İpuçları

**1. once: true Kullan (Scroll Reveals)**
```typescript
// components/transitions/scroll-reveal.tsx
const isInView = useInView(ref, {
  once: true,  // ✅ Animasyon sadece bir kez çalışır
  amount: 0.1
});
```

**2. will-change CSS Ekle**
```css
.animated-element {
  will-change: opacity, transform;
}
```

**3. Çok Fazla Stagger Kullanma**
```typescript
// ❌ Kötü (100 element)
<StaggerContainer>
  {items.map(...)} // 100 element
</StaggerContainer>

// ✅ İyi (Pagination + Stagger)
<StaggerContainer>
  {items.slice(0, 20).map(...)} // İlk 20
</StaggerContainer>
```

**4. Layout Shift Önle**
```typescript
// Min-height belirle
<StaggerContainer className="min-h-screen">
  {children}
</StaggerContainer>
```

---

## 🐛 Troubleshooting

### Problem: Animasyonlar çalışmıyor

**Çözüm:**
1. `'use client'` directive var mı kontrol et
2. Framer Motion import'ları doğru mu?
3. `template.tsx` dosyası var mı?

### Problem: Scroll reveals tetiklenmiyor

**Çözüm:**
```typescript
// threshold değerini düşür
<ScrollReveal threshold={0.1}> // 0.5 yerine 0.1
  {children}
</ScrollReveal>
```

### Problem: Route progress bar görünmüyor

**Çözüm:**
1. `app/layout.tsx`'te `<RouteProgress />` var mı?
2. z-index yeterli mi? (9999)
3. Browser console'da hata var mı?

### Problem: Animasyonlar çok yavaş

**Çözüm:**
```typescript
// Duration'ı azalt
transition={{ duration: 0.3 }} // 0.5 yerine 0.3
```

---

## 🎯 Best Practices

### 1. Tutarlılık
Tüm projede aynı transition tipini kullan:
```typescript
// ✅ İyi
<PageTransition>{children}</PageTransition>

// ❌ Kötü (her sayfada farklı)
<ScaleTransition>{children}</ScaleTransition>
<BlurFadeTransition>{children}</BlurFadeTransition>
```

### 2. Subtle Animations
Abartmayın:
```typescript
// ✅ İyi (subtle)
<ScrollReveal direction="up">

// ❌ Kötü (too much)
<ScrollReveal direction="up">
  <motion.div
    animate={{ rotate: 360, scale: 2 }}
    transition={{ duration: 2 }}
  >
```

### 3. Accessibility
Kullanıcılar "prefers-reduced-motion" ayarını etkinleştirmişse animasyonları devre dışı bırak:

```typescript
// hooks/use-reduced-motion.ts
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const listener = () => setShouldReduceMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return shouldReduceMotion;
}

// Kullanımı:
const shouldReduceMotion = useReducedMotion();
const duration = shouldReduceMotion ? 0 : 0.5;
```

### 4. Loading States
Loading sırasında animasyon yapma:
```typescript
if (isLoading) return <Skeleton />; // Animasyon yok

return (
  <ScrollReveal>
    <Content />
  </ScrollReveal>
);
```

---

## 📊 Animation Cheatsheet

| Component | Süre | Easing | Kullanım Yeri |
|-----------|------|--------|---------------|
| PageTransition | 0.5s | easeOutExpo | Tüm sayfalar (otomatik) |
| FadeTransition | 0.4s | easeOut | Hafif geçişler |
| ScaleTransition | 0.5s | custom | Dramatik geçişler |
| BlurFadeTransition | 0.6s | easeOutExpo | Premium his |
| RouteProgress | 0.6s | easeInOut | Header (otomatik) |
| CurtainTransition | 0.8s | easeOutExpo | Full-screen (opsiyonel) |
| ScrollReveal | 0.6s | easeOutExpo | Scroll sections |
| ScrollFade | 0.8s | easeOut | Subtle reveals |
| ScrollScale | 0.6s | easeOutExpo | Cards, images |
| StaggerItem | 0.5s | easeOutExpo | Lists |

---

## 🎬 Gelecek Özellikler

**Planlanan:**
- [ ] Shared element transitions (sayfa arası element geçişi)
- [ ] Parallax scroll effects
- [ ] Magnetic button hover effects
- [ ] Page exit animations (şu an sadece enter var)
- [ ] Custom cursor animations
- [ ] Loading skeleton animations

---

## 📝 Notlar

- Tüm animasyonlar **Framer Motion** ile yapılmıştır
- **Template.tsx** pattern kullanılarak sayfa geçişleri otomatikleştirilmiştir
- **RouteProgress** component'i route değişimlerini otomatik algılar
- Animasyonlar **mobile-friendly** (reduced motion support)
- **Performance-optimized** (GPU acceleration, once: true)

---

## 🔗 İlgili Dosyalar

```
components/transitions/
├── page-transition.tsx      # Ana sayfa geçişleri
├── route-progress.tsx       # Loading bar
├── curtain-transition.tsx   # Perde efekti
├── stagger-container.tsx    # Sıralı animasyonlar
├── scroll-reveal.tsx        # Scroll tetiklemeli
└── index.ts                 # Exports

app/
├── template.tsx             # Otomatik page transitions
└── layout.tsx               # RouteProgress eklendi

hooks/
└── use-page-transition.ts   # Route değişim hook'u
```

---

**Başarılar! Projen artık profesyonel animasyonlara sahip! 🎉**
