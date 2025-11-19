import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Singleton pattern - single client instance for the entire app
let client: SupabaseClient<Database> | null = null;

/**
 * Create or return existing Supabase browser client
 * Uses singleton pattern for optimal performance and consistency
 */
export function createClient() {
  if (client) {
    return client;
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce', // More secure than implicit flow
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    }
  );

  return client;
}

/**
 * Reset client singleton
 * Used primarily for testing or complete logout
 */
export function resetClient() {
  client = null;
}
