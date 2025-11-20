import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface Location {
  id: string;
  slug: string;
  names: { tr: string; en: string };
  type: 'country' | 'city' | 'district';
  parent_id: string | null;
  latitude: number;
  longitude: number;
}

/**
 * Fetch all cities
 */
export function useCities() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['locations', 'cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('type', 'city')
        .order('names->tr');

      if (error) throw error;
      return data as Location[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (cities don't change often)
  });
}

/**
 * Fetch districts by city ID
 */
export function useDistricts(cityId: string | null | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['locations', 'districts', cityId],
    queryFn: async () => {
      if (!cityId) return [];

      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('type', 'district')
        .eq('parent_id', cityId)
        .order('names->tr');

      if (error) throw error;
      return data as Location[];
    },
    enabled: !!cityId,
    staleTime: 10 * 60 * 1000,
  });
}
