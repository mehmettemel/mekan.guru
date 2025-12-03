'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Tag, ThumbsUp, ThumbsDown, ArrowLeft, ExternalLink } from 'lucide-react';

interface Place {
  id: string;
  slug: string;
  names: { tr: string; en?: string };
  address?: string;
  vote_score: number;
  vote_count: number;
  status: string;
  google_maps_url?: string;
  location?: {
    names: { tr: string };
  };
  category?: {
    names: { tr: string };
  };
}

interface Collection {
  id: string;
  slug: string;
  names: { tr: string };
  vote_score: number;
  vote_count: number;
  places_count?: [{ count: number }];
}

interface PlaceDetailViewProps {
  place: Place;
  upvotes: number;
  downvotes: number;
  collections?: Collection[];
}

function PlaceDetailContent({ place, upvotes, downvotes, collections = [] }: PlaceDetailViewProps) {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('from');
  const fromSlug = fromUrl?.split('/koleksiyonlar/')[1];

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8 px-4">
      {/* Back Buttons */}
      <div className="flex items-center gap-2">
        {fromUrl ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={fromUrl}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Koleksiyona Dön
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        )}
      </div>

      {/* Place Header */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle className="text-3xl">
                {place.names.tr}
              </CardTitle>
              {place.names.en && place.names.en !== place.names.tr && (
                <p className="mt-1 text-lg text-neutral-600 dark:text-neutral-400">
                  {place.names.en}
                </p>
              )}
            </div>

            {/* Location & Category */}
            <div className="flex flex-wrap gap-3">
              {place.location && (
                <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-800">
                  <MapPin className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  <span>{place.location.names.tr}</span>
                </div>
              )}
              {place.category && (
                <div className="flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  <Tag className="h-4 w-4" />
                  <span>{place.category.names.tr}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Address */}
          {place.address && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Adres
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {place.address}
              </p>
            </div>
          )}

          {/* Google Maps Link */}
          {place.google_maps_url && (
            <div>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link href={place.google_maps_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Google Maps'te Aç
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Collections */}
      {collections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Yer Aldığı Koleksiyonlar</CardTitle>
            <CardDescription>
              Bu mekanın dahil edildiği listeler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {collections.map((collection) => {
                const isFromThisCollection = fromSlug === collection.slug;
                
                return (
                  <Link 
                    key={collection.id} 
                    href={`/koleksiyonlar/${collection.slug}`}
                    className={`group block rounded-xl border p-4 transition-all hover:shadow-md ${
                      isFromThisCollection 
                        ? 'border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-900/10' 
                        : 'border-neutral-200 bg-white hover:border-orange-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-orange-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-semibold transition-colors ${
                          isFromThisCollection 
                            ? 'text-orange-700 dark:text-orange-400' 
                            : 'text-neutral-900 group-hover:text-orange-600 dark:text-neutral-50 dark:group-hover:text-orange-400'
                        }`}>
                          {collection.names.tr}
                        </h4>
                        <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {collection.vote_count || 0}
                          </span>
                          <span>•</span>
                          <span>
                            {collection.places_count?.[0]?.count || 0} Mekan
                          </span>
                        </div>
                      </div>
                      {isFromThisCollection && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          Buradan Geldin
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voting Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Topluluk Oyları</CardTitle>
          <CardDescription>
            Bu mekan hakkında topluluğun görüşleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>Olumlu</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {upvotes}
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <ThumbsDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span>Olumsuz</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {downvotes}
              </p>
            </div>

            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Toplam Puan
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {place.vote_score || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        Durum:{' '}
        <span className={place.status === 'approved' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
          {place.status === 'approved' ? 'Onaylandı' : 'Beklemede'}
        </span>
      </div>
    </div>
  );
}

export function PlaceDetailView(props: PlaceDetailViewProps) {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-4xl space-y-6 py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-40 bg-neutral-200 rounded dark:bg-neutral-800" />
          <div className="h-64 bg-neutral-200 rounded dark:bg-neutral-800" />
          <div className="h-48 bg-neutral-200 rounded dark:bg-neutral-800" />
        </div>
      </div>
    }>
      <PlaceDetailContent {...props} />
    </Suspense>
  );
}
