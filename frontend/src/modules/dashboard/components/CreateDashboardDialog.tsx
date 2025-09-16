import {
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  Grid,
  Layout,
  Palette,
  PieChart,
  Plus,
  TrendingUp,
  Users,
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
  DialogTrigger,
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

interface CreateDashboardDialogProps {
  children?: React.ReactNode;
}

// Widget types
const WIDGET_TYPES = [
  {
    id: 'stats',
    name: 'Statistics',
    icon: BarChart3,
    description: 'Display key metrics and numbers',
  },
  {
    id: 'chart',
    name: 'Chart',
    icon: TrendingUp,
    description: 'Visual data representation',
  },
  {
    id: 'table',
    name: 'Data Table',
    icon: Grid,
    description: 'Tabular data display',
  },
  {
    id: 'list',
    name: 'List',
    icon: FileText,
    description: 'Simple list of items',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: Calendar,
    description: 'Calendar view',
  },
  {
    id: 'users',
    name: 'Team',
    icon: Users,
    description: 'Team member information',
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: DollarSign,
    description: 'Financial metrics',
  },
  {
    id: 'pie',
    name: 'Pie Chart',
    icon: PieChart,
    description: 'Pie chart visualization',
  },
];

// Layout templates
const LAYOUT_TEMPLATES = [
  {
    id: 'simple',
    name: 'Simple',
    description: 'Clean single column layout',
    preview: '📊',
    layout: [{ type: 'stats', size: 'full' }],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Perfect for data analysis',
    preview: '📈📊📉',
    layout: [
      { type: 'stats', size: 'half' },
      { type: 'chart', size: 'half' },
      { type: 'table', size: 'full' },
    ],
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'High-level overview',
    preview: '📊📈💰',
    layout: [
      { type: 'stats', size: 'third' },
      { type: 'stats', size: 'third' },
      { type: 'stats', size: 'third' },
      { type: 'chart', size: 'full' },
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

export function CreateDashboardDialog({
  children,
}: CreateDashboardDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('simple');
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [customLayout, setCustomLayout] = useState<any[]>([]);

  const addDashboard = useDashboardStore(state => state.addDashboard);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsLoading(true);

    try {
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

      addDashboard({
        name: name.trim(),
        description: description.trim() || undefined,
        widgets,
      });

      // Reset form
      setName('');
      setDescription('');
      setSelectedTemplate('simple');
      setSelectedWidgets([]);
      setCustomLayout([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultWidgetData = (widgetType: string) => {
    switch (widgetType) {
      case 'stats':
        return {
          stats: [{ label: 'Total', value: '0', change: '+0%', trend: 'up' }],
        };
      case 'chart':
        return {
          type: 'line',
          data: [
            { label: 'Jan', value: 0 },
            { label: 'Feb', value: 0 },
          ],
        };
      case 'table':
        return {
          columns: ['Name', 'Value'],
          rows: [],
        };
      case 'list':
        return {
          items: [],
        };
      default:
        return {};
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground hover:text-foreground'
          >
            <Plus className='h-4 w-4 mr-2' />
            Add New
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='sm:max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue='basic' className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='basic'>Basic Info</TabsTrigger>
            <TabsTrigger value='template'>Template</TabsTrigger>
            <TabsTrigger value='widgets'>Widgets</TabsTrigger>
            <TabsTrigger value='layout'>Layout</TabsTrigger>
          </TabsList>

          <TabsContent value='basic' className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Dashboard Name</Label>
              <Input
                id='name'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='Enter dashboard name...'
                required
                disabled={isLoading}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description (Optional)</Label>
              <Textarea
                id='description'
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Enter dashboard description...'
                rows={3}
                disabled={isLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value='template' className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              {LAYOUT_TEMPLATES.map(template => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
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
                          {item.type}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value='widgets' className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              {WIDGET_TYPES.map(widget => {
                const Icon = widget.icon;
                const isSelected = selectedWidgets.includes(widget.id);

                return (
                  <Card
                    key={widget.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedWidgets(prev =>
                          prev.filter(id => id !== widget.id)
                        );
                      } else {
                        setSelectedWidgets(prev => [...prev, widget.id]);
                      }
                    }}
                  >
                    <CardHeader className='pb-2'>
                      <div className='flex items-center space-x-2'>
                        <Icon className='h-5 w-5' />
                        <CardTitle className='text-lg'>{widget.name}</CardTitle>
                      </div>
                      <CardDescription>{widget.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value='layout' className='space-y-4'>
            <div className='text-center py-8'>
              <Layout className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Layout Editor</h3>
              <p className='text-muted-foreground mb-4'>
                Drag and drop widgets to create your custom layout
              </p>
              <div className='bg-muted/50 rounded-lg p-8 border-2 border-dashed border-muted-foreground/25'>
                <Palette className='h-8 w-8 mx-auto text-muted-foreground/50 mb-2' />
                <p className='text-sm text-muted-foreground'>
                  Layout editor coming soon...
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className='flex justify-end space-x-2 pt-4 border-t'>
          <Button
            type='button'
            variant='outline'
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
            {isLoading ? 'Creating...' : 'Create Dashboard'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
