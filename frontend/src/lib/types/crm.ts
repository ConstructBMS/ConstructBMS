/**
 * CRM Types
 *
 * Comprehensive type definitions for Customer Relationship Management
 */

export interface CRMSettings {
  // Contact Management
  contactManagement: {
    autoAssignContacts: boolean;
    duplicateDetection: boolean;
    contactCategories: string[];
    customFields: CustomField[];
    defaultContactType: 'person' | 'company';
    requireEmail: boolean;
    requirePhone: boolean;
  };

  // Lead Management
  leadManagement: {
    leadScoring: boolean;
    leadSources: LeadSource[];
    leadStatuses: LeadStatus[];
    autoLeadAssignment: boolean;
    leadConversionRules: LeadConversionRule[];
    followUpReminders: boolean;
    reminderDays: number;
  };

  // Pipeline Management
  pipelineManagement: {
    stages: PipelineStage[];
    stageColors: Record<string, string>;
    autoAdvanceStages: boolean;
    stageTimeouts: Record<string, number>; // days
    pipelineNotifications: boolean;
  };

  // Communication
  communication: {
    emailTemplates: EmailTemplate[];
    smsEnabled: boolean;
    callLogging: boolean;
    meetingScheduling: boolean;
    integrationCalendar: boolean;
    autoFollowUp: boolean;
  };

  // Reporting & Analytics
  reporting: {
    dashboardWidgets: DashboardWidget[];
    reportSchedules: ReportSchedule[];
    kpiTracking: KPITracking[];
    dataRetention: number; // days
    exportFormats: string[];
  };

  // Integration Settings
  integrations: {
    emailProvider: EmailProvider | null;
    calendarProvider: CalendarProvider | null;
    phoneSystem: PhoneSystem | null;
    socialMedia: SocialMediaIntegration[];
    webhooks: Webhook[];
  };

  // Automation
  automation: {
    workflows: Workflow[];
    triggers: Trigger[];
    actions: Action[];
    enabled: boolean;
  };
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: string;
  description?: string;
}

export interface LeadSource {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  color: string;
}

export interface LeadStatus {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isWon: boolean;
  isLost: boolean;
  color: string;
  order: number;
}

export interface LeadConversionRule {
  id: string;
  name: string;
  conditions: ConversionCondition[];
  actions: ConversionAction[];
  isActive: boolean;
}

export interface ConversionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty';
  value: string;
}

export interface ConversionAction {
  type: 'assign_user' | 'change_status' | 'send_email' | 'create_task';
  value: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  color: string;
  probability: number; // 0-100
  isWon: boolean;
  isLost: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'follow_up' | 'proposal' | 'contract' | 'custom';
  isActive: boolean;
  variables: string[];
}

export interface DashboardWidget {
  id: string;
  name: string;
  type: 'chart' | 'table' | 'metric' | 'list';
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
  isVisible: boolean;
}

export interface ReportSchedule {
  id: string;
  name: string;
  reportType: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
}

export interface KPITracking {
  id: string;
  name: string;
  metric: string;
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  isActive: boolean;
}

export interface EmailProvider {
  id: string;
  name: string;
  type: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  config: Record<string, unknown>;
  isActive: boolean;
}

export interface CalendarProvider {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'calendly';
  config: Record<string, unknown>;
  isActive: boolean;
}

export interface PhoneSystem {
  id: string;
  name: string;
  type: 'twilio' | 'vonage' | 'ringcentral';
  config: Record<string, unknown>;
  isActive: boolean;
}

export interface SocialMediaIntegration {
  id: string;
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram';
  config: Record<string, unknown>;
  isActive: boolean;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  triggers: Trigger[];
  actions: Action[];
  isActive: boolean;
  conditions?: WorkflowCondition[];
}

export interface Trigger {
  id: string;
  name: string;
  type:
    | 'contact_created'
    | 'lead_status_changed'
    | 'email_received'
    | 'task_completed';
  config: Record<string, unknown>;
}

