import { X, Settings, Users, Plus, FolderOpen, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useChatStore } from '../app/store/chat.store';
import { ChatList } from './ChatList';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Button } from './ui';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    chats,
    currentChatId,
    setCurrentChat,
    getCurrentChat,
    getChatMessages,
    sendMessage,
    markChatAsRead,
    createChat,
    updateChat,
    deleteChat,
    archiveChat,
  } = useChatStore();

  const currentChat = getCurrentChat();
  const chatMessages = currentChat ? getChatMessages(currentChat.id) : [];

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSettings) {
          setShowSettings(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    }, [isOpen, onClose, showSettings]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-scroll-y', scrollY.toString());
    } else {
      const scrollY = document.body.getAttribute('data-scroll-y');
      if (scrollY) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.removeAttribute('data-scroll-y');
        window.scrollTo(0, parseInt(scrollY));
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-y');
    };
  }, [isOpen]);

  // Mark chat as read when viewed
  useEffect(() => {
    if (currentChat && isOpen) {
      markChatAsRead(currentChat.id);
    }
  }, [currentChat, isOpen, markChatAsRead]);

  const handleSendMessage = (content: string, contentType: 'text' | 'rich' = 'text') => {
    if (!content.trim() || !currentChat) return;

    sendMessage({
      content,
      contentType,
      senderId: 'user-1', // Current user ID - in real app, get from auth context
      chatId: currentChat.id,
    });
  };


  const handleCreateGroup = () => {
    createChat({
      name: 'New Group Chat',
      type: 'group',
      participants: ['user-1'], // Current user
      isArchived: false,
      isMuted: false,
      isPinned: false,
      createdBy: 'user-1',
    });
  };

  const handleLinkToProject = () => {
    if (currentChat) {
      updateChat(currentChat.id, {
        type: 'project',
        projectId: 'project-example-id', // In real app, get from project selection
      });
    }
  };

  const handleLinkToOpportunity = () => {
    if (currentChat) {
      updateChat(currentChat.id, {
        type: 'project', // Could be 'opportunity' type
        projectId: 'opportunity-example-id', // In real app, get from opportunity selection
      });
    }
  };

  const handleExportChat = () => {
    if (currentChat) {
      // In real app, implement chat export functionality
      console.log('Exporting chat:', currentChat.id);
    }
  };

  const handleArchiveChat = () => {
    if (currentChat) {
      archiveChat(currentChat.id);
    }
  };

  const handleDeleteChat = () => {
    if (currentChat) {
      deleteChat(currentChat.id);
      setCurrentChat(null);
    }
  };


  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-50 flex'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='relative ml-auto w-[800px] h-full bg-gray-900 border-l shadow-xl rounded-lg overflow-hidden'>
        <div className='flex h-full'>
          {showSettings ? (
            /* Settings Panel */
            <div className='w-full bg-gray-800 flex flex-col'>
              <div className='bg-blue-600 text-white p-4 flex items-center justify-between'>
                <h2 className='text-lg font-semibold'>Chat Settings</h2>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setShowSettings(false)}
                    className='text-white hover:bg-blue-700'
                    title='Back to Chat'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='flex-1 overflow-y-auto p-6'>
                <div className='space-y-6'>
                  {/* Create Group */}
                  <div className='bg-gray-700 rounded-lg p-4'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <Users className='h-5 w-5 text-blue-400' />
                      <h3 className='text-white font-medium'>Create Group</h3>
                    </div>
                    <p className='text-gray-300 text-sm mb-4'>
                      Create a new chat group for team collaboration
                    </p>
                    <Button 
                      onClick={handleCreateGroup}
                      className='bg-blue-600 hover:bg-blue-700 text-white'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Create Group
                    </Button>
                  </div>

                  {/* Add to Project */}
                  <div className='bg-gray-700 rounded-lg p-4'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <FolderOpen className='h-5 w-5 text-green-400' />
                      <h3 className='text-white font-medium'>Add to Project</h3>
                    </div>
                    <p className='text-gray-300 text-sm mb-4'>
                      Link this chat to an existing project
                    </p>
                    <Button 
                      onClick={handleLinkToProject}
                      className='bg-green-600 hover:bg-green-700 text-white'
                    >
                      <FolderOpen className='h-4 w-4 mr-2' />
                      Link to Project
                    </Button>
                  </div>

                  {/* Add to Sales Opportunity */}
                  <div className='bg-gray-700 rounded-lg p-4'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <TrendingUp className='h-5 w-5 text-purple-400' />
                      <h3 className='text-white font-medium'>Add to Sales Opportunity</h3>
                    </div>
                    <p className='text-gray-300 text-sm mb-4'>
                      Connect this chat to a sales opportunity
                    </p>
                    <Button 
                      onClick={handleLinkToOpportunity}
                      className='bg-purple-600 hover:bg-purple-700 text-white'
                    >
                      <TrendingUp className='h-4 w-4 mr-2' />
                      Link to Opportunity
                    </Button>
                  </div>

                  {/* Chat Actions */}
                  {currentChat && (
                    <div className='bg-gray-700 rounded-lg p-4'>
                      <h3 className='text-white font-medium mb-3'>Chat Actions</h3>
                      <div className='space-y-2'>
                        <Button 
                          variant='outline' 
                          onClick={handleExportChat}
                          className='w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-600'
                        >
                          Export Chat History
                        </Button>
                        <Button 
                          variant='outline' 
                          onClick={handleArchiveChat}
                          className='w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-600'
                        >
                          {currentChat.isArchived ? 'Unarchive Chat' : 'Archive Chat'}
                        </Button>
                        <Button 
                          variant='outline' 
                          onClick={handleDeleteChat}
                          className='w-full justify-start text-red-400 border-red-600 hover:bg-red-900'
                        >
                          Delete Chat
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Normal Chat View */
            <>
              <div className='w-1/3 bg-gray-800 border-r flex flex-col'>
                <div className='bg-blue-600 text-white p-4 flex items-center justify-between'>
                  <h2 className='text-lg font-semibold'>Chat</h2>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setShowSettings(!showSettings)}
                      className='text-white hover:bg-blue-700'
                      title='Chat Settings'
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
                <div className='flex-1 overflow-y-auto'>
                  <ChatList
                    chats={chats}
                    currentChatId={currentChatId}
                    onChatSelect={setCurrentChat}
                  />
                </div>
              </div>
              <div className='flex-1 flex flex-col'>
                {currentChat ? (
                  <>
                    {/* Chat Header */}
                    <div className='bg-gray-800 p-4 border-b border-gray-700'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg'>
                          {currentChat.avatar || '💬'}
                        </div>
                        <div>
                          <h3 className='font-medium text-white'>{currentChat.name}</h3>
                          <p className='text-sm text-gray-400'>
                            {currentChat.type === 'project' ? 'Project Chat' : 
                             currentChat.type === 'group' ? 'Group Chat' : 'Private Chat'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900'>
                      {chatMessages.length === 0 ? (
                        <div className='flex-1 flex items-center justify-center text-gray-400'>
                          <div className='text-center'>
                            <div className='w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
                              <Users className='h-8 w-8 text-gray-400' />
                            </div>
                            <h3 className='text-lg font-medium mb-2 text-white'>
                              No messages yet
                            </h3>
                            <p className='text-sm text-gray-400'>
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
                        </>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className='p-4 border-t bg-gray-800 border-gray-700'>
                      <MessageInput onSendMessage={handleSendMessage} />
                    </div>
                  </>
                ) : (
                  <div className='flex-1 flex items-center justify-center text-gray-400'>
                    <div className='text-center'>
                      <div className='w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <Users className='h-8 w-8 text-gray-400' />
                      </div>
                      <h3 className='text-lg font-medium mb-2 text-white'>
                        Select a chat to start messaging
                      </h3>
                      <p className='text-sm text-gray-400'>
                        Choose from your existing chats or start a new conversation
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}