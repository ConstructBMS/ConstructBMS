import {
  EmailAccount,
  EmailMessage,
  EmailDraft,
  EmailFolder,
  EmailProvider,
  EmailConfiguration,
  GMAIL_OAUTH_CONFIG,
  MICROSOFT365_OAUTH_CONFIG,
} from '../types/email';
import { generateId } from '../utils';

// Simple implementations for each provider
class EmailProviderService {
  async authenticate(config: EmailConfiguration): Promise<boolean> {
    return true; // Placeholder
  }

  async getMessages(
    accountId: string,
    folderId?: string,
    limit = 50
  ): Promise<EmailMessage[]> {
    // Return realistic demo data
    const demoMessages: EmailMessage[] = [
      {
        id: generateId('msg'),
        accountId,
        messageId: generateId('external'),
        subject: 'Project Update - Q4 Goals',
        from: { email: 'sarah.manager@company.com', name: 'Sarah Johnson' },
        to: [{ email: 'john.doe@gmail.com', name: 'John Doe' }],
        cc: [{ email: 'team@company.com', name: 'Development Team' }],
        bcc: [],
        body: {
          html: "<p>Hi John,</p><p>Great work on the recent project milestones. Here's our Q4 roadmap:</p><ul><li>Complete email integration</li><li>Launch new dashboard</li><li>User testing phase</li></ul><p>Let me know if you have any questions!</p><p>Best regards,<br>Sarah</p>",
          text: "Hi John, Great work on the recent project milestones. Here's our Q4 roadmap: - Complete email integration - Launch new dashboard - User testing phase Let me know if you have any questions! Best regards, Sarah",
        },
        attachments: [],
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        isStarred: true,
        labels: ['INBOX', 'IMPORTANT'],
        folder: folderId || 'inbox',
        isDraft: false,
        isSent: false,
        isDeleted: false,
        priority: 'high',
      },
      {
        id: generateId('msg'),
        accountId,
        messageId: generateId('external'),
        subject: 'Meeting Reminder - Tomorrow 10 AM',
        from: { email: 'calendar@company.com', name: 'Company Calendar' },
        to: [{ email: 'john.doe@gmail.com', name: 'John Doe' }],
        cc: [],
        bcc: [],
        body: {
          html: '<p>Reminder: You have a meeting scheduled for tomorrow at 10:00 AM.</p><p><strong>Topic:</strong> Email Integration Demo</p><p><strong>Location:</strong> Conference Room A</p>',
          text: 'Reminder: You have a meeting scheduled for tomorrow at 10:00 AM. Topic: Email Integration Demo Location: Conference Room A',
        },
        attachments: [],
        date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isRead: true,
        isStarred: false,
        labels: ['INBOX'],
        folder: folderId || 'inbox',
        isDraft: false,
        isSent: false,
        isDeleted: false,
        priority: 'normal',
      },
      {
        id: generateId('msg'),
        accountId,
        messageId: generateId('external'),
        subject: 'Invoice #INV-2024-001',
        from: { email: 'billing@supplier.com', name: 'Tech Supplies Inc.' },
        to: [{ email: 'john.doe@gmail.com', name: 'John Doe' }],
        cc: [{ email: 'finance@company.com', name: 'Finance Department' }],
        bcc: [],
        body: {
          html: '<p>Dear John,</p><p>Please find attached the invoice for your recent order.</p><p><strong>Amount:</strong> $1,250.00</p><p><strong>Due Date:</strong> December 15, 2024</p>',
          text: 'Dear John, Please find attached the invoice for your recent order. Amount: $1,250.00 Due Date: December 15, 2024',
        },
        attachments: [
          {
            id: generateId('att'),
            filename: 'invoice-2024-001.pdf',
            contentType: 'application/pdf',
            size: 245760,
            isInline: false,
          },
        ],
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isRead: false,
        isStarred: false,
        labels: ['INBOX'],
        folder: folderId || 'inbox',
        isDraft: false,
        isSent: false,
        isDeleted: false,
        priority: 'normal',
      },
      {
        id: generateId('msg'),
        accountId,
        messageId: generateId('external'),
        subject: 'Weekly Newsletter - Tech Updates',
        from: { email: 'newsletter@technews.com', name: 'Tech News Weekly' },
        to: [{ email: 'john.doe@gmail.com', name: 'John Doe' }],
        cc: [],
        bcc: [],
        body: {
          html: '<p>This week in tech:</p><ul><li>New React 19 features announced</li><li>AI integration trends</li><li>Email security best practices</li></ul><p>Read more on our website!</p>',
          text: 'This week in tech: - New React 19 features announced - AI integration trends - Email security best practices Read more on our website!',
        },
        attachments: [],
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: true,
        isStarred: false,
        labels: ['INBOX'],
        folder: folderId || 'inbox',
        isDraft: false,
        isSent: false,
        isDeleted: false,
        priority: 'low',
      },
      {
        id: generateId('msg'),
        accountId,
        messageId: generateId('external'),
        subject: 'Password Reset Request',
        from: { email: 'noreply@company.com', name: 'IT Support' },
        to: [{ email: 'john.doe@gmail.com', name: 'John Doe' }],
        cc: [],
        bcc: [],
        body: {
          html: "<p>Your password has been successfully reset.</p><p>If you didn't request this change, please contact IT support immediately.</p>",
          text: "Your password has been successfully reset. If you didn't request this change, please contact IT support immediately.",
        },
        attachments: [],
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: true,
        isStarred: false,
        labels: ['INBOX'],
        folder: folderId || 'inbox',
        isDraft: false,
        isSent: false,
        isDeleted: false,
        priority: 'high',
      },
    ];

    // Filter by folder if specified
    if (folderId && folderId !== 'inbox') {
      return demoMessages.filter(msg => msg.folder === folderId);
    }

    return demoMessages.slice(0, limit);
  }

