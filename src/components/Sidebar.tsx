import React, { useState, useEffect } from 'react';
import { useMenu } from '../contexts/MenuContext';
import { useLogo } from '../contexts/LogoContext';
import type { MenuItem as BaseMenuItem } from '../types/menu';
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
  activeModule: string;
  collapsed: boolean;
  onModuleChange: (module: string) => void;
  onToggle: () => void;
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
  'hard-hat': <WrenchScrewdriverIcon className='h-8 w-8' />,
  builder: <WrenchScrewdriverIcon className='h-8 w-8' />,
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
      className={`sidebar-icon flex items-center justify-center ${collapsed ? (active ? 'text-accent' : 'text-gray-400') : active ? 'text-accent' : 'text-gray-400'}`}
    >
      {iconNode}
    </span>
  );
};

const renderBadge = (item: MenuItem) =>
  item.badge ? (
    <span className='ml-2 px-2 py-0.5 rounded-full bg-accent text-white text-xs font-bold'>
      {item.badge}
    </span>
  ) : null;

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  activeModule,
  onModuleChange,
}) => {
  const { menuItems: menu, modules } = useMenu();
  const { logoSettings } = useLogo();
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const modulesMap = modules as Record<
    string,
    { active: boolean; type: string }
  >;

  // Debug logging
  console.log('Sidebar Debug:', {
    menuItems: menu,
    modules: modulesMap,
    menuLength: menu?.length || 0,
  });

  // Categorize menu items
  const coreMenu = (menu || []).filter(item => {
    if (!isVisible(item)) return false;
    // Exclude settings and support from core menu
    if (item.id === 'settings' || item.id === 'support') return false;
    if (item.moduleKey && modulesMap[item.moduleKey]) {
      const module = modulesMap[item.moduleKey];
      return module && module.type === 'core';
    }
    // Include items that don't have a moduleKey (like dashboard, projects, etc.)
    return (
      !item.moduleKey ||
      (item.moduleKey &&
        modulesMap[item.moduleKey] &&
        modulesMap[item.moduleKey]?.type === 'core')
    );
  }) as MenuItem[];

  const additionalMenu = (menu || []).filter(item => {
    if (!isVisible(item)) return false;
    // Exclude settings and support from additional menu
    if (item.id === 'settings' || item.id === 'support') return false;
    if (item.moduleKey && modulesMap[item.moduleKey]) {
      return modulesMap[item.moduleKey]?.type === 'additional';
    }
    return false;
  }) as MenuItem[];

  // Separate Settings and Support for the bottom section
  const bottomMenu = (menu || []).filter(item => {
    if (!isVisible(item)) return false;
    return item.id === 'settings' || item.id === 'support';
  }) as MenuItem[];

  // Check if user has set a custom sidebar logo
  const hasCustomSidebarLogo =
    logoSettings?.sidebarLogo?.type === 'image' &&
    logoSettings?.sidebarLogo?.imageUrl &&
    logoSettings.sidebarLogo.imageUrl !== null;
  // Check if user has set a custom main logo
  const hasCustomMainLogo =
    logoSettings?.mainLogo?.type === 'image' &&
    logoSettings?.mainLogo?.imageUrl &&
    logoSettings.mainLogo.imageUrl !== null;

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

  // When active module changes, expand its parent (if any) and collapse others
  useEffect(() => {
    if (!collapsed) {
      const parentId = findParent(menu as MenuItem[], activeModule);
      if (parentId) {
        setExpanded({ [parentId]: true });
      } else {
        // If no parent found, collapse all expanded parents
        setExpanded({});
      }
    }
  }, [activeModule, collapsed, menu]);

  // Only one parent expanded at a time
  const handleParentClick = (item: MenuItem) => {
    setExpanded(expandedId => {
      // If this item is already expanded, collapse it
      if (expandedId?.[item.id]) {
        return {};
      }
      // Otherwise, expand this item and collapse all others
      return { [item.id]: true };
    });
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
      !modulesMap[item.moduleKey]?.active
    )
      return false;
    return true;
  };

  const coreMenu = (menu || []).filter(item => {
    if (!isVisible(item)) return false;
    // Exclude settings and support from core menu
    if (item.id === 'settings' || item.id === 'support') return false;
    if (item.moduleKey && modulesMap[item.moduleKey]) {
      const module = modulesMap[item.moduleKey];
      return module && module.type === 'core';
    }
    // Include items that don't have a moduleKey (like dashboard, projects, etc.)
    return (
      !item.moduleKey ||
      (item.moduleKey &&
        modulesMap[item.moduleKey] &&
        modulesMap[item.moduleKey]?.type === 'core')
    );
  }) as MenuItem[];

  const additionalMenu = (menu || []).filter(item => {
    if (!isVisible(item)) return false;
    // Exclude settings and support from additional menu
    if (item.id === 'settings' || item.id === 'support') return false;
    if (item.moduleKey && modulesMap[item.moduleKey]) {
      return modulesMap[item.moduleKey]?.type === 'additional';
    }
    return false;
  }) as MenuItem[];

  // Separate Settings and Support for the bottom section
  const bottomMenu = (menu || []).filter(item => {
    if (!isVisible(item)) return false;
    return item.id === 'settings' || item.id === 'support';
  }) as MenuItem[];

  // Debug logging for categorized menus
  console.log('Categorized Menus:', {
    coreMenu: coreMenu,
    additionalMenu: additionalMenu,
    bottomMenu: bottomMenu,
    coreMenuLength: coreMenu.length,
    additionalMenuLength: additionalMenu.length,
    bottomMenuLength: bottomMenu.length,
  });

  // Helper: is this the active parent?
  const activeParentId = findParent(menu as MenuItem[], activeModule);

  // Helper: is this parent expanded?
  const isParentExpanded = (itemId: string) => expanded[itemId] || false;

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

          // All main items should show accent when active
          const shouldShowAccentMain = isActive;

          // Parent items should only show accent icon when a child is actually selected
          const shouldShowAccentIcon = hasChildren && isActiveParent;

          // In collapsed mode, parent of active child should show accent icon
          const shouldShowAccentIconCollapsed = collapsed && isActiveParent;

          // Determine final accent icon state for parent items
          const shouldShowAccentIconFinal =
            shouldShowAccentMain ||
            shouldShowAccentIcon ||
            shouldShowAccentIconCollapsed;

          // Parent items should only have accent text/background when they themselves are active
          // But parent items with children should never be the active module themselves
          const shouldShowAccentText = shouldShowAccentMain && !hasChildren;

          return (
            <li key={item.id}>
              {hasChildren ? (
                <>
                  <div
                    className={`flex items-center px-4 py-2 cursor-pointer rounded-lg transition font-medium sidebar-parent ${
                      shouldShowAccentText
                        ? 'text-accent bg-accent/10 dark:bg-accent/20'
                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleMenuClick(item)}
                    title={collapsed ? item.label : undefined}
                  >
                    {renderIcon(
                      item.icon || '',
                      shouldShowAccentIconFinal,
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
                    shouldShowAccentMain
                      ? 'text-accent'
                      : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleMenuClick(item)}
                  title={collapsed ? item.label : undefined}
                >
                  {renderIcon(
                    item.icon || '',
                    shouldShowAccentMain,
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
            <span
              title='Toggle Sidebar'
              className='sidebar-icon flex items-center justify-center cursor-pointer'
              onClick={onToggle}
            >
              {hasCustomSidebarLogo ? (
                <img
                  src={logoSettings?.sidebarLogo?.imageUrl || ''}
                  alt='Sidebar Logo'
                  className='h-7 w-7 object-contain'
                />
              ) : (
                /* Blue circle with navy 'C' for ConstructBMS - only show the circle when collapsed */
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '9999px',
                    background: '#3B82F6', // blue accent
                    color: '#1A2233', // navy
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                  }}
                >
                  C
                </span>
              )}
            </span>
          </div>
        ) : (
          <>
            <span className='text-xl font-bold tracking-tight flex items-center'>
              {hasCustomSidebarLogo ? (
                <img
                  src={logoSettings?.sidebarLogo?.imageUrl || ''}
                  alt='Sidebar Logo'
                  className='h-7 w-7 object-contain mr-2'
                />
              ) : (
                <>
                  {/* Blue circle with navy 'C' for ConstructBMS */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      background: '#3B82F6',
                      color: '#1e3a8a',
                      fontWeight: 'bold',
                      fontSize: '1.25rem',
                      marginRight: '0.5rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    C
                  </span>
                  {/* Only show text if no custom logos are set */}
                  {!(hasCustomSidebarLogo || hasCustomMainLogo) && (
                    <span>ConstructBMS</span>
                  )}
                </>
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
        {additionalMenu.length > 0 && (
          <>
            {!collapsed && (
              <>
                <div className='my-4 border-t border-gray-200 dark:border-gray-700 opacity-80' />
                <div className='px-4 pt-2 pb-2 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wide'>
                  ADDITIONAL MODULES
                </div>
              </>
            )}
            {renderMenu(additionalMenu)}
          </>
        )}
      </nav>
      {bottomMenu.length > 0 && (
        <div className='mt-auto border-t border-gray-200 dark:border-gray-700'>
          {renderMenu(bottomMenu)}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
