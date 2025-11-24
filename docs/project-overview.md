# LocalFlavors - Project Overview

## What is LocalFlavors?

LocalFlavors is a community-driven platform designed to help people discover authentic restaurants, cafes, and hidden gems in cities around the world. Unlike traditional review platforms, LocalFlavors uses a unique collection-based voting system where users create curated lists of their favorite places, and the community votes on these collections to determine the true top 20 places in each location.

## Core Mission

Our mission is to create a reliable, community-powered platform that helps travelers and locals discover the best dining experiences in any city, starting with Turkey. We believe in the power of collective curation and democratic voting - where individual taste meets community wisdom to surface truly exceptional places.

## Key Features

### 1. **Hierarchical Location System**

- **Country Level**: Starting with Turkey, expandable to other countries
- **City Level**: Major cities like Istanbul, Ankara, Izmir, Adana, etc.
- **District Level**: Detailed district-level browsing for large cities (e.g., Kadıköy, Beşiktaş in Istanbul)

This hierarchical structure allows users to browse from broad to specific locations, making discovery intuitive and organized.

### 2. **Collection-Based Curation System** 🆕

**How It Works:**

- **Users Create Collections**: Registered users create curated collections for specific locations and categories (e.g., "Mehmet's Top 10 Kebab Places in Adana")
- **Community Votes on Collections**: Other users vote on entire collections, indicating trust in that curator's taste
- **Places Accumulate Votes**: Each place in a collection receives votes when the collection is voted on
- **Top 20 Emerges**: The platform aggregates all votes across all collections to determine the definitive Top 20 for each location/category

**Example Flow:**

1. User A creates "Best Breakfast Spots in Kadıköy" (10 places)
2. User B creates "Hidden Breakfast Gems in Kadıköy" (8 places)
3. Community members vote on these collections
4. Places that appear in multiple highly-voted collections rise to the top
5. Final Top 20 reflects collective wisdom from multiple curators

**Why This Is Unique:**

- Personal curation meets democratic validation
- Prevents single-point-of-failure bias (no one person controls rankings)
- Rewards good curators with visibility
- Creates engaging content through diverse perspectives
- Natural quality filter (bad collections get fewer votes)

### 3. **Weighted Voting System**

- **Collection-Level Voting**: Users vote on entire collections
- **Vote Weight by Account Age**: Prevents manipulation
  - Accounts < 30 days: 0.5x weight
  - Accounts 30-90 days: 0.75x weight
  - Accounts 90-180 days: 1.0x weight
  - Accounts > 180 days: 1.2x weight
- **Trust Score**: Collections and places earn trust scores based on vote patterns
- **Top 20 Calculation**: Aggregated from all collection votes

### 4. **Turkish-First Content**

The platform is currently focused on the Turkish market. While the database structure supports multi-language content (JSONB fields), the application logic and UI are optimized for Turkish users.

### 5. **Hierarchical Category-Based Discovery**

Places are organized into intuitive main categories with detailed subcategories:

**Main Categories:**

- **🍽️ Yemek (Food)**: Restaurants and food establishments
- **☕ Kafe (Cafe)**: Coffee shops and casual dining
- **💎 Hidden Gem**: Unique, lesser-known local favorites
- **🍺 Bar & Pub**: Nightlife and social venues

**Food Subcategories** (for detailed browsing):

- 🍕 Pideci (Pide restaurants)
- 🥙 Kebapçı (Kebab restaurants)
- 🍔 Hamburgerci (Burger joints)
- 🌯 Dürümcü (Wrap restaurants)
- 🍰 Tatlıcı (Dessert shops)
- 🍜 Çorbacı (Soup restaurants)
- 🥘 Ev Yemekleri (Home-style cooking)
- 🐟 Balık & Deniz Ürünleri (Fish & Seafood)
- 🍕 Pizza
- 🍝 İtalyan (Italian cuisine)
- 🌮 Uluslararası Mutfak (International cuisine)

Collections can be created for any location + category combination, allowing for highly specific curation.

### 6. **Admin Dashboard**

A comprehensive admin panel for content management:

- **Places Management**: Create, edit, and moderate place listings
- **Collections Management**: Monitor and moderate user-created collections
- **Locations Management**: Manage countries, cities, and districts
- **Categories Management**: Organize and maintain main categories and subcategories
- **Approval System**: Review and approve community-submitted places and collections
- **Analytics**: View collection engagement, voting patterns, and trending places

### 7. **Collection Creation & Management**

- **Easy Collection Builder**: Users can search and add places to their collections
- **Collection Themes**: Collections can have specific themes (e.g., "Budget-Friendly", "Romantic Dates", "Late Night Eats")
- **Collaborative Collections**: (Future) Multiple users can contribute to a single collection
- **Collection Updates**: Creators can update their collections, maintaining freshness
- **Collection Discovery**: Browse popular collections, follow favorite curators

### 8. **Rate Limiting & Anti-Spam**

- **Collection Creation Limiting**: Users can create 3 collections per week
- **Vote Rate Limiting**: Users limited to 20 collection votes per day
- **Quality Control**: Collections with no votes for 90 days may be archived
- **IP-based & User-based Tracking**: Prevents abuse from both authenticated and anonymous users

## Target Audience

### Primary Users

1. **Travelers**: People visiting Turkey looking for authentic local experiences through trusted collections
2. **Locals**: Residents sharing their insider knowledge through curated collections
3. **Expats**: International residents creating guides for their adopted cities
4. **Food Enthusiasts**: People passionate about culinary experiences who want to share their discoveries
5. **Curators**: Users who love organizing and sharing recommendations

### Use Cases

- A local creating "My Favorite Hidden Breakfast Spots in Kadıköy" collection
- A traveler finding "Best First-Time Visitor Restaurants in Istanbul" curated by locals
- An expat building "Vegetarian-Friendly Adana" collection
- A food blogger creating themed collections for different occasions
- Community members voting on collections that match their taste

## How It Works

### For Visitors (Unauthenticated Users)

1. Browse locations hierarchically (Turkey → Istanbul → Kadıköy)
2. View the top 20 places in any location (aggregated from all collections)
3. Filter by main category (Yemek, Kafe, Bar, Hidden Gem)
4. Drill down to subcategories (e.g., Yemek → Pideci)
5. Browse popular collections for that location
6. See which collections feature each place
7. View collection details and vote counts

### For Registered Users

1. All visitor features, plus:
2. **Create Collections**: Build curated lists for specific locations/categories
3. **Vote on Collections**: Support collections that match your taste
4. **Follow Curators**: Keep track of users whose taste you trust
5. **Build Reputation**: Gain followers as your collections earn votes
6. **Track Collection Performance**: See how your collections are performing
7. **Suggest New Places**: Add places not yet in the system
8. **Comment on Collections**: Engage with curators (Future feature)

### For Administrators

1. Access admin dashboard at `/admin`
2. Review and approve submitted places
3. Moderate collections (remove spam/inappropriate content)
4. Manage locations (add new cities/districts)
5. Organize main categories and subcategories
6. View analytics on collection engagement
7. Featured collections curation

## Content Structure

### Collections (New Core Entity)

Each collection contains:

- **Title**: "Mehmet's Adana Kebab Guide" (Turkish)
- **Description**: What makes this collection special
- **Creator**: User who created the collection
- **Location**: Associated city or district
- **Category**: Main category (Yemek, Kafe, etc.)
- **Subcategory**: Optional specific type (Kebapçı, Pideci, etc.)
- **Places List**: Array of places in the collection (ordered by creator)
- **Vote Count**: Total votes received
- **Vote Score**: Weighted vote total
- **Status**: active, archived, or flagged
- **Timestamps**: created_at, updated_at
- **Metadata**: tags, themes, occasion suggestions

### Places

Each place contains:

- **Name**: Place name
- **Descriptions**: Detailed information
- **Main Category**: Yemek, Kafe, Bar & Pub, or Hidden Gem
- **Subcategory**: Specific type (e.g., Pideci, Kebapçı) - only for Yemek category
- **Location**: Associated city or district
- **Address**: Physical location
- **Images**: Photo gallery (stored as URLs)
- **Status**: pending, approved, or rejected
- **Collection Appearances**: Count of how many collections feature this place
- **Aggregated Vote Score**: Total votes from all collections featuring this place
- **Trust Score**: Calculated quality metric
- **Timestamps**: created_at, updated_at