  async sendMessage(
    accountId: string,
    draft: EmailDraft
  ): Promise<EmailMessage> {
    return {
      id: generateId('msg'),
      accountId,
      messageId: generateId('sent'),
      subject: draft.subject,
      from: { email: 'user@company.com', name: 'Current User' },
      to: draft.to,
      cc: draft.cc || [],
      bcc: draft.bcc || [],
      body: draft.body,
      attachments: draft.attachments,
      date: new Date(),
      isRead: true,
      isStarred: false,
      labels: ['SENT'],
      folder: 'sent',
      isDraft: false,
      isSent: true,
      isDeleted: false,
      priority: 'normal',
    };
  }

  async getFolders(accountId: string): Promise<EmailFolder[]> {
    return [
      {
        id: 'inbox',
        name: 'Inbox',
        type: 'inbox',
        messageCount: 10,
        unreadCount: 3,
      },
      {
        id: 'sent',
        name: 'Sent',
        type: 'sent',
        messageCount: 25,
        unreadCount: 0,
      },
      {
        id: 'drafts',
        name: 'Drafts',
        type: 'drafts',
        messageCount: 2,
        unreadCount: 0,
      },
      {
        id: 'trash',
        name: 'Trash',
        type: 'trash',
        messageCount: 5,
        unreadCount: 0,
      },
    ];
  }

  async markAsRead(accountId: string, messageId: string): Promise<void> {
    console.log(`Marking message ${messageId} as read`);
  }

  async deleteMessage(accountId: string, messageId: string): Promise<void> {
    console.log(`Deleting message ${messageId}`);
  }
}

// Main email integration service
class EmailIntegrationService {
  private providers = new Map<EmailProvider, EmailProviderService>();

  constructor() {
    this.providers.set('gmail', new EmailProviderService());
    this.providers.set('microsoft365', new EmailProviderService());
    this.providers.set('manual', new EmailProviderService());
  }

  getProvider(provider: EmailProvider): EmailProviderService {
    const service = this.providers.get(provider);
    if (!service) {
      throw new Error(`Unsupported email provider: ${provider}`);
    }
    return service;
  }

