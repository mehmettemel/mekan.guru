import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || `/${locale}`;

  console.log('Callback route hit:', { locale, code: code?.substring(0, 10) + '...' });

  if (code) {
    const supabase = await createClient();

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        console.log('✅ Email verified successfully, redirecting to:', next);
        // Redirect to the next URL (or home)
        return NextResponse.redirect(new URL(next, request.url));
      } else {
        console.error('❌ Error exchanging code:', error);
        return NextResponse.redirect(
          new URL(`/${locale}/auth/error?message=${encodeURIComponent(error.message)}`, request.url)
        );
      }
    } catch (error) {
      console.error('❌ Exception during code exchange:', error);
      return NextResponse.redirect(
        new URL(`/${locale}/auth/error?message=Verification failed`, request.url)
      );
    }
  }

  // No code provided
  console.log('❌ No code provided in callback');
  return NextResponse.redirect(
    new URL(`/${locale}/auth/error?message=No verification code provided`, request.url)
  );
}
