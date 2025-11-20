import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface Category {
  id: string;
  slug: string;
  names: { tr: string; en: string };
  icon: string;
  display_order: number;
  parent_id: string | null;
}

/**
 * Fetch all main categories (parent_id is null)
 */
export function useMainCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['categories', 'main'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('display_order');

      if (error) throw error;
      return data as Category[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch subcategories by parent category ID
 */
export function useSubcategories(parentId: string | null | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['categories', 'subcategories', parentId],
    queryFn: async () => {
      if (!parentId) return [];

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', parentId)
        .order('display_order');

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!parentId, // Only run query if parentId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch all categories (main + subcategories)
 */
export function useAllCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data as Category[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
