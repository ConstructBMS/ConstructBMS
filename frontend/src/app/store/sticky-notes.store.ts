import { create } from 'zustand';

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: string;
  projectId?: string;
  contactId?: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  tags: string[];
}

interface StickyNotesStore {
  notes: StickyNote[];
  isOpen: boolean;
  selectedNote: StickyNote | null;

  // Actions
  setOpen: (open: boolean) => void;
  addNote: (note: Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<StickyNote>) => void;
  deleteNote: (id: string) => void;
  setSelectedNote: (note: StickyNote | null) => void;
  togglePin: (id: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;

  // Getters
  getNotesByProject: (projectId: string) => StickyNote[];
  getNotesByContact: (contactId: string) => StickyNote[];
  getPinnedNotes: () => StickyNote[];
  searchNotes: (query: string) => StickyNote[];
}

const defaultColors = [
  '#fef3c7', // yellow
  '#dbeafe', // blue
  '#dcfce7', // green
  '#fce7f3', // pink
  '#e0e7ff', // purple
  '#fef2f2', // red
  '#f0fdf4', // emerald
  '#fefce8', // amber
];

export const useStickyNotesStore = create<StickyNotesStore>((set, get) => ({
  notes: [],
  isOpen: false,
  selectedNote: null,

  setOpen: (open: boolean) => set({ isOpen: open }),

  addNote: noteData => {
    const newNote: StickyNote = {
      ...noteData,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set(state => ({
      notes: [...state.notes, newNote],
      selectedNote: newNote,
    }));
  },

  updateNote: (id: string, updates: Partial<StickyNote>) => {
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
      ),
      selectedNote:
        state.selectedNote?.id === id
          ? { ...state.selectedNote, ...updates, updatedAt: new Date() }
          : state.selectedNote,
    }));
  },

  deleteNote: (id: string) => {
    set(state => ({
      notes: state.notes.filter(note => note.id !== id),
      selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
    }));
  },

  setSelectedNote: (note: StickyNote | null) => set({ selectedNote: note }),

  togglePin: (id: string) => {
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      ),
    }));
  },

  addTag: (id: string, tag: string) => {
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id ? { ...note, tags: [...note.tags, tag] } : note
      ),
    }));
  },

  removeTag: (id: string, tag: string) => {
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id
          ? { ...note, tags: note.tags.filter(t => t !== tag) }
          : note
      ),
    }));
  },

  getNotesByProject: (projectId: string) => {
    return get().notes.filter(note => note.projectId === projectId);
  },

  getNotesByContact: (contactId: string) => {
    return get().notes.filter(note => note.contactId === contactId);
  },

  getPinnedNotes: () => {
    return get().notes.filter(note => note.isPinned);
  },

  searchNotes: (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return get().notes.filter(
      note =>
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  },
}));

export { defaultColors };
