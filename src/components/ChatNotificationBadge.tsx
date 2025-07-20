import React, { useContext } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatContext } from '../contexts/ChatContext';

interface ChatNotificationBadgeProps {
  onClick?: () => void;
}

const ChatNotificationBadge: React.FC<ChatNotificationBadgeProps> = ({
  onClick,
}) => {
  // Use useContext directly instead of useChat hook to avoid the error
  const chatContext = useContext(ChatContext);
  const unreadCount = chatContext?.unreadCount || 0;

  if (unreadCount === 0) {
    return (
      <button
        onClick={onClick}
        className='relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
        title='Chat'
      >
        <MessageCircle className='w-5 h-5' />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className='relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
      title={`${unreadCount} unread messages`}
    >
      <MessageCircle className='w-5 h-5' />
      <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    </button>
  );
};

export default ChatNotificationBadge;
