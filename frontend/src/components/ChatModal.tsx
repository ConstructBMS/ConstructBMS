import { X, Settings, Users, Plus, FolderOpen, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [showSettings, setShowSettings] = useState(false);

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
                    <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
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
                    <Button className='bg-green-600 hover:bg-green-700 text-white'>
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
                    <Button className='bg-purple-600 hover:bg-purple-700 text-white'>
                      <TrendingUp className='h-4 w-4 mr-2' />
                      Link to Opportunity
                    </Button>
                  </div>

                  {/* Chat Actions */}
                  <div className='bg-gray-700 rounded-lg p-4'>
                    <h3 className='text-white font-medium mb-3'>Chat Actions</h3>
                    <div className='space-y-2'>
                      <Button variant='outline' className='w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-600'>
                        Export Chat History
                      </Button>
                      <Button variant='outline' className='w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-600'>
                        Archive Chat
                      </Button>
                      <Button variant='outline' className='w-full justify-start text-red-400 border-red-600 hover:bg-red-900'>
                        Delete Chat
                      </Button>
                    </div>
                  </div>
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
            <div className='flex-1 overflow-y-auto p-4'>
              <div className='space-y-2'>
                <div className='text-sm text-gray-400'>
                  Recent conversations
                </div>
                <div className='space-y-1'>
                  <div className='p-2 bg-gray-700 rounded text-white text-sm'>
                    Project Discussion
                  </div>
                  <div className='p-2 bg-gray-700 rounded text-white text-sm'>
                    Team Meeting
                  </div>
                  <div className='p-2 bg-gray-700 rounded text-white text-sm'>
                    Client Update
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='flex-1 flex flex-col'>
            <div className='bg-gray-800 p-4 border-b'>
              <div className='text-white font-medium'>Project Discussion</div>
              <div className='text-gray-400 text-sm'>3 participants</div>
            </div>
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              <div className='flex space-x-2'>
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm'>
                  JD
                </div>
                <div className='flex-1'>
                  <div className='bg-gray-700 p-3 rounded-lg'>
                    <div className='text-white text-sm'>
                      Hey team, how's the project going?
                    </div>
                    <div className='text-gray-400 text-xs mt-1'>2:30 PM</div>
                  </div>
                </div>
              </div>
              <div className='flex space-x-2 justify-end'>
                <div className='flex-1 max-w-xs'>
                  <div className='bg-blue-600 p-3 rounded-lg'>
                    <div className='text-white text-sm'>
                      Everything is on track!
                    </div>
                    <div className='text-blue-200 text-xs mt-1'>2:32 PM</div>
                  </div>
                </div>
                <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm'>
                  ME
                </div>
              </div>
            </div>
            <div className='p-4 border-t bg-gray-800'>
              <div className='flex space-x-2'>
                <input
                  type='text'
                  placeholder='Type a message...'
                  className='flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500'
                />
                <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                  Send
                </Button>
              </div>
            </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
