import {
  Building2,
  Filter,
  Grid3X3,
  Kanban,
  List,
  Plus,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrgStore } from '../../app/store/auth/org.store';
import { Page } from '../../components/layout/Page';
import { Button } from '../../components/ui';
import { useCan } from '../../lib/permissions/hooks';
import type { Project, ProjectFormData } from '../../lib/types/projects';
import { ProjectForm } from './ProjectForm';
import { ProjectsFilters } from './ProjectsFilters';
import { useProjectsStore, type ViewMode } from './store';
import { ProjectsGrid } from './views/ProjectsGrid';
import { ProjectsKanban } from './views/ProjectsKanban';
import { ProjectsList } from './views/ProjectsList';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { currentOrgId } = useOrgStore();
  const canView = useCan('view', 'projects');
  const canCreate = useCan('create', 'projects');

  const {
    isLoading,
    error,
    viewMode,
    filters,
    loadProjects,
    setViewMode,
    setFilters,
    clearError,
    getFilteredProjects,
  } = useProjectsStore();

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load projects on mount and when org changes
  useEffect(() => {
    if (currentOrgId && canView) {
      loadProjects(currentOrgId);
    }
  }, [currentOrgId, canView, loadProjects]);

  // Update search filter when search query changes
  const updateSearchFilter = useCallback(() => {
    setFilters(prevFilters => ({ ...prevFilters, search: searchQuery }));
  }, [searchQuery, setFilters]);

  useEffect(() => {
    updateSearchFilter();
  }, [updateSearchFilter]);

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleProjectFormSubmit = async (projectData: ProjectFormData) => {
    if (!currentOrgId) return;

    try {
      if (editingProject) {
        await useProjectsStore
          .getState()
          .updateProject(editingProject.id, projectData, currentOrgId);
      } else {
        await useProjectsStore
          .getState()
          .createProject(projectData, currentOrgId);
      }
      setShowProjectForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const filteredProjects = getFilteredProjects();

  const viewModeButtons = [
    { mode: 'list' as ViewMode, icon: List, label: 'List' },
    { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
    { mode: 'kanban' as ViewMode, icon: Kanban, label: 'Kanban' },
  ];

  if (!canView) {
    return (
      <Page title='Projects'>
        <div className='flex items-center justify-center h-64'>
          <p className='text-muted-foreground'>
            You don't have permission to view projects.
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page title='Projects'>
      <div className='space-y-6'>
        {/* Header with actions */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='flex items-center gap-4'>
            <h1 className='text-2xl font-semibold'>Projects</h1>
            <span className='text-sm text-muted-foreground'>
              {filteredProjects.length} project
              {filteredProjects.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            {canCreate && (
              <Button
                onClick={handleCreateProject}
                className='flex items-center gap-2'
              >
                <Plus className='h-4 w-4' />
                New Project
              </Button>
            )}
          </div>
        </div>

        {/* Search and filters */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search projects...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-10 pr-4 py-2 w-full border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
            />
          </div>

          <Button
            variant='outline'
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-2'
          >
            <Filter className='h-4 w-4' />
            Filters
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <ProjectsFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* View mode toggle */}
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>View:</span>
          <div className='flex border border-input rounded-md'>
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  viewMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                } ${mode === 'list' ? 'rounded-l-md' : mode === 'kanban' ? 'rounded-r-md' : ''}`}
              >
                <Icon className='h-4 w-4' />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className='bg-destructive/10 border border-destructive/20 rounded-md p-4'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-destructive'>{error}</p>
              <Button variant='ghost' size='sm' onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
              <p className='text-muted-foreground'>Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className='text-center py-12'>
            <Building2 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No projects found</h3>
            <p className='text-muted-foreground mb-4'>
              {searchQuery || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating your first project.'}
            </p>
            {canCreate && (
              <Button
                onClick={handleCreateProject}
                className='flex items-center gap-2'
              >
                <Plus className='h-4 w-4' />
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            {viewMode === 'list' && (
              <ProjectsList
                projects={filteredProjects}
                onEdit={handleEditProject}
                onView={handleViewProject}
                canEdit={canCreate}
              />
            )}
            {viewMode === 'grid' && (
              <ProjectsGrid
                projects={filteredProjects}
                onEdit={handleEditProject}
                onView={handleViewProject}
                canEdit={canCreate}
              />
            )}
            {viewMode === 'kanban' && (
              <ProjectsKanban
                projects={filteredProjects}
                onEdit={handleEditProject}
                onView={handleViewProject}
                canEdit={canCreate}
              />
            )}
          </div>
        )}

        {/* Project Form Modal */}
        {showProjectForm && (
          <ProjectForm
            project={editingProject}
            onSubmit={handleProjectFormSubmit}
            onClose={() => {
              setShowProjectForm(false);
              setEditingProject(null);
            }}
          />
        )}
      </div>
    </Page>
  );
}

export default ProjectsPage;
