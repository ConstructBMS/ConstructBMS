import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Play,
  Pause,
  Settings,
  Zap,
  Filter,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Mail,
  Star,
  Archive,
  Tag,
  Forward,
  Bell,
  Clock,
  Layers,
  List,
  BookOpen,
  LogOut,
  Edit3,
  Copy,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Folder,
  Users,
  MessageCircle,
  Briefcase,
  Target,
  Building,
  GitBranch,
  Brain,
  Database,
  Heart,
  MessageSquare,
  GitBranch as GitBranchIcon,
  ClipboardCheck,
  ArrowUp,
  DollarSign,
  TrendingUp,
  Receipt,
  RefreshCw,
  Globe,
  Code,
  Lock,
  Shield,
  Shuffle,
  PieChart,
  Target as TargetIcon,
  CheckSquare as CheckSquareIcon,
  Timer,
  Inbox,
  BarChart3,
  TrendingDown,
  AlertCircle,
  Zap as ZapIcon,
  RotateCcw,
  RotateCw,
  Split,
  Merge,
  GitCommit,
  GitPullRequest,
} from 'lucide-react';

// --- Types ---
export type LogicalOperator = 'AND' | 'OR';
export type BranchingLogic = 'IF_THEN_ELSE' | 'SWITCH' | 'CASCADE' | 'PARALLEL';
export type PatternType =
  | 'SENTIMENT'
  | 'TOPIC'
  | 'STRUCTURE'
  | 'BEHAVIOR'
  | 'FREQUENCY';
export type FourDsAction = 'DO' | 'DELETE' | 'DELEGATE' | 'DEFER';
export type ParetoCategory = 'HIGH_VALUE' | 'LOW_VALUE' | 'UNKNOWN';

export interface RuleCondition {
  // Advanced Logic Fields
  // in minutes
  branchingLogic?: BranchingLogic;
  children?: RuleCondition[];
  confidence?: number;
  field: string;
  frequency?: number;
  id: string;
  logic?: LogicalOperator;
  operator: string;
  patternType?: PatternType;
  timeWindow?: number;
  value: string | number | boolean; 
  weight?: number; // occurrences per time window
}

export interface RuleAction {
  branching?: {
    branches: Array<{
      actions: RuleAction[];
    }>;
    condition: RuleCondition;
    defaultActions?: RuleAction[];
  };
  conditional?: {
    condition: RuleCondition;
    falseAction?: RuleAction;
    trueAction: RuleAction;
  };
  delay?: number;
  id: string;
  // in seconds
  parallel?: boolean; 
  parameters: Record<string, any>;
  priority?: number;
  retry?: {
    delayBetweenAttempts: number;
    maxAttempts: number;
  };
  type: string;
}

export interface AutomationRule {
    // New Advanced Features
  actions: RuleAction[];
  advanced?: {
    branchingEnabled?: boolean;
    branchingLogic?: BranchingLogic;
    dataRetention?: {
      daysToKeep: number;
      enabled: boolean;
    };
    fourDs?: {
      autoCategorize?: boolean;
      // email pattern -> assignee
      deferralRules?: Record<string, number>;
      delegationRules?: Record<string, string>; 
      enabled?: boolean; // email pattern -> defer hours
    };
    inboxZero?: {
      enabled?: boolean;
      maxProcessingTime?: number;
      processingStrategy?: 'IMMEDIATE' | 'BATCH' | 'SCHEDULED'; // in minutes
    };
    maxExecutionsPerHour?: number;
    maxRetries?: number;
    parallelExecution?: boolean;
    paretoAnalysis?: {
      autoCategorize?: boolean;
      enabled?: boolean;
      valueCriteria?: string[];
    };
    patternRecognition?: {
      confidenceThreshold?: number;
      enabled?: boolean;
      models?: string[];
    };
    retryOnFailure?: boolean;
    timeoutSeconds?: number;
  };
  conditions: RuleCondition[];
  createdAt: Date;
  description: string;
  executionCount: number;
  id: string;
  isActive: boolean;
  lastExecuted?: Date;
  logic: LogicalOperator;
  name: string;
  priority: number;
  schedule?: {
    cronExpression?: string;
    daysOfWeek?: number[];
    enabled?: boolean;
    endTime?: string;
    startTime?: string;
    timezone?: string;
  };
  templateId?: string;
  updatedAt: Date;
}

export interface RuleExecutionLog {
  // Enhanced Logging
  actionsTaken: string[];
  branchingDecisions?: Record<string, string>;
  emailId: string;
  executionPath?: string[];
  fourDsAction?: FourDsAction;
  id: string;
  message?: string;
  paretoCategory?: ParetoCategory;
  patternMatches?: Record<string, number>;
  processingTime?: number;
  ruleId: string;
  status: 'success' | 'error';
  timestamp: Date;
}

export interface RuleTemplate {
  actions: RuleAction[];
  category?: 'BASIC' | 'BRANCHING' | 'PATTERN' | 'PARETO' | 'INBOX_ZERO' | 'FOUR_DS' | 'Advanced';
  conditions: RuleCondition[];
  description: string;
  example?: string;
  id: string;
  logic: LogicalOperator;
  name: string;
}

// --- Enhanced Action Types ---
export const ACTION_TYPES = {
  // Basic Email Actions
  mark_read: { label: 'Mark as Read', icon: 'Eye', category: 'Email' },
  mark_unread: { label: 'Mark as Unread', icon: 'EyeOff', category: 'Email' },
  star: { label: 'Star Email', icon: 'Star', category: 'Email' },
  unstar: { label: 'Unstar Email', icon: 'Star', category: 'Email' },
  archive: { label: 'Archive Email', icon: 'Archive', category: 'Email' },
  delete: { label: 'Delete Email', icon: 'Trash2', category: 'Email' },
  forward: { label: 'Forward Email', icon: 'Forward', category: 'Email' },
  reply: { label: 'Auto Reply', icon: 'MessageCircle', category: 'Email' },
  auto_reply: { label: 'AI Auto Reply', icon: 'Zap', category: 'Email' },
  categorize: { label: 'Categorize', icon: 'Tag', category: 'Email' },
  tag: { label: 'Add Tag', icon: 'Tag', category: 'Email' },

  // CRM & Business Actions
  assign: { label: 'Assign to User', icon: 'User', category: 'CRM' },
  notify: { label: 'Send Notification', icon: 'Bell', category: 'CRM' },
  create_task: { label: 'Create Task', icon: 'CheckCircle', category: 'CRM' },
  schedule_followup: {
    label: 'Schedule Follow-up',
    icon: 'Calendar',
    category: 'CRM',
  },
  link_project: {
    label: 'Link to Project',
    icon: 'Briefcase',
    category: 'CRM',
  },
  link_customer: { label: 'Link to Customer', icon: 'Users', category: 'CRM' },

  // AI & Intelligence Actions
  ai_analyze: { label: 'AI Analyze Content', icon: 'Brain', category: 'AI' },
  ai_summarize: { label: 'AI Summarize', icon: 'FileText', category: 'AI' },
  ai_extract_data: {
    label: 'AI Extract Data',
    icon: 'Database',
    category: 'AI',
  },
  ai_sentiment: {
    label: 'AI Sentiment Analysis',
    icon: 'Heart',
    category: 'AI',
  },
  ai_priority: { label: 'AI Set Priority', icon: 'Target', category: 'AI' },
  ai_suggest_reply: {
    label: 'AI Suggest Reply',
    icon: 'MessageSquare',
    category: 'AI',
  },

  // Workflow & Automation
  trigger_workflow: {
    label: 'Trigger Workflow',
    icon: 'GitBranch',
    category: 'Workflow',
  },
  create_approval: {
    label: 'Create Approval Request',
    icon: 'ClipboardCheck',
    category: 'Workflow',
  },
  escalate: {
    label: 'Escalate to Manager',
    icon: 'ArrowUp',
    category: 'Workflow',
  },
  auto_assign: {
    label: 'Auto Assign Based on Skills',
    icon: 'Users',
    category: 'Workflow',
  },
  create_meeting: {
    label: 'Schedule Meeting',
    icon: 'Calendar',
    category: 'Workflow',
  },

  // Financial & Billing
  create_invoice: {
    label: 'Create Invoice',
    icon: 'DollarSign',
    category: 'Finance',
  },
  log_expense: { label: 'Log Expense', icon: 'Receipt', category: 'Finance' },
  create_quote: {
    label: 'Create Quote',
    icon: 'FileText',
    category: 'Finance',
  },

  // Integration Actions
  sync_crm: {
    label: 'Sync with CRM',
    icon: 'RefreshCw',
    category: 'Integration',
  },
  sync_calendar: {
    label: 'Sync with Calendar',
    icon: 'Calendar',
    category: 'Integration',
  },
  webhook: { label: 'Send Webhook', icon: 'Globe', category: 'Integration' },
  api_call: { label: 'API Call', icon: 'Code', category: 'Integration' },

  // Advanced Business Logic
  conditional_action: {
    label: 'Conditional Action',
    icon: 'GitBranch',
    category: 'Logic',
  },
  delay_action: { label: 'Delay Action', icon: 'Clock', category: 'Logic' },
  batch_process: { label: 'Batch Process', icon: 'Layers', category: 'Logic' },
  data_transform: {
    label: 'Transform Data',
    icon: 'Shuffle',
    category: 'Logic',
  },

  // Security & Compliance
  encrypt: { label: 'Encrypt Email', icon: 'Lock', category: 'Security' },
  audit_log: { label: 'Audit Log Entry', icon: 'Shield', category: 'Security' },
  compliance_check: {
    label: 'Compliance Check',
    icon: 'CheckSquare',
    category: 'Security',
  },
  data_retention: {
    label: 'Apply Retention Policy',
    icon: 'Clock',
    category: 'Security',
  },

  // NEW: Advanced Logic Actions
  // Branching Logic
  if_then_else: {
    label: 'If-Then-Else Branch',
    icon: 'GitBranch',
    category: 'Branching',
  },
  switch_case: {
    label: 'Switch Case',
    icon: 'GitCommit',
    category: 'Branching',
  },
  parallel_execute: {
    label: 'Parallel Execution',
    icon: 'Split',
    category: 'Branching',
  },
  cascade_actions: {
    label: 'Cascade Actions',
    icon: 'GitPullRequest',
    category: 'Branching',
  },

  // Pattern Recognition
  pattern_detect: {
    label: 'Detect Pattern',
    icon: 'Brain',
    category: 'Pattern',
  },
  sentiment_analyze: {
    label: 'Sentiment Analysis',
    icon: 'Heart',
    category: 'Pattern',
  },
  topic_extract: {
    label: 'Extract Topics',
    icon: 'FileText',
    category: 'Pattern',
  },
  behavior_analyze: {
    label: 'Analyze Behavior',
    icon: 'BarChart3',
    category: 'Pattern',
  },
  frequency_analyze: {
    label: 'Frequency Analysis',
    icon: 'TrendingDown',
    category: 'Pattern',
  },

  // 80/20 Rule (Pareto)
  pareto_analyze: {
    label: 'Pareto Analysis',
    icon: 'PieChart',
    category: 'Pareto',
  },
  value_categorize: {
    label: 'Categorize by Value',
    icon: 'Target',
    category: 'Pareto',
  },
  priority_optimize: {
    label: 'Optimize Priority',
    icon: 'TrendingUp',
    category: 'Pareto',
  },
  focus_high_value: {
    label: 'Focus High Value',
    icon: 'Star',
    category: 'Pareto',
  },

  // 4Ds Methodology
  do_immediate: {
    label: 'Do (Immediate)',
    icon: 'CheckCircle',
    category: '4Ds',
  },
  delete_unnecessary: {
    label: 'Delete (Unnecessary)',
    icon: 'Trash2',
    category: '4Ds',
  },
  delegate_appropriate: {
    label: 'Delegate (Appropriate)',
    icon: 'Users',
    category: '4Ds',
  },
  defer_later: { label: 'Defer (Later)', icon: 'Clock', category: '4Ds' },
  auto_4ds: { label: 'Auto 4Ds Categorization', icon: 'Zap', category: '4Ds' },

  // Inbox Zero
  inbox_zero_process: {
    label: 'Inbox Zero Process',
    icon: 'Inbox',
    category: 'InboxZero',
  },
  batch_process_emails: {
    label: 'Batch Process Emails',
    icon: 'Layers',
    category: 'InboxZero',
  },
  schedule_processing: {
    label: 'Schedule Processing',
    icon: 'Calendar',
    category: 'InboxZero',
  },
  auto_archive_old: {
    label: 'Auto Archive Old',
    icon: 'Archive',
    category: 'InboxZero',
  },
  smart_sort: { label: 'Smart Sort', icon: 'SortAsc', category: 'InboxZero' },

  // Advanced Pattern Recognition
  ml_classify: { label: 'ML Classification', icon: 'Brain', category: 'ML' },
  anomaly_detect: {
    label: 'Anomaly Detection',
    icon: 'AlertTriangle',
    category: 'ML',
  },
  trend_analyze: {
    label: 'Trend Analysis',
    icon: 'TrendingUp',
    category: 'ML',
  },
  predictive_action: {
    label: 'Predictive Action',
    icon: 'Zap',
    category: 'ML',
  },

  // Advanced Branching
  dynamic_routing: {
    label: 'Dynamic Routing',
    icon: 'GitBranch',
    category: 'Advanced',
  },
  adaptive_response: {
    label: 'Adaptive Response',
    icon: 'RotateCw',
    category: 'Advanced',
  },
  learning_rule: {
    label: 'Learning Rule',
    icon: 'Brain',
    category: 'Advanced',
  },
  context_aware: { label: 'Context Aware', icon: 'Eye', category: 'Advanced' },

  // NEW: Enhanced Email Actions
  move_to_folder: {
    label: 'Move to Folder',
    icon: 'Folder',
    category: 'Email',
  },
  copy_to_folder: { label: 'Copy to Folder', icon: 'Copy', category: 'Email' },
  mark_important: {
    label: 'Mark as Important',
    icon: 'Star',
    category: 'Email',
  },
  flag_for_followup: {
    label: 'Flag for Follow-up',
    icon: 'Flag',
    category: 'Email',
  },
  snooze_email: { label: 'Snooze Email', icon: 'Clock', category: 'Email' },
  set_reminder: { label: 'Set Reminder', icon: 'Bell', category: 'Email' },
  auto_categorize: { label: 'Auto Categorize', icon: 'Tag', category: 'Email' },
  smart_reply: {
    label: 'Smart Reply',
    icon: 'MessageSquare',
    category: 'Email',
  },
  translate_email: {
    label: 'Translate Email',
    icon: 'Globe',
    category: 'Email',
  },

  // NEW: Advanced CRM Actions
  create_contact: {
    label: 'Create Contact',
    icon: 'UserPlus',
    category: 'CRM',
  },
  update_contact: {
    label: 'Update Contact',
    icon: 'UserCheck',
    category: 'CRM',
  },
  create_opportunity: {
    label: 'Create Opportunity',
    icon: 'TrendingUp',
    category: 'CRM',
  },
  update_opportunity: {
    label: 'Update Opportunity',
    icon: 'BarChart3',
    category: 'CRM',
  },
  log_activity: { label: 'Log Activity', icon: 'Activity', category: 'CRM' },
  create_case: {
    label: 'Create Support Case',
    icon: 'LifeBuoy',
    category: 'CRM',
  },
  assign_to_team: { label: 'Assign to Team', icon: 'Users', category: 'CRM' },
  set_followup_date: {
    label: 'Set Follow-up Date',
    icon: 'Calendar',
    category: 'CRM',
  },

  // NEW: Advanced Project Actions
  create_project: {
    label: 'Create Project',
    icon: 'Briefcase',
    category: 'Project',
  },
  update_project: {
    label: 'Update Project',
    icon: 'Edit3',
    category: 'Project',
  },
  create_milestone: {
    label: 'Create Milestone',
    icon: 'Flag',
    category: 'Project',
  },
  assign_project_task: {
    label: 'Assign Project Task',
    icon: 'CheckSquare',
    category: 'Project',
  },
  update_project_status: {
    label: 'Update Project Status',
    icon: 'RefreshCw',
    category: 'Project',
  },
  create_project_document: {
    label: 'Create Project Document',
    icon: 'FileText',
    category: 'Project',
  },

  // NEW: Advanced Financial Actions
  extract_invoice_data: {
    label: 'Extract Invoice Data',
    icon: 'Receipt',
    category: 'Finance',
  },
  create_expense_report: {
    label: 'Create Expense Report',
    icon: 'DollarSign',
    category: 'Finance',
  },
  update_accounting: {
    label: 'Update Accounting',
    icon: 'Calculator',
    category: 'Finance',
  },
  process_payment: {
    label: 'Process Payment',
    icon: 'CreditCard',
    category: 'Finance',
  },
  create_budget_alert: {
    label: 'Create Budget Alert',
    icon: 'AlertTriangle',
    category: 'Finance',
  },

  // NEW: Advanced Integration Actions
  zapier_webhook: {
    label: 'Zapier Webhook',
    icon: 'Zap',
    category: 'Integration',
  },
  slack_message: {
    label: 'Slack Message',
    icon: 'MessageCircle',
    category: 'Integration',
  },
  teams_message: {
    label: 'Teams Message',
    icon: 'MessageSquare',
    category: 'Integration',
  },
  discord_webhook: {
    label: 'Discord Webhook',
    icon: 'MessageCircle',
    category: 'Integration',
  },
  email_to_sms: {
    label: 'Email to SMS',
    icon: 'Smartphone',
    category: 'Integration',
  },
  create_jira_ticket: {
    label: 'Create Jira Ticket',
    icon: 'Bug',
    category: 'Integration',
  },
  create_asana_task: {
    label: 'Create Asana Task',
    icon: 'CheckSquare',
    category: 'Integration',
  },
  create_trello_card: {
    label: 'Create Trello Card',
    icon: 'Square',
    category: 'Integration',
  },

  // NEW: Advanced Analytics Actions
  track_email_metrics: {
    label: 'Track Email Metrics',
    icon: 'BarChart3',
    category: 'Analytics',
  },
  generate_report: {
    label: 'Generate Report',
    icon: 'FileText',
    category: 'Analytics',
  },
  update_dashboard: {
    label: 'Update Dashboard',
    icon: 'Layout',
    category: 'Analytics',
  },
  log_analytics_event: {
    label: 'Log Analytics Event',
    icon: 'Activity',
    category: 'Analytics',
  },

  // NEW: Advanced Security Actions
  quarantine_email: {
    label: 'Quarantine Email',
    icon: 'Shield',
    category: 'Security',
  },
  scan_attachments: {
    label: 'Scan Attachments',
    icon: 'Search',
    category: 'Security',
  },
  encrypt_attachments: {
    label: 'Encrypt Attachments',
    icon: 'Lock',
    category: 'Security',
  },
  apply_retention_policy: {
    label: 'Apply Retention Policy',
    icon: 'Clock',
    category: 'Security',
  },
  audit_email_access: {
    label: 'Audit Email Access',
    icon: 'Eye',
    category: 'Security',
  },

  // NEW: Advanced Workflow Actions
  start_approval_process: {
    label: 'Start Approval Process',
    icon: 'ClipboardCheck',
    category: 'Workflow',
  },
  create_escalation: {
    label: 'Create Escalation',
    icon: 'ArrowUp',
    category: 'Workflow',
  },
  pause_workflow: {
    label: 'Pause Workflow',
    icon: 'Pause',
    category: 'Workflow',
  },
  resume_workflow: {
    label: 'Resume Workflow',
    icon: 'Play',
    category: 'Workflow',
  },

  // NEW: Advanced AI Actions
  ai_summarize_thread: {
    label: 'AI Summarize Thread',
    icon: 'FileText',
    category: 'AI',
  },
  ai_extract_entities: {
    label: 'AI Extract Entities',
    icon: 'Database',
    category: 'AI',
  },
  ai_detect_intent: {
    label: 'AI Detect Intent',
    icon: 'Target',
    category: 'AI',
  },
  ai_suggest_actions: {
    label: 'AI Suggest Actions',
    icon: 'Lightbulb',
    category: 'AI',
  },
  ai_auto_classify: { label: 'AI Auto Classify', icon: 'Tag', category: 'AI' },
  ai_generate_response: {
    label: 'AI Generate Response',
    icon: 'MessageSquare',
    category: 'AI',
  },
  ai_translate_content: {
    label: 'AI Translate Content',
    icon: 'Globe',
    category: 'AI',
  },
  ai_detect_anomalies: {
    label: 'AI Detect Anomalies',
    icon: 'AlertTriangle',
    category: 'AI',
  },
};

