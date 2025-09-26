import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Grid,
  Layout,
  Palette,
  PieChart,
  Plus,
  Settings,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import { Textarea } from '../../../components/ui/textarea';
import { useDashboardStore } from '../store';

interface DashboardBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId?: string;
}

// Comprehensive widget types for construction business
const WIDGET_TYPES = [
  // Project Management Widgets
  {
    id: 'project-overview',
    name: 'Project Overview',
    icon: Building2,
    description: 'High-level project status and metrics',
    category: 'Projects',
    color: 'bg-blue-500',
  },
  {
    id: 'project-timeline',
    name: 'Project Timeline',
    icon: Calendar,
    description: 'Visual project timeline and milestones',
    category: 'Projects',
    color: 'bg-green-500',
  },
  {
    id: 'project-status',
    name: 'Project Status',
    icon: CheckCircle,
    description: 'Current status of all projects',
    category: 'Projects',
    color: 'bg-emerald-500',
  },
  {
    id: 'project-budget',
    name: 'Project Budget',
    icon: DollarSign,
    description: 'Budget tracking and cost analysis',
    category: 'Projects',
    color: 'bg-yellow-500',
  },
  {
    id: 'project-team',
    name: 'Project Team',
    icon: Users,
    description: 'Team members and assignments',
    category: 'Projects',
    color: 'bg-purple-500',
  },
  {
    id: 'project-tasks',
    name: 'Project Tasks',
    icon: CheckCircle,
    description: 'Task management and progress',
    category: 'Projects',
    color: 'bg-indigo-500',
  },
  {
    id: 'project-documents',
    name: 'Project Documents',
    icon: FileText,
    description: 'Document management and files',
    category: 'Projects',
    color: 'bg-gray-500',
  },
  {
    id: 'project-schedule',
    name: 'Project Schedule',
    icon: Clock,
    description: 'Scheduling and deadlines',
    category: 'Projects',
    color: 'bg-orange-500',
  },

  // Financial Widgets
  {
    id: 'revenue-chart',
    name: 'Revenue Chart',
    icon: TrendingUp,
    description: 'Revenue trends and projections',
    category: 'Financial',
    color: 'bg-green-600',
  },
  {
    id: 'expense-breakdown',
    name: 'Expense Breakdown',
    icon: PieChart,
    description: 'Detailed expense analysis',
    category: 'Financial',
    color: 'bg-red-500',
  },
  {
    id: 'profit-margin',
    name: 'Profit Margin',
    icon: BarChart3,
    description: 'Profit margin analysis',
    category: 'Financial',
    color: 'bg-teal-500',
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow',
    icon: DollarSign,
    description: 'Cash flow projections',
    category: 'Financial',
    color: 'bg-blue-600',
  },

  // General Widgets
  {
    id: 'stats-grid',
    name: 'Statistics Grid',
    icon: Grid,
    description: 'Key performance indicators',
    category: 'General',
    color: 'bg-slate-500',
  },
  {
    id: 'activity-feed',
    name: 'Activity Feed',
    icon: Clock,
    description: 'Recent activities and updates',
    category: 'General',
    color: 'bg-cyan-500',
  },
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    icon: Settings,
    description: 'Frequently used actions',
    category: 'General',
    color: 'bg-pink-500',
  },
];

