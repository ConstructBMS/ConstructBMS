import {
  Archive,
  Clock,
  Flag,
  Mail,
  MoreHorizontal,
  Paperclip,
  Star,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Email } from '../../lib/types/email';
import { useEmailStore } from '../../app/store/email.store';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface EmailListProps {
  emails: Email[];
  onEmailSelect: (email: Email) => void;
  selectedEmailId?: string;
  opportunityId?: string;
  clientId?: string;
}

export function EmailList({
  emails,
  onEmailSelect,
  selectedEmailId,
  opportunityId,
  clientId,
}: EmailListProps) {
  const {
    selectedEmails,
    toggleEmailSelection,
    markAsRead,
    markAsUnread,
    markAsImportant,
    markAsFlagged,
    moveToFolder,
    deleteEmail,
  } = useEmailStore();

  const [hoveredEmailId, setHoveredEmailId] = useState<string | null>(null);

  const handleEmailClick = (email: Email) => {
    onEmailSelect(email);
    if (!email.isRead) {
      markAsRead(email.id);
    }
  };

  const handleSelectEmail = (emailId: string, checked: boolean) => {
    if (checked) {
      toggleEmailSelection(emailId);
    } else {
      toggleEmailSelection(emailId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getFolderIcon = (folder: string) => {
    switch (folder) {
      case 'inbox':
        return <Mail className="h-4 w-4" />;
      case 'sent':
        return <Mail className="h-4 w-4" />;
      case 'drafts':
        return <Mail className="h-4 w-4" />;
      case 'trash':
        return <Trash2 className="h-4 w-4" />;
      case 'archive':
        return <Archive className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Mail className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">No emails found</p>
        <p className="text-sm">
          {opportunityId || clientId
            ? 'No emails related to this opportunity or client'
            : 'No emails in this folder'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`flex items-start gap-3 p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
              selectedEmailId === email.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                : ''
            } ${!email.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
            onClick={() => handleEmailClick(email)}
            onMouseEnter={() => setHoveredEmailId(email.id)}
            onMouseLeave={() => setHoveredEmailId(null)}
          >
            {/* Checkbox */}
            <div className="flex-shrink-0 pt-1">
              <Checkbox
                checked={selectedEmails.includes(email.id)}
                onCheckedChange={(checked) =>
                  handleSelectEmail(email.id, checked as boolean)
                }
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Email Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {/* Important/Flagged indicators */}
                {email.isImportant && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                {email.isFlagged && (
                  <Flag className="h-4 w-4 text-red-500 fill-current" />
                )}
                
                {/* Sender */}
                <span
                  className={`font-medium truncate ${
                    !email.isRead ? 'font-semibold' : 'font-normal'
                  }`}
                >
                  {email.from.name}
                </span>
                
                {/* Folder indicator */}
                <Badge variant="outline" className="text-xs">
                  {getFolderIcon(email.folder)}
                  <span className="ml-1 capitalize">{email.folder}</span>
                </Badge>
              </div>

              {/* Subject */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-sm truncate ${
                    !email.isRead ? 'font-semibold' : 'font-normal'
                  }`}
                >
                  {email.subject || '(No Subject)'}
                </span>
                {email.attachments && email.attachments.length > 0 && (
                  <Paperclip className="h-3 w-3 text-gray-400" />
                )}
              </div>

              {/* Preview */}
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {email.body.replace(/<[^>]*>/g, '').substring(0, 100)}
                {email.body.length > 100 && '...'}
              </p>

              {/* Labels */}
              {email.labels && email.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {email.labels.map((label, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Time and Actions */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {formatDate(email.receivedAt)}
                </span>
                
                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsImportant(email.id);
                    }}
                  >
                    <Star
                      className={`h-3 w-3 ${
                        email.isImportant ? 'text-yellow-500 fill-current' : 'text-gray-400'
                      }`}
                    />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsFlagged(email.id);
                    }}
                  >
                    <Flag
                      className={`h-3 w-3 ${
                        email.isFlagged ? 'text-red-500 fill-current' : 'text-gray-400'
                      }`}
                    />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          email.isRead ? markAsUnread(email.id) : markAsRead(email.id);
                        }}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {email.isRead ? 'Mark as Unread' : 'Mark as Read'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          moveToFolder(email.id, 'archive');
                        }}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          moveToFolder(email.id, 'trash');
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
