'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Doğrulama işlemi yapılıyor...');

  const supabase = createClient();

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      const type = searchParams.get('type');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle error from Supabase
      if (error) {
        setStatus('error');
        setMessage(errorDescription || error);
        toast.error('Doğrulama Hatası', { description: errorDescription || error });
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('Doğrulama kodu bulunamadı.');
        toast.error('Hata', { description: 'Doğrulama kodu bulunamadı.' });
        return;
      }

      try {
        // Exchange code for session - this works client-side because PKCE verifier is in localStorage
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          throw exchangeError;
        }

        if (data.session) {
          setStatus('success');

          // Handle different auth types
          if (type === 'recovery') {
            setMessage('Şifre sıfırlama doğrulandı. Yönlendiriliyorsunuz...');
            toast.success('Doğrulama Başarılı', { description: 'Şifre belirleme sayfasına yönlendiriliyorsunuz.' });
            setTimeout(() => router.push('/auth/reset-password'), 1500);
          } else if (type === 'signup' || type === 'email') {
            setMessage('E-posta doğrulandı. Ana sayfaya yönlendiriliyorsunuz...');
            toast.success('Hoş Geldiniz!', { description: 'E-posta adresiniz başarıyla doğrulandı.' });
            setTimeout(() => router.push('/'), 1500);
          } else {
            setMessage('Giriş başarılı. Yönlendiriliyorsunuz...');
            toast.success('Giriş Başarılı');
            setTimeout(() => router.push('/'), 1500);
          }
        }
      } catch (err: any) {
        console.error('Auth exchange error:', err);
        setStatus('error');
        
        // Provide user-friendly error messages
        if (err.message?.includes('expired')) {
          setMessage('Bağlantının süresi dolmuş. Lütfen yeni bir bağlantı talep edin.');
        } else if (err.message?.includes('invalid')) {
          setMessage('Bağlantı geçersiz. Lütfen yeni bir bağlantı talep edin.');
        } else {
          setMessage(err.message || 'Doğrulama sırasında bir hata oluştu.');
        }
        
        toast.error('Doğrulama Hatası', { description: message });
      }
    };

    handleAuth();
  }, [searchParams, router, supabase.auth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-md rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500" />
            <h1 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              Doğrulanıyor
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {message}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              Başarılı!
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              Doğrulama Hatası
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {message}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 rounded-lg bg-orange-500 px-6 py-2 text-white transition-colors hover:bg-orange-600"
            >
              Ana Sayfaya Dön
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
