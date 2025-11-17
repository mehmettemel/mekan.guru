'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Place } from '@/lib/api/places';

interface PlaceCardProps {
  place: Place & {
    category?: any;
    location?: any;
  };
  rank?: number;
}

export function PlaceCard({ place, rank }: PlaceCardProps) {
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null);

  const names = place.names as Record<string, string>;
  const descriptions = place.descriptions as Record<string, string>;

  const placeName = names.tr || names.en || place.slug;
  const placeDescription = descriptions.tr || descriptions.en || '';

  // Get category name
  const categoryNames = place.category?.names as Record<string, string>;
  const categoryName = categoryNames?.tr || categoryNames?.en || '';

  const handleVote = (type: 'up' | 'down') => {
    setVoteState(voteState === type ? null : type);
  };

  return (
    <div className="group relative flex items-center gap-2 overflow-hidden rounded-2xl border-2 border-transparent bg-linear-to-br from-orange-100 via-yellow-50 to-orange-100 p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl sm:gap-4 sm:rounded-3xl sm:border-4 dark:from-orange-900/20 dark:via-yellow-900/10 dark:to-orange-900/20">
      {/* Inner container with solid background */}
      <div className="flex w-full items-center gap-2 rounded-xl bg-white p-3 sm:gap-4 sm:rounded-2xl sm:p-6 dark:bg-neutral-900">
        {/* Rank Number */}
        {rank && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 to-orange-600 text-lg font-bold text-white shadow-lg sm:h-12 sm:w-12 sm:rounded-xl sm:text-2xl">
            {rank}
          </div>
        )}

        {/* Content Section */}
        <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
          {/* Title and Category */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <h3 className="truncate text-base font-bold text-neutral-900 transition-colors group-hover:text-orange-600 sm:text-xl md:text-2xl dark:text-neutral-50 dark:group-hover:text-orange-400">
              {placeName}
            </h3>
            {categoryName && (
              <span className="inline-flex w-fit rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 sm:px-3 sm:py-1 sm:text-xs dark:bg-orange-900/30 dark:text-orange-400">
                {categoryName}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="line-clamp-1 text-xs text-neutral-600 sm:text-sm dark:text-neutral-400">
            {placeDescription}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-2 pt-1 text-xs sm:gap-4 sm:pt-2 sm:text-sm">
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {place.vote_score || 0} points
            </span>
            <span className="text-neutral-500 dark:text-neutral-500">•</span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {place.vote_count || 0} votes
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 gap-1.5 sm:gap-3">
          {/* Upvote Button */}
          <button
            onClick={() => handleVote('up')}
            className={`group/btn flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all duration-300 hover:scale-110 sm:h-14 sm:w-14 sm:rounded-2xl sm:border-3 ${
              voteState === 'up'
                ? 'border-orange-500 bg-linear-to-br from-orange-500 to-orange-600 shadow-lg'
                : 'border-orange-200 bg-white hover:border-orange-400 hover:bg-orange-50 dark:border-orange-800 dark:bg-neutral-800 dark:hover:border-orange-600 dark:hover:bg-orange-900/30'
            }`}
          >
            <ThumbsUp
              className={`h-4 w-4 transition-all duration-300 sm:h-6 sm:w-6 ${
                voteState === 'up'
                  ? 'fill-white text-white'
                  : 'text-orange-500 group-hover/btn:scale-110 dark:text-orange-400'
              }`}
            />
          </button>

          {/* Downvote Button */}
          <button
            onClick={() => handleVote('down')}
            className={`group/btn flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all duration-300 hover:scale-110 sm:h-14 sm:w-14 sm:rounded-2xl sm:border-3 ${
              voteState === 'down'
                ? 'border-red-500 bg-linear-to-br from-red-500 to-red-600 shadow-lg'
                : 'border-neutral-200 bg-white hover:border-red-400 hover:bg-red-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-red-600 dark:hover:bg-red-900/30'
            }`}
          >
            <ThumbsDown
              className={`h-4 w-4 transition-all duration-300 sm:h-6 sm:w-6 ${
                voteState === 'down'
                  ? 'fill-white text-white'
                  : 'text-neutral-400 group-hover/btn:scale-110 group-hover/btn:text-red-500 dark:text-neutral-500'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
