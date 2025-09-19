import {
  Archive,
  Bell,
  BellOff,
  MoreVertical,
  Pin,
  PinOff,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useChatStore } from '../app/store/chat.store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { UserSelector } from './UserSelector';
import { cn } from '../lib/utils/cn';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const {
    chats,
    currentChatId,
    searchQuery,
    setCurrentChat,
    setSearchQuery,
    getCurrentChat,
    getTotalUnreadCount,
  } = useChatStore();

  const [showUserSelector, setShowUserSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');

  const currentChat = getCurrentChat();
  const totalUnreadCount = getTotalUnreadCount();

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='relative ml-auto w-[700px] h-full bg-white border-l shadow-xl'>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b bg-white'>
            <div className='flex items-center space-x-4'>
              <h2 className='text-lg font-semibold text-gray-900'>Chat</h2>
              {totalUnreadCount > 0 && (
                <span className='bg-red-500 text-white text-xs rounded-full px-2 py-1'>
                  {totalUnreadCount}
                </span>
              )}
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setShowUserSelector(true)}
                title='New Chat'
              >
                <Users className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='icon' title='Settings'>
                <Settings className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='icon' onClick={onClose}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className='p-4 border-b bg-white'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search chats...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 bg-white border-gray-300 text-gray-900'
              />
            </div>
          </div>

          {/* Tabs */}
          <div className='flex border-b bg-white'>
            <button
              className={cn(
                'flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'chats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
              onClick={() => setActiveTab('chats')}
            >
              Chats
            </button>
            <button
              className={cn(
                'flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
              onClick={() => setActiveTab('contacts')}
            >
              Contacts
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 flex overflow-hidden'>
            {/* Left Pane - Chat List */}
            <div className='w-2/5 border-r bg-white'>
              {activeTab === 'chats' ? (
                <ChatList
                  chats={chats}
                  currentChatId={currentChatId}
                  onChatSelect={setCurrentChat}
                />
              ) : (
                <div className='p-4'>
                  <p className='text-gray-500 text-center'>Contacts coming soon...</p>
                </div>
              )}
            </div>

            {/* Right Pane - Chat Window */}
            <div className='w-3/5 bg-white'>
              {currentChat ? (
                <ChatWindow chat={currentChat} />
              ) : (
                <div className='flex-1 flex items-center justify-center text-gray-500'>
                  <div className='text-center'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <Users className='h-8 w-8 text-gray-400' />
                    </div>
                    <h3 className='text-lg font-medium mb-2'>Select a chat to start messaging</h3>
                    <p className='text-sm'>Choose from your existing chats or start a new conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Selector Modal */}
      {showUserSelector && (
        <UserSelector
          isOpen={showUserSelector}
          onClose={() => setShowUserSelector(false)}
          onUsersSelected={(userIds) => {
            // Create new chat logic here
            setShowUserSelector(false);
          }}
        />
      )}
    </div>
  );
}
