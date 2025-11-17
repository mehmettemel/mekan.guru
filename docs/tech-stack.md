# LocalFlavors - Technical Stack & Architecture

## Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend & Database](#backend--database)
4. [Internationalization (i18n)](#internationalization-i18n)
5. [State Management](#state-management)
6. [Styling & UI](#styling--ui)
7. [Development Tools](#development-tools)
8. [Deployment & DevOps](#deployment--devops)
9. [Project Structure](#project-structure)

---

## Tech Stack Overview

### Core Technologies
```
Next.js 16.0.2       - React framework with App Router
React 19.0.0         - UI library
TypeScript 5.x       - Type-safe development
Supabase             - Backend-as-a-Service (PostgreSQL + Auth + Storage)
Tailwind CSS 4.x     - Utility-first CSS framework
```

### Key Libraries
```
@tanstack/react-query 5.90  - Data fetching & caching
zustand 5.0.8               - State management
shadcn/ui                   - Component library
lucide-react                - Icon library
@dnd-kit/core               - Drag and drop functionality
@dnd-kit/sortable           - Sortable drag and drop
framer-motion               - Animations
next-themes                 - Dark mode support
react-hook-form             - Form management
zod                         - Schema validation
```

---

## Frontend Architecture

### Next.js 16 with App Router

We use Next.js 16's App Router architecture, which provides:
- **Server Components by default**: Better performance and SEO
- **Client Components**: For interactivity (`'use client'` directive)
- **Nested Layouts**: Shared UI across routes
- **Route Groups**: Organize routes without affecting URL structure

#### File Structure
```
app/
├── layout.tsx              # Root layout (providers, fonts)
├── page.tsx                # Home page (server component)
├── admin/                  # Admin dashboard (client components)
│   ├── layout.tsx          # Admin layout with sidebar
│   ├── page.tsx            # Dashboard overview
│   ├── places/             # Places management
│   ├── locations/          # Locations management
│   ├── categories/         # Categories management
│   └── collections/        # Collections management
├── collections/            # Public collections
│   ├── page.tsx           # Browse all collections
│   └── [slug]/            # Collection detail page
├── my-collections/        # User collections (protected)
│   └── page.tsx           # User's collections dashboard
├── favorites/              # User favorites (protected)
│   └── page.tsx           # Voted collections
├── profile/                # User profiles
│   └── [username]/        # Individual profile page
├── turkey/                 # Location pages
│   └── [city]/            # City pages
└── globals.css             # Global styles
```

### Server vs Client Components

**Server Components** (default):
- Used for: Layouts, static pages, data fetching pages
- Benefits: Zero JavaScript to client, better SEO, faster initial load
- Examples: `app/[locale]/page.tsx`, `app/[locale]/layout.tsx`

```typescript
// Server Component Example
export default async function HomePage() {
  const cities = await getCitiesByCountry('turkey'); // Direct DB query

  return (
    <div>
      <h1>Otantik Yerel Lezzetleri Keşfet</h1>
      {cities.map(city => <CityCard key={city.id} city={city} />)}
    </div>
  );
}
```

**Client Components** (`'use client'`):
- Used for: Interactive UI, forms, React hooks, state management
- Benefits: Full React features, browser APIs access
- Examples: Admin pages, dialogs, theme toggle

```typescript
// Client Component Example
'use client';

export default function AdminPlacesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createClient(); // Client-side Supabase

  const { data: places } = useQuery({
    queryKey: ['admin-places'],
    queryFn: async () => {
      const { data } = await supabase.from('places').select('*');
      return data;
    },
  });

  return <PlacesList places={places} />;
}
```

### TypeScript Configuration

Full type safety across the project:

```typescript
// Strict TypeScript settings
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Database Types**: Auto-generated from Supabase schema
```typescript
// types/database.ts
export type Database = {
  public: {
    Tables: {
      places: {
        Row: { id: string; slug: string; /* ... */ }
        Insert: { /* ... */ }
        Update: { /* ... */ }
      }
      // ... other tables
    }
  }
}
```

---

## Backend & Database

### Supabase (PostgreSQL)

Supabase provides a complete backend solution:
- **PostgreSQL Database**: Relational database with full SQL support
- **Row Level Security (RLS)**: Database-level security policies
- **Real-time Subscriptions**: Live data updates
- **Edge Functions**: Serverless functions
- **Storage**: File uploads and management
- **Authentication**: Fully implemented with Supabase Auth (email/password, email verification, password reset)

### Database Architecture

#### Schema Design

**Key Tables:**

1. **users** - User accounts and profiles
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  account_age_days INTEGER GENERATED ALWAYS AS
    (EXTRACT(DAY FROM (NOW() - created_at))) STORED
);
```

2. **locations** - Hierarchical location structure
```sql
CREATE TYPE location_type AS ENUM ('country', 'city', 'district');

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES locations(id),
  type location_type NOT NULL,
  slug VARCHAR(100) NOT NULL,
  names JSONB NOT NULL,  -- {"en": "Istanbul", "tr": "İstanbul"}
  path TEXT,             -- Materialized path: /turkey/istanbul
  has_districts BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
);
```

3. **categories** - Place categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  names JSONB NOT NULL,  -- Multi-language names
  icon VARCHAR(50),      -- Lucide icon name
  display_order INTEGER DEFAULT 0
);
```

4. **places** - Main content (restaurants, cafes, etc.)
```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id),
  category_id UUID REFERENCES categories(id),
  slug VARCHAR(100) UNIQUE NOT NULL,
  names JSONB NOT NULL,
  descriptions JSONB NOT NULL,
  address TEXT,
  images TEXT[],         -- Array of image URLs
  status VARCHAR(20) DEFAULT 'pending',
  vote_score INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  vote_percentage DECIMAL(5, 2) DEFAULT 0,
  trust_score DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. **votes** - User voting records
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  place_id UUID REFERENCES places(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);
```

6. **reports** - Content moderation
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID REFERENCES places(id),
  user_id UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

7. **rate_limits** - Anti-spam protection
```sql
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  ip_address INET,
  action_type VARCHAR(50) NOT NULL,
  action_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Functions & Triggers

**Vote Weight Calculation:**
```sql
CREATE OR REPLACE FUNCTION calculate_vote_weight(user_account_age INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  RETURN CASE
    WHEN user_account_age < 30 THEN 0.5
    WHEN user_account_age < 90 THEN 0.75
    WHEN user_account_age < 180 THEN 1.0
    ELSE 1.2
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

**Auto-update Place Rankings:**
```sql
CREATE OR REPLACE FUNCTION update_place_vote_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE places
  SET
    vote_score = (
      SELECT COALESCE(SUM(calculate_vote_weight(
        EXTRACT(DAY FROM (NOW() - u.created_at))::INTEGER
      )), 0)
      FROM votes v
      JOIN users u ON v.user_id = u.id
      WHERE v.place_id = NEW.place_id
    ),
    total_votes = (
      SELECT COUNT(*) FROM votes WHERE place_id = NEW.place_id
    ),
    updated_at = NOW()
  WHERE id = NEW.place_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_place_stats_on_vote
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_place_vote_stats();
```

### Supabase Client Setup

**Server-Side Client** (`lib/supabase/server.ts`):
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

**Client-Side Client** (`lib/supabase/client.ts`):
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Usage Pattern:**
- Server Components: Use `lib/supabase/server.ts`
- Client Components: Use `lib/supabase/client.ts`
- API Routes: Use `lib/supabase/server.ts`

### Row Level Security (RLS)

Security policies at the database level:

```sql
-- Enable RLS
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Public read access for approved places
CREATE POLICY "Public can view approved places"
ON places FOR SELECT
USING (status = 'approved');

-- Authenticated users can submit places
CREATE POLICY "Authenticated users can insert places"
ON places FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own pending submissions
CREATE POLICY "Users can update own pending places"
ON places FOR UPDATE
USING (
  user_id = auth.uid()
  AND status = 'pending'
);
```

---

## Multi-Language Content Support

### Database-Level Internationalization

The platform stores all user-facing content in multiple languages at the database level using JSONB fields. While the UI is currently in Turkish, the data structure supports full internationalization.

### Implementation

**Content Storage Pattern:**
All content tables use JSONB fields for multi-language support:

```sql
-- Example: places table
names JSONB NOT NULL,        -- {"en": "Karaköy Lokantası", "tr": "Karaköy Lokantası"}
descriptions JSONB NOT NULL  -- {"en": "Traditional...", "tr": "Geleneksel..."}
```

**Accessing Multi-Language Content:**
```typescript
// In components
const locale = 'tr'; // Currently hardcoded, can be dynamic in future
const names = place.names as { en: string; tr: string };
const placeName = names[locale] || names.en; // Fallback to English
```

### Multi-Language Content in Database

All user-facing content stored as JSONB:

```typescript
// Place with multi-language content
{
  names: {
    en: "Karaköy Lokantası",
    tr: "Karaköy Lokantası"
  },
  descriptions: {
    en: "Traditional Turkish restaurant with amazing mezes",
    tr: "Muhteşem mezeleri olan geleneksel Türk restoranı"
  }
}
```

**Accessing in components:**
```typescript
// Currently using Turkish as default, but structure supports future i18n
const locale = 'tr'; // Can be made dynamic in future
const names = place.names as { en: string; tr: string };
const placeName = names[locale] || names.en; // Fallback to English
```

---

## State Management

### React Query (@tanstack/react-query)

Primary data fetching and caching solution:

**Setup** (`components/providers/query-provider.tsx`):
```typescript
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Usage Example:**
```typescript
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function PlacesList() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: places, isLoading } = useQuery({
    queryKey: ['places'],
    queryFn: async () => {
      const { data } = await supabase.from('places').select('*');
      return data;
    },
  });

  // Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('places').delete().eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });

  return (
    <div>
      {places?.map(place => (
        <PlaceCard
          key={place.id}
          place={place}
          onDelete={() => deleteMutation.mutate(place.id)}
        />
      ))}
    </div>
  );
}
```

### Authentication Context

Custom React context for authentication state management:

**Auth Context** (`lib/contexts/auth-context.tsx`):
```typescript
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();

  // Sign up, sign in, sign out functions
  // Profile fetching and updates
  // Session management

  return (
    <AuthContext.Provider value={{ user, profile, signUp, signIn, signOut, ... }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

**Usage:**
```typescript
'use client';
import { useAuth } from '@/lib/contexts/auth-context';

export function Component() {
  const { user, profile, signOut } = useAuth();
  // ...
}
```

---

## Styling & UI

### Tailwind CSS 4.x

Utility-first CSS framework with custom configuration:

**Config** (`tailwind.config.ts`):
```typescript
export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom orange theme
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        // ... other colors
      },
    },
  },
  plugins: [],
};
```

**Global Styles** (`app/globals.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Orange color theme in OKLCH color space */
    --primary: oklch(0.617 0.204 41.75);
    --secondary: oklch(0.269 0.041 62.36);
    /* ... other CSS variables */
  }

  .dark {
    --primary: oklch(0.717 0.184 51.27);
    --secondary: oklch(0.269 0.041 62.36);
    /* ... dark mode variables */
  }
}
```

### shadcn/ui Components

High-quality, accessible React components:

**Installation:**
```bash
npx shadcn@latest init
npx shadcn@latest add button dialog table input label
```

**Components Used:**
- `Button` - Various actions
- `Dialog` - Modals for CRUD operations
- `Table` - Data tables in admin
- `Input`, `Label`, `Textarea` - Form fields
- `Select` - Dropdowns
- `Card` - Content containers
- `Badge` - Status indicators
- `Separator` - Visual dividers

**Usage:**
```typescript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

