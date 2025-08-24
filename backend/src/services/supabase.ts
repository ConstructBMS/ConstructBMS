import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database table names
export const TABLES = {
  USERS: 'users',
  MODULES: 'modules',
  MENU_ITEMS: 'menu_items',
  PROJECTS: 'projects',
  CLIENTS: 'clients',
  CONTRACTORS: 'contractors',
  CONSULTANTS: 'consultants',
  TASKS: 'tasks',
  NOTES: 'notes',
  DOCUMENTS: 'documents',
  USER_MODULES: 'user_modules',
  USER_ROLES: 'user_roles',
} as const;

// Database schema types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          avatar?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: string;
          avatar?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          avatar?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          name: string;
          description: string;
          is_active: boolean;
          icon: string;
          route: string;
          permissions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          is_active?: boolean;
          icon: string;
          route: string;
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          is_active?: boolean;
          icon?: string;
          route?: string;
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string;
          status: string;
          client_id: string;
          start_date: string;
          end_date?: string;
          budget: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          status?: string;
          client_id: string;
          start_date: string;
          end_date?: string;
          budget: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          status?: string;
          client_id?: string;
          start_date?: string;
          end_date?: string;
          budget?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          company: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          company: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          address?: string;
          company?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: string;
          priority: string;
          assignee_id?: string;
          project_id?: string;
          due_date?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          status?: string;
          priority: string;
          assignee_id?: string;
          project_id?: string;
          due_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: string;
          priority?: string;
          assignee_id?: string;
          project_id?: string;
          due_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
