import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../supabase/server';
import { Database } from '@/types/database';
import { handleDbError } from '@/lib/utils/db-error';

export type Place = Database['public']['Tables']['places']['Row'];
type PlaceInsert = Database['public']['Tables']['places']['Insert'];
type PlaceUpdate = Database['public']['Tables']['places']['Update'];

export async function getPlaces(params?: {
  location_id?: string;
  category_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = (await createClient()) as SupabaseClient<Database>;

  let query = supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `);

  if (params?.location_id) {
    query = query.eq('location_id', params.location_id);
  }
  if (params?.category_id) {
    query = query.eq('category_id', params.category_id);
  }
  if (params?.status) {
    query = query.eq('status', params.status);
  }

  // Default ordering, can be made dynamic if needed
  query = query.order('created_at', { ascending: false });

  if (params?.limit !== undefined && params?.offset !== undefined) {
    query = query.range(params.offset, params.offset + params.limit - 1);
  } else if (params?.limit !== undefined) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    handleDbError(error, 'getPlaces');
  }
  return data;
}

export async function getPlacesByLocation(locationId: string, limit = 20, categorySlug?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .eq('location_id', locationId)
    .eq('status', 'approved');

  // If category filter is provided, join with categories and filter
  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (category) {
      query = query.eq('category_id', (category as any).id);
    }
  }

  const { data, error } = await query
    .order('vote_score', { ascending: false })
    .limit(limit);

  if (error) {
    handleDbError(error, 'getPlacesByLocation');
  }
  return data;
}

export async function getPlacesByLocationAndCategory(
  locationId: string,
  categoryId: string,
  limit = 20
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .eq('location_id', locationId)
    .eq('category_id', categoryId)
    .eq('status', 'approved')
    .order('vote_score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getPlaceBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllPlaces(limit = 100, offset = 0) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

export async function getTopPlacesByCity(citySlug: string, limit = 5) {
  const supabase = await createClient();

  // If "all" is selected, get all places across all cities
  if (citySlug === 'all') {
    const { data: places, error } = await supabase
      .from('places')
      .select(`
        *,
        category:categories(*),
        location:locations(*)
      `)
      .eq('status', 'approved')
      .order('vote_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get vote counts for each place
    const placesWithVotes = await getPlacesWithVoteCounts(supabase, places || []);
    return placesWithVotes;
  }

  // First get the city
  const { data: city } = await supabase
    .from('locations')
    .select('id')
    .eq('slug', citySlug)
    .eq('type', 'city')
    .maybeSingle();

  if (!city) return [];

  // Then get top places
  const { data: places, error } = await supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .eq('location_id', (city as any).id)
    .eq('status', 'approved')
    .order('vote_score', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Get vote counts for each place
  const placesWithVotes = await getPlacesWithVoteCounts(supabase, places || []);
  return placesWithVotes;
}

async function getPlacesWithVoteCounts(supabase: any, places: any[]) {
  if (!places.length) return [];

  const placeIds = places.map(p => p.id);

  // Get upvote counts
  const { data: upvotes } = await supabase
    .from('votes')
    .select('place_id')
    .in('place_id', placeIds)
    .eq('value', 1);

  // Get downvote counts
  const { data: downvotes } = await supabase
    .from('votes')
    .select('place_id')
    .in('place_id', placeIds)
    .eq('value', -1);

  // Count votes per place
  const upvoteCounts: Record<string, number> = {};
  const downvoteCounts: Record<string, number> = {};

  (upvotes || []).forEach((v: any) => {
    upvoteCounts[v.place_id] = (upvoteCounts[v.place_id] || 0) + 1;
  });

  (downvotes || []).forEach((v: any) => {
    downvoteCounts[v.place_id] = (downvoteCounts[v.place_id] || 0) + 1;
  });

  return places.map(place => ({
    ...place,
    upvote_count: upvoteCounts[place.id] || 0,
    downvote_count: downvoteCounts[place.id] || 0,
  }));
}
