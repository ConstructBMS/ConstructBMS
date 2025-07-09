import React, { useState, useEffect } from 'react';
import {
  Plus,
  Mail,
  Settings,
  RefreshCw,
  Trash2,
  Eye,
  Star,
  Archive,
  Send,
  Users,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { EmailAccount, EmailMessage, EmailFolder } from '../../types/email';
import emailIntegrationService from '../../services/emailIntegrationService';
import SimpleEmailSetup from './SimpleEmailSetup';
import EmailSetupGuide from './EmailSetupGuide';

const EmailIntegration: React.FC = () => {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount | null>(
    null
  );
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [folders, setFolders] = useState<EmailFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [view, setView] = useState<'list' | 'compose'>('list');

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadFolders();
      loadMessages();
    }
  }, [selectedAccount, selectedFolder]);

  const loadAccounts = () => {
    const allAccounts = emailIntegrationService.getAccounts();
    setAccounts(allAccounts);

    if (allAccounts.length > 0 && !selectedAccount) {
      const defaultAccount =
        allAccounts.find(acc => acc.isDefault) || allAccounts[0];
      setSelectedAccount(defaultAccount);
    }
  };

  const loadFolders = async () => {
    if (!selectedAccount) return;

    try {
      const accountFolders = await emailIntegrationService.getFolders(
        selectedAccount.id
      );
      setFolders(accountFolders);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedAccount) return;

    setIsLoading(true);
    try {
      const accountMessages = await emailIntegrationService.getMessages(
        selectedAccount.id,
        selectedFolder,
        50
      );
      setMessages(accountMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelect = (account: EmailAccount) => {
    setSelectedAccount(account);
    setSelectedMessage(null);
    setSelectedFolder('inbox');
  };

  const handleAddAccount = () => {
    setShowSetup(true);
  };

  const handleAccountAdded = (account: EmailAccount) => {
    setAccounts(prev => [...prev, account]);
    setSelectedAccount(account);
    setShowSetup(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return <Mail className='w-4 h-4 text-red-500' />;
      case 'microsoft365':
        return <Mail className='w-4 h-4 text-blue-500' />;
      default:
        return <Settings className='w-4 h-4 text-gray-500' />;
    }
  };

  if (accounts.length === 0 && !showSetup) {
    return (
      <div className='h-full flex flex-col items-center justify-center p-8 text-center'>
        <div className='w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6'>
          <Mail className='w-12 h-12 text-blue-600 dark:text-blue-400' />
        </div>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
          Connect Your Email
        </h2>
        <p className='text-gray-600 dark:text-gray-400 mb-8 max-w-md'>
          Integrate with Gmail, Microsoft 365, or configure manual IMAP/SMTP
          settings to manage your emails.
        </p>
        <div className='flex gap-4'>
          <button
            onClick={() => setShowGuide(true)}
            className='px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2'
          >
            <HelpCircle className='w-5 h-5' />
            Setup Guide
          </button>
          <button
            onClick={handleAddAccount}
            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
          >
            <Plus className='w-5 h-5' />
            Add Email Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col bg-white dark:bg-gray-900'>
      {/* Header */}
      <div className='flex items-center justify-between p-6 border-b dark:border-gray-700'>
        <div className='flex items-center gap-4'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Email Integration
          </h1>
          {selectedAccount && (
            <div className='flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full'>
              {getProviderIcon(selectedAccount.provider)}
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                {selectedAccount.email}
              </span>
            </div>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setShowGuide(true)}
            className='px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2'
          >
            <HelpCircle className='w-4 h-4' />
            Help
          </button>
          <button
            onClick={() => setView(view === 'list' ? 'compose' : 'list')}
            className='px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2'
          >
            {view === 'list' ? (
              <>
                <Send className='w-4 h-4' />
                Compose
              </>
            ) : (
              <>
                <Mail className='w-4 h-4' />
                Messages
              </>
            )}
          </button>
          <button
            onClick={handleAddAccount}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            Add Account
          </button>
        </div>
      </div>

      <div className='flex-1 flex overflow-hidden'>
        {/* Sidebar */}
        <div className='w-80 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col'>
          {/* Account Selector */}
          <div className='p-4 border-b dark:border-gray-700'>
            <h3 className='text-sm font-medium text-gray-900 dark:text-white mb-3'>
              Email Accounts
            </h3>
            <div className='space-y-2'>
              {accounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => handleAccountSelect(account)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedAccount?.id === account.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      {getProviderIcon(account.provider)}
                      <div>
                        <div className='font-medium text-gray-900 dark:text-white'>
                          {account.displayName}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                          {account.email}
                        </div>
                      </div>
                    </div>
                    {account.isDefault && (
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Folders */}
          {selectedAccount && (
            <div className='flex-1 p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-sm font-medium text-gray-900 dark:text-white'>
                  Folders
                </h3>
                <button
                  onClick={loadMessages}
                  disabled={isLoading}
                  className='p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors'
                >
                  <RefreshCw
                    className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>
              <div className='space-y-1'>
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full p-2 rounded-lg text-left transition-colors flex items-center justify-between ${
                      selectedFolder === folder.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className='text-sm'>{folder.name}</span>
                    {folder.unreadCount > 0 && (
                      <span className='bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full'>
                        {folder.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          {view === 'list' ? (
            <>
              {/* Message List */}
              <div className='flex-1 overflow-y-auto'>
                {isLoading ? (
                  <div className='flex items-center justify-center h-full'>
                    <RefreshCw className='w-6 h-6 animate-spin text-gray-400' />
                  </div>
                ) : (
                  <div className='divide-y dark:divide-gray-700'>
                    {messages.map(message => (
                      <button
                        key={message.id}
                        onClick={() => setSelectedMessage(message)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          !message.isRead
                            ? 'bg-blue-50 dark:bg-blue-900/10'
                            : ''
                        } ${
                          selectedMessage?.id === message.id
                            ? 'bg-blue-100 dark:bg-blue-900/20'
                            : ''
                        }`}
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-3 mb-1'>
                              <span
                                className={`font-medium text-gray-900 dark:text-white ${
                                  !message.isRead ? 'font-bold' : ''
                                }`}
                              >
                                {message.from.name || message.from.email}
                              </span>
                              {message.isStarred && (
                                <Star className='w-4 h-4 text-yellow-400 fill-current' />
                              )}
                            </div>
                            <div
                              className={`text-sm mb-1 ${
                                !message.isRead
                                  ? 'font-semibold text-gray-900 dark:text-white'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {message.subject || '(No Subject)'}
                            </div>
                            <div className='text-sm text-gray-500 dark:text-gray-400 truncate'>
                              {message.body.text || 'No preview available'}
                            </div>
                          </div>
                          <div className='flex flex-col items-end gap-2 ml-4'>
                            <span className='text-xs text-gray-500 dark:text-gray-400'>
                              {formatDate(message.date)}
                            </span>
                            {message.attachments.length > 0 && (
                              <div className='w-4 h-4 text-gray-400'>📎</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message View */}
              {selectedMessage && (
                <div className='w-1/2 border-l dark:border-gray-700 flex flex-col'>
                  <div className='p-6 border-b dark:border-gray-700'>
                    <div className='flex items-start justify-between mb-4'>
                      <div>
                        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                          {selectedMessage.subject || '(No Subject)'}
                        </h2>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                          From:{' '}
                          {selectedMessage.from.name ||
                            selectedMessage.from.email}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                          To:{' '}
                          {selectedMessage.to
                            .map(addr => addr.name || addr.email)
                            .join(', ')}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                          {formatDate(selectedMessage.date)}
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors'>
                          <Star
                            className={`w-4 h-4 ${selectedMessage.isStarred ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                          />
                        </button>
                        <button className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors'>
                          <Archive className='w-4 h-4 text-gray-400' />
                        </button>
                        <button className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors'>
                          <Trash2 className='w-4 h-4 text-gray-400' />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className='flex-1 p-6 overflow-y-auto'>
                    <div
                      className='prose dark:prose-invert max-w-none'
                      dangerouslySetInnerHTML={{
                        __html:
                          selectedMessage.body.html ||
                          selectedMessage.body.text?.replace(/\n/g, '<br>') ||
                          'No content',
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <ComposeEmailView
              selectedAccount={selectedAccount}
              onSent={() => setView('list')}
            />
          )}
        </div>
      </div>

      {/* Setup Modal */}
      {showSetup && (
        <SimpleEmailSetup
          isOpen={showSetup}
          onClose={() => setShowSetup(false)}
          onAccountAdded={handleAccountAdded}
        />
      )}

      {showGuide && (
        <EmailSetupGuide
          isOpen={showGuide}
          onClose={() => setShowGuide(false)}
        />
      )}
    </div>
  );
};

// Compose Email Component
const ComposeEmailView: React.FC<{
  selectedAccount: EmailAccount | null;
  onSent: () => void;
}> = ({ selectedAccount, onSent }) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !to.trim()) return;

    setIsLoading(true);
    try {
      const draft = {
        accountId: selectedAccount.id,
        to: [{ email: to.trim() }],
        cc: cc.trim() ? [{ email: cc.trim() }] : [],
        bcc: bcc.trim() ? [{ email: bcc.trim() }] : [],
        subject: subject.trim(),
        body: { html: body.replace(/\n/g, '<br>'), text: body },
        attachments: [],
      };

      await emailIntegrationService.sendMessage(selectedAccount.id, draft);

      // Reset form
      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setBody('');

      onSent();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex-1 flex flex-col'>
      <div className='p-6 border-b dark:border-gray-700'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
          Compose Email
        </h2>
      </div>
      <form onSubmit={handleSend} className='flex-1 flex flex-col'>
        <div className='p-6 space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              To *
            </label>
            <input
              type='email'
              required
              value={to}
              onChange={e => setTo(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
              placeholder='recipient@example.com'
            />
          </div>

          {showCcBcc && (
            <>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  CC
                </label>
                <input
                  type='email'
                  value={cc}
                  onChange={e => setCc(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  placeholder='cc@example.com'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  BCC
                </label>
                <input
                  type='email'
                  value={bcc}
                  onChange={e => setBcc(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  placeholder='bcc@example.com'
                />
              </div>
            </>
          )}

          {!showCcBcc && (
            <button
              type='button'
              onClick={() => setShowCcBcc(true)}
              className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400'
            >
              Add CC/BCC
            </button>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Subject
            </label>
            <input
              type='text'
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
              placeholder='Email subject'
            />
          </div>
        </div>

        <div className='flex-1 p-6 pt-0'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Message
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            className='w-full h-full min-h-[300px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none'
            placeholder='Write your message here...'
          />
        </div>

        <div className='p-6 border-t dark:border-gray-700 flex justify-between'>
          <button
            type='button'
            onClick={onSent}
            className='px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isLoading || !to.trim() || !selectedAccount}
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2'
          >
            {isLoading ? (
              <RefreshCw className='w-4 h-4 animate-spin' />
            ) : (
              <Send className='w-4 h-4' />
            )}
            {isLoading ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Simple Account Setup Modal
const EmailAccountSetupModal: React.FC<{
  onClose: () => void;
  onAccountAdded: (account: EmailAccount) => void;
}> = ({ onClose, onAccountAdded }) => {
  const [provider, setProvider] = useState<'gmail' | 'microsoft365' | 'manual'>(
    'gmail'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const account = await emailIntegrationService.handleOAuthCallback(
        provider,
        'demo_code'
      );
      onAccountAdded(account);
    } catch (error) {
      console.error('Failed to add account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6'>
        <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
          Add Email Account
        </h2>

        <div className='space-y-4 mb-6'>
          <button
            onClick={() => setProvider('gmail')}
            className={`w-full p-4 border-2 rounded-lg transition-colors ${
              provider === 'gmail'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600'
            }`}
          >
            <div className='flex items-center gap-3'>
              <Mail className='w-5 h-5 text-red-500' />
              <span className='font-medium text-gray-900 dark:text-white'>
                Gmail
              </span>
            </div>
          </button>

          <button
            onClick={() => setProvider('microsoft365')}
            className={`w-full p-4 border-2 rounded-lg transition-colors ${
              provider === 'microsoft365'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600'
            }`}
          >
            <div className='flex items-center gap-3'>
              <Mail className='w-5 h-5 text-blue-500' />
              <span className='font-medium text-gray-900 dark:text-white'>
                Microsoft 365
              </span>
            </div>
          </button>

          <button
            onClick={() => setProvider('manual')}
            className={`w-full p-4 border-2 rounded-lg transition-colors ${
              provider === 'manual'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600'
            }`}
          >
            <div className='flex items-center gap-3'>
              <Settings className='w-5 h-5 text-gray-500' />
              <span className='font-medium text-gray-900 dark:text-white'>
                Manual Setup
              </span>
            </div>
          </button>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailIntegration;