<Dialog open={isOpen}>
  <DialogContent>
    <h2>Create Place</h2>
    <Button>Save</Button>
  </DialogContent>
</Dialog>
```

### Dark Mode (next-themes)

System-aware dark mode support:

**Setup** (`components/providers/theme-provider.tsx`):
```typescript
'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

**Theme Toggle** (`components/theme-toggle.tsx`):
```typescript
'use client';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block" />
    </button>
  );
}
```

### Lucide React Icons

Modern, customizable icon library:

```typescript
import { MapPin, Store, Coffee, Utensils } from 'lucide-react';

<MapPin className="h-6 w-6 text-primary" />
```

---

## Development Tools

### TypeScript
- Full type safety
- Auto-generated database types from Supabase
- Strict mode enabled

### ESLint
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

### Prettier
Code formatting with Tailwind CSS plugin:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Turbopack
Next.js 16's new bundler (faster than Webpack):
```bash
next dev --turbo
```

---

## Deployment & DevOps

### Vercel (Recommended)

**Deployment:**
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Auto-deploy on push to main

**Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Database Migrations

Run migrations in order:
```bash
# 1. Create tables and schema
psql -f supabase/migrations/001_initial_schema.sql

# 2. Seed initial data
psql -f supabase/migrations/002_seed_data.sql

# Or use the seed script
npm run seed
```

