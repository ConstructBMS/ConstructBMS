import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook to manage custom scrollbar behavior
 * Adds 'scrolling' class during scroll and removes it after scroll stops
 * Optimized for better performance and responsiveness
 */
export function useScrollbar() {
  const elementRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const isScrollingRef = useRef(false);

  const handleScroll = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add scrolling class immediately
    if (!isScrollingRef.current) {
      element.classList.add('scrolling');
      isScrollingRef.current = true;
    }
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Remove scrolling class after scroll stops
    scrollTimeoutRef.current = setTimeout(() => {
      element.classList.remove('scrolling');
      isScrollingRef.current = false;
    }, 100); // Reduced delay for better responsiveness
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add scroll listener with passive for better performance
    element.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  return elementRef;
}

/**
 * Hook for scrollbar with fade effect
 * Combines scroll detection with fade animation
 * Optimized for better performance
 */
export function useScrollbarFade() {
  const elementRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const isScrollingRef = useRef(false);

  const handleScroll = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add scrolling class immediately
    if (!isScrollingRef.current) {
      element.classList.add('scrolling');
      isScrollingRef.current = true;
    }
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      element.classList.remove('scrolling');
      isScrollingRef.current = false;
    }, 200); // Optimized delay for fade effect
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  return elementRef;
}
