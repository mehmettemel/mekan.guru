'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthButton } from '@/components/auth/auth-button';
import { Sparkles, HelpCircle, Map, TrendingUp, BookOpen, Mail, Menu, X } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800/50 dark:bg-neutral-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-orange-500 dark:text-orange-400" />
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            LocalFlavors
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex items-center gap-1">
            {/* Keşfet Menu */}
            {/* <NavigationMenuItem className='mt-3'>
              <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), "h-10 bg-transparent")}>Keşfet</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem
                    href="/turkey/istanbul"
                    title="İstanbul"
                    icon={<Map className="h-4 w-4" />}
                  >
                    İstanbul'daki en iyi mekanları keşfedin
                  </ListItem>
                  <ListItem
                    href="/turkey/ankara"
                    title="Ankara"
                    icon={<Map className="h-4 w-4" />}
                  >
                    Ankara'nın popüler restoranları
                  </ListItem>
                  <ListItem
                    href="/turkey/izmir"
                    title="İzmir"
                    icon={<Map className="h-4 w-4" />}
                  >
                    İzmir'de deniz manzaralı mekanlar
                  </ListItem>
                  <ListItem
                    href="/"
                    title="Liderlik Tablosu"
                    icon={<TrendingUp className="h-4 w-4" />}
                  >
                    En çok oy alan koleksiyonlar
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem> */}

            {/* Koleksiyonlar */}
            <NavigationMenuItem>
              <Link href="/my-collections" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "h-10")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Koleksiyonlar
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {/* FAQ */}
            <NavigationMenuItem>
              <Link href="/faq" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "h-10")}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  SSS
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {/* İletişim */}
            <NavigationMenuItem>
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "h-10")}>
                  <Mail className="mr-2 h-4 w-4" />
                  İletişim
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Side Actions & Mobile Menu */}
        <div className="flex items-center gap-3">
          <AuthButton />
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menüyü aç</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  LocalFlavors
                </SheetTitle>
                <SheetDescription className="text-left">
                  Türkiye'nin en iyi mekanları
                </SheetDescription>
              </SheetHeader>

              <nav className="mt-8 flex flex-col gap-1">
                {/* Keşfet Section */}
                <div className="mb-4">
                  <p className="mb-2 px-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                    Keşfet
                  </p>
                  <Link
                    href="/turkey/istanbul"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <Map className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">İstanbul</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        En iyi mekanları keşfedin
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/turkey/ankara"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <Map className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Ankara</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Popüler restoranlar
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/turkey/izmir"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <Map className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">İzmir</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Deniz manzaralı mekanlar
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Liderlik Tablosu</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        En çok oy alan koleksiyonlar
                      </p>
                    </div>
                  </Link>
                </div>

                <Separator className="my-2" />

                {/* Main Navigation Items */}
                <Link
                  href="/my-collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
                >
                  <BookOpen className="h-5 w-5 text-orange-500" />
                  Koleksiyonlar
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
                >
                  <HelpCircle className="h-5 w-5 text-orange-500" />
                  SSS
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30"
                >
                  <Mail className="h-5 w-5 text-orange-500" />
                  İletişim
                </Link>

                <Separator className="my-4" />

                {/* Actions */}
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm font-medium">Tema</span>
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

// ListItem Component
const ListItem = ({
  className,
  title,
  children,
  icon,
  ...props
}: React.ComponentPropsWithoutRef<'a'> & {
  title: string;
  icon?: React.ReactNode;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-orange-50 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 dark:hover:bg-orange-950 dark:hover:text-orange-400 dark:focus:bg-orange-950 dark:focus:text-orange-400',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            {icon}
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-neutral-600 dark:text-neutral-400">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
};
