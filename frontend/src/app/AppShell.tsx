import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { DemoModeBanner } from '../components/DemoModeBanner';
import Footer from '../components/Footer';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext.tsx';
import type { KeyboardShortcut } from '../lib/types/core';
import { loadDefaultRoles } from '../modules/permissions/store';
import { chatNotificationsService } from '../services/chat-notifications.service';
import { AppRoutes } from './routes';
import { useFooterStore } from './store/ui/footer.store';
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
  const { config: footerConfig } = useFooterStore();

  // Initialize chat notifications service
  useEffect(() => {
    chatNotificationsService.initialize();
  }, []);

  // Ensure scroll position is at top when layout mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Demo Mode Banner */}
      <DemoModeBanner />

      <div className='flex-1 grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]'>
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

      {/* Footer */}
      {footerConfig && (
        <div className='flex-shrink-0'>
          <Footer config={footerConfig} />
        </div>
      )}
    </div>
  );
}

// Create router with future flags to suppress v7 warnings
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: AppRoutes,
    },
  ],
  {
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
  }
);

export function AppShell() {
  // Initialize default permission rules on app startup
  useEffect(() => {
    loadDefaultRoles().catch(error => {
      console.error('Failed to load default permission roles:', error);
    });
  }, []);

  // Ensure page starts at top on refresh
  useEffect(() => {
    // Disable browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Also scroll to top when the page becomes visible (handles refresh)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    // Handle page load events
    const handlePageLoad = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Handle beforeunload to prevent scroll position saving
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('load', handlePageLoad);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('load', handlePageLoad);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
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
