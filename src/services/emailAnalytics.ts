export interface EmailAnalytics {
  totalEmails: number;
  unreadCount: number;
  urgentCount: number;
  projectRelatedCount: number;
  clientCommunicationCount: number;
  averageResponseTime: number;
  teamWorkload: Record<string, number>;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  responseTimeTrends: ResponseTimeData[];
  emailVolumeTrends: VolumeData[];
  topSenders: SenderData[];
  topProjects: ProjectData[];
  performanceMetrics: PerformanceMetrics;
}

export interface ResponseTimeData {
  date: string;
  averageResponseTime: number;
  emailCount: number;
}

export interface VolumeData {
  date: string;
  incomingCount: number;
  outgoingCount: number;
  totalCount: number;
}

export interface SenderData {
  sender: string;
  emailCount: number;
  averagePriority: number;
  lastContact: Date;
}

export interface ProjectData {
  projectName: string;
  emailCount: number;
  urgentCount: number;
  averageResponseTime: number;
  teamMembers: string[];
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  responseTimeTarget: number;
  responseTimeCompliance: number;
  emailsProcessedToday: number;
  emailsAssignedToday: number;
  automationRulesTriggered: number;
  teamEfficiency: number;
}

export interface SearchResult {
  emailId: string;
  subject: string;
  sender: string;
  timestamp: Date;
  relevance: number;
  highlights: string[];
  category: string;
  priority: string;
}

export interface SearchFilters {
  dateRange?: { start: Date; end: Date };
  categories?: string[];
  priorities?: string[];
  senders?: string[];
  projects?: string[];
  hasAttachments?: boolean;
  isRead?: boolean;
  tags?: string[];
}

class EmailAnalyticsService {
  private emails: any[] = [];
  private searchIndex: Map<string, any> = new Map();
  private subscribers: ((data: any) => void)[] = [];

  // Update email data
  updateEmailData(emails: any[]): void {
    this.emails = emails;
    this.buildSearchIndex();
    this.notifySubscribers({
      type: 'analytics_updated',
      data: this.getAnalytics(),
    });
  }

  // Build search index for fast searching
  private buildSearchIndex(): void {
    this.searchIndex.clear();
    this.emails.forEach(email => {
      const searchableText =
        `${email.subject} ${email.content} ${email.sender} ${email.senderEmail}`.toLowerCase();
      this.searchIndex.set(email.id, {
        email,
        searchableText,
        tokens: this.tokenize(searchableText),
      });
    });
  }

  // Tokenize text for search
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  // Advanced search with filters
  search(query: string, filters?: SearchFilters): SearchResult[] {
    const queryTokens = this.tokenize(query);
    const results: SearchResult[] = [];

    this.searchIndex.forEach((indexData, emailId) => {
      const email = indexData.email;

      // Apply filters
      if (filters) {
        if (
          filters.dateRange &&
          (email.timestamp < filters.dateRange.start ||
            email.timestamp > filters.dateRange.end)
        ) {
          return;
        }
        if (
          filters.categories &&
          !filters.categories.includes(email.category)
        ) {
          return;
        }
        if (
          filters.priorities &&
          !filters.priorities.includes(email.priority)
        ) {
          return;
        }
        if (
          filters.senders &&
          !filters.senders.some(sender =>
            email.sender.toLowerCase().includes(sender.toLowerCase())
          )
        ) {
          return;
        }
        if (
          filters.hasAttachments !== undefined &&
          email.attachments?.length > 0 !== filters.hasAttachments
        ) {
          return;
        }
        if (filters.isRead !== undefined && email.isRead !== filters.isRead) {
          return;
        }
        if (
          filters.tags &&
          filters.tags.some(tag => !email.tags?.includes(tag))
        ) {
          return;
        }
      }

      // Calculate relevance score
      const relevance = this.calculateRelevance(
        queryTokens,
        indexData.tokens,
        email
      );

      if (relevance > 0) {
        const highlights = this.generateHighlights(
          query,
          indexData.searchableText
        );
        results.push({
          emailId,
          subject: email.subject,
          sender: email.sender,
          timestamp: email.timestamp,
          relevance,
          highlights,
          category: email.category,
          priority: email.priority,
        });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // Calculate search relevance
  private calculateRelevance(
    queryTokens: string[],
    emailTokens: string[],
    email: any
  ): number {
    let score = 0;

    // Exact matches
    queryTokens.forEach(token => {
      if (emailTokens.includes(token)) {
        score += 2;
      }
    });

    // Partial matches
    queryTokens.forEach(queryToken => {
      emailTokens.forEach(emailToken => {
        if (
          emailToken.includes(queryToken) ||
          queryToken.includes(emailToken)
        ) {
          score += 0.5;
        }
      });
    });

    // Priority boost
    if (email.priority === 'critical') score += 1;
    if (email.priority === 'high') score += 0.5;

    // Recency boost
    const hoursSinceReceived =
      (Date.now() - email.timestamp.getTime()) / (1000 * 60 * 60);
    if (hoursSinceReceived < 24) score += 0.5;
    if (hoursSinceReceived < 1) score += 1;

    return score;
  }

  // Generate search highlights
  private generateHighlights(query: string, text: string): string[] {
    const highlights: string[] = [];
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    const words = query.split(' ');
    words.forEach(word => {
      const index = textLower.indexOf(word.toLowerCase());
      if (index !== -1) {
        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + word.length + 20);
        highlights.push(`...${text.substring(start, end)}...`);
      }
    });

    return highlights.slice(0, 3); // Limit to 3 highlights
  }

  // Get comprehensive analytics
  getAnalytics(): EmailAnalytics {
    const totalEmails = this.emails.length;
    const unreadCount = this.emails.filter(e => !e.isRead).length;
    const urgentCount = this.emails.filter(
      e => e.priority === 'critical' || e.priority === 'high'
    ).length;
    const projectRelatedCount = this.emails.filter(
      e => e.category === 'project-related'
    ).length;
    const clientCommunicationCount = this.emails.filter(
      e => e.category === 'client-communication'
    ).length;

    // Calculate average response time (simplified)
    const respondedEmails = this.emails.filter(e => e.status === 'completed');
    const averageResponseTime =
      respondedEmails.length > 0
        ? respondedEmails.reduce((sum, email) => sum + 2, 0) /
          respondedEmails.length
        : 0;

    // Team workload
    const teamWorkload: Record<string, number> = {};
    this.emails
      .filter(e => e.assignedTo)
      .forEach(email => {
        teamWorkload[email.assignedTo!] =
          (teamWorkload[email.assignedTo!] || 0) + 1;
      });

    // Category distribution
    const categoryDistribution: Record<string, number> = {};
    this.emails.forEach(email => {
      categoryDistribution[email.category] =
        (categoryDistribution[email.category] || 0) + 1;
    });

    // Priority distribution
    const priorityDistribution: Record<string, number> = {};
    this.emails.forEach(email => {
      priorityDistribution[email.priority] =
        (priorityDistribution[email.priority] || 0) + 1;
    });

    // Response time trends (last 7 days)
    const responseTimeTrends = this.generateResponseTimeTrends();

    // Email volume trends (last 7 days)
    const emailVolumeTrends = this.generateVolumeTrends();

    // Top senders
    const topSenders = this.getTopSenders();

    // Top projects
    const topProjects = this.getTopProjects();

    // Performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics();

    return {
      totalEmails,
      unreadCount,
      urgentCount,
      projectRelatedCount,
      clientCommunicationCount,
      averageResponseTime,
      teamWorkload,
      categoryDistribution,
      priorityDistribution,
      responseTimeTrends,
      emailVolumeTrends,
      topSenders,
      topProjects,
      performanceMetrics,
    };
  }

  // Generate response time trends
  private generateResponseTimeTrends(): ResponseTimeData[] {
    const trends: ResponseTimeData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayEmails = this.emails.filter(email => {
        const emailDate = email.timestamp.toISOString().split('T')[0];
        return emailDate === dateStr;
      });

      const respondedEmails = dayEmails.filter(e => e.status === 'completed');
      const averageResponseTime =
        respondedEmails.length > 0
          ? respondedEmails.reduce((sum, email) => sum + 2, 0) /
            respondedEmails.length
          : 0;

      trends.push({
        date: dateStr,
        averageResponseTime,
        emailCount: dayEmails.length,
      });
    }

    return trends;
  }

  // Generate volume trends
  private generateVolumeTrends(): VolumeData[] {
    const trends: VolumeData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayEmails = this.emails.filter(email => {
        const emailDate = email.timestamp.toISOString().split('T')[0];
        return emailDate === dateStr;
      });

      const incomingCount = dayEmails.filter(
        e => e.senderEmail !== 'you@archer.com'
      ).length;
      const outgoingCount = dayEmails.filter(
        e => e.senderEmail === 'you@archer.com'
      ).length;

      trends.push({
        date: dateStr,
        incomingCount,
        outgoingCount,
        totalCount: dayEmails.length,
      });
    }

    return trends;
  }

  // Get top senders
  private getTopSenders(): SenderData[] {
    const senderMap = new Map<
      string,
      { count: number; totalPriority: number; lastContact: Date }
    >();

    this.emails.forEach(email => {
      const sender = email.sender;
      const existing = senderMap.get(sender);

      if (existing) {
        existing.count++;
        existing.totalPriority += this.priorityToNumber(email.priority);
        if (email.timestamp > existing.lastContact) {
          existing.lastContact = email.timestamp;
        }
      } else {
        senderMap.set(sender, {
          count: 1,
          totalPriority: this.priorityToNumber(email.priority),
          lastContact: email.timestamp,
        });
      }
    });

    return Array.from(senderMap.entries())
      .map(([sender, data]) => ({
        sender,
        emailCount: data.count,
        averagePriority: data.totalPriority / data.count,
        lastContact: data.lastContact,
      }))
      .sort((a, b) => b.emailCount - a.emailCount)
      .slice(0, 10);
  }

  // Get top projects
  private getTopProjects(): ProjectData[] {
    const projectMap = new Map<
      string,
      {
        count: number;
        urgentCount: number;
        responseTimes: number[];
        teamMembers: Set<string>;
      }
    >();

    this.emails.forEach(email => {
      if (email.projectId) {
        const existing = projectMap.get(email.projectId);

        if (existing) {
          existing.count++;
          if (email.priority === 'critical' || email.priority === 'high') {
            existing.urgentCount++;
          }
          if (email.status === 'completed') {
            existing.responseTimes.push(2); // Simplified response time
          }
          if (email.assignedTo) {
            existing.teamMembers.add(email.assignedTo);
          }
        } else {
          projectMap.set(email.projectId, {
            count: 1,
            urgentCount:
              email.priority === 'critical' || email.priority === 'high'
                ? 1
                : 0,
            responseTimes: email.status === 'completed' ? [2] : [],
            teamMembers: new Set(email.assignedTo ? [email.assignedTo] : []),
          });
        }
      }
    });

    return Array.from(projectMap.entries())
      .map(([projectId, data]) => ({
        projectName: projectId,
        emailCount: data.count,
        urgentCount: data.urgentCount,
        averageResponseTime:
          data.responseTimes.length > 0
            ? data.responseTimes.reduce((sum, time) => sum + time, 0) /
              data.responseTimes.length
            : 0,
        teamMembers: Array.from(data.teamMembers),
      }))
      .sort((a, b) => b.emailCount - a.emailCount)
      .slice(0, 10);
  }

  // Calculate performance metrics
  private calculatePerformanceMetrics(): PerformanceMetrics {
    const respondedEmails = this.emails.filter(e => e.status === 'completed');
    const averageResponseTime =
      respondedEmails.length > 0
        ? respondedEmails.reduce((sum, email) => sum + 2, 0) /
          respondedEmails.length
        : 0;

    const responseTimeTarget = 4; // 4 hours target
    const responseTimeCompliance =
      respondedEmails.length > 0
        ? (respondedEmails.filter(e => 2 <= responseTimeTarget).length /
            respondedEmails.length) *
          100
        : 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayEmails = this.emails.filter(email => {
      const emailDate = email.timestamp.toISOString().split('T')[0];
      return emailDate === todayStr;
    });

    const emailsProcessedToday = todayEmails.filter(
      e => e.status === 'completed'
    ).length;
    const emailsAssignedToday = todayEmails.filter(e => e.assignedTo).length;

    // Simplified metrics
    const automationRulesTriggered = Math.floor(this.emails.length * 0.3); // 30% of emails trigger automation
    const teamEfficiency = Math.min(
      100,
      (emailsProcessedToday / Math.max(1, todayEmails.length)) * 100
    );

    return {
      averageResponseTime,
      responseTimeTarget,
      responseTimeCompliance,
      emailsProcessedToday,
      emailsAssignedToday,
      automationRulesTriggered,
      teamEfficiency,
    };
  }

  // Convert priority to number for calculations
  private priorityToNumber(priority: string): number {
    switch (priority) {
      case 'critical':
        return 4;
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 1;
    }
  }

  // Subscribe to analytics updates
  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(data: any): void {
    this.subscribers.forEach(callback => callback(data));
  }
}

export const emailAnalyticsService = new EmailAnalyticsService();
