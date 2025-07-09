import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Clock } from 'lucide-react';
import { demoDataService } from '../../services/demoData';

interface ProjectDisplay {
  id: number;
  name: string;
  client: string;
  progress: number;
  status: string;
  statusColor: string;
  deadline: string;
  budget: string;
  manager?: string;
}

interface ProjectsOverviewProps {
  onNavigateToModule?: (module: string) => void;
}

const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({
  onNavigateToModule,
}) => {
  const [projects, setProjects] = useState<ProjectDisplay[]>([]);

  const loadProjects = useCallback(async () => {
    try {
      const allProjects = await demoDataService.getProjects();
      const activeProjects = allProjects
        .filter(project => project.status !== 'Completed')
        .slice(0, 4) // Show only first 4 active projects
        .map(project => ({
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
      onNavigateToModule('projects');
      // In a real app, you might want to pass the project ID to open it directly
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
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Active Projects</h3>
        <button
          onClick={handleViewAll}
          className='text-archer-green hover:text-archer-neon text-sm font-medium'
        >
          View All
        </button>
      </div>

      <div className='flex-1 space-y-3 overflow-y-auto'>
        {projects.length > 0 ? (
          projects.map(project => (
            <div
              key={project.id}
              className='border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-200 cursor-pointer'
              onClick={() => handleProjectClick(project)}
            >
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-archer-grey rounded-lg flex items-center justify-center flex-shrink-0'>
                    <Building2 className='h-4 w-4 text-archer-neon' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-semibold text-gray-900 truncate'>
                      {project.name}
                    </h4>
                    <p className='text-xs text-gray-500 truncate'>
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
                <div className='flex items-center justify-between text-xs text-gray-600 mb-1'>
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='h-2 rounded-full bg-archer-neon'
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className='flex items-center justify-between text-xs text-gray-500'>
                <div className='flex items-center space-x-1'>
                  <Clock className='h-3 w-3 flex-shrink-0' />
                  <span className='truncate'>
                    {formatDate(project.deadline)}
                  </span>
                </div>
                <span className='font-medium flex-shrink-0 ml-2'>
                  {project.budget}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <Building2 className='h-12 w-12 mx-auto mb-4 text-gray-300' />
            <p>No active projects found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsOverview;
