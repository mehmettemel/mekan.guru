// Debug helper to check auth state
export function debugAuthState() {
  if (typeof window === 'undefined') return;

  console.log('=== AUTH DEBUG ===');
  console.log('Hostname:', window.location.hostname);
  console.log('Origin:', window.location.origin);
  console.log('Protocol:', window.location.protocol);

  // Check localStorage
  const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
  console.log('Supabase localStorage keys:', keys);
  keys.forEach(key => {
    console.log(`  ${key}:`, localStorage.getItem(key)?.substring(0, 50) + '...');
  });

  // Check cookies
  const cookies = document.cookie.split(';');
  const supabaseCookies = cookies.filter(c => c.includes('sb-'));
  console.log('Supabase cookies:', supabaseCookies.length);
  supabaseCookies.forEach(cookie => {
    console.log('  ', cookie.trim().substring(0, 50) + '...');
  });

  console.log('=== END DEBUG ===');
}
