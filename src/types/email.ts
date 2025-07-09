// Email integration type definitions
export type EmailProvider =
  | 'gmail'
  | 'microsoft365'
  | 'yahoo'
  | 'icloud'
  | 'protonmail'
  | 'manual';

export interface EmailAccount {
  id: string;
  provider: EmailProvider;
  email: string;
  displayName: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  lastSyncAt?: Date;
  configuration: EmailConfiguration;
}

export interface EmailConfiguration {
  provider: EmailProvider;
  // OAuth configuration
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  // Manual IMAP/SMTP configuration
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  username?: string;
  password?: string; // Should be encrypted in production
}

export interface EmailMessage {
  id: string;
  accountId: string;
  messageId: string; // Provider's message ID
  threadId?: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress[];
  body: {
    text?: string;
    html?: string;
  };
  attachments: EmailAttachment[];
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  folder: string;
  isDraft: boolean;
  isSent: boolean;
  isDeleted: boolean;
  priority: 'low' | 'normal' | 'high';
  customerId?: string; // Link to CRM customer
  projectId?: string; // Link to project
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  contentId?: string;
  isInline: boolean;
  data?: string; // Base64 encoded data
  downloadUrl?: string;
}

export interface EmailThread {
  id: string;
  accountId: string;
  subject: string;
  participants: EmailAddress[];
  messageCount: number;
  unreadCount: number;
  lastMessageDate: Date;
  labels: string[];
  messages: EmailMessage[];
}

export interface EmailDraft {
  id?: string;
  accountId: string;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: {
    text?: string;
    html?: string;
  };
  attachments: EmailAttachment[];
  scheduledAt?: Date;
  templateId?: string;
  customerId?: string;
  projectId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: {
    text?: string;
    html?: string;
  };
  variables: string[];
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailFolder {
  id: string;
  name: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'custom';
  messageCount: number;
  unreadCount: number;
  parentId?: string;
  children?: EmailFolder[];
}

export interface EmailFilter {
  id: string;
  name: string;
  conditions: EmailFilterCondition[];
  actions: EmailFilterAction[];
  isActive: boolean;
  priority: number;
}

export interface EmailFilterCondition {
  field: 'from' | 'to' | 'subject' | 'body' | 'attachment';
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'regex';
  value: string;
}

export interface EmailFilterAction {
  type: 'label' | 'folder' | 'forward' | 'delete' | 'markRead' | 'star';
  value?: string;
}

export interface EmailSyncStatus {
  accountId: string;
  isRunning: boolean;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  progress: {
    current: number;
    total: number;
    status: string;
  };
  errors: string[];
}

export interface EmailAnalytics {
  accountId: string;
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    sent: number;
    received: number;
    opened: number;
    replied: number;
    responseTime: number; // Average in minutes
    topSenders: Array<{ email: string; count: number }>;
    topSubjects: Array<{ subject: string; count: number }>;
  };
}

// OAuth provider configurations
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

export const GMAIL_OAUTH_CONFIG: Partial<OAuthConfig> = {
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
};

export const MICROSOFT365_OAUTH_CONFIG: Partial<OAuthConfig> = {
  scopes: [
    'https://graph.microsoft.com/Mail.ReadWrite',
    'https://graph.microsoft.com/Mail.Send',
    'https://graph.microsoft.com/User.Read',
  ],
  authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
};
