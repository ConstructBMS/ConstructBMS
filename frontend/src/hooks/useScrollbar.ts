import { useEffect, useRef } from 'react';

/**
 * Hook to manage custom scrollbar behavior
 * Adds 'scrolling' class during scroll and removes it after scroll stops
 */
export function useScrollbar() {
  const elementRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      // Add scrolling class
      element.classList.add('scrolling');
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Remove scrolling class after scroll stops
      scrollTimeoutRef.current = setTimeout(() => {
        element.classList.remove('scrolling');
      }, 150); // 150ms delay after scroll stops
    };

    // Add scroll listener
    element.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return elementRef;
}

/**
 * Hook for scrollbar with fade effect
 * Combines scroll detection with fade animation
 */
export function useScrollbarFade() {
  const elementRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      element.classList.add('scrolling');
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        element.classList.remove('scrolling');
      }, 300); // Longer delay for fade effect
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return elementRef;
}
