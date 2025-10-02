import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Palette,
  Plus,
  Save,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';

// Color configuration matching sticky notes
const colorConfig = {
  yellow: { bg: '#fef3c7', border: '#fbbf24', name: 'Yellow' },
  pink: { bg: '#fce7f3', border: '#f472b6', name: 'Pink' },
  blue: { bg: '#dbeafe', border: '#60a5fa', name: 'Blue' },
  gray: { bg: '#f3f4f6', border: '#9ca3af', name: 'Gray' },
  green: { bg: '#dcfce7', border: '#22c55e', name: 'Green' },
  orange: { bg: '#fed7aa', border: '#f97316', name: 'Orange' },
  purple: { bg: '#e9d5ff', border: '#a855f7', name: 'Purple' },
  red: { bg: '#fee2e2', border: '#ef4444', name: 'Red' },
  teal: { bg: '#ccfbf1', border: '#14b8a6', name: 'Teal' },
  indigo: { bg: '#e0e7ff', border: '#6366f1', name: 'Indigo' },
  lime: { bg: '#ecfccb', border: '#84cc16', name: 'Lime' },
  rose: { bg: '#ffe4e6', border: '#f43f5e', name: 'Rose' },
} as const;

export type KanbanColor = keyof typeof colorConfig;

export interface KanbanColumn {
  id: string;
  name: string;
  color: KanbanColor;
  order: number;
}

export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UnifiedKanbanProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onColumnsChange: (columns: KanbanColumn[]) => void;
  onItemsChange: (items: KanbanItem[]) => void;
  onItemClick?: (item: KanbanItem) => void;
  onItemEdit?: (item: KanbanItem) => void;
  onItemDelete?: (item: KanbanItem) => void;
  onAddItem?: (columnId: string) => void;
  renderItem?: (item: KanbanItem) => React.ReactNode;
  canEdit?: boolean;
  moduleId: string; // For persistence per module
}

