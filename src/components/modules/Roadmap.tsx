import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Lightbulb,
  Bug,
  Rocket,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Grid,
  List,
  Trello,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Move,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Users,
  Tag
} from 'lucide-react';

interface RoadmapItem {
  actualDate?: string;
  assignee?: string;
  category: 'feature' | 'module' | 'component' | 'bugfix' | 'enhancement' | 'integration';
  changelog?: string;
  createdAt: string;
  description: string;
  estimatedDate?: string;
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  status: 'idea' | 'planned' | 'in-progress' | 'debugging' | 'released';
  tags: string[];
  title: string;
  updatedAt: string;
  version?: string;
}

interface RoadmapColumn {
  color?: string;
  id: string;
  items: RoadmapItem[];
  name: string;
}

interface DragState {
  draggedItem: { id: string; sourceColumn: string; sourceIndex: number 
} | null;
  dropTarget: { columnId: string; index: number } | null;
  isDragging: boolean;
}

const initialColumns: RoadmapColumn[] = [
  {
    id: 'idea',
    name: 'Ideas',
    color: '#F59E0B',
    items: [
      {
        id: '4',
        title: 'Mobile App Development',
        description: 'Develop native mobile applications for iOS and Android platforms.',
        status: 'idea',
        priority: 'medium',
        category: 'module',
        assignee: 'Mobile Team',
        tags: ['mobile', 'ios', 'android'],
        progress: 0,
        createdAt: '2024-01-25',
        updatedAt: '2024-01-25'
      }
    ]
  },
  {
    id: 'planned',
    name: 'Planned',
    color: '#3B82F6',
    items: [
      {
        id: '3',
        title: 'Advanced Analytics Dashboard',
        description: 'Create comprehensive analytics dashboard with real-time metrics and customizable widgets.',
        status: 'planned',
        priority: 'medium',
        category: 'module',
        assignee: 'Analytics Team',
        estimatedDate: '2024-03-01',
        tags: ['analytics', 'dashboard', 'metrics'],
        progress: 0,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20'
      }
    ]
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    color: '#8B5CF6',
    items: [
      {
        id: '2',
        title: 'Kanban Roadmap View',
        description: 'Implement drag-and-drop Kanban board for roadmap management with real-time updates.',
        status: 'in-progress',
        priority: 'high',
        category: 'feature',
        assignee: 'UI/UX Team',
        estimatedDate: '2024-02-01',
        tags: ['kanban', 'drag-drop', 'roadmap'],
        progress: 75,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-25'
      }
    ]
  },
  {
    id: 'debugging',
    name: 'Debugging',
    color: '#EF4444',
    items: [
      {
        id: '5',
        title: 'API Rate Limiting',
        description: 'Implement comprehensive API rate limiting and throttling mechanisms.',
        status: 'debugging',
        priority: 'critical',
        category: 'enhancement',
        assignee: 'Backend Team',
        estimatedDate: '2024-01-30',
        tags: ['api', 'security', 'performance'],
        progress: 90,
        createdAt: '2024-01-18',
        updatedAt: '2024-01-28'
      }
    ]
  },
  {
    id: 'released',
    name: 'Released',
    color: '#10B981',
    items: [
      {
        id: '1',
        title: 'Enhanced Demo Data Management',
        description: 'Improve demo data clearing and regeneration with better user controls and debugging tools.',
        status: 'released',
        priority: 'high',
        category: 'enhancement',
        assignee: 'Development Team',
        estimatedDate: '2024-01-15',
        actualDate: '2024-01-20',
        tags: ['demo-data', 'debugging', 'user-controls'],
        progress: 100,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-20',
        version: 'v1.2.0',
        changelog: 'Added comprehensive demo data management with clear/regenerate controls'
      }
    ]
  }
];

