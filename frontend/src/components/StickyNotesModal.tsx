import { Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input } from './ui';

interface StickyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StickyNotesModal({ isOpen, onClose }: StickyNotesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Project Ideas',
      content: 'Brainstorm new features for the dashboard',
      color: 'yellow',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 2,
      title: 'Meeting Notes',
      content: 'Discuss budget allocation for Q1',
      color: 'pink',
      createdAt: new Date('2024-01-14'),
    },
    {
      id: 3,
      title: 'Reminder',
      content: 'Call client about project updates',
      color: 'blue',
      createdAt: new Date('2024-01-13'),
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

  const filteredNotes = notes.filter(
    note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (!isOpen) return null;

  return createPortal(
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
              <Button
                variant='outline'
                size='sm'
                className='flex items-center space-x-1'
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

          {/* Search */}
          <div className='p-4 border-b bg-gray-800 border-gray-700'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search notes...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              />
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 flex'>
            {/* Notes List */}
            <div className='w-1/2 border-r bg-gray-800 border-gray-700'>
              <div className='p-4 bg-gray-800'>
                <div className='space-y-3'>
                  {filteredNotes.map(note => (
                    <div
                      key={note.id}
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
                    </div>
                  ))}
                </div>
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
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className='w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 resize-none'
                          placeholder='Enter note content'
                        />
                      ) : (
                        <div className='p-3 bg-gray-800 rounded-md text-white min-h-64 whitespace-pre-wrap'>
                          {editContent}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='text-center text-gray-400 py-8'>
                    <div className='text-lg font-medium mb-2'>
                      Select a note to edit
                    </div>
                    <div className='text-sm'>
                      Choose a note from the list to view and edit its content
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
