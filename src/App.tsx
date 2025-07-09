import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { EmailProvider, useEmail } from './contexts/EmailContext';
import { MenuProvider } from './contexts/MenuContext';
import { LogoProvider } from './contexts/LogoContext';
import { ChatProvider } from './contexts/ChatContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CRM from './components/modules/CRM';
import Tasks from './components/modules/Tasks';
import Projects from './components/modules/Projects';
import Chat from './components/modules/Chat';
import ChatNotificationBadge from './components/ChatNotificationBadge';
import DocumentHub from './components/modules/DocumentHub';
import DocumentBuilder from './components/modules/DocumentBuilder';

import DocumentControlCentre from './components/modules/E-Signature';
import Estimating from './components/modules/Estimating';
import Roadmap from './components/modules/Roadmap';
import SidebarSettings from './components/modules/SidebarSettings';
import ActivityStream from './components/modules/ActivityStream';
import SiteTools from './components/modules/SiteTools';
import Procurement from './components/modules/Procurement';
import Collaboration from './components/modules/Collaboration';
import Messenger from './components/modules/Messenger';
import Notifications from './components/modules/Notifications';
import Backup from './components/modules/Backup';
import UsersRoles from './components/modules/Users';
import KnowledgeBase from './components/modules/KnowledgeBase';
import Support from './components/modules/Support';
import CalendarModule from './components/modules/Calendar';
import Finance from './components/modules/Finance';
import Contracts from './components/modules/Contracts';
import HR from './components/modules/HR';
import PAYE from './components/modules/PAYE';
import Marketing from './components/modules/Marketing';
import EmailClient from './components/modules/EmailClient';
import Agile from './components/modules/Agile';
import TopBar from './components/TopBar';
import GeneralSettings from './components/modules/GeneralSettings';
import LoginForm from './components/auth/LoginForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import UserManagement from './components/modules/UserManagement';
import Analytics from './components/modules/Analytics';
import MenuBuilder from './components/MenuBuilder';
import ModulesPage from './components/ModulesPage';
import SignUpForm from './components/auth/SignUpForm';
import LandingPage from './components/LandingPage';
import RolesPermissionsMatrix from './components/modules/RolesPermissionsMatrix';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { unreadCount } = useEmail();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    // Update URL to reflect the active module
    navigate(`/${module}`);
  };

  // Sync activeModule with URL on initial load and URL changes
  useEffect(() => {
    const path = location.pathname.substring(1); // Remove leading slash
    if (path === '') {
      // Root path, redirect to dashboard
      navigate('/dashboard');
      setActiveModule('dashboard');
    } else if (path && path !== activeModule) {
      setActiveModule(path);
    }
  }, [location.pathname, navigate]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Keep sidebar collapsed on mobile by default
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-collapse sidebar when changing modules on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [activeModule, isMobile]);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
      case 'quick-start':
      case 'main-dashboard':
      case 'activity-stream':
        return (
          <Dashboard
            onNavigateToModule={setActiveModule}
            activeModule={activeModule}
          />
        );
      case 'crm':
        return <CRM />;
      case 'customers':
        return <CRM activeModule='customers' />;
      case 'contractors':
        return <CRM activeModule='contractors' />;
      case 'sales':
        return <CRM activeModule='sales' />;
      case 'signature':
        return <DocumentControlCentre />;
      case 'tasks':
        return <Tasks />;
      case 'estimating':
        return <Estimating />;
      case 'site-tools':
        return <SiteTools />;
      case 'procurement':
        return <Procurement />;
      case 'collaboration':
        return <Collaboration />;
      case 'chat':
        return <Chat />;
      case 'notifications':
        return <Notifications />;
      case 'backup':
        return <Backup />;
      case 'users':
        return <UserManagement />;
      case 'users-roles':
        return <UserManagement />;
      case 'help':
        return <KnowledgeBase />;
      case 'support':
        return <Support />;
      case 'calendar':
        return <CalendarModule />;
      case 'finance':
        return <Finance />;
      case 'contracts':
        return <Contracts />;
      case 'hr':
        return <HR />;
      case 'paye':
        return <PAYE />;
      case 'marketing':
        return <Marketing />;
      case 'email':
        return <EmailClient />;
      case 'agile':
        return <Agile />;
      case 'projects':
        return <Projects />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SidebarSettings />;
      case 'document-hub':
        return <DocumentHub onNavigateToModule={setActiveModule} />;
      case 'document-hub-library':
      case 'library':
        return (
          <DocumentHub
            activeTab='library'
            onNavigateToModule={setActiveModule}
          />
        );
      case 'document-builder':
        return (
          <DocumentHub
            activeTab='builder'
            onNavigateToModule={setActiveModule}
          />
        );
      case 'document-hub-archive':
      case 'archive':
        return (
          <DocumentHub
            activeTab='archive'
            onNavigateToModule={setActiveModule}
          />
        );

      case 'sidebar-settings':
        return <SidebarSettings />;
      case 'roadmap':
        return <Roadmap />;
      case 'general-settings':
        return <GeneralSettings />;
      case 'user-management':
        return <RolesPermissionsMatrix defaultTab='users' />;
      case 'permissions':
        return <RolesPermissionsMatrix defaultTab='matrix' />;
      case 'system-permissions':
        return <RolesPermissionsMatrix />;
      case 'menu-builder':
        return <MenuBuilder />;
      case 'modules':
        return <ModulesPage />;
      case 'roles-permissions-matrix':
        return <RolesPermissionsMatrix />;
      default:
        return (
          <Dashboard
            onNavigateToModule={setActiveModule}
            activeModule={activeModule}
          />
        );
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='animate-spin rounded-full h-20 w-20 border-8 border-green-500 border-t-white shadow-lg'></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex safe-area-inset ios-accelerated'>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />
      <div className='flex-1 flex flex-col transition-all duration-300 max-w-full w-full main-content sidebar-ios-fix'>
        <TopBar
          activeModule={activeModule}
          onModuleChange={handleModuleChange}
          emailUnreadCount={unreadCount}
        />
        <main className='flex-1 p-2 sm:p-4 md:p-6 w-full max-w-full overflow-x-auto sidebar-ios-fix safe-area-inset'>
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
}

// Protected Route component to handle authentication redirects
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='animate-spin rounded-full h-20 w-20 border-8 border-green-500 border-t-white shadow-lg'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <EmailProvider>
            <MenuProvider>
              <LogoProvider>
                <ChatProvider>
                  <Routes>
                    <Route path='/' element={<LandingPage />} />
                    <Route
                      path='/auth/callback'
                      element={<ResetPasswordForm />}
                    />
                    <Route path='/login' element={<LoginForm />} />
                    <Route path='/signup' element={<SignUpForm />} />
                    <Route
                      path='*'
                      element={
                        <ProtectedRoute>
                          <AppContent />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </ChatProvider>
              </LogoProvider>
            </MenuProvider>
          </EmailProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
