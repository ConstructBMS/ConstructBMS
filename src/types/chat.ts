export interface ChatUser {
  avatar?: string;
  email: string;
  id: string;
  isOnline: boolean;
  lastSeen?: Date;
  name: string;
  role: 'super_admin' | 'admin' | 'employee' | 'contractor' | 'customer';
  status?: 'available' | 'busy' | 'away' | 'offline';
}

export interface ChatMessage {
  // ID of message being replied to
  // Array of user IDs mentioned
  attachments?: ChatAttachment[];
  channelId: string;
  content: string;
  edited: boolean;
  editedAt?: Date;
  id: string;
  isDeleted: boolean; 
  mentions: string[]; 
  reactions: MessageReaction[];
  replyTo?: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
}

export interface ChatAttachment {
  id: string;
  mimeType: string;
  name: string;
  size: number;
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
}

export interface MessageReaction {
  emoji: string;
  timestamp: Date;
  userId: string;
}

export interface ChatChannel {
  // Array of user IDs
  // Array of admin user IDs
  // For project-specific channels
  // Array of message IDs
  admins: string[];
  createdAt: Date;
  description?: string;
  id: string;
  isPrivate: boolean; 
  lastMessage?: ChatMessage; 
  members: string[]; 
  name: string;
  pinnedMessages: string[];
  projectId?: string;
  settings: ChannelSettings;
  type: 'system' | 'project' | 'custom'; 
  unreadCount: number;
}

export interface ChannelSettings {
  allowFileUploads: boolean;
  allowReactions: boolean;
  allowThreading: boolean;
  slowMode: boolean;
  slowModeInterval: number; // seconds
}

export interface ChatThread {
  channelId: string;
  createdAt: Date;
  id: string;
  messages: ChatMessage[];
  parentMessageId: string;
  participants: string[];
  updatedAt: Date;
}

export interface ChatNotification {
  channelId?: string;
  content: string;
  id: string;
  isRead: boolean;
  messageId?: string;
  senderId?: string;
  timestamp: Date;
  type: 'mention' | 'message' | 'reaction' | 'channel_invite';
  userId: string;
}

export interface ChatPresence {
  currentChannel?: string;
  lastSeen: Date;
  status: 'online' | 'offline' | 'away' | 'busy';
  userId: string;
}

export interface ChatSearchResult {
  channels: ChatChannel[];
  messages: ChatMessage[];
  totalResults: number;
  users: ChatUser[];
}

export interface ChatStats {
  activeUsers: number;
  mentionsToday: number;
  messagesToday: number;
  totalChannels: number;
  totalMessages: number;
}
