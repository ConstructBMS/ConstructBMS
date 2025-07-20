// Email integration type definitions
export type EmailProvider =
  | 'gmail'
  | 'microsoft365'
  | 'yahoo'
  | 'icloud'
  | 'protonmail'
  | 'manual';

export interface EmailAccount {
  configuration: EmailConfiguration;
  createdAt: Date;
  displayName: string;
  email: string;
  id: string;
  isActive: boolean;
  isDefault: boolean;
  lastSyncAt?: Date;
  provider: EmailProvider;
}

export interface EmailConfiguration {
  // OAuth configuration
  // Manual IMAP/SMTP configuration
  accessToken?: string;
  expiresAt?: Date;
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
  password?: string;
  provider: EmailProvider;
  refreshToken?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  username?: string; // Should be encrypted in production
}

export interface EmailMessage {
  accountId: string;
  attachments: EmailAttachment[];
  bcc?: EmailAddress[]; 
  body: {
    html?: string;
    text?: string;
};
  cc?: EmailAddress[];
  customerId?: string;
  date: Date;
  folder: string;
  from: EmailAddress;
  id: string;
  isDeleted: boolean;
  isDraft: boolean;
  isRead: boolean;
  isSent: boolean;
  isStarred: boolean;
  labels: string[];
  messageId: string;
  priority: 'low' | 'normal' | 'high';
  // Link to CRM customer
  projectId?: string;
  replyTo?: EmailAddress[];
  subject: string;
  // Provider's message ID
  threadId?: string; 
  to: EmailAddress[]; // Link to project
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  // Base64 encoded data
  contentId?: string;
  contentType: string;
  data?: string;
  downloadUrl?: string;
  filename: string;
  id: string;
  isInline: boolean; 
  size: number;
}

export interface EmailThread {
  accountId: string;
  id: string;
  labels: string[];
  lastMessageDate: Date;
  messageCount: number;
  messages: EmailMessage[];
  participants: EmailAddress[];
  subject: string;
  unreadCount: number;
}

export interface EmailDraft {
  accountId: string;
  attachments: EmailAttachment[];
  bcc?: EmailAddress[];
  body: {
    html?: string;
    text?: string;
};
  cc?: EmailAddress[];
  customerId?: string;
  id?: string;
  projectId?: string;
  scheduledAt?: Date;
  subject: string;
  templateId?: string;
  to: EmailAddress[];
}

export interface EmailTemplate {
  body: {
    html?: string;
    text?: string;
};
  category: string;
  createdAt: Date;
  id: string;
  isActive: boolean;
  name: string;
  subject: string;
  updatedAt: Date;
  variables: string[];
}

export interface EmailFolder {
  children?: EmailFolder[];
  id: string;
  messageCount: number;
  name: string;
  parentId?: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'custom';
  unreadCount: number;
}

export interface EmailFilter {
  actions: EmailFilterAction[];
  conditions: EmailFilterCondition[];
  id: string;
  isActive: boolean;
  name: string;
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
    current: number;
  errors: string[];
  isRunning: boolean;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  progress: {
    status: string;
    total: number;
};
}

export interface EmailAnalytics {
  accountId: string;
  metrics: {
    opened: number;
    received: number;
    replied: number;
    responseTime: number;
    sent: number; // Average in minutes
    topSenders: Array<{ count: number, email: string; 
}>;
    topSubjects: Array<{ count: number, subject: string; }>;
  };
  period: 'day' | 'week' | 'month' | 'year';
}

// OAuth provider configurations
export interface OAuthConfig {
  authUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
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
