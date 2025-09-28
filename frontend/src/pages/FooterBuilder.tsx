import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getIconStrict } from '@/design/icons';
import { useToast } from '@/hooks/use-toast';
import { useThemeStore } from '@/app/store/ui/theme.store';
import type { FooterConfig, FooterWidget } from '@/types/footer';
import React, { useEffect, useState } from 'react';

const defaultConfig: FooterConfig = {
  columns: 3,
  widgets: [
    {
      id: '1',
      type: 'text',
      title: 'About Us',
      content:
        'ConstructBMS is a comprehensive construction business management system designed to streamline your operations and boost productivity.',
      formatting: {
        widgetAlign: 'center',
        headerAlign: 'center',
        textAlign: 'center',
        fontSize: 'sm',
        fontWeight: 'normal',
        lineHeight: 'relaxed',
      },
    },
    {
      id: '2',
      type: 'contact',
      title: 'Contact Info',
      content: '',
      config: {
        address: '123 Construction Ave, Building City, BC 12345',
        phone: '+1 (555) 123-4567',
        email: 'info@constructbms.com',
      },
      formatting: {
        widgetAlign: 'center',
        headerAlign: 'center',
        textAlign: 'center',
        fontSize: 'sm',
        fontWeight: 'normal',
        lineHeight: 'normal',
      },
    },
    {
      id: '3',
      type: 'list',
      title: 'Quick Links',
      content: '',
      config: {
        pages: [
          { title: 'Help Center', url: '/help' },
          { title: 'Terms & Conditions', url: '/terms' },
          { title: 'Privacy Policy', url: '/privacy' },
          { title: 'Support', url: '/support' },
        ],
      },
      formatting: {
        widgetAlign: 'center',
        headerAlign: 'center',
        textAlign: 'center',
        fontSize: 'sm',
        fontWeight: 'normal',
        lineHeight: 'normal',
      },
    },
  ],
  backgroundColor: '#1f2937',
  textColor: '#f9fafb',
  accentColor: '#3b82f6',
  padding: '3rem 1rem',
  showCopyright: true,
  copyrightText: '© 2024 ConstructBMS. All rights reserved.',
  globalFormatting: {
    widgetAlign: 'center',
    headerAlign: 'center',
    textAlign: 'center',
    fontSize: 'sm',
    fontWeight: 'normal',
    lineHeight: 'normal',
  },
};

const widgetTypes = [
  { value: 'text', label: 'Text Widget', icon: 'text' },
  { value: 'html', label: 'HTML Widget', icon: 'code' },
  { value: 'list', label: 'Page List', icon: 'list' },
  { value: 'contact', label: 'Contact Info', icon: 'contact' },
  { value: 'gallery', label: 'Image Gallery', icon: 'gallery' },
  { value: 'social', label: 'Social Links', icon: 'social' },
];

