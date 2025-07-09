import { supabase } from './supabase';
import type { Database } from './supabase';

// Types
type User = Database['public']['Tables']['users']['Row'];
type Role = Database['public']['Tables']['roles']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

// Authentication Service
export class SupabaseAuthService {
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}

// User Service
export class SupabaseUserService {
  static async getCurrentUserWithRoles(): Promise<User & { roles: Role[] }> {
    console.log('getCurrentUserWithRoles: Starting...');

    // Try to get user from session first (faster)
    console.log('getCurrentUserWithRoles: Trying to get session...');
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log('getCurrentUserWithRoles: Session result:', {
      hasSession: !!session,
      userId: session?.user?.id,
    });

    if (!session?.user) {
      throw new Error('No authenticated user');
    }

    const user = session.user;
    console.log('getCurrentUserWithRoles: Using demo data for user:', user.id);

    // Return demo user data instead of querying database
    const demoUser = {
      id: user.id,
      email: user.email || 'demo@archer.com',
      first_name: user.user_metadata?.first_name || 'Demo',
      last_name: user.user_metadata?.last_name || 'User',
      is_active: true,
      organization_id: 'demo-org',
      password_hash: '',
      last_login: new Date().toISOString(),
      avatar_url:
        user.user_metadata?.avatar_url ||
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      created_at: user.created_at || new Date().toISOString(),
      updated_at:
        user.updated_at || user.created_at || new Date().toISOString(),
      roles: [
        {
          id: 'role-1',
          organization_id: 'demo-org',
          name: 'admin',
          description: 'Administrator',
          permissions: ['read', 'write', 'delete'],
          created_at: new Date().toISOString(),
        },
      ],
    } as User & { roles: Role[] };

    console.log('getCurrentUserWithRoles: Returning demo user:', demoUser);
    return demoUser;
  }

  static async createUserFromAuth(authUser: any): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        first_name: authUser.user_metadata?.first_name || '',
        last_name: authUser.user_metadata?.last_name || '',
        is_active: true,
        organization_id: null, // Will be set when user joins an organization
        avatar_url: authUser.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUsersByOrganization(organizationId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, email, first_name, last_name, is_active, organization_id, avatar_url, created_at, updated_at'
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async updateUser(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Menu Service
export class SupabaseMenuService {
  static async getMenuItems(organizationId: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async updateMenuItems(
    organizationId: string,
    menuItems: Partial<MenuItem>[]
  ) {
    const { data, error } = await supabase
      .from('menu_items')
      .upsert(
        menuItems.map(item => ({ ...item, organization_id: organizationId }))
      )
      .select();

    if (error) throw error;
    return data;
  }

  static async createMenuItem(
    menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>
  ) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(menuItem)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteMenuItem(menuItemId: string) {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', menuItemId);

    if (error) throw error;
  }
}

// Notification Service
export class SupabaseNotificationService {
  static async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createNotification(
    notification: Omit<Notification, 'id' | 'created_at'>
  ) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Real-time notifications
  static subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }
}

// Chat Service
export class SupabaseChatService {
  static async getChatMessages(
    roomId: string,
    limit = 50
  ): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(
        `
        *,
        users (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.reverse();
  }

  static async sendMessage(message: Omit<ChatMessage, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Real-time chat
  static subscribeToChat(
    roomId: string,
    callback: (message: ChatMessage) => void
  ) {
    return supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        payload => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();
  }
}

// File Storage Service
export class SupabaseStorageService {
  static async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    return data;
  }

  static async getFileUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return data.publicUrl;
  }

  static async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
  }

  static async listFiles(bucket: string, folder?: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || '');

    if (error) throw error;
    return data;
  }
}

// Permission Service
export class SupabasePermissionService {
  static async checkPermission(
    userId: string,
    permission: string
  ): Promise<boolean> {
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select(
        `
        roles (
          permissions
        )
      `
      )
      .eq('user_id', userId);

    if (error) throw error;

    const hasPermission = userRoles.some((ur: any) => {
      const permissions = ur.roles.permissions;
      return permissions.includes('*') || permissions.includes(permission);
    });

    return hasPermission;
  }

  static async getUserPermissions(userId: string): Promise<string[]> {
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select(
        `
        roles (
          permissions
        )
      `
      )
      .eq('user_id', userId);

    if (error) throw error;

    const allPermissions = userRoles.flatMap((ur: any) => ur.roles.permissions);
    return [...new Set(allPermissions)]; // Remove duplicates
  }
}

// Export all services
export const supabaseServices = {
  auth: SupabaseAuthService,
  users: SupabaseUserService,
  menu: SupabaseMenuService,
  notifications: SupabaseNotificationService,
  chat: SupabaseChatService,
  storage: SupabaseStorageService,
  permissions: SupabasePermissionService,
};
