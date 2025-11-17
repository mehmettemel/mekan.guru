'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PlaceCard } from './place-card';
import { Sparkles } from 'lucide-react';

interface AnimatedPlacesListProps {
  places: any[];
  categoryFilter?: string;
}

export function AnimatedPlacesList({ places, categoryFilter }: AnimatedPlacesListProps) {
  // Container variants for stagger effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  // Item variants for individual cards
  const itemVariants = {
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
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {places && places.length > 0 ? (
        <motion.div
          key={categoryFilter || 'all'}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="mx-auto max-w-5xl space-y-4"
        >
          {places.map((place, index) => (
            <motion.div
              key={place.id}
              variants={itemVariants}
              layout
            >
              <PlaceCard place={place} rank={index + 1} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Sparkles className="h-8 w-8 text-orange-500 dark:text-orange-400" />
          </motion.div>
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            Bu kategoride mekan bulunamadı
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
