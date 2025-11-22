# Google Places API - Maliyet Koruma Sistemi

Bu döküman Google Places API maliyetlerini kontrol altına almak için oluşturulan koruma mekanizmalarını açıklar.

## 📊 Maliyet Tablosu

| API Endpoint | Maliyet | Limit/Dakika | Limit/Saat | Limit/Gün |
|--------------|---------|--------------|------------|-----------|
| Places Autocomplete | $0.017/istek | 10 | 100 | 500 |
| Place Details | $0.017/istek | 5 | 50 | 200 |

**Tahmini Aylık Bütçe:** $100 (≈10,000 istek)

## 🛡️ Koruma Katmanları

### 1. Rate Limiting (Hız Sınırlama)
**Dosya:** `lib/api/rate-limiter.ts`

Kullanıcı başına ve IP başına rate limit:
- **Dakikalık:** 10 istek (autocomplete), 5 istek (details)
- **Saatlik:** 100 istek (autocomplete), 50 istek (details)
- **Günlük:** 500 istek (autocomplete), 200 istek (details)

```typescript
const { allowed, reason } = await checkRateLimit('places/search', userId);
if (!allowed) {
  return NextResponse.json({ error: reason }, { status: 429 });
}
```

### 2. In-Memory Cache
**Dosya:** `lib/api/rate-limiter.ts`

- **TTL:** 5 dakika
- **Max Size:** 1000 entry
- **Stratej:** LRU (Least Recently Used)

Aynı arama 5 dakika içinde tekrar yapılırsa Google API'ye gitmez, cache'den döner.

```typescript
const cached = getCachedSearch(cacheKey);
if (cached) {
  return NextResponse.json(cached); // Google'a istek atmaz
}
```

### 3. Database Tracking
**Migration:** `013_api_usage_tracking.sql`

#### Tablolar:

**`api_usage_logs`** - Her API çağrısını loglar
- user_id, ip_address, endpoint
- cost_units (USD cinsinden)
- request_params, response_status
- created_at

**`api_usage_daily`** - Günlük özet
- date, endpoint
- total_requests, total_cost
- unique_users, unique_ips

**`api_budget`** - Global bütçe kontrolü
- budget_period (daily/monthly)
- max_requests, max_cost
- current_requests, current_cost

**`api_rate_limits`** - Rate limit state'i
- user_id, ip_address, endpoint
- request_count, window_start

#### Functions:

**`check_api_rate_limit()`** - Rate limit kontrolü
```sql
SELECT check_api_rate_limit(
  p_user_id := 'user-uuid',
  p_ip_address := '127.0.0.1',
  p_endpoint := 'places/search',
  p_max_per_minute := 10,
  p_max_per_hour := 100,
  p_max_per_day := 500
);
-- Returns: true/false
```

**`log_api_usage()`** - Kullanım kaydet
```sql
SELECT log_api_usage(
  p_user_id := 'user-uuid',
  p_ip_address := '127.0.0.1',
  p_endpoint := 'places/search',
  p_cost_units := 0.017
);
```

### 4. Global Budget Limit
**Tablo:** `api_budget`

Varsayılan limitler:
- **Aylık İstek Limiti:** 10,000 istek
- **Aylık Maliyet Limiti:** $100

Limit aşılırsa **tüm API çağrıları** reddedilir (429 Too Many Requests).

```sql
-- Check budget
SELECT * FROM api_budget WHERE is_active = true;

-- Reset monthly (otomatik cron job gerekli)
UPDATE api_budget
SET current_requests = 0,
    current_cost = 0,
    period_start = DATE_TRUNC('month', CURRENT_DATE),
    period_end = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
WHERE budget_period = 'monthly';
```

## 🔧 Kullanım

### API Route'larda

