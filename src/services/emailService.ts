import {
  EmailAccount,
  EmailMessage,
  EmailDraft,
  EmailThread,
  EmailFolder,
  EmailProvider,
  EmailConfiguration,
  EmailSyncStatus,
  GMAIL_OAUTH_CONFIG,
  MICROSOFT365_OAUTH_CONFIG,
} from '../types/email';
import { generateId } from '../utils';

// Abstract base class for email providers
abstract class EmailProviderService {
  abstract authenticate(config: EmailConfiguration): Promise<boolean>;
  abstract getMessages(
    accountId: string,
    folderId?: string,
    limit?: number
  ): Promise<EmailMessage[]>;
  abstract sendMessage(
    accountId: string,
    draft: EmailDraft
  ): Promise<EmailMessage>;
  abstract getFolders(accountId: string): Promise<EmailFolder[]>;
  abstract markAsRead(accountId: string, messageId: string): Promise<void>;
  abstract deleteMessage(accountId: string, messageId: string): Promise<void>;
  abstract refreshToken(accountId: string): Promise<string>;
}

// Gmail provider implementation
class GmailService extends EmailProviderService {
  private readonly apiBase = 'https://gmail.googleapis.com/gmail/v1';

  async authenticate(config: EmailConfiguration): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/users/me/profile`, {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Gmail authentication failed:', error);
      return false;
    }
  }

  async getMessages(
    accountId: string,
    folderId = 'INBOX',
    limit = 50
  ): Promise<EmailMessage[]> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.accessToken) {
      throw new Error('No access token available for Gmail account');
    }

    try {
      // First get message IDs
      const listResponse = await fetch(
        `${this.apiBase}/users/me/messages?labelIds=${folderId}&maxResults=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${account.configuration.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!listResponse.ok) {
        throw new Error(`Gmail API error: ${listResponse.statusText}`);
      }

      const { messages } = await listResponse.json();
      if (!messages) return [];

