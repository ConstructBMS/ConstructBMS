import React, { useState, useEffect } from 'react';
import {
  Mail,
  User,
  Star,
  Archive,
  Trash,
  Reply,
  Forward,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  HelpCircle,
  Inbox,
  FileIcon,
  Paperclip,
  AlertTriangle,
  Target,
  Users,
  PoundSterling,
  Calendar,
  FileText,
  ChevronUp,
  ChevronDown,
  Archive as ArchiveIcon,
  Download,
  Tag,
  X,
  Brain,
  Zap,
} from 'lucide-react';
import OutlookRibbon from '../OutlookRibbon';
import EmailSettingsModal from '../email/EmailSettingsModal';
import EmailAnalyticsModal from '../email/EmailAnalyticsModal';
import EmailHelpModal from '../email/EmailHelpModal';
import AddressBookModal from '../email/AddressBookModal';
import RulesBuilder from '../email/RulesBuilder';
import EmailAIModal from '../email/EmailAIModal';
import WYSIWYGEditor from '../WYSIWYGEditor';
import { CalendarService } from '../../services/calendarService';
import { useEmail } from '../../contexts/EmailContext';

// Types
type EmailPriority = 'low' | 'medium' | 'high' | 'critical';
type EmailStatus = 'read' | 'unread' | 'assigned' | 'completed';
type EmailCategory =
  | 'project-related'
  | 'client-communication'
  | 'internal-team'
  | 'invoice-payment'
  | 'urgent-actionable'
  | 'meeting-scheduling'
  | 'document-review';

interface OldEmailMessage {
  attachments: Array<{ name: string; size: number 
}>;
  category: EmailCategory;
  content: string;
  id: string;
  isRead: boolean;
  priority: EmailPriority;
  sender: string;
  senderEmail: string;
  status: EmailStatus;
  subject: string;
  tags?: string[];
  timestamp: Date; // Added tags property
}

