import React, { useState, useEffect, useRef } from 'react';
import { persistentStorage } from '../services/persistentStorage';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
} from 'lucide-react';

interface StickyNote {
  color: string;
  content: string;
  createdAt: string;
  id: string;
  position: { x: number; y: number };
  title: string;
  updatedAt: string;
}

interface StickyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  {
    name: 'Yellow',
    value: 'bg-yellow-200 border-yellow-300',
    text: 'text-yellow-900',
  },
  { name: 'Pink', value: 'bg-pink-200 border-pink-300', text: 'text-pink-900' },
  { name: 'Blue', value: 'bg-blue-200 border-blue-300', text: 'text-blue-900' },
  {
    name: 'Green',
    value: 'bg-green-200 border-green-300',
    text: 'text-green-900',
  },
  {
    name: 'Purple',
    value: 'bg-purple-200 border-purple-300',
    text: 'text-purple-900',
  },
  {
    name: 'Orange',
    value: 'bg-orange-200 border-orange-300',
    text: 'text-orange-900',
  },
];

// Simple Rich Text Editor Component
const SimpleRichTextEditor: React.FC<{
  onBlur: () => void;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  value: string;
}> = ({ value, onChange, onBlur, onKeyDown }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isToolbarActive, setIsToolbarActive] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.matches(':focus')) {
      // Convert markdown to HTML for display
      const htmlContent = value
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
        .replace(/\n/g, '<br>');

      if (editorRef.current.innerHTML !== htmlContent) {
        editorRef.current.innerHTML = htmlContent;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      // Convert HTML back to markdown
      let markdownContent = editorRef.current.innerHTML
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
        .replace(/<br>/g, '\n')
        .replace(/<div>/g, '\n')
        .replace(/<\/div>/g, '')
        .replace(/&nbsp;/g, ' ');

      onChange(markdownContent);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't trigger blur if toolbar is active
    if (isToolbarActive) {
      return;
    }
    onBlur();
  };

  // Replace addFormatting with toggle logic:
  const addFormatting = (format: string) => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    // Helper to replace HTML tags
    function replaceTag(tag: string, replacer: (node: Element) => void) {
      const fragment = range.cloneContents();
      const walker = document.createTreeWalker(
        fragment,
        NodeFilter.SHOW_ELEMENT,
        null
      );
      let node;
      while ((node = walker.nextNode())) {
        if ((node as Element).tagName.toLowerCase() === tag) {
          replacer(node as Element);
        }
      }
      return fragment;
    }

    if (format === 'bold') {
      // Toggle bold
      if (
        selectedText &&
        range.startContainer.parentElement?.tagName === 'STRONG'
      ) {
        // Remove bold
        document.execCommand('removeFormat');
      } else if (selectedText) {
        document.execCommand('bold');
      } else {
        const strong = document.createElement('strong');
        strong.textContent = '';
        range.insertNode(strong);
        range.setStart(strong, 0);
        range.setEnd(strong, 0);
      }
    } else if (format === 'italic') {
      if (
        selectedText &&
        range.startContainer.parentElement?.tagName === 'EM'
      ) {
        document.execCommand('removeFormat');
      } else if (selectedText) {
        document.execCommand('italic');
      } else {
        const em = document.createElement('em');
        em.textContent = '';
        range.insertNode(em);
        range.setStart(em, 0);
        range.setEnd(em, 0);
      }
    } else if (format === 'underline') {
      // Toggle underline using <u> tags for consistency
      const parent = range.startContainer.parentElement;
      if (selectedText && parent && parent.tagName === 'U') {
        // Remove underline
        const uElement = parent;
        const textNode = document.createTextNode(uElement.textContent || '');
        uElement.parentNode?.replaceChild(textNode, uElement);
        range.selectNodeContents(textNode);
      } else if (selectedText) {
        const uElement = document.createElement('u');
        uElement.textContent = selectedText;
        range.deleteContents();
        range.insertNode(uElement);
        range.selectNodeContents(uElement);
      } else {
        const uElement = document.createElement('u');
        uElement.textContent = '';
        range.insertNode(uElement);
        range.setStart(uElement, 0);
        range.setEnd(uElement, 0);
      }
    } else if (format === 'bullet') {
      const bulletText = document.createTextNode('• ');
      range.insertNode(bulletText);
      range.setStartAfter(bulletText);
      range.setEndAfter(bulletText);
    } else if (format === 'numbered') {
      const numberText = document.createTextNode('1. ');
      range.insertNode(numberText);
      range.setStartAfter(numberText);
      range.setEndAfter(numberText);
    }
    selection.removeAllRanges();
    selection.addRange(range);
    handleInput();
    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
  };

  return (
    <div className='w-full'>
      {/* Toolbar */}
      <div
        className='flex items-center space-x-1 mb-2 p-1 bg-gray-100 dark:bg-gray-700 rounded border'
        onMouseEnter={() => setIsToolbarActive(true)}
        onMouseLeave={() => setIsToolbarActive(false)}
      >
        <button
          type='button'
          onClick={() => addFormatting('bold')}
          className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
          title='Bold (**text**)'
        >
          <Bold className='h-3 w-3' />
        </button>
        <button
          type='button'
          onClick={() => addFormatting('italic')}
          className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
          title='Italic (*text*)'
        >
          <Italic className='h-3 w-3' />
        </button>
        <button
          type='button'
          onClick={() => addFormatting('underline')}
          className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
          title='Underline (<u>text</u>)'
        >
          <Underline className='h-3 w-3' />
        </button>
        <div className='w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1' />
        <button
          type='button'
          onClick={() => addFormatting('bullet')}
          className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
          title='Bullet List'
        >
          <List className='h-3 w-3' />
        </button>
        <button
          type='button'
          onClick={() => addFormatting('numbered')}
          className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
          title='Numbered List'
        >
          <ListOrdered className='h-3 w-3' />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            const range = selection.getRangeAt(0);

            // Get the current line by looking at the parent element
            let currentLine = '';
            let currentNode: Node | null = range.startContainer;

            // Walk up to find the text content
            while (currentNode && currentNode !== editorRef.current) {
              if (currentNode.nodeType === Node.TEXT_NODE) {
                currentLine = currentNode.textContent || '';
                break;
              }
              currentNode = currentNode.parentNode;
            }

            // Check if we're at the start of a line (bullet or number)
            const isAtStart = range.startOffset === 0;
            const hasBullet =
              currentLine.startsWith('• ') ||
              currentLine.startsWith('* ') ||
              currentLine.startsWith('- ');
            const hasNumber = /^\d+\.\s/.test(currentLine);

            if (hasBullet) {
              // Continue bullet list
              document.execCommand('insertHTML', false, '<br>• ');
            } else if (hasNumber) {
              // Continue numbered list
              const match = currentLine.match(/^(\d+)\.\s/);
              const nextNumber = match ? parseInt(match[1]) + 1 : 1;
              document.execCommand('insertHTML', false, `<br>${nextNumber}. `);
            } else {
              // Regular line break
              document.execCommand('insertHTML', false, '<br>');
            }

            handleInput();
          }
        }}
        onMouseDown={e => e.stopPropagation()}
        onMouseUp={e => e.stopPropagation()}
        onMouseMove={e => e.stopPropagation()}
        onClick={e => {
          e.stopPropagation();
          editorRef.current?.focus();
        }}
        className='w-full h-32 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 overflow-y-auto cursor-text'
        style={{ minHeight: '8rem' }}
        data-placeholder='Click to start writing...'
      />
    </div>
  );
};