// --- Enhanced Condition Types ---
export const CONDITION_TYPES = {
  // Basic Conditions
  sender: {
    label: 'Sender',
    operators: [
      'equals',
      'contains',
      'starts_with',
      'ends_with',
      'regex',
      'domain',
      'not_equals',
    ],
    description: 'Match emails from specific senders or domains',
  },
  subject: {
    label: 'Subject',
    operators: [
      'equals',
      'contains',
      'starts_with',
      'ends_with',
      'regex',
      'word_count',
      'not_contains',
    ],
    description: 'Match emails based on subject line content',
  },
  body: {
    label: 'Body Content',
    operators: [
      'contains',
      'regex',
      'word_count',
      'sentiment',
      'language',
      'has_links',
      'has_images',
    ],
    description: 'Match emails based on body content analysis',
  },
  date: {
    label: 'Date/Time',
    operators: [
      'before',
      'after',
      'between',
      'today',
      'this_week',
      'this_month',
      'business_hours',
      'weekend',
    ],
    description: 'Match emails based on when they were sent',
  },
  size: {
    label: 'Email Size',
    operators: ['greater_than', 'less_than', 'equals', 'between'],
    description: 'Match emails based on their size in bytes',
  },
  attachments: {
    label: 'Attachments',
    operators: [
      'has_attachments',
      'attachment_count',
      'attachment_type',
      'attachment_size',
      'attachment_name',
    ],
    description: 'Match emails based on attachment properties',
  },

  // NEW: Advanced Email Properties
  priority: {
    label: 'Priority Level',
    operators: ['is_high', 'is_normal', 'is_low', 'is_critical'],
    description: 'Match emails based on priority level',
  },
  read_status: {
    label: 'Read Status',
    operators: ['is_read', 'is_unread', 'was_read_today', 'was_read_this_week'],
    description: 'Match emails based on read status',
  },
  starred_status: {
    label: 'Starred Status',
    operators: ['is_starred', 'is_not_starred'],
    description: 'Match emails based on starred status',
  },
  folder_location: {
    label: 'Folder Location',
    operators: [
      'in_inbox',
      'in_sent',
      'in_drafts',
      'in_archive',
      'in_trash',
      'in_custom_folder',
    ],
    description: 'Match emails based on current folder',
  },
  thread_depth: {
    label: 'Thread Depth',
    operators: ['is_original', 'is_reply', 'is_forward', 'thread_length'],
    description: 'Match emails based on conversation thread',
  },

  // NEW: Recipient Conditions
  to_recipients: {
    label: 'To Recipients',
    operators: [
      'contains',
      'equals',
      'starts_with',
      'ends_with',
      'regex',
      'count',
    ],
    description: 'Match emails based on To field recipients',
  },
  cc_recipients: {
    label: 'CC Recipients',
    operators: [
      'contains',
      'equals',
      'starts_with',
      'ends_with',
      'regex',
      'count',
      'is_empty',
    ],
    description: 'Match emails based on CC field recipients',
  },
  bcc_recipients: {
    label: 'BCC Recipients',
    operators: [
      'contains',
      'equals',
      'starts_with',
      'ends_with',
      'regex',
      'count',
      'is_empty',
    ],
    description: 'Match emails based on BCC field recipients',
  },

  // NEW: Content Analysis
  content_type: {
    label: 'Content Type',
    operators: [
      'is_text',
      'is_html',
      'has_plain_text',
      'has_html',
      'is_newsletter',
      'is_notification',
    ],
    description: 'Match emails based on content format',
  },
  language: {
    label: 'Language',
    operators: [
      'is_english',
      'is_spanish',
      'is_french',
      'is_german',
      'is_chinese',
      'is_japanese',
      'is_other',
    ],
    description: 'Match emails based on detected language',
  },
  sentiment: {
    label: 'Sentiment',
    operators: [
      'is_positive',
      'is_negative',
      'is_neutral',
      'is_urgent',
      'is_calm',
      'is_frustrated',
    ],
    description: 'Match emails based on emotional tone',
  },

  // NEW: Time-based Triggers
  time_of_day: {
    label: 'Time of Day',
    operators: [
      'morning',
      'afternoon',
      'evening',
      'night',
      'business_hours',
      'after_hours',
    ],
    description: 'Match emails based on time of day',
  },
  day_of_week: {
    label: 'Day of Week',
    operators: [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
      'weekday',
      'weekend',
    ],
    description: 'Match emails based on day of week',
  },
  frequency: {
    label: 'Sender Frequency',
    operators: [
      'high_frequency',
      'low_frequency',
      'first_time',
      'repeat_sender',
      'frequency_count',
    ],
    description: 'Match emails based on sender frequency patterns',
  },

  // Advanced Pattern Conditions
  pattern_sentiment: {
    label: 'Sentiment Pattern',
    operators: [
      'positive',
      'negative',
      'neutral',
      'urgent',
      'calm',
      'frustrated',
      'excited',
      'concerned',
    ],
    description: 'Advanced sentiment analysis patterns',
  },
  pattern_topic: {
    label: 'Topic Pattern',
    operators: [
      'business',
      'personal',
      'technical',
      'financial',
      'legal',
      'marketing',
      'support',
      'sales',
    ],
    description: 'Topic classification patterns',
  },
  pattern_structure: {
    label: 'Structure Pattern',
    operators: [
      'formal',
      'informal',
      'bulleted',
      'numbered',
      'table',
      'code_block',
      'quote',
    ],
    description: 'Email structure analysis',
  },
  pattern_behavior: {
    label: 'Behavior Pattern',
    operators: [
      'frequent_sender',
      'first_time',
      'response_time',
      'engagement',
      'bounce_rate',
    ],
    description: 'Sender behavior analysis',
  },
  pattern_frequency: {
    label: 'Frequency Pattern',
    operators: [
      'high_frequency',
      'low_frequency',
      'burst',
      'steady',
      'sporadic',
      'daily',
      'weekly',
    ],
    description: 'Email frequency patterns',
  },

  // NEW: Business Context Conditions
  client_type: {
    label: 'Client Type',
    operators: [
      'is_vip',
      'is_regular',
      'is_prospect',
      'is_past_client',
      'is_internal',
      'is_external',
    ],
    description: 'Match emails based on client classification',
  },
  project_related: {
    label: 'Project Related',
    operators: [
      'is_project_email',
      'has_project_reference',
      'is_task_related',
      'is_meeting_related',
    ],
    description: 'Match emails related to projects',
  },
  invoice_payment: {
    label: 'Invoice/Payment',
    operators: [
      'is_invoice',
      'is_payment_confirmation',
      'is_payment_reminder',
      'is_quote',
      'is_receipt',
    ],
    description: 'Match financial emails',
  },
  meeting_scheduling: {
    label: 'Meeting Scheduling',
    operators: [
      'is_meeting_request',
      'is_meeting_confirmation',
      'is_meeting_cancellation',
      'has_calendar_invite',
    ],
    description: 'Match meeting-related emails',
  },

  // Pareto Analysis Conditions
  pareto_value: {
    label: 'Pareto Value',
    operators: ['high_value', 'low_value', 'unknown_value', 'value_score'],
    description: '80/20 rule value analysis',
  },
  pareto_source: {
    label: 'Pareto Source',
    operators: [
      'key_client',
      'project_related',
      'opportunity',
      'internal',
      'external',
    ],
    description: 'Value source classification',
  },
  pareto_impact: {
    label: 'Pareto Impact',
    operators: ['high_impact', 'medium_impact', 'low_impact', 'no_impact'],
    description: 'Business impact assessment',
  },

  // 4Ds Conditions
  fourds_urgency: {
    label: '4Ds Urgency',
    operators: ['immediate', 'today', 'this_week', 'later', 'no_deadline'],
    description: 'Urgency level for 4Ds methodology',
  },
  fourds_ownership: {
    label: '4Ds Ownership',
    operators: [
      'my_responsibility',
      'someone_else',
      'team_effort',
      'external',
      'delegated',
    ],
    description: 'Responsibility assignment',
  },
  fourds_complexity: {
    label: '4Ds Complexity',
    operators: [
      'simple',
      'moderate',
      'complex',
      'requires_meeting',
      'research_needed',
    ],
    description: 'Task complexity assessment',
  },
  fourds_value: {
    label: '4Ds Value',
    operators: ['high_value', 'medium_value', 'low_value', 'no_value'],
    description: 'Value assessment for 4Ds',
  },

  // Inbox Zero Conditions
  inbox_zero_age: {
    label: 'Inbox Zero Age',
    operators: ['new', 'today', 'this_week', 'old', 'very_old'],
    description: 'Email age for inbox zero processing',
  },
  inbox_zero_priority: {
    label: 'Inbox Zero Priority',
    operators: ['urgent', 'important', 'normal', 'low'],
    description: 'Priority for inbox zero',
  },
  inbox_zero_category: {
    label: 'Inbox Zero Category',
    operators: [
      'action_required',
      'information',
      'delegation',
      'follow_up',
      'archive',
    ],
    description: 'Inbox zero categorization',
  },

  // ML/AI Conditions
  ml_confidence: {
    label: 'ML Confidence',
    operators: ['high_confidence', 'medium_confidence', 'low_confidence'],
    description: 'Machine learning confidence level',
  },
  ml_prediction: {
    label: 'ML Prediction',
    operators: [
      'spam',
      'important',
      'urgent',
      'delegation',
      'archive',
      'follow_up',
    ],
    description: 'ML-based email classification',
  },
  ml_anomaly: {
    label: 'ML Anomaly',
    operators: ['normal', 'suspicious', 'anomaly', 'critical'],
    description: 'Anomaly detection results',
  },

  // Advanced Logic Conditions
  branching_condition: {
    label: 'Branching Condition',
    operators: ['if', 'else_if', 'else', 'switch_case'],
    description: 'Conditional branching logic',
  },
  parallel_condition: {
    label: 'Parallel Condition',
    operators: ['all_true', 'any_true', 'majority_true', 'custom_logic'],
    description: 'Parallel execution conditions',
  },
  cascade_condition: {
    label: 'Cascade Condition',
    operators: ['first_match', 'all_matches', 'weighted_match'],
    description: 'Cascading condition logic',
  },

  // Context Conditions
  context_time: {
    label: 'Context Time',
    operators: ['business_hours', 'after_hours', 'weekend', 'holiday'],
    description: 'Temporal context conditions',
  },
  context_workload: {
    label: 'Context Workload',
    operators: [
      'low_workload',
      'normal_workload',
      'high_workload',
      'overwhelmed',
    ],
    description: 'Current workload context',
  },
  context_availability: {
    label: 'Context Availability',
    operators: ['available', 'busy', 'out_of_office', 'focused_time'],
    description: 'User availability context',
  },
  context_location: {
    label: 'Context Location',
    operators: ['office', 'remote', 'traveling', 'meeting'],
    description: 'Location-based context',
  },

  // NEW: Custom Fields
  custom_tags: {
    label: 'Custom Tags',
    operators: ['has_tag', 'missing_tag', 'tag_count', 'tag_equals'],
    description: 'Match emails based on custom tags',
  },
  custom_fields: {
    label: 'Custom Fields',
    operators: [
      'field_equals',
      'field_contains',
      'field_greater_than',
      'field_less_than',
    ],
    description: 'Match emails based on custom field values',
  },

  // NEW: Integration Conditions
  crm_status: {
    label: 'CRM Status',
    operators: [
      'is_lead',
      'is_customer',
      'is_prospect',
      'is_inactive',
      'has_opportunity',
    ],
    description: 'CRM contact status',
  },
  project_status: {
    label: 'Project Status',
    operators: [
      'project_active',
      'project_completed',
      'project_on_hold',
      'project_overdue',
    ],
    description: 'Project status conditions',
  },
  task_status: {
    label: 'Task Status',
    operators: [
      'task_pending',
      'task_in_progress',
      'task_completed',
      'task_overdue',
    ],
    description: 'Task status conditions',
  },
};

