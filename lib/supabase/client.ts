import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Singleton pattern to avoid creating multiple instances
let client: SupabaseClient<Database> | null = null;

export function createClient() {
  if (client) {
    return client;
  }

  // Determine cookie domain for production
  // In production, don't set domain to allow cookies to work on any subdomain
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieDomain = isProduction
    ? undefined // Let browser handle it automatically
    : (typeof window !== 'undefined' ? window.location.hostname : undefined);

  console.log('🔧 [SUPABASE CLIENT] Creating client...');
  console.log('🔧 [SUPABASE CLIENT] Environment:', process.env.NODE_ENV);
  console.log('🔧 [SUPABASE CLIENT] Cookie domain:', cookieDomain);

  // @supabase/ssr handles cookies automatically in the browser
  // Singleton ensures consistent session management across the app
  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      cookieOptions: {
        domain: cookieDomain,
        path: '/',
        sameSite: 'lax',
      },
    }
  );

  console.log('✅ [SUPABASE CLIENT] Client created successfully');
  return client;
}

// Helper to reset client (useful for testing or logout)
export function resetClient() {
  client = null;
}