```typescript
import { checkRateLimit, logApiUsage, getCachedSearch, setCachedSearch } from '@/lib/api/rate-limiter';

export async function GET(request: NextRequest) {
  // 1. Get user
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Check rate limit
  const { allowed, reason } = await checkRateLimit('places/search', user?.id);
  if (!allowed) {
    return NextResponse.json({ error: reason }, { status: 429 });
  }

  // 3. Check cache
  const cached = getCachedSearch(cacheKey);
  if (cached) return NextResponse.json(cached);

  // 4. Call Google API
  const data = await callGoogleAPI();

  // 5. Cache result
  setCachedSearch(cacheKey, data);

  // 6. Log usage
  await logApiUsage('places/search', user?.id, {
    responseStatus: 200,
    requestParams: { ... }
  });

  return NextResponse.json(data);
}
```

## 📈 Monitoring & Analytics

### Daily Usage Query
```sql
SELECT
  date,
  endpoint,
  total_requests,
  total_cost,
  unique_users,
  unique_ips
FROM api_usage_daily
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC, endpoint;
```

### Top Users by Cost
```sql
SELECT
  u.email,
  COUNT(*) as requests,
  SUM(cost_units) as total_cost
FROM api_usage_logs l
JOIN auth.users u ON u.id = l.user_id
WHERE l.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.id, u.email
ORDER BY total_cost DESC
LIMIT 10;
```

### Current Budget Status
```sql
SELECT
  budget_period,
  current_requests,
  max_requests,
  ROUND((current_requests::DECIMAL / max_requests * 100), 2) as usage_percent,
  current_cost,
  max_cost,
  ROUND((current_cost / max_cost * 100), 2) as cost_percent,
  period_start,
  period_end
FROM api_budget
WHERE is_active = true;
```

## ⚠️ Uyarılar ve Öneriler

### 1. Cache Stratejisi
- ✅ Aynı aramalar için 5 dakika cache
- ✅ Popüler aramalar için cache hit oranı yüksek
- ⚠️ Cache memory'de tutuluyor, server restart'ta kaybolur
- 💡 Redis/Upstash kullanılarak kalıcı cache yapılabilir

### 2. Rate Limit Bypass
- ⚠️ VPN kullanarak IP değiştirerek bypass edilebilir
- ⚠️ Cookie silip yeniden girerek user_id bypass edilebilir
- 💡 Çözüm: Fingerprinting + device tracking eklenebilir

### 3. Budget Monitoring
- ⚠️ Budget aşılması manuel kontrol gerektirir
- 💡 Cron job ile günlük email uyarısı eklenebilir
- 💡 %80 dolulukta otomatik uyarı sistemi

### 4. Denial of Service
- ⚠️ Bot attack'leri rate limiti tetikleyebilir
- 💡 CAPTCHA eklenebilir (çok istek sonrası)
- 💡 Cloudflare rate limiting kullanılabilir

## 🚀 Gelecek İyileştirmeler

1. **Redis Cache** - Sunucu restart'ta cache kaybolmasın
2. **Email Alerts** - Budget %80'e gelince uyarı
3. **Admin Dashboard** - Gerçek zamanlı kullanım grafikleri
4. **User Quotas** - Kullanıcı tiplerine göre farklı limitler (free/premium)
5. **CAPTCHA** - Bot koruması
6. **Auto Scaling** - Talebe göre limit artırma
7. **A/B Testing** - Cache TTL optimizasyonu

## 📞 Acil Durum

### Budget Aşıldı
```sql
-- Tüm API'leri kapat (emergency)
UPDATE api_budget SET max_requests = 0 WHERE is_active = true;

-- Manuel budget artır
UPDATE api_budget SET max_cost = 200.00 WHERE budget_period = 'monthly';
```

### Rate Limit Sıfırla
```sql
-- Specific user için sıfırla
DELETE FROM api_rate_limits WHERE user_id = 'user-uuid';

-- Tüm rate limits sıfırla (dikkatli!)
TRUNCATE api_rate_limits;
```

---

**Son Güncelleme:** 2025-01-22
**Versiyon:** 1.0
