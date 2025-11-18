# 🍊 LocalFlavors - Community-Driven Local Recommendations

Discover authentic restaurants, cafes, and hidden gems through community-curated collections and democratic voting.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run migrations (see MIGRATION_GUIDE.md)
# Use Supabase Dashboard → SQL Editor
# Run: scripts/minimal-auth-setup.sql
# Run: supabase/migrations/003_collections_schema.sql

# 4. Start development server
npm run dev

# 5. Open browser
open http://localhost:3000
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[docs/QUICK-START.md](./docs/QUICK-START.md)** | 🚀 Quick setup & usage guide |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | 🏗️ Complete system architecture |
| **[docs/project-overview.md](./docs/project-overview.md)** | 📖 Project overview & features |
| **[docs/tech-stack.md](./docs/tech-stack.md)** | 🛠️ Technology stack details |

## ✨ Features

### ✅ MVP Complete
- **🏆 Leaderboard System**
  - Top 20 places by city with live voting
  - 🥇🥈🥉 Medal rankings for top 3
  - 👍👎 Upvote/downvote buttons
  - Weighted voting based on account age
  - Smooth city transitions
  - Category filtering with emojis

- **📚 Collections System**
  - User-curated lists of places
  - Hierarchical categories (Main + Subcategories)
  - Drag & drop place ordering
  - Recommended items per place (e.g., "Adana Kebap", "Ayran")
  - Search existing or create new places
  - Smart duplicate detection
  - Curator notes for each place

- **🏪 Place Management**
  - Auto-approved place creation (MVP)
  - Duplicate warning system
  - Minimal required fields (name + address)
  - Multi-language support (Turkish/English)
  - Vote score calculation

- **🔐 Authentication**
  - Email/password signup & signin
  - Protected routes
  - User profiles
  - Role-based access
  - Notification preferences
  - Account stats

- **Admin Dashboard**
  - Real-time stats
  - Places CRUD
  - Locations CRUD
  - Categories CRUD
  - Collections CRUD
  - Featured collections toggle

- **Core System**
  - Multi-language support (EN/TR)
  - Dark mode
  - Responsive design
  - Location hierarchy
  - Category system
  - Collections database & triggers

### 🔄 In Progress
- Public collection browsing UI
- Collection creation (user-facing)
- Voting interface
- Search & filters

### 📋 Planned
- User profile pages
- Following system UI
- Collection discovery
- Mobile app
- Real-time notifications

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **State Management:** React Query + Zustand
- **i18n:** next-intl

## 📂 Project Structure

```
local-flavours/
├── app/
│   └── [locale]/              # Locale-based routing
│       ├── admin/             # Admin dashboard
│       ├── settings/          # User settings
│       └── auth/              # Auth routes
├── components/
│   ├── auth/                  # Auth components
│   ├── admin/                 # Admin components
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── api/                   # API functions
│   ├── contexts/              # React contexts
│   └── supabase/              # Supabase clients
├── supabase/migrations/       # Database migrations
└── scripts/                   # Utility scripts
```

## 🧪 Testing

See **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** for comprehensive testing scenarios.

**Quick Test:**
```bash
# 1. Start server
npm run dev

# 2. Sign up
http://localhost:3000 → Sign Up

# 3. Verify email
Check inbox → Click verification link

# 4. Access admin (after setting role)
http://localhost:3000/admin
```

## 🔐 Admin Access

```sql
-- Grant admin role to your user
UPDATE users
SET role = 'admin'
WHERE email = 'your@email.com';
```

Then logout and login again.

## 🗄️ Database Setup

### Option 1: Supabase Dashboard (Easy)
1. Go to Supabase Dashboard → SQL Editor
2. Run `scripts/minimal-auth-setup.sql`
3. Run `supabase/migrations/003_collections_schema.sql`

### Option 2: Supabase CLI
```bash
supabase db push
```

See **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** for detailed instructions.

## 🔧 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📦 NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... etc
```

### Supabase Configuration
1. Update Site URL to production domain
2. Add production URLs to Redirect URLs
3. Enable email confirmation
4. Customize email templates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues:** GitHub Issues
- **Docs:** See `/docs` folder
- **Discord:** (Coming soon)

## 🎯 Roadmap

### Phase 1 - MVP (Current)
- [x] Core platform architecture
- [x] Authentication system
- [x] Admin dashboard
- [x] Collections database
- [ ] Public collection browsing
- [ ] Voting system

### Phase 2 - Community Features
- [ ] User profiles
- [ ] Following system
- [ ] Collection discovery
- [ ] Social sharing
- [ ] Notifications

### Phase 3 - Advanced Features
- [ ] Flavor pairing system
- [ ] Comparative battles
- [ ] Mobile apps
- [ ] Real-time updates
- [ ] AI recommendations

## 📊 Stats

- **Collections:** User-curated place lists
- **Voting:** Community-driven rankings
- **Multi-language:** Full EN/TR support
- **Scalable:** Built for global expansion

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- shadcn for the beautiful UI components
- Vercel for hosting

---

**LocalFlavors** - Where personal curation meets community wisdom.

Built with ❤️ using Next.js, TypeScript, and Supabase.
