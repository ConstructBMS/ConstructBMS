// Grid utility functions for sticky notes
export interface GridConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  large: number;
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  mobile: 30,
  tablet: 35,
  desktop: 40,
  large: 45,
};

export const getResponsiveGridSize = (
  containerWidth: number,
  config = DEFAULT_GRID_CONFIG
): number => {
  if (containerWidth < 768) return config.mobile;
  if (containerWidth < 1024) return config.tablet;
  if (containerWidth < 1440) return config.desktop;
  return config.large;
};

export const snapToGrid = (
  x: number,
  y: number,
  gridSize: number,
  immediate = false
): { x: number; y: number } => {
  const snappedX = Math.round(x / gridSize) * gridSize;
  const snappedY = Math.round(y / gridSize) * gridSize;

  // Add slight randomness to prevent notes from overlapping exactly
  const offsetRange = Math.floor(gridSize * 0.15);
  const randomOffsetX = immediate ? 0 : (Math.random() - 0.5) * offsetRange;
  const randomOffsetY = immediate ? 0 : (Math.random() - 0.5) * offsetRange;

  return {
    x: Math.max(0, snappedX + randomOffsetX),
    y: Math.max(0, snappedY + randomOffsetY),
  };
};

export const calculateCanvasSize = (
  items: Array<{ position: { x: number; y: number } }>,
  itemWidth = 400,
  itemHeight = 400,
  minWidth = 1200,
  minHeight = 800,
  padding = 200
): { width: number; height: number } => {
  if (items.length === 0) {
    return { width: minWidth, height: minHeight };
  }

  let maxX = 0;
  let maxY = 0;

  items.forEach(item => {
    const itemRight = item.position.x + itemWidth;
    const itemBottom = item.position.y + itemHeight;
    maxX = Math.max(maxX, itemRight);
    maxY = Math.max(maxY, itemBottom);
  });

  return {
    width: Math.max(minWidth, maxX + padding),
    height: Math.max(minHeight, maxY + padding),
  };
};