// --- Enhanced Templates ---
const RULE_TEMPLATES: RuleTemplate[] = [
  // Basic Templates
  {
    id: 'urgent-client',
    name: 'Flag Urgent Client Emails',
    description:
      'If an email from a client contains "urgent" in the subject, flag it and notify the project manager.',
    conditions: [
      {
        id: 'c1',
        field: 'sender',
        operator: 'contains',
        value: 'client',
        logic: 'AND',
      },
      {
        id: 'c2',
        field: 'subject',
        operator: 'contains',
        value: 'urgent',
        logic: 'AND',
      },
    ],
    logic: 'AND',
    actions: [
      { id: 'a1', type: 'star', parameters: {} },
      {
        id: 'a2',
        type: 'notify',
        parameters: { message: 'Urgent client email received' },
      },
    ],
    example: 'From: client@company.com, Subject: Urgent: Project Update',
    category: 'BASIC',
  },

  // NEW: Enhanced Basic Templates
  {
    id: 'invoice-processing',
    name: 'Auto-Process Invoices',
    description:
      'Automatically categorize and forward invoice emails to the finance team.',
    conditions: [
      {
        id: 'c1',
        field: 'subject',
        operator: 'contains',
        value: 'invoice',
        logic: 'OR',
      },
      {
        id: 'c2',
        field: 'subject',
        operator: 'contains',
        value: 'payment',
        logic: 'OR',
      },
      {
        id: 'c3',
        field: 'invoice_payment',
        operator: 'is_invoice',
        value: true,
        logic: 'OR',
      },
    ],
    logic: 'OR',
    actions: [
      { id: 'a1', type: 'tag', parameters: { tag: 'Invoice' } },
      { id: 'a2', type: 'move_to_folder', parameters: { folder: 'Finance' } },
      {
        id: 'a3',
        type: 'notify',
        parameters: {
          recipients: ['finance@company.com'],
          message: 'New invoice received',
        },
      },
      { id: 'a4', type: 'extract_invoice_data', parameters: {} },
    ],
    example: 'Subject: Invoice #1234, Payment Reminder, etc.',
    category: 'BASIC',
  },

  {
    id: 'meeting-scheduling',
    name: 'Meeting Scheduling Assistant',
    description:
      'Automatically process meeting requests and create calendar events.',
    conditions: [
      {
        id: 'c1',
        field: 'meeting_scheduling',
        operator: 'is_meeting_request',
        value: true,
        logic: 'OR',
      },
      {
        id: 'c2',
        field: 'subject',
        operator: 'contains',
        value: 'meeting',
        logic: 'OR',
      },
      {
        id: 'c3',
        field: 'subject',
        operator: 'contains',
        value: 'call',
        logic: 'OR',
      },
    ],
    logic: 'OR',
    actions: [
      { id: 'a1', type: 'tag', parameters: { tag: 'Meeting' } },
      { id: 'a2', type: 'create_meeting', parameters: { auto_schedule: true } },
      {
        id: 'a3',
        type: 'ai_analyze',
        parameters: { extract_meeting_details: true },
      },
      { id: 'a4', type: 'set_reminder', parameters: { minutes_before: 15 } },
    ],
    example: 'Subject: Meeting Request, Call Schedule, etc.',
    category: 'BASIC',
  },

  {
    id: 'spam-filter',
    name: 'Advanced Spam Filter',
    description:
      'Identify and quarantine potential spam emails using multiple criteria.',
    conditions: [
      {
        id: 'c1',
        field: 'sender',
        operator: 'not_equals',
        value: '@company.com',
        logic: 'AND',
      },
      {
        id: 'c2',
        field: 'subject',
        operator: 'contains',
        value: 'free',
        logic: 'OR',
      },
      {
        id: 'c3',
        field: 'subject',
        operator: 'contains',
        value: 'offer',
        logic: 'OR',
      },
      {
        id: 'c4',
        field: 'ml_prediction',
        operator: 'spam',
        value: true,
        logic: 'OR',
      },
    ],
    logic: 'OR',
    actions: [
      { id: 'a1', type: 'quarantine_email', parameters: {} },
      { id: 'a2', type: 'tag', parameters: { tag: 'Spam' } },
      {
        id: 'a3',
        type: 'notify',
        parameters: { message: 'Potential spam detected' },
      },
    ],
    example: 'From: unknown@spam.com, Subject: Free Offer!',
    category: 'BASIC',
  },

  // NEW: Branching Logic Templates
  {
    id: 'branching-client-response',
    name: 'Branching Client Response',
    description: 'Different responses based on client type and urgency level.',
    conditions: [
      {
        id: 'c1',
        field: 'sender',
        operator: 'contains',
        value: 'client',
        branchingLogic: 'IF_THEN_ELSE',
      },
    ],
    logic: 'AND',
    actions: [
      {
        id: 'a1',
        type: 'if_then_else',
        parameters: {
          conditions: [
            { field: 'subject', operator: 'contains', value: 'urgent' },
            { field: 'sender', operator: 'contains', value: 'vip' },
          ],
          trueActions: [
            { type: 'escalate', parameters: { level: 'immediate' } },
            { type: 'notify', parameters: { recipients: ['manager', 'ceo'] } },
          ],
          falseActions: [
            {
              type: 'auto_reply',
              parameters: { template: 'standard_response' },
            },
          ],
        },
      },
    ],
    example:
      'VIP client urgent email → immediate escalation, regular client → auto-reply',
    category: 'BRANCHING',
  },

  // NEW: Pattern Recognition Templates
  {
    id: 'pattern-sentiment-analysis',
    name: 'Pattern-Based Sentiment Analysis',
    description:
      'Analyze email patterns and respond based on sentiment and urgency patterns.',
    conditions: [
      {
        id: 'c1',
        field: 'pattern_sentiment',
        operator: 'urgent',
        value: 'urgent',
        patternType: 'SENTIMENT',
        confidence: 0.8,
      },
    ],
    logic: 'AND',
    actions: [
      {
        id: 'a1',
        type: 'pattern_detect',
        parameters: { patterns: ['urgency', 'frustration', 'deadline'] },
      },
      {
        id: 'a2',
        type: 'sentiment_analyze',
        parameters: { model: 'advanced_sentiment' },
      },
      {
        id: 'a3',
        type: 'adaptive_response',
        parameters: { response_style: 'empathetic_urgent' },
      },
    ],
    example: 'Detects urgent/frustrated tone → empathetic urgent response',
    category: 'PATTERN',
  },

  // NEW: 80/20 Rule Templates
  {
    id: 'pareto-email-prioritization',
    name: '80/20 Email Prioritization',
    description:
      'Automatically categorize emails using Pareto principle - focus on high-value 20%.',
    conditions: [
      {
        id: 'c1',
        field: 'pareto_value',
        operator: 'high_value',
        value: 'high_value',
        weight: 0.8,
      },
    ],
    logic: 'AND',
    actions: [
      {
        id: 'a1',
        type: 'pareto_analyze',
        parameters: {
          criteria: ['client_value', 'project_impact', 'revenue_potential'],
        },
      },
      {
        id: 'a2',
        type: 'value_categorize',
        parameters: { categories: ['high_value', 'medium_value', 'low_value'] },
      },
      {
        id: 'a3',
        type: 'focus_high_value',
        parameters: { processing_priority: 'immediate' },
      },
      {
        id: 'a4',
        type: 'batch_process',
        parameters: { category: 'low_value', schedule: 'end_of_day' },
      },
    ],
    example:
      'High-value client emails → immediate attention, others → batch processing',
    category: 'PARETO',
  },

  // NEW: Enhanced Advanced Templates
  {
    id: 'ai-powered-classification',
    name: 'AI-Powered Email Classification',
    description:
      'Use machine learning to automatically classify and route emails based on content and context.',
    conditions: [
      {
        id: 'c1',
        field: 'ml_confidence',
        operator: 'high_confidence',
        value: 'high_confidence',
        confidence: 0.9,
      },
    ],
    logic: 'AND',
    actions: [
      {
        id: 'a1',
        type: 'ai_auto_classify',
        parameters: { model: 'email_classifier_v2' },
      },
      {
        id: 'a2',
        type: 'ai_extract_entities',
        parameters: { entities: ['person', 'company', 'date', 'amount'] },
      },
      {
        id: 'a3',
        type: 'ai_detect_intent',
        parameters: {
          intents: ['request', 'question', 'complaint', 'appointment'],
        },
      },
      {
        id: 'a4',
        type: 'dynamic_routing',
        parameters: {
          routing_rules: {
            support_request: 'support_team',
            sales_inquiry: 'sales_team',
            project_update: 'project_manager',
            general: 'admin_team',
          },
        },
      },
    ],
    example: 'AI analyzes email content and routes to appropriate team',
    category: 'Advanced',
  },

  {
    id: 'inbox-zero-automation',
    name: 'Inbox Zero Automation',
    description:
      'Automatically process emails to achieve and maintain inbox zero using smart categorization.',
    conditions: [
      {
        id: 'c1',
        field: 'inbox_zero_age',
        operator: 'new',
        value: 'new',
      },
    ],
    logic: 'AND',
    actions: [
      {
        id: 'a1',
        type: 'inbox_zero_process',
        parameters: { strategy: 'immediate' },
      },
      {
        id: 'a2',
        type: 'ai_analyze',
        parameters: { priority: true, action_required: true },
      },
      { id: 'a3', type: 'auto_4ds', parameters: { auto_categorize: true } },
      {
        id: 'a4',
        type: 'smart_sort',
        parameters: { folders: ['Action', 'Waiting', 'Reference', 'Archive'] },
      },
      {
        id: 'a5',
        type: 'batch_process_emails',
        parameters: { schedule: 'end_of_day' },
      },
    ],
    example: 'New emails automatically sorted into action categories',
    category: 'INBOX_ZERO',
  },

  {
    id: 'sentiment-based-routing',
    name: 'Sentiment-Based Email Routing',
    description:
      'Route emails based on sentiment analysis to ensure appropriate handling.',
    conditions: [
      {
        id: 'c1',
        field: 'sentiment',
        operator: 'is_negative',
        value: 'is_negative',
      },
    ],
    logic: 'OR',
    actions: [
      {
        id: 'a1',
        type: 'sentiment_analyze',
        parameters: { model: 'advanced_sentiment' },
      },
      { id: 'a2', type: 'escalate', parameters: { level: 'manager' } },
      { id: 'a3', type: 'tag', parameters: { tag: 'High Priority' } },
      {
        id: 'a4',
        type: 'notify',
        parameters: { recipients: ['manager@company.com'], urgency: 'high' },
      },
      {
        id: 'a5',
        type: 'ai_suggest_reply',
        parameters: { tone: 'empathetic' },
      },
    ],
    example: 'Negative sentiment emails → escalated to manager',
    category: 'PATTERN',
  },

  {
    id: 'project-automation',
    name: 'Project Email Automation',
    description:
      'Automatically link emails to projects and create tasks based on project references.',
    conditions: [
      {
        id: 'c1',
        field: 'project_related',
        operator: 'is_project_email',
        value: true,
      },
    ],
    logic: 'AND',
    actions: [
      {
        id: 'a1',
        type: 'ai_extract_entities',
        parameters: { entities: ['project_name', 'task', 'deadline'] },
      },
      { id: 'a2', type: 'link_project', parameters: { auto_link: true } },
      { id: 'a3', type: 'create_task', parameters: { auto_create: true } },
      {
        id: 'a4',
        type: 'assign_project_task',
        parameters: { auto_assign: true },
      },
      {
        id: 'a5',
        type: 'update_project_status',
        parameters: { auto_update: true },
      },
      {
        id: 'a6',
        type: 'notify',
        parameters: {
          recipients: ['project_manager'],
          message: 'Project email processed',
        },
      },
    ],
    example: 'Project-related emails → linked to project and tasks created',
    category: 'Advanced',
  },

  {
    id: 'crm-integration',
    name: 'CRM Integration Automation',
    description:
      'Automatically update CRM records and create opportunities from email interactions.',
    conditions: [
      {
        id: 'c1',
        field: 'crm_status',
        operator: 'is_customer',
        value: true,
      },
    ],
    logic: 'OR',
    actions: [
      { id: 'a1', type: 'sync_crm', parameters: { auto_sync: true } },
      {
        id: 'a2',
        type: 'log_activity',
        parameters: { activity_type: 'email_interaction' },
      },
      {
        id: 'a3',
        type: 'update_contact',
        parameters: { update_fields: ['last_contact', 'email_history'] },
      },
      {
        id: 'a4',
        type: 'create_opportunity',
        parameters: { auto_create: true },
      },
      {
        id: 'a5',
        type: 'set_followup_date',
        parameters: { auto_schedule: true },
      },
    ],
    example: 'Customer emails → CRM updated, activities logged',
    category: 'Advanced',
  },

  // NEW: 4Ds Methodology Templates
  {
    id: 'four-ds-automation',
    name: '4Ds Email Automation',
    description:
      'Automatically apply 4Ds methodology: Do, Delete, Delegate, Defer.',
    conditions: [
      {
        id: 'c1',
        field: 'fourds_urgency',
        operator: 'immediate',
        value: 'immediate',
        weight: 0.9,
      },
    ],
    logic: 'AND',
    actions: [
      { id: 'a1', type: 'auto_4ds', parameters: { auto_categorize: true } },
      {
        id: 'a2',
        type: 'do_immediate',
        parameters: {
          conditions: ['simple_task', 'under_2_minutes', 'my_expertise'],
        },
      },
      {
        id: 'a3',
        type: 'delete_unnecessary',
        parameters: {
          conditions: ['spam', 'newsletter', 'no_action_required'],
        },
      },
      {
        id: 'a4',
        type: 'delegate_appropriate',
        parameters: {
          rules: {
            technical: 'tech_team',
            billing: 'finance_team',
            hr: 'hr_team',
          },
        },
      },
      {
        id: 'a5',
        type: 'defer_later',
        parameters: {
          conditions: ['complex_task', 'requires_research', 'scheduled_time'],
        },
      },
    ],
    example:
      'Simple task → do immediately, technical question → delegate to tech team',
    category: 'FOUR_DS',
  },

  // NEW: Inbox Zero Templates
  {
    id: 'inbox-zero-automation',
    name: 'Inbox Zero Automation',
    description:
      'Automated Inbox Zero processing to keep inbox clean and organized.',
    conditions: [
      {
        id: 'c1',
        field: 'inbox_zero_age',
        operator: 'new',
        value: 'new',
        timeWindow: 60,
      },
    ],
    logic: 'AND',
    actions: [
      {
        id: 'a1',
        type: 'inbox_zero_process',
        parameters: { strategy: 'IMMEDIATE' },
      },
      {
        id: 'a2',
        type: 'smart_sort',
        parameters: {
          categories: [
            'urgent',
            'important',
            'delegation',
            'follow_up',
            'archive',
          ],
        },
      },
      {
        id: 'a3',
        type: 'batch_process_emails',
        parameters: {
          batch_size: 10,
          processing_time: 30,
        },
      },
      {
        id: 'a4',
        type: 'auto_archive_old',
        parameters: {
          age_threshold: 7,
          keep_unread: true,
        },
      },
      {
        id: 'a5',
        type: 'schedule_processing',
        parameters: {
          schedule: 'every_2_hours',
          max_processing_time: 15,
        },
      },
    ],
    example: 'New emails → immediate processing, old emails → auto-archive',
    category: 'INBOX_ZERO',
  },

  // Advanced Combined Templates
  {
    id: 'advanced-intelligent-routing',
    name: 'Advanced Intelligent Email Routing',
    description:
      'Combines pattern recognition, Pareto analysis, and 4Ds for intelligent email routing.',
    conditions: [
      {
        id: 'c1',
        field: 'ml_confidence',
        operator: 'high_confidence',
        value: 'high_confidence',
        confidence: 0.9,
      },
    ],
    logic: 'AND',
    actions: [
      {
        id: 'a1',
        type: 'ml_classify',
        parameters: { model: 'email_classifier_v2' },
      },
      {
        id: 'a2',
        type: 'pattern_detect',
        parameters: { patterns: ['urgency', 'value', 'complexity'] },
      },
      {
        id: 'a3',
        type: 'pareto_analyze',
        parameters: { criteria: ['business_value', 'time_sensitivity'] },
      },
      { id: 'a4', type: 'auto_4ds', parameters: { auto_categorize: true } },
      {
        id: 'a5',
        type: 'dynamic_routing',
        parameters: {
          routing_rules: {
            high_value_urgent: 'immediate_attention',
            high_value_normal: 'today_processing',
            low_value_urgent: 'delegate',
            low_value_normal: 'batch_process',
          },
        },
      },
      {
        id: 'a6',
        type: 'learning_rule',
        parameters: {
          learn_from_decisions: true,
          improve_over_time: true,
        },
      },
    ],
    example:
      'AI analyzes email → applies Pareto + 4Ds → routes intelligently → learns from decisions',
    category: 'Advanced',
  },
];

