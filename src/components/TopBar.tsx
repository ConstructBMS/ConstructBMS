import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mail,
  Settings,
  User,
  ChevronDown,
  LogOut,
  StickyNote,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmail } from '../contexts/EmailContext';
import { useLogo } from '../contexts/LogoContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBell from './NotificationBell';
import ProfileSettingsModal from './ProfileSettingsModal';
import StickyNotesModal from './StickyNotesModal';
import ChatNotificationBadge from './ChatNotificationBadge';

interface TopBarProps {
  activeModule: string;
  emailUnreadCount?: number;
  onModuleChange: (module: string) => void;
}

const moduleNames: { [key: string]: string } = {
  dashboard: 'Dashboard',
  crm: 'Customer Relationship Management',
  sales: 'Sales Pipeline',
  'sales-pipeline': 'Sales Pipeline',
  signature: 'E-Signature Management',
  tasks: 'Task Management',
  estimating: 'Estimating & Proposals',
  contractors: 'Contractor Management',
  'site-tools': 'Site Tools & Safety',
  procurement: 'Procurement & Purchasing',
  collaboration: 'Team Collaboration',
  chat: 'Messenger & Communications',
  notifications: 'Notification Center',
  backup: 'Backup & Recovery',
  users: 'Users & Role Management',
  help: 'Knowledge Base',
  support: 'Support Center',
  calendar: 'Calendar',
  finance: 'Finance',
  contracts: 'Contracts',
  hr: 'HR',
  paye: 'PAYE',
  marketing: 'Marketing',
  email: 'Email Client',
  agile: 'Agile Projects',
  projects: 'Project Management',
  roadmap: 'Project Roadmap',
  settings: 'System Settings',
  notes: 'Notes',
};

