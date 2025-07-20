import React, { useState } from 'react';
import {
  X,
  Mail,
  Settings,
  Globe,
  Shield,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { EmailProvider, EmailAccount } from '../../types/email';
import emailIntegrationService from '../../services/emailIntegrationService';

interface EmailAccountSetupProps {
  isOpen: boolean;
  onAccountAdded: (account: EmailAccount) => void;
  onClose: () => void;
}

const EmailAccountSetup: React.FC<EmailAccountSetupProps> = ({
  isOpen,
  onClose,
  onAccountAdded,
}) => {
  const [step, setStep] = useState<'provider' | 'oauth' | 'manual'>('provider');
  const [selectedProvider, setSelectedProvider] =
    useState<EmailProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Manual configuration form state
  const [manualConfig, setManualConfig] = useState({
    email: '',
    displayName: '',
    imapHost: '',
    imapPort: 993,
    imapSecure: true,
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: true,
    username: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleProviderSelect = (provider: EmailProvider) => {
    setSelectedProvider(provider);
    setError(null);

    if (provider === 'manual') {
      setStep('manual');
    } else {
      setStep('oauth');
    }
  };

  const handleOAuthConnect = async () => {
    if (!selectedProvider) return;

    setIsLoading(true);
    setError(null);

    try {
      const oauthUrl =
        emailIntegrationService.generateOAuthUrl(selectedProvider);

      if (oauthUrl.startsWith('#/auth/demo')) {
        // Demo mode - create mock account
        const account = await emailIntegrationService.handleOAuthCallback(
          selectedProvider,
          'demo_code'
        );
        onAccountAdded(account);
        onClose();
      } else {
        // Real OAuth - redirect to provider
        window.location.href = oauthUrl;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to connect account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const account =
        await emailIntegrationService.addManualAccount(manualConfig);
      onAccountAdded(account);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add manual account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep('provider');
    setSelectedProvider(null);
    setError(null);
    setManualConfig({
      email: '',
      displayName: '',
      imapHost: '',
      imapPort: 993,
      imapSecure: true,
      smtpHost: '',
      smtpPort: 587,
      smtpSecure: true,
      username: '',
      password: '',
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b dark:border-gray-700'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Add Email Account
          </h2>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='p-6'>
          {error && (
            <div className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3'>
              <AlertCircle className='w-5 h-5 text-red-600 dark:text-red-400' />
              <p className='text-red-700 dark:text-red-300'>{error}</p>
            </div>
          )}

          {step === 'provider' && (
            <div className='space-y-4'>
              <div className='text-center mb-8'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                  Choose Email Provider
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Connect your email account to sync messages and send emails
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {/* Gmail */}
                <button
                  onClick={() => handleProviderSelect('gmail')}
                  className='group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg'
                >
                  <div className='flex flex-col items-center text-center space-y-3'>
                    <div className='w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-colors'>
                      <Mail className='w-6 h-6 text-red-600 dark:text-red-400' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900 dark:text-white'>
                        Gmail
                      </h4>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Google Workspace
                      </p>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-green-600 dark:text-green-400'>
                      <Shield className='w-4 h-4' />
                      <span>OAuth 2.0</span>
                    </div>
                  </div>
                </button>

                {/* Microsoft 365 */}
                <button
                  onClick={() => handleProviderSelect('microsoft365')}
                  className='group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg'
                >
                  <div className='flex flex-col items-center text-center space-y-3'>
                    <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors'>
                      <Globe className='w-6 h-6 text-blue-600 dark:text-blue-400' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900 dark:text-white'>
                        Microsoft 365
                      </h4>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Outlook, Exchange
                      </p>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-green-600 dark:text-green-400'>
                      <Shield className='w-4 h-4' />
                      <span>OAuth 2.0</span>
                    </div>
                  </div>
                </button>

                {/* Manual Configuration */}
                <button
                  onClick={() => handleProviderSelect('manual')}
                  className='group p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg'
                >
                  <div className='flex flex-col items-center text-center space-y-3'>
                    <div className='w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors'>
                      <Settings className='w-6 h-6 text-gray-600 dark:text-gray-400' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900 dark:text-white'>
                        Manual Setup
                      </h4>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        IMAP/SMTP
                      </p>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400'>
                      <Settings className='w-4 h-4' />
                      <span>Advanced</span>
                    </div>
                  </div>
                </button>
              </div>

              <div className='mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
                <div className='flex items-start gap-3'>
                  <Shield className='w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5' />
                  <div>
                    <h4 className='font-medium text-blue-900 dark:text-blue-100'>
                      Secure Authentication
                    </h4>
                    <p className='text-sm text-blue-700 dark:text-blue-300 mt-1'>
                      OAuth providers offer the most secure connection method.
                      Manual setup requires storing credentials locally.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'oauth' && selectedProvider && (
            <div className='text-center space-y-6'>
              <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto'>
                {selectedProvider === 'gmail' ? (
                  <Mail className='w-8 h-8 text-red-600 dark:text-red-400' />
                ) : (
                  <Globe className='w-8 h-8 text-blue-600 dark:text-blue-400' />
                )}
              </div>

              <div>
                <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                  Connect to{' '}
                  {selectedProvider === 'gmail' ? 'Gmail' : 'Microsoft 365'}
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  You'll be redirected to{' '}
                  {selectedProvider === 'gmail' ? 'Google' : 'Microsoft'} to
                  sign in and authorize access
                </p>
              </div>

              <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
                <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
                  Permissions Requested:
                </h4>
                <ul className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                  <li className='flex items-center gap-2'>
                    <Check className='w-4 h-4 text-green-500' />
                    Read and manage your email messages
                  </li>
                  <li className='flex items-center gap-2'>
                    <Check className='w-4 h-4 text-green-500' />
                    Send emails on your behalf
                  </li>
                  <li className='flex items-center gap-2'>
                    <Check className='w-4 h-4 text-green-500' />
                    Access your basic profile information
                  </li>
                </ul>
              </div>

              <div className='flex gap-4 justify-center'>
                <button
                  onClick={() => setStep('provider')}
                  className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                >
                  Back
                </button>
                <button
                  onClick={handleOAuthConnect}
                  disabled={isLoading}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {isLoading ? 'Connecting...' : 'Connect Account'}
                </button>
              </div>
            </div>
          )}

          {step === 'manual' && (
            <form onSubmit={handleManualSubmit} className='space-y-6'>
              <div className='text-center mb-6'>
                <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                  Manual Email Configuration
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Configure IMAP and SMTP settings for your email provider
                </p>
              </div>

              {/* Account Information */}
              <div className='space-y-4'>
                <h4 className='font-medium text-gray-900 dark:text-white'>
                  Account Information
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Email Address *
                    </label>
                    <input
                      type='email'
                      required
                      value={manualConfig.email}
                      onChange={e =>
                        setManualConfig(prev => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                      placeholder='user@example.com'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Display Name *
                    </label>
                    <input
                      type='text'
                      required
                      value={manualConfig.displayName}
                      onChange={e =>
                        setManualConfig(prev => ({
                          ...prev,
                          displayName: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                      placeholder='Your Name'
                    />
                  </div>
                </div>
              </div>

              {/* IMAP Settings */}
              <div className='space-y-4'>
                <h4 className='font-medium text-gray-900 dark:text-white'>
                  IMAP Settings (Incoming Mail)
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      IMAP Server *
                    </label>
                    <input
                      type='text'
                      required
                      value={manualConfig.imapHost}
                      onChange={e =>
                        setManualConfig(prev => ({
                          ...prev,
                          imapHost: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                      placeholder='imap.example.com'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Port *
                    </label>
                    <input
                      type='number'
                      required
                      value={manualConfig.imapPort}
                      onChange={e =>
                        setManualConfig(prev => ({
                          ...prev,
                          imapPort: parseInt(e.target.value),
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    />
                  </div>
                </div>
                <div>
                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={manualConfig.imapSecure}
                      onChange={e =>
                        setManualConfig(prev => ({
                          ...prev,
                          imapSecure: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      Use SSL/TLS encryption
                    </span>
                  </label>
                </div>
              </div>

              {/* SMTP Settings */}
              <div className='space-y-4'>
                <h4 className='font-medium text-gray-900 dark:text-white'>
                  SMTP Settings (Outgoing Mail)
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      SMTP Server *
                    </label>
                    <input
                      type='text'
                      required
                      value={manualConfig.smtpHost}
                      onChange={e =>
                        setManualConfig(prev => ({
                          ...prev,
                          smtpHost: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                      placeholder='smtp.example.com'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Port *
                    </label>
                    <input
                      type='number'
                      required
                      value={manualConfig.smtpPort}
                      onChange={e =>
                        setManualConfig(prev => ({
                          ...prev,
                          smtpPort: parseInt(e.target.value),
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    />
                  </div>
                </div>
                <div>
                  <label className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={manualConfig.smtpSecure}
                      onChange={e =>
                        setManualConfig(prev => ({
                          ...prev,
                          smtpSecure: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      Use SSL/TLS encryption
                    </span>
                  </label>
                </div>
              </div>

              {/* Authentication */}
              <div className='space-y-4'>
                <h4 className='font-medium text-gray-900 dark:text-white'>
                  Authentication
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Username *
                    </label>
                    <input
                      type='text'
                      required
                      value={manualConfig.username}
                      onChange={e =>
                        setManualConfig(prev => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                      placeholder='Usually your email address'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Password *
                    </label>
                    <div className='relative'>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={manualConfig.password}
                        onChange={e =>
                          setManualConfig(prev => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                        placeholder='Your email password'
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      >
                        {showPassword ? (
                          <EyeOff className='w-4 h-4' />
                        ) : (
                          <Eye className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex gap-4 justify-end pt-4 border-t dark:border-gray-700'>
                <button
                  type='button'
                  onClick={() => setStep('provider')}
                  className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                >
                  Back
                </button>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {isLoading ? 'Adding Account...' : 'Add Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailAccountSetup;
