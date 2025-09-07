import type { Project, ProjectFormData } from '../types/projects';

export class ProjectsDAL {
  private static baseUrl = '/api/projects';

  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async listProjects(orgId: string): Promise<Project[]> {
    const response = await fetch(`${this.baseUrl}?orgId=${orgId}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  }

  static async getProject(id: string): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }
    return response.json();
  }

  static async upsertProject(
    project: ProjectFormData & { id?: string; orgId: string }
  ): Promise<Project> {
    const url = project.id ? `${this.baseUrl}/${project.id}` : this.baseUrl;
    const method = project.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: this.getAuthHeaders(),
      body: JSON.stringify(project),
    });

    if (!response.ok) {
      throw new Error(`Failed to ${project.id ? 'update' : 'create'} project`);
    }

    return response.json();
  }

  static async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
  }
}
