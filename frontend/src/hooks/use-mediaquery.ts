import { useEffect, useState } from 'react';

export type MediaQueryCallback = (matches: boolean) => void;

export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if window is defined (for SSR compatibility)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(query);

      // Set initial value
      setMatches(mediaQuery.matches);

      // Create event listener function
      const handler = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Add event listener
      mediaQuery.addEventListener('change', handler);

      // Cleanup
      return () => {
        mediaQuery.removeEventListener('change', handler);
      };
    }
  }, [query]); // Re-run effect if query changes

  return matches;
}

// Preset hooks for common breakpoints
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 1023px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}
