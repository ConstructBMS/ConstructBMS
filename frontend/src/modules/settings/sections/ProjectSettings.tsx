import {
  Clock,
  DollarSign,
  FileText,
  Settings,
  Shield,
  Target,
  Workflow,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui';

export function ProjectSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Project General Settings
  const [projectSettings, setProjectSettings] = useState({
    defaultProjectStatus: 'active',
    defaultProjectPriority: 'medium',
    autoArchiveCompleted: true,
    requireProjectCode: true,
    allowDuplicateNames: false,
    defaultProjectDuration: 90,
    defaultCurrency: 'GBP',
    timeTrackingEnabled: true,
    budgetTrackingEnabled: true,
    riskManagementEnabled: true,
    qualityAssuranceEnabled: true,
  });

  // Project Templates
  const [projectTemplates] = useState([
    {
      id: '1',
      name: 'Construction Project',
      description: 'Standard construction project template',
      phases: ['Planning', 'Design', 'Construction', 'Handover'],
      isDefault: true,
    },
    {
      id: '2',
      name: 'Renovation Project',
      description: 'Building renovation and refurbishment',
      phases: ['Assessment', 'Design', 'Construction', 'Completion'],
      isDefault: false,
    },
  ]);

  // Project Workflows
  const [workflows, setWorkflows] = useState([
    {
      id: '1',
      name: 'Standard Project Approval',
      steps: ['Initiation', 'Planning', 'Approval', 'Execution', 'Closure'],
      isActive: true,
    },
    {
      id: '2',
      name: 'Emergency Project',
      steps: [
        'Emergency Initiation',
        'Fast Track Approval',
        'Execution',
        'Review',
      ],
      isActive: false,
    },
  ]);

  // Project Permissions
  const [permissions, setPermissions] = useState({
    allowProjectCreation: true,
    allowProjectDeletion: false,
    requireApprovalForProjects: true,
    allowBudgetModification: false,
    allowScheduleModification: true,
    allowResourceAllocation: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Project settings saved:', projectSettings);
    } catch {
      setError('Failed to save project settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold'>Project Settings</h2>
        <p className='text-muted-foreground'>
          Configure project management settings, templates, and workflows.
        </p>
      </div>

      {error && (
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
          <p className='text-red-800 dark:text-red-200'>{error}</p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setError(null)}
            className='mt-2'
          >
            Dismiss
          </Button>
        </div>
      )}

      <Tabs defaultValue='general' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='general'>General</TabsTrigger>
          <TabsTrigger value='templates'>Templates</TabsTrigger>
          <TabsTrigger value='workflows'>Workflows</TabsTrigger>
          <TabsTrigger value='permissions'>Permissions</TabsTrigger>
          <TabsTrigger value='integrations'>Integrations</TabsTrigger>
        </TabsList>

        {/* General Project Settings */}
        <TabsContent value='general' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                General Project Settings
              </CardTitle>
              <CardDescription>
                Configure default project settings and behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='defaultStatus'>
                      Default Project Status
                    </Label>
                    <Select
                      value={projectSettings.defaultProjectStatus}
                      onValueChange={value =>
                        setProjectSettings(prev => ({
                          ...prev,
                          defaultProjectStatus: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='planning'>Planning</SelectItem>
                        <SelectItem value='on-hold'>On Hold</SelectItem>
                        <SelectItem value='completed'>Completed</SelectItem>
                        <SelectItem value='cancelled'>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='defaultPriority'>
                      Default Project Priority
                    </Label>
                    <Select
                      value={projectSettings.defaultProjectPriority}
                      onValueChange={value =>
                        setProjectSettings(prev => ({
                          ...prev,
                          defaultProjectPriority: value,
                        }))
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

                  <div>
                    <Label htmlFor='defaultDuration'>
                      Default Project Duration (days)
                    </Label>
                    <Input
                      id='defaultDuration'
                      type='number'
                      value={projectSettings.defaultProjectDuration}
                      onChange={e =>
                        setProjectSettings(prev => ({
                          ...prev,
                          defaultProjectDuration:
                            parseInt(e.target.value) || 90,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor='defaultCurrency'>Default Currency</Label>
                    <Select
                      value={projectSettings.defaultCurrency}
                      onValueChange={value =>
                        setProjectSettings(prev => ({
                          ...prev,
                          defaultCurrency: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='GBP'>GBP (£)</SelectItem>
                        <SelectItem value='USD'>USD ($)</SelectItem>
                        <SelectItem value='EUR'>EUR (€)</SelectItem>
                        <SelectItem value='CAD'>CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='autoArchive'>
                        Auto-archive completed projects
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Automatically move completed projects to archive
                      </p>
                    </div>
                    <Switch
                      id='autoArchive'
                      checked={projectSettings.autoArchiveCompleted}
                      onCheckedChange={checked =>
                        setProjectSettings(prev => ({
                          ...prev,
                          autoArchiveCompleted: checked,
                        }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='requireCode'>Require project codes</Label>
                      <p className='text-sm text-muted-foreground'>
                        All projects must have a unique project code
                      </p>
                    </div>
                    <Switch
                      id='requireCode'
                      checked={projectSettings.requireProjectCode}
                      onCheckedChange={checked =>
                        setProjectSettings(prev => ({
                          ...prev,
                          requireProjectCode: checked,
                        }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label htmlFor='allowDuplicates'>
                        Allow duplicate project names
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Multiple projects can have the same name
                      </p>
                    </div>
                    <Switch
                      id='allowDuplicates'
                      checked={projectSettings.allowDuplicateNames}
                      onCheckedChange={checked =>
                        setProjectSettings(prev => ({
                          ...prev,
                          allowDuplicateNames: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className='text-lg font-semibold mb-4'>Feature Toggles</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4' />
                      <Label htmlFor='timeTracking'>Time Tracking</Label>
                    </div>
                    <Switch
                      id='timeTracking'
                      checked={projectSettings.timeTrackingEnabled}
                      onCheckedChange={checked =>
                        setProjectSettings(prev => ({
                          ...prev,
                          timeTrackingEnabled: checked,
                        }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='h-4 w-4' />
                      <Label htmlFor='budgetTracking'>Budget Tracking</Label>
                    </div>
                    <Switch
                      id='budgetTracking'
                      checked={projectSettings.budgetTrackingEnabled}
                      onCheckedChange={checked =>
                        setProjectSettings(prev => ({
                          ...prev,
                          budgetTrackingEnabled: checked,
                        }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Target className='h-4 w-4' />
                      <Label htmlFor='riskManagement'>Risk Management</Label>
                    </div>
                    <Switch
                      id='riskManagement'
                      checked={projectSettings.riskManagementEnabled}
                      onCheckedChange={checked =>
                        setProjectSettings(prev => ({
                          ...prev,
                          riskManagementEnabled: checked,
                        }))
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Shield className='h-4 w-4' />
                      <Label htmlFor='qualityAssurance'>
                        Quality Assurance
                      </Label>
                    </div>
                    <Switch
                      id='qualityAssurance'
                      checked={projectSettings.qualityAssuranceEnabled}
                      onCheckedChange={checked =>
                        setProjectSettings(prev => ({
                          ...prev,
                          qualityAssuranceEnabled: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Templates */}
        <TabsContent value='templates' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                Project Templates
              </CardTitle>
              <CardDescription>
                Manage project templates for quick project creation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {projectTemplates.map(template => (
                  <div key={template.id} className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-semibold'>{template.name}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {template.description}
                        </p>
                        <div className='flex items-center gap-2 mt-2'>
                          {template.phases.map((phase, index) => (
                            <Badge key={index} variant='secondary'>
                              {phase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {template.isDefault && (
                          <Badge variant='default'>Default</Badge>
                        )}
                        <Button variant='outline' size='sm'>
                          Edit
                        </Button>
                        <Button variant='outline' size='sm'>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button className='w-full' variant='outline'>
                  <FileText className='h-4 w-4 mr-2' />
                  Add New Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Workflows */}
        <TabsContent value='workflows' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Workflow className='h-5 w-5' />
                Project Workflows
              </CardTitle>
              <CardDescription>
                Configure project approval and management workflows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {workflows.map(workflow => (
                  <div key={workflow.id} className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-semibold'>{workflow.name}</h3>
                        <div className='flex items-center gap-2 mt-2'>
                          {workflow.steps.map((step, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2'
                            >
                              <Badge variant='outline'>{step}</Badge>
                              {index < workflow.steps.length - 1 && (
                                <span className='text-muted-foreground'>→</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={workflow.isActive}
                          onCheckedChange={checked => {
                            setWorkflows(prev =>
                              prev.map(w =>
                                w.id === workflow.id
                                  ? { ...w, isActive: checked }
                                  : w
                              )
                            );
                          }}
                        />
                        <Button variant='outline' size='sm'>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button className='w-full' variant='outline'>
                  <Workflow className='h-4 w-4 mr-2' />
                  Add New Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Permissions */}
        <TabsContent value='permissions' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Project Permissions
              </CardTitle>
              <CardDescription>
                Configure who can perform different project actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='allowCreation'>
                      Allow Project Creation
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Users can create new projects
                    </p>
                  </div>
                  <Switch
                    id='allowCreation'
                    checked={permissions.allowProjectCreation}
                    onCheckedChange={checked =>
                      setPermissions(prev => ({
                        ...prev,
                        allowProjectCreation: checked,
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='allowDeletion'>
                      Allow Project Deletion
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Users can delete projects
                    </p>
                  </div>
                  <Switch
                    id='allowDeletion'
                    checked={permissions.allowProjectDeletion}
                    onCheckedChange={checked =>
                      setPermissions(prev => ({
                        ...prev,
                        allowProjectDeletion: checked,
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='requireApproval'>
                      Require Approval for Projects
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      All projects must be approved before starting
                    </p>
                  </div>
                  <Switch
                    id='requireApproval'
                    checked={permissions.requireApprovalForProjects}
                    onCheckedChange={checked =>
                      setPermissions(prev => ({
                        ...prev,
                        requireApprovalForProjects: checked,
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='allowBudgetMod'>
                      Allow Budget Modification
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Users can modify project budgets
                    </p>
                  </div>
                  <Switch
                    id='allowBudgetMod'
                    checked={permissions.allowBudgetModification}
                    onCheckedChange={checked =>
                      setPermissions(prev => ({
                        ...prev,
                        allowBudgetModification: checked,
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='allowScheduleMod'>
                      Allow Schedule Modification
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Users can modify project schedules
                    </p>
                  </div>
                  <Switch
                    id='allowScheduleMod'
                    checked={permissions.allowScheduleModification}
                    onCheckedChange={checked =>
                      setPermissions(prev => ({
                        ...prev,
                        allowScheduleModification: checked,
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='allowResourceAlloc'>
                      Allow Resource Allocation
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Users can allocate resources to projects
                    </p>
                  </div>
                  <Switch
                    id='allowResourceAlloc'
                    checked={permissions.allowResourceAllocation}
                    onCheckedChange={checked =>
                      setPermissions(prev => ({
                        ...prev,
                        allowResourceAllocation: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Integrations */}
        <TabsContent value='integrations' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='h-5 w-5' />
                Project Integrations
              </CardTitle>
              <CardDescription>
                Configure integrations with external project management tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='font-semibold'>Asta PowerProject</h3>
                      <p className='text-sm text-muted-foreground'>
                        Import and export project files from Asta PowerProject
                      </p>
                    </div>
                    <Button variant='outline' size='sm'>
                      Configure
                    </Button>
                  </div>
                </div>

                <div className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='font-semibold'>Microsoft Project</h3>
                      <p className='text-sm text-muted-foreground'>
                        Sync with Microsoft Project files
                      </p>
                    </div>
                    <Button variant='outline' size='sm'>
                      Configure
                    </Button>
                  </div>
                </div>

                <div className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='font-semibold'>Primavera P6</h3>
                      <p className='text-sm text-muted-foreground'>
                        Import from Oracle Primavera P6
                      </p>
                    </div>
                    <Button variant='outline' size='sm'>
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className='flex justify-end space-x-2'>
        <Button variant='outline'>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