      // Get detailed message data
      const messagePromises = messages.map(async (msg: { id: string }) => {
        const messageResponse = await fetch(
          `${this.apiBase}/users/me/messages/${msg.id}`,
          {
            headers: {
              Authorization: `Bearer ${account.configuration.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!messageResponse.ok) {
          console.error(`Failed to fetch message ${msg.id}`);
          return null;
        }

        const messageData = await messageResponse.json();
        return this.transformGmailMessage(messageData, accountId);
      });

      const messages_detailed = await Promise.all(messagePromises);
      return messages_detailed.filter(msg => msg !== null) as EmailMessage[];
    } catch (error) {
      console.error('Failed to fetch Gmail messages:', error);
      throw error;
    }
  }

  private transformGmailMessage(
    gmailMessage: any,
    accountId: string
  ): EmailMessage {
    const headers = gmailMessage.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
        ?.value || '';

    return {
      id: generateId('msg'),
      accountId,
      messageId: gmailMessage.id,
      threadId: gmailMessage.threadId,
      subject: getHeader('Subject'),
      from: this.parseEmailAddress(getHeader('From')),
      to: this.parseEmailAddresses(getHeader('To')),
      cc: this.parseEmailAddresses(getHeader('Cc')),
      bcc: this.parseEmailAddresses(getHeader('Bcc')),
      replyTo: this.parseEmailAddresses(getHeader('Reply-To')),
      body: this.extractBody(gmailMessage.payload),
      attachments: this.extractAttachments(gmailMessage.payload),
      date: new Date(parseInt(gmailMessage.internalDate)),
      isRead: !gmailMessage.labelIds?.includes('UNREAD'),
      isStarred: gmailMessage.labelIds?.includes('STARRED') || false,
      labels: gmailMessage.labelIds || [],
      folder: this.mapGmailLabelToFolder(gmailMessage.labelIds),
      isDraft: gmailMessage.labelIds?.includes('DRAFT') || false,
      isSent: gmailMessage.labelIds?.includes('SENT') || false,
      isDeleted: gmailMessage.labelIds?.includes('TRASH') || false,
      priority: this.extractPriority(headers),
    };
  }

  private parseEmailAddress(addressString: string): {
    email: string;
    name?: string;
  } {
    if (!addressString) return { email: '' };

    const match =
      addressString.match(/^(.+?)\s*<(.+?)>$/) || addressString.match(/^(.+)$/);
    if (match) {
      if (match[2]) {
        return {
          email: match[2].trim(),
          name: match[1].trim().replace(/"/g, ''),
        };
      }
      return { email: match[1].trim() };
    }
    return { email: addressString };
  }

  private parseEmailAddresses(
    addressString: string
  ): { email: string; name?: string }[] {
    if (!addressString) return [];
    return addressString
      .split(',')
      .map(addr => this.parseEmailAddress(addr.trim()));
  }

  private extractBody(payload: any): { html?: string, text?: string; } {
    if (!payload) return {};

    if (payload.body?.data) {
      const content = atob(
        payload.body.data.replace(/-/g, '+').replace(/_/g, '/')
      );
      return payload.mimeType === 'text/html'
        ? { html: content }
        : { text: content };
    }

    if (payload.parts) {
      const body: { html?: string, text?: string; } = {};
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body.text = atob(
            part.body.data.replace(/-/g, '+').replace(/_/g, '/')
          );
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          body.html = atob(
            part.body.data.replace(/-/g, '+').replace(/_/g, '/')
          );
        }
      }
      return body;
    }

    return {};
  }

  private extractAttachments(payload: any): any[] {
    // Implementation for attachment extraction
    return [];
  }

  private mapGmailLabelToFolder(labelIds: string[]): string {
    if (labelIds?.includes('INBOX')) return 'inbox';
    if (labelIds?.includes('SENT')) return 'sent';
    if (labelIds?.includes('DRAFT')) return 'drafts';
    if (labelIds?.includes('TRASH')) return 'trash';
    if (labelIds?.includes('SPAM')) return 'spam';
    return 'inbox';
  }

  private extractPriority(headers: any[]): 'low' | 'normal' | 'high' {
    const priority = headers.find(
      h => h.name.toLowerCase() === 'x-priority'
    )?.value;
    if (priority === '1' || priority === '2') return 'high';
    if (priority === '4' || priority === '5') return 'low';
    return 'normal';
  }

  async sendMessage(
    accountId: string,
    draft: EmailDraft
  ): Promise<EmailMessage> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.accessToken) {
      throw new Error('No access token available for Gmail account');
    }

    const rawMessage = this.createRawMessage(draft);
    const encodedMessage = btoa(rawMessage)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch(`${this.apiBase}/users/me/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.configuration.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send Gmail message: ${response.statusText}`);
    }

    const sentMessage = await response.json();
    return this.transformGmailMessage(sentMessage, accountId);
  }

  private createRawMessage(draft: EmailDraft): string {
    const to = draft.to
      .map(addr => (addr.name ? `${addr.name} <${addr.email}>` : addr.email))
      .join(', ');
    const cc = draft.cc
      ?.map(addr => (addr.name ? `${addr.name} <${addr.email}>` : addr.email))
      .join(', ');
    const bcc = draft.bcc
      ?.map(addr => (addr.name ? `${addr.name} <${addr.email}>` : addr.email))
      .join(', ');

    let message = `To: ${to}\r\n`;
    if (cc) message += `Cc: ${cc}\r\n`;
    if (bcc) message += `Bcc: ${bcc}\r\n`;
    message += `Subject: ${draft.subject}\r\n`;
    message += `MIME-Version: 1.0\r\n`;
    message += `Content-Type: text/html; charset=utf-8\r\n\r\n`;
    message += draft.body.html || draft.body.text || '';

    return message;
  }

  async getFolders(accountId: string): Promise<EmailFolder[]> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.accessToken) {
      throw new Error('No access token available for Gmail account');
    }

    const response = await fetch(`${this.apiBase}/users/me/labels`, {
      headers: {
        Authorization: `Bearer ${account.configuration.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Gmail labels: ${response.statusText}`);
    }

    const { labels } = await response.json();
    return labels.map((label: any) => ({
      id: label.id,
      name: label.name,
      type: this.mapGmailLabelToFolderType(label.id),
      messageCount: label.messagesTotal || 0,
      unreadCount: label.messagesUnread || 0,
    }));
  }

  private mapGmailLabelToFolderType(labelId: string): string {
    const mapping: { [key: string]: string } = {
      INBOX: 'inbox',
      SENT: 'sent',
      DRAFT: 'drafts',
      TRASH: 'trash',
      SPAM: 'spam',
    };
    return mapping[labelId] || 'custom';
  }

  async markAsRead(accountId: string, messageId: string): Promise<void> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.accessToken) {
      throw new Error('No access token available for Gmail account');
    }

    await fetch(`${this.apiBase}/users/me/messages/${messageId}/modify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.configuration.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        removeLabelIds: ['UNREAD'],
      }),
    });
  }

  async deleteMessage(accountId: string, messageId: string): Promise<void> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.accessToken) {
      throw new Error('No access token available for Gmail account');
    }

