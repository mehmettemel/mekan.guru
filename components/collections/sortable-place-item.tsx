'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, MapPin, Star, X, Utensils } from 'lucide-react';
import Link from 'next/link';

interface SortablePlaceItemProps {
  id: string;
  place: any;
  curatorNote?: string;
  recommendedItems?: string[];
  index: number;
  isOwner: boolean;
  onRemove: () => void;
}

export function SortablePlaceItem({
  id,
  place,
  curatorNote,
  recommendedItems,
  index,
  isOwner,
  onRemove,
}: SortablePlaceItemProps) {
  const locale = 'tr'; // Turkish as primary language
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="group relative overflow-hidden">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Drag Handle */}
            {isOwner && (
              <div
                {...attributes}
                {...listeners}
                className="flex cursor-grab items-center text-neutral-400 hover:text-neutral-600 active:cursor-grabbing dark:text-neutral-600 dark:hover:text-neutral-400"
              >
                <GripVertical className="h-5 w-5" />
              </div>
            )}

            {/* Index */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
              {index + 1}
            </div>

            {/* Place Image */}
            {place.images && place.images.length > 0 && (
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={place.images[0]}
                  alt={place.names[locale as 'en' | 'tr']}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Place Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/places/${place.slug}`}
                className="group-hover:text-primary transition-colors"
              >
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
                  {place.names[locale as 'en' | 'tr']}
                </h3>
              </Link>
              <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                {place.descriptions?.[locale as 'en' | 'tr']}
              </p>
              {place.address && (
                <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{place.address}</span>
                </div>
              )}
              {curatorNote && (
                <div className="mt-2 rounded-lg bg-neutral-50 p-2 text-sm italic text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                  "{curatorNote}"
                </div>
              )}
              {recommendedItems && recommendedItems.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <Utensils className="h-3.5 w-3.5" />
                    <span>Önerilen:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendedItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Star className="h-3.5 w-3.5 text-yellow-500" />
                <span className="font-medium text-neutral-900 dark:text-neutral-50">
                  {place.vote_count || 0}
                </span>
                <span className="text-neutral-600 dark:text-neutral-400">votes</span>
              </div>
            </div>

            {/* Remove Button */}
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
