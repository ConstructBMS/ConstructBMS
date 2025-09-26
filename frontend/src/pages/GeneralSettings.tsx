import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/hooks/useTheme';
import {
  Bell,
  Building,
  CreditCard,
  Database,
  FileText,
  FolderOpen,
  Link,
  Palette,
  Save,
  Settings,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DemoDataManagement } from '../modules/settings/sections/DemoDataManagement';

// Go Live Section Component
const GoLiveSection = () => {
  console.log('GoLiveSection - Component is rendering');

  const handleGoLive = () => {
    if (
      confirm(
        'Are you sure you want to delete all demo data and go live? This action cannot be undone.'
      )
    ) {
      // Clear demo data and reload
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className='mb-6'>
      <Card className='border-red-200 bg-red-50'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2 text-red-800'>
            <AlertTriangle className='h-5 w-5' />
            <span>Go Live</span>
          </CardTitle>
          <CardDescription className='text-red-700'>
            Switch from demo mode to live mode by deleting all demo data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='bg-red-100 border border-red-300 rounded-lg p-4'>
              <p className='text-red-800 text-sm font-medium mb-2'>
                ⚠️ This action will permanently delete all demo data including:
              </p>
              <ul className='text-red-700 text-sm space-y-1 ml-4'>
                <li>• All demo projects, contacts, and tasks</li>
                <li>• All demo sticky notes and documents</li>
                <li>• All demo user accounts (except admin)</li>
                <li>• All demo financial records</li>
              </ul>
            </div>
            <Button
              variant='destructive'
              onClick={handleGoLive}
              className='w-full'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete Demo Data & Go Live
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

interface CompanyInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
  website: string;
  logo: string;
}

interface ProjectSettings {
  prefix: string;
  nextNumber: number;
  format: string;
  autoIncrement: boolean;
}

interface FinanceSettings {
  estimatePrefix: string;
  nextEstimateNumber: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  currency: string;
  taxRate: number;
}

interface CrmSettings {
  client: {
    prefix: string;
    nextNumber: number;
  };
  consultant: {
    prefix: string;
    nextNumber: number;
  };
}

const GeneralSettings: React.FC = () => {
  const { theme } = useTheme();

  const [appearanceSettings, setAppearanceSettings] =
    useState<AppearanceSettings>({
      theme: 'auto',
      primaryColor: '#3b82f6',
      fontSize: 'medium',
      compactMode: false,
    });

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'ConstructBMS',
    email: 'contact@constructbms.com',
    address: '123 Business Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    website: 'https://constructbms.com',
    logo: '',
  });

  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    prefix: 'PRJ',
    nextNumber: 1001,
    format: 'prefix-number',
    autoIncrement: true,
  });

  const [financeSettings, setFinanceSettings] = useState<FinanceSettings>({
    estimatePrefix: 'EST',
    nextEstimateNumber: 2001,
    invoicePrefix: 'INV',
    nextInvoiceNumber: 3001,
    currency: 'GBP',
    taxRate: 20,
  });

  const [crmSettings, setCrmSettings] = useState<CrmSettings>({
    client: {
      prefix: 'CLT',
      nextNumber: 1001,
    },
    consultant: {
      prefix: 'CNS',
      nextNumber: 1001,
    },
  });

  useEffect(() => {
    // Load settings from localStorage or API
    const loadSettings = () => {
      // This would typically load from your backend API
      console.log('Loading settings...');
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      // Save settings to backend API
      console.log('Saving settings...', {
        appearanceSettings,
        companyInfo,
        projectSettings,
        financeSettings,
        crmSettings,
      });

      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex-1 p-6'>
        <div className='flex items-center gap-3 mb-6'>
          <Settings
            className='w-6 h-6'
            style={{ color: theme === 'dark' ? '#f9fafb' : '#1e293b' }}
          />
          <h1
            className='text-2xl font-bold'
            style={{ color: theme === 'dark' ? '#f9fafb' : '#1e293b' }}
          >
            General Settings
          </h1>
        </div>

        <Tabs defaultValue='appearance' className='w-full h-full'>
          <div className='flex flex-col lg:flex-row gap-6 h-[calc(100vh-240px)]'>
            <div className='w-full lg:w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 rounded-lg lg:rounded-l-lg flex flex-col'>
              <div className='p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0'>
                <h3 className='text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  Settings
                </h3>
                <p className='text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1'>
                  Configure your application
                </p>
              </div>
              <div className='flex-1 p-4 lg:p-6 lg:pt-4 overflow-y-auto'>
                <TabsList className='flex flex-col w-full !bg-transparent !p-0 !border-none !shadow-none'>
                  <TabsTrigger
                    value='appearance'
                    className='w-full justify-start !bg-transparent !shadow-none !rounded-lg !border-none !p-3 lg:!p-4 !mb-2 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700'
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <Palette className='w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3' />
                    <div className='text-left'>
                      <div className='font-medium text-sm lg:text-base'>
                        Appearance
                      </div>
                      <div className='text-xs lg:text-sm opacity-70'>
                        Theme & Layout
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value='company'
                    className='w-full justify-start !bg-transparent !shadow-none !rounded-lg !border-none !p-3 lg:!p-4 !mb-2 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700'
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <Building className='w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3' />
                    <div className='text-left'>
                      <div className='font-medium text-sm lg:text-base'>
                        Company
                      </div>
                      <div className='text-xs lg:text-sm opacity-70'>
                        Business Information
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value='projects'
                    className='w-full justify-start !bg-transparent !shadow-none !rounded-lg !border-none !p-3 lg:!p-4 !mb-2 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700'
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <FolderOpen className='w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3' />
                    <div className='text-left'>
                      <div className='font-medium text-sm lg:text-base'>
                        Projects
                      </div>
                      <div className='text-xs lg:text-sm opacity-70'>
                        Workflow & Numbering
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value='finance'
                    className='w-full justify-start !bg-transparent !shadow-none !rounded-lg !border-none !p-3 lg:!p-4 !mb-2 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700'
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <CreditCard className='w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3' />
                    <div className='text-left'>
                      <div className='font-medium text-sm lg:text-base'>
                        Finance
                      </div>
                      <div className='text-xs lg:text-sm opacity-70'>
                        Invoicing & Currency
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value='crm'
                    className='w-full justify-start !bg-transparent !shadow-none !rounded-lg !border-none !p-3 lg:!p-4 !mb-2 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700'
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <Users className='w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3' />
                    <div className='text-left'>
                      <div className='font-medium text-sm lg:text-base'>
                        CRM
                      </div>
                      <div className='text-xs lg:text-sm opacity-70'>
                        Client Management
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value='notifications'
                    className='w-full justify-start !bg-transparent !shadow-none !rounded-lg !border-none !p-3 lg:!p-4 !mb-2 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700'
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <Bell className='w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3' />
                    <div className='text-left'>
                      <div className='font-medium text-sm lg:text-base'>
                        Notifications
                      </div>
                      <div className='text-xs lg:text-sm opacity-70'>
                        Alerts & Reminders
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value='security'
                    className='w-full justify-start !bg-transparent !shadow-none !rounded-lg !border-none !p-3 lg:!p-4 !mb-2 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700'
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <Shield className='w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3' />
                    <div className='text-left'>
                      <div className='font-medium text-sm lg:text-base'>
                        Security
                      </div>
                      <div className='text-xs lg:text-sm opacity-70'>
                        Access & Privacy
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value='integrations'
                    className='w-full justify-start !bg-transparent !shadow-none !rounded-lg !border-none !p-3 lg:!p-4 !mb-2 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700'
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <Link className='w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3' />
                    <div className='text-left'>
                      <div className='font-medium text-sm lg:text-base'>
                        Integrations
                      </div>
                      <div className='text-xs lg:text-sm opacity-70'>
                        Third-party Apps
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value='backup'
                    className='w-full justify-start !bg-transparent !shadow-none !rounded-lg !border-none !p-3 lg:!p-4 !mb-2 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700'
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <Database className='w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3' />
                    <div className='text-left'>
                      <div className='font-medium text-sm lg:text-base'>
                        Backup & Export
                      </div>
                      <div className='text-xs lg:text-sm opacity-70'>
                        Data Management
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value='advanced'
                    className='w-full justify-start !bg-transparent !shadow-none !rounded-lg !border-none !p-3 lg:!p-4 !mb-2 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700'
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <Settings className='w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3' />
                    <div className='text-left'>
                      <div className='font-medium text-sm lg:text-base'>
                        Advanced
                      </div>
                      <div className='text-xs lg:text-sm opacity-70'>
                        System Configuration
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value='demo-data'
                    className='w-full justify-start !bg-transparent !shadow-none !rounded-lg !border-none !p-3 lg:!p-4 !mb-2 data-[state=active]:!bg-blue-600 data-[state=active]:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700'
                    style={{
                      color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <Trash2 className='w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3' />
                    <div className='text-left'>
                      <div className='font-medium text-sm lg:text-base'>
                        Demo Data
                      </div>
                      <div className='text-xs lg:text-sm opacity-70'>
                        Manage Demo Mode
                      </div>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto pr-6 pl-6 pb-6'>
              <TabsContent value='appearance' className='space-y-6'>
                <div className='space-y-6'>
                  {/* TEST: Go Live Section - Should be visible */}
                  <div className='bg-yellow-100 border-2 border-yellow-400 p-4 rounded-lg'>
                    <h3 className='text-lg font-bold text-yellow-800'>
                      TEST: Go Live Section
                    </h3>
                    <p className='text-yellow-700'>
                      If you can see this, the component is working!
                    </p>
                    <GoLiveSection />
                  </div>

                  {/* Theme Settings */}
                  <Card
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <CardHeader>
                      <CardTitle
                        style={{
                          color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                        }}
                        className='flex items-center gap-2'
                      >
                        <Palette className='w-5 h-5' />
                        Theme & Appearance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='theme-mode'
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Theme Mode
                          </Label>
                          <Select
                            value={appearanceSettings.theme}
                            onValueChange={value =>
                              setAppearanceSettings({
                                ...appearanceSettings,
                                theme: value as 'light' | 'dark' | 'auto',
                              })
                            }
                          >
                            <SelectTrigger
                              id='theme-mode'
                              style={{
                                backgroundColor:
                                  theme === 'dark' ? '#4b5563' : '#ffffff',
                                borderColor:
                                  theme === 'dark' ? '#6b7280' : '#e5e7eb',
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='light'>Light Theme</SelectItem>
                              <SelectItem value='dark'>Dark Theme</SelectItem>
                              <SelectItem value='auto'>
                                Auto (System)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-2'>
                          <Label
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Font Size
                          </Label>
                          <Select
                            value={appearanceSettings.fontSize}
                            onValueChange={value =>
                              setAppearanceSettings({
                                ...appearanceSettings,
                                fontSize: value as 'small' | 'medium' | 'large',
                              })
                            }
                          >
                            <SelectTrigger
                              style={{
                                backgroundColor:
                                  theme === 'dark' ? '#4b5563' : '#ffffff',
                                borderColor:
                                  theme === 'dark' ? '#6b7280' : '#e5e7eb',
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='small'>
                                Small (12px)
                              </SelectItem>
                              <SelectItem value='medium'>
                                Medium (14px)
                              </SelectItem>
                              <SelectItem value='large'>
                                Large (16px)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <Label
                          style={{
                            color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                          }}
                        >
                          Primary Color Scheme
                        </Label>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                          {[
                            {
                              name: 'Blue',
                              value: '#3b82f6',
                              class: 'bg-blue-500',
                            },
                            {
                              name: 'Green',
                              value: '#10b981',
                              class: 'bg-green-500',
                            },
                            {
                              name: 'Purple',
                              value: '#8b5cf6',
                              class: 'bg-purple-500',
                            },
                            {
                              name: 'Teal',
                              value: '#14b8a6',
                              class: 'bg-teal-500',
                            },
                            {
                              name: 'Orange',
                              value: '#f59e0b',
                              class: 'bg-orange-500',
                            },
                            {
                              name: 'Red',
                              value: '#ef4444',
                              class: 'bg-red-500',
                            },
                            {
                              name: 'Pink',
                              value: '#ec4899',
                              class: 'bg-pink-500',
                            },
                            {
                              name: 'Indigo',
                              value: '#6366f1',
                              class: 'bg-indigo-500',
                            },
                          ].map(color => (
                            <div
                              key={color.value}
                              className={`relative cursor-pointer rounded-lg p-4 border-2 transition-all ${
                                appearanceSettings.primaryColor === color.value
                                  ? 'border-blue-500 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() =>
                                setAppearanceSettings({
                                  ...appearanceSettings,
                                  primaryColor: color.value,
                                })
                              }
                            >
                              <div
                                className={`w-full h-8 rounded ${color.class}`}
                              />
                              <p className='text-sm font-medium mt-2 text-center'>
                                {color.name}
                              </p>
                              {appearanceSettings.primaryColor ===
                                color.value && (
                                <div className='absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                                  <div className='w-2 h-2 bg-white rounded-full' />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <Label
                          style={{
                            color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                          }}
                        >
                          Custom Color
                        </Label>
                        <div className='flex items-center gap-4'>
                          <Input
                            type='color'
                            value={appearanceSettings.primaryColor}
                            onChange={e =>
                              setAppearanceSettings({
                                ...appearanceSettings,
                                primaryColor: e.target.value,
                              })
                            }
                            className='w-16 h-12 rounded-lg border-2 border-gray-200'
                          />
                          <Input
                            value={appearanceSettings.primaryColor}
                            onChange={e =>
                              setAppearanceSettings({
                                ...appearanceSettings,
                                primaryColor: e.target.value,
                              })
                            }
                            placeholder='#3b82f6'
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          id='compactMode'
                          checked={appearanceSettings.compactMode}
                          onChange={e =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              compactMode: e.target.checked,
                            })
                          }
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <Label
                          htmlFor='compactMode'
                          style={{
                            color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                          }}
                        >
                          Compact Mode (Reduced spacing and padding)
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Layout Settings */}
                  <Card
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <CardHeader>
                      <CardTitle
                        style={{
                          color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                        }}
                        className='flex items-center gap-2'
                      >
                        <Settings className='w-5 h-5' />
                        Layout & Navigation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-2'>
                          <Label
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Sidebar Position
                          </Label>
                          <Select defaultValue='left'>
                            <SelectTrigger
                              style={{
                                backgroundColor:
                                  theme === 'dark' ? '#4b5563' : '#ffffff',
                                borderColor:
                                  theme === 'dark' ? '#6b7280' : '#e5e7eb',
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='left'>Left Sidebar</SelectItem>
                              <SelectItem value='right'>
                                Right Sidebar
                              </SelectItem>
                              <SelectItem value='top'>
                                Top Navigation
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-2'>
                          <Label
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Content Width
                          </Label>
                          <Select defaultValue='standard'>
                            <SelectTrigger
                              style={{
                                backgroundColor:
                                  theme === 'dark' ? '#4b5563' : '#ffffff',
                                borderColor:
                                  theme === 'dark' ? '#6b7280' : '#e5e7eb',
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='narrow'>
                                Narrow (1200px)
                              </SelectItem>
                              <SelectItem value='standard'>
                                Standard (1400px)
                              </SelectItem>
                              <SelectItem value='wide'>
                                Wide (1600px)
                              </SelectItem>
                              <SelectItem value='full'>Full Width</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <Label
                          style={{
                            color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                          }}
                        >
                          Dashboard Layout
                        </Label>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                          {[
                            { name: 'Grid Layout', value: 'grid', icon: '⊞' },
                            { name: 'List Layout', value: 'list', icon: '☰' },
                            { name: 'Card Layout', value: 'cards', icon: '▢' },
                          ].map(layout => (
                            <div
                              key={layout.value}
                              className='relative cursor-pointer rounded-lg p-4 border-2 border-gray-200 hover:border-gray-300 transition-all'
                            >
                              <div className='text-2xl mb-2'>{layout.icon}</div>
                              <p className='text-sm font-medium'>
                                {layout.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value='company' className='space-y-6'>
                <div className='space-y-6'>
                  <Card
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <CardHeader>
                      <CardTitle
                        style={{
                          color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                        }}
                      >
                        Company Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='company-name'
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Company Name
                          </Label>
                          <Input
                            id='company-name'
                            name='company-name'
                            placeholder='Enter company name'
                            value={companyInfo.name}
                            onChange={e =>
                              setCompanyInfo({
                                ...companyInfo,
                                name: e.target.value,
                              })
                            }
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='company-email'
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Company Email
                          </Label>
                          <Input
                            id='company-email'
                            name='company-email'
                            type='email'
                            placeholder='contact@company.com'
                            value={companyInfo.email}
                            onChange={e =>
                              setCompanyInfo({
                                ...companyInfo,
                                email: e.target.value,
                              })
                            }
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='company-address'
                          style={{
                            color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                          }}
                        >
                          Company Address
                        </Label>
                        <Textarea
                          id='company-address'
                          name='company-address'
                          placeholder='Enter full company address'
                          rows={3}
                          value={companyInfo.address}
                          onChange={e =>
                            setCompanyInfo({
                              ...companyInfo,
                              address: e.target.value,
                            })
                          }
                          style={{
                            backgroundColor:
                              theme === 'dark' ? '#4b5563' : '#ffffff',
                            borderColor:
                              theme === 'dark' ? '#6b7280' : '#e5e7eb',
                            color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                          }}
                        />
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='company-phone'
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Phone Number
                          </Label>
                          <Input
                            id='company-phone'
                            name='company-phone'
                            type='tel'
                            placeholder='+1 (555) 123-4567'
                            value={companyInfo.phone}
                            onChange={e =>
                              setCompanyInfo({
                                ...companyInfo,
                                phone: e.target.value,
                              })
                            }
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='company-website'
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Website
                          </Label>
                          <Input
                            id='company-website'
                            name='company-website'
                            type='url'
                            placeholder='https://company.com'
                            value={companyInfo.website}
                            onChange={e =>
                              setCompanyInfo({
                                ...companyInfo,
                                website: e.target.value,
                              })
                            }
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Business Details */}
                  <Card
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <CardHeader>
                      <CardTitle
                        style={{
                          color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                        }}
                        className='flex items-center gap-2'
                      >
                        <FileText className='w-5 h-5' />
                        Business Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='vat-number'
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            VAT Number
                          </Label>
                          <Input
                            id='vat-number'
                            name='vat-number'
                            placeholder='GB123456789'
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='company-number'
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Company Number
                          </Label>
                          <Input
                            id='company-number'
                            name='company-number'
                            placeholder='12345678'
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Industry
                          </Label>
                          <Select defaultValue='construction'>
                            <SelectTrigger
                              style={{
                                backgroundColor:
                                  theme === 'dark' ? '#4b5563' : '#ffffff',
                                borderColor:
                                  theme === 'dark' ? '#6b7280' : '#e5e7eb',
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='construction'>
                                Construction
                              </SelectItem>
                              <SelectItem value='architecture'>
                                Architecture
                              </SelectItem>
                              <SelectItem value='engineering'>
                                Engineering
                              </SelectItem>
                              <SelectItem value='consulting'>
                                Consulting
                              </SelectItem>
                              <SelectItem value='development'>
                                Property Development
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label
                          style={{
                            color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                          }}
                        >
                          Company Description
                        </Label>
                        <Textarea
                          placeholder='Brief description of your company and services...'
                          rows={4}
                          style={{
                            backgroundColor:
                              theme === 'dark' ? '#4b5563' : '#ffffff',
                            borderColor:
                              theme === 'dark' ? '#6b7280' : '#e5e7eb',
                            color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Go Live Section */}
                  <GoLiveSection />
                </div>
              </TabsContent>

              <TabsContent value='projects' className='space-y-6'>
                <div className='space-y-6'>
                  <Card
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <CardHeader>
                      <CardTitle
                        style={{
                          color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                        }}
                      >
                        Project Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='project-prefix'
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Project Number Prefix
                          </Label>
                          <Input
                            id='project-prefix'
                            name='project-prefix'
                            placeholder='PRJ'
                            value={projectSettings.prefix}
                            onChange={e =>
                              setProjectSettings({
                                ...projectSettings,
                                prefix: e.target.value,
                              })
                            }
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='next-project-number'
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Next Project Number
                          </Label>
                          <Input
                            id='next-project-number'
                            name='next-project-number'
                            placeholder='1001'
                            type='number'
                            value={projectSettings.nextNumber}
                            onChange={e =>
                              setProjectSettings({
                                ...projectSettings,
                                nextNumber: parseInt(e.target.value) || 1,
                              })
                            }
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label
                          style={{
                            color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                          }}
                        >
                          Project Number Format
                        </Label>
                        <Select
                          value={projectSettings.format}
                          onValueChange={value =>
                            setProjectSettings({
                              ...projectSettings,
                              format: value,
                            })
                          }
                        >
                          <SelectTrigger
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='prefix-number'>
                              PRJ-1001
                            </SelectItem>
                            <SelectItem value='year-number'>
                              2024-1001
                            </SelectItem>
                            <SelectItem value='sequential'>1001</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value='finance' className='space-y-6'>
                <div className='space-y-6'>
                  <Card
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <CardHeader>
                      <CardTitle
                        style={{
                          color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                        }}
                      >
                        Finance Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='estimate-prefix'
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Estimate Prefix
                          </Label>
                          <Input
                            id='estimate-prefix'
                            name='estimate-prefix'
                            placeholder='EST'
                            value={financeSettings.estimatePrefix}
                            onChange={e =>
                              setFinanceSettings({
                                ...financeSettings,
                                estimatePrefix: e.target.value,
                              })
                            }
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='next-estimate-number'
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Next Estimate Number
                          </Label>
                          <Input
                            id='next-estimate-number'
                            name='next-estimate-number'
                            placeholder='2001'
                            type='number'
                            value={financeSettings.nextEstimateNumber}
                            onChange={e =>
                              setFinanceSettings({
                                ...financeSettings,
                                nextEstimateNumber:
                                  parseInt(e.target.value) || 1,
                              })
                            }
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Invoice Prefix
                          </Label>
                          <Input
                            placeholder='INV'
                            value={financeSettings.invoicePrefix}
                            onChange={e =>
                              setFinanceSettings({
                                ...financeSettings,
                                invoicePrefix: e.target.value,
                              })
                            }
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Next Invoice Number
                          </Label>
                          <Input
                            placeholder='3001'
                            type='number'
                            value={financeSettings.nextInvoiceNumber}
                            onChange={e =>
                              setFinanceSettings({
                                ...financeSettings,
                                nextInvoiceNumber:
                                  parseInt(e.target.value) || 1,
                              })
                            }
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Currency
                          </Label>
                          <Select
                            value={financeSettings.currency}
                            onValueChange={value =>
                              setFinanceSettings({
                                ...financeSettings,
                                currency: value,
                              })
                            }
                          >
                            <SelectTrigger
                              style={{
                                backgroundColor:
                                  theme === 'dark' ? '#4b5563' : '#ffffff',
                                borderColor:
                                  theme === 'dark' ? '#6b7280' : '#e5e7eb',
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='GBP'>£ GBP</SelectItem>
                              <SelectItem value='EUR'>€ EUR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label
                            style={{
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          >
                            Tax Rate (%)
                          </Label>
                          <Input
                            placeholder='20'
                            type='number'
                            value={financeSettings.taxRate}
                            onChange={e =>
                              setFinanceSettings({
                                ...financeSettings,
                                taxRate: parseFloat(e.target.value) || 0,
                              })
                            }
                            style={{
                              backgroundColor:
                                theme === 'dark' ? '#4b5563' : '#ffffff',
                              borderColor:
                                theme === 'dark' ? '#6b7280' : '#e5e7eb',
                              color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value='crm' className='space-y-6'>
                <div className='space-y-6'>
                  <Card
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                      borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
                    }}
                  >
                    <CardHeader>
                      <CardTitle
                        style={{
                          color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                        }}
                      >
                        CRM Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      {/* Client Settings */}
                      <div className='space-y-4'>
                        <h3
                          style={{
                            color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                          }}
                          className='text-lg font-semibold'
                        >
                          Client Settings
                        </h3>
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <Label
                              style={{
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            >
                              Client Number Prefix
                            </Label>
                            <Input
                              placeholder='CLT'
                              value={crmSettings.client.prefix}
                              onChange={e =>
                                setCrmSettings({
                                  ...crmSettings,
                                  client: {
                                    ...crmSettings.client,
                                    prefix: e.target.value,
                                  },
                                })
                              }
                              style={{
                                backgroundColor:
                                  theme === 'dark' ? '#4b5563' : '#ffffff',
                                borderColor:
                                  theme === 'dark' ? '#6b7280' : '#e5e7eb',
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label
                              style={{
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            >
                              Next Client Number
                            </Label>
                            <Input
                              placeholder='1001'
                              type='number'
                              value={crmSettings.client.nextNumber}
                              onChange={e =>
                                setCrmSettings({
                                  ...crmSettings,
                                  client: {
                                    ...crmSettings.client,
                                    nextNumber: parseInt(e.target.value) || 1,
                                  },
                                })
                              }
                              style={{
                                backgroundColor:
                                  theme === 'dark' ? '#4b5563' : '#ffffff',
                                borderColor:
                                  theme === 'dark' ? '#6b7280' : '#e5e7eb',
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Consultant Settings */}
                      <div className='space-y-4'>
                        <h3
                          style={{
                            color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                          }}
                          className='text-lg font-semibold'
                        >
                          Consultant Settings
                        </h3>
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <Label
                              style={{
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            >
                              Consultant Number Prefix
                            </Label>
                            <Input
                              placeholder='CNS'
                              value={crmSettings.consultant.prefix}
                              onChange={e =>
                                setCrmSettings({
                                  ...crmSettings,
                                  consultant: {
                                    ...crmSettings.consultant,
                                    prefix: e.target.value,
                                  },
                                })
                              }
                              style={{
                                backgroundColor:
                                  theme === 'dark' ? '#4b5563' : '#ffffff',
                                borderColor:
                                  theme === 'dark' ? '#6b7280' : '#e5e7eb',
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label
                              style={{
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            >
                              Next Consultant Number
                            </Label>
                            <Input
                              placeholder='1001'
                              type='number'
                              value={crmSettings.consultant.nextNumber}
                              onChange={e =>
                                setCrmSettings({
                                  ...crmSettings,
                                  consultant: {
                                    ...crmSettings.consultant,
                                    nextNumber: parseInt(e.target.value) || 1,
                                  },
                                })
                              }
                              style={{
                                backgroundColor:
                                  theme === 'dark' ? '#4b5563' : '#ffffff',
                                borderColor:
                                  theme === 'dark' ? '#6b7280' : '#e5e7eb',
                                color: theme === 'dark' ? '#f9fafb' : '#1e293b',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value='demo-data' className='space-y-6'>
                <DemoDataManagement />
                <GoLiveSection />
              </TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Save Button */}
        <div className='mt-6 flex justify-end'>
          <Button
            className='flex items-center gap-2'
            onClick={handleSaveSettings}
            style={{
              backgroundColor: theme === 'dark' ? '#3b82f6' : '#3b82f6',
              color: '#ffffff',
            }}
          >
            <Save className='w-4 h-4' />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
