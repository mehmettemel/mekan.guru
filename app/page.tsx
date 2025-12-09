import { getTopCollections, getFeaturedCollection } from '@/lib/api/collections';
import { getCategories } from '@/lib/api/categories';
import { getCities } from '@/lib/api/locations';
import { HeroBanner } from '@/components/home/hero-banner';
import { CollectionFeed } from '@/components/collections/collection-feed';
import { CollectionsLeaderboard } from '@/components/leaderboard/collections-leaderboard';
import { Badge } from '@/components/ui/badge';
import { Particles } from '@/components/ui/particles';
import { Flame, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/json-ld';
import type { Metadata } from 'next';

interface HomePageProps {
  searchParams: Promise<{ city?: string }>;
}

export const metadata: Metadata = {
  title: 'mekan.guru - Türkiye\'nin En İyi Mekanları ve Restoranları',
  description: 'Türkiye\'nin her şehrinden en iyi restoranlar, kafeler ve mekanları keşfedin. Kullanıcı koleksiyonları ile güvenilir öneriler. İstanbul, Ankara, İzmir ve daha fazlası.',
  keywords: [
    'mekan.guru',
    'türkiye restoranlar',
    'istanbul restoranlar',
    'ankara mekanlar',
    'izmir kafeler',
    'en iyi kebapçılar',
    'kahvaltı mekanları',
    'restoran önerileri',
    'yemek koleksiyonları',
    'yerel lezzetler',
    'mekan keşfi',
    'food guide turkey',
    'restaurant recommendations'
  ],
  openGraph: {
    title: 'mekan.guru - Türkiye\'nin En İyi Mekanları',
    description: 'Türkiye\'nin her şehrinden en iyi restoranlar, kafeler ve mekanları keşfedin.',
    type: 'website',
    locale: 'tr_TR',
    url: 'https://mekan.guru',
    siteName: 'mekan.guru',
  },
  alternates: {
    canonical: 'https://mekan.guru',
  },
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const selectedCitySlug = params.city || 'all'; // Default to All Cities

  // Fetch data in parallel
  const [featuredCollection, topCollections, categories, leaderboardCollections, cities] = await Promise.all([
    getFeaturedCollection(selectedCitySlug),
    getTopCollections(selectedCitySlug, 12),
    getCategories({ parent_id: null, limit: 30 }), // Get main categories
    getTopCollections(selectedCitySlug, 20), // Get top 20 for leaderboard
    getCities(),
  ]);

  // Shuffle function for random selection
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get 4 random collections from top collections for featured section
  const randomFeaturedCollections = shuffleArray(topCollections).slice(0, 4);

  // JSON-LD structured data for homepage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'mekan.guru',
    description: 'Türkiye\'nin en iyi mekanlarını ve restoranlarını keşfedin',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://mekan.guru',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mekan.guru'}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'mekan.guru',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mekan.guru'}/og-image.jpg`
      }
    }
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="fixed inset-0 -z-10">
        <Particles
          className="absolute inset-0 h-full w-full dark:hidden"
          quantity={100}
          ease={80}
          color="#000000"
          refresh
        />
        <Particles
          className="absolute inset-0 h-full w-full hidden dark:block"
          quantity={100}
          ease={80}
          color="#ffffff"
          refresh
        />
      </div>

      {/* Best Collections Leaderboard */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Lider Tablosu</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            En İyi Koleksiyonlar
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            En çok oy alan ve güvenilen koleksiyonlar
          </p>
        </div>

        <CollectionsLeaderboard
          initialCollections={leaderboardCollections || []}
          cities={cities || []}
          categories={categories || []}
          selectedCitySlug={selectedCitySlug}
        />
      </section>
      
      {/* Hero Banner - Featured Collection */}
      {featuredCollection && (
        <section className="container mx-auto px-4 py-8">
          <HeroBanner collection={featuredCollection as any} />
        </section>
      )}

      {/* Top Collections Feed */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              <Flame className="h-3.5 w-3.5" />
              <span>Haftanın En Popülerleri</span>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Öne Çıkan Koleksiyonlar
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Topluluğun en çok beğendiği mekan listeleri
            </p>
          </div>
        </div>

        <CollectionFeed collections={randomFeaturedCollections.map(c => ({...c, places_count: c.places_count || 0})) as any} />
      </section>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="border-y border-neutral-200 bg-neutral-50 py-12 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                Kategorilere Göre Keşfet
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                İlgilendiğin kategorideki mekanları bul
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/kategoriler/${category.slug}`}
                  className="group"
                >
                  <Badge
                    variant="outline"
                    className="w-full cursor-pointer justify-center border-neutral-300 bg-white px-4 py-3 text-sm transition-all hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-orange-500 dark:hover:bg-orange-950 dark:hover:text-orange-400"
                  >
                    {category.names?.tr || category.slug}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

     
    </>
  );
}
