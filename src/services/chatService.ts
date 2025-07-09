import { supabase } from './supabaseAuth';
import {
  ChatUser,
  ChatMessage,
  ChatChannel,
  ChatNotification,
  ChatPresence,
  ChatStats,
} from '../types/chat';

class ChatService {
  private static instance: ChatService;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async initialize(): Promise<void> {
    try {
      console.log('✅ Initializing chat service with Supabase...');

      // Set up real-time subscriptions
      this.setupRealtimeSubscriptions();

      console.log('✅ Chat service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize chat service:', error);
      throw error;
    }
  }

  private setupRealtimeSubscriptions(): void {
    try {
      // Subscribe to new messages
      const messagesSubscription = supabase
        .channel('chat_messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          payload => {
            console.log('📨 New message received:', payload.new);
            this.notifyListeners('chat:newMessage', payload.new);
          }
        )
        .subscribe();

      // Subscribe to presence updates
      const presenceSubscription = supabase
        .channel('chat_presence')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chat_presence' },
          payload => {
            console.log('👤 Presence update:', payload.new);
            this.notifyListeners('chat:presenceUpdate', payload.new);
          }
        )
        .subscribe();

      // Subscribe to channel updates
      const channelsSubscription = supabase
        .channel('chat_channels')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chat_channels' },
          payload => {
            console.log('📢 Channel update:', payload.new);
            this.notifyListeners('chat:channelUpdate', payload.new);
          }
        )
        .subscribe();

      console.log('✅ Real-time subscriptions set up');
    } catch (error) {
      console.error('Failed to set up real-time subscriptions:', error);
    }
  }

  async getChannels(): Promise<ChatChannel[]> {
    try {
      const { data, error } = await supabase
        .from('chat_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading channels:', error);
        throw error;
      }

      // Transform database format to ChatChannel type
      const channels: ChatChannel[] = (data || []).map((dbChannel: any) => ({
        id: dbChannel.id,
        name: dbChannel.name,
        type: dbChannel.type,
        description: dbChannel.description,
        projectId: dbChannel.project_id,
        members: dbChannel.members || [],
        admins: dbChannel.admins || [],
        isPrivate: dbChannel.is_private,
        createdAt: new Date(dbChannel.created_at),
        lastMessage: undefined, // Will be loaded separately
        unreadCount: 0, // Will be calculated separately
        pinnedMessages: [],
        settings: dbChannel.settings || {
          allowFileUploads: true,
          allowReactions: true,
          allowThreading: true,
          slowMode: false,
          slowModeInterval: 0,
        },
      }));

      console.log('✅ Loaded channels:', channels.length);
      return channels;
    } catch (error) {
      console.error('Failed to load channels:', error);
      throw error;
    }
  }

  async getMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }

      // Transform database format to ChatMessage type
      const messages: ChatMessage[] = (data || []).map((dbMessage: any) => ({
        id: dbMessage.id,
        channelId: dbMessage.channel_id,
        senderId: dbMessage.sender_id,
        content: dbMessage.content,
        timestamp: new Date(dbMessage.created_at),
        type: dbMessage.message_type,
        mentions: dbMessage.mentions || [],
        replyTo: dbMessage.reply_to_id,
        edited: dbMessage.edited,
        editedAt: dbMessage.edited_at
          ? new Date(dbMessage.edited_at)
          : undefined,
        attachments: dbMessage.attachments || [],
        reactions: dbMessage.reactions || [],
        isDeleted: dbMessage.is_deleted,
      }));

      console.log(
        '✅ Loaded messages for channel',
        channelId,
        ':',
        messages.length
      );
      return messages;
    } catch (error) {
      console.error('Failed to load messages:', error);
      throw error;
    }
  }

  async sendMessage(
    channelId: string,
    content: string,
    senderId: string
  ): Promise<ChatMessage> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: channelId,
          sender_id: senderId,
          content: content,
          message_type: 'text',
          mentions: [],
          edited: false,
          attachments: [],
          reactions: [],
          is_deleted: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      // Transform to ChatMessage type
      const message: ChatMessage = {
        id: data.id,
        channelId: data.channel_id,
        senderId: data.sender_id,
        content: data.content,
        timestamp: new Date(data.created_at),
        type: data.message_type,
        mentions: data.mentions || [],
        edited: data.edited,
        editedAt: data.edited_at ? new Date(data.edited_at) : undefined,
        attachments: data.attachments || [],
        reactions: data.reactions || [],
        isDeleted: data.is_deleted,
      };

      console.log('✅ Message sent:', message.id);
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async sendMessageWithMentions(
    channelId: string,
    content: string,
    mentions: string[] = [],
    replyTo?: string,
    attachments?: any[]
  ): Promise<ChatMessage> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          channel_id: channelId,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          content: content,
          message_type: 'text',
          mentions: mentions,
          reply_to_id: replyTo,
          edited: false,
          attachments: attachments || [],
          reactions: [],
          is_deleted: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message with mentions:', error);
        throw error;
      }

      // Transform to ChatMessage type
      const message: ChatMessage = {
        id: data.id,
        channelId: data.channel_id,
        senderId: data.sender_id,
        content: data.content,
        timestamp: new Date(data.created_at),
        type: data.message_type,
        mentions: data.mentions || [],
        replyTo: data.reply_to_id,
        edited: data.edited,
        editedAt: data.edited_at ? new Date(data.edited_at) : undefined,
        attachments: data.attachments || [],
        reactions: data.reactions || [],
        isDeleted: data.is_deleted,
      };

      console.log('✅ Message sent with mentions:', message.id);
      return message;
    } catch (error) {
      console.error('Failed to send message with mentions:', error);
      throw error;
    }
  }

  async createChannel(
    name: string,
    type: 'system' | 'project' | 'custom',
    description?: string,
    projectId?: string,
    isPrivate: boolean = false
  ): Promise<ChatChannel> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const { data, error } = await supabase
        .from('chat_channels')
        .insert({
          name: name,
          type: type,
          description: description,
          project_id: projectId,
          members: [userId],
          admins: [userId],
          is_private: isPrivate,
          settings: {
            allowFileUploads: true,
            allowReactions: true,
            allowThreading: true,
            slowMode: false,
            slowModeInterval: 0,
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating channel:', error);
        throw error;
      }

      // Transform to ChatChannel type
      const channel: ChatChannel = {
        id: data.id,
        name: data.name,
        type: data.type,
        description: data.description,
        projectId: data.project_id,
        members: data.members || [],
        admins: data.admins || [],
        isPrivate: data.is_private,
        createdAt: new Date(data.created_at),
        lastMessage: undefined,
        unreadCount: 0,
        pinnedMessages: [],
        settings: data.settings || {
          allowFileUploads: true,
          allowReactions: true,
          allowThreading: true,
          slowMode: false,
          slowModeInterval: 0,
        },
      };

      console.log('✅ Channel created:', channel.id);
      return channel;
    } catch (error) {
      console.error('Failed to create channel:', error);
      throw error;
    }
  }

  async getUsers(): Promise<ChatUser[]> {
    try {
      // For now, return a demo user since we don't have a users table
      // In a real app, you'd query your users table
      const demoUsers: ChatUser[] = [
        {
          id: '58309b6c-86f7-482b-af81-e3736be3e5f2',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'super_admin',
          isOnline: true,
          status: 'available',
        },
      ];

      console.log('✅ Loaded users:', demoUsers.length);
      return demoUsers;
    } catch (error) {
      console.error('Failed to load users:', error);
      throw error;
    }
  }

  async updatePresence(
    status: 'online' | 'offline' | 'away' | 'busy',
    currentChannel?: string
  ): Promise<void> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const { error } = await supabase.from('chat_presence').upsert({
        user_id: userId,
        status: status,
        current_channel: currentChannel,
        last_seen: new Date().toISOString(),
      });

      if (error) {
        console.error('Error updating presence:', error);
        throw error;
      }

      console.log('✅ Presence updated:', status);
    } catch (error) {
      console.error('Failed to update presence:', error);
      throw error;
    }
  }

  async getNotifications(): Promise<ChatNotification[]> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const { data, error } = await supabase
        .from('chat_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notifications:', error);
        throw error;
      }

      // Transform to ChatNotification type
      const notifications: ChatNotification[] = (data || []).map(
        (dbNotification: any) => ({
          id: dbNotification.id,
          userId: dbNotification.user_id,
          type: dbNotification.type,
          channelId: dbNotification.channel_id,
          messageId: dbNotification.message_id,
          senderId: dbNotification.sender_id,
          content: dbNotification.content || '',
          timestamp: new Date(dbNotification.created_at),
          isRead: dbNotification.read,
        })
      );

      console.log('✅ Loaded notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('Failed to load notifications:', error);
      throw error;
    }
  }

  async markNotificationsAsRead(notificationIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_notifications')
        .update({ read: true })
        .in('id', notificationIds);

      if (error) {
        console.error('Error marking notifications as read:', error);
        throw error;
      }

      console.log('✅ Marked notifications as read:', notificationIds);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      throw error;
    }
  }

  async search(query: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .ilike('content', `%${query}%`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error searching messages:', error);
        throw error;
      }

      // Transform to ChatMessage type
      const messages: ChatMessage[] = (data || []).map((dbMessage: any) => ({
        id: dbMessage.id,
        channelId: dbMessage.channel_id,
        senderId: dbMessage.sender_id,
        content: dbMessage.content,
        timestamp: new Date(dbMessage.created_at),
        type: dbMessage.message_type,
        mentions: dbMessage.mentions || [],
        replyTo: dbMessage.reply_to_id,
        edited: dbMessage.edited,
        editedAt: dbMessage.edited_at
          ? new Date(dbMessage.edited_at)
          : undefined,
        attachments: dbMessage.attachments || [],
        reactions: dbMessage.reactions || [],
        isDeleted: dbMessage.is_deleted,
      }));

      console.log('✅ Search results:', messages.length);
      return messages;
    } catch (error) {
      console.error('Failed to search messages:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Clean up real-time subscriptions
      await supabase.removeAllChannels();
      console.log('✅ Chat service cleaned up');
    } catch (error) {
      console.error('Failed to cleanup chat service:', error);
    }
  }

  subscribe(event: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  private notifyListeners(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }
}

export const chatService = ChatService.getInstance();
