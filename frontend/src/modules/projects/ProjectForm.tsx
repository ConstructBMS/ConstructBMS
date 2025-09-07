import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '../../components/ui';
import type {
  Project,
  ProjectFormData,
  ProjectStatus,
} from '../../lib/types/projects';
import { useContactsStore } from '../contacts/store';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: ProjectFormData) => void;
  onClose: () => void;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function ProjectForm({ project, onSubmit, onClose }: ProjectFormProps) {
  const { contacts, companies } = useContactsStore();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'planned',
    startDate: '',
    endDate: '',
    budget: undefined,
    clientId: '',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        budget: project.budget,
        clientId: project.clientId || '',
        tags: project.tags || [],
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (
    field: keyof ProjectFormData,
    value: string | number | ProjectStatus | string[]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <div>
              <Label htmlFor='name'>Project Name *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder='Enter project name'
                required
              />
            </div>

            <div>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder='Enter project description'
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={formData.status}
                onValueChange={value => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='startDate'>Start Date</Label>
              <Input
                id='startDate'
                type='date'
                value={formData.startDate}
                onChange={e => handleInputChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor='endDate'>End Date</Label>
              <Input
                id='endDate'
                type='date'
                value={formData.endDate}
                onChange={e => handleInputChange('endDate', e.target.value)}
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label htmlFor='budget'>Budget (GBP)</Label>
            <Input
              id='budget'
              type='number'
              step='0.01'
              min='0'
              value={formData.budget || ''}
              onChange={e =>
                handleInputChange(
                  'budget',
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              placeholder='Enter budget amount'
            />
          </div>

          {/* Client */}
          <div>
            <Label htmlFor='clientId'>Client</Label>
            <Select
              value={formData.clientId}
              onValueChange={value => handleInputChange('clientId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select client' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>No client</SelectItem>
                {[...contacts, ...companies].map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor='tags'>Tags</Label>
            <div className='space-y-2'>
              <div className='flex gap-2'>
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Enter tag and press Enter'
                />
                <Button type='button' onClick={addTag} variant='outline'>
                  Add
                </Button>
              </div>

              {formData.tags && formData.tags.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className='inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm'
                    >
                      {tag}
                      <button
                        type='button'
                        onClick={() => removeTag(tag)}
                        className='ml-1 hover:text-red-600'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>
              {project ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
