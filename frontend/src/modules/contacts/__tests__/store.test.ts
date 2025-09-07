import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useContactsStore } from '../store';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Contacts Store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useContactsStore.setState({
      contacts: [],
      companies: [],
    });
    vi.clearAllMocks();
  });

  describe('addContact', () => {
    it('should add a new contact', () => {
      const contactData = {
        type: 'person' as const,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0123',
        notes: 'Test contact',
        tags: ['test'],
      };

      useContactsStore.getState().addContact(contactData);

      const contacts = useContactsStore.getState().contacts;
      expect(contacts).toHaveLength(1);
      expect(contacts[0]).toMatchObject({
        type: 'person',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0123',
        notes: 'Test contact',
        tags: ['test'],
      });
      expect(contacts[0].id).toBeDefined();
      expect(contacts[0].createdAt).toBeDefined();
    });

    it('should add a contact with company reference', () => {
      const companyData = {
        name: 'Test Company',
        email: 'test@company.com',
      };

      useContactsStore.getState().addCompany(companyData);
      const company = useContactsStore.getState().companies[0];

      const contactData = {
        type: 'person' as const,
        name: 'Jane Doe',
        companyId: company.id,
      };

      useContactsStore.getState().addContact(contactData);

      const contacts = useContactsStore.getState().contacts;
      expect(contacts).toHaveLength(1);
      expect(contacts[0].companyId).toBe(company.id);
    });
  });

  describe('addCompany', () => {
    it('should add a new company', () => {
      const companyData = {
        name: 'Test Company',
        email: 'test@company.com',
        phone: '+1-555-0100',
        website: 'https://testcompany.com',
        address: '123 Test St',
        notes: 'Test company',
        tags: ['test', 'company'],
      };

      useContactsStore.getState().addCompany(companyData);

      const companies = useContactsStore.getState().companies;
      expect(companies).toHaveLength(1);
      expect(companies[0]).toMatchObject({
        name: 'Test Company',
        email: 'test@company.com',
        phone: '+1-555-0100',
        website: 'https://testcompany.com',
        address: '123 Test St',
        notes: 'Test company',
        tags: ['test', 'company'],
      });
      expect(companies[0].id).toBeDefined();
      expect(companies[0].createdAt).toBeDefined();
    });
  });

  describe('updateContact', () => {
    it('should update an existing contact', () => {
      const contactData = {
        type: 'person' as const,
        name: 'John Doe',
        email: 'john@example.com',
      };

      useContactsStore.getState().addContact(contactData);
      const contact = useContactsStore.getState().contacts[0];

      useContactsStore.getState().updateContact(contact.id, {
        name: 'John Smith',
        phone: '+1-555-9999',
      });

      const updatedContact = useContactsStore.getState().contacts[0];
      expect(updatedContact.name).toBe('John Smith');
      expect(updatedContact.phone).toBe('+1-555-9999');
      expect(updatedContact.email).toBe('john@example.com'); // Should remain unchanged
    });

    it('should not update non-existent contact', () => {
      const initialContacts = useContactsStore.getState().contacts;

      useContactsStore.getState().updateContact('non-existent-id', {
        name: 'Updated Name',
      });

      expect(useContactsStore.getState().contacts).toEqual(initialContacts);
    });
  });

  describe('updateCompany', () => {
    it('should update an existing company', () => {
      const companyData = {
        name: 'Test Company',
        email: 'test@company.com',
      };

      useContactsStore.getState().addCompany(companyData);
      const company = useContactsStore.getState().companies[0];

      useContactsStore.getState().updateCompany(company.id, {
        name: 'Updated Company',
        website: 'https://updated.com',
      });

      const updatedCompany = useContactsStore.getState().companies[0];
      expect(updatedCompany.name).toBe('Updated Company');
      expect(updatedCompany.website).toBe('https://updated.com');
      expect(updatedCompany.email).toBe('test@company.com'); // Should remain unchanged
    });
  });

  describe('removeContact', () => {
    it('should remove an existing contact', () => {
      const contactData = {
        type: 'person' as const,
        name: 'John Doe',
      };

      useContactsStore.getState().addContact(contactData);
      const contact = useContactsStore.getState().contacts[0];

      useContactsStore.getState().removeContact(contact.id);

      expect(useContactsStore.getState().contacts).toHaveLength(0);
    });

    it('should not remove non-existent contact', () => {
      const initialContacts = useContactsStore.getState().contacts;

      useContactsStore.getState().removeContact('non-existent-id');

      expect(useContactsStore.getState().contacts).toEqual(initialContacts);
    });
  });

  describe('removeCompany', () => {
    it('should remove an existing company', () => {
      const companyData = {
        name: 'Test Company',
      };

      useContactsStore.getState().addCompany(companyData);
      const company = useContactsStore.getState().companies[0];

      useContactsStore.getState().removeCompany(company.id);

      expect(useContactsStore.getState().companies).toHaveLength(0);
    });
  });

  describe('getContact', () => {
    it('should return contact by id', () => {
      const contactData = {
        type: 'person' as const,
        name: 'John Doe',
      };

      useContactsStore.getState().addContact(contactData);
      const contact = useContactsStore.getState().contacts[0];

      const retrievedContact = useContactsStore
        .getState()
        .getContact(contact.id);
      expect(retrievedContact).toEqual(contact);
    });

    it('should return undefined for non-existent contact', () => {
      const retrievedContact = useContactsStore
        .getState()
        .getContact('non-existent-id');
      expect(retrievedContact).toBeUndefined();
    });
  });

  describe('getCompany', () => {
    it('should return company by id', () => {
      const companyData = {
        name: 'Test Company',
      };

      useContactsStore.getState().addCompany(companyData);
      const company = useContactsStore.getState().companies[0];

      const retrievedCompany = useContactsStore
        .getState()
        .getCompany(company.id);
      expect(retrievedCompany).toEqual(company);
    });
  });

  describe('getContactsByCompany', () => {
    it('should return contacts for a specific company', () => {
      const companyData = {
        name: 'Test Company',
      };

      useContactsStore.getState().addCompany(companyData);
      const company = useContactsStore.getState().companies[0];

      const contact1Data = {
        type: 'person' as const,
        name: 'John Doe',
        companyId: company.id,
      };

      const contact2Data = {
        type: 'person' as const,
        name: 'Jane Doe',
        companyId: company.id,
      };

      const contact3Data = {
        type: 'person' as const,
        name: 'Bob Smith',
        // No companyId
      };

      useContactsStore.getState().addContact(contact1Data);
      useContactsStore.getState().addContact(contact2Data);
      useContactsStore.getState().addContact(contact3Data);

      const companyContacts = useContactsStore
        .getState()
        .getContactsByCompany(company.id);
      expect(companyContacts).toHaveLength(2);
      expect(companyContacts.map(c => c.name)).toContain('John Doe');
      expect(companyContacts.map(c => c.name)).toContain('Jane Doe');
    });
  });

  describe('searchContacts', () => {
    it('should search contacts by name', () => {
      const contact1Data = {
        type: 'person' as const,
        name: 'John Doe',
        email: 'john@example.com',
      };

      const contact2Data = {
        type: 'person' as const,
        name: 'Jane Smith',
        email: 'jane@example.com',
      };

      useContactsStore.getState().addContact(contact1Data);
      useContactsStore.getState().addContact(contact2Data);

      const results = useContactsStore.getState().searchContacts('John');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('John Doe');
    });

    it('should search contacts by email', () => {
      const contactData = {
        type: 'person' as const,
        name: 'John Doe',
        email: 'john@example.com',
      };

      useContactsStore.getState().addContact(contactData);

      const results = useContactsStore.getState().searchContacts('example.com');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('John Doe');
    });

    it('should search contacts by tags', () => {
      const contactData = {
        type: 'person' as const,
        name: 'John Doe',
        tags: ['manager', 'senior'],
      };

      useContactsStore.getState().addContact(contactData);

      const results = useContactsStore.getState().searchContacts('manager');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('John Doe');
    });

    it('should return empty array for no matches', () => {
      const contactData = {
        type: 'person' as const,
        name: 'John Doe',
      };

      useContactsStore.getState().addContact(contactData);

      const results = useContactsStore
        .getState()
        .searchContacts('non-existent');
      expect(results).toHaveLength(0);
    });
  });

  describe('searchCompanies', () => {
    it('should search companies by name', () => {
      const company1Data = {
        name: 'TechCorp',
        email: 'info@techcorp.com',
      };

      const company2Data = {
        name: 'GreenBuild',
        email: 'info@greenbuild.com',
      };

      useContactsStore.getState().addCompany(company1Data);
      useContactsStore.getState().addCompany(company2Data);

      const results = useContactsStore.getState().searchCompanies('Tech');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('TechCorp');
    });

    it('should search companies by email', () => {
      const companyData = {
        name: 'TechCorp',
        email: 'info@techcorp.com',
      };

      useContactsStore.getState().addCompany(companyData);

      const results = useContactsStore
        .getState()
        .searchCompanies('techcorp.com');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('TechCorp');
    });
  });

  describe('persistence', () => {
    it('should persist data to localStorage', () => {
      const contactData = {
        type: 'person' as const,
        name: 'John Doe',
      };

      useContactsStore.getState().addContact(contactData);

      // The store should have called setItem on localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});
