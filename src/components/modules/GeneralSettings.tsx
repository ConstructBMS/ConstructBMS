import React, { useState, useEffect, useRef } from 'react';
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
  Lock,
  AlertCircle,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Cloud,
  X,
} from 'lucide-react';
import { demoDataService } from '../../services/demoDataService';
import { dataSourceService } from '../../services/dataSourceService';
import { demoModeService } from '../../services/demoModeService';
import ThemeSwitcher from '../ThemeSwitcher';
import ThemeBuilder from '../ThemeBuilder';
import TwoFactorAuth from '../TwoFactorAuth';
import CloudStorageIntegration from './CloudStorageIntegration';
import { useLogo } from '../../contexts/LogoContext';
import { useAuth } from '../../contexts/AuthContext';
import { SystemRoles, Permissions } from '../../types/auth';
import { useSearchParams } from 'react-router-dom';
import { validatePassword } from '../../utils/devHelpers';
import { persistentStorage } from '../../services/persistentStorage';

interface GeneralSettingsProps {
  onModuleChange: (module: string) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  onModuleChange,
}) => {
  const { user, checkPermission, checkRole, updateUserProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [demoOperation, setDemoOperation] = useState<'clear' | 'reset' | 'test' | 'detailed' | 'restore' | null>(null);
  const [showCloudStorageModal, setShowCloudStorageModal] = useState(false);
  const [showFooterSettings, setShowFooterSettings] = useState(false);

  // Profile settings state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    jobTitle: user?.jobTitle || '',
    location: user?.location || '',
    bio: user?.bio || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    emergencyPhone: user?.emergencyPhone || '',
  });
  const [avatar, setAvatar] = useState<string>(
    user?.avatarUrl || user?.avatar || ''
  );
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [profileSaveStatus, setProfileSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { logoSettings, updateMainLogo, updateSidebarLogo, resetLogos } = useLogo();

  // Check if user has super admin permissions
  const isSuperAdmin = checkRole(SystemRoles.SUPER_ADMIN) || 
                      checkPermission(Permissions.SYSTEM_FEATURE_FLAGS) ||
                      checkPermission(Permissions.DATA_ACCESS_ALL);

  // Handle URL parameter for tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Debug logo settings
  useEffect(() => {
    console.log('Logo settings debug:', {
      logoSettings,
      sidebarLogo: logoSettings?.sidebarLogo,
      type: logoSettings?.sidebarLogo?.type,
      imageUrl: logoSettings?.sidebarLogo?.imageUrl,
      hasCustomSidebarLogo: logoSettings?.sidebarLogo?.type === 'image' && logoSettings?.sidebarLogo?.imageUrl && logoSettings.sidebarLogo.imageUrl !== null
    });
  }, [logoSettings]);

  const [settings, setSettings] = useState({
    general: {
      companyName: '',
      businessAddress: '',
      contactEmail: '',
      phoneNumber: '',
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
      id: 'profile',
      name: 'Profile Settings',
      icon: User,
      description: 'Personal information and account settings',
    },
    {
      id: 'appearance',
      name: 'Theme & Appearance',
      icon: Image,
      description: 'Theme, logos, and visual customization',
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Authentication and security settings',
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
      id: 'integrations',
      name: 'Cloud Storage',
      icon: Cloud,
      description: 'Google Drive, OneDrive, and Dropbox integration',
    },
    {
      id: 'footer',
      name: 'Footer Settings',
      icon: FileText,
      description: 'Customize footer layout and content',
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
        companyName: '',
        businessAddress: '',
        contactEmail: '',
        phoneNumber: '',
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
    if (!isSuperAdmin) {
      setDemoMessage('❌ Access denied. Only Super Administrators can manage demo data.');
      return;
    }

    if (loadingDemo || demoOperation) {
      console.log('⚠️ Demo operation already in progress');
      return;
    }
    
    setLoadingDemo(true);
    setDemoOperation('reset');
    setDemoMessage(null);
    
    try {
      console.log('🔄 Starting demo data restoration...');
      
      // Reset to demo data (clear existing and generate fresh)
      await demoDataService.resetToDemo();
      
      // Force refresh all components
      await demoDataService.forceRefreshAllComponents();
      
      setDemoMessage('✅ Demo data restored successfully. All modules populated with sample data.');
      
      // Reload the page to ensure all components reflect the new demo data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (e) {
      console.error('Failed to restore demo data:', e);
      setDemoMessage('❌ Failed to restore demo data. Please try again.');
    } finally {
      setLoadingDemo(false);
      setDemoOperation(null);
    }
  };

  const handleClearDemoData = async () => {
    if (!isSuperAdmin) {
      setDemoMessage('❌ Access denied. Only Super Administrators can manage demo data.');
      return;
    }

    console.log('🔴 Clear Demo Data button clicked!');
    
    if (loadingDemo || demoOperation) {
      console.log('⚠️ Demo operation already in progress');
      return;
    }
    
    setLoadingDemo(true);
    setDemoOperation('clear');
    setDemoMessage(null);
    
    try {
      console.log('🔄 Starting demo data clear and live mode transition...');
      
      // Use the new demo mode service to clear data and transition to live mode
      await demoModeService.clearDemoDataAndTransitionToLive();
      
      // Clear cached data and refresh components
      demoDataService.clearCachedData();
      await demoDataService.forceRefreshAllComponents();
      
      setDemoMessage('✅ Demo data cleared and system transitioned to live mode. You can now start inputting your own data.');
      
      // Reload the page to ensure all components reflect the live mode
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (e) {
      console.error('Failed to clear demo data and transition to live mode:', e);
      setDemoMessage('❌ Failed to clear demo data. Please try again.');
    } finally {
      setLoadingDemo(false);
      setDemoOperation(null);
    }
  };

  const handleRestoreDemoData = async () => {
    if (!isSuperAdmin) {
      setDemoMessage('❌ Access denied. Only Super Administrators can manage demo data.');
      return;
    }

    console.log('🔄 Restore Demo Data button clicked!');
    
    if (loadingDemo || demoOperation) {
      console.log('⚠️ Demo operation already in progress');
      return;
    }
    
    setLoadingDemo(true);
    setDemoOperation('restore');
    setDemoMessage(null);
    
    try {
      console.log('🔄 Switching to demo data sources...');
      
      // Ensure demo data exists in demo tables only
      await dataSourceService.ensureDemoDataInDemoTables();
      
      // Switch to demo data mode
      dataSourceService.switchToDemo();
      
      setDemoMessage('✅ Switched to demo data sources. All components now read from demo tables.');
      
    } catch (e) {
      console.error('Failed to switch to demo data:', e);
      setDemoMessage('❌ Failed to switch to demo data. Please try again.');
    } finally {
      setLoadingDemo(false);
      setDemoOperation(null);
    }
  };

  const handleDeleteDemoData = async () => {
    console.log('🔴 Clear All Demo Data button clicked!');
    
    if (loadingDemo || demoOperation) {
      console.log('⚠️ Demo operation already in progress');
      return;
    }
    
    setLoadingDemo(true);
    setDemoOperation('clear');
    setDemoMessage(null);
    
    try {
      console.log('🗑️ Starting complete demo data deletion...');
      
      // Use the new demo mode service to clear data and transition to live mode
      await demoModeService.clearDemoDataAndTransitionToLive();
      
      // Clear cached data and refresh components
      demoDataService.clearCachedData();
      await demoDataService.forceRefreshAllComponents();
      
      setDemoMessage('✅ All demo data deleted and system transitioned to live mode. Application reset to clean state.');
      
      // Reload the page to ensure all components reflect the clean state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (e) {
      console.error('Failed to delete demo data:', e);
      setDemoMessage('❌ Failed to delete demo data. Please try again.');
    } finally {
      setLoadingDemo(false);
      setDemoOperation(null);
    }
  };

  const handleResetLogos = async () => {
    try {
      // Reset to default settings with no custom logos
      const defaultSettings = {
        mainLogo: {
          type: 'text' as const,
          text: '',
          imageUrl: null,
        },
        sidebarLogo: {
          type: 'icon' as const,
          icon: 'hard-hat', // or your blue 'C' icon logic
          imageUrl: null,
        },
      };
      await updateLogoSettings(defaultSettings);
      setLogoSettings(defaultSettings);
    } catch (error) {
      console.error('Failed to reset logos:', error);
    }
  };

  // Profile functions
  const handleProfileInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Validate new password when it changes
    if (field === 'newPassword') {
      const validation = validatePassword(value);
      setPasswordErrors(validation.errors);
    } else {
      // Clear errors when other fields change
      setPasswordErrors([]);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaveStatus('saving');

    try {
      // Prepare profile data to save
      const updatedProfileData = {
        ...profileData,
        avatarUrl: avatar,
        updatedAt: new Date().toISOString(),
      };

      // Update user profile in context
      await updateUserProfile(updatedProfileData);

      // Handle password change if form is open and passwords are filled
      if (showPasswordForm && passwordData.newPassword && passwordData.confirmPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          alert('New passwords do not match');
          setProfileSaveStatus('idle');
          return;
        }

        if (passwordErrors.length > 0) {
          alert('Please fix password validation errors');
          setProfileSaveStatus('idle');
          return;
        }

        // In a real app, you would call an API to change the password
        console.log('Password change requested:', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });

        // Clear password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordForm(false);
        setPasswordErrors([]);
      }

      setProfileSaveStatus('saved');
      setTimeout(() => {
        setProfileSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setProfileSaveStatus('idle');
    }
  };

  const getUserInitials = () => {
    return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase();
  };

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        jobTitle: user.jobTitle || '',
        location: user.location || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || '',
      });
      setAvatar(user.avatarUrl || user.avatar || '');
    }
  }, [user]);

  // Load profile data from persistent storage on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const savedProfileData = await persistentStorage.getProfileData();
        const savedAvatar = await persistentStorage.getAvatar();
        
        if (savedProfileData) {
          setProfileData(prev => ({
            ...prev,
            ...savedProfileData
          }));
        }
        
        if (savedAvatar) {
          setAvatar(savedAvatar);
        }
      } catch (error) {
        console.error('Error loading profile data from storage:', error);
      }
    };

    loadProfileData();
  }, []);

  // Confirmation Modal Component
  const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText, 
    cancelText = 'Cancel',
    isDestructive = false 
  }: {
    cancelText?: string;
    confirmText: string;
    isDestructive?: boolean;
    isOpen: boolean;
    message: string;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl border-2 ${
          isDestructive ? 'border-red-200' : 'border-yellow-200'
        }`}>
          <div className="flex items-center mb-6">
            <div className={`p-3 rounded-full mr-4 ${
              isDestructive ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              <AlertTriangle className={`h-8 w-8 ${
                isDestructive ? 'text-red-600' : 'text-yellow-600'
              }`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${
                isDestructive ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isDestructive ? 'This action cannot be undone' : 'Please confirm this action'}
              </p>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg mb-6 ${
            isDestructive ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`text-sm leading-relaxed ${
              isDestructive ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {message}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-6 py-3 text-white rounded-lg transition-colors font-medium ${
                isDestructive 
                  ? 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
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
                  : 'bg-constructbms-blue text-black hover:bg-constructbms-black hover:text-white'
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
                      ? 'bg-white text-constructbms-blue shadow-sm border border-constructbms-blue/20'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mr-3 ${isActive ? 'text-constructbms-blue' : 'text-gray-400'}`}
                  />
                  <div className='flex-1'>
                    <div className='font-medium'>{tab.name}</div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {tab.description}
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className='h-4 w-4 text-constructbms-blue' />
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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


            </div>
          )}

          {activeTab === 'security' && (
            <div className='space-y-8'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  Security Settings
                </h2>
                <div className='space-y-6'>
                  {/* Authentication */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Authentication
                    </h3>
                    <div className='space-y-4'>
                      <div className="mb-6">
                        <TwoFactorAuth 
                          onStatusChange={(enabled) => 
                            updateSetting('security', 'twoFactorAuth', enabled)
                          }
                        />
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
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        >
                          <option value='basic'>Basic (8+ characters)</option>
                          <option value='strong'>
                            Strong (12+ characters, mixed case, numbers)
                          </option>
                          <option value='very-strong'>
                            Very Strong (16+ characters, special chars)
                          </option>
                        </select>
                        <p className='mt-2 text-sm text-gray-600'>
                          <strong>Default requirements:</strong> Minimum 8 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
                        </p>
                      </div>
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
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-constructbms-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-constructbms-blue"></div>
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
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-constructbms-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-constructbms-blue"></div>
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
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-constructbms-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-constructbms-blue"></div>
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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

          {activeTab === 'profile' && (
            <div className='space-y-8'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  Profile Settings
                </h2>
                
                {/* Avatar Section */}
                <div className='text-center mb-8'>
                  <div className='relative inline-block'>
                    <div
                      onClick={handleAvatarClick}
                      className='relative w-24 h-24 rounded-full bg-constructbms-blue flex items-center justify-center cursor-pointer hover:bg-constructbms-black hover:text-white transition-colors group'
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt='Profile'
                          className='w-full h-full rounded-full object-cover'
                        />
                      ) : (
                        <span className='text-2xl font-bold'>
                          {getUserInitials()}
                        </span>
                      )}
                      <div className='absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                        <Camera className='h-6 w-6 text-white' />
                      </div>
                    </div>
                    <button
                      onClick={handleAvatarClick}
                      className='absolute -bottom-1 -right-1 p-1.5 bg-constructbms-blue text-black rounded-full hover:bg-constructbms-black hover:text-white transition-colors'
                    >
                      <Upload className='h-3 w-3' />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleFileSelect}
                    className='hidden'
                  />
                  <p className='mt-2 text-sm text-gray-500'>
                    Click to update your profile picture
                  </p>
                </div>

                {/* Personal Information */}
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                      <User className='h-5 w-5 mr-2' />
                      Personal Information
                    </h3>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          First Name
                        </label>
                        <input
                          type='text'
                          value={profileData.firstName}
                          onChange={e => handleProfileInputChange('firstName', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Last Name
                        </label>
                        <input
                          type='text'
                          value={profileData.lastName}
                          onChange={e => handleProfileInputChange('lastName', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Email Address
                        </label>
                        <div className='relative'>
                          <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <input
                            type='email'
                            value={profileData.email}
                            onChange={e => handleProfileInputChange('email', e.target.value)}
                            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                          />
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Phone Number
                        </label>
                        <div className='relative'>
                          <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <input
                            type='tel'
                            value={profileData.phone}
                            onChange={e => handleProfileInputChange('phone', e.target.value)}
                            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                          />
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Job Title
                        </label>
                        <input
                          type='text'
                          value={profileData.jobTitle}
                          onChange={e => handleProfileInputChange('jobTitle', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Department
                        </label>
                        <input
                          type='text'
                          value={profileData.department}
                          onChange={e => handleProfileInputChange('department', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Location
                        </label>
                        <div className='relative'>
                          <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <input
                            type='text'
                            value={profileData.location}
                            onChange={e => handleProfileInputChange('location', e.target.value)}
                            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                            placeholder='City, Country'
                          />
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Date of Birth
                        </label>
                        <div className='relative'>
                          <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <input
                            type='date'
                            value={profileData.dateOfBirth}
                            onChange={e => handleProfileInputChange('dateOfBirth', e.target.value)}
                            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                          />
                        </div>
                      </div>
                    </div>

                    <div className='mt-4'>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Address
                      </label>
                      <textarea
                        value={profileData.address}
                        onChange={e => handleProfileInputChange('address', e.target.value)}
                        rows={2}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='Full address...'
                      />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Emergency Contact
                        </label>
                        <input
                          type='text'
                          value={profileData.emergencyContact}
                          onChange={e => handleProfileInputChange('emergencyContact', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                          placeholder='Emergency contact name'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Emergency Phone
                        </label>
                        <input
                          type='tel'
                          value={profileData.emergencyPhone}
                          onChange={e => handleProfileInputChange('emergencyPhone', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                          placeholder='Emergency contact phone'
                        />
                      </div>
                    </div>

                    <div className='mt-4'>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={e => handleProfileInputChange('bio', e.target.value)}
                        rows={3}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        placeholder='Tell us about yourself...'
                      />
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
                      <Lock className='h-5 w-5 mr-2' />
                      Security
                    </h3>

                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className='flex items-center justify-between w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <span className='text-sm font-medium'>Change Password</span>
                      {showPasswordForm ? (
                        <Eye className='h-4 w-4' />
                      ) : (
                        <EyeOff className='h-4 w-4' />
                      )}
                    </button>

                    {showPasswordForm && (
                      <div className='space-y-4 p-4 bg-gray-50 rounded-lg'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Current Password
                          </label>
                          <input
                            type='password'
                            value={passwordData.currentPassword}
                            onChange={e => handlePasswordChange('currentPassword', e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            New Password
                          </label>
                          <input
                            type='password'
                            value={passwordData.newPassword}
                            onChange={e => handlePasswordChange('newPassword', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent ${
                              passwordErrors.length > 0 ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder='Enter new password (min 8 characters with uppercase, lowercase, number, and special character)'
                          />
                          {passwordErrors.length > 0 && (
                            <div className='mt-2 text-sm text-red-600'>
                              <ul className='list-disc list-inside space-y-1'>
                                {passwordErrors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Confirm New Password
                          </label>
                          <input
                            type='password'
                            value={passwordData.confirmPassword}
                            onChange={e => handlePasswordChange('confirmPassword', e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <div className='flex justify-end pt-6'>
                    <button
                      onClick={handleProfileSave}
                      disabled={profileSaveStatus === 'saving'}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                        profileSaveStatus === 'saving'
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : profileSaveStatus === 'saved'
                            ? 'bg-green-500 text-white'
                            : 'bg-constructbms-blue text-black hover:bg-constructbms-black hover:text-white'
                      }`}
                    >
                      {profileSaveStatus === 'saving' ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                          Saving...
                        </>
                      ) : profileSaveStatus === 'saved' ? (
                        <>
                          <Save className='h-4 w-4 mr-2' />
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
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className='space-y-8'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  Theme & Appearance Settings
                </h2>
                
                {/* Theme Builder */}
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                      Theme Builder
                    </h3>
                    <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-6'>
                      <ThemeBuilder />
                    </div>
                  </div>

                  {/* Logo Settings */}
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Logo Customization
                    </h3>
                    <div className='space-y-6'>
                      {/* Main Logo */}
                      <div className='bg-white border border-gray-200 rounded-lg p-6'>
                        <div className='flex items-center justify-between mb-4'>
                          <div>
                            <h4 className='font-semibold text-gray-900'>Main Header Logo</h4>
                            <p className='text-sm text-gray-600'>
                              Customize the logo displayed in the main header
                            </p>
                          </div>
                        </div>
                        
                        <div className='space-y-4'>
                          <div className='flex space-x-4'>
                            <label className='flex items-center'>
                              <input
                                type='radio'
                                name='mainLogoType'
                                value='text'
                                checked={logoSettings?.mainLogo?.type === 'text'}
                                onChange={() => updateMainLogo({ type: 'text' })}
                                className='mr-2'
                              />
                              <Type className='h-4 w-4 mr-1' />
                              Text Logo
                            </label>
                            <label className='flex items-center'>
                              <input
                                type='radio'
                                name='mainLogoType'
                                value='image'
                                checked={logoSettings?.mainLogo?.type === 'image'}
                                onChange={() => updateMainLogo({ type: 'image' })}
                                className='mr-2'
                              />
                              <Image className='h-4 w-4 mr-1' />
                              Image Logo
                            </label>
                          </div>

                          {logoSettings?.mainLogo?.type === 'text' ? (
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Logo Text
                              </label>
                              <input
                                type='text'
                                value={logoSettings?.mainLogo?.text || ''}
                                onChange={e => updateMainLogo({ text: e.target.value })}
                                placeholder='ConstructBMS'
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                              />
                            </div>
                          ) : (
                            <div className='space-y-3'>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Upload Logo Image
                              </label>
                              <input
                                type='file'
                                accept='image/*'
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = event => {
                                      const result = event.target?.result as string;
                                      updateMainLogo({ imageUrl: result });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-constructbms-green file:text-white hover:file:bg-constructbms-blue'
                              />
                              {logoSettings?.mainLogo?.imageUrl && (
                                <div className='flex items-center space-x-3'>
                                  <img
                                    src={logoSettings.mainLogo.imageUrl}
                                    alt='Current logo'
                                    className='h-8 w-auto max-w-32 object-contain border border-gray-200 rounded'
                                  />
                                  <button
                                    onClick={() => updateMainLogo({ imageUrl: null })}
                                    className='text-sm text-red-600 hover:text-red-700'
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sidebar Logo */}
                      <div className='bg-white border border-gray-200 rounded-lg p-6'>
                        <div className='flex items-center justify-between mb-4'>
                          <div>
                            <h4 className='font-semibold text-gray-900'>Sidebar Logo</h4>
                            <p className='text-sm text-gray-600'>
                              Customize the logo displayed in the sidebar
                            </p>
                          </div>
                        </div>
                        
                        <div className='space-y-4'>
                          <div className='flex space-x-4'>
                            <label className='flex items-center'>
                              <input
                                type='radio'
                                name='sidebarLogoType'
                                value='icon'
                                checked={logoSettings?.sidebarLogo?.type === 'icon' || (logoSettings?.sidebarLogo?.type === 'image' && !logoSettings?.sidebarLogo?.imageUrl)}
                                onChange={() => updateSidebarLogo({ type: 'icon', icon: 'hard-hat', imageUrl: null })}
                                className='mr-2'
                              />
                              <Type className='h-4 w-4 mr-1' />
                              Default "C" Icon
                            </label>
                            <label className='flex items-center'>
                              <input
                                type='radio'
                                name='sidebarLogoType'
                                value='image'
                                checked={logoSettings?.sidebarLogo?.type === 'image' && Boolean(logoSettings?.sidebarLogo?.imageUrl)}
                                onChange={() => updateSidebarLogo({ type: 'image' })}
                                className='mr-2'
                              />
                              <Image className='h-4 w-4 mr-1' />
                              Custom Image
                            </label>
                          </div>

                          {logoSettings?.sidebarLogo?.type === 'image' && (
                            <div className='space-y-3'>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Upload Sidebar Logo
                              </label>
                              <input
                                type='file'
                                accept='image/*'
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = event => {
                                      const result = event.target?.result as string;
                                      // When user uploads a custom image, ensure it's marked as custom (not default)
                                      updateSidebarLogo({ type: 'image', imageUrl: result });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-constructbms-green file:text-white hover:file:bg-constructbms-blue'
                              />
                              {logoSettings?.sidebarLogo?.imageUrl && (
                                <div className='flex items-center space-x-3'>
                                  <img
                                    src={logoSettings.sidebarLogo.imageUrl}
                                    alt='Current sidebar logo'
                                    className='h-6 w-6 object-contain border border-gray-200 rounded'
                                  />
                                  <button
                                    onClick={() => updateSidebarLogo({ imageUrl: null })}
                                    className='text-sm text-red-600 hover:text-red-700'
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Logo Preview */}
                      <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
                        <h4 className='font-semibold text-gray-900 mb-4'>Logo Preview</h4>
                        <div className='flex items-center space-x-8'>
                          <div className='flex items-center space-x-3'>
                            <span className='text-sm text-gray-600'>Header:</span>
                            {logoSettings?.mainLogo?.type === 'image' && logoSettings?.mainLogo?.imageUrl ? (
                              <img
                                src={logoSettings.mainLogo.imageUrl}
                                alt='Main Logo Preview'
                                className='h-6 w-auto max-w-24 object-contain'
                              />
                            ) : (
                              <span className='text-lg font-bold text-gray-900'>
                                {logoSettings?.mainLogo?.text || 'ConstructBMS'}
                              </span>
                            )}
                          </div>
                          <div className='flex items-center space-x-3'>
                            <span className='text-sm text-gray-600'>Sidebar:</span>
                            {logoSettings?.sidebarLogo?.type === 'image' && logoSettings?.sidebarLogo?.imageUrl ? (
                              <img
                                src={logoSettings.sidebarLogo.imageUrl}
                                alt='Sidebar Logo Preview'
                                className='h-5 w-5 object-contain'
                              />
                            ) : (
                              <div className='h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center'>
                                <span className='text-gray-800 text-xs font-bold'>C</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reset Button */}
                      <div className='flex justify-end'>
                        <button
                          onClick={handleResetLogos}
                          className='bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors'
                        >
                          Reset to Default Logos
                        </button>
                      </div>
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
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-constructbms-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-constructbms-blue"></div>
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
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                        >
                          <option value='daily'>Daily</option>
                          <option value='weekly'>Weekly</option>
                          <option value='monthly'>Monthly</option>
                        </select>
                      </div>
                      <div className='flex space-x-3'>
                        <button className='flex-1 bg-constructbms-blue text-black py-2 px-4 rounded-lg font-medium hover:bg-constructbms-black hover:text-white transition-colors'>
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
                    <div className='flex items-center justify-between'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Demo Data Management
                      </h3>
                      {!isSuperAdmin && (
                        <div className='flex items-center text-yellow-600'>
                          <Lock className='h-4 w-4 mr-1' />
                          <span className='text-sm font-medium'>Super Admin Only</span>
                        </div>
                      )}
                    </div>
                    
                    {!isSuperAdmin ? (
                      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                        <div className='flex'>
                          <AlertTriangle className='h-5 w-5 text-yellow-500 mr-2 mt-0.5' />
                          <div>
                            <h4 className='text-sm font-medium text-yellow-800'>
                              Access Restricted
                            </h4>
                            <p className='text-sm text-yellow-700 mt-1'>
                              Demo data management is restricted to Super Administrators only. Contact your system administrator for access.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                          <div className='flex'>
                            <Info className='h-5 w-5 text-blue-400 mr-2 mt-0.5' />
                            <div>
                              <h4 className='text-sm font-medium text-blue-800'>
                                Data Source Information
                              </h4>
                              <p className='text-sm text-blue-700 mt-1'>
                                Switch between demo data and production data sources. Demo mode uses demo tables, production mode uses live tables.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className='space-y-3'>
                          <button
                            onClick={() => setShowClearConfirm(true)}
                            disabled={loadingDemo}
                            className='w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl border-2 border-red-500'
                          >
                            {loadingDemo && demoOperation === 'clear' ? (
                              <>
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                                Switching to Live Mode...
                              </>
                            ) : (
                              <>
                                <Lock className='h-4 w-4 mr-2' />
                                <AlertTriangle className='h-4 w-4 mr-2' />
                                Clear Demo Data (Switch to Live Mode)
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowRestoreConfirm(true)}
                            disabled={loadingDemo}
                            className='w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl border-2 border-green-500'
                          >
                            {loadingDemo && demoOperation === 'restore' ? (
                              <>
                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                                Switching to Demo Mode...
                              </>
                            ) : (
                              <>
                                <Lock className='h-4 w-4 mr-2' />
                                <Check className='h-4 w-4 mr-2' />
                                Restore Demo Data (Switch to Demo Mode)
                              </>
                            )}
                          </button>
                        </div>
                        {demoMessage && (
                          <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                            <p className='text-sm text-blue-800'>{demoMessage}</p>
                          </div>
                        )}
                      </>
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
                          className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent bg-gray-50'
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Maximum file size
                      </label>
                      <input
                        type='text'
                        defaultValue='10MB'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className='space-y-8'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  Cloud Storage Integration
                </h2>
                <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        Document Storage Integration
                      </h3>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                        Connect to Google Drive, OneDrive, or Dropbox to automatically sync your documents, templates, and files.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCloudStorageModal(true)}
                      className='px-4 py-2 bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-primary transition-colors'
                      title='Configure Cloud Storage Integration'
                    >
                      Configure Integration
                    </button>
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                      <div className='flex items-center space-x-3 mb-3'>
                        <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                          <Cloud className='h-5 w-5 text-white' />
                        </div>
                        <div>
                          <h4 className='font-medium text-gray-900 dark:text-white'>Google Drive</h4>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>Cloud storage</p>
                        </div>
                      </div>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                        Sync documents with Google Drive for cloud storage and collaboration.
                      </p>
                      <div className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>Not connected</span>
                      </div>
                    </div>

                    <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                      <div className='flex items-center space-x-3 mb-3'>
                        <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                          <Cloud className='h-5 w-5 text-white' />
                        </div>
                        <div>
                          <h4 className='font-medium text-gray-900 dark:text-white'>OneDrive</h4>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>Business storage</p>
                        </div>
                      </div>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                        Sync documents with Microsoft OneDrive for Business.
                      </p>
                      <div className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>Not connected</span>
                      </div>
                    </div>

                    <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                      <div className='flex items-center space-x-3 mb-3'>
                        <div className='w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center'>
                          <Cloud className='h-5 w-5 text-white' />
                        </div>
                        <div>
                          <h4 className='font-medium text-gray-900 dark:text-white'>Dropbox</h4>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>File sharing</p>
                        </div>
                      </div>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                        Backup and sync documents with Dropbox.
                      </p>
                      <div className='flex items-center space-x-2'>
                        <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>Not connected</span>
                      </div>
                    </div>
                  </div>

                  <div className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
                    <div className='flex items-start space-x-3'>
                      <Info className='h-5 w-5 text-blue-500 mt-0.5' />
                      <div>
                        <h4 className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                          How it works
                        </h4>
                        <ul className='text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1'>
                          <li>• Documents are automatically synced to your connected cloud storage</li>
                          <li>• Templates, forms, and files are stored in organized folders</li>
                          <li>• Changes are synchronized in real-time across all devices</li>
                          <li>• Only Super Administrators can change default storage settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className='space-y-8'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
                  Footer Settings
                </h2>
                <div className='space-y-6'>
                  <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                          Footer Customization
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                          Customize the footer layout, content, and appearance. Only Super Administrators can modify footer settings.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!isSuperAdmin) {
                            alert('Only Super Administrators can modify footer settings.');
                            return;
                          }
                          setShowFooterSettings(true);
                        }}
                        className='px-4 py-2 bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-primary transition-colors'
                        title='Open Footer Settings'
                      >
                        Open Footer Settings
                      </button>
                    </div>
                    
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                        <div className='flex items-center space-x-3 mb-3'>
                          <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                            <FileText className='h-5 w-5 text-white' />
                          </div>
                          <div>
                            <h4 className='font-medium text-gray-900 dark:text-white'>Layout</h4>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>Columns & structure</p>
                          </div>
                        </div>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                          Configure the number of columns (1-4) and widget arrangement.
                        </p>
                        <div className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <span className='text-xs text-gray-500 dark:text-gray-400'>3 columns configured</span>
                        </div>
                      </div>

                      <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                        <div className='flex items-center space-x-3 mb-3'>
                          <div className='w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center'>
                            <FileText className='h-5 w-5 text-white' />
                          </div>
                          <div>
                            <h4 className='font-medium text-gray-900 dark:text-white'>Widgets</h4>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>Content blocks</p>
                          </div>
                        </div>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                          Add, remove, and configure footer widgets and content.
                        </p>
                        <div className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <span className='text-xs text-gray-500 dark:text-gray-400'>3 widgets active</span>
                        </div>
                      </div>

                      <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                        <div className='flex items-center space-x-3 mb-3'>
                          <div className='w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center'>
                            <FileText className='h-5 w-5 text-white' />
                          </div>
                          <div>
                            <h4 className='font-medium text-gray-900 dark:text-white'>Appearance</h4>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>Colors & styling</p>
                          </div>
                        </div>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                          Customize colors, fonts, and visual styling of the footer.
                        </p>
                        <div className='flex items-center space-x-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <span className='text-xs text-gray-500 dark:text-gray-400'>Dark theme active</span>
                        </div>
                      </div>
                    </div>

                    <div className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
                      <div className='flex items-start space-x-3'>
                        <Info className='h-5 w-5 text-blue-500 mt-0.5' />
                        <div>
                          <h4 className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                            Footer Features
                          </h4>
                          <ul className='text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1'>
                            <li>• Responsive 1-4 column layout with customizable widgets</li>
                            <li>• 10+ widget types including Quick Actions, Contact Details, and Page Links</li>
                            <li>• Customizable colors, fonts, and styling options</li>
                            <li>• Admin-only settings accessible via the footer settings button</li>
                            <li>• Persistent settings stored in local storage</li>
                          </ul>
                        </div>
                      </div>
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
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-constructbms-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-constructbms-blue"></div>
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
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
      
      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearDemoData}
        title="Clear Demo Data"
        message="This will switch the system to live mode and clear all demo data. All components will read from live tables. This action cannot be undone. Are you sure you want to proceed?"
        confirmText="Yes, Clear Demo Data"
        isDestructive={true}
      />
      
      <ConfirmationModal
        isOpen={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        onConfirm={handleRestoreDemoData}
        title="Restore Demo Data"
        message="This will switch the system to demo mode and restore all demo data. All components will read from demo tables. Are you sure you want to proceed?"
        confirmText="Yes, Restore Demo Data"
        isDestructive={false}
      />

      {/* Cloud Storage Integration Modal */}
      <CloudStorageIntegration
        isOpen={showCloudStorageModal}
        onClose={() => setShowCloudStorageModal(false)}
      />

      {/* Footer Settings Modal */}
      {showFooterSettings && (
        <FooterSettingsModal
          onClose={() => setShowFooterSettings(false)}
        />
      )}
    </div>
  );
};

export default GeneralSettings;

// Footer Settings Modal Component
interface FooterSettingsModalProps {
  onClose: () => void;
}

const FooterSettingsModal: React.FC<FooterSettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFooterSettings();
  }, []);

  const loadFooterSettings = async () => {
    try {
      const savedSettings = await persistentStorage.getSetting('footer_settings', 'ui');
      if (savedSettings) {
        setSettings(savedSettings);
      } else {
        // Use default settings if none exist
        setSettings({
          columns: 3,
          widgets: [
            {
              id: 'quick-actions',
              type: 'quick-actions',
              title: 'Quick Actions',
              content: {
                actions: [
                  { label: 'New Project', module: 'projects', icon: 'BuildingOfficeIcon' },
                  { label: 'Create Task', module: 'tasks', icon: 'ClipboardDocumentListIcon' },
                  { label: 'Add Customer', module: 'customers', icon: 'UserGroupIcon' },
                  { label: 'Schedule Meeting', module: 'calendar', icon: 'CalendarIcon' },
                ]
              },
              order: 1,
            },
            {
              id: 'contact-details',
              type: 'contact-details',
              title: 'Contact Details',
              content: {
                company: 'ConstructBMS Ltd',
                phone: '+44 20 7123 4567',
                email: 'info@constructbms.com',
                address: '123 Business Street, London, SW1 1AA',
                website: 'www.constructbms.com',
              },
              order: 2,
            },
            {
              id: 'page-links',
              type: 'page-links',
              title: 'Quick Links',
              content: {
                links: [
                  { label: 'Roadmap', module: 'roadmap', icon: 'ChartBarIcon' },
                  { label: 'Change Log', module: 'changelog', icon: 'DocumentTextIcon' },
                  { label: 'Knowledge Base', module: 'help', icon: 'BookOpenIcon' },
                  { label: 'Support', module: 'support', icon: 'QuestionMarkCircleIcon' },
                ]
              },
              order: 3,
            },
          ],
          backgroundColor: 'bg-constructbms-dark-2 dark:bg-constructbms-dark-2',
          textColor: 'text-gray-300',
          accentColor: 'text-constructbms-blue',
          showLogo: true,
          logoUrl: '/icons/icon.svg',
        });
      }
    } catch (error) {
      console.warn('Failed to load footer settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFooterSettings = async (newSettings: any) => {
    try {
      await persistentStorage.setSetting('footer_settings', newSettings, 'ui');
      setSettings(newSettings);
      // Force a page reload to apply footer changes
      window.location.reload();
    } catch (error) {
      console.warn('Failed to save footer settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 dark:text-gray-300">Loading footer settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Footer Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Layout Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Layout</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Columns
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setSettings({ ...settings, columns: cols })}
                      className={`p-3 border-2 rounded-lg text-center ${
                        settings.columns === cols
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-sm font-semibold">{cols}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showLogo}
                    onChange={(e) => setSettings({ ...settings, showLogo: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show logo in footer</span>
                </label>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Background Color
                </label>
                <select
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bg-gray-900">Dark Gray</option>
                  <option value="bg-gray-800">Medium Gray</option>
                  <option value="bg-blue-900">Dark Blue</option>
                  <option value="bg-black">Black</option>
                  <option value="bg-white">White</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text Color
                </label>
                <select
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text-gray-300">Light Gray</option>
                  <option value="text-gray-400">Medium Gray</option>
                  <option value="text-white">White</option>
                  <option value="text-black">Black</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accent Color
                </label>
                <select
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text-blue-400">Blue</option>
                  <option value="text-green-400">Green</option>
                  <option value="text-purple-400">Purple</option>
                  <option value="text-orange-400">Orange</option>
                  <option value="text-red-400">Red</option>
                </select>
              </div>
            </div>

            {/* Widgets Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Widgets</h3>
              <div className="space-y-2">
                {settings.widgets.map((widget: any) => (
                  <div key={widget.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm font-medium">{widget.title}</span>
                    <span className="text-xs text-gray-500">{widget.type}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {settings.widgets.length} widget{settings.widgets.length !== 1 ? 's' : ''} configured
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={() => saveFooterSettings(settings)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
