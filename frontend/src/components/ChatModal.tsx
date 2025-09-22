import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

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
      <div className='relative ml-auto w-[900px] h-[600px] bg-gray-900 border-l shadow-xl rounded-lg overflow-hidden'>
        <div className='flex h-full'>
          <div className='w-1/3 bg-gray-800 border-r flex flex-col'>
            <div className='bg-blue-600 text-white p-4 flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Chat</h2>
              <Button
                variant='ghost'
                size='icon'
                onClick={onClose}
                className='text-white hover:bg-blue-700'
              >
                <X className='h-4 w-4' />
              </Button>
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
        </div>
      </div>
    </div>,
    document.body
  );
}
