import { useChatStore } from '../app/store/chat.store';
import { useNotificationsStore } from '../app/store/notifications.store';

/**
 * Service to handle chat notifications integration
 * Automatically creates notifications when new messages arrive
 */
export class ChatNotificationsService {
  private static instance: ChatNotificationsService;
  private chatStore: ReturnType<typeof useChatStore.getState>;
  private notificationsStore: ReturnType<typeof useNotificationsStore.getState>;

  private constructor() {
    this.chatStore = useChatStore.getState();
    this.notificationsStore = useNotificationsStore.getState();
  }

  public static getInstance(): ChatNotificationsService {
    if (!ChatNotificationsService.instance) {
      ChatNotificationsService.instance = new ChatNotificationsService();
    }
    return ChatNotificationsService.instance;
  }

  /**
   * Initialize the service by subscribing to chat store changes
   */
  public initialize() {
    // Subscribe to chat store changes
    useChatStore.subscribe((state, prevState) => {
      this.handleChatStoreChange(state, prevState);
    });
  }

  /**
   * Handle changes in the chat store
   */
  private handleChatStoreChange(
    currentState: ReturnType<typeof useChatStore.getState>,
    prevState: ReturnType<typeof useChatStore.getState>
  ) {
    // Check for new messages
    if (currentState.messages !== prevState.messages) {
      this.checkForNewMessages(currentState, prevState);
    }
  }

  /**
   * Check for new messages and create notifications
   */
  private checkForNewMessages(
    currentState: ReturnType<typeof useChatStore.getState>,
    prevState: ReturnType<typeof useChatStore.getState>
  ) {
    const currentMessages = currentState.messages;
    const prevMessages = prevState.messages;

    // Check each chat for new messages
    Object.keys(currentMessages).forEach(chatId => {
      const currentChatMessages = currentMessages[chatId] || [];
      const prevChatMessages = prevMessages[chatId] || [];

      // If there are new messages
      if (currentChatMessages.length > prevChatMessages.length) {
        const newMessages = currentChatMessages.slice(prevChatMessages.length);

        // Create notifications for new messages (excluding messages from current user)
        newMessages.forEach(message => {
          if (message.senderId !== 'user-1') {
            // Current user ID
            this.createChatNotification(chatId, message);
          }
        });
      }
    });
  }

  /**
   * Create a notification for a new chat message
   */
  private createChatNotification(chatId: string, message: any) {
    const chat = this.chatStore.chats.find(c => c.id === chatId);
    if (!chat) return;

    // Get sender information
    const sender = this.chatStore.users.find(u => u.id === message.senderId);
    const senderName = sender?.name || 'Unknown User';

    // Create notification
    this.notificationsStore.addNotification({
      title: `New message in ${chat.name}`,
      message: `${senderName}: ${this.truncateMessage(message.content)}`,
      type: 'chat',
      category: 'chat',
      priority: 'medium',
      userId: 'user-1', // Current user ID
      relatedEntityId: chatId,
      relatedEntityType: 'chat',
      actionUrl: `/chat/${chatId}`,
      actionText: 'View Chat',
      metadata: {
        chatId,
        messageId: message.id,
        senderId: message.senderId,
        senderName,
      },
    });
  }

  /**
   * Truncate message content for notification
   */
  private truncateMessage(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  /**
   * Create a notification for chat events (user joined, left, etc.)
   */
  public createChatEventNotification(
    chatId: string,
    eventType: 'user_joined' | 'user_left' | 'chat_created' | 'chat_archived',
    userId: string,
    userName: string
  ) {
    const chat = this.chatStore.chats.find(c => c.id === chatId);
    if (!chat) return;

    let title = '';
    let message = '';

    switch (eventType) {
      case 'user_joined':
        title = `User joined ${chat.name}`;
        message = `${userName} joined the chat`;
        break;
      case 'user_left':
        title = `User left ${chat.name}`;
        message = `${userName} left the chat`;
        break;
      case 'chat_created':
        title = `New chat created`;
        message = `${userName} created a new chat: ${chat.name}`;
        break;
      case 'chat_archived':
        title = `Chat archived`;
        message = `${userName} archived the chat: ${chat.name}`;
        break;
    }

    this.notificationsStore.addNotification({
      title,
      message,
      type: 'chat',
      category: 'chat',
      priority: 'low',
      userId: 'user-1', // Current user ID
      relatedEntityId: chatId,
      relatedEntityType: 'chat',
      actionUrl: `/chat/${chatId}`,
      actionText: 'View Chat',
      metadata: {
        chatId,
        eventType,
        userId,
        userName,
      },
    });
  }
}

// Export singleton instance
export const chatNotificationsService = ChatNotificationsService.getInstance();
