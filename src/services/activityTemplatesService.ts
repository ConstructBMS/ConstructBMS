import { supabase } from './supabase';

export interface ActivityTemplate {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  is_public: boolean;
  category?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TemplateStep {
  id: string;
  template_id: string;
  label: string;
  description?: string;
  duration: number;
  sequence: number;
  is_milestone: boolean;
  dependencies: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskActivity {
  id: string;
  task_id: string;
  template_id?: string;
  label: string;
  description?: string;
  duration: number;
  sequence: number;
  is_milestone: boolean;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  assigned_to?: string;
  start_date?: string;
  end_date?: string;
  dependencies: string[];
  created_at: string;
  updated_at: string;
}

class ActivityTemplatesService {
  // Get all templates accessible to user (public + own)
  async getTemplates(userId: string): Promise<ActivityTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('activity_templates')
        .select('*')
        .or(`is_public.eq.true,owner_id.eq.${userId}`)
        .order('name');

      if (error) {
        console.warn('Failed to fetch templates from database:', error);
        return this.getDemoTemplates();
      }

      return data || [];
    } catch (error) {
      console.warn('Get templates failed:', error);
      return this.getDemoTemplates();
    }
  }

  // Get template by ID
  async getTemplate(templateId: string): Promise<ActivityTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('activity_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        console.warn('Failed to fetch template from database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Get template failed:', error);
      return null;
    }
  }

  // Get template steps
  async getTemplateSteps(templateId: string): Promise<TemplateStep[]> {
    try {
      const { data, error } = await supabase
        .from('template_steps')
        .select('*')
        .eq('template_id', templateId)
        .order('sequence');

      if (error) {
        console.warn('Failed to fetch template steps from database:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Get template steps failed:', error);
      return [];
    }
  }

  // Create new template
  async createTemplate(template: Omit<ActivityTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ActivityTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('activity_templates')
        .insert(template)
        .select()
        .single();

      if (error) {
        console.warn('Failed to create template in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Create template failed:', error);
      return null;
    }
  }

  // Update template
  async updateTemplate(templateId: string, updates: Partial<ActivityTemplate>): Promise<ActivityTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('activity_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        console.warn('Failed to update template in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Update template failed:', error);
      return null;
    }
  }

  // Delete template
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('activity_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.warn('Failed to delete template from database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Delete template failed:', error);
      return false;
    }
  }

  // Add step to template
  async addTemplateStep(step: Omit<TemplateStep, 'id' | 'created_at' | 'updated_at'>): Promise<TemplateStep | null> {
    try {
      const { data, error } = await supabase
        .from('template_steps')
        .insert(step)
        .select()
        .single();

      if (error) {
        console.warn('Failed to add template step in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Add template step failed:', error);
      return null;
    }
  }

  // Update template step
  async updateTemplateStep(stepId: string, updates: Partial<TemplateStep>): Promise<TemplateStep | null> {
    try {
      const { data, error } = await supabase
        .from('template_steps')
        .update(updates)
        .eq('id', stepId)
        .select()
        .single();

      if (error) {
        console.warn('Failed to update template step in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Update template step failed:', error);
      return null;
    }
  }

  // Delete template step
  async deleteTemplateStep(stepId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('template_steps')
        .delete()
        .eq('id', stepId);

      if (error) {
        console.warn('Failed to delete template step from database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Delete template step failed:', error);
      return false;
    }
  }

  // Get task activities
  async getTaskActivities(taskId: string): Promise<TaskActivity[]> {
    try {
      const { data, error } = await supabase
        .from('task_activities')
        .select('*')
        .eq('task_id', taskId)
        .order('sequence');

      if (error) {
        console.warn('Failed to fetch task activities from database:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Get task activities failed:', error);
      return [];
    }
  }

  // Create task activity
  async createTaskActivity(activity: Omit<TaskActivity, 'id' | 'created_at' | 'updated_at'>): Promise<TaskActivity | null> {
    try {
      const { data, error } = await supabase
        .from('task_activities')
        .insert(activity)
        .select()
        .single();

      if (error) {
        console.warn('Failed to create task activity in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Create task activity failed:', error);
      return null;
    }
  }

  // Update task activity
  async updateTaskActivity(activityId: string, updates: Partial<TaskActivity>): Promise<TaskActivity | null> {
    try {
      const { data, error } = await supabase
        .from('task_activities')
        .update(updates)
        .eq('id', activityId)
        .select()
        .single();

      if (error) {
        console.warn('Failed to update task activity in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Update task activity failed:', error);
      return null;
    }
  }

  // Delete task activity
  async deleteTaskActivity(activityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_activities')
        .delete()
        .eq('id', activityId);

      if (error) {
        console.warn('Failed to delete task activity from database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Delete task activity failed:', error);
      return false;
    }
  }

  // Apply template to task
  async applyTemplateToTask(templateId: string, taskId: string, userId: string): Promise<TaskActivity[]> {
    try {
      // Get template and steps
      const template = await this.getTemplate(templateId);
      const steps = await this.getTemplateSteps(templateId);

      if (!template || steps.length === 0) {
        console.warn('Template or steps not found');
        return [];
      }

      // Create activities from template steps
      const activities: TaskActivity[] = [];
      for (const step of steps) {
        const activity: Omit<TaskActivity, 'id' | 'created_at' | 'updated_at'> = {
          task_id: taskId,
          template_id: templateId,
          label: step.label,
          description: step.description,
          duration: step.duration,
          sequence: step.sequence,
          is_milestone: step.is_milestone,
          status: 'not-started',
          progress: 0,
          dependencies: step.dependencies,
        };

        const createdActivity = await this.createTaskActivity(activity);
        if (createdActivity) {
          activities.push(createdActivity);
        }
      }

      return activities;
    } catch (error) {
      console.warn('Apply template to task failed:', error);
      return [];
    }
  }

  // Get demo templates
  private getDemoTemplates(): ActivityTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'Foundation Construction',
        description: 'Standard foundation construction activities',
        owner_id: 'demo-user',
        is_public: true,
        category: 'Construction',
        tags: ['foundation', 'construction', 'civil'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'template-2',
        name: 'Electrical Installation',
        description: 'Complete electrical installation process',
        owner_id: 'demo-user',
        is_public: true,
        category: 'MEP',
        tags: ['electrical', 'installation', 'mep'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'template-3',
        name: 'Plumbing Installation',
        description: 'Standard plumbing installation activities',
        owner_id: 'demo-user',
        is_public: true,
        category: 'MEP',
        tags: ['plumbing', 'installation', 'mep'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'template-4',
        name: 'Interior Finishing',
        description: 'Interior finishing and decoration activities',
        owner_id: 'demo-user',
        is_public: true,
        category: 'Finishing',
        tags: ['interior', 'finishing', 'decoration'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Get demo template steps
  getDemoTemplateSteps(templateId: string): TemplateStep[] {
    const steps: { [key: string]: TemplateStep[] } = {
      'template-1': [
        {
          id: 'step-1-1',
          template_id: templateId,
          label: 'Site Preparation',
          description: 'Clear and prepare the construction site',
          duration: 2,
          sequence: 1,
          is_milestone: false,
          dependencies: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'step-1-2',
          template_id: templateId,
          label: 'Excavation',
          description: 'Excavate foundation trenches',
          duration: 3,
          sequence: 2,
          is_milestone: false,
          dependencies: ['step-1-1'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'step-1-3',
          template_id: templateId,
          label: 'Foundation Complete',
          description: 'Foundation construction completed',
          duration: 0,
          sequence: 3,
          is_milestone: true,
          dependencies: ['step-1-2'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      'template-2': [
        {
          id: 'step-2-1',
          template_id: templateId,
          label: 'Electrical Planning',
          description: 'Plan electrical layout and circuits',
          duration: 1,
          sequence: 1,
          is_milestone: false,
          dependencies: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'step-2-2',
          template_id: templateId,
          label: 'Conduit Installation',
          description: 'Install electrical conduits',
          duration: 4,
          sequence: 2,
          is_milestone: false,
          dependencies: ['step-2-1'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'step-2-3',
          template_id: templateId,
          label: 'Wiring Installation',
          description: 'Install electrical wiring and fixtures',
          duration: 5,
          sequence: 3,
          is_milestone: false,
          dependencies: ['step-2-2'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'step-2-4',
          template_id: templateId,
          label: 'Electrical Testing',
          description: 'Test all electrical systems',
          duration: 2,
          sequence: 4,
          is_milestone: true,
          dependencies: ['step-2-3'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };

    return steps[templateId] || [];
  }

  // Get demo task activities
  getDemoTaskActivities(taskId: string): TaskActivity[] {
    return [
      {
        id: 'activity-1',
        task_id: taskId,
        template_id: 'template-1',
        label: 'Site Preparation',
        description: 'Clear and prepare the construction site',
        duration: 2,
        sequence: 1,
        is_milestone: false,
        status: 'completed',
        progress: 100,
        dependencies: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'activity-2',
        task_id: taskId,
        template_id: 'template-1',
        label: 'Excavation',
        description: 'Excavate foundation trenches',
        duration: 3,
        sequence: 2,
        is_milestone: false,
        status: 'in-progress',
        progress: 60,
        dependencies: ['activity-1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'activity-3',
        task_id: taskId,
        template_id: 'template-1',
        label: 'Foundation Complete',
        description: 'Foundation construction completed',
        duration: 0,
        sequence: 3,
        is_milestone: true,
        status: 'not-started',
        progress: 0,
        dependencies: ['activity-2'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}

export const activityTemplatesService = new ActivityTemplatesService(); 