import {
  Calendar,
  Eye,
  FileText,
  Filter,
  Folder,
  Grid,
  Image,
  List,
  Plus,
  Search,
  Tag,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input } from './ui';

// Import dependencies directly - they should be available since they're in package.json
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useDropzone } from 'react-dropzone';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface StickyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StickyNote {
  id: number;
  title: string;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'gray';
  createdAt: Date;
  category?: string;
  tags?: string[];
  projectId?: string;
  opportunityId?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: 'image' | 'document';
    url: string;
  }>;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export function StickyNotesModal({ isOpen, onClose }: StickyNotesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'full'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [notes, setNotes] = useState<StickyNote[]>([
    {
      id: 1,
      title: 'Project Ideas',
      content: 'Brainstorm new features for the dashboard',
      color: 'yellow',
      createdAt: new Date('2024-01-15'),
      category: 'Development',
      tags: ['ideas', 'features'],
      projectId: 'proj-1',
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      id: 2,
      title: 'Meeting Notes',
      content: 'Discuss budget allocation for Q1',
      color: 'pink',
      createdAt: new Date('2024-01-14'),
      category: 'Meeting',
      tags: ['budget', 'planning'],
      projectId: 'proj-2',
      x: 2,
      y: 0,
      w: 2,
      h: 2,
    },
    {
      id: 3,
      title: 'Reminder',
      content: 'Call client about project updates',
      color: 'blue',
      createdAt: new Date('2024-01-13'),
      category: 'Task',
      tags: ['client', 'follow-up'],
      opportunityId: 'opp-1',
      x: 0,
      y: 2,
      w: 2,
      h: 2,
    },
  ]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-scroll-y', scrollY.toString());
    } else {
      const scrollY = document.body.getAttribute('data-scroll-y');
      if (scrollY) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.removeAttribute('data-scroll-y');
        window.scrollTo(0, parseInt(scrollY));
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-y');
    };
  }, [isOpen]);

  // Enhanced filtering logic
  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      filterCategory === 'all' || note.category === filterCategory;
    const matchesTag = filterTag === 'all' || note.tags?.includes(filterTag);
    const matchesProject =
      filterProject === 'all' || note.projectId === filterProject;

    return matchesSearch && matchesCategory && matchesTag && matchesProject;
  });

  // Get unique values for filter dropdowns
  const categories = [
    'all',
    ...new Set(notes.map(note => note.category).filter(Boolean)),
  ];
  const tags = ['all', ...new Set(notes.flatMap(note => note.tags || []))];
  const projects = [
    'all',
    ...new Set(notes.map(note => note.projectId).filter(Boolean)),
  ];

  // Rich text editor configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      [{ color: [] }, { background: [] }],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
    'image',
    'color',
    'background',
  ];

  const handleNoteClick = (noteId: number) => {
    setSelectedNote(noteId);
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content);
    }
  };

  const handleNoteDoubleClick = (noteId: number) => {
    setSelectedNote(noteId);
    setEditingNote(noteId);
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content);
    }
  };

  const handleColorChange = (noteId: number, color: string) => {
    setNotes(prevNotes =>
      prevNotes.map(note => (note.id === noteId ? { ...note, color } : note))
    );
    setShowColorPicker(false);
  };

  const handleEdit = () => {
    if (selectedNote) {
      setEditingNote(selectedNote);
    }
  };

  const handleSave = () => {
    if (editingNote) {
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === editingNote
            ? { ...note, title: editTitle, content: editContent }
            : note
        )
      );
      setEditingNote(null);
    }
  };

  const handleCancel = () => {
    setEditingNote(null);
    if (selectedNote) {
      const note = notes.find(n => n.id === selectedNote);
      if (note) {
        setEditTitle(note.title);
        setEditContent(note.content);
      }
    }
  };

  const handleDelete = () => {
    if (selectedNote) {
      setNotes(prevNotes => prevNotes.filter(note => note.id !== selectedNote));
      setSelectedNote(null);
      setEditingNote(null);
    }
  };

  // Drag and drop handlers
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    // Simple approach: just reorder the filteredNotes array
    const items = Array.from(filteredNotes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the notes state by reordering based on the new order
    setNotes(prevNotes => {
      // Create a map of note IDs to their new positions
      const newOrder = items.map((note, index) => ({
        id: note.id,
        order: index,
      }));

      // Sort the notes array based on the new order
      return [...prevNotes].sort((a, b) => {
        const aOrder = newOrder.find(item => item.id === a.id)?.order ?? 999;
        const bOrder = newOrder.find(item => item.id === b.id)?.order ?? 999;
        return aOrder - bOrder;
      });
    });
  };

  // Note: Removed react-grid-layout handlers - using @hello-pangea/dnd instead

  // Note: Removed complex JavaScript drag styling - using @hello-pangea/dnd instead

  // File upload handler
  const onDrop = (acceptedFiles: File[], noteId: number) => {
    const newAttachments = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.startsWith('image/')
        ? ('image' as const)
        : ('document' as const),
      url: URL.createObjectURL(file),
    }));

    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId
          ? {
              ...note,
              attachments: [...(note.attachments || []), ...newAttachments],
            }
          : note
      )
    );
  };

  // Convert notes to grid layout format
  const gridLayout = filteredNotes.map(note => ({
    i: note.id.toString(),
    x: note.x || 0,
    y: note.y || 0,
    w: note.w || 2,
    h: note.h || 2,
    minW: 1,
    minH: 1,
    maxW: 4,
    maxH: 4,
  }));

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Simple drag and drop - minimal animations */}
      <style>
        {`
            /* Disable all drag animations for simple experience */
            [data-rbd-draggable-id],
            .react-beautiful-dnd-dragging,
            .react-beautiful-dnd-dragging * {
              transition: none !important;
              animation: none !important;
            }

            /* Keep only hover effects */
            .grid > div:hover {
              transform: scale(1.02);
              transition: transform 0.2s ease-out;
            }

            /* Dropzone indicator */
            .dropzone-indicator {
              border: 2px dashed #ffffff;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              position: relative;
            }

            .dropzone-indicator::before {
              content: '';
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              border: 2px solid #ffffff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            }
          `}
      </style>
      <div className='fixed inset-0 z-50 flex'>
        {/* Backdrop */}
        <div className='fixed inset-0 bg-black/50' onClick={onClose} />

        {/* Modal */}
        <div className='relative ml-auto w-[1000px] h-full bg-gray-900 border-l shadow-xl'>
          <div className='flex flex-col h-full'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b bg-gray-800 border-gray-700'>
              <h2 className='text-lg font-semibold text-white'>Sticky Notes</h2>
              <div className='flex items-center space-x-2'>
                {/* View Mode Toggle */}
                <div className='flex items-center space-x-1 bg-gray-700 rounded-lg p-1'>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('list')}
                    className={
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }
                  >
                    <List className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('grid')}
                    className={
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }
                  >
                    <Grid className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={viewMode === 'full' ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setViewMode('full')}
                    className={
                      viewMode === 'full'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }
                  >
                    <Eye className='h-4 w-4' />
                  </Button>
                </div>

                {/* Filters */}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowFilters(!showFilters)}
                  className='flex items-center space-x-1 border-gray-600 text-gray-300 hover:bg-gray-700'
                >
                  <Filter className='h-4 w-4' />
                  <span>Filters</span>
                </Button>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const newNote: StickyNote = {
                      id: Date.now(),
                      title: 'New Note',
                      content: 'Click to edit...',
                      color: 'yellow',
                      createdAt: new Date(),
                      tags: [],
                    };
                    setNotes(prev => [...prev, newNote]);
                    setSelectedNote(newNote);
                    setEditingNote(newNote);
                    setEditTitle(newNote.title);
                    setEditContent(newNote.content);
                  }}
                  className='flex items-center space-x-1 border-gray-600 text-gray-300 hover:bg-gray-700'
                >
                  <Plus className='h-4 w-4' />
                  <span>New Note</span>
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  onClick={onClose}
                  className='text-gray-400 hover:text-white hover:bg-gray-700'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className='p-4 border-b bg-gray-800 border-gray-700 space-y-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search notes...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                />
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-700 rounded-lg'>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                      Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white'
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                      Tag
                    </label>
                    <select
                      value={filterTag}
                      onChange={e => setFilterTag(e.target.value)}
                      className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white'
                    >
                      {tags.map(tag => (
                        <option key={tag} value={tag}>
                          {tag === 'all' ? 'All Tags' : tag}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                      Project
                    </label>
                    <select
                      value={filterProject}
                      onChange={e => setFilterProject(e.target.value)}
                      className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white'
                    >
                      {projects.map(project => (
                        <option key={project} value={project}>
                          {project === 'all' ? 'All Projects' : project}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className='flex-1 flex'>
              {viewMode === 'list' && (
                <>
                  {/* Notes List */}
                  <div className='w-1/2 border-r bg-gray-800 border-gray-700'>
                    <div className='p-4 bg-gray-800'>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId='notes-list'>
                          {provided => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className='space-y-3'
                            >
                              {filteredNotes.map((note, index) => (
                                <Draggable
                                  key={note.id}
                                  draggableId={note.id.toString()}
                                  index={index}
                                >
                                  {provided => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => handleNoteClick(note.id)}
                                      className={`p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-700 group sticky-note-${note.color} ${
                                        selectedNote === note.id
                                          ? 'ring-2 ring-blue-500 bg-blue-50'
                                          : ''
                                      } ${
                                        note.color === 'yellow'
                                          ? 'border-yellow-400 bg-yellow-100'
                                          : note.color === 'pink'
                                            ? 'border-pink-400 bg-pink-100'
                                            : note.color === 'blue'
                                              ? 'border-blue-400 bg-blue-100'
                                              : 'border-gray-400 bg-gray-100'
                                      }`}
                                      style={{
                                        backgroundColor:
                                          note.color === 'yellow'
                                            ? '#fef3c7'
                                            : note.color === 'pink'
                                              ? '#fce7f3'
                                              : note.color === 'blue'
                                                ? '#dbeafe'
                                                : '#f3f4f6',
                                        borderLeftColor:
                                          note.color === 'yellow'
                                            ? '#fbbf24'
                                            : note.color === 'pink'
                                              ? '#f472b6'
                                              : note.color === 'blue'
                                                ? '#60a5fa'
                                                : '#9ca3af',
                                      }}
                                    >
                                      <div className='font-medium text-gray-900 group-hover:text-white'>
                                        {note.title}
                                      </div>
                                      <div className='text-sm text-gray-700 group-hover:text-gray-200 mt-1'>
                                        {note.content}
                                      </div>
                                      <div className='text-xs text-gray-500 group-hover:text-gray-300 mt-2'>
                                        {note.createdAt.toLocaleDateString()}
                                      </div>
                                      {note.tags && note.tags.length > 0 && (
                                        <div className='flex flex-wrap gap-1 mt-2'>
                                          {note.tags.map(tag => (
                                            <span
                                              key={tag}
                                              className='px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full'
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  </div>

                  {/* Note Editor */}
                  <div className='flex-1 bg-gray-900'>
                    <div className='p-4'>
                      {selectedNote ? (
                        <div className='space-y-4'>
                          {/* Editor Header */}
                          <div className='flex items-center justify-between'>
                            <h3 className='text-lg font-semibold text-white'>
                              {editingNote ? 'Edit Note' : 'View Note'}
                            </h3>
                            <div className='flex space-x-2'>
                              {editingNote ? (
                                <>
                                  <Button
                                    onClick={handleSave}
                                    size='sm'
                                    className='bg-green-600 hover:bg-green-700 text-white'
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    onClick={handleCancel}
                                    variant='outline'
                                    size='sm'
                                    className='border-gray-600 text-gray-300 hover:bg-gray-700'
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    onClick={handleEdit}
                                    size='sm'
                                    className='bg-blue-600 hover:bg-blue-700 text-white'
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={handleDelete}
                                    variant='outline'
                                    size='sm'
                                    className='border-red-600 text-red-400 hover:bg-red-900'
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Title */}
                          <div>
                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                              Title
                            </label>
                            {editingNote ? (
                              <Input
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className='bg-gray-700 border-gray-600 text-white'
                                placeholder='Enter note title'
                              />
                            ) : (
                              <div className='p-3 bg-gray-800 rounded-md text-white'>
                                {editTitle}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div>
                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                              Content
                            </label>
                            {editingNote ? (
                              <div className='bg-gray-800 rounded-md'>
                                <ReactQuill
                                  theme='snow'
                                  value={editContent}
                                  onChange={setEditContent}
                                  modules={quillModules}
                                  formats={quillFormats}
                                  className='bg-gray-800 text-white'
                                  style={{ backgroundColor: '#1f2937' }}
                                />
                              </div>
                            ) : (
                              <div
                                className='p-3 bg-gray-800 rounded-md text-white min-h-64'
                                dangerouslySetInnerHTML={{
                                  __html: editContent,
                                }}
                              />
                            )}
                          </div>

                          {/* Attachments */}
                          {selectedNote &&
                            notes.find(n => n.id === selectedNote)
                              ?.attachments && (
                              <div>
                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                  Attachments
                                </label>
                                <div className='grid grid-cols-2 gap-2'>
                                  {notes
                                    .find(n => n.id === selectedNote)
                                    ?.attachments?.map(attachment => (
                                      <div
                                        key={attachment.id}
                                        className='p-2 bg-gray-800 rounded-md border border-gray-600'
                                      >
                                        <div className='flex items-center space-x-2'>
                                          {attachment.type === 'image' ? (
                                            <Image className='h-4 w-4 text-blue-400' />
                                          ) : (
                                            <FileText className='h-4 w-4 text-green-400' />
                                          )}
                                          <span className='text-sm text-gray-300 truncate'>
                                            {attachment.name}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                          {/* File Upload */}
                          {editingNote && (
                            <div>
                              <label className='block text-sm font-medium text-gray-300 mb-2'>
                                Add Attachments
                              </label>
                              <FileUploadZone
                                noteId={editingNote}
                                onDrop={onDrop}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className='text-center text-gray-400 py-8'>
                          <div className='text-lg font-medium mb-2'>
                            Select a note to edit
                          </div>
                          <div className='text-sm'>
                            Choose a note from the list to view and edit its
                            content
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {viewMode === 'grid' && (
                <div className='flex-1 bg-gray-900 overflow-auto max-h-[calc(100vh-200px)]'>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable
                      droppableId='sticky-notes-grid'
                      direction='horizontal'
                    >
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`grid grid-cols-3 grid-rows-2 gap-6 p-6 min-w-max ${
                            snapshot.isDraggingOver
                              ? 'bg-gray-800 dropzone-indicator'
                              : 'bg-gray-900'
                          }`}
                          style={{
                            minHeight: '600px',
                            gridTemplateRows: 'repeat(2, 1fr)',
                            gridAutoRows: 'auto',
                          }}
                        >
                          {filteredNotes.map((note, index) => (
                            <Draggable
                              key={note.id}
                              draggableId={note.id.toString()}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => handleNoteClick(note.id)}
                                  onDoubleClick={() =>
                                    handleNoteDoubleClick(note.id)
                                  }
                                  className={`aspect-square h-64 w-64 rounded-lg border-l-4 sticky-note-${note.color} cursor-pointer ${
                                    note.color === 'yellow'
                                      ? 'border-yellow-400 bg-yellow-100'
                                      : note.color === 'pink'
                                        ? 'border-pink-400 bg-pink-100'
                                        : note.color === 'blue'
                                          ? 'border-blue-400 bg-blue-100'
                                          : 'border-gray-400 bg-gray-100'
                                  } ${
                                    snapshot.isDragging
                                      ? 'shadow-lg z-50'
                                      : 'hover:shadow-md'
                                  }`}
                                  style={{
                                    backgroundColor:
                                      note.color === 'yellow'
                                        ? '#fef3c7'
                                        : note.color === 'pink'
                                          ? '#fce7f3'
                                          : note.color === 'blue'
                                            ? '#dbeafe'
                                            : '#f3f4f6',
                                    borderLeftColor:
                                      note.color === 'yellow'
                                        ? '#fbbf24'
                                        : note.color === 'pink'
                                          ? '#f472b6'
                                          : note.color === 'blue'
                                            ? '#60a5fa'
                                            : '#9ca3af',
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  <div className='p-3 h-full flex flex-col'>
                                    <div className='flex items-center justify-between mb-2'>
                                      <div className='font-medium text-gray-900'>
                                        {note.title}
                                      </div>
                                      <div className='flex items-center space-x-1'>
                                        <button
                                          onClick={e => {
                                            e.stopPropagation();
                                            setShowColorPicker(
                                              !showColorPicker
                                            );
                                          }}
                                          className='w-4 h-4 rounded-full border-2 border-gray-300 hover:border-gray-500'
                                          style={{
                                            backgroundColor:
                                              note.color === 'yellow'
                                                ? '#fbbf24'
                                                : note.color === 'pink'
                                                  ? '#f472b6'
                                                  : note.color === 'blue'
                                                    ? '#60a5fa'
                                                    : '#9ca3af',
                                          }}
                                          title='Change color'
                                        />
                                        <button
                                          onClick={e => {
                                            e.stopPropagation();
                                            setShowFormatting(!showFormatting);
                                          }}
                                          className='text-gray-500 hover:text-gray-700 text-xs'
                                          title='Formatting'
                                        >
                                          Aa
                                        </button>
                                        <div className='text-gray-500 cursor-move'>
                                          ⋮⋮
                                        </div>
                                      </div>
                                    </div>
                                    <div className='text-sm text-gray-700 mt-1 flex-1'>
                                      {note.content}
                                    </div>
                                    <div className='text-xs text-gray-500 mt-2'>
                                      {note.createdAt.toLocaleDateString()}
                                    </div>
                                    {note.tags && note.tags.length > 0 && (
                                      <div className='flex flex-wrap gap-1 mt-2'>
                                        {note.tags.map(tag => (
                                          <span
                                            key={tag}
                                            className='px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full'
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {/* Color Picker */}
                                    {showColorPicker && (
                                      <div className='absolute top-12 right-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10'>
                                        <div className='flex space-x-2'>
                                          {[
                                            'yellow',
                                            'pink',
                                            'blue',
                                            'gray',
                                          ].map(color => (
                                            <button
                                              key={color}
                                              onClick={() =>
                                                handleColorChange(
                                                  note.id,
                                                  color
                                                )
                                              }
                                              className={`w-6 h-6 rounded-full border-2 ${
                                                note.color === color
                                                  ? 'border-gray-800'
                                                  : 'border-gray-300'
                                              }`}
                                              style={{
                                                backgroundColor:
                                                  color === 'yellow'
                                                    ? '#fbbf24'
                                                    : color === 'pink'
                                                      ? '#f472b6'
                                                      : color === 'blue'
                                                        ? '#60a5fa'
                                                        : '#9ca3af',
                                              }}
                                              title={color}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Formatting Panel */}
                                    {showFormatting && (
                                      <div className='absolute top-12 right-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10'>
                                        <div className='flex space-x-1'>
                                          <button
                                            onClick={() => {
                                              // Bold formatting
                                              setEditContent(
                                                prev => prev + ' **bold** '
                                              );
                                              setShowFormatting(false);
                                            }}
                                            className='px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded'
                                            title='Bold'
                                          >
                                            B
                                          </button>
                                          <button
                                            onClick={() => {
                                              // Italic formatting
                                              setEditContent(
                                                prev => prev + ' *italic* '
                                              );
                                              setShowFormatting(false);
                                            }}
                                            className='px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded'
                                            title='Italic'
                                          >
                                            I
                                          </button>
                                          <button
                                            onClick={() => {
                                              // Bullet list
                                              setEditContent(
                                                prev => prev + '\n• '
                                              );
                                              setShowFormatting(false);
                                            }}
                                            className='px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded'
                                            title='Bullet List'
                                          >
                                            •
                                          </button>
                                          <button
                                            onClick={() => {
                                              // Numbered list
                                              setEditContent(
                                                prev => prev + '\n1. '
                                              );
                                              setShowFormatting(false);
                                            }}
                                            className='px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded'
                                            title='Numbered List'
                                          >
                                            1.
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}

              {viewMode === 'full' && selectedNote && (
                <div className='flex-1 bg-gray-900 p-8'>
                  <div className='max-w-4xl mx-auto'>
                    {(() => {
                      const note = notes.find(n => n.id === selectedNote);
                      if (!note) return null;

                      return (
                        <div className='space-y-6'>
                          <div className='flex items-center justify-between'>
                            <h1 className='text-3xl font-bold text-white'>
                              {note.title}
                            </h1>
                            <div className='flex space-x-2'>
                              <Button
                                onClick={handleEdit}
                                size='sm'
                                className='bg-blue-600 hover:bg-blue-700 text-white'
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={handleDelete}
                                variant='outline'
                                size='sm'
                                className='border-red-600 text-red-400 hover:bg-red-900'
                              >
                                Delete
                              </Button>
                            </div>
                          </div>

                          <div className='flex items-center space-x-4 text-gray-400'>
                            <div className='flex items-center space-x-1'>
                              <Calendar className='h-4 w-4' />
                              <span>{note.createdAt.toLocaleDateString()}</span>
                            </div>
                            {note.category && (
                              <div className='flex items-center space-x-1'>
                                <Folder className='h-4 w-4' />
                                <span>{note.category}</span>
                              </div>
                            )}
                            {note.tags && note.tags.length > 0 && (
                              <div className='flex items-center space-x-1'>
                                <Tag className='h-4 w-4' />
                                <span>{note.tags.join(', ')}</span>
                              </div>
                            )}
                          </div>

                          <div
                            className='prose prose-invert max-w-none'
                            dangerouslySetInnerHTML={{ __html: note.content }}
                          />

                          {note.attachments && note.attachments.length > 0 && (
                            <div>
                              <h3 className='text-lg font-semibold text-white mb-4'>
                                Attachments
                              </h3>
                              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                {note.attachments.map(attachment => (
                                  <div
                                    key={attachment.id}
                                    className='p-4 bg-gray-800 rounded-lg border border-gray-600'
                                  >
                                    <div className='flex items-center space-x-2'>
                                      {attachment.type === 'image' ? (
                                        <Image className='h-6 w-6 text-blue-400' />
                                      ) : (
                                        <FileText className='h-6 w-6 text-green-400' />
                                      )}
                                      <span className='text-sm text-gray-300'>
                                        {attachment.name}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// File Upload Zone Component
interface FileUploadZoneProps {
  noteId: number;
  onDrop: (acceptedFiles: File[], noteId: number) => void;
}

function FileUploadZone({ noteId, onDrop }: FileUploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => onDrop(acceptedFiles, noteId),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'text/*': ['.txt', '.md'],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className='mx-auto h-8 w-8 text-gray-400 mb-2' />
      <p className='text-sm text-gray-300'>
        {isDragActive
          ? 'Drop files here...'
          : 'Drag & drop files here, or click to select'}
      </p>
      <p className='text-xs text-gray-400 mt-1'>
        Supports images, PDFs, documents, and text files
      </p>
    </div>
  );
}
