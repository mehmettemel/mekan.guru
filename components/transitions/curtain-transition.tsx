'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function CurtainTransition() {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isAnimating) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]">
      {/* Top Curtain */}
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: ['0%', '0%', '-100%'] }}
        transition={{
          duration: 0.8,
          times: [0, 0.5, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-orange-500 to-orange-400 opacity-95"
      />

      {/* Bottom Curtain */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: ['0%', '0%', '100%'] }}
        transition={{
          duration: 0.8,
          times: [0, 0.5, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-orange-500 to-orange-400 opacity-95"
      />

      {/* Center Logo/Text (optional) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }}
        transition={{
          duration: 0.8,
          times: [0, 0.3, 0.7, 1],
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="text-4xl font-bold text-white drop-shadow-lg">
          LF
        </div>
      </motion.div>
    </div>
  );
}
