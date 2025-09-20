import { Plus, Search, Settings, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useChatStore } from '../app/store/chat.store';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
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

  const [activeTab] = useState<'chats' | 'contacts'>('chats');
  const currentChat = getCurrentChat();
  const filteredChats = searchQuery ? searchChats(searchQuery) : chats;

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50'>
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />
      <div className='absolute right-0 top-0 h-full flex'>
        <div
          className='relative w-[900px] h-[600px] bg-white border-l shadow-xl rounded-lg overflow-hidden'
          onClick={e => e.stopPropagation()}
        >
          <div className='flex h-full'>
            <div className='w-1/3 bg-gray-50 border-r flex flex-col'>
              <div className='bg-blue-600 text-white p-4 flex items-center justify-between'>
                <h2 className='text-lg font-semibold'>Chat</h2>
                <div className='flex items-center space-x-2'>
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
      </div>
    </div>
  );
}