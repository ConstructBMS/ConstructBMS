import { supabase } from './supabase';

export interface CollaborationSession {
  id: string;
  document_id: string;
  session_name: string;
  created_by: string;
  is_active: boolean;
  max_participants: number;
  created_at?: string;
  updated_at?: string;
}

export interface SessionParticipant {
  id?: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  joined_at: string;
  last_active: string;
  cursor_position?: {
    line: number;
    ch: number;
  };
  selection?: {
    from: { line: number; ch: number };
    to: { line: number; ch: number };
  };
  is_online: boolean;
  avatar_url?: string;
}

export interface DocumentChange {
  id?: string;
  session_id: string;
  user_id: string;
  document_id: string;
  change_type: 'insert' | 'delete' | 'format' | 'comment';
  position: number;
  content?: string;
  length?: number;
  metadata?: any;
  timestamp: string;
  version: number;
  created_at?: string;
}

export interface DocumentComment {
  id?: string;
  document_id: string;
  user_id: string;
  user_name: string;
  content: string;
  position: {
    line: number;
    ch: number;
  };
  resolved: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CollaborationSettings {
  id?: string;
  user_id: string;
  auto_save_interval: number; // seconds
  show_cursors: boolean;
  show_selections: boolean;
  show_comments: boolean;
  enable_voice_chat: boolean;
  enable_screen_sharing: boolean;
  theme: 'light' | 'dark' | 'auto';
  created_at?: string;
  updated_at?: string;
}

export interface VoiceChatSession {
  id?: string;
  session_id: string;
  room_name: string;
  is_active: boolean;
  created_by: string;
  created_at?: string;
}

export interface ScreenShareSession {
  id?: string;
  session_id: string;
  user_id: string;
  stream_url?: string;
  is_active: boolean;
  started_at: string;
  ended_at?: string;
}

class CollaborationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private changeBuffer: DocumentChange[] = [];
  private changeBufferTimeout: NodeJS.Timeout | null = null;
  private presenceUpdateTimeout: NodeJS.Timeout | null = null;

  // Event listeners
  private listeners: {
    [event: string]: ((data: any) => void)[];
  } = {};

  // Current session state
  private currentSession: CollaborationSession | null = null;
  private currentUser: any = null;
  private documentVersion = 0;

  constructor() {
    this.setupHeartbeat();
  }

  // Initialize collaboration service
  async initialize(user: any): Promise<void> {
    this.currentUser = user;
    await this.loadUserSettings();
  }

