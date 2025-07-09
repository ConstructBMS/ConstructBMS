import { supabase } from './supabase';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  assignee?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  priority?: string;
  position?: number;
  client_visible?: boolean;
  customer_id?: string;
  opportunity_id?: string;
  type?: string;
}

export interface Project {
  id: string;
  name: string;
  status?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
}

export interface Opportunity {
  id: string;
  name: string;
  status?: string;
}

// Get all tasks with optional filtering
export async function getTasks(filters?: {
  project_id?: string;
  customer_id?: string;
  opportunity_id?: string;
  type?: string;
  status?: string;
  assignee?: string;
}): Promise<Task[]> {
  let query = supabase.from('tasks').select('*');

  if (filters?.project_id) {
    query = query.eq('project_id', filters.project_id);
  }
  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id);
  }
  if (filters?.opportunity_id) {
    query = query.eq('opportunity_id', filters.opportunity_id);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.assignee) {
    query = query.eq('assignee', filters.assignee);
  }

  const { data, error } = await query.order('position', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getTasksForProject(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addTask(task: Partial<Task>): Promise<Task[]> {
  if (!task.project_id || !task.title)
    throw new Error('project_id and title are required');
  const { error } = await supabase.from('tasks').insert([task]);
  if (error) throw error;
  return getTasksForProject(task.project_id);
}

export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select('project_id')
    .single();
  if (error) throw error;
  return getTasksForProject(data.project_id);
}

export async function deleteTask(
  taskId: string,
  projectId: string
): Promise<Task[]> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
  return getTasksForProject(projectId);
}

export async function getAssigneesForProject(
  projectId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('assignee')
    .eq('project_id', projectId);
  if (error) throw error;
  const assignees = (data || []).map((t: any) => t.assignee).filter(Boolean);
  return Array.from(new Set(assignees));
}

// Get all unique assignees across all tasks
export async function getAllAssignees(): Promise<string[]> {
  const { data, error } = await supabase.from('tasks').select('assignee');
  if (error) throw error;
  const assignees = (data || []).map((t: any) => t.assignee).filter(Boolean);
  return Array.from(new Set(assignees));
}

// Get all projects for filter dropdown
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, status')
    .order('name');
  if (error) throw error;
  return data || [];
}

// Get all customers for filter dropdown
export async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, email')
      .order('name');
    if (error) {
      // If customers table doesn't exist, return empty array
      console.warn('Customers table not found, returning empty array');
      return [];
    }
    return data || [];
  } catch (error) {
    // Handle any other errors gracefully
    console.warn('Error fetching customers:', error);
    return [];
  }
}

// Get all opportunities for filter dropdown
export async function getOpportunities(): Promise<Opportunity[]> {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('id, name, status')
      .order('name');
    if (error) {
      // If opportunities table doesn't exist, return empty array
      console.warn('Opportunities table not found, returning empty array');
      return [];
    }
    return data || [];
  } catch (error) {
    // Handle any other errors gracefully
    console.warn('Error fetching opportunities:', error);
    return [];
  }
}
