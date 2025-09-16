import { useState } from 'react';
import { Plus, Trash2, Edit, Save, GripVertical } from 'lucide-react';
import { useSettingsStore } from '../store';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Badge,
  Separator,
} from '../../../components/ui';

export function CRM() {
  const {
    crmSettings,
    isLoading,
    isSaving,
    error,
    updateCRMSettings,
    saveCRMSettings,
    addCustomField,
    updateCustomField,
    removeCustomField,
    addLeadSource,
    updateLeadSource,
    removeLeadSource,
    addLeadStatus,
    updateLeadStatus,
    removeLeadStatus,
    addPipelineStage,
    updatePipelineStage,
    removePipelineStage,
    addEmailTemplate,
    updateEmailTemplate,
    removeEmailTemplate,
    clearError,
  } = useSettingsStore();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const handleSave = async () => {
    await saveCRMSettings();
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>CRM Settings</h3>
          <p className='text-sm text-muted-foreground'>
            Configure your customer relationship management settings.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {error && (
        <div className='p-4 border border-destructive rounded-lg bg-destructive/10'>
          <p className='text-sm text-destructive'>{error}</p>
          <Button
            variant='outline'
            size='sm'
            onClick={clearError}
            className='mt-2'
          >
            Dismiss
          </Button>
        </div>
      )}

      <Tabs defaultValue='contacts' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='contacts'>Contacts</TabsTrigger>
          <TabsTrigger value='leads'>Leads</TabsTrigger>
          <TabsTrigger value='pipeline'>Pipeline</TabsTrigger>
          <TabsTrigger value='communication'>Communication</TabsTrigger>
          <TabsTrigger value='integrations'>Integrations</TabsTrigger>
          <TabsTrigger value='automation'>Automation</TabsTrigger>
        </TabsList>

        {/* Contact Management */}
        <TabsContent value='contacts' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Contact Management</CardTitle>
              <CardDescription>
                Configure how contacts are managed and organized.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='auto-assign'>Auto-assign contacts</Label>
                  <Switch
                    id='auto-assign'
                    checked={crmSettings.contactManagement.autoAssignContacts}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        contactManagement: {
                          ...crmSettings.contactManagement,
                          autoAssignContacts: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='duplicate-detection'>
                    Duplicate detection
                  </Label>
                  <Switch
                    id='duplicate-detection'
                    checked={crmSettings.contactManagement.duplicateDetection}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        contactManagement: {
                          ...crmSettings.contactManagement,
                          duplicateDetection: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='require-email'>Require email</Label>
                  <Switch
                    id='require-email'
                    checked={crmSettings.contactManagement.requireEmail}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        contactManagement: {
                          ...crmSettings.contactManagement,
                          requireEmail: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='require-phone'>Require phone</Label>
                  <Switch
                    id='require-phone'
                    checked={crmSettings.contactManagement.requirePhone}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        contactManagement: {
                          ...crmSettings.contactManagement,
                          requirePhone: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='default-contact-type'>
                  Default contact type
                </Label>
                <Select
                  value={crmSettings.contactManagement.defaultContactType}
                  onValueChange={(value: 'person' | 'company') =>
                    updateCRMSettings({
                      contactManagement: {
                        ...crmSettings.contactManagement,
                        defaultContactType: value,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='person'>Person</SelectItem>
                    <SelectItem value='company'>Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <div className='flex items-center justify-between mb-4'>
                  <h4 className='font-medium'>Custom Fields</h4>
                  <Button
                    size='sm'
                    onClick={() => {
                      const newField = {
                        id: Date.now().toString(),
                        name: 'New Field',
                        type: 'text' as const,
                        required: false,
                        description: '',
                      };
                      addCustomField(newField);
                      setEditingField(newField.id);
                    }}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Field
                  </Button>
                </div>
                <div className='space-y-2'>
                  {crmSettings.contactManagement.customFields.map(field => (
                    <div
                      key={field.id}
                      className='flex items-center gap-2 p-2 border rounded'
                    >
                      <GripVertical className='h-4 w-4 text-muted-foreground' />
                      {editingField === field.id ? (
                        <div className='flex-1 grid grid-cols-3 gap-2'>
                          <Input
                            value={field.name}
                            onChange={e =>
                              updateCustomField(field.id, {
                                name: e.target.value,
                              })
                            }
                            placeholder='Field name'
                          />
                          <Select
                            value={field.type}
                            onValueChange={(value: any) =>
                              updateCustomField(field.id, { type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='text'>Text</SelectItem>
                              <SelectItem value='number'>Number</SelectItem>
                              <SelectItem value='date'>Date</SelectItem>
                              <SelectItem value='select'>Select</SelectItem>
                              <SelectItem value='boolean'>Boolean</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className='flex gap-1'>
                            <Button
                              size='sm'
                              onClick={() => setEditingField(null)}
                            >
                              <Save className='h-4 w-4' />
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                removeCustomField(field.id);
                                setEditingField(null);
                              }}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className='flex-1'>
                            <span className='font-medium'>{field.name}</span>
                            <Badge variant='secondary' className='ml-2'>
                              {field.type}
                            </Badge>
                            {field.required && (
                              <Badge variant='destructive' className='ml-1'>
                                Required
                              </Badge>
                            )}
                          </div>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setEditingField(field.id)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Management */}
        <TabsContent value='leads' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                Configure lead sources, statuses, and conversion rules.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='lead-scoring'>Lead scoring</Label>
                  <Switch
                    id='lead-scoring'
                    checked={crmSettings.leadManagement.leadScoring}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        leadManagement: {
                          ...crmSettings.leadManagement,
                          leadScoring: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='auto-assignment'>Auto lead assignment</Label>
                  <Switch
                    id='auto-assignment'
                    checked={crmSettings.leadManagement.autoLeadAssignment}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        leadManagement: {
                          ...crmSettings.leadManagement,
                          autoLeadAssignment: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='follow-up-reminders'>
                    Follow-up reminders
                  </Label>
                  <Switch
                    id='follow-up-reminders'
                    checked={crmSettings.leadManagement.followUpReminders}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        leadManagement: {
                          ...crmSettings.leadManagement,
                          followUpReminders: checked,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='reminder-days'>Reminder days</Label>
                  <Input
                    id='reminder-days'
                    type='number'
                    value={crmSettings.leadManagement.reminderDays}
                    onChange={e =>
                      updateCRMSettings({
                        leadManagement: {
                          ...crmSettings.leadManagement,
                          reminderDays: parseInt(e.target.value) || 3,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Lead Sources */}
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <h4 className='font-medium'>Lead Sources</h4>
                  <Button
                    size='sm'
                    onClick={() => {
                      const newSource = {
                        id: Date.now().toString(),
                        name: 'New Source',
                        description: '',
                        isActive: true,
                        color: '#3b82f6',
                      };
                      addLeadSource(newSource);
                      setEditingSource(newSource.id);
                    }}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Source
                  </Button>
                </div>
                <div className='space-y-2'>
                  {crmSettings.leadManagement.leadSources.map(source => (
                    <div
                      key={source.id}
                      className='flex items-center gap-2 p-2 border rounded'
                    >
                      <div
                        className='w-4 h-4 rounded-full'
                        style={{ backgroundColor: source.color }}
                      />
                      {editingSource === source.id ? (
                        <div className='flex-1 grid grid-cols-3 gap-2'>
                          <Input
                            value={source.name}
                            onChange={e =>
                              updateLeadSource(source.id, {
                                name: e.target.value,
                              })
                            }
                            placeholder='Source name'
                          />
                          <Input
                            value={source.description}
                            onChange={e =>
                              updateLeadSource(source.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder='Description'
                          />
                          <div className='flex gap-1'>
                            <Button
                              size='sm'
                              onClick={() => setEditingSource(null)}
                            >
                              <Save className='h-4 w-4' />
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                removeLeadSource(source.id);
                                setEditingSource(null);
                              }}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className='flex-1'>
                            <span className='font-medium'>{source.name}</span>
                            {source.description && (
                              <span className='text-sm text-muted-foreground ml-2'>
                                {source.description}
                              </span>
                            )}
                            {!source.isActive && (
                              <Badge variant='secondary' className='ml-2'>
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setEditingSource(source.id)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Lead Statuses */}
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <h4 className='font-medium'>Lead Statuses</h4>
                  <Button
                    size='sm'
                    onClick={() => {
                      const newStatus = {
                        id: Date.now().toString(),
                        name: 'New Status',
                        description: '',
                        isActive: true,
                        isWon: false,
                        isLost: false,
                        color: '#6b7280',
                        order:
                          crmSettings.leadManagement.leadStatuses.length + 1,
                      };
                      addLeadStatus(newStatus);
                      setEditingStatus(newStatus.id);
                    }}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Status
                  </Button>
                </div>
                <div className='space-y-2'>
                  {crmSettings.leadManagement.leadStatuses
                    .sort((a, b) => a.order - b.order)
                    .map(status => (
                      <div
                        key={status.id}
                        className='flex items-center gap-2 p-2 border rounded'
                      >
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{ backgroundColor: status.color }}
                        />
                        {editingStatus === status.id ? (
                          <div className='flex-1 grid grid-cols-4 gap-2'>
                            <Input
                              value={status.name}
                              onChange={e =>
                                updateLeadStatus(status.id, {
                                  name: e.target.value,
                                })
                              }
                              placeholder='Status name'
                            />
                            <Input
                              value={status.description}
                              onChange={e =>
                                updateLeadStatus(status.id, {
                                  description: e.target.value,
                                })
                              }
                              placeholder='Description'
                            />
                            <Input
                              type='number'
                              value={status.order}
                              onChange={e =>
                                updateLeadStatus(status.id, {
                                  order: parseInt(e.target.value) || 1,
                                })
                              }
                              placeholder='Order'
                            />
                            <div className='flex gap-1'>
                              <Button
                                size='sm'
                                onClick={() => setEditingStatus(null)}
                              >
                                <Save className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                  removeLeadStatus(status.id);
                                  setEditingStatus(null);
                                }}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className='flex-1'>
                              <span className='font-medium'>{status.name}</span>
                              {status.description && (
                                <span className='text-sm text-muted-foreground ml-2'>
                                  {status.description}
                                </span>
                              )}
                              <div className='flex gap-1 mt-1'>
                                {status.isWon && (
                                  <Badge variant='default'>Won</Badge>
                                )}
                                {status.isLost && (
                                  <Badge variant='destructive'>Lost</Badge>
                                )}
                                {!status.isActive && (
                                  <Badge variant='secondary'>Inactive</Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => setEditingStatus(status.id)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Management */}
        <TabsContent value='pipeline' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Management</CardTitle>
              <CardDescription>
                Configure your sales pipeline stages and automation.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='auto-advance'>Auto-advance stages</Label>
                  <Switch
                    id='auto-advance'
                    checked={crmSettings.pipelineManagement.autoAdvanceStages}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        pipelineManagement: {
                          ...crmSettings.pipelineManagement,
                          autoAdvanceStages: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='pipeline-notifications'>
                    Pipeline notifications
                  </Label>
                  <Switch
                    id='pipeline-notifications'
                    checked={
                      crmSettings.pipelineManagement.pipelineNotifications
                    }
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        pipelineManagement: {
                          ...crmSettings.pipelineManagement,
                          pipelineNotifications: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Pipeline Stages */}
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <h4 className='font-medium'>Pipeline Stages</h4>
                  <Button
                    size='sm'
                    onClick={() => {
                      const newStage = {
                        id: Date.now().toString(),
                        name: 'New Stage',
                        description: '',
                        order: crmSettings.pipelineManagement.stages.length + 1,
                        isActive: true,
                        color: '#6b7280',
                        probability: 50,
                        isWon: false,
                        isLost: false,
                      };
                      addPipelineStage(newStage);
                      setEditingStage(newStage.id);
                    }}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Stage
                  </Button>
                </div>
                <div className='space-y-2'>
                  {crmSettings.pipelineManagement.stages
                    .sort((a, b) => a.order - b.order)
                    .map(stage => (
                      <div
                        key={stage.id}
                        className='flex items-center gap-2 p-2 border rounded'
                      >
                        <GripVertical className='h-4 w-4 text-muted-foreground' />
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{ backgroundColor: stage.color }}
                        />
                        {editingStage === stage.id ? (
                          <div className='flex-1 grid grid-cols-5 gap-2'>
                            <Input
                              value={stage.name}
                              onChange={e =>
                                updatePipelineStage(stage.id, {
                                  name: e.target.value,
                                })
                              }
                              placeholder='Stage name'
                            />
                            <Input
                              value={stage.description}
                              onChange={e =>
                                updatePipelineStage(stage.id, {
                                  description: e.target.value,
                                })
                              }
                              placeholder='Description'
                            />
                            <Input
                              type='number'
                              value={stage.probability}
                              onChange={e =>
                                updatePipelineStage(stage.id, {
                                  probability: parseInt(e.target.value) || 0,
                                })
                              }
                              placeholder='Probability %'
                            />
                            <Input
                              type='number'
                              value={stage.order}
                              onChange={e =>
                                updatePipelineStage(stage.id, {
                                  order: parseInt(e.target.value) || 1,
                                })
                              }
                              placeholder='Order'
                            />
                            <div className='flex gap-1'>
                              <Button
                                size='sm'
                                onClick={() => setEditingStage(null)}
                              >
                                <Save className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                  removePipelineStage(stage.id);
                                  setEditingStage(null);
                                }}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className='flex-1'>
                              <span className='font-medium'>{stage.name}</span>
                              {stage.description && (
                                <span className='text-sm text-muted-foreground ml-2'>
                                  {stage.description}
                                </span>
                              )}
                              <div className='flex gap-1 mt-1'>
                                <Badge variant='outline'>
                                  {stage.probability}%
                                </Badge>
                                {stage.isWon && (
                                  <Badge variant='default'>Won</Badge>
                                )}
                                {stage.isLost && (
                                  <Badge variant='destructive'>Lost</Badge>
                                )}
                                {!stage.isActive && (
                                  <Badge variant='secondary'>Inactive</Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => setEditingStage(stage.id)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication */}
        <TabsContent value='communication' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Communication Settings</CardTitle>
              <CardDescription>
                Configure email templates and communication preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='sms-enabled'>SMS enabled</Label>
                  <Switch
                    id='sms-enabled'
                    checked={crmSettings.communication.smsEnabled}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        communication: {
                          ...crmSettings.communication,
                          smsEnabled: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='call-logging'>Call logging</Label>
                  <Switch
                    id='call-logging'
                    checked={crmSettings.communication.callLogging}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        communication: {
                          ...crmSettings.communication,
                          callLogging: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='meeting-scheduling'>Meeting scheduling</Label>
                  <Switch
                    id='meeting-scheduling'
                    checked={crmSettings.communication.meetingScheduling}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        communication: {
                          ...crmSettings.communication,
                          meetingScheduling: checked,
                        },
                      })
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='auto-follow-up'>Auto follow-up</Label>
                  <Switch
                    id='auto-follow-up'
                    checked={crmSettings.communication.autoFollowUp}
                    onCheckedChange={checked =>
                      updateCRMSettings({
                        communication: {
                          ...crmSettings.communication,
                          autoFollowUp: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Email Templates */}
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <h4 className='font-medium'>Email Templates</h4>
                  <Button
                    size='sm'
                    onClick={() => {
                      const newTemplate = {
                        id: Date.now().toString(),
                        name: 'New Template',
                        subject: 'Subject',
                        body: 'Email body content...',
                        type: 'custom' as const,
                        isActive: true,
                        variables: [],
                      };
                      addEmailTemplate(newTemplate);
                      setEditingTemplate(newTemplate.id);
                    }}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Template
                  </Button>
                </div>
                <div className='space-y-4'>
                  {crmSettings.communication.emailTemplates.map(template => (
                    <div key={template.id} className='border rounded-lg p-4'>
                      {editingTemplate === template.id ? (
                        <div className='space-y-4'>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <Label htmlFor={`template-name-${template.id}`}>
                                Template Name
                              </Label>
                              <Input
                                id={`template-name-${template.id}`}
                                value={template.name}
                                onChange={e =>
                                  updateEmailTemplate(template.id, {
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`template-type-${template.id}`}>
                                Type
                              </Label>
                              <Select
                                value={template.type}
                                onValueChange={(value: any) =>
                                  updateEmailTemplate(template.id, {
                                    type: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='welcome'>
                                    Welcome
                                  </SelectItem>
                                  <SelectItem value='follow_up'>
                                    Follow Up
                                  </SelectItem>
                                  <SelectItem value='proposal'>
                                    Proposal
                                  </SelectItem>
                                  <SelectItem value='contract'>
                                    Contract
                                  </SelectItem>
                                  <SelectItem value='custom'>Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`template-subject-${template.id}`}>
                              Subject
                            </Label>
                            <Input
                              id={`template-subject-${template.id}`}
                              value={template.subject}
                              onChange={e =>
                                updateEmailTemplate(template.id, {
                                  subject: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`template-body-${template.id}`}>
                              Body
                            </Label>
                            <Textarea
                              id={`template-body-${template.id}`}
                              value={template.body}
                              onChange={e =>
                                updateEmailTemplate(template.id, {
                                  body: e.target.value,
                                })
                              }
                              rows={6}
                            />
                          </div>
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              onClick={() => setEditingTemplate(null)}
                            >
                              <Save className='h-4 w-4 mr-2' />
                              Save
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                removeEmailTemplate(template.id);
                                setEditingTemplate(null);
                              }}
                            >
                              <Trash2 className='h-4 w-4 mr-2' />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className='flex items-center justify-between mb-2'>
                            <div>
                              <h5 className='font-medium'>{template.name}</h5>
                              <p className='text-sm text-muted-foreground'>
                                {template.subject}
                              </p>
                            </div>
                            <div className='flex gap-2'>
                              <Badge
                                variant={
                                  template.isActive ? 'default' : 'secondary'
                                }
                              >
                                {template.type}
                              </Badge>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => setEditingTemplate(template.id)}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                          <div className='text-sm text-muted-foreground bg-muted p-2 rounded'>
                            {template.body.substring(0, 100)}...
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value='integrations' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect with external services and tools.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='p-4 border rounded-lg'>
                  <h4 className='font-medium mb-2'>Email Provider</h4>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Connect your email service for automated communications.
                  </p>
                  <Button variant='outline' size='sm'>
                    Configure
                  </Button>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h4 className='font-medium mb-2'>Calendar</h4>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Sync with your calendar for meeting scheduling.
                  </p>
                  <Button variant='outline' size='sm'>
                    Configure
                  </Button>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h4 className='font-medium mb-2'>Phone System</h4>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Integrate with your phone system for call logging.
                  </p>
                  <Button variant='outline' size='sm'>
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation */}
        <TabsContent value='automation' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Automation</CardTitle>
              <CardDescription>
                Set up automated workflows and triggers.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='automation-enabled'>Enable automation</Label>
                <Switch
                  id='automation-enabled'
                  checked={crmSettings.automation.enabled}
                  onCheckedChange={checked =>
                    updateCRMSettings({
                      automation: {
                        ...crmSettings.automation,
                        enabled: checked,
                      },
                    })
                  }
                />
              </div>
              <div className='p-4 border rounded-lg bg-muted/50'>
                <p className='text-sm text-muted-foreground'>
                  Automation features are coming soon. You'll be able to create
                  custom workflows, set up triggers, and automate repetitive
                  tasks.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