const TopBar: React.FC<TopBarProps> = ({ activeModule, onModuleChange }) => {
  const { user, roles, logout } = useAuth();
  const { unreadCount: emailUnreadCount } = useEmail();
  const { logoSettings } = useLogo();
  const { theme: themeSettings, setTheme: setThemeMode, isDark } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [prevUnreadCount, setPrevUnreadCount] = useState(emailUnreadCount);
  const [isBadgeUpdating, setIsBadgeUpdating] = useState(false);

  // Check if user has set a custom main logo
  const hasCustomMainLogo =
    logoSettings?.mainLogo?.type === 'image' &&
    logoSettings?.mainLogo?.imageUrl &&
    logoSettings.mainLogo.imageUrl !== null;

  // Track unread count changes for animation
  useEffect(() => {
    if (emailUnreadCount !== prevUnreadCount) {
      setIsBadgeUpdating(true);
      setPrevUnreadCount(emailUnreadCount);

      // Remove animation class after animation completes
      const timer = setTimeout(() => {
        setIsBadgeUpdating(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [emailUnreadCount, prevUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMailClick = () => {
    onModuleChange('email');
  };

  const handleNotificationsClick = () => {
    onModuleChange('notifications');
  };

  const handleSettingsClick = () => {
    onModuleChange('general-settings');
  };

  const handleNotesClick = () => {
    setShowNotesModal(true);
  };

  const handleChatClick = () => {
    onModuleChange('chat');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleThemeToggle = () => {
    // Only toggle between light and dark, regardless of current mode
    if (
      !themeSettings ||
      themeSettings === 'light' ||
      (themeSettings === 'auto' && !isDark)
    ) {
      setThemeMode('dark');
    } else {
      setThemeMode('light');
    }
  };

  const getThemeIcon = () => {
    // Show the opposite of current effective mode
    const isCurrentlyDark =
      themeSettings === 'dark' || (themeSettings === 'auto' && isDark);
    return isCurrentlyDark ? Sun : Moon;
  };

  const getThemeTooltip = () => {
    // Show what clicking will change to
    const isCurrentlyDark =
      themeSettings === 'dark' || (themeSettings === 'auto' && isDark);
    return isCurrentlyDark ? 'Switch to light mode' : 'Switch to dark mode';
  };

  const ThemeIcon = getThemeIcon();

  const getUserInitials = () => {
    if (!user) return 'U';
    return (
      `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() ||
      'U'
    );
  };

  const getUserAvatar = () => {
    return user?.avatar || user?.avatarUrl || undefined;
  };

  const getPrimaryRole = () => {
    if (!roles || roles.length === 0) return 'User';
    return roles[0]?.name || 'User';
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    if (searchTerm.length > 2) {
      console.log('Searching for:', searchTerm);
      // In a real app, this would trigger a search
    }
  };

  return (
    <header className='bg-white dark:bg-[#1a2332] border-b border-gray-200 dark:border-[#2a3442] px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 safe-area-inset'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2 sm:space-x-4'>
          {/* Company Logo/Name - Only show if user has set a custom main logo */}
          {hasCustomMainLogo && (
            <div className='flex items-center'>
              <img
                src={logoSettings?.mainLogo?.imageUrl || ''}
                alt='Company Logo'
                className='h-8 w-auto max-w-32 object-contain'
              />
            </div>
          )}

          <div className='hidden md:block'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search projects, clients, tasks...'
                onChange={handleSearch}
                className='pl-10 pr-4 py-2 w-80 border border-gray-300 dark:border-[#3a4452] rounded-lg bg-white dark:bg-[#2a3442] text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
            </div>
          </div>
        </div>

        <div className='flex items-center space-x-2 sm:space-x-4'>
          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            className='p-2 rounded-lg transition-colors duration-200 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a3442]'
            title={getThemeTooltip()}
          >
            <ThemeIcon className='h-5 w-5' />
          </button>

          <button
            onClick={handleMailClick}
            className={`relative p-2 rounded-lg transition-colors duration-200 ${
              activeModule === 'email'
                ? 'text-constructbms-blue bg-constructbms-blue/10 border border-constructbms-blue/20'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a3442]'
            }`}
            title='Email Client'
          >
            <Mail className='h-5 w-5' />
            {emailUnreadCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 bg-constructbms-blue text-black text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center notification-badge-count px-1 ${isBadgeUpdating ? 'updating' : ''}`}
              >
                {emailUnreadCount > 99 ? '99+' : emailUnreadCount}
              </span>
            )}
          </button>

          <ChatNotificationBadge onClick={handleChatClick} />

          <button
            onClick={handleNotesClick}
            className='p-2 rounded-lg transition-colors duration-200 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a3442]'
            title='Notes'
          >
            <StickyNote className='h-5 w-5' />
          </button>

          <NotificationBell
            onModuleChange={onModuleChange}
            activeModule={activeModule}
          />

          <button
            onClick={handleSettingsClick}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              activeModule === 'general-settings' ||
              activeModule === 'settings' ||
              activeModule === 'sidebar-settings' ||
              activeModule === 'permissions' ||
              activeModule === 'system-permissions' ||
              activeModule === 'user-management'
                ? 'text-constructbms-blue bg-constructbms-blue/10 border border-constructbms-blue/20'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a3442]'
            }`}
            title='Settings'
          >
            <Settings className='h-5 w-5' />
          </button>

          <div className='flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-4 border-l border-gray-300 dark:border-[#3a4452]'>
            <div className='relative' ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className='flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-[#2a3442] rounded-lg p-2 transition-colors'
              >
                <div className='w-8 h-8 rounded-full bg-constructbms-blue flex items-center justify-center cursor-pointer hover:bg-constructbms-black hover:text-white transition-colors overflow-hidden'>
                  {getUserAvatar() ? (
                    <img
                      src={getUserAvatar()}
                      alt='Profile'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <span className='text-sm font-medium'>
                      {getUserInitials()}
                    </span>
                  )}
                </div>
                <div className='hidden md:block text-left'>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {user ? `${user.firstName} ${user.lastName}` : 'User'}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {getPrimaryRole()}
                  </p>
                </div>
                <ChevronDown className='h-4 w-4 text-gray-400' />
              </button>

              {showUserMenu && (
                <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-[#2a3442] rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-[#3a4452]'>
                  <div className='px-4 py-3 border-b border-gray-100 dark:border-[#3a4452]'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 rounded-full bg-constructbms-blue flex items-center justify-center overflow-hidden'>
                        {getUserAvatar() ? (
                          <img
                            src={getUserAvatar()}
                            alt='Profile'
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <span className='text-sm font-medium'>
                            {getUserInitials()}
                          </span>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                          {user ? `${user.firstName} ${user.lastName}` : 'User'}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                          {user?.email}
                        </p>
                        <p className='text-xs text-constructbms-blue'>
                          {getPrimaryRole()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowProfileModal(true);
                    }}
                    className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a4452] flex items-center space-x-2'
                    title='Profile Settings'
                  >
                    <User className='h-4 w-4' />
                    <span>Profile Settings</span>
                  </button>

                  <div className='border-t border-gray-100 dark:border-[#3a4452]'></div>

                  <button
                    onClick={handleLogout}
                    className='w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2'
                    title='Log Out'
                  >
                    <LogOut className='h-4 w-4' />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onNavigateToSettings={() => {
          setShowProfileModal(false);
          onModuleChange('general-settings');
        }}
      />

      {/* Sticky Notes Modal */}
      <StickyNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
      />
    </header>
  );
};

export default TopBar;
