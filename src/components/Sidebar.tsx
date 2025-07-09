import React, { useState, useEffect } from 'react';
import { useMenu } from '../contexts/MenuContext';
import { useLogo } from '../contexts/LogoContext';
import { MenuItem as BaseMenuItem } from '../types/menu';
import {
  HomeIcon,
  InboxIcon,
  UsersIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  CurrencyPoundIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  MegaphoneIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  Bars3Icon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  WrenchScrewdriverIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  UserCircleIcon,
  MapIcon,
  IdentificationIcon,
  ArrowPathIcon,
  Bars3BottomLeftIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

interface MenuItem extends BaseMenuItem {
  badge?: string | number;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <HomeIcon className='h-8 w-8' />,
  mail: <InboxIcon className='h-8 w-8' />,
  crm: <UsersIcon className='h-8 w-8' />,
  projects: <BriefcaseIcon className='h-8 w-8' />,
  calendar: <CalendarIcon className='h-8 w-8' />,
  opportunities: <ChartBarIcon className='h-8 w-8' />,
  documents: <DocumentTextIcon className='h-8 w-8' />,
  tasks: <ClipboardDocumentListIcon className='h-8 w-8' />,
  procurement: <BuildingOffice2Icon className='h-8 w-8' />,
  settings: <Cog6ToothIcon className='h-8 w-8' />,
  support: <QuestionMarkCircleIcon className='h-8 w-8' />,
  finance: <CurrencyPoundIcon className='h-8 w-8' />,
  hr: <AcademicCapIcon className='h-8 w-8' />,
  marketing: <MegaphoneIcon className='h-8 w-8' />,
  changelog: <DocumentTextIcon className='h-8 w-8' />,
  roadmap: <ChartBarIcon className='h-8 w-8' />,
  'lightning-bolt': <BoltIcon className='h-8 w-8' />,
  'chat-bubble': <ChatBubbleLeftRightIcon className='h-8 w-8' />,
  users: <UsersIcon className='h-8 w-8' />,
  'book-open': <BookOpenIcon className='h-8 w-8' />,
  'document-text': <DocumentTextIcon className='h-8 w-8' />,
  cog: <Cog6ToothIcon className='h-8 w-8' />,
  wrench: <WrenchScrewdriverIcon className='h-8 w-8' />,
  'puzzle-piece': <PuzzlePieceIcon className='h-8 w-8' />,
  'question-mark-circle': <QuestionMarkCircleIcon className='h-8 w-8' />,
  'currency-pound': <CurrencyPoundIcon className='h-8 w-8' />,
  handshake: <UserGroupIcon className='h-8 w-8' />,
  'presentation-chart-line': <PresentationChartLineIcon className='h-8 w-8' />,
  banknotes: <BanknotesIcon className='h-8 w-8' />,
  megaphone: <MegaphoneIcon className='h-8 w-8' />,
  'user-circle': <UserCircleIcon className='h-8 w-8' />,
  map: <MapIcon className='h-8 w-8' />,
  identification: <IdentificationIcon className='h-8 w-8' />,
  'arrow-path': <ArrowPathIcon className='h-8 w-8' />,
  'bars-3-bottom-left': <Bars3BottomLeftIcon className='h-8 w-8' />,
  key: <KeyIcon className='h-8 w-8' />,
};

const renderIcon = (
  icon: string,
  active: boolean,
  collapsed: boolean,
  isParent: boolean = false
) => {
  const iconNode = iconMap[icon] || <HomeIcon className='h-8 w-8' />;
  return (
    <span
      className={`sidebar-icon flex items-center justify-center ${collapsed ? (active ? 'text-green-500' : 'text-gray-400') : active ? 'text-green-500' : 'text-gray-400'}`}
    >
      {iconNode}
    </span>
  );
};

const renderBadge = (item: MenuItem) =>
  item.badge ? (
    <span className='ml-2 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold'>
      {item.badge}
    </span>
  ) : null;

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  activeModule,
  onModuleChange,
}) => {
  const { menu, modules } = useMenu();
  const { logoSettings } = useLogo();
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const modulesMap = modules as Record<
    string,
    { type: string; active: boolean }
  >;

  // Default logo settings if not available
  const defaultLogoSettings = {
    sidebarLogo: {
      type: 'icon' as const,
      icon: 'home',
      imageUrl: null,
    },
  };

  const safeLogoSettings = logoSettings || defaultLogoSettings;

  // Ensure safeLogoSettings has the required structure
  const safeSidebarLogo =
    safeLogoSettings?.sidebarLogo || defaultLogoSettings.sidebarLogo;

  // Find parent of active module
  const findParent = (items: MenuItem[], module: string): string | null => {
    for (const item of items) {
      if (
        item.children &&
        item.children.some(child => (child.moduleKey || child.id) === module)
      ) {
        return item.id;
      }
      if (item.children) {
        const found = findParent(item.children as MenuItem[], module);
        if (found) return found;
      }
    }
    return null;
  };

  // Collapse all parents by default when expanding the sidebar
  useEffect(() => {
    if (!collapsed) {
      setExpanded({});
    }
  }, [collapsed]);

  // When active module changes, expand its parent (if any)
  useEffect(() => {
    if (!collapsed) {
      const parentId = findParent(menu as MenuItem[], activeModule);
      if (parentId) setExpanded({ [parentId]: true });
    }
  }, [activeModule, collapsed, menu]);

  // Only one parent expanded at a time
  const handleParentClick = (item: MenuItem) => {
    setExpanded(expandedId => (expandedId[item.id] ? {} : { [item.id]: true }));
    // Remove automatic child selection - parent click only expands/collapses
  };

  // Handle click for any menu item (icon or label)
  const handleMenuClick = (item: MenuItem) => {
    if (collapsed) {
      onToggle(); // Expand sidebar first
      setTimeout(() => {
        if (item.type === 'parent' && item.children) {
          setExpanded({ [item.id]: true });
          // Don't automatically select first child in collapsed mode either
        } else {
          setExpanded({});
          onModuleChange(item.moduleKey || item.id);
        }
      }, 200); // Wait for sidebar expand animation
    } else {
      if (item.type === 'parent' && item.children) {
        handleParentClick(item);
      } else {
        onModuleChange(item.moduleKey || item.id);
      }
    }
  };

  const isVisible = (item: MenuItem) => {
    if (!item.visible) return false;
    if (
      item.moduleKey &&
      modulesMap[item.moduleKey] &&
      !modulesMap[item.moduleKey].active
    )
      return false;
    return true;
  };

  const coreMenu = menu.filter(item => {
    if (!isVisible(item)) return false;
    if (item.moduleKey && modulesMap[item.moduleKey]) {
      return modulesMap[item.moduleKey].type === 'core';
    }
    return true;
  }) as MenuItem[];

  const additionalMenu = menu.filter(item => {
    if (!isVisible(item)) return false;
    if (item.moduleKey && modulesMap[item.moduleKey]) {
      return modulesMap[item.moduleKey].type === 'additional';
    }
    return false;
  }) as MenuItem[];

  // Helper: is this the active parent?
  const activeParentId = findParent(menu as MenuItem[], activeModule);

  // Helper: is this parent expanded?
  const isParentExpanded = (itemId: string) => expanded[itemId];

  const renderMenu = (items: MenuItem[], parentId?: string) => (
    <ul className={parentId ? 'ml-0' : 'mt-2'}>
      {items
        .sort((a, b) => a.order - b.order)
        .map(item => {
          const isActive = activeModule === (item.moduleKey || item.id);
          const isActiveParent = item.id === activeParentId;
          const isExpanded = isParentExpanded(item.id);
          const hasChildren = Boolean(
            item.children && item.children.length > 0
          );

          // All main items should show green when active
          const shouldShowGreenMain = isActive;

          // Parent items should also show green when expanded but no child is selected
          const shouldShowGreenParent =
            hasChildren && isExpanded && !isActiveParent;

          // In collapsed mode, parent of active child should show green
          const shouldShowGreenParentCollapsed = collapsed && isActiveParent;

          // Determine final green state for parent items
          const shouldShowGreen =
            shouldShowGreenMain ||
            shouldShowGreenParent ||
            shouldShowGreenParentCollapsed;

          return (
            <li key={item.id}>
              {hasChildren ? (
                <>
                  <div
                    className={`flex items-center px-4 py-2 cursor-pointer rounded-lg transition font-medium sidebar-parent ${
                      shouldShowGreen
                        ? 'text-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleMenuClick(item)}
                    title={collapsed ? item.label : undefined}
                  >
                    {renderIcon(
                      item.icon || '',
                      shouldShowGreen,
                      collapsed,
                      true
                    )}
                    {!collapsed && (
                      <span className='ml-2 flex-1'>{item.label}</span>
                    )}
                    {!collapsed && renderBadge(item)}
                    {item.children &&
                      !collapsed &&
                      (expanded[item.id] ? (
                        <ChevronDownIcon className='h-5 w-5 ml-auto' />
                      ) : (
                        <ChevronLeftIcon className='h-5 w-5 ml-auto' />
                      ))}
                  </div>
                  {item.children && expanded[item.id] && !collapsed && (
                    <div className='ml-8'>
                      {renderMenu(item.children as MenuItem[], item.id)}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={`flex items-center px-4 py-2 cursor-pointer rounded-lg transition font-medium sidebar-child ${
                    shouldShowGreenMain
                      ? 'text-green-500'
                      : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleMenuClick(item)}
                  title={collapsed ? item.label : undefined}
                >
                  {renderIcon(
                    item.icon || '',
                    shouldShowGreenMain,
                    collapsed,
                    false
                  )}
                  {!collapsed && (
                    <span className='ml-2 flex-1'>{item.label}</span>
                  )}
                  {!collapsed && renderBadge(item)}
                </div>
              )}
            </li>
          );
        })}
    </ul>
  );

  return (
    <aside
      className={`sidebar bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full ${collapsed ? 'w-16' : 'w-64'} flex flex-col transition-all duration-300`}
    >
      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
        {collapsed ? (
          <div className='flex items-center justify-center w-full'>
            {safeSidebarLogo.type === 'image' && safeSidebarLogo.imageUrl ? (
              <span
                title='Toggle Sidebar'
                className='sidebar-icon flex items-center justify-center cursor-pointer'
                onClick={onToggle}
              >
                <img
                  src={safeSidebarLogo.imageUrl}
                  alt='Sidebar Logo'
                  className='h-7 w-7 object-contain'
                />
              </span>
            ) : (
              <span
                title='Toggle Sidebar'
                className='sidebar-icon flex items-center justify-center cursor-pointer'
                onClick={onToggle}
              >
                <HomeIcon className='h-7 w-7 text-green-500' />
              </span>
            )}
          </div>
        ) : (
          <>
            <span className='text-xl font-bold tracking-tight flex items-center'>
              {safeSidebarLogo.type === 'image' && safeSidebarLogo.imageUrl ? (
                <img
                  src={safeSidebarLogo.imageUrl}
                  alt='Sidebar Logo'
                  className='h-7 w-7 object-contain mr-2'
                />
              ) : (
                <HomeIcon className='h-7 w-7 text-green-500 mr-2' />
              )}
            </span>
            <ChevronLeftIcon
              className='h-7 w-7 text-gray-700 dark:text-gray-300 cursor-pointer'
              onClick={onToggle}
            />
          </>
        )}
      </div>
      {!collapsed && (
        <div className='px-4 pt-4 pb-2 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wide'>
          CORE MODULES
        </div>
      )}
      <nav className='flex-1 overflow-y-auto pb-4'>
        {renderMenu(coreMenu)}
        {additionalMenu.length > 0 && !collapsed && (
          <>
            <div className='my-4 border-t border-gray-200 dark:border-gray-700 opacity-80' />
            <div className='px-4 pt-2 pb-2 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wide'>
              ADDITIONAL MODULES
            </div>
            {renderMenu(additionalMenu)}
          </>
        )}
      </nav>
      {!collapsed && (
        <div className='mt-auto p-4 border-t border-gray-200 dark:border-gray-700 flex items-center'>
          <div className='w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-lg font-bold text-green-800 mr-3'>
            TH
          </div>
          <div>
            <div className='font-semibold text-gray-900 dark:text-gray-100'>
              Tom Harvey
            </div>
            <div className='text-xs text-gray-500 dark:text-gray-400'>
              Project Manager
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
