import { getCitiesByCountry } from '@/lib/api/locations';
import { getTopPlacesByCity } from '@/lib/api/places';
import { PlacesLeaderboard } from '@/components/leaderboard/places-leaderboard';
import { Sparkles, TrendingUp } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{ city?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const cities = await getCitiesByCountry('turkey');

  // Get selected city from query params or default to Istanbul
  const selectedCitySlug = params.city || 'istanbul';

  // Get top 20 places for selected city
  const topPlaces = await getTopPlacesByCity(selectedCitySlug, 20);

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

            {/* Stats */}
            <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                    {topPlaces?.length || 0}
                  </span>{' '}
                  Mekan
                </span>
              </div>
              <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
              <div className="flex items-center gap-2">
                <span className="text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                    {cities?.length || 0}
                  </span>{' '}
                  Şehir
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="bg-neutral-50 py-16 dark:bg-neutral-950">
        <div className="container mx-auto px-4">
          <PlacesLeaderboard
            initialPlaces={topPlaces || []}
            cities={cities || []}
            selectedCitySlug={selectedCitySlug}
          />
        </div>
      </section>
    </>
  );
}
