import {
  Activity,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePipelineStore } from '../../app/store/settings/pipeline.store';
import { useEmailStore } from '../../app/store/email.store';
import { Email } from '../../lib/types/email';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { EmailList } from '../email/EmailList';

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  stage: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  contact?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  startDate?: string;
  endDate?: string;
  source?: string;
  owner?: string;
  tags?: string[];
  activities?: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description?: string;
  scheduledAt?: string;
  completedAt?: string;
  status: 'planned' | 'completed' | 'overdue';
  createdBy: string;
  createdAt: string;
}

interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity?: Opportunity;
  onSave: (opportunity: Opportunity) => void;
  onStageChange?: (opportunity: Opportunity) => void;
  onDelete?: (opportunityId: string) => void;
}

export function OpportunityModal({
  isOpen,
  onClose,
  opportunity,
  onSave,
  onStageChange,
  onDelete,
}: OpportunityModalProps) {
  const [activeTab, setActiveTab] = useState('main');
  const [isEditing, setIsEditing] = useState(!opportunity);
  const [formData, setFormData] = useState<Opportunity>({
    id: opportunity?.id || '',
    title: opportunity?.title || '',
    description: opportunity?.description || '',
    amount: opportunity?.amount || 0,
    stage: opportunity?.stage || 'new',
    customer: opportunity?.customer,
    contact: opportunity?.contact,
    startDate: opportunity?.startDate || '',
    endDate: opportunity?.endDate || '',
    source: opportunity?.source || '',
    owner: opportunity?.owner || '',
    tags: opportunity?.tags || [],
    activities: opportunity?.activities || [],
    createdAt: opportunity?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [newActivity, setNewActivity] = useState({
    type: 'note' as Activity['type'],
    title: '',
    description: '',
    scheduledAt: '',
  });

  const [newTag, setNewTag] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { settings } = usePipelineStore();
  const { getEmailsByOpportunity, getEmailsByClient } = useEmailStore();

  const stages = settings.stages || [];
  
  // Get emails related to this opportunity or client
  const relatedEmails = opportunity?.id 
    ? getEmailsByOpportunity(opportunity.id)
    : formData.customer?.id 
    ? getEmailsByClient(formData.customer.id)
    : [];

  useEffect(() => {
    if (opportunity) {
      setFormData(opportunity);
    }
  }, [opportunity]);

  // Update formData when opportunity changes
  useEffect(() => {
    if (opportunity && isOpen) {
      setFormData(prev => ({
        ...prev,
        ...opportunity,
        // Ensure title is preserved
        title: opportunity.title || prev.title || '',
      }));
    }
  }, [opportunity, isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Track changes to detect unsaved changes
  useEffect(() => {
    if (opportunity) {
      const hasChanges =
        JSON.stringify(formData) !== JSON.stringify(opportunity);
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(
        formData.title !== '' || formData.description !== ''
      );
    }
  }, [formData, opportunity]);

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleStageChange = (stageId: string) => {
    const next = {
      ...formData,
      stage: stageId,
      updatedAt: new Date().toISOString(),
    };
    setFormData(next);
    // Use onStageChange if available, otherwise fall back to onSave
    if (onStageChange) {
      onStageChange(next);
    } else {
      onSave(next);
    }
  };

  const handleAddActivity = () => {
    if (!newActivity.title.trim()) return;

    const activity: Activity = {
      id: Date.now().toString(),
      type: newActivity.type,
      title: newActivity.title,
      description: newActivity.description,
      scheduledAt: newActivity.scheduledAt || undefined,
      status: newActivity.scheduledAt ? 'planned' : 'completed',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
    };

    setFormData(prev => ({
      ...prev,
      activities: [...(prev.activities || []), activity],
    }));

    setNewActivity({
      type: 'note',
      title: '',
      description: '',
      scheduledAt: '',
    });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()],
    }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  const getStageColor = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.color || 'gray';
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'call':
        return <Phone className='h-4 w-4' />;
      case 'email':
        return <Mail className='h-4 w-4' />;
      case 'meeting':
        return <Calendar className='h-4 w-4' />;
      case 'task':
        return <CheckCircle className='h-4 w-4' />;
      default:
        return <MessageSquare className='h-4 w-4' />;
    }
  };

  const getActivityStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
      onClick={e => {
        // Only close if clicking the backdrop itself
        console.log('Backdrop clicked:', e.target, e.currentTarget, e.target === e.currentTarget);
        if (e.target === e.currentTarget) {
          if (hasUnsavedChanges) {
            const shouldClose = window.confirm(
              'You have unsaved changes. Do you want to save before closing?'
            );
            if (shouldClose) {
              handleSave();
            } else {
              onClose();
            }
          } else {
            onClose();
          }
        }
      }}
      style={{ overflow: 'hidden' }}
    >
      <div
        ref={modalRef}
        className='bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-4'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              {formData.title || (opportunity ? 'Edit Opportunity' : 'New Opportunity')}
            </h2>
            {!isEditing && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsEditing(true)}
              >
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </Button>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {isEditing && (
              <>
                <Button variant='outline' onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className='h-4 w-4 mr-2' />
                  Save
                </Button>
              </>
            )}
            {onDelete && opportunity && (
              <Button
                variant='destructive'
                size='sm'
                onClick={() => {
                  onDelete(opportunity.id);
                  onClose();
                }}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            )}
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex-1 flex flex-col'
        >
          <TabsList className='mx-6 mt-4 overflow-x-auto no-scrollbar flex gap-2 pr-2'>
            <div className='flex gap-2 min-w-max'>
              <TabsTrigger className='shrink-0' value='main'>
                Main
              </TabsTrigger>
              <TabsTrigger className='shrink-0' value='activities'>
                Activities
              </TabsTrigger>
              <TabsTrigger className='shrink-0' value='email'>
                Email
              </TabsTrigger>
              <TabsTrigger className='shrink-0' value='calls'>
                Calls
              </TabsTrigger>
              <TabsTrigger className='shrink-0' value='documents'>
                Documents
              </TabsTrigger>
              <TabsTrigger className='shrink-0' value='settings'>
                Settings
              </TabsTrigger>
            </div>
          </TabsList>

          <div className='flex-1 overflow-y-auto p-6' style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Main Tab */}
            <TabsContent value='main' className='space-y-6'>
              {/* Deal Stage */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Activity className='h-5 w-5' />
                    Deal Stage
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Deal Stages Progress */}
                  <div className='mt-2'>
                    <div className='flex items-center justify-center'>
                      <div className='flex items-center space-x-1 p-1 rounded flex-wrap gap-2'>
                        {stages.map((stage, index) => {
                          const isActive = stage.id === formData.stage;
                          const isCompleted =
                            stages.findIndex(s => s.id === formData.stage) >
                            index;
                          const stageColor = stage.color.startsWith('#')
                            ? stage.color
                            : `#${stage.color}`;

                          return (
                            <div key={stage.id} className='flex items-center'>
                              <button
                                type='button'
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  isActive
                                    ? 'text-white shadow-lg'
                                    : isCompleted
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                                style={
                                  isActive
                                    ? { backgroundColor: stageColor }
                                    : {}
                                }
                                onClick={e => {
                                  console.log('Stage button clicked:', stage.name, e.target);
                                  e.stopPropagation(); // Prevent any event bubbling
                                  e.preventDefault(); // Prevent default behavior
                                  handleStageChange(stage.id);
                                }}
                              >
                                {stage.name}
                              </button>
                              {index < stages.length - 1 && (
                                <div
                                  className={`w-8 h-0.5 mx-2 ${
                                    isCompleted
                                      ? 'bg-green-500'
                                      : 'bg-gray-300 dark:bg-gray-600'
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opportunity Details */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Opportunity Details</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <Label htmlFor='title'>Title *</Label>
                      <Input
                        id='title'
                        value={formData.title}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        placeholder='Opportunity title'
                      />
                    </div>
                    <div>
                      <Label htmlFor='description'>Description</Label>
                      <Textarea
                        id='description'
                        value={formData.description}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        placeholder='Opportunity description'
                        rows={3}
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label htmlFor='amount'>Amount</Label>
                        <Input
                          id='amount'
                          type='number'
                          value={formData.amount || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              amount: Number(e.target.value) || 0,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder='0.00'
                        />
                      </div>
                      <div>
                        <Label htmlFor='source'>Source</Label>
                        <Input
                          id='source'
                          value={formData.source || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              source: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder='Lead source'
                        />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label htmlFor='startDate'>Start Date</Label>
                        <Input
                          id='startDate'
                          type='date'
                          value={formData.startDate || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor='endDate'>End Date</Label>
                        <Input
                          id='endDate'
                          type='date'
                          value={formData.endDate || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer & Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer & Contact</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <Label htmlFor='customer'>Customer</Label>
                      <div className='flex gap-2'>
                        <Input
                          id='customer'
                          value={formData.customer?.name || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              customer: {
                                ...prev.customer,
                                name: e.target.value,
                                id: prev.customer?.id || Date.now().toString(),
                              },
                            }))
                          }
                          disabled={!isEditing}
                          placeholder='Customer name'
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={!isEditing}
                        >
                          <Plus className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                    {formData.customer && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Building className='h-4 w-4 text-gray-500' />
                          <Input
                            value={formData.customer.email || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                customer: {
                                  ...prev.customer!,
                                  email: e.target.value,
                                },
                              }))
                            }
                            disabled={!isEditing}
                            placeholder='Customer email'
                          />
                        </div>
                        <div className='flex items-center gap-2'>
                          <Phone className='h-4 w-4 text-gray-500' />
                          <Input
                            value={formData.customer.phone || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                customer: {
                                  ...prev.customer!,
                                  phone: e.target.value,
                                },
                              }))
                            }
                            disabled={!isEditing}
                            placeholder='Customer phone'
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <Label htmlFor='contact'>Contact Person</Label>
                      <div className='flex gap-2'>
                        <Input
                          id='contact'
                          value={formData.contact?.name || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              contact: {
                                ...prev.contact,
                                name: e.target.value,
                                id: prev.contact?.id || Date.now().toString(),
                              },
                            }))
                          }
                          disabled={!isEditing}
                          placeholder='Contact person name'
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={!isEditing}
                        >
                          <Plus className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                    {formData.contact && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Mail className='h-4 w-4 text-gray-500' />
                          <Input
                            value={formData.contact.email || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                contact: {
                                  ...prev.contact!,
                                  email: e.target.value,
                                },
                              }))
                            }
                            disabled={!isEditing}
                            placeholder='Contact email'
                          />
                        </div>
                        <div className='flex items-center gap-2'>
                          <Phone className='h-4 w-4 text-gray-500' />
                          <Input
                            value={formData.contact.phone || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                contact: {
                                  ...prev.contact!,
                                  phone: e.target.value,
                                },
                              }))
                            }
                            disabled={!isEditing}
                            placeholder='Contact phone'
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Tag className='h-5 w-5' />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {formData.tags?.map((tag, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        {tag}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className='ml-1 hover:text-red-500'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className='flex gap-2'>
                      <Input
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        placeholder='Add a tag'
                        onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button onClick={handleAddTag} size='sm'>
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value='activities' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add New Activity */}
                  <div className='border rounded-lg p-4 mb-6'>
                    <h4 className='font-medium mb-4'>Add New Activity</h4>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <Label htmlFor='activityType'>Type</Label>
                          <Select
                            value={newActivity.type}
                            onValueChange={value =>
                              setNewActivity(prev => ({
                                ...prev,
                                type: value as Activity['type'],
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='note'>Note</SelectItem>
                              <SelectItem value='call'>Call</SelectItem>
                              <SelectItem value='email'>Email</SelectItem>
                              <SelectItem value='meeting'>Meeting</SelectItem>
                              <SelectItem value='task'>Task</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor='scheduledAt'>
                            Schedule (Optional)
                          </Label>
                          <Input
                            id='scheduledAt'
                            type='datetime-local'
                            value={newActivity.scheduledAt}
                            onChange={e =>
                              setNewActivity(prev => ({
                                ...prev,
                                scheduledAt: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor='activityTitle'>Title</Label>
                        <Input
                          id='activityTitle'
                          value={newActivity.title}
                          onChange={e =>
                            setNewActivity(prev => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder='Activity title'
                        />
                      </div>
                      <div>
                        <Label htmlFor='activityDescription'>Description</Label>
                        <Textarea
                          id='activityDescription'
                          value={newActivity.description}
                          onChange={e =>
                            setNewActivity(prev => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder='Activity description'
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleAddActivity}>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Activity
                      </Button>
                    </div>
                  </div>

                  {/* Activity List */}
                  <div className='space-y-4'>
                    {formData.activities?.map(activity => (
                      <div key={activity.id} className='border rounded-lg p-4'>
                        <div className='flex items-start gap-3'>
                          <div className='flex-shrink-0'>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-2'>
                              <h4 className='font-medium'>{activity.title}</h4>
                              <Badge
                                className={getActivityStatusColor(
                                  activity.status
                                )}
                              >
                                {activity.status}
                              </Badge>
                            </div>
                            {activity.description && (
                              <p className='text-gray-600 dark:text-gray-400 mb-2'>
                                {activity.description}
                              </p>
                            )}
                            <div className='flex items-center gap-4 text-sm text-gray-500'>
                              <span>By {activity.createdBy}</span>
                              <span>
                                {new Date(
                                  activity.createdAt
                                ).toLocaleDateString()}
                              </span>
                              {activity.scheduledAt && (
                                <span className='flex items-center gap-1'>
                                  <Clock className='h-3 w-3' />
                                  {new Date(
                                    activity.scheduledAt
                                  ).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!formData.activities ||
                      formData.activities.length === 0) && (
                      <div className='text-center py-8 text-gray-500'>
                        No activities yet. Add your first activity above.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value='email' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Mail className='h-5 w-5' />
                    Email Communications
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='h-96'>
                    <EmailList
                      emails={relatedEmails}
                      onEmailSelect={setSelectedEmail}
                      selectedEmailId={selectedEmail?.id}
                      opportunityId={opportunity?.id}
                      clientId={formData.customer?.id}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Email Preview */}
              {selectedEmail && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>{selectedEmail.subject}</CardTitle>
                    <div className='flex items-center gap-4 text-sm text-gray-600'>
                      <span>From: {selectedEmail.from.name} &lt;{selectedEmail.from.email}&gt;</span>
                      <span>To: {selectedEmail.to.map(t => t.name).join(', ')}</span>
                      <span>{new Date(selectedEmail.receivedAt).toLocaleString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className='prose max-w-none'
                      dangerouslySetInnerHTML={{ 
                        __html: selectedEmail.htmlBody || selectedEmail.body 
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value='calls'>
              <Card>
                <CardHeader>
                  <CardTitle>Call History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center py-8 text-gray-500'>
                    Call history coming soon...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='documents'>
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center py-8 text-gray-500'>
                    Document management coming soon...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='settings'>
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center py-8 text-gray-500'>
                    Opportunity-specific settings coming soon...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>,
    document.body
  );
}
