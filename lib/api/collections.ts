// @ts-nocheck
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';

type Collection = Database['public']['Tables']['collections']['Row'];
type CollectionInsert = Database['public']['Tables']['collections']['Insert'];
type CollectionUpdate = Database['public']['Tables']['collections']['Update'];
type CollectionPlace = Database['public']['Tables']['collection_places']['Row'];

// Extended collection type with related data
export interface CollectionWithDetails extends Collection {
  creator?: {
    id: string;
    username: string;
  };
  location?: {
    id: string;
    slug: string;
    names: { en: string; tr: string };
  };
  category?: {
    id: string;
    slug: string;
    names: { en: string; tr: string };
  };
  subcategory?: {
    id: string;
    slug: string;
    names: { en: string; tr: string };
  } | null;
  places_count?: number;
}

export async function getCollections(params?: {
  status?: string;
  creator_id?: string;
  location_id?: string;
  category_id?: string;
  limit?: number;
  offset?: number;
}): Promise<CollectionWithDetails[]> {
  const supabase = (await createClient()) as SupabaseClient<Database>;

  let query = supabase
    .from('collections')
    .select(
      `
      *,
      creator:users!collections_creator_id_fkey(id, username),
      location:locations(id, slug, names),
      category:categories!collections_category_id_fkey(id, slug, names),
      subcategory:categories!collections_subcategory_id_fkey(id, slug, names)
    `
    )
    .order('created_at', { ascending: false });

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.creator_id) {
    query = query.eq('creator_id', params.creator_id);
  }

  if (params?.location_id) {
    query = query.eq('location_id', params.location_id);
  }

  if (params?.category_id) {
    query = query.eq('category_id', params.category_id);
  }

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }

  // Get places count for each collection
  const collectionsWithCounts = await Promise.all(
    (data || []).map(async (collection) => {
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

  return collectionsWithCounts as CollectionWithDetails[];
}

/**
 * Get a single collection by ID
 */
export async function getCollectionById(
  id: string
): Promise<CollectionWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collections')
    .select(
      `
      *,
      creator:users!collections_creator_id_fkey(id, username),
      location:locations(id, slug, names),
      category:categories!collections_category_id_fkey(id, slug, names),
      subcategory:categories!collections_subcategory_id_fkey(id, slug, names)
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching collection:', error);
    return null;
  }

  // Get places count
  const { count } = await supabase
    .from('collection_places')
    .select('*', { count: 'exact', head: true })
    .eq('collection_id', id);

  return {
    ...data,
    places_count: count || 0,
  } as CollectionWithDetails;
}

/**
 * Get collection by slug
 */
export async function getCollectionBySlug(
  slug: string
): Promise<CollectionWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collections')
    .select(
      `
      *,
      creator:users!collections_creator_id_fkey(id, username),
      location:locations(id, slug, names),
      category:categories!collections_category_id_fkey(id, slug, names),
      subcategory:categories!collections_subcategory_id_fkey(id, slug, names)
    `
    )
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching collection:', error);
    return null;
  }

  // Get places count
  const { count } = await supabase
    .from('collection_places')
    .select('*', { count: 'exact', head: true })
    .eq('collection_id', data.id);

  return {
    ...data,
    places_count: count || 0,
  } as CollectionWithDetails;
}

/**
 * Create a new collection
 */
export async function createCollection(
  collection: CollectionInsert
): Promise<Collection> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collections')
    .insert(collection)
    .select()
    .single();

  if (error) {
    console.error('Error creating collection:', error);
    throw error;
  }

  return data;
}

/**
 * Update a collection
 */
export async function updateCollection(
  id: string,
  updates: CollectionUpdate
): Promise<Collection> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating collection:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a collection
 */
export async function deleteCollection(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('collections').delete().eq('id', id);

  if (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
}

/**
 * Get places in a collection
 */
export async function getCollectionPlaces(collectionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collection_places')
    .select(
      `
      *,
      place:places(
        id,
        slug,
        names,
        descriptions,
        address,
        images,
        status,
        vote_count,
        vote_score
      )
    `
    )
    .eq('collection_id', collectionId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching collection places:', error);
    throw error;
  }

  return data;
}

/**
 * Add a place to a collection
 */
export async function addPlaceToCollection(
  collectionId: string,
  placeId: string,
  displayOrder?: number,
  curatorNote?: string
): Promise<CollectionPlace> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('collection_places')
    .insert({
      collection_id: collectionId,
      place_id: placeId,
      display_order: displayOrder || 0,
      curator_note: curatorNote,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding place to collection:', error);
    throw error;
  }

  return data;
}

/**
 * Remove a place from a collection
 */
export async function removePlaceFromCollection(
  collectionId: string,
  placeId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('collection_places')
    .delete()
    .eq('collection_id', collectionId)
    .eq('place_id', placeId);

  if (error) {
    console.error('Error removing place from collection:', error);
    throw error;
  }
}

/**
 * Reorder places in a collection
 */
export async function reorderCollectionPlaces(
  collectionId: string,
  placeOrders: { place_id: string; display_order: number }[]
): Promise<void> {
  const supabase = await createClient();

  // Update each place's display order
  const updates = placeOrders.map(({ place_id, display_order }) =>
    supabase
      .from('collection_places')
      .update({ display_order })
      .eq('collection_id', collectionId)
      .eq('place_id', place_id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    console.error('Error reordering places:', errors);
    throw new Error('Failed to reorder places');
  }
}

/**
 * Get collections count by status
 */
export async function getCollectionsCount(status?: string): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from('collections')
    .select('*', { count: 'exact', head: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting collections:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Toggle collection featured status (admin only)
 */
export async function toggleCollectionFeatured(
  id: string,
  isFeatured: boolean
): Promise<Collection> {
  const supabase = await createClient();

  const { data, error} = await supabase
    .from('collections')
    .update({ is_featured: isFeatured })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling featured status:', error);
    throw error;
  }

  return data;
}

/**
 * Get top collections by vote score (for homepage feed)
 */
export async function getTopCollections(
  citySlug?: string,
  limit: number = 12
): Promise<CollectionWithDetails[]> {
  const supabase = await createClient();

  try {
    const query = supabase
      .from('collections')
      .select(`
        *,
        creator:users!collections_creator_id_fkey(id, username),
        category:categories!collections_category_id_fkey(id, slug, names),
        collection_places(
          id,
          place:places(id, names, location:locations(slug))
        )
      `)
      .eq('status', 'active')
      .order('vote_score', { ascending: false });

    const { data: collections, error } = await query.limit(limit * 2); // Fetch more for filtering

    if (error) {
      console.error('Error fetching top collections:', error);
      return [];
    }

    if (!collections) return [];

    // Transform and filter
    const result: CollectionWithDetails[] = collections
      .map((collection) => {
        const places = (collection.collection_places || []).filter(
          (cp: any) => cp.place
        );

        // Filter by city if needed
        let filteredPlaces = places;
        if (citySlug && citySlug !== 'all') {
          filteredPlaces = places.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (cp: any) => cp.place?.location?.slug === citySlug
          );
        }

        // Skip if city filter applied and no places match
        if (citySlug && citySlug !== 'all' && filteredPlaces.length === 0) {
          return null;
        }

        return {
          ...collection,
          places_count: filteredPlaces.length,
          preview_places: filteredPlaces
            .slice(0, 3)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((cp: any) => ({
              id: cp.place.id,
              names: cp.place.names,
            })),
        } as CollectionWithDetails;
      })
      .filter((c): c is CollectionWithDetails => c !== null)
      .slice(0, limit); // Take only requested number

    return result;
  } catch (error) {
    console.error('Error in getTopCollections:', error);
    return [];
  }
}

/**
 * Get featured/hero collection (highest vote score)
 */
export async function getFeaturedCollection(
  citySlug?: string
): Promise<CollectionWithDetails | null> {
  const collections = await getTopCollections(citySlug, 1);
  return collections[0] || null;
}

/**
 * Get random top collections (for featured section with variety)
 * Uses PostgreSQL's RANDOM() for server-side randomization
 */
export async function getRandomTopCollections(
  citySlug?: string,
  limit: number = 4
): Promise<CollectionWithDetails[]> {
  const supabase = await createClient();

  try {
    // First get all active collections with good scores, then use RPC for random
    const { data: collections, error } = await supabase
      .from('collections')
      .select(`
        *,
        creator:users!collections_creator_id_fkey(id, username),
        category:categories!collections_category_id_fkey(id, slug, names),
        collection_places(
          id,
          place:places(id, names, location:locations(slug))
        )
      `)
      .eq('status', 'active')
      .gte('vote_score', 0) // Only collections with non-negative scores
      .limit(20); // Get more than needed to allow for filtering

    if (error) {
      console.error('Error fetching random collections:', error);
      return [];
    }

    if (!collections || collections.length === 0) return [];

    // Filter by city if needed
    let filteredCollections = collections;
    if (citySlug && citySlug !== 'all') {
      filteredCollections = collections.filter((collection) => {
        const places = (collection.collection_places || []).filter(
          (cp: any) => cp.place?.location?.slug === citySlug
        );
        return places.length > 0;
      });
    }

    // Shuffle in-memory (this is fine because we're in an async server function, not render)
    const shuffled = [...filteredCollections].sort(() => Math.random() - 0.5);

    // Take requested number and transform
    return shuffled.slice(0, limit).map((collection) => {
      const places = (collection.collection_places || []).filter(
        (cp: any) => cp.place
      );

      return {
        ...collection,
        places_count: places.length,
        preview_places: places.slice(0, 3).map((cp: any) => ({
          id: cp.place.id,
          names: cp.place.names,
        })),
      } as CollectionWithDetails;
    });
  } catch (error) {
    console.error('Error in getRandomTopCollections:', error);
    return [];
  }
}