export interface Action {
  id: string;
  name: string;
  type: 'send_email' | 'create_task' | 'update_contact' | 'assign_user';
  config: Record<string, unknown>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

// Default CRM Settings
export const defaultCRMSettings: CRMSettings = {
  contactManagement: {
    autoAssignContacts: false,
    duplicateDetection: true,
    contactCategories: [
      'client',
      'contractor',
      'consultant',
      'prospect',
      'vendor',
    ],
    customFields: [],
    defaultContactType: 'person',
    requireEmail: false,
    requirePhone: false,
  },
  leadManagement: {
    leadScoring: false,
    leadSources: [
      {
        id: '1',
        name: 'Website',
        description: 'Website inquiries',
        isActive: true,
        color: '#3b82f6',
      },
      {
        id: '2',
        name: 'Referral',
        description: 'Customer referrals',
        isActive: true,
        color: '#10b981',
      },
      {
        id: '3',
        name: 'Cold Call',
        description: 'Cold calling',
        isActive: true,
        color: '#f59e0b',
      },
      {
        id: '4',
        name: 'Email',
        description: 'Email campaigns',
        isActive: true,
        color: '#8b5cf6',
      },
    ],
    leadStatuses: [
      {
        id: '1',
        name: 'New',
        description: 'Newly created lead',
        isActive: true,
        isWon: false,
        isLost: false,
        color: '#6b7280',
        order: 1,
      },
      {
        id: '2',
        name: 'Qualified',
        description: 'Qualified lead',
        isActive: true,
        isWon: false,
        isLost: false,
        color: '#3b82f6',
        order: 2,
      },
      {
        id: '3',
        name: 'Proposal',
        description: 'Proposal sent',
        isActive: true,
        isWon: false,
        isLost: false,
        color: '#f59e0b',
        order: 3,
      },
      {
        id: '4',
        name: 'Negotiation',
        description: 'In negotiation',
        isActive: true,
        isWon: false,
        isLost: false,
        color: '#8b5cf6',
        order: 4,
      },
      {
        id: '5',
        name: 'Won',
        description: 'Deal won',
        isActive: true,
        isWon: true,
        isLost: false,
        color: '#10b981',
        order: 5,
      },
      {
        id: '6',
        name: 'Lost',
        description: 'Deal lost',
        isActive: true,
        isWon: false,
        isLost: true,
        color: '#ef4444',
        order: 6,
      },
    ],
    autoLeadAssignment: false,
    leadConversionRules: [],
    followUpReminders: true,
    reminderDays: 3,
  },
  pipelineManagement: {
    stages: [
      {
        id: '1',
        name: 'Lead',
        description: 'Initial lead',
        order: 1,
        isActive: true,
        color: '#6b7280',
        probability: 10,
        isWon: false,
        isLost: false,
      },
      {
        id: '2',
        name: 'Qualified',
        description: 'Qualified lead',
        order: 2,
        isActive: true,
        color: '#3b82f6',
        probability: 25,
        isWon: false,
        isLost: false,
      },
      {
        id: '3',
        name: 'Proposal',
        description: 'Proposal sent',
        order: 3,
        isActive: true,
        color: '#f59e0b',
        probability: 50,
        isWon: false,
        isLost: false,
      },
      {
        id: '4',
        name: 'Negotiation',
        description: 'In negotiation',
        order: 4,
        isActive: true,
        color: '#8b5cf6',
        probability: 75,
        isWon: false,
        isLost: false,
      },
      {
        id: '5',
        name: 'Closed Won',
        description: 'Deal won',
        order: 5,
        isActive: true,
        color: '#10b981',
        probability: 100,
        isWon: true,
        isLost: false,
      },
      {
        id: '6',
        name: 'Closed Lost',
        description: 'Deal lost',
        order: 6,
        isActive: true,
        color: '#ef4444',
        probability: 0,
        isWon: false,
        isLost: true,
      },
    ],
    stageColors: {},
    autoAdvanceStages: false,
    stageTimeouts: {},
    pipelineNotifications: true,
  },
  communication: {
    emailTemplates: [
      {
        id: '1',
        name: 'Welcome Email',
        subject: 'Welcome to {{company_name}}',
        body: 'Dear {{contact_name}},\n\nWelcome to our services! We look forward to working with you.\n\nBest regards,\n{{user_name}}',
        type: 'welcome',
        isActive: true,
        variables: ['company_name', 'contact_name', 'user_name'],
      },
    ],
    smsEnabled: false,
    callLogging: true,
    meetingScheduling: true,
    integrationCalendar: false,
    autoFollowUp: false,
  },
  reporting: {
    dashboardWidgets: [],
    reportSchedules: [],
    kpiTracking: [
      {
        id: '1',
        name: 'Monthly Revenue',
        metric: 'revenue',
        target: 100000,
        current: 0,
        period: 'monthly',
        isActive: true,
      },
      {
        id: '2',
        name: 'Lead Conversion Rate',
        metric: 'conversion_rate',
        target: 25,
        current: 0,
        period: 'monthly',
        isActive: true,
      },
    ],
    dataRetention: 2555, // 7 years
    exportFormats: ['pdf', 'excel', 'csv'],
  },
  integrations: {
    emailProvider: null,
    calendarProvider: null,
    phoneSystem: null,
    socialMedia: [],
    webhooks: [],
  },
  automation: {
    workflows: [],
    triggers: [],
    actions: [],
    enabled: false,
  },
};
