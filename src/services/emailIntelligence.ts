export interface EmailMessage {
  actionRequired: boolean;
  assignedTo?: string;
  attachments: EmailAttachment[];
  autoResponse?: string;
  category: EmailCategory;
  clientId?: string;
  content: string;
  followUpDate?: Date;
  id: string;
  isArchived: boolean;
  isRead: boolean;
  priority: EmailPriority;
  projectId?: string;
  recipients: string[];
  sender: string;
  senderEmail: string;
  status: EmailStatus;
  subject: string;
  tags: string[];
  timestamp: Date;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export type EmailCategory =
  | 'project-related'
  | 'client-communication'
  | 'internal-team'
  | 'invoice-payment'
  | 'urgent-actionable'
  | 'meeting-scheduling'
  | 'document-review'
  | 'general'
  | 'archive';

export type EmailPriority = 'critical' | 'high' | 'medium' | 'low';

export type EmailStatus =
  | 'unread'
  | 'read'
  | 'archived'
  | 'deleted'
  | 'assigned'
  | 'completed';

export interface EmailAnalytics {
  averageResponseTime: number;
  categoryDistribution: Record<EmailCategory, number>;
  clientCommunicationCount: number;
  projectRelatedCount: number;
  teamWorkload: Record<string, number>;
  totalEmails: number;
  unreadCount: number;
  urgentCount: number;
}

class EmailIntelligenceService {
  private emails: EmailMessage[] = [];
  private subscribers: ((emails: EmailMessage[]) => void)[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastUnreadCount: number = 0;

  constructor() {
    // Start real-time polling for unread count changes
    this.startPolling();
  }

  private startPolling(): void {
    // Poll every 2 seconds for real-time updates
    this.pollingInterval = setInterval(() => {
      const currentUnreadCount = this.getUnreadCount();
      if (currentUnreadCount !== this.lastUnreadCount) {
        this.lastUnreadCount = currentUnreadCount;
        this.notifySubscribers();
      }
    }, 2000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  categorizeEmail(email: EmailMessage): EmailCategory {
    const subject = email.subject.toLowerCase();
    const content = email.content.toLowerCase();
    const sender = email.senderEmail.toLowerCase();

    if (
      subject.includes('project') ||
      subject.includes('task') ||
      content.includes('project')
    ) {
      return 'project-related';
    }
    if (sender.includes('client') || subject.includes('client')) {
      return 'client-communication';
    }
    if (subject.includes('invoice') || subject.includes('payment')) {
      return 'invoice-payment';
    }
    if (subject.includes('meeting') || subject.includes('call')) {
      return 'meeting-scheduling';
    }
    if (subject.includes('urgent') || subject.includes('asap')) {
      return 'urgent-actionable';
    }
    if (sender.includes('@napwood.com')) {
      return 'internal-team';
    }
    return 'general';
  }

  calculatePriority(email: EmailMessage): EmailPriority {
    let score = 0;
    const subject = email.subject.toLowerCase();
    const content = email.content.toLowerCase();

    if (subject.includes('urgent') || subject.includes('asap')) score += 4;
    if (email.category === 'project-related') score += 2;
    if (email.category === 'client-communication') score += 2;
    if (email.category === 'urgent-actionable') score += 3;

    if (score >= 6) return 'critical';
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  generateAutoResponse(email: EmailMessage): string {
    const sender = email.sender.toLowerCase();
    switch (email.category) {
      case 'project-related':
        return `Hi ${sender},\n\nThank you for your email regarding the project. I'll review and respond within 24 hours.\n\nBest regards,\nNapwood Team`;
      case 'client-communication':
                  return `Dear ${sender},\n\nThank you for reaching out. I'll address your inquiry promptly.\n\nBest regards,\nNapwood Team`;
      default:
                  return `Hi ${sender},\n\nThank you for your email. I'll respond shortly.\n\nBest regards,\nNapwood Team`;
    }
  }

  addEmail(
    emailData: Omit<EmailMessage, 'id' | 'category' | 'priority' | 'tags'>
  ): EmailMessage {
    const email: EmailMessage = {
      ...emailData,
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category: this.categorizeEmail(emailData as EmailMessage),
      priority: this.calculatePriority(emailData as EmailMessage),
      tags: [],
      autoResponse: this.generateAutoResponse(emailData as EmailMessage),
      actionRequired:
        this.calculatePriority(emailData as EmailMessage) === 'critical' ||
        this.calculatePriority(emailData as EmailMessage) === 'high',
    };

    this.emails.unshift(email);
    this.notifySubscribers();

    // Update analytics
    try {
      import('./emailAnalytics').then(({ emailAnalyticsService }) => {
        emailAnalyticsService.updateEmailData(this.emails);
      });
    } catch (error) {
      // Analytics service not available, continue
    }

    return email;
  }

  getEmails(filters?: {
    category?: EmailCategory;
    priority?: EmailPriority;
    search?: string;
    status?: EmailStatus;
    unreadOnly?: boolean;
  }): EmailMessage[] {
    let filtered = [...this.emails];

    if (filters?.category) {
      filtered = filtered.filter(email => email.category === filters.category);
    }
    if (filters?.priority) {
      filtered = filtered.filter(email => email.priority === filters.priority);
    }
    if (filters?.status) {
      filtered = filtered.filter(email => email.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        email =>
          email.subject.toLowerCase().includes(searchLower) ||
          email.content.toLowerCase().includes(searchLower) ||
          email.sender.toLowerCase().includes(searchLower)
      );
    }
    if (filters?.unreadOnly) {
      filtered = filtered.filter(email => !email.isRead);
    }

    return filtered;
  }

  updateEmailStatus(emailId: string, status: EmailStatus): void {
    const email = this.emails.find(e => e.id === emailId);
    if (email) {
      email.status = status;
      if (status === 'read') {
        email.isRead = true;
      } else if (status === 'unread') {
        email.isRead = false;
      }
      this.notifySubscribers();
    }
  }

  markAsRead(emailId: string): void {
    const email = this.emails.find(e => e.id === emailId);
    if (email && !email.isRead) {
      email.isRead = true;
      email.status = 'read';
      this.notifySubscribers();
    }
  }

  getUnreadCount(): number {
    return this.emails.filter(email => !email.isRead).length;
  }

  assignEmail(emailId: string, assignedTo: string): void {
    const email = this.emails.find(e => e.id === emailId);
    if (email) {
      email.assignedTo = assignedTo;
      email.status = 'assigned';
      this.notifySubscribers();
    }
  }

  archiveEmail(emailId: string): void {
    const email = this.emails.find(e => e.id === emailId);
    if (email) {
      email.isArchived = true;
      email.status = 'archived';
      this.notifySubscribers();
    }
  }

  deleteEmail(emailId: string): void {
    const index = this.emails.findIndex(e => e.id === emailId);
    if (index !== -1) {
      this.emails.splice(index, 1);
      this.notifySubscribers();
    }
  }

  subscribe(callback: (emails: EmailMessage[]) => void): () => void {
    this.subscribers.push(callback);
    // Immediately call with current state
    callback([...this.emails]);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback([...this.emails]));
  }

  // Cleanup method for when service is no longer needed
  destroy(): void {
    this.stopPolling();
    this.subscribers = [];
  }

  // Method to simulate real-time email arrivals (for testing)
  simulateNewEmail(): void {
    const newEmail: Omit<
      EmailMessage,
      'id' | 'category' | 'priority' | 'tags'
    > = {
      subject: `Test Email - ${new Date().toLocaleTimeString()}`,
      sender: 'Test Sender',
      senderEmail: 'test@example.com',
              recipients: ['user@napwood.com'],
      content:
        'This is a test email to verify real-time notification badge updates.',
      timestamp: new Date(),
      attachments: [],
      isRead: false,
      isArchived: false,
      actionRequired: false,
      status: 'unread',
    };

    this.addEmail(newEmail);
  }

  // Method to simulate marking emails as read (for testing)
  simulateMarkAsRead(): void {
    const unreadEmails = this.emails.filter(email => !email.isRead);
    if (unreadEmails.length > 0) {
      const randomEmail =
        unreadEmails[Math.floor(Math.random() * unreadEmails.length)];
      this.markAsRead(randomEmail.id);
    }
  }

  initializeDemoData(): void {
    // Don't initialize demo data - return empty
  }
}

export const emailIntelligenceService = new EmailIntelligenceService();
emailIntelligenceService.initializeDemoData();
