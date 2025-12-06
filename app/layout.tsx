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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mekan.guru'),
  title: {
    default: 'mekan.guru - Türkiye\'nin En İyi Restoranları ve Mekanları',
    template: '%s | mekan.guru',
  },
  description:
    'Türkiye\'nin tüm şehirlerinden en iyi restoranları, kafeleri ve mekanları keşfedin. Kullanıcı önerileri ve puanlamaları ile güvenilir mekan rehberi.',
  keywords: [
    'mekan.guru',
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
  authors: [{ name: 'mekan.guru Team' }],
  creator: 'mekan.guru',
  publisher: 'mekan.guru',
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
    url: 'https://mekan.guru',
    title: 'mekan.guru - Türkiye\'nin En İyi Restoranları',
    description:
      'Türkiye\'nin tüm şehirlerinden en iyi restoranları, kafeleri ve mekanları keşfedin. Kullanıcı önerileri ile güvenilir mekan rehberi.',
    siteName: 'mekan.guru',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'mekan.guru - Türkiye Restoran Rehberi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mekan.guru - Türkiye\'nin En İyi Restoranları',
    description:
      'Türkiye\'nin tüm şehirlerinden en iyi restoranları keşfedin. Kullanıcı önerileri ile güvenilir mekan rehberi.',
    creator: '@mekanguru',
    images: ['/og-image.jpg'],
  },
  // icons are handled automatically by file conventions (app/icon.png, app/apple-icon.png)
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'google-site-verification=PLACEHOLDER', // TODO: Replace with actual Google Search Console verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Google Analytics 4 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-DG0S76VP6K"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-DG0S76VP6K');
            `,
          }}
        />
      </head>
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
