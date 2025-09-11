import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, startTransition } from 'react';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { AuthProvider } from '../contexts/AuthContext';
import type { KeyboardShortcut } from '../lib/types/core';
import { ThemeProvider } from '../contexts/ThemeContext.tsx';
import { loadDefaultRoles } from '../modules/permissions/store';
import { AppRoutes } from './routes';
import { useSidebarStore } from './store/ui/sidebar.store';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});


function AppLayout() {
  const { toggle } = useSidebarStore();

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'b',
      metaKey: true,
      action: toggle,
      description: 'Toggle sidebar',
    },
    {
      key: 'k',
      metaKey: true,
      action: () => {
        const searchInput = document.querySelector(
          'input[type="search"]'
        ) as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Focus global search',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const isMetaKey =
          (event.metaKey && shortcut.metaKey) ||
          (event.ctrlKey && shortcut.ctrlKey);
        const isShiftKey = event.shiftKey === !!shortcut.shiftKey;
        const isAltKey = event.altKey === !!shortcut.altKey;
        const isKey = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (isMetaKey && isShiftKey && isAltKey && isKey) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <div className='min-h-screen bg-background'>
      <div className='grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] h-screen'>
        {/* Sidebar */}
        <div className='row-span-2'>
          <Sidebar />
        </div>

        {/* Topbar */}
        <div className='col-start-2'>
          <Topbar />
        </div>

        {/* Main Content */}
        <main className='col-start-2 row-start-2 overflow-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Create router with future flags to suppress v7 warnings
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: AppRoutes,
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
  // Additional configuration to ensure future flags are applied
  basename: '',
  window: undefined,
});

export function AppShell() {
  // Initialize default permission rules on app startup
  useEffect(() => {
    loadDefaultRoles().catch(error => {
      console.error('Failed to load default permission roles:', error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
