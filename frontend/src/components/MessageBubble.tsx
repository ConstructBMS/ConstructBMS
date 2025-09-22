import { Edit, MoreVertical, Reply, Smile, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Message, useChatStore } from '../app/store/chat.store';
import { cn } from '../lib/utils/cn';
import { MessageStatus } from './MessageStatus';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
  isOwn: boolean;
}

export function MessageBubble({
  message,
  showAvatar,
  isOwn,
}: MessageBubbleProps) {
  const { editMessage, deleteMessage, addReaction, removeReaction } =
    useChatStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const reactionRef = useRef<HTMLDivElement>(null);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      editMessage(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleReaction = (emoji: string) => {
    const userId = 'user-1'; // Current user ID
    if (message.reactions[userId]) {
      removeReaction(message.id, userId);
    } else {
      addReaction(message.id, userId, emoji);
    }
    setShowReactions(false);
  };

  const reactions = Object.entries(message.reactions);
  const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '💯', '🎉', '😍', '🤔'];

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reactionRef.current && !reactionRef.current.contains(event.target as Node)) {
        setShowReactions(false);
      }
    };

    if (showReactions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReactions]);

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex max-w-[70%]',
          isOwn ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className='flex-shrink-0 mr-2'>
            <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm'>
              👤
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className={cn('relative group', isOwn ? 'ml-2' : 'mr-2')}>
          <div
            className={cn(
              'rounded-lg px-3 py-2 relative',
              isOwn
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-900'
            )}
          >
            {isEditing ? (
              <div className='space-y-2'>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded text-gray-900 resize-none'
                  rows={3}
                  autoFocus
                />
                <div className='flex space-x-2'>
                  <Button size='sm' onClick={handleEdit}>
                    Save
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Message Content */}
                <div
                  className={cn(
                    'prose prose-sm max-w-none',
                    isOwn ? 'prose-invert' : ''
                  )}
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />

                {/* Edited Indicator */}
                {message.editedAt && (
                  <span className='text-xs opacity-70 ml-1'>(edited)</span>
                )}

                {/* Timestamp and Status */}
                {isOwn && (
                  <div className='flex items-center justify-end mt-1 space-x-1'>
                    <span className='text-xs text-gray-500'>
                      {formatTime(message.timestamp)}
                    </span>
                    <MessageStatus message={message} isOwn={isOwn} />
                  </div>
                )}
                {!isOwn && (
                  <div className='flex items-center justify-end mt-1 text-xs text-gray-500'>
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                )}
              </>
            )}

            {/* Message Menu */}
            {!isEditing && (
              <div className='absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className='h-3 w-3' />
                </Button>

                {showMenu && (
                  <div className='absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]'>
                    <div className='py-1'>
                      <button
                        className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                      >
                        <Edit className='h-4 w-4 mr-2' />
                        Edit
                      </button>
                      <button
                        className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                        onClick={() => setShowReactions(!showReactions)}
                      >
                        <Smile className='h-4 w-4 mr-2' />
                        React
                      </button>
                      <button className='flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'>
                        <Reply className='h-4 w-4 mr-2' />
                        Reply
                      </button>
                      <div className='border-t border-gray-200 my-1' />
                      <button
                        className='flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50'
                        onClick={() => {
                          deleteMessage(message.id);
                          setShowMenu(false);
                        }}
                      >
                        <Trash2 className='h-4 w-4 mr-2' />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reactions */}
          <div className='flex items-center justify-between mt-1'>
            {reactions.length > 0 && (
              <div className='flex flex-wrap gap-1'>
                {reactions.map(([userId, emoji]) => (
                  <Badge
                    key={userId}
                    variant='secondary'
                    className='text-xs px-1.5 py-0.5 cursor-pointer hover:bg-gray-200'
                    onClick={() => handleReaction(emoji)}
                  >
                    {emoji}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Quick Reaction Button */}
            <Button
              variant='ghost'
              size='sm'
              className='h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
              onClick={() => setShowReactions(!showReactions)}
              title='Add Reaction'
            >
              <Smile className='h-3 w-3' />
            </Button>
          </div>

          {/* Reaction Picker */}
          {showReactions && (
            <div 
              ref={reactionRef}
              className={cn(
                'absolute mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20',
                isOwn ? 'bottom-full right-0' : 'bottom-full left-0'
              )}
            >
              <div className='flex flex-wrap gap-1 max-w-48'>
                {commonReactions.map(emoji => (
                  <button
                    key={emoji}
                    className='w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-lg transition-colors'
                    onClick={() => handleReaction(emoji)}
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
