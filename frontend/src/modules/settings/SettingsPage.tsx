import {
  Code,
  Flag,
  Info,
  Layout,
  Palette,
  Plug,
  Shield,
  Users,
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
} from './sections';

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
      id: 'footer',
      label: 'Footer',
      icon: Layout,
      component: Footer,
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
      component: null,
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: Shield,
      component: null,
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
      <div className='space-y-6'>
        <div>
          <h2 className='text-2xl font-semibold'>Settings</h2>
          <p className='text-muted-foreground'>
            Configure your application settings and preferences.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className='border-b'>
          <nav className='-mb-px flex space-x-8 overflow-x-auto'>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, tab.href)}
                  className={`
                    flex items-center space-x-2 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                    ${
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }
                  `}
                >
                  <Icon className='h-4 w-4' />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='mt-6'>
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
