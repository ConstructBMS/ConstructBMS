// Re-export the supabase client from supabaseAuth to avoid multiple instances
export { supabase } from './supabaseAuth';

// Database types for TypeScript
export interface Database {
          attachments?: any;
      chat_messages: {
          Insert: {
          menu_items: {
        Insert: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          order_index?: number;
          organization_id: string;
          parent_id?: string | null;
          path?: string | null;
          required_permissions?: any;
          updated_at?: string;
        };
        Row: {
          created_at: string;
          icon: string | null;
          id: string;
          is_active: boolean;
          name: string;
          order_index: number;
          organization_id: string;
          parent_id: string | null;
          path: string | null;
          required_permissions: any;
          updated_at: string;
        };
        Update: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          order_index?: number;
          organization_id?: string;
          parent_id?: string | null;
          path?: string | null;
          required_permissions?: any;
          updated_at?: string;
        };
      };
  message: string;
      notifications: {
        Insert: {
          created_at?: string;
          data?: any;
          id?: string;
          is_read?: boolean;
          message?: string | null;
          title: string;
          type?: string;
          user_id: string;
        };
        Row: {
          created_at: string;
          data: any;
          id: string;
          is_read: boolean;
          message: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data?: any;
          id?: string;
          is_read?: boolean;
          message?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
      };
      organizations: {
        Insert: {
          created_at?: string;
          domain?: string | null;
          id?: string;
          name: string;
          settings?: any;
          updated_at?: string;
        };
        Row: {
          created_at: string;
          domain: string | null;
          id: string;
          name: string;
          settings: any;
          updated_at: string;
        };
        Update: {
          created_at?: string;
          domain?: string | null;
          id?: string;
          name?: string;
          settings?: any;
          updated_at?: string;
        };
      };
      public: {
          Row: {
          attachments: any;
          created_at: string;
          id: string;
          message: string;
          room_id: string;
          sender_id: string;
        };
          Tables: {
};
    Update: {
          attachments?: any;
          created_at?: string;
          id?: string;
          message?: string;
          room_id?: string;
          sender_id?: string;
        };
        room_id: string;
        sender_id: string;
      };
      roles: {
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          permissions?: any;
        };
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          organization_id: string;
          permissions: any;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          organization_id?: string;
          permissions?: any;
        };
      };
      user_roles: {
        Insert: {
          created_at?: string;
          id?: string;
          role_id: string;
          user_id: string;
        };
        Row: {
          created_at: string;
          id: string;
          role_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role_id?: string;
          user_id?: string;
        };
      };
      users: {
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          demo_mode?: boolean;
          email: string;
          first_name?: string | null;
          id?: string;
          is_active?: boolean;
          last_login?: string | null;
          last_name?: string | null;
          organization_id: string;
          password_hash: string;
          updated_at?: string;
        };
        Row: {
          avatar_url: string | null;
          created_at: string;
          demo_mode: boolean;
          email: string;
          first_name: string | null;
          id: string;
          is_active: boolean;
          last_login: string | null;
          last_name: string | null;
          organization_id: string;
          password_hash: string;
          updated_at: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          demo_mode?: boolean;
          email?: string;
          first_name?: string | null;
          id?: string;
          is_active?: boolean;
          last_login?: string | null;
          last_name?: string | null;
          organization_id?: string;
          password_hash?: string;
          updated_at?: string;
        };
      };
    };
          created_at?: string;
        id?: string;
  };
}

export type SupabaseClient = ReturnType<
  typeof import('@supabase/supabase-js').createClient<Database>
>;
