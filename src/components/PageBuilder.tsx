import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  Cog6ToothIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import WidgetRenderer from './widgets/WidgetRenderer';
import {
  availableWidgets,
  WidgetConfig,
  getAllCategories,
  getWidgetsByCategory,
} from './widgets/WidgetTypes';
import { useAuth } from '../contexts/AuthContext';

interface WidgetInstance {
  id: string;
  type: string;
  width: number; // Grid column span
  height: number; // Grid row span
  config?: any;
}

interface PageBuilderProps {
  widgets: WidgetInstance[];
  onWidgetsChange: (widgets: WidgetInstance[]) => void;
  onNavigateToModule?: (module: string) => void;
  showWidgetPalette?: boolean;
  setShowWidgetPalette?: (show: boolean) => void;
  showGrid?: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

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
  const { user } = useAuth();
  const welcomeText = user?.firstName
    ? `Welcome back, ${user.firstName}!`
    : 'Welcome back!';
  const [draggedWidget, setDraggedWidget] = useState<WidgetConfig | null>(null);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [resizingWidget, setResizingWidget] = useState<string | null>(null);
  const [movingWidget, setMovingWidget] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const gridRef = useRef<HTMLDivElement>(null);
  const moveStartRef = useRef<{
    x: number;
    y: number;
    widgetId: string;
  } | null>(null);
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const GRID_SIZE = 20; // Grid size for calculations
  const GRID_COLUMNS = 24; // Number of columns in the grid

  const handleDragStart = (e: React.DragEvent, widget: WidgetConfig) => {
    setDraggedWidget(widget);
    e.dataTransfer.setData('text/plain', widget.type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedWidget) return;

    // Determine grid spans based on widget type
    let colSpan = 1;
    let rowSpan = 1;

    switch (draggedWidget.type) {
      case 'stats-cards':
        colSpan = 2; // Wider for stats cards
        rowSpan = 1;
        break;
      case 'revenue-chart':
        colSpan = 1;
        rowSpan = 2; // Taller for charts
        break;
      case 'tasks-widget':
        colSpan = 1;
        rowSpan = 2; // Taller for task lists
        break;
      case 'projects-overview':
        colSpan = 2;
        rowSpan = 2; // Wider and taller for project overview
        break;
      case 'recent-activity':
        colSpan = 2;
        rowSpan = 2; // Wider and taller for activity feed
        break;
      case 'performance-metrics':
        colSpan = 1;
        rowSpan = 1;
        break;
      case 'email-overview':
        colSpan = 1;
        rowSpan = 1;
        break;
      default:
        colSpan = 1;
        rowSpan = 1;
    }

    const newWidget: WidgetInstance = {
      id: `${draggedWidget.type}-${Date.now()}`,
      type: draggedWidget.type,
      width: colSpan,
      height: rowSpan,
      config: {},
    };

    onWidgetsChange([...widgets, newWidget]);
    setDraggedWidget(null);
  };

