import React, { createContext, useContext, useState, ReactNode } from 'react';
import { defaultMenu } from '../config/defaultMenu';
import type { MenuItem } from '../types/menu';

interface MenuContextType {
  activeModule: string;
  menuItems: MenuItem[];
  modules: Record<string, { active: boolean; type: string }>;
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

  // Use the default hierarchical menu structure
  const menuItems: MenuItem[] = defaultMenu;

  // Build modules map from the hierarchical menu structure
  const buildModulesMap = (
    items: MenuItem[]
  ): Record<string, { active: boolean; type: string }> => {
    const modulesMap: Record<string, { active: boolean; type: string }> = {};

    const processItems = (items: MenuItem[]) => {
      items.forEach(item => {
        // Determine if it's core or additional based on the item
        const isCore = ['dashboard', 'projects', 'tasks', 'settings'].includes(
          item.id
        );
        modulesMap[item.id] = {
          active: true,
          type: isCore ? 'core' : 'additional',
        };

        // Process children recursively
        if (item.children && item.children.length > 0) {
          processItems(item.children);
        }
      });
    };

    processItems(items);
    return modulesMap;
  };

  const modules = buildModulesMap(menuItems);

  const value: MenuContextType = {
    menuItems,
    modules,
    activeModule,
    setActiveModule,
    sidebarCollapsed,
    setSidebarCollapsed,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};
