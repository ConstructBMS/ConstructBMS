import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ContactsPage } from '../ContactsPage';

// Mock the contacts store
vi.mock('../store', () => ({
  useContactsStore: () => ({
    contacts: [
      {
        id: '1',
        type: 'person',
        category: 'client',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1-555-0123',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'person',
        category: 'contractor',
        name: 'Mike Wilson',
        email: 'mike@example.com',
        phone: '+1-555-0125',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        type: 'person',
        category: 'consultant',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1-555-0124',
        createdAt: new Date().toISOString(),
      },
    ],
    companies: [],
    addContact: vi.fn(),
    addCompany: vi.fn(),
    updateContact: vi.fn(),
    updateCompany: vi.fn(),
    removeContact: vi.fn(),
    removeCompany: vi.fn(),
    searchContacts: vi.fn(() => []),
    searchCompanies: vi.fn(() => []),
  }),
}));

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams],
  };
});

describe.skip('ContactsPage', () => {
  const renderContactsPage = () => {
    return render(
      <BrowserRouter>
        <ContactsPage />
      </BrowserRouter>
    );
  };

  it('renders the CRM Manager title', () => {
    renderContactsPage();
    expect(screen.getByText('CRM Manager')).toBeInTheDocument();
  });

  it('shows all contacts by default', () => {
    renderContactsPage();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Mike Wilson')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
  });

  it('shows all contacts by default (no URL filtering)', () => {
    renderContactsPage();

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Mike Wilson')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
  });

  it('has correct navigation links to contact type pages', () => {
    renderContactsPage();

    // Check that dashboard cards link to correct routes
    const clientLink = screen.getByRole('link', { name: /clients/i });
    const contractorLink = screen.getByRole('link', { name: /contractors/i });
    const consultantLink = screen.getByRole('link', { name: /consultants/i });

    expect(clientLink).toHaveAttribute('href', '/contacts/clients');
    expect(contractorLink).toHaveAttribute('href', '/contacts/contractors');
    expect(consultantLink).toHaveAttribute('href', '/contacts/consultants');
  });
});
