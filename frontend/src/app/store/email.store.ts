import { create } from 'zustand';
import { Email, EmailFolder, EmailFilter, EmailCompose, EmailThread } from '../../lib/types/email';

interface EmailState {
  emails: Email[];
  threads: EmailThread[];
  currentFolder: EmailFolder;
  selectedEmails: string[];
  searchQuery: string;
  filter: EmailFilter;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setEmails: (emails: Email[]) => void;
  addEmail: (email: Email) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  deleteEmail: (id: string) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAsImportant: (id: string) => void;
  markAsFlagged: (id: string) => void;
  moveToFolder: (id: string, folder: EmailFolder) => void;
  setCurrentFolder: (folder: EmailFolder) => void;
  setSelectedEmails: (emails: string[]) => void;
  toggleEmailSelection: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: EmailFilter) => void;
  clearFilter: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getFilteredEmails: () => Email[];
  getEmailsByFolder: (folder: EmailFolder) => Email[];
  getEmailsByOpportunity: (opportunityId: string) => Email[];
  getEmailsByClient: (clientId: string) => Email[];
  getUnreadCount: (folder?: EmailFolder) => number;
}

export const useEmailStore = create<EmailState>((set, get) => ({
  emails: [],
  threads: [],
  currentFolder: 'inbox',
  selectedEmails: [],
  searchQuery: '',
  filter: {},
  isLoading: false,
  error: null,

  setEmails: (emails) => set({ emails }),
  
  addEmail: (email) => set((state) => ({
    emails: [...state.emails, email]
  })),
  
  updateEmail: (id, updates) => set((state) => ({
    emails: state.emails.map(email => 
      email.id === id ? { ...email, ...updates } : email
    )
  })),
  
  deleteEmail: (id) => set((state) => ({
    emails: state.emails.filter(email => email.id !== id)
  })),
  
  markAsRead: (id) => set((state) => ({
    emails: state.emails.map(email => 
      email.id === id ? { ...email, isRead: true } : email
    )
  })),
  
  markAsUnread: (id) => set((state) => ({
    emails: state.emails.map(email => 
      email.id === id ? { ...email, isRead: false } : email
    )
  })),
  
  markAsImportant: (id) => set((state) => ({
    emails: state.emails.map(email => 
      email.id === id ? { ...email, isImportant: !email.isImportant } : email
    )
  })),
  
  markAsFlagged: (id) => set((state) => ({
    emails: state.emails.map(email => 
      email.id === id ? { ...email, isFlagged: !email.isFlagged } : email
    )
  })),
  
  moveToFolder: (id, folder) => set((state) => ({
    emails: state.emails.map(email => 
      email.id === id ? { ...email, folder } : email
    )
  })),
  
  setCurrentFolder: (folder) => set({ currentFolder: folder }),
  
  setSelectedEmails: (emails) => set({ selectedEmails: emails }),
  
  toggleEmailSelection: (id) => set((state) => ({
    selectedEmails: state.selectedEmails.includes(id)
      ? state.selectedEmails.filter(emailId => emailId !== id)
      : [...state.selectedEmails, id]
  })),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setFilter: (filter) => set({ filter }),
  
  clearFilter: () => set({ filter: {} }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),

  getFilteredEmails: () => {
    const { emails, searchQuery, filter, currentFolder } = get();
    
    return emails.filter(email => {
      // Folder filter
      if (filter.folder || currentFolder) {
        const targetFolder = filter.folder || currentFolder;
        if (email.folder !== targetFolder) return false;
      }
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSubject = email.subject.toLowerCase().includes(query);
        const matchesFrom = email.from.name.toLowerCase().includes(query) || 
                           email.from.email.toLowerCase().includes(query);
        const matchesBody = email.body.toLowerCase().includes(query);
        
        if (!matchesSubject && !matchesFrom && !matchesBody) return false;
      }
      
      // Other filters
      if (filter.isRead !== undefined && email.isRead !== filter.isRead) return false;
      if (filter.isImportant !== undefined && email.isImportant !== filter.isImportant) return false;
      if (filter.isFlagged !== undefined && email.isFlagged !== filter.isFlagged) return false;
      if (filter.from && !email.from.name.toLowerCase().includes(filter.from.toLowerCase()) && 
          !email.from.email.toLowerCase().includes(filter.from.toLowerCase())) return false;
      if (filter.opportunityId && email.opportunityId !== filter.opportunityId) return false;
      if (filter.clientId && email.clientId !== filter.clientId) return false;
      if (filter.attachments !== undefined) {
        const hasAttachments = email.attachments && email.attachments.length > 0;
        if (filter.attachments !== hasAttachments) return false;
      }
      
      return true;
    });
  },

  getEmailsByFolder: (folder) => {
    const { emails } = get();
    return emails.filter(email => email.folder === folder);
  },

  getEmailsByOpportunity: (opportunityId) => {
    const { emails } = get();
    return emails.filter(email => email.opportunityId === opportunityId);
  },

  getEmailsByClient: (clientId) => {
    const { emails } = get();
    return emails.filter(email => email.clientId === clientId);
  },

  getUnreadCount: (folder) => {
    const { emails } = get();
    const targetEmails = folder ? emails.filter(email => email.folder === folder) : emails;
    return targetEmails.filter(email => !email.isRead).length;
  },
}));
