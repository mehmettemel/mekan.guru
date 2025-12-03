// @ts-nocheck
import { getPlaceBySlug } from '@/lib/api/places';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/json-ld';
import { PlaceDetailView } from '@/components/places/place-detail-view';
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
  const description = `${place.names?.tr} - ${place.address}. ${place.location?.names?.tr || ''} bölgesinde ${place.category?.names?.tr || ''} kategorisinde ${place.vote_score || 0} puan ile.`;

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
      type: 'website',
      locale: 'tr_TR',
      url: `/mekanlar/${slug}`,
      siteName: 'mekan.guru',
    },
    alternates: {
      canonical: `/mekanlar/${slug}`,
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

    // Get collections this place belongs to
    const { data: relatedCollections } = await supabase
      .from('collection_places')
      .select(`
        collection:collections(
          id,
          slug,
          names,
          vote_score,
          vote_count,
          places_count:collection_places(count)
        )
      `)
      .eq('place_id', place.id)
      .eq('collection.status', 'active');

    const collections = relatedCollections
      ?.map((item: any) => item.collection)
      .filter((c: any) => c !== null) || [];

    // JSON-LD for Restaurant
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: place.names?.tr,
      description: place.names?.tr,
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
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mekan.guru'}/mekanlar/${place.slug}`,
    };

    return (
      <>
        <JsonLd data={jsonLd} />
        <PlaceDetailView 
          place={place} 
          upvotes={upvotes} 
          downvotes={downvotes} 
          collections={collections}
        />
      </>
    );
  } catch (error) {
    console.error('Error fetching place:', error);
    notFound();
  }
}