const EmailClient: React.FC = () => {
  // State
  const [emails, setEmails] = useState<OldEmailMessage[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectedEmail, setSelectedEmail] = useState<OldEmailMessage | null>(
    null
  );
  const [view, setView] = useState<
    'inbox' | 'starred' | 'sent' | 'drafts' | 'archive'
  >('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EmailCategory | 'all'>(
    'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<EmailPriority | 'all'>(
    'all'
  );
  const [statusFilter, setStatusFilter] = useState<EmailStatus | 'all'>('all');

  const [sortBy, setSortBy] = useState<
    'date' | 'sender' | 'subject' | 'priority'
  >('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentView, setCurrentView] = useState<
    'compact' | 'normal' | 'preview'
  >('normal');
  const [readingPanePosition, setReadingPanePosition] = useState<
    'right' | 'bottom' | 'off'
  >('right');
  const [zoomLevel, setZoomLevel] = useState(100);
  const { unreadCount, setUnreadCount } = useEmail();
  const [activeRibbonTab, setActiveRibbonTab] = useState('home');
  
  // Resizable pane state
  const [emailListWidth, setEmailListWidth] = useState(30); // percentage - enough for filters to sit comfortably
  const [isResizing, setIsResizing] = useState(false);
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [initialWidth, setInitialWidth] = useState(30);

  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showEmailAI, setShowEmailAI] = useState(false);
  const [availableTags, setAvailableTags] = useState([
    'Urgent',
    'Follow-up',
    'Client',
    'Project',
    'Invoice',
    'Meeting',
    'Review',
    'Approval',
  ]);

  // Compose data
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: '',
    attachments: [] as any[],
    template: '',
    scheduledAt: null as Date | null,
  });

  // Load emails from data source
  useEffect(() => {
    const loadEmails = async () => {
      try {
        // For now, return empty array since email tables don't exist
        setEmails([]);
        setUnreadCount(0);
      } catch (error) {
        console.error('Error loading emails:', error);
        setEmails([]);
        setUnreadCount(0);
      }
    };

    loadEmails();
  }, []);

  // Filtered emails
  const filteredEmails = emails
    .filter(email => {
      if (
        searchTerm &&
        !email.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !email.sender.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !email.content.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (categoryFilter !== 'all' && email.category !== categoryFilter)
        return false;
      if (priorityFilter !== 'all' && email.priority !== priorityFilter)
        return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'unread' && email.isRead) return false;
        if (statusFilter === 'read' && !email.isRead) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = b.timestamp.getTime() - a.timestamp.getTime();
          break;
        case 'sender':
          comparison = a.sender.localeCompare(b.sender);
          break;
        case 'subject':
          comparison = a.subject.localeCompare(b.subject);
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

  // Optimized click handler for smooth multi-selection
  const handleEmailClick = (
    email: OldEmailMessage,
    event: React.MouseEvent
  ) => {
    // Prevent any default browser behavior
    event.preventDefault();
    event.stopPropagation();

    if (event.ctrlKey || event.metaKey) {
      // Multi-select - toggle selection
      setSelectedEmails(prev => {
        const newSet = new Set(prev);
        if (newSet.has(email.id)) {
          newSet.delete(email.id);
        } else {
          newSet.add(email.id);
        }
        return newSet;
      });
    } else if (event.shiftKey && selectedEmail) {
      // Range select
      const currentIndex = filteredEmails.findIndex(e => e.id === email.id);
      const lastIndex = filteredEmails.findIndex(
        e => e.id === selectedEmail.id
      );
      const start = Math.min(currentIndex, lastIndex);
      const end = Math.max(currentIndex, lastIndex);
      const rangeEmails = filteredEmails.slice(start, end + 1);
      setSelectedEmails(new Set(rangeEmails.map(e => e.id)));
    } else {
      // Single select
      setSelectedEmail(email);
      setSelectedEmails(new Set([email.id]));
      // Mark as read immediately for better UX
      if (!email.isRead) {
        handleMarkAsRead(email.id);
      }
    }
  };

  const handleSelectAll = () => {
    setSelectedEmails(new Set(filteredEmails.map(email => email.id)));
  };

  const handleClearSelection = () => {
    setSelectedEmails(new Set());
  };

  // Email actions
  const handleMarkAsRead = (emailId: string) => {
    setEmails(prev =>
      prev.map(email =>
        email.id === emailId ? { ...email, isRead: true } : email
      )
    );
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleMarkAsUnread = (emailId: string) => {
    setEmails(prev =>
      prev.map(email =>
        email.id === emailId ? { ...email, isRead: false } : email
      )
    );
    setUnreadCount(unreadCount + 1);
  };

  const handleDelete = (emailId: string) => {
    setEmails(prev => prev.filter(email => email.id !== emailId));
    setSelectedEmails(prev => {
      const newSet = new Set(prev);
      newSet.delete(emailId);
      return newSet;
    });
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const handleReply = (email: OldEmailMessage) => {
    setComposeData({
      to: email.senderEmail,
      cc: '',
      bcc: '',
      subject: `Re: ${email.subject}`,
      content: `\n\n--- Original Message ---\nFrom: ${email.sender}\nDate: ${email.timestamp.toLocaleString()}\nSubject: ${email.subject}\n\n${email.content}`,
      attachments: [],
      template: '',
      scheduledAt: null,
    });
    setComposeOpen(true);
  };

  const handleForward = (email: OldEmailMessage) => {
    setComposeData({
      to: '',
      cc: '',
      bcc: '',
      subject: `Fwd: ${email.subject}`,
      content: `\n\n--- Forwarded Message ---\nFrom: ${email.sender}\nDate: ${email.timestamp.toLocaleString()}\nSubject: ${email.subject}\n\n${email.content}`,
      attachments: email.attachments,
      template: '',
      scheduledAt: null,
    });
    setComposeOpen(true);
  };

  // Bulk actions
  const handleBulkMarkAsRead = () => {
    setEmails(prev =>
      prev.map(email =>
        selectedEmails.has(email.id) ? { ...email, isRead: true } : email
      )
    );
    setUnreadCount(Math.max(0, unreadCount - selectedEmails.size));
    setSelectedEmails(new Set());
  };

  const handleBulkMarkAsUnread = () => {
    setEmails(prev =>
      prev.map(email =>
        selectedEmails.has(email.id) ? { ...email, isRead: false } : email
      )
    );
    setUnreadCount(unreadCount + selectedEmails.size);
    setSelectedEmails(new Set());
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedEmails.size} email(s)?`
      )
    ) {
      setEmails(prev => prev.filter(email => !selectedEmails.has(email.id)));
      setSelectedEmails(new Set());
      if (selectedEmail && selectedEmails.has(selectedEmail.id)) {
        setSelectedEmail(null);
      }
    }
  };

  const handleBulkArchive = () => {
    if (
      confirm(
        `Are you sure you want to archive ${selectedEmails.size} email(s)?`
      )
    ) {
      setEmails(prev => prev.filter(email => !selectedEmails.has(email.id)));
      setSelectedEmails(new Set());
      if (selectedEmail && selectedEmails.has(selectedEmail.id)) {
        setSelectedEmail(null);
      }
    }
  };

  const handleSingleArchive = (emailId: string) => {
    if (confirm('Are you sure you want to archive this email?')) {
      setEmails(prev => prev.filter(email => email.id !== emailId));
      setSelectedEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(emailId);
        return newSet;
      });
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    }
  };

  // Meeting functionality
  const handleCreateMeeting = (formData: any) => {
    // TODO: Implement calendar event creation
    // For now, just show a success message
    const eventTitle = formData.title || 'New Meeting';
    
    setShowMeetingModal(false);
    alert(`Meeting "${eventTitle}" created successfully! (Calendar integration coming soon)`);
  };

  // Tags functionality
  const handleAddTag = (emailId: string, tag: string) => {
    setEmails(prev =>
      prev.map(email =>
        email.id === emailId
          ? { ...email, tags: [...(email.tags || []), tag] }
          : email
      )
    );
  };

  const handleRemoveTag = (emailId: string, tagToRemove: string) => {
    setEmails(prev =>
      prev.map(email =>
        email.id === emailId
          ? {
              ...email,
              tags: (email.tags || []).filter(tag => tag !== tagToRemove),
            }
          : email
      )
    );
  };

  // Save attachments functionality
  const handleSaveAttachments = () => {
    if (selectedEmail && selectedEmail.attachments.length > 0) {
      selectedEmail.attachments.forEach(attachment => {
        // Create a download link for each attachment
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${btoa(attachment.name)}`;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      alert(`Downloaded ${selectedEmail.attachments.length} attachment(s)`);
    } else if (selectedEmails.size > 0) {
      // Bulk download for multiple selected emails
      let totalAttachments = 0;
      emails.forEach(email => {
        if (selectedEmails.has(email.id)) {
          totalAttachments += email.attachments.length;
        }
      });
      alert(
        `Preparing to download ${totalAttachments} attachment(s) from selected emails`
      );
    } else {
      alert('No attachments to save. Please select an email with attachments.');
    }
  };

  // Utility functions
  const getPriorityColor = (priority: EmailPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
      case 'medium':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
      case 'low':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  const getCategoryIcon = (category: EmailCategory) => {
    switch (category) {
      case 'project-related':
        return <Target className='w-3 h-3 text-purple-500' />;
      case 'client-communication':
        return <User className='w-3 h-3 text-green-500' />;
      case 'internal-team':
        return <Users className='w-3 h-3 text-blue-500' />;
      case 'invoice-payment':
        return <PoundSterling className='w-3 h-3 text-yellow-500' />;
      case 'urgent-actionable':
        return <AlertTriangle className='w-3 h-3 text-red-500' />;
      case 'meeting-scheduling':
        return <Calendar className='w-3 h-3 text-red-500' />;
      case 'document-review':
        return <FileText className='w-3 h-3 text-blue-500' />;
      default:
        return <Mail className='w-3 h-3 text-gray-500' />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setInitialMouseX(e.clientX);
    setInitialWidth(emailListWidth);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const container = document.querySelector('.email-container') as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    // Calculate width as percentage of the available space (excluding the folder pane)
    const folderPaneWidth = 256; // w-64 = 16rem = 256px
    const availableWidth = containerRect.width - folderPaneWidth;
    
    // Calculate the mouse movement delta
    const mouseDelta = e.clientX - initialMouseX;
    const widthDelta = (mouseDelta / availableWidth) * 100;
    const newWidth = initialWidth + widthDelta;
    
    // Limit the width between 20% and 80%
    const clampedWidth = Math.max(20, Math.min(80, newWidth));
    setEmailListWidth(clampedWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div className='h-screen flex flex-col bg-gray-50'>
      {/* Top Utility Toolbar */}
      <div className='w-full bg-white border-b border-gray-200 flex items-center justify-end px-4 py-1 space-x-2'>
        <button
          onClick={() => setShowRulesModal(true)}
          className='flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-100 text-gray-700'
          title='Rules & Automations'
        >
          <Zap className='w-5 h-5' />
          <span className='text-sm'>Rules & Automations</span>
        </button>
        <button
          onClick={() => setShowEmailAI(true)}
          className='flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-100 text-gray-700'
          title='Email AI'
        >
          <Brain className='w-5 h-5' />
          <span className='text-sm'>Email AI</span>
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className='flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-100 text-gray-700'
          title='Settings'
        >
          <Settings className='w-5 h-5' />
          <span className='text-sm'>Settings</span>
        </button>
        <button
          onClick={() => setShowAnalytics(true)}
          className='flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-100 text-gray-700'
          title='Analytics'
        >
          <BarChart3 className='w-5 h-5' />
          <span className='text-sm'>Analytics</span>
        </button>
        <button
          onClick={() => setShowHelp(true)}
          className='flex items-center space-x-1 px-3 py-1 rounded hover:bg-gray-100 text-gray-700'
          title='Help'
        >
          <HelpCircle className='w-5 h-5' />
          <span className='text-sm'>Help</span>
        </button>
      </div>

      {/* Outlook-Style Ribbon Toolbar */}
      <OutlookRibbon
        activeTab={activeRibbonTab}
        onTabChange={setActiveRibbonTab}
        onNewEmail={() => {
          setComposeData({
            to: '',
            cc: '',
            bcc: '',
            subject: '',
            content: '',
            attachments: [],
            template: '',
            scheduledAt: null,
          });
          setComposeOpen(true);
        }}
        onNewMeeting={() => {
          setShowMeetingModal(true);
        }}
        onDelete={
          selectedEmails.size > 1
            ? handleBulkDelete
            : () => selectedEmail && handleDelete(selectedEmail.id)
        }
        onArchive={
          selectedEmails.size > 1
            ? handleBulkArchive
            : () => selectedEmail && handleSingleArchive(selectedEmail.id)
        }
        onReply={() => selectedEmail && handleReply(selectedEmail)}
        onReplyAll={() => selectedEmail && handleReply(selectedEmail)}
        onForward={() => selectedEmail && handleForward(selectedEmail)}
        onRules={() => {
          setShowRulesModal(true);
        }}
        onTag={() => {
          setShowTagsModal(true);
        }}
        onAddressBook={() => setShowAddressBook(true)}
        onFilterEmail={() => {
          console.log('Filter Email clicked');
          // You can add filter functionality here
        }}
        onSearch={term => setSearchTerm(term)}
        onSaveAttachments={handleSaveAttachments}
        onSendReceive={() => {
          console.log('Send/Receive clicked');
          // You can add sync functionality here
        }}
        onSendReceiveAll={() => {
          console.log('Send/Receive All clicked');
          // You can add sync all functionality here
        }}
        onCreateFolder={() => {
          console.log('Create Folder clicked');
          // You can add folder creation functionality here
        }}
        onRenameFolder={() => {
          console.log('Rename Folder clicked');
          // You can add folder rename functionality here
        }}
        onDeleteFolder={() => {
          console.log('Delete Folder clicked');
          // You can add folder deletion functionality here
        }}
        onEmptyFolder={() => {
          console.log('Empty Folder clicked');
          // You can add folder emptying functionality here
        }}
        onFolderProperties={() => {
          console.log('Folder Properties clicked');
          // You can add folder properties functionality here
        }}
        onViewSettings={() => setShowSettings(true)}
        onChangeView={view =>
          setCurrentView(view as 'compact' | 'normal' | 'preview')
        }
        onSortBy={field => {
          console.log('Sort by:', field);
          setSortBy(field as any);
        }}
        onGroupBy={() => {
          console.log('Group by clicked');
          // You can add grouping functionality here
        }}
        onFilterBy={filter => {
          console.log('Filter by:', filter);
          switch (filter) {
            case 'unread':
              // Toggle between unread and all status
              setStatusFilter(prev => (prev === 'unread' ? 'all' : 'unread'));
              break;
            case 'flagged':
              // You can add flagged filter functionality here
              console.log('Filtering by flagged emails');
              break;
            default:
              setStatusFilter('all');
          }
        }}
        onReadingPane={position =>
          setReadingPanePosition(position as 'right' | 'bottom' | 'off')
        }
        onZoom={setZoomLevel}
        onHelp={() => setShowHelp(true)}
        currentView={currentView}
        currentReadingPane={readingPanePosition}
        currentZoom={zoomLevel}
        currentSortBy={sortBy}
      />

      {/* Main Content */}
      <div
        className='flex-1 flex overflow-hidden email-container'
        style={{ zoom: zoomLevel / 100 }}
      >
        {/* Left Pane - Folders */}
        <div className='w-64 bg-white border-r border-gray-200 flex flex-col'>
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-constructbms-blue rounded-full flex items-center justify-center'>
                <User className='w-4 h-4 text-black' />
              </div>
              <div>
                <p className='font-medium text-sm'>John Doe</p>
                <p className='text-xs text-gray-500'>john@constructbms.com</p>
              </div>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-2'>
            <div className='space-y-1'>
              <button
                onClick={() => setView('inbox')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  view === 'inbox'
                    ? 'bg-constructbms-blue text-black'
                    : 'hover:bg-gray-100'
                }`}
                title='Inbox'
              >
                <Inbox className='w-4 h-4' />
                <span className='font-medium'>Inbox</span>
                <span className='ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full'>
                  {unreadCount}
                </span>
              </button>

              <button
                onClick={() => setView('starred')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  view === 'starred'
                    ? 'bg-constructbms-blue text-black'
                    : 'hover:bg-gray-100'
                }`}
                title='Starred'
              >
                <Star className='w-4 h-4' />
                <span className='font-medium'>Starred</span>
              </button>

              <button
                onClick={() => setView('sent')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  view === 'sent'
                    ? 'bg-constructbms-blue text-black'
                    : 'hover:bg-gray-100'
                }`}
                title='Sent'
              >
                <Mail className='w-4 h-4' />
                <span className='font-medium'>Sent</span>
              </button>

              <button
                onClick={() => setView('drafts')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  view === 'drafts'
                    ? 'bg-constructbms-blue text-black'
                    : 'hover:bg-gray-100'
                }`}
                title='Drafts'
              >
                <FileIcon className='w-4 h-4' />
                <span className='font-medium'>Drafts</span>
              </button>

              <button
                onClick={() => setView('archive')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  view === 'archive'
                    ? 'bg-constructbms-blue text-black'
                    : 'hover:bg-gray-100'
                }`}
                title='Archive'
              >
                <ArchiveIcon className='w-4 h-4' />
                <span className='font-medium'>Archive</span>
              </button>
            </div>

            {/* Categories */}
            <div className='mt-6'>
              <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2'>
                Categories
              </h3>
              <div className='space-y-1'>
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-constructbms-blue text-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className='w-4 h-4 bg-gray-400 rounded-full'></div>
                  <span className='text-sm'>All Categories</span>
                </button>
                {[
                  'project-related',
                  'client-communication',
                  'internal-team',
                  'invoice-payment',
                  'urgent-actionable',
                ].map(category => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category as EmailCategory)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      categoryFilter === category
                        ? 'bg-constructbms-blue text-black'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {getCategoryIcon(category as EmailCategory)}
                    <span className='text-sm capitalize'>
                      {category.replace('-', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Pane - Email List */}
        <div 
          className='flex flex-col'
          style={{ 
            width: `${emailListWidth}%`,
            minWidth: '200px',
            maxWidth: '80%',
            flexShrink: 0,
            flexGrow: 0
          }}
        >
          {/* Email List Header */}
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='font-semibold text-gray-900 capitalize'>{view}</h2>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedEmails.size > 1 && (
              <div className='flex items-center justify-between p-2 bg-constructbms-blue/5 border border-constructbms-blue/20 rounded-md mb-3'>
                <div className='flex items-center space-x-3'>
                  <span className='text-sm font-medium text-constructbms-black flex items-center'>
                    <div className='w-2 h-2 bg-constructbms-blue rounded-full mr-2'></div>
                    {selectedEmails.size} selected
                  </span>
                  <div className='flex items-center space-x-1'>
                    <button
                      onClick={handleBulkMarkAsRead}
                      className='flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-constructbms-black hover:bg-constructbms-blue/10 rounded transition-colors'
                      title='Mark as Read'
                    >
                      <Eye className='w-3 h-3' />
                      <span>Read</span>
                    </button>
                    <button
                      onClick={handleBulkMarkAsUnread}
                      className='flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-constructbms-black hover:bg-constructbms-blue/10 rounded transition-colors'
                      title='Mark as Unread'
                    >
                      <EyeOff className='w-3 h-3' />
                      <span>Unread</span>
                    </button>
                    <button
                      onClick={handleBulkArchive}
                      className='flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-constructbms-black hover:bg-constructbms-blue/10 rounded transition-colors'
                      title='Archive'
                    >
                      <Archive className='w-3 h-3' />
                      <span>Archive</span>
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className='flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors'
                      title='Delete'
                    >
                      <Trash className='w-3 h-3' />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={handleSelectAll}
                    className='text-xs text-constructbms-blue hover:text-constructbms-black font-medium'
                    title='Select All'
                  >
                    Select All
                  </button>
                  <span className='text-gray-300'>|</span>
                  <button
                    onClick={handleClearSelection}
                    className='text-xs text-gray-500 hover:text-gray-700'
                    title='Clear Selection'
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Quick Filters */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 flex-wrap'>
                <select
                  value={priorityFilter}
                  onChange={e =>
                    setPriorityFilter(e.target.value as EmailPriority | 'all')
                  }
                  className='text-xs border border-gray-300 rounded px-2 py-1.5 min-w-[90px] max-w-[110px]'
                >
                  <option value='all'>All Priorities</option>
                  <option value='critical'>Critical</option>
                  <option value='high'>High</option>
                  <option value='medium'>Medium</option>
                  <option value='low'>Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e =>
                    setStatusFilter(e.target.value as EmailStatus | 'all')
                  }
                  className='text-xs border border-gray-300 rounded px-2 py-1.5 min-w-[90px] max-w-[110px]'
                >
                  <option value='all'>All Status</option>
                  <option value='unread'>Unread</option>
                  <option value='read'>Read</option>
                  <option value='assigned'>Assigned</option>
                  <option value='completed'>Completed</option>
                </select>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className='text-xs border border-gray-300 rounded px-2 py-1.5 min-w-[90px] max-w-[110px]'
                >
                  <option value='date'>Sort by Date</option>
                  <option value='sender'>Sort by Sender</option>
                  <option value='subject'>Sort by Subject</option>
                  <option value='priority'>Sort by Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className='flex-1 overflow-y-auto'>
            {filteredEmails.map(email => (
              <div
                key={email.id}
                onClick={e => handleEmailClick(email, e)}
                className={`group border-b cursor-pointer transition-colors duration-150 ${
                  selectedEmails.has(email.id)
                    ? 'bg-constructbms-blue/30 border-l-4 border-l-constructbms-blue'
                    : 'hover:bg-constructbms-blue/10'
                } ${currentView === 'compact' ? 'p-2' : 'p-4'}`}
              >
                {currentView === 'compact' ? (
                  // Compact View
                  <div className='flex items-center space-x-2'>
                    <div className='flex-shrink-0 relative'>
                      <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center'>
                        <User className='w-3 h-3 text-gray-600' />
                      </div>
                      {!email.isRead && (
                        <div className='absolute -top-1 -right-1 w-2 h-2 bg-constructbms-blue rounded-full'></div>
                      )}
                    </div>

                    <div className='flex-1 min-w-0 flex items-center space-x-4'>
                      <p
                        className={`text-xs ${!email.isRead ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'} w-24 truncate`}
                      >
                        {email.sender}
                      </p>
                      <p
                        className={`text-xs truncate flex-1 ${!email.isRead ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}
                      >
                        {email.subject}
                      </p>
                      <div className='flex items-center space-x-1'>
                        {email.priority === 'critical' && (
                          <AlertTriangle className='w-3 h-3 text-red-500' />
                        )}
                        {email.attachments.length > 0 && (
                          <Paperclip className='w-3 h-3 text-gray-400' />
                        )}
                        <span
                          className={`text-xs ${!email.isRead ? 'font-semibold text-gray-700' : 'text-gray-500'}`}
                        >
                          {formatDate(email.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal/Preview View
                  <div className='flex flex-col space-y-2'>
                    <div className='flex items-start space-x-3'>
                      <div className='flex-shrink-0 relative'>
                        <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center'>
                          <User className='w-4 h-4 text-gray-600' />
                        </div>
                        {!email.isRead && (
                          <div className='absolute -top-1 -right-1 w-3 h-3 bg-constructbms-blue rounded-full'></div>
                        )}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <p
                            className={`text-sm ${!email.isRead ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}
                          >
                            {email.sender}
                          </p>
                          <div className='flex items-center space-x-1'>
                            {email.priority === 'critical' && (
                              <AlertTriangle className='w-3 h-3 text-red-500' />
                            )}
                            <span
                              className={`text-xs ${!email.isRead ? 'font-semibold text-gray-700' : 'text-gray-500'}`}
                            >
                              {formatDate(email.timestamp)}
                            </span>
                          </div>
                        </div>

                        <p
                          className={`text-sm truncate ${!email.isRead ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}
                        >
                          {email.subject}
                        </p>

                        {currentView === 'preview' && (
                          <p
                            className={`text-xs truncate ${!email.isRead ? 'font-medium text-gray-700' : 'text-gray-500'}`}
                          >
                            {email.content.substring(0, 120)}...
                          </p>
                        )}

                        <div className='flex items-center space-x-2 mt-2'>
                          <span
                            className={`text-xs px-2 py-1 rounded border ${getPriorityColor(email.priority)}`}
                          >
                            {email.priority}
                          </span>
                          {getCategoryIcon(email.category)}
                          {email.attachments.length > 0 && (
                            <Paperclip className='w-3 h-3 text-gray-400' />
                          )}
                          {email.tags && email.tags.length > 0 && (
                            <div className='flex flex-wrap gap-1'>
                              {email.tags.slice(0, 2).map(tag => (
                                <span
                                  key={tag}
                                  className='text-xs px-1.5 py-0.5 bg-constructbms-blue/20 text-constructbms-black rounded border border-constructbms-blue/30'
                                >
                                  {tag}
                                </span>
                              ))}
                              {email.tags.length > 2 && (
                                <span className='text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded'>
                                  +{email.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Icons - Now at the bottom */}
                    <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleReply(email);
                        }}
                        className='p-1 hover:bg-gray-200 rounded transition-colors'
                        title='Reply'
                      >
                        <Reply className='w-3 h-3 text-gray-600' />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleForward(email);
                        }}
                        className='p-1 hover:bg-gray-200 rounded transition-colors'
                        title='Forward'
                      >
                        <Forward className='w-3 h-3 text-gray-600' />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (email.isRead) {
                            handleMarkAsUnread(email.id);
                          } else {
                            handleMarkAsRead(email.id);
                          }
                        }}
                        className='p-1 hover:bg-gray-200 rounded transition-colors'
                        title={email.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        {email.isRead ? (
                          <EyeOff className='w-3 h-3 text-gray-600' />
                        ) : (
                          <Eye className='w-3 h-3 text-gray-600' />
                        )}
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(email.id);
                        }}
                        className='p-1 hover:bg-gray-200 rounded transition-colors'
                        title='Delete'
                      >
                        <Trash className='w-3 h-3 text-gray-600' />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resizable Divider */}
        {readingPanePosition === 'right' && (
          <div
            className='w-1 bg-gray-300 hover:bg-constructbms-blue cursor-col-resize transition-colors relative'
            onMouseDown={handleMouseDown}
          >
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-0.5 h-8 bg-gray-400 rounded-full'></div>
            </div>
          </div>
        )}

        {/* Right Pane - Email Content */}
        <div
          className={`${readingPanePosition === 'off' ? 'hidden' : readingPanePosition === 'bottom' ? 'w-full h-64' : 'flex-1'} border-l border-gray-200 flex flex-col`}
        >
          {selectedEmail ? (
            <div className='flex-1 overflow-y-auto'>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    {selectedEmail.subject}
                  </h2>
                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() => handleReply(selectedEmail)}
                      className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                      title='Reply'
                    >
                      <Reply className='w-4 h-4 text-gray-600' />
                    </button>
                    <button
                      onClick={() => handleForward(selectedEmail)}
                      className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                      title='Forward'
                    >
                      <Forward className='w-4 h-4 text-gray-600' />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedEmail.id)}
                      className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                      title='Delete'
                    >
                      <Trash className='w-4 h-4 text-gray-600' />
                    </button>
                  </div>
                </div>

                <div className='mb-4 p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center'>
                        <User className='w-4 h-4 text-gray-600' />
                      </div>
                      <div>
                        <p className='font-medium text-gray-900'>
                          {selectedEmail.sender}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {selectedEmail.senderEmail}
                        </p>
                      </div>
                    </div>
                    <div className='text-sm text-gray-500'>
                      {selectedEmail.timestamp.toLocaleString()}
                    </div>
                  </div>

                  {selectedEmail.attachments.length > 0 && (
                    <div className='mt-3 pt-3 border-t border-gray-200'>
                      <p className='text-sm font-medium text-gray-700 mb-2'>
                        Attachments:
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {selectedEmail.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className='flex items-center space-x-2 p-2 bg-white rounded border'
                          >
                            <FileIcon className='w-4 h-4 text-gray-500' />
                            <span className='text-sm text-gray-700'>
                              {attachment.name}
                            </span>
                            <span className='text-xs text-gray-500'>
                              ({(attachment.size / 1024).toFixed(1)} KB)
                            </span>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = `data:application/octet-stream;base64,${btoa(attachment.name)}`;
                                link.download = attachment.name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className='text-constructbms-blue hover:text-constructbms-black text-sm font-medium'
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEmail.tags && selectedEmail.tags.length > 0 && (
                    <div className='mt-3 pt-3 border-t border-gray-200'>
                      <p className='text-sm font-medium text-gray-700 mb-2'>
                        Tags:
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {selectedEmail.tags.map(tag => (
                          <span
                            key={tag}
                            className='px-2 py-1 bg-constructbms-blue/20 text-constructbms-black rounded-full text-sm border border-constructbms-blue/30'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className='prose max-w-none'>
                  <p className='text-gray-700 leading-relaxed'>
                    {selectedEmail.content}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex-1 flex items-center justify-center text-gray-400'>
              <div className='text-center'>
                <Mail className='w-16 h-16 mx-auto mb-4 opacity-50' />
                <p className='text-lg font-medium'>Select an email to view</p>
                <p className='text-sm'>
                  Choose an email from the list to read its contents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EmailSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <EmailAnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
      <EmailHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <AddressBookModal
        isOpen={showAddressBook}
        onClose={() => setShowAddressBook(false)}
        onSelectContact={() => {}}
        onInsertToField={() => {}}
      />

      {/* Compose Modal */}
      {composeOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden'>
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2 className='text-xl font-semibold'>New Message</h2>
              <button
                onClick={() => setComposeOpen(false)}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <span className='text-xl'>&times;</span>
              </button>
            </div>

            <div className='p-6 space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    To
                  </label>
                  <input
                    type='text'
                    placeholder='Enter email addresses'
                    value={composeData.to}
                    onChange={e =>
                      setComposeData({ ...composeData, to: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    CC
                  </label>
                  <input
                    type='text'
                    placeholder='CC recipients'
                    value={composeData.cc}
                    onChange={e =>
                      setComposeData({ ...composeData, cc: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    BCC
                  </label>
                  <input
                    type='text'
                    placeholder='BCC recipients'
                    value={composeData.bcc}
                    onChange={e =>
                      setComposeData({ ...composeData, bcc: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Subject
                </label>
                <input
                  type='text'
                  placeholder='Enter subject'
                  value={composeData.subject}
                  onChange={e =>
                    setComposeData({ ...composeData, subject: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Message
                </label>
                <WYSIWYGEditor
                  content={composeData.content}
                  onChange={content =>
                    setComposeData({ ...composeData, content })
                  }
                  placeholder='Enter your message...'
                  className='min-h-[400px]'
                />
              </div>
            </div>

            <div className='flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50'>
              <div className='flex space-x-2'>
                <button className='px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'>
                  Save Draft
                </button>
                <button className='px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'>
                  Schedule
                </button>
              </div>

              <div className='flex space-x-2'>
                <button
                  onClick={() => setComposeOpen(false)}
                  className='px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setComposeOpen(false);
                  }}
                  className='px-6 py-2 text-sm bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors'
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-md p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold'>Schedule Meeting</h2>
              <button
                onClick={() => setShowMeetingModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateMeeting({
                  title: formData.get('title') as string,
                  date: formData.get('date') as string,
                  time: formData.get('time') as string,
                  duration: formData.get('duration') as string,
                  description: formData.get('description') as string,
                });
              }}
            >
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Meeting Title
                  </label>
                  <input
                    name='title'
                    type='text'
                    defaultValue={
                      selectedEmail?.subject
                        ? `Meeting: ${selectedEmail.subject}`
                        : ''
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                    placeholder='Enter meeting title'
                    required
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Date
                    </label>
                    <input
                      name='date'
                      type='date'
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Time
                    </label>
                    <input
                      name='time'
                      type='time'
                      defaultValue='09:00'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Duration (minutes)
                  </label>
                  <select
                    name='duration'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                  >
                    <option value='30'>30 minutes</option>
                    <option value='60' selected>
                      1 hour
                    </option>
                    <option value='90'>1.5 hours</option>
                    <option value='120'>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Description
                  </label>
                  <textarea
                    name='description'
                    defaultValue={
                      selectedEmail?.content
                        ? `Meeting based on email: ${selectedEmail.content.substring(0, 200)}...`
                        : ''
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                    rows={3}
                    placeholder='Meeting description'
                  />
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  type='button'
                  onClick={() => setShowMeetingModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2 bg-constructbms-blue text-black font-semibold rounded-lg hover:bg-constructbms-black hover:text-white transition-colors'
                >
                  Create Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tags Modal */}
      {showTagsModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-xl shadow-2xl w-full max-w-md p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold'>Manage Tags</h2>
              <button
                onClick={() => setShowTagsModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Available Tags
                </label>
                <div className='flex flex-wrap gap-2'>
                  {availableTags.map(tag => (
                    <span
                      key={tag}
                      className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {selectedEmail && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email Tags
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {(selectedEmail.tags || []).map(tag => (
                      <span
                        key={tag}
                        className='px-3 py-1 bg-constructbms-blue text-black rounded-full text-sm flex items-center gap-1'
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(selectedEmail.id, tag)}
                          className='hover:text-red-600'
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Add New Tag
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                    placeholder='Enter new tag'
                    onKeyPress={e => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const newTag = e.currentTarget.value.trim();
                        if (!availableTags.includes(newTag)) {
                          setAvailableTags(prev => [...prev, newTag]);
                        }
                        if (selectedEmail) {
                          handleAddTag(selectedEmail.id, newTag);
                        }
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={e => {
                      const input = e.currentTarget
                        .previousElementSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        const newTag = input.value.trim();
                        if (!availableTags.includes(newTag)) {
                          setAvailableTags(prev => [...prev, newTag]);
                        }
                        if (selectedEmail) {
                          handleAddTag(selectedEmail.id, newTag);
                        }
                        input.value = '';
                      }
                    }}
                    className='px-4 py-2 bg-constructbms-blue text-black font-semibold rounded-lg hover:bg-constructbms-black hover:text-white transition-colors'
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className='flex justify-end mt-6'>
              <button
                onClick={() => setShowTagsModal(false)}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <RulesBuilder
          isOpen={showRulesModal}
          onClose={() => setShowRulesModal(false)}
        />
      )}

      {/* Email AI Modal */}
      <EmailAIModal
        isOpen={showEmailAI}
        onClose={() => setShowEmailAI(false)}
        selectedEmail={selectedEmail}
      />
    </div>
  );
};

export default EmailClient;
