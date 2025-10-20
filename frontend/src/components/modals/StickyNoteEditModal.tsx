import { Palette, Save, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '../ui';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface StickyNoteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  stickyNote: StickyNote | null;
  onSave: (updatedNote: StickyNote) => void;
}

interface StickyNote {
  id: string;
  title: string;
  content: string;
  color:
    | 'yellow'
    | 'pink'
    | 'blue'
    | 'gray'
    | 'green'
    | 'orange'
    | 'purple'
    | 'red'
    | 'teal'
    | 'indigo'
    | 'lime'
    | 'rose';
  created_at: string;
  updated_at: string;
  user_id: string;
  assigned_to?: string;
  project_id?: string;
  opportunity_id?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  due_date?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
}

// Color configuration
const colorConfig = {
  yellow: { bg: '#fef3c7', border: '#fbbf24', name: 'Yellow' },
  pink: { bg: '#fce7f3', border: '#f472b6', name: 'Pink' },
  blue: { bg: '#dbeafe', border: '#60a5fa', name: 'Blue' },
  gray: { bg: '#f3f4f6', border: '#9ca3af', name: 'Gray' },
  green: { bg: '#dcfce7', border: '#22c55e', name: 'Green' },
  orange: { bg: '#fed7aa', border: '#f97316', name: 'Orange' },
  purple: { bg: '#e9d5ff', border: '#a855f7', name: 'Purple' },
  red: { bg: '#fee2e2', border: '#ef4444', name: 'Red' },
  teal: { bg: '#ccfbf1', border: '#14b8a6', name: 'Teal' },
  indigo: { bg: '#e0e7ff', border: '#6366f1', name: 'Indigo' },
  lime: { bg: '#ecfccb', border: '#84cc16', name: 'Lime' },
  rose: { bg: '#ffe4e6', border: '#f43f5e', name: 'Rose' },
} as const;

// Mock data for projects and opportunities
const mockProjects = [
  { id: '1', name: 'Website Redesign', status: 'active' },
  { id: '2', name: 'Mobile App Development', status: 'planning' },
  { id: '3', name: 'CRM Integration', status: 'completed' },
];

const mockOpportunities = [
  {
    id: '1',
    name: 'Enterprise Deal - ABC Corp',
    value: 150000,
    stage: 'proposal',
  },
  { id: '2', name: 'SMB Website Project', value: 25000, stage: 'qualified' },
  { id: '3', name: 'E-commerce Platform', value: 75000, stage: 'negotiation' },
];

const mockUsers = [
  { id: '1', name: 'John Smith', role: 'Project Manager' },
  { id: '2', name: 'Sarah Johnson', role: 'Developer' },
  { id: '3', name: 'Mike Wilson', role: 'Designer' },
];