  // Account management
  async addAccount(config: EmailConfiguration): Promise<EmailAccount> {
    const provider = this.getProvider(config.provider);
    const isAuthenticated = await provider.authenticate(config);

    if (!isAuthenticated && config.provider !== 'manual') {
      throw new Error('Authentication failed');
    }

    const account: EmailAccount = {
      id: generateId('email_account'),
      provider: config.provider,
      email: config.username || 'demo@example.com',
      displayName: 'Demo Account',
      isActive: true,
      isDefault: this.getAccounts().length === 0, // First account is default
      createdAt: new Date(),
      configuration: config,
    };

    // Save to storage
    const accounts = this.getAccounts();
    accounts.push(account);
    localStorage.setItem('emailAccounts', JSON.stringify(accounts));

    return account;
  }

  getAccounts(): EmailAccount[] {
    try {
      const stored = JSON.parse(localStorage.getItem('emailAccounts') || '[]');

      // If no accounts stored, return demo accounts for development
      if (stored.length === 0) {
        const demoAccounts: EmailAccount[] = [
          {
            id: 'demo-1',
            email: 'john.doe@gmail.com',
            displayName: 'John Doe',
            provider: 'gmail',
            isActive: true,
            isDefault: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            configuration: {
              provider: 'gmail',
              imapHost: 'imap.gmail.com',
              imapPort: 993,
              imapSecure: true,
              smtpHost: 'smtp.gmail.com',
              smtpPort: 587,
              smtpSecure: true,
              username: 'john.doe@gmail.com',
            },
          },
          {
            id: 'demo-2',
            email: 'jane.smith@outlook.com',
            displayName: 'Jane Smith',
            provider: 'microsoft365',
            isActive: true,
            isDefault: false,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            configuration: {
              provider: 'microsoft365',
              imapHost: 'outlook.office365.com',
              imapPort: 993,
              imapSecure: true,
              smtpHost: 'smtp.office365.com',
              smtpPort: 587,
              smtpSecure: true,
              username: 'jane.smith@outlook.com',
            },
          },
        ];

        // Store demo accounts
        localStorage.setItem('emailAccounts', JSON.stringify(demoAccounts));
        return demoAccounts;
      }

      return stored;
    } catch {
      return [];
    }
  }

  async removeAccount(accountId: string): Promise<void> {
    const accounts = this.getAccounts().filter(acc => acc.id !== accountId);
    localStorage.setItem('emailAccounts', JSON.stringify(accounts));
  }

  async setDefaultAccount(accountId: string): Promise<void> {
    const accounts = this.getAccounts();
    accounts.forEach(acc => {
      acc.isDefault = acc.id === accountId;
    });
    localStorage.setItem('emailAccounts', JSON.stringify(accounts));
  }

  async updateAccount(
    accountId: string,
    updates: Partial<EmailAccount>
  ): Promise<void> {
    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);

