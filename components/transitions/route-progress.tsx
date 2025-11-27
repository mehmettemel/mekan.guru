'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Route değişimi başladı
    setIsNavigating(true);
    setProgress(0);

    // Simulated progress (gerçek loading track etmek zor Next.js'te)
    const timer1 = setTimeout(() => setProgress(30), 100);
    const timer2 = setTimeout(() => setProgress(60), 200);
    const timer3 = setTimeout(() => setProgress(90), 400);

    // Route yüklendiğinde bitir
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setIsNavigating(false), 500);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(completeTimer);
    };
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed left-0 top-0 z-[9999] h-1 w-full origin-left"
          style={{
            background: 'linear-gradient(90deg, #f97316, #fb923c, #fdba74)',
            boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)',
          }}
        />
      )}
    </AnimatePresence>
  );
}
