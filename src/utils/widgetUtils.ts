import { WIDGET_SIZES } from '../components/widgets/WidgetTypes';

export interface WidgetSize {
  width: number;
  height: number;
}

export interface ContentBehavior {
  contentHeight: 'auto' | 'fixed' | 'scrollable';
  aspectRatio?: number;
}

/**
 * Calculate the actual pixel dimensions for a widget based on grid units
 */
export const calculateWidgetDimensions = (
  widgetSize: WidgetSize,
  gridRowHeight: number = 120,
  gridGap: number = 16,
  gridColumns: number = 6
): { width: number; height: number } => {
  const columnWidth = `calc((100% - ${gridColumns - 1} * ${gridGap}px) / ${gridColumns})`;
  const width = `calc(${columnWidth} * ${widgetSize.width} + ${gridGap}px * ${widgetSize.width - 1})`;
  const height = widgetSize.height * gridRowHeight + (widgetSize.height - 1) * gridGap;
  
  return {
    width: parseFloat(width.replace('px', '')),
    height
  };
};

/**
 * Get the appropriate widget size based on content type
 */
export const getWidgetSizeForContent = (contentType: string): WidgetSize => {
  switch (contentType) {
    case 'chart':
    case 'graph':
      return WIDGET_SIZES.LARGE;
    case 'list':
    case 'table':
      return WIDGET_SIZES.TALL;
    case 'stats':
    case 'metrics':
      return WIDGET_SIZES.SQUARE;
    case 'actions':
    case 'buttons':
      return WIDGET_SIZES.WIDE;
    case 'calendar':
    case 'schedule':
      return WIDGET_SIZES.MEDIUM;
    default:
      return WIDGET_SIZES.MEDIUM;
  }
};

/**
 * Get content behavior based on widget type
 */
export const getContentBehavior = (widgetType: string): ContentBehavior => {
  switch (widgetType) {
    case 'revenue-chart':
    case 'performance-metrics':
      return { contentHeight: 'fixed' };
    case 'tasks-widget':
    case 'recent-activity':
    case 'notifications-widget':
      return { contentHeight: 'scrollable' };
    case 'stats-cards':
    case 'quick-actions':
      return { contentHeight: 'auto' };
    default:
      return { contentHeight: 'auto' };
  }
};

/**
 * Check if a widget can be resized to a new size
 */
export const canResizeWidget = (
  currentSize: WidgetSize,
  newSize: WidgetSize,
  maxSize: WidgetSize,
  minSize: WidgetSize
): boolean => {
  return (
    newSize.width >= minSize.width &&
    newSize.width <= maxSize.width &&
    newSize.height >= minSize.height &&
    newSize.height <= maxSize.height
  );
};

/**
 * Calculate optimal widget placement in a grid
 */
export const calculateOptimalPlacement = (
  widgets: Array<{ id: string; width: number; height: number; x?: number; y?: number }>,
  gridColumns: number = 6
): Array<{ id: string; x: number; y: number }> => {
  const grid: boolean[][] = Array(20).fill(null).map(() => Array(gridColumns).fill(false));
  const placements: Array<{ id: string; x: number; y: number }> = [];

  widgets.forEach(widget => {
    let placed = false;
    
    // Try to find the best position
    for (let y = 0; y < grid.length - widget.height + 1; y++) {
      for (let x = 0; x < gridColumns - widget.width + 1; x++) {
        if (canPlaceWidget(grid, x, y, widget.width, widget.height)) {
          placeWidget(grid, x, y, widget.width, widget.height);
          placements.push({ id: widget.id, x, y });
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
  });

  return placements;
};

/**
 * Check if a widget can be placed at a specific position
 */
const canPlaceWidget = (
  grid: boolean[][],
  x: number,
  y: number,
  width: number,
  height: number
): boolean => {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      if (grid[y + dy]?.[x + dx]) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Place a widget on the grid
 */
const placeWidget = (
  grid: boolean[][],
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const row = grid[y + dy];
      if (row && row[x + dx] !== undefined) {
        row[x + dx] = true;
      }
    }
  }
}; 