export function StickyNoteEditModal({
  isOpen,
  onClose,
  stickyNote,
  onSave,
}: StickyNoteEditModalProps) {
  const [editedNote, setEditedNote] = useState<StickyNote | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newTag, setNewTag] = useState('');
  const quillRef = useRef<ReactQuill>(null);

  // Initialize edited note when modal opens
  useEffect(() => {
    if (stickyNote) {
      setEditedNote({ ...stickyNote });
    }
  }, [stickyNote]);

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const handleSave = () => {
    if (editedNote) {
      const updatedNote = {
        ...editedNote,
        updated_at: new Date().toISOString(),
      };
      onSave(updatedNote);
      onClose();
    }
  };

  const handleColorChange = (color: keyof typeof colorConfig) => {
    if (editedNote) {
      setEditedNote({ ...editedNote, color });
    }
    setShowColorPicker(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && editedNote) {
      const updatedTags = [...(editedNote.tags || []), newTag.trim()];
      setEditedNote({ ...editedNote, tags: updatedTags });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (editedNote) {
      const updatedTags =
        editedNote.tags?.filter(tag => tag !== tagToRemove) || [];
      setEditedNote({ ...editedNote, tags: updatedTags });
    }
  };

  const handleContentChange = (content: string) => {
    if (editedNote) {
      setEditedNote({ ...editedNote, content });
    }
  };

  if (!isOpen || !editedNote) return null;

  const selectedColor = colorConfig[editedNote.color];

  return createPortal(
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex overflow-hidden'>
        {/* Left Side - Sticky Note Preview */}
        <div className='w-1/2 p-6 flex flex-col'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Edit Sticky Note
            </h2>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Sticky Note Preview */}
          <div className='flex-1 flex flex-col'>
            <div
              className='flex-1 rounded-lg border-2 p-4 shadow-lg'
              style={{
                backgroundColor: selectedColor.bg,
                borderColor: selectedColor.border,
                borderStyle: 'solid',
              }}
            >
              <div className='flex items-center justify-between mb-3'>
                <input
                  type='text'
                  value={editedNote.title}
                  onChange={e =>
                    setEditedNote({ ...editedNote, title: e.target.value })
                  }
                  className='font-semibold text-lg bg-transparent border-none outline-none w-full text-gray-900 dark:text-gray-100'
                  placeholder='Note title...'
                />
                <div className='flex items-center gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className='p-1'
                  >
                    <Palette className='h-4 w-4' />
                  </Button>
                  {showColorPicker && (
                    <div className='absolute top-12 right-4 z-10 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 grid grid-cols-4 gap-2'>
                      {Object.entries(colorConfig).map(([key, color]) => (
                        <button
                          key={key}
                          className='w-8 h-8 rounded border-2 hover:scale-110 transition-transform'
                          style={{
                            backgroundColor: color.bg,
                            borderColor: color.border,
                          }}
                          onClick={() =>
                            handleColorChange(key as keyof typeof colorConfig)
                          }
                          title={color.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className='min-h-32'>
                <ReactQuill
                  ref={quillRef}
                  value={editedNote.content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  theme='snow'
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                  }}
                  formats={[
                    'header',
                    'bold',
                    'italic',
                    'underline',
                    'strike',
                    'list',
                    'bullet',
                    'color',
                    'background',
                    'link',
                    'image',
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Editing Controls */}
        <div className='w-1/2 p-6 border-l border-gray-200 dark:border-gray-700 overflow-y-auto'>
          <div className='space-y-6'>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='title'>Title</Label>
                  <Input
                    id='title'
                    value={editedNote.title}
                    onChange={e =>
                      setEditedNote({ ...editedNote, title: e.target.value })
                    }
                    placeholder='Note title...'
                  />
                </div>

                <div>
                  <Label htmlFor='status'>Status</Label>
                  <Select
                    value={editedNote.status || 'draft'}
                    onValueChange={value =>
                      setEditedNote({ ...editedNote, status: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='draft'>Draft</SelectItem>
                      <SelectItem value='active'>Active</SelectItem>
                      <SelectItem value='completed'>Completed</SelectItem>
                      <SelectItem value='archived'>Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='priority'>Priority</Label>
                  <Select
                    value={editedNote.priority || 'medium'}
                    onValueChange={value =>
                      setEditedNote({ ...editedNote, priority: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='low'>Low</SelectItem>
                      <SelectItem value='medium'>Medium</SelectItem>
                      <SelectItem value='high'>High</SelectItem>
                      <SelectItem value='critical'>Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Assignment</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='assigned-to'>Assigned To</Label>
                  <Select
                    value={editedNote.assigned_to || ''}
                    onValueChange={value =>
                      setEditedNote({ ...editedNote, assigned_to: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select user...' />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='due-date'>Due Date</Label>
                  <Input
                    id='due-date'
                    type='datetime-local'
                    value={
                      editedNote.due_date
                        ? new Date(editedNote.due_date)
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={e =>
                      setEditedNote({ ...editedNote, due_date: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project & Opportunity Linking */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Project & Opportunity</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='project'>Link to Project</Label>
                  <Select
                    value={editedNote.project_id || ''}
                    onValueChange={value =>
                      setEditedNote({ ...editedNote, project_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select project...' />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='opportunity'>Link to Opportunity</Label>
                  <Select
                    value={editedNote.opportunity_id || ''}
                    onValueChange={value =>
                      setEditedNote({ ...editedNote, opportunity_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select opportunity...' />
                    </SelectTrigger>
                    <SelectContent>
                      {mockOpportunities.map(opportunity => (
                        <SelectItem key={opportunity.id} value={opportunity.id}>
                          {opportunity.name} - $
                          {opportunity.value.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Tags</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex gap-2'>
                  <Input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder='Add a tag...'
                    onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} size='sm'>
                    Add
                  </Button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {editedNote.tags?.map((tag, index) => (
                    <Badge
                      key={index}
                      variant='secondary'
                      className='flex items-center gap-1'
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className='ml-1 hover:text-red-500'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className='flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700'>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className='bg-blue-600 hover:bg-blue-700'
              >
                <Save className='h-4 w-4 mr-2' />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
