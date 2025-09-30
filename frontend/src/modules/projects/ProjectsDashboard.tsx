import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FolderOpen,
  Pause,
  PieChart,
  Play,
  Plus,
  Target,
  Users,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../../components/layout/Page';
import { Button } from '../../components/ui';
import { Badge } from '../../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';

// Mock data for demonstration
const mockProjects = [
  {
    id: '1',
    name: 'Office Building Renovation',
    status: 'in_progress',
    progress: 65,
    budget: 2500000,
    spent: 1625000,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    priority: 'high',
    team: ['John Smith', 'Sarah Johnson', 'Mike Wilson'],
    client: 'ABC Corporation',
    overdue: false,
    riskLevel: 'medium',
  },
  {
    id: '2',
    name: 'Residential Complex Development',
    status: 'planning',
    progress: 25,
    budget: 8500000,
    spent: 2125000,
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    priority: 'medium',
    team: ['Emma Davis', 'Tom Anderson'],
    client: 'XYZ Developers',
    overdue: false,
    riskLevel: 'low',
  },
  {
    id: '3',
    name: 'Shopping Center Expansion',
    status: 'in_progress',
    progress: 40,
    budget: 12000000,
    spent: 4800000,
    startDate: '2024-02-01',
    endDate: '2024-10-15',
    priority: 'high',
    team: ['Lisa Brown', 'David Wilson', 'Anna Taylor'],
    client: 'Retail Group Ltd',
    overdue: true,
    riskLevel: 'high',
  },
  {
    id: '4',
    name: 'Hospital Renovation',
    status: 'completed',
    progress: 100,
    budget: 5000000,
    spent: 4950000,
    startDate: '2023-09-01',
    endDate: '2024-01-31',
    priority: 'critical',
    team: ['Robert Johnson', 'Maria Garcia'],
    client: 'City Health Authority',
    overdue: false,
    riskLevel: 'low',
  },
  {
    id: '5',
    name: 'School Construction',
    status: 'on_hold',
    progress: 15,
    budget: 3000000,
    spent: 450000,
    startDate: '2024-04-01',
    endDate: '2024-08-30',
    priority: 'medium',
    team: ['James Wilson', 'Sarah Davis'],
    client: 'Education Board',
    overdue: false,
    riskLevel: 'medium',
  },
];

const mockMetrics = {
  totalProjects: 24,
  activeProjects: 18,
  completedProjects: 5,
  onHoldProjects: 1,
  totalBudget: 32000000,
  totalSpent: 18950000,
  averageProgress: 68,
  overdueProjects: 3,
  riskProjects: 7,
  teamMembers: 45,
  clients: 12,
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'project_created',
    message: 'New project "Office Building Renovation" created',
    timestamp: '2 hours ago',
    user: 'John Smith',
  },
  {
    id: '2',
    type: 'milestone_completed',
    message:
      'Milestone "Foundation Complete" achieved for Shopping Center Expansion',
    timestamp: '4 hours ago',
    user: 'Lisa Brown',
  },
  {
    id: '3',
    type: 'budget_updated',
    message: 'Budget updated for Residential Complex Development (+£500,000)',
    timestamp: '1 day ago',
    user: 'Emma Davis',
  },
  {
    id: '4',
    type: 'risk_identified',
    message: 'High risk identified for Shopping Center Expansion',
    timestamp: '2 days ago',
    user: 'David Wilson',
  },
  {
    id: '5',
    type: 'project_completed',
    message: 'Hospital Renovation project completed successfully',
    timestamp: '3 days ago',
    user: 'Robert Johnson',
  },
];

const mockUpcomingMilestones = [
  {
    id: '1',
    project: 'Office Building Renovation',
    milestone: 'Interior Finishes Complete',
    dueDate: '2024-05-15',
    status: 'on_track',
  },
  {
    id: '2',
    project: 'Shopping Center Expansion',
    milestone: 'Structural Work Complete',
    dueDate: '2024-05-20',
    status: 'at_risk',
  },
  {
    id: '3',
    project: 'Residential Complex Development',
    milestone: 'Planning Approval',
    dueDate: '2024-05-25',
    status: 'on_track',
  },
];

