import { Check, CheckCheck } from 'lucide-react';
import { Message } from '../app/store/chat.store';

interface MessageStatusProps {
  message: Message;
  isOwn: boolean;
}

export function MessageStatus({ message, isOwn }: MessageStatusProps) {
  if (!isOwn) return null;

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return (
          <div className='flex items-center space-x-1'>
            <div className='w-2 h-2 bg-gray-400 rounded-full animate-pulse' />
          </div>
        );
      case 'sent':
        return (
          <div className='flex items-center space-x-1'>
            <Check className='h-3 w-3 text-gray-400' />
          </div>
        );
      case 'delivered':
        return (
          <div className='flex items-center space-x-1'>
            <Check className='h-3 w-3 text-gray-400' />
            <Check className='h-3 w-3 text-gray-400' />
          </div>
        );
      case 'read':
        return (
          <div className='flex items-center space-x-1'>
            <CheckCheck className='h-3 w-3 text-green-500' />
            <CheckCheck className='h-3 w-3 text-green-500' />
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (message.status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        const readCount = Object.keys(message.readBy).length;
        return `Read by ${readCount} ${readCount === 1 ? 'person' : 'people'}`;
      default:
        return '';
    }
  };

  return (
    <div className='flex items-center space-x-1' title={getStatusText()}>
      {getStatusIcon()}
    </div>
  );
}