import {
  Archive,
  Bell,
  BellOff,
  Building2,
  MoreVertical,
  Pin,
  PinOff,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Chat, useChatStore } from '../app/store/chat.store';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { cn } from '../lib/utils/cn';
import { Button } from './ui/button';

interface ChatListProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

export function ChatList({
  chats,
  currentChatId,
  onChatSelect,
}: ChatListProps) {
  const {
    archiveChat,
    muteChat,
    pinChat,
    deleteChat,
    getUnreadCount,
    markChatAsRead,
    getChatMessages,
  } = useChatStore();
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const { theme } = useTheme();

  // Sort chats: pinned first, then by last activity
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Ensure lastActivity is a Date object
    const aDate =
      a.lastActivity instanceof Date
        ? a.lastActivity
        : new Date(a.lastActivity);
    const bDate =
      b.lastActivity instanceof Date
        ? b.lastActivity
        : new Date(b.lastActivity);
    return bDate.getTime() - aDate.getTime();
  });

  const formatLastMessage = (chat: Chat) => {
    // Get the last message from the messages store
    const chatMessages = getChatMessages(chat.id);
    if (chatMessages.length === 0) return 'No messages yet';

    const lastMessage = chatMessages[chatMessages.length - 1];
    const content = lastMessage.content;
    const maxLength = 50;

    // Strip HTML tags for preview
    const textContent = content.replace(/<[^>]*>/g, '');

    if (textContent.length > maxLength) {
      return textContent.substring(0, maxLength) + '...';
    }

    return textContent;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    // Ensure date is a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    const diff = now.getTime() - dateObj.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return 'Just now';
    }
  };

  const getChatTypeTag = (chat: Chat) => {
    switch (chat.type) {
      case 'group':
        return { label: 'Group', icon: Users, color: 'bg-blue-500' };
      case 'project':
        return { label: 'Project', icon: Building2, color: 'bg-green-500' };
      default:
        return { label: 'Internal', icon: Users, color: 'bg-gray-500' };
    }
  };

  const handleMenuAction = (chatId: string, action: string) => {
    switch (action) {
      case 'pin':
        pinChat(chatId);
        break;
      case 'mute':
        muteChat(chatId);
        break;
      case 'archive':
        archiveChat(chatId);
        break;
      case 'delete':
        deleteChat(chatId);
        break;
    }
    setShowMenu(null);
  };

  return (
    <div className='flex-1 overflow-y-auto'>
      {sortedChats.length === 0 ? (
        <div className='p-4 text-center text-gray-500'>
          <p>No chats yet</p>
          <p className='text-sm'>Start a new conversation</p>
        </div>
      ) : (
        <div className='space-y-0'>
          {sortedChats.map(chat => {
            const unreadCount = getUnreadCount(chat.id);
            const isSelected = currentChatId === chat.id;
            const typeTag = getChatTypeTag(chat);
            const IconComponent = typeTag.icon;

            return (
              <div
                key={chat.id}
                className={cn(
                  'relative group p-3 cursor-pointer transition-colors border-b',
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
                  isSelected
                    ? theme === 'dark'
                      ? 'bg-blue-600'
                      : 'bg-blue-100'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                )}
                onClick={() => {
                  onChatSelect(chat.id);
                  // Mark chat as read when selected
                  if (getUnreadCount(chat.id) > 0) {
                    markChatAsRead(chat.id);
                  }
                }}
              >
                <div className='flex items-center space-x-3'>
                  {/* Avatar */}
                  <div className='flex-shrink-0 relative'>
                    <div className='w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg'>
                      {chat.avatar || chat.name.charAt(0).toUpperCase()}
                    </div>
                    {chat.type === 'group' && (
                      <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center'>
                        <Users className='h-2 w-2 text-gray-600' />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center space-x-2 flex-1 min-w-0'>
                        <h3
                          className={cn(
                            'text-sm font-medium truncate',
                            isSelected
                              ? 'text-gray-900'
                              : 'text-white group-hover:text-gray-900'
                          )}
                        >
                          {chat.name}
                        </h3>
                        <div
                          className={cn(
                            'flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium',
                            typeTag.color,
                            'text-white'
                          )}
                        >
                          <IconComponent className='h-3 w-3' />
                          <span>{typeTag.label}</span>
                        </div>
                      </div>
                      <div className='flex items-center space-x-1'>
                        {chat.isPinned && (
                          <Pin className='h-3 w-3 text-blue-600' />
                        )}
                        {chat.isMuted && (
                          <BellOff className='h-3 w-3 text-gray-400' />
                        )}
                        <span
                          className={cn(
                            'text-xs',
                            isSelected ? 'text-gray-500' : 'text-gray-400'
                          )}
                        >
                          {formatTime(chat.lastActivity)}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center justify-between'>
                      <p
                        className={cn(
                          'text-sm flex-1',
                          isSelected
                            ? 'text-gray-600'
                            : 'text-gray-300 group-hover:text-gray-600',
                          'line-clamp-2'
                        )}
                      >
                        {formatLastMessage(chat)}
                      </p>
                      {unreadCount > 0 && (
                        <div className='ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Menu Button */}
                  <div className='flex-shrink-0'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className={cn(
                        'h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
                        isSelected ? 'text-gray-600' : 'text-gray-400'
                      )}
                      onClick={e => {
                        e.stopPropagation();
                        setShowMenu(showMenu === chat.id ? null : chat.id);
                      }}
                      title='Chat Options'
                    >
                      <MoreVertical className='h-3 w-3' />
                    </Button>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {showMenu === chat.id && (
                  <div className='absolute right-2 top-12 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[150px]'>
                    <div className='py-1'>
                      <button
                        className='flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700'
                        onClick={() => handleMenuAction(chat.id, 'pin')}
                      >
                        {chat.isPinned ? (
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
                        className='flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700'
                        onClick={() => handleMenuAction(chat.id, 'mute')}
                      >
                        {chat.isMuted ? (
                          <>
                            <Bell className='h-4 w-4 mr-2' />
                            Unmute
                          </>
                        ) : (
                          <>
                            <BellOff className='h-4 w-4 mr-2' />
                            Mute
                          </>
                        )}
                      </button>
                      <button
                        className='flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700'
                        onClick={() => handleMenuAction(chat.id, 'archive')}
                      >
                        <Archive className='h-4 w-4 mr-2' />
                        {chat.isArchived ? 'Unarchive' : 'Archive'}
                      </button>
                      <div className='border-t border-gray-600 my-1' />
                      <button
                        className='flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900'
                        onClick={() => handleMenuAction(chat.id, 'delete')}
                      >
                        <Trash2 className='h-4 w-4 mr-2' />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