export function ProjectsDashboard() {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className='h-4 w-4 text-green-500' />;
      case 'in_progress':
        return <Play className='h-4 w-4 text-blue-500' />;
      case 'on_hold':
        return <Pause className='h-4 w-4 text-yellow-500' />;
      case 'planning':
        return <Clock className='h-4 w-4 text-gray-500' />;
      default:
        return <AlertCircle className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'planning':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateBudgetUtilization = () => {
    return Math.round((mockMetrics.totalSpent / mockMetrics.totalBudget) * 100);
  };

  const getHighRiskProjects = () => {
    return mockProjects.filter(project => project.riskLevel === 'high');
  };

  return (
    <Page title='Projects Dashboard'>
      <div className='space-y-6'>
        {/* Header Actions */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Projects Dashboard
            </h1>
            <p className='text-muted-foreground'>
              Overview of all projects, metrics, and key performance indicators
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              onClick={() => navigate('/projects/management')}
            >
              <FolderOpen className='h-4 w-4 mr-2' />
              Manage Projects
            </Button>
            <Button
              onClick={() => navigate('/projects/management?action=create')}
            >
              <Plus className='h-4 w-4 mr-2' />
              New Project
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Projects
              </CardTitle>
              <FolderOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {mockMetrics.totalProjects}
              </div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-green-600'>+2</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Projects
              </CardTitle>
              <Activity className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {mockMetrics.activeProjects}
              </div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-blue-600'>+1</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Budget
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatCurrency(mockMetrics.totalBudget)}
              </div>
              <p className='text-xs text-muted-foreground'>
                <span className='text-green-600'>+5.2%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Budget Utilized
              </CardTitle>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {calculateBudgetUtilization()}%
              </div>
              <Progress value={calculateBudgetUtilization()} className='mt-2' />
            </CardContent>
          </Card>
        </div>

        {/* Project Status Overview */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <PieChart className='h-5 w-5' />
                Project Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4 text-green-500' />
                    <span className='text-sm'>Completed</span>
                  </div>
                  <span className='font-semibold'>
                    {mockMetrics.completedProjects}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Play className='h-4 w-4 text-blue-500' />
                    <span className='text-sm'>In Progress</span>
                  </div>
                  <span className='font-semibold'>
                    {mockMetrics.activeProjects}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Pause className='h-4 w-4 text-yellow-500' />
                    <span className='text-sm'>On Hold</span>
                  </div>
                  <span className='font-semibold'>
                    {mockMetrics.onHoldProjects}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-gray-500' />
                    <span className='text-sm'>Planning</span>
                  </div>
                  <span className='font-semibold'>4</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5' />
                Risk & Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <AlertTriangle className='h-4 w-4 text-red-500' />
                    <span className='text-sm'>High Risk Projects</span>
                  </div>
                  <span className='font-semibold text-red-600'>
                    {getHighRiskProjects().length}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <XCircle className='h-4 w-4 text-orange-500' />
                    <span className='text-sm'>Overdue Projects</span>
                  </div>
                  <span className='font-semibold text-orange-600'>
                    {mockMetrics.overdueProjects}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Target className='h-4 w-4 text-blue-500' />
                    <span className='text-sm'>Average Progress</span>
                  </div>
                  <span className='font-semibold'>
                    {mockMetrics.averageProgress}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                Team Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Total Team Members</span>
                  <span className='font-semibold'>
                    {mockMetrics.teamMembers}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Active Clients</span>
                  <span className='font-semibold'>{mockMetrics.clients}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Projects per Team Member</span>
                  <span className='font-semibold'>
                    {Math.round(
                      mockMetrics.totalProjects / mockMetrics.teamMembers
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              Recent Projects
            </CardTitle>
            <CardDescription>
              Latest project updates and current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {mockProjects.slice(0, 5).map(project => (
                <div
                  key={project.id}
                  className='flex items-center justify-between p-4 border rounded-lg'
                >
                  <div className='flex items-center gap-4'>
                    {getStatusIcon(project.status)}
                    <div>
                      <h3 className='font-semibold'>{project.name}</h3>
                      <p className='text-sm text-muted-foreground'>
                        {project.client}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='text-right'>
                      <div className='text-sm font-medium'>
                        {project.progress}%
                      </div>
                      <Progress value={project.progress} className='w-20' />
                    </div>
                    <div className='text-right'>
                      <div className='text-sm font-medium'>
                        {formatCurrency(project.budget)}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {formatCurrency(project.spent)} spent
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                      {project.overdue && (
                        <Badge variant='destructive'>Overdue</Badge>
                      )}
                    </div>
                    <div
                      className={`text-sm ${getRiskColor(project.riskLevel)}`}
                    >
                      Risk: {project.riskLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Upcoming Milestones
            </CardTitle>
            <CardDescription>
              Key project milestones and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {mockUpcomingMilestones.map(milestone => (
                <div
                  key={milestone.id}
                  className='flex items-center justify-between p-4 border rounded-lg'
                >
                  <div>
                    <h3 className='font-semibold'>{milestone.milestone}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {milestone.project}
                    </p>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='text-right'>
                      <div className='text-sm font-medium'>
                        {milestone.dueDate}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Due Date
                      </div>
                    </div>
                    <Badge
                      className={
                        milestone.status === 'on_track'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }
                    >
                      {milestone.status === 'on_track' ? 'On Track' : 'At Risk'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest project updates and team activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {mockRecentActivity.map(activity => (
                <div
                  key={activity.id}
                  className='flex items-center gap-4 p-4 border rounded-lg'
                >
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <div className='flex-1'>
                    <p className='text-sm'>{activity.message}</p>
                    <p className='text-xs text-muted-foreground'>
                      {activity.user} • {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
