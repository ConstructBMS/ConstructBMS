import React, { useState } from 'react';
import { Page } from '../../components/layout/Page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui';
import { General } from './sections/General';
import { Appearance } from './sections/Appearance';
import { FeatureFlags } from './sections/FeatureFlags';
import { Integrations } from './sections/Integrations';
import { Developer } from './sections/Developer';
import { Users, Shield, Palette, Flag, Plug, Code, Info } from 'lucide-react';

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
      href: '/users',
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: Shield,
      component: null,
      href: '/permissions',
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: Plug,
      component: Integrations,
    },
    { id: 'developer', label: 'Developer', icon: Code, component: Developer },
    { id: 'about', label: 'About', icon: Info, component: null },
  ];

  const handleTabClick = (tabId: string, href?: string) => {
    if (href) {
      window.location.href = href;
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <Page title='Settings'>
      <div className='flex h-full'>
        {/* Left sticky navigation */}
        <div className='w-64 flex-shrink-0 pr-6'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            orientation='vertical'
            className='w-full'
          >
            <TabsList className='flex flex-col h-auto w-full bg-transparent p-0'>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    onClick={() => handleTabClick(tab.id, tab.href)}
                    className='w-full justify-start gap-3 h-12 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground'
                  >
                    <Icon className='h-4 w-4' />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Right content */}
        <div className='flex-1 min-w-0'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='h-full'
          >
            {tabs.map(tab => {
              if (!tab.component) return null;
              const Component = tab.component;
              return (
                <TabsContent key={tab.id} value={tab.id} className='h-full'>
                  <Component />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </Page>
  );
}
