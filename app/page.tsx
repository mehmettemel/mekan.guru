import { getCitiesByCountry } from '@/lib/api/locations';
import { getTopPlacesByCity } from '@/lib/api/places';
import { AnimatedCitySection } from '@/components/locations/animated-city-section';
import { Sparkles } from 'lucide-react';

export default async function HomePage() {
  const cities = await getCitiesByCountry('turkey');

  // Featured cities (you can customize this list)
  const featuredCitySlugs = ['istanbul', 'ankara', 'izmir'];

  // Get top places for each featured city (8 places each)
  const featuredCitiesWithPlaces = await Promise.all(
    featuredCitySlugs.map(async (citySlug) => {
      const city = cities?.find(c => c.slug === citySlug);
      if (!city) return null;

      const topPlaces = await getTopPlacesByCity(citySlug, 8);
      return { city, places: topPlaces };
    })
  );

  const validFeaturedCities = featuredCitiesWithPlaces.filter(Boolean);

  return (
    <>
      {/* Compact Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-50 via-orange-50/20 to-neutral-50 py-12 dark:from-neutral-950 dark:via-orange-950/10 dark:to-neutral-950">
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Topluluk Odaklı Yerel Öneriler</span>
            </div>

            <h1 className="mb-3 text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl dark:text-neutral-50">
              Otantik Yerel Lezzetleri Keşfet
            </h1>

            <p className="mx-auto max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Türkiye'deki en iyi yerel mekanları keşfedin ve paylaşın. Favorilerinize oy verin ve başkalarının restoranlar, kafeler ve barlarda otantik deneyimler bulmasına yardımcı olun.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Cities with Top Places - Horizontal Grid */}
      <section id="featured" className="bg-white py-16 dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Öne Çıkan Şehirler
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Popüler şehirlerdeki en iyi derecelendirilmiş mekanları keşfedin
            </p>
          </div>

          {/* Cities Grid - Horizontal Layout, Responsive */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {validFeaturedCities.map((cityData: any, cityIndex: number) => (
              <AnimatedCitySection
                key={cityData.city.id}
                city={cityData.city}
                places={cityData.places}
                index={cityIndex}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
