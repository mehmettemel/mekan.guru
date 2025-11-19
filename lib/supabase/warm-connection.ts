// Warm up Supabase connection to prevent cold start delays
// This helps avoid the initial timeout issue on first request

import { createClient } from './client';

let warmed = false;

export async function warmSupabaseConnection() {
  if (warmed) {
    console.log('🔥 [WARM CONNECTION] Already warmed, skipping');
    return;
  }

  try {
    console.log('🔥 [WARM CONNECTION] Warming up Supabase connection...');
    const supabase = createClient();

    // Make a simple query to wake up the connection
    // This ensures the connection pool is ready
    const start = Date.now();
    await supabase.from('users').select('id').limit(1);
    const duration = Date.now() - start;

    console.log(`🔥 [WARM CONNECTION] Connection warmed in ${duration}ms`);
    warmed = true;
  } catch (error) {
    console.error('❌ [WARM CONNECTION] Failed to warm connection:', error);
    // Don't block the app if warming fails
  }
}

// Reset for testing
export function resetWarmState() {
  warmed = false;
}
