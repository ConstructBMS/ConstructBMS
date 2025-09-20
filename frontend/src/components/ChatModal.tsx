import { Plus, Search, Settings, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useChatStore } from '../app/store/chat.store';
import { ChatList } from './ChatList';
import { ChatSettings } from './ChatSettings';
import { ChatWindow } from './ChatWindow';
import { CreateChatGroup } from './CreateChatGroup';
import { UserSelector } from './UserSelector';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
    searchChats,
  } = useChatStore();

  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab] = useState<'chats' | 'contacts'>('chats');

  const currentChat = getCurrentChat();

  // Get filtered chats based on search query
  const filteredChats = searchQuery ? searchChats(searchQuery) : chats;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/50' onClick={onClose} />

      {/* Modal - WhatsApp-like design */}
      <div 
        className='relative ml-auto w-[900px] h-[600px] bg-white border-l shadow-xl rounded-lg overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex h-full'>
          {/* Left Panel - Chat List */}
          <div className='w-1/3 bg-gray-50 border-r flex flex-col'>
            {/* Header */}
            <div className='bg-blue-600 text-white p-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Chat</h2>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setShowCreateGroup(true)}
                  title='New Group'
                  className='text-white hover:bg-blue-700'
                >
                  <Plus className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setShowUserSelector(true)}
                  title='New Chat'
                  className='text-white hover:bg-blue-700'
                >
                  <Users className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setShowChatSettings(true)}
                  title='Settings'
                  className='text-white hover:bg-blue-700'
                >
                  <Settings className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={onClose}
                  className='text-white hover:bg-blue-700'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className='p-3 bg-white border-b'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search or start new chat'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10 bg-gray-100 border-0 text-gray-900 rounded-full'
                />
              </div>
            </div>

            {/* Chat List */}
            <div className='flex-1 overflow-y-auto'>
              {activeTab === 'chats' ? (
                <ChatList
                  chats={filteredChats}
                  currentChatId={currentChatId}
                  onChatSelect={setCurrentChat}
                />
              ) : (
                <div className='p-4'>
                  <p className='text-gray-500 text-center'>
                    Contacts coming soon...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Chat Window */}
          <div className='w-2/3 bg-white flex flex-col'>
            {currentChat ? (
              <ChatWindow chat={currentChat} />
            ) : (
              <div className='flex-1 flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                  <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Users className='h-10 w-10 text-blue-600' />
                  </div>
                  <h3 className='text-xl font-medium mb-2 text-gray-700'>
                    ConstructBMS Chat
                  </h3>
                  <p className='text-gray-500 max-w-sm'>
                    Send and receive messages with your team. Create project
                    chats, group discussions, and private conversations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Selector Modal */}
      {showUserSelector && (
        <UserSelector
          isOpen={showUserSelector}
          onClose={() => setShowUserSelector(false)}
          onUsersSelected={() => {
            // Create new chat logic here
            setShowUserSelector(false);
          }}
        />
      )}

      {/* Chat Settings Modal */}
      {showChatSettings && (
        <ChatSettings
          isOpen={showChatSettings}
          onClose={() => setShowChatSettings(false)}
        />
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateChatGroup
          isOpen={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
        />
      )}
    </div>
  );
}
