import { Building2, User, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Contact, Company, ContactType } from '../../lib/types/contacts';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '../../components/ui';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => void;
  editItem?: Contact | Company;
  companies: Company[];
}

export interface ContactFormData {
  type: ContactType;
  name: string;
  email?: string;
  phone?: string;
  companyId?: string;
  website?: string;
  address?: string;
  notes?: string;
  tags: string[];
  custom?: Record<string, unknown>;
}

const initialFormData: ContactFormData = {
  type: 'person',
  name: '',
  email: '',
  phone: '',
  companyId: '',
  website: '',
  address: '',
  notes: '',
  tags: [],
  custom: {},
};

export function ContactForm({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  companies,
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [tagInput, setTagInput] = useState('');
  const [customFieldsJson, setCustomFieldsJson] = useState('{}');

  useEffect(() => {
    if (editItem) {
      const isCompany = 'website' in editItem;
      setFormData({
        type: isCompany ? 'company' : editItem.type,
        name: editItem.name,
        email: editItem.email || '',
        phone: editItem.phone || '',
        companyId: 'companyId' in editItem ? editItem.companyId || '' : '',
        website: isCompany ? editItem.website || '' : '',
        address: isCompany ? editItem.address || '' : '',
        notes: editItem.notes || '',
        tags: editItem.tags || [],
        custom: editItem.custom || {},
      });
      setCustomFieldsJson(JSON.stringify(editItem.custom || {}, null, 2));
    } else {
      setFormData(initialFormData);
      setCustomFieldsJson('{}');
    }
  }, [editItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let customFields = {};
    try {
      customFields = JSON.parse(customFieldsJson);
    } catch {
      alert('Invalid JSON in custom fields');
      return;
    }

    const submitData = {
      ...formData,
      custom: customFields,
    };

    onSubmit(submitData);
    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {editItem ? (
              <>
                {formData.type === 'company' ? (
                  <Building2 className='h-5 w-5' />
                ) : (
                  <User className='h-5 w-5' />
                )}
                Edit {formData.type === 'company' ? 'Company' : 'Contact'}
              </>
            ) : (
              <>
                <User className='h-5 w-5' />
                Add New Contact
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <Tabs defaultValue='basic' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='basic'>Basic Info</TabsTrigger>
              <TabsTrigger value='details'>Details</TabsTrigger>
              <TabsTrigger value='advanced'>Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='type'>Type</Label>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant={formData.type === 'person' ? 'default' : 'outline'}
                    onClick={() =>
                      setFormData(prev => ({ ...prev, type: 'person' }))
                    }
                    className='flex items-center gap-2'
                  >
                    <User className='h-4 w-4' />
                    Person
                  </Button>
                  <Button
                    type='button'
                    variant={
                      formData.type === 'company' ? 'default' : 'outline'
                    }
                    onClick={() =>
                      setFormData(prev => ({ ...prev, type: 'company' }))
                    }
                    className='flex items-center gap-2'
                  >
                    <Building2 className='h-4 w-4' />
                    Company
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='name'>Name *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder='Enter name'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, email: e.target.value }))
                  }
                  placeholder='Enter email address'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone</Label>
                <Input
                  id='phone'
                  value={formData.phone}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder='Enter phone number'
                />
              </div>

              {formData.type === 'person' && (
                <div className='space-y-2'>
                  <Label htmlFor='company'>Company</Label>
                  <select
                    id='company'
                    value={formData.companyId}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        companyId: e.target.value,
                      }))
                    }
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <option value=''>Select a company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </TabsContent>

            <TabsContent value='details' className='space-y-4'>
              {formData.type === 'company' && (
                <>
                  <div className='space-y-2'>
                    <Label htmlFor='website'>Website</Label>
                    <Input
                      id='website'
                      value={formData.website}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      placeholder='https://example.com'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='address'>Address</Label>
                    <Textarea
                      id='address'
                      value={formData.address}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder='Enter full address'
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div className='space-y-2'>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  value={formData.notes}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder='Add any additional notes'
                  rows={4}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='tags'>Tags</Label>
                <div className='space-y-2'>
                  <div className='flex gap-2'>
                    <Input
                      id='tags'
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder='Add a tag'
                    />
                    <Button
                      type='button'
                      onClick={handleAddTag}
                      variant='outline'
                    >
                      Add
                    </Button>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {formData.tags.map(tag => (
                      <div
                        key={tag}
                        className='flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm'
                      >
                        {tag}
                        <button
                          type='button'
                          onClick={() => handleRemoveTag(tag)}
                          className='hover:bg-primary-foreground/20 rounded'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='advanced' className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='customFields'>Custom Fields (JSON)</Label>
                <Textarea
                  id='customFields'
                  value={customFieldsJson}
                  onChange={e => setCustomFieldsJson(e.target.value)}
                  placeholder='{"field1": "value1", "field2": "value2"}'
                  rows={8}
                  className='font-mono text-sm'
                />
                <p className='text-xs text-muted-foreground'>
                  Enter custom fields as valid JSON. This will be stored in the
                  custom field.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className='flex justify-end gap-2 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>
              {editItem ? 'Update' : 'Create'}{' '}
              {formData.type === 'company' ? 'Company' : 'Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
