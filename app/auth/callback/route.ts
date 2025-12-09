import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  
  // Redirect all auth callbacks to the client-side confirm page
  // This is necessary because PKCE code_verifier is stored in the browser's localStorage
  // and cannot be accessed server-side. The client-side page will handle the exchange.
  
  const confirmUrl = new URL('/auth/confirm', request.url);
  
  // Preserve all query parameters (code, type, error, error_description, etc.)
  requestUrl.searchParams.forEach((value, key) => {
    confirmUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(confirmUrl);
}
