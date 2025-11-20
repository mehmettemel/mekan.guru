# UI Component Best Practices

Bu doküman, projede UI componentleri oluştururken ve kullanırken dikkat edilmesi gereken önemli noktaları içerir.

## 🎯 Genel Prensipler

### 1. Component Props

- **Tip güvenliği**: Tüm props için TypeScript interface tanımlayın
- **Default values**: Opsiyonel props için makul default değerler verin
- **Naming**: Props isimleri açık ve anlaşılır olmalı

```typescript
// ✅ İyi
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
}

// ❌ Kötü
interface ButtonProps {
  var?: string
  s?: string
  dis?: boolean
}
```

### 2. Responsive Design

- Tüm componentler mobil-first yaklaşımla tasarlanmalı
- Breakpoint'ler: `sm`, `md`, `lg`, `xl`, `2xl`
- Touch-friendly: Mobilde dokunma alanları yeterli büyüklükte olmalı (minimum 44x44px)

## 📦 Dropdown/Popover Components

### Combobox / Select / Dropdown

**❗ Kritik: Width ve Overflow Yönetimi**

Dropdown componentlerde en yaygın hata, popup'ın genişliğinin trigger'a göre ayarlanmamasıdır.

#### ✅ Doğru Yaklaşım

```typescript
export function Combobox({ ... }: ComboboxProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>(undefined)

  // Trigger genişliğini ölç
  React.useEffect(() => {
    const updateWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  return (
    <Popover>
      <PopoverTrigger ref={triggerRef}>
        {/* Trigger content */}
      </PopoverTrigger>
      <PopoverContent
        style={{ width: triggerWidth ? `${triggerWidth}px` : 'auto' }}
      >
        {/* Dropdown content */}
      </PopoverContent>
    </Popover>
  )
}
```

#### ❌ Yanlış Yaklaşım

```typescript
// Sabit genişlik - responsive değil
<PopoverContent className="w-[200px]">

// w-full - parent'a göre genişlik, trigger'a göre değil
<PopoverContent className="w-full">

// Width belirtilmemiş - tahmin edilemez davranış
<PopoverContent>
```

### Scroll Yönetimi

Dropdown içinde uzun listeler için:

```typescript
// ✅ Doğru: Max-height ve overflow
<CommandGroup className="max-h-[300px] overflow-auto">
  {items.map(item => <CommandItem key={item.id}>{item.name}</CommandItem>)}
</CommandGroup>

// ❌ Yanlış: Height limiti yok
<CommandGroup>
  {items.map(item => <CommandItem key={item.id}>{item.name}</CommandItem>)}
</CommandGroup>
```

## 🔍 Form Components

### Input Fields

```typescript
// ✅ İyi: Label, validation, error message
<div className="space-y-2">
  <Label htmlFor="email">
    Email <span className="text-red-500">*</span>
  </Label>
  <Input
    id="email"
    type="email"
    placeholder="ornek@email.com"
    {...register('email')}
  />
  {errors.email && (
    <p className="text-sm text-red-500">{errors.email.message}</p>
  )}
</div>
```

### Combobox Kullanımı

**Şehir seçimi için:**

```typescript
<Combobox
  options={cities.map((city) => ({
    value: city.id,
    label: city.names.tr,
  }))}
  value={selectedCityId}
  onValueChange={setSelectedCityId}
  placeholder="Şehir seçin..."
  searchPlaceholder="Şehir ara..."
  emptyText="Şehir bulunamadı."
  className="w-full" // Parent container'ın tamamını kaplar
/>
```

**Kategori seçimi için:**

```typescript
<Combobox
  options={categories.map((category) => ({
    value: category.id,
    label: category.names.tr,
  }))}
  value={selectedCategoryId}
  onValueChange={setSelectedCategoryId}
  placeholder="Kategori seçin..."
  searchPlaceholder="Kategori ara..."
  emptyText="Kategori bulunamadı."
  disabled={isLoading}
/>
```

## 🎨 Styling Best Practices

### Tailwind CSS

1. **Utility classes**: Öncelikle Tailwind utility class'larını kullanın
2. **Custom classes**: Sadece tekrar eden pattern'ler için
3. **Responsive**: Mobil-first yaklaşım (`sm:`, `md:`, `lg:`)

