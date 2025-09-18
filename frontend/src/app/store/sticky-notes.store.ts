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
  reorderNotes: (reorderedNotes: StickyNote[]) => void;

  // Getters
  getNotesByProject: (projectId: string) => StickyNote[];
  getNotesByContact: (contactId: string) => StickyNote[];
  getPinnedNotes: () => StickyNote[];
  searchNotes: (query: string) => StickyNote[];
}

const defaultColors = [
  '#fef08a', // classic sticky note yellow
  '#fde047', // bright yellow
  '#60a5fa', // bright blue
  '#4ade80', // bright green
  '#f472b6', // bright pink
  '#a78bfa', // bright purple
  '#f87171', // bright red
  '#34d399', // bright emerald
  '#fbbf24', // bright amber
  '#06b6d4', // bright cyan
  '#84cc16', // bright lime
];

export const useStickyNotesStore = create<StickyNotesStore>((set, get) => ({
  notes: [
    {
      id: 'demo-1',
      title: 'Project Alpha Meeting Notes',
      content:
        '<h3>Discussion Points:</h3><ul><li>Review Q1 performance</li><li>Plan Q2 initiatives</li><li>Assign tasks for new feature</li></ul>',
      color: '#fef08a', // classic sticky note yellow
      isPinned: true,
      projectId: 'project-alpha-id',
      contactId: null,
      tags: ['meeting', 'urgent'],
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: 'demo-2',
      title: 'Call John Doe - Contract Renewal',
      content:
        '<p>Remind him about the upcoming contract renewal for Project Beta. Discuss potential upsell opportunities.</p>',
      color: '#fde047', // bright yellow
      isPinned: false,
      projectId: 'project-beta-id',
      contactId: 'contact-john-doe-id',
      tags: ['follow-up', 'client'],
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(Date.now() - 86400000 * 3),
    },
    {
      id: 'demo-3',
      title: 'Idea: New Marketing Campaign',
      content:
        '<p>Brainstorming session for a new digital marketing campaign. Focus on social media and influencer outreach.</p>',
      color: '#4ade80', // bright green
      isPinned: false,
      projectId: null,
      contactId: null,
      tags: ['idea', 'marketing'],
      createdAt: new Date(Date.now() - 86400000 * 10),
      updatedAt: new Date(Date.now() - 86400000 * 7),
    },
  ],
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

  reorderNotes: (reorderedNotes: StickyNote[]) => {
    set({ notes: reorderedNotes });
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
