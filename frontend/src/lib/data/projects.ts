import { supabase, TABLES } from '../../services/supabase';
import type { Project, ProjectFormData } from '../types/projects';

export class ProjectsDAL {
  static async listProjects(): Promise<Project[]> {
    // For now, we'll fetch all projects since org_id column may not exist yet
    // TODO: Update this once the org_id migration is applied
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data || [];
  }

  static async getProject(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data;
  }

  static async upsertProject(
    project: ProjectFormData & { id?: string; orgId: string }
  ): Promise<Project> {
    const projectData = {
      name: project.name,
      description: project.description,
      status: project.status,
      start_date: project.startDate,
      end_date: project.endDate,
      budget: project.budget,
      client_id: project.clientId,
      // org_id: project.orgId, // TODO: Add this once org_id migration is applied
      tags: project.tags,
      custom: project.custom,
    };

    if (project.id) {
      // Update existing project
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .update(projectData)
        .eq('id', project.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update project: ${error.message}`);
      }

      return data;
    } else {
      // Create new project
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .insert(projectData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create project: ${error.message}`);
      }

      return data;
    }
  }

  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.PROJECTS)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }
}
