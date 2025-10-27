export interface Email {
  id: string;
  subject: string;
  from: {
    name: string;
    email: string;
  };
  to: {
    name: string;
    email: string;
  }[];
  cc?: {
    name: string;
    email: string;
  }[];
  bcc?: {
    name: string;
    email: string;
  }[];
  body: string;
  htmlBody?: string;
  attachments?: EmailAttachment[];
  receivedAt: string;
  sentAt?: string;
  isRead: boolean;
  isImportant: boolean;
  isFlagged: boolean;
  folder: EmailFolder;
  labels: string[];
  threadId?: string;
  replyToId?: string;
  opportunityId?: string;
  clientId?: string;
  projectId?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export type EmailFolder = 
  | 'inbox'
  | 'sent'
  | 'drafts'
  | 'trash'
  | 'spam'
  | 'archive'
  | 'important'
  | 'flagged';

export interface EmailThread {
  id: string;
  subject: string;
  emails: Email[];
  lastActivity: string;
  isRead: boolean;
  participants: {
    name: string;
    email: string;
  }[];
}

export interface EmailFilter {
  folder?: EmailFolder;
  isRead?: boolean;
  isImportant?: boolean;
  isFlagged?: boolean;
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  dateFrom?: string;
  dateTo?: string;
  labels?: string[];
  opportunityId?: string;
  clientId?: string;
  attachments?: boolean;
}

export interface EmailCompose {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: File[];
  replyToId?: string;
  forwardFromId?: string;
  opportunityId?: string;
  clientId?: string;
  projectId?: string;
}