    await fetch(`${this.apiBase}/users/me/messages/${messageId}/trash`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.configuration.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async refreshToken(accountId: string): Promise<string> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.refreshToken) {
      throw new Error('No refresh token available for Gmail account');
    }

    const response = await fetch(GMAIL_OAUTH_CONFIG.tokenUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: account.configuration.refreshToken,
        client_id: process.env.GMAIL_CLIENT_ID || '',
        client_secret: process.env.GMAIL_CLIENT_SECRET || '',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Gmail token');
    }

    const data = await response.json();
    await this.updateAccountToken(
      accountId,
      data.access_token,
      data.expires_in
    );
    return data.access_token;
  }

  private async getAccount(accountId: string): Promise<EmailAccount | null> {
    // This would typically fetch from your database
    const accounts = JSON.parse(localStorage.getItem('emailAccounts') || '[]');
    return accounts.find((acc: EmailAccount) => acc.id === accountId) || null;
  }

  private async updateAccountToken(
    accountId: string,
    accessToken: string,
    expiresIn: number
  ): Promise<void> {
    const accounts = JSON.parse(localStorage.getItem('emailAccounts') || '[]');
    const accountIndex = accounts.findIndex(
      (acc: EmailAccount) => acc.id === accountId
    );

    if (accountIndex !== -1) {
      accounts[accountIndex].configuration.accessToken = accessToken;
      accounts[accountIndex].configuration.expiresAt = new Date(
        Date.now() + expiresIn * 1000
      );
      localStorage.setItem('emailAccounts', JSON.stringify(accounts));
    }
  }
}

// Microsoft 365 provider implementation
class Microsoft365Service extends EmailProviderService {
  private readonly apiBase = 'https://graph.microsoft.com/v1.0';

