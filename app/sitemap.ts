import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://localflavours.com';
  const supabase = createClient();

  // Static routes
  const routes = [
    '',
    '/favorites',
    '/my-collections',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // Fetch collections
  const { data: collections } = await supabase
    .from('collections')
    .select('slug, updated_at')
    .eq('status', 'active')
    .order('vote_score', { ascending: false })
    .limit(1000);

  const collectionRoutes = (collections || []).map((collection: any) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    lastModified: collection.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Fetch places
  const { data: places } = await supabase
    .from('places')
    .select('slug, updated_at')
    .eq('status', 'approved')
    .order('vote_score', { ascending: false })
    .limit(1000);

  const placeRoutes = (places || []).map((place: any) => ({
    url: `${baseUrl}/places/${place.slug}`,
    lastModified: place.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Fetch cities
  const { data: cities } = await supabase
    .from('locations')
    .select('slug, updated_at')
    .eq('type', 'city');

  const cityRoutes = (cities || []).map((city: any) => ({
    url: `${baseUrl}/turkey/${city.slug}`,
    lastModified: city.updated_at || new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at');

  const categoryRoutes = (categories || []).map((category: any) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.created_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Fetch user profiles
  const { data: users } = await supabase
    .from('users')
    .select('username, updated_at')
    .limit(500);

  const profileRoutes = (users || []).map((user: any) => ({
    url: `${baseUrl}/profile/${user.username}`,
    lastModified: user.updated_at,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...routes, ...cityRoutes, ...collectionRoutes, ...placeRoutes, ...categoryRoutes, ...profileRoutes];
}
