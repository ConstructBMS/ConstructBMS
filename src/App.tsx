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
import { ProgrammeUndoRedoProvider } from './contexts/ProgrammeUndoRedoContext';
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
import Changelog from './components/modules/Changelog';
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
import { TimelinePaneDemo } from './components/modules/Timeline';
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
import SalesPipeline from './components/modules/SalesPipeline';
import Notes from './components/modules/Notes';
import ProgrammeManager from './components/modules/ProgrammeManager';
import BaselineComprehensiveDemo from './components/modules/BaselineComprehensiveDemo';
import DemoModeIndicator from './components/DemoModeIndicator';
import DemoDataInitializer from './components/DemoDataInitializer';
import Footer from './components/Footer';
import { demoDataService } from './services/demoData';
import { loggingService } from './services/loggingService';
import { initializeDemoData, hasDemoData } from './utils/initializeDemoData';

// Placeholder component for Gantt functionality
const GanttPlaceholder: React.FC = () => (
  <div className='flex items-center justify-center h-64 text-gray-500'>
    <div className='text-center'>
      <h3 className='text-lg font-medium mb-2'>Gantt Chart</h3>
      <p className='text-sm'>
        Gantt functionality is available in the Programme Manager module.
      </p>
    </div>
  </div>
);

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { unreadCount } = useEmail();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle direct navigation to Programme Manager sub-routes
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    if (pathSegments[1] === 'programme-manager') {
      setActiveModule('programme-manager');
    }
  }, [location.pathname]);

  const handleModuleChange = (module: string, params?: Record<string, any>) => {
    setActiveModule(module);

    // Handle Programme Manager sub-routes
    if (module === 'programme-manager') {
      // If no specific tab is provided, default to home
      navigate('/programme-manager/home');
      return;
    }

    // Update URL to reflect the active module
    navigate(`/${module}`);

    // Handle specific parameters for opening items
    if (params?.['openProject']) {
      // Store the project data in sessionStorage for the Projects module to access
      sessionStorage.setItem(
        'openProject',
        JSON.stringify(params['openProject'])
      );
    }
    if (params?.['openTask']) {
      sessionStorage.setItem('openTask', JSON.stringify(params['openTask']));
    }
  };

  const handleNavigateToSettings = () => {
    setActiveModule('general-settings');
    navigate('/general-settings?tab=data');
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

  // Initialize demo data when authenticated and in demo mode
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if demo data was just cleared
      const wasJustCleared = sessionStorage.getItem('demo_data_just_cleared');
      if (wasJustCleared === 'true') {
        console.log('🚫 Demo data was just cleared, skipping initialization');
        return;
      }

      // Check demo mode status and initialize demo data
      const checkAndInitializeDemoData = async () => {
        try {
          const isInDemoMode = await demoDataService.isDemoMode();
          setIsDemoMode(isInDemoMode);
          if (isInDemoMode) {
            await demoDataService.ensureDemoDataExists();
          }
        } catch (error) {
          console.warn(
            'Failed to check demo mode or initialize demo data:',
            error
          );
        }
      };

      checkAndInitializeDemoData();
    }
  }, [isAuthenticated, user]);

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
    // Check if we're in Programme Manager and handle sub-routes
    if (activeModule === 'programme-manager') {
      const pathSegments = location.pathname.split('/');
      const subRoute = pathSegments[2]; // programme-manager/[subRoute]

      // If we have a sub-route, let the Programme Manager handle it
      if (
        subRoute &&
        [
          'file',
          'home',
          'project',
          'view',
          'allocation',
          '4d',
          'format',
        ].includes(subRoute)
      ) {
        return <ProgrammeManager onNavigateToModule={handleModuleChange} />;
      }

      // Default to home if no valid sub-route
      return <ProgrammeManager onNavigateToModule={handleModuleChange} />;
    }

    switch (activeModule) {
      case 'dashboard':
      case 'quick-start':
      case 'main-dashboard':
      case 'activity-stream':
        return (
          <Dashboard
            onNavigateToModule={handleModuleChange}
            activeModule={activeModule}
          />
        );
      case 'crm':
        return <CRM />;
      case 'crm-clients':
        return <CRM activeModule='crm-clients' />;
      case 'crm-consultants':
        return <CRM activeModule='crm-consultants' />;
      case 'crm-contractors':
        return <CRM activeModule='crm-contractors' />;
      case 'sales':
        return <CRM activeModule='sales' />;
      case 'sales-pipeline':
        return <SalesPipeline onNavigateToModule={setActiveModule} />;
      case 'gantt':
        return <GanttPlaceholder />;
      case 'notes':
        return <Notes onNavigateToModule={setActiveModule} />;
      case 'signature':
        return <DocumentControlCentre />;
      case 'tasks':
        return <Tasks />;
      case 'estimating':
        return <Estimating />;
      case 'site-tools':
        return <SiteTools />;
      case 'procurement':
        return <Procurement onNavigateToModule={setActiveModule} />;
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
      case 'timelinePane':
        return <TimelinePaneDemo />;
      case 'email':
        return <EmailClient />;
      case 'agile':
        return <Agile />;
      case 'projects':
        return <Projects />;
      case 'programme-manager':
        return <ProgrammeManager onNavigateToModule={handleModuleChange} />;
      case 'baseline-management':
        return <BaselineComprehensiveDemo />;
      case 'programme-manager/file':
        return <ProgrammeManager onNavigateToModule={handleModuleChange} />;
      case 'programme-manager/home':
        return <ProgrammeManager onNavigateToModule={handleModuleChange} />;
      case 'programme-manager/project':
        return <ProgrammeManager onNavigateToModule={handleModuleChange} />;
      case 'programme-manager/view':
        return <ProgrammeManager onNavigateToModule={handleModuleChange} />;
      case 'programme-manager/allocation':
        return <ProgrammeManager onNavigateToModule={handleModuleChange} />;
      case 'programme-manager/4d':
        return <ProgrammeManager onNavigateToModule={handleModuleChange} />;
      case 'programme-manager/format':
        return <ProgrammeManager onNavigateToModule={handleModuleChange} />;
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
      case 'changelog':
        return <Changelog />;
      case 'general-settings':
        return <GeneralSettings onModuleChange={handleModuleChange} />;
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
            onNavigateToModule={handleModuleChange}
            activeModule={activeModule}
          />
        );
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='animate-spin rounded-full h-20 w-20 border-8 border-accent border-t-white shadow-lg'></div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col safe-area-inset ios-accelerated'>
      <DemoModeIndicator
        isDemoMode={isDemoMode}
        onNavigateToSettings={handleNavigateToSettings}
      />
      <div className='flex flex-1'>
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
          <main className='flex-1 p-2 sm:p-4 md:p-6 w-full max-w-full sidebar-ios-fix safe-area-inset'>
            <ProgrammeUndoRedoProvider projectId='default'>
              {renderActiveModule()}
            </ProgrammeUndoRedoProvider>
          </main>
        </div>
      </div>
      <Footer onNavigateToModule={setActiveModule} />
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
        <div className='animate-spin rounded-full h-20 w-20 border-8 border-accent border-t-white shadow-lg'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // Initialize logging service
    loggingService.logSystemInfo();
    loggingService.info('Application started', { version: '1.0.0' }, 'App');

    // Add some more visible logs
    loggingService.info(
      'Console Logging UI is now available in General Settings',
      { feature: 'logging-ui' },
      'App'
    );
    loggingService.info(
      'Application logging system initialized',
      { feature: 'logging' },
      'App'
    );

    // Initialize demo data service
    const initializeApp = async () => {
      try {
        await demoDataService.initializeDemoTables();
        loggingService.info(
          'Demo data service initialized successfully',
          { service: 'demoData' },
          'App'
        );
      } catch (error) {
        loggingService.error(
          'Failed to initialize demo data service',
          error as Error,
          { service: 'demoData' },
          'App'
        );
      }
    };

    initializeApp();
  }, []);

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

                    {/* Programme Manager routes */}
                    <Route
                      path='/programme-manager/*'
                      element={
                        <ProtectedRoute>
                          <AppContent />
                        </ProtectedRoute>
                      }
                    />

                    {/* All other routes */}
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
