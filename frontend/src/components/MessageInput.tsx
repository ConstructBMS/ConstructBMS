import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Paperclip,
  Send,
  Smile,
  Underline,
} from 'lucide-react';
import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils/cn';

interface MessageInputProps {
  onSendMessage: (content: string, contentType: 'text' | 'rich') => void;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRichText, setIsRichText] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const richTextRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;

    const contentType = isRichText ? 'rich' : 'text';
    onSendMessage(message, contentType);
    setMessage('');
    
    if (richTextRef.current) {
      richTextRef.current.innerHTML = '';
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    richTextRef.current?.focus();
  };

  const handleRichTextChange = () => {
    if (richTextRef.current) {
      setMessage(richTextRef.current.innerHTML);
    }
  };

  const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  return (
    <div className='flex flex-col space-y-2'>
      {/* Rich Text Toolbar */}
      {isRichText && (
        <div className='flex items-center space-x-1 p-2 bg-gray-50 rounded-lg'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => execCommand('bold')}
            title='Bold'
          >
            <Bold className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => execCommand('italic')}
            title='Italic'
          >
            <Italic className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => execCommand('underline')}
            title='Underline'
          >
            <Underline className='h-4 w-4' />
          </Button>
          <div className='w-px h-6 bg-gray-300 mx-1' />
          <Button
            variant='ghost'
            size='sm'
            onClick={() => execCommand('insertUnorderedList')}
            title='Bullet List'
          >
            <List className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => execCommand('insertOrderedList')}
            title='Numbered List'
          >
            <ListOrdered className='h-4 w-4' />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className='flex items-end space-x-2'>
        <div className='flex-1 relative'>
          {isRichText ? (
            <div
              ref={richTextRef}
              contentEditable
              className={cn(
                'min-h-[40px] max-h-[120px] p-3 border border-gray-300 rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'overflow-y-auto resize-none'
              )}
              onInput={handleRichTextChange}
              onKeyDown={handleKeyDown}
              data-placeholder='Type a message...'
              style={{
                '&:empty:before': {
                  content: '"Type a message..."',
                  color: 'hsl(var(--muted-foreground))',
                  pointerEvents: 'none',
                },
              }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Type a message...'
              className={cn(
                'w-full min-h-[40px] max-h-[120px] p-3 border border-gray-300 rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'resize-none'
              )}
              rows={1}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex items-center space-x-1'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsRichText(!isRichText)}
            title={isRichText ? 'Switch to plain text' : 'Switch to rich text'}
            className={cn(
              'h-8 w-8',
              isRichText && 'bg-blue-100 text-blue-600'
            )}
          >
            <Bold className='h-4 w-4' />
          </Button>

          <div className='relative'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title='Add emoji'
            >
              <Smile className='h-4 w-4' />
            </Button>

            {showEmojiPicker && (
              <div className='absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10'>
                <div className='grid grid-cols-6 gap-1'>
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      className='w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded'
                      onClick={() => {
                        if (isRichText && richTextRef.current) {
                          richTextRef.current.innerHTML += emoji;
                          handleRichTextChange();
                        } else {
                          setMessage(prev => prev + emoji);
                        }
                        setShowEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            variant='ghost'
            size='icon'
            title='Attach file'
          >
            <Paperclip className='h-4 w-4' />
          </Button>

          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size='icon'
            className='h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white'
          >
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
