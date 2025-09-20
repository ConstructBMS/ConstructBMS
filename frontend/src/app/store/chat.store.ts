import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  contentType: 'text' | 'rich' | 'image' | 'file' | 'system';
  senderId: string;
  chatId: string;
  timestamp: Date;
  editedAt?: Date;
  replyTo?: string;
  reactions: { [userId: string]: string };
  isRead: boolean;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
}

export interface Chat {
  id: string;
  name: string;
  type: 'private' | 'group' | 'project';
  projectId?: string;
  participants: string[];
  lastMessage?: Message;
  lastActivity: Date;
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  avatar?: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatInvitation {
  id: string;
  chatId: string;
  invitedUserId: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  expiresAt: Date;
}

interface ChatStore {
  // State
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  users: User[];
  currentChatId: string | null;
  isOpen: boolean;
  searchQuery: string;
  selectedUsers: string[];

  // Chat Management
  setOpen: (open: boolean) => void;
  setCurrentChat: (chatId: string | null) => void;
  createChat: (
    chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity'>
  ) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  archiveChat: (chatId: string) => void;
  muteChat: (chatId: string) => void;
  pinChat: (chatId: string) => void;

  // Message Management
  sendMessage: (
    message: Omit<Message, 'id' | 'timestamp' | 'reactions' | 'isRead'>
  ) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, userId: string, emoji: string) => void;
  removeReaction: (messageId: string, userId: string) => void;
  markAsRead: (chatId: string, messageId: string) => void;
  markChatAsRead: (chatId: string) => void;

  // User Management
  addUserToChat: (chatId: string, userId: string) => void;
  removeUserFromChat: (chatId: string, userId: string) => void;
  inviteUserToChat: (
    chatId: string,
    userId: string,
    invitedBy: string
  ) => ChatInvitation;

  // Search & Filter
  setSearchQuery: (query: string) => void;
  setSelectedUsers: (userIds: string[]) => void;

  // Getters
  getCurrentChat: () => Chat | null;
  getChatMessages: (chatId: string) => Message[];
  getChatUsers: (chatId: string) => User[];
  getUnreadCount: (chatId: string) => number;
  getTotalUnreadCount: () => number;
  searchChats: (query: string) => Chat[];
  searchMessages: (chatId: string, query: string) => Message[];
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial State
      chats: [
        {
          id: 'chat-1',
          name: 'Project Alpha Team',
          type: 'project',
          projectId: 'project-alpha-id',
          participants: ['user-1', 'user-2', 'user-3'],
          lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
          isArchived: false,
          isMuted: false,
          isPinned: true,
          avatar: '🏗️',
          description: 'Discussion for Project Alpha construction',
          createdBy: 'user-1',
          createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
          updatedAt: new Date(Date.now() - 3600000),
        },
        {
          id: 'chat-2',
          name: 'John Smith',
          type: 'private',
          participants: ['user-1', 'user-2'],
          lastActivity: new Date(Date.now() - 7200000), // 2 hours ago
          isArchived: false,
          isMuted: false,
          isPinned: false,
          createdBy: 'user-1',
          createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
          updatedAt: new Date(Date.now() - 7200000),
        },
        {
          id: 'chat-3',
          name: 'General Discussion',
          type: 'group',
          participants: ['user-1', 'user-2', 'user-3', 'user-4'],
          lastActivity: new Date(Date.now() - 14400000), // 4 hours ago
          isArchived: false,
          isMuted: false,
          isPinned: false,
          avatar: '💬',
          description: 'General team discussion',
          createdBy: 'user-1',
          createdAt: new Date(Date.now() - 86400000 * 14), // 14 days ago
          updatedAt: new Date(Date.now() - 14400000),
        },
      ],
      messages: {
        'chat-1': [
          {
            id: 'msg-1',
            content: 'Welcome to the Project Alpha team chat!',
            contentType: 'text',
            senderId: 'user-1',
            chatId: 'chat-1',
            timestamp: new Date(Date.now() - 86400000 * 7),
            reactions: {},
            isRead: true,
          },
          {
            id: 'msg-2',
            content:
              '<p>Great to be here! Looking forward to working on this project.</p>',
            contentType: 'rich',
            senderId: 'user-2',
            chatId: 'chat-1',
            timestamp: new Date(Date.now() - 86400000 * 6),
            reactions: { 'user-1': '👍' },
            isRead: true,
          },
          {
            id: 'msg-3',
            content: 'The site inspection is scheduled for tomorrow at 9 AM.',
            contentType: 'text',
            senderId: 'user-3',
            chatId: 'chat-1',
            timestamp: new Date(Date.now() - 3600000),
            reactions: { 'user-1': '✅', 'user-2': '👍' },
            isRead: false,
          },
        ],
        'chat-2': [
          {
            id: 'msg-4',
            content: 'Hi John, how are the contract negotiations going?',
            contentType: 'text',
            senderId: 'user-1',
            chatId: 'chat-2',
            timestamp: new Date(Date.now() - 7200000),
            reactions: {},
            isRead: true,
          },
        ],
        'chat-3': [
          {
            id: 'msg-5',
            content: 'Good morning everyone!',
            contentType: 'text',
            senderId: 'user-1',
            chatId: 'chat-3',
            timestamp: new Date(Date.now() - 14400000),
            reactions: { 'user-2': '👋', 'user-3': '👋' },
            isRead: true,
          },
        ],
      },
      users: [
        {
          id: 'user-1',
          name: 'Alex Johnson',
          email: 'alex@constructbms.com',
          avatar: '👨‍💼',
          status: 'online',
          lastSeen: new Date(),
        },
        {
          id: 'user-2',
          name: 'Sarah Wilson',
          email: 'sarah@constructbms.com',
          avatar: '👩‍💼',
          status: 'away',
          lastSeen: new Date(Date.now() - 1800000), // 30 minutes ago
        },
        {
          id: 'user-3',
          name: 'Mike Chen',
          email: 'mike@constructbms.com',
          avatar: '👨‍🔧',
          status: 'online',
          lastSeen: new Date(),
        },
        {
          id: 'user-4',
          name: 'Emma Davis',
          email: 'emma@constructbms.com',
          avatar: '👩‍🏗️',
          status: 'offline',
          lastSeen: new Date(Date.now() - 86400000), // 1 day ago
        },
      ],
      currentChatId: null,
      isOpen: false,
      searchQuery: '',
      selectedUsers: [],

