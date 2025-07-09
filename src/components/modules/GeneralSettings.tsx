import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Bell,
  Database,
  Key,
  Globe,
  Save,
  RotateCcw,
  Check,
  Info,
  AlertTriangle,
  Download,
  Upload,
  Eye,
  EyeOff,
  Image,
  Type,
  ChevronRight,
} from 'lucide-react';
import { demoDataService } from '../../services/demoData';
import ThemeSwitcher from '../ThemeSwitcher';
import { useLogo } from '../../contexts/LogoContext';

interface GeneralSettingsProps {
  onNavigateToModule?: (module: string) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  onNavigateToModule,
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { updateMainLogo, updateSidebarLogo } = useLogo();

  const [settings, setSettings] = useState({
    general: {
      companyName: 'Archer Business Management',
      businessAddress: '123 Business Street, London, UK',
      contactEmail: 'contact@archerbms.com',
      phoneNumber: '+44 20 1234 5678',
      timezone: 'Europe/London',
      currency: 'GBP',
      language: 'en',
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      loginAttempts: 5,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      desktopNotifications: true,
      notificationFrequency: 'immediate',
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 365,
      performanceMode: false,
    },
    performance: {
      cacheEnabled: true,
      cacheExpiry: 3600,
      compressionEnabled: true,
      imageOptimization: true,
    },
  });

  const tabs = [
    {
      id: 'general',
      name: 'General',
      icon: Settings,
      description: 'Company information and basic settings',
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Password, authentication, and security settings',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'Email and notification preferences',
    },
    {
      id: 'data',
      name: 'Data & Backup',
      icon: Database,
      description: 'Backup settings and demo data management',
    },
    {
      id: 'api',
      name: 'API & Integrations',
      icon: Key,
      description: 'API keys and external integrations',
    },
    {
      id: 'performance',
      name: 'Performance',
      icon: Globe,
      description: 'System performance and caching settings',
    },
  ];

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const handleReset = () => {
    setSettings({
      general: {
        companyName: 'Archer Business Management',
        businessAddress: '123 Business Street, London, UK',
        contactEmail: 'contact@archerbms.com',
        phoneNumber: '+44 20 1234 5678',
        timezone: 'Europe/London',
        currency: 'GBP',
        language: 'en',
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordPolicy: 'strong',
        loginAttempts: 5,
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        desktopNotifications: true,
        notificationFrequency: 'immediate',
      },
      system: {
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetention: 365,
        performanceMode: false,
      },
      performance: {
        cacheEnabled: true,
        cacheExpiry: 3600,
        compressionEnabled: true,
        imageOptimization: true,
      },
    });
  };

