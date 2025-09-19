import {
  Archive,
  Check,
  MoreVertical,
  Pin,
  PinOff,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
  Notification,
  useNotificationsStore,
} from '../app/store/notifications.store';
import { cn } from '../lib/utils/cn';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const {
    markAsRead,
    archiveNotification,
    pinNotification,
    deleteNotification,
  } = useNotificationsStore();

  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return '💬';
      case 'project':
        return '🏗️';
      case 'task':
        return '✅';
      case 'system':
        return '⚙️';
      case 'user':
        return '👤';
      case 'security':
        return '🔒';
      case 'billing':
        return '💰';
      default:
        return '🔔';
    }
  };

  const handleAction = () => {
    if (notification.actionUrl) {
      // In a real app, navigate to the action URL
      console.log('Navigate to:', notification.actionUrl);
    }
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'read':
        if (!notification.isRead) {
          markAsRead(notification.id);
        }
        break;
      case 'pin':
        pinNotification(notification.id);
        break;
      case 'archive':
        archiveNotification(notification.id);
        break;
      case 'delete':
        deleteNotification(notification.id);
        break;
    }
    setShowMenu(false);
  };

  return (
    <div
      className={cn(
        'relative group p-3 rounded-lg cursor-pointer transition-colors',
        notification.isRead
          ? 'bg-white border border-gray-200'
          : 'bg-blue-50 border border-blue-200',
        notification.isPinned && 'ring-2 ring-blue-500 ring-opacity-50'
      )}
      onClick={handleAction}
    >
      <div className='flex items-start space-x-3'>
        {/* Icon */}
        <div className='flex-shrink-0'>
          <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm'>
            {getTypeIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between'>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center space-x-2 mb-1'>
                <h3
                  className={cn(
                    'text-sm font-medium truncate',
                    !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                  )}
                >
                  {notification.title}
                </h3>
                {notification.isPinned && (
                  <Pin className='h-3 w-3 text-blue-500' />
                )}
              </div>
              <p
                className={cn(
                  'text-sm truncate',
                  !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                )}
              >
                {notification.message}
              </p>
              <div className='flex items-center space-x-2 mt-2'>
                <Badge
                  variant='secondary'
                  className={cn(
                    'text-xs',
                    getPriorityColor(notification.priority)
                  )}
                >
                  {notification.priority}
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  {notification.category}
                </Badge>
                <span className='text-xs text-gray-400'>
                  {formatTime(notification.createdAt)}
                </span>
              </div>
            </div>

            {/* Menu Button */}
            <div className='flex-shrink-0'>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={e => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreVertical className='h-3 w-3' />
              </Button>
            </div>
          </div>

          {/* Action Button */}
          {notification.actionText && (
            <div className='mt-2'>
              <Button
                variant='outline'
                size='sm'
                className='text-xs'
                onClick={e => {
                  e.stopPropagation();
                  handleAction();
                }}
              >
                {notification.actionText}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className='absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]'>
          <div className='py-1'>
            {!notification.isRead && (
              <button
                className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                onClick={() => handleMenuAction('read')}
              >
                <Check className='h-4 w-4 mr-2' />
                Mark as Read
              </button>
            )}
            <button
              className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
              onClick={() => handleMenuAction('pin')}
            >
              {notification.isPinned ? (
                <>
                  <PinOff className='h-4 w-4 mr-2' />
                  Unpin
                </>
              ) : (
                <>
                  <Pin className='h-4 w-4 mr-2' />
                  Pin
                </>
              )}
            </button>
            <button
              className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
              onClick={() => handleMenuAction('archive')}
            >
              <Archive className='h-4 w-4 mr-2' />
              {notification.isArchived ? 'Unarchive' : 'Archive'}
            </button>
            <div className='border-t border-gray-200 my-1' />
            <button
              className='flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50'
              onClick={() => handleMenuAction('delete')}
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
