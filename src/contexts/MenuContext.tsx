import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MenuItem {
  children?: MenuItem[];
  icon?: string;
  id: string;
  label: string;
  path: string;
  permissions?: string[];
}

interface MenuContextType {
  activeModule: string;
  menuItems: MenuItem[];
  setActiveModule: (module: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  sidebarCollapsed: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

interface MenuProviderProps {
  children: ReactNode;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'HomeIcon' },
    { id: 'projects', label: 'Projects', path: '/projects', icon: 'FolderIcon' },
    { id: 'tasks', label: 'Tasks', path: '/tasks', icon: 'CheckCircleIcon' },
    { id: 'crm', label: 'CRM', path: '/crm', icon: 'UsersIcon' },
    { id: 'chat', label: 'Chat', path: '/chat', icon: 'ChatBubbleIcon' },
    { id: 'documents', label: 'Documents', path: '/documents', icon: 'DocumentIcon' },
    { id: 'analytics', label: 'Analytics', path: '/analytics', icon: 'ChartBarIcon' },
    { id: 'settings', label: 'Settings', path: '/settings', icon: 'CogIcon' }
  ];

  const value: MenuContextType = {
    menuItems,
    activeModule,
    setActiveModule,
    sidebarCollapsed,
    setSidebarCollapsed
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}; 