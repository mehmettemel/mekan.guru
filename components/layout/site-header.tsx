'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthButton } from '@/components/auth/auth-button';
import { Sparkles } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800/50 dark:bg-neutral-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-orange-500 dark:text-orange-400" />
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            LocalFlavors
          </h1>
        </Link>
        <nav className="flex items-center gap-3">
          <AuthButton />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
