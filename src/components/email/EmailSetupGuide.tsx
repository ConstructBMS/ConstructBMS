import React, { useState } from 'react';
import {
  Mail,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { EmailProvider } from '../../types/email';

interface EmailSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProvider?: EmailProvider;
}

const EmailSetupGuide: React.FC<EmailSetupGuideProps> = ({
  isOpen,
  onClose,
  selectedProvider,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    selectedProvider || 'gmail'
  );

  if (!isOpen) return null;

  const setupGuides = {
    gmail: {
      name: 'Gmail',
      icon: '📧',
      color: '#EA4335',
      description: 'Connect your Gmail account with automatic configuration',
      steps: [
        {
          title: 'Enable 2-Step Verification',
          description:
            'First, enable 2-Step Verification on your Google Account',
          instructions: [
            'Go to your Google Account settings',
            'Navigate to Security → 2-Step Verification',
            'Follow the setup process to enable 2FA',
          ],
          link: 'https://myaccount.google.com/security',
          linkText: 'Go to Google Account Security',
        },
        {
          title: 'Generate App Password',
          description:
            'Create an App Password specifically for this application',
          instructions: [
            'Go to Google Account settings',
            'Navigate to Security → 2-Step Verification → App passwords',
            'Select "Mail" as the app type',
            'Click "Generate" to create a new app password',
            'Copy the 16-character password (it will look like: xxxx xxxx xxxx xxxx)',
          ],
          link: 'https://myaccount.google.com/apppasswords',
          linkText: 'Generate App Password',
        },
        {
          title: 'Use App Password',
          description:
            'Use the App Password instead of your regular Gmail password',
          instructions: [
            'In the email setup, enter your Gmail address',
            'Use the App Password (not your regular password)',
            'The system will automatically configure Gmail settings',
          ],
        },
      ],
      tips: [
        'App passwords are more secure than regular passwords',
        'You can revoke app passwords anytime from your Google Account',
        'This works even with 2-factor authentication enabled',
        'App passwords are 16 characters long with spaces',
      ],
      troubleshooting: [
        {
          issue: 'Login fails with regular password',
          solution:
            'Use an App Password instead of your regular Gmail password',
        },
        {
          issue: '2FA not enabled',
          solution:
            'Enable 2-Step Verification first, then generate an App Password',
        },
        {
          issue: 'IMAP not working',
          solution:
            'Enable IMAP in Gmail settings: Settings → Forwarding and POP/IMAP → Enable IMAP',
        },
      ],
    },
    microsoft365: {
      name: 'Microsoft 365',
      icon: '📧',
      color: '#0078D4',
      description: 'Connect your Microsoft 365, Outlook, or Hotmail account',
      steps: [
        {
          title: 'Enable IMAP Access',
          description: 'Ensure IMAP is enabled in your Outlook settings',
          instructions: [
            'Go to Outlook.com settings',
            'Navigate to Mail → Sync email',
            'Enable IMAP access',
            'Save your changes',
          ],
          link: 'https://outlook.live.com/mail/0/options/mail/accounts',
          linkText: 'Go to Outlook Settings',
        },
        {
          title: 'Use Regular Password or App Password',
          description:
            'For most accounts, your regular password will work. For enhanced security, use an app password',
          instructions: [
            'For personal accounts: Use your regular Microsoft password',
            'For business accounts: You may need to generate an app password',
            'If 2FA is enabled: Generate an app password from Microsoft Account settings',
          ],
          link: 'https://account.microsoft.com/security',
          linkText: 'Microsoft Account Security',
        },
      ],
      tips: [
        'Works with both personal and business Microsoft 365 accounts',
        'App passwords provide better security for business accounts',
        'Enable 2FA for enhanced security',
        'IMAP must be enabled in Outlook settings',
      ],
      troubleshooting: [
        {
          issue: 'IMAP not enabled',
          solution:
            'Enable IMAP in Outlook settings: Settings → Mail → Sync email → Enable IMAP',
        },
        {
          issue: 'Business account login fails',
          solution: 'Contact your IT administrator or use an app password',
        },
        {
          issue: '2FA enabled but no app password',
          solution:
            'Generate an app password from Microsoft Account security settings',
        },
      ],
    },
  };

  const providers = Object.keys(setupGuides) as EmailProvider[];

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
              <Mail className='w-5 h-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Email Setup Guide
              </h2>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Detailed instructions for connecting your email accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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
          {/* Provider Selection */}
          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Select Your Email Provider
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              {providers.map(provider => {
                const guide = setupGuides[provider];
                return (
                  <button
                    key={provider}
                    onClick={() => setExpandedSection(provider)}
                    className={`p-4 border-2 rounded-lg transition-colors text-left ${
                      expandedSection === provider
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-10 h-10 rounded-lg flex items-center justify-center text-xl'
                        style={{ backgroundColor: guide.color + '20' }}
                      >
                        {guide.icon}
                      </div>
                      <div>
                        <div className='font-medium text-gray-900 dark:text-white'>
                          {guide.name}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                          {guide.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setup Instructions */}
          {expandedSection && (
            <div className='space-y-6'>
              <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
                <div className='flex items-start gap-3'>
                  <Zap className='w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5' />
                  <div>
                    <h4 className='font-medium text-blue-900 dark:text-blue-100 mb-1'>
                      Quick Setup Available
                    </h4>
                    <p className='text-sm text-blue-700 dark:text-blue-300'>
                      You can use our automatic setup wizard instead of
                      following these manual steps. The wizard will guide you
                      through the process step by step.
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Setup Steps
                </h3>
                {setupGuides[expandedSection].steps.map((step, index) => (
                  <div
                    key={index}
                    className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'
                  >
                    <div className='flex items-start gap-4'>
                      <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0'>
                        <span className='text-sm font-medium text-blue-600 dark:text-blue-400'>
                          {index + 1}
                        </span>
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
                          {step.title}
                        </h4>
                        <p className='text-gray-600 dark:text-gray-400 mb-3'>
                          {step.description}
                        </p>
                        <ol className='text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside'>
                          {step.instructions.map((instruction, idx) => (
                            <li key={idx}>{instruction}</li>
                          ))}
                        </ol>
                        {step.link && (
                          <div className='mt-3'>
                            <a
                              href={step.link}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm'
                            >
                              <ExternalLink className='w-4 h-4' />
                              {step.linkText}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
                <h4 className='font-medium text-green-900 dark:text-green-100 mb-3 flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5' />
                  Pro Tips
                </h4>
                <ul className='text-sm text-green-800 dark:text-green-200 space-y-1'>
                  {setupGuides[expandedSection].tips.map((tip, index) => (
                    <li key={index} className='flex items-start gap-2'>
                      <span className='text-green-600 dark:text-green-400 mt-1'>
                        •
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Troubleshooting */}
              <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
                <h4 className='font-medium text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2'>
                  <AlertCircle className='w-5 h-5' />
                  Troubleshooting
                </h4>
                <div className='space-y-3'>
                  {setupGuides[expandedSection].troubleshooting.map(
                    (item, index) => (
                      <div key={index} className='text-sm'>
                        <div className='font-medium text-yellow-900 dark:text-yellow-100 mb-1'>
                          {item.issue}
                        </div>
                        <div className='text-yellow-800 dark:text-yellow-200'>
                          {item.solution}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Security Note */}
              <div className='bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4'>
                <h4 className='font-medium text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2'>
                  <Shield className='w-5 h-5' />
                  Security Information
                </h4>
                <p className='text-sm text-purple-800 dark:text-purple-200'>
                  Your email credentials are encrypted and stored securely. We
                  never store your actual passwords - only encrypted tokens for
                  authentication. You can revoke access anytime from your email
                  provider's settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailSetupGuide;
