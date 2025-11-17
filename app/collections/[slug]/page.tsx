import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CollectionDetailClient } from '@/components/collections/collection-detail-client';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch collection
  const { data: collection, error } = await supabase
    .from('collections')
    .select(`
      *,
      creator:users!collections_creator_id_fkey(id, username),
      location:locations!collections_location_id_fkey(id, slug, names),
      category:categories!collections_category_id_fkey(id, slug, names)
    `)
    .eq('slug', slug)
    .single();

  if (error || !collection) {
    notFound();
  }

  // Fetch places in collection
  const { data: collectionPlaces } = await supabase
    .from('collection_places')
    .select(`
      *,
      place:places(
        id,
        slug,
        names,
        descriptions,
        address,
        images,
        vote_count,
        vote_score
      )
    `)
    .eq('collection_id', collection.id)
    .order('display_order', { ascending: true });

  return (
    <CollectionDetailClient
      collection={collection}
      initialPlaces={collectionPlaces || []}
    />
  );
}
