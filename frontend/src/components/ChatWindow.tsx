import {
  Archive,
  Bell,
  BellOff,
  MoreVertical,
  Phone,
  Pin,
  PinOff,
  Search,
  Users,
  Video,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Chat, useChatStore } from '../app/store/chat.store';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ChatWindowProps {
  chat: Chat;
}

export function ChatWindow({ chat }: ChatWindowProps) {
  const {
    messages,
    users,
    sendMessage,
    addUserToChat,
    removeUserFromChat,
    pinChat,
    muteChat,
    archiveChat,
    getChatUsers,
    getUnreadCount,
    markChatAsRead,
  } = useChatStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showAddUsers, setShowAddUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessages = messages[chat.id] || [];
  const chatUsers = getChatUsers(chat.id);
  const unreadCount = getUnreadCount(chat.id);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  // Mark chat as read when viewed
  useEffect(() => {
    if (chat.id && unreadCount > 0) {
      markChatAsRead(chat.id);
    }
  }, [chat.id, unreadCount, markChatAsRead]);

  const handleSendMessage = (
    content: string,
    contentType: 'text' | 'rich' = 'text'
  ) => {
    if (!content.trim()) return;

    sendMessage({
      content,
      contentType,
      senderId: 'user-1', // Current user ID - in real app, get from auth context
      chatId: chat.id,
    });
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'pin':
        pinChat(chat.id);
        break;
      case 'mute':
        muteChat(chat.id);
        break;
      case 'archive':
        archiveChat(chat.id);
        break;
      case 'addUsers':
        setShowAddUsers(true);
        break;
    }
    setShowMenu(false);
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Chat Header */}
      <div className='flex items-center justify-between p-4 border-b bg-white'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg'>
            {chat.avatar || '💬'}
          </div>
          <div>
            <h3 className='font-medium text-gray-900'>{chat.name}</h3>
            <div className='flex items-center space-x-2'>
              <p className='text-sm text-gray-500'>
                {chatUsers.length} participant
                {chatUsers.length !== 1 ? 's' : ''}
              </p>
              {chat.type === 'project' && (
                <Badge variant='secondary' className='text-xs'>
                  Project Chat
                </Badge>
              )}
              {chat.isMuted && <BellOff className='h-4 w-4 text-gray-400' />}
            </div>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <Button 
            variant='ghost' 
            size='icon' 
            title='Search'
            className='text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          >
            <Search className='h-4 w-4' />
          </Button>
          <Button 
            variant='ghost' 
            size='icon' 
            title='Video Call'
            className='text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          >
            <Video className='h-4 w-4' />
          </Button>
          <Button 
            variant='ghost' 
            size='icon' 
            title='Voice Call'
            className='text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          >
            <Phone className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setShowMenu(!showMenu)}
            title='More options'
            className='text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          >
            <MoreVertical className='h-4 w-4' />
          </Button>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className='absolute right-4 top-16 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]'>
            <div className='py-1'>
              <button
                className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                onClick={() => handleMenuAction('addUsers')}
              >
                <Users className='h-4 w-4 mr-2' />
                Add People
              </button>
              <button
                className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                onClick={() => handleMenuAction('pin')}
              >
                {chat.isPinned ? (
                  <>
                    <PinOff className='h-4 w-4 mr-2' />
                    Unpin Chat
                  </>
                ) : (
                  <>
                    <Pin className='h-4 w-4 mr-2' />
                    Pin Chat
                  </>
                )}
              </button>
              <button
                className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                onClick={() => handleMenuAction('mute')}
              >
                {chat.isMuted ? (
                  <>
                    <Bell className='h-4 w-4 mr-2' />
                    Unmute Notifications
                  </>
                ) : (
                  <>
                    <BellOff className='h-4 w-4 mr-2' />
                    Mute Notifications
                  </>
                )}
              </button>
              <div className='border-t border-gray-200 my-1' />
              <button
                className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                onClick={() => handleMenuAction('archive')}
              >
                <Archive className='h-4 w-4 mr-2' />
                {chat.isArchived ? 'Unarchive Chat' : 'Archive Chat'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>
        {chatMessages.length === 0 ? (
          <div className='flex-1 flex items-center justify-center text-gray-500'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Users className='h-8 w-8 text-gray-400' />
              </div>
              <h3 className='text-lg font-medium mb-2'>No messages yet</h3>
              <p className='text-sm'>
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message, index) => {
              const prevMessage = index > 0 ? chatMessages[index - 1] : null;
              const showAvatar =
                !prevMessage ||
                prevMessage.senderId !== message.senderId ||
                new Date(message.timestamp).getTime() -
                  new Date(prevMessage.timestamp).getTime() >
                  5 * 60 * 1000; // 5 minutes

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showAvatar={showAvatar}
                  isOwn={message.senderId === 'user-1'} // Current user ID
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className='p-4 border-t bg-white'>
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
