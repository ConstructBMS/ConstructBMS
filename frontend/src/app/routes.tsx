import { Suspense, lazy } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { Guard } from '../lib/permissions/Guard';

// Lazy load all pages
const DashboardPage = lazy(() => import('../modules/dashboard/DashboardPage'));
const NotesPage = lazy(() => import('../modules/notes/NotesPage'));
const ChatPage = lazy(() => import('../modules/chat/ChatPage'));
const PortalPage = lazy(() => import('../modules/portal/PortalPage'));
const ContactsPage = lazy(() => import('../modules/contacts/ContactsPage'));
const ClientsPage = lazy(() => import('../modules/contacts/pages/ClientsPage'));
const ContractorsPage = lazy(
  () => import('../modules/contacts/pages/ContractorsPage')
);
const ConsultantsPage = lazy(
  () => import('../modules/contacts/pages/ConsultantsPage')
);
const ProjectsDashboard = lazy(
  () => import('../modules/projects/ProjectsDashboard')
);
const ProjectsPage = lazy(() => import('../modules/projects/ProjectsPage'));
const ProjectDetailPage = lazy(
  () => import('../modules/projects/ProjectDetailPage')
);
const ProgrammePage = lazy(() => import('../modules/programme/ProgrammePage'));
const DocumentsPage = lazy(() => import('../modules/documents/DocumentsPage'));
const WorkflowsPage = lazy(() => import('../modules/workflows/WorkflowsPage'));
const PipelinePage = lazy(() => import('../modules/pipeline/PipelinePage'));
const EstimatesPage = lazy(() => import('../modules/estimates/EstimatesPage'));
const PurchaseOrdersPage = lazy(
  () => import('../modules/purchaseOrders/PurchaseOrdersPage')
);
const SettingsPage = lazy(() => import('../modules/settings/SettingsPage'));
const FooterBuilder = lazy(() => import('../pages/FooterBuilder'));
const LoginPage = lazy(() => import('../pages/Login'));

// Loading component
const LoadingSpinner = () => (
  <div className='flex items-center justify-center h-64'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
  </div>
);

// Wrapper component for lazy-loaded routes
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

// 404 component
const NotFound = () => (
  <div className='flex flex-col items-center justify-center h-64 space-y-4'>
    <h1 className='text-4xl font-bold text-foreground'>404</h1>
    <p className='text-muted-foreground'>Page not found</p>
    <Link to='/dashboard' className='text-primary hover:underline'>
      Go back to Dashboard
    </Link>
  </div>
);

// Export routes in v7 format
const AppRoutes = [
  {
    path: '/',
    element: <Navigate to='/dashboard' replace />,
  },
  {
    path: '/dashboard',
    element: (
      <LazyRoute>
        <DashboardPage />
      </LazyRoute>
    ),
  },
  {
    path: '/dashboard-home',
    element: (
      <LazyRoute>
        <DashboardPage />
      </LazyRoute>
    ),
  },
  {
    path: '/dashboard-financial',
    element: (
      <LazyRoute>
        <DashboardPage />
      </LazyRoute>
    ),
  },
  {
    path: '/notes',
    element: (
      <LazyRoute>
        <NotesPage />
      </LazyRoute>
    ),
  },
  {
    path: '/chat',
    element: (
      <LazyRoute>
        <ChatPage />
      </LazyRoute>
    ),
  },
  {
    path: '/portal',
    element: (
      <LazyRoute>
        <PortalPage />
      </LazyRoute>
    ),
  },
  {
    path: '/contacts',
    element: (
      <LazyRoute>
        <ContactsPage />
      </LazyRoute>
    ),
  },
  {
    path: '/contacts/clients',
    element: (
      <LazyRoute>
        <ClientsPage />
      </LazyRoute>
    ),
  },
  {
    path: '/contacts/contractors',
    element: (
      <LazyRoute>
        <ContractorsPage />
      </LazyRoute>
    ),
  },
  {
    path: '/contacts/consultants',
    element: (
      <LazyRoute>
        <ConsultantsPage />
      </LazyRoute>
    ),
  },
  {
    path: '/projects',
    element: (
      <LazyRoute>
        <ProjectsDashboard />
      </LazyRoute>
    ),
  },
  {
    path: '/projects/management',
    element: (
      <LazyRoute>
        <ProjectsPage />
      </LazyRoute>
    ),
  },
  {
    path: '/projects/:id',
    element: (
      <LazyRoute>
        <ProjectDetailPage />
      </LazyRoute>
    ),
  },
  {
    path: '/projects/programme',
    element: (
      <LazyRoute>
        <ProgrammePage />
      </LazyRoute>
    ),
  },
  {
    path: '/documents',
    element: (
      <LazyRoute>
        <DocumentsPage />
      </LazyRoute>
    ),
  },
  {
    path: '/workflows',
    element: (
      <LazyRoute>
        <WorkflowsPage />
      </LazyRoute>
    ),
  },
  {
    path: '/pipeline',
    element: (
      <LazyRoute>
        <PipelinePage />
      </LazyRoute>
    ),
  },
  {
    path: '/estimates',
    element: (
      <LazyRoute>
        <EstimatesPage />
      </LazyRoute>
    ),
  },
  {
    path: '/purchase-orders',
    element: (
      <LazyRoute>
        <PurchaseOrdersPage />
      </LazyRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <LazyRoute>
        <SettingsPage />
      </LazyRoute>
    ),
  },
  {
    path: '/footer-builder',
    element: (
      <LazyRoute>
        <FooterBuilder />
      </LazyRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <LazyRoute>
        <LoginPage />
      </LazyRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

// Export the routes
export { AppRoutes };

// Legacy component for backward compatibility (if needed)
export function AppRoutesComponent() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Dashboard */}
        <Route path='/' element={<Navigate to='/dashboard' replace />} />
        <Route path='/dashboard' element={<DashboardPage />} />

        {/* Core Modules */}
        <Route path='/notes' element={<NotesPage />} />
        <Route path='/chat' element={<ChatPage />} />
        <Route path='/portal' element={<PortalPage />} />
        <Route
          path='/contacts'
          element={
            <Guard resource='contacts' action='read'>
              <ContactsPage />
            </Guard>
          }
        />
        <Route
          path='/contacts/clients'
          element={
            <Guard resource='contacts' action='read'>
              <ClientsPage />
            </Guard>
          }
        />
        <Route
          path='/contacts/contractors'
          element={
            <Guard resource='contacts' action='read'>
              <ContractorsPage />
            </Guard>
          }
        />
        <Route
          path='/contacts/consultants'
          element={
            <Guard resource='contacts' action='read'>
              <ConsultantsPage />
            </Guard>
          }
        />

        {/* Projects */}
        <Route path='/projects' element={<ProjectsPage />} />
        <Route path='/projects/:id' element={<ProjectDetailPage />} />
        <Route path='/projects/programme' element={<ProgrammePage />} />

        {/* Business Modules */}
        <Route path='/documents' element={<DocumentsPage />} />
        <Route path='/workflows' element={<WorkflowsPage />} />
        <Route path='/pipeline' element={<PipelinePage />} />
        <Route path='/estimates' element={<EstimatesPage />} />
        <Route path='/purchase-orders' element={<PurchaseOrdersPage />} />

        {/* Settings */}
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/footer-builder' element={<FooterBuilder />} />

        {/* Authentication */}
        <Route path='/login' element={<LoginPage />} />

        {/* 404 - Catch all */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
