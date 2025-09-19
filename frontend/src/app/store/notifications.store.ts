import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'chat'
    | 'project'
    | 'task'
    | 'system';
  category:
    | 'chat'
    | 'project'
    | 'task'
    | 'system'
    | 'user'
    | 'security'
    | 'billing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isArchived: boolean;
  isPinned: boolean;
  userId: string;
  relatedEntityId?: string; // Project ID, Task ID, Chat ID, etc.
  relatedEntityType?: 'project' | 'task' | 'chat' | 'user' | 'document';
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
  readAt?: Date;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  category: string;
  enabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
  keywords: string[];
  excludeKeywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category: string;
  type: string;
  title: string;
  message: string;
  isActive: boolean;
  isSystem: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPermission {
  id: string;
  role: string;
  category: string;
  canReceive: boolean;
  canConfigure: boolean;
  canSend: boolean;
  canManage: boolean;
  restrictions?: string[];
}

interface NotificationsStore {
  // State
  notifications: Notification[];
  settings: NotificationSettings[];
  templates: NotificationTemplate[];
  permissions: NotificationPermission[];
  isOpen: boolean;
  selectedCategory: string | null;
  searchQuery: string;
  filterUnread: boolean;
  filterPriority: string | null;

  // Notification Management
  setOpen: (open: boolean) => void;
  addNotification: (
    notification: Omit<
      Notification,
      'id' | 'createdAt' | 'isRead' | 'isArchived' | 'isPinned'
    >
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (notificationId: string) => void;
  pinNotification: (notificationId: string) => void;
  deleteNotification: (notificationId: string) => void;
  clearExpired: () => void;

  // Settings Management
  updateSettings: (
    userId: string,
    category: string,
    settings: Partial<NotificationSettings>
  ) => void;
  getSettings: (
    userId: string,
    category: string
  ) => NotificationSettings | null;
  resetSettings: (userId: string) => void;

  // Template Management
  createTemplate: (
    template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateTemplate: (
    templateId: string,
    updates: Partial<NotificationTemplate>
  ) => void;
  deleteTemplate: (templateId: string) => void;

  // Permission Management
  updatePermission: (
    role: string,
    category: string,
    permission: Partial<NotificationPermission>
  ) => void;
  getPermission: (
    role: string,
    category: string
  ) => NotificationPermission | null;

  // Filters and Search
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterUnread: (unread: boolean) => void;
  setFilterPriority: (priority: string | null) => void;

  // Getters
  getUnreadCount: () => number;
  getUnreadCountByCategory: (category: string) => number;
  getFilteredNotifications: () => Notification[];
  getNotificationsByCategory: (category: string) => Notification[];
  getNotificationsByPriority: (priority: string) => Notification[];
  getRecentNotifications: (limit: number) => Notification[];
  getNotificationStats: () => {
    total: number;
    unread: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  };
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  // Initial State
  notifications: [
    {
      id: 'notif-1',
      title: 'New Message in Project Alpha',
      message: 'Sarah Wilson sent a message in the Project Alpha team chat',
      type: 'chat',
      category: 'chat',
      priority: 'medium',
      isRead: false,
      isArchived: false,
      isPinned: false,
      userId: 'user-1',
      relatedEntityId: 'chat-1',
      relatedEntityType: 'chat',
      actionUrl: '/chat/chat-1',
      actionText: 'View Chat',
      createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
    },
    {
      id: 'notif-2',
      title: 'Project Status Update',
      message: 'Project Beta has moved to the "Review" phase',
      type: 'project',
      category: 'project',
      priority: 'high',
      isRead: false,
      isArchived: false,
      isPinned: false,
      userId: 'user-1',
      relatedEntityId: 'project-beta-id',
      relatedEntityType: 'project',
      actionUrl: '/projects/project-beta-id',
      actionText: 'View Project',
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
      id: 'notif-3',
      title: 'Task Assignment',
      message: 'You have been assigned to "Site Inspection" task',
      type: 'task',
      category: 'task',
      priority: 'medium',
      isRead: true,
      isArchived: false,
      isPinned: false,
      userId: 'user-1',
      relatedEntityId: 'task-1',
      relatedEntityType: 'task',
      actionUrl: '/tasks/task-1',
      actionText: 'View Task',
      createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    },
    {
      id: 'notif-4',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM',
      type: 'system',
      category: 'system',
      priority: 'low',
      isRead: true,
      isArchived: false,
      isPinned: false,
      userId: 'user-1',
      actionText: 'Learn More',
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
    },
  ],
  settings: [
    {
      id: 'settings-1',
      userId: 'user-1',
      category: 'chat',
      enabled: true,
      channels: {
        inApp: true,
        email: true,
        push: true,
        sms: false,
      },
      frequency: 'immediate',
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC',
      },
      keywords: ['urgent', 'important'],
      excludeKeywords: ['spam'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  templates: [
    {
      id: 'template-1',
      name: 'Project Update',
      category: 'project',
      type: 'info',
      title: 'Project {{projectName}} Update',
      message: '{{projectName}} has been updated: {{updateMessage}}',
      isActive: true,
      isSystem: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  permissions: [
    {
      id: 'perm-1',
      role: 'admin',
      category: 'all',
      canReceive: true,
      canConfigure: true,
      canSend: true,
      canManage: true,
    },
    {
      id: 'perm-2',
      role: 'user',
      category: 'chat',
      canReceive: true,
      canConfigure: true,
      canSend: false,
      canManage: false,
    },
  ],
  isOpen: false,
  selectedCategory: null,
  searchQuery: '',
  filterUnread: false,
  filterPriority: null,

  // Notification Management Actions
  setOpen: (open: boolean) => set({ isOpen: open }),

  addNotification: notificationData => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      isRead: false,
      isArchived: false,
      isPinned: false,
    };
    set(state => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  markAsRead: notificationId => {
    set(state => ({
      notifications: state.notifications.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true, readAt: new Date() }
          : notif
      ),
    }));
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notif => ({
        ...notif,
        isRead: true,
        readAt: new Date(),
      })),
    }));
  },

