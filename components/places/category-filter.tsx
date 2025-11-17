'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Utensils, Coffee, Gem, Beer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/api/categories';

interface CategoryFilterProps {
  categories: Category[];
}

// Icon mapping for categories
const getCategoryIcon = (slug: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    all: <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />,
    yemek: <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />,
    food: <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />,
    kafe: <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />,
    cafe: <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />,
    'hidden-gem': <Gem className="h-4 w-4 sm:h-5 sm:w-5" />,
    gem: <Gem className="h-4 w-4 sm:h-5 sm:w-5" />,
    'bar-pub': <Beer className="h-4 w-4 sm:h-5 sm:w-5" />,
    bar: <Beer className="h-4 w-4 sm:h-5 sm:w-5" />,
  };

  return (
    iconMap[slug.toLowerCase()] || (
      <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />
    )
  );
};

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';

  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categorySlug === 'all') {
      params.delete('category');
    } else {
      params.set('category', categorySlug);
    }

    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.push(newUrl);
  };

  const allCategories = [
    {
      id: 'all',
      slug: 'all',
      icon: null,
      names: { en: 'All Places', tr: 'Tümü' },
    },
    ...categories,
  ];

  return (
    <div className="flex justify-center">
      <div className="grid w-full max-w-4xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {allCategories.map((category, index) => {
          const categoryNames = category.names as Record<string, string>;
          const categoryName =
            categoryNames.tr || categoryNames.en || category.slug;
          const isActive = selectedCategory === category.slug;

          return (
            <motion.div
              key={category.id}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              {/* Glowing background for active state */}
              {isActive && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute -inset-1 rounded-xl bg-linear-to-r from-orange-400 via-orange-500 to-orange-600 opacity-60 blur-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              <Button
                onClick={() => handleCategoryChange(category.slug)}
                variant={isActive ? 'gradient' : 'gradient-outline'}
                size="lg"
                className={cn(
                  'relative w-full rounded-xl px-3 py-5 transition-all duration-300 sm:px-6 sm:py-6',
                  isActive && 'ring-2 ring-white/30 ring-offset-0'
                )}
              >
                {/* Icon with animation */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    rotate: isActive ? [0, -10, 10, -10, 0] : 0,
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {getCategoryIcon(category.slug)}
                </motion.div>

                {/* Text - Responsive sizing */}
                <span className="relative z-10 truncate text-xs font-semibold sm:text-sm md:text-base">
                  {categoryName}
                </span>

                {/* Shine effect on hover for non-active buttons */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-linear-to-br from-white/0 via-white/0 to-white/0 opacity-0 transition-opacity duration-300 group-hover:from-white/10 group-hover:via-white/5 group-hover:to-white/0 group-hover:opacity-100" />
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
