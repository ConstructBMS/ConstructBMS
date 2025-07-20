import { supabase } from './supabaseAuth';
import type {
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
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async initialize(): Promise<void> {
    // Prevent duplicate initialization
    if (this.isInitialized) {
  
      return;
    }

    // If initialization is already in progress, wait for it
    if (this.initializationPromise) {
      console.log('⏳ Chat service initialization already in progress, waiting...');
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<void> {
    try {
  

      // Set up real-time subscriptions with better error handling
      this.setupRealtimeSubscriptions();

      this.isInitialized = true;
  
    } catch (error) {
      console.error('❌ Failed to initialize chat service:', error);
      this.isInitialized = false;
      this.initializationPromise = null;
      throw error;
    }
  }

  private setupRealtimeSubscriptions(): void {
    try {
      // Set up real-time subscriptions for chat messages
      const messagesChannel = supabase
        .channel('chat_messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
          },
          (payload) => {
            console.log('📨 Real-time message update:', payload);
            this.notifyListeners('chat:newMessage', payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_channels',
          },
          (payload) => {
            console.log('📢 Real-time channel update:', payload);
            this.notifyListeners('chat:channelUpdate', payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_presence',
          },
          (payload) => {
            console.log('👤 Real-time presence update:', payload);
            this.notifyListeners('chat:presenceUpdate', payload.new);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Chat real-time subscription connected');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Chat real-time subscription failed - using local data only');
            // Don't retry automatically to prevent spam
          } else if (status === 'TIMED_OUT') {
            console.warn('⚠️ Chat real-time subscription timed out - using local data only');
            // Don't retry automatically to prevent spam
          }
        });


    } catch (error) {
      console.warn('⚠️ Failed to set up real-time subscriptions:', error);
      // Don't throw here, as the service can still work without real-time
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
      const channels: ChatChannel[] = (data || []).map((dbChannel: any) => {
        const channel: ChatChannel = {
          id: dbChannel.id,
          name: dbChannel.name,
          type: dbChannel.type,
          description: dbChannel.description,
          projectId: dbChannel.project_id,
          members: dbChannel.members || [],
          admins: dbChannel.admins || [],
          isPrivate: dbChannel.is_private,
          createdAt: new Date(dbChannel.created_at),
          unreadCount: 0, // Will be calculated separately
          pinnedMessages: [],
          settings: dbChannel.settings || {
            allowFileUploads: true,
            allowReactions: true,
            allowThreading: true,
            slowMode: false,
            slowModeInterval: 0,
          },
        };
        
        // Only add lastMessage if it exists
        if (dbChannel.last_message) {
          channel.lastMessage = dbChannel.last_message;
        }
        
        return channel;
      });

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
      const messages: ChatMessage[] = (data || []).map((dbMessage: any) => {
        const message: ChatMessage = {
          id: dbMessage.id,
          channelId: dbMessage.channel_id,
          senderId: dbMessage.sender_id,
          content: dbMessage.content,
          timestamp: new Date(dbMessage.created_at),
          type: dbMessage.message_type,
          mentions: dbMessage.mentions || [],
          replyTo: dbMessage.reply_to_id,
          edited: dbMessage.edited,
          attachments: dbMessage.attachments || [],
          reactions: dbMessage.reactions || [],
          isDeleted: dbMessage.is_deleted,
        };
        
        // Only add editedAt if it exists
        if (dbMessage.edited_at) {
          message.editedAt = new Date(dbMessage.edited_at);
        }
        
        return message;
      });

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
        ...(data.edited_at && { editedAt: new Date(data.edited_at) }),
        attachments: data.attachments || [],
        reactions: data.reactions || [],
        isDeleted: data.is_deleted,
      };

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
        ...(data.edited_at && { editedAt: new Date(data.edited_at) }),
        attachments: data.attachments || [],
        reactions: data.reactions || [],
        isDeleted: data.is_deleted,
      };

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
    } catch (error) {
      console.error('Failed to update presence:', error);
      throw error;
    }
  }

  async getNotifications(): Promise<ChatNotification[]> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      // For now, return empty array to prevent false notification badges
      // In a real app, you'd query the chat_notifications table
      return [];
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
        ...(dbMessage.edited_at && { editedAt: new Date(dbMessage.edited_at) }),
        attachments: dbMessage.attachments || [],
        reactions: dbMessage.reactions || [],
        isDeleted: dbMessage.is_deleted,
      }));

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