const StickyNotesModal: React.FC<StickyNotesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'title' | 'content' | null>(
    null
  );
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<string | null>(
    null
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load notes from persistent storage on component mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await persistentStorage.getSetting(
          'sticky_notes',
          'notes'
        );
        if (savedNotes) {
          setNotes(savedNotes);
        }
      } catch (error) {
        console.error('Error loading sticky notes:', error);
      } finally {
        setIsInitialLoadComplete(true);
      }
    };
    loadNotes();
  }, []);

  // Save notes to persistent storage whenever notes change
  useEffect(() => {
    if (isInitialLoadComplete) {
      const saveNotes = async () => {
        try {
          await persistentStorage.setSetting('sticky_notes', notes, 'notes');
        } catch (error) {
          console.error('Error saving sticky notes:', error);
        }
      };
      saveNotes();
    }
  }, [notes, isInitialLoadComplete]);

  const createNote = () => {
    const newNote: StickyNote = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '<p>Click to start writing...</p>',
      color: COLORS[Math.floor(Math.random() * COLORS.length)].value,
      position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);
    setEditingNote(newNote.id);
    setEditingField('content');
  };

  const updateNote = (noteId: string, updates: Partial<StickyNote>) => {
    setNotes(
      notes.map(note =>
        note.id === noteId
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    setDeleteConfirmNote(null);
    if (editingNote === noteId) {
      setEditingNote(null);
      setEditingField(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, noteId: string) => {
    // Don't start dragging if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'BUTTON' ||
      target.closest('button')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    setDraggedNote(noteId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNote) return;

    e.preventDefault();
    const containerRect = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    updateNote(draggedNote, {
      position: {
        x: Math.max(0, Math.min(newX, 800)),
        y: Math.max(0, Math.min(newY, 600)),
      },
    });
  };

  const handleMouseUp = () => {
    setDraggedNote(null);
  };

  const changeNoteColor = (noteId: string, color: string) => {
    updateNote(noteId, { color });
  };

  // Helper function to convert text to display format
  const getDisplayContent = (content: string) => {
    // Convert markdown-style formatting to HTML for display
    let displayContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>') // Underline
      .replace(/\n/g, '<br>'); // Line breaks

    return displayContent;
  };

  // Helper function to get clean content for editing
  const getEditContent = (content: string) => {
    // If content is just the default placeholder, return empty
    if (content === '<p>Click to start writing...</p>') {
      return '';
    }
    return content;
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-hidden'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black bg-opacity-50'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='absolute right-0 top-0 h-full w-full max-w-6xl bg-white dark:bg-gray-900 shadow-xl flex flex-col'>
        {/* Header */}
        <div className='flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              Sticky Notes
            </h2>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
              Create and organize your notes
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <button
              onClick={createNote}
              className='flex items-center space-x-2 bg-constructbms-blue text-black px-4 py-2 rounded-lg hover:bg-constructbms-black hover:text-white transition-colors'
            >
              <Plus className='h-4 w-4' />
              <span>Add Note</span>
            </button>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
            >
              <X className='h-5 w-5 text-gray-500' />
            </button>
          </div>
        </div>

        {/* Notes Board Container */}
        <div
          className='flex-1 overflow-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900'
          ref={scrollContainerRef}
        >
          <div
            className='relative w-full h-full min-h-[600px]'
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {notes.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-center'>
                <div className='text-6xl mb-4'>📝</div>
                <h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                  No sticky notes yet
                </h3>
                <p className='text-gray-500 dark:text-gray-400 mb-6'>
                  Create your first note to get started
                </p>
                <button
                  onClick={createNote}
                  className='flex items-center space-x-2 bg-constructbms-blue text-black px-6 py-3 rounded-lg hover:bg-constructbms-black hover:text-white transition-colors'
                >
                  <Plus className='h-5 w-5' />
                  <span>Create Note</span>
                </button>
              </div>
            ) : (
              notes.map(note => {
                const colorConfig =
                  COLORS.find(c => c.value === note.color) || COLORS[0];
                return (
                  <div
                    key={note.id}
                    className={`absolute w-80 min-h-64 p-4 rounded-lg border-2 shadow-lg cursor-move select-none ${note.color} ${colorConfig.text}`}
                    style={{
                      left: note.position.x,
                      top: note.position.y,
                      zIndex: draggedNote === note.id ? 1000 : 10,
                    }}
                    onMouseDown={e => handleMouseDown(e, note.id)}
                  >
                    {/* Note Header */}
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex-1'>
                        {editingNote === note.id && editingField === 'title' ? (
                          <input
                            type='text'
                            value={note.title}
                            onChange={e =>
                              updateNote(note.id, { title: e.target.value })
                            }
                            onBlur={() => {
                              setEditingNote(null);
                              setEditingField(null);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                setEditingNote(null);
                                setEditingField(null);
                              }
                            }}
                            className='font-semibold bg-transparent border-none outline-none w-full text-sm'
                            autoFocus
                          />
                        ) : (
                          <h3
                            className='font-semibold text-sm cursor-text'
                            onClick={e => {
                              e.stopPropagation();
                              setEditingNote(note.id);
                              setEditingField('title');
                            }}
                          >
                            {note.title}
                          </h3>
                        )}
                      </div>

                      <div className='flex items-center space-x-1'>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setEditingNote(note.id);
                            setEditingField('content');
                          }}
                          className='p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors'
                        >
                          <Edit3 className='h-3 w-3' />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmNote(note.id)}
                          className='p-1 hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors text-red-600'
                        >
                          <Trash2 className='h-3 w-3' />
                        </button>
                      </div>
                    </div>

                    {/* Note Content */}
                    <div className='flex-1 mb-2'>
                      {editingNote === note.id && editingField === 'content' ? (
                        <SimpleRichTextEditor
                          value={getEditContent(note.content)}
                          onChange={(text: string) =>
                            updateNote(note.id, { content: text })
                          }
                          onBlur={() => {
                            setEditingNote(null);
                            setEditingField(null);
                          }}
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === 'Escape') {
                              setEditingNote(null);
                              setEditingField(null);
                            }
                          }}
                        />
                      ) : (
                        <div
                          className='text-sm cursor-text leading-relaxed h-32 overflow-y-auto p-2 hover:bg-black hover:bg-opacity-5 rounded transition-colors'
                          onClick={e => {
                            e.stopPropagation();
                            setEditingNote(note.id);
                            setEditingField('content');
                          }}
                        >
                          {note.content ===
                            '<p>Click to start writing...</p>' ||
                          !note.content ? (
                            <div className='text-gray-500 italic'>
                              Click to start writing...
                            </div>
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: getDisplayContent(note.content),
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Section */}
                    <div className='flex items-center justify-between'>
                      {/* Color Picker */}
                      <div className='flex items-center space-x-2'>
                        {COLORS.map(color => (
                          <button
                            key={color.name}
                            onClick={() =>
                              changeNoteColor(note.id, color.value)
                            }
                            className={`w-4 h-4 rounded-full border border-gray-400 hover:scale-110 transition-transform ${color.value}`}
                            title={color.name}
                          />
                        ))}
                      </div>

                      {/* Timestamp */}
                      <div className='text-xs opacity-60'>
                        {new Date(note.updatedAt).toLocaleDateString()}{' '}
                        {new Date(note.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmNote && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center'>
                <Trash2 className='h-5 w-5 text-red-600 dark:text-red-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Delete Sticky Note
                </h3>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6'>
              <p className='text-sm text-gray-700 dark:text-gray-300'>
                Are you sure you want to delete "
                <span className='font-semibold'>
                  {notes.find(n => n.id === deleteConfirmNote)?.title ||
                    'this note'}
                </span>
                "?
              </p>
            </div>

            <div className='flex space-x-3 justify-end'>
              <button
                onClick={() => setDeleteConfirmNote(null)}
                className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={() => deleteNote(deleteConfirmNote)}
                className='px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors'
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StickyNotesModal;
