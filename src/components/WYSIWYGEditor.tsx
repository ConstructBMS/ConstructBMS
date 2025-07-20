import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Palette,
  Highlighter,
  Code,
  Table as TableIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  X,
} from 'lucide-react';

// Compact toolbar component for sticky notes
const CompactToolbar = ({
  editor,
  showLinkInput,
  setShowLinkInput,
}: {
  editor: any;
  setShowLinkInput: (show: boolean) => void;
  showLinkInput: boolean;
}) => (
  <div className='flex items-center gap-1'>
    {/* Essential formatting only */}
    <button
      onClick={() => editor?.chain().focus().toggleBold().run()}
      className={`p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors ${editor?.isActive('bold') ? 'bg-black bg-opacity-20' : ''}`}
      title='Bold'
    >
      <Bold size={12} />
    </button>
    <button
      onClick={() => editor?.chain().focus().toggleItalic().run()}
      className={`p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors ${editor?.isActive('italic') ? 'bg-black bg-opacity-20' : ''}`}
      title='Italic'
    >
      <Italic size={12} />
    </button>
    <button
      onClick={() => editor?.chain().focus().toggleUnderline().run()}
      className={`p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors ${editor?.isActive('underline') ? 'bg-black bg-opacity-20' : ''}`}
      title='Underline'
    >
      <UnderlineIcon size={12} />
    </button>

    <div className='w-px h-4 bg-current opacity-20 mx-1'></div>

    <button
      onClick={() => editor?.chain().focus().toggleBulletList().run()}
      className={`p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors ${editor?.isActive('bulletList') ? 'bg-black bg-opacity-20' : ''}`}
      title='Bullet List'
    >
      <List size={12} />
    </button>
    <button
      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      className={`p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors ${editor?.isActive('orderedList') ? 'bg-black bg-opacity-20' : ''}`}
      title='Numbered List'
    >
      <ListOrdered size={12} />
    </button>

    <div className='w-px h-4 bg-current opacity-20 mx-1'></div>

    <button
      onClick={() => setShowLinkInput(!showLinkInput)}
      className={`p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors ${editor?.isActive('link') ? 'bg-black bg-opacity-20' : ''}`}
      title='Add Link'
    >
      <LinkIcon size={12} />
    </button>
    <button
      onClick={() => editor?.chain().focus().toggleHighlight().run()}
      className={`p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors ${editor?.isActive('highlight') ? 'bg-black bg-opacity-20' : ''}`}
      title='Highlight'
    >
      <Highlighter size={12} />
    </button>
  </div>
);

interface WYSIWYGEditorProps {
  className?: string;
  compact?: boolean;
  content: string;
  hideToolbar?: boolean;
  onChange: (content: string) => void;
  placeholder?: string;
}

