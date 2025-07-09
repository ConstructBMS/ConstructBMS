// Re-export the supabase client from supabaseAuth to avoid multiple instances
export { supabase } from './supabaseAuth';

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          domain: string | null;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain?: string | null;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string | null;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          password_hash: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email: string;
          password_hash: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          email?: string;
          password_hash?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          permissions: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          permissions?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          permissions?: any;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          created_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          organization_id: string;
          parent_id: string | null;
          name: string;
          icon: string | null;
          path: string | null;
          order_index: number;
          is_active: boolean;
          required_permissions: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          parent_id?: string | null;
          name: string;
          icon?: string | null;
          path?: string | null;
          order_index?: number;
          is_active?: boolean;
          required_permissions?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          parent_id?: string | null;
          name?: string;
          icon?: string | null;
          path?: string | null;
          order_index?: number;
          is_active?: boolean;
          required_permissions?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string | null;
          type: string;
          is_read: boolean;
          data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message?: string | null;
          type?: string;
          is_read?: boolean;
          data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string | null;
          type?: string;
          is_read?: boolean;
          data?: any;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          sender_id: string;
          room_id: string;
          message: string;
          attachments: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          room_id: string;
          message: string;
          attachments?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          room_id?: string;
          message?: string;
          attachments?: any;
          created_at?: string;
        };
      };
    };
  };
}

export type SupabaseClient = ReturnType<
  typeof import('@supabase/supabase-js').createClient<Database>
>;
