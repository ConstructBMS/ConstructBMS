import { Calendar, DollarSign, Edit, Eye, Trash2, User } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui';
import type { Project } from '../../../lib/types/projects';

interface ProjectsGridProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onView: (project: Project) => void;
  canEdit: boolean;
}

export function ProjectsGrid({
  projects,
  onEdit,
  onView,
  canEdit,
}: ProjectsGridProps) {
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {projects.map(project => (
        <Card key={project.id} className='hover:shadow-md transition-shadow'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1 min-w-0'>
                <CardTitle className='text-lg truncate'>
                  {project.name}
                </CardTitle>
                {project.description && (
                  <CardDescription className='mt-1 line-clamp-2'>
                    {project.description}
                  </CardDescription>
                )}
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}
              >
                {project.status.replace('-', ' ')}
              </span>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Project Details */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <User className='h-4 w-4' />
                <span>
                  {project.clientId ? 'Client assigned' : 'No client'}
                </span>
              </div>

              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Calendar className='h-4 w-4' />
                <span>Start: {formatDate(project.startDate)}</span>
              </div>

              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Calendar className='h-4 w-4' />
                <span>End: {formatDate(project.endDate)}</span>
              </div>

              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <DollarSign className='h-4 w-4' />
                <span>{formatCurrency(project.budget)}</span>
              </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className='flex flex-wrap gap-1'>
                {project.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800'
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className='text-xs text-muted-foreground'>
                    +{project.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className='flex items-center justify-between pt-2 border-t'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onView(project)}
                className='flex items-center gap-2'
              >
                <Eye className='h-4 w-4' />
                View
              </Button>

              {canEdit && (
                <div className='flex items-center gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onEdit(project)}
                    className='h-8 w-8 p-0'
                  >
                    <Edit className='h-4 w-4' />
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
                    className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
