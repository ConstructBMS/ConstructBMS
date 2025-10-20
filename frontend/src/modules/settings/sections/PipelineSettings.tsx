import {
  AlertTriangle,
  BarChart3,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  GripVertical,
  MapPin,
  Plus,
  Save,
  Tag,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { usePipelineStore } from '../../../app/store/settings/pipeline.store';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui';

export function PipelineSettings() {
  const {
    settings,
    updatePipeline,
    addPipeline,
    deletePipeline,
    updateStage,
    addStage,
    deleteStage,
    updateBorderStyle,
    updateKanbanStyle,
  } = usePipelineStore();
  const [activeTab, setActiveTab] = useState('pipelines');
  const [editingPipeline, setEditingPipeline] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  const handleSave = async () => {
    console.log('Saving pipeline settings:', settings);
    // In a real app, this would save to the backend
  };

  const addNewPipeline = () => {
    const newPipeline = {
      name: 'New Pipeline',
      description: 'A new pipeline',
      isDefault: false,
      isActive: true,
      stages: [],
      permissions: {
        canEdit: ['admin'],
        canDelete: ['admin'],
        canView: ['admin', 'manager', 'sales'],
      },
    };
    addPipeline(newPipeline);
  };

  const addNewStage = (pipelineId: string) => {
    const newStage = {
      name: 'New Stage',
      description: 'A new stage',
      color: '#6b7280',
      order:
        settings.stages.filter(s => s.pipelineId === pipelineId).length + 1,
      probability: 50,
      isWon: false,
      isLost: false,
      isActive: true,
      pipelineId,
    };
    addStage(newStage);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Pipeline Settings</h2>
          <p className='text-muted-foreground'>
            Configure your sales pipelines and deal stages
          </p>
        </div>
        <Button onClick={handleSave}>Save Settings</Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='pipelines'>Pipelines</TabsTrigger>
          <TabsTrigger value='stages'>Deal Stages</TabsTrigger>
          <TabsTrigger value='card-display'>Card Display</TabsTrigger>
          <TabsTrigger value='opportunities'>Opportunity Settings</TabsTrigger>
          <TabsTrigger value='permissions'>Permissions</TabsTrigger>
        </TabsList>

        {/* Pipeline Management */}
        <TabsContent value='pipelines' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Management</CardTitle>
              <CardDescription>
                Create and manage multiple sales pipelines for different
                purposes.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='multiple-pipelines'>
                    Allow Multiple Pipelines
                  </Label>
                  <Switch
                    id='multiple-pipelines'
                    checked={settings.allowMultiplePipelines}
                    onCheckedChange={checked =>
                      // This would need to be implemented in the store
                      console.log('Allow multiple pipelines:', checked)
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='border-style'>Column Border Style</Label>
                  <select
                    id='border-style'
                    value={settings.columnBorderStyle}
                    onChange={e =>
                      updateBorderStyle(
                        e.target.value as 'solid' | 'dashed' | 'dotted'
                      )
                    }
                    className='px-3 py-1 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600'
                  >
                    <option value='solid'>Solid</option>
                    <option value='dashed'>Dashed</option>
                    <option value='dotted'>Dotted</option>
                  </select>
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='kanban-style'>Kanban Style</Label>
                  <select
                    id='kanban-style'
                    value={settings.kanbanStyle}
                    onChange={e =>
                      updateKanbanStyle(
                        e.target.value as 'colored-columns' | 'card-columns'
                      )
                    }
                    className='px-3 py-1 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600'
                  >
                    <option value='colored-columns'>Colored Columns</option>
                    <option value='card-columns'>Card Columns</option>
                  </select>
                </div>
              </div>

              <Separator />

              <div className='flex items-center justify-between'>
                <h4 className='font-medium'>Pipelines</h4>
                <Button onClick={addNewPipeline} size='sm'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Pipeline
                </Button>
              </div>

              <div className='space-y-3'>
                {settings.pipelines.map(pipeline => (
                  <Card key={pipeline.id} className='p-4'>
                    <div className='flex items-center justify-between'>
                      {editingPipeline === pipeline.id ? (
                        <div className='flex-1 grid grid-cols-2 gap-2'>
                          <Input
                            value={pipeline.name}
                            onChange={e =>
                              updatePipeline(pipeline.id, {
                                name: e.target.value,
                              })
                            }
                            placeholder='Pipeline name'
                          />
                          <Input
                            value={pipeline.description}
                            onChange={e =>
                              updatePipeline(pipeline.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder='Description'
                          />
                          <Button
                            size='sm'
                            onClick={() => setEditingPipeline(null)}
                          >
                            <Save className='h-4 w-4' />
                          </Button>
                        </div>
                      ) : (
                        <div className='flex-1 flex items-center gap-2'>
                          <h5 className='font-medium'>
                            {pipeline.name}{' '}
                            {pipeline.isDefault && <Badge>Default</Badge>}
                          </h5>
                          <p className='text-sm text-muted-foreground'>
                            {pipeline.description}
                          </p>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => setEditingPipeline(pipeline.id)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          {!pipeline.isDefault && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => setShowDeleteConfirm(pipeline.id)}
                              className='text-red-600 hover:text-red-700'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deal Stages */}
        <TabsContent value='stages' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Deal Stages</CardTitle>
              <CardDescription>
                Configure the stages that opportunities move through in your
                pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='auto-advance'>Auto-advance stages</Label>
                  <Switch
                    id='auto-advance'
                    checked={settings.autoAdvanceStages}
                    onCheckedChange={checked =>
                      // This would need to be implemented in the store
                      console.log('Auto-advance stages:', checked)
                    }
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='stage-notifications'>
                    Stage Notifications
                  </Label>
                  <Switch
                    id='stage-notifications'
                    checked={settings.stageNotifications}
                    onCheckedChange={checked =>
                      // This would need to be implemented in the store
                      console.log('Stage notifications:', checked)
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className='space-y-4'>
                {settings.pipelines.map(pipeline => (
                  <div key={pipeline.id}>
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='font-medium'>{pipeline.name} Stages</h4>
                      <Button
                        size='sm'
                        onClick={() => addNewStage(pipeline.id)}
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        Add Stage
                      </Button>
                    </div>
                    <div className='space-y-2'>
                      {settings.stages
                        .filter(stage => stage.pipelineId === pipeline.id)
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
                              <div className='flex-1 grid grid-cols-2 gap-2'>
                                <Input
                                  value={stage.name}
                                  onChange={e =>
                                    updateStage(stage.id, {
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder='Stage name'
                                />
                                <Input
                                  value={stage.description}
                                  onChange={e =>
                                    updateStage(stage.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder='Description'
                                />
                                <Input
                                  type='number'
                                  value={stage.probability}
                                  onChange={e =>
                                    updateStage(stage.id, {
                                      probability: parseInt(e.target.value),
                                    })
                                  }
                                  placeholder='Probability %'
                                />
                                <Input
                                  type='color'
                                  value={stage.color}
                                  onChange={e =>
                                    updateStage(stage.id, {
                                      color: e.target.value,
                                    })
                                  }
                                />
                                <Button
                                  size='sm'
                                  onClick={() => setEditingStage(null)}
                                >
                                  <Save className='h-4 w-4' />
                                </Button>
                              </div>
                            ) : (
                              <div className='flex-1'>
                                <div className='flex items-center gap-2'>
                                  <span className='font-medium'>
                                    {stage.name}
                                  </span>
                                  <Badge variant='outline'>
                                    {stage.probability}%
                                  </Badge>
                                  {stage.isWon && (
                                    <Badge variant='default'>Won</Badge>
                                  )}
                                  {stage.isLost && (
                                    <Badge variant='destructive'>Lost</Badge>
                                  )}
                                </div>
                                <p className='text-sm text-muted-foreground'>
                                  {stage.description}
                                </p>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => setEditingStage(stage.id)}
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => deleteStage(stage.id)}
                                  className='text-red-600 hover:text-red-700'
                                >
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card Display Settings */}
        <TabsContent value='card-display' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Card Display Settings</CardTitle>
              <CardDescription>
                Choose what information to display on opportunity cards in the
                pipeline view.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    <Label htmlFor='customer-name'>Customer Name</Label>
                  </div>
                  <Switch id='customer-name' defaultChecked />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    <Label htmlFor='customer-address'>Customer Address</Label>
                  </div>
                  <Switch id='customer-address' />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <DollarSign className='h-4 w-4' />
                    <Label htmlFor='opportunity-value'>Opportunity Value</Label>
                  </div>
                  <Switch id='opportunity-value' defaultChecked />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4' />
                    <Label htmlFor='salesperson'>Salesperson</Label>
                  </div>
                  <Switch id='salesperson' defaultChecked />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Tag className='h-4 w-4' />
                    <Label htmlFor='tags'>Tags</Label>
                  </div>
                  <Switch id='tags' defaultChecked />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    <Label htmlFor='due-date'>Due Date</Label>
                  </div>
                  <Switch id='due-date' defaultChecked />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <BarChart3 className='h-4 w-4' />
                    <Label htmlFor='probability'>Probability</Label>
                  </div>
                  <Switch id='probability' defaultChecked />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Eye className='h-4 w-4' />
                    <Label htmlFor='stage-progress'>Stage Progress</Label>
                  </div>
                  <Switch id='stage-progress' defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value='permissions' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Configure who can view, edit, and delete pipelines and stages.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex items-start gap-3'>
                <AlertTriangle className='h-4 w-4 text-yellow-600 mt-0.5' />
                <div className='text-sm text-yellow-800'>
                  Only admin and super admin users can manage pipeline settings,
                  delete pipelines, and create new pipelines. Regular users can
                  edit pipeline names and stages but cannot delete them or
                  change system settings.
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <h4 className='font-medium mb-2'>Default Permissions</h4>
                  <div className='grid grid-cols-3 gap-4 text-sm'>
                    <div>
                      <Label className='font-medium'>View</Label>
                      <p className='text-muted-foreground'>
                        Admin, Manager, Sales
                      </p>
                    </div>
                    <div>
                      <Label className='font-medium'>Edit</Label>
                      <p className='text-muted-foreground'>Admin, Manager</p>
                    </div>
                    <div>
                      <Label className='font-medium'>Delete</Label>
                      <p className='text-muted-foreground'>
                        Admin, Super Admin
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunity Settings */}
        <TabsContent value='opportunities' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Settings</CardTitle>
              <CardDescription>
                Configure default settings for opportunities and their behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='auto-advance'>
                      Auto-advance Opportunities
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Automatically move opportunities to the next stage based
                      on criteria
                    </p>
                  </div>
                  <Switch
                    id='auto-advance'
                    checked={settings.autoAdvanceStages}
                    onCheckedChange={checked => {
                      // This would need to be implemented in the store
                      console.log('Auto-advance stages:', checked);
                    }}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='stage-notifications'>
                      Stage Notifications
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Send notifications when opportunities move between stages
                    </p>
                  </div>
                  <Switch
                    id='stage-notifications'
                    checked={settings.stageNotifications}
                    onCheckedChange={checked => {
                      // This would need to be implemented in the store
                      console.log('Stage notifications:', checked);
                    }}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='require-customer'>Require Customer</Label>
                    <p className='text-sm text-muted-foreground'>
                      Make customer information mandatory for new opportunities
                    </p>
                  </div>
                  <Switch
                    id='require-customer'
                    checked={false}
                    onCheckedChange={checked => {
                      console.log('Require customer:', checked);
                    }}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='require-amount'>Require Amount</Label>
                    <p className='text-sm text-muted-foreground'>
                      Make amount field mandatory for new opportunities
                    </p>
                  </div>
                  <Switch
                    id='require-amount'
                    checked={false}
                    onCheckedChange={checked => {
                      console.log('Require amount:', checked);
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className='space-y-4'>
                <h4 className='font-medium'>Default Values</h4>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='default-source'>Default Source</Label>
                    <Input
                      id='default-source'
                      placeholder='e.g., Website, Referral, Cold Call'
                      value=''
                      onChange={e =>
                        console.log('Default source:', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='default-owner'>Default Owner</Label>
                    <Input
                      id='default-owner'
                      placeholder='Default opportunity owner'
                      value=''
                      onChange={e =>
                        console.log('Default owner:', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className='space-y-4'>
                <h4 className='font-medium'>Activity Settings</h4>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='auto-log-activities'>
                        Auto-log Activities
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Automatically create activity entries for stage changes
                      </p>
                    </div>
                    <Switch
                      id='auto-log-activities'
                      checked={false}
                      onCheckedChange={checked => {
                        console.log('Auto-log activities:', checked);
                      }}
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='reminder-notifications'>
                        Reminder Notifications
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Send reminders for scheduled activities
                      </p>
                    </div>
                    <Switch
                      id='reminder-notifications'
                      checked={false}
                      onCheckedChange={checked => {
                        console.log('Reminder notifications:', checked);
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <Card className='w-96'>
            <CardHeader>
              <CardTitle>Delete Pipeline</CardTitle>
              <CardDescription>
                Are you sure you want to delete this pipeline? This action
                cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={() => {
                  deletePipeline(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
