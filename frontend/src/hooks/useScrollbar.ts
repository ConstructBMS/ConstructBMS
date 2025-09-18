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

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      // Add scrolling class immediately
      if (!isScrollingRef.current) {
        element.classList.add('scrolling');
        isScrollingRef.current = true;
      }
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Remove scrolling class after scroll stops - longer delay
      scrollTimeoutRef.current = setTimeout(() => {
        element.classList.remove('scrolling');
        isScrollingRef.current = false;
      }, 600); // Reduced delay for better responsiveness
    };

    // Add scroll listener with passive for better performance
    element.addEventListener('scroll', handleScroll, { passive: true });

    // Handle mouse wheel events more carefully to avoid interfering with main page scroll
    const handleWheel = (event: WheelEvent) => {
      // Only handle if the element is scrollable and the wheel event is within the element bounds
      const rect = element.getBoundingClientRect();
      const isWithinBounds = 
        event.clientX >= rect.left && 
        event.clientX <= rect.right && 
        event.clientY >= rect.top && 
        event.clientY <= rect.bottom;
      
      if (isWithinBounds && (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)) {
        // Check if the element can actually scroll in the direction of the wheel event
        const canScrollVertically = element.scrollHeight > element.clientHeight;
        const canScrollHorizontally = element.scrollWidth > element.clientWidth;
        
        if ((event.deltaY !== 0 && canScrollVertically) || (event.deltaX !== 0 && canScrollHorizontally)) {
          handleScroll();
        }
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

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
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
      }, 800); // Longer delay for fade effect
    };

    // Add scroll listener with passive for better performance
    element.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle mouse wheel events more carefully to avoid interfering with main page scroll
    const handleWheel = (event: WheelEvent) => {
      // Only handle if the element is scrollable and the wheel event is within the element bounds
      const rect = element.getBoundingClientRect();
      const isWithinBounds = 
        event.clientX >= rect.left && 
        event.clientX <= rect.right && 
        event.clientY >= rect.top && 
        event.clientY <= rect.bottom;
      
      if (isWithinBounds && (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)) {
        // Check if the element can actually scroll in the direction of the wheel event
        const canScrollVertically = element.scrollHeight > element.clientHeight;
        const canScrollHorizontally = element.scrollWidth > element.clientWidth;
        
        if ((event.deltaY !== 0 && canScrollVertically) || (event.deltaX !== 0 && canScrollHorizontally)) {
          handleScroll();
        }
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