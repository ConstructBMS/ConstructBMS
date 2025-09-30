import {
  Code,
  Flag,
  Info,
  Layout,
  Palette,
  Plug,
  Shield,
  Tag,
  Users,
  FolderOpen,
} from 'lucide-react';
import { useState } from 'react';
import { Page } from '../../components/layout/Page';
import {
  About,
  Appearance,
  CRM,
  Developer,
  FeatureFlags,
  Footer,
  General,
  Integrations,
  Permissions,
  UsersAndRoles,
} from './sections';
import { ProjectSettings } from './sections/ProjectSettings';
import { Tags } from './sections/Tags';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Users, component: General },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      component: Appearance,
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Users,
      component: CRM,
    },
    {
      id: 'project-settings',
      label: 'Project Settings',
      icon: FolderOpen,
      component: ProjectSettings,
    },
    {
      id: 'footer',
      label: 'Footer',
      icon: Layout,
      component: Footer,
    },
    {
      id: 'tags',
      label: 'Tags',
      icon: Tag,
      component: Tags,
    },
    {
      id: 'feature-flags',
      label: 'Feature Flags',
      icon: Flag,
      component: FeatureFlags,
    },
    {
      id: 'users-roles',
      label: 'Users & Roles',
      icon: Users,
      component: UsersAndRoles,
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: Shield,
      component: Permissions,
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: Plug,
      component: Integrations,
    },
    { id: 'developer', label: 'Developer', icon: Code, component: Developer },
    { id: 'about', label: 'About', icon: Info, component: About },
  ];

  const handleTabClick = (tabId: string, href?: string) => {
    if (href) {
      window.location.href = href;
      return;
    }
    setActiveTab(tabId);
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <Page title='Settings'>
      <div className='flex h-[calc(100vh-200px)]'>
        {/* Vertical Sidebar Navigation */}
        <div className='w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col'>
          <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-lg font-semibold'>Settings</h2>
            <p className='text-sm text-muted-foreground mt-1'>
              Configure your application settings and preferences.
            </p>
          </div>

          <nav className='flex-1 p-4 space-y-1 overflow-y-auto scrollbar-accent scrollbar-fade'>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.href)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left font-medium text-sm transition-colors
                    ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className='h-4 w-4 flex-shrink-0' />
                  <span className='truncate'>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='flex-1 p-6 overflow-y-auto scrollbar-accent scrollbar-fade'>
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className='p-8 text-center text-muted-foreground'>
              <p>This section is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
