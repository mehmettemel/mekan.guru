// @ts-nocheck
import { getPlaceBySlug } from '@/lib/api/places';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Tag, ThumbsUp, ThumbsDown, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/json-ld';
import type { Metadata } from 'next';

interface PlacePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const placeData = await getPlaceBySlug(slug);

  if (!placeData) {
    return {
      title: 'Mekan Bulunamadı',
    };
  }

  const place = placeData as any;
  const title = `${place.names?.tr} - ${place.location?.names?.tr || ''} ${place.category?.names?.tr || ''}`;
  const description = place.descriptions?.tr || `${place.names?.tr} - ${place.address}. ${place.location?.names?.tr || ''} bölgesinde ${place.category?.names?.tr || ''} kategorisinde ${place.vote_score || 0} puan ile.`;

  return {
    title,
    description,
    keywords: [
      place.names?.tr,
      place.location?.names?.tr,
      place.category?.names?.tr,
      'restoran',
      'mekan önerisi',
      place.location?.names?.tr + ' restoranlar',
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'place',
      locale: 'tr_TR',
      url: `/places/${slug}`,
      siteName: 'Local Flavours',
    },
    alternates: {
      canonical: `/places/${slug}`,
    },
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;

  try {
    const placeData = await getPlaceBySlug(slug);

    if (!placeData) {
      notFound();
    }

    const place = placeData as any;
    const supabase = await createClient();

    // Get vote statistics
    const { data: voteStats } = await supabase
      .from('votes')
      .select('value')
      .eq('place_id', place.id);

    const upvotes = voteStats?.filter((v: any) => v.value === 1).length || 0;
    const downvotes = voteStats?.filter((v: any) => v.value === -1).length || 0;

    // JSON-LD for Restaurant
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: place.names?.tr,
      description: place.descriptions?.tr || place.names?.tr,
      address: {
        '@type': 'PostalAddress',
        streetAddress: place.address,
        addressLocality: place.location?.names?.tr,
        addressCountry: 'TR',
      },
      geo: place.latitude && place.longitude ? {
        '@type': 'GeoCoordinates',
        latitude: place.latitude,
        longitude: place.longitude,
      } : undefined,
      servesCuisine: place.category?.names?.tr,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: place.vote_score > 0 ? Math.min((place.vote_score / 10) + 3, 5) : 3,
        bestRating: 5,
        worstRating: 1,
        ratingCount: place.vote_count || 0,
      },
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localflavours.com'}/places/${place.slug}`,
    };

    return (
      <div className="container mx-auto max-w-4xl space-y-6 py-8 px-4">
        <JsonLd data={jsonLd} />
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
        </Link>

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
            {/* Description */}
            {place.descriptions?.tr && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Açıklama
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {place.descriptions.tr}
                </p>
              </div>
            )}

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
                <Link href={place.google_maps_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Google Maps'te Aç
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

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
  } catch (error) {
    console.error('Error fetching place:', error);
    notFound();
  }
}
