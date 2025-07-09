export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'super_admin' | 'admin' | 'employee' | 'contractor' | 'customer';
  isOnline: boolean;
  lastSeen?: Date;
  status?: 'available' | 'busy' | 'away' | 'offline';
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  mentions: string[]; // Array of user IDs mentioned
  replyTo?: string; // ID of message being replied to
  edited: boolean;
  editedAt?: Date;
  attachments?: ChatAttachment[];
  reactions: MessageReaction[];
  isDeleted: boolean;
}

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video' | 'audio';
  size: number;
  mimeType: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  timestamp: Date;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'system' | 'project' | 'custom';
  description?: string;
  projectId?: string; // For project-specific channels
  members: string[]; // Array of user IDs
  admins: string[]; // Array of admin user IDs
  isPrivate: boolean;
  createdAt: Date;
  lastMessage?: ChatMessage;
  unreadCount: number;
  pinnedMessages: string[]; // Array of message IDs
  settings: ChannelSettings;
}

export interface ChannelSettings {
  allowFileUploads: boolean;
  allowReactions: boolean;
  allowThreading: boolean;
  slowMode: boolean;
  slowModeInterval: number; // seconds
}

export interface ChatThread {
  id: string;
  parentMessageId: string;
  channelId: string;
  messages: ChatMessage[];
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatNotification {
  id: string;
  userId: string;
  type: 'mention' | 'message' | 'reaction' | 'channel_invite';
  channelId?: string;
  messageId?: string;
  senderId?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatPresence {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  currentChannel?: string;
}

export interface ChatSearchResult {
  messages: ChatMessage[];
  channels: ChatChannel[];
  users: ChatUser[];
  totalResults: number;
}

export interface ChatStats {
  totalMessages: number;
  totalChannels: number;
  activeUsers: number;
  messagesToday: number;
  mentionsToday: number;
}
