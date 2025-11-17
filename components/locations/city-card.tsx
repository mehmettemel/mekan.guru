'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Location } from '@/lib/api/locations';

interface CityCardProps {
  city: Location & { placeCount?: number };
}

export function CityCard({ city }: CityCardProps) {
  const cityNames = city.names as any;
  const cityName = cityNames?.tr || cityNames?.en || city.slug;

  return (
    <Link
      href={`/turkey/${city.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/0 transition-all duration-500 group-hover:from-orange-500/5 group-hover:via-orange-500/10 group-hover:to-orange-500/5" />

      {/* Content */}
      <div className="relative p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg dark:from-orange-900/30 dark:to-orange-800/30">
            <Sparkles className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>

          {/* Place count badge */}
          {city.placeCount !== undefined && city.placeCount > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 dark:bg-orange-900/30">
              <span className="text-xs font-bold text-orange-700 dark:text-orange-400">
                {city.placeCount}
              </span>
            </div>
          )}
        </div>

        <h3 className="mb-2 text-2xl font-bold text-neutral-900 transition-colors group-hover:text-orange-600 dark:text-neutral-50 dark:group-hover:text-orange-400">
          {cityName}
        </h3>

        {city.has_districts && (
          <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
            İlçelere göre gözat
          </p>
        )}

        <div className="flex items-center gap-2 text-sm font-medium text-orange-600 transition-all group-hover:gap-3 dark:text-orange-400">
          <span>Keşfet</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-orange-500/0 transition-all duration-300 group-hover:border-orange-500/20" />
    </Link>
  );
}