  archiveNotification: notificationId => {
    set(state => ({
      notifications: state.notifications.map(notif =>
        notif.id === notificationId
          ? { ...notif, isArchived: !notif.isArchived }
          : notif
      ),
    }));
  },

  pinNotification: notificationId => {
    set(state => ({
      notifications: state.notifications.map(notif =>
        notif.id === notificationId
          ? { ...notif, isPinned: !notif.isPinned }
          : notif
      ),
    }));
  },

  deleteNotification: notificationId => {
    set(state => ({
      notifications: state.notifications.filter(
        notif => notif.id !== notificationId
      ),
    }));
  },

  clearExpired: () => {
    const now = new Date();
    set(state => ({
      notifications: state.notifications.filter(
        notif => !notif.expiresAt || notif.expiresAt > now
      ),
    }));
  },

  // Settings Management Actions
  updateSettings: (userId, category, settingsData) => {
    set(state => {
      const existingIndex = state.settings.findIndex(
        s => s.userId === userId && s.category === category
      );

      if (existingIndex >= 0) {
        const updatedSettings = [...state.settings];
        updatedSettings[existingIndex] = {
          ...updatedSettings[existingIndex],
          ...settingsData,
          updatedAt: new Date(),
        };
        return { settings: updatedSettings };
      } else {
        const newSettings: NotificationSettings = {
          id: `settings-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          category,
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
          ...settingsData,
        };
        return { settings: [...state.settings, newSettings] };
      }
    });
  },

  getSettings: (userId, category) => {
    return (
      get().settings.find(
        s => s.userId === userId && s.category === category
      ) || null
    );
  },

  resetSettings: userId => {
    set(state => ({
      settings: state.settings.filter(s => s.userId !== userId),
    }));
  },

  // Template Management Actions
  createTemplate: templateData => {
    const newTemplate: NotificationTemplate = {
      ...templateData,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set(state => ({
      templates: [...state.templates, newTemplate],
    }));
  },

  updateTemplate: (templateId, updates) => {
    set(state => ({
      templates: state.templates.map(template =>
        template.id === templateId
          ? { ...template, ...updates, updatedAt: new Date() }
          : template
      ),
    }));
  },

  deleteTemplate: templateId => {
    set(state => ({
      templates: state.templates.filter(template => template.id !== templateId),
    }));
  },

  // Permission Management Actions
  updatePermission: (role, category, permissionData) => {
    set(state => {
      const existingIndex = state.permissions.findIndex(
        p => p.role === role && p.category === category
      );

      if (existingIndex >= 0) {
        const updatedPermissions = [...state.permissions];
        updatedPermissions[existingIndex] = {
          ...updatedPermissions[existingIndex],
          ...permissionData,
        };
        return { permissions: updatedPermissions };
      } else {
        const newPermission: NotificationPermission = {
          id: `perm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role,
          category,
          canReceive: true,
          canConfigure: false,
          canSend: false,
          canManage: false,
          ...permissionData,
        };
        return { permissions: [...state.permissions, newPermission] };
      }
    });
  },

  getPermission: (role, category) => {
    return (
      get().permissions.find(p => p.role === role && p.category === category) ||
      null
    );
  },

  // Filter and Search Actions
  setSelectedCategory: category => set({ selectedCategory: category }),
  setSearchQuery: query => set({ searchQuery: query }),
  setFilterUnread: unread => set({ filterUnread: unread }),
  setFilterPriority: priority => set({ filterPriority: priority }),

  // Getters
  getUnreadCount: () => {
    return get().notifications.filter(notif => !notif.isRead).length;
  },

  getUnreadCountByCategory: category => {
    return get().notifications.filter(
      notif => !notif.isRead && notif.category === category
    ).length;
  },

  getFilteredNotifications: () => {
    const {
      notifications,
      selectedCategory,
      searchQuery,
      filterUnread,
      filterPriority,
    } = get();
    let filtered = [...notifications];

    // Sort by pinned first, then by creation date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    if (selectedCategory) {
      filtered = filtered.filter(notif => notif.category === selectedCategory);
    }

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        notif =>
          notif.title.toLowerCase().includes(lowercaseQuery) ||
          notif.message.toLowerCase().includes(lowercaseQuery)
      );
    }

    if (filterUnread) {
      filtered = filtered.filter(notif => !notif.isRead);
    }

    if (filterPriority) {
      filtered = filtered.filter(notif => notif.priority === filterPriority);
    }

    return filtered;
  },

  getNotificationsByCategory: category => {
    return get().notifications.filter(notif => notif.category === category);
  },

  getNotificationsByPriority: priority => {
    return get().notifications.filter(notif => notif.priority === priority);
  },

  getRecentNotifications: limit => {
    return get()
      .notifications.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )
      .slice(0, limit);
  },

  getNotificationStats: () => {
    const notifications = get().notifications;
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };

    notifications.forEach(notif => {
      stats.byCategory[notif.category] =
        (stats.byCategory[notif.category] || 0) + 1;
      stats.byPriority[notif.priority] =
        (stats.byPriority[notif.priority] || 0) + 1;
    });

    return stats;
  },
}));