const FooterBuilder: React.FC = () => {
  const [config, setConfig] = useState<FooterConfig>(defaultConfig);
  const [selectedWidget, setSelectedWidget] = useState<FooterWidget | null>(
    null
  );
  const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false);
  const { toast } = useToast();
  const { theme } = useThemeStore();

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('footerConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading footer config:', error);
      }
    }
  }, []);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('footerConfig', JSON.stringify(config));
  }, [config]);

  const saveConfig = () => {
    try {
      console.log('Saving footer config:', config);
      localStorage.setItem('footerConfig', JSON.stringify(config));

      // Dispatch custom event to notify Layout component
      window.dispatchEvent(
        new CustomEvent('footerConfigUpdated', {
          detail: config,
        })
      );

      // Verify the save worked
      const saved = localStorage.getItem('footerConfig');
      console.log('Verified saved config:', saved ? 'SUCCESS' : 'FAILED');

      if (saved) {
        toast({
          title: '✅ Configuration Saved',
          description: 'Footer configuration has been saved successfully!',
        });
      } else {
        toast({
          title: '❌ Save Failed',
          description: 'Failed to save footer configuration. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving footer config:', error);
      toast({
        title: '❌ Save Error',
        description: 'An error occurred while saving the configuration.',
        variant: 'destructive',
      });
    }
  };

  const updateConfig = (updates: Partial<FooterConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addWidget = (type: FooterWidget['type']) => {
    const newWidget: FooterWidget = {
      id: Date.now().toString(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
      content: '',
      config: {},
    };

    // Add default config based on widget type
    switch (type) {
      case 'contact':
        newWidget.config = {
          address: '',
          phone: '',
          email: '',
        };
        break;
      case 'list':
        newWidget.config = {
          pages: [],
        };
        break;
      case 'gallery':
        newWidget.config = {
          images: [],
        };
        break;
      case 'social':
        newWidget.config = {
          links: [],
        };
        break;
    }

    setConfig(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }));

    toast({
      title: 'Widget Added',
      description: `New ${type} widget has been added to the footer.`,
    });
  };

  const updateWidget = (widgetId: string, updates: Partial<FooterWidget>) => {
    setConfig(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      ),
    }));
  };

  const removeWidget = (widgetId: string) => {
    setConfig(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId),
    }));

    toast({
      title: 'Widget Removed',
      description: 'Widget has been removed from the footer.',
    });
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    setConfig(prev => {
      const widgets = [...prev.widgets];
      const index = widgets.findIndex(w => w.id === widgetId);

      if (direction === 'up' && index > 0) {
        [widgets[index], widgets[index - 1]] = [
          widgets[index - 1],
          widgets[index],
        ];
      } else if (direction === 'down' && index < widgets.length - 1) {
        [widgets[index], widgets[index + 1]] = [
          widgets[index + 1],
          widgets[index],
        ];
      }

      return { ...prev, widgets };
    });
  };

  const renderWidgetEditor = (widget: FooterWidget) => {
    const commonFields = (
      <div className='space-y-4'>
        <div>
          <Label htmlFor='widget-title'>Widget Title</Label>
          <Input
            id='widget-title'
            value={widget.title}
            onChange={e => updateWidget(widget.id, { title: e.target.value })}
            placeholder='Enter widget title'
          />
        </div>
      </div>
    );

    const formattingControls = (
      <div className='space-y-4 border-t pt-4'>
        <h4 className='font-medium text-gray-900'>Alignment & Formatting</h4>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='widget-align'>Widget Alignment</Label>
            <Select
              value={widget.formatting?.widgetAlign || 'center'}
              onValueChange={value =>
                updateWidget(widget.id, {
                  formatting: {
                    ...widget.formatting,
                    widgetAlign: value as 'left' | 'center' | 'right',
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='left'>Left</SelectItem>
                <SelectItem value='center'>Center</SelectItem>
                <SelectItem value='right'>Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='header-align'>Header Alignment</Label>
            <Select
              value={widget.formatting?.headerAlign || 'center'}
              onValueChange={value =>
                updateWidget(widget.id, {
                  formatting: {
                    ...widget.formatting,
                    headerAlign: value as 'left' | 'center' | 'right',
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='left'>Left</SelectItem>
                <SelectItem value='center'>Center</SelectItem>
                <SelectItem value='right'>Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='text-align'>Text Alignment</Label>
            <Select
              value={widget.formatting?.textAlign || 'center'}
              onValueChange={value =>
                updateWidget(widget.id, {
                  formatting: {
                    ...widget.formatting,
                    textAlign: value as 'left' | 'center' | 'right' | 'justify',
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='left'>Left</SelectItem>
                <SelectItem value='center'>Center</SelectItem>
                <SelectItem value='right'>Right</SelectItem>
                <SelectItem value='justify'>Justify</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='font-size'>Font Size</Label>
            <Select
              value={widget.formatting?.fontSize || 'sm'}
              onValueChange={value =>
                updateWidget(widget.id, {
                  formatting: {
                    ...widget.formatting,
                    fontSize: value as
                      | 'xs'
                      | 'sm'
                      | 'base'
                      | 'lg'
                      | 'xl'
                      | '2xl',
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='xs'>Extra Small</SelectItem>
                <SelectItem value='sm'>Small</SelectItem>
                <SelectItem value='base'>Base</SelectItem>
                <SelectItem value='lg'>Large</SelectItem>
                <SelectItem value='xl'>Extra Large</SelectItem>
                <SelectItem value='2xl'>2X Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='font-weight'>Font Weight</Label>
            <Select
              value={widget.formatting?.fontWeight || 'normal'}
              onValueChange={value =>
                updateWidget(widget.id, {
                  formatting: {
                    ...widget.formatting,
                    fontWeight: value as
                      | 'normal'
                      | 'medium'
                      | 'semibold'
                      | 'bold',
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='normal'>Normal</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='semibold'>Semi Bold</SelectItem>
                <SelectItem value='bold'>Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='line-height'>Line Height</Label>
            <Select
              value={widget.formatting?.lineHeight || 'normal'}
              onValueChange={value =>
                updateWidget(widget.id, {
                  formatting: {
                    ...widget.formatting,
                    lineHeight: value as
                      | 'tight'
                      | 'normal'
                      | 'relaxed'
                      | 'loose',
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='tight'>Tight</SelectItem>
                <SelectItem value='normal'>Normal</SelectItem>
                <SelectItem value='relaxed'>Relaxed</SelectItem>
                <SelectItem value='loose'>Loose</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );

    switch (widget.type) {
      case 'text':
        return (
          <div className='space-y-4'>
            {commonFields}
            <div>
              <Label htmlFor='widget-content'>Content</Label>
              <Textarea
                id='widget-content'
                value={widget.content}
                onChange={e =>
                  updateWidget(widget.id, { content: e.target.value })
                }
                placeholder='Enter text content'
                rows={4}
              />
            </div>
            {formattingControls}
          </div>
        );

      case 'html':
        return (
          <div className='space-y-4'>
            {commonFields}
            <div>
              <Label htmlFor='widget-html'>HTML Content</Label>
              <Textarea
                id='widget-html'
                value={widget.content}
                onChange={e =>
                  updateWidget(widget.id, { content: e.target.value })
                }
                placeholder='Enter HTML content'
                rows={6}
              />
              <p className='text-sm text-gray-500 mt-1'>
                You can use HTML tags like &lt;strong&gt;, &lt;em&gt;,
                &lt;a&gt;, etc.
              </p>
            </div>
            {formattingControls}
          </div>
        );

      case 'contact':
        return (
          <div className='space-y-4'>
            {commonFields}
            <div>
              <Label htmlFor='contact-address'>Address</Label>
              <Textarea
                id='contact-address'
                value={widget.config?.address || ''}
                onChange={e =>
                  updateWidget(widget.id, {
                    config: { ...widget.config, address: e.target.value },
                  })
                }
                placeholder='Enter address'
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor='contact-phone'>Phone</Label>
              <Input
                id='contact-phone'
                value={widget.config?.phone || ''}
                onChange={e =>
                  updateWidget(widget.id, {
                    config: { ...widget.config, phone: e.target.value },
                  })
                }
                placeholder='Enter phone number'
              />
            </div>
            <div>
              <Label htmlFor='contact-email'>Email</Label>
              <Input
                id='contact-email'
                type='email'
                value={widget.config?.email || ''}
                onChange={e =>
                  updateWidget(widget.id, {
                    config: { ...widget.config, email: e.target.value },
                  })
                }
                placeholder='Enter email address'
              />
            </div>
            {formattingControls}
          </div>
        );

      case 'list': {
        const pages = widget.config?.pages || [];
        return (
          <div className='space-y-4'>
            {commonFields}
            <div>
              <Label>Pages</Label>
              <div className='space-y-2'>
                {pages.map((page: unknown, index: number) => (
                  <div key={index} className='flex space-x-2'>
                    <Input
                      placeholder='Page title'
                      value={page.title}
                      onChange={e => {
                        const newPages = [...pages];
                        newPages[index] = { ...page, title: e.target.value };
                        updateWidget(widget.id, {
                          config: { ...widget.config, pages: newPages },
                        });
                      }}
                    />
                    <Input
                      placeholder='URL'
                      value={page.url}
                      onChange={e => {
                        const newPages = [...pages];
                        newPages[index] = { ...page, url: e.target.value };
                        updateWidget(widget.id, {
                          config: { ...widget.config, pages: newPages },
                        });
                      }}
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        const newPages = pages.filter((_, i) => i !== index);
                        updateWidget(widget.id, {
                          config: { ...widget.config, pages: newPages },
                        });
                      }}
                    >
                      {getIconStrict('delete')}
                    </Button>
                  </div>
                ))}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const newPages = [...pages, { title: '', url: '' }];
                    updateWidget(widget.id, {
                      config: { ...widget.config, pages: newPages },
                    });
                  }}
                >
                  Add Page
                </Button>
              </div>
            </div>
            {formattingControls}
          </div>
        );
      }

      case 'gallery': {
        const images = widget.config?.images || [];
        return (
          <div className='space-y-4'>
            {commonFields}
            <div>
              <Label>Images</Label>
              <div className='space-y-2'>
                {images.map((image: unknown, index: number) => (
                  <div key={index} className='flex space-x-2'>
                    <Input
                      placeholder='Image URL'
                      value={image.url}
                      onChange={e => {
                        const newImages = [...images];
                        newImages[index] = { ...image, url: e.target.value };
                        updateWidget(widget.id, {
                          config: { ...widget.config, images: newImages },
                        });
                      }}
                    />
                    <Input
                      placeholder='Alt text'
                      value={image.alt}
                      onChange={e => {
                        const newImages = [...images];
                        newImages[index] = { ...image, alt: e.target.value };
                        updateWidget(widget.id, {
                          config: { ...widget.config, images: newImages },
                        });
                      }}
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        const newImages = images.filter((_, i) => i !== index);
                        updateWidget(widget.id, {
                          config: { ...widget.config, images: newImages },
                        });
                      }}
                    >
                      {getIconStrict('delete')}
                    </Button>
                  </div>
                ))}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const newImages = [...images, { url: '', alt: '' }];
                    updateWidget(widget.id, {
                      config: { ...widget.config, images: newImages },
                    });
                  }}
                >
                  Add Image
                </Button>
              </div>
            </div>
            {formattingControls}
          </div>
        );
      }

      case 'social': {
        const links = widget.config?.links || [];
        return (
          <div className='space-y-4'>
            {commonFields}
            <div>
              <Label>Social Links</Label>
              <div className='space-y-2'>
                {links.map((link: unknown, index: number) => (
                  <div key={index} className='flex space-x-2'>
                    <Select
                      value={link.platform}
                      onValueChange={value => {
                        const newLinks = [...links];
                        newLinks[index] = { ...link, platform: value };
                        updateWidget(widget.id, {
                          config: { ...widget.config, links: newLinks },
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Platform' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='facebook'>Facebook</SelectItem>
                        <SelectItem value='twitter'>Twitter</SelectItem>
                        <SelectItem value='instagram'>Instagram</SelectItem>
                        <SelectItem value='linkedin'>LinkedIn</SelectItem>
                        <SelectItem value='youtube'>YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder='URL'
                      value={link.url}
                      onChange={e => {
                        const newLinks = [...links];
                        newLinks[index] = { ...link, url: e.target.value };
                        updateWidget(widget.id, {
                          config: { ...widget.config, links: newLinks },
                        });
                      }}
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        const newLinks = links.filter((_, i) => i !== index);
                        updateWidget(widget.id, {
                          config: { ...widget.config, links: newLinks },
                        });
                      }}
                    >
                      {getIconStrict('delete')}
                    </Button>
                  </div>
                ))}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const newLinks = [...links, { platform: '', url: '' }];
                    updateWidget(widget.id, {
                      config: { ...widget.config, links: newLinks },
                    });
                  }}
                >
                  Add Social Link
                </Button>
              </div>
            </div>
            {formattingControls}
          </div>
        );
      }

      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Footer Builder
          </h1>
          <p className='mt-1 text-gray-600 dark:text-gray-300'>
            Customize your website footer with widgets and styling
          </p>
        </div>
        <div className='flex space-x-3'>
          <Button
            onClick={() => {
              console.log('Save button clicked!');
              saveConfig();
            }}
            className='bg-blue-600 hover:bg-blue-700 text-white'
          >
            {getIconStrict('save')} Save Configuration
          </Button>

          <Button
            variant='outline'
            onClick={() => {
              const saved = localStorage.getItem('footerConfig');
              console.log('Current saved config:', saved);
              alert(`Saved config: ${saved ? 'EXISTS' : 'NOT FOUND'}`);
            }}
          >
            Test Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue='builder' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='builder' className='flex items-center gap-2'>
            {getIconStrict('edit')} Builder
          </TabsTrigger>
          <TabsTrigger value='preview' className='flex items-center gap-2'>
            {getIconStrict('eye')} Preview
          </TabsTrigger>
          <TabsTrigger value='settings' className='flex items-center gap-2'>
            {getIconStrict('settings')} Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value='builder' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Widget Management */}
            <div className='lg:col-span-1 flex flex-col space-y-6 h-full'>
              <Card
                style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}
              >
                <CardHeader
                  style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}
                >
                  <CardTitle
                    className='flex items-center gap-2'
                    style={{ color: '#f9fafb' }}
                  >
                    {getIconStrict('layout')} Layout Settings
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className='space-y-4 pt-4'
                  style={{ color: '#f9fafb' }}
                >
                  <div>
                    <Label
                      htmlFor='columns'
                      className='text-sm font-medium'
                      style={{ color: '#f9fafb' }}
                    >
                      Number of Columns
                    </Label>
                    <Select
                      value={config.columns.toString()}
                      onValueChange={value => {
                        updateConfig({ columns: parseInt(value) as 2 | 3 | 4 });
                      }}
                    >
                      <SelectTrigger className='mt-2 columns-dropdown'>
                        <SelectValue
                          style={{ color: '#f9fafb' }}
                          placeholder='Select columns'
                        >
                          {config.columns} Columns
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='2'>2 Columns</SelectItem>
                        <SelectItem value='3'>3 Columns</SelectItem>
                        <SelectItem value='4'>4 Columns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card
                style={{
                  backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                  borderColor: theme === 'light' ? '#1e293b' : '#4b5563',
                }}
                className='flex flex-col flex-1'
              >
                <CardHeader
                  style={{
                    backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                    borderColor: theme === 'light' ? '#1e293b' : '#4b5563',
                  }}
                >
                  <CardTitle
                    className='flex items-center gap-2'
                    style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
                  >
                    {getIconStrict('plus')} Add Widgets
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className='pt-4 flex flex-col flex-1'
                  style={{
                    color: theme === 'light' ? '#1e293b' : '#f9fafb',
                    paddingBottom: '12px',
                  }}
                >
                  <div className='flex flex-col justify-between gap-4'>
                    {widgetTypes.map(type => (
                      <Button
                        key={type.value}
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          addWidget(type.value as FooterWidget['type']);
                        }}
                        className='justify-start text-left p-4 flex-1 -my-1'
                        style={{
                          backgroundColor:
                            theme === 'light' ? '#ffffff' : '#4b5563',
                          borderColor:
                            theme === 'light' ? '#1e293b' : '#6b7280',
                          color: theme === 'light' ? '#1e293b' : '#f9fafb',
                        }}
                      >
                        <span className='text-2xl mr-4'>
                          {getIconStrict(type.icon)}
                        </span>
                        <div className='flex flex-col items-start'>
                          <span
                            className='font-medium text-base'
                            style={{
                              color: theme === 'light' ? '#1e293b' : '#f9fafb',
                            }}
                          >
                            {type.label}
                          </span>
                          <span
                            className='text-sm mt-1'
                            style={{
                              color: theme === 'light' ? '#64748b' : '#d1d5db',
                            }}
                          >
                            {type.value === 'text' && 'Simple text content'}
                            {type.value === 'html' && 'Custom HTML content'}
                            {type.value === 'list' && 'List of pages/links'}
                            {type.value === 'contact' && 'Contact information'}
                            {type.value === 'gallery' && 'Image gallery'}
                            {type.value === 'social' && 'Social media links'}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview */}
            <div className='lg:col-span-2 space-y-6'>
              <Card
                style={{
                  backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                  borderColor: theme === 'light' ? '#1e293b' : '#4b5563',
                }}
              >
                <CardHeader
                  style={{
                    backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                    borderColor: theme === 'light' ? '#1e293b' : '#4b5563',
                  }}
                >
                  <CardTitle
                    className='flex items-center gap-2'
                    style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
                  >
                    {getIconStrict('eye')} Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className='pt-4'
                  style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
                >
                  <div
                    className='border-2 rounded-lg overflow-hidden'
                    style={{
                      borderColor: '#4b5563',
                      backgroundColor: '#1f2937',
                    }}
                  >
                    <div
                      className='p-4 border-b'
                      style={{
                        backgroundColor: '#374151',
                        borderColor: '#4b5563',
                      }}
                    >
                      <p className='text-sm' style={{ color: '#f9fafb' }}>
                        Preview of your footer configuration
                      </p>
                    </div>
                    <Footer config={config} />
                  </div>
                </CardContent>
              </Card>

              {/* Widgets Section - Under Preview in Right Column */}
              <Card
                style={{
                  backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                  borderColor: theme === 'light' ? '#1e293b' : '#4b5563',
                }}
              >
                <CardHeader
                  style={{
                    backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                    borderColor: theme === 'light' ? '#1e293b' : '#4b5563',
                  }}
                >
                  <CardTitle
                    className='flex items-center gap-2'
                    style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
                  >
                    {getIconStrict('list')} Widgets ({config.widgets.length})
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className='pt-4'
                  style={{ color: theme === 'light' ? '#1e293b' : '#f9fafb' }}
                >
                  {config.widgets.length === 0 ? (
                    <div
                      className='text-center py-8'
                      style={{
                        color: theme === 'light' ? '#64748b' : '#d1d5db',
                      }}
                    >
                      <div className='text-4xl mb-2'>
                        {getIconStrict('info')}
                      </div>
                      <p>No widgets added yet</p>
                      <p className='text-sm'>
                        Add widgets from the section above
                      </p>
                    </div>
                  ) : (
                    <div className={`grid grid-cols-${config.columns} gap-3`}>
                      {config.widgets.map((widget, index) => (
                        <div
                          key={widget.id}
                          className='flex flex-col items-center justify-between p-4 border-2 rounded-lg transition-colors min-h-[120px]'
                          style={{
                            borderColor:
                              theme === 'light' ? '#1e293b' : '#4b5563',
                            backgroundColor:
                              theme === 'light' ? '#ffffff' : '#4b5563',
                          }}
                        >
                          <div className='flex flex-col items-center space-y-2 text-center'>
                            <div className='text-3xl'>
                              {getIconStrict(widget.type)}
                            </div>
                            <div>
                              <div
                                className='font-medium text-sm'
                                style={{
                                  color:
                                    theme === 'light' ? '#1e293b' : '#f9fafb',
                                }}
                              >
                                {widget.title}
                              </div>
                              <Badge
                                variant='secondary'
                                className='text-xs mt-1'
                                style={{
                                  backgroundColor:
                                    theme === 'light' ? '#1e293b' : '#6b7280',
                                  color:
                                    theme === 'light' ? '#ffffff' : '#f9fafb',
                                }}
                              >
                                {widget.type}
                              </Badge>
                            </div>
                          </div>
                          <div className='flex space-x-1 mt-auto'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => moveWidget(widget.id, 'up')}
                              disabled={index === 0}
                              className='h-8 w-8 p-0'
                              title='Move up'
                            >
                              ↑
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => moveWidget(widget.id, 'down')}
                              disabled={index === config.widgets.length - 1}
                              className='h-8 w-8 p-0'
                              title='Move down'
                            >
                              ↓
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedWidget(widget);
                                setIsWidgetDialogOpen(true);
                              }}
                              className='h-8 w-8 p-0'
                              title='Edit widget'
                            >
                              {getIconStrict('edit')}
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => removeWidget(widget.id)}
                              className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                              title='Delete widget'
                            >
                              {getIconStrict('delete')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='preview'>
          <Card style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}>
            <CardHeader
              style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}
            >
              <CardTitle style={{ color: '#f9fafb' }}>Full Preview</CardTitle>
            </CardHeader>
            <CardContent style={{ color: '#f9fafb' }}>
              <div
                className='min-h-screen'
                style={{ backgroundColor: '#1f2937' }}
              >
                <div
                  className='min-h-screen'
                  style={{ backgroundColor: '#1f2937' }}
                >
                  <div className='p-8 text-center'>
                    <h2
                      className='text-2xl font-bold mb-4'
                      style={{ color: '#f9fafb' }}
                    >
                      Your Website Content
                    </h2>
                    <p style={{ color: '#f9fafb' }}>
                      This is where your main content would appear.
                    </p>
                  </div>
                </div>
                <Footer config={config} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card
              style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}
            >
              <CardHeader
                style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}
              >
                <CardTitle
                  className='flex items-center gap-2'
                  style={{ color: '#f9fafb' }}
                >
                  🎨 Colors & Styling
                </CardTitle>
              </CardHeader>
              <CardContent
                className='space-y-6 pt-4'
                style={{ color: '#f9fafb' }}
              >
                <div>
                  <Label htmlFor='bg-color' style={{ color: '#f9fafb' }}>
                    Background Color
                  </Label>
                  <div className='flex space-x-2'>
                    <Input
                      id='bg-color'
                      type='color'
                      value={config.backgroundColor}
                      onChange={e =>
                        updateConfig({ backgroundColor: e.target.value })
                      }
                      className='w-16'
                    />
                    <Input
                      value={config.backgroundColor}
                      onChange={e =>
                        updateConfig({ backgroundColor: e.target.value })
                      }
                      placeholder='#1f2937'
                      style={{
                        backgroundColor: '#4b5563',
                        borderColor: '#6b7280',
                        color: '#f9fafb',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor='text-color' style={{ color: '#f9fafb' }}>
                    Text Color
                  </Label>
                  <div className='flex space-x-2'>
                    <Input
                      id='text-color'
                      type='color'
                      value={config.textColor}
                      onChange={e =>
                        updateConfig({ textColor: e.target.value })
                      }
                      className='w-16'
                    />
                    <Input
                      value={config.textColor}
                      onChange={e =>
                        updateConfig({ textColor: e.target.value })
                      }
                      placeholder='#f9fafb'
                      style={{
                        backgroundColor: '#4b5563',
                        borderColor: '#6b7280',
                        color: '#f9fafb',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor='accent-color' style={{ color: '#f9fafb' }}>
                    Accent Color
                  </Label>
                  <div className='flex space-x-2'>
                    <Input
                      id='accent-color'
                      type='color'
                      value={config.accentColor}
                      onChange={e =>
                        updateConfig({ accentColor: e.target.value })
                      }
                      className='w-16'
                    />
                    <Input
                      value={config.accentColor}
                      onChange={e =>
                        updateConfig({ accentColor: e.target.value })
                      }
                      placeholder='#3b82f6'
                      style={{
                        backgroundColor: '#4b5563',
                        borderColor: '#6b7280',
                        color: '#f9fafb',
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}
            >
              <CardHeader
                style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}
              >
                <CardTitle
                  className='flex items-center gap-2'
                  style={{ color: '#f9fafb' }}
                >
                  🎨 Global Alignment & Formatting
                </CardTitle>
              </CardHeader>
              <CardContent
                className='space-y-6 pt-4'
                style={{ color: '#f9fafb' }}
              >
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label
                      htmlFor='global-widget-align'
                      style={{ color: '#f9fafb' }}
                    >
                      Widget Alignment
                    </Label>
                    <Select
                      value={config.globalFormatting?.widgetAlign || 'center'}
                      onValueChange={value =>
                        updateConfig({
                          globalFormatting: {
                            ...config.globalFormatting,
                            widgetAlign: value as 'left' | 'center' | 'right',
                          },
                        })
                      }
                    >
                      <SelectTrigger className='settings-dropdown'>
                        <SelectValue
                          style={{ color: '#f9fafb' }}
                          placeholder='Select alignment'
                        >
                          {config.globalFormatting?.widgetAlign || 'center'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          backgroundColor: '#4b5563',
                          borderColor: '#6b7280',
                        }}
                      >
                        <SelectItem value='left' style={{ color: '#f9fafb' }}>
                          Left
                        </SelectItem>
                        <SelectItem value='center' style={{ color: '#f9fafb' }}>
                          Center
                        </SelectItem>
                        <SelectItem value='right' style={{ color: '#f9fafb' }}>
                          Right
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor='global-header-align'
                      style={{ color: '#f9fafb' }}
                    >
                      Header Alignment
                    </Label>
                    <Select
                      value={config.globalFormatting?.headerAlign || 'center'}
                      onValueChange={value =>
                        updateConfig({
                          globalFormatting: {
                            ...config.globalFormatting,
                            headerAlign: value as 'left' | 'center' | 'right',
                          },
                        })
                      }
                    >
                      <SelectTrigger className='settings-dropdown'>
                        <SelectValue
                          style={{ color: '#f9fafb' }}
                          placeholder='Select alignment'
                        >
                          {config.globalFormatting?.headerAlign || 'center'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          backgroundColor: '#4b5563',
                          borderColor: '#6b7280',
                        }}
                      >
                        <SelectItem value='left' style={{ color: '#f9fafb' }}>
                          Left
                        </SelectItem>
                        <SelectItem value='center' style={{ color: '#f9fafb' }}>
                          Center
                        </SelectItem>
                        <SelectItem value='right' style={{ color: '#f9fafb' }}>
                          Right
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor='global-text-align'
                      style={{ color: '#f9fafb' }}
                    >
                      Text Alignment
                    </Label>
                    <Select
                      value={config.globalFormatting?.textAlign || 'center'}
                      onValueChange={value =>
                        updateConfig({
                          globalFormatting: {
                            ...config.globalFormatting,
                            textAlign: value as
                              | 'left'
                              | 'center'
                              | 'right'
                              | 'justify',
                          },
                        })
                      }
                    >
                      <SelectTrigger className='settings-dropdown'>
                        <SelectValue
                          style={{ color: '#f9fafb' }}
                          placeholder='Select alignment'
                        >
                          {config.globalFormatting?.textAlign || 'center'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          backgroundColor: '#4b5563',
                          borderColor: '#6b7280',
                        }}
                      >
                        <SelectItem value='left' style={{ color: '#f9fafb' }}>
                          Left
                        </SelectItem>
                        <SelectItem value='center' style={{ color: '#f9fafb' }}>
                          Center
                        </SelectItem>
                        <SelectItem value='right' style={{ color: '#f9fafb' }}>
                          Right
                        </SelectItem>
                        <SelectItem
                          value='justify'
                          style={{ color: '#f9fafb' }}
                        >
                          Justify
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor='global-font-size'
                      style={{ color: '#f9fafb' }}
                    >
                      Font Size
                    </Label>
                    <Select
                      value={config.globalFormatting?.fontSize || 'sm'}
                      onValueChange={value =>
                        updateConfig({
                          globalFormatting: {
                            ...config.globalFormatting,
                            fontSize: value as
                              | 'xs'
                              | 'sm'
                              | 'base'
                              | 'lg'
                              | 'xl'
                              | '2xl',
                          },
                        })
                      }
                    >
                      <SelectTrigger className='settings-dropdown'>
                        <SelectValue
                          style={{ color: '#f9fafb' }}
                          placeholder='Select font size'
                        >
                          {config.globalFormatting?.fontSize || 'sm'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          backgroundColor: '#4b5563',
                          borderColor: '#6b7280',
                        }}
                      >
                        <SelectItem value='xs' style={{ color: '#f9fafb' }}>
                          Extra Small
                        </SelectItem>
                        <SelectItem value='sm' style={{ color: '#f9fafb' }}>
                          Small
                        </SelectItem>
                        <SelectItem value='base' style={{ color: '#f9fafb' }}>
                          Base
                        </SelectItem>
                        <SelectItem value='lg' style={{ color: '#f9fafb' }}>
                          Large
                        </SelectItem>
                        <SelectItem value='xl' style={{ color: '#f9fafb' }}>
                          Extra Large
                        </SelectItem>
                        <SelectItem value='2xl' style={{ color: '#f9fafb' }}>
                          2X Large
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor='global-font-weight'
                      style={{ color: '#f9fafb' }}
                    >
                      Font Weight
                    </Label>
                    <Select
                      value={config.globalFormatting?.fontWeight || 'normal'}
                      onValueChange={value =>
                        updateConfig({
                          globalFormatting: {
                            ...config.globalFormatting,
                            fontWeight: value as
                              | 'normal'
                              | 'medium'
                              | 'semibold'
                              | 'bold',
                          },
                        })
                      }
                    >
                      <SelectTrigger className='settings-dropdown'>
                        <SelectValue
                          style={{ color: '#f9fafb' }}
                          placeholder='Select font weight'
                        >
                          {config.globalFormatting?.fontWeight || 'normal'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          backgroundColor: '#4b5563',
                          borderColor: '#6b7280',
                        }}
                      >
                        <SelectItem value='normal' style={{ color: '#f9fafb' }}>
                          Normal
                        </SelectItem>
                        <SelectItem value='medium' style={{ color: '#f9fafb' }}>
                          Medium
                        </SelectItem>
                        <SelectItem
                          value='semibold'
                          style={{ color: '#f9fafb' }}
                        >
                          Semi Bold
                        </SelectItem>
                        <SelectItem value='bold' style={{ color: '#f9fafb' }}>
                          Bold
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor='global-line-height'
                      style={{ color: '#f9fafb' }}
                    >
                      Line Height
                    </Label>
                    <Select
                      value={config.globalFormatting?.lineHeight || 'normal'}
                      onValueChange={value =>
                        updateConfig({
                          globalFormatting: {
                            ...config.globalFormatting,
                            lineHeight: value as
                              | 'tight'
                              | 'normal'
                              | 'relaxed'
                              | 'loose',
                          },
                        })
                      }
                    >
                      <SelectTrigger className='settings-dropdown'>
                        <SelectValue
                          style={{ color: '#f9fafb' }}
                          placeholder='Select line height'
                        >
                          {config.globalFormatting?.lineHeight || 'normal'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        style={{
                          backgroundColor: '#4b5563',
                          borderColor: '#6b7280',
                        }}
                      >
                        <SelectItem value='tight' style={{ color: '#f9fafb' }}>
                          Tight
                        </SelectItem>
                        <SelectItem value='normal' style={{ color: '#f9fafb' }}>
                          Normal
                        </SelectItem>
                        <SelectItem
                          value='relaxed'
                          style={{ color: '#f9fafb' }}
                        >
                          Relaxed
                        </SelectItem>
                        <SelectItem value='loose' style={{ color: '#f9fafb' }}>
                          Loose
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}
            >
              <CardHeader
                style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}
              >
                <CardTitle
                  className='flex items-center gap-2'
                  style={{ color: '#f9fafb' }}
                >
                  📐 Layout & Copyright
                </CardTitle>
              </CardHeader>
              <CardContent
                className='space-y-6 pt-4'
                style={{ color: '#f9fafb' }}
              >
                <div>
                  <Label htmlFor='padding' style={{ color: '#f9fafb' }}>
                    Padding
                  </Label>
                  <Select
                    value={config.padding}
                    onValueChange={value => updateConfig({ padding: value })}
                  >
                    <SelectTrigger className='settings-dropdown'>
                      <SelectValue
                        style={{ color: '#f9fafb' }}
                        placeholder='Select padding'
                      >
                        {config.padding}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: '#4b5563',
                        borderColor: '#6b7280',
                      }}
                    >
                      <SelectItem value='1rem' style={{ color: '#f9fafb' }}>
                        Small (1rem)
                      </SelectItem>
                      <SelectItem value='2rem' style={{ color: '#f9fafb' }}>
                        Medium (2rem)
                      </SelectItem>
                      <SelectItem
                        value='3rem 1rem'
                        style={{ color: '#f9fafb' }}
                      >
                        Large (3rem)
                      </SelectItem>
                      <SelectItem
                        value='4rem 2rem'
                        style={{ color: '#f9fafb' }}
                      >
                        Extra Large (4rem)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='show-copyright'
                    checked={config.showCopyright}
                    onCheckedChange={checked =>
                      updateConfig({ showCopyright: checked as boolean })
                    }
                  />
                  <Label htmlFor='show-copyright' style={{ color: '#f9fafb' }}>
                    Show Copyright
                  </Label>
                </div>
                {config.showCopyright && (
                  <div>
                    <Label
                      htmlFor='copyright-text'
                      style={{ color: '#f9fafb' }}
                    >
                      Copyright Text
                    </Label>
                    <Input
                      id='copyright-text'
                      value={config.copyrightText}
                      onChange={e =>
                        updateConfig({ copyrightText: e.target.value })
                      }
                      placeholder='© 2024 Your Company. All rights reserved.'
                      style={{
                        backgroundColor: '#4b5563',
                        borderColor: '#6b7280',
                        color: '#f9fafb',
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Widget Editor Dialog */}
      <Dialog open={isWidgetDialogOpen} onOpenChange={setIsWidgetDialogOpen}>
        <DialogContent
          className='max-w-2xl max-h-[80vh] overflow-y-auto'
          style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}
        >
          <DialogHeader
            style={{ backgroundColor: '#374151', borderColor: '#4b5563' }}
          >
            <DialogTitle
              className='flex items-center gap-2'
              style={{ color: '#f9fafb' }}
            >
              {getIconStrict(selectedWidget?.type || 'edit')} Edit Widget:{' '}
              {selectedWidget?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedWidget && (
            <div className='space-y-6'>
              <div className='space-y-4'>
                {renderWidgetEditor(selectedWidget)}
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end space-x-3 pt-4 border-t'>
                <Button
                  variant='outline'
                  onClick={() => setIsWidgetDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setIsWidgetDialogOpen(false);
                    toast({
                      title: 'Widget Updated',
                      description: 'Widget has been updated successfully!',
                    });
                  }}
                  className='bg-blue-600 hover:bg-blue-700 text-white'
                >
                  Save & Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FooterBuilder;
