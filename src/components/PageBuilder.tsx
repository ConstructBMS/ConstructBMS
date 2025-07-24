import React, { useState, useRef, useImperativeHandle } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { availableWidgets, WIDGET_SIZES } from './widgets/WidgetTypes';
import type { WidgetConfig } from './widgets/WidgetTypes';
import WidgetRenderer from './widgets/WidgetRenderer';

interface WidgetInstance {
  config?: any;
  height: number;
  id: string;
  type: string;
  width: number;
  x?: number; // Grid position X
  y?: number; // Grid position Y
}

interface DragState {
  draggedWidget: { id: string; sourceIndex: number; widget: WidgetInstance } | null;
  draggedWidgetSize?: { height: number, width: number; };
  dropTarget: { index: number; x: number; y: number } | null;
  isDragging: boolean;
}

interface PageBuilderProps {
  isLocked?: boolean;
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
  onToggleLock?: () => void;
  onWidgetsChange: (widgets: WidgetInstance[]) => void;
  setShowWidgetPalette?: (show: boolean) => void;
  showGrid?: boolean;
  showWidgetPalette?: boolean;
  widgets: WidgetInstance[];
}

const GRID_COLUMNS = 6;
const GRID_ROW_HEIGHT = 120; // Height of one grid unit in pixels
const GRID_GAP = 16; // Gap between grid items

