import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { chatService } from '../services/chatService';
import {
  ChatUser,
  ChatMessage,
  ChatChannel,
  ChatNotification,
  ChatPresence,
  ChatStats,
} from '../types/chat';

interface ChatContextType {
  // State
  channels: ChatChannel[];
  currentChannel: ChatChannel | null;
  messages: ChatMessage[];
  users: ChatUser[];
  notifications: ChatNotification[];
  presence: ChatPresence[];
  stats: ChatStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentChannel: (channel: ChatChannel | null) => void;
  sendMessage: (
    content: string,
    mentions?: string[],
    replyTo?: string
  ) => Promise<void>;
  createChannel: (
    name: string,
    type: 'system' | 'project' | 'custom',
    description?: string,
    projectId?: string,
    isPrivate?: boolean
  ) => Promise<ChatChannel>;
  joinChannel: (channelId: string) => Promise<void>;
  leaveChannel: (channelId: string) => Promise<void>;
  searchMessages: (query: string) => Promise<ChatMessage[]>;
  markNotificationsAsRead: (notificationIds: string[]) => Promise<void>;
  updatePresence: (
    status: 'online' | 'offline' | 'away' | 'busy',
    currentChannel?: string
  ) => Promise<void>;
  getUserById: (userId: string) => ChatUser | undefined;
  getChannelById: (channelId: string) => ChatChannel | undefined;
  refreshData: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // State
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<ChatChannel | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [presence, setPresence] = useState<ChatPresence[]>([]);
  const [stats, setStats] = useState<ChatStats>({
    totalMessages: 0,
    totalChannels: 0,
    activeUsers: 0,
    messagesToday: 0,
    mentionsToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize chat service
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🚀 Initializing chat context...');

        // Initialize the chat service
        await chatService.initialize();

        // Load initial data
        await loadInitialData();

        // Set up real-time listeners
        setupRealtimeListeners();

        console.log('✅ Chat context initialized successfully');
      } catch (err) {
        console.error('Failed to initialize chat context:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to initialize chat'
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      chatService.cleanup();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      console.log('📊 Loading initial chat data...');

      // Load channels
      const channelsData = await chatService.getChannels();
      setChannels(channelsData);

      // Load users
      const usersData = await chatService.getUsers();
      setUsers(usersData);

      // Load notifications
      const notificationsData = await chatService.getNotifications();
      setNotifications(notificationsData);

      // Set initial stats
      updateStats(channelsData, notificationsData, usersData);

      console.log('✅ Initial data loaded');
    } catch (err) {
      console.error('Failed to load initial data:', err);
      throw err;
    }
  };

  const setupRealtimeListeners = () => {
    // Listen for new messages
    chatService.subscribe('chat:newMessage', (newMessage: any) => {
      console.log('📨 New message received in context:', newMessage);

      // Transform database message to ChatMessage type
      const message: ChatMessage = {
        id: newMessage.id,
        channelId: newMessage.channel_id,
        senderId: newMessage.sender_id,
        content: newMessage.content,
        timestamp: new Date(newMessage.created_at),
        type: newMessage.message_type,
        mentions: newMessage.mentions || [],
        replyTo: newMessage.reply_to_id,
        edited: newMessage.edited,
        editedAt: newMessage.edited_at
          ? new Date(newMessage.edited_at)
          : undefined,
        attachments: newMessage.attachments || [],
        reactions: newMessage.reactions || [],
        isDeleted: newMessage.is_deleted,
      };

      // Add to messages if it's for the current channel
      if (currentChannel && message.channelId === currentChannel.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Listen for presence updates
    chatService.subscribe('chat:presenceUpdate', (presenceUpdate: any) => {
      console.log('👤 Presence update received:', presenceUpdate);

      // Transform database presence to ChatPresence type
      const presence: ChatPresence = {
        userId: presenceUpdate.user_id,
        status: presenceUpdate.status,
        lastSeen: new Date(presenceUpdate.last_seen),
        currentChannel: presenceUpdate.current_channel,
      };

      setPresence(prev => {
        const existing = prev.find(p => p.userId === presence.userId);
        if (existing) {
          return prev.map(p => (p.userId === presence.userId ? presence : p));
        } else {
          return [...prev, presence];
        }
      });
    });

    // Listen for channel updates
    chatService.subscribe('chat:channelUpdate', (channelUpdate: any) => {
      console.log('📢 Channel update received:', channelUpdate);

      // Transform database channel to ChatChannel type
      const channel: ChatChannel = {
        id: channelUpdate.id,
        name: channelUpdate.name,
        type: channelUpdate.type,
        description: channelUpdate.description,
        projectId: channelUpdate.project_id,
        members: channelUpdate.members || [],
        admins: channelUpdate.admins || [],
        isPrivate: channelUpdate.is_private,
        createdAt: new Date(channelUpdate.created_at),
        lastMessage: undefined,
        unreadCount: 0,
        pinnedMessages: [],
        settings: channelUpdate.settings || {
          allowFileUploads: true,
          allowReactions: true,
          allowThreading: true,
          slowMode: false,
          slowModeInterval: 0,
        },
      };

      setChannels(prev => {
        const existing = prev.find(c => c.id === channel.id);
        if (existing) {
          return prev.map(c => (c.id === channel.id ? channel : c));
        } else {
          return [...prev, channel];
        }
      });
    });
  };

  const updateStats = (
    channels: ChatChannel[],
    notifications: ChatNotification[],
    users: ChatUser[]
  ) => {
    const activeUsers = users.filter(user => user.isOnline).length;

    setStats({
      totalMessages: messages.length,
      totalChannels: channels.length,
      activeUsers,
      messagesToday: 0, // TODO: Calculate messages from today
      mentionsToday: 0, // TODO: Calculate mentions from today
    });
  };

  // Load messages when current channel changes
  useEffect(() => {
    if (currentChannel) {
      loadMessagesForChannel(currentChannel.id);
    } else {
      setMessages([]);
    }
  }, [currentChannel]);

  const loadMessagesForChannel = async (channelId: string) => {
    try {
      console.log('📨 Loading messages for channel:', channelId);
      const messagesData = await chatService.getMessages(channelId);
      setMessages(messagesData);
      console.log('✅ Messages loaded:', messagesData.length);
    } catch (err) {
      console.error('Failed to load messages for channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  };

  const sendMessage = async (
    content: string,
    mentions: string[] = [],
    replyTo?: string
  ) => {
    if (!currentChannel) {
      throw new Error('No channel selected');
    }

    try {
      console.log('📤 Sending message to channel:', currentChannel.id);
      const message = await chatService.sendMessage(
        currentChannel.id,
        content,
        currentChannel.id
      );
      console.log('✅ Message sent:', message.id);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };

  const createChannel = async (
    name: string,
    type: 'system' | 'project' | 'custom',
    description?: string,
    projectId?: string,
    isPrivate: boolean = false
  ): Promise<ChatChannel> => {
    try {
      console.log('📢 Creating channel:', name);
      const channel = await chatService.createChannel(
        name,
        type,
        description,
        projectId,
        isPrivate
      );
      console.log('✅ Channel created:', channel.id);
      return channel;
    } catch (err) {
      console.error('Failed to create channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to create channel');
      throw err;
    }
  };

  const joinChannel = async (channelId: string): Promise<void> => {
    try {
      console.log('👥 Joining channel:', channelId);
      // For now, just set as current channel
      const channel = channels.find(c => c.id === channelId);
      if (channel) {
        setCurrentChannel(channel);
      }
    } catch (err) {
      console.error('Failed to join channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to join channel');
      throw err;
    }
  };

  const leaveChannel = async (channelId: string): Promise<void> => {
    try {
      console.log('👋 Leaving channel:', channelId);
      if (currentChannel?.id === channelId) {
        setCurrentChannel(null);
      }
    } catch (err) {
      console.error('Failed to leave channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave channel');
      throw err;
    }
  };

  const searchMessages = async (query: string): Promise<ChatMessage[]> => {
    try {
      console.log('🔍 Searching messages:', query);
      const results = await chatService.search(query);
      console.log('✅ Search results:', results.length);
      return results;
    } catch (err) {
      console.error('Failed to search messages:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to search messages'
      );
      throw err;
    }
  };

  const markNotificationsAsRead = async (
    notificationIds: string[]
  ): Promise<void> => {
    try {
      console.log('✅ Marking notifications as read:', notificationIds);
      await chatService.markNotificationsAsRead(notificationIds);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to mark notifications as read'
      );
      throw err;
    }
  };

  const updatePresence = async (
    status: 'online' | 'offline' | 'away' | 'busy',
    currentChannel?: string
  ): Promise<void> => {
    try {
      console.log('👤 Updating presence:', status);
      await chatService.updatePresence(status, currentChannel);
    } catch (err) {
      console.error('Failed to update presence:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to update presence'
      );
      throw err;
    }
  };

  const getUserById = (userId: string): ChatUser | undefined => {
    return users.find(user => user.id === userId);
  };

  const getChannelById = (channelId: string): ChatChannel | undefined => {
    return channels.find(channel => channel.id === channelId);
  };

  const refreshData = async (): Promise<void> => {
    try {
      console.log('🔄 Refreshing chat data...');
      await loadInitialData();
      if (currentChannel) {
        await loadMessagesForChannel(currentChannel.id);
      }
      console.log('✅ Data refreshed');
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      throw err;
    }
  };

  // Update stats when data changes
  useEffect(() => {
    updateStats(channels, notifications, users);
  }, [channels, notifications, users, messages]);

  const contextValue: ChatContextType = {
    // State
    channels,
    currentChannel,
    messages,
    users,
    notifications,
    presence,
    stats,
    isLoading,
    error,

    // Actions
    setCurrentChannel,
    sendMessage,
    createChannel,
    joinChannel,
    leaveChannel,
    searchMessages,
    markNotificationsAsRead,
    updatePresence,
    getUserById,
    getChannelById,
    refreshData,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
