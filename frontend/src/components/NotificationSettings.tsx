import {
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Settings,
  Shield,
  Smartphone,
} from 'lucide-react';
import { useState } from 'react';
import { useNotificationsStore } from '../app/store/notifications.store';
import { cn } from '../lib/utils/cn';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';

export function NotificationSettings() {
  const { updateSettings, getSettings } = useNotificationsStore();

  const [activeCategory, setActiveCategory] = useState('chat');
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    {
      id: 'chat',
      name: 'Chat',
      icon: MessageSquare,
      description: 'Chat messages and conversations',
    },
    {
      id: 'project',
      name: 'Project',
      icon: Settings,
      description: 'Project updates and changes',
    },
    {
      id: 'task',
      name: 'Task',
      icon: Settings,
      description: 'Task assignments and updates',
    },
    {
      id: 'system',
      name: 'System',
      icon: Settings,
      description: 'System notifications and maintenance',
    },
    {
      id: 'user',
      name: 'User',
      icon: Settings,
      description: 'User-related notifications',
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Security alerts and warnings',
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: Settings,
      description: 'Billing and payment notifications',
    },
  ];

  const currentSettings = getSettings('user-1', activeCategory) || {
    id: '',
    userId: 'user-1',
    category: activeCategory,
    enabled: true,
    channels: {
      inApp: true,
      email: false,
      push: false,
      sms: false,
    },
    frequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'UTC',
    },
    keywords: [],
    excludeKeywords: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [formData, setFormData] = useState(currentSettings);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateSettings('user-1', activeCategory, formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChannelChange = (channel: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: enabled,
      },
    }));
  };

  const handleQuietHoursChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value,
      },
    }));
  };

  const addKeyword = (keyword: string, isExclude = false) => {
    if (!keyword.trim()) return;

    setFormData(prev => ({
      ...prev,
      [isExclude ? 'excludeKeywords' : 'keywords']: [
        ...prev[isExclude ? 'excludeKeywords' : 'keywords'],
        keyword.trim(),
      ],
    }));
  };

  const removeKeyword = (keyword: string, isExclude = false) => {
    setFormData(prev => ({
      ...prev,
      [isExclude ? 'excludeKeywords' : 'keywords']: prev[
        isExclude ? 'excludeKeywords' : 'keywords'
      ].filter(k => k !== keyword),
    }));
  };

  return (
    <div className='space-y-6'>
      {/* Category Selection */}
      <div>
        <Label className='text-base font-medium mb-3 block'>
          Notification Categories
        </Label>
        <div className='grid grid-cols-2 gap-3'>
          {categories.map(category => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            const categorySettings = getSettings('user-1', category.id);
            const isEnabled = categorySettings?.enabled ?? true;

            return (
              <Card
                key={category.id}
                className={cn(
                  'cursor-pointer transition-colors',
                  isActive ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                <CardContent className='p-4'>
                  <div className='flex items-center space-x-3'>
                    <Icon className='h-5 w-5 text-gray-600' />
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-medium text-sm'>{category.name}</h3>
                      <p className='text-xs text-gray-500 truncate'>
                        {category.description}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      {isEnabled ? (
                        <Bell className='h-4 w-4 text-green-500' />
                      ) : (
                        <BellOff className='h-4 w-4 text-gray-400' />
                      )}
                      {isActive && (
                        <Badge variant='secondary' className='text-xs'>
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Settings className='h-5 w-5' />
            <span>
              {categories.find(c => c.id === activeCategory)?.name} Settings
            </span>
          </CardTitle>
          <CardDescription>
            Configure how you receive{' '}
            {categories.find(c => c.id === activeCategory)?.name.toLowerCase()}{' '}
            notifications
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Enable/Disable */}
          <div className='flex items-center justify-between'>
            <div>
              <Label className='text-base font-medium'>
                Enable Notifications
              </Label>
              <p className='text-sm text-gray-500'>
                Turn{' '}
                {categories
                  .find(c => c.id === activeCategory)
                  ?.name.toLowerCase()}{' '}
                notifications on or off
              </p>
            </div>
            <Switch
              checked={formData.enabled}
              onCheckedChange={checked =>
                setFormData(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {/* Notification Channels */}
          <div>
            <Label className='text-base font-medium mb-3 block'>
              Notification Channels
            </Label>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Bell className='h-5 w-5 text-gray-600' />
                  <div>
                    <Label className='text-sm font-medium'>
                      In-App Notifications
                    </Label>
                    <p className='text-xs text-gray-500'>
                      Show notifications within the application
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.channels.inApp}
                  onCheckedChange={checked =>
                    handleChannelChange('inApp', checked)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Mail className='h-5 w-5 text-gray-600' />
                  <div>
                    <Label className='text-sm font-medium'>
                      Email Notifications
                    </Label>
                    <p className='text-xs text-gray-500'>
                      Send notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.channels.email}
                  onCheckedChange={checked =>
                    handleChannelChange('email', checked)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Smartphone className='h-5 w-5 text-gray-600' />
                  <div>
                    <Label className='text-sm font-medium'>
                      Push Notifications
                    </Label>
                    <p className='text-xs text-gray-500'>
                      Send push notifications to your device
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.channels.push}
                  onCheckedChange={checked =>
                    handleChannelChange('push', checked)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Phone className='h-5 w-5 text-gray-600' />
                  <div>
                    <Label className='text-sm font-medium'>
                      SMS Notifications
                    </Label>
                    <p className='text-xs text-gray-500'>
                      Send notifications via SMS (premium feature)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.channels.sms}
                  onCheckedChange={checked =>
                    handleChannelChange('sms', checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <Label className='text-base font-medium mb-3 block'>
              Notification Frequency
            </Label>
            <Select
              value={formData.frequency}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, frequency: value as any }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='immediate'>Immediate</SelectItem>
                <SelectItem value='hourly'>Hourly Digest</SelectItem>
                <SelectItem value='daily'>Daily Digest</SelectItem>
                <SelectItem value='weekly'>Weekly Digest</SelectItem>
                <SelectItem value='never'>Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quiet Hours */}
          <div>
            <div className='flex items-center justify-between mb-3'>
              <Label className='text-base font-medium'>Quiet Hours</Label>
              <Switch
                checked={formData.quietHours.enabled}
                onCheckedChange={checked =>
                  handleQuietHoursChange('enabled', checked)
                }
              />
            </div>
            {formData.quietHours.enabled && (
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm'>Start Time</Label>
                  <Input
                    id='quiet-hours-start'
                    name='quiet-hours-start'
                    type='time'
                    value={formData.quietHours.start}
                    onChange={e =>
                      handleQuietHoursChange('start', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label className='text-sm'>End Time</Label>
                  <Input
                    id='quiet-hours-end'
                    name='quiet-hours-end'
                    type='time'
                    value={formData.quietHours.end}
                    onChange={e =>
                      handleQuietHoursChange('end', e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Keywords */}
          <div>
            <Label className='text-base font-medium mb-3 block'>
              Keyword Filters
            </Label>
            <div className='space-y-4'>
              <div>
                <Label className='text-sm font-medium'>Include Keywords</Label>
                <p className='text-xs text-gray-500 mb-2'>
                  Only show notifications containing these keywords
                </p>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {formData.keywords.map(keyword => (
                    <Badge
                      key={keyword}
                      variant='secondary'
                      className='text-xs'
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className='ml-1 hover:text-red-500'
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className='flex space-x-2'>
                  <Input
                    id='add-keyword'
                    name='add-keyword'
                    placeholder='Add keyword...'
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        addKeyword(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    size='sm'
                    onClick={e => {
                      const input = e.currentTarget
                        .previousElementSibling as HTMLInputElement;
                      addKeyword(input.value);
                      input.value = '';
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <Label className='text-sm font-medium'>Exclude Keywords</Label>
                <p className='text-xs text-gray-500 mb-2'>
                  Hide notifications containing these keywords
                </p>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {formData.excludeKeywords.map(keyword => (
                    <Badge
                      key={keyword}
                      variant='destructive'
                      className='text-xs'
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword, true)}
                        className='ml-1 hover:text-red-300'
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className='flex space-x-2'>
                  <Input
                    id='add-exclude-keyword'
                    name='add-exclude-keyword'
                    placeholder='Add exclude keyword...'
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        addKeyword(e.currentTarget.value, true);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={e => {
                      const input = e.currentTarget
                        .previousElementSibling as HTMLInputElement;
                      addKeyword(input.value, true);
                      input.value = '';
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className='flex justify-end pt-4 border-t'>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className='flex items-center space-x-2'
            >
              <Save className='h-4 w-4' />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
