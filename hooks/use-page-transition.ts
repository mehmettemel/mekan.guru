import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook to detect page transitions
 * Returns isTransitioning state
 */
export function usePageTransition() {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousPath, setPreviousPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== previousPath) {
      setIsTransitioning(true);
      setPreviousPath(pathname);

      // Reset after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 600); // Match with animation duration

      return () => clearTimeout(timer);
    }
  }, [pathname, previousPath]);

  return { isTransitioning, pathname };
}
