'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Edit, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Collection {
  id: string;
  slug: string;
  names: { en: string; tr: string };
  descriptions: { en: string; tr: string };
  status: string;
  vote_count: number;
  is_featured: boolean;
  created_at: string;
  location?: { id: string; names: { en: string; tr: string } };
  category?: { id: string; names: { en: string; tr: string } };
  places_count?: number;
}

interface CollectionCardProps {
  collection: Collection;
  onEdit?: () => void;
  onDelete?: (id: string) => void;
}

export function CollectionCard({ collection, onEdit, onDelete }: CollectionCardProps) {
  const locale = 'tr'; // Turkish as primary language

  return (
    <Card className="group relative flex flex-col transition-shadow hover:shadow-lg">
      {collection.is_featured && (
        <div className="absolute right-3 top-3 rounded-full bg-yellow-100 p-1.5 dark:bg-yellow-900/30">
          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
        </div>
      )}

      <CardHeader>
        <Link
          href={`/collections/${collection.slug}`}
          className="group-hover:text-primary transition-colors"
        >
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {collection.names[locale as 'en' | 'tr']}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
          {collection.descriptions[locale as 'en' | 'tr']}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <MapPin className="h-4 w-4" />
          <span>{collection.location?.names[locale as 'en' | 'tr'] || 'Bilinmiyor'}</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-50">
              {collection.places_count || 0}
            </span>
            <span className="ml-1 text-neutral-600 dark:text-neutral-400">mekan</span>
          </div>
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-50">
              {collection.vote_count}
            </span>
            <span className="ml-1 text-neutral-600 dark:text-neutral-400">oy</span>
          </div>
        </div>

        <div className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
          {collection.category?.names[locale as 'en' | 'tr'] || 'Kategorisiz'}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onEdit}
        >
          <Edit className="mr-2 h-3.5 w-3.5" />
          Düzenle
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link href={`/collections/${collection.slug}`}>
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Görüntüle
          </Link>
        </Button>
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(collection.id)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
