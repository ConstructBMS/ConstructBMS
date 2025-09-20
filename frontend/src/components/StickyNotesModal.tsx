import { Plus, Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button, Input } from './ui';

interface StickyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StickyNotesModal({ isOpen, onClose }: StickyNotesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='relative ml-auto w-[800px] h-full bg-white border-l shadow-xl'>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b bg-white'>
            <h2 className='text-lg font-semibold text-gray-900'>Sticky Notes</h2>
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
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className='p-4 border-b bg-white'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search notes...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 bg-white border-gray-300 text-gray-900'
              />
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 flex'>
            {/* Notes List */}
            <div className='w-1/2 border-r bg-white'>
              <div className='p-4 bg-white'>
                <div className='space-y-3'>
                  {filteredNotes.map(note => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 ${
                        note.color === 'yellow' ? 'border-yellow-400 bg-yellow-50' :
                        note.color === 'pink' ? 'border-pink-400 bg-pink-50' :
                        note.color === 'blue' ? 'border-blue-400 bg-blue-50' :
                        'border-gray-400 bg-gray-50'
                      }`}
                    >
                      <div className='font-medium text-gray-900'>{note.title}</div>
                      <div className='text-sm text-gray-600 mt-1'>{note.content}</div>
                      <div className='text-xs text-gray-400 mt-2'>
                        {note.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Note Editor */}
            <div className='flex-1 bg-white'>
              <div className='p-4'>
                <div className='text-center text-gray-500 py-8'>
                  <div className='text-lg font-medium mb-2'>Select a note to edit</div>
                  <div className='text-sm'>Choose a note from the list to view and edit its content</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}