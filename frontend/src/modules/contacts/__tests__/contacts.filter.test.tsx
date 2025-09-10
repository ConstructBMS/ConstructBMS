import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../../../app/providers/ThemeProvider';
import ClientsPage from '../pages/ClientsPage';
import ContractorsPage from '../pages/ContractorsPage';
import ConsultantsPage from '../pages/ConsultantsPage';
import { useContactsStore } from '../store';

import { vi } from 'vitest';

// Mock the contacts store
vi.mock('../store', () => ({
  useContactsStore: vi.fn(),
}));

// Mock the Page component
vi.mock('../../../components/layout/Page', () => ({
  Page: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid='page'>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// Mock the ContactsList and ContactsGrid components
vi.mock('../ContactsList', () => ({
  ContactsList: ({ contacts }: { contacts: any[] }) => (
    <div data-testid='contacts-list'>
      {contacts.map(contact => (
        <div key={contact.id} data-testid={`contact-${contact.id}`}>
          {contact.name} ({contact.category})
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../ContactsGrid', () => ({
  ContactsGrid: ({ contacts }: { contacts: any[] }) => (
    <div data-testid='contacts-grid'>
      {contacts.map(contact => (
        <div key={contact.id} data-testid={`contact-${contact.id}`}>
          {contact.name} ({contact.category})
        </div>
      ))}
    </div>
  ),
}));

const mockUseContactsStore = useContactsStore as any;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Contacts Filter Tests', () => {
  const mockContacts = [
    { id: '1', name: 'Client Company', category: 'client', type: 'company' },
    { id: '2', name: 'John Client', category: 'client', type: 'person' },
    {
      id: '3',
      name: 'Contractor Corp',
      category: 'contractor',
      type: 'company',
    },
    {
      id: '4',
      name: 'Jane Contractor',
      category: 'contractor',
      type: 'person',
    },
    {
      id: '5',
      name: 'Consultant LLC',
      category: 'consultant',
      type: 'company',
    },
    { id: '6', name: 'Bob Consultant', category: 'consultant', type: 'person' },
  ];

  const mockCompanies = [
    { id: '7', name: 'Client Corp', category: 'client' },
    { id: '8', name: 'Contractor Inc', category: 'contractor' },
    { id: '9', name: 'Consultant Group', category: 'consultant' },
  ];

  beforeEach(() => {
    mockUseContactsStore.mockReturnValue({
      viewMode: 'list' as const,
      contacts: mockContacts,
      companies: mockCompanies,
    } as any);
  });

  describe('ClientsPage', () => {
    it('should filter and display only clients', () => {
      renderWithProviders(<ClientsPage />);

      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(
        screen.getByText('Manage your client contacts and companies (4 total)')
      ).toBeInTheDocument();

      // Should show client contacts and companies
      expect(screen.getByTestId('contact-1')).toBeInTheDocument();
      expect(screen.getByTestId('contact-2')).toBeInTheDocument();
      expect(screen.getByTestId('contact-7')).toBeInTheDocument();

      // Should not show non-client contacts
      expect(screen.queryByTestId('contact-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-4')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-5')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-6')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-8')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-9')).not.toBeInTheDocument();
    });

    it('should show empty state when no clients', () => {
      mockUseContactsStore.mockReturnValue({
        viewMode: 'list' as const,
        contacts: [],
        companies: [],
      } as any);

      renderWithProviders(<ClientsPage />);

      expect(screen.getByText('No clients found.')).toBeInTheDocument();
      expect(
        screen.getByText('Add your first client to get started.')
      ).toBeInTheDocument();
    });
  });

  describe('ContractorsPage', () => {
    it('should filter and display only contractors', () => {
      renderWithProviders(<ContractorsPage />);

      expect(screen.getByText('Contractors')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Manage your contractor contacts and companies (4 total)'
        )
      ).toBeInTheDocument();

      // Should show contractor contacts and companies
      expect(screen.getByTestId('contact-3')).toBeInTheDocument();
      expect(screen.getByTestId('contact-4')).toBeInTheDocument();
      expect(screen.getByTestId('contact-8')).toBeInTheDocument();

      // Should not show non-contractor contacts
      expect(screen.queryByTestId('contact-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-5')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-6')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-7')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-9')).not.toBeInTheDocument();
    });
  });

  describe('ConsultantsPage', () => {
    it('should filter and display only consultants', () => {
      renderWithProviders(<ConsultantsPage />);

      expect(screen.getByText('Consultants')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Manage your consultant contacts and companies (4 total)'
        )
      ).toBeInTheDocument();

      // Should show consultant contacts and companies
      expect(screen.getByTestId('contact-5')).toBeInTheDocument();
      expect(screen.getByTestId('contact-6')).toBeInTheDocument();
      expect(screen.getByTestId('contact-9')).toBeInTheDocument();

      // Should not show non-consultant contacts
      expect(screen.queryByTestId('contact-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-4')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-7')).not.toBeInTheDocument();
      expect(screen.queryByTestId('contact-8')).not.toBeInTheDocument();
    });
  });

  describe('View Mode Switching', () => {
    it('should render list view when viewMode is list', () => {
      mockUseContactsStore.mockReturnValue({
        viewMode: 'list' as const,
        contacts: mockContacts,
        companies: mockCompanies,
      } as any);

      renderWithProviders(<ClientsPage />);

      expect(screen.getByTestId('contacts-list')).toBeInTheDocument();
      expect(screen.queryByTestId('contacts-grid')).not.toBeInTheDocument();
    });

    it('should render grid view when viewMode is grid', () => {
      mockUseContactsStore.mockReturnValue({
        viewMode: 'grid' as const,
        contacts: mockContacts,
        companies: mockCompanies,
      } as any);

      renderWithProviders(<ClientsPage />);

      expect(screen.getByTestId('contacts-grid')).toBeInTheDocument();
      expect(screen.queryByTestId('contacts-list')).not.toBeInTheDocument();
    });
  });
});