const Roadmap: React.FC = () => {
  const [columns, setColumns] = useState<RoadmapColumn[]>(initialColumns);
  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    dropTarget: null,
    isDragging: false,
  });
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'timeline'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [showColumnRename, setShowColumnRename] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [cardSettings, setCardSettings] = useState({
    showAssignee: true,
    showDate: true,
    showPriority: true,
    showCategory: true,
    showProgress: true,
    showTags: true,
  });

  const dragStartTime = useRef<number>(0);
  const hasDragged = useRef<boolean>(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollLeft = () => {
    const container = document.querySelector('.roadmap-kanban');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector('.roadmap-kanban');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string, sourceColumn: string, sourceIndex: number) => {
    dragStartTime.current = Date.now();
    hasDragged.current = true;
    setDragState({
      draggedItem: { id: itemId, sourceColumn, sourceIndex },
      dropTarget: null,
      isDragging: true,
    });
    e.dataTransfer.effectAllowed = 'move';
    
    // Add dragging class to body for global styles
    document.body.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!dragState.draggedItem) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const cardHeight = 140; // Approximate card height with margin
    const containerPadding = 16; // Padding from container
    const adjustedY = y - containerPadding;
    
    // Calculate the correct index based on mouse position
    let index = Math.floor(adjustedY / cardHeight);
    index = Math.max(0, Math.min(index, columns.find(col => col.id === columnId)?.items.length || 0));
    
    setDragState(prev => ({
      ...prev,
      dropTarget: { columnId, index }
    }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drop target if we're actually leaving the container
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

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    if (!dragState.draggedItem || !dragState.dropTarget) return;

    const { id: itemId, sourceColumn, sourceIndex } = dragState.draggedItem;
    const { index: targetIndex } = dragState.dropTarget;
    
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      
      // Find source and target columns
      const sourceColIndex = newColumns.findIndex(col => col.id === sourceColumn);
      const targetColIndex = newColumns.findIndex(col => col.id === targetColumn);
      
      if (sourceColIndex === -1 || targetColIndex === -1) return prevColumns;
      
      const sourceCol = newColumns[sourceColIndex];
      const targetCol = newColumns[targetColIndex];
      
      if (!sourceCol || !targetCol) return prevColumns;
      
      // Find the item in source column
      const itemIndex = sourceCol.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return prevColumns;
      
      // Remove from source column
      const items = sourceCol.items.splice(itemIndex, 1);
      const item = items[0];
      
      if (!item) return prevColumns;
      
      // Update item status
      item.status = targetCol.id as 'idea' | 'planned' | 'in-progress' | 'debugging' | 'released';
      
      // Add to target column at the correct position
      const finalTargetIndex = Math.min(targetIndex, targetCol.items.length);
      targetCol.items.splice(finalTargetIndex, 0, item);
      
      return newColumns;
    });
    
    setDragState({
      draggedItem: null,
      dropTarget: null,
      isDragging: false,
    });
    
    // Remove dragging class from body
    document.body.classList.remove('dragging');
  };

  const handleDragEnd = () => {
    setDragState({
      draggedItem: null,
      dropTarget: null,
      isDragging: false,
    });
    
    // Remove dragging class from body
    document.body.classList.remove('dragging');
    
    // Reset drag flag after a short delay to allow click to register
    setTimeout(() => {
      hasDragged.current = false;
    }, 100);
  };

  const handleAddItem = () => {
    const newItem: RoadmapItem = {
      id: `item${Date.now()}`,
      title: 'New Roadmap Item',
      description: 'Item description...',
      status: 'idea',
      priority: 'medium',
      category: 'feature',
      assignee: 'Development Team',
      tags: ['new'],
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      if (newColumns[0]) {
        newColumns[0].items.unshift(newItem);
      }
      return newColumns;
    });
  };

  const handleColumnAction = (action: string, columnId: string) => {
    setShowColumnMenu(null);
    
    switch (action) {
      case 'rename':
        setShowColumnRename(columnId);
        const column = columns.find(col => col.id === columnId);
        setEditingColumnName(column?.name || '');
        break;
      case 'delete':
        setShowDeleteConfirm(columnId);
        break;
      case 'settings':
        // TODO: Implement column settings functionality
        console.log('Column settings:', columnId);
        break;
    }
  };

  const handleItemClick = (item: RoadmapItem) => {
    if (hasDragged.current) return;
    
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleItemUpdate = (updatedItem: RoadmapItem) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const columnIndex = newColumns.findIndex(col => col.id === updatedItem.status);
      if (columnIndex !== -1 && newColumns[columnIndex]) {
        const itemIndex = newColumns[columnIndex].items.findIndex(item => item.id === updatedItem.id);
        if (itemIndex !== -1) {
          newColumns[columnIndex].items[itemIndex] = updatedItem;
        }
      }
      return newColumns;
    });
  };

  const handleItemDelete = (id: string) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      newColumns.forEach(col => {
        col.items = col.items.filter(item => item.id !== id);
      });
      return newColumns;
    });
  };

  const handleCardSettingsToggle = (setting: keyof typeof cardSettings) => {
    setCardSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleColumnRename = (columnId: string, newName: string) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const columnIndex = newColumns.findIndex(col => col.id === columnId);
      if (columnIndex !== -1 && newColumns[columnIndex]) {
        newColumns[columnIndex].name = newName;
      }
      return newColumns;
    });
    setShowColumnRename(null);
  };

  const handleColumnDelete = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return;

    // Move all items to the first column
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const columnIndex = newColumns.findIndex(col => col.id === columnId);
      if (columnIndex !== -1 && columnIndex > 0 && newColumns[0] && newColumns[columnIndex]) {
        const itemsToMove = [...newColumns[columnIndex].items];
        newColumns[0].items.push(...itemsToMove);
        newColumns.splice(columnIndex, 1);
      }
      return newColumns;
    });
    setShowDeleteConfirm(null);
  };

  const renderItemCard = (item: RoadmapItem, index: number, columnId: string) => {
    const isDropTarget = dragState.dropTarget?.columnId === columnId && dragState.dropTarget?.index === index;
    const isDragging = dragState.draggedItem?.id === item.id;

    return (
      <React.Fragment key={item.id}>
        {isDropTarget && (
          <div className="drop-zone-space h-4 mb-2">
            <div className="h-full border-2 border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Drop here</span>
            </div>
          </div>
        )}
        
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, item.id, columnId, index)}
          onDragEnd={handleDragEnd}
          onClick={() => handleItemClick(item)}
          className={`kanban-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
            isDragging ? 'opacity-50' : ''
          }`}
          style={{ minHeight: '120px' }}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-center space-x-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                item.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {item.priority}
              </span>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
            {item.description}
          </p>

          <div className="space-y-2">
            {cardSettings.showAssignee && item.assignee && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Users className="h-3 w-3" />
                <span>{item.assignee}</span>
              </div>
            )}

            {cardSettings.showDate && item.estimatedDate && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{new Date(item.estimatedDate).toLocaleDateString()}</span>
              </div>
            )}

            {cardSettings.showCategory && item.category && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Tag className="h-3 w-3" />
                <span>{item.category}</span>
              </div>
            )}

            {cardSettings.showProgress && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <BarChart3 className="h-3 w-3" />
                <span>{item.progress}%</span>
              </div>
            )}

            {cardSettings.showTags && item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  };

  const filteredColumns = columns.map(column => ({
    ...column,
    items: column.items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    })
  }));

  const renderKanbanView = () => (
    <div className="flex-1 overflow-hidden">
      <div className="relative h-full">
        {/* Scroll Controls */}
        <button
          onClick={scrollLeft}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 scroll-control bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg hover:shadow-xl"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          onClick={scrollRight}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 scroll-control bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg hover:shadow-xl"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Kanban Columns */}
        <div className="roadmap-kanban flex space-x-6 p-6 overflow-x-auto h-full">
          {filteredColumns.map((column) => (
            <div
              key={column.id}
              className="kanban-column flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{column.name}</h3>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
                    {column.items.length}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowColumnMenu(showColumnMenu === column.id ? null : column.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {showColumnMenu === column.id && (
                    <div
                      ref={columnMenuRef}
                      className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20"
                    >
                      <button
                        onClick={() => handleColumnAction('rename', column.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4 inline mr-2" />
                        Rename
                      </button>
                      <button
                        onClick={() => handleColumnAction('delete', column.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4 inline mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Column Rename Input */}
              {showColumnRename === column.id && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={editingColumnName}
                    onChange={(e) => setEditingColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleColumnRename(column.id, editingColumnName);
                      } else if (e.key === 'Escape') {
                        setShowColumnRename(null);
                      }
                    }}
                    onBlur={() => handleColumnRename(column.id, editingColumnName)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    autoFocus
                  />
                </div>
              )}

              {/* Item Cards */}
              <div className="space-y-2">
                {column.items.map((item, index) => renderItemCard(item, index, column.id))}
                
                {/* Drop zone at the end */}
                {dragState.dropTarget?.columnId === column.id && dragState.dropTarget?.index === column.items.length && (
                  <div className="drop-zone-space h-4 mt-2">
                    <div className="h-full border-2 border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">Drop here</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredColumns.flatMap(column => column.items).map(item => (
        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    item.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {item.priority}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {item.category}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {item.assignee && <span>Assignee: {item.assignee}</span>}
                  {item.estimatedDate && <span>Due: {item.estimatedDate}</span>}
                  {item.progress > 0 && <span>Progress: {item.progress}%</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleItemClick(item)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit className="h-4 w-4 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTimelineView = () => (
    <div className="space-y-6">
      {filteredColumns.map(column => {
        if (column.items.length === 0) return null;
        
        return (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{column.name}</h3>
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-sm">
                {column.items.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {column.items.map(item => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      item.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.category}</span>
                    {item.progress > 0 && <span>{item.progress}%</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Rocket className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Roadmap</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track and manage product development progress
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'kanban'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Kanban View"
                >
                  <Trello className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Timeline View"
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              </div>
              {viewMode === 'kanban' && (
                <button
                  onClick={() => setShowCardSettings(!showCardSettings)}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Card Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleAddItem}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              {columns.map(column => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="feature">Feature</option>
              <option value="module">Module</option>
              <option value="component">Component</option>
              <option value="bugfix">Bug Fix</option>
              <option value="enhancement">Enhancement</option>
              <option value="integration">Integration</option>
            </select>
          </div>
        </div>

        {/* Card Settings Panel */}
        {showCardSettings && viewMode === 'kanban' && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Card Display Settings</h3>
              <button
                onClick={() => setShowCardSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.entries(cardSettings).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleCardSettingsToggle(key as keyof typeof cardSettings)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? renderKanbanView() : 
         viewMode === 'list' ? renderListView() : 
         renderTimelineView()}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Column
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this column? All items will be moved to the first column.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleColumnDelete(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
