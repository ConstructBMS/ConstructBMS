import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '../lib/utils/cn';
import { Button } from './ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'l':
          e.preventDefault();
          execCommand('insertUnorderedList');
          break;
        case 'o':
          e.preventDefault();
          execCommand('insertOrderedList');
          break;
      }
    }
  };

  const toolbarButtons = [
    {
      icon: Bold,
      command: 'bold',
      title: 'Bold (Ctrl+B)',
    },
    {
      icon: Italic,
      command: 'italic',
      title: 'Italic (Ctrl+I)',
    },
    {
      icon: Underline,
      command: 'underline',
      title: 'Underline (Ctrl+U)',
    },
    {
      icon: List,
      command: 'insertUnorderedList',
      title: 'Bullet List (Ctrl+L)',
    },
    {
      icon: ListOrdered,
      command: 'insertOrderedList',
      title: 'Numbered List (Ctrl+O)',
    },
    {
      icon: AlignLeft,
      command: 'justifyLeft',
      title: 'Align Left',
    },
    {
      icon: AlignCenter,
      command: 'justifyCenter',
      title: 'Align Center',
    },
    {
      icon: AlignRight,
      command: 'justifyRight',
      title: 'Align Right',
    },
  ];

  return (
    <div className={cn('border rounded-lg', className)}>
      {/* Toolbar */}
      <div className='flex items-center gap-1 p-2 border-b bg-muted/50'>
        {toolbarButtons.map(button => (
          <Button
            key={button.command}
            variant='ghost'
            size='sm'
            onClick={() => execCommand(button.command)}
            title={button.title}
            className='h-8 w-8 p-0'
          >
            <button.icon className='h-4 w-4' />
          </Button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          'min-h-32 p-3 focus:outline-none',
          isFocused && 'ring-2 ring-ring ring-offset-2'
        )}
        onInput={updateContent}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        style={{
          '&:empty:before': {
            content: `"${placeholder}"`,
            color: 'hsl(var(--muted-foreground))',
            pointerEvents: 'none',
          },
        }}
      />
    </div>
  );
}
