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
    // Return empty array since we don't want demo messages
    return [];
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
        messageCount: 0,
        unreadCount: 0,
      },
      {
        id: 'sent',
        name: 'Sent',
        type: 'sent',
        messageCount: 0,
        unreadCount: 0,
      },
      {
        id: 'drafts',
        name: 'Drafts',
        type: 'drafts',
        messageCount: 0,
        unreadCount: 0,
      },
      {
        id: 'trash',
        name: 'Trash',
        type: 'trash',
        messageCount: 0,
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
    // Return empty array since we don't want demo email accounts
    return [];
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
    displayName: string;
    email: string;
    imapHost: string;
    imapPort: number;
    imapSecure: boolean;
    password: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    username: string;
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
    lastSync?: Date;
    totalMessages: number;
    unreadCount: number;
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
    activeAccounts: number;
    totalAccounts: number;
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