```typescript
// ✅ İyi: Responsive ve semantic
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

// ❌ Kötü: Sabit değerler
<div className="grid grid-cols-3 gap-4">
```

### Dark Mode

Tüm componentler dark mode desteği ile geliştirilmeli:

```typescript
// ✅ İyi: Light ve dark variant
<div className="bg-white dark:bg-neutral-900">
<p className="text-neutral-900 dark:text-neutral-50">

// ❌ Kötü: Sadece light mode
<div className="bg-white">
<p className="text-black">
```

## ⚡ Performance

### 1. Lazy Loading

Büyük component'ler için:

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false
})
```

### 2. Memoization

Expensive hesaplamalar için:

```typescript
const filteredItems = React.useMemo(() => {
  return items.filter(item => item.category === selectedCategory)
}, [items, selectedCategory])
```

### 3. useCallback

Event handler'lar için:

```typescript
const handleSubmit = React.useCallback((data) => {
  // Handle submit
}, [dependencies])
```

## 🧪 Testing Checklist

Yeni bir component oluştururken kontrol edin:

- [ ] TypeScript tip hatası yok
- [ ] Responsive tasarım (mobil, tablet, desktop)
- [ ] Dark mode desteği
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Scroll davranışı (uzun listeler için)
- [ ] Width/height overflow kontrolü

## 🐛 Yaygın Hatalar ve Çözümleri

### 1. Popup Width Sorunu

**Sorun**: Dropdown/Popover, trigger'dan farklı genişlikte açılıyor

**Çözüm**: Trigger'ın genişliğini ölç ve popup'a uygula (yukarıdaki combobox örneğine bakın)

### 2. Scroll Çalışmıyor

**Sorun**: Uzun listede scroll yok

**Çözüm**:
```typescript
className="max-h-[300px] overflow-auto"
```

### 3. Z-index Sorunları

**Sorun**: Popup diğer elementlerin altında kalıyor

**Çözüm**:
```typescript
// Popover/Dialog için yeterince yüksek z-index
className="z-50"
```

### 4. Mobile Touch Area

**Sorun**: Mobilde butonlara tıklamak zor

**Çözüm**:
```typescript
// Minimum 44x44px touch area
className="min-h-[44px] min-w-[44px]"
```

## 📚 Component Library

### Mevcut Reusable Components

1. **Combobox** (`components/ui/combobox.tsx`)
   - Aranabilir dropdown
   - Width management built-in
   - Keyboard navigation

2. **Button** (`components/ui/button.tsx`)
   - Variants: default, outline, ghost, destructive
   - Sizes: sm, md, lg

3. **Input** (`components/ui/input.tsx`)
   - Standard text input
   - Form entegrasyonu

4. **Dialog** (`components/ui/dialog.tsx`)
   - Modal dialog
   - Responsive

5. **Command** (`components/ui/command.tsx`)
   - Fuzzy search
   - Keyboard shortcuts

## 🔄 Update Checklist

Mevcut bir component'i güncellerken:

1. [ ] Tüm kullanım yerlerini bulun (grep/search)
2. [ ] Breaking change var mı kontrol edin
3. [ ] Props değişikliklerini dokümante edin
4. [ ] TypeScript tip tanımlarını güncelleyin
5. [ ] Tüm kullanım yerlerini test edin
6. [ ] Build başarılı olmalı
7. [ ] Değişiklikleri git commit'e ekleyin

## 💡 Tips

1. **Component isimleri**: PascalCase (`MyComponent`)
2. **File isimleri**: kebab-case (`my-component.tsx`)
3. **Event handlers**: `handleXxx` veya `onXxx` prefix
4. **Boolean props**: `is`, `has`, `should` prefix
5. **Async functions**: `async` keyword kullanın, promise döndürün

## 🚨 Kritik Hatalar - Asla Yapmayın

1. ❌ Popup/dropdown genişliğini trigger'a göre ayarlamamak
2. ❌ Scroll için max-height vermemek
3. ❌ Dark mode desteği eklememek
4. ❌ Responsive tasarım yapmamak
5. ❌ TypeScript tiplerini `any` ile atlamak
6. ❌ Error handling yapmamak
7. ❌ Loading states göstermemek
8. ❌ Accessibility attribute'larını atlamak

---

**Son güncelleme**: 2025-01-20

Bu doküman projeye yeni component eklerken veya mevcut component'leri güncellerken referans olarak kullanılmalıdır.
