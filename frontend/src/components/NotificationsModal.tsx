import { Bell, Check, Filter, Search, Settings, X } from 'lucide-react';
import { useState } from 'react';
import { useNotificationsStore } from '../app/store/notifications.store';
import { NotificationItem } from './NotificationItem';
import { NotificationSettings } from './NotificationSettings';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({
  isOpen,
  onClose,
}: NotificationsModalProps) {
  const {
    notifications,
    selectedCategory,
    searchQuery,
    filterUnread,
    filterPriority,
    setSelectedCategory,
    setSearchQuery,
    setFilterUnread,
    setFilterPriority,
    markAllAsRead,
    getFilteredNotifications,
    getUnreadCount,
    getNotificationStats,
  } = useNotificationsStore();

  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>(
    'notifications'
  );
  const [showFilters, setShowFilters] = useState(false);

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = getUnreadCount();
  const stats = getNotificationStats();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'chat', label: 'Chat' },
    { value: 'project', label: 'Project' },
    { value: 'task', label: 'Task' },
    { value: 'system', label: 'System' },
    { value: 'user', label: 'User' },
    { value: 'security', label: 'Security' },
    { value: 'billing', label: 'Billing' },
  ];

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex'>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='relative ml-auto w-[600px] h-full bg-white border-l shadow-xl'>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b bg-white'>
            <div className='flex items-center space-x-4'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className='bg-red-500 text-white text-xs rounded-full px-2 py-1'>
                  {unreadCount}
                </span>
              )}
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setShowFilters(!showFilters)}
                title='Filters'
                className='text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              >
                <Filter className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setActiveTab('settings')}
                title='Settings'
                className='text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              >
                <Settings className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={onClose}
                className='text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className='p-4 border-b bg-white space-y-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search notifications...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 bg-white border-gray-300 text-gray-900'
              />
            </div>

            {showFilters && (
              <div className='grid grid-cols-2 gap-3'>
                <Select
                  value={selectedCategory || 'all'}
                  onValueChange={value =>
                    setSelectedCategory(value === 'all' ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterPriority || 'all'}
                  onValueChange={value =>
                    setFilterPriority(value === 'all' ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Priority' />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <Button
                  variant={filterUnread ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setFilterUnread(!filterUnread)}
                >
                  <Bell className='h-4 w-4 mr-1' />
                  Unread Only
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={markAllAsRead}
                    className='text-green-600 hover:text-green-700'
                  >
                    <Check className='h-4 w-4 mr-1' />
                    Mark All Read
                  </Button>
                )}
              </div>
              <div className='text-sm text-gray-500'>
                {filteredNotifications.length} notification
                {filteredNotifications.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={value =>
              setActiveTab(value as 'notifications' | 'settings')
            }
          >
            <div className='px-4 pt-4'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='notifications'>Notifications</TabsTrigger>
                <TabsTrigger value='settings'>Settings</TabsTrigger>
              </TabsList>
            </div>

            {/* Notifications Tab */}
            <TabsContent
              value='notifications'
              className='flex-1 overflow-hidden'
            >
              <div className='flex-1 overflow-y-auto p-4'>
                {filteredNotifications.length === 0 ? (
                  <div className='flex-1 flex items-center justify-center text-gray-500'>
                    <div className='text-center'>
                      <Bell className='h-12 w-12 mx-auto mb-4 opacity-50' />
                      <h3 className='text-lg font-medium mb-2'>
                        No notifications
                      </h3>
                      <p className='text-sm'>
                        {searchQuery ||
                        selectedCategory ||
                        filterUnread ||
                        filterPriority
                          ? 'No notifications match your current filters'
                          : "You're all caught up!"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {filteredNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value='settings' className='flex-1 overflow-hidden'>
              <div className='flex-1 overflow-y-auto p-4'>
                <NotificationSettings />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