---

## Project Structure

```
local-flavours/
├── app/
│   ├── layout.tsx                  # Root layout (providers, fonts)
│   ├── page.tsx                    # Home page
│   ├── admin/                      # Admin dashboard (client components)
│   │   ├── layout.tsx              # Admin layout with sidebar
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── places/                 # Places CRUD
│   │   ├── locations/              # Locations CRUD
│   │   ├── categories/             # Categories CRUD
│   │   └── collections/            # Collections CRUD
│   ├── collections/                # Public collections
│   │   ├── page.tsx               # Browse all collections
│   │   └── [slug]/                # Collection detail page
│   ├── my-collections/             # User collections (protected)
│   │   └── page.tsx               # User's collections dashboard
│   ├── favorites/                  # User favorites (protected)
│   │   └── page.tsx               # Voted collections
│   ├── profile/                     # User profiles
│   │   └── [username]/            # Individual profile page
│   ├── turkey/                      # Location pages
│   │   └── [city]/                 # City pages
│   └── globals.css                  # Global styles & theme
│
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── admin/                      # Admin-specific components
│   │   ├── place-dialog.tsx        # Place CRUD modal
│   │   ├── location-dialog.tsx     # Location CRUD modal
│   │   ├── category-dialog.tsx     # Category CRUD modal
│   │   └── collection-dialog.tsx   # Collection CRUD modal
│   ├── locations/
│   │   └── city-card.tsx           # City display card
│   ├── providers/
│   │   ├── theme-provider.tsx      # Dark mode provider
│   │   └── query-provider.tsx      # React Query provider
│   ├── theme-toggle.tsx            # Dark mode toggle
│   ├── collections/                # Collection components
│   │   ├── collection-card.tsx     # Collection display card
│   │   ├── collection-dialog.tsx   # Create/Edit dialog
│   │   ├── collection-detail-client.tsx # Detail page with drag-drop
│   │   ├── sortable-place-item.tsx # Draggable place card
│   │   └── add-place-dialog.tsx    # Search and add places
│   └── auth/                       # Authentication components
│       ├── auth-button.tsx         # User menu with auth
│       ├── login-dialog.tsx        # Login modal
│       ├── signup-dialog.tsx       # Signup modal
│       └── reset-password-dialog.tsx # Password reset
│
├── lib/
│   ├── api/                        # API functions (server-side only)
│   │   ├── locations.ts
│   │   ├── places.ts
│   │   ├── collections.ts          # Collection CRUD operations
│   │   └── auth.ts                 # Authentication helpers
│   ├── contexts/                   # React contexts
│   │   └── auth-context.tsx        # Authentication context
│   ├── supabase/                   # Supabase clients
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client
│   │   └── middleware.ts          # Middleware utilities
│   └── utils.ts                    # Helper functions (cn, etc.)
│
├── types/
│   └── database.ts                 # Generated Supabase types
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  # Database schema
│       ├── 002_seed_data.sql       # Initial seed data
│       └── 003_collections_schema.sql # Collections system
│
├── scripts/
│   └── seed-supabase.ts            # Seeding script
│
├── docs/                           # Documentation
│   ├── project-overview.md         # Project details
│   └── tech-stack.md               # This file
│
├── .env.local                      # Environment variables (gitignored)
├── .env.example                    # Example env file
├── components.json                 # shadcn/ui config
├── middleware.ts                   # Next.js middleware (auth & protected routes)
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
└── package.json                    # Dependencies
```

