import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { SiteHeader } from '@/components/layout/site-header';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LocalFlavors - Otantik Yerel Lezzetleri Keşfet',
  description: 'Türkiye\'deki en iyi yerel mekanları keşfedin ve paylaşın',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <SiteHeader />
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
