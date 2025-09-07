import { Calendar, DollarSign, Edit, Eye, Trash2, User } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Card, CardContent } from '../../../components/ui';
import type { Project, ProjectStatus } from '../../../lib/types/projects';

interface ProjectsKanbanProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onView: (project: Project) => void;
  canEdit: boolean;
}

const statusColumns: { status: ProjectStatus; label: string; color: string }[] =
  [
    {
      status: 'planned',
      label: 'Planned',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      status: 'in-progress',
      label: 'In Progress',
      color: 'bg-green-50 border-green-200',
    },
    {
      status: 'on-hold',
      label: 'On Hold',
      color: 'bg-yellow-50 border-yellow-200',
    },
    {
      status: 'completed',
      label: 'Completed',
      color: 'bg-gray-50 border-gray-200',
    },
    {
      status: 'cancelled',
      label: 'Cancelled',
      color: 'bg-red-50 border-red-200',
    },
  ];

export function ProjectsKanban({
  projects,
  onEdit,
  onView,
  canEdit,
}: ProjectsKanbanProps) {
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: ProjectStatus) => {
    e.preventDefault();
    if (draggedProject && draggedProject.status !== newStatus) {
      // Update project status
      const updatedProject = { ...draggedProject, status: newStatus };
      // Here you would call the update function from the store
      console.log('Updating project status:', updatedProject);
    }
    setDraggedProject(null);
  };

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter(project => project.status === status);
  };

  return (
    <div className='flex gap-6 overflow-x-auto pb-4'>
      {statusColumns.map(({ status, label, color }) => {
        const statusProjects = getProjectsByStatus(status);

        return (
          <div
            key={status}
            className={`flex-1 min-w-80 rounded-lg border-2 border-dashed ${color} p-4`}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, status)}
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-semibold text-lg'>{label}</h3>
              <span className='bg-white px-2 py-1 rounded-full text-sm font-medium'>
                {statusProjects.length}
              </span>
            </div>

            <div className='space-y-3'>
              {statusProjects.map(project => (
                <Card
                  key={project.id}
                  className='cursor-move hover:shadow-md transition-shadow bg-white'
                  draggable={canEdit}
                  onDragStart={e => handleDragStart(e, project)}
                >
                  <CardContent className='p-4'>
                    <div className='space-y-3'>
                      {/* Project Header */}
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 min-w-0'>
                          <h4 className='font-semibold text-sm truncate'>
                            {project.name}
                          </h4>
                          {project.description && (
                            <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>
                              {project.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                        >
                          {project.status.replace('-', ' ')}
                        </span>
                      </div>

                      {/* Project Details */}
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <User className='h-3 w-3' />
                          <span>
                            {project.clientId ? 'Client' : 'No client'}
                          </span>
                        </div>

                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <Calendar className='h-3 w-3' />
                          <span>
                            {formatDate(project.startDate)} -{' '}
                            {formatDate(project.endDate)}
                          </span>
                        </div>

                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <DollarSign className='h-3 w-3' />
                          <span>{formatCurrency(project.budget)}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className='flex flex-wrap gap-1'>
                          {project.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className='inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-800'
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 2 && (
                            <span className='text-xs text-muted-foreground'>
                              +{project.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className='flex items-center justify-between pt-2 border-t'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onView(project)}
                          className='h-6 px-2 text-xs'
                        >
                          <Eye className='h-3 w-3 mr-1' />
                          View
                        </Button>

                        {canEdit && (
                          <div className='flex items-center gap-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => onEdit(project)}
                              className='h-6 w-6 p-0'
                            >
                              <Edit className='h-3 w-3' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                if (
                                  window.confirm(
                                    'Are you sure you want to delete this project?'
                                  )
                                ) {
                                  // Handle delete
                                }
                              }}
                              className='h-6 w-6 p-0 text-destructive hover:text-destructive'
                            >
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {statusProjects.length === 0 && (
                <div className='text-center py-8 text-muted-foreground text-sm'>
                  No projects in {label.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
