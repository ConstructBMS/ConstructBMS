import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

interface NotificationBellProps {
  onModuleChange: (module: string) => void;
  activeModule: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  onModuleChange,
  activeModule,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
    loadNotifications();
    subscribeToNotifications();
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
    }
  };

  const loadNotifications = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!currentUser) return;

    const subscription = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        payload => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'warning':
        return <AlertCircle className='w-4 h-4 text-yellow-500' />;
      case 'error':
        return <X className='w-4 h-4 text-red-500' />;
      default:
        return <Info className='w-4 h-4 text-blue-500' />;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className='relative'>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors duration-200 ${
          activeModule === 'notifications'
            ? 'text-archer-neon bg-archer-neon/10 border border-archer-neon/20'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <Bell className='h-5 w-5' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Notifications
            </h3>
            <div className='flex items-center space-x-3'>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className='text-sm text-blue-600 hover:text-blue-800 font-medium'
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onModuleChange('notifications');
                }}
                className='text-sm text-archer-neon hover:text-archer-black font-medium'
              >
                View All
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className='max-h-96 overflow-y-auto'>
            {isLoading ? (
              <div className='flex justify-center py-8'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className='text-center py-8'>
                <Bell className='w-8 h-8 text-gray-300 mx-auto mb-2' />
                <p className='text-sm text-gray-500'>No notifications</p>
              </div>
            ) : (
              <div className='divide-y divide-gray-100'>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className='flex items-start space-x-3'>
                      <div className='flex-shrink-0 mt-1'>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center space-x-2'>
                          <h4
                            className={`text-sm font-medium ${
                              notification.is_read
                                ? 'text-gray-900'
                                : 'text-gray-900'
                            }`}
                          >
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                          )}
                        </div>
                        <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                          {notification.message}
                        </p>
                        <p className='text-xs text-gray-400 mt-2'>
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      <div className='flex-shrink-0'>
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className='p-1 hover:bg-gray-200 rounded transition-colors'
                            title='Mark as read'
                          >
                            <Check className='w-4 h-4 text-gray-400' />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className='p-4 border-t border-gray-200'>
              <button className='w-full text-sm text-blue-600 hover:text-blue-800 font-medium'>
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
