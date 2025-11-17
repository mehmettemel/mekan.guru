'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CompactPlaceCard } from '@/components/places/compact-place-card';

interface AnimatedCitySectionProps {
  city: any;
  places: any[];
  index: number;
}

export function AnimatedCitySection({ city, places, index }: AnimatedCitySectionProps) {
  const cityNames = city.names as Record<string, string>;
  const cityName = cityNames.tr || cityNames.en || city.slug;

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        when: "beforeChildren",
        staggerChildren: 0.08
      }
    }
  };

  // Card animation - cascade from top
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
    >
      {/* City Header */}
      <div className="sticky top-16 z-10 mb-4 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90">
        <div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            {cityName}
          </h3>
          <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
            {places.length} {places.length === 1 ? 'mekan' : 'mekan'}
          </p>
        </div>
        <Link
          href={`/turkey/${city.slug}`}
          className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg dark:from-orange-600 dark:to-orange-700"
        >
          <span>Tümünü Gör</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Places List - Vertical Cascade */}
      <motion.div className="space-y-3">
        {places.length > 0 ? (
          places.map((place: any, placeIndex: number) => (
            <motion.div
              key={place.id}
              variants={cardVariants}
            >
              <CompactPlaceCard place={place} rank={placeIndex + 1} />
            </motion.div>
          ))
        ) : (
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-800/50"
          >
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {cityName} için henüz mekan yok
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
