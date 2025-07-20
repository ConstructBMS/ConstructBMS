import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  FileText, 
  Calendar,
  User,
  Tag,
  MoreVertical,
  X,
  Save,
  Clock,
  ChevronLeft,
  ChevronRight,
  Settings,
  Eye,
  Grid,
  List
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface Note {
  author: string;
  content: string;
  context: {
    id: string;
    name: string;
    type: 'opportunity' | 'project' | 'customer' | 'general';
};
  createdAt: string;
  id: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  title: string;
  updatedAt: string;
}

interface NoteColumn {
  color?: string;
  id: string;
  name: string;
  notes: Note[];
}

interface DragState {
  draggedItem: { id: string; sourceColumn: string; sourceIndex: number 
} | null;
  dropTarget: { columnId: string; index: number } | null;
  isDragging: boolean;
}

interface NotesProps {
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
}

const initialColumns: NoteColumn[] = [
  {
    id: 'draft',
    name: 'Draft',
    color: '#6B7280',
    notes: [
      {
        id: 'note1',
        title: 'Initial Meeting Notes',
        content: 'Discussed project requirements and timeline. Client seems very interested in our approach.',
        author: 'Jane Doe',
        createdAt: '2024-06-01T10:00:00Z',
        updatedAt: '2024-06-01T10:00:00Z',
        tags: ['meeting', 'requirements'],
        context: {
          type: 'opportunity',
          id: 'opp1',
          name: 'Website Redesign'
        },
        priority: 'high',
        status: 'draft'
      }
    ]
  },
  {
    id: 'published',
    name: 'Published',
    color: '#10B981',
    notes: [
      {
        id: 'note2',
        title: 'Technical Requirements',
        content: 'Client needs responsive design with modern UI/UX. Prefers React-based solution.',
        author: 'John Smith',
        createdAt: '2024-06-02T14:30:00Z',
        updatedAt: '2024-06-02T14:30:00Z',
        tags: ['technical', 'design'],
        context: {
          type: 'opportunity',
          id: 'opp1',
          name: 'Website Redesign'
        },
        priority: 'medium',
        status: 'published'
      },
      {
        id: 'note3',
        title: 'Budget Discussion',
        content: 'Agreed on budget range of £10,000-15,000. Payment terms: 50% upfront, 50% on completion.',
        author: 'Sarah Johnson',
        createdAt: '2024-06-03T09:15:00Z',
        updatedAt: '2024-06-03T09:15:00Z',
        tags: ['budget', 'payment'],
        context: {
          type: 'opportunity',
          id: 'opp1',
          name: 'Website Redesign'
        },
        priority: 'high',
        status: 'published'
      }
    ]
  },
  {
    id: 'archived',
    name: 'Archived',
    color: '#8B5CF6',
    notes: [
      {
        id: 'note4',
        title: 'Old Project Notes',
        content: 'Previous project notes that are no longer relevant.',
        author: 'Mike Wilson',
        createdAt: '2024-05-15T11:00:00Z',
        updatedAt: '2024-05-15T11:00:00Z',
        tags: ['old', 'project'],
        context: {
          type: 'project',
          id: 'proj-old',
          name: 'Old Project'
        },
        priority: 'low',
        status: 'archived'
      }
    ]
  }
];

