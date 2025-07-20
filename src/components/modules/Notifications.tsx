import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface Notification {
  created_at: string;
  data?: any;
  id: string;
  is_read: boolean;
  message: string;
  title: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
        .order('created_at', { ascending: false });

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
      .channel('notifications_module')
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
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Notifications module real-time subscription connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Notifications module real-time subscription failed - using local data only');
        } else if (status === 'TIMED_OUT') {
          console.warn('⚠️ Notifications module real-time subscription timed out - using local data only');
        }
      });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.warn('⚠️ Error unsubscribing from notifications module:', error);
      }
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

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case 'warning':
        return <AlertCircle className='w-5 h-5 text-yellow-500' />;
      case 'error':
        return <X className='w-5 h-5 text-red-500' />;
      default:
        return <Info className='w-5 h-5 text-blue-500' />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
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
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <Bell className='w-6 h-6 text-blue-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Notifications</h1>
            <p className='text-gray-500'>
              Stay updated with your latest activities
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className='px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
            >
              Mark all as read
            </button>
          )}
          <div className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
            {unreadCount} unread
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className='space-y-4'>
        {isLoading ? (
          <div className='flex justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className='text-center py-12'>
            <Bell className='w-12 h-12 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No notifications
            </h3>
            <p className='text-gray-500'>
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg transition-all duration-200 ${
                notification.is_read
                  ? 'bg-white border-gray-200'
                  : `${getNotificationColor(notification.type)} border-l-4`
              }`}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-3 flex-1'>
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
                    <p className='text-sm text-gray-600 mt-1'>
                      {notification.message}
                    </p>
                    <p className='text-xs text-gray-400 mt-2'>
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-1 ml-4'>
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className='p-1 hover:bg-gray-100 rounded transition-colors'
                      title='Mark as read'
                    >
                      <Check className='w-4 h-4 text-gray-400' />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className='p-1 hover:bg-gray-100 rounded transition-colors'
                    title='Delete notification'
                  >
                    <X className='w-4 h-4 text-gray-400' />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {notifications.length > 0 && (
        <div className='text-center'>
          <button className='px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'>
            Load more notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
