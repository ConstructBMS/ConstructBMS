import {
  Eye,
  FileText,
  Filter,
  Grid,
  Image,
  List,
  Plus,
  Search,
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
import { stickyNotesService } from '../services/sticky-notes.service';

interface StickyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StickyNote {
  id: string;
  title: string;
  content: string;
  color:
    | 'yellow'
    | 'pink'
    | 'blue'
    | 'gray'
    | 'green'
    | 'orange'
    | 'purple'
    | 'red'
    | 'teal'
    | 'indigo'
    | 'lime'
    | 'rose';
  created_at: string;
  category?: string;
  tags?: string[];
  project_id?: string;
  opportunity_id?: string;
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
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  // Helper function to clean and format HTML content for display
  // Updated to fix truncateHtmlContent reference error
  const formatContentForDisplay = (html: string, maxLength: number = 300) => {
    if (!html) return '<p>No content</p>';

    // Clean up the HTML and ensure proper formatting
    let cleanHtml = html
      .replace(/<br\s*\/?>/gi, '<br>')
      .replace(/<p><\/p>/gi, '')
      .replace(/<p>\s*<\/p>/gi, '')
      .trim();

    // If content is empty after cleaning, add a placeholder
    if (!cleanHtml || cleanHtml.trim() === '') {
      return '<p>No content</p>';
    }

    // Return the full content - let CSS handle the height limits
    return cleanHtml;
  };

  // Helper function to clean HTML content for contentEditable - keep HTML but clean it
  const cleanHtmlForQuill = (html: string) => {
    if (!html) return '';

    // Create a temporary div to parse and clean HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Clean up the HTML but keep formatting
    let cleanHtml = tempDiv.innerHTML
      .replace(/<p><\/p>/g, '') // Remove empty paragraphs
      .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs with whitespace
      .replace(/<br\s*\/?>/g, '<br>') // Normalize line breaks
      .trim();

    return cleanHtml;
  };

  // Simple markdown to HTML converter for display
  const markdownToHtml = (text: string) => {
    if (!text) return '';

    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/^# (.*$)/gim, '<h1>$1</h1>') // H1
      .replace(/^## (.*$)/gim, '<h2>$1</h2>') // H2
      .replace(/^### (.*$)/gim, '<h3>$1</h3>') // H3
      .replace(/^- (.*$)/gim, '<li>$1</li>') // Bullet lists
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>') // Numbered lists
      .replace(/\n/g, '<br>') // Line breaks
      .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>') // Wrap lists
      .replace(/<\/ul><br><ul>/g, '') // Remove extra ul tags
      .replace(/<ul><li>(.*?)<\/li><\/ul>/g, '<ul><li>$1</li></ul>'); // Clean up lists
  };
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'full'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);
  const [showFormatting, setShowFormatting] = useState<number | null>(null);
  const [inlineEditingNote, setInlineEditingNote] = useState<string | null>(
    null
  );
  const [inlineEditTitle, setInlineEditTitle] = useState('');
  const [inlineEditContent, setInlineEditContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Load notes from API - no error handling to prevent jumping
  const loadNotes = async () => {
    try {
      const data = await stickyNotesService.getStickyNotes();

      // Add colors to existing notes if they don't have them
      const notesWithColors = data.map((note, index) => ({
        ...note,
        color:
          note.color || (['yellow', 'pink', 'blue', 'green'][index % 4] as any),
      }));

      setNotes(notesWithColors);
    } catch (err) {
      console.error('Error loading notes:', err);
      // Silently fail - no error display to prevent jumping
    }
  };

  // Load notes when modal opens
  useEffect(() => {
    if (isOpen) {
      loadNotes();
    }
  }, [isOpen]);

  // Handle escape key and click outside
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showColorPicker || showFormatting) {
          setShowColorPicker(null);
          setShowFormatting(null);
        } else {
          onClose();
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest('.color-picker') &&
        !target.closest('.formatting-panel')
      ) {
        setShowColorPicker(null);
        setShowFormatting(null);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, showColorPicker, showFormatting]);

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
      filterProject === 'all' || note.project_id === filterProject;

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
    ...new Set(notes.map(note => note.project_id).filter(Boolean)),
  ];

  // Rich text editor configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image'],
      [{ color: [] }, { background: [] }],
      ['blockquote', 'code-block'],
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
    'indent',
    'align',
    'link',
    'image',
    'color',
    'background',
    'blockquote',
    'code-block',
  ];

  const handleNoteClick = (noteId: string) => {
    setSelectedNote(noteId);
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditTitle(note.title);
      // Ensure content is properly formatted for ReactQuill
      setEditContent(cleanHtmlForQuill(note.content || ''));
    }
  };

  const handleNoteDoubleClick = (noteId: string) => {
    startInlineEdit(noteId);
  };

  // Color configuration with expanded options
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
  };

  const handleColorChange = async (
    noteId: string,
    color: keyof typeof colorConfig
  ) => {
    // Update local state immediately for smooth UI - no error handling to prevent jumping
    setNotes(prevNotes =>
      prevNotes.map(note => (note.id === noteId ? { ...note, color } : note))
    );

    // Update database in background - no error handling to prevent jumping
    try {
      await stickyNotesService.updateStickyNote(noteId, { color });
    } catch (err) {
      console.error('Error updating color:', err);
      // Silently fail - no error display
    }
  };

  // Inline editing functions
  const startInlineEdit = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setInlineEditingNote(noteId);
      setInlineEditTitle(note.title);
      // Ensure content is properly formatted for ReactQuill
      setInlineEditContent(cleanHtmlForQuill(note.content || ''));
    }
  };

  const saveInlineEdit = async () => {
    if (inlineEditingNote) {
      // Update local state immediately for smooth UI - no error handling to prevent jumping
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === inlineEditingNote
            ? {
                ...note,
                title: inlineEditTitle,
                content: inlineEditContent,
              }
            : note
        )
      );

      setInlineEditingNote(null);
      setInlineEditTitle('');
      setInlineEditContent('');

      // Update database in background - no error handling to prevent jumping
      try {
        await stickyNotesService.updateStickyNote(inlineEditingNote, {
          title: inlineEditTitle,
          content: inlineEditContent,
        });
      } catch (err) {
        console.error('Error saving note:', err);
        // Silently fail - no error display
      }
    }
  };

  const cancelInlineEdit = () => {
    setInlineEditingNote(null);
    setInlineEditTitle('');
    setInlineEditContent('');
  };

  // Enhanced formatting functions
  const applyFormatting = (noteId: string, format: string) => {
    let newContent =
      inlineEditingNote === noteId ? inlineEditContent : editContent;

    switch (format) {
      case 'bold':
        newContent += ' **bold text** ';
        break;
      case 'italic':
        newContent += ' *italic text* ';
        break;
      case 'underline':
        newContent += ' <u>underlined text</u> ';
        break;
      case 'strikethrough':
        newContent += ' ~~strikethrough text~~ ';
        break;
      case 'h1':
        newContent += '\n# Heading 1\n';
        break;
      case 'h2':
        newContent += '\n## Heading 2\n';
        break;
      case 'h3':
        newContent += '\n### Heading 3\n';
        break;
      case 'bullet':
        newContent += '\n• Bullet point\n';
        break;
      case 'numbered':
        newContent += '\n1. Numbered item\n';
        break;
      case 'checkbox':
        newContent += '\n- [ ] Checkbox item\n';
        break;
      case 'quote':
        newContent += '\n> Quote text\n';
        break;
      case 'code':
        newContent += '\n`code snippet`\n';
        break;
      case 'codeblock':
        newContent += '\n```\ncode block\n```\n';
        break;
      case 'link':
        newContent += ' [link text](url) ';
        break;
      case 'divider':
        newContent += '\n---\n';
        break;
      case 'left':
        newContent +=
          '\n<div style="text-align: left;">Left aligned text</div>\n';
        break;
      case 'center':
        newContent +=
          '\n<div style="text-align: center;">Center aligned text</div>\n';
        break;
      case 'right':
        newContent +=
          '\n<div style="text-align: right;">Right aligned text</div>\n';
        break;
    }

    if (inlineEditingNote === noteId) {
      setInlineEditContent(newContent);
    } else {
      setEditContent(newContent);
    }
  };

  const handleEdit = () => {
    if (selectedNote) {
      const note = notes.find(n => n.id === selectedNote);
      if (note) {
        setEditTitle(note.title);
        setEditContent(cleanHtmlForQuill(note.content || ''));
        setEditingNote(selectedNote);
      }
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

  // Drag and drop handlers - optimized to prevent jumping
  const handleDragEnd = (result: any) => {
    // Clear drag state
    setDraggedNoteId(null);
    setDragOverIndex(null);

    if (!result.destination) return;

    // Simple reorder without complex state updates
    setNotes(prevNotes => {
      const newNotes = [...prevNotes];
      const [reorderedItem] = newNotes.splice(result.source.index, 1);
      newNotes.splice(result.destination.index, 0, reorderedItem);
      return newNotes;
    });
  };

  // Handle drag start to show drop zones
  const handleDragStart = (result: any) => {
    setDraggedNoteId(result.draggableId);
  };

  // Note: Removed react-grid-layout handlers - using @hello-pangea/dnd instead

  // Note: Removed complex JavaScript drag styling - using @hello-pangea/dnd instead

  // File upload handler
  const onDrop = (acceptedFiles: File[], noteId: string) => {
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

            /* Drop zone indicator for sticky notes */
            .drop-zone-indicator {
              border: 2px solid #ffffff;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              position: relative;
              min-height: 300px;
              min-width: 200px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
            }

            .drop-zone-indicator::before {
              content: 'Drop here';
              color: rgba(255, 255, 255, 0.7);
              font-size: 14px;
              font-weight: 500;
            }

            /* Sticky note drop zone indicator */
            .sticky-note-drop-zone {
              border: 2px dashed #ffffff;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              position: relative;
              min-height: 300px;
              min-width: 200px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
              box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
              animation: pulse 1.5s infinite;
            }

            .sticky-note-drop-zone::before {
              content: 'Drop here';
              color: rgba(255, 255, 255, 0.9);
              font-size: 14px;
              font-weight: 600;
              text-align: center;
            }

            @keyframes pulse {
              0% {
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
              }
              50% {
                box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
              }
              100% {
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
              }
            }

            /* Style the placeholder as a drop zone indicator */
            [data-rbd-placeholder-context-id] {
              border: 2px dashed #ffffff !important;
              background: rgba(255, 255, 255, 0.1) !important;
              border-radius: 8px !important;
              min-height: 300px !important;
              min-width: 200px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              position: relative !important;
              box-shadow: 0 0 20px rgba(255, 255, 255, 0.3) !important;
              animation: pulse 1.5s infinite !important;
            }

            [data-rbd-placeholder-context-id]::before {
              content: 'Drop here' !important;
              color: rgba(255, 255, 255, 0.9) !important;
              font-size: 14px !important;
              font-weight: 600 !important;
              text-align: center !important;
            }

            /* Simple controls styling */
            .notes-cards {
              position: relative;
            }

            /* Hide scrollbars while keeping scroll functionality */
            .scrollbar-hide {
              -ms-overflow-style: none;  /* Internet Explorer 10+ */
              scrollbar-width: none;  /* Firefox */
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;  /* Safari and Chrome */
            }

            /* Improved hover scroll area */
            .hover-scroll-area {
              transition: all 0.2s ease;
              cursor: default;
            }

            /* Make the entire card area trigger scroll on hover */
            .notes-cards:hover .hover-scroll-area {
              overflow-y: auto !important;
            }

            /* Better hover detection for content areas */
            .hover-scroll-area:hover {
              overflow-y: auto !important;
            }

            /* Smooth scrolling behavior */
            .hover-scroll-area {
              scroll-behavior: smooth;
            }

            /* ReactQuill dark theme styling */
            .ql-toolbar {
              background-color: #374151 !important;
              border-color: #4b5563 !important;
              color: white !important;
            }

            .ql-toolbar .ql-stroke {
              stroke: white !important;
            }

            .ql-toolbar .ql-fill {
              fill: white !important;
            }

            .ql-toolbar .ql-picker-label {
              color: white !important;
            }

            .ql-toolbar .ql-picker-options {
              background-color: #374151 !important;
              color: white !important;
            }

            .ql-container {
              background-color: #1f2937 !important;
              color: white !important;
              border-color: #4b5563 !important;
            }

            .ql-editor {
              color: white !important;
              background-color: #1f2937 !important;
            }

            .ql-editor.ql-blank::before {
              color: #9ca3af !important;
            }
          `}
      </style>
      <div className='fixed inset-0 z-50 flex'>
        {/* Backdrop */}
        <div className='fixed inset-0 bg-black/50' onClick={onClose} />

        {/* Modal */}
        <div className='notes-main-modal relative ml-auto w-[1000px] h-full bg-gray-900 border-l shadow-xl'>
          <div className='flex flex-col h-full'>
            {/* Header */}
            <div className='sticky-notes-modal-header flex items-center justify-between p-4 border-b bg-gray-800 border-gray-700'>
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
                  onClick={async () => {
                    try {
                      const newNote = await stickyNotesService.createStickyNote(
                        {
                          title: 'New Note',
                          content: 'Click to edit...',
                          tags: [],
                        }
                      );
                      setNotes(prev => [...prev, newNote]);
                      setSelectedNote(newNote);
                      setEditingNote(newNote);
                      setEditTitle(newNote.title);
                      setEditContent(newNote.content);
                    } catch (error) {
                      console.error('Error creating note:', error);
                      // Silently fail - no error display to prevent jumping
                    }
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
              {/* Error States */}

              {/* Error Display - Removed to prevent jumping during drag and drop */}

              {viewMode === 'list' && (
                <>
                  {/* Notes List */}
                  <div className='w-1/2 border-r bg-gray-800 border-gray-700'>
                    <div className='p-4 bg-gray-800'>
                      <DragDropContext
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
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
                                  isDragDisabled={inlineEditingNote === note.id}
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
                                      }`}
                                      style={{
                                        backgroundColor:
                                          colorConfig[
                                            note.color as keyof typeof colorConfig
                                          ]?.bg || '#f3f4f6',
                                        borderLeftColor:
                                          colorConfig[
                                            note.color as keyof typeof colorConfig
                                          ]?.border || '#9ca3af',
                                      }}
                                    >
                                      <div className='font-medium text-gray-900 group-hover:text-white'>
                                        {note.title}
                                      </div>
                                      <div
                                        className='text-sm text-gray-700 group-hover:text-gray-200 mt-1 flex-1 overflow-hidden group-hover:overflow-y-auto scrollbar-hide hover-scroll-area'
                                        style={{
                                          wordBreak: 'break-word',
                                          overflowWrap: 'break-word',
                                          lineHeight: '1.3',
                                          maxHeight: '12rem',
                                          display: 'block',
                                        }}
                                        dangerouslySetInnerHTML={{
                                          __html: note.content || '',
                                        }}
                                      />
                                      <div className='mt-auto'>
                                        <div className='text-xs text-gray-500 group-hover:text-gray-300 mb-2'>
                                          {new Date(
                                            note.created_at
                                          ).toLocaleDateString()}
                                        </div>
                                        {note.tags && note.tags.length > 0 && (
                                          <div className='flex flex-wrap gap-1 max-h-12 overflow-hidden'>
                                            {note.tags.slice(0, 3).map(tag => (
                                              <span
                                                key={tag}
                                                className='px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full truncate'
                                              >
                                                {tag}
                                              </span>
                                            ))}
                                            {note.tags.length > 3 && (
                                              <span className='px-2 py-1 text-xs bg-gray-300 text-gray-600 rounded-full'>
                                                +{note.tags.length - 3}
                                              </span>
                                            )}
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

                          {/* Color Picker and Formatting Tools - Only in Edit Mode */}
                          {editingNote && (
                            <div className='space-y-4'>
                              {/* Color Picker */}
                              <div>
                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                  Note Color
                                </label>
                                <div className='flex flex-wrap gap-2'>
                                  {Object.entries(colorConfig).map(
                                    ([colorKey, colorData]) => (
                                      <button
                                        key={colorKey}
                                        onClick={e => {
                                          e.stopPropagation();
                                          handleColorChange(
                                            editingNote,
                                            colorKey as keyof typeof colorConfig
                                          );
                                        }}
                                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                                          notes.find(n => n.id === editingNote)
                                            ?.color === colorKey
                                            ? 'border-white ring-2 ring-blue-400'
                                            : 'border-gray-400 hover:border-gray-200'
                                        }`}
                                        style={{
                                          backgroundColor: colorData.border,
                                        }}
                                        title={colorData.name}
                                      />
                                    )
                                  )}
                                </div>
                                <div className='text-xs text-gray-400 mt-1'>
                                  Current:{' '}
                                  {
                                    colorConfig[
                                      notes.find(n => n.id === editingNote)
                                        ?.color as keyof typeof colorConfig
                                    ]?.name
                                  }
                                </div>
                              </div>

                              {/* Formatting Tools */}
                              <div>
                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                  Quick Formatting
                                </label>
                                <div className='bg-gray-800 rounded-lg p-3 space-y-3'>
                                  {/* Text Formatting */}
                                  <div>
                                    <div className='text-xs font-medium text-gray-400 mb-2'>
                                      Text Style
                                    </div>
                                    <div className='flex flex-wrap gap-1'>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'bold')
                                        }
                                        className='px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded font-bold text-white'
                                        title='Bold'
                                      >
                                        B
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'italic')
                                        }
                                        className='px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded italic text-white'
                                        title='Italic'
                                      >
                                        I
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(
                                            editingNote,
                                            'underline'
                                          )
                                        }
                                        className='px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded underline text-white'
                                        title='Underline'
                                      >
                                        U
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(
                                            editingNote,
                                            'strikethrough'
                                          )
                                        }
                                        className='px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded line-through text-white'
                                        title='Strikethrough'
                                      >
                                        S
                                      </button>
                                    </div>
                                  </div>

                                  {/* Headings */}
                                  <div>
                                    <div className='text-xs font-medium text-gray-400 mb-2'>
                                      Headings
                                    </div>
                                    <div className='flex flex-wrap gap-1'>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'h1')
                                        }
                                        className='px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white'
                                        title='Heading 1'
                                      >
                                        H1
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'h2')
                                        }
                                        className='px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white'
                                        title='Heading 2'
                                      >
                                        H2
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'h3')
                                        }
                                        className='px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white'
                                        title='Heading 3'
                                      >
                                        H3
                                      </button>
                                    </div>
                                  </div>

                                  {/* Lists */}
                                  <div>
                                    <div className='text-xs font-medium text-gray-400 mb-2'>
                                      Lists
                                    </div>
                                    <div className='flex flex-wrap gap-1'>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'bullet')
                                        }
                                        className='px-2 py-1 text-xs bg-green-600 hover:bg-green-500 rounded text-white'
                                        title='Bullet List'
                                      >
                                        •
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(
                                            editingNote,
                                            'numbered'
                                          )
                                        }
                                        className='px-2 py-1 text-xs bg-green-600 hover:bg-green-500 rounded text-white'
                                        title='Numbered List'
                                      >
                                        1.
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(
                                            editingNote,
                                            'checkbox'
                                          )
                                        }
                                        className='px-2 py-1 text-xs bg-green-600 hover:bg-green-500 rounded text-white'
                                        title='Checkbox List'
                                      >
                                        ☐
                                      </button>
                                    </div>
                                  </div>

                                  {/* Special Formatting */}
                                  <div>
                                    <div className='text-xs font-medium text-gray-400 mb-2'>
                                      Special
                                    </div>
                                    <div className='flex flex-wrap gap-1'>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'quote')
                                        }
                                        className='px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded text-white'
                                        title='Quote'
                                      >
                                        "
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'code')
                                        }
                                        className='px-2 py-1 text-xs bg-orange-600 hover:bg-orange-500 rounded font-mono text-white'
                                        title='Inline Code'
                                      >
                                        &lt;/&gt;
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(
                                            editingNote,
                                            'codeblock'
                                          )
                                        }
                                        className='px-2 py-1 text-xs bg-orange-600 hover:bg-orange-500 rounded font-mono text-white'
                                        title='Code Block'
                                      >
                                        {}
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'link')
                                        }
                                        className='px-2 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 rounded text-white'
                                        title='Link'
                                      >
                                        🔗
                                      </button>
                                    </div>
                                  </div>

                                  {/* Alignment */}
                                  <div>
                                    <div className='text-xs font-medium text-gray-400 mb-2'>
                                      Alignment
                                    </div>
                                    <div className='flex flex-wrap gap-1'>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'left')
                                        }
                                        className='px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded text-white'
                                        title='Left Align'
                                      >
                                        ⬅
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'center')
                                        }
                                        className='px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded text-white'
                                        title='Center Align'
                                      >
                                        ↔
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(editingNote, 'right')
                                        }
                                        className='px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded text-white'
                                        title='Right Align'
                                      >
                                        ➡
                                      </button>
                                      <button
                                        onClick={() =>
                                          applyFormatting(
                                            editingNote,
                                            'divider'
                                          )
                                        }
                                        className='px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded text-white'
                                        title='Divider'
                                      >
                                        ─
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Content */}
                          <div>
                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                              Content
                            </label>
                            {editingNote ? (
                              <div className='bg-gray-800 rounded-md'>
                                <style>
                                  {`
                                    .ql-toolbar {
                                      display: block !important;
                                      background-color: #374151 !important;
                                      border-color: #4b5563 !important;
                                      color: white !important;
                                    }
                                    .ql-toolbar .ql-stroke {
                                      stroke: white !important;
                                    }
                                    .ql-toolbar .ql-fill {
                                      fill: white !important;
                                    }
                                    .ql-toolbar .ql-picker-label {
                                      color: white !important;
                                    }
                                    .ql-toolbar .ql-picker-options {
                                      background-color: #374151 !important;
                                      color: white !important;
                                    }
                                    .ql-container {
                                      background-color: #1f2937 !important;
                                      color: white !important;
                                      border-color: #4b5563 !important;
                                    }
                                    .ql-editor {
                                      color: white !important;
                                      background-color: #1f2937 !important;
                                    }
                                    .ql-editor.ql-blank::before {
                                      color: #9ca3af !important;
                                    }
                                  `}
                                </style>
                                <ReactQuill
                                  key={editingNote}
                                  theme='snow'
                                  value={editContent}
                                  onChange={setEditContent}
                                  modules={quillModules}
                                  formats={quillFormats}
                                  className='bg-gray-800 text-white'
                                  style={{
                                    backgroundColor: '#1f2937',
                                    color: 'white',
                                  }}
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
                  <DragDropContext
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <Droppable
                      droppableId='sticky-notes-grid'
                      direction='horizontal'
                    >
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`grid grid-cols-3 gap-6 p-6 min-w-max ${
                            snapshot.isDraggingOver
                              ? 'bg-gray-800'
                              : 'bg-gray-900'
                          }`}
                          style={{
                            minHeight: '700px',
                            gridTemplateRows: 'repeat(2, minmax(300px, 1fr))',
                            gridAutoRows: 'minmax(300px, 1fr)',
                          }}
                        >
                          {filteredNotes.map((note, index) => (
                            <Draggable
                              key={note.id}
                              draggableId={note.id.toString()}
                              index={index}
                              isDragDisabled={inlineEditingNote === note.id}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`notes-cards aspect-square h-72 w-72 rounded-lg border-l-4 sticky-note-${note.color} ${
                                    inlineEditingNote === note.id
                                      ? 'cursor-default ring-2 ring-blue-500'
                                      : 'cursor-pointer hover:shadow-md'
                                  }`}
                                  onDoubleClick={() => {
                                    if (inlineEditingNote !== note.id) {
                                      startInlineEdit(note.id);
                                    }
                                  }}
                                  style={{
                                    backgroundColor:
                                      colorConfig[
                                        note.color as keyof typeof colorConfig
                                      ]?.bg || '#f3f4f6',
                                    borderLeftColor:
                                      colorConfig[
                                        note.color as keyof typeof colorConfig
                                      ]?.border || '#9ca3af',
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  {/* Controls - Icons only */}
                                  <div className='absolute top-2 right-2 z-50 flex gap-1'>
                                    {/* Edit Button */}
                                    {inlineEditingNote !== note.id && (
                                      <button
                                        onClick={e => {
                                          e.stopPropagation();
                                          startInlineEdit(note.id);
                                        }}
                                        className='text-gray-600 hover:text-gray-800 text-lg'
                                        title='Edit Note'
                                      >
                                        ✏️
                                      </button>
                                    )}

                                    {/* Move Handle */}
                                    {inlineEditingNote !== note.id && (
                                      <div
                                        {...provided.dragHandleProps}
                                        className='text-gray-600 hover:text-gray-800 cursor-move text-lg'
                                        title='Drag to move'
                                        data-rbd-drag-handle-draggable-id={
                                          note.id
                                        }
                                        data-rbd-drag-handle-context-id='0'
                                      >
                                        ⋮⋮
                                      </div>
                                    )}
                                  </div>

                                  <div className='p-3 h-full flex flex-col'>
                                    {inlineEditingNote === note.id ? (
                                      // Inline editing mode
                                      <div className='space-y-3'>
                                        {/* Title editing */}
                                        <div>
                                          <input
                                            type='text'
                                            value={inlineEditTitle}
                                            onChange={e =>
                                              setInlineEditTitle(e.target.value)
                                            }
                                            className='w-full px-2 py-1 text-sm font-medium bg-transparent border-b border-gray-400 focus:border-gray-600 focus:outline-none text-gray-900'
                                            placeholder='Note title...'
                                            autoFocus
                                          />
                                        </div>

                                        {/* Inline formatting toolbar */}
                                        <div className='flex gap-1 mb-2'>
                                          <button
                                            onClick={() => {
                                              document.execCommand('bold', false);
                                            }}
                                            className='px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-bold'
                                            title='Bold'
                                          >
                                            B
                                          </button>
                                          <button
                                            onClick={() => {
                                              document.execCommand('italic', false);
                                            }}
                                            className='px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded italic'
                                            title='Italic'
                                          >
                                            I
                                          </button>
                                          <button
                                            onClick={() => {
                                              document.execCommand('insertUnorderedList', false);
                                            }}
                                            className='px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded'
                                            title='Bullet List'
                                          >
                                            •
                                          </button>
                                          <button
                                            onClick={() => {
                                              document.execCommand('insertOrderedList', false);
                                            }}
                                            className='px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded'
                                            title='Numbered List'
                                          >
                                            1.
                                          </button>
                                          <button
                                            onClick={() => {
                                              document.execCommand('underline', false);
                                            }}
                                            className='px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded underline'
                                            title='Underline'
                                          >
                                            U
                                          </button>
                                        </div>

                                        {/* Inline content editing with contentEditable */}
                                        <div className='flex-1'>
                                          <div
                                            contentEditable
                                            onInput={(e) => {
                                              const target = e.target as HTMLDivElement;
                                              setInlineEditContent(target.innerHTML);
                                            }}
                                            onBlur={(e) => {
                                              const target = e.target as HTMLDivElement;
                                              setInlineEditContent(target.innerHTML);
                                            }}
                                            className='w-full h-full px-2 py-1 text-sm bg-transparent border-none focus:outline-none text-gray-700 resize-none'
                                            style={{
                                              minHeight: '200px',
                                              fontFamily: 'inherit',
                                            }}
                                            dangerouslySetInnerHTML={{ __html: inlineEditContent }}
                                            suppressContentEditableWarning={true}
                                          />
                                        </div>

                                        {/* Color picker for inline editing */}
                                        <div
                                          className='flex flex-wrap gap-1'
                                          style={{
                                            pointerEvents: 'auto',
                                            position: 'relative',
                                            zIndex: 10,
                                          }}
                                          onMouseDown={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                          }}
                                          onClick={e => e.stopPropagation()}
                                          onDragStart={e => e.preventDefault()}
                                          onDrag={e => e.preventDefault()}
                                        >
                                          {Object.entries(colorConfig).map(
                                            ([colorKey, colorData]) => (
                                              <button
                                                key={colorKey}
                                                onClick={e => {
                                                  e.stopPropagation();
                                                  handleColorChange(
                                                    note.id,
                                                    colorKey as keyof typeof colorConfig
                                                  );
                                                }}
                                                onMouseDown={e => {
                                                  e.stopPropagation();
                                                  e.preventDefault();
                                                }}
                                                onDragStart={e =>
                                                  e.preventDefault()
                                                }
                                                onDrag={e => e.preventDefault()}
                                                className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-110 ${
                                                  note.color === colorKey
                                                    ? 'border-gray-800 ring-1 ring-gray-600'
                                                    : 'border-gray-400 hover:border-gray-600'
                                                }`}
                                                style={{
                                                  backgroundColor:
                                                    colorData.border,
                                                }}
                                                title={colorData.name}
                                              />
                                            )
                                          )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className='flex justify-end space-x-2'>
                                          <button
                                            onClick={e => {
                                              e.stopPropagation();
                                              saveInlineEdit();
                                            }}
                                            className='px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded'
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={e => {
                                              e.stopPropagation();
                                              cancelInlineEdit();
                                            }}
                                            className='px-2 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded'
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      // Normal display mode
                                      <>
                                        <div className='mb-2'>
                                          <div className='font-medium text-gray-900'>
                                            {note.title}
                                          </div>
                                        </div>
                                        <div
                                          className='text-sm text-gray-700 mt-1 flex-1 overflow-hidden hover:overflow-y-auto scrollbar-hide hover-scroll-area'
                                          style={{
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word',
                                            lineHeight: '1.3',
                                            maxHeight: '12rem',
                                            display: 'block',
                                          }}
                                          dangerouslySetInnerHTML={{
                                            __html: note.content || '',
                                          }}
                                        />
                                      </>
                                    )}
                                    <div className='mt-auto'>
                                      <div className='text-xs text-gray-500 mb-2'>
                                        {new Date(
                                          note.created_at
                                        ).toLocaleDateString()}
                                      </div>
                                      {note.tags && note.tags.length > 0 && (
                                        <div className='flex flex-wrap gap-1 max-h-12 overflow-hidden'>
                                          {note.tags.slice(0, 3).map(tag => (
                                            <span
                                              key={tag}
                                              className='px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full truncate'
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                          {note.tags.length > 3 && (
                                            <span className='px-2 py-1 text-xs bg-gray-300 text-gray-600 rounded-full'>
                                              +{note.tags.length - 3}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
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
                          {/* Note Header */}
                          <div className='flex items-center justify-between'>
                            <h2 className='text-2xl font-bold text-white'>
                              {note.title}
                            </h2>
                            <div className='flex items-center space-x-2'>
                              <button
                                onClick={() => setViewMode('grid')}
                                className='px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded'
                              >
                                Back to Grid
                              </button>
                            </div>
                          </div>

                          {/* Note Content */}
                          <div className='bg-gray-800 rounded-lg p-6'>
                            <div className='prose prose-invert max-w-none'>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: note.content,
                                }}
                              />
                            </div>
                          </div>

                          {/* Note Metadata */}
                          <div className='flex items-center justify-between text-sm text-gray-400'>
                            <div>
                              Created:{' '}
                              {new Date(note.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              Color:{' '}
                              {colorConfig[
                                note.color as keyof typeof colorConfig
                              ]?.name || 'Yellow'}
                            </div>
                          </div>
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
  noteId: string;
  onDrop: (acceptedFiles: File[], noteId: string) => void;
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
