import { Edit2, Plus, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

interface TagItem {
  id: string;
  name: string;
  color: string;
  description?: string;
  usageCount: number;
}

const defaultTags: TagItem[] = [
  {
    id: '1',
    name: 'meeting',
    color: '#3b82f6',
    description: 'Meeting notes and discussions',
    usageCount: 12,
  },
  {
    id: '2',
    name: 'project',
    color: '#10b981',
    description: 'Project-related content',
    usageCount: 8,
  },
  {
    id: '3',
    name: 'urgent',
    color: '#ef4444',
    description: 'Urgent items requiring attention',
    usageCount: 5,
  },
  {
    id: '4',
    name: 'client',
    color: '#8b5cf6',
    description: 'Client communications',
    usageCount: 15,
  },
  {
    id: '5',
    name: 'safety',
    color: '#f59e0b',
    description: 'Safety-related content',
    usageCount: 7,
  },
  {
    id: '6',
    name: 'materials',
    color: '#06b6d4',
    description: 'Material orders and inventory',
    usageCount: 9,
  },
];

const colorOptions = [
  '#3b82f6',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#f59e0b',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#eab308',
];

export function Tags() {
  const [tags, setTags] = useState<TagItem[]>(defaultTags);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTag, setNewTag] = useState({
    name: '',
    color: '#3b82f6',
    description: '',
  });

  const handleCreateTag = () => {
    if (newTag.name.trim()) {
      const tag: TagItem = {
        id: Date.now().toString(),
        name: newTag.name.trim().toLowerCase(),
        color: newTag.color,
        description: newTag.description.trim(),
        usageCount: 0,
      };
      setTags(prev => [...prev, tag]);
      setNewTag({ name: '', color: '#3b82f6', description: '' });
      setIsCreating(false);
    }
  };

  const handleEditTag = (id: string, updates: Partial<TagItem>) => {
    setTags(prev =>
      prev.map(tag => (tag.id === id ? { ...tag, ...updates } : tag))
    );
    setEditingTag(null);
  };

  const handleDeleteTag = (id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Tag Management</h3>
        <p className='text-sm text-muted-foreground'>
          Create and manage tags for organizing your sticky notes and content.
        </p>
      </div>

      {/* Create New Tag */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Tag className='h-5 w-5' />
            Create New Tag
          </CardTitle>
          <CardDescription>
            Add a new tag to help organize your content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isCreating ? (
            <Button
              onClick={() => setIsCreating(true)}
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Add New Tag
            </Button>
          ) : (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='tag-name'>Tag Name</Label>
                  <Input
                    id='tag-name'
                    value={newTag.name}
                    onChange={e =>
                      setNewTag(prev => ({ ...prev, name: e.target.value }))
                    }
                    placeholder='Enter tag name'
                  />
                </div>
                <div>
                  <Label htmlFor='tag-color'>Color</Label>
                  <div className='flex gap-2 mt-1'>
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewTag(prev => ({ ...prev, color }))}
                        className={`w-6 h-6 rounded-full border-2 ${
                          newTag.color === color
                            ? 'border-gray-800'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor='tag-description'>Description (Optional)</Label>
                <Input
                  id='tag-description'
                  value={newTag.description}
                  onChange={e =>
                    setNewTag(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder='Enter tag description'
                />
              </div>
              <div className='flex gap-2'>
                <Button onClick={handleCreateTag} size='sm'>
                  Create Tag
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setIsCreating(false);
                    setNewTag({ name: '', color: '#3b82f6', description: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Tags</CardTitle>
          <CardDescription>
            Manage your existing tags. Click edit to modify or delete to remove.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {tags.map(tag => (
              <div
                key={tag.id}
                className='flex items-center justify-between p-3 border rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className='w-4 h-4 rounded-full'
                    style={{ backgroundColor: tag.color }}
                  />
                  <div>
                    <div className='font-medium'>{tag.name}</div>
                    {tag.description && (
                      <div className='text-sm text-muted-foreground'>
                        {tag.description}
                      </div>
                    )}
                  </div>
                  <Badge variant='secondary' className='ml-2'>
                    {tag.usageCount} uses
                  </Badge>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setEditingTag(tag.id)}
                  >
                    <Edit2 className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDeleteTag(tag.id)}
                    className='text-red-600 hover:text-red-700'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tag Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Tag Usage Statistics</CardTitle>
          <CardDescription>
            Overview of how your tags are being used across the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {tags.map(tag => (
              <div key={tag.id} className='p-4 border rounded-lg'>
                <div className='flex items-center gap-2 mb-2'>
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className='font-medium'>{tag.name}</span>
                </div>
                <div className='text-2xl font-bold'>{tag.usageCount}</div>
                <div className='text-sm text-muted-foreground'>total uses</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
