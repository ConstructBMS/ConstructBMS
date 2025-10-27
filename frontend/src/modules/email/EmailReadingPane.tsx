import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Flag,
  MoreHorizontal,
  Paperclip,
  Reply,
  ReplyAll,
  Star,
  Trash2,
} from 'lucide-react';
import { Email } from '../../lib/types/email';
import { useEmailStore } from '../../app/store/email.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';

interface EmailReadingPaneProps {
  email: Email;
  onReply: (email: Email) => void;
  onForward: (email: Email) => void;
}

export function EmailReadingPane({ email, onReply, onForward }: EmailReadingPaneProps) {
  const { markAsImportant, markAsFlagged, moveToFolder } = useEmailStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Email Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {email.subject || '(No Subject)'}
            </h2>
            
            {/* Email metadata */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-medium">From:</span>
                <span>{email.from.name} &lt;{email.from.email}&gt;</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">To:</span>
                <span>{email.to.map(t => t.name).join(', ')}</span>
              </div>
              
              {email.cc && email.cc.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">CC:</span>
                  <span>{email.cc.map(c => c.name).join(', ')}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatDate(email.receivedAt)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsImportant(email.id)}
            >
              <Star
                className={`h-4 w-4 ${
                  email.isImportant ? 'text-yellow-500 fill-current' : 'text-gray-400'
                }`}
              />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsFlagged(email.id)}
            >
              <Flag
                className={`h-4 w-4 ${
                  email.isFlagged ? 'text-red-500 fill-current' : 'text-gray-400'
                }`}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onReply(email)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onForward(email)}>
                  <ReplyAll className="h-4 w-4 mr-2" />
                  Forward
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => moveToFolder(email.id, 'archive')}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => moveToFolder(email.id, 'trash')}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Labels */}
        {email.labels && email.labels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {email.labels.map((label, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose max-w-none dark:prose-invert">
          {email.htmlBody ? (
            <div dangerouslySetInnerHTML={{ __html: email.htmlBody }} />
          ) : (
            <div className="whitespace-pre-wrap">{email.body}</div>
          )}
        </div>
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Attachments ({email.attachments.length})
          </h3>
          <div className="space-y-2">
            {email.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <Paperclip className="h-4 w-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)} • {attachment.type}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply/Forward Actions */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onReply(email)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button
            variant="outline"
            onClick={() => onForward(email)}
          >
            <ReplyAll className="h-4 w-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>
    </div>
  );
}
