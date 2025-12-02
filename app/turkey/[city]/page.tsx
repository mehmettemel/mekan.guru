// @ts-nocheck
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { getLocationBySlug } from '@/lib/api/locations';
import { getPlacesByLocation } from '@/lib/api/places';
import { getAllCategories } from '@/lib/api/categories';
import { CategoryFilter } from '@/components/places/category-filter';
import { AnimatedPlacesList } from '@/components/places/animated-places-list';
import { JsonLd } from '@/components/seo/json-ld';
import type { Metadata } from 'next';

interface CityPageProps {
  params: Promise<{
    city: string;
  }>;
  searchParams: Promise<{
    category?: string;
  }>;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await getLocationBySlug(citySlug);

  if (!city || city.type !== 'city') {
    return {
      title: 'Şehir Bulunamadı',
    };
  }

  const cityNames = city.names as Record<string, string>;
  const cityName = cityNames.tr || cityNames.en || city.slug;
  const title = `${cityName} En İyi Mekanlar ve Restoranlar | mekan.guru`;
  const description = `${cityName} şehrindeki en iyi restoranları, kafeleri ve lezzet duraklarını keşfedin. ${cityName} için özel hazırlanmış koleksiyonlar ve öneriler.`;

  return {
    title,
    description,
    keywords: [
      `${cityName} restoranlar`,
      `${cityName} mekanlar`,
      `${cityName} kafeler`,
      `${cityName} yemek`,
      `${cityName} gezi`,
      'restoran önerileri',
      'mekan keşfi',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
      url: `/turkey/${citySlug}`,
      siteName: 'mekan.guru',
    },
    alternates: {
      canonical: `/turkey/${citySlug}`,
    },
  };
}

export default async function CityPage({
  params,
  searchParams,
}: CityPageProps) {
  const { city: citySlug } = await params;
  const { category } = await searchParams;

  // Fetch city data
  const city = await getLocationBySlug(citySlug);
  if (!city || city.type !== 'city') {
    notFound();
  }

  // Fetch places and categories
  const [places, categories] = await Promise.all([
    getPlacesByLocation(city.id, 20, category),
    getAllCategories(),
  ]);

  const cityNames = city.names as Record<string, string>;
  const cityName = cityNames.tr || cityNames.en || city.slug;

  // JSON-LD for City Page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cityName} En İyi Mekanlar`,
    description: `${cityName} şehrindeki en iyi ${places?.length || 0} mekan`,
    numberOfItems: places?.length || 0,
    itemListElement: places?.slice(0, 20).map((place: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Restaurant',
        name: place.names?.tr,
        address: place.address,
        aggregateRating: place.vote_score ? {
          '@type': 'AggregateRating',
          ratingValue: Math.min((place.vote_score / 10) + 3, 5),
          bestRating: 5,
        } : undefined,
      },
    })) || [],
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 via-orange-50/30 to-neutral-50 dark:from-neutral-950 dark:via-orange-950/10 dark:to-neutral-950">
      <JsonLd data={jsonLd} />
      {/* Animated Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/50 bg-white/80 backdrop-blur-xl supports-backdrop-filter:bg-white/80 dark:border-neutral-800/50 dark:bg-neutral-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="group flex items-center gap-1.5 text-base font-bold text-neutral-900 transition-all hover:text-orange-500 sm:gap-2 sm:text-lg md:text-xl dark:text-neutral-50 dark:hover:text-orange-400"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">mekan.guru</span>
              <span className="sm:hidden">LF</span>
            </Link>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 sm:gap-2 sm:text-sm dark:text-neutral-400">
            <span className="hidden sm:inline">Türkiye</span>
            <span className="sm:hidden">TR</span>
            <span>/</span>
            <span className="max-w-[120px] truncate font-medium text-orange-500 sm:max-w-none dark:text-orange-400">
              {cityName}
            </span>
          </div>
        </div>
      </header>

      {/* Elegant Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 via-transparent to-orange-500/5" />
        <div className="relative container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-700 sm:mb-4 sm:px-4 sm:py-2 sm:text-sm dark:bg-orange-900/30 dark:text-orange-400">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>
                {places?.length || 0} En İyi Mekan
              </span>
            </div>
            <h1 className="animate-in fade-in slide-in-from-bottom-4 mb-3 text-4xl font-bold tracking-tight text-neutral-900 duration-700 sm:mb-4 sm:text-5xl md:text-6xl lg:text-7xl dark:text-neutral-50">
              {cityName}
            </h1>
            <p className="animate-in fade-in slide-in-from-bottom-6 text-sm text-neutral-600 duration-1000 sm:text-base md:text-lg dark:text-neutral-400">
              {cityName} şehrinde {places?.length || 0} mekanı keşfedin
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-12 sm:pb-16 md:pb-20">
        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <section className="mb-12 sm:mb-14 md:mb-16">
            <CategoryFilter categories={categories} />
          </section>
        )}

        {/* Places Section with Animated Transitions */}
        <section>
          <h2 className="mb-6 text-center text-2xl font-bold text-neutral-900 sm:mb-8 sm:text-3xl md:text-4xl dark:text-neutral-50">
            En İyi Mekanlar
          </h2>

          <AnimatedPlacesList
            places={places}
            categoryFilter={category}
          />
        </section>
      </div>
    </div>
  );
}
