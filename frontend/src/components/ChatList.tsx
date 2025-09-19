import {
  Archive,
  Bell,
  BellOff,
  MoreVertical,
  Pin,
  PinOff,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Chat, useChatStore } from '../app/store/chat.store';
import { cn } from '../lib/utils/cn';
import { Badge } from './ui/badge';
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
  const { archiveChat, muteChat, pinChat, deleteChat, getUnreadCount } =
    useChatStore();
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Sort chats: pinned first, then by last activity
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastActivity.getTime() - a.lastActivity.getTime();
  });

  const formatLastMessage = (chat: Chat) => {
    if (!chat.lastMessage) return 'No messages yet';

    const content = chat.lastMessage.content;
    const maxLength = 50;

    if (content.length > maxLength) {
      return content.substring(0, maxLength) + '...';
    }

    return content;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
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
        <div className='space-y-1 p-2'>
          {sortedChats.map(chat => {
            const unreadCount = getUnreadCount(chat.id);
            const isSelected = currentChatId === chat.id;

            return (
              <div
                key={chat.id}
                className={cn(
                  'relative group p-3 rounded-lg cursor-pointer transition-colors',
                  isSelected
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                )}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className='flex items-start space-x-3'>
                  {/* Avatar */}
                  <div className='flex-shrink-0'>
                    <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg'>
                      {chat.avatar || '💬'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-sm font-medium text-gray-900 truncate'>
                        {chat.name}
                      </h3>
                      <div className='flex items-center space-x-1'>
                        {chat.isPinned && (
                          <Pin className='h-3 w-3 text-blue-500' />
                        )}
                        {chat.isMuted && (
                          <BellOff className='h-3 w-3 text-gray-400' />
                        )}
                        {unreadCount > 0 && (
                          <Badge
                            variant='destructive'
                            className='text-xs px-1.5 py-0.5'
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className='text-xs text-gray-500 truncate mt-1'>
                      {formatLastMessage(chat)}
                    </p>

                    <div className='flex items-center justify-between mt-1'>
                      <span className='text-xs text-gray-400'>
                        {formatTime(chat.lastActivity)}
                      </span>
                      {chat.type === 'project' && (
                        <Badge variant='secondary' className='text-xs'>
                          Project
                        </Badge>
                      )}
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
                        setShowMenu(showMenu === chat.id ? null : chat.id);
                      }}
                    >
                      <MoreVertical className='h-3 w-3' />
                    </Button>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {showMenu === chat.id && (
                  <div className='absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]'>
                    <div className='py-1'>
                      <button
                        className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
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
                        className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
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
                        className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                        onClick={() => handleMenuAction(chat.id, 'archive')}
                      >
                        <Archive className='h-4 w-4 mr-2' />
                        {chat.isArchived ? 'Unarchive' : 'Archive'}
                      </button>
                      <div className='border-t border-gray-200 my-1' />
                      <button
                        className='flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50'
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