    if (accountIndex !== -1) {
      accounts[accountIndex] = { ...accounts[accountIndex], ...updates };
      localStorage.setItem('emailAccounts', JSON.stringify(accounts));
    }
  }

  // Email operations
  async getMessages(
    accountId: string,
    folderId?: string,
    limit?: number
  ): Promise<EmailMessage[]> {
    const account = this.getAccountById(accountId);
    if (!account) throw new Error('Account not found');

    const provider = this.getProvider(account.provider);
    return provider.getMessages(accountId, folderId, limit);
  }

  async sendMessage(
    accountId: string,
    draft: EmailDraft
  ): Promise<EmailMessage> {
    const account = this.getAccountById(accountId);
    if (!account) throw new Error('Account not found');

    const provider = this.getProvider(account.provider);
    const sentMessage = await provider.sendMessage(accountId, draft);

    // Update last sync time
    await this.updateAccount(accountId, { lastSyncAt: new Date() });

    return sentMessage;
  }

  async getFolders(accountId: string): Promise<EmailFolder[]> {
    const account = this.getAccountById(accountId);
    if (!account) throw new Error('Account not found');

    const provider = this.getProvider(account.provider);
    return provider.getFolders(accountId);
  }

  async markAsRead(accountId: string, messageId: string): Promise<void> {
    const account = this.getAccountById(accountId);
    if (!account) throw new Error('Account not found');

    const provider = this.getProvider(account.provider);
    return provider.markAsRead(accountId, messageId);
  }

  async deleteMessage(accountId: string, messageId: string): Promise<void> {
    const account = this.getAccountById(accountId);
    if (!account) throw new Error('Account not found');

    const provider = this.getProvider(account.provider);
    return provider.deleteMessage(accountId, messageId);
  }

  // OAuth helpers
  generateOAuthUrl(provider: EmailProvider): string {
    const config =
      provider === 'gmail' ? GMAIL_OAUTH_CONFIG : MICROSOFT365_OAUTH_CONFIG;
    const clientId =
      provider === 'gmail'
        ? import.meta.env.VITE_GMAIL_CLIENT_ID
        : import.meta.env.VITE_MICROSOFT365_CLIENT_ID;

    if (!clientId) {
      // Return demo URL for development
      return `#/auth/demo/${provider}`;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/auth/callback/${provider}`,
      scope: config.scopes!.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  async handleOAuthCallback(
    provider: EmailProvider,
    code: string
  ): Promise<EmailAccount> {
    // For demo purposes, create a mock account
    const emailConfig: EmailConfiguration = {
      provider,
      accessToken: `demo_token_${Date.now()}`,
      refreshToken: `demo_refresh_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600 * 1000),
    };

    return this.addAccount(emailConfig);
  }

  // Manual configuration
  async addManualAccount(config: {
    email: string;
    displayName: string;
    imapHost: string;
    imapPort: number;
    imapSecure: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    username: string;
    password: string;
  }): Promise<EmailAccount> {
    const emailConfig: EmailConfiguration = {
      provider: 'manual',
      imapHost: config.imapHost,
      imapPort: config.imapPort,
      imapSecure: config.imapSecure,
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpSecure: config.smtpSecure,
      username: config.username,
      password: config.password, // In production, this should be encrypted
    };

    const account = await this.addAccount(emailConfig);

    // Update account details
    await this.updateAccount(account.id, {
      email: config.email,
      displayName: config.displayName,
    });

    return account;
  }

  private getAccountById(accountId: string): EmailAccount | null {
    return this.getAccounts().find(acc => acc.id === accountId) || null;
  }

  // Sync operations
  async syncAllAccounts(): Promise<void> {
    const accounts = this.getAccounts().filter(acc => acc.isActive);

    await Promise.all(
      accounts.map(async account => {
        try {
          await this.syncAccount(account.id);
        } catch (error) {
          console.error(`Failed to sync account ${account.email}:`, error);
        }
      })
    );
  }

  async syncAccount(accountId: string): Promise<void> {
    const account = this.getAccountById(accountId);
    if (!account) return;

    // Update last sync time
    await this.updateAccount(accountId, { lastSyncAt: new Date() });

    // Sync messages (in production, this would store messages in database)
    try {
      await this.getMessages(accountId, undefined, 50);
    } catch (error) {
      console.error(
        `Failed to sync messages for account ${account.email}:`,
        error
      );
    }
  }

  // Analytics and statistics
  getAccountStats(accountId: string): {
    totalMessages: number;
    unreadCount: number;
    lastSync?: Date;
  } {
    const account = this.getAccountById(accountId);
    if (!account) return { totalMessages: 0, unreadCount: 0 };

    return {
      totalMessages: 0, // Would calculate from stored messages
      unreadCount: 0, // Would calculate from stored messages
      lastSync: account.lastSyncAt,
    };
  }

  getAllAccountsStats(): {
    totalAccounts: number;
    activeAccounts: number;
    totalMessages: number;
  } {
    const accounts = this.getAccounts();
    return {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter(acc => acc.isActive).length,
      totalMessages: 0, // Would calculate from all stored messages
    };
  }
}

export const emailIntegrationService = new EmailIntegrationService();
export default emailIntegrationService;