### Categories

Hierarchical structure:

- **Main Categories**: Yemek, Kafe, Bar & Pub, Hidden Gem
- **Subcategories**: Pideci, Kebapçı, Hamburgerci, etc. (only under Yemek)

Each category has:

- **Slug**: URL-friendly identifier (pideci, kebapci, hamburgerci)
- **Names**: Turkish names
- **Parent Category**: Reference to main category (null for main categories)
- **Icon**: Emoji or icon identifier
- **Display Order**: For sorting in UI

### Locations

Hierarchical structure:

- **Countries**: e.g., Turkey
- **Cities**: e.g., Istanbul, Ankara (parent: country)
- **Districts**: e.g., Kadıköy, Beşiktaş (parent: city)

Each location has:

- **Type**: country, city, or district
- **Slug**: URL-friendly identifier
- **Names**: Turkish names
- **Path**: Materialized path for hierarchy
- **Coordinates**: latitude, longitude
- **has_districts**: Flag indicating if it has sub-locations

### Users (Enhanced for Collections)

- **Profile**: username, bio, profile picture
- **Collections**: List of created collections
- **Followers**: Users who follow this curator
- **Following**: Curators this user follows
- **Reputation Score**: Based on collection votes and engagement
- **Account Age**: For vote weighting
- **Activity Stats**: collections created, votes given, places added

## URL Structure Examples

```
/                                                  → Home page with featured cities
/turkey/istanbul                                   → Top places in Istanbul
/turkey/istanbul/kadikoy                          → Top places in Kadıköy district
/collections                                       → Browse all collections
/collections/[slug]                                → Individual collection detail page
/categories/[slug]                                 → Collections by category
/my-collections                                    → User's collections management (protected)
/favorites                                         → User's voted collections (protected)
/profile/[username]                                → User profile page
/admin                                             → Admin dashboard (admin only)
/admin/places                                      → Places management
/admin/collections                                 → Collections management
/admin/locations                                   → Locations management
/admin/categories                                  → Categories management
```

## Future Roadmap

### Phase 1 (Current - MVP) ✅ COMPLETE

- ✅ Core platform architecture
- ✅ Location hierarchy system
- ✅ Hierarchical category system (main + subcategories)
- ✅ Collection database schema and tables
- ✅ Collection creation and management system (User & Admin CRUD)
- ✅ Collection-based voting mechanism (Database triggers with automatic vote propagation)
- ✅ Admin dashboard with collection moderation
- ✅ Turkish-first content support
- ✅ User authentication (Supabase Auth) - Email/password, email verification, password reset
- ✅ User profiles with stats (followers, following, collections, reputation)
- ✅ User following system
- ✅ Favorites page (upvoted/downvoted collections)
- ✅ Category page (collections by category)
- ✅ Public collection browsing interface
- ✅ Collection detail pages with drag & drop place ordering
- ✅ Protected routes and role-based access control
- ✅ Top 20 calculation from aggregated collection votes (fully implemented)
- ✅ Homepage leaderboard showing top collections
- ✅ Recommended items system for places in collections
- ✅ Duplicate detection when creating new places
- ✅ Seed scripts for demo data (locations, categories, demo collections)
- ✅ Collection voting UI (upvote/downvote buttons on leaderboard and details)

### Phase 2 (Upcoming)

- 📋 Collection search and filtering
- 📋 Advanced curator reputation system
- 📋 Place suggestions by users
- 📋 Collection sharing on social media
- 📋 Email notifications for collection votes
- 📋 Collection comments and discussions
- 📋 Place-level voting UI (currently votes propagate from collections)

### Phase 3 (Future - Enhanced Features)

- 📋 **Flavor Pairing System**: Community-curated menu combinations for each place
  - Users suggest dish combinations (e.g., "Adana + Ayran + Közlenmiş Biber")
  - Upvote/downvote system for combinations
  - Display top combos on place pages
  - Help newcomers order like locals
