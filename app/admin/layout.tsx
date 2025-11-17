import Link from 'next/link';
import { MapPin, Store, LayoutDashboard, FolderTree, BookMarked } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex h-16 items-center border-b border-neutral-200 px-6 dark:border-neutral-800">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            Yönetim Paneli
          </h1>
        </div>

        <nav className="space-y-1 p-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Ana Sayfa</span>
          </Link>

          <Link
            href="/admin/places"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            <Store className="h-5 w-5" />
            <span className="font-medium">Mekanlar</span>
          </Link>

          <Link
            href="/admin/locations"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            <MapPin className="h-5 w-5" />
            <span className="font-medium">Lokasyonlar</span>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            <FolderTree className="h-5 w-5" />
            <span className="font-medium">Kategoriler</span>
          </Link>

          <Link
            href="/admin/collections"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            <BookMarked className="h-5 w-5" />
            <span className="font-medium">Koleksiyonlar</span>
          </Link>
        </nav>

        <Separator className="my-4" />

        <div className="px-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            ← Siteye Dön
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
