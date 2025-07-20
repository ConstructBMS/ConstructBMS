import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import { defaultMenu } from '../config/defaultMenu';
import { modules as defaultModules } from '../config/modules';
import type { MenuItem } from '../types/menu';
import { persistentStorage } from '../services/persistentStorage';

export type ModuleMap = Record<
  string,
  { active: boolean, name: string; type: string; }
>;

interface MenuContextType {
  isLoading: boolean;
  menu: MenuItem[];
  modules: ModuleMap;
  resetMenu: () => void;
  setMenu: (menu: MenuItem[]) => void;
  setModules: (modules: ModuleMap) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within a MenuProvider');
  return context;
};

export const MenuProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [menu, setMenuState] = useState<MenuItem[]>(defaultMenu);
  const [modules, setModulesState] = useState<ModuleMap>(
    defaultModules as ModuleMap
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load menu data
        const savedMenu = await persistentStorage.getSetting(
          'menu_structure',
          'menu'
        );
        if (savedMenu) {
          setMenuState(savedMenu);
        }

        // Load modules data
        const savedModules = await persistentStorage.getSetting(
          'modules_config',
          'modules'
        );
        if (savedModules) {
          setModulesState(savedModules);
        }
      } catch (error) {
        console.warn(
          'Failed to load menu/modules from database, using defaults:',
          error
        );
        // Continue with defaults - no need to throw
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save menu to database
  const setMenu = async (newMenu: MenuItem[]) => {
    setMenuState(newMenu);
    try {
      await persistentStorage.setSetting('menu_structure', newMenu, 'menu');
    } catch (error) {
      console.warn('Failed to save menu to database:', error);
      // Don't throw - just log the warning
    }
  };

  // Save modules to database
  const setModules = async (newModules: ModuleMap) => {
    setModulesState(newModules);
    try {
      await persistentStorage.setSetting(
        'modules_config',
        newModules,
        'modules'
      );
    } catch (error) {
      console.warn('Failed to save modules to database:', error);
      // Don't throw - just log the warning
    }
  };

  const resetMenu = async () => {
    setMenuState(defaultMenu);
    try {
      await persistentStorage.setSetting('menu_structure', defaultMenu, 'menu');
    } catch (error) {
      console.warn('Failed to reset menu in database:', error);
      // Don't throw - just log the warning
    }
  };

  return (
    <MenuContext.Provider
      value={{
        menu,
        setMenu,
        modules,
        setModules,
        resetMenu,
        isLoading,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};