const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  compact = false,
  hideToolbar = false,
}) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image,
      Color,
      Highlight,
      CodeBlock,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const CompactMenuBar = () => (
    <CompactToolbar
      editor={editor}
      showLinkInput={showLinkInput}
      setShowLinkInput={setShowLinkInput}
    />
  );

  const MenuBar = () => (
    <div className='border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg'>
      <div className='flex flex-wrap items-center gap-1'>
        {/* Text Formatting */}
        <div className='flex items-center gap-1 border-r border-gray-300 pr-2'>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            title='Bold'
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            title='Italic'
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
            title='Underline'
          >
            <UnderlineIcon size={16} />
          </button>
        </div>

        {/* Text Alignment */}
        <div className='flex items-center gap-1 border-r border-gray-300 pr-2'>
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
            title='Align Left'
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
            title='Align Center'
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
            title='Align Right'
          >
            <AlignRight size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}`}
            title='Justify'
          >
            <AlignJustify size={16} />
          </button>
        </div>

        {/* Lists */}
        <div className='flex items-center gap-1 border-r border-gray-300 pr-2'>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            title='Bullet List'
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            title='Numbered List'
          >
            <ListOrdered size={16} />
          </button>
        </div>

        {/* Headings */}
        <div className='flex items-center gap-1 border-r border-gray-300 pr-2'>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
            title='Heading 1'
          >
            H1
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
            title='Heading 2'
          >
            H2
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
            title='Heading 3'
          >
            H3
          </button>
        </div>

        {/* Special Elements */}
        <div className='flex items-center gap-1 border-r border-gray-300 pr-2'>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
            title='Quote'
          >
            <Quote size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
            title='Code Block'
          >
            <Code size={16} />
          </button>
          <button
            onClick={insertTable}
            className='p-2 rounded hover:bg-gray-200'
            title='Insert Table'
          >
            <TableIcon size={16} />
          </button>
        </div>

        {/* Links and Images */}
        <div className='flex items-center gap-1 border-r border-gray-300 pr-2'>
          <button
            onClick={() => setShowLinkInput(true)}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
            title='Add Link'
          >
            <LinkIcon size={16} />
          </button>
          <button
            onClick={() => setShowImageInput(true)}
            className='p-2 rounded hover:bg-gray-200'
            title='Add Image'
          >
            <ImageIcon size={16} />
          </button>
        </div>

        {/* Colors */}
        <div className='flex items-center gap-1 border-r border-gray-300 pr-2'>
          <button
            onClick={() => editor.chain().focus().setColor('#958DF1').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('textStyle', { color: '#958DF1' }) ? 'bg-gray-200' : ''}`}
            title='Purple'
          >
            <div className='w-4 h-4 bg-purple-500 rounded'></div>
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#F98181').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('textStyle', { color: '#F98181' }) ? 'bg-gray-200' : ''}`}
            title='Red'
          >
            <div className='w-4 h-4 bg-red-500 rounded'></div>
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#FBBC88').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('textStyle', { color: '#FBBC88' }) ? 'bg-gray-200' : ''}`}
            title='Orange'
          >
            <div className='w-4 h-4 bg-orange-500 rounded'></div>
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#FAF594').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('textStyle', { color: '#FAF594' }) ? 'bg-gray-200' : ''}`}
            title='Yellow'
          >
            <div className='w-4 h-4 bg-yellow-500 rounded'></div>
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#70CFF8').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('textStyle', { color: '#70CFF8' }) ? 'bg-gray-200' : ''}`}
            title='Blue'
          >
            <div className='w-4 h-4 bg-blue-500 rounded'></div>
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#94FADB').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('textStyle', { color: '#94FADB' }) ? 'bg-gray-200' : ''}`}
            title='Teal'
          >
            <div className='w-4 h-4 bg-teal-500 rounded'></div>
          </button>
          <button
            onClick={() => editor.chain().focus().setColor('#B9F18D').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('textStyle', { color: '#B9F18D' }) ? 'bg-gray-200' : ''}`}
            title='Green'
          >
            <div className='w-4 h-4 bg-green-500 rounded'></div>
          </button>
        </div>

        {/* Highlight */}
        <div className='flex items-center gap-1 border-r border-gray-300 pr-2'>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-gray-200' : ''}`}
            title='Highlight'
          >
            <Highlighter size={16} />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className='flex items-center gap-1'>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className='p-2 rounded hover:bg-gray-200'
            title='Undo'
          >
            <Undo size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className='p-2 rounded hover:bg-gray-200'
            title='Redo'
          >
            <Redo size={16} />
          </button>
        </div>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className='mt-2 p-2 bg-white border rounded-lg flex items-center gap-2'>
          <input
            type='url'
            placeholder='Enter URL...'
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            className='flex-1 px-2 py-1 border rounded text-sm'
            onKeyPress={e => e.key === 'Enter' && addLink()}
          />
          <button
            onClick={addLink}
            className='px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700'
          >
            Add
          </button>
          <button
            onClick={() => setShowLinkInput(false)}
            className='p-1 text-gray-500 hover:text-gray-700'
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Image Input */}
      {showImageInput && (
        <div className='mt-2 p-2 bg-white border rounded-lg flex items-center gap-2'>
          <input
            type='url'
            placeholder='Enter image URL...'
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className='flex-1 px-2 py-1 border rounded text-sm'
            onKeyPress={e => e.key === 'Enter' && addImage()}
          />
          <button
            onClick={addImage}
            className='px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700'
          >
            Add
          </button>
          <button
            onClick={() => setShowImageInput(false)}
            className='p-1 text-gray-500 hover:text-gray-700'
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );

  if (hideToolbar) {
    return (
      <div className={`${className}`}>
        <EditorContent
          editor={editor}
          className='min-h-[200px] focus:outline-none prose prose-sm max-w-none'
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div
      className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}
    >
      {compact ? <CompactMenuBar /> : <MenuBar />}
      <EditorContent
        editor={editor}
        className='min-h-[200px] p-4 focus:outline-none'
        placeholder={placeholder}
      />

      {/* Link Input for compact mode */}
      {compact && showLinkInput && (
        <div className='p-2 bg-white border-t flex items-center gap-2'>
          <input
            type='url'
            placeholder='Enter URL...'
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            className='flex-1 px-2 py-1 border rounded text-sm'
            onKeyPress={e => e.key === 'Enter' && addLink()}
          />
          <button
            onClick={addLink}
            className='px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700'
          >
            Add
          </button>
          <button
            onClick={() => setShowLinkInput(false)}
            className='p-1 text-gray-500 hover:text-gray-700'
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WYSIWYGEditor;
export { CompactToolbar };
