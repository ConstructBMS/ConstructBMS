import { ArrowLeft, Calendar, DollarSign, Edit, Tag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Page } from '../../components/layout/Page';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui';
import { useCan } from '../../lib/permissions/hooks';
import type { Project } from '../../lib/types/projects';
import { useProjectsStore } from './store';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canEdit = useCan({ resource: 'projects', action: 'update' });

  const { projects, selectProject } = useProjectsStore();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) {
      const foundProject = projects.find(p => p.id === id);
      if (foundProject) {
        setProject(foundProject);
        selectProject(foundProject);
      } else {
        // Project not found, redirect to projects list
        navigate('/projects');
      }
    }
  }, [id, projects, selectProject, navigate]);

  if (!project) {
    return (
      <Page title='Project Details'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading project...</p>
          </div>
        </div>
      </Page>
    );
  }

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
    <Page title={project.name}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate('/projects')}
              className='flex items-center gap-2'
            >
              <ArrowLeft className='h-4 w-4' />
              Back to Projects
            </Button>
            <div>
              <h1 className='text-2xl font-semibold'>{project.name}</h1>
              <div className='flex items-center gap-2 mt-1'>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}
                >
                  {project.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {canEdit && (
            <Button className='flex items-center gap-2'>
              <Edit className='h-4 w-4' />
              Edit Project
            </Button>
          )}
        </div>

        {/* Project Overview */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div>
                  <div className='text-sm font-medium'>Start Date</div>
                  <div className='text-sm text-muted-foreground'>
                    {formatDate(project.startDate)}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div>
                  <div className='text-sm font-medium'>End Date</div>
                  <div className='text-sm text-muted-foreground'>
                    {formatDate(project.endDate)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-2'>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
                <div>
                  <div className='text-2xl font-semibold'>
                    {formatCurrency(project.budget)}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total Budget
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-2'>
                <User className='h-4 w-4 text-muted-foreground' />
                <div>
                  <div className='text-sm font-medium'>
                    {project.clientId ? 'Client Assigned' : 'No Client'}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {project.clientId
                      ? 'View client details'
                      : 'Assign a client'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='tasks'>Tasks</TabsTrigger>
            <TabsTrigger value='files'>Files</TabsTrigger>
            <TabsTrigger value='activity'>Activity</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description ? (
                    <p className='text-muted-foreground'>
                      {project.description}
                    </p>
                  ) : (
                    <p className='text-muted-foreground italic'>
                      No description provided
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Tag className='h-4 w-4' />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.tags && project.tags.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                      {project.tags.map(tag => (
                        <span
                          key={tag}
                          className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground italic'>
                      No tags assigned
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <div className='text-sm font-medium text-muted-foreground'>
                      Project ID
                    </div>
                    <div className='text-sm'>{project.id}</div>
                  </div>
                  <div>
                    <div className='text-sm font-medium text-muted-foreground'>
                      Created
                    </div>
                    <div className='text-sm'>
                      {formatDate(project.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm font-medium text-muted-foreground'>
                      Last Updated
                    </div>
                    <div className='text-sm'>
                      {formatDate(project.updatedAt)}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm font-medium text-muted-foreground'>
                      Organization
                    </div>
                    <div className='text-sm'>{project.orgId}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='tasks'>
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  Task management will be integrated with the Programme Manager
                  module.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center py-8 text-muted-foreground'>
                  <p>Task management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='files'>
            <Card>
              <CardHeader>
                <CardTitle>Files</CardTitle>
                <CardDescription>
                  File management will be integrated with the Documents module.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center py-8 text-muted-foreground'>
                  <p>File management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='activity'>
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  Track all changes and activities related to this project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center py-8 text-muted-foreground'>
                  <p>Activity tracking coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  );
}

export default ProjectDetailPage;
