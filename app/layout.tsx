import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { AlertDialogProvider } from '@/components/providers/alert-dialog-provider';
import { SiteHeader } from '@/components/layout/site-header';
import { Toaster } from '@/components/ui/sonner';
import { RouteProgress } from '@/components/transitions/route-progress';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://localflavours.com'),
  title: {
    default: 'Local Flavours - Türkiye\'nin En İyi Restoranları ve Mekanları',
    template: '%s | Local Flavours',
  },
  description:
    'Türkiye\'nin tüm şehirlerinden en iyi restoranları, kafeleri ve mekanları keşfedin. Kullanıcı önerileri ve puanlamaları ile güvenilir mekan rehberi.',
  keywords: [
    'türkiye restoranlar',
    'restoran önerileri',
    'mekan keşfi',
    'istanbul restoranlar',
    'ankara mekanlar',
    'izmir kafeler',
    'en iyi kebapçılar',
    'kahvaltı yerleri',
    'yemek koleksiyonları',
    'yerel lezzetler',
    'restaurant guide turkey',
    'best restaurants istanbul',
    'food recommendations',
    'mekan rehberi',
    'restoran puanlama',
    'kullanıcı önerileri'
  ],
  authors: [{ name: 'Local Flavours Team' }],
  creator: 'Local Flavours',
  publisher: 'Local Flavours',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    title: 'Local Flavours - Türkiye\'nin En İyi Restoranları',
    description:
      'Türkiye\'nin tüm şehirlerinden en iyi restoranları, kafeleri ve mekanları keşfedin. Kullanıcı önerileri ile güvenilir mekan rehberi.',
    siteName: 'Local Flavours',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Local Flavours - Türkiye Restoran Rehberi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Local Flavours - Türkiye\'nin En İyi Restoranları',
    description:
      'Türkiye\'nin tüm şehirlerinden en iyi restoranları keşfedin. Kullanıcı önerileri ile güvenilir mekan rehberi.',
    creator: '@localflavours',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'google-site-verification-code', // Google Search Console'dan alınacak
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <RouteProgress />
              <SiteHeader />
              {children}
              <Toaster richColors position="top-center" />
              <AlertDialogProvider />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
