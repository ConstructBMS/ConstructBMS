import { MessageSquare, Search, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { useChatStore } from '../app/store/chat.store';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';
import { UserSelector } from '../components/UserSelector';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils/cn';

export function Chat() {
  const {
    chats,
    currentChatId,
    setCurrentChat,
    getTotalUnreadCount,
    searchQuery,
    setSearchQuery,
  } = useChatStore();

  const [showUserSelector, setShowUserSelector] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const totalUnreadCount = getTotalUnreadCount();

  return (
    <div className='flex h-full'>
      {/* Left Sidebar - Chat List */}
      <div className='w-1/3 border-r bg-white flex flex-col'>
        {/* Header */}
        <div className='p-4 border-b bg-white'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-2'>
              <MessageSquare className='h-6 w-6 text-blue-600' />
              <h1 className='text-xl font-semibold text-gray-900'>Chat</h1>
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
                className='text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              >
                <Users className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                title='Settings'
                className='text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              >
                <Settings className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search chats...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                'pl-10 bg-white border-gray-300 text-gray-900 transition-all duration-200',
                searchFocused && 'ring-2 ring-blue-500 border-blue-500'
              )}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className='flex-1 overflow-y-auto'>
          <ChatList
            chats={chats}
            currentChatId={currentChatId}
            onChatSelect={setCurrentChat}
          />
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className='flex-1 bg-white'>
        {currentChatId ? (
          <ChatWindow chat={chats.find(chat => chat.id === currentChatId)!} />
        ) : (
          <div className='flex-1 flex items-center justify-center text-gray-500'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <MessageSquare className='h-8 w-8 text-gray-400' />
              </div>
              <h3 className='text-lg font-medium mb-2'>
                Select a chat to start messaging
              </h3>
              <p className='text-sm'>
                Choose from your existing chats or start a new conversation
              </p>
              <Button
                onClick={() => setShowUserSelector(true)}
                className='mt-4'
              >
                <Users className='h-4 w-4 mr-2' />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Selector Modal */}
      <UserSelector
        isOpen={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        onUsersSelected={userIds => {
          // Create new chat logic here
          setShowUserSelector(false);
        }}
      />
    </div>
  );
}
