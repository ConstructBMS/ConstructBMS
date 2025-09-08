import { create } from 'zustand';
import { Company, Contact } from '../../lib/types/contacts';

interface ContactsState {
  contacts: Contact[];
  companies: Company[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  removeCompany: (id: string) => void;
  getContact: (id: string) => Contact | undefined;
  getCompany: (id: string) => Company | undefined;
  getContactsByCompany: (companyId: string) => Contact[];
  searchContacts: (query: string) => Contact[];
  searchCompanies: (query: string) => Company[];
}

// Mock data for development
const mockContacts: Contact[] = [
  {
    id: '1',
    type: 'person',
    category: 'client',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1-555-0123',
    companyId: 'comp-1',
    notes: 'Project manager for the downtown office.',
    tags: ['manager', 'downtown'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'person',
    category: 'consultant',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1-555-0124',
    notes: 'Lead architect with 10+ years experience.',
    tags: ['architect', 'senior'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'company',
    category: 'contractor',
    name: 'ABC Construction',
    email: 'info@abcconstruction.com',
    phone: '+1-555-0200',
    website: 'https://abcconstruction.com',
    address: '123 Main St, City, State 12345',
    notes: 'General contractor specializing in commercial buildings.',
    tags: ['contractor', 'commercial'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    type: 'person',
    category: 'contractor',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    phone: '+1-555-0125',
    notes: 'Electrician with 15+ years experience.',
    tags: ['electrician', 'licensed'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    type: 'company',
    category: 'client',
    name: 'TechCorp Industries',
    email: 'contact@techcorp.com',
    phone: '+1-555-0201',
    website: 'https://techcorp.com',
    address: '456 Business Ave, City, State 12345',
    notes: 'Technology company building new headquarters.',
    tags: ['technology', 'headquarters'],
    createdAt: new Date().toISOString(),
  },
];

const mockCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'TechCorp Solutions',
    category: 'consultant',
    email: 'contact@techcorp.com',
    phone: '+1-555-0100',
    website: 'https://techcorp.com',
    address: '456 Tech Ave, Silicon Valley, CA 94000',
    notes: 'Technology consulting firm.',
    tags: ['technology', 'consulting'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comp-2',
    name: 'GreenBuild Inc',
    category: 'contractor',
    email: 'hello@greenbuild.com',
    phone: '+1-555-0200',
    website: 'https://greenbuild.com',
    address: '789 Eco St, Portland, OR 97200',
    notes: 'Sustainable construction company.',
    tags: ['sustainable', 'construction'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comp-3',
    name: 'Metro Development Group',
    category: 'client',
    email: 'info@metrodev.com',
    phone: '+1-555-0300',
    website: 'https://metrodev.com',
    address: '321 Urban Plaza, New York, NY 10001',
    notes: 'Real estate development company.',
    tags: ['real-estate', 'development'],
    createdAt: new Date().toISOString(),
  },
];

export const useContactsStore = create<ContactsState>()((set, get) => {
  console.log('🔍 Debug - Contacts store initialized with:', {
    contactsCount: mockContacts.length,
    companiesCount: mockCompanies.length,
    contacts: mockContacts.map(c => ({ name: c.name, category: c.category })),
    companies: mockCompanies.map(c => ({ name: c.name, category: c.category }))
  });

  return {
        contacts: mockContacts,
        companies: mockCompanies,

        addContact: contactData => {
        const newContact: Contact = {
          ...contactData,
          id: `contact-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          contacts: [...state.contacts, newContact],
        }));
      },

      updateContact: (id, updates) => {
        set(state => ({
          contacts: state.contacts.map(contact =>
            contact.id === id ? { ...contact, ...updates } : contact
          ),
        }));
      },

      removeContact: id => {
        set(state => ({
          contacts: state.contacts.filter(contact => contact.id !== id),
        }));
      },

      addCompany: companyData => {
        const newCompany: Company = {
          ...companyData,
          id: `comp-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          companies: [...state.companies, newCompany],
        }));
      },

      updateCompany: (id, updates) => {
        set(state => ({
          companies: state.companies.map(company =>
            company.id === id ? { ...company, ...updates } : company
          ),
        }));
      },

      removeCompany: id => {
        set(state => ({
          companies: state.companies.filter(company => company.id !== id),
        }));
      },

      getContact: id => {
        return get().contacts.find(contact => contact.id === id);
      },

      getCompany: id => {
        return get().companies.find(company => company.id === id);
      },

      getContactsByCompany: companyId => {
        return get().contacts.filter(
          contact => contact.companyId === companyId
        );
      },

      searchContacts: query => {
        const lowercaseQuery = query.toLowerCase();
        return get().contacts.filter(
          contact =>
            contact.name.toLowerCase().includes(lowercaseQuery) ||
            contact.email?.toLowerCase().includes(lowercaseQuery) ||
            contact.phone?.includes(query) ||
            contact.tags?.some(tag =>
              tag.toLowerCase().includes(lowercaseQuery)
            )
        );
      },

      searchCompanies: query => {
        const lowercaseQuery = query.toLowerCase();
        return get().companies.filter(
          company =>
            company.name.toLowerCase().includes(lowercaseQuery) ||
            company.email?.toLowerCase().includes(lowercaseQuery) ||
            company.phone?.includes(query) ||
            company.tags?.some(tag =>
              tag.toLowerCase().includes(lowercaseQuery)
            )
        );
      },
    };
});
