import { supabase } from './supabase';

export interface AstaView {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  view_type: 'gantt' | 'timeline' | 'calendar' | 'resource' | 'cost' | 'custom';
  tab_color: TabColor;
  is_default: boolean;
  sort_order: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type TabColor = 
  | 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'yellow' | 'pink' | 'indigo' 
  | 'teal' | 'gray' | 'slate' | 'zinc' | 'neutral' | 'stone' | 'amber' | 'lime' 
  | 'emerald' | 'cyan' | 'sky' | 'violet' | 'fuchsia' | 'rose';

export interface TabColorOption {
  value: TabColor;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  description: string;
}

class TabColouringService {
  // Get all tab color options
  getTabColorOptions(): TabColorOption[] {
    return [
      { value: 'blue', label: 'Blue', bgClass: 'bg-blue-500', textClass: 'text-blue-500', borderClass: 'border-blue-500', description: 'Planning & Design' },
      { value: 'green', label: 'Green', bgClass: 'bg-green-500', textClass: 'text-green-500', borderClass: 'border-green-500', description: 'QA & Testing' },
      { value: 'orange', label: 'Orange', bgClass: 'bg-orange-500', textClass: 'text-orange-500', borderClass: 'border-orange-500', description: 'Construction' },
      { value: 'red', label: 'Red', bgClass: 'bg-red-500', textClass: 'text-red-500', borderClass: 'border-red-500', description: 'Critical Issues' },
      { value: 'purple', label: 'Purple', bgClass: 'bg-purple-500', textClass: 'text-purple-500', borderClass: 'border-purple-500', description: 'Resources' },
      { value: 'yellow', label: 'Yellow', bgClass: 'bg-yellow-500', textClass: 'text-yellow-500', borderClass: 'border-yellow-500', description: 'Warnings' },
      { value: 'pink', label: 'Pink', bgClass: 'bg-pink-500', textClass: 'text-pink-500', borderClass: 'border-pink-500', description: 'Special Events' },
      { value: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-500', textClass: 'text-indigo-500', borderClass: 'border-indigo-500', description: 'Administration' },
      { value: 'teal', label: 'Teal', bgClass: 'bg-teal-500', textClass: 'text-teal-500', borderClass: 'border-teal-500', description: 'Foundation' },
      { value: 'gray', label: 'Gray', bgClass: 'bg-gray-500', textClass: 'text-gray-500', borderClass: 'border-gray-500', description: 'Inactive' },
      { value: 'slate', label: 'Slate', bgClass: 'bg-slate-500', textClass: 'text-slate-500', borderClass: 'border-slate-500', description: 'Neutral' },
      { value: 'zinc', label: 'Zinc', bgClass: 'bg-zinc-500', textClass: 'text-zinc-500', borderClass: 'border-zinc-500', description: 'System' },
      { value: 'neutral', label: 'Neutral', bgClass: 'bg-neutral-500', textClass: 'text-neutral-500', borderClass: 'border-neutral-500', description: 'Default' },
      { value: 'stone', label: 'Stone', bgClass: 'bg-stone-500', textClass: 'text-stone-500', borderClass: 'border-stone-500', description: 'Background' },
      { value: 'amber', label: 'Amber', bgClass: 'bg-amber-500', textClass: 'text-amber-500', borderClass: 'border-amber-500', description: 'Framing' },
      { value: 'lime', label: 'Lime', bgClass: 'bg-lime-500', textClass: 'text-lime-500', borderClass: 'border-lime-500', description: 'Landscaping' },
      { value: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-500', textClass: 'text-emerald-500', borderClass: 'border-emerald-500', description: 'Finishing' },
      { value: 'cyan', label: 'Cyan', bgClass: 'bg-cyan-500', textClass: 'text-cyan-500', borderClass: 'border-cyan-500', description: 'Utilities' },
      { value: 'sky', label: 'Sky', bgClass: 'bg-sky-500', textClass: 'text-sky-500', borderClass: 'border-sky-500', description: 'Roofing' },
      { value: 'violet', label: 'Violet', bgClass: 'bg-violet-500', textClass: 'text-violet-500', borderClass: 'border-violet-500', description: 'Electrical' },
      { value: 'fuchsia', label: 'Fuchsia', bgClass: 'bg-fuchsia-500', textClass: 'text-fuchsia-500', borderClass: 'border-fuchsia-500', description: 'Plumbing' },
      { value: 'rose', label: 'Rose', bgClass: 'bg-rose-500', textClass: 'text-rose-500', borderClass: 'border-rose-500', description: 'HVAC' }
    ];
  }

  // Get tab color option by value
  getTabColorOption(color: TabColor): TabColorOption | undefined {
    return this.getTabColorOptions().find(option => option.value === color);
  }

  // Get views for a project
  async getProjectViews(projectId: string): Promise<AstaView[]> {
    try {
      const { data, error } = await supabase
        .from('asta_views')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order');

      if (error) {
        console.warn('Failed to fetch project views from database:', error);
        return this.getDemoViews(projectId);
      }

      return data || [];
    } catch (error) {
      console.warn('Get project views failed:', error);
      return this.getDemoViews(projectId);
    }
  }

  // Create new view
  async createView(view: Omit<AstaView, 'id' | 'created_at' | 'updated_at'>): Promise<AstaView | null> {
    try {
      const { data, error } = await supabase
        .from('asta_views')
        .insert(view)
        .select()
        .single();

      if (error) {
        console.warn('Failed to create view in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Create view failed:', error);
      return null;
    }
  }

  // Update view
  async updateView(viewId: string, updates: Partial<AstaView>): Promise<AstaView | null> {
    try {
      const { data, error } = await supabase
        .from('asta_views')
        .update(updates)
        .eq('id', viewId)
        .select()
        .single();

      if (error) {
        console.warn('Failed to update view in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Update view failed:', error);
      return null;
    }
  }

  // Delete view
  async deleteView(viewId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('asta_views')
        .delete()
        .eq('id', viewId);

      if (error) {
        console.warn('Failed to delete view from database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Delete view failed:', error);
      return false;
    }
  }

  // Set default view
  async setDefaultView(projectId: string, viewId: string): Promise<boolean> {
    try {
      // First, unset all default views for this project
      await supabase
        .from('asta_views')
        .update({ is_default: false })
        .eq('project_id', projectId);

      // Then set the specified view as default
      const { error } = await supabase
        .from('asta_views')
        .update({ is_default: true })
        .eq('id', viewId);

      if (error) {
        console.warn('Failed to set default view in database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Set default view failed:', error);
      return false;
    }
  }

  // Reorder views
  async reorderViews(projectId: string, viewIds: string[]): Promise<boolean> {
    try {
      const updates = viewIds.map((id, index) => ({
        id,
        sort_order: index + 1
      }));

      const { error } = await supabase
        .from('asta_views')
        .upsert(updates);

      if (error) {
        console.warn('Failed to reorder views in database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Reorder views failed:', error);
      return false;
    }
  }

  // Get default view for project
  async getDefaultView(projectId: string): Promise<AstaView | null> {
    try {
      const { data, error } = await supabase
        .from('asta_views')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_default', true)
        .single();

      if (error) {
        console.warn('Failed to fetch default view from database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Get default view failed:', error);
      return null;
    }
  }

  // Get views by type
  async getViewsByType(projectId: string, viewType: AstaView['view_type']): Promise<AstaView[]> {
    try {
      const { data, error } = await supabase
        .from('asta_views')
        .select('*')
        .eq('project_id', projectId)
        .eq('view_type', viewType)
        .order('sort_order');

      if (error) {
        console.warn('Failed to fetch views by type from database:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Get views by type failed:', error);
      return [];
    }
  }

  // Get demo views
  private getDemoViews(projectId: string): AstaView[] {
    const baseViews = [
      {
        id: 'view-1',
        project_id: projectId,
        name: 'Planning View',
        description: 'Project planning and design phase view',
        view_type: 'gantt' as const,
        tab_color: 'blue' as TabColor,
        is_default: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'view-2',
        project_id: projectId,
        name: 'Construction View',
        description: 'Main construction phase view',
        view_type: 'gantt' as const,
        tab_color: 'orange' as TabColor,
        is_default: false,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'view-3',
        project_id: projectId,
        name: 'QA View',
        description: 'Quality assurance and testing view',
        view_type: 'gantt' as const,
        tab_color: 'green' as TabColor,
        is_default: false,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'view-4',
        project_id: projectId,
        name: 'Resource View',
        description: 'Resource allocation and management',
        view_type: 'resource' as const,
        tab_color: 'purple' as TabColor,
        is_default: false,
        sort_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'view-5',
        project_id: projectId,
        name: 'Cost View',
        description: 'Budget and cost tracking',
        view_type: 'cost' as const,
        tab_color: 'red' as TabColor,
        is_default: false,
        sort_order: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return baseViews;
  }
}

export const tabColouringService = new TabColouringService(); 