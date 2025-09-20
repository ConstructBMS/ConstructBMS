import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Edit3,
  FolderOpen,
  GripVertical,
  Palette,
  Pin,
  PinOff,
  Plus,
  Save,
  StickyNote,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  defaultColors,
  useStickyNotesStore,
} from '../app/store/sticky-notes.store';
import { cn } from '../lib/utils/cn';
import { RichTextEditor } from './RichTextEditor';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface StickyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SortableNoteItemProps {
  note: any;
  isSelected: boolean;
  onClick: () => void;
}

function SortableNoteItem({
  note,
  isSelected,
  onClick,
}: SortableNoteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-3 m-2 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105',
        isSelected && 'ring-2 ring-blue-500 ring-opacity-50',
        isDragging && 'opacity-50 rotate-2'
      )}
      onClick={onClick}
    >
      <div
        className='p-4 rounded-lg shadow-md border-l-4 border-t-2 border-l-yellow-400 border-t-yellow-300 min-h-[120px]'
        style={{
          backgroundColor: note.color,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
          transform: 'rotate(-1deg)',
          position: 'relative',
          width: '100%',
          minHeight: '120px',
        }}
      >
        <div className='flex items-start justify-between'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <div
                className='cursor-grab active:cursor-grabbing p-1 hover:bg-black/10 rounded'
                {...attributes}
                {...listeners}
              >
                <GripVertical className='h-4 w-4 text-gray-500' />
              </div>
              {note.isPinned && <Pin className='h-3 w-3 text-yellow-500' />}
              <h3 className='font-medium truncate text-gray-800'>
                {note.title}
              </h3>
            </div>
            <p className='text-sm text-gray-700 mt-1 line-clamp-2'>
              {note.content}
            </p>
            {note.tags.length > 0 && (
              <div className='flex flex-wrap gap-1 mt-2'>
                {note.tags.map((tag: string) => (
                  <Badge key={tag} variant='secondary' className='text-xs'>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div
            className='w-3 h-3 rounded-full ml-2 flex-shrink-0'
            style={{ backgroundColor: note.color }}
          />
        </div>
      </div>
    </div>
  );
}

export function StickyNotesModal({ isOpen, onClose }: StickyNotesModalProps) {
  const {
    notes,
    selectedNote,
    addNote,
    updateNote,
    deleteNote,
    setSelectedNote,
    togglePin,
    addTag,
    removeTag,
    reorderNotes,
    getPinnedNotes,
    searchNotes,
  } = useStickyNotesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showContactSelector, setShowContactSelector] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = filteredNotes.findIndex(note => note.id === active.id);
      const newIndex = filteredNotes.findIndex(note => note.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Update the order in the store
        const reorderedNotes = arrayMove(filteredNotes, oldIndex, newIndex);
        reorderNotes(reorderedNotes);
      }
    }
  };

  // Mock data for projects and contacts
  const projects = [
    { id: '1', name: 'Grand Tower' },
    { id: '2', name: 'Coastal Villa' },
    { id: '3', name: 'City Hub' },
  ];

  const contacts = [
    { id: '1', name: 'John Smith', type: 'Client' },
    { id: '2', name: 'Sarah Johnson', type: 'Contractor' },
    { id: '3', name: 'Mike Wilson', type: 'Consultant' },
  ];

  const filteredNotes = searchQuery
    ? searchNotes(searchQuery)
    : notes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });

  const handleCreateNote = () => {
    const newNote = {
      title: 'New Note',
      content: '',
      color: defaultColors[0],
      tags: [],
      isPinned: false,
    };
    addNote(newNote);
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!selectedNote) return;

    const title = titleRef.current?.value || '';
    const content = contentRef.current?.value || '';

    updateNote(selectedNote.id, {
      title,
      content,
    });
    setIsEditing(false);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setSelectedNote(null);
  };

  const handleAddTag = () => {
    if (!selectedNote || !newTag.trim()) return;
    addTag(selectedNote.id, newTag.trim());
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!selectedNote) return;
    removeTag(selectedNote.id, tag);
  };

  const handleColorChange = (color: string) => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { color });
    setShowColorPicker(false);
  };

  const handleProjectAssign = (projectId: string) => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { projectId });
    setShowProjectSelector(false);
  };

  const handleContactAssign = (contactId: string) => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { contactId });
    setShowContactSelector(false);
  };

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isEditing]);

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;

      // Prevent body scroll without affecting layout
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      // Store scroll position for restoration
      document.body.setAttribute('data-scroll-y', scrollY.toString());
    } else {
      // Restore scroll position
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
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-y');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex' data-modal="sticky-notes">
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='relative ml-auto w-[800px] h-full bg-white border-l shadow-xl'>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b bg-white'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Sticky Notes
            </h2>
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='text-gray-900 hover:bg-gray-100'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Search */}
          <div className='p-4 border-b bg-white'>
            <Input
              placeholder='Search notes...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='bg-white border-gray-300 text-gray-900'
            />
          </div>

          {/* Content */}
          <div className='flex-1 flex'>
            {/* Notes List */}
            <div className='w-1/2 border-r bg-white'>
              <div className='p-4 bg-white'>
                <Button
                  onClick={handleCreateNote}
                  className='w-full mb-4'
                  size='sm'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  New Note
                </Button>
              </div>

              <div className='flex-1 overflow-y-auto'>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredNotes.map(note => note.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredNotes.map(note => (
                      <SortableNoteItem
                        key={note.id}
                        note={note}
                        isSelected={selectedNote?.id === note.id}
                        onClick={() => setSelectedNote(note)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            {/* Note Editor */}
            <div className='w-1/2 flex flex-col bg-white'>
              {selectedNote ? (
                <>
                  {/* Note Header */}
                  <div className='p-4 border-b bg-white'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => togglePin(selectedNote.id)}
                        >
                          {selectedNote.isPinned ? (
                            <Pin className='h-4 w-4 text-yellow-500' />
                          ) : (
                            <PinOff className='h-4 w-4' />
                          )}
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          <Edit3 className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setShowColorPicker(!showColorPicker)}
                        >
                          <Palette className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDeleteNote(selectedNote.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>

                    {/* Color Picker */}
                    {showColorPicker && (
                      <div className='flex gap-2 mb-2'>
                        {defaultColors.map(color => (
                          <button
                            key={color}
                            className='w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform'
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorChange(color)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Assignment Buttons */}
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setShowProjectSelector(!showProjectSelector)
                        }
                      >
                        <FolderOpen className='h-4 w-4 mr-1' />
                        Project
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setShowContactSelector(!showContactSelector)
                        }
                      >
                        <Users className='h-4 w-4 mr-1' />
                        Contact
                      </Button>
                    </div>

                    {/* Project Selector */}
                    {showProjectSelector && (
                      <div className='mt-2'>
                        <Select onValueChange={handleProjectAssign}>
                          <SelectTrigger>
                            <SelectValue placeholder='Select project' />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map(project => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Contact Selector */}
                    {showContactSelector && (
                      <div className='mt-2'>
                        <Select onValueChange={handleContactAssign}>
                          <SelectTrigger>
                            <SelectValue placeholder='Select contact' />
                          </SelectTrigger>
                          <SelectContent>
                            {contacts.map(contact => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {contact.name} ({contact.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Note Content */}
                  <div className='flex-1 p-4 bg-white'>
                    {isEditing ? (
                      <div className='space-y-4'>
                        <div>
                          <Label htmlFor='title'>Title</Label>
                          <Input
                            ref={titleRef}
                            id='title'
                            defaultValue={selectedNote.title}
                            placeholder='Note title...'
                          />
                        </div>
                        <div>
                          <Label htmlFor='content'>Content</Label>
                          <RichTextEditor
                            value={selectedNote.content}
                            onChange={value => {
                              if (contentRef.current) {
                                contentRef.current.value = value;
                              }
                            }}
                            placeholder='Note content...'
                            className='min-h-32'
                          />
                        </div>
                        <div className='flex gap-2'>
                          <Button onClick={handleSaveNote} size='sm'>
                            <Save className='h-4 w-4 mr-1' />
                            Save
                          </Button>
                          <Button
                            variant='outline'
                            onClick={() => setIsEditing(false)}
                            size='sm'
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        <div>
                          <h3 className='font-semibold text-lg'>
                            {selectedNote.title}
                          </h3>
                          <div
                            className='mt-2 prose prose-sm max-w-none'
                            dangerouslySetInnerHTML={{
                              __html: selectedNote.content,
                            }}
                          />
                        </div>

                        {/* Tags */}
                        <div>
                          <Label>Tags</Label>
                          <div className='flex flex-wrap gap-1 mt-1'>
                            {selectedNote.tags.map(tag => (
                              <Badge
                                key={tag}
                                variant='secondary'
                                className='text-xs'
                              >
                                {tag}
                                <button
                                  onClick={() => handleRemoveTag(tag)}
                                  className='ml-1 hover:text-destructive'
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className='flex gap-2 mt-2'>
                            <Input
                              placeholder='Add tag...'
                              value={newTag}
                              onChange={e => setNewTag(e.target.value)}
                              onKeyPress={e =>
                                e.key === 'Enter' && handleAddTag()
                              }
                              size='sm'
                            />
                            <Button onClick={handleAddTag} size='sm'>
                              <Tag className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className='flex-1 flex items-center justify-center text-muted-foreground'>
                  <div className='text-center'>
                    <StickyNote className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p>Select a note to view or edit</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
