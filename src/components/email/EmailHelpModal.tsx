import React, { useState } from 'react';
import {
  X,
  Search,
  Book,
  Video,
  MessageCircle,
  Settings,
  BarChart3,
  Zap,
  Users,
  Folder,
  Eye,
  Clock,
  Star,
  Flag,
  Archive,
  Trash2,
  Mail,
  Reply,
  Forward,
  Plus,
  Calendar,
  Filter,
  Tag,
  Move,
  Download,
  Upload,
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Brain,
} from 'lucide-react';

interface EmailHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpArticle {
  category: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  id: string;
  tags: string[];
  title: string;
  videoUrl?: string;
}

const EmailHelpModal: React.FC<EmailHelpModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null
  );
  const [showVideo, setShowVideo] = useState(false);

  const helpArticles: HelpArticle[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with Email Client',
      category: 'getting-started',
      content: `
        <h3>Welcome to ConstructBMS Email Client!</h3>
        <p>This comprehensive email client is designed to help you manage your business communications efficiently. Here's how to get started:</p>
        
        <h4>Key Features:</h4>
        <ul>
          <li><strong>Three-Pane Layout:</strong> Folders, email list, and reading pane for optimal workflow</li>
          <li><strong>AI-Powered Intelligence:</strong> Automatic email analysis and smart suggestions</li>
          <li><strong>Advanced Rules:</strong> Create custom automation rules for email management</li>
          <li><strong>CRM Integration:</strong> Connect emails to customers, projects, and opportunities</li>
          <li><strong>Analytics Dashboard:</strong> Track email performance and response times</li>
        </ul>
        
        <h4>Step-by-Step Setup Guide:</h4>
        <ol>
          <li><strong>Account Configuration:</strong> Go to Settings → Email Accounts to add your email accounts</li>
          <li><strong>View Customization:</strong> Use the View tab to set your preferred layout (Compact/Normal/Preview)</li>
          <li><strong>Reading Pane:</strong> Choose Right, Bottom, or Off for the reading pane position</li>
          <li><strong>First Rules:</strong> Click "Rules & Automations" to create your first email rule</li>
          <li><strong>AI Setup:</strong> Click "Email AI" to explore AI-powered features</li>
          <li><strong>Analytics:</strong> Click "Analytics" to view your email performance metrics</li>
        </ol>
        
        <h4>Essential Keyboard Shortcuts:</h4>
        <ul>
          <li><strong>Ctrl+N:</strong> New email</li>
          <li><strong>Ctrl+R:</strong> Reply to selected email</li>
          <li><strong>Ctrl+F:</strong> Forward selected email</li>
          <li><strong>Ctrl+Shift+R:</strong> Reply all</li>
          <li><strong>Delete:</strong> Delete selected email(s)</li>
          <li><strong>Ctrl+A:</strong> Select all emails</li>
          <li><strong>Ctrl+Click:</strong> Multi-select emails</li>
          <li><strong>Shift+Click:</strong> Range select emails</li>
        </ul>
        
        <h4>Multi-Selection Guide:</h4>
        <p>Select multiple emails for bulk operations:</p>
        <ul>
          <li><strong>Single Selection:</strong> Click on an email to select it</li>
          <li><strong>Ctrl+Click:</strong> Add/remove individual emails from selection</li>
          <li><strong>Shift+Click:</strong> Select a range of emails between two clicks</li>
          <li><strong>Select All:</strong> Use the "Select All" button in bulk actions toolbar</li>
          <li><strong>Clear Selection:</strong> Click "Clear" in bulk actions toolbar</li>
        </ul>
      `,
      tags: [
        'setup',
        'configuration',
        'first-time',
        'shortcuts',
        'multi-selection',
      ],
      difficulty: 'beginner',
    },
    {
      id: 'ribbon-toolbar',
      title: 'Using the Outlook-Style Ribbon',
      category: 'interface',
      content: `
        <h3>Outlook-Style Ribbon Toolbar</h3>
        <p>The ribbon toolbar provides quick access to all email functions, organized by tabs:</p>
        
        <h4>Home Tab - Core Email Functions:</h4>
        <ul>
          <li><strong>New Email:</strong> Create a new email message</li>
          <li><strong>New Meeting:</strong> Schedule a meeting based on selected email</li>
          <li><strong>Delete:</strong> Delete selected email(s) - moves to trash</li>
          <li><strong>Archive:</strong> Archive selected email(s) - moves to archive folder</li>
          <li><strong>Reply:</strong> Reply to sender of selected email</li>
          <li><strong>Reply All:</strong> Reply to sender and all recipients</li>
          <li><strong>Forward:</strong> Forward selected email to new recipients</li>
          <li><strong>Rules:</strong> Open Rules & Automations modal</li>
          <li><strong>Tags:</strong> Manage email tags and categories</li>
          <li><strong>Address Book:</strong> Open contacts and address book</li>
          <li><strong>Filter:</strong> Apply quick filters to email list</li>
          <li><strong>Save Attachments:</strong> Download all attachments from selected emails</li>
        </ul>
        
        <h4>Send/Receive Tab - Email Synchronization:</h4>
        <ul>
          <li><strong>Send/Receive:</strong> Manually sync current folder</li>
          <li><strong>Send/Receive All:</strong> Sync all email folders</li>
          <li><strong>Preferences:</strong> Access email settings and configuration</li>
        </ul>
        
        <h4>Folder Tab - Folder Management:</h4>
        <ul>
          <li><strong>New Folder:</strong> Create a new email folder</li>
          <li><strong>Rename Folder:</strong> Rename the currently selected folder</li>
          <li><strong>Delete Folder:</strong> Delete the selected folder</li>
          <li><strong>Empty Folder:</strong> Remove all emails from folder</li>
          <li><strong>Folder Properties:</strong> View and edit folder settings</li>
        </ul>
        
        <h4>View Tab - Display and Organization:</h4>
        <ul>
          <li><strong>Current View:</strong>
            <ul>
              <li><strong>Compact:</strong> Condensed single-line view for high-volume scanning</li>
              <li><strong>Normal:</strong> Standard view with full details and action buttons</li>
              <li><strong>Preview:</strong> Enhanced view with email content preview</li>
            </ul>
          </li>
          <li><strong>Reading Pane:</strong>
            <ul>
              <li><strong>Right:</strong> Show email content on the right side</li>
              <li><strong>Bottom:</strong> Show email content at the bottom</li>
              <li><strong>Off:</strong> Hide reading pane for maximum email list space</li>
            </ul>
          </li>
          <li><strong>Sort:</strong>
            <ul>
              <li><strong>Date:</strong> Sort by email timestamp (newest/oldest first)</li>
              <li><strong>Sender:</strong> Sort alphabetically by sender name</li>
              <li><strong>Subject:</strong> Sort alphabetically by subject line</li>
            </ul>
          </li>
          <li><strong>Filter:</strong>
            <ul>
              <li><strong>Unread:</strong> Toggle between showing all emails or only unread</li>
              <li><strong>Flagged:</strong> Show only flagged/starred emails</li>
            </ul>
          </li>
          <li><strong>Zoom:</strong> Adjust zoom level (100%, 125%, 150%)</li>
        </ul>
        
        <h4>Help Tab - Support and Resources:</h4>
        <ul>
          <li><strong>Help:</strong> Open this comprehensive help system</li>
        </ul>
      `,
      tags: [
        'ribbon',
        'toolbar',
        'interface',
        'navigation',
        'tabs',
        'functions',
      ],
      difficulty: 'beginner',
    },
    {
      id: 'email-management',
      title: 'Complete Email Management Guide',
      category: 'interface',
      content: `
        <h3>Complete Email Management Guide</h3>
        <p>Master all aspects of email management with this comprehensive guide:</p>
        
        <h4>Email Organization Strategies:</h4>
        <ul>
          <li><strong>Inbox Zero Method:</strong> Process emails immediately using the 4Ds (Delete, Delegate, Defer, Do)</li>
          <li><strong>Priority-Based Sorting:</strong> Use priority levels (Critical, High, Medium, Low) to focus on important emails</li>
          <li><strong>Category Filtering:</strong> Organize emails by type (Project-related, Client Communication, Internal Team, etc.)</li>
          <li><strong>Tag System:</strong> Use tags like "Urgent", "Follow-up", "Client", "Project" for quick identification</li>
        </ul>
        
        <h4>Step-by-Step Email Processing:</h4>
        <ol>
          <li><strong>Scan and Sort:</strong> Use Compact view to quickly scan through emails</li>
          <li><strong>Identify Priority:</strong> Look for critical indicators (urgent, ASAP, deadline)</li>
          <li><strong>Apply Tags:</strong> Tag emails for easy categorization and filtering</li>
          <li><strong>Take Action:</strong> Reply, forward, archive, or delete immediately</li>
          <li><strong>Follow Up:</strong> Use the meeting scheduler for emails requiring discussion</li>
        </ol>
        
        <h4>Bulk Operations Guide:</h4>
        <ul>
          <li><strong>Multi-Selection:</strong> Use Ctrl+Click for individual selection, Shift+Click for range selection</li>
          <li><strong>Bulk Mark as Read/Unread:</strong> Select multiple emails and use bulk actions toolbar</li>
          <li><strong>Bulk Archive/Delete:</strong> Process multiple emails simultaneously</li>
          <li><strong>Bulk Tag Management:</strong> Apply or remove tags from multiple emails</li>
          <li><strong>Bulk Attachment Download:</strong> Download attachments from multiple emails at once</li>
        </ul>
        
        <h4>Advanced Search Techniques:</h4>
        <ul>
          <li><strong>Text Search:</strong> Search in subject, sender, or content</li>
          <li><strong>Filter Combinations:</strong> Combine priority, status, and category filters</li>
          <li><strong>Date Range Filtering:</strong> Focus on specific time periods</li>
          <li><strong>Attachment Filtering:</strong> Find emails with attachments</li>
          <li><strong>Tag-Based Search:</strong> Search by specific tags</li>
        </ul>
        
        <h4>Email Response Best Practices:</h4>
        <ul>
          <li><strong>Quick Responses:</strong> Use templates for common replies</li>
          <li><strong>Professional Tone:</strong> Maintain consistent, professional communication</li>
          <li><strong>Clear Subject Lines:</strong> Use descriptive subject lines for replies</li>
          <li><strong>Action Items:</strong> Clearly state next steps and deadlines</li>
          <li><strong>Follow-up Scheduling:</strong> Schedule follow-ups for emails requiring action</li>
        </ul>
      `,
      tags: [
        'email-management',
        'organization',
        'productivity',
        'workflow',
        'best-practices',
      ],
      difficulty: 'intermediate',
    },
    {
      id: 'automation-rules',
      title: 'Creating Advanced Automation Rules',
      category: 'automation',
      content: `
        <h3>Advanced Automation Rules</h3>
        <p>Create sophisticated email automation rules to streamline your workflow:</p>
        
        <h4>Rule Components:</h4>
        <ul>
          <li><strong>Conditions:</strong> Define when rules trigger (sender, subject, content, etc.)</li>
          <li><strong>Actions:</strong> Specify what happens (move, tag, forward, etc.)</li>
          <li><strong>Logic:</strong> Use AND/OR operators for complex conditions</li>
          <li><strong>Exceptions:</strong> Define when rules should not apply</li>
        </ul>
        
        <h4>Advanced Features:</h4>
        <ul>
          <li><strong>AI Actions:</strong> Automatic categorization and priority setting</li>
          <li><strong>CRM Integration:</strong> Link emails to customer records</li>
          <li><strong>Workflow Actions:</strong> Create tasks and assign to team members</li>
          <li><strong>Financial Processing:</strong> Extract invoice data and update systems</li>
          <li><strong>Security Actions:</strong> Quarantine suspicious emails</li>
        </ul>
        
        <h4>Best Practices:</h4>
        <ol>
          <li>Start with simple rules and gradually add complexity</li>
          <li>Test rules on a small subset of emails first</li>
          <li>Use descriptive names for your rules</li>
          <li>Regularly review and update rule performance</li>
          <li>Monitor rule logs for any issues</li>
        </ol>
      `,
      tags: ['rules', 'automation', 'workflow', 'ai'],
      difficulty: 'intermediate',
    },
    {
      id: 'ai-intelligence',
      title: 'AI-Powered Email Intelligence',
      category: 'ai',
      content: `
        <h3>AI Email Intelligence Features</h3>
        <p>Leverage artificial intelligence to enhance your email productivity:</p>
        
        <h4>Automatic Analysis:</h4>
        <ul>
          <li><strong>Content Summarization:</strong> Get key points and action items</li>
          <li><strong>Sentiment Analysis:</strong> Understand email tone and urgency</li>
          <li><strong>Entity Recognition:</strong> Identify customers, projects, and opportunities</li>
          <li><strong>Priority Scoring:</strong> AI-determined importance levels</li>
        </ul>
        
        <h4>Smart Suggestions:</h4>
        <ul>
          <li><strong>Response Templates:</strong> Context-aware reply suggestions</li>
          <li><strong>Follow-up Reminders:</strong> Automatic task creation</li>
          <li><strong>Meeting Scheduling:</strong> Extract and propose meeting times</li>
          <li><strong>Document Processing:</strong> Extract data from attachments</li>
        </ul>
        
        <h4>Advanced Intelligence:</h4>
        <ul>
          <li><strong>Pattern Recognition:</strong> Learn from your email patterns</li>
          <li><strong>80/20 Rule:</strong> Focus on high-impact emails</li>
          <li><strong>4Ds Method:</strong> Do, Delegate, Defer, or Delete suggestions</li>
          <li><strong>Inbox Zero:</strong> Automated inbox management</li>
        </ul>
      `,
      tags: ['ai', 'intelligence', 'automation', 'productivity'],
      difficulty: 'intermediate',
    },
    {
      id: 'crm-integration',
      title: 'CRM and Business Integration',
      category: 'integration',
      content: `
        <h3>CRM and Business System Integration</h3>
        <p>Connect your emails to your business systems for seamless workflow:</p>
        
        <h4>Customer Management:</h4>
        <ul>
          <li><strong>Contact Linking:</strong> Automatically link emails to customer records</li>
          <li><strong>Activity Tracking:</strong> Log email interactions in CRM</li>
          <li><strong>Lead Scoring:</strong> Update lead scores based on email engagement</li>
          <li><strong>Opportunity Tracking:</strong> Link emails to sales opportunities</li>
        </ul>
        
        <h4>Project Integration:</h4>
        <ul>
          <li><strong>Project Linking:</strong> Associate emails with specific projects</li>
          <li><strong>Task Creation:</strong> Generate tasks from email content</li>
          <li><strong>Time Tracking:</strong> Log time spent on email-related work</li>
          <li><strong>Document Management:</strong> Store attachments in project folders</li>
        </ul>
        
        <h4>Financial Processing:</h4>
        <ul>
          <li><strong>Invoice Extraction:</strong> Extract invoice data from emails</li>
          <li><strong>Payment Tracking:</strong> Monitor payment status updates</li>
          <li><strong>Expense Management:</strong> Process expense receipts</li>
          <li><strong>Budget Alerts:</strong> Notify when expenses exceed thresholds</li>
        </ul>
      `,
      tags: ['crm', 'integration', 'business', 'workflow'],
      difficulty: 'advanced',
    },
    {
      id: 'analytics-dashboard',
      title: 'Understanding Email Analytics',
      category: 'analytics',
      content: `
        <h3>Email Analytics Dashboard</h3>
        <p>Track and analyze your email performance with comprehensive analytics:</p>
        
        <h4>Key Metrics:</h4>
        <ul>
          <li><strong>Response Time:</strong> Average time to respond to emails</li>
          <li><strong>Email Volume:</strong> Daily, weekly, and monthly trends</li>
          <li><strong>Category Distribution:</strong> Breakdown by email type</li>
          <li><strong>Priority Analysis:</strong> Distribution by importance level</li>
          <li><strong>Sender Activity:</strong> Most active contacts and clients</li>
        </ul>
        
        <h4>Performance Insights:</h4>
        <ul>
          <li><strong>Productivity Trends:</strong> Track your email efficiency over time</li>
          <li><strong>Peak Activity Hours:</strong> Identify your most productive times</li>
          <li><strong>Response Rate Analysis:</strong> Monitor your responsiveness</li>
          <li><strong>Workload Distribution:</strong> Balance email load across team members</li>
        </ul>
        
        <h4>Customization Options:</h4>
        <ul>
          <li><strong>Date Ranges:</strong> Analyze specific time periods</li>
          <li><strong>Chart Types:</strong> Bar, line, pie, and area charts</li>
          <li><strong>Export Options:</strong> Download data in various formats</li>
          <li><strong>Real-time Updates:</strong> Live data refresh options</li>
        </ul>
      `,
      tags: ['analytics', 'dashboard', 'metrics', 'performance'],
      difficulty: 'intermediate',
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting Common Issues',
      category: 'getting-started',
      content: `
        <h3>Troubleshooting Common Email Issues</h3>
        <p>Quick solutions for common problems you might encounter:</p>
        
        <h4>Email Not Loading:</h4>
        <ul>
          <li><strong>Check Connection:</strong> Ensure you have a stable internet connection</li>
          <li><strong>Refresh Sync:</strong> Click "Send/Receive" in the ribbon to manually sync</li>
          <li><strong>Clear Cache:</strong> Try refreshing the page or clearing browser cache</li>
          <li><strong>Check Settings:</strong> Verify email account settings in the Settings modal</li>
        </ul>
        
        <h4>Multi-Selection Not Working:</h4>
        <ul>
          <li><strong>Use Correct Keys:</strong> Press Ctrl (Windows) or Cmd (Mac) while clicking</li>
          <li><strong>Check Selection State:</strong> Look for the green highlight on selected emails</li>
          <li><strong>Clear Previous Selection:</strong> Click "Clear" in the bulk actions toolbar</li>
          <li><strong>Try Range Selection:</strong> Use Shift+Click for selecting multiple consecutive emails</li>
        </ul>
        
        <h4>View Settings Not Saving:</h4>
        <ul>
          <li><strong>Check Permissions:</strong> Ensure the app has permission to save settings</li>
          <li><strong>Refresh Page:</strong> Try refreshing the page to reload settings</li>
          <li><strong>Clear Browser Data:</strong> Clear local storage and cookies</li>
          <li><strong>Contact Support:</strong> If issues persist, contact technical support</li>
        </ul>
        
        <h4>Rules Not Working:</h4>
        <ul>
          <li><strong>Check Rule Status:</strong> Ensure rules are enabled in the Rules modal</li>
          <li><strong>Verify Conditions:</strong> Double-check rule conditions match your emails</li>
          <li><strong>Test Rules:</strong> Use the "Test Rule" feature in the Rules modal</li>
          <li><strong>Check Logs:</strong> Review rule execution logs for errors</li>
        </ul>
        
        <h4>Performance Issues:</h4>
        <ul>
          <li><strong>Reduce Email Load:</strong> Archive old emails to improve performance</li>
          <li><strong>Use Compact View:</strong> Switch to Compact view for faster loading</li>
          <li><strong>Limit Search Results:</strong> Use specific search terms to reduce results</li>
          <li><strong>Clear Filters:</strong> Remove unnecessary filters that might slow down the interface</li>
        </ul>
      `,
      tags: ['troubleshooting', 'support', 'issues', 'problems', 'solutions'],
      difficulty: 'beginner',
    },
    {
      id: 'productivity-tips',
      title: 'Email Productivity Tips & Tricks',
      category: 'getting-started',
      content: `
        <h3>Email Productivity Tips & Tricks</h3>
        <p>Maximize your email efficiency with these proven strategies:</p>
        
        <h4>Time Management Strategies:</h4>
        <ul>
          <li><strong>Time Blocking:</strong> Set specific times for email processing (e.g., 9 AM, 2 PM, 5 PM)</li>
          <li><strong>Batch Processing:</strong> Handle similar emails together (replies, approvals, etc.)</li>
          <li><strong>2-Minute Rule:</strong> If an email takes less than 2 minutes to handle, do it immediately</li>
          <li><strong>Email-Free Hours:</strong> Designate certain hours as email-free for focused work</li>
        </ul>
        
        <h4>Quick Actions & Shortcuts:</h4>
        <ul>
          <li><strong>Keyboard Shortcuts:</strong> Learn and use keyboard shortcuts for faster navigation</li>
          <li><strong>Quick Filters:</strong> Use the filter buttons to quickly find specific email types</li>
          <li><strong>Bulk Operations:</strong> Use multi-selection for processing multiple emails at once</li>
          <li><strong>Template Responses:</strong> Create templates for common email responses</li>
        </ul>
        
        <h4>Organization Best Practices:</h4>
        <ul>
          <li><strong>Consistent Tagging:</strong> Use a consistent tagging system across all emails</li>
          <li><strong>Priority-Based Processing:</strong> Always handle critical emails first</li>
          <li><strong>Regular Cleanup:</strong> Archive or delete old emails weekly</li>
          <li><strong>Folder Structure:</strong> Create logical folder hierarchies for different projects/clients</li>
        </ul>
        
        <h4>AI-Powered Efficiency:</h4>
        <ul>
          <li><strong>Smart Categorization:</strong> Let AI automatically categorize incoming emails</li>
          <li><strong>Priority Detection:</strong> Use AI to identify urgent emails automatically</li>
          <li><strong>Response Suggestions:</strong> Leverage AI-generated response templates</li>
          <li><strong>Meeting Scheduling:</strong> Use AI to extract meeting requests and schedule automatically</li>
        </ul>
        
        <h4>Advanced Workflow Tips:</h4>
        <ul>
          <li><strong>Email Templates:</strong> Create templates for common scenarios (project updates, client communications)</li>
          <li><strong>Automated Rules:</strong> Set up rules to automatically sort and tag incoming emails</li>
          <li><strong>Follow-up System:</strong> Use tags and reminders to track follow-up requirements</li>
          <li><strong>Integration Workflows:</strong> Connect emails to your CRM and project management systems</li>
        </ul>
      `,
      tags: [
        'productivity',
        'tips',
        'efficiency',
        'time-management',
        'best-practices',
      ],
      difficulty: 'intermediate',
    },
  ];

  const categories = [
    {
      key: 'getting-started',
      label: 'Getting Started',
      icon: Book,
      color: 'text-blue-600',
    },
    {
      key: 'interface',
      label: 'Interface Guide',
      icon: Settings,
      color: 'text-green-600',
    },
    {
      key: 'automation',
      label: 'Automation',
      icon: Zap,
      color: 'text-purple-600',
    },
    {
      key: 'ai',
      label: 'AI Intelligence',
      icon: Brain,
      color: 'text-orange-600',
    },
    {
      key: 'integration',
      label: 'CRM Integration',
      icon: Users,
      color: 'text-red-600',
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      color: 'text-indigo-600',
    },
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      activeCategory === 'all' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-4'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Email Client Help
            </h2>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search help articles...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 flex overflow-hidden'>
          {/* Sidebar */}
          <div className='w-80 bg-gray-50 border-r border-gray-200 p-4'>
            {/* Categories */}
            <div className='mb-6'>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                Categories
              </h3>
              <div className='space-y-1'>
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-constructbms-blue text-black'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <Book className='w-4 h-4' />
                  <span className='font-medium'>All Articles</span>
                </button>
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.key}
                      onClick={() => setActiveCategory(category.key)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeCategory === category.key
                          ? 'bg-constructbms-blue text-black'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${category.color}`} />
                      <span className='font-medium'>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Results */}
            <div>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                Articles ({filteredArticles.length})
              </h3>
              <div className='space-y-2 max-h-96 overflow-y-auto'>
                {filteredArticles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedArticle?.id === article.id
                        ? 'border-constructbms-blue bg-constructbms-blue bg-opacity-10'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <h4 className='font-medium text-sm text-gray-900'>
                        {article.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(article.difficulty)}`}
                      >
                        {article.difficulty}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      {article.videoUrl && (
                        <Video className='w-3 h-3 text-blue-500' />
                      )}
                      <span className='text-xs text-gray-500'>
                        {
                          categories.find(c => c.key === article.category)
                            ?.label
                        }
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1 overflow-y-auto p-6'>
            {selectedArticle ? (
              <div className='max-w-4xl'>
                <div className='flex items-center justify-between mb-6'>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                      {selectedArticle.title}
                    </h2>
                    <div className='flex items-center space-x-4'>
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${getDifficultyColor(selectedArticle.difficulty)}`}
                      >
                        {selectedArticle.difficulty}
                      </span>
                      <span className='text-sm text-gray-500'>
                        {
                          categories.find(
                            c => c.key === selectedArticle.category
                          )?.label
                        }
                      </span>
                      {selectedArticle.videoUrl && (
                        <button
                          onClick={() => setShowVideo(true)}
                          className='flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800'
                        >
                          <Play className='w-4 h-4' />
                          <span>Watch Video</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className='prose max-w-none'>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedArticle.content,
                    }}
                  />
                </div>

                {selectedArticle.tags.length > 0 && (
                  <div className='mt-6 pt-6 border-t border-gray-200'>
                    <h4 className='text-sm font-medium text-gray-700 mb-2'>
                      Related Topics:
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {selectedArticle.tags.map(tag => (
                        <span
                          key={tag}
                          className='text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <HelpCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Welcome to Help Center
                  </h3>
                  <p className='text-gray-500 mb-4'>
                    Search for topics or browse categories to find the help you
                    need.
                  </p>
                  <div className='grid grid-cols-2 gap-4 max-w-md mx-auto'>
                    {categories.slice(0, 4).map(category => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.key}
                          onClick={() => setActiveCategory(category.key)}
                          className='flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          <Icon className={`w-5 h-5 ${category.color}`} />
                          <span className='text-sm font-medium'>
                            {category.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Modal */}
        {showVideo && selectedArticle?.videoUrl && (
          <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60'>
            <div className='bg-white rounded-lg p-6 max-w-4xl w-full mx-4'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold'>
                  {selectedArticle.title}
                </h3>
                <button
                  onClick={() => setShowVideo(false)}
                  className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
              <div className='bg-gray-900 rounded-lg aspect-video flex items-center justify-center'>
                <div className='text-center text-white'>
                  <Play className='w-16 h-16 mx-auto mb-4' />
                  <p>Video Tutorial</p>
                  <p className='text-sm text-gray-400'>
                    Video content would be embedded here
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailHelpModal;