  const handleWidgetMoveStart = useCallback(
    (e: React.MouseEvent, widgetId: string) => {
      if (isLocked) return; // Don't allow moving when locked

      e.preventDefault();
      e.stopPropagation();

      const widget = widgets.find(w => w.id === widgetId);
      if (!widget) return;

      setMovingWidget(widgetId);
      moveStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        widgetId,
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!moveStartRef.current || !gridRef.current) return;

        const deltaX = e.clientX - moveStartRef.current.x;
        const deltaY = e.clientY - moveStartRef.current.y;

        // Calculate grid position based on mouse movement
        const gridRect = gridRef.current.getBoundingClientRect();
        const gridX = Math.floor((e.clientX - gridRect.left) / (GRID_SIZE + 6)); // 6 is gap
        const gridY = Math.floor((e.clientY - gridRect.top) / (GRID_SIZE + 6));

        // Update widget position if it has changed significantly
        if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
          const newWidgets = widgets.map(w => {
            if (w.id === widgetId) {
              return {
                ...w,
                x: Math.max(0, Math.min(gridX, 11 - w.width)), // Keep within grid bounds
                y: Math.max(0, Math.min(gridY, 11 - w.height)),
              };
            }
            return w;
          });
          onWidgetsChange(newWidgets);

          // Update reference
          moveStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            widgetId,
          };
        }
      };

      const handleMouseUp = () => {
        setMovingWidget(null);
        moveStartRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [widgets, onWidgetsChange, isLocked]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, widgetId: string) => {
      if (isLocked) return; // Don't allow resizing when locked

      e.preventDefault();
      e.stopPropagation();

      const widget = widgets.find(w => w.id === widgetId);
      if (!widget) return;

      setResizingWidget(widgetId);
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: widget.width,
        height: widget.height,
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!resizeStartRef.current || !gridRef.current) return;

        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;

        // Dynamically calculate grid unit size
        const gridRect = gridRef.current.getBoundingClientRect();
        const colUnit = gridRect.width / 4; // 4 columns for xl:grid-cols-4
        const rowUnit = 220; // You can also make this dynamic if you want
        const newWidth = Math.max(
          1,
          Math.min(
            4,
            Math.round(resizeStartRef.current.width + deltaX / colUnit)
          )
        );
        const newHeight = Math.max(
          1,
          Math.min(
            4,
            Math.round(resizeStartRef.current.height + deltaY / rowUnit)
          )
        );

        // Only update if size actually changed
        if (newWidth !== widget.width || newHeight !== widget.height) {
          onWidgetsChange(
            widgets.map(w =>
              w.id === widgetId
                ? { ...w, width: newWidth, height: newHeight }
                : w
            )
          );
        }
      };

      const handleMouseUp = () => {
        setResizingWidget(null);
        resizeStartRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [widgets, onWidgetsChange, isLocked]
  );

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

  // Auto-layout widgets in a grid
  const autoLayoutWidgets = () => {
    const newWidgets = widgets.map((widget, index) => {
      // Determine grid spans based on widget type
      let colSpan = 1;
      let rowSpan = 1;

      switch (widget.type) {
        case 'stats-cards':
          colSpan = 2; // Wider for stats cards
          rowSpan = 1;
          break;
        case 'revenue-chart':
          colSpan = 1;
          rowSpan = 2; // Taller for charts
          break;
        case 'tasks-widget':
          colSpan = 1;
          rowSpan = 2; // Taller for task lists
          break;
        case 'projects-overview':
          colSpan = 2;
          rowSpan = 2; // Wider and taller for project overview
          break;
        case 'recent-activity':
          colSpan = 2;
          rowSpan = 2; // Wider and taller for activity feed
          break;
        case 'performance-metrics':
          colSpan = 1;
          rowSpan = 1;
          break;
        case 'email-overview':
          colSpan = 1;
          rowSpan = 1;
          break;
        default:
          colSpan = 1;
          rowSpan = 1;
      }

      return {
        ...widget,
        width: colSpan,
        height: rowSpan,
      };
    });

    onWidgetsChange(newWidgets);
  };

  // Expose autoLayoutWidgets for external use
  React.useImperativeHandle(React.useRef(), () => ({
    autoLayoutWidgets,
  }));

  const getWidgetIcon = (type: string) => {
    const widget = availableWidgets.find(w => w.type === type);
    return widget ? <widget.icon className='h-4 w-4 text-gray-600' /> : null;
  };

  const getWidgetTitle = (type: string) => {
    const widget = availableWidgets.find(w => w.type === type);
    return widget ? widget.title : type;
  };

  const isMoving = (widgetId: string) => movingWidget === widgetId;
  const isResizing = (widgetId: string) => resizingWidget === widgetId;

  return (
    <div className='relative min-h-screen bg-gray-50'>
      {/* Welcome Banner */}
      <div className='bg-gradient-to-r from-[#00cc6a] to-[#00c4b4] rounded-xl p-6 mb-6 mx-4 mt-4'>
        <h1 className='text-2xl font-bold mb-2 banner-text-dark'>
          {welcomeText}
        </h1>
        <p className='banner-text-dark-secondary'>
          Here's how things look today.
        </p>
      </div>

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
              className='w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-archer-neon focus:border-archer-neon'
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

      {/* Auto-layout Grid */}
      <div
        ref={gridRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className='relative p-8 min-h-screen'
        style={{
          backgroundImage: showGrid
            ? `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `
            : 'none',
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-6 items-start'>
          {widgets.map(widget => (
            <div
              key={widget.id}
              className={`
                relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
                transition-all duration-200 ease-out overflow-hidden
                ${isMoving(widget.id) ? 'opacity-75 scale-105 shadow-lg z-10' : 'hover:shadow-md'}
                ${isResizing(widget.id) ? 'z-20' : ''}
                ${isLocked ? 'cursor-default' : 'cursor-move'}
              `}
              style={{
                gridColumn: `span ${widget.width}`,
                gridRow: `span ${widget.height}`,
              }}
              onMouseDown={e => handleWidgetMoveStart(e, widget.id)}
            >
              {/* Widget Header */}
              <div className='flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg flex-shrink-0'>
                <div className='flex items-center space-x-2'>
                  {getWidgetIcon(widget.type)}
                  <span className='font-medium text-sm text-gray-700 dark:text-gray-300'>
                    {getWidgetTitle(widget.type)}
                  </span>
                </div>
                <div className='flex items-center space-x-1'>
                  {!isLocked && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onWidgetsChange(
                          widgets.filter(w => w.id !== widget.id)
                        );
                      }}
                      className='p-1 text-gray-400 hover:text-red-500 transition-colors'
                      title='Remove widget'
                    >
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Widget Content - Auto height, max 500px, scroll if needed */}
              <div className='p-4 max-h-[500px] overflow-y-auto'>
                <WidgetRenderer
                  type={widget.type}
                  config={widget.config}
                  onConfigChange={newConfig => {
                    onWidgetsChange(
                      widgets.map(w =>
                        w.id === widget.id ? { ...w, config: newConfig } : w
                      )
                    );
                  }}
                />
              </div>

              {/* Resize Handle */}
              {!isLocked && (
                <div
                  className='absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 hover:opacity-100 transition-opacity'
                  onMouseDown={e => handleResizeStart(e, widget.id)}
                >
                  <svg
                    className='w-4 h-4 text-gray-400'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM22 14H20V12H22V14Z' />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;