  async authenticate(config: EmailConfiguration): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/me`, {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Microsoft 365 authentication failed:', error);
      return false;
    }
  }

  async getMessages(
    accountId: string,
    folderId = 'inbox',
    limit = 50
  ): Promise<EmailMessage[]> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.accessToken) {
      throw new Error('No access token available for Microsoft 365 account');
    }

    try {
      const response = await fetch(
        `${this.apiBase}/me/mailFolders/${folderId}/messages?$top=${limit}&$expand=attachments`,
        {
          headers: {
            Authorization: `Bearer ${account.configuration.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Microsoft Graph API error: ${response.statusText}`);
      }

      const { value: messages } = await response.json();
      return messages.map((msg: any) =>
        this.transformMicrosoftMessage(msg, accountId)
      );
    } catch (error) {
      console.error('Failed to fetch Microsoft 365 messages:', error);
      throw error;
    }
  }

  private transformMicrosoftMessage(
    msMessage: any,
    accountId: string
  ): EmailMessage {
    return {
      id: generateId('msg'),
      accountId,
      messageId: msMessage.id,
      threadId: msMessage.conversationId,
      subject: msMessage.subject || '',
      from: this.transformMicrosoftAddress(msMessage.from),
      to:
        msMessage.toRecipients?.map((addr: any) =>
          this.transformMicrosoftAddress(addr)
        ) || [],
      cc:
        msMessage.ccRecipients?.map((addr: any) =>
          this.transformMicrosoftAddress(addr)
        ) || [],
      bcc:
        msMessage.bccRecipients?.map((addr: any) =>
          this.transformMicrosoftAddress(addr)
        ) || [],
      replyTo:
        msMessage.replyTo?.map((addr: any) =>
          this.transformMicrosoftAddress(addr)
        ) || [],
      body: {
        text:
          msMessage.body?.contentType === 'text'
            ? msMessage.body.content
            : undefined,
        html:
          msMessage.body?.contentType === 'html'
            ? msMessage.body.content
            : undefined,
      },
      attachments:
        msMessage.attachments?.map((att: any) => ({
          id: att.id,
          filename: att.name,
          contentType: att.contentType,
          size: att.size,
          isInline: att.isInline || false,
        })) || [],
      date: new Date(msMessage.receivedDateTime),
      isRead: msMessage.isRead,
      isStarred: msMessage.flag?.flagStatus === 'flagged',
      labels: msMessage.categories || [],
      folder: folderId,
      isDraft: msMessage.isDraft,
      isSent: msMessage.parentFolderId === 'sentitems',
      isDeleted: msMessage.parentFolderId === 'deleteditems',
      priority:
        msMessage.importance === 'high'
          ? 'high'
          : msMessage.importance === 'low'
            ? 'low'
            : 'normal',
    };
  }

  private transformMicrosoftAddress(addr: any): {
    email: string;
    name?: string;
  } {
    return {
      email: addr.emailAddress?.address || '',
      name: addr.emailAddress?.name,
    };
  }

  async sendMessage(
    accountId: string,
    draft: EmailDraft
  ): Promise<EmailMessage> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.accessToken) {
      throw new Error('No access token available for Microsoft 365 account');
    }

    const messageData = {
      subject: draft.subject,
      body: {
        contentType: draft.body.html ? 'html' : 'text',
        content: draft.body.html || draft.body.text || '',
      },
      toRecipients: draft.to.map(addr => ({
        emailAddress: { address: addr.email, name: addr.name },
      })),
      ccRecipients:
        draft.cc?.map(addr => ({
          emailAddress: { address: addr.email, name: addr.name },
        })) || [],
      bccRecipients:
        draft.bcc?.map(addr => ({
          emailAddress: { address: addr.email, name: addr.name },
        })) || [],
    };

    const response = await fetch(`${this.apiBase}/me/sendMail`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.configuration.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: messageData }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send Microsoft 365 message: ${response.statusText}`
      );
    }

    // Microsoft Graph doesn't return the sent message, so we create a mock response
    return {
      id: generateId('msg'),
      accountId,
      messageId: generateId('ms'),
      subject: draft.subject,
      from: { email: account.email, name: account.displayName },
      to: draft.to,
      cc: draft.cc || [],
      bcc: draft.bcc || [],
      body: draft.body,
      attachments: draft.attachments,
      date: new Date(),
      isRead: true,
      isStarred: false,
      labels: [],
      folder: 'sent',
      isDraft: false,
      isSent: true,
      isDeleted: false,
      priority: 'normal',
    };
  }

  async getFolders(accountId: string): Promise<EmailFolder[]> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.accessToken) {
      throw new Error('No access token available for Microsoft 365 account');
    }

    const response = await fetch(`${this.apiBase}/me/mailFolders`, {
      headers: {
        Authorization: `Bearer ${account.configuration.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Microsoft 365 folders: ${response.statusText}`
      );
    }

    const { value: folders } = await response.json();
    return folders.map((folder: any) => ({
      id: folder.id,
      name: folder.displayName,
      type: this.mapMicrosoftFolderType(folder.displayName.toLowerCase()),
      messageCount: folder.totalItemCount || 0,
      unreadCount: folder.unreadItemCount || 0,
      parentId: folder.parentFolderId,
    }));
  }

  private mapMicrosoftFolderType(folderName: string): string {
    const mapping: { [key: string]: string } = {
      inbox: 'inbox',
      'sent items': 'sent',
      drafts: 'drafts',
      'deleted items': 'trash',
      'junk email': 'spam',
    };
    return mapping[folderName] || 'custom';
  }

  async markAsRead(accountId: string, messageId: string): Promise<void> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.accessToken) {
      throw new Error('No access token available for Microsoft 365 account');
    }

    await fetch(`${this.apiBase}/me/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${account.configuration.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isRead: true }),
    });
  }

  async deleteMessage(accountId: string, messageId: string): Promise<void> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.accessToken) {
      throw new Error('No access token available for Microsoft 365 account');
    }

    await fetch(`${this.apiBase}/me/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${account.configuration.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async refreshToken(accountId: string): Promise<string> {
    const account = await this.getAccount(accountId);
    if (!account?.configuration.refreshToken) {
      throw new Error('No refresh token available for Microsoft 365 account');
    }

    const response = await fetch(MICROSOFT365_OAUTH_CONFIG.tokenUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: account.configuration.refreshToken,
        client_id: process.env.MICROSOFT365_CLIENT_ID || '',
        client_secret: process.env.MICROSOFT365_CLIENT_SECRET || '',
        scope: MICROSOFT365_OAUTH_CONFIG.scopes!.join(' '),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Microsoft 365 token');
    }

    const data = await response.json();
    await this.updateAccountToken(
      accountId,
      data.access_token,
      data.expires_in
    );
    return data.access_token;
  }

  private async getAccount(accountId: string): Promise<EmailAccount | null> {
    const accounts = JSON.parse(localStorage.getItem('emailAccounts') || '[]');
    return accounts.find((acc: EmailAccount) => acc.id === accountId) || null;
  }

  private async updateAccountToken(
    accountId: string,
    accessToken: string,
    expiresIn: number
  ): Promise<void> {
    const accounts = JSON.parse(localStorage.getItem('emailAccounts') || '[]');
    const accountIndex = accounts.findIndex(
      (acc: EmailAccount) => acc.id === accountId
    );

    if (accountIndex !== -1) {
      accounts[accountIndex].configuration.accessToken = accessToken;
      accounts[accountIndex].configuration.expiresAt = new Date(
        Date.now() + expiresIn * 1000
      );
      localStorage.setItem('emailAccounts', JSON.stringify(accounts));
    }
  }
}

// Manual IMAP/SMTP service (placeholder - would need backend implementation)
class ManualEmailService extends EmailProviderService {
  async authenticate(config: EmailConfiguration): Promise<boolean> {
    // This would require backend implementation with IMAP/SMTP libraries
    // For now, just validate that all required fields are present
    return !!(
      config.imapHost &&
      config.smtpHost &&
      config.username &&
      config.password
    );
  }

  async getMessages(
    accountId: string,
    folderId = 'INBOX',
    limit = 50
  ): Promise<EmailMessage[]> {
    // Would implement IMAP connection on backend
    throw new Error('Manual email integration requires backend implementation');
  }

  async sendMessage(
    accountId: string,
    draft: EmailDraft
  ): Promise<EmailMessage> {
    // Would implement SMTP sending on backend
    throw new Error('Manual email integration requires backend implementation');
  }

  async getFolders(accountId: string): Promise<EmailFolder[]> {
    // Would fetch IMAP folders from backend
    throw new Error('Manual email integration requires backend implementation');
  }

  async markAsRead(accountId: string, messageId: string): Promise<void> {
    throw new Error('Manual email integration requires backend implementation');
  }

  async deleteMessage(accountId: string, messageId: string): Promise<void> {
    throw new Error('Manual email integration requires backend implementation');
  }

  async refreshToken(accountId: string): Promise<string> {
    throw new Error('Manual email does not use OAuth tokens');
  }
}

// Main email service factory
class EmailService {
  private providers = new Map<EmailProvider, EmailProviderService>();

  constructor() {
    this.providers.set('gmail', new GmailService());
    this.providers.set('microsoft365', new Microsoft365Service());
    this.providers.set('manual', new ManualEmailService());
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

    if (!isAuthenticated) {
      throw new Error('Authentication failed');
    }

    const account: EmailAccount = {
      id: generateId('email_account'),
      provider: config.provider,
      email: '', // Would be fetched during authentication
      displayName: '', // Would be fetched during authentication
      isActive: true,
      isDefault: false,
      createdAt: new Date(),
      configuration: config,
    };

    // Save to storage (in production, this would be saved to database)
    const accounts = this.getAccounts();
    accounts.push(account);
    localStorage.setItem('emailAccounts', JSON.stringify(accounts));

    return account;
  }

  getAccounts(): EmailAccount[] {
    return JSON.parse(localStorage.getItem('emailAccounts') || '[]');
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
    return provider.sendMessage(accountId, draft);
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
        ? process.env.GMAIL_CLIENT_ID
        : process.env.MICROSOFT365_CLIENT_ID;

    if (!clientId) {
      throw new Error(`${provider} client ID not configured`);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/auth/callback/${provider}`,
      scope: config.scopes!.join(' '),
      response_type: 'code',
      access_type: 'offline', // For Gmail
      prompt: 'consent', // Force consent screen
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  async handleOAuthCallback(
    provider: EmailProvider,
    code: string
  ): Promise<EmailAccount> {
    const config =
      provider === 'gmail' ? GMAIL_OAUTH_CONFIG : MICROSOFT365_OAUTH_CONFIG;
    const clientId =
      provider === 'gmail'
        ? process.env.GMAIL_CLIENT_ID
        : process.env.MICROSOFT365_CLIENT_ID;
    const clientSecret =
      provider === 'gmail'
        ? process.env.GMAIL_CLIENT_SECRET
        : process.env.MICROSOFT365_CLIENT_SECRET;

    const response = await fetch(config.tokenUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${window.location.origin}/auth/callback/${provider}`,
        client_id: clientId!,
        client_secret: clientSecret!,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange OAuth code for tokens');
    }

    const tokens = await response.json();

    const emailConfig: EmailConfiguration = {
      provider,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    };

    return this.addAccount(emailConfig);
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
    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);
    if (accountIndex !== -1) {
      accounts[accountIndex].lastSyncAt = new Date();
      localStorage.setItem('emailAccounts', JSON.stringify(accounts));
    }

    // Sync messages (implementation would store in database)
    await this.getMessages(accountId, undefined, 100);
  }
}

export const emailService = new EmailService();
export default emailService;
