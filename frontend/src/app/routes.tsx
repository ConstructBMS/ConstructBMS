import React, { Suspense, lazy } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { Guard } from '../lib/permissions/Guard';

// Lazy load all pages
const DashboardPage = lazy(() => import('../modules/dashboard/DashboardPage'));
const NotesPage = lazy(() => import('../modules/notes/NotesPage'));
const ChatPage = lazy(() => import('../modules/chat/ChatPage'));
const PortalPage = lazy(() => import('../modules/portal/PortalPage'));
const ContactsPage = lazy(() => import('../modules/contacts/ContactsPage'));
const ProjectsPage = lazy(() => import('../modules/projects/ProjectsPage'));
const ProgrammePage = lazy(() => import('../modules/programme/ProgrammePage'));
const DocumentsPage = lazy(() => import('../modules/documents/DocumentsPage'));
const WorkflowsPage = lazy(() => import('../modules/workflows/WorkflowsPage'));
const PipelinePage = lazy(() => import('../modules/pipeline/PipelinePage'));
const EstimatesPage = lazy(() => import('../modules/estimates/EstimatesPage'));
const PurchaseOrdersPage = lazy(
  () => import('../modules/purchaseOrders/PurchaseOrdersPage')
);
const SettingsPage = lazy(() => import('../modules/settings/SettingsPage'));

// Loading component
const LoadingSpinner = () => (
  <div className='flex items-center justify-center h-64'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
  </div>
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

export function AppRoutes() {
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

        {/* Projects */}
        <Route path='/projects' element={<ProjectsPage />} />
        <Route path='/projects/programme' element={<ProgrammePage />} />

        {/* Business Modules */}
        <Route path='/documents' element={<DocumentsPage />} />
        <Route path='/workflows' element={<WorkflowsPage />} />
        <Route path='/pipeline' element={<PipelinePage />} />
        <Route path='/estimates' element={<EstimatesPage />} />
        <Route path='/purchase-orders' element={<PurchaseOrdersPage />} />

        {/* Settings */}
        <Route path='/settings' element={<SettingsPage />} />

        {/* 404 - Catch all */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
