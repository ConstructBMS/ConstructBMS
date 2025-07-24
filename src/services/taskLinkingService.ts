import { supabase } from './supabase';

export interface TaskLink {
  created_at: string;
  id: string;
  lag_days: number;
  link_type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  project_id: string;
  source_task_id: string;
  target_task_id: string;
  updated_at: string;
}

export interface LinkPoint {
  x: number;
  y: number;
}

export interface LinkPath {
  control1: LinkPoint;
  control2: LinkPoint;
  end: LinkPoint;
  start: LinkPoint;
}

export type LinkType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';

class TaskLinkingService {
  // Get all links for a project
  async getTaskLinks(projectId: string): Promise<TaskLink[]> {
    try {
      const { data, error } = await supabase
        .from('asta_task_links')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at');

      if (error) {
        console.warn('Failed to fetch task links from database:', error);
        return this.getDemoTaskLinks(projectId);
      }

      return data || [];
    } catch (error) {
      console.warn('Get task links failed:', error);
      return this.getDemoTaskLinks(projectId);
    }
  }

  // Create new task link
  async createTaskLink(link: Omit<TaskLink, 'id' | 'created_at' | 'updated_at'>): Promise<TaskLink | null> {
    try {
      // Validate link
      if (!this.validateLink(link)) {
        console.error('Invalid task link');
        return null;
      }

      const { data, error } = await supabase
        .from('asta_task_links')
        .insert(link)
        .select()
        .single();

      if (error) {
        console.warn('Failed to create task link in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Create task link failed:', error);
      return null;
    }
  }

  // Update task link
  async updateTaskLink(linkId: string, updates: Partial<TaskLink>): Promise<TaskLink | null> {
    try {
      const { data, error } = await supabase
        .from('asta_task_links')
        .update(updates)
        .eq('id', linkId)
        .select()
        .single();

      if (error) {
        console.warn('Failed to update task link in database:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Update task link failed:', error);
      return null;
    }
  }

  // Delete task link
  async deleteTaskLink(linkId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('asta_task_links')
        .delete()
        .eq('id', linkId);

      if (error) {
        console.warn('Failed to delete task link from database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Delete task link failed:', error);
      return false;
    }
  }

  // Validate task link
  validateLink(link: Partial<TaskLink>): boolean {
    // Check for required fields
    if (!link.source_task_id || !link.target_task_id || !link.project_id) {
      return false;
    }

    // Prevent self-linking
    if (link.source_task_id === link.target_task_id) {
      return false;
    }

    // Validate link type
    const validTypes: LinkType[] = ['finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish'];
    if (link.link_type && !validTypes.includes(link.link_type)) {
      return false;
    }

    // Validate lag days
    if (link.lag_days && (link.lag_days < -365 || link.lag_days > 365)) {
      return false;
    }

    return true;
  }

  // Check for circular dependencies
  async checkCircularDependency(sourceTaskId: string, targetTaskId: string, projectId: string): Promise<boolean> {
    try {
      const links = await this.getTaskLinks(projectId);
      const visited = new Set<string>();
      const recursionStack = new Set<string>();

      const hasCycle = (taskId: string): boolean => {
        if (recursionStack.has(taskId)) {
          return true;
        }
        if (visited.has(taskId)) {
          return false;
        }

        visited.add(taskId);
        recursionStack.add(taskId);

        const outgoingLinks = links.filter(link => link.source_task_id === taskId);
        for (const link of outgoingLinks) {
          if (hasCycle(link.target_task_id)) {
            return true;
          }
        }

        recursionStack.delete(taskId);
        return false;
      };

      // Temporarily add the new link for cycle detection
      const tempLink: TaskLink = {
        id: 'temp',
        project_id: projectId,
        source_task_id: sourceTaskId,
        target_task_id: targetTaskId,
        link_type: 'finish-to-start',
        lag_days: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      links.push(tempLink);
      const hasCircular = hasCycle(targetTaskId);
      links.pop(); // Remove temp link

      return hasCircular;
    } catch (error) {
      console.warn('Check circular dependency failed:', error);
      return false;
    }
  }

  // Calculate link path for SVG rendering
  calculateLinkPath(
    sourceRect: DOMRect,
    targetRect: DOMRect,
    linkType: LinkType,
    containerRect: DOMRect
  ): LinkPath {
    const sourceCenter = {
      x: sourceRect.left + sourceRect.width / 2 - containerRect.left,
      y: sourceRect.top + sourceRect.height / 2 - containerRect.top
    };

    const targetCenter = {
      x: targetRect.left + targetRect.width / 2 - containerRect.left,
      y: targetRect.top + targetRect.height / 2 - containerRect.top
    };

    // Calculate start and end points based on link type
    let start: LinkPoint;
    let end: LinkPoint;

    switch (linkType) {
      case 'finish-to-start':
        start = { x: sourceRect.right - containerRect.left, y: sourceCenter.y };
        end = { x: targetRect.left - containerRect.left, y: targetCenter.y };
        break;
      case 'start-to-start':
        start = { x: sourceRect.left - containerRect.left, y: sourceCenter.y };
        end = { x: targetRect.left - containerRect.left, y: targetCenter.y };
        break;
      case 'finish-to-finish':
        start = { x: sourceRect.right - containerRect.left, y: sourceCenter.y };
        end = { x: targetRect.right - containerRect.left, y: targetCenter.y };
        break;
      case 'start-to-finish':
        start = { x: sourceRect.left - containerRect.left, y: sourceCenter.y };
        end = { x: targetRect.right - containerRect.left, y: targetCenter.y };
        break;
      default:
        start = { x: sourceRect.right - containerRect.left, y: sourceCenter.y };
        end = { x: targetRect.left - containerRect.left, y: targetCenter.y };
    }

    // Calculate control points for curved path
    const distance = Math.abs(end.x - start.x);
    const controlDistance = Math.max(distance * 0.3, 50);

    const control1: LinkPoint = {
      x: start.x + controlDistance,
      y: start.y
    };

    const control2: LinkPoint = {
      x: end.x - controlDistance,
      y: end.y
    };

    return { start, end, control1, control2 };
  }

  // Generate SVG path string
  generateSVGPath(path: LinkPath): string {
    return `M ${path.start.x} ${path.start.y} C ${path.control1.x} ${path.control1.y}, ${path.control2.x} ${path.control2.y}, ${path.end.x} ${path.end.y}`;
  }

  // Generate arrow marker
  generateArrowMarker(): string {
    return `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
        </marker>
      </defs>
    `;
  }

  // Get link type abbreviation
  getLinkTypeAbbreviation(linkType: LinkType): string {
    switch (linkType) {
      case 'finish-to-start': return 'FS';
      case 'start-to-start': return 'SS';
      case 'finish-to-finish': return 'FF';
      case 'start-to-finish': return 'SF';
      default: return 'FS';
    }
  }

  // Get link type description
  getLinkTypeDescription(linkType: LinkType): string {
    switch (linkType) {
      case 'finish-to-start': return 'Finish to Start';
      case 'start-to-start': return 'Start to Start';
      case 'finish-to-finish': return 'Finish to Finish';
      case 'start-to-finish': return 'Start to Finish';
      default: return 'Finish to Start';
    }
  }

  // Get demo task links
  private getDemoTaskLinks(projectId: string): TaskLink[] {
    return [
      {
        id: 'link-1',
        project_id: projectId,
        source_task_id: 'task-1',
        target_task_id: 'task-2',
        link_type: 'finish-to-start',
        lag_days: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'link-2',
        project_id: projectId,
        source_task_id: 'task-2',
        target_task_id: 'task-3',
        link_type: 'finish-to-start',
        lag_days: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'link-3',
        project_id: projectId,
        source_task_id: 'task-1',
        target_task_id: 'task-4',
        link_type: 'start-to-start',
        lag_days: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'link-4',
        project_id: projectId,
        source_task_id: 'task-3',
        target_task_id: 'task-5',
        link_type: 'finish-to-finish',
        lag_days: -1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}

export const taskLinkingService = new TaskLinkingService(); 