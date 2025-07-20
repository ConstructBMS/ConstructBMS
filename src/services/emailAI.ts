import { EmailMessage } from '../types/email';

// AI Email Intelligence Types
export interface AIEmailAnalysis {
    actionItems?: string[];
    amounts?: number[];
  category: string;
  createdAt: Date;
    dates?: string[];
  emailId: string;
  extractedData: {
    phoneNumbers?: string[];
    urls?: string[];
};
  id: string;
  keyPoints: string[];
  relatedEntities: {
    contractors?: Array<{
      confidence: number;
      id: string;
      name: string;
      role?: string;
    }>;
    customers?: Array<{
      confidence: number;
      email?: string;
      id: string;
      name: string;
    }>;
    opportunities?: Array<{
      confidence: number;
      id: string;
      name: string;
      value?: number;
    }>;
    projects?: Array<{
      confidence: number;
      id: string;
      name: string;
      status?: string;
    }>;
  };
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestedActions: string[];
  summary: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface EmailThreadAnalysis {
  // in days
  duration: number;
  keyTopics: string[];
  messageCount: number;
  participantCount: number; 
  relatedEntities: AIEmailAnalysis['relatedEntities'];
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestedActions: string[];
  summary: string;
  threadId: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface AIAutomationSuggestion {
  action: string;
  condition: string;
  confidence: number;
  emailId: string;
  estimatedImpact: 'low' | 'medium' | 'high';
  id: string;
  reasoning: string;
  ruleType: 'if_then' | 'bulk_action' | 'smart_reply' | 'auto_categorize';
}

export interface EmailInsight {
  confidence: number;
  description: string;
  dueDate?: Date;
  emailId: string;
  id: string;
  priority: 'low' | 'medium' | 'high';
  suggestedAction: string;
  title: string;
  type: 'follow_up' | 'deadline' | 'action_required' | 'opportunity' | 'risk';
}

class EmailAIService {
  private analyses: Map<string, AIEmailAnalysis> = new Map();
  private threadAnalyses: Map<string, EmailThreadAnalysis> = new Map();
  private automationSuggestions: Map<string, AIAutomationSuggestion[]> =
    new Map();
  private insights: Map<string, EmailInsight[]> = new Map();
  private subscribers: ((data: any) => void)[] = [];

  // Analyze a single email
  async analyzeEmail(email: EmailMessage): Promise<AIEmailAnalysis> {
    const analysis: AIEmailAnalysis = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emailId: email.id,
      summary: this.generateSummary(email),
      keyPoints: this.extractKeyPoints(email),
      sentiment: this.analyzeSentiment(email),
      urgency: this.assessUrgency(email),
      category: this.categorizeEmail(email),
      suggestedActions: this.generateSuggestedActions(email),
      relatedEntities: this.extractRelatedEntities(email),
      extractedData: this.extractStructuredData(email),
      createdAt: new Date(),
    };

    this.analyses.set(email.id, analysis);
    this.notifySubscribers({ type: 'analysis_created', data: analysis });

    // Generate automation suggestions
    const suggestions = this.generateAutomationSuggestions(email, analysis);
    this.automationSuggestions.set(email.id, suggestions);

    // Generate insights
    const insights = this.generateInsights(email, analysis);
    this.insights.set(email.id, insights);

    return analysis;
  }

  // Analyze email thread
  async analyzeThread(emails: EmailMessage[]): Promise<EmailThreadAnalysis> {
    if (emails.length === 0) {
      throw new Error('No emails provided for thread analysis');
    }

    const firstEmail = emails[0];
    const lastEmail = emails[emails.length - 1];
    const duration =
      (lastEmail.date.getTime() - firstEmail.date.getTime()) /
      (1000 * 60 * 60 * 24);

    const analysis: EmailThreadAnalysis = {
      threadId: firstEmail.threadId || `thread_${firstEmail.id}`,
      participantCount: this.countUniqueParticipants(emails),
      messageCount: emails.length,
      duration,
      summary: this.generateThreadSummary(emails),
      keyTopics: this.extractThreadTopics(emails),
      sentiment: this.analyzeThreadSentiment(emails),
      urgency: this.assessThreadUrgency(emails),
      suggestedActions: this.generateThreadActions(emails),
      relatedEntities: this.extractThreadEntities(emails),
    };

    this.threadAnalyses.set(analysis.threadId, analysis);
    this.notifySubscribers({ type: 'thread_analysis_created', data: analysis });

    return analysis;
  }

  // Generate email summary using AI-like logic
  private generateSummary(email: EmailMessage): string {
    const content = email.body.html || email.body.text || '';
    const subject = email.subject;

    // Extract key information
    const sender = email.from.name || email.from.email;
    const isUrgent =
      subject.toLowerCase().includes('urgent') ||
      subject.toLowerCase().includes('asap');
    const isProjectRelated =
      subject.toLowerCase().includes('project') ||
      content.toLowerCase().includes('project');
    const isClientRelated =
      content.toLowerCase().includes('client') ||
      content.toLowerCase().includes('customer');

    let summary = `Email from ${sender} regarding ${subject}`;

    if (isUrgent) {
      summary +=
        '. This appears to be urgent and requires immediate attention.';
    }

    if (isProjectRelated) {
      summary += ' The email discusses project-related matters.';
    }

    if (isClientRelated) {
      summary += ' This involves client communication.';
    }

    // Add content preview
    const contentPreview = content.substring(0, 100).replace(/<[^>]*>/g, '');
    if (contentPreview.length > 50) {
      summary += ` Content: ${contentPreview}...`;
    }

    return summary;
  }

  // Extract key points from email
  private extractKeyPoints(email: EmailMessage): string[] {
    const content = (email.body.html || email.body.text || '').toLowerCase();
    const subject = email.subject.toLowerCase();
    const keyPoints: string[] = [];

    // Extract action items
    if (
      content.includes('please') ||
      content.includes('need') ||
      content.includes('require')
    ) {
      keyPoints.push('Action required from recipient');
    }

    if (content.includes('deadline') || content.includes('due date')) {
      keyPoints.push('Contains deadline or due date');
    }

    if (
      content.includes('meeting') ||
      content.includes('call') ||
      content.includes('schedule')
    ) {
      keyPoints.push('Meeting or call scheduling mentioned');
    }

    if (
      content.includes('invoice') ||
      content.includes('payment') ||
      content.includes('bill')
    ) {
      keyPoints.push('Financial matter discussed');
    }

    if (subject.includes('urgent') || subject.includes('asap')) {
      keyPoints.push('Marked as urgent');
    }

    if (email.attachments.length > 0) {
      keyPoints.push(`Contains ${email.attachments.length} attachment(s)`);
    }

    return keyPoints.length > 0
      ? keyPoints
      : ['Standard business communication'];
  }

  // Analyze sentiment
  private analyzeSentiment(
    email: EmailMessage
  ): 'positive' | 'negative' | 'neutral' {
    const content = (email.body.html || email.body.text || '').toLowerCase();
    const subject = email.subject.toLowerCase();

    const positiveWords = [
      'thank',
      'great',
      'excellent',
      'good',
      'happy',
      'pleased',
      'success',
      'approved',
    ];
    const negativeWords = [
      'problem',
      'issue',
      'urgent',
      'asap',
      'delay',
      'cancel',
      'refund',
      'complaint',
      'error',
    ];

    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach(word => {
      if (content.includes(word) || subject.includes(word)) positiveScore++;
    });

    negativeWords.forEach(word => {
      if (content.includes(word) || subject.includes(word)) negativeScore++;
    });

    if (negativeScore > positiveScore) return 'negative';
    if (positiveScore > negativeScore) return 'positive';
    return 'neutral';
  }

  // Assess urgency
  private assessUrgency(email: EmailMessage): 'low' | 'medium' | 'high' {
    const content = (email.body.html || email.body.text || '').toLowerCase();
    const subject = email.subject.toLowerCase();

    const urgentIndicators = [
      'urgent',
      'asap',
      'immediate',
      'emergency',
      'critical',
    ];
    const mediumIndicators = ['soon', 'quickly', 'prompt', 'timely'];

    for (const indicator of urgentIndicators) {
      if (content.includes(indicator) || subject.includes(indicator)) {
        return 'high';
      }
    }

    for (const indicator of mediumIndicators) {
      if (content.includes(indicator) || subject.includes(indicator)) {
        return 'medium';
      }
    }

    return 'low';
  }

  // Categorize email
  private categorizeEmail(email: EmailMessage): string {
    const content = (email.body.html || email.body.text || '').toLowerCase();
    const subject = email.subject.toLowerCase();

    if (subject.includes('project') || content.includes('project')) {
      return 'project-related';
    }

    if (content.includes('client') || content.includes('customer')) {
      return 'client-communication';
    }

    if (
      content.includes('invoice') ||
      content.includes('payment') ||
      content.includes('bill')
    ) {
      return 'invoice-payment';
    }

    if (
      content.includes('meeting') ||
      content.includes('call') ||
      content.includes('schedule')
    ) {
      return 'meeting-scheduling';
    }

    if (subject.includes('urgent') || subject.includes('asap')) {
      return 'urgent-actionable';
    }

    if (email.from.email.includes('@constructbms.com')) {
      return 'internal-team';
    }

    return 'general';
  }

  // Generate suggested actions
  private generateSuggestedActions(email: EmailMessage): string[] {
    const actions: string[] = [];
    const content = (email.body.html || email.body.text || '').toLowerCase();
    const subject = email.subject.toLowerCase();

    // Always suggest reply for unread emails
    if (!email.isRead) {
      actions.push('Reply to sender');
    }

    // Suggest actions based on content
    if (content.includes('meeting') || content.includes('call')) {
      actions.push('Schedule meeting/call');
      actions.push('Add to calendar');
    }

    if (content.includes('project')) {
      actions.push('Link to project');
      actions.push('Create project task');
    }

    if (content.includes('client') || content.includes('customer')) {
      actions.push('Link to customer record');
      actions.push('Create follow-up task');
    }

    if (subject.includes('urgent') || content.includes('urgent')) {
      actions.push('Mark as high priority');
      actions.push('Forward to manager');
    }

    if (email.attachments.length > 0) {
      actions.push('Review attachments');
    }

    if (content.includes('invoice') || content.includes('payment')) {
      actions.push('Forward to finance team');
      actions.push('Update payment records');
    }

    return actions.length > 0 ? actions : ['Mark as read', 'Archive'];
  }

  // Extract related entities
  private extractRelatedEntities(
    email: EmailMessage
  ): AIEmailAnalysis['relatedEntities'] {
    const content = (email.body.html || email.body.text || '').toLowerCase();
    const senderEmail = email.from.email;
    const entities: AIEmailAnalysis['relatedEntities'] = {};

    // Extract customer information
    const customerMatch = this.matchCustomer(senderEmail, content);
    if (customerMatch) {
      entities.customers = [customerMatch];
    }

    // Extract project information
    const projectMatch = this.matchProject(content);
    if (projectMatch) {
      entities.projects = [projectMatch];
    }

    // Extract opportunity information
    const opportunityMatch = this.matchOpportunity(content);
    if (opportunityMatch) {
      entities.opportunities = [opportunityMatch];
    }

    return entities;
  }

  // Match customer from email
  private matchCustomer(
    senderEmail: string,
    content: string
  ): { confidence: number; email?: string, id: string; name: string; } | null {
    const knownCustomers = [
      {
        id: 'cust_1',
        name: 'TechCorp Solutions',
        email: 'contact@techcorp.com',
      },
      {
        id: 'cust_2',
        name: 'BuildPro Construction',
        email: 'info@buildpro.com',
      },
      { id: 'cust_3', name: 'ClientCorp Ltd', email: 'hello@clientcorp.com' },
      { id: 'cust_4', name: 'InnovateTech', email: 'support@innovatetech.com' },
    ];

    // Check sender email
    const customer = knownCustomers.find(c =>
      senderEmail.includes(c.email.split('@')[1])
    );
    if (customer) {
      return { ...customer, confidence: 0.9 };
    }

    // Check content for customer names
    for (const customer of knownCustomers) {
      if (content.includes(customer.name.toLowerCase().split(' ')[0])) {
        return { ...customer, confidence: 0.7 };
      }
    }

    return null;
  }

  // Match project from content
  private matchProject(
    content: string
  ): { confidence: number; id: string; name: string; status?: string } | null {
    const projectMatch = content.match(/project[:\s]+([a-zA-Z0-9\s]+)/i);
    if (projectMatch) {
      const projectName = projectMatch[1].trim();

      const knownProjects = [
        { id: 'proj_alpha', name: 'Project Alpha', status: 'In Progress' },
        { id: 'proj_beta', name: 'Project Beta', status: 'Planning' },
        { id: 'proj_gamma', name: 'Project Gamma', status: 'Completed' },
      ];

      const matchingProject = knownProjects.find(p =>
        projectName.toLowerCase().includes(p.name.toLowerCase().split(' ')[1])
      );

      if (matchingProject) {
        return { ...matchingProject, confidence: 0.8 };
      }
    }

    return null;
  }

  // Match opportunity from content
  private matchOpportunity(
    content: string
  ): { confidence: number; id: string; name: string; value?: number } | null {
    const opportunityMatch = content.match(
      /(?:opportunity|deal|proposal)[:\s]+([a-zA-Z0-9\s]+)/i
    );
    if (opportunityMatch) {
      const opportunityName = opportunityMatch[1].trim();

      const knownOpportunities = [
        { id: 'opp_1', name: 'Website Redesign', value: 25000 },
        { id: 'opp_2', name: 'Mobile App Development', value: 50000 },
        { id: 'opp_3', name: 'Cloud Migration', value: 75000 },
      ];

      const matchingOpportunity = knownOpportunities.find(o =>
        opportunityName
          .toLowerCase()
          .includes(o.name.toLowerCase().split(' ')[0])
      );

      if (matchingOpportunity) {
        return { ...matchingOpportunity, confidence: 0.7 };
      }
    }

    return null;
  }

  // Extract structured data
  private extractStructuredData(
    email: EmailMessage
  ): AIEmailAnalysis['extractedData'] {
    const content = email.body.html || email.body.text || '';
    const extractedData: AIEmailAnalysis['extractedData'] = {};

    // Extract dates
    const dateMatches = content.match(
      /\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|\d{4}-\d{1,2}-\d{1,2}/g
    );
    if (dateMatches) {
      extractedData.dates = dateMatches;
    }

    // Extract amounts
    const amountMatches = content.match(
      /£\d+(?:,\d{3})*(?:\.\d{2})?|\$\d+(?:,\d{3})*(?:\.\d{2})?/g
    );
    if (amountMatches) {
      extractedData.amounts = amountMatches.map(amount =>
        parseFloat(amount.replace(/[£$,]/g, ''))
      );
    }

    // Extract phone numbers
    const phoneMatches = content.match(/(?:\+44|0)\s*\d{4}\s*\d{3}\s*\d{3}/g);
    if (phoneMatches) {
      extractedData.phoneNumbers = phoneMatches;
    }

    // Extract URLs
    const urlMatches = content.match(/https?:\/\/[^\s]+/g);
    if (urlMatches) {
      extractedData.urls = urlMatches;
    }

    // Extract action items
    const actionMatches = content.match(
      /(?:please|need|require|should|must).*?(?:\.|$)/gi
    );
    if (actionMatches) {
      extractedData.actionItems = actionMatches.map(action => action.trim());
    }

    return extractedData;
  }

  // Generate automation suggestions
  private generateAutomationSuggestions(
    email: EmailMessage,
    analysis: AIEmailAnalysis
  ): AIAutomationSuggestion[] {
    const suggestions: AIAutomationSuggestion[] = [];

    // Suggest auto-categorization
    if (analysis.category !== 'general') {
      suggestions.push({
        id: `suggestion_${Date.now()}_1`,
        emailId: email.id,
        ruleType: 'auto_categorize',
        condition: `Email contains keywords related to ${analysis.category}`,
        action: `Automatically categorize as ${analysis.category}`,
        confidence: 0.8,
        reasoning: 'Email content matches category patterns',
        estimatedImpact: 'medium',
      });
    }

    // Suggest auto-reply for urgent emails
    if (analysis.urgency === 'high') {
      suggestions.push({
        id: `suggestion_${Date.now()}_2`,
        emailId: email.id,
        ruleType: 'smart_reply',
        condition: 'Email marked as urgent or high priority',
        action: 'Send automated acknowledgment with response timeline',
        confidence: 0.9,
        reasoning: 'Urgent emails require immediate acknowledgment',
        estimatedImpact: 'high',
      });
    }

    // Suggest bulk actions for similar emails
    if (analysis.relatedEntities.customers?.length) {
      suggestions.push({
        id: `suggestion_${Date.now()}_3`,
        emailId: email.id,
        ruleType: 'bulk_action',
        condition: 'Email from known customer',
        action: 'Link to customer record and create follow-up task',
        confidence: 0.7,
        reasoning: 'Customer emails should be tracked and followed up',
        estimatedImpact: 'medium',
      });
    }

    return suggestions;
  }

  // Generate insights
  private generateInsights(
    email: EmailMessage,
    analysis: AIEmailAnalysis
  ): EmailInsight[] {
    const insights: EmailInsight[] = [];

    // Follow-up insight
    if (
      analysis.suggestedActions.some(action => action.includes('follow-up'))
    ) {
      insights.push({
        id: `insight_${Date.now()}_1`,
        emailId: email.id,
        type: 'follow_up',
        title: 'Follow-up Required',
        description: 'This email requires a follow-up response or action',
        priority: analysis.urgency,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        suggestedAction: 'Schedule follow-up task',
        confidence: 0.8,
      });
    }

    // Deadline insight
    const extractedDates = analysis.extractedData.dates;
    if (extractedDates && extractedDates.length > 0) {
      insights.push({
        id: `insight_${Date.now()}_2`,
        emailId: email.id,
        type: 'deadline',
        title: 'Deadline Identified',
        description: `Deadline found: ${extractedDates[0]}`,
        priority: analysis.urgency,
        dueDate: new Date(extractedDates[0]),
        suggestedAction: 'Add to calendar and set reminders',
        confidence: 0.7,
      });
    }

    // Opportunity insight
    if (analysis.relatedEntities.opportunities?.length) {
      insights.push({
        id: `insight_${Date.now()}_3`,
        emailId: email.id,
        type: 'opportunity',
        title: 'Business Opportunity',
        description: 'Potential business opportunity identified',
        priority: 'high',
        suggestedAction: 'Review and prioritize opportunity',
        confidence: 0.6,
      });
    }

    return insights;
  }

  // Thread analysis helpers
  private countUniqueParticipants(emails: EmailMessage[]): number {
    const participants = new Set();
    emails.forEach(email => {
      participants.add(email.from.email);
      email.to.forEach(recipient => participants.add(recipient.email));
    });
    return participants.size;
  }

  private generateThreadSummary(emails: EmailMessage[]): string {
    const firstEmail = emails[0];
    const lastEmail = emails[emails.length - 1];
    const duration =
      (lastEmail.date.getTime() - firstEmail.date.getTime()) /
      (1000 * 60 * 60 * 24);

    return `Thread with ${emails.length} messages over ${duration.toFixed(1)} days. Started by ${firstEmail.from.name || firstEmail.from.email} regarding ${firstEmail.subject}`;
  }

  private extractThreadTopics(emails: EmailMessage[]): string[] {
    const topics = new Set<string>();

    emails.forEach(email => {
      const content = (email.body.html || email.body.text || '').toLowerCase();
      if (content.includes('project')) topics.add('Project Discussion');
      if (content.includes('meeting')) topics.add('Meeting Coordination');
      if (content.includes('deadline')) topics.add('Deadlines');
      if (content.includes('payment')) topics.add('Payment/Financial');
    });

    return Array.from(topics);
  }

  private analyzeThreadSentiment(
    emails: EmailMessage[]
  ): 'positive' | 'negative' | 'neutral' {
    let positiveCount = 0;
    let negativeCount = 0;

    emails.forEach(email => {
      const sentiment = this.analyzeSentiment(email);
      if (sentiment === 'positive') positiveCount++;
      if (sentiment === 'negative') negativeCount++;
    });

    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  }

  private assessThreadUrgency(
    emails: EmailMessage[]
  ): 'low' | 'medium' | 'high' {
    let highUrgencyCount = 0;
    let mediumUrgencyCount = 0;

    emails.forEach(email => {
      const urgency = this.assessUrgency(email);
      if (urgency === 'high') highUrgencyCount++;
      if (urgency === 'medium') mediumUrgencyCount++;
    });

    if (highUrgencyCount > 0) return 'high';
    if (mediumUrgencyCount > 0) return 'medium';
    return 'low';
  }

  private generateThreadActions(emails: EmailMessage[]): string[] {
    const actions = new Set<string>();

    emails.forEach(email => {
      const analysis = this.analyses.get(email.id);
      if (analysis) {
        analysis.suggestedActions.forEach(action => actions.add(action));
      }
    });

    return Array.from(actions).slice(0, 5); // Limit to 5 actions
  }

  private extractThreadEntities(
    emails: EmailMessage[]
  ): AIEmailAnalysis['relatedEntities'] {
    const entities: AIEmailAnalysis['relatedEntities'] = {};

    emails.forEach(email => {
      const analysis = this.analyses.get(email.id);
      if (analysis) {
        // Merge entities from all emails in thread
        Object.entries(analysis.relatedEntities).forEach(([key, value]) => {
          if (value) {
            if (!entities[key]) entities[key] = [];
            entities[key] = [...entities[key], ...value];
          }
        });
      }
    });

    // Remove duplicates
    Object.keys(entities).forEach(key => {
      if (entities[key]) {
        const unique = entities[key].filter(
          (entity, index, self) =>
            index === self.findIndex(e => e.id === entity.id)
        );
        entities[key] = unique;
      }
    });

    return entities;
  }

  // Public methods
  getAnalysis(emailId: string): AIEmailAnalysis | undefined {
    return this.analyses.get(emailId);
  }

  getThreadAnalysis(threadId: string): EmailThreadAnalysis | undefined {
    return this.threadAnalyses.get(threadId);
  }

  getAutomationSuggestions(emailId: string): AIAutomationSuggestion[] {
    return this.automationSuggestions.get(emailId) || [];
  }

  getInsights(emailId: string): EmailInsight[] {
    return this.insights.get(emailId) || [];
  }

  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(data: any): void {
    this.subscribers.forEach(callback => callback(data));
  }

  // Initialize with demo data
  initializeDemoData(): void {
    // This will be called when the service is first used
    console.log('Email AI Service initialized');
  }
}

export const emailAIService = new EmailAIService();
