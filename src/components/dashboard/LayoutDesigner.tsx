import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { WIDGET_SIZES } from '../widgets/WidgetTypes';

interface LayoutDesignerProps {
  existingWidgets?: any[];
  layoutName: string;
  onBack: () => void;
  onClose: () => void;
  onSubmit: () => void;
  selectedLayout: string | null;
  setLayoutName: (name: string) => void;
}

interface LayoutPlaceholder {
  id: string;
  size: { height: number, width: number; };
  type: 'placeholder';
  x: number;
  y: number;
}

interface PredefinedLayout {
  description: string;
  id: string;
  name: string;
  placeholders: LayoutPlaceholder[];
}

const LayoutDesigner: React.FC<LayoutDesignerProps> = ({
  selectedLayout,
  layoutName,
  setLayoutName,
  onBack,
  onClose,
  onSubmit,
  existingWidgets = [],
}) => {
  const [placeholders, setPlaceholders] = useState<LayoutPlaceholder[]>([]);
  const [draggedPlaceholder, setDraggedPlaceholder] = useState<LayoutPlaceholder | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const GRID_COLUMNS = 6;
  const GRID_ROW_HEIGHT = 120;
  const GRID_GAP = 16;

  const predefinedLayouts: PredefinedLayout[] = [
    {
      id: 'executive',
      name: 'Executive Dashboard',
      description: 'High-level metrics and KPIs for executives',
      placeholders: [
        { id: '1', size: WIDGET_SIZES.WIDE, x: 0, y: 0, type: 'placeholder' },
        { id: '2', size: WIDGET_SIZES.MEDIUM, x: 0, y: 2, type: 'placeholder' },
        { id: '3', size: WIDGET_SIZES.MEDIUM, x: 3, y: 2, type: 'placeholder' },
        { id: '4', size: WIDGET_SIZES.LARGE, x: 0, y: 4, type: 'placeholder' },
        { id: '5', size: { width: 2, height: 3 }, x: 4, y: 4, type: 'placeholder' },
        { id: '6', size: WIDGET_SIZES.WIDE, x: 0, y: 7, type: 'placeholder' },
      ],
    },
    {
      id: 'analytics',
      name: 'Analytics Hub',
      description: 'Charts, graphs, and data visualization',
      placeholders: [
        { id: '1', size: WIDGET_SIZES.LARGE, x: 0, y: 0, type: 'placeholder' },
        { id: '2', size: { width: 2, height: 3 }, x: 4, y: 0, type: 'placeholder' },
        { id: '3', size: WIDGET_SIZES.LARGE, x: 0, y: 3, type: 'placeholder' },
        { id: '4', size: { width: 2, height: 3 }, x: 4, y: 3, type: 'placeholder' },
        { id: '5', size: WIDGET_SIZES.WIDE, x: 0, y: 6, type: 'placeholder' },
        { id: '6', size: WIDGET_SIZES.MEDIUM, x: 0, y: 8, type: 'placeholder' },
        { id: '7', size: WIDGET_SIZES.MEDIUM, x: 3, y: 8, type: 'placeholder' },
      ],
    },
    {
      id: 'productivity',
      name: 'Productivity Center',
      description: 'Tasks, projects, and team overview',
      placeholders: [
        { id: '1', size: WIDGET_SIZES.TALL, x: 0, y: 0, type: 'placeholder' },
        { id: '2', size: { width: 4, height: 2 }, x: 2, y: 0, type: 'placeholder' },
        { id: '3', size: { width: 4, height: 2 }, x: 2, y: 2, type: 'placeholder' },
        { id: '4', size: WIDGET_SIZES.LARGE, x: 0, y: 4, type: 'placeholder' },
        { id: '5', size: { width: 2, height: 3 }, x: 4, y: 4, type: 'placeholder' },
        { id: '6', size: WIDGET_SIZES.WIDE, x: 0, y: 7, type: 'placeholder' },
        { id: '7', size: WIDGET_SIZES.MEDIUM, x: 0, y: 9, type: 'placeholder' },
        { id: '8', size: WIDGET_SIZES.MEDIUM, x: 3, y: 9, type: 'placeholder' },
      ],
    },
    {
      id: 'monitoring',
      name: 'System Monitor',
      description: 'Performance metrics and alerts',
      placeholders: [
        { id: '1', size: WIDGET_SIZES.SQUARE, x: 0, y: 0, type: 'placeholder' },
        { id: '2', size: WIDGET_SIZES.SQUARE, x: 3, y: 0, type: 'placeholder' },
        { id: '3', size: WIDGET_SIZES.MEDIUM, x: 0, y: 3, type: 'placeholder' },
        { id: '4', size: WIDGET_SIZES.MEDIUM, x: 3, y: 3, type: 'placeholder' },
        { id: '5', size: WIDGET_SIZES.WIDE, x: 0, y: 5, type: 'placeholder' },
      ],
    },
  ];

  const availableSizes = [
    // Tiny widgets (1x1 to 2x2)
    { width: 1, height: 1, label: 'Tiny (1x1)' },
    { width: 2, height: 1, label: 'Mini Wide (2x1)' },
    { width: 1, height: 2, label: 'Mini Tall (1x2)' },
    { width: 2, height: 2, label: 'Small (2x2)' },
    
    // Medium widgets (2x3 to 4x2)
    { width: 2, height: 3, label: 'Small Tall (2x3)' },
    { width: 3, height: 2, label: 'Medium (3x2)' },
    { width: 3, height: 3, label: 'Square (3x3)' },
    { width: 4, height: 2, label: 'Medium Wide (4x2)' },
    
    // Large widgets (3x4 to 5x3)
    { width: 3, height: 4, label: 'Tall (3x4)' },
    { width: 4, height: 3, label: 'Large (4x3)' },
    { width: 5, height: 2, label: 'Large Wide (5x2)' },
    { width: 5, height: 3, label: 'Extra Large (5x3)' },
    
    // Extra wide widgets (6x1 to 6x3)
    { width: 6, height: 1, label: 'Banner (6x1)' },
    { width: 6, height: 2, label: 'Wide (6x2)' },
    { width: 6, height: 3, label: 'Extra Wide (6x3)' },
    
    // Extra tall widgets (2x4 to 4x4)
    { width: 2, height: 4, label: 'Tall (2x4)' },
    { width: 2, height: 5, label: 'Extra Tall (2x5)' },
    { width: 3, height: 5, label: 'Large Tall (3x5)' },
    { width: 4, height: 4, label: 'Large Square (4x4)' },
    
    // Full width widgets
    { width: 6, height: 4, label: 'Full Width (6x4)' },
    { width: 6, height: 5, label: 'Full Width Tall (6x5)' },
  ];

  // Convert existing widgets to placeholders
  const convertWidgetsToPlaceholders = (widgets: any[]): LayoutPlaceholder[] => {
    return widgets.map((widget, index) => ({
      id: `existing-${index + 1}`,
      size: { width: widget.width, height: widget.height },
      x: 0, // We'll auto-position them
      y: 0,
      type: 'placeholder' as const,
    }));
  };

  // Auto-position placeholders to avoid overlaps
  const autoPositionPlaceholders = (placeholders: LayoutPlaceholder[]): LayoutPlaceholder[] => {
    const positioned: LayoutPlaceholder[] = [];
    let currentY = 0;

    for (const placeholder of placeholders) {
      const position = findBestPosition(placeholder.size.width, placeholder.size.height);
      positioned.push({
        ...placeholder,
        x: position.x,
        y: position.y,
      });
      currentY = Math.max(currentY, position.y + placeholder.size.height);
    }

    return positioned;
  };

  // Load predefined layout if selected
  React.useEffect(() => {
    if (selectedLayout && selectedLayout !== 'custom') {
      const layout = predefinedLayouts.find(l => l.id === selectedLayout);
      if (layout) {
        setPlaceholders(layout.placeholders);
        setShowNameInput(true);
      }
    } else if (selectedLayout === 'custom') {
      // Check if we have existing widgets to load
      if (existingWidgets && existingWidgets.length > 0) {
        const convertedPlaceholders = convertWidgetsToPlaceholders(existingWidgets);
        const positionedPlaceholders = autoPositionPlaceholders(convertedPlaceholders);
        setPlaceholders(positionedPlaceholders);
      } else {
        setPlaceholders([]);
      }
      setShowNameInput(true);
    }
  }, [selectedLayout, existingWidgets]);

  // Helper function to check if a position is valid for a widget
  const isValidPosition = (x: number, y: number, width: number, height: number): boolean => {
    // Check if widget fits within grid bounds
    if (x + width > GRID_COLUMNS || y + height > 20) { // 20 rows max for now
      return false;
    }

    // Check for collisions with existing placeholders
    for (const placeholder of placeholders) {
      if (
        x < placeholder.x + placeholder.size.width &&
        x + width > placeholder.x &&
        y < placeholder.y + placeholder.size.height &&
        y + height > placeholder.y
      ) {
        return false;
      }
    }

    return true;
  };

  // Helper function to find the best available position for a widget
  const findBestPosition = (width: number, height: number): { x: number; y: number } => {
    // Try to place widgets from top-left to bottom-right
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x <= GRID_COLUMNS - width; x++) {
        if (isValidPosition(x, y, width, height)) {
          return { x, y };
        }
      }
    }
    
    // If no position found, place at the bottom
    const maxY = placeholders.length > 0 
      ? Math.max(...placeholders.map(p => p.y + p.size.height))
      : 0;
    
    return { x: 0, y: maxY };
  };

  const handleAddPlaceholder = (size: { height: number, width: number; }) => {
    const position = findBestPosition(size.width, size.height);
    
    const newPlaceholder: LayoutPlaceholder = {
      id: `placeholder-${Date.now()}`,
      size,
      x: position.x,
      y: position.y,
      type: 'placeholder',
    };
    setPlaceholders([...placeholders, newPlaceholder]);
  };

  const handleRemovePlaceholder = (id: string) => {
    setPlaceholders(placeholders.filter(p => p.id !== id));
  };

  const handleDragStart = (placeholder: LayoutPlaceholder) => {
    setDraggedPlaceholder(placeholder);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPlaceholder) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate grid position
    const columnWidth = (rect.width - (GRID_COLUMNS - 1) * GRID_GAP) / GRID_COLUMNS;
    const gridX = Math.floor(x / (columnWidth + GRID_GAP));
    const gridY = Math.floor(y / (GRID_ROW_HEIGHT + GRID_GAP));

    // Update placeholder position
    setPlaceholders(placeholders.map(p => 
      p.id === draggedPlaceholder.id 
        ? { ...p, x: Math.max(0, Math.min(GRID_COLUMNS - p.size.width, gridX)), y: Math.max(0, gridY) }
        : p
    ));

    setDraggedPlaceholder(null);
  };

  const handleSubmit = () => {
    if (layoutName.trim()) {
      onSubmit();
    }
  };

  const renderPlaceholder = (placeholder: LayoutPlaceholder) => {
    const style = {
      gridColumn: `${placeholder.x + 1} / span ${placeholder.size.width}`,
      gridRow: `${placeholder.y + 1} / span ${placeholder.size.height}`,
      minHeight: `${placeholder.size.height * GRID_ROW_HEIGHT + (placeholder.size.height - 1) * GRID_GAP}px`,
    };

    return (
      <div
        key={placeholder.id}
        className='relative bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-dashed border-blue-300 rounded-lg p-4 flex items-center justify-center'
        style={style}
        draggable
        onDragStart={() => handleDragStart(placeholder)}
      >
        <div className='text-center'>
          <div className='text-blue-600 font-medium'>
            {placeholder.size.width}×{placeholder.size.height}
          </div>
          <div className='text-blue-500 text-sm'>Widget Placeholder</div>
        </div>
        <button
          onClick={() => handleRemovePlaceholder(placeholder.id)}
          className='absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors'
        >
          <TrashIcon className='h-3 w-3' />
        </button>
      </div>
    );
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={onBack}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <ArrowLeftIcon className='h-5 w-5 text-gray-600' />
            </button>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Layout Designer
              </h2>
              <p className='text-sm text-gray-500'>
                Design your dashboard layout
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
            title='Back to Dashboard Settings'
          >
            <XMarkIcon className='h-6 w-6' />
          </button>
        </div>

        {/* Main Content: Make this scrollable */}
        <div className='flex-1 flex h-0 min-h-0 overflow-hidden'>
          {/* Sidebar */}
          <div className='w-80 border-r border-gray-200 p-6 overflow-y-auto'>
            {/* Layout Name Input */}
            {showNameInput && (
              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Layout Name
                </label>
                <input
                  type='text'
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  placeholder='Enter layout name...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            )}

            {/* Widget Sizes */}
            <div className='mb-6'>
              <h3 className='font-semibold text-gray-900 mb-3'>Add Widget Placeholder</h3>
              
              {/* Tiny & Small Widgets */}
              <div className='mb-4'>
                <h4 className='text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide'>Tiny & Small</h4>
                <div className='grid grid-cols-2 gap-2'>
                  {availableSizes.slice(0, 4).map((size) => (
                    <button
                      key={size.label}
                      onClick={() => handleAddPlaceholder(size)}
                      className='p-2 text-left bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors'
                    >
                      <div className='font-medium text-xs'>{size.label}</div>
                      <div className='text-xs text-gray-500'>
                        {size.width}×{size.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Medium Widgets */}
              <div className='mb-4'>
                <h4 className='text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide'>Medium</h4>
                <div className='grid grid-cols-2 gap-2'>
                  {availableSizes.slice(4, 8).map((size) => (
                    <button
                      key={size.label}
                      onClick={() => handleAddPlaceholder(size)}
                      className='p-2 text-left bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors'
                    >
                      <div className='font-medium text-xs'>{size.label}</div>
                      <div className='text-xs text-gray-500'>
                        {size.width}×{size.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Large Widgets */}
              <div className='mb-4'>
                <h4 className='text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide'>Large</h4>
                <div className='grid grid-cols-2 gap-2'>
                  {availableSizes.slice(8, 12).map((size) => (
                    <button
                      key={size.label}
                      onClick={() => handleAddPlaceholder(size)}
                      className='p-2 text-left bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors'
                    >
                      <div className='font-medium text-xs'>{size.label}</div>
                      <div className='text-xs text-gray-500'>
                        {size.width}×{size.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wide Widgets */}
              <div className='mb-4'>
                <h4 className='text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide'>Wide</h4>
                <div className='grid grid-cols-2 gap-2'>
                  {availableSizes.slice(12, 15).map((size) => (
                    <button
                      key={size.label}
                      onClick={() => handleAddPlaceholder(size)}
                      className='p-2 text-left bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors'
                    >
                      <div className='font-medium text-xs'>{size.label}</div>
                      <div className='text-xs text-gray-500'>
                        {size.width}×{size.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tall Widgets */}
              <div className='mb-4'>
                <h4 className='text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide'>Tall</h4>
                <div className='grid grid-cols-2 gap-2'>
                  {availableSizes.slice(15, 19).map((size) => (
                    <button
                      key={size.label}
                      onClick={() => handleAddPlaceholder(size)}
                      className='p-2 text-left bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors'
                    >
                      <div className='font-medium text-xs'>{size.label}</div>
                      <div className='text-xs text-gray-500'>
                        {size.width}×{size.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Width Widgets */}
              <div className='mb-4'>
                <h4 className='text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide'>Full Width</h4>
                <div className='grid grid-cols-2 gap-2'>
                  {availableSizes.slice(19, 21).map((size) => (
                    <button
                      key={size.label}
                      onClick={() => handleAddPlaceholder(size)}
                      className='p-2 text-left bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors'
                    >
                      <div className='font-medium text-xs'>{size.label}</div>
                      <div className='text-xs text-gray-500'>
                        {size.width}×{size.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Placeholder List */}
            <div>
              <h3 className='font-semibold text-gray-900 mb-3'>Layout Placeholders</h3>
              <div className='space-y-2'>
                {placeholders.map((placeholder) => (
                  <div
                    key={placeholder.id}
                    className='flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200'
                  >
                    <div>
                      <div className='font-medium text-sm'>
                        {placeholder.size.width}×{placeholder.size.height}
                      </div>
                      <div className='text-xs text-gray-500'>
                        Position: ({placeholder.x}, {placeholder.y})
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePlaceholder(placeholder.id)}
                      className='text-red-500 hover:text-red-700'
                    >
                      <TrashIcon className='h-4 w-4' />
                    </button>
                  </div>
                ))}
                
                {placeholders.length === 0 && (
                  <div className='text-center py-4 text-gray-500 text-sm'>
                    No placeholders added yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Layout Canvas */}
          <div className='flex-1 p-6 overflow-y-auto'>
            <div className='mb-4'>
              <h3 className='font-semibold text-gray-900 mb-2'>Layout Canvas</h3>
              <p className='text-sm text-gray-500'>
                Drag placeholders to position them on the grid
              </p>
            </div>

            <div
              className='border-2 border-gray-300 rounded-lg p-4 bg-gray-50'
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div
                className='grid gap-4'
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
                  gridAutoRows: `${GRID_ROW_HEIGHT}px`,
                  minHeight: '600px',
                }}
              >
                {placeholders.map(renderPlaceholder)}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className='p-6 border-t border-gray-200 flex justify-between sticky bottom-0 bg-white z-10'>
          <button
            onClick={onBack}
            className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
          >
            Back
          </button>
          <div className='space-x-3'>
            <button
              onClick={onBack}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'
              title='Back to Dashboard Settings'
            >
              Back to Settings
            </button>
            <button
              onClick={handleSubmit}
              disabled={!layoutName.trim()}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
            >
              <CheckIcon className='h-4 w-4' />
              <span>Continue to Widget Builder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutDesigner; 
