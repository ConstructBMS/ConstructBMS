import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '../../../lib/types/projects';
import { useProjectsStore } from '../store';

// Mock the DAL
vi.mock('../../../lib/data/projects', () => ({
  ProjectsDAL: {
    listProjects: vi.fn(),
    getProject: vi.fn(),
    upsertProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

describe('Projects Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useProjectsStore.setState({
      projects: [],
      isLoading: false,
      error: null,
      viewMode: 'list',
      filters: {},
      selectedProject: null,
    });
  });

  it('should initialize with default state', () => {
    const state = useProjectsStore.getState();

    expect(state.projects).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.viewMode).toBe('list');
    expect(state.filters).toEqual({});
    expect(state.selectedProject).toBeNull();
  });

  it('should set view mode', () => {
    const { setViewMode } = useProjectsStore.getState();

    setViewMode('grid');
    expect(useProjectsStore.getState().viewMode).toBe('grid');

    setViewMode('kanban');
    expect(useProjectsStore.getState().viewMode).toBe('kanban');
  });

  it('should set filters', () => {
    const { setFilters } = useProjectsStore.getState();

    const filters = { search: 'test', status: ['in-progress'] };
    setFilters(filters);

    expect(useProjectsStore.getState().filters).toEqual(filters);
  });

  it('should select project', () => {
    const { selectProject } = useProjectsStore.getState();

    const project: Project = {
      id: '1',
      orgId: 'org1',
      name: 'Test Project',
      status: 'planned',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };

    selectProject(project);
    expect(useProjectsStore.getState().selectedProject).toEqual(project);

    selectProject(null);
    expect(useProjectsStore.getState().selectedProject).toBeNull();
  });

  it('should clear error', () => {
    const { clearError } = useProjectsStore.getState();

    // Set an error first
    useProjectsStore.setState({ error: 'Test error' });
    expect(useProjectsStore.getState().error).toBe('Test error');

    clearError();
    expect(useProjectsStore.getState().error).toBeNull();
  });

  it('should filter projects correctly', () => {
    const { setFilters, getFilteredProjects } = useProjectsStore.getState();

    const projects: Project[] = [
      {
        id: '1',
        orgId: 'org1',
        name: 'Test Project 1',
        status: 'planned',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      },
      {
        id: '2',
        orgId: 'org1',
        name: 'Test Project 2',
        status: 'in-progress',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      },
    ];

    useProjectsStore.setState({ projects });

    // Test search filter
    setFilters({ search: 'Project 1' });
    expect(getFilteredProjects()).toHaveLength(1);
    expect(getFilteredProjects()[0].name).toBe('Test Project 1');

    // Test status filter
    setFilters({ status: ['in-progress'] });
    expect(getFilteredProjects()).toHaveLength(1);
    expect(getFilteredProjects()[0].status).toBe('in-progress');

    // Test combined filters
    setFilters({ search: 'Test', status: ['planned'] });
    expect(getFilteredProjects()).toHaveLength(1);
    expect(getFilteredProjects()[0].name).toBe('Test Project 1');
  });

  it('should handle projects with tags', () => {
    const { setFilters, getFilteredProjects } = useProjectsStore.getState();

    const projects: Project[] = [
      {
        id: '1',
        orgId: 'org1',
        name: 'Project with tags',
        status: 'planned',
        tags: ['urgent', 'client-work'],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      },
      {
        id: '2',
        orgId: 'org1',
        name: 'Project without tags',
        status: 'planned',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      },
    ];

    useProjectsStore.setState({ projects });

    // Test tag filter
    setFilters({ tags: ['urgent'] });
    expect(getFilteredProjects()).toHaveLength(1);
    expect(getFilteredProjects()[0].name).toBe('Project with tags');

    // Test search in tags
    setFilters({ search: 'client' });
    expect(getFilteredProjects()).toHaveLength(1);
    expect(getFilteredProjects()[0].name).toBe('Project with tags');
  });
});