  const handleInsertDemoData = async () => {
    setLoadingDemo(true);
    setDemoMessage(null);
    try {
      await demoDataService.resetToDemo();
      setDemoMessage('Demo data inserted successfully.');
      window.location.reload();
    } catch (e) {
      setDemoMessage('Failed to insert demo data.');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleDeleteDemoData = async () => {
    setLoadingDemo(true);
    setDemoMessage(null);
    try {
      await demoDataService.clearAllDemoData();
      setDemoMessage('All demo data deleted.');
      window.location.reload();
    } catch (e) {
      setDemoMessage('Failed to delete demo data.');
    } finally {
      setLoadingDemo(false);
    }
  };

  const resetLogos = () => {
    updateMainLogo({ type: 'text', text: 'Archer Business Management' });
    updateSidebarLogo({ type: 'icon', icon: 'home' });
  };

  return (
    <div className='max-w-7xl mx-auto bg-white rounded-xl shadow-lg'>
      {/* Header */}
      <div className='border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
            <p className='text-gray-600'>
              Configure your application settings and preferences
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <button
              onClick={handleReset}
              className='flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
            >
              <RotateCcw className='h-4 w-4 mr-2' />
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                saveStatus === 'saving'
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-archer-neon text-black hover:bg-archer-black hover:text-white'
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className='h-4 w-4 mr-2' />
                  Saved!
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex'>
        {/* Vertical Tab Navigation */}
        <div className='w-64 border-r border-gray-200 bg-gray-50'>
          <nav className='p-4 space-y-2'>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-archer-neon shadow-sm border border-archer-neon/20'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mr-3 ${isActive ? 'text-archer-neon' : 'text-gray-400'}`}
                  />
                  <div className='flex-1'>
                    <div className='font-medium'>{tab.name}</div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {tab.description}
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className='h-4 w-4 text-archer-neon' />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='flex-1 p-6'>
          {activeTab === 'general' && (
            <div className='space-y-8'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  General Settings
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  {/* Company Information */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Company Information
                    </h3>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Company Name
                      </label>
                      <input
                        type='text'
                        value={settings.general.companyName}
                        onChange={e =>
                          updateSetting(
                            'general',
                            'companyName',
                            e.target.value
                          )
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Business Address
                      </label>
                      <textarea
                        value={settings.general.businessAddress}
                        onChange={e =>
                          updateSetting(
                            'general',
                            'businessAddress',
                            e.target.value
                          )
                        }
                        rows={3}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Contact Email
                      </label>
                      <input
                        type='email'
                        value={settings.general.contactEmail}
                        onChange={e =>
                          updateSetting(
                            'general',
                            'contactEmail',
                            e.target.value
                          )
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Phone Number
                      </label>
                      <input
                        type='tel'
                        value={settings.general.phoneNumber}
                        onChange={e =>
                          updateSetting(
                            'general',
                            'phoneNumber',
                            e.target.value
                          )
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                      />
                    </div>
                  </div>

                  {/* Regional Settings */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Regional Settings
                    </h3>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Timezone
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={e =>
                          updateSetting('general', 'timezone', e.target.value)
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                      >
                        <option value='Europe/London'>
                          Europe/London (GMT)
                        </option>
                        <option value='Europe/Paris'>Europe/Paris (CET)</option>
                        <option value='America/New_York'>
                          America/New_York (EST)
                        </option>
                        <option value='America/Los_Angeles'>
                          America/Los_Angeles (PST)
                        </option>
                        <option value='Asia/Tokyo'>Asia/Tokyo (JST)</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Currency
                      </label>
                      <select
                        value={settings.general.currency}
                        onChange={e =>
                          updateSetting('general', 'currency', e.target.value)
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                      >
                        <option value='GBP'>GBP (£)</option>
                        <option value='EUR'>EUR (€)</option>
                        <option value='USD'>USD ($)</option>
                        <option value='JPY'>JPY (¥)</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Language
                      </label>
                      <select
                        value={settings.general.language}
                        onChange={e =>
                          updateSetting('general', 'language', e.target.value)
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                      >
                        <option value='en'>English</option>
                        <option value='es'>Spanish</option>
                        <option value='fr'>French</option>
                        <option value='de'>German</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Settings */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Theme & Appearance
                </h3>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <ThemeSwitcher />
                </div>
              </div>

              {/* Logo Settings */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Logo Settings
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                    <div>
                      <h4 className='font-medium text-gray-900'>Main Logo</h4>
                      <p className='text-sm text-gray-600'>
                        Customize your main application logo
                      </p>
                    </div>
                    <button className='bg-archer-neon text-black px-4 py-2 rounded-lg font-medium hover:bg-archer-black hover:text-white transition-colors'>
                      <Image className='h-4 w-4 mr-2 inline' />
                      Change Logo
                    </button>
                  </div>
                  <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                    <div>
                      <h4 className='font-medium text-gray-900'>
                        Sidebar Logo
                      </h4>
                      <p className='text-sm text-gray-600'>
                        Customize your sidebar logo
                      </p>
                    </div>
                    <button className='bg-archer-neon text-black px-4 py-2 rounded-lg font-medium hover:bg-archer-black hover:text-white transition-colors'>
                      <Image className='h-4 w-4 mr-2 inline' />
                      Change Logo
                    </button>
                  </div>
                  <button
                    onClick={resetLogos}
                    className='w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors'
                  >
                    Reset to Default Logos
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className='space-y-8'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  Security Settings
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  {/* Authentication */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Authentication
                    </h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            Two-Factor Authentication
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={settings.security.twoFactorAuth}
                            onChange={e =>
                              updateSetting(
                                'security',
                                'twoFactorAuth',
                                e.target.checked
                              )
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-archer-neon rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-archer-neon"></div>
                        </label>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Session Timeout (minutes)
                        </label>
                        <select
                          value={settings.security.sessionTimeout}
                          onChange={e =>
                            updateSetting(
                              'security',
                              'sessionTimeout',
                              parseInt(e.target.value)
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Password Policy
                        </label>
                        <select
                          value={settings.security.passwordPolicy}
                          onChange={e =>
                            updateSetting(
                              'security',
                              'passwordPolicy',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                        >
                          <option value='basic'>Basic (8+ characters)</option>
                          <option value='strong'>
                            Strong (12+ characters, mixed case, numbers)
                          </option>
                          <option value='very-strong'>
                            Very Strong (16+ characters, special chars)
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Password Change */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Change Password
                    </h3>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Current Password
                        </label>
                        <div className='relative'>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                          />
                          <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute inset-y-0 right-0 pr-3 flex items-center'
                          >
                            {showPassword ? (
                              <EyeOff className='h-4 w-4 text-gray-400' />
                            ) : (
                              <Eye className='h-4 w-4 text-gray-400' />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          New Password
                        </label>
                        <div className='relative'>
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                          />
                          <button
                            type='button'
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className='absolute inset-y-0 right-0 pr-3 flex items-center'
                          >
                            {showNewPassword ? (
                              <EyeOff className='h-4 w-4 text-gray-400' />
                            ) : (
                              <Eye className='h-4 w-4 text-gray-400' />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Confirm New Password
                        </label>
                        <input
                          type='password'
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                        />
                      </div>
                      <button className='w-full bg-archer-neon text-black py-2 px-4 rounded-lg font-medium hover:bg-archer-black hover:text-white transition-colors'>
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className='space-y-8'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  Notification Settings
                </h2>
                <div className='space-y-6'>
                  {/* Email Notifications */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Email Notifications
                    </h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            Email Notifications
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Receive notifications via email
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={settings.notifications.emailNotifications}
                            onChange={e =>
                              updateSetting(
                                'notifications',
                                'emailNotifications',
                                e.target.checked
                              )
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-archer-neon rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-archer-neon"></div>
                        </label>
                      </div>
                      <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            Push Notifications
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Receive push notifications in your browser
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={settings.notifications.pushNotifications}
                            onChange={e =>
                              updateSetting(
                                'notifications',
                                'pushNotifications',
                                e.target.checked
                              )
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-archer-neon rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-archer-neon"></div>
                        </label>
                      </div>
                      <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            Desktop Notifications
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Show desktop notifications
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={
                              settings.notifications.desktopNotifications
                            }
                            onChange={e =>
                              updateSetting(
                                'notifications',
                                'desktopNotifications',
                                e.target.checked
                              )
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-archer-neon rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-archer-neon"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Notification Frequency */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Notification Frequency
                    </h3>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Notification Frequency
                      </label>
                      <select
                        value={settings.notifications.notificationFrequency}
                        onChange={e =>
                          updateSetting(
                            'notifications',
                            'notificationFrequency',
                            e.target.value
                          )
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                      >
                        <option value='immediate'>Immediate</option>
                        <option value='hourly'>Hourly</option>
                        <option value='daily'>Daily</option>
                        <option value='weekly'>Weekly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className='space-y-8'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  Data & Backup Settings
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  {/* Backup Settings */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Backup Settings
                    </h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            Auto Backup
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Automatically backup your data
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={settings.system.autoBackup}
                            onChange={e =>
                              updateSetting(
                                'system',
                                'autoBackup',
                                e.target.checked
                              )
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-archer-neon rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-archer-neon"></div>
                        </label>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Backup Frequency
                        </label>
                        <select
                          value={settings.system.backupFrequency}
                          onChange={e =>
                            updateSetting(
                              'system',
                              'backupFrequency',
                              e.target.value
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                        >
                          <option value='daily'>Daily</option>
                          <option value='weekly'>Weekly</option>
                          <option value='monthly'>Monthly</option>
                        </select>
                      </div>
                      <div className='flex space-x-3'>
                        <button className='flex-1 bg-archer-neon text-black py-2 px-4 rounded-lg font-medium hover:bg-archer-black hover:text-white transition-colors'>
                          <Download className='h-4 w-4 mr-2 inline' />
                          Download Backup
                        </button>
                        <button className='flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors'>
                          <Upload className='h-4 w-4 mr-2 inline' />
                          Restore Backup
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Demo Data Management */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Demo Data Management
                    </h3>
                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                      <div className='flex'>
                        <AlertTriangle className='h-5 w-5 text-yellow-400 mr-2 mt-0.5' />
                        <div>
                          <h4 className='text-sm font-medium text-yellow-800'>
                            Demo Data Warning
                          </h4>
                          <p className='text-sm text-yellow-700 mt-1'>
                            These actions will affect all demo data in the
                            system. Use with caution.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='space-y-3'>
                      <button
                        onClick={handleDeleteDemoData}
                        disabled={loadingDemo}
                        className='w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50'
                      >
                        {loadingDemo ? 'Deleting...' : 'Clear All Demo Data'}
                      </button>
                      <button
                        onClick={handleInsertDemoData}
                        disabled={loadingDemo}
                        className='w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50'
                      >
                        {loadingDemo ? 'Inserting...' : 'Reset to Demo Data'}
                      </button>
                    </div>
                    {demoMessage && (
                      <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                        <p className='text-sm text-blue-800'>{demoMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className='space-y-8'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  API & Integration Settings
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      API Keys
                    </h3>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        API Key
                      </label>
                      <div className='relative'>
                        <input
                          type='password'
                          defaultValue='sk-1234567890abcdef'
                          readOnly
                          className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent bg-gray-50'
                        />
                        <button className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                          <Eye className='h-4 w-4 text-gray-400' />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Webhook URL
                      </label>
                      <input
                        type='url'
                        placeholder='https://your-domain.com/webhook'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                      />
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Rate Limits
                    </h3>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Requests per minute
                      </label>
                      <input
                        type='number'
                        defaultValue='100'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Maximum file size
                      </label>
                      <input
                        type='text'
                        defaultValue='10MB'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className='space-y-8'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  Performance Settings
                </h2>
                <div className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Caching Settings
                    </h3>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                        <div>
                          <label className='text-sm font-medium text-gray-700'>
                            Cache Enabled
                          </label>
                          <p className='text-xs text-gray-500'>
                            Enable system caching for better performance
                          </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={settings.performance.cacheEnabled}
                            onChange={e =>
                              updateSetting(
                                'performance',
                                'cacheEnabled',
                                e.target.checked
                              )
                            }
                            className='sr-only peer'
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-archer-neon rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-archer-neon"></div>
                        </label>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Cache Expiry (seconds)
                        </label>
                        <input
                          type='number'
                          value={settings.performance.cacheExpiry}
                          onChange={e =>
                            updateSetting(
                              'performance',
                              'cacheExpiry',
                              parseInt(e.target.value)
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
