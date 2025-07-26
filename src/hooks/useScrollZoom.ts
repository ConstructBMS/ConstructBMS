import { useCallback, useEffect, useRef, useState } from 'react';
import { timelineZoomService } from '../services/timelineZoomService';
import { demoModeService } from '../services/demoModeService';

export interface UseScrollZoomOptions {
  debounceMs?: number;
  enabled?: boolean;
  onScrollChange?: (position: { x: number; y: number }) => void;
  onZoomChange?: (settings: any) => void;
  projectId?: string;
}

export interface UseScrollZoomReturn {
  containerRef: React.RefObject<HTMLElement>;
  isDemoMode: boolean;
  isScrollZoomEnabled: boolean;
  scrollPosition: { x: number; y: number };
  zoomLevel: string;
}

export const useScrollZoom = (
  options: UseScrollZoomOptions = {}
): UseScrollZoomReturn => {
  const {
    enabled = true,
    debounceMs = 50,
    onZoomChange,
    onScrollChange,
    projectId = 'demo',
  } = options;

  const lastScrollTime = useRef(0);
  const lastPinchDistance = useRef(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const [isScrollZoomEnabled, setIsScrollZoomEnabled] = useState(enabled);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState('week');
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  // Check demo mode and update scroll zoom availability
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.getDemoMode();
      setIsDemoMode(isDemo);
      setIsScrollZoomEnabled(enabled && !isDemo);
    };
    checkDemoMode();
  }, [enabled]);

  // Load current zoom settings
  useEffect(() => {
    const loadZoomSettings = async () => {
      try {
        const settings =
          await timelineZoomService.getProjectZoomSettings(projectId);
        setZoomLevel(settings.zoomLevel);
        setScrollPosition(settings.scrollPosition);
      } catch (error) {
        console.error('Error loading zoom settings:', error);
      }
    };

    if (projectId) {
      loadZoomSettings();
    }
  }, [projectId]);

  // Handle wheel zoom event
  const handleWheel = useCallback(
    async (event: WheelEvent) => {
      // Check if scroll zoom is enabled
      if (!isScrollZoomEnabled || !projectId) {
        return;
      }

      // Check for Ctrl key (or Cmd on Mac) for zoom
      if (event.ctrlKey || event.metaKey) {
        // Prevent default scroll behavior
        event.preventDefault();
        event.stopPropagation();

        // Debounce scroll events
        const now = Date.now();
        if (now - lastScrollTime.current < debounceMs) {
          return;
        }
        lastScrollTime.current = now;

        // Handle zoom
        try {
          const delta = event.deltaY;
          let result;

          if (delta < 0) {
            // Zoom in
            result = await timelineZoomService.zoomIn(projectId);
          } else if (delta > 0) {
            // Zoom out
            result = await timelineZoomService.zoomOut(projectId);
          }

          if (result?.success && result.settings) {
            setZoomLevel(result.settings.zoomLevel);
            setScrollPosition(result.settings.scrollPosition);
            onZoomChange?.(result.settings);
          }
        } catch (error) {
          console.error('Error handling scroll zoom:', error);
        }
      } else {
        // Handle horizontal scrolling
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
          // Horizontal scroll
          event.preventDefault();
          event.stopPropagation();

          const newScrollX = scrollPosition.x - event.deltaX;
          const newScrollPosition = {
            x: Math.max(0, newScrollX),
            y: scrollPosition.y,
          };

          setScrollPosition(newScrollPosition);
          onScrollChange?.(newScrollPosition);

          // Save scroll position
          try {
            const settings =
              await timelineZoomService.getProjectZoomSettings(projectId);
            const updatedSettings = {
              ...settings,
              scrollPosition: newScrollPosition,
              updatedAt: new Date(),
            };
            await timelineZoomService.saveZoomSettings(updatedSettings);
          } catch (error) {
            console.error('Error saving scroll position:', error);
          }
        }
      }
    },
    [
      isScrollZoomEnabled,
      projectId,
      debounceMs,
      onZoomChange,
      onScrollChange,
      scrollPosition,
    ]
  );

  // Handle touch events for pinch zoom
  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!isScrollZoomEnabled || !projectId) return;

      if (event.touches.length === 2) {
        // Calculate initial distance between two touches
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        lastPinchDistance.current = distance;
      }
    },
    [isScrollZoomEnabled, projectId]
  );

  const handleTouchMove = useCallback(
    async (event: TouchEvent) => {
      if (!isScrollZoomEnabled || !projectId || event.touches.length !== 2)
        return;

      // Prevent default to avoid page zoom
      event.preventDefault();

      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const delta = distance - lastPinchDistance.current;
      const threshold = 50; // Minimum distance change to trigger zoom

      if (Math.abs(delta) > threshold) {
        try {
          let result;

          if (delta > 0) {
            // Pinch out - zoom in
            result = await timelineZoomService.zoomIn(projectId);
          } else {
            // Pinch in - zoom out
            result = await timelineZoomService.zoomOut(projectId);
          }

          if (result?.success && result.settings) {
            setZoomLevel(result.settings.zoomLevel);
            setScrollPosition(result.settings.scrollPosition);
            onZoomChange?.(result.settings);
          }

          lastPinchDistance.current = distance;
        } catch (error) {
          console.error('Error handling pinch zoom:', error);
        }
      }
    },
    [isScrollZoomEnabled, projectId, onZoomChange]
  );

  // Handle drag scrolling
  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (!isScrollZoomEnabled || !projectId) return;

      // Only handle left mouse button
      if (event.button !== 0) return;

      let isDragging = false;
      let startX = event.clientX;
      let startY = event.clientY;
      let startScrollX = scrollPosition.x;
      let startScrollY = scrollPosition.y;

      const handleMouseMove = async (moveEvent: MouseEvent) => {
        if (!isDragging) {
          isDragging = true;
          if (containerRef.current) {
            containerRef.current.style.cursor = 'grabbing';
          }
        }

        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        const newScrollX = Math.max(0, startScrollX - deltaX);
        const newScrollY = Math.max(0, startScrollY - deltaY);
        const newScrollPosition = { x: newScrollX, y: newScrollY };

        setScrollPosition(newScrollPosition);
        onScrollChange?.(newScrollPosition);
      };

      const handleMouseUp = async () => {
        if (isDragging) {
          // Save final scroll position
          try {
            const settings =
              await timelineZoomService.getProjectZoomSettings(projectId);
            const updatedSettings = {
              ...settings,
              scrollPosition: scrollPosition,
              updatedAt: new Date(),
            };
            await timelineZoomService.saveZoomSettings(updatedSettings);
          } catch (error) {
            console.error('Error saving scroll position:', error);
          }
        }

        if (containerRef.current) {
          containerRef.current.style.cursor = 'grab';
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [isScrollZoomEnabled, projectId, scrollPosition, onScrollChange]
  );

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Add event listeners
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    container.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    container.addEventListener('mousedown', handleMouseDown);

    // Set cursor style
    container.style.cursor = 'grab';

    // Cleanup
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.style.cursor = '';
    };
  }, [
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleMouseDown,
    enabled,
  ]);

  // Set up zoom change listener
  useEffect(() => {
    if (!onZoomChange) return;

    // This would typically be handled by the service, but we can set up a listener here
    const handleZoomChange = (settings: any) => {
      setZoomLevel(settings.zoomLevel);
      setScrollPosition(settings.scrollPosition);
      onZoomChange(settings);
    };

    // Return cleanup function
    return () => {
      // Cleanup if needed
    };
  }, [onZoomChange]);

  return {
    containerRef,
    isScrollZoomEnabled,
    isDemoMode,
    zoomLevel,
    scrollPosition,
  };
};
