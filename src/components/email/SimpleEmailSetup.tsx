import React, { useState } from 'react';
import {
  Mail,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Shield,
  Zap,
} from 'lucide-react';
import type { EmailProvider, EmailAccount } from '../../types/email';
import emailIntegrationService from '../../services/emailIntegrationService';

interface SimpleEmailSetupProps {
  isOpen: boolean;
  onAccountAdded: (account: EmailAccount) => void;
  onClose: () => void;
}

const SimpleEmailSetup: React.FC<SimpleEmailSetupProps> = ({
  isOpen,
  onClose,
  onAccountAdded,
}) => {
  const [step, setStep] = useState<
    'email' | 'password' | 'testing' | 'success' | 'error'
  >('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    setError(null);

    // Auto-detect provider and move to password step
    if (newEmail.includes('@')) {
      setStep('password');
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      // Auto-configure based on email domain
      let provider: EmailProvider = 'manual';
      let config: any = {
        provider: 'manual',
        username: email,
        password: password,
      };

      if (email.includes('gmail.com') || email.includes('googlemail.com')) {
        provider = 'gmail';
        config = {
          provider: 'gmail',
          username: email,
          password: password,
          imapHost: 'imap.gmail.com',
          imapPort: 993,
          imapSecure: true,
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpSecure: true,
        };
      } else if (
        email.includes('outlook.com') ||
        email.includes('hotmail.com') ||
        email.includes('live.com')
      ) {
        provider = 'microsoft365';
        config = {
          provider: 'microsoft365',
          username: email,
          password: password,
          imapHost: 'outlook.office365.com',
          imapPort: 993,
          imapSecure: true,
          smtpHost: 'smtp.office365.com',
          smtpPort: 587,
          smtpSecure: true,
        };
      }

      setStep('testing');

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add account
      const account = await emailIntegrationService.addAccount(config);

      // Update account details
      await emailIntegrationService.updateAccount(account.id, {
        email: email,
        displayName: displayName || email.split('@')[0],
      });

      setStep('success');
      setTimeout(() => {
        onAccountAdded(account);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSetup = () => {
    setStep('email');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
  };

  const handleClose = () => {
    resetSetup();
    onClose();
  };

  const getProviderName = () => {
    if (email.includes('gmail.com') || email.includes('googlemail.com'))
      return 'Gmail';
    if (
      email.includes('outlook.com') ||
      email.includes('hotmail.com') ||
      email.includes('live.com')
    )
      return 'Microsoft 365';
    return 'Email Provider';
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
              <Mail className='w-5 h-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Add Email Account
              </h2>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Quick and easy email setup
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='p-6'>
          {error && (
            <div className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3'>
              <AlertCircle className='w-5 h-5 text-red-600 dark:text-red-400' />
              <p className='text-red-700 dark:text-red-300'>{error}</p>
            </div>
          )}

          {/* Email Input */}
          {step === 'email' && (
            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Email Address *
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  placeholder='your.email@example.com'
                  autoFocus
                />
              </div>

              <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
                <div className='flex items-start gap-3'>
                  <Zap className='w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5' />
                  <div>
                    <h4 className='font-medium text-blue-900 dark:text-blue-100 mb-1'>
                      Automatic Setup
                    </h4>
                    <p className='text-sm text-blue-700 dark:text-blue-300'>
                      We'll automatically detect your email provider and
                      configure all settings for you!
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  onClick={() => setStep('password')}
                  disabled={!email.includes('@')}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2'
                >
                  Continue
                  <ArrowRight className='w-4 h-4' />
                </button>
              </div>
            </div>
          )}

          {/* Password Input */}
          {step === 'password' && (
            <div className='space-y-6'>
              <div className='bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
                    <Mail className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div>
                    <div className='font-medium text-gray-900 dark:text-white'>
                      {getProviderName()}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      {email}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Display Name (Optional)
                </label>
                <input
                  type='text'
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  placeholder='Your Name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Password *
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className='w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder='Enter your password'
                    autoFocus
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  >
                    {showPassword ? (
                      <EyeOff className='w-5 h-5' />
                    ) : (
                      <Eye className='w-5 h-5' />
                    )}
                  </button>
                </div>
              </div>

              <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
                <h4 className='font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2'>
                  <Shield className='w-4 h-4' />
                  Security Tip
                </h4>
                <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                  For Gmail and Microsoft 365, you may need to use an App
                  Password instead of your regular password if you have 2-factor
                  authentication enabled.
                </p>
              </div>

              <div className='flex justify-between'>
                <button
                  onClick={() => setStep('email')}
                  className='px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2'
                >
                  <ArrowLeft className='w-4 h-4' />
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!password || isLoading}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2'
                >
                  {isLoading ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect Account
                      <ArrowRight className='w-4 h-4' />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Testing Connection */}
          {step === 'testing' && (
            <div className='text-center space-y-6'>
              <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto'>
                <div className='w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                  Testing Your Email Connection
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  We're verifying your email settings and testing the
                  connection...
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className='text-center space-y-6'>
              <div className='w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto'>
                <Check className='w-8 h-8 text-green-600 dark:text-green-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                  Email Account Connected Successfully!
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Your email account has been added and is ready to use.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className='space-y-6'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <AlertCircle className='w-8 h-8 text-red-600 dark:text-red-400' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                  Connection Failed
                </h3>
                <p className='text-gray-600 dark:text-gray-400 mb-4'>
                  We couldn't connect to your email account. This could be due
                  to:
                </p>
                <ul className='text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left max-w-md mx-auto'>
                  <li>• Incorrect email or password</li>
                  <li>• 2-factor authentication requiring an app password</li>
                  <li>• Email provider security settings</li>
                  <li>• Network connectivity issues</li>
                </ul>
              </div>

              <div className='flex justify-center gap-4'>
                <button
                  onClick={() => setStep('password')}
                  className='px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleEmailSetup;
