import { vi } from 'vitest';
import { ProjectsDAL } from '../projects';
import { supabase } from '../../../services/supabase';

// Mock Supabase
vi.mock('../../../services/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  TABLES: {
    PROJECTS: 'projects',
  },
}));

const mockSupabase = supabase as Record<string, unknown>;

describe('ProjectsDAL', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listProjects', () => {
    it('should return projects for a given orgId', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Test Project',
          description: 'Test Description',
          status: 'active',
          org_id: 'org-1',
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as Record<string, unknown>);
      mockQuery.order.mockResolvedValue({ data: mockProjects, error: null });

      const result = await ProjectsDAL.listProjects('org-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('org_id', 'org-1');
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(result).toEqual(mockProjects);
    });

    it('should throw error when Supabase returns error', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as Record<string, unknown>);
      mockQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(ProjectsDAL.listProjects('org-1')).rejects.toThrow(
        'Failed to fetch projects: Database error'
      );
    });

    it('should return empty array when no data', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as Record<string, unknown>);
      mockQuery.order.mockResolvedValue({ data: null, error: null });

      const result = await ProjectsDAL.listProjects('org-1');

      expect(result).toEqual([]);
    });
  });

  describe('getProject', () => {
    it('should return a single project', async () => {
      const mockProject = {
        id: '1',
        name: 'Test Project',
        description: 'Test Description',
        status: 'active',
        org_id: 'org-1',
        created_at: '2023-01-01T00:00:00Z',
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as Record<string, unknown>);
      mockQuery.single.mockResolvedValue({ data: mockProject, error: null });

      const result = await ProjectsDAL.getProject('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(mockQuery.single).toHaveBeenCalled();
      expect(result).toEqual(mockProject);
    });

    it('should throw error when project not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as Record<string, unknown>);
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Project not found' },
      });

      await expect(ProjectsDAL.getProject('1')).rejects.toThrow(
        'Failed to fetch project: Project not found'
      );
    });
  });

  describe('upsertProject', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'New Project',
        description: 'New Description',
        status: 'active' as const,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        budget: 100000,
        clientId: 'client-1',
        orgId: 'org-1',
        tags: ['tag1'],
        custom: {},
      };

      const mockProject = {
        id: '2',
        ...projectData,
        created_at: '2023-01-01T00:00:00Z',
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as Record<string, unknown>);
      mockQuery.single.mockResolvedValue({ data: mockProject, error: null });

      const result = await ProjectsDAL.upsertProject(projectData);

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(mockQuery.insert).toHaveBeenCalled();
      expect(result).toEqual(mockProject);
    });

    it('should update an existing project', async () => {
      const projectData = {
        id: '1',
        name: 'Updated Project',
        description: 'Updated Description',
        status: 'active' as const,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        budget: 100000,
        clientId: 'client-1',
        orgId: 'org-1',
        tags: ['tag1'],
        custom: {},
      };

      const mockProject = {
        ...projectData,
        created_at: '2023-01-01T00:00:00Z',
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as Record<string, unknown>);
      mockQuery.single.mockResolvedValue({ data: mockProject, error: null });

      const result = await ProjectsDAL.upsertProject(projectData);

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(mockQuery.update).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockProject);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as Record<string, unknown>);
      mockQuery.eq.mockResolvedValue({ error: null });

      await ProjectsDAL.deleteProject('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should throw error when deletion fails', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockSupabase.from.mockReturnValue(mockQuery as Record<string, unknown>);
      mockQuery.eq.mockResolvedValue({
        error: { message: 'Deletion failed' },
      });

      await expect(ProjectsDAL.deleteProject('1')).rejects.toThrow(
        'Failed to delete project: Deletion failed'
      );
    });
  });
});
