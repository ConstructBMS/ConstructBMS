// Drag and drop utility functions
export interface DragState {
  currentPosition: { x: number; y: number 
};
  dragStart: { x: number; y: number } | null;
  isDragging: boolean;
}

export const calculateDistance = (
  start: { x: number; y: number },
  end: { x: number; y: number }
): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const isClickNotDrag = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  threshold = 5
): boolean => {
  return calculateDistance(start, end) < threshold;
};

export const clampPosition = (
  position: { x: number; y: number },
  bounds: { height: number, width: number; },
  itemSize: { height: number, width: number; }
): { x: number; y: number } => {
  return {
    x: Math.max(0, Math.min(bounds.width - itemSize.width, position.x)),
    y: Math.max(0, Math.min(bounds.height - itemSize.height, position.y)),
  };
};

export const getAutoScrollSpeed = (
  mousePosition: number,
  containerStart: number,
  containerEnd: number,
  threshold = 100,
  maxSpeed = 15
): number => {
  const distanceFromStart = mousePosition - containerStart;
  const distanceFromEnd = containerEnd - mousePosition;

  if (distanceFromStart < threshold) {
    return -Math.min(
      maxSpeed,
      ((threshold - distanceFromStart) / threshold) * maxSpeed
    );
  }

  if (distanceFromEnd < threshold) {
    return Math.min(
      maxSpeed,
      ((threshold - distanceFromEnd) / threshold) * maxSpeed
    );
  }

  return 0;
};
