# Production Authentication Debug Guide

## Problem
Localhost'ta sayfa yenilendiğinde kullanıcı bilgileri korunuyor ama production'da kayboluyor.

## Debug Adımları

### 1. Production Console Loglarını İnceleyin

Production'a deploy ettikten sonra, tarayıcı console'unda şu logları göreceksiniz:

```
🔧 [SUPABASE CLIENT] Creating client...
🔧 [SUPABASE CLIENT] Environment: production
🔧 [SUPABASE CLIENT] Cookie domain: undefined
✅ [SUPABASE CLIENT] Client created successfully

🔄 [AUTH] Initializing auth...
=== AUTH DEBUG ===
Hostname: your-domain.vercel.app
Origin: https://your-domain.vercel.app
Protocol: https:
Supabase localStorage keys: [...]
Supabase cookies: X
=== END DEBUG ===

🔄 [AUTH] Initial session: EXISTS / NULL
```

### 2. Kontrol Edilecek Noktalar

#### A. Session Var mı?
Console'da şunu göreceksiniz:
- ✅ `🔄 [AUTH] Initial session: EXISTS` → Session bulundu
- ❌ `🔄 [AUTH] Initial session: NULL` → Session bulunamadı

**Eğer NULL ise:**
- localStorage kontrol edin (AUTH DEBUG kısmında gösterilir)
- Cookie'leri kontrol edin (AUTH DEBUG kısmında gösterilir)

#### B. Profile Fetch Ediliyor mu?
```
📥 [AUTH] Fetching profile...
✅ [AUTH] Profile fetched: SUCCESS
```

**Eğer FAILED ise:**
- Database bağlantısı sorunlu olabilir
- RLS (Row Level Security) kuralları engelliyor olabilir

#### C. Auth Events Tetikleniyor mu?
Sayfa yenilendiğinde şunları görmeli siniz:
```
🔔 [AUTH] Auth state changed: INITIAL_SESSION
🔔 [AUTH] New session: EXISTS
📥 [AUTH] Fetching profile for event: INITIAL_SESSION
✅ [AUTH] Profile result: SUCCESS
```

### 3. Muhtemel Sorunlar ve Çözümleri

#### Sorun 1: localStorage'da Token Yok
**Belirti:**
```
Supabase localStorage keys: []
```

**Çözüm:**
- Supabase dashboard'da redirect URL'leri kontrol edin
- `https://your-domain.vercel.app/**` allowed olmalı

#### Sorun 2: Cookie Domain Sorunu
**Belirti:**
```
Supabase cookies: 0
```

**Çözüm:**
Cookie domain'i zaten `undefined` olarak ayarladık, bu doğru.
Eğer hala sorun varsa:
1. Tarayıcı DevTools → Application → Cookies kontrol edin
2. `sb-` ile başlayan cookie'ler olmalı

#### Sorun 3: Session Bulunuyor ama Profile NULL
**Belirti:**
```
🔄 [AUTH] Initial session: EXISTS
✅ [AUTH] User ID: xxx-xxx-xxx
📥 [AUTH] Fetching profile...
❌ [FETCH PROFILE] Error: Row not found
```

**Çözüm:**
- Database'de bu user ID ile kullanıcı var mı kontrol edin
- RLS policies'i kontrol edin:
```sql
-- Users tablosu için RLS policy
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);
```

#### Sorun 4: INITIAL_SESSION Event Tetiklenmiyor
**Belirti:**
```
🔔 [AUTH] Auth state changed: SIGNED_OUT
```

**Çözüm:**
- Supabase client singleton problemi olabilir
- Tarayıcı cache'i temizleyin
- Hard refresh yapın (Cmd+Shift+R / Ctrl+Shift+R)

### 4. Supabase Dashboard Kontrolleri

#### A. Authentication → URL Configuration
```
Site URL: https://your-domain.vercel.app
Redirect URLs:
  - https://your-domain.vercel.app/**
  - http://localhost:3000/**
```

#### B. Authentication → Providers
- Email provider enabled olmalı
- Confirm email: İsterseniz disable edebilirsiniz (development için)

#### C. Database → RLS Policies
Users tablosu için gerekli policy'ler:
```sql
-- Herkes kendi profilini görebilir
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Herkes kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);
```

### 5. Environment Variables
`.env.local` dosyanızda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**Vercel'de:**
- Environment Variables kısmına aynı değerleri ekleyin
- "Production" environment seçin
- Redeploy edin

### 6. Test Senaryosu

1. **Production'da Login Olun**
   - Console'u açın
   - Login yapın
   - Logları kaydedin

2. **Sayfa Yenileyin**
   - F5 veya Cmd+R ile yenileyin
   - Console loglarını kontrol edin:
     - Session EXISTS olmalı
     - Profile SUCCESS olmalı

3. **Yeni Tab Açın**
   - Aynı site'ı yeni tab'de açın
   - Session korunmalı
   - Profile otomatik yüklenmeli

### 7. Çözüm Bulunamadıysa

Console loglarının screenshot'unu alın ve şunları kontrol edin:

1. **Session var mı?** (INITIAL_SESSION eventi)
2. **Profile fetch ediliyor mu?** (FETCH PROFILE logları)
3. **localStorage'da token var mı?** (AUTH DEBUG kısmı)
4. **Cookie'ler set ediliyor mu?** (AUTH DEBUG kısmı)

## Hızlı Fix: Debug Logları Kapatma

Production'da log'ları istemiyorsanız:

`lib/contexts/auth-context.tsx` ve `lib/supabase/client.ts` dosyalarındaki
`console.log()` satırlarını yoruma alın veya silin.

## Test URL'leri

Localhost: http://localhost:3000
Production: https://your-domain.vercel.app

Her ikisinde de aynı davranışı görmeli siniz.
