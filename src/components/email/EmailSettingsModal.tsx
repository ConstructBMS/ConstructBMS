import React, { useState } from 'react';
import {
  X,
  Save,
  RefreshCw,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Globe,
  Database,
  Cloud,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  User,
  Mail,
  Calendar,
  Clock,
  Star,
  Flag,
  Archive,
  Trash2,
  Folder,
  Tag,
  Filter,
  Search,
  MessageCircle,
  Download,
  Upload,
  Lock,
  Unlock,
  Key,
  Server,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Plus,
  Check,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Zap,
  Smartphone as PhoneIcon,
} from 'lucide-react';

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EmailProvider {
  icon: string;
  imap: { port: number; secure: boolean, server: string; 
};
  name: string;
  smtp: { port: number; secure: boolean, server: string; };
}

interface EmailProviders {
  [key: string]: EmailProvider;
}

const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addAccountMode, setAddAccountMode] = useState<'auto' | 'manual'>(
    'auto'
  );
  const [newAccount, setNewAccount] = useState({
    email: '',
    password: '',
    provider: '',
    imapServer: '',
    imapPort: 993,
    smtpServer: '',
    smtpPort: 587,
    secure: true,
  });
  const [settings, setSettings] = useState({
    // General Settings
    defaultView: 'compact',
    readingPane: 'right',
    zoomLevel: 100,
    autoSave: true,
    autoSaveInterval: 5,

    // Account Settings
    accounts: [
      {
        id: '1',
        name: 'john@constructbms.com',
        type: 'IMAP',
                  server: 'imap.constructbms.com',
        port: 993,
        secure: true,
        active: true,
      },
      {
        id: '2',
        name: 'john@gmail.com',
        type: 'IMAP',
        server: 'imap.gmail.com',
        port: 993,
        secure: true,
        active: false,
      },
    ],

    // Send/Receive Settings
    sendReceiveInterval: 5,
    workOffline: false,
    downloadAttachments: true,
    downloadImages: false,
    syncAllFolders: true,

    // Security Settings
    encryption: 'TLS',
    requireAuth: true,
    blockExternalImages: true,
    scanAttachments: true,
    phishingProtection: true,

    // Notification Settings
    desktopNotifications: true,
    soundNotifications: true,
    emailNotifications: true,
    notificationDuration: 5,

    // AI Insights Settings
    aiInsightsEnabled: true,
    autoShowAIInsights: true,
    aiInsightsQuality: 'standard',
    maxAISuggestions: 3,

    // Appearance Settings
    theme: 'light',
    emailStyle: 'outlook', // New: outlook or gmail
    fontSize: 'medium',
    fontFamily: 'Segoe UI',
    showPreview: true,
    showSenderImage: true,

    // Advanced Settings
    cacheSize: 100,
    autoArchive: true,
    archiveAfter: 30,
    deleteAfter: 90,
    maxMessageSize: 25,
  });

  // Email provider configurations
  const emailProviders: EmailProviders = {
    'gmail.com': {
      name: 'Gmail',
      imap: { server: 'imap.gmail.com', port: 993, secure: true },
      smtp: { server: 'smtp.gmail.com', port: 587, secure: true },
      icon: '📧',
    },
    'outlook.com': {
      name: 'Outlook',
      imap: { server: 'outlook.office365.com', port: 993, secure: true },
      smtp: { server: 'smtp-mail.outlook.com', port: 587, secure: true },
      icon: '📧',
    },
    'yahoo.com': {
      name: 'Yahoo Mail',
      imap: { server: 'imap.mail.yahoo.com', port: 993, secure: true },
      smtp: { server: 'smtp.mail.yahoo.com', port: 587, secure: true },
      icon: '📧',
    },
    'icloud.com': {
      name: 'iCloud',
      imap: { server: 'imap.mail.me.com', port: 993, secure: true },
      smtp: { server: 'smtp.mail.me.com', port: 587, secure: true },
      icon: '📧',
    },
  };

  const tabs = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'accounts', label: 'Accounts', icon: User },
    { key: 'sendReceive', label: 'Send/Receive', icon: RefreshCw },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'appearance', label: 'Appearance', icon: Eye },
    { key: 'advanced', label: 'Advanced', icon: Database },
  ];

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAccountChange = (
    accountId: string,
    field: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      accounts: prev.accounts.map(acc =>
        acc.id === accountId ? { ...acc, [field]: value } : acc
      ),
    }));
  };

  const detectProvider = (email: string): EmailProvider | null => {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? emailProviders[domain] || null : null;
  };

  const handleEmailChange = (email: string) => {
    setNewAccount(prev => ({ ...prev, email }));
    if (addAccountMode === 'auto') {
      const provider = detectProvider(email);
      if (provider) {
        setNewAccount(prev => ({
          ...prev,
          email,
          provider: provider.name,
          imapServer: provider.imap.server,
          imapPort: provider.imap.port,
          smtpServer: provider.smtp.server,
          smtpPort: provider.smtp.port,
          secure: provider.imap.secure,
        }));
      }
    }
  };

  const addAccount = () => {
    if (!newAccount.email || !newAccount.password) {
      alert('Please enter email and password');
      return;
    }

    const newAccountData = {
      id: Date.now().toString(),
      name: newAccount.email,
      type: 'IMAP',
      server: newAccount.imapServer,
      port: newAccount.imapPort,
      secure: newAccount.secure,
      active: true,
      smtpServer: newAccount.smtpServer,
      smtpPort: newAccount.smtpPort,
    };

    setSettings(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAccountData],
    }));

    // Reset form
    setNewAccount({
      email: '',
      password: '',
      provider: '',
      imapServer: '',
      imapPort: 993,
      smtpServer: '',
      smtpPort: 587,
      secure: true,
    });
    setShowAddAccount(false);
    setAddAccountMode('auto');
  };

  const saveSettings = () => {
    // Save settings to backend/localStorage
    console.log('Saving settings:', settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-4/5 h-4/5 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Email Settings
          </h2>
          <div className='flex items-center space-x-2'>
            <button
              onClick={saveSettings}
              className='flex items-center space-x-2 px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-opacity-90 transition-colors'
            >
              <Save className='w-4 h-4' />
              <span>Save</span>
            </button>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 flex overflow-hidden'>
          {/* Sidebar */}
          <div className='w-64 bg-gray-50 border-r border-gray-200 p-4'>
            <nav className='space-y-1'>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.key
                        ? 'bg-constructbms-blue text-black'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    <Icon className='w-4 h-4' />
                    <span className='font-medium'>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className='flex-1 overflow-y-auto p-6'>
            {activeTab === 'general' && (
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-semibold mb-4'>
                    General Settings
                  </h3>
                  <div className='grid grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Default View
                      </label>
                      <select
                        value={settings.defaultView}
                        onChange={e =>
                          handleSettingChange(
                            'general',
                            'defaultView',
                            e.target.value
                          )
                        }
                        className='w-full border border-gray-300 rounded-lg px-3 py-2'
                      >
                        <option value='compact'>Compact</option>
                        <option value='single'>Single Line</option>
                        <option value='preview'>Preview</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Reading Pane
                      </label>
                      <select
                        value={settings.readingPane}
                        onChange={e =>
                          handleSettingChange(
                            'general',
                            'readingPane',
                            e.target.value
                          )
                        }
                        className='w-full border border-gray-300 rounded-lg px-3 py-2'
                      >
                        <option value='right'>Right</option>
                        <option value='bottom'>Bottom</option>
                        <option value='off'>Off</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Zoom Level
                      </label>
                      <select
                        value={settings.zoomLevel}
                        onChange={e =>
                          handleSettingChange(
                            'general',
                            'zoomLevel',
                            parseInt(e.target.value)
                          )
                        }
                        className='w-full border border-gray-300 rounded-lg px-3 py-2'
                      >
                        <option value={75}>75%</option>
                        <option value={100}>100%</option>
                        <option value={125}>125%</option>
                        <option value={150}>150%</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Auto Save
                      </label>
                      <div className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          checked={settings.autoSave}
                          onChange={e =>
                            handleSettingChange(
                              'general',
                              'autoSave',
                              e.target.checked
                            )
                          }
                          className='rounded'
                        />
                        <span className='text-sm text-gray-600'>
                          Auto-save drafts
                        </span>
                      </div>
                      {settings.autoSave && (
                        <div className='mt-2'>
                          <input
                            type='number'
                            value={settings.autoSaveInterval}
                            onChange={e =>
                              handleSettingChange(
                                'general',
                                'autoSaveInterval',
                                parseInt(e.target.value)
                              )
                            }
                            className='w-20 border border-gray-300 rounded px-2 py-1 text-sm'
                            min='1'
                            max='60'
                          />
                          <span className='text-sm text-gray-600 ml-1'>
                            minutes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accounts' && (
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold'>Email Accounts</h3>
                  <button
                    onClick={() => setShowAddAccount(true)}
                    className='flex items-center space-x-2 px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-opacity-90 transition-colors'
                  >
                    <Plus className='w-4 h-4' />
                    <span>Add Account</span>
                  </button>
                </div>

                {/* Add Account Modal */}
                {showAddAccount && (
                  <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                    <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
                      <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                        <h3 className='text-lg font-semibold'>
                          Add Email Account
                        </h3>
                        <button
                          onClick={() => setShowAddAccount(false)}
                          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                        >
                          <X className='w-5 h-5' />
                        </button>
                      </div>

                      <div className='p-6 space-y-6'>
                        {/* Setup Mode Selection */}
                        <div>
                          <h4 className='font-medium mb-3'>Setup Method</h4>
                          <div className='grid grid-cols-2 gap-4'>
                            <button
                              onClick={() => setAddAccountMode('auto')}
                              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                addAccountMode === 'auto'
                                  ? 'border-constructbms-blue bg-constructbms-blue bg-opacity-10'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className='flex items-center space-x-2 mb-2'>
                                <Zap className='w-5 h-5 text-constructbms-blue' />
                                <span className='font-medium'>Quick Setup</span>
                              </div>
                              <p className='text-sm text-gray-600'>
                                Automatically detect settings for popular
                                providers
                              </p>
                            </button>
                            <button
                              onClick={() => setAddAccountMode('manual')}
                              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                                addAccountMode === 'manual'
                                  ? 'border-constructbms-blue bg-constructbms-blue bg-opacity-10'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className='flex items-center space-x-2 mb-2'>
                                <Settings className='w-5 h-5 text-constructbms-blue' />
                                <span className='font-medium'>
                                  Manual Setup
                                </span>
                              </div>
                              <p className='text-sm text-gray-600'>
                                Enter server settings manually
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* Account Details */}
                        <div className='space-y-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Email Address
                            </label>
                            <input
                              type='email'
                              value={newAccount.email}
                              onChange={e => handleEmailChange(e.target.value)}
                              placeholder='Enter your email address'
                              className='w-full border border-gray-300 rounded-lg px-3 py-2'
                            />
                            {addAccountMode === 'auto' &&
                              newAccount.email &&
                              detectProvider(newAccount.email) && (
                                <div className='mt-2 flex items-center space-x-2 text-sm text-green-600'>
                                  <CheckCircle className='w-4 h-4' />
                                  <span>
                                    Detected:{' '}
                                    {detectProvider(newAccount.email)?.name}
                                  </span>
                                </div>
                              )}
                          </div>

                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Password
                            </label>
                            <input
                              type='password'
                              value={newAccount.password}
                              onChange={e =>
                                setNewAccount(prev => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                              placeholder='Enter your password'
                              className='w-full border border-gray-300 rounded-lg px-3 py-2'
                            />
                          </div>

                          {addAccountMode === 'manual' && (
                            <div className='space-y-4 border-t pt-4'>
                              <h5 className='font-medium'>IMAP Settings</h5>
                              <div className='grid grid-cols-2 gap-4'>
                                <div>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    IMAP Server
                                  </label>
                                  <input
                                    type='text'
                                    value={newAccount.imapServer}
                                    onChange={e =>
                                      setNewAccount(prev => ({
                                        ...prev,
                                        imapServer: e.target.value,
                                      }))
                                    }
                                    placeholder='imap.example.com'
                                    className='w-full border border-gray-300 rounded px-2 py-1 text-sm'
                                  />
                                </div>
                                <div>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    IMAP Port
                                  </label>
                                  <input
                                    type='number'
                                    value={newAccount.imapPort}
                                    onChange={e =>
                                      setNewAccount(prev => ({
                                        ...prev,
                                        imapPort: parseInt(e.target.value),
                                      }))
                                    }
                                    className='w-full border border-gray-300 rounded px-2 py-1 text-sm'
                                  />
                                </div>
                              </div>

                              <h5 className='font-medium'>SMTP Settings</h5>
                              <div className='grid grid-cols-2 gap-4'>
                                <div>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    SMTP Server
                                  </label>
                                  <input
                                    type='text'
                                    value={newAccount.smtpServer}
                                    onChange={e =>
                                      setNewAccount(prev => ({
                                        ...prev,
                                        smtpServer: e.target.value,
                                      }))
                                    }
                                    placeholder='smtp.example.com'
                                    className='w-full border border-gray-300 rounded px-2 py-1 text-sm'
                                  />
                                </div>
                                <div>
                                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    SMTP Port
                                  </label>
                                  <input
                                    type='number'
                                    value={newAccount.smtpPort}
                                    onChange={e =>
                                      setNewAccount(prev => ({
                                        ...prev,
                                        smtpPort: parseInt(e.target.value),
                                      }))
                                    }
                                    className='w-full border border-gray-300 rounded px-2 py-1 text-sm'
                                  />
                                </div>
                              </div>

                              <div className='flex items-center space-x-2'>
                                <input
                                  type='checkbox'
                                  checked={newAccount.secure}
                                  onChange={e =>
                                    setNewAccount(prev => ({
                                      ...prev,
                                      secure: e.target.checked,
                                    }))
                                  }
                                  className='rounded'
                                />
                                <span className='text-sm text-gray-600'>
                                  Use SSL/TLS encryption
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50 space-x-2'>
                        <button
                          onClick={() => setShowAddAccount(false)}
                          className='px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addAccount}
                          className='px-4 py-2 text-sm bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-black hover:text-white transition-colors'
                        >
                          Add Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className='space-y-4'>
                  {settings.accounts.map(account => (
                    <div
                      key={account.id}
                      className='border border-gray-200 rounded-lg p-4'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center space-x-3'>
                          <input
                            type='checkbox'
                            checked={account.active}
                            onChange={e =>
                              handleAccountChange(
                                account.id,
                                'active',
                                e.target.checked
                              )
                            }
                            className='rounded'
                          />
                          <div>
                            <h4 className='font-medium'>{account.name}</h4>
                            <p className='text-sm text-gray-500'>
                              {account.type} - {account.server}:{account.port}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <button className='p-1 hover:bg-gray-100 rounded'>
                            <Settings className='w-4 h-4' />
                          </button>
                          <button className='p-1 hover:bg-gray-100 rounded text-red-600'>
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <label className='block text-gray-600 mb-1'>
                            Server
                          </label>
                          <input
                            type='text'
                            value={account.server}
                            onChange={e =>
                              handleAccountChange(
                                account.id,
                                'server',
                                e.target.value
                              )
                            }
                            className='w-full border border-gray-300 rounded px-2 py-1'
                          />
                        </div>
                        <div>
                          <label className='block text-gray-600 mb-1'>
                            Port
                          </label>
                          <input
                            type='number'
                            value={account.port}
                            onChange={e =>
                              handleAccountChange(
                                account.id,
                                'port',
                                parseInt(e.target.value)
                              )
                            }
                            className='w-full border border-gray-300 rounded px-2 py-1'
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sendReceive' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>Send/Receive Settings</h3>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Send/Receive Interval
                    </label>
                    <select
                      value={settings.sendReceiveInterval}
                      onChange={e =>
                        handleSettingChange(
                          'sendReceive',
                          'sendReceiveInterval',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-full border border-gray-300 rounded-lg px-3 py-2'
                    >
                      <option value={1}>1 minute</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={0}>Manual only</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Work Offline
                    </label>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={settings.workOffline}
                        onChange={e =>
                          handleSettingChange(
                            'sendReceive',
                            'workOffline',
                            e.target.checked
                          )
                        }
                        className='rounded'
                      />
                      <span className='text-sm text-gray-600'>
                        Work offline mode
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Download Attachments
                    </label>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={settings.downloadAttachments}
                        onChange={e =>
                          handleSettingChange(
                            'sendReceive',
                            'downloadAttachments',
                            e.target.checked
                          )
                        }
                        className='rounded'
                      />
                      <span className='text-sm text-gray-600'>
                        Auto-download attachments
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Download Images
                    </label>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={settings.downloadImages}
                        onChange={e =>
                          handleSettingChange(
                            'sendReceive',
                            'downloadImages',
                            e.target.checked
                          )
                        }
                        className='rounded'
                      />
                      <span className='text-sm text-gray-600'>
                        Auto-download images
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>Security Settings</h3>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Encryption
                    </label>
                    <select
                      value={settings.encryption}
                      onChange={e =>
                        handleSettingChange(
                          'security',
                          'encryption',
                          e.target.value
                        )
                      }
                      className='w-full border border-gray-300 rounded-lg px-3 py-2'
                    >
                      <option value='TLS'>TLS</option>
                      <option value='SSL'>SSL</option>
                      <option value='None'>None</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Authentication
                    </label>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={settings.requireAuth}
                        onChange={e =>
                          handleSettingChange(
                            'security',
                            'requireAuth',
                            e.target.checked
                          )
                        }
                        className='rounded'
                      />
                      <span className='text-sm text-gray-600'>
                        Require authentication
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Block External Images
                    </label>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={settings.blockExternalImages}
                        onChange={e =>
                          handleSettingChange(
                            'security',
                            'blockExternalImages',
                            e.target.checked
                          )
                        }
                        className='rounded'
                      />
                      <span className='text-sm text-gray-600'>
                        Block external images
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Scan Attachments
                    </label>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={settings.scanAttachments}
                        onChange={e =>
                          handleSettingChange(
                            'security',
                            'scanAttachments',
                            e.target.checked
                          )
                        }
                        className='rounded'
                      />
                      <span className='text-sm text-gray-600'>
                        Scan attachments for viruses
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>Notification Settings</h3>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Desktop Notifications
                    </label>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={settings.desktopNotifications}
                        onChange={e =>
                          handleSettingChange(
                            'notifications',
                            'desktopNotifications',
                            e.target.checked
                          )
                        }
                        className='rounded'
                      />
                      <span className='text-sm text-gray-600'>
                        Show desktop notifications
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Sound Notifications
                    </label>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={settings.soundNotifications}
                        onChange={e =>
                          handleSettingChange(
                            'notifications',
                            'soundNotifications',
                            e.target.checked
                          )
                        }
                        className='rounded'
                      />
                      <span className='text-sm text-gray-600'>
                        Play sound for new emails
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Notification Duration
                    </label>
                    <select
                      value={settings.notificationDuration}
                      onChange={e =>
                        handleSettingChange(
                          'notifications',
                          'notificationDuration',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-full border border-gray-300 rounded-lg px-3 py-2'
                    >
                      <option value={3}>3 seconds</option>
                      <option value={5}>5 seconds</option>
                      <option value={10}>10 seconds</option>
                      <option value={0}>Until dismissed</option>
                    </select>
                  </div>
                </div>

                {/* AI Insights Settings */}
                <div className='border-t pt-6'>
                  <h4 className='font-medium mb-4'>AI Insights Settings</h4>
                  <div className='grid grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Enable AI Insights
                      </label>
                      <div className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          checked={settings.aiInsightsEnabled}
                          onChange={e =>
                            handleSettingChange(
                              'notifications',
                              'aiInsightsEnabled',
                              e.target.checked
                            )
                          }
                          className='rounded'
                        />
                        <span className='text-sm text-gray-600'>
                          Show AI insights for emails
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Auto-show Insights
                      </label>
                      <div className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          checked={settings.autoShowAIInsights}
                          onChange={e =>
                            handleSettingChange(
                              'notifications',
                              'autoShowAIInsights',
                              e.target.checked
                            )
                          }
                          className='rounded'
                        />
                        <span className='text-sm text-gray-600'>
                          Automatically show AI insights
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Insights Quality
                      </label>
                      <select
                        value={settings.aiInsightsQuality}
                        onChange={e =>
                          handleSettingChange(
                            'notifications',
                            'aiInsightsQuality',
                            e.target.value
                          )
                        }
                        className='w-full border border-gray-300 rounded-lg px-3 py-2'
                      >
                        <option value='basic'>Basic</option>
                        <option value='standard'>Standard</option>
                        <option value='detailed'>Detailed</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Max Suggestions
                      </label>
                      <select
                        value={settings.maxAISuggestions}
                        onChange={e =>
                          handleSettingChange(
                            'notifications',
                            'maxAISuggestions',
                            parseInt(e.target.value)
                          )
                        }
                        className='w-full border border-gray-300 rounded-lg px-3 py-2'
                      >
                        <option value={2}>2 suggestions</option>
                        <option value={3}>3 suggestions</option>
                        <option value={5}>5 suggestions</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>Appearance Settings</h3>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Theme
                    </label>
                    <select
                      value={settings.theme}
                      onChange={e =>
                        handleSettingChange(
                          'appearance',
                          'theme',
                          e.target.value
                        )
                      }
                      className='w-full border border-gray-300 rounded-lg px-3 py-2'
                    >
                      <option value='light'>Light</option>
                      <option value='dark'>Dark</option>
                      <option value='auto'>Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Style
                    </label>
                    <select
                      value={settings.emailStyle}
                      onChange={e =>
                        handleSettingChange(
                          'appearance',
                          'emailStyle',
                          e.target.value
                        )
                      }
                      className='w-full border border-gray-300 rounded-lg px-3 py-2'
                    >
                      <option value='outlook'>Outlook Style</option>
                      <option value='gmail'>Gmail Style</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Font Size
                    </label>
                    <select
                      value={settings.fontSize}
                      onChange={e =>
                        handleSettingChange(
                          'appearance',
                          'fontSize',
                          e.target.value
                        )
                      }
                      className='w-full border border-gray-300 rounded-lg px-3 py-2'
                    >
                      <option value='small'>Small</option>
                      <option value='medium'>Medium</option>
                      <option value='large'>Large</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Font Family
                    </label>
                    <select
                      value={settings.fontFamily}
                      onChange={e =>
                        handleSettingChange(
                          'appearance',
                          'fontFamily',
                          e.target.value
                        )
                      }
                      className='w-full border border-gray-300 rounded-lg px-3 py-2'
                    >
                      <option value='Segoe UI'>Segoe UI</option>
                      <option value='Arial'>Arial</option>
                      <option value='Calibri'>Calibri</option>
                      <option value='Times New Roman'>Times New Roman</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Show Preview
                    </label>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={settings.showPreview}
                        onChange={e =>
                          handleSettingChange(
                            'appearance',
                            'showPreview',
                            e.target.checked
                          )
                        }
                        className='rounded'
                      />
                      <span className='text-sm text-gray-600'>
                        Show email preview
                      </span>
                    </div>
                  </div>
                </div>

                {/* Style Preview */}
                <div className='border-t pt-6'>
                  <h4 className='font-medium mb-4'>Style Preview</h4>
                  <div className='grid grid-cols-2 gap-6'>
                    <div
                      className={`p-4 border-2 rounded-lg ${settings.emailStyle === 'outlook' ? 'border-constructbms-blue bg-constructbms-blue bg-opacity-10' : 'border-gray-200'}`}
                    >
                      <div className='flex items-center space-x-2 mb-3'>
                        <div className='w-3 h-3 bg-blue-500 rounded'></div>
                        <span className='font-medium'>Outlook Style</span>
                      </div>
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-gray-400 rounded'></div>
                          <span>Ribbon toolbar</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-gray-400 rounded'></div>
                          <span>Three-pane layout</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-gray-400 rounded'></div>
                          <span>Classic interface</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`p-4 border-2 rounded-lg ${settings.emailStyle === 'gmail' ? 'border-constructbms-blue bg-constructbms-blue bg-opacity-10' : 'border-gray-200'}`}
                    >
                      <div className='flex items-center space-x-2 mb-3'>
                        <div className='w-3 h-3 bg-red-500 rounded'></div>
                        <span className='font-medium'>Gmail Style</span>
                      </div>
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-gray-400 rounded'></div>
                          <span>Material design</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-gray-400 rounded'></div>
                          <span>Card-based layout</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-gray-400 rounded'></div>
                          <span>Modern interface</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold'>Advanced Settings</h3>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Cache Size (MB)
                    </label>
                    <input
                      type='number'
                      value={settings.cacheSize}
                      onChange={e =>
                        handleSettingChange(
                          'advanced',
                          'cacheSize',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-full border border-gray-300 rounded-lg px-3 py-2'
                      min='10'
                      max='1000'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Auto Archive
                    </label>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={settings.autoArchive}
                        onChange={e =>
                          handleSettingChange(
                            'advanced',
                            'autoArchive',
                            e.target.checked
                          )
                        }
                        className='rounded'
                      />
                      <span className='text-sm text-gray-600'>
                        Auto-archive old emails
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Archive After (days)
                    </label>
                    <input
                      type='number'
                      value={settings.archiveAfter}
                      onChange={e =>
                        handleSettingChange(
                          'advanced',
                          'archiveAfter',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-full border border-gray-300 rounded-lg px-3 py-2'
                      min='1'
                      max='365'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Delete After (days)
                    </label>
                    <input
                      type='number'
                      value={settings.deleteAfter}
                      onChange={e =>
                        handleSettingChange(
                          'advanced',
                          'deleteAfter',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-full border border-gray-300 rounded-lg px-3 py-2'
                      min='1'
                      max='365'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Max Message Size (MB)
                    </label>
                    <input
                      type='number'
                      value={settings.maxMessageSize}
                      onChange={e =>
                        handleSettingChange(
                          'advanced',
                          'maxMessageSize',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-full border border-gray-300 rounded-lg px-3 py-2'
                      min='1'
                      max='100'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettingsModal;