// Layout templates
const LAYOUT_TEMPLATES = [
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Perfect for project oversight',
    preview: '🏗️📊👥',
    layout: [
      { type: 'project-overview', size: 'full' },
      { type: 'project-status', size: 'half' },
      { type: 'project-timeline', size: 'half' },
      { type: 'project-budget', size: 'half' },
      { type: 'project-team', size: 'half' },
    ],
  },
  {
    id: 'financial-overview',
    name: 'Financial Overview',
    description: 'Comprehensive financial dashboard',
    preview: '💰📈📊',
    layout: [
      { type: 'revenue-chart', size: 'full' },
      { type: 'expense-breakdown', size: 'half' },
      { type: 'profit-margin', size: 'half' },
      { type: 'cash-flow', size: 'full' },
    ],
  },
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level business overview',
    preview: '📊📈💼',
    layout: [
      { type: 'stats-grid', size: 'full' },
      { type: 'project-overview', size: 'half' },
      { type: 'revenue-chart', size: 'half' },
      { type: 'activity-feed', size: 'full' },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Day-to-day operations focus',
    preview: '⚙️📋👷',
    layout: [
      { type: 'project-tasks', size: 'full' },
      { type: 'project-schedule', size: 'half' },
      { type: 'project-documents', size: 'half' },
      { type: 'quick-actions', size: 'full' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Build from scratch',
    preview: '🎨',
    layout: [],
  },
];

export function DashboardBuilder({
  isOpen,
  onClose,
  dashboardId,
}: DashboardBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('project-manager');
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [customLayout, setCustomLayout] = useState<any[]>([]);
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('');

  const addDashboard = useDashboardStore(state => state.addDashboard);
  const updateDashboard = useDashboardStore(state => state.updateDashboard);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleWidgetToggle = (widgetId: string) => {
    setSelectedWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleFinish = () => {
    if (!dashboardName.trim()) return;

    // Get the selected template
    const template = LAYOUT_TEMPLATES.find(t => t.id === selectedTemplate);

    // Create widgets based on template or selected widgets
    let widgets = [];
    if (selectedTemplate === 'custom') {
      // Use selected widgets for custom layout
      widgets = selectedWidgets.map(widgetId => ({
        id: `${widgetId}-${Date.now()}`,
        type: widgetId,
        title: WIDGET_TYPES.find(w => w.id === widgetId)?.name || 'Widget',
        data: getDefaultWidgetData(widgetId),
      }));
    } else if (template) {
      // Use template layout
      widgets = template.layout.map((item, index) => ({
        id: `${item.type}-${index}-${Date.now()}`,
        type: item.type,
        title: WIDGET_TYPES.find(w => w.id === item.type)?.name || 'Widget',
        data: getDefaultWidgetData(item.type),
      }));
    }

    if (dashboardId) {
      // Update existing dashboard
      updateDashboard(dashboardId, {
        name: dashboardName.trim(),
        description: dashboardDescription.trim() || undefined,
        widgets,
      });
    } else {
      // Create new dashboard
      addDashboard({
        name: dashboardName.trim(),
        description: dashboardDescription.trim() || undefined,
        widgets,
      });
    }

    // Reset form
    setCurrentStep(1);
    setSelectedTemplate('project-manager');
    setSelectedWidgets([]);
    setCustomLayout([]);
    setDashboardName('');
    setDashboardDescription('');
    onClose();
  };

  const getDefaultWidgetData = (widgetType: string) => {
    switch (widgetType) {
      case 'project-overview':
        return {
          stats: [
            {
              label: 'Active Projects',
              value: '12',
              change: '+2',
              trend: 'up',
            },
            { label: 'Completed', value: '8', change: '+1', trend: 'up' },
            { label: 'On Hold', value: '2', change: '0', trend: 'neutral' },
            {
              label: 'Total Budget',
              value: '£2.4M',
              change: '+5%',
              trend: 'up',
            },
          ],
        };
      case 'project-status':
        return {
          projects: [
            {
              name: 'Office Building',
              status: 'In Progress',
              progress: 75,
              color: 'bg-blue-500',
            },
            {
              name: 'Warehouse',
              status: 'Planning',
              progress: 25,
              color: 'bg-yellow-500',
            },
            {
              name: 'Retail Space',
              status: 'Review',
              progress: 90,
              color: 'bg-green-500',
            },
          ],
        };
      case 'revenue-chart':
        return {
          type: 'line',
          data: [
            { month: 'Jan', revenue: 32000 },
            { month: 'Feb', revenue: 28000 },
            { month: 'Mar', revenue: 35000 },
            { month: 'Apr', revenue: 42000 },
          ],
        };
      case 'stats-grid':
        return {
          stats: [
            {
              label: 'Total Revenue',
              value: '£245,230',
              change: '+12%',
              trend: 'up',
            },
            {
              label: 'Active Projects',
              value: '12',
              change: '+2',
              trend: 'up',
            },
            { label: 'Team Members', value: '24', change: '+3', trend: 'up' },
            {
              label: 'Client Satisfaction',
              value: '94%',
              change: '+2%',
              trend: 'up',
            },
          ],
        };
      default:
        return { message: `Welcome to ${widgetType}!` };
    }
  };

  const getWidgetsByCategory = () => {
    const categories = WIDGET_TYPES.reduce(
      (acc, widget) => {
        if (!acc[widget.category]) {
          acc[widget.category] = [];
        }
        acc[widget.category].push(widget);
        return acc;
      },
      {} as Record<string, typeof WIDGET_TYPES>
    );

    return categories;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-6xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            Dashboard Builder
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className='flex items-center justify-center space-x-4 mb-6'>
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-xl font-semibold mb-2'>Basic Information</h3>
              <p className='text-gray-600'>Let's start with the basics</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Dashboard Name</Label>
                <Input
                  id='dashboard-name'
                  name='dashboard-name'
                  value={dashboardName}
                  onChange={e => setDashboardName(e.target.value)}
                  placeholder='e.g., Project Management Dashboard'
                  className='text-lg'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description (Optional)</Label>
                <Textarea
                  id='description'
                  value={dashboardDescription}
                  onChange={e => setDashboardDescription(e.target.value)}
                  placeholder='Describe what this dashboard is for...'
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-xl font-semibold mb-2'>Choose a Template</h3>
              <p className='text-gray-600'>
                Select a pre-configured layout or start custom
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {LAYOUT_TEMPLATES.map(template => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : 'hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardHeader className='pb-2'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-lg'>{template.name}</CardTitle>
                      <span className='text-2xl'>{template.preview}</span>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap gap-1'>
                      {template.layout.map((item, index) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='text-xs'
                        >
                          {item.type.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-xl font-semibold mb-2'>Select Widgets</h3>
              <p className='text-gray-600'>
                {selectedTemplate === 'custom'
                  ? 'Choose widgets for your custom dashboard'
                  : 'Customize your template by adding or removing widgets'}
              </p>
            </div>

            <Tabs defaultValue='Projects' className='w-full'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='Projects'>Projects</TabsTrigger>
                <TabsTrigger value='Financial'>Financial</TabsTrigger>
                <TabsTrigger value='General'>General</TabsTrigger>
              </TabsList>

              {Object.entries(getWidgetsByCategory()).map(
                ([category, widgets]) => (
                  <TabsContent
                    key={category}
                    value={category}
                    className='space-y-4'
                  >
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {widgets.map(widget => {
                        const Icon = widget.icon;
                        const isSelected = selectedWidgets.includes(widget.id);

                        return (
                          <Card
                            key={widget.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected
                                ? 'ring-2 ring-blue-500 border-blue-500'
                                : 'hover:border-blue-300'
                            }`}
                            onClick={() => handleWidgetToggle(widget.id)}
                          >
                            <CardHeader className='pb-2'>
                              <div className='flex items-center space-x-3'>
                                <div
                                  className={`p-2 rounded-lg ${widget.color} text-white`}
                                >
                                  <Icon className='h-5 w-5' />
                                </div>
                                <div>
                                  <CardTitle className='text-lg'>
                                    {widget.name}
                                  </CardTitle>
                                  <CardDescription className='text-sm'>
                                    {widget.description}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>
                )
              )}
            </Tabs>
          </div>
        )}

        {currentStep === 4 && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-xl font-semibold mb-2'>Review & Create</h3>
              <p className='text-gray-600'>
                Review your dashboard configuration
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Details</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div>
                    <strong>Name:</strong> {dashboardName}
                  </div>
                  <div>
                    <strong>Description:</strong>{' '}
                    {dashboardDescription || 'No description'}
                  </div>
                  <div>
                    <strong>Template:</strong>{' '}
                    {
                      LAYOUT_TEMPLATES.find(t => t.id === selectedTemplate)
                        ?.name
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Selected Widgets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {selectedWidgets.map(widgetId => {
                      const widget = WIDGET_TYPES.find(w => w.id === widgetId);
                      return (
                        <Badge key={widgetId} variant='secondary'>
                          {widget?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className='flex justify-between pt-6 border-t'>
          <Button
            variant='outline'
            onClick={currentStep === 1 ? onClose : handlePrevious}
            disabled={currentStep === 1}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <div className='flex space-x-2'>
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !dashboardName.trim()) ||
                  (currentStep === 3 && selectedWidgets.length === 0)
                }
                className='bg-blue-600 text-white hover:bg-blue-700'
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!dashboardName.trim()}
                className='bg-green-600 text-white hover:bg-green-700'
              >
                {dashboardId ? 'Update Dashboard' : 'Create Dashboard'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
