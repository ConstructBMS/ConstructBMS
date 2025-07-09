export interface EmailNotification {
  id: string;
  type:
    | 'new_email'
    | 'email_assigned'
    | 'email_replied'
    | 'email_urgent'
    | 'email_customer_linked'
    | 'email_project_linked';
  title: string;
  message: string;
  emailId: string;
  emailSubject: string;
  sender: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  timestamp: Date;
  relatedCustomerId?: string;
  relatedProjectId?: string;
  relatedOpportunityId?: string;
  actionRequired: boolean;
}

export interface EmailNotificationSettings {
  userId: string;
  newEmails: boolean;
  urgentEmails: boolean;
  customerEmails: boolean;
  projectEmails: boolean;
  assignmentNotifications: boolean;
  replyNotifications: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
}

class EmailNotificationService {
  private notifications: EmailNotification[] = [];
  private settings: EmailNotificationSettings[] = [];
  private subscribers: ((data: any) => void)[] = [];

  // Create notification for new email
  createNewEmailNotification(
    emailId: string,
    emailSubject: string,
    sender: string,
    priority: string,
    customerId?: string,
    projectId?: string,
    opportunityId?: string
  ): EmailNotification {
    const notification: EmailNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'new_email',
      title: 'New Email Received',
      message: `New email from ${sender}: ${emailSubject}`,
      emailId,
      emailSubject,
      sender,
      priority: priority as 'low' | 'medium' | 'high' | 'urgent',
      isRead: false,
      timestamp: new Date(),
      relatedCustomerId: customerId,
      relatedProjectId: projectId,
      relatedOpportunityId: opportunityId,
      actionRequired: priority === 'urgent' || priority === 'high',
    };

    this.notifications.unshift(notification);
    this.notifySubscribers({
      type: 'notification_created',
      data: notification,
    });

    // Create activity stream entry
    this.createActivityStreamEntry(notification);

