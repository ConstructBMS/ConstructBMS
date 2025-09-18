import { useEffect, useRef } from 'react';

/**
 * Hook to manage custom scrollbar behavior
 * Adds 'scrolling' class during scroll and removes it after scroll stops
 * Optimized for better performance and responsiveness
 */
export function useScrollbar() {
  const elementRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = (event: Event) => {
      const now = Date.now();
      lastScrollTimeRef.current = now;
      
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
        // Only remove if no new scroll events occurred
        if (Date.now() - lastScrollTimeRef.current >= 150) {
          element.classList.remove('scrolling');
          isScrollingRef.current = false;
        }
      }, 200); // Increased delay for better UX
    };

    // Add scroll listener with passive for better performance
    element.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also handle mouse wheel events for better detection
    const handleWheel = (event: WheelEvent) => {
      // Only handle if the element is scrollable
      if (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) {
        handleScroll(event);
      }
    };
    
    element.addEventListener('wheel', handleWheel, { passive: true });
    
    // Cleanup
    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array to ensure stable hook order

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
  const lastScrollTimeRef = useRef(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = (event: Event) => {
      const now = Date.now();
      lastScrollTimeRef.current = now;
      
      // Add scrolling class immediately
      if (!isScrollingRef.current) {
        element.classList.add('scrolling');
        isScrollingRef.current = true;
      }
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        // Only remove if no new scroll events occurred
        if (Date.now() - lastScrollTimeRef.current >= 200) {
          element.classList.remove('scrolling');
          isScrollingRef.current = false;
        }
      }, 300); // Longer delay for fade effect
    };

    // Add scroll listener with passive for better performance
    element.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also handle mouse wheel events for better detection
    const handleWheel = (event: WheelEvent) => {
      // Only handle if the element is scrollable
      if (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) {
        handleScroll(event);
      }
    };
    
    element.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array to ensure stable hook order

  return elementRef;
}
