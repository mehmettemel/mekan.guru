# Local Flavours - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+** installed (use `nvm use 20` if you have nvm)
- Supabase account
- Git

### Initial Setup

1. **Clone & Install**
```bash
cd local-flavours
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. **Run Migrations**

Go to Supabase Dashboard → SQL Editor, run in order:
- `001_initial_schema.sql`
- `002_seed_data.sql`
- `003_collections_schema.sql`
- `004_auth_setup.sql`
- `005_add_category_hierarchy.sql`
- `006_add_recommended_items.sql`

4. **Seed Data**
```bash
# Seed locations, cities, districts, and sample places
npm run seed

# Seed hierarchical categories
npm run seed:categories

# (Optional) Seed demo users, collections, and votes for testing
npm run seed:demo
```

**Note**: All seed scripts are idempotent - safe to run multiple times.

5. **Start Development**
```bash
npm run dev
```

Visit: http://localhost:3001

---

## 📋 Common Operations

### Creating a Migration
```bash
# Create new migration file
touch supabase/migrations/007_feature_name.sql
```

### Seed Scripts
```bash
# Seed locations, cities, districts, and sample places
npm run seed

# Seed hierarchical categories
npm run seed:categories

# Seed demo users, collections, and votes (for testing)
npm run seed:demo
```

### Build for Production
```bash
npm run build
npm run start
```

---

## 🎯 Feature Usage

### 1. Homepage Leaderboard

**URL**: `/` or `/?city=ankara`

**Features**:
- View top 20 places by city
- Quick city selector buttons
- Dropdown for all cities
- Upvote/downvote (requires login)
- Smooth transitions

**How to Use**:
1. Visit homepage
2. Click city button or use dropdown
3. Browse places
4. Click 👍/👎 to vote (login required)

---

### 2. My Collections

**URL**: `/my-collections` (requires login)

**Creating a Collection**:
1. Click "Yeni Koleksiyon"
2. Fill in:
   - Name: "İstanbul'un En İyi Dönerci Mekanları"
   - Description: Optional
   - City: Select from dropdown
   - Category: Yemek
   - Subcategory: Döner
3. Click "Mekan Ekle"
4. Choose mode:
   - **Mevcut Mekanlar**: Search existing
   - **Yeni Mekan Oluştur**: Create new
5. Add recommended items (optional):
   - Type item: "Adana Kebap"
   - Press Enter or click +
   - Repeat for more items
6. Click "Oluştur ve Ekle"
7. Repeat to add more places
8. Drag to reorder
9. Click "Oluştur"

**Editing a Collection**:
1. Click edit icon on collection card
2. Modify any field
3. Add/remove/reorder places
4. Update recommended items
5. Click "Güncelle"

---

### 3. Adding Places

**Option A: Search Existing**
1. Click "Mevcut Mekanlar" tab
2. Type place name in search
3. Click search or press Enter
4. Select place from list
5. Add curator note (optional)
6. Add recommended items (optional)
7. Click "Mekan Ekle"

**Option B: Create New**
1. Click "Yeni Mekan Oluştur" tab
2. Enter place name (required)
3. Enter address (optional)
4. System checks for duplicates
5. If similar places found:
   - Review the list
   - Decide: use existing or create new
6. Add curator note (optional)
7. Add recommended items (optional)
8. Click "Oluştur ve Ekle"

**Duplicate Warning Example**:
```
⚠️ Benzer mekanlar bulundu. Aynı mekandan emin misiniz?
• Halil Usta Kebap (Kadıköy, İstanbul)
• Halil Döner (Beşiktaş, İstanbul)
```

---

## 🗂️ Project Structure

```
local-flavours/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Homepage (leaderboard)
│   ├── my-collections/
│   │   └── page.tsx            # User collections
│   └── admin/                   # Admin pages
│       ├── places/
│       ├── categories/
│       └── collections/
├── components/
│   ├── leaderboard/
│   │   └── places-leaderboard.tsx
│   ├── collections/
│   │   ├── edit-collection-modal.tsx
│   │   ├── add-place-dialog.tsx
│   │   └── sortable-place-item.tsx
│   └── ui/                      # shadcn components
├── lib/
│   ├── api/                     # API functions
│   │   ├── places.ts
│   │   ├── collections.ts
│   │   └── locations.ts
│   ├── supabase/                # Supabase clients
│   └── contexts/                # React contexts
├── supabase/
│   └── migrations/              # Database migrations
├── docs/
│   ├── ARCHITECTURE.md          # Full documentation
│   └── QUICK-START.md          # This file
└── scripts/
    └── seed-categories.ts       # Seed scripts