const Notes: React.FC<NotesProps> = ({ onNavigateToModule }) => {
  const [searchParams] = useSearchParams();
  const [columns, setColumns] = useState<NoteColumn[]>(initialColumns);
  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    dropTarget: null,
    isDragging: false,
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterContext, setFilterContext] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban');
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [showColumnRename, setShowColumnRename] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [cardSettings, setCardSettings] = useState({
    showAuthor: true,
    showDate: true,
    showPriority: true,
    showContext: true,
    showTags: true,
    showContent: true,
  });

  const dragStartTime = useRef<number>(0);
  const hasDragged = useRef<boolean>(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // Get context from URL params
  const contextType = searchParams.get('context') as 'opportunity' | 'project' | 'customer' | 'general' || 'general';
  const contextId = searchParams.get('contextId') || '';
  const contextTitle = searchParams.get('title') || 'Notes';

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
    const container = document.querySelector('.notes-kanban');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector('.notes-kanban');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleDragStart = (e: React.DragEvent, noteId: string, sourceColumn: string, sourceIndex: number) => {
    dragStartTime.current = Date.now();
    hasDragged.current = true;
    setDragState({
      draggedItem: { id: noteId, sourceColumn, sourceIndex },
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
    index = Math.max(0, Math.min(index, columns.find(col => col.id === columnId)?.notes.length || 0));
    
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

    const { id: noteId, sourceColumn, sourceIndex } = dragState.draggedItem;
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
      
      // Find the note in source column
      const noteIndex = sourceCol.notes.findIndex(note => note.id === noteId);
      if (noteIndex === -1) return prevColumns;
      
      // Remove from source column
      const notes = sourceCol.notes.splice(noteIndex, 1);
      const note = notes[0];
      
      if (!note) return prevColumns;
      
      // Update note status
      note.status = targetCol.id as 'draft' | 'published' | 'archived';
      
      // Add to target column at the correct position
      const finalTargetIndex = Math.min(targetIndex, targetCol.notes.length);
      targetCol.notes.splice(finalTargetIndex, 0, note);
      
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

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note${Date.now()}`,
      title: 'New Note',
      content: 'Note content...',
      author: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['new'],
      context: {
        type: contextType,
        id: contextId || 'general',
        name: contextTitle
      },
      priority: 'medium',
      status: 'draft'
    };

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      if (newColumns[0]) {
        newColumns[0].notes.unshift(newNote);
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

  const handleNoteClick = (note: Note) => {
    if (hasDragged.current) return;
    
    setSelectedNote(note);
    setIsEditing(true);
  };

  const handleNoteUpdate = (updatedNote: Note) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const columnIndex = newColumns.findIndex(col => col.id === updatedNote.status);
      if (columnIndex !== -1 && newColumns[columnIndex]) {
        const noteIndex = newColumns[columnIndex].notes.findIndex(note => note.id === updatedNote.id);
        if (noteIndex !== -1) {
          newColumns[columnIndex].notes[noteIndex] = updatedNote;
        }
      }
      return newColumns;
    });
  };

  const handleNoteDelete = (id: string) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      newColumns.forEach(col => {
        col.notes = col.notes.filter(note => note.id !== id);
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

    // Move all notes to the first column
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const columnIndex = newColumns.findIndex(col => col.id === columnId);
      if (columnIndex !== -1 && columnIndex > 0 && newColumns[0] && newColumns[columnIndex]) {
        const notesToMove = [...newColumns[columnIndex].notes];
        newColumns[0].notes.push(...notesToMove);
        newColumns.splice(columnIndex, 1);
      }
      return newColumns;
    });
    setShowDeleteConfirm(null);
  };

  const renderNoteCard = (note: Note, index: number, columnId: string) => {
    const isDropTarget = dragState.dropTarget?.columnId === columnId && dragState.dropTarget?.index === index;
    const isDragging = dragState.draggedItem?.id === note.id;

    return (
      <React.Fragment key={note.id}>
        {isDropTarget && (
          <div className="drop-zone-space h-4 mb-2">
            <div className="h-full border-2 border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Drop here</span>
            </div>
          </div>
        )}
        
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, note.id, columnId, index)}
          onDragEnd={handleDragEnd}
          onClick={() => handleNoteClick(note)}
          className={`kanban-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
            isDragging ? 'opacity-50' : ''
          }`}
          style={{ minHeight: '120px' }}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
              {note.title}
            </h3>
            <div className="flex items-center space-x-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                note.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                note.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {note.priority}
              </span>
            </div>
          </div>

          {cardSettings.showContent && note.content && (
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
              {note.content}
            </p>
          )}

          <div className="space-y-2">
            {cardSettings.showAuthor && note.author && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <User className="h-3 w-3" />
                <span>{note.author}</span>
              </div>
            )}

            {cardSettings.showDate && note.createdAt && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            )}

            {cardSettings.showContext && note.context && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Tag className="h-3 w-3" />
                <span>{note.context.type}</span>
              </div>
            )}

            {cardSettings.showTags && note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    {tag}
                  </span>
                ))}
                {note.tags.length > 2 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    +{note.tags.length - 2}
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
    notes: column.notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesContext = filterContext === 'all' || note.context.type === filterContext;
      const matchesPriority = filterPriority === 'all' || note.priority === filterPriority;
      
      return matchesSearch && matchesContext && matchesPriority;
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
        <div className="notes-kanban flex space-x-6 p-6 overflow-x-auto h-full">
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
                    {column.notes.length}
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
                        <Edit3 className="h-4 w-4 inline mr-2" />
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

              {/* Note Cards */}
              <div className="space-y-2">
                {column.notes.map((note, index) => renderNoteCard(note, index, column.id))}
                
                {/* Drop zone at the end */}
                {dragState.dropTarget?.columnId === column.id && dragState.dropTarget?.index === column.notes.length && (
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

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto">
      {filteredColumns.flatMap(column => column.notes).map((note) => (
        <div
          key={note.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleNoteClick(note)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {note.context.type}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                note.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                note.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {note.priority}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNoteDelete(note.id);
                }}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Delete Note"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {note.title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
            {note.content}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-constructbms-blue/10 text-constructbms-blue text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{note.author}</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{contextTitle}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {contextId ? `Notes for ${contextType}` : 'Manage all your notes'}
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
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
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
                onClick={handleCreateNote}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
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
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={filterContext}
              onChange={(e) => setFilterContext(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Contexts</option>
              <option value="opportunity">Opportunities</option>
              <option value="project">Projects</option>
              <option value="customer">Customers</option>
              <option value="general">General</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
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
      {viewMode === 'kanban' ? renderKanbanView() : renderGridView()}

      {filteredColumns.flatMap(column => column.notes).length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No notes found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterContext !== 'all' || filterPriority !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first note to get started'}
          </p>
        </div>
      )}

      {/* Create/Edit Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Note</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Note title..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Write your note here..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      placeholder="tag1, tag2, tag3..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Cancel"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-primary transition-colors"
                title="Create Note"
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Column
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this column? All notes will be moved to the first column.
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

export default Notes; 