    return notification;
  }

  // Create notification for email assignment
  createAssignmentNotification(
    emailId: string,
    emailSubject: string,
    assignedTo: string,
    assignedBy: string
  ): EmailNotification {
    const notification: EmailNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'email_assigned',
      title: 'Email Assigned to You',
      message: `${assignedBy} assigned you an email: ${emailSubject}`,
      emailId,
      emailSubject,
      sender: assignedBy,
      priority: 'medium',
      isRead: false,
      timestamp: new Date(),
      actionRequired: true,
    };

    this.notifications.unshift(notification);
    this.notifySubscribers({
      type: 'notification_created',
      data: notification,
    });

    // Create activity stream entry
    this.createActivityStreamEntry(notification);

    return notification;
  }

  // Create notification for urgent email
  createUrgentEmailNotification(
    emailId: string,
    emailSubject: string,
    sender: string,
    customerId?: string
  ): EmailNotification {
    const notification: EmailNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'email_urgent',
      title: 'Urgent Email Requires Attention',
      message: `Urgent email from ${sender}: ${emailSubject}`,
      emailId,
      emailSubject,
      sender,
      priority: 'urgent',
      isRead: false,
      timestamp: new Date(),
      relatedCustomerId: customerId,
      actionRequired: true,
    };

    this.notifications.unshift(notification);
    this.notifySubscribers({
      type: 'notification_created',
      data: notification,
    });

    // Create activity stream entry
    this.createActivityStreamEntry(notification);

    return notification;
  }

  // Create notification for customer-linked email
  createCustomerLinkedNotification(
    emailId: string,
    emailSubject: string,
    customerName: string
  ): EmailNotification {
    const notification: EmailNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'email_customer_linked',
      title: 'Customer Email Linked',
      message: `Email linked to customer: ${customerName}`,
      emailId,
      emailSubject,
      sender: 'System',
      priority: 'low',
      isRead: false,
      timestamp: new Date(),
      actionRequired: false,
    };

    this.notifications.unshift(notification);
    this.notifySubscribers({
      type: 'notification_created',
      data: notification,
    });

    return notification;
  }

  // Create notification for project-linked email
  createProjectLinkedNotification(
    emailId: string,
    emailSubject: string,
    projectName: string
  ): EmailNotification {
    const notification: EmailNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'email_project_linked',
      title: 'Project Email Linked',
      message: `Email linked to project: ${projectName}`,
      emailId,
      emailSubject,
      sender: 'System',
      priority: 'low',
      isRead: false,
      timestamp: new Date(),
      actionRequired: false,
    };

    this.notifications.unshift(notification);
    this.notifySubscribers({
      type: 'notification_created',
      data: notification,
    });

    return notification;
  }

  // Create activity stream entry
  private createActivityStreamEntry(notification: EmailNotification): void {
    try {
      import('./activityStream').then(({ activityStreamService }) => {
        let activityType:
          | 'project'
          | 'task'
          | 'client'
          | 'deal'
          | 'document'
          | 'user'
          | 'system'
          | 'notification' = 'notification';
        let description = `Email received from ${notification.sender}`;

        switch (notification.type) {
          case 'email_assigned':
            activityType = 'notification';
            description = `Email assigned: ${notification.emailSubject}`;
            break;
          case 'email_urgent':
            activityType = 'notification';
            description = `Urgent email requires attention: ${notification.emailSubject}`;
            break;
          case 'email_customer_linked':
            activityType = 'client';
            description = `Email linked to customer`;
            break;
          case 'email_project_linked':
            activityType = 'project';
            description = `Email linked to project`;
            break;
        }

        activityStreamService.addActivity({
          type: activityType,
          category: 'alert',
          title: notification.title,
          description,
          entityId: notification.emailId,
          entityName: notification.emailSubject,
          userId: 'system',
          userName: 'System',
          priority: notification.priority,
          actionable: true,
          actionUrl: `/email/${notification.emailId}`,
          icon: 'Mail',
          color:
            notification.priority === 'urgent'
              ? 'red'
              : notification.priority === 'high'
                ? 'orange'
                : 'blue',
        });
      });
    } catch (error) {
      // Activity stream service not available, continue
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifySubscribers({
        type: 'notification_updated',
        data: notification,
      });
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    this.notifySubscribers({
      type: 'notifications_updated',
      data: this.notifications,
    });
  }

  // Delete notification
  deleteNotification(notificationId: string): boolean {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.notifySubscribers({
        type: 'notification_deleted',
        data: { notificationId },
      });
      return true;
    }
    return false;
  }

  // Get all notifications
  getNotifications(): EmailNotification[] {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications(): EmailNotification[] {
    return this.notifications.filter(n => !n.isRead);
  }

  // Get notifications by type
  getNotificationsByType(type: string): EmailNotification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Get notifications for user
  getUserNotifications(userId: string): EmailNotification[] {
    // In a real implementation, this would filter by user
    return this.notifications;
  }

  // Get notification count
  getNotificationCount(): number {
    return this.notifications.length;
  }

  // Get unread notification count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Get urgent notification count
  getUrgentCount(): number {
    return this.notifications.filter(n => n.priority === 'urgent' && !n.isRead)
      .length;
  }

  // Update notification settings
  updateNotificationSettings(
    userId: string,
    settings: Partial<EmailNotificationSettings>
  ): EmailNotificationSettings {
    const existingSettings = this.settings.find(s => s.userId === userId);

    if (existingSettings) {
      Object.assign(existingSettings, settings);
      this.notifySubscribers({
        type: 'settings_updated',
        data: existingSettings,
      });
      return existingSettings;
    } else {
      const newSettings: EmailNotificationSettings = {
        userId,
        newEmails: true,
        urgentEmails: true,
        customerEmails: true,
        projectEmails: true,
        assignmentNotifications: true,
        replyNotifications: true,
        desktopNotifications: true,
        emailNotifications: false,
        ...settings,
      };

      this.settings.push(newSettings);
      this.notifySubscribers({ type: 'settings_created', data: newSettings });
      return newSettings;
    }
  }

  // Get notification settings for user
  getNotificationSettings(userId: string): EmailNotificationSettings | null {
    return this.settings.find(s => s.userId === userId) || null;
  }

  // Subscribe to updates
  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(data: any): void {
    this.subscribers.forEach(callback => callback(data));
  }

  // Initialize with demo data
  initializeDemoData(): void {
    // Create demo notifications
    this.createNewEmailNotification(
      'email_1',
      'Project Alpha - Urgent Deadline Extension Request',
      'Sarah Johnson',
      'high',
      'cust_1',
      'proj_alpha',
      'opp_1'
    );

    this.createAssignmentNotification(
      'email_1',
      'Project Alpha - Urgent Deadline Extension Request',
      'Mike Wilson',
      'Sarah Johnson'
    );

    this.createUrgentEmailNotification(
      'email_1',
      'Project Alpha - Urgent Deadline Extension Request',
      'Sarah Johnson',
      'cust_1'
    );

    this.createCustomerLinkedNotification(
      'email_1',
      'Project Alpha - Urgent Deadline Extension Request',
      'TechCorp Solutions'
    );

    this.createProjectLinkedNotification(
      'email_1',
      'Project Alpha - Urgent Deadline Extension Request',
      'Project Alpha'
    );

    // Create demo settings
    this.updateNotificationSettings('user_1', {
      newEmails: true,
      urgentEmails: true,
      customerEmails: true,
      projectEmails: true,
      assignmentNotifications: true,
      replyNotifications: true,
      desktopNotifications: true,
      emailNotifications: false,
    });
  }
}

export const emailNotificationService = new EmailNotificationService();
emailNotificationService.initializeDemoData();
