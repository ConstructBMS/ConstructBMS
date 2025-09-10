import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../app/providers/ThemeProvider';
import { AppRoutes } from '../app/routes';

import { vi } from 'vitest';

// Mock the lazy-loaded components
vi.mock('../modules/dashboard/DashboardPage', () => ({
  default: () => <div data-testid='dashboard-page'>Dashboard</div>,
}));

vi.mock('../modules/settings/SettingsPage', () => ({
  default: () => <div data-testid='settings-page'>Settings</div>,
}));

vi.mock('../modules/contacts/ContactsPage', () => ({
  default: () => <div data-testid='contacts-page'>Contacts</div>,
}));

vi.mock('../modules/projects/ProjectsPage', () => ({
  default: () => <div data-testid='projects-page'>Projects</div>,
}));

// Mock the Guard component to always render children
vi.mock('../lib/permissions/Guard', () => ({
  Guard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (
  ui: React.ReactElement,
  initialEntries: string[] = ['/']
) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Route Smoke Tests', () => {
  it('should render Dashboard page', () => {
    renderWithProviders(<AppRoutes />, ['/dashboard']);
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render Settings page', () => {
    renderWithProviders(<AppRoutes />, ['/settings']);
    expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render Contacts page', () => {
    renderWithProviders(<AppRoutes />, ['/contacts']);
    expect(screen.getByTestId('contacts-page')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
  });

  it('should render Projects page', () => {
    renderWithProviders(<AppRoutes />, ['/projects']);
    expect(screen.getByTestId('projects-page')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('should redirect root to dashboard', () => {
    renderWithProviders(<AppRoutes />, ['/']);
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });
});
