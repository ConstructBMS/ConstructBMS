import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Search,
  MoreVertical,
  Phone,
  Video,
  UserPlus,
  Settings,
  Hash,
  Lock,
  Plus,
  AtSign,
  Reply,
  Edit3,
  Trash2,
  Pin,
  Volume2,
  VolumeX,
  Users,
  FileText,
  Image as ImageIcon,
  File,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Eye,
  EyeOff,
  Globe,
  Building,
  Edit2,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import type {
  ChatUser,
  ChatMessage,
  ChatChannel,
  ChatAttachment,
  ChatNotification,
} from '../../types/chat';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [currentChannel, setCurrentChannel] = useState<ChatChannel | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(
    null
  );
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);

  // Channel Management States
  const [showChannelManagement, setShowChannelManagement] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [channelSearchTerm, setChannelSearchTerm] = useState('');
  const [channelFilterType, setChannelFilterType] = useState<
    'all' | 'system' | 'project' | 'custom'
  >('all');
  const [selectedChannelForSettings, setSelectedChannelForSettings] =
    useState<ChatChannel | null>(null);
  const [newChannelData, setNewChannelData] = useState({
    name: '',
    type: 'custom' as 'system' | 'project' | 'custom',
    description: '',
    isPrivate: false,
    selectedMembers: [] as string[],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat service
  useEffect(() => {
    if (user?.id) {
      initializeChat();
    }

    return () => {
      chatService.cleanup();
    };
  }, [user?.id]);

  const initializeChat = async () => {
    try {
      // Use demo data for now to avoid type mismatches
      const demoChannels: ChatChannel[] = [
        {
          id: '1',
          name: 'General',
          type: 'system',
          description: 'General discussion channel',
          members: [],
          admins: [],
          isPrivate: false,
          createdAt: new Date(),
          lastMessage: undefined,
          unreadCount: 0,
          pinnedMessages: [],
          settings: {
            allowFileUploads: true,
            allowReactions: true,
            allowThreading: true,
            slowMode: false,
            slowModeInterval: 0,
          },
        },
      ];

      const demoUsers: ChatUser[] = [
        {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'admin',
          isOnline: true,
        },
      ];

      setChannels(demoChannels);
      setUsers(demoUsers);
      setNotifications([]);

      // Set first channel as current
      if (demoChannels.length > 0) {
        setCurrentChannel(demoChannels[0]);
      }

      // Set up event listeners
      window.addEventListener(
        'chat:newMessage',
        handleNewMessage as EventListener
      );
      window.addEventListener(
        'chat:presenceUpdate',
        handlePresenceUpdate as EventListener
      );
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      // Set empty arrays as fallback
      setChannels([]);
      setUsers([]);
      setNotifications([]);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      // Use demo messages for now
      const demoMessages: ChatMessage[] = [
        {
          id: '1',
          channelId: channelId,
          senderId: '1',
          content: 'Welcome to the chat!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          type: 'text',
          mentions: [],
          edited: false,
          reactions: [],
          isDeleted: false,
        },
      ];
      setMessages(demoMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleNewMessage = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail as ChatMessage;
      if (message.channelId === currentChannel?.id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    },
    [currentChannel]
  );

  const handlePresenceUpdate = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    const presence = customEvent.detail;
    setUsers(prev =>
      prev.map(user =>
        user.id === presence.userId
          ? {
              ...user,
              isOnline: presence.status === 'online',
              status: presence.status,
            }
          : user
      )
    );
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChannel) return;

    try {
      const mentions = extractMentions(newMessage);

      // Create demo message
      const demoMessage: ChatMessage = {
        id: Date.now().toString(),
        channelId: currentChannel.id,
        senderId: user?.id || '1',
        content: newMessage,
        timestamp: new Date(),
        type: 'text',
        mentions: mentions,
        edited: false,
        reactions: [],
        isDeleted: false,
      };

      setMessages(prev => [...prev, demoMessage]);
      setNewMessage('');
      setReplyTo(null);
      setShowEmojiPicker(false);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      const user = users.find(
        u =>
          u.name.toLowerCase().includes(username.toLowerCase()) ||
          u.email.toLowerCase().includes(username.toLowerCase())
      );
      if (user) {
        mentions.push(user.id);
      }
    }

    return mentions;
  };

  const handleMessageInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Handle @ mentions
    if (value.includes('@')) {
      const lastAtSymbol = value.lastIndexOf('@');
      const query = value.slice(lastAtSymbol + 1).split(' ')[0];
      setMentionQuery(query);
      setShowMentions(true);

      const filtered = users.filter(
        user =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: ChatUser) => {
    const lastAtSymbol = newMessage.lastIndexOf('@');
    const beforeMention = newMessage.slice(0, lastAtSymbol);
    const afterMention = newMessage
      .slice(lastAtSymbol)
      .split(' ')
      .slice(1)
      .join(' ');
    const updatedMessage = `${beforeMention}@${user.name} ${afterMention}`;

    setNewMessage(updatedMessage);
    setShowMentions(false);
    messageInputRef.current?.focus();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentChannel) return;

    Array.from(files).forEach(async file => {
      try {
        // In a real app, you'd upload to cloud storage
        const attachment: ChatAttachment = {
          id: Date.now().toString(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : 'document',
          size: file.size,
          mimeType: file.type,
        };

        // Create demo message with attachment
        const demoMessage: ChatMessage = {
          id: Date.now().toString(),
          channelId: currentChannel.id,
          senderId: user?.id || '1',
          content: `📎 ${file.name}`,
          timestamp: new Date(),
          type: 'file',
          mentions: [],
          edited: false,
          reactions: [],
          isDeleted: false,
          attachments: [attachment],
        };

        setMessages(prev => [...prev, demoMessage]);
        scrollToBottom();
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    });
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'instant',
        block: 'end',
      });
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(timestamp);
  };

  const formatMessageDate = (timestamp: Date) => {
    const today = new Date();
    const messageDate = new Date(timestamp);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (
      messageDate.toDateString() ===
      new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()
    ) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getChannelIcon = (channel: ChatChannel) => {
    switch (channel.type) {
      case 'system':
        return <Hash className='w-4 h-4' />;
      case 'project':
        return <FileText className='w-4 h-4' />;
      case 'custom':
        return channel.isPrivate ? (
          <Lock className='w-4 h-4' />
        ) : (
          <Hash className='w-4 h-4' />
        );
      default:
        return <Hash className='w-4 h-4' />;
    }
  };

  const getUnreadCount = (channel: ChatChannel) => {
    return channel.unreadCount > 0 ? (
      <span className='bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center'>
        {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
      </span>
    ) : null;
  };

  // Channel Management Functions
  const createChannel = async () => {
    try {
      const newChannel: ChatChannel = {
        id: Date.now().toString(),
        name: newChannelData.name,
        type: newChannelData.type,
        description: newChannelData.description,
        members: newChannelData.selectedMembers,
        admins: [user!.id],
        isPrivate: newChannelData.isPrivate,
        createdAt: new Date(),
        lastMessage: undefined,
        unreadCount: 0,
        pinnedMessages: [],
        settings: {
          allowFileUploads: true,
          allowReactions: true,
          allowThreading: true,
          slowMode: false,
          slowModeInterval: 0,
        },
      };

      setChannels(prev => [...prev, newChannel]);
      setShowCreateChannelModal(false);
      setNewChannelData({
        name: '',
        type: 'custom',
        description: '',
        isPrivate: false,
        selectedMembers: [],
      });
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  const updateChannel = async (
    channelId: string,
    updates: Partial<ChatChannel>
  ) => {
    try {
      setChannels(prev =>
        prev.map(ch => (ch.id === channelId ? { ...ch, ...updates } : ch))
      );
    } catch (error) {
      console.error('Failed to update channel:', error);
    }
  };

  const deleteChannel = async (channelId: string) => {
    try {
      setChannels(prev => prev.filter(ch => ch.id !== channelId));
      if (currentChannel?.id === channelId) {
        const remainingChannels = channels.filter(ch => ch.id !== channelId);
        setCurrentChannel(
          remainingChannels.length > 0 ? remainingChannels[0] : null
        );
      }
    } catch (error) {
      console.error('Failed to delete channel:', error);
    }
  };

  const addMemberToChannel = async (channelId: string, userId: string) => {
    try {
      setChannels(prev =>
        prev.map(ch =>
          ch.id === channelId ? { ...ch, members: [...ch.members, userId] } : ch
        )
      );
    } catch (error) {
      console.error('Failed to add member to channel:', error);
    }
  };

  const removeMemberFromChannel = async (channelId: string, userId: string) => {
    try {
      setChannels(prev =>
        prev.map(ch =>
          ch.id === channelId
            ? { ...ch, members: ch.members.filter(id => id !== userId) }
            : ch
        )
      );
    } catch (error) {
      console.error('Failed to remove member from channel:', error);
    }
  };

  const toggleChannelMember = (userId: string) => {
    setNewChannelData(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(userId)
        ? prev.selectedMembers.filter(id => id !== userId)
        : [...prev.selectedMembers, userId],
    }));
  };

  // Channel Management Helper Functions
  const filteredChannels = (Array.isArray(channels) ? channels : []).filter(
    channel => {
      const matchesSearch =
        channel.name.toLowerCase().includes(channelSearchTerm.toLowerCase()) ||
        channel.description
          ?.toLowerCase()
          .includes(channelSearchTerm.toLowerCase());
      const matchesType =
        channelFilterType === 'all' || channel.type === channelFilterType;
      return matchesSearch && matchesType;
    }
  );

  const isChannelMember = (channel: ChatChannel) => {
    return channel.members.includes(user?.id || '');
  };

  const isChannelAdmin = (channel: ChatChannel) => {
    return channel.admins.includes(user?.id || '');
  };

  const canManageChannel = (channel: ChatChannel) => {
    return (
      isChannelAdmin(channel) ||
      user?.role === 'super_admin' ||
      user?.role === 'admin'
    );
  };

  const getChannelTypeLabel = (type: string) => {
    switch (type) {
      case 'system':
        return 'System';
      case 'project':
        return 'Project';
      case 'custom':
        return 'Custom';
      default:
        return type;
    }
  };

  const handleJoinChannel = async (channelId: string) => {
    try {
      // Demo implementation - just update the channel members
      setChannels(prev =>
        prev.map(ch =>
          ch.id === channelId
            ? { ...ch, members: [...ch.members, user!.id] }
            : ch
        )
      );
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  const handleLeaveChannel = async (channelId: string) => {
    try {
      setChannels(prev =>
        prev.map(ch =>
          ch.id === channelId
            ? { ...ch, members: ch.members.filter(id => id !== user!.id) }
            : ch
        )
      );
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  };

  return (
    <div className='flex h-full bg-gray-50 overflow-hidden'>
      {/* Sidebar - Channels */}
      <div className='w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-xl font-bold text-gray-900'>Chat</h1>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setShowChannelManagement(!showChannelManagement)}
                className={`p-2 rounded-lg transition-colors ${
                  showChannelManagement
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Settings className='w-4 h-4' />
              </button>
              <button
                onClick={() => setShowCreateChannelModal(true)}
                className='p-2 hover:bg-gray-100 rounded-lg text-gray-600'
              >
                <Plus className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search channels...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Channels List */}
        <div className='flex-1 overflow-y-auto'>
          <div className='p-4'>
            <div className='flex items-center justify-between mb-2'>
              <h2 className='text-sm font-semibold text-gray-500 uppercase'>
                Channels
              </h2>
              <button className='p-1 hover:bg-gray-100 rounded'>
                <Plus className='w-4 h-4 text-gray-600' />
              </button>
            </div>

            {channels
              .filter(
                channel =>
                  channel.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  channel.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )
              .map(channel => (
                <div
                  key={channel.id}
                  onClick={() => {
                    setCurrentChannel(channel);
                    loadMessages(channel.id);
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    currentChannel?.id === channel.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    {getChannelIcon(channel)}
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium truncate'>{channel.name}</p>
                      {channel.lastMessage && (
                        <p className='text-xs text-gray-500 truncate'>
                          {channel.lastMessage.content.substring(0, 30)}...
                        </p>
                      )}
                    </div>
                  </div>
                  {getUnreadCount(channel)}
                </div>
              ))}
          </div>
        </div>

        {/* Online Users */}
        <div className='p-4 border-t border-gray-200'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-sm font-semibold text-gray-500 uppercase'>
              Online
            </h2>
            <span className='text-xs text-gray-500'>
              {users.filter(u => u.isOnline).length}
            </span>
          </div>
          <div className='space-y-2'>
            {users
              .filter(user => user.isOnline)
              .slice(0, 5)
              .map(user => (
                <div key={user.id} className='flex items-center space-x-2'>
                  <div className='relative'>
                    <div className='w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center'>
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className='w-6 h-6 rounded-full'
                        />
                      ) : (
                        <span className='text-xs font-medium text-gray-600'>
                          {user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                  </div>
                  <span className='text-sm text-gray-700 truncate'>
                    {user.name}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Channel Management Panel */}
      {showChannelManagement && (
        <div className='w-96 bg-white border-r border-gray-200 flex flex-col'>
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Channel Management
              </h2>
              <button
                onClick={() => setShowChannelManagement(false)}
                className='p-1 hover:bg-gray-100 rounded'
              >
                <X className='w-4 h-4 text-gray-600' />
              </button>
            </div>

            {/* Search and Filters */}
            <div className='space-y-3'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search channels...'
                  value={channelSearchTerm}
                  onChange={e => setChannelSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              <select
                value={channelFilterType}
                onChange={e => setChannelFilterType(e.target.value as any)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='all'>All Channels</option>
                <option value='system'>System</option>
                <option value='project'>Project</option>
                <option value='custom'>Custom</option>
              </select>
            </div>
          </div>

          {/* Channels List */}
          <div className='flex-1 overflow-y-auto p-4'>
            <div className='space-y-3'>
              {filteredChannels.map(channel => (
                <div
                  key={channel.id}
                  className='bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-center space-x-3'>
                      {getChannelIcon(channel)}
                      <div>
                        <h3 className='font-semibold text-gray-900'>
                          {channel.name}
                        </h3>
                        <div className='flex items-center space-x-2 mt-1'>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              channel.type === 'system'
                                ? 'bg-blue-100 text-blue-700'
                                : channel.type === 'project'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {getChannelTypeLabel(channel.type)}
                          </span>
                          {channel.isPrivate && (
                            <span className='text-xs px-2 py-1 rounded-full bg-red-100 text-red-700'>
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-1'>
                      {canManageChannel(channel) && (
                        <button
                          onClick={() => setSelectedChannelForSettings(channel)}
                          className='p-1 hover:bg-gray-200 rounded'
                        >
                          <Edit2 className='w-4 h-4 text-gray-600' />
                        </button>
                      )}
                      {canManageChannel(channel) && (
                        <button
                          onClick={() => deleteChannel(channel.id)}
                          className='p-1 hover:bg-gray-200 rounded text-red-600'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      )}
                    </div>
                  </div>

                  {channel.description && (
                    <p className='text-sm text-gray-600 mb-3'>
                      {channel.description}
                    </p>
                  )}

                  <div className='flex items-center justify-between text-sm text-gray-500 mb-3'>
                    <span>{channel.members.length} members</span>
                    <span>{channel.admins.length} admins</span>
                  </div>

                  <div className='flex items-center space-x-2'>
                    {isChannelMember(channel) ? (
                      <button
                        onClick={() => handleLeaveChannel(channel.id)}
                        className='flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100'
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinChannel(channel.id)}
                        className='flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600'
                      >
                        Join
                      </button>
                    )}

                    {isChannelMember(channel) && (
                      <button
                        onClick={() => {
                          setCurrentChannel(channel);
                          loadMessages(channel.id);
                          setShowChannelManagement(false);
                        }}
                        className='flex-1 px-3 py-1 text-sm border border-blue-500 text-blue-500 rounded hover:bg-blue-50'
                      >
                        Open
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>
        {currentChannel ? (
          <>
            {/* Channel Header */}
            <div className='bg-white border-b border-gray-200 p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  {getChannelIcon(currentChannel)}
                  <div>
                    <h2 className='font-semibold text-gray-900'>
                      {currentChannel.name}
                    </h2>
                    <p className='text-sm text-gray-500'>
                      {currentChannel.members.length} members
                      {typingUsers.length > 0 && (
                        <span className='text-blue-600 ml-2'>
                          {typingUsers.join(', ')} typing...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <Phone className='w-4 h-4 text-gray-600' />
                  </button>
                  <button className='p-2 hover:bg-gray-100 rounded-lg'>
                    <Video className='w-4 h-4 text-gray-600' />
                  </button>
                  <button
                    className='p-2 hover:bg-gray-100 rounded-lg'
                    onClick={() => setShowChannelSettings(!showChannelSettings)}
                  >
                    <MoreVertical className='w-4 h-4 text-gray-600' />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              {messages.map((message, index) => {
                const sender = users.find(u => u.id === message.senderId);
                const showDate =
                  index === 0 ||
                  formatMessageDate(message.timestamp) !==
                    formatMessageDate(messages[index - 1].timestamp);

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className='flex justify-center mb-4'>
                        <span className='bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full'>
                          {formatMessageDate(message.timestamp)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex space-x-2 max-w-xs lg:max-w-md ${message.senderId === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}
                      >
                        {message.senderId !== user?.id && (
                          <div className='flex-shrink-0'>
                            <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center'>
                              {sender?.avatar ? (
                                <img
                                  src={sender.avatar}
                                  alt={sender.name}
                                  className='w-8 h-8 rounded-full'
                                />
                              ) : (
                                <span className='text-xs font-medium text-gray-600'>
                                  {sender?.name.charAt(0)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div
                          className={`flex flex-col ${message.senderId === user?.id ? 'items-end' : 'items-start'}`}
                        >
                          {message.senderId !== user?.id && (
                            <span className='text-xs text-gray-500 mb-1'>
                              {sender?.name}
                            </span>
                          )}

                          {replyTo && message.id === replyTo.id && (
                            <div className='bg-gray-100 rounded-lg p-2 mb-2 text-xs text-gray-600'>
                              Replying to: {replyTo.content.substring(0, 50)}...
                            </div>
                          )}

                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.senderId === user?.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            {editingMessage?.id === message.id ? (
                              <textarea
                                value={editingMessage.content}
                                onChange={e =>
                                  setEditingMessage({
                                    ...editingMessage,
                                    content: e.target.value,
                                  })
                                }
                                className='w-full bg-transparent border-none outline-none resize-none'
                                rows={1}
                                autoFocus
                              />
                            ) : (
                              <p className='whitespace-pre-wrap'>
                                {message.content}
                              </p>
                            )}

                            {message.attachments &&
                              message.attachments.length > 0 && (
                                <div className='mt-2 space-y-2'>
                                  {message.attachments.map(attachment => (
                                    <div
                                      key={attachment.id}
                                      className='flex items-center space-x-2 p-2 bg-gray-100 rounded'
                                    >
                                      {attachment.type === 'image' ? (
                                        <ImageIcon className='w-4 h-4 text-gray-600' />
                                      ) : (
                                        <File className='w-4 h-4 text-gray-600' />
                                      )}
                                      <span className='text-sm'>
                                        {attachment.name}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>

                          <div className='flex items-center space-x-2 mt-1'>
                            <span className='text-xs text-gray-500'>
                              {formatMessageTime(message.timestamp)}
                            </span>
                            {message.edited && (
                              <span className='text-xs text-gray-500'>
                                (edited)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className='bg-white border-t border-gray-200 p-4'>
              {replyTo && (
                <div className='bg-gray-100 rounded-lg p-3 mb-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium'>Replying to</p>
                      <p className='text-sm text-gray-600'>
                        {replyTo.content.substring(0, 50)}...
                      </p>
                    </div>
                    <button
                      onClick={() => setReplyTo(null)}
                      className='text-gray-500 hover:text-gray-700'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              )}

              <div className='flex items-end space-x-2'>
                <div className='flex-1 relative'>
                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={handleMessageInput}
                    onKeyPress={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder='Type a message...'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                    rows={1}
                  />

                  {/* Mentions Dropdown */}
                  {showMentions && filteredUsers.length > 0 && (
                    <div className='absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mb-2 max-h-48 overflow-y-auto'>
                      {filteredUsers.map(user => (
                        <div
                          key={user.id}
                          onClick={() => insertMention(user)}
                          className='flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer'
                        >
                          <div className='w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center'>
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className='w-6 h-6 rounded-full'
                              />
                            ) : (
                              <span className='text-xs font-medium text-gray-600'>
                                {user.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className='text-sm font-medium'>{user.name}</p>
                            <p className='text-xs text-gray-500'>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className='flex items-center space-x-1'>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className='p-2 hover:bg-gray-100 rounded-lg'
                    title='Attach File'
                  >
                    <Paperclip className='w-4 h-4 text-gray-600' />
                  </button>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className='p-2 hover:bg-gray-100 rounded-lg'
                    title='Add Emoji'
                  >
                    <Smile className='w-4 h-4 text-gray-600' />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className='p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    title='Send Message'
                  >
                    <Send className='w-4 h-4' />
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type='file'
                multiple
                onChange={handleFileUpload}
                className='hidden'
                accept='image/*,.pdf,.doc,.docx,.txt'
              />
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Hash className='w-8 h-8 text-gray-400' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Select a channel
              </h3>
              <p className='text-gray-500'>
                Choose a channel to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Channel Management Modal */}
      {showChannelManagement && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col'>
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-900'>
                Channel Management
              </h2>
              <button
                onClick={() => setShowChannelManagement(false)}
                className='p-2 hover:bg-gray-100 rounded-lg'
              >
                <X className='w-5 h-5 text-gray-600' />
              </button>
            </div>

            <div className='flex-1 flex'>
              {/* Channel List */}
              <div className='w-1/2 border-r border-gray-200 p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Channels
                  </h3>
                  <button
                    onClick={() => setShowCreateChannelModal(true)}
                    className='px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm'
                  >
                    <Plus className='w-4 h-4 inline mr-1' />
                    New Channel
                  </button>
                </div>

                <div className='space-y-2'>
                  {channels.map(channel => (
                    <div
                      key={channel.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedChannelForSettings?.id === channel.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedChannelForSettings(channel)}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          {getChannelIcon(channel)}
                          <div>
                            <p className='font-medium text-gray-900'>
                              {channel.name}
                            </p>
                            <p className='text-sm text-gray-500'>
                              {channel.members.length} members • {channel.type}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-1'>
                          {channel.isPrivate && (
                            <Lock className='w-4 h-4 text-gray-400' />
                          )}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteChannel(channel.id);
                            }}
                            className='p-1 hover:bg-red-100 rounded text-red-600'
                            title='Delete Channel'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel Settings */}
              <div className='w-1/2 p-6'>
                {selectedChannelForSettings ? (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Channel Settings: {selectedChannelForSettings.name}
                    </h3>

                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Channel Name
                        </label>
                        <input
                          type='text'
                          value={selectedChannelForSettings.name}
                          onChange={e =>
                            updateChannel(selectedChannelForSettings.id, {
                              name: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Description
                        </label>
                        <textarea
                          value={selectedChannelForSettings.description || ''}
                          onChange={e =>
                            updateChannel(selectedChannelForSettings.id, {
                              description: e.target.value,
                            })
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Privacy
                        </label>
                        <div className='flex items-center space-x-4'>
                          <label className='flex items-center'>
                            <input
                              type='radio'
                              checked={!selectedChannelForSettings.isPrivate}
                              onChange={() =>
                                updateChannel(selectedChannelForSettings.id, {
                                  isPrivate: false,
                                })
                              }
                              className='mr-2'
                            />
                            <Globe className='w-4 h-4 mr-1' />
                            Public
                          </label>
                          <label className='flex items-center'>
                            <input
                              type='radio'
                              checked={selectedChannelForSettings.isPrivate}
                              onChange={() =>
                                updateChannel(selectedChannelForSettings.id, {
                                  isPrivate: true,
                                })
                              }
                              className='mr-2'
                            />
                            <Lock className='w-4 h-4 mr-1' />
                            Private
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Members ({selectedChannelForSettings.members.length})
                        </label>
                        <div className='space-y-2 max-h-40 overflow-y-auto'>
                          {selectedChannelForSettings.members.map(memberId => {
                            const member = users.find(u => u.id === memberId);
                            return member ? (
                              <div
                                key={memberId}
                                className='flex items-center justify-between p-2 bg-gray-50 rounded'
                              >
                                <div className='flex items-center space-x-2'>
                                  <div className='w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center'>
                                    {member.avatar ? (
                                      <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className='w-6 h-6 rounded-full'
                                      />
                                    ) : (
                                      <span className='text-xs font-medium text-gray-600'>
                                        {member.name.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <span className='text-sm'>{member.name}</span>
                                </div>
                                <button
                                  onClick={() =>
                                    removeMemberFromChannel(
                                      selectedChannelForSettings.id,
                                      memberId
                                    )
                                  }
                                  className='p-1 hover:bg-red-100 rounded text-red-600'
                                  title='Remove Member'
                                >
                                  <X className='w-4 h-4' />
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='flex items-center justify-center h-full'>
                    <div className='text-center text-gray-500'>
                      <Settings className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                      <p>Select a channel to manage its settings</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannelModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl'>
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-900'>
                Create New Channel
              </h2>
              <button
                onClick={() => setShowCreateChannelModal(false)}
                className='p-2 hover:bg-gray-100 rounded-lg'
              >
                <X className='w-5 h-5 text-gray-600' />
              </button>
            </div>

            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Channel Name *
                </label>
                <input
                  type='text'
                  value={newChannelData.name}
                  onChange={e =>
                    setNewChannelData(prev => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Enter channel name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Description
                </label>
                <textarea
                  value={newChannelData.description}
                  onChange={e =>
                    setNewChannelData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  rows={3}
                  placeholder='Enter channel description'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Channel Type
                </label>
                <div className='flex items-center space-x-4'>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      checked={newChannelData.type === 'custom'}
                      onChange={() =>
                        setNewChannelData(prev => ({ ...prev, type: 'custom' }))
                      }
                      className='mr-2'
                    />
                    <Hash className='w-4 h-4 mr-1' />
                    Custom
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      checked={newChannelData.type === 'project'}
                      onChange={() =>
                        setNewChannelData(prev => ({
                          ...prev,
                          type: 'project',
                        }))
                      }
                      className='mr-2'
                    />
                    <FileText className='w-4 h-4 mr-1' />
                    Project
                  </label>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Privacy
                </label>
                <div className='flex items-center space-x-4'>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      checked={!newChannelData.isPrivate}
                      onChange={() =>
                        setNewChannelData(prev => ({
                          ...prev,
                          isPrivate: false,
                        }))
                      }
                      className='mr-2'
                    />
                    <Globe className='w-4 h-4 mr-1' />
                    Public
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      checked={newChannelData.isPrivate}
                      onChange={() =>
                        setNewChannelData(prev => ({
                          ...prev,
                          isPrivate: true,
                        }))
                      }
                      className='mr-2'
                    />
                    <Lock className='w-4 h-4 mr-1' />
                    Private
                  </label>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Add Members
                </label>
                <div className='space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2'>
                  {users
                    .filter(u => u.id !== user?.id)
                    .map(user => (
                      <label
                        key={user.id}
                        className='flex items-center space-x-2 cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={newChannelData.selectedMembers.includes(
                            user.id
                          )}
                          onChange={() => toggleChannelMember(user.id)}
                          className='rounded'
                        />
                        <div className='flex items-center space-x-2'>
                          <div className='w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center'>
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className='w-6 h-6 rounded-full'
                              />
                            ) : (
                              <span className='text-xs font-medium text-gray-600'>
                                {user.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className='text-sm'>{user.name}</span>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            </div>

            <div className='flex items-center justify-end space-x-3 p-6 border-t border-gray-200'>
              <button
                onClick={() => setShowCreateChannelModal(false)}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200'
              >
                Cancel
              </button>
              <button
                onClick={createChannel}
                disabled={!newChannelData.name.trim()}
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