export function UnifiedKanban({
  columns,
  items,
  onColumnsChange,
  onItemsChange,
  onItemClick,
  onItemEdit,
  onItemDelete,
  onAddItem,
  renderItem,
  canEdit = true,
  moduleId,
}: UnifiedKanbanProps) {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [editingColumnColor, setEditingColumnColor] =
    useState<KanbanColor>('blue');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<KanbanItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [leftButtonOffset, setLeftButtonOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll functions
  const scrollLeft = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const currentScroll = container.scrollLeft;
      const scrollAmount = 320; // Scroll by one column width
      container.scrollTo({
        left: currentScroll - scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const currentScroll = container.scrollLeft;
      const scrollAmount = 320; // Scroll by one column width
      container.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Update scroll button states
  const updateScrollButtons = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
      // Update left button offset to follow scroll only during drag operations
      if (isDragging) {
        setLeftButtonOffset(scrollLeft);
      } else {
        setLeftButtonOffset(0); // Reset to default position when not dragging
      }
    }
  };

  // Enhanced drag-to-scroll functionality with requestAnimationFrame for maximum speed
  useEffect(() => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    let animationFrameId: number;
    let scrollInterval: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollThreshold = 30; // Distance from edge to start scrolling - very early activation
      const scrollSpeed = 150; // Pixels per scroll step - extremely fast scrolling

      // Clear existing intervals and animation frames
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Check if mouse is near edges - more aggressive detection
      const isNearLeftEdge = e.clientX - rect.left < scrollThreshold;
      const isNearRightEdge = rect.right - e.clientX < scrollThreshold;

      if (isNearLeftEdge) {
        // Immediate scroll for instant response - extremely fast
        container.scrollLeft -= scrollSpeed * 6;
        // Use requestAnimationFrame for maximum smoothness and speed - much faster
        const scrollLeft = () => {
          // Use direct scrollLeft manipulation for maximum speed
          container.scrollLeft -= scrollSpeed;
          animationFrameId = requestAnimationFrame(scrollLeft);
        };
        animationFrameId = requestAnimationFrame(scrollLeft);
      } else if (isNearRightEdge) {
        // Immediate scroll for instant response - extremely fast
        container.scrollLeft += scrollSpeed * 6;
        // Use requestAnimationFrame for maximum smoothness and speed - much faster
        const scrollRight = () => {
          // Use direct scrollLeft manipulation for maximum speed
          container.scrollLeft += scrollSpeed;
          animationFrameId = requestAnimationFrame(scrollRight);
        };
        animationFrameId = requestAnimationFrame(scrollRight);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDragging]);

  // Handle scroll events to update button states
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateScrollButtons();
    };

    container.addEventListener('scroll', handleScroll);
    updateScrollButtons(); // Initial check

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isDragging]); // Re-run when drag state changes

  // Update button position when drag state changes
  useEffect(() => {
    updateScrollButtons();
  }, [isDragging]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canScrollLeft) {
        e.preventDefault();
        scrollLeft();
      } else if (e.key === 'ArrowRight' && canScrollRight) {
        e.preventDefault();
        scrollRight();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canScrollLeft, canScrollRight]);

  const handleDragStart = (result: any) => {
    const draggedItem = items.find(item => item.id === result.draggableId);
    setDraggedItem(draggedItem || null);
    setIsDragging(true);
  };

  const handleDragUpdate = (result: any) => {
    // Track the exact position where the item will be dropped
    if (result.destination) {
      setDragOverIndex(result.destination.index);
    } else {
      setDragOverIndex(null);
    }

    // Provide visual feedback during drag
    if (
      result.destination &&
      result.destination.droppableId !== result.source.droppableId
    ) {
      // When dragging between columns, ensure smooth transition
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const mouseX =
          result.destination.droppableId === result.source.droppableId
            ? result.destination.index * 320 // Approximate column width
            : result.destination.index * 320;

        // Smooth scroll to keep the drop zone visible - extremely fast scrolling
        if (mouseX > rect.right - 50) {
          container.scrollLeft += 150;
        } else if (mouseX < rect.left + 50) {
          container.scrollLeft -= 150;
        }
      }
    }
  };

  const handleDragEnd = (result: any) => {
    // Always reset drag state
    setDraggedItem(null);
    setDragOverIndex(null);
    setIsDragging(false);

    // If no destination, just return (item stays in original position)
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    // If dropped in the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Get items for source and destination columns
    const sourceItems = items.filter(
      item => item.status === source.droppableId
    );
    const destItems = items.filter(
      item => item.status === destination.droppableId
    );
    const otherItems = items.filter(
      item =>
        item.status !== source.droppableId &&
        item.status !== destination.droppableId
    );

    // Validate source index
    if (source.index >= sourceItems.length) {
      console.warn('Invalid source index:', source.index);
      return;
    }

    // Remove the item from source
    const [movedItem] = sourceItems.splice(source.index, 1);

    if (!movedItem) {
      console.warn('No item found at source index:', source.index);
      return;
    }

    // Update the item's status
    movedItem.status = destination.droppableId;
    movedItem.metadata = {
      ...movedItem.metadata,
      updatedAt: new Date().toISOString(),
    };

    // If moving within the same column
    if (source.droppableId === destination.droppableId) {
      // Validate destination index for same column
      const maxIndex = sourceItems.length;
      const validDestinationIndex = Math.min(destination.index, maxIndex);

      // Insert at new position
      sourceItems.splice(validDestinationIndex, 0, movedItem);
      const newItems = [...otherItems, ...sourceItems];
      onItemsChange(newItems);
    } else {
      // Moving between different columns
      // Validate destination index for different column
      const maxIndex = destItems.length;
      const validDestinationIndex = Math.min(destination.index, maxIndex);

      destItems.splice(validDestinationIndex, 0, movedItem);
      const newItems = [...otherItems, ...sourceItems, ...destItems];
      onItemsChange(newItems);
    }
  };

  const startEditColumn = (column: KanbanColumn) => {
    setEditingColumn(column.id);
    setEditingColumnName(column.name);
    setEditingColumnColor(column.color);
  };

  const saveColumnEdit = () => {
    if (!editingColumn) return;

    const updatedColumns = columns.map(col =>
      col.id === editingColumn
        ? { ...col, name: editingColumnName, color: editingColumnColor }
        : col
    );

    onColumnsChange(updatedColumns);
    setEditingColumn(null);
    setEditingColumnName('');
  };

  const cancelColumnEdit = () => {
    setEditingColumn(null);
    setEditingColumnName('');
  };

  const getItemsByColumn = (columnId: string) => {
    return items.filter(item => item.status === columnId);
  };

  const getColumnColor = (color: KanbanColor) => {
    return colorConfig[color];
  };

  const defaultRenderItem = (item: KanbanItem) => (
    <Card className='mb-3 cursor-pointer hover:shadow-md transition-shadow'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h4 className='font-semibold text-sm mb-1'>{item.title}</h4>
            {item.description && (
              <p className='text-xs text-muted-foreground mb-2'>
                {item.description}
              </p>
            )}
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              {item.assignee && <span>👤 {item.assignee}</span>}
              {item.dueDate && (
                <span>📅 {new Date(item.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          {canEdit && (
            <div className='flex gap-1 ml-2'>
              {onItemEdit && (
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={e => {
                    e.stopPropagation();
                    onItemEdit(item);
                  }}
                >
                  <Edit2 className='h-3 w-3' />
                </Button>
              )}
              {onItemDelete && (
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={e => {
                    e.stopPropagation();
                    onItemDelete(item);
                  }}
                >
                  <X className='h-3 w-3' />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className='relative'>
      {/* Scroll Buttons */}
      <div
        className='absolute top-0 bottom-0 z-10 flex items-center'
        style={{ left: `${leftButtonOffset}px` }}
      >
        <Button
          variant='outline'
          size='lg'
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className='h-12 w-12 p-0 bg-white/95 hover:bg-white shadow-lg border-2 hover:scale-105 transition-all duration-200'
        >
          <ChevronLeft className='h-6 w-6 text-gray-800' />
        </Button>
      </div>

      <div className='fixed right-4 top-1/2 -translate-y-1/2 z-20 flex items-center'>
        <Button
          variant='outline'
          size='lg'
          onClick={scrollRight}
          disabled={!canScrollRight}
          className='h-12 w-12 p-0 bg-white/95 hover:bg-white shadow-lg border-2 hover:scale-105 transition-all duration-200'
        >
          <ChevronRight className='h-6 w-6 text-gray-800' />
        </Button>
      </div>

      {/* Kanban Container */}
      <div
        ref={containerRef}
        className={`overflow-x-auto pb-4`}
        style={{
          scrollSnapType: 'none', // Disable scroll snapping
          scrollPadding: '0', // Remove scroll padding
          scrollMargin: '0',
          scrollMarginTop: '0',
          scrollMarginBottom: '0',
          scrollMarginLeft: '0',
          scrollMarginRight: '0',
        }}
      >
        <DragDropContext
          onDragStart={handleDragStart}
          onDragUpdate={handleDragUpdate}
          onDragEnd={handleDragEnd}
        >
          <div className='flex gap-6 min-w-max'>
            {columns
              .sort((a, b) => a.order - b.order)
              .map(column => {
                const columnItems = getItemsByColumn(column.id);
                const columnColor = getColumnColor(column.color);

                return (
                  <div
                    key={column.id}
                    className='flex-shrink-0 w-80 rounded-lg border-2 border-dashed p-4'
                    style={{
                      backgroundColor: columnColor.bg,
                      borderColor: columnColor.border,
                    }}
                  >
                    {/* Column Header */}
                    <div className='flex items-center justify-between mb-4'>
                      {editingColumn === column.id ? (
                        <div className='flex-1 flex items-center gap-2'>
                          <Input
                            value={editingColumnName}
                            onChange={e => setEditingColumnName(e.target.value)}
                            className='flex-1'
                            placeholder='Column name'
                          />
                          <div className='relative'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() =>
                                setShowColorPicker(
                                  showColorPicker === column.id
                                    ? null
                                    : column.id
                                )
                              }
                            >
                              <Palette className='h-3 w-3' />
                            </Button>
                            {showColorPicker === column.id && (
                              <div className='absolute top-8 right-0 z-10 bg-white border rounded-lg shadow-lg p-3 grid grid-cols-4 gap-2'>
                                {Object.entries(colorConfig).map(
                                  ([key, color]) => (
                                    <button
                                      key={key}
                                      className='w-8 h-8 rounded border-2 hover:scale-110 transition-transform'
                                      style={{
                                        backgroundColor: color.bg,
                                        borderColor: color.border,
                                      }}
                                      onClick={() => {
                                        setEditingColumnColor(
                                          key as KanbanColor
                                        );
                                        setShowColorPicker(null);
                                      }}
                                      title={color.name}
                                    />
                                  )
                                )}
                              </div>
                            )}
                          </div>
                          <Button size='sm' onClick={saveColumnEdit}>
                            <Save className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={cancelColumnEdit}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h3 className='font-semibold text-lg text-gray-800'>
                            {column.name}
                          </h3>
                          <div className='flex items-center gap-2'>
                            <span className='bg-white px-2 py-1 rounded-full text-sm font-medium'>
                              {columnItems.length}
                            </span>
                            {canEdit && (
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => startEditColumn(column)}
                              >
                                <Edit2 className='h-3 w-3' />
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Add Item Button - Only on first column */}
                    {onAddItem && canEdit && column.order === 0 && (
                      <Button
                        variant='ghost'
                        className='w-full mb-3 text-muted-foreground hover:text-foreground'
                        onClick={() => onAddItem(column.id)}
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        Add Item
                      </Button>
                    )}

                    {/* Column Items */}
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-96 relative ${
                            snapshot.isDraggingOver ? 'bg-opacity-50' : ''
                          }`}
                        >
                          {columnItems.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`transition-all duration-200 ${
                                    snapshot.isDragging
                                      ? 'rotate-2 shadow-2xl z-50 scale-105 opacity-90'
                                      : 'hover:shadow-md'
                                  }`}
                                  onClick={() => onItemClick?.(item)}
                                >
                                  {renderItem
                                    ? renderItem(item)
                                    : defaultRenderItem(item)}
                                </div>
                              )}
                            </Draggable>
                          ))}

                          {/* Drop Zone Indicator - Show at exact position */}
                          {snapshot.isDraggingOver &&
                            dragOverIndex !== null && (
                              <>
                                {columnItems.map((item, index) => {
                                  if (index === dragOverIndex) {
                                    return (
                                      <div
                                        key={`drop-indicator-${index}`}
                                        className='mb-3 h-20 border-2 border-dashed border-blue-400 bg-blue-100/50 rounded-lg flex items-center justify-center'
                                      >
                                        <div className='bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium'>
                                          Drop here
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                                {/* Show at end if dropping at the end */}
                                {dragOverIndex === columnItems.length && (
                                  <div className='mb-3 h-20 border-2 border-dashed border-blue-400 bg-blue-100/50 rounded-lg flex items-center justify-center'>
                                    <div className='bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium'>
                                      Drop here
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
