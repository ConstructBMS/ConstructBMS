import { Check, CheckCheck } from 'lucide-react';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  timestamp: Date;
  showTimestamp?: boolean;
  isOwn?: boolean;
}

export function MessageStatus({
  status,
  timestamp,
  showTimestamp = true,
  isOwn = false,
}: MessageStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <div className='w-3 h-3 border border-gray-400 rounded-full animate-pulse' />
        );
      case 'sent':
        return <Check className='h-3 w-3 text-gray-500' />;
      case 'delivered':
        return <CheckCheck className='h-3 w-3 text-gray-500' />;
      case 'read':
        return <CheckCheck className='h-3 w-3 text-blue-500' />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      default:
        return '';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`flex items-center space-x-1 text-xs ${isOwn ? 'text-white' : 'text-gray-500'}`}
    >
      {getStatusIcon()}
      {showTimestamp && <span className='ml-1'>{formatTime(timestamp)}</span>}
      <span className={`ml-1 transition-opacity ${isOwn ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {getStatusText()}
      </span>
    </div>
  );
}
