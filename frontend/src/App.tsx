import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Placeholder components for other pages
const Calendar = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Calendar</h1><p>Calendar functionality coming soon...</p></div>;
const Tasks = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Tasks</h1><p>Task management coming soon...</p></div>;
const Notes = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Notes</h1><p>Notes functionality coming soon...</p></div>;
const Procurement = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Procurement</h1><p>Procurement management coming soon...</p></div>;
const Support = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Support</h1><p>Support system coming soon...</p></div>;

// CRM pages
const Clients = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Clients</h1><p>Client management coming soon...</p></div>;
const Contractors = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Contractors</h1><p>Contractor management coming soon...</p></div>;
const Consultants = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Consultants</h1><p>Consultant management coming soon...</p></div>;

// Communications pages
const Email = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Email</h1><p>Email system coming soon...</p></div>;
const Messenger = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Messenger</h1><p>Messenger functionality coming soon...</p></div>;

// Projects pages
const Projects = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Projects</h1><p>Project management coming soon...</p></div>;
const ProjectPlanner = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Project Planner</h1><p>Project planning tools coming soon...</p></div>;

// Opportunities pages
const SalesPipeline = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Sales Pipeline</h1><p>Sales pipeline management coming soon...</p></div>;

// Document Hub pages
const Library = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Document Library</h1><p>Document library coming soon...</p></div>;
const DocumentBuilder = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Document Builder</h1><p>Document builder coming soon...</p></div>;

// Settings pages
const GeneralSettings = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">General Settings</h1><p>General settings coming soon...</p></div>;
const UsersRoles = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Users & Roles</h1><p>User and role management coming soon...</p></div>;
const MenuBuilder = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Menu Builder</h1><p>Menu builder coming soon...</p></div>;
const Modules = () => <div className="p-6"><h1 className="text-2xl font-bold mb-4">Modules</h1><p>Module management coming soon...</p></div>;

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="notes" element={<Notes />} />
            <Route path="procurement" element={<Procurement />} />
            <Route path="support" element={<Support />} />
            
            {/* CRM Routes */}
            <Route path="crm">
              <Route path="clients" element={<Clients />} />
              <Route path="contractors" element={<Contractors />} />
              <Route path="consultants" element={<Consultants />} />
            </Route>
            
            {/* Communications Routes */}
            <Route path="communications">
              <Route path="email" element={<Email />} />
              <Route path="messenger" element={<Messenger />} />
            </Route>
            
            {/* Projects Routes */}
            <Route path="projects">
              <Route index element={<Projects />} />
              <Route path="planner" element={<ProjectPlanner />} />
            </Route>
            
            {/* Opportunities Routes */}
            <Route path="opportunities">
              <Route path="pipeline" element={<SalesPipeline />} />
            </Route>
            
            {/* Document Hub Routes */}
            <Route path="documents">
              <Route path="library" element={<Library />} />
              <Route path="builder" element={<DocumentBuilder />} />
            </Route>
            
            {/* Settings Routes */}
            <Route path="settings">
              <Route path="general" element={<GeneralSettings />} />
              <Route path="users" element={<UsersRoles />} />
              <Route path="menu" element={<MenuBuilder />} />
              <Route path="modules" element={<Modules />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