```

---

## 🔑 Key Concepts

### 1. Categories
- **Main**: Yemek, Kafe, Bar, Genel
- **Sub** (under Yemek): Döner, Hamburger, Tatlı, etc.

### 2. Collections
- User-curated lists
- One category + optional subcategory
- Multiple places with drag-and-drop ordering
- Each place can have recommended items

### 3. Recommended Items
- Per place, not per collection
- Array of strings: `["Adana Kebap", "Ayran"]`
- Optional but encouraged
- Helps users know what to order

### 4. Voting
- Upvote (+1) or Downvote (-1)
- Weighted by account age
- One vote per user per place
- Can change vote

### 5. Duplicate Detection
- Checks as you type (3+ chars)
- Case-insensitive
- Turkish character aware
- Shows top 5 similar places

---

## 🛠️ Development Tips

### Hot Reload
Changes auto-reload. If stuck:
```bash
# Stop server (Ctrl+C)
rm -rf .next
npm run dev
```

### Database Changes
Always create migration file:
```sql
-- supabase/migrations/007_add_feature.sql
ALTER TABLE places ADD COLUMN new_field TEXT;
```

Then run in Supabase Dashboard.

### Testing Locally
1. Create test user
2. Create test collection
3. Add places
4. Test voting
5. Test duplicate detection

### Debugging
```typescript
// Add console logs
console.log('Data:', data);

// Check Supabase errors
if (error) {
  console.error('Supabase error:', error);
}
```

---

## 📊 Database Quick Reference

### Get All Cities
```sql
SELECT * FROM locations WHERE type = 'city' ORDER BY names->>'tr';
```

### Get Top Places
```sql
SELECT * FROM places
WHERE status = 'approved'
ORDER BY vote_score DESC
LIMIT 20;
```

### Get User Collections
```sql
SELECT * FROM collections
WHERE creator_id = 'user-id'
ORDER BY created_at DESC;
```

### Get Collection Places
```sql
SELECT cp.*, p.*
FROM collection_places cp
JOIN places p ON cp.place_id = p.id
WHERE cp.collection_id = 'collection-id'
ORDER BY cp.display_order;
```

---

## ⚠️ Common Issues

### Issue: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Supabase connection failed"
Check `.env.local` has correct values from Supabase Dashboard.

### Issue: "Table doesn't exist"
Run migrations in order in Supabase SQL Editor.

### Issue: "Vote not working"
Check user is logged in. Check `votes` table has data.

### Issue: "Duplicate places created"
Normal if addresses are different. Can merge later using admin panel.

---

## 🚢 Deployment

### Vercel
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Environment Variables (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## 📈 Monitoring

### Check Database Size
Supabase Dashboard → Settings → Database → Usage

### Check Logs
Vercel Dashboard → Logs
Supabase Dashboard → Logs

---

## 💡 Pro Tips

1. **Use Command Palette**: `Cmd+K` in Supabase
2. **SQL Editor**: Save common queries
3. **Test Data**: Create test collections first
4. **Git**: Commit often, small changes
5. **Console**: Check browser console for errors

---

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Query](https://tanstack.com/query)

---

## 🆘 Getting Help

1. Check `ARCHITECTURE.md` for details
2. Check Supabase logs
3. Check browser console
4. Google the error message
5. Ask in Discord/Slack

---

## ✅ Checklist: First Time Setup

- [ ] Clone repository
- [ ] Install Node.js 20+ (use `nvm use 20` if you have nvm)
- [ ] Install dependencies (`npm install`)
- [ ] Setup `.env.local` with Supabase credentials
- [ ] Run all migrations in Supabase SQL Editor (in order):
  - [ ] `001_initial_schema.sql`
  - [ ] `002_seed_data.sql`
  - [ ] `003_collections_schema.sql`
  - [ ] `004_auth_setup.sql`
  - [ ] `005_add_category_hierarchy.sql`
  - [ ] `006_add_recommended_items.sql`
- [ ] Seed locations and places (`npm run seed`)
- [ ] Seed categories (`npm run seed:categories`)
- [ ] (Optional) Seed demo data (`npm run seed:demo`)
- [ ] Start dev server (`npm run dev`)
- [ ] Visit http://localhost:3001
- [ ] Create test user (signup)
- [ ] Create test collection
- [ ] Add test place
- [ ] Test collection voting
- [ ] Test duplicate detection

---

## 🎉 Ready to Go!

You're all set! Start building and enjoy Local Flavours.

**Need help?** Check ARCHITECTURE.md for deep dives.

**Happy coding!** 🚀