      // Chat Management Actions
      setOpen: (open: boolean) => set({ isOpen: open }),
      setCurrentChat: (chatId: string | null) => set({ currentChatId: chatId }),

       createChat: chatData => {
         const newChat: Chat = {
           ...chatData,
           id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
           createdAt: new Date(),
           updatedAt: new Date(),
           lastActivity: new Date(),
         };
        set(state => ({
          chats: [...state.chats, newChat],
          messages: { ...state.messages, [newChat.id]: [] },
        }));
      },

      updateChat: (chatId, updates) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, ...updates, updatedAt: new Date() }
              : chat
          ),
        }));
      },

      deleteChat: chatId => {
        set(state => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          messages: Object.fromEntries(
            Object.entries(state.messages).filter(([id]) => id !== chatId)
          ),
          currentChatId:
            state.currentChatId === chatId ? null : state.currentChatId,
        }));
      },

      archiveChat: chatId => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, isArchived: !chat.isArchived }
              : chat
          ),
        }));
      },

      muteChat: chatId => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isMuted: !chat.isMuted } : chat
          ),
        }));
      },

      pinChat: chatId => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
          ),
        }));
      },

      // Message Management Actions
      sendMessage: messageData => {
        const newMessage: Message = {
          ...messageData,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          reactions: {},
          isRead: false,
        };

        set(state => ({
          messages: {
            ...state.messages,
            [messageData.chatId]: [
              ...(state.messages[messageData.chatId] || []),
              newMessage,
            ],
          },
          chats: state.chats.map(chat =>
            chat.id === messageData.chatId
              ? {
                  ...chat,
                  lastMessage: newMessage,
                  lastActivity: new Date(),
                  updatedAt: new Date(),
                }
              : chat
          ),
        }));
      },

      editMessage: (messageId, content) => {
        set(state => ({
          messages: Object.fromEntries(
            Object.entries(state.messages).map(([chatId, messages]) => [
              chatId,
              messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, content, editedAt: new Date() }
                  : msg
              ),
            ])
          ),
        }));
      },

      deleteMessage: messageId => {
        set(state => ({
          messages: Object.fromEntries(
            Object.entries(state.messages).map(([chatId, messages]) => [
              chatId,
              messages.filter(msg => msg.id !== messageId),
            ])
          ),
        }));
      },

      addReaction: (messageId, userId, emoji) => {
        set(state => ({
          messages: Object.fromEntries(
            Object.entries(state.messages).map(([chatId, messages]) => [
              chatId,
              messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, reactions: { ...msg.reactions, [userId]: emoji } }
                  : msg
              ),
            ])
          ),
        }));
      },

      removeReaction: (messageId, userId) => {
        set(state => ({
          messages: Object.fromEntries(
            Object.entries(state.messages).map(([chatId, messages]) => [
              chatId,
              messages.map(msg => {
                if (msg.id === messageId) {
                  const newReactions = { ...msg.reactions };
                  delete newReactions[userId];
                  return { ...msg, reactions: newReactions };
                }
                return msg;
              }),
            ])
          ),
        }));
      },

      markAsRead: (chatId, messageId) => {
        set(state => ({
          messages: {
            ...state.messages,
            [chatId]: (state.messages[chatId] || []).map(msg =>
              msg.id === messageId ? { ...msg, isRead: true } : msg
            ),
          },
        }));
      },

      markChatAsRead: chatId => {
        set(state => ({
          messages: {
            ...state.messages,
            [chatId]: (state.messages[chatId] || []).map(msg => ({
              ...msg,
              isRead: true,
            })),
          },
        }));
      },

      // User Management Actions
      addUserToChat: (chatId, userId) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, participants: [...chat.participants, userId] }
              : chat
          ),
        }));
      },

      removeUserFromChat: (chatId, userId) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  participants: chat.participants.filter(id => id !== userId),
                }
              : chat
          ),
        }));
      },

      inviteUserToChat: (chatId, userId, invitedBy) => {
        const invitation: ChatInvitation = {
          id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          chatId,
          invitedUserId: userId,
          invitedBy,
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        };
        return invitation;
      },

      // Search & Filter Actions
      setSearchQuery: query => set({ searchQuery: query }),
      setSelectedUsers: userIds => set({ selectedUsers: userIds }),

      // Getters
      getCurrentChat: () => {
        const { chats, currentChatId } = get();
        return chats.find(chat => chat.id === currentChatId) || null;
      },

      getChatMessages: chatId => {
        return get().messages[chatId] || [];
      },

      getChatUsers: chatId => {
        const { users, chats } = get();
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return [];
        return users.filter(user => chat.participants.includes(user.id));
      },

      getUnreadCount: chatId => {
        const messages = get().messages[chatId] || [];
        return messages.filter(msg => !msg.isRead).length;
      },

      getTotalUnreadCount: () => {
        const { messages } = get();
        return Object.values(messages).reduce(
          (total, chatMessages) =>
            total + chatMessages.filter(msg => !msg.isRead).length,
          0
        );
      },

      searchChats: query => {
        const { chats } = get();
        const lowercaseQuery = query.toLowerCase();
        return chats.filter(
          chat =>
            chat.name.toLowerCase().includes(lowercaseQuery) ||
            chat.description?.toLowerCase().includes(lowercaseQuery)
        );
      },

      searchMessages: (chatId, query) => {
        const messages = get().messages[chatId] || [];
        const lowercaseQuery = query.toLowerCase();
        return messages.filter(msg =>
          msg.content.toLowerCase().includes(lowercaseQuery)
        );
      },
    }),
    {
      name: 'chat-store',
      partialize: state => ({
        chats: state.chats,
        messages: state.messages,
        users: state.users,
        currentChatId: state.currentChatId,
        searchQuery: state.searchQuery,
      }),
      onRehydrateStorage: () => state => {
        if (state) {
          // Convert string dates back to Date objects for chats
          state.chats = state.chats.map(chat => ({
            ...chat,
            lastActivity:
              chat.lastActivity instanceof Date
                ? chat.lastActivity
                : new Date(chat.lastActivity),
            createdAt:
              chat.createdAt instanceof Date
                ? chat.createdAt
                : new Date(chat.createdAt),
            updatedAt:
              chat.updatedAt instanceof Date
                ? chat.updatedAt
                : new Date(chat.updatedAt),
          }));

          // Convert string dates back to Date objects for messages
          Object.keys(state.messages).forEach(chatId => {
            state.messages[chatId] = state.messages[chatId].map(message => ({
              ...message,
              timestamp:
                message.timestamp instanceof Date
                  ? message.timestamp
                  : new Date(message.timestamp),
              editedAt: message.editedAt
                ? message.editedAt instanceof Date
                  ? message.editedAt
                  : new Date(message.editedAt)
                : undefined,
            }));
          });
        }
      },
    }
  )
);
