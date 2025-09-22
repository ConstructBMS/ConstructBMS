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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDropzone } from 'react-dropzone';

const ResponsiveGridLayout = WidthProvider(Responsive);

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
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'full'>('list');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
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

    const items = Array.from(filteredNotes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update notes with new order
    setNotes(prevNotes => {
      const newNotes = [...prevNotes];
      const sourceIndex = prevNotes.findIndex(
        note => note.id === result.draggableId
      );
      const destIndex = prevNotes.findIndex(
        note => note.id === result.destination.draggableId
      );

      if (sourceIndex !== -1 && destIndex !== -1) {
        const [movedNote] = newNotes.splice(sourceIndex, 1);
        newNotes.splice(destIndex, 0, movedNote);
      }

      return newNotes;
    });
  };

  // Grid layout handlers
  const handleLayoutChange = (layout: any) => {

    setNotes(prevNotes =>
      prevNotes.map(note => {
        const layoutItem = layout.find(
          (item: any) => item.i === note.id.toString()
        );
        if (layoutItem) {
          return {
            ...note,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          };
        }
        return note;
      })
    );
  };

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
      {/* Custom CSS for white drag shadow and drop zones */}
      <style>
        {`
          .react-grid-item.react-draggable-dragging {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.8) !important;
          }
          .react-grid-item.react-resizable-resizing {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.8) !important;
          }
          .react-grid-item.react-draggable-dragging ~ .react-grid-item {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.6) !important;
          }
          .react-grid-item.react-draggable-dragging + .react-grid-item {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.6) !important;
          }
          .react-grid-layout .react-grid-item.react-draggable-dragging {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.8) !important;
          }
          .react-grid-layout .react-grid-item.react-draggable-dragging ~ * {
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.5) !important;
          }
          .react-grid-layout .react-grid-item.react-draggable-dragging + * {
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.5) !important;
          }
          /* Drop zone indicator styling */
          .react-grid-item.react-draggable-dragging::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 2px solid rgba(255, 255, 255, 0.8) !important;
            background-color: transparent !important;
            border-radius: 8px;
            pointer-events: none;
            z-index: 10;
          }
          /* Override any red drop zone styling */
          .react-grid-item.react-draggable-dragging {
            background-color: transparent !important;
            border: none !important;
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
                                      className={`p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-700 group ${
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
                              dangerouslySetInnerHTML={{ __html: editContent }}
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
              <div className='flex-1 bg-gray-900 p-4'>
                <ResponsiveGridLayout
                  className='layout'
                  layouts={{ lg: gridLayout }}
                  breakpoints={{
                    lg: 1200,
                    md: 996,
                    sm: 768,
                    xs: 480,
                    xxs: 0,
                  }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                  onLayoutChange={handleLayoutChange}
                >
                    {filteredNotes.map(note => (
                      <div
                        key={note.id}
                        className='bg-gray-800 rounded-lg p-4 border border-gray-600'
                      >
                        <div
                          className={`p-3 rounded-lg border-l-4 ${
                            note.color === 'yellow'
                              ? 'border-yellow-400 bg-yellow-100'
                              : note.color === 'pink'
                                ? 'border-pink-400 bg-pink-100'
                                : note.color === 'blue'
                                  ? 'border-blue-400 bg-blue-100'
                                  : 'border-gray-400 bg-gray-100'
                          }`}
                        >
                          <div className='font-medium text-gray-900'>
                            {note.title}
                          </div>
                          <div className='text-sm text-gray-700 mt-1'>
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
                        </div>
                      </div>
                    ))}
                </ResponsiveGridLayout>
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
