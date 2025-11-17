import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Kimlik Doğrulama Hatası
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {message || 'Kimlik doğrulama sırasında bir hata oluştu'}
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild className="flex-1">
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/?auth=login">Tekrar Dene</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
