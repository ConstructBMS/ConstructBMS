import { useThemeStore } from '@/app/store/ui/theme.store';
import type { FooterConfig } from '@/types/footer';
import { ChevronLeft, FileText, Menu, Moon, Sun, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(null);
  const { user } = useAuth();
  const { theme, toggleTheme } = useThemeStore();

  // Load footer config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('footerConfig');
    if (savedConfig) {
      try {
        setFooterConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading footer config:', error);
      }
    }
  }, []);

  // Listen for footer config updates
  useEffect(() => {
    const handleFooterConfigUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      setFooterConfig(customEvent.detail);
    };

    window.addEventListener('footerConfigUpdated', handleFooterConfigUpdate);

    return () => {
      window.removeEventListener(
        'footerConfigUpdated',
        handleFooterConfigUpdate
      );
    };
  }, []);

  return (
    <div className={`flex ${theme}-theme`}>
      {/* Sidebar - extends full height */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content area - adjusts to sidebar width */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-0' : 'lg:ml-8'
        }`}
        style={{
          marginLeft: sidebarOpen ? '0' : '0px',
        }}
      >
        {/* Top bar */}
        <header
          className='px-4 py-3 flex-shrink-0'
          style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderBottom:
              theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
          }}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className='lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-700'
              >
                <Menu className='w-5 h-5' />
              </button>

              {/* Desktop sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className='hidden lg:block p-2 rounded-md transition-colors duration-200'
                style={{
                  color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor =
                    theme === 'dark' ? '#374151' : '#f1f5f9')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                {sidebarOpen ? (
                  <ChevronLeft className='w-5 h-5' />
                ) : (
                  <Menu className='w-5 h-5' />
                )}
              </button>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='hidden sm:block'>
                <h1
                  className='text-lg font-semibold'
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#1f2937' }}
                >
                  ConstructBMS
                </h1>
              </div>
            </div>

            <div className='flex items-center space-x-3'>
              {/* Notes Icon */}
              <button className='p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-700 transition-colors'>
                <FileText className='w-5 h-5' />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className='p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-700 transition-colors'
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                {theme === 'light' ? (
                  <Moon className='w-5 h-5' />
                ) : (
                  <Sun className='w-5 h-5' />
                )}
              </button>

              {/* Logged in User */}
              <div
                className='flex items-center space-x-2 px-3 py-2 rounded-md'
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                }}
              >
                <User className='w-4 h-4' />
                <span className='text-sm font-medium'>
                  {user?.user_metadata?.name || user?.email || 'User'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - natural flow */}
        <main
          className='flex-1 p-3 sm:p-4 lg:p-6'
          style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb' }}
        >
          <Outlet />
        </main>

        {/* Footer - natural document flow, appears after content */}
        {footerConfig && (
          <div className='flex-shrink-0'>
            <Footer config={footerConfig} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
