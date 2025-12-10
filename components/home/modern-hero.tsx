'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, MapPin, Search, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth-context';
import { EditCollectionModal } from '@/components/collections/edit-collection-modal';
import { useRouter } from 'next/navigation';

export function ModernHero() {
  const { user } = useAuth();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleScrollToLeaderboard = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('leaderboard');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCreateCollection = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      // Dispatch event to open login dialog
      window.dispatchEvent(new CustomEvent('open-login-dialog'));
    } else {
      setShowCreateModal(true);
    }
  };

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
            className="mb-6 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-5xl lg:text-6xl dark:text-neutral-50"
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
            className="mb-10 max-w-2xl text-base text-neutral-600 sm:text-lg dark:text-neutral-400"
          >
            Gerçek kullanıcı deneyimlerine dayalı,şehrin gizli kalmış lezzet duraklarını keşfedin.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-16 flex flex-wrap justify-center gap-4"
          >
            <Button size="lg" className="h-12 rounded-full px-8 text-base" onClick={handleScrollToLeaderboard}>
              Hemen Keşfet <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 rounded-full px-8 text-base" onClick={handleCreateCollection}>
              Koleksiyon Oluştur
            </Button>
          </motion.div>
        </div>
      </div>

      {user && (
        <EditCollectionModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={() => {
            setShowCreateModal(false);
            router.refresh();
          }}
          userId={user.id}
        />
      )}
    </section>
  );
}

