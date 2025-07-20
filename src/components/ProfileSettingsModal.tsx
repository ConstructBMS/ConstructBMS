import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Camera,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validatePassword } from '../utils/devHelpers';
import { persistentStorage } from '../services/persistentStorage';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSettings?: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSettings,
}) => {
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
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
          setFormData(prev => ({
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      // In a real app, you'd upload this to your server/cloud storage
      const reader = new FileReader();
      reader.onload = e => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');

    try {
      // Prepare profile data to save
      const profileData = {
        ...formData,
        avatarUrl: avatar,
        updatedAt: new Date().toISOString(),
      };

      // Update user profile in context
      await updateUserProfile(profileData);

      // Handle password change if form is open and passwords are filled
      if (showPasswordForm && passwordData.newPassword && passwordData.confirmPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          alert('New passwords do not match');
          setSaveStatus('idle');
          return;
        }

        if (passwordErrors.length > 0) {
          alert('Please fix password validation errors');
          setSaveStatus('idle');
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

      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('idle');
      // TODO: Show error message to user
    }
  };

  const getUserInitials = () => {
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity'
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
            Profile Settings
          </h2>
          <div className='flex items-center space-x-2'>
            {onNavigateToSettings && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToSettings();
                }}
                className='px-3 py-1 text-sm bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-black hover:text-white transition-colors'
                title='Open full profile settings in General Settings'
              >
                Open in Settings
              </button>
            )}
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {/* Avatar Section */}
          <div className='text-center'>
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
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
              Click to update your profile picture
            </p>
          </div>

          {/* Personal Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center'>
              <User className='h-5 w-5 mr-2' />
              Personal Information
            </h3>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  First Name
                </label>
                <input
                  type='text'
                  value={formData.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Last Name
                </label>
                <input
                  type='text'
                  value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='email'
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Phone Number
              </label>
              <div className='relative'>
                <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='tel'
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Job Title
              </label>
              <input
                type='text'
                value={formData.jobTitle}
                onChange={e => handleInputChange('jobTitle', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Department
              </label>
              <input
                type='text'
                value={formData.department}
                onChange={e => handleInputChange('department', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={e => handleInputChange('bio', e.target.value)}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                placeholder='Tell us about yourself...'
              />
            </div>
          </div>

          {/* Security */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Security
            </h3>

            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className='flex items-center justify-between w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
            >
              <span className='text-sm font-medium'>Change Password</span>
              {showPasswordForm ? (
                <Eye className='h-4 w-4' />
              ) : (
                <EyeOff className='h-4 w-4' />
              )}
            </button>

            {showPasswordForm && (
              <div className='space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Current Password
                  </label>
                  <input
                    type='password'
                    value={passwordData.currentPassword}
                    onChange={e =>
                      handlePasswordChange('currentPassword', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    New Password
                  </label>
                  <input
                    type='password'
                    value={passwordData.newPassword}
                    onChange={e =>
                      handlePasswordChange('newPassword', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent ${
                      passwordErrors.length > 0 ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder='Enter new password (min 8 characters with uppercase, lowercase, number, and special character)'
                  />
                  {passwordErrors.length > 0 && (
                    <div className='mt-2 text-sm text-red-600 dark:text-red-400'>
                      <ul className='list-disc list-inside space-y-1'>
                        {passwordErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Confirm New Password
                  </label>
                  <input
                    type='password'
                    value={passwordData.confirmPassword}
                    onChange={e =>
                      handlePasswordChange('confirmPassword', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='border-t border-gray-200 dark:border-gray-700 p-6'>
          <div className='flex justify-end space-x-3'>
            <button
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                saveStatus === 'saving'
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : saveStatus === 'saved'
                    ? 'bg-green-500 text-white'
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
    </>
  );
};

export default ProfileSettingsModal;
