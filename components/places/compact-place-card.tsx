'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Plus, Minus } from 'lucide-react';

interface CompactPlaceCardProps {
  place: any;
  rank?: number;
}

export function CompactPlaceCard({ place, rank }: CompactPlaceCardProps) {
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleVote = (type: 'up' | 'down') => {
    setVoteState(type);
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 1000);
    // TODO: Implement actual voting logic
  };

  const placeName = place.names?.tr || place.names?.en || place.slug;
  const categoryName = place.category?.names?.tr || place.category?.names?.en || '';

  return (
    <div className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-100 p-0.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:from-orange-900/20 dark:via-orange-800/10 dark:to-orange-900/20">
      <div className="flex w-full items-center gap-3 rounded-xl bg-white p-3 dark:bg-neutral-900">
        {/* Rank Number */}
        {rank && (
          <motion.div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white shadow-md"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {rank}
          </motion.div>
        )}

        {/* Content Section */}
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
              {placeName}
            </h3>
            {categoryName && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                {categoryName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {place.vote_score || 0} pts
            </span>
            <span>•</span>
            <span>{place.vote_count || 0} votes</span>
          </div>
        </div>

        {/* Compact Action Buttons with Animations */}
        <div className="flex flex-shrink-0 gap-1.5">
          <div className="relative">
            <motion.button
              onClick={() => handleVote('up')}
              className={`group/btn flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                voteState === 'up'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-orange-100 hover:text-orange-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-400'
              }`}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              aria-label="Upvote"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </motion.button>

            {/* Upvote Animation */}
            <AnimatePresence>
              {showAnimation && voteState === 'up' && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -20, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2"
                >
                  <Plus className="h-4 w-4 text-orange-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <motion.button
              onClick={() => handleVote('down')}
              className={`group/btn flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                voteState === 'down'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-red-100 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-red-900/30 dark:hover:text-red-400'
              }`}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              aria-label="Downvote"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </motion.button>

            {/* Downvote Animation */}
            <AnimatePresence>
              {showAnimation && voteState === 'down' && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: 20, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2"
                >
                  <Minus className="h-4 w-4 text-red-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