- 📋 **Comparative Battle System** (Unique Gameplay):
  - Head-to-head place comparisons
  - Swipeable interface (Tinder-style)
  - ELO rating system for scientific rankings
  - Engaging gamification for vote collection
  - "Would you rather eat at A or B?" format
- 📋 Collection comments and discussions
- 📋 Collaborative collections (multiple curators)
- 📋 Collection versioning and history
- 📋 Advanced analytics for curators

### Phase 4 (Advanced)

- 📋 Mobile apps (React Native)
- 📋 Real-time status updates ("currently crowded", "dish sold out")
- 📋 Photo uploads by users
- 📋 Integration with maps
- 📋 Reservation system integration
- 📋 Push notifications for collection updates
- 📋 Curator monetization (premium collections)

### Phase 5 (Expansion)

- 📋 Expand to more countries
- 📋 Business accounts for restaurants
- 📋 Featured collection partnerships
- 📋 API for third-party integrations
- 📋 Collection export/import features
- 📋 AI-powered collection suggestions

## Design Philosophy

### Curation-First

We believe the best recommendations come from passionate individuals who take time to curate their experiences. The collection system empowers users to become trusted guides.

### Democratic Validation

While curation is personal, validation is democratic. The community collectively determines which collections and places deserve the top spots through their votes.

### Community-Driven

Trust is built through both individual expertise and collective wisdom. The platform rewards good curators while preventing single-source bias.

### Scalable Architecture

Built with modern technologies and best practices to ensure the platform can grow from Turkey to global coverage without major rewrites. The flexible collection system can accommodate any location or category.

### Performance-Focused

Server-side rendering, edge caching, and optimized queries ensure fast page loads regardless of location or number of collections.

## Success Metrics

### Key Performance Indicators (KPIs)

1. **User Engagement**
   - Monthly active users
   - Collections created per month
   - Votes cast per day
   - Average collections viewed per session
   - Curator follow rate

2. **Content Growth**
   - Number of active collections
   - Number of places added
   - Number of active cities/districts
   - Collections per location
   - Average places per collection

3. **Community Health**
   - Daily collection votes
   - User retention rate
   - Curator engagement rate
   - Collection quality score (votes per collection)
   - Vote distribution across collections

4. **Quality Metrics**
   - Collections with 10+ votes
   - Places appearing in multiple collections
   - User satisfaction score
   - Collection abandonment rate
   - Curator reputation distribution

## Competitive Advantages

1. **Collection-Based System**: Unique approach that combines personal curation with democratic validation
2. **Curator Economy**: Rewards passionate locals and food enthusiasts
3. **Trust Through Diversity**: Multiple perspectives prevent bias
4. **Engaging Content**: Collections tell stories, not just lists
5. **Community-First**: No paid placements or business-biased rankings
6. **Granular Categories**: Find exactly what you're looking for
7. **Future-Ready**: Flavor pairing and comparative battle systems will create addictive engagement

## Technical Highlights

- **Modern Stack**: Next.js 16, React 19, TypeScript 5
- **Node.js**: Requires Node.js 20+ for development
- **Real-time Data**: Supabase with PostgreSQL
- **Edge-Ready**: Built for deployment on Vercel Edge Network
- **Type-Safe**: Full TypeScript coverage with generated database types
- **Scalable Database**: PostgreSQL with RLS, triggers, and materialized paths for hierarchies
- **Vote Aggregation**: Efficient database triggers automatically propagate collection votes to places
- **Collection-Based Ranking**: Places are ranked by aggregated votes from all collections they appear in
- **SEO-Optimized**: Server-side rendering with dynamic metadata for each location/category/collection
- **Component Library**: shadcn/ui with Tailwind CSS 4 for consistent, beautiful UI
- **Authentication**: Supabase Auth with email/password, email verification, and password reset
- **State Management**: React Query (@tanstack/react-query) for server state, Zustand for client state
- **Drag & Drop**: @dnd-kit for collection place reordering
- **Dark Mode**: System-aware theme switching with next-themes
- **Seed Scripts**: Comprehensive seeding for locations, categories, and demo collections

---

**LocalFlavors** - Where personal curation meets community wisdom.

---

**LocalFlavors** - Where personal curation meets community wisdom.