// --- Main Component ---
const AdvancedRulesBuilder: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<RuleExecutionLog[]>([]);
  const [bulkApplyOpen, setBulkApplyOpen] = useState(false);
  const [showTestMode, setShowTestMode] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<
    Record<string, any>
  >({});

  // NEW: Enhanced UI State
  const [showRulePreview, setShowRulePreview] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<any>(null);
  const [ruleWizardMode, setRuleWizardMode] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [showNaturalLanguage, setShowNaturalLanguage] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Rule form state
  const [ruleForm, setRuleForm] = useState<Partial<AutomationRule>>({
    name: '',
    description: '',
    conditions: [],
    logic: 'AND',
    actions: [],
    isActive: true,
    priority: 1,
  });

  useEffect(() => {
    if (isOpen) {
      loadRules();
      loadLogs();
    }
  }, [isOpen]);

  const loadRules = () => {
    const saved = localStorage.getItem('advancedEmailRules');
    if (saved) setRules(JSON.parse(saved));
  };
  const loadLogs = () => {
    const saved = localStorage.getItem('emailRuleLogs');
    if (saved) setLogs(JSON.parse(saved));
  };
  const saveRule = () => {
    if (
      !ruleForm.name ||
      !ruleForm.conditions?.length ||
      !ruleForm.actions?.length
    )
      return;
    const newRule: AutomationRule = {
      ...ruleForm,
      id: selectedRule?.id || `rule_${Date.now()}`,
      createdAt: selectedRule?.createdAt || new Date(),
      updatedAt: new Date(),
      executionCount: selectedRule?.executionCount || 0,
    } as AutomationRule;
    const updated = selectedRule
      ? rules.map(r => (r.id === selectedRule.id ? newRule : r))
      : [...rules, newRule];
    setRules(updated);
    localStorage.setItem('advancedEmailRules', JSON.stringify(updated));
    setIsEditing(false);
    setSelectedRule(null);
    setRuleForm({
      name: '',
      description: '',
      conditions: [],
      logic: 'AND',
      actions: [],
      isActive: true,
      priority: 1,
    });
  };
  const deleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    localStorage.setItem('advancedEmailRules', JSON.stringify(updated));
    if (selectedRule?.id === id) {
      setSelectedRule(null);
      setIsEditing(false);
    }
  };
  const editRule = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setRuleForm(rule);
    setIsEditing(true);
  };
  const createFromTemplate = (template: RuleTemplate) => {
    setRuleForm({
      name: template.name,
      description: template.description,
      conditions: template.conditions.map(c => ({
        ...c,
        id: `c${Date.now()}${Math.random()}`,
      })),
      logic: template.logic,
      actions: template.actions.map(a => ({
        ...a,
        id: `a${Date.now()}${Math.random()}`,
      })),
      isActive: true,
      priority: 1,
    });
    setIsEditing(true);
    setShowTemplates(false);
  };
  // --- UI helpers for conditions/actions ---
  const addCondition = (parentId?: string) => {
    const newCond: RuleCondition = {
      id: `cond_${Date.now()}`,
      field: 'subject',
      operator: 'contains',
      value: '',
      logic: 'AND',
      children: [],
    };
    setRuleForm(prev => {
      if (!parentId) {
        return { ...prev, conditions: [...(prev.conditions || []), newCond] };
      } else {
        // Add as child to parent
        const addToParent = (conds: RuleCondition[]): RuleCondition[] =>
          conds.map(c =>
            c.id === parentId
              ? { ...c, children: [...(c.children || []), newCond] }
              : { ...c, children: c.children ? addToParent(c.children) : [] }
          );
        return { ...prev, conditions: addToParent(prev.conditions || []) };
      }
    });
  };
  const removeCondition = (id: string, conds?: RuleCondition[]) => {
    const remove = (arr: RuleCondition[]): RuleCondition[] =>
      arr
        .filter(c => c.id !== id)
        .map(c => ({ ...c, children: c.children ? remove(c.children) : [] }));
    setRuleForm(prev => ({
      ...prev,
      conditions: remove(conds || prev.conditions || []),
    }));
  };
  const updateCondition = (
    id: string,
    updates: Partial<RuleCondition>,
    conds?: RuleCondition[]
  ) => {
    const update = (arr: RuleCondition[]): RuleCondition[] =>
      arr.map(c =>
        c.id === id
          ? { ...c, ...updates }
          : { ...c, children: c.children ? update(c.children) : [] }
      );
    setRuleForm(prev => ({
      ...prev,
      conditions: update(conds || prev.conditions || []),
    }));
  };
  const addAction = () => {
    const newAction: RuleAction = {
      id: `action_${Date.now()}`,
      type: 'mark_read',
      parameters: {},
    };
    setRuleForm(prev => ({
      ...prev,
      actions: [...(prev.actions || []), newAction],
    }));
  };
  const removeAction = (id: string) => {
    setRuleForm(prev => ({
      ...prev,
      actions: (prev.actions || []).filter(a => a.id !== id),
    }));
  };
  const updateAction = (id: string, updates: Partial<RuleAction>) => {
    setRuleForm(prev => ({
      ...prev,
      actions: (prev.actions || []).map(a =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  };

  // --- Bulk Apply ---
  const bulkApplyRule = (rule: AutomationRule) => {
    // Simulate applying rule to all emails
    setBulkApplyOpen(false);
    alert(`Rule "${rule.name}" applied to all matching emails!`);
  };

  // NEW: Enhanced Functions
  const testRule = (rule: AutomationRule, testEmail: any) => {
    // Simulate testing a rule against a sample email
    const results = {
      ruleName: rule.name,
      testEmail: testEmail,
      conditionsMatched: rule.conditions.map(c => ({
        condition: c,
        matched: Math.random() > 0.3,
      })),
      actionsExecuted: rule.actions.map(a => ({
        action: a,
        executed: true,
        result: 'Success',
      })),
      overallResult: 'PASSED',
    };
    setTestResults([results, ...testResults]);
    return results;
  };

  const previewRuleEffect = (rule: AutomationRule) => {
    // Generate a preview of what the rule would do
    const preview = {
      ruleName: rule.name,
      estimatedMatches: Math.floor(Math.random() * 100) + 10,
      actionsPreview: rule.actions.map(a => ({
        action:
          ACTION_TYPES[a.type as keyof typeof ACTION_TYPES]?.label || a.type,
        description: `Will ${a.type.replace(/_/g, ' ')}`,
        impact: 'Medium',
      })),
      performance: {
        executionTime: '< 1 second',
        resourceUsage: 'Low',
        reliability: 'High',
      },
    };
    setShowRulePreview(true);
    return preview;
  };

  const generateAiSuggestions = (input: string) => {
    // Simulate AI suggestions based on natural language input
    const suggestions = [
      'If emails from clients contain "urgent", mark as high priority and notify manager',
      'Automatically categorize invoice emails and forward to finance team',
      'Route negative sentiment emails to customer service team',
      'Create calendar events from meeting request emails',
      'Archive emails older than 30 days automatically',
    ];
    setAiSuggestions(suggestions);
  };

  const parseNaturalLanguage = (input: string) => {
    // Simulate parsing natural language into rule structure
    const rule: Partial<AutomationRule> = {
      name: 'Auto-generated Rule',
      description: input,
      conditions: [
        {
          id: 'c1',
          field: 'sender',
          operator: 'contains',
          value: 'client',
          logic: 'AND' as LogicalOperator,
        },
      ],
      actions: [
        { id: 'a1', type: 'tag', parameters: { tag: 'Auto-generated' } },
      ],
    };
    setRuleForm(rule);
    setShowNaturalLanguage(false);
    return rule;
  };

  // --- UI ---
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex overflow-hidden'>
        {/* Sidebar */}
        <div className='w-80 border-r border-gray-200 flex flex-col bg-gray-50'>
          <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Zap className='w-5 h-5 text-constructbms-blue' />
              <span className='font-semibold'>Automation</span>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg'
            >
              <X />
            </button>
          </div>
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {/* NEW: Natural Language Input */}
            <div className='mb-4'>
              <button
                onClick={() => setShowNaturalLanguage(!showNaturalLanguage)}
                className='w-full flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-constructbms-blue to-constructbms-black text-white rounded-lg hover:from-constructbms-black hover:to-constructbms-blue transition-all'
              >
                <Brain className='w-4 h-4' />
                <span>AI Rule Builder</span>
              </button>

              {showNaturalLanguage && (
                <div className='mt-3 p-3 bg-white rounded-lg border'>
                  <textarea
                    value={naturalLanguageInput}
                    onChange={e => {
                      setNaturalLanguageInput(e.target.value);
                      if (e.target.value.length > 10) {
                        generateAiSuggestions(e.target.value);
                      }
                    }}
                    placeholder="Describe your rule in plain English... e.g., 'If emails from clients contain urgent, mark as high priority'"
                    className='w-full p-2 border border-gray-300 rounded text-sm'
                    rows={3}
                  />
                  <div className='mt-2 flex space-x-2'>
                    <button
                      onClick={() => parseNaturalLanguage(naturalLanguageInput)}
                      className='px-3 py-1 bg-constructbms-blue text-black text-sm rounded hover:bg-constructbms-black hover:text-white'
                    >
                      Generate Rule
                    </button>
                    <button
                      onClick={() => setShowNaturalLanguage(false)}
                      className='px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300'
                    >
                      Cancel
                    </button>
                  </div>

                  {aiSuggestions.length > 0 && (
                    <div className='mt-3'>
                      <p className='text-xs text-gray-600 mb-2'>
                        AI Suggestions:
                      </p>
                      <div className='space-y-1'>
                        {aiSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => parseNaturalLanguage(suggestion)}
                            className='block w-full text-left p-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100'
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => setShowTemplates(true)}
              className='w-full flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'
            >
              <BookOpen className='w-4 h-4' />
              <span>Rule Templates</span>
            </button>
            <button
              onClick={() => setShowLogs(true)}
              className='w-full flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'
            >
              <List className='w-4 h-4' />
              <span>Execution Log</span>
            </button>
            <button
              onClick={() => setBulkApplyOpen(true)}
              className='w-full flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors'
            >
              <Layers className='w-4 h-4' />
              <span>Bulk Apply</span>
            </button>
            <button
              onClick={() => setShowTestMode(true)}
              className='w-full flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors'
            >
              <Play className='w-4 h-4' />
              <span>Test Rules</span>
            </button>
            <button
              onClick={() => setShowAnalytics(true)}
              className='w-full flex items-center space-x-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors'
            >
              <Target className='w-4 h-4' />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setShowIntegrations(true)}
              className='w-full flex items-center space-x-2 px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors'
            >
              <Building className='w-4 h-4' />
              <span>Integrations</span>
            </button>

            {/* NEW: Enhanced Actions */}
            <button
              onClick={() => previewRuleEffect(ruleForm as AutomationRule)}
              className='w-full flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors'
            >
              <Eye className='w-4 h-4' />
              <span>Preview Rule</span>
            </button>
            <button
              onClick={() => setRuleWizardMode(!ruleWizardMode)}
              className='w-full flex items-center space-x-2 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors'
            >
              <Settings className='w-4 h-4' />
              <span>Wizard Mode</span>
            </button>
            <div className='mt-8'>
              <h3 className='text-xs font-semibold text-gray-500 uppercase mb-2'>
                Your Rules
              </h3>
              <div className='space-y-2'>
                {rules.map(rule => (
                  <div
                    key={rule.id}
                    className={`p-3 border rounded-lg cursor-pointer ${selectedRule?.id === rule.id ? 'border-constructbms-blue bg-constructbms-blue/10' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => editRule(rule)}
                  >
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm'>{rule.name}</span>
                      <div className='flex items-center space-x-1'>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteRule(rule.id);
                          }}
                          className='p-1 text-red-500 hover:text-red-700 rounded'
                        >
                          <Trash2 className='w-3 h-3' />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            editRule(rule);
                          }}
                          className='p-1 text-blue-500 hover:text-blue-700 rounded'
                        >
                          <Edit3 className='w-3 h-3' />
                        </button>
                      </div>
                    </div>
                    <p className='text-xs text-gray-600'>{rule.description}</p>
                    <div className='flex items-center space-x-2 mt-2'>
                      <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded'>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className='text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded'>
                        {rule.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setSelectedRule(null);
                  setRuleForm({
                    name: '',
                    description: '',
                    conditions: [],
                    logic: 'AND',
                    actions: [],
                    isActive: true,
                    priority: 1,
                  });
                }}
                className='w-full mt-4 flex items-center space-x-2 px-3 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-black hover:text-white font-medium'
              >
                <Plus className='w-4 h-4' />
                <span>New Rule</span>
              </button>
            </div>
          </div>
        </div>
        {/* Main Area */}
        <div className='flex-1 flex flex-col'>
          {isEditing ? (
            <div className='flex-1 overflow-y-auto p-8'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold'>
                  {selectedRule ? 'Edit Rule' : 'Create New Rule'}
                </h2>
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedRule(null);
                      setRuleForm({
                        name: '',
                        description: '',
                        conditions: [],
                        logic: 'AND',
                        actions: [],
                        isActive: true,
                        priority: 1,
                      });
                    }}
                    className='px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveRule}
                    className='px-6 py-2 text-sm bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-black hover:text-white'
                  >
                    Save Rule
                  </button>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Rule Name
                  </label>
                  <input
                    type='text'
                    value={ruleForm.name}
                    onChange={e =>
                      setRuleForm(prev => ({ ...prev, name: e.target.value }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                    placeholder='Enter rule name'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Priority
                  </label>
                  <select
                    value={ruleForm.priority}
                    onChange={e =>
                      setRuleForm(prev => ({
                        ...prev,
                        priority: parseInt(e.target.value),
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                  >
                    <option value={1}>Low (1)</option>
                    <option value={5}>Medium (5)</option>
                    <option value={10}>High (10)</option>
                  </select>
                </div>
              </div>
              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Description
                </label>
                <textarea
                  value={ruleForm.description}
                  onChange={e =>
                    setRuleForm(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                  rows={2}
                  placeholder='Describe what this rule does'
                />
              </div>
              {/* Conditions Builder */}
              <div className='mb-8'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-lg font-medium'>Conditions</h3>
                  <button
                    onClick={() => addCondition()}
                    className='flex items-center space-x-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200'
                  >
                    <Plus className='w-3 h-3' />
                    <span>Add Condition</span>
                  </button>
                </div>
                <div className='mb-2'>
                  <label className='block text-xs font-medium text-gray-500 mb-1'>
                    Logic
                  </label>
                  <select
                    value={ruleForm.logic}
                    onChange={e =>
                      setRuleForm(prev => ({
                        ...prev,
                        logic: e.target.value as LogicalOperator,
                      }))
                    }
                    className='px-2 py-1 text-xs border border-gray-300 rounded'
                  >
                    <option value='AND'>AND (all must match)</option>
                    <option value='OR'>OR (any can match)</option>
                  </select>
                </div>
                <div className='space-y-2'>
                  {(ruleForm.conditions || []).map(cond => (
                    <ConditionNode
                      key={cond.id}
                      cond={cond}
                      onUpdate={updateCondition}
                      onRemove={removeCondition}
                      onAddChild={addCondition}
                    />
                  ))}
                </div>
              </div>
              {/* Actions Builder */}
              <div className='mb-8'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-lg font-medium'>Actions</h3>
                  <button
                    onClick={addAction}
                    className='flex items-center space-x-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200'
                  >
                    <Plus className='w-3 h-3' />
                    <span>Add Action</span>
                  </button>
                </div>
                <div className='space-y-2'>
                  {(ruleForm.actions || []).map(action => (
                    <div
                      key={action.id}
                      className='p-4 border border-gray-200 rounded-lg flex items-center justify-between'
                    >
                      <div className='flex-1'>
                        <select
                          value={action.type}
                          onChange={e =>
                            updateAction(action.id, { type: e.target.value })
                          }
                          className='px-2 py-1 text-xs border border-gray-300 rounded mr-2'
                        >
                          <optgroup label='Email Actions'>
                            <option value='mark_read'>Mark as Read</option>
                            <option value='mark_unread'>Mark as Unread</option>
                            <option value='star'>Star Email</option>
                            <option value='unstar'>Unstar Email</option>
                            <option value='archive'>Archive Email</option>
                            <option value='delete'>Delete Email</option>
                            <option value='forward'>Forward Email</option>
                            <option value='reply'>Auto Reply</option>
                            <option value='auto_reply'>AI Auto Reply</option>
                            <option value='categorize'>Categorize</option>
                            <option value='tag'>Add Tag</option>
                          </optgroup>
                          <optgroup label='CRM & Business'>
                            <option value='assign'>Assign to User</option>
                            <option value='notify'>Send Notification</option>
                            <option value='create_task'>Create Task</option>
                            <option value='schedule_followup'>
                              Schedule Follow-up
                            </option>
                            <option value='link_project'>
                              Link to Project
                            </option>
                            <option value='link_customer'>
                              Link to Customer
                            </option>
                          </optgroup>
                          <optgroup label='AI & Intelligence'>
                            <option value='ai_analyze'>
                              AI Analyze Content
                            </option>
                            <option value='ai_summarize'>AI Summarize</option>
                            <option value='ai_extract_data'>
                              AI Extract Data
                            </option>
                            <option value='ai_sentiment'>
                              AI Sentiment Analysis
                            </option>
                            <option value='ai_priority'>AI Set Priority</option>
                            <option value='ai_suggest_reply'>
                              AI Suggest Reply
                            </option>
                          </optgroup>
                          <optgroup label='Workflow & Automation'>
                            <option value='trigger_workflow'>
                              Trigger Workflow
                            </option>
                            <option value='create_approval'>
                              Create Approval Request
                            </option>
                            <option value='escalate'>
                              Escalate to Manager
                            </option>
                            <option value='auto_assign'>
                              Auto Assign Based on Skills
                            </option>
                            <option value='create_meeting'>
                              Schedule Meeting
                            </option>
                          </optgroup>
                          <optgroup label='Financial & Billing'>
                            <option value='create_invoice'>
                              Create Invoice
                            </option>
                            <option value='update_opportunity'>
                              Update Sales Opportunity
                            </option>
                            <option value='log_expense'>Log Expense</option>
                            <option value='create_quote'>Create Quote</option>
                          </optgroup>
                          <optgroup label='Integrations'>
                            <option value='sync_crm'>Sync with CRM</option>
                            <option value='sync_calendar'>
                              Sync with Calendar
                            </option>
                            <option value='webhook'>Send Webhook</option>
                            <option value='api_call'>API Call</option>
                            <option value='slack_notify'>
                              Slack Notification
                            </option>
                            <option value='teams_notify'>
                              Teams Notification
                            </option>
                          </optgroup>
                          <optgroup label='Advanced Logic'>
                            <option value='conditional_action'>
                              Conditional Action
                            </option>
                            <option value='delay_action'>Delay Action</option>
                            <option value='batch_process'>Batch Process</option>
                            <option value='data_transform'>
                              Transform Data
                            </option>
                          </optgroup>
                          <optgroup label='Branching Logic'>
                            <option value='if_then_else'>
                              If-Then-Else Branch
                            </option>
                            <option value='switch_case'>Switch Case</option>
                            <option value='parallel_execute'>
                              Parallel Execution
                            </option>
                            <option value='cascade_actions'>
                              Cascade Actions
                            </option>
                          </optgroup>
                          <optgroup label='Pattern Recognition'>
                            <option value='pattern_detect'>
                              Detect Pattern
                            </option>
                            <option value='sentiment_analyze'>
                              Sentiment Analysis
                            </option>
                            <option value='topic_extract'>
                              Extract Topics
                            </option>
                            <option value='behavior_analyze'>
                              Analyze Behavior
                            </option>
                            <option value='frequency_analyze'>
                              Frequency Analysis
                            </option>
                          </optgroup>
                          <optgroup label='80/20 Rule (Pareto)'>
                            <option value='pareto_analyze'>
                              Pareto Analysis
                            </option>
                            <option value='value_categorize'>
                              Categorize by Value
                            </option>
                            <option value='priority_optimize'>
                              Optimize Priority
                            </option>
                            <option value='focus_high_value'>
                              Focus High Value
                            </option>
                          </optgroup>
                          <optgroup label='4Ds Methodology'>
                            <option value='do_immediate'>Do (Immediate)</option>
                            <option value='delete_unnecessary'>
                              Delete (Unnecessary)
                            </option>
                            <option value='delegate_appropriate'>
                              Delegate (Appropriate)
                            </option>
                            <option value='defer_later'>Defer (Later)</option>
                            <option value='auto_4ds'>
                              Auto 4Ds Categorization
                            </option>
                          </optgroup>
                          <optgroup label='Inbox Zero'>
                            <option value='inbox_zero_process'>
                              Inbox Zero Process
                            </option>
                            <option value='batch_process_emails'>
                              Batch Process Emails
                            </option>
                            <option value='schedule_processing'>
                              Schedule Processing
                            </option>
                            <option value='auto_archive_old'>
                              Auto Archive Old
                            </option>
                            <option value='smart_sort'>Smart Sort</option>
                          </optgroup>
                          <optgroup label='ML/AI Advanced'>
                            <option value='ml_classify'>
                              ML Classification
                            </option>
                            <option value='anomaly_detect'>
                              Anomaly Detection
                            </option>
                            <option value='trend_analyze'>
                              Trend Analysis
                            </option>
                            <option value='predictive_action'>
                              Predictive Action
                            </option>
                          </optgroup>
                          <optgroup label='Advanced Branching'>
                            <option value='dynamic_routing'>
                              Dynamic Routing
                            </option>
                            <option value='adaptive_response'>
                              Adaptive Response
                            </option>
                            <option value='learning_rule'>Learning Rule</option>
                            <option value='context_aware'>Context Aware</option>
                          </optgroup>
                          <optgroup label='Security & Compliance'>
                            <option value='encrypt'>Encrypt Email</option>
                            <option value='audit_log'>Audit Log Entry</option>
                            <option value='compliance_check'>
                              Compliance Check
                            </option>
                            <option value='data_retention'>
                              Apply Retention Policy
                            </option>
                          </optgroup>
                        </select>
                        <ActionParameterBuilder
                          actionType={action.type}
                          parameters={action.parameters}
                          onUpdate={params =>
                            updateAction(action.id, { parameters: params })
                          }
                        />
                      </div>
                      <button
                        onClick={() => removeAction(action.id)}
                        className='p-1 text-red-500 hover:text-red-700 rounded'
                      >
                        <Trash2 className='w-3 h-3' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scheduling & Advanced Settings */}
              <div className='mb-8'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-medium'>
                    Scheduling & Advanced Settings
                  </h3>
                  <button
                    onClick={() =>
                      setRuleForm(prev => ({
                        ...prev,
                        schedule: {
                          ...prev.schedule,
                          enabled: !(prev.schedule?.enabled ?? false),
                        },
                      }))
                    }
                    className='flex items-center space-x-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200'
                  >
                    <Clock className='w-3 h-3' />
                    <span>
                      {(ruleForm.schedule?.enabled ?? false)
                        ? 'Disable'
                        : 'Enable'}{' '}
                      Scheduling
                    </span>
                  </button>
                </div>

                {ruleForm.schedule?.enabled && (
                  <div className='p-4 border border-gray-200 rounded-lg mb-4'>
                    <h4 className='font-medium mb-3'>Schedule Configuration</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Cron Expression
                        </label>
                        <input
                          type='text'
                          value={ruleForm.schedule?.cronExpression || ''}
                          onChange={e =>
                            setRuleForm(prev => ({
                              ...prev,
                              schedule: {
                                ...prev.schedule,
                                cronExpression: e.target.value,
                              },
                            }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
                          placeholder='0 9 * * 1-5 (Weekdays at 9 AM)'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Timezone
                        </label>
                        <select
                          value={ruleForm.schedule?.timezone || 'UTC'}
                          onChange={e =>
                            setRuleForm(prev => ({
                              ...prev,
                              schedule: {
                                ...prev.schedule,
                                timezone: e.target.value,
                              },
                            }))
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
                        >
                          <option value='UTC'>UTC</option>
                          <option value='America/New_York'>Eastern Time</option>
                          <option value='America/Chicago'>Central Time</option>
                          <option value='America/Denver'>Mountain Time</option>
                          <option value='America/Los_Angeles'>
                            Pacific Time
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className='p-4 border border-gray-200 rounded-lg'>
                  <h4 className='font-medium mb-3'>Advanced Settings</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Max Executions/Hour
                      </label>
                      <input
                        type='number'
                        value={ruleForm.advanced?.maxExecutionsPerHour || ''}
                        onChange={e =>
                          setRuleForm(prev => ({
                            ...prev,
                            advanced: {
                              ...prev.advanced,
                              maxExecutionsPerHour:
                                parseInt(e.target.value) || undefined,
                            },
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
                        placeholder='Unlimited'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Timeout (seconds)
                      </label>
                      <input
                        type='number'
                        value={ruleForm.advanced?.timeoutSeconds || ''}
                        onChange={e =>
                          setRuleForm(prev => ({
                            ...prev,
                            advanced: {
                              ...prev.advanced,
                              timeoutSeconds:
                                parseInt(e.target.value) || undefined,
                            },
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
                        placeholder='30'
                      />
                    </div>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={ruleForm.advanced?.retryOnFailure || false}
                        onChange={e =>
                          setRuleForm(prev => ({
                            ...prev,
                            advanced: {
                              ...prev.advanced,
                              retryOnFailure: e.target.checked,
                            },
                          }))
                        }
                        className='rounded'
                      />
                      <label className='text-sm font-medium text-gray-700'>
                        Retry on Failure
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={ruleForm.advanced?.parallelExecution || false}
                        onChange={e =>
                          setRuleForm(prev => ({
                            ...prev,
                            advanced: {
                              ...prev.advanced,
                              parallelExecution: e.target.checked,
                            },
                          }))
                        }
                        className='rounded'
                      />
                      <label className='text-sm font-medium text-gray-700'>
                        Parallel Execution
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Logic Settings */}
              <div className='mb-8'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-medium'>
                    Advanced Logic Features
                  </h3>
                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() =>
                        setRuleForm(prev => ({
                          ...prev,
                          advanced: {
                            ...prev.advanced,
                            branchingEnabled: !(
                              prev.advanced?.branchingEnabled ?? false
                            ),
                          },
                        }))
                      }
                      className='flex items-center space-x-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200'
                    >
                      <GitBranch className='w-3 h-3' />
                      <span>
                        {(ruleForm.advanced?.branchingEnabled ?? false)
                          ? 'Disable'
                          : 'Enable'}{' '}
                        Branching
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        setRuleForm(prev => ({
                          ...prev,
                          advanced: {
                            ...prev.advanced,
                            patternRecognition: {
                              ...prev.advanced?.patternRecognition,
                              enabled: !(
                                prev.advanced?.patternRecognition?.enabled ??
                                false
                              ),
                            },
                          },
                        }))
                      }
                      className='flex items-center space-x-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200'
                    >
                      <Brain className='w-3 h-3' />
                      <span>
                        {(ruleForm.advanced?.patternRecognition?.enabled ??
                        false)
                          ? 'Disable'
                          : 'Enable'}{' '}
                        Pattern Recognition
                      </span>
                    </button>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Branching Logic */}
                  {ruleForm.advanced?.branchingEnabled && (
                    <div className='p-4 border border-blue-200 rounded-lg bg-blue-50'>
                      <h4 className='font-medium mb-3 text-blue-800'>
                        Branching Logic
                      </h4>
                      <div className='space-y-3'>
                        <div>
                          <label className='block text-sm font-medium text-blue-700 mb-1'>
                            Branching Type
                          </label>
                          <select
                            value={
                              ruleForm.advanced?.branchingLogic ||
                              'IF_THEN_ELSE'
                            }
                            onChange={e =>
                              setRuleForm(prev => ({
                                ...prev,
                                advanced: {
                                  ...prev.advanced,
                                  branchingLogic: e.target
                                    .value as BranchingLogic,
                                },
                              }))
                            }
                            className='w-full px-3 py-2 border border-blue-300 rounded-lg text-sm'
                          >
                            <option value='IF_THEN_ELSE'>If-Then-Else</option>
                            <option value='SWITCH'>Switch Case</option>
                            <option value='CASCADE'>Cascade</option>
                            <option value='PARALLEL'>Parallel</option>
                          </select>
                        </div>
                        <div className='text-xs text-blue-600'>
                          <p>• If-Then-Else: Simple conditional branching</p>
                          <p>• Switch: Multiple condition branches</p>
                          <p>• Cascade: Sequential condition checking</p>
                          <p>
                            • Parallel: Execute multiple branches simultaneously
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pattern Recognition */}
                  {ruleForm.advanced?.patternRecognition?.enabled && (
                    <div className='p-4 border border-green-200 rounded-lg bg-green-50'>
                      <h4 className='font-medium mb-3 text-green-800'>
                        Pattern Recognition
                      </h4>
                      <div className='space-y-3'>
                        <div>
                          <label className='block text-sm font-medium text-green-700 mb-1'>
                            Confidence Threshold
                          </label>
                          <input
                            type='range'
                            min='0'
                            max='1'
                            step='0.1'
                            value={
                              ruleForm.advanced?.patternRecognition
                                ?.confidenceThreshold || 0.8
                            }
                            onChange={e =>
                              setRuleForm(prev => ({
                                ...prev,
                                advanced: {
                                  ...prev.advanced,
                                  patternRecognition: {
                                    ...prev.advanced?.patternRecognition,
                                    confidenceThreshold: parseFloat(
                                      e.target.value
                                    ),
                                  },
                                },
                              }))
                            }
                            className='w-full'
                          />
                          <div className='flex justify-between text-xs text-green-600'>
                            <span>0.0</span>
                            <span>
                              {ruleForm.advanced?.patternRecognition
                                ?.confidenceThreshold || 0.8}
                            </span>
                            <span>1.0</span>
                          </div>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-green-700 mb-1'>
                            ML Models
                          </label>
                          <div className='space-y-1'>
                            {['sentiment', 'topic', 'urgency', 'spam'].map(
                              model => (
                                <label
                                  key={model}
                                  className='flex items-center space-x-2'
                                >
                                  <input
                                    type='checkbox'
                                    checked={
                                      ruleForm.advanced?.patternRecognition?.models?.includes(
                                        model
                                      ) || false
                                    }
                                    onChange={e => {
                                      const currentModels =
                                        ruleForm.advanced?.patternRecognition
                                          ?.models || [];
                                      const newModels = e.target.checked
                                        ? [...currentModels, model]
                                        : currentModels.filter(
                                            m => m !== model
                                          );
                                      setRuleForm(prev => ({
                                        ...prev,
                                        advanced: {
                                          ...prev.advanced,
                                          patternRecognition: {
                                            ...prev.advanced
                                              ?.patternRecognition,
                                            models: newModels,
                                          },
                                        },
                                      }));
                                    }}
                                    className='rounded'
                                  />
                                  <span className='text-sm capitalize'>
                                    {model}
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pareto Analysis */}
                  <div className='p-4 border border-purple-200 rounded-lg bg-purple-50'>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='font-medium text-purple-800'>
                        80/20 Rule (Pareto)
                      </h4>
                      <button
                        onClick={() =>
                          setRuleForm(prev => ({
                            ...prev,
                            advanced: {
                              ...prev.advanced,
                              paretoAnalysis: {
                                ...prev.advanced?.paretoAnalysis,
                                enabled: !(
                                  prev.advanced?.paretoAnalysis?.enabled ??
                                  false
                                ),
                              },
                            },
                          }))
                        }
                        className='text-xs px-2 py-1 bg-purple-200 text-purple-700 rounded hover:bg-purple-300'
                      >
                        {(ruleForm.advanced?.paretoAnalysis?.enabled ?? false)
                          ? 'Disable'
                          : 'Enable'}
                      </button>
                    </div>
                    {ruleForm.advanced?.paretoAnalysis?.enabled && (
                      <div className='space-y-3'>
                        <div>
                          <label className='block text-sm font-medium text-purple-700 mb-1'>
                            Value Criteria
                          </label>
                          <div className='space-y-1'>
                            {[
                              'client_value',
                              'revenue_potential',
                              'project_impact',
                              'urgency',
                            ].map(criteria => (
                              <label
                                key={criteria}
                                className='flex items-center space-x-2'
                              >
                                <input
                                  type='checkbox'
                                  checked={
                                    ruleForm.advanced?.paretoAnalysis?.valueCriteria?.includes(
                                      criteria
                                    ) || false
                                  }
                                  onChange={e => {
                                    const currentCriteria =
                                      ruleForm.advanced?.paretoAnalysis
                                        ?.valueCriteria || [];
                                    const newCriteria = e.target.checked
                                      ? [...currentCriteria, criteria]
                                      : currentCriteria.filter(
                                          c => c !== criteria
                                        );
                                    setRuleForm(prev => ({
                                      ...prev,
                                      advanced: {
                                        ...prev.advanced,
                                        paretoAnalysis: {
                                          ...prev.advanced?.paretoAnalysis,
                                          valueCriteria: newCriteria,
                                        },
                                      },
                                    }));
                                  }}
                                  className='rounded'
                                />
                                <span className='text-sm capitalize'>
                                  {criteria.replace('_', ' ')}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <input
                            type='checkbox'
                            checked={
                              ruleForm.advanced?.paretoAnalysis
                                ?.autoCategorize || false
                            }
                            onChange={e =>
                              setRuleForm(prev => ({
                                ...prev,
                                advanced: {
                                  ...prev.advanced,
                                  paretoAnalysis: {
                                    ...prev.advanced?.paretoAnalysis,
                                    autoCategorize: e.target.checked,
                                  },
                                },
                              }))
                            }
                            className='rounded'
                          />
                          <label className='text-sm font-medium text-purple-700'>
                            Auto-categorize emails
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4Ds Methodology */}
                  <div className='p-4 border border-orange-200 rounded-lg bg-orange-50'>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='font-medium text-orange-800'>
                        4Ds Methodology
                      </h4>
                      <button
                        onClick={() =>
                          setRuleForm(prev => ({
                            ...prev,
                            advanced: {
                              ...prev.advanced,
                              fourDs: {
                                ...prev.advanced?.fourDs,
                                enabled: !(
                                  prev.advanced?.fourDs?.enabled ?? false
                                ),
                              },
                            },
                          }))
                        }
                        className='text-xs px-2 py-1 bg-orange-200 text-orange-700 rounded hover:bg-orange-300'
                      >
                        {(ruleForm.advanced?.fourDs?.enabled ?? false)
                          ? 'Disable'
                          : 'Enable'}
                      </button>
                    </div>
                    {ruleForm.advanced?.fourDs?.enabled && (
                      <div className='space-y-3'>
                        <div className='flex items-center space-x-2'>
                          <input
                            type='checkbox'
                            checked={
                              ruleForm.advanced?.fourDs?.autoCategorize || false
                            }
                            onChange={e =>
                              setRuleForm(prev => ({
                                ...prev,
                                advanced: {
                                  ...prev.advanced,
                                  fourDs: {
                                    ...prev.advanced?.fourDs,
                                    autoCategorize: e.target.checked,
                                  },
                                },
                              }))
                            }
                            className='rounded'
                          />
                          <label className='text-sm font-medium text-orange-700'>
                            Auto-categorize using 4Ds
                          </label>
                        </div>
                        <div className='text-xs text-orange-600'>
                          <p>• Do: Immediate action items</p>
                          <p>• Delete: Unnecessary emails</p>
                          <p>• Delegate: Forward to appropriate person</p>
                          <p>• Defer: Schedule for later processing</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Inbox Zero */}
                  <div className='p-4 border border-teal-200 rounded-lg bg-teal-50'>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='font-medium text-teal-800'>Inbox Zero</h4>
                      <button
                        onClick={() =>
                          setRuleForm(prev => ({
                            ...prev,
                            advanced: {
                              ...prev.advanced,
                              inboxZero: {
                                ...prev.advanced?.inboxZero,
                                enabled: !(
                                  prev.advanced?.inboxZero?.enabled ?? false
                                ),
                              },
                            },
                          }))
                        }
                        className='text-xs px-2 py-1 bg-teal-200 text-teal-700 rounded hover:bg-teal-300'
                      >
                        {(ruleForm.advanced?.inboxZero?.enabled ?? false)
                          ? 'Disable'
                          : 'Enable'}
                      </button>
                    </div>
                    {ruleForm.advanced?.inboxZero?.enabled && (
                      <div className='space-y-3'>
                        <div>
                          <label className='block text-sm font-medium text-teal-700 mb-1'>
                            Processing Strategy
                          </label>
                          <select
                            value={
                              ruleForm.advanced?.inboxZero
                                ?.processingStrategy || 'IMMEDIATE'
                            }
                            onChange={e =>
                              setRuleForm(prev => ({
                                ...prev,
                                advanced: {
                                  ...prev.advanced,
                                  inboxZero: {
                                    ...prev.advanced?.inboxZero,
                                    processingStrategy: e.target.value as
                                      | 'IMMEDIATE'
                                      | 'BATCH'
                                      | 'SCHEDULED',
                                  },
                                },
                              }))
                            }
                            className='w-full px-3 py-2 border border-teal-300 rounded-lg text-sm'
                          >
                            <option value='IMMEDIATE'>
                              Immediate Processing
                            </option>
                            <option value='BATCH'>Batch Processing</option>
                            <option value='SCHEDULED'>
                              Scheduled Processing
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-teal-700 mb-1'>
                            Max Processing Time (minutes)
                          </label>
                          <input
                            type='number'
                            value={
                              ruleForm.advanced?.inboxZero?.maxProcessingTime ||
                              15
                            }
                            onChange={e =>
                              setRuleForm(prev => ({
                                ...prev,
                                advanced: {
                                  ...prev.advanced,
                                  inboxZero: {
                                    ...prev.advanced?.inboxZero,
                                    maxProcessingTime:
                                      parseInt(e.target.value) || 15,
                                  },
                                },
                              }))
                            }
                            className='w-full px-3 py-2 border border-teal-300 rounded-lg text-sm'
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex-1 overflow-y-auto p-8'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold'>Your Automation Rules</h2>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setSelectedRule(null);
                    setRuleForm({
                      name: '',
                      description: '',
                      conditions: [],
                      logic: 'AND',
                      actions: [],
                      isActive: true,
                      priority: 1,
                    });
                  }}
                  className='px-6 py-2 text-sm bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-black hover:text-white'
                >
                  New Rule
                </button>
              </div>
              <div className='space-y-4'>
                {rules.length === 0 ? (
                  <div className='text-center text-gray-500 py-12'>
                    <Zap className='w-12 h-12 mx-auto mb-4 opacity-50' />
                    <p>
                      No rules yet. Click "New Rule" to get started or use a
                      template.
                    </p>
                  </div>
                ) : (
                  rules.map(rule => (
                    <div
                      key={rule.id}
                      className='p-6 border border-gray-200 rounded-lg flex items-center justify-between'
                    >
                      <div>
                        <h3 className='font-medium text-lg mb-1'>
                          {rule.name}
                        </h3>
                        <p className='text-sm text-gray-600 mb-2'>
                          {rule.description}
                        </p>
                        <div className='flex items-center space-x-2 text-xs'>
                          <span className='bg-green-100 text-green-800 px-2 py-1 rounded'>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded'>
                            Priority: {rule.priority}
                          </span>
                          <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                            {rule.executionCount} runs
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => editRule(rule)}
                          className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg'
                        >
                          <Edit3 className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className='p-2 text-red-600 hover:bg-red-50 rounded-lg'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => setBulkApplyOpen(true)}
                          className='p-2 text-purple-600 hover:bg-purple-50 rounded-lg'
                        >
                          <Layers className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* Templates Modal */}
        {showTemplates && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative'>
              <button
                onClick={() => setShowTemplates(false)}
                className='absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700'
              >
                <X />
              </button>
              <h2 className='text-xl font-semibold mb-6'>Rule Templates</h2>
              <div className='space-y-4'>
                {RULE_TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    className='p-4 border border-gray-200 rounded-lg flex items-center justify-between'
                  >
                    <div>
                      <h3 className='font-medium text-lg mb-1'>
                        {template.name}
                      </h3>
                      <p className='text-sm text-gray-600 mb-2'>
                        {template.description}
                      </p>
                      {template.example && (
                        <p className='text-xs text-gray-500'>
                          Example: {template.example}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => createFromTemplate(template)}
                      className='px-4 py-2 bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-black hover:text-white'
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Test Mode Modal */}
        {showTestMode && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative'>
              <button
                onClick={() => setShowTestMode(false)}
                className='absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700'
              >
                <X />
              </button>
              <h2 className='text-xl font-semibold mb-6'>Rule Testing Mode</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-medium mb-4'>Test Email Data</h3>
                  <textarea
                    className='w-full h-32 p-3 border border-gray-300 rounded-lg'
                    placeholder='Paste email JSON or enter test data...'
                    defaultValue={JSON.stringify(
                      {
                        sender: 'test@example.com',
                        subject: 'Test Email Subject',
                        body: 'This is a test email body',
                        attachments: [],
                        metadata: {},
                      },
                      null,
                      2
                    )}
                  />
                  <button className='mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600'>
                    Run Test
                  </button>
                </div>
                <div>
                  <h3 className='font-medium mb-4'>Test Results</h3>
                  <div className='space-y-2'>
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className='p-3 border border-gray-200 rounded-lg'
                      >
                        <div className='flex items-center justify-between'>
                          <span className='font-medium'>{result.ruleName}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${result.matched ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {result.matched ? 'Matched' : 'No Match'}
                          </span>
                        </div>
                        {result.actions && (
                          <div className='mt-2 text-sm text-gray-600'>
                            Actions: {result.actions.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative'>
              <button
                onClick={() => setShowAnalytics(false)}
                className='absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700'
              >
                <X />
              </button>
              <h2 className='text-xl font-semibold mb-6'>
                Rule Analytics & Performance
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <h3 className='font-medium text-blue-800'>Total Rules</h3>
                  <p className='text-2xl font-bold text-blue-600'>
                    {rules.length}
                  </p>
                </div>
                <div className='p-4 bg-green-50 rounded-lg'>
                  <h3 className='font-medium text-green-800'>Active Rules</h3>
                  <p className='text-2xl font-bold text-green-600'>
                    {rules.filter(r => r.isActive).length}
                  </p>
                </div>
                <div className='p-4 bg-purple-50 rounded-lg'>
                  <h3 className='font-medium text-purple-800'>
                    Total Executions
                  </h3>
                  <p className='text-2xl font-bold text-purple-600'>
                    {rules.reduce((sum, r) => sum + r.executionCount, 0)}
                  </p>
                </div>
              </div>
              <div className='space-y-4'>
                <h3 className='font-medium'>Top Performing Rules</h3>
                {rules
                  .sort((a, b) => b.executionCount - a.executionCount)
                  .slice(0, 5)
                  .map(rule => (
                    <div
                      key={rule.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between'>
                        <span className='font-medium'>{rule.name}</span>
                        <span className='text-sm text-gray-600'>
                          {rule.executionCount} executions
                        </span>
                      </div>
                      <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{
                            width: `${Math.min((rule.executionCount / Math.max(...rules.map(r => r.executionCount))) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Integrations Modal */}
        {showIntegrations && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative'>
              <button
                onClick={() => setShowIntegrations(false)}
                className='absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700'
              >
                <X />
              </button>
              <h2 className='text-xl font-semibold mb-6'>
                Integration Status & Configuration
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='font-medium mb-4'>External Integrations</h3>
                  <div className='space-y-3'>
                    {[
                      {
                        name: 'Slack',
                        status: 'connected',
                        icon: 'MessageCircle',
                      },
                      {
                        name: 'Microsoft Teams',
                        status: 'connected',
                        icon: 'MessageCircle',
                      },
                      {
                        name: 'Salesforce CRM',
                        status: 'connected',
                        icon: 'Building',
                      },
                      {
                        name: 'HubSpot',
                        status: 'disconnected',
                        icon: 'Building',
                      },
                      { name: 'Zapier', status: 'connected', icon: 'Zap' },
                      {
                        name: 'Webhook API',
                        status: 'connected',
                        icon: 'Globe',
                      },
                    ].map(integration => (
                      <div
                        key={integration.name}
                        className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'
                      >
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`w-3 h-3 rounded-full ${integration.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}
                          ></div>
                          <span className='font-medium'>
                            {integration.name}
                          </span>
                        </div>
                        <button className='px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                          {integration.status === 'connected'
                            ? 'Configure'
                            : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className='font-medium mb-4'>AI Services</h3>
                  <div className='space-y-3'>
                    {[
                      {
                        name: 'OpenAI GPT-4',
                        status: 'connected',
                        model: 'gpt-4',
                      },
                      {
                        name: 'Claude AI',
                        status: 'connected',
                        model: 'claude-3',
                      },
                      {
                        name: 'Google AI',
                        status: 'disconnected',
                        model: 'gemini',
                      },
                      {
                        name: 'Custom Model',
                        status: 'connected',
                        model: 'custom',
                      },
                    ].map(ai => (
                      <div
                        key={ai.name}
                        className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'
                      >
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`w-3 h-3 rounded-full ${ai.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}
                          ></div>
                          <span className='font-medium'>{ai.name}</span>
                          <span className='text-xs text-gray-500'>
                            ({ai.model})
                          </span>
                        </div>
                        <button className='px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50'>
                          {ai.status === 'connected' ? 'Test' : 'Setup'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Logs Modal */}
        {showLogs && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative'>
              <button
                onClick={() => setShowLogs(false)}
                className='absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700'
              >
                <X />
              </button>
              <h2 className='text-xl font-semibold mb-6'>Rule Execution Log</h2>
              <div className='space-y-4'>
                {logs.length === 0 ? (
                  <div className='text-center text-gray-500 py-12'>
                    <List className='w-12 h-12 mx-auto mb-4 opacity-50' />
                    <p>No rule executions yet.</p>
                  </div>
                ) : (
                  logs.map(log => (
                    <div
                      key={log.id}
                      className='p-4 border border-gray-200 rounded-lg flex items-center justify-between'
                    >
                      <div>
                        <h3 className='font-medium text-sm mb-1'>
                          Rule:{' '}
                          {rules.find(r => r.id === log.ruleId)?.name ||
                            log.ruleId}
                        </h3>
                        <p className='text-xs text-gray-600 mb-2'>
                          {log.timestamp.toLocaleString()}
                        </p>
                        <div className='flex items-center space-x-2 text-xs'>
                          <span
                            className={`px-2 py-1 rounded ${log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {log.status}
                          </span>
                          <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded'>
                            {log.actionsTaken.join(', ')}
                          </span>
                        </div>
                        {log.message && (
                          <p className='text-xs text-red-500 mt-1'>
                            {log.message}
                          </p>
                        )}
                      </div>
                      <span className='text-xs text-gray-500'>
                        Email: {log.emailId}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {/* Bulk Apply Modal */}
        {bulkApplyOpen && selectedRule && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-8 relative'>
              <button
                onClick={() => setBulkApplyOpen(false)}
                className='absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700'
              >
                <X />
              </button>
              <h2 className='text-xl font-semibold mb-6'>Bulk Apply Rule</h2>
              <p className='mb-4'>
                Apply <span className='font-semibold'>{selectedRule.name}</span>{' '}
                to all matching emails?
              </p>
              <button
                onClick={() => bulkApplyRule(selectedRule)}
                className='w-full px-6 py-2 bg-constructbms-blue text-black font-medium rounded-lg hover:bg-constructbms-black hover:text-white'
              >
                Apply Rule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Condition Node (Recursive) ---
// --- Action Parameter Builder Component ---
const ActionParameterBuilder: React.FC<{
  actionType: string;
  onUpdate: (params: Record<string, any>) => void;
  parameters: Record<string, any>;
}> = ({ actionType, parameters, onUpdate }) => {
  const updateParam = (key: string, value: any) => {
    onUpdate({ ...parameters, [key]: value });
  };

  const renderParameterFields = () => {
    switch (actionType) {
      case 'ai_analyze':
        return (
          <div className='space-y-2'>
            <input
              type='text'
              placeholder='Analysis type (sentiment, entities, etc.)'
              value={parameters.analysis_type || ''}
              onChange={e => updateParam('analysis_type', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
            <input
              type='text'
              placeholder='Model (gpt-4, claude, etc.)'
              value={parameters.model || ''}
              onChange={e => updateParam('model', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
          </div>
        );

      case 'ai_extract_data':
        return (
          <div className='space-y-2'>
            <input
              type='text'
              placeholder='Fields to extract (comma separated)'
              value={parameters.fields || ''}
              onChange={e => updateParam('fields', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
            <select
              value={parameters.format || 'json'}
              onChange={e => updateParam('format', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            >
              <option value='json'>JSON</option>
              <option value='csv'>CSV</option>
              <option value='structured'>Structured</option>
            </select>
          </div>
        );

      case 'webhook':
        return (
          <div className='space-y-2'>
            <input
              type='text'
              placeholder='Webhook URL'
              value={parameters.url || ''}
              onChange={e => updateParam('url', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
            <select
              value={parameters.method || 'POST'}
              onChange={e => updateParam('method', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            >
              <option value='POST'>POST</option>
              <option value='PUT'>PUT</option>
              <option value='PATCH'>PATCH</option>
            </select>
          </div>
        );

      case 'api_call':
        return (
          <div className='space-y-2'>
            <input
              type='text'
              placeholder='API Endpoint'
              value={parameters.endpoint || ''}
              onChange={e => updateParam('endpoint', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
            <input
              type='text'
              placeholder='API Key (optional)'
              value={parameters.api_key || ''}
              onChange={e => updateParam('api_key', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
          </div>
        );

      case 'slack_notify':
      case 'teams_notify':
        return (
          <div className='space-y-2'>
            <input
              type='text'
              placeholder='Channel name'
              value={parameters.channel || ''}
              onChange={e => updateParam('channel', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
            <input
              type='text'
              placeholder='Message template'
              value={parameters.message || ''}
              onChange={e => updateParam('message', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
          </div>
        );

      case 'create_task':
        return (
          <div className='space-y-2'>
            <input
              type='text'
              placeholder='Task title template'
              value={parameters.title || ''}
              onChange={e => updateParam('title', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
            <select
              value={parameters.priority || 'medium'}
              onChange={e => updateParam('priority', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            >
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
              <option value='urgent'>Urgent</option>
            </select>
          </div>
        );

      case 'create_invoice':
        return (
          <div className='space-y-2'>
            <input
              type='text'
              placeholder='Invoice template'
              value={parameters.template || ''}
              onChange={e => updateParam('template', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
            <select
              value={parameters.currency || 'USD'}
              onChange={e => updateParam('currency', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            >
              <option value='USD'>USD</option>
              <option value='EUR'>EUR</option>
              <option value='GBP'>GBP</option>
            </select>
          </div>
        );

      case 'delay_action':
        return (
          <div className='space-y-2'>
            <input
              type='number'
              placeholder='Delay (minutes)'
              value={parameters.delay_minutes || ''}
              onChange={e =>
                updateParam('delay_minutes', parseInt(e.target.value))
              }
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
            <select
              value={parameters.timezone || 'UTC'}
              onChange={e => updateParam('timezone', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            >
              <option value='UTC'>UTC</option>
              <option value='EST'>EST</option>
              <option value='PST'>PST</option>
            </select>
          </div>
        );

      case 'encrypt':
        return (
          <div className='space-y-2'>
            <select
              value={parameters.level || 'standard'}
              onChange={e => updateParam('level', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            >
              <option value='standard'>Standard</option>
              <option value='enterprise'>Enterprise</option>
              <option value='military'>Military Grade</option>
            </select>
            <input
              type='text'
              placeholder='Encryption key (optional)'
              value={parameters.key || ''}
              onChange={e => updateParam('key', e.target.value)}
              className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            />
          </div>
        );

      default:
        return (
          <input
            type='text'
            value={JSON.stringify(parameters)}
            onChange={e => {
              try {
                onUpdate(JSON.parse(e.target.value));
              } catch {}
            }}
            className='px-2 py-1 text-xs border border-gray-300 rounded w-48'
            placeholder='{param: value}'
          />
        );
    }
  };

  return <div className='flex-1'>{renderParameterFields()}</div>;
};

const ConditionNode: React.FC<{
  cond: RuleCondition;
  onAddChild: (parentId: string) => void;
  onRemove: (id: string, conds?: RuleCondition[]) => void;
  onUpdate: (
    id: string,
    updates: Partial<RuleCondition>,
    conds?: RuleCondition[]
  ) => void;
}> = ({ cond, onUpdate, onRemove, onAddChild }) => {
  return (
    <div className='ml-4 border-l-2 border-blue-100 pl-4 py-2 relative'>
      <div className='flex items-center space-x-2 mb-1'>
        <select
          value={cond.field}
          onChange={e => onUpdate(cond.id, { field: e.target.value })}
          className='px-2 py-1 text-xs border border-gray-300 rounded'
        >
          <option value='sender'>Sender</option>
          <option value='recipient'>Recipient</option>
          <option value='subject'>Subject</option>
          <option value='body'>Body</option>
          <option value='has_attachments'>Has Attachments</option>
          <option value='priority'>Priority</option>
          <option value='category'>Category</option>
          <option value='date_received'>Date Received</option>
          <option value='calendarStatus'>Calendar Status</option>
        </select>
        <select
          value={cond.operator}
          onChange={e => onUpdate(cond.id, { operator: e.target.value })}
          className='px-2 py-1 text-xs border border-gray-300 rounded'
        >
          <option value='contains'>Contains</option>
          <option value='equals'>Equals</option>
          <option value='starts_with'>Starts With</option>
          <option value='ends_with'>Ends With</option>
          <option value='regex'>Regex</option>
          <option value='greater_than'>Greater Than</option>
          <option value='less_than'>Less Than</option>
        </select>
        <input
          type='text'
          value={cond.value as string}
          onChange={e => onUpdate(cond.id, { value: e.target.value })}
          className='px-2 py-1 text-xs border border-gray-300 rounded w-32'
          placeholder='Value'
        />
        <button
          onClick={() => onRemove(cond.id)}
          className='p-1 text-red-500 hover:text-red-700 rounded'
        >
          <Trash2 className='w-3 h-3' />
        </button>
        <button
          onClick={() => onAddChild(cond.id)}
          className='p-1 text-blue-500 hover:text-blue-700 rounded'
        >
          <Plus className='w-3 h-3' />
        </button>
      </div>
      {cond.children && cond.children.length > 0 && (
        <div className='ml-4'>
          <label className='block text-xs font-medium text-gray-500 mb-1'>
            Logic
          </label>
          <select
            value={cond.logic}
            onChange={e =>
              onUpdate(cond.id, { logic: e.target.value as LogicalOperator })
            }
            className='px-2 py-1 text-xs border border-gray-300 rounded mb-2'
          >
            <option value='AND'>AND</option>
            <option value='OR'>OR</option>
          </select>
          {cond.children.map(child => (
            <ConditionNode
              key={child.id}
              cond={child}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedRulesBuilder;
