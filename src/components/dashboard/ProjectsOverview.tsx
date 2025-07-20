import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Clock } from 'lucide-react';
import { dataSourceService } from '../../services/dataSourceService';

interface ProjectDisplay {
  budget: string;
  client: string;
  deadline: string;
  id: number;
  manager?: string;
  name: string;
  progress: number;
  status: string;
  statusColor: string;
}

interface ProjectsOverviewProps {
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
}

const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({
  onNavigateToModule,
}) => {
  const [projects, setProjects] = useState<ProjectDisplay[]>([]);

  const loadProjects = useCallback(async () => {
    try {
      const allProjects = await dataSourceService.getProjects();
      const activeProjects = allProjects
        .filter((project: any) => project.status !== 'Completed')
        .slice(0, 4) // Show only first 4 active projects
        .map((project: any) => ({
          id: project.id,
          name: project.name,
          client: project.client,
          progress: project.progress,
          status: project.status,
          statusColor: getStatusColor(project.status),
          deadline: project.endDate,
          budget: `£${(project.budget / 1000).toFixed(0)}K`,
          manager: project.manager,
        }));

      setProjects(activeProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'In Progress':
        return 'green';
      case 'Behind Schedule':
        return 'orange';
      case 'Nearly Complete':
        return 'blue';
      case 'On Hold':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const handleViewAll = () => {
    if (onNavigateToModule) {
      onNavigateToModule('projects');
    } else {
      // Fallback for when navigation is not available
      alert('Navigating to Projects module...');
    }
  };

  const handleProjectClick = (project: ProjectDisplay) => {
    if (onNavigateToModule) {
      onNavigateToModule('projects', { openProject: { id: project.id, name: project.name, client: project.client, progress: project.progress, budget: project.budget, status: project.status } });
    } else {
      alert(`Opening project: ${project.name}`);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 space-y-3 overflow-y-auto'>
        {projects.length > 0 ? (
          projects.map(project => (
            <div
              key={project.id}
              className='border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-shadow duration-200 cursor-pointer'
              onClick={() => handleProjectClick(project)}
            >
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <Building2 className='h-4 w-4 text-blue-600' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-semibold text-gray-900 dark:text-white truncate'>
                      {project.name}
                    </h4>
                    <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                      {project.client}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full bg-${project.statusColor}-100 text-${project.statusColor}-700 flex-shrink-0 ml-2`}
                >
                  {project.status}
                </span>
              </div>
              <div className='mb-2'>
                <div className='flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1'>
                  <span>Progress</span>
                  <span>{Math.round(project.progress * 100) / 100}%</span>
                </div>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                                  <div
                  className='h-2 rounded-full bg-blue-500'
                  style={{ width: `${Math.round(project.progress * 100) / 100}%` }}
                ></div>
                </div>
              </div>
              <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
                <span>Deadline: {formatDate(project.deadline)}</span>
                <span>Budget: {project.budget}</span>
              </div>
            </div>
          ))
        ) : (
          <div className='text-center py-8 text-gray-500'>No active projects</div>
        )}
      </div>
    </div>
  );
};

export default ProjectsOverview;
