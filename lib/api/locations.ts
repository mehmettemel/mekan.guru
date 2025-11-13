import { createClient } from '../supabase/server';
import { Database } from '@/types/database';

export type Location = Database['public']['Tables']['locations']['Row'];

export async function getCountries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('type', 'country')
    .order('names->en');

  if (error) throw error;
  return data;
}

export async function getCitiesByCountry(countrySlug: string) {
  const supabase = await createClient();

  // First get the country
  const { data: country } = await supabase
    .from('locations')
    .select('id')
    .eq('slug', countrySlug)
    .eq('type', 'country')
    .single();

  if (!country) return [];

  // Then get cities
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('parent_id', country.id)
    .eq('type', 'city')
    .order('names->en');

  if (error) throw error;
  return data;
}

export async function getDistrictsByCity(citySlug: string) {
  const supabase = await createClient();

  // First get the city
  const { data: city } = await supabase
    .from('locations')
    .select('id')
    .eq('slug', citySlug)
    .eq('type', 'city')
    .single();

  if (!city) return [];

  // Then get districts
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('parent_id', city.id)
    .eq('type', 'district')
    .order('names->en');

  if (error) throw error;
  return data;
}

export async function getLocationBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

// Get cities with place count
export async function getCitiesWithCount(countrySlug: string) {
  const supabase = await createClient();

  const { data: country } = await supabase
    .from('locations')
    .select('id')
    .eq('slug', countrySlug)
    .eq('type', 'country')
    .single();

  if (!country) return [];

  const { data: cities, error } = await supabase
    .from('locations')
    .select(`
      *,
      places:places(count)
    `)
    .eq('parent_id', country.id)
    .eq('type', 'city')
    .order('names->en');

  if (error) throw error;

  return cities?.map(city => ({
    ...city,
    placeCount: city.places?.[0]?.count || 0
  }));
}
