import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import Dashboard from './pages/Dashboard';
import FooterBuilder from './pages/FooterBuilder';
import GeneralSettings from './pages/GeneralSettings';
import Login from './pages/Login';
import ProgrammeManager from './pages/ProgrammeManager';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import UsersAndRoles from './pages/UsersAndRoles';

// Placeholder components for other pages
const Calendar = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Calendar
    </h1>
    <p style={{ color: '#f9fafb' }}>Calendar functionality coming soon...</p>
  </div>
);
const Tasks = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Tasks
    </h1>
    <p style={{ color: '#f9fafb' }}>Task management coming soon...</p>
  </div>
);
const Notes = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Notes
    </h1>
    <p style={{ color: '#f9fafb' }}>Notes functionality coming soon...</p>
  </div>
);
const Procurement = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Procurement
    </h1>
    <p style={{ color: '#f9fafb' }}>Procurement management coming soon...</p>
  </div>
);
const Support = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Support
    </h1>
    <p style={{ color: '#f9fafb' }}>Support system coming soon...</p>
  </div>
);

// CRM pages
const Clients = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Clients
    </h1>
    <p style={{ color: '#f9fafb' }}>Client management coming soon...</p>
  </div>
);
const Contractors = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Contractors
    </h1>
    <p style={{ color: '#f9fafb' }}>Contractor management coming soon...</p>
  </div>
);
const Consultants = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Consultants
    </h1>
    <p style={{ color: '#f9fafb' }}>Consultant management coming soon...</p>
  </div>
);

// Communications pages
const Email = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Email
    </h1>
    <p style={{ color: '#f9fafb' }}>Email system coming soon...</p>
  </div>
);
const Messenger = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Messenger
    </h1>
    <p style={{ color: '#f9fafb' }}>Messenger functionality coming soon...</p>
  </div>
);

// Projects pages
const ProgrammeManagerComponent = () => <ProgrammeManager />;

// Opportunities pages
const SalesPipeline = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Sales Pipeline
    </h1>
    <p style={{ color: '#f9fafb' }}>Sales pipeline management coming soon...</p>
  </div>
);

// Document Hub pages
const Library = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Document Library
    </h1>
    <p style={{ color: '#f9fafb' }}>Document library coming soon...</p>
  </div>
);
const DocumentBuilder = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Document Builder
    </h1>
    <p style={{ color: '#f9fafb' }}>Document builder coming soon...</p>
  </div>
);

// Settings pages
const MenuBuilder = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Menu Builder
    </h1>
    <p style={{ color: '#f9fafb' }}>Menu builder coming soon...</p>
  </div>
);
const Modules = () => (
  <div className='p-6 dark-theme'>
    <h1 className='text-2xl font-bold mb-4' style={{ color: '#1f2937' }}>
      Modules
    </h1>
    <p style={{ color: '#f9fafb' }}>Module management coming soon...</p>
  </div>
);

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route
              path='/'
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to='/dashboard' replace />} />
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='calendar' element={<Calendar />} />
              <Route path='tasks' element={<Tasks />} />
              <Route path='notes' element={<Notes />} />
              <Route path='procurement' element={<Procurement />} />
              <Route path='support' element={<Support />} />

              {/* CRM Routes */}
              <Route path='crm'>
                <Route path='clients' element={<Clients />} />
                <Route path='contractors' element={<Contractors />} />
                <Route path='consultants' element={<Consultants />} />
              </Route>

              {/* Communications Routes */}
              <Route path='communications'>
                <Route path='email' element={<Email />} />
                <Route path='messenger' element={<Messenger />} />
              </Route>

              {/* Projects Routes */}
              <Route path='projects'>
                <Route index element={<Projects />} />
                <Route
                  path='programme-manager'
                  element={<ProgrammeManagerComponent />}
                />
              </Route>

              {/* Opportunities Routes */}
              <Route path='opportunities'>
                <Route path='pipeline' element={<SalesPipeline />} />
              </Route>

              {/* Document Hub Routes */}
              <Route path='documents'>
                <Route path='library' element={<Library />} />
                <Route path='builder' element={<DocumentBuilder />} />
              </Route>

              {/* Settings Routes */}
              <Route path='settings'>
                <Route index element={<Settings />} />
                <Route path='general' element={<GeneralSettings />} />
                <Route path='users-and-roles' element={<UsersAndRoles />} />
                <Route
                  path='users'
                  element={<Navigate to='/settings/users-and-roles' replace />}
                />
                <Route path='menu' element={<MenuBuilder />} />
                <Route path='modules' element={<Modules />} />
                <Route path='footer-builder' element={<FooterBuilder />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
