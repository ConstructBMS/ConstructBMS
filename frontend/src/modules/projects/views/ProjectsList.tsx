import { Calendar, DollarSign, Edit, Eye, Trash2, User } from 'lucide-react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui';
import type { Project } from '../../../lib/types/projects';

interface ProjectsListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onView: (project: Project) => void;
  canEdit: boolean;
}

export function ProjectsList({
  projects,
  onEdit,
  onView,
  canEdit,
}: ProjectsListProps) {
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

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map(project => (
            <TableRow key={project.id}>
              <TableCell className='font-medium'>
                <div>
                  <div className='font-semibold'>{project.name}</div>
                  {project.description && (
                    <div className='text-sm text-muted-foreground truncate max-w-xs'>
                      {project.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                >
                  {project.status.replace('-', ' ')}
                </span>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>
                    {project.clientId ? 'Client' : 'No client'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>
                    {formatDate(project.startDate)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>{formatDate(project.endDate)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>
                    {formatCurrency(project.budget)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className='flex flex-wrap gap-1'>
                  {project.tags?.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800'
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags && project.tags.length > 2 && (
                    <span className='text-xs text-muted-foreground'>
                      +{project.tags.length - 2} more
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex items-center justify-end gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onView(project)}
                    className='h-8 w-8 p-0'
                  >
                    <Eye className='h-4 w-4' />
                  </Button>
                  {canEdit && (
                    <>
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
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
