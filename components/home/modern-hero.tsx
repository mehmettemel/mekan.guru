'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, MapPin, Search, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function ModernHero() {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-20 lg:pt-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-neutral-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-orange-400 opacity-20 blur-[100px] dark:bg-orange-500/20"></div>
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Badge 
              variant="outline" 
              className="rounded-full border-orange-200 bg-orange-50/50 px-4 py-1.5 text-sm text-orange-700 backdrop-blur-sm dark:border-orange-800/50 dark:bg-orange-900/20 dark:text-orange-400"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              <span className="font-medium">Türkiye&apos;nin En Kapsamlı Mekan Rehberi</span>
            </Badge>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-neutral-50"
          >
            Şehrin En İyi Mekanlarını <br className="hidden sm:block" />
            <span className="relative whitespace-nowrap text-orange-600 dark:text-orange-500">
              <span className="relative z-10">Birlikte Keşfedelim</span>
              <motion.span
                className="absolute -bottom-2 left-0 -z-10 h-3 w-full -rotate-1 bg-orange-200/50 dark:bg-orange-900/50"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, delay: 0.5 }}
              ></motion.span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 max-w-2xl text-lg text-neutral-600 sm:text-xl dark:text-neutral-400"
          >
            Gerçek kullanıcı deneyimlerine dayalı, küratörler tarafından özenle hazırlanmış listelerle şehrin gizli kalmış lezzet duraklarını keşfedin.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-16 flex flex-wrap justify-center gap-4"
          >
            <Button size="lg" className="h-12 rounded-full px-8 text-base" asChild>
              <Link href="/kesfet">
                Hemen Keşfet <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 rounded-full px-8 text-base" asChild>
              <Link href="/koleksiyon-olustur">
                Koleksiyon Oluştur
              </Link>
            </Button>
          </motion.div>

          {/* Dashboard Preview / Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto w-full max-w-5xl"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 opacity-20 blur-2xl dark:opacity-10"></div>
            
            {/* Mockup Container */}
            <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
              {/* Browser Header Mockup */}
              <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-400/80"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400/80"></div>
                </div>
                <div className="mx-auto flex w-full max-w-md items-center justify-center rounded-md bg-white py-1 text-xs text-neutral-400 shadow-sm dark:bg-neutral-800">
                  <Search className="mr-2 h-3 w-3" />
                  mekan.guru/istanbul/en-iyi-kahvalti
                </div>
              </div>

              {/* Content Preview */}
              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3 md:p-8">
                {/* Left Column - Filter Mockup */}
                <div className="hidden space-y-4 md:block">
                  <div className="h-8 w-24 rounded-md bg-neutral-100 dark:bg-neutral-800"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-neutral-50 dark:bg-neutral-800/50"></div>
                    <div className="h-4 w-3/4 rounded bg-neutral-50 dark:bg-neutral-800/50"></div>
                    <div className="h-4 w-5/6 rounded bg-neutral-50 dark:bg-neutral-800/50"></div>
                  </div>
                  <div className="mt-8 h-32 w-full rounded-lg bg-orange-50/50 p-4 dark:bg-orange-900/10">
                    <div className="mb-2 h-4 w-12 rounded bg-orange-200/50 dark:bg-orange-800/50"></div>
                    <div className="h-full w-full rounded bg-orange-100/20 dark:bg-orange-800/20"></div>
                  </div>
                </div>

                {/* Middle/Right Column - Cards Mockup */}
                <div className="col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-48 rounded-md bg-neutral-100 dark:bg-neutral-800"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-md bg-neutral-100 dark:bg-neutral-800"></div>
                      <div className="h-8 w-8 rounded-md bg-neutral-100 dark:bg-neutral-800"></div>
                    </div>
                  </div>

                  {/* Card 1 */}
                  <div className="flex gap-4 rounded-lg border border-neutral-100 p-4 shadow-sm dark:border-neutral-800">
                    <div className="h-24 w-24 flex-shrink-0 rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <div className="h-5 w-32 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="h-5 w-12 rounded bg-green-100 dark:bg-green-900/30"></div>
                      </div>
                      <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800"></div>
                      <div className="h-4 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800"></div>
                      <div className="flex gap-2 pt-2">
                        <div className="h-6 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800"></div>
                        <div className="h-6 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800"></div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="flex gap-4 rounded-lg border border-neutral-100 p-4 shadow-sm dark:border-neutral-800">
                    <div className="h-24 w-24 flex-shrink-0 rounded-md bg-neutral-200 dark:bg-neutral-800"></div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <div className="h-5 w-40 rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="h-5 w-12 rounded bg-green-100 dark:bg-green-900/30"></div>
                      </div>
                      <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800"></div>
                      <div className="h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