---

## Performance Optimizations

1. **Server-Side Rendering (SSR)**: Initial page load with data
2. **Static Generation**: Pre-render pages at build time where possible
3. **React Query Caching**: Minimize database queries
4. **Edge Runtime**: Deploy to Vercel Edge for low latency
5. **Image Optimization**: Next.js Image component (planned)
6. **Code Splitting**: Automatic with Next.js App Router
7. **Database Indexing**: Indexed columns for fast queries

---

## Security Best Practices

1. **Row Level Security (RLS)**: Database-level access control
2. **Environment Variables**: Secrets never in code
3. **Rate Limiting**: Prevent abuse
4. **Input Validation**: Zod schemas for forms (planned)
5. **SQL Injection Prevention**: Parameterized queries via Supabase client
6. **XSS Protection**: React's built-in escaping
7. **CSRF Protection**: SameSite cookies

---

## Testing Strategy (Future)

### Unit Tests
- **Framework**: Jest + React Testing Library
- **Coverage**: Components, utilities, API functions

### Integration Tests
- **Framework**: Playwright
- **Coverage**: User flows, admin CRUD operations

### E2E Tests
- **Framework**: Playwright
- **Coverage**: Critical paths (voting, place submission)

---

## Monitoring & Analytics (Future)

1. **Vercel Analytics**: Core Web Vitals, page performance
2. **Sentry**: Error tracking
3. **PostHog**: Product analytics, feature flags
4. **Supabase Logs**: Database query performance

---

**Tech Stack Version:** 2.0.0
**Last Updated:** 2025-01-XX
**Maintained By:** LocalFlavors Team

## Recent Updates

### v2.0.0 (Current)
- ✅ Removed next-intl (simplified routing, no locale prefix)
- ✅ Full authentication system implemented (Supabase Auth)
- ✅ User profiles with following system
- ✅ Collections CRUD fully functional (user-facing)
- ✅ Favorites page for voted collections
- ✅ Drag & drop place reordering in collections
- ✅ Protected routes with middleware
- ✅ Role-based access control (user/moderator/admin)