const PageBuilder: React.FC<PageBuilderProps> = ({
  widgets,
  onWidgetsChange,
  onNavigateToModule,
  showWidgetPalette = false,
  setShowWidgetPalette,
  showGrid = false,
  isLocked = false,
  onToggleLock,
}) => {
  const [draggedWidget, setDraggedWidget] = useState<WidgetConfig | null>(null);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dragState, setDragState] = useState<DragState>({
    draggedWidget: null,
    dropTarget: null,
    isDragging: false,
  });
  const gridRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, widget: WidgetConfig) => {
    setDraggedWidget(widget);
    e.dataTransfer.setData('text/plain', widget.type);
    e.dataTransfer.effectAllowed = 'move';
    document.body.classList.add('dragging');
  };

  const handleWidgetDragStart = (e: React.DragEvent, widgetId: string, sourceIndex: number) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setDragState({
      draggedWidget: { id: widgetId, sourceIndex, widget },
      dropTarget: null,
      isDragging: true,
      draggedWidgetSize: { width: widget.width, height: widget.height }
    });
    e.dataTransfer.effectAllowed = 'move';
    document.body.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleWidgetDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!gridRef.current || !dragState.draggedWidget) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate grid position
    const columnWidth = (rect.width - (GRID_COLUMNS - 1) * GRID_GAP) / GRID_COLUMNS;
    const gridX = Math.floor(x / (columnWidth + GRID_GAP));
    const gridY = Math.floor(y / (GRID_ROW_HEIGHT + GRID_GAP));
    
    // Calculate target index based on grid position
    const targetIndex = Math.max(0, Math.min(widgets.length, gridY * GRID_COLUMNS + gridX));
    
    setDragState(prev => ({
      ...prev,
      dropTarget: { 
        index: targetIndex,
        x: gridX,
        y: gridY
      }
    }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragState(prev => ({
        ...prev,
        dropTarget: null
      }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Handle new widget drop from palette
    if (draggedWidget) {
      const newWidget: WidgetInstance = {
        id: `${draggedWidget.type}-${Date.now()}`,
        type: draggedWidget.type,
        width: draggedWidget.defaultSize.width,
        height: draggedWidget.defaultSize.height,
        config: {},
      };

      onWidgetsChange([...widgets, newWidget]);
      setDraggedWidget(null);
    }
    
    // Handle widget reordering
    if (dragState.draggedWidget && dragState.dropTarget) {
      const { id: widgetId, sourceIndex } = dragState.draggedWidget;
      const { index: targetIndex } = dragState.dropTarget;
      
      if (sourceIndex !== targetIndex) {
        const newWidgets = [...widgets];
        const [movedWidget] = newWidgets.splice(sourceIndex, 1);
        if (movedWidget) {
          newWidgets.splice(targetIndex, 0, movedWidget);
          onWidgetsChange(newWidgets);
        }
      }
    }
    
    setDragState({
      draggedWidget: null,
      dropTarget: null,
      isDragging: false,
    });
    
    document.body.classList.remove('dragging');
  };

  const handleWidgetDragEnd = () => {
    setDragState({
      draggedWidget: null,
      dropTarget: null,
      isDragging: false,
    });
    
    document.body.classList.remove('dragging');
  };

  const handleWidgetDelete = (widgetId: string) => {
    onWidgetsChange(widgets.filter(w => w.id !== widgetId));
  };

  const handleWidgetConfig = (widgetId: string) => {
    setEditingWidget(editingWidget === widgetId ? null : widgetId);
  };

  const categories = ['All', ...getAllCategories()];
  const filteredWidgets =
    selectedCategory === 'All'
      ? availableWidgets
      : getWidgetsByCategory(selectedCategory);

  const autoLayoutWidgets = () => {
    const newWidgets = widgets.map(widget => {
      const widgetConfig = availableWidgets.find(w => w.type === widget.type);
      if (!widgetConfig) return widget;

      let colSpan = widgetConfig.defaultSize.width;
      let rowSpan = widgetConfig.defaultSize.height;

      return {
        ...widget,
        width: colSpan,
        height: rowSpan,
      };
    });

    onWidgetsChange(newWidgets);
  };

  // Expose autoLayoutWidgets for external use
  const ref = React.useRef<{ autoLayoutWidgets: () => void }>();
  React.useImperativeHandle(ref, () => ({
    autoLayoutWidgets,
  }));

  const getWidgetIcon = (type: string) => {
    const widget = availableWidgets.find(w => w.type === type);
    return widget ? <widget.icon className='h-4 w-4 text-black' /> : null;
  };

  const getWidgetTitle = (type: string) => {
    const widget = availableWidgets.find(w => w.type === type);
    return widget ? widget.title : type;
  };

  // Calculate drop zone dimensions based on dragged widget size
  const getDropZoneStyle = (widgetSize: { height: number, width: number; }) => {
    const columnWidth = `calc((100% - ${GRID_COLUMNS - 1} * ${GRID_GAP}px) / ${GRID_COLUMNS})`;
    const width = `calc(${columnWidth} * ${widgetSize.width} + ${GRID_GAP}px * ${widgetSize.width - 1})`;
    const height = `${widgetSize.height * GRID_ROW_HEIGHT + (widgetSize.height - 1) * GRID_GAP}px`;
    
    return {
      width,
      height,
      minHeight: height,
    };
  };

  return (
    <>
      {/* Widget Palette */}
      {showWidgetPalette && (
        <div className='absolute top-4 left-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-96 max-h-[80vh] overflow-hidden flex flex-col'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-semibold text-gray-900'>Add Widgets</h3>
            <button
              onClick={() => setShowWidgetPalette?.(false)}
              className='text-gray-400 hover:text-gray-600'
            >
              <XMarkIcon className='h-5 w-5' />
            </button>
          </div>

          {/* Category Filter */}
          <div className='mb-4'>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-constructbms-blue focus:border-constructbms-blue'
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Widgets List */}
          <div className='flex-1 overflow-y-auto space-y-2'>
            {filteredWidgets.map(widget => (
              <div
                key={widget.id}
                draggable
                onDragStart={e => handleDragStart(e, widget)}
                className='flex items-center p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors'
              >
                <widget.icon className='h-5 w-5 text-gray-600 mr-3 flex-shrink-0' />
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-gray-900 text-sm truncate'>
                    {widget.title}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    {widget.description}
                  </p>
                </div>
                <div className='text-xs text-gray-400 ml-2 flex-shrink-0'>
                  {widget.defaultSize.width}×{widget.defaultSize.height}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div
        ref={gridRef}
        onDragOver={handleWidgetDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className='grid gap-4'
        style={{
          gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
          gridAutoRows: `${GRID_ROW_HEIGHT}px`,
        }}
      >
        {widgets.map((widget, index) => {
          const isDragged = dragState.draggedWidget?.id === widget.id;
          const isDropTarget = dragState.dropTarget?.index === index;
          const draggedWidgetSize = dragState.draggedWidgetSize;
          
          return (
            <React.Fragment key={widget.id}>
              {/* Drop Zone Indicator before this widget */}
              {dragState.isDragging && 
               dragState.dropTarget?.index === index && 
               draggedWidgetSize && (
                <div 
                  className="drop-zone-space mb-2"
                  style={getDropZoneStyle(draggedWidgetSize)}
                >
                  <div 
                    className="bg-constructbms-blue/10 border-2 border-dashed border-constructbms-blue rounded-lg flex items-center justify-center"
                    style={getDropZoneStyle(draggedWidgetSize)}
                  >
                    <div className="text-constructbms-blue text-xs font-medium">Drop here</div>
                  </div>
                </div>
              )}
              
              <div
                className={`
                  relative transition-all duration-200 ease-out
                  ${isDragged ? 'opacity-30 scale-95 rotate-1 shadow-xl' : ''}
                  ${isDropTarget ? 'ring-2 ring-constructbms-blue ring-opacity-30' : ''}
                  ${isLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
                `}
                style={{
                  gridColumn: `span ${widget.width}`,
                  gridRow: `span ${widget.height}`,
                  minHeight: `${widget.height * GRID_ROW_HEIGHT + (widget.height - 1) * GRID_GAP}px`,
                }}
                draggable={!isLocked}
                onDragStart={(e) => handleWidgetDragStart(e, widget.id, index)}
                onDragEnd={handleWidgetDragEnd}
              >
                <WidgetRenderer
                  type={widget.type}
                  config={widget.config}
                  {...(onNavigateToModule && { onNavigateToModule })}
                />
              </div>
            </React.Fragment>
          );
        })}
        
        {/* Drop Zone Indicator at the end */}
        {dragState.isDragging && 
         dragState.dropTarget?.index === widgets.length && 
         dragState.draggedWidgetSize && (
          <div 
            className="drop-zone-space mt-2"
            style={getDropZoneStyle(dragState.draggedWidgetSize)}
          >
            <div 
              className="bg-constructbms-blue/10 border-2 border-dashed border-constructbms-blue rounded-lg flex items-center justify-center"
              style={getDropZoneStyle(dragState.draggedWidgetSize)}
            >
              <div className="text-constructbms-blue text-xs font-medium">Drop here</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Helper functions
const getAllCategories = (): string[] => {
  const categories = new Set(availableWidgets.map(widget => widget.category));
  return Array.from(categories);
};

const getWidgetsByCategory = (category: string): WidgetConfig[] => {
  return availableWidgets.filter(widget => widget.category === category);
};

export default PageBuilder;
