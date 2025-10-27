import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Edit,
  Filter,
  Flag,
  Folder,
  Inbox,
  Mail,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  Settings,
  Star,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useEmailStore } from '../../app/store/email.store';
import { Email, EmailFolder } from '../../lib/types/email';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { EmailList } from '../../components/email/EmailList';
import { EmailSearch } from '../../components/email/EmailSearch';
import { EmailCompose } from './EmailCompose';
import { EmailReadingPane } from './EmailReadingPane';

const folderIcons: Record<EmailFolder, React.ComponentType<{ className?: string }>> = {
  inbox: Inbox,
  sent: Send,
  drafts: Edit,
  trash: Trash2,
  spam: Flag,
  archive: Archive,
  important: Star,
  flagged: Flag,
};

const folderLabels: Record<EmailFolder, string> = {
  inbox: 'Inbox',
  sent: 'Sent Items',
  drafts: 'Drafts',
  trash: 'Deleted Items',
  spam: 'Junk Email',
  archive: 'Archive',
  important: 'Important',
  flagged: 'Flagged Items',
};

export function EmailClient() {
  const {
    currentFolder,
    setCurrentFolder,
    getFilteredEmails,
    getUnreadCount,
    searchQuery,
    setSearchQuery,
    selectedEmails,
    setSelectedEmails,
  } = useEmailStore();

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [composeMode, setComposeMode] = useState<'new' | 'reply' | 'forward'>('new');
  const [replyToEmail, setReplyToEmail] = useState<Email | null>(null);

  const filteredEmails = getFilteredEmails();
  const unreadCounts = {
    inbox: getUnreadCount('inbox'),
    sent: getUnreadCount('sent'),
    drafts: getUnreadCount('drafts'),
    trash: getUnreadCount('trash'),
    spam: getUnreadCount('spam'),
    archive: getUnreadCount('archive'),
    important: getUnreadCount('important'),
    flagged: getUnreadCount('flagged'),
  };

  const handleComposeNew = () => {
    setComposeMode('new');
    setReplyToEmail(null);
    setShowCompose(true);
  };

  const handleReply = (email: Email) => {
    setComposeMode('reply');
    setReplyToEmail(email);
    setShowCompose(true);
  };

  const handleForward = (email: Email) => {
    setComposeMode('forward');
    setReplyToEmail(email);
    setShowCompose(true);
  };

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleCloseCompose = () => {
    setShowCompose(false);
    setReplyToEmail(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Folders */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Email
            </h1>
            <Button
              size="sm"
              onClick={handleComposeNew}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search mail"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            {Object.entries(folderLabels).map(([folder, label]) => {
              const Icon = folderIcons[folder as EmailFolder];
              const isActive = currentFolder === folder;
              const unreadCount = unreadCounts[folder as EmailFolder];

              return (
                <button
                  key={folder}
                  onClick={() => setCurrentFolder(folder as EmailFolder)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <Button variant="ghost" size="sm">
                <Flag className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Star className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Panel */}
        {showSearch && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <EmailSearch onClose={() => setShowSearch(false)} />
          </div>
        )}

        {/* Email List and Reading Pane */}
        <div className="flex-1 flex">
          {/* Email List */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
            <EmailList
              emails={filteredEmails}
              onEmailSelect={handleEmailSelect}
              selectedEmailId={selectedEmail?.id}
            />
          </div>

          {/* Reading Pane */}
          <div className="w-1/2">
            {selectedEmail ? (
              <EmailReadingPane
                email={selectedEmail}
                onReply={handleReply}
                onForward={handleForward}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Select an email to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <EmailCompose
          mode={composeMode}
          replyToEmail={replyToEmail}
          onClose={handleCloseCompose}
        />
      )}
    </div>
  );
}
