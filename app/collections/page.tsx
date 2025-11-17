import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollectionCard } from '@/components/collections/collection-card';
import { MapPin } from 'lucide-react';

export default async function CollectionsPage() {
  const supabase = await createClient();

  // Fetch featured and recent collections
  const { data: collections } = await supabase
    .from('collections')
    .select(`
      *,
      creator:users!collections_creator_id_fkey(id, username),
      location:locations!collections_location_id_fkey(id, slug, names),
      category:categories!collections_category_id_fkey(id, slug, names)
    `)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20);

  // Get places count for each collection
  const collectionsWithCounts = await Promise.all(
    (collections || []).map(async (collection) => {
      const { count } = await supabase
        .from('collection_places')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', collection.id);

      return {
        ...collection,
        places_count: count || 0,
      };
    })
  );

  const featuredCollections = collectionsWithCounts.filter((c) => c.is_featured);
  const recentCollections = collectionsWithCounts.filter((c) => !c.is_featured);

  return (
    <div className="container max-w-7xl space-y-8 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Discover Collections
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Explore curated collections of the best places
        </p>
      </div>

      {/* Featured Collections */}
      {featuredCollections.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Featured Collections
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Collections */}
      {recentCollections.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Recent Collections
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {collectionsWithCounts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              No collections yet
            </h3>
            <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
              Be the first to create a collection!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