  // Create a new collaboration session
  async createSession(
    documentId: string,
    sessionName: string,
    maxParticipants: number = 10
  ): Promise<CollaborationSession> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('collaboration_sessions')
        .insert([
          {
            document_id: documentId,
            session_name: sessionName,
            created_by: user.id,
            is_active: true,
            max_participants: maxParticipants,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Join the session automatically
      await this.joinSession(data.id);

      return data;
    } catch (error) {
      console.error('Error creating collaboration session:', error);
      throw error;
    }
  }

  // Join an existing collaboration session
  async joinSession(sessionId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get session details
      const { data: session, error: sessionError } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Check if session is full
      const { count: participantCount } = await supabase
        .from('session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('is_online', true);

      if (participantCount && participantCount >= session.max_participants) {
        throw new Error('Session is full');
      }

      // Add user to participants
      const { error: participantError } = await supabase
        .from('session_participants')
        .upsert(
          [
            {
              session_id: sessionId,
              user_id: user.id,
              user_name: user.user_metadata?.full_name || user.email,
              user_email: user.email,
              user_role: await this.getUserRole(user.id),
              joined_at: new Date().toISOString(),
              last_active: new Date().toISOString(),
              is_online: true,
            },
          ],
          { onConflict: 'session_id,user_id' }
        );

      if (participantError) throw participantError;

      this.currentSession = session;
      this.connectWebSocket(sessionId);
      this.startPresenceUpdates(sessionId);

      this.emit('sessionJoined', { session, user });
    } catch (error) {
      console.error('Error joining collaboration session:', error);
      throw error;
    }
  }

  // Leave the current collaboration session
  async leaveSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Update participant status
      await supabase
        .from('session_participants')
        .update({
          is_online: false,
          last_active: new Date().toISOString(),
        })
        .eq('session_id', this.currentSession.id)
        .eq('user_id', user.id);

      // Disconnect WebSocket
      this.disconnectWebSocket();

      this.emit('sessionLeft', { session: this.currentSession, user });
      this.currentSession = null;
    } catch (error) {
      console.error('Error leaving collaboration session:', error);
    }
  }

  // Send a document change
  async sendChange(
    change: Omit<
      DocumentChange,
      'id' | 'session_id' | 'user_id' | 'timestamp' | 'version' | 'created_at'
    >
  ): Promise<void> {
    if (!this.currentSession) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const documentChange: Omit<DocumentChange, 'id' | 'created_at'> = {
        ...change,
        session_id: this.currentSession.id,
        user_id: user.id,
        timestamp: new Date().toISOString(),
        version: ++this.documentVersion,
      };

      // Add to buffer for batching
      this.changeBuffer.push(documentChange as DocumentChange);

      // Send immediately if it's a critical change
      if (change.change_type === 'format' || change.change_type === 'comment') {
        this.flushChangeBuffer();
      } else {
        // Batch other changes
        if (this.changeBufferTimeout) {
          clearTimeout(this.changeBufferTimeout);
        }
        this.changeBufferTimeout = setTimeout(() => {
          this.flushChangeBuffer();
        }, 100);
      }

      // Send via WebSocket for real-time updates
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'document_change',
            data: documentChange,
          })
        );
      }
    } catch (error) {
      console.error('Error sending document change:', error);
    }
  }

  // Add a comment to the document
  async addComment(
    documentId: string,
    content: string,
    position: { line: number; ch: number }
  ): Promise<DocumentComment> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('document_comments')
        .insert([
          {
            document_id: documentId,
            user_id: user.id,
            user_name: user.user_metadata?.full_name || user.email,
            content,
            position,
            resolved: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Send comment via WebSocket
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'new_comment',
            data: data,
          })
        );
      }

      this.emit('commentAdded', data);
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Resolve a comment
  async resolveComment(commentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_comments')
        .update({ resolved: true })
        .eq('id', commentId);

      if (error) throw error;

      // Send resolution via WebSocket
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'comment_resolved',
            data: { comment_id: commentId },
          })
        );
      }

      this.emit('commentResolved', { comment_id: commentId });
    } catch (error) {
      console.error('Error resolving comment:', error);
      throw error;
    }
  }

  // Update cursor position
  async updateCursorPosition(position: {
    line: number;
    ch: number;
  }): Promise<void> {
    if (!this.currentSession) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('session_participants')
        .update({
          cursor_position: position,
          last_active: new Date().toISOString(),
        })
        .eq('session_id', this.currentSession.id)
        .eq('user_id', user.id);

      // Send cursor update via WebSocket
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'cursor_update',
            data: {
              user_id: user.id,
              position,
            },
          })
        );
      }
    } catch (error) {
      console.error('Error updating cursor position:', error);
    }
  }

  // Update text selection
  async updateSelection(selection: {
    from: { line: number; ch: number };
    to: { line: number; ch: number };
  }): Promise<void> {
    if (!this.currentSession) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('session_participants')
        .update({
          selection,
          last_active: new Date().toISOString(),
        })
        .eq('session_id', this.currentSession.id)
        .eq('user_id', user.id);

      // Send selection update via WebSocket
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'selection_update',
            data: {
              user_id: user.id,
              selection,
            },
          })
        );
      }
    } catch (error) {
      console.error('Error updating selection:', error);
    }
  }

  // Notify that user is typing
  async notifyTyping(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Send typing notification via WebSocket
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'typing_start',
            data: {
              user_id: user.id,
              user_name: user.user_metadata?.full_name || user.email,
            },
          })
        );
      }
    } catch (error) {
      console.error('Error notifying typing:', error);
    }
  }

  // Get session participants
  async getSessionParticipants(
    sessionId: string
  ): Promise<SessionParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching session participants:', error);
      return [];
    }
  }

  // Get document comments
  async getDocumentComments(documentId: string): Promise<DocumentComment[]> {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching document comments:', error);
      return [];
    }
  }

  // Get collaboration settings
  async getCollaborationSettings(): Promise<CollaborationSettings | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('collaboration_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching collaboration settings:', error);
      return null;
    }
  }

  // Update collaboration settings
  async updateCollaborationSettings(
    settings: Partial<CollaborationSettings>
  ): Promise<CollaborationSettings> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('collaboration_settings')
        .upsert([
          {
            user_id: user.id,
            ...settings,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating collaboration settings:', error);
      throw error;
    }
  }

  // Create voice chat session
  async createVoiceChatSession(): Promise<VoiceChatSession> {
    if (!this.currentSession)
      throw new Error('No active collaboration session');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('voice_chat_sessions')
        .insert([
          {
            session_id: this.currentSession.id,
            room_name: `voice-${this.currentSession.id}`,
            is_active: true,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating voice chat session:', error);
      throw error;
    }
  }

  // Start screen sharing
  async startScreenSharing(): Promise<ScreenShareSession> {
    if (!this.currentSession)
      throw new Error('No active collaboration session');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('screen_share_sessions')
        .insert([
          {
            session_id: this.currentSession.id,
            user_id: user.id,
            is_active: true,
            started_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting screen sharing:', error);
      throw error;
    }
  }

  // Stop screen sharing
  async stopScreenSharing(shareSessionId: string): Promise<void> {
    try {
      await supabase
        .from('screen_share_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
        })
        .eq('id', shareSessionId);
    } catch (error) {
      console.error('Error stopping screen sharing:', error);
      throw error;
    }
  }

  // Get all active sessions for a document
  async getSessionsForDocument(
    documentId: string
  ): Promise<CollaborationSession[]> {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('document_id', documentId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sessions for document:', error);
      return [];
    }
  }

  // Event handling
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private emit(event: string, data: any): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  // WebSocket connection management
  private connectWebSocket(sessionId: string): void {
    try {
      // In a real implementation, you would connect to your WebSocket server
      // For now, we'll simulate WebSocket functionality
      this.ws = new WebSocket(
        `wss://your-websocket-server.com/collaboration/${sessionId}`
      );

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', { sessionId });
      };

      this.ws.onmessage = event => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected', { sessionId });
        this.attemptReconnect(sessionId);
      };

      this.ws.onerror = error => {
        console.error('WebSocket error:', error);
        this.emit('error', { error, sessionId });
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      this.emit('error', { error, sessionId });
    }
  }

  private disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.presenceUpdateTimeout) {
      clearTimeout(this.presenceUpdateTimeout);
      this.presenceUpdateTimeout = null;
    }
  }

  private attemptReconnect(sessionId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnectFailed', { sessionId });
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      this.connectWebSocket(sessionId);
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'document_change':
        this.emit('documentChanged', message.data);
        break;
      case 'user_joined':
        this.emit('userJoined', message.data);
        break;
      case 'user_left':
        this.emit('userLeft', message.data);
        break;
      case 'cursor_update':
        this.emit('cursorUpdated', message.data);
        break;
      case 'selection_update':
        this.emit('selectionUpdated', message.data);
        break;
      case 'new_comment':
        this.emit('commentAdded', message.data);
        break;
      case 'comment_resolved':
        this.emit('commentResolved', message.data);
        break;
      case 'typing_start':
        this.emit('userTyping', message.data);
        break;
      case 'typing_stop':
        this.emit('userStoppedTyping', message.data);
        break;
      case 'voice_chat_started':
        this.emit('voiceChatStarted', message.data);
        break;
      case 'screen_share_started':
        this.emit('screenShareStarted', message.data);
        break;
      case 'screen_share_stopped':
        this.emit('screenShareStopped', message.data);
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private startPresenceUpdates(sessionId: string): void {
    const updatePresence = async () => {
      if (!this.currentSession) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from('session_participants')
          .update({
            last_active: new Date().toISOString(),
          })
          .eq('session_id', sessionId)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating presence:', error);
      }

      this.presenceUpdateTimeout = setTimeout(updatePresence, 30000); // Update every 30 seconds
    };

    updatePresence();
  }

  private flushChangeBuffer(): void {
    if (this.changeBuffer.length === 0) return;

    const changes = [...this.changeBuffer];
    this.changeBuffer = [];

    // In a real implementation, you would batch these changes
    // and send them to the server for processing
    console.log('Flushing change buffer:', changes);
  }

  private async loadUserSettings(): Promise<void> {
    try {
      const settings = await this.getCollaborationSettings();
      if (!settings) {
        // Create default settings
        await this.updateCollaborationSettings({
          auto_save_interval: 30,
          show_cursors: true,
          show_selections: true,
          show_comments: true,
          enable_voice_chat: true,
          enable_screen_sharing: true,
          theme: 'auto',
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  }

  private async getUserRole(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data.role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'user'; // Default role
    }
  }
}

// Create singleton instance
let collaborationServiceInstance: CollaborationService | null = null;

const getCollaborationServiceInstance = () => {
  if (!collaborationServiceInstance) {
    collaborationServiceInstance = new CollaborationService();
  }
  return collaborationServiceInstance;
};

// Export functions that use the singleton
export const collaborationService = {
  initialize: (user: any) => getCollaborationServiceInstance().initialize(user),
  createSession: (
    documentId: string,
    sessionName: string,
    maxParticipants?: number
  ) =>
    getCollaborationServiceInstance().createSession(
      documentId,
      sessionName,
      maxParticipants
    ),
  joinSession: (sessionId: string) =>
    getCollaborationServiceInstance().joinSession(sessionId),
  leaveSession: () => getCollaborationServiceInstance().leaveSession(),
  sendChange: (
    change: Omit<
      DocumentChange,
      'id' | 'session_id' | 'user_id' | 'timestamp' | 'version' | 'created_at'
    >
  ) => getCollaborationServiceInstance().sendChange(change),
  addComment: (
    documentId: string,
    content: string,
    position: { line: number; ch: number }
  ) =>
    getCollaborationServiceInstance().addComment(documentId, content, position),
  resolveComment: (commentId: string) =>
    getCollaborationServiceInstance().resolveComment(commentId),
  updateCursorPosition: (position: { line: number; ch: number }) =>
    getCollaborationServiceInstance().updateCursorPosition(position),
  updateSelection: (selection: {
    from: { line: number; ch: number };
    to: { line: number; ch: number };
  }) => getCollaborationServiceInstance().updateSelection(selection),
  notifyTyping: () => getCollaborationServiceInstance().notifyTyping(),
  getSessionParticipants: (sessionId: string) =>
    getCollaborationServiceInstance().getSessionParticipants(sessionId),
  getDocumentComments: (documentId: string) =>
    getCollaborationServiceInstance().getDocumentComments(documentId),
  getCollaborationSettings: () =>
    getCollaborationServiceInstance().getCollaborationSettings(),
  updateCollaborationSettings: (settings: Partial<CollaborationSettings>) =>
    getCollaborationServiceInstance().updateCollaborationSettings(settings),
  createVoiceChatSession: () =>
    getCollaborationServiceInstance().createVoiceChatSession(),
  startScreenSharing: () =>
    getCollaborationServiceInstance().startScreenSharing(),
  stopScreenSharing: (shareSessionId: string) =>
    getCollaborationServiceInstance().stopScreenSharing(shareSessionId),
  on: (event: string, callback: (data: any) => void) =>
    getCollaborationServiceInstance().on(event, callback),
  off: (event: string, callback: (data: any) => void) =>
    getCollaborationServiceInstance().off(event, callback),
  getSessionsForDocument: (documentId: string) =>
    getCollaborationServiceInstance().getSessionsForDocument(documentId),
};
