import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Users,
  PoundSterling,
  Cross as Progress,
  Plus,
  Search,
  Edit2,
  Trash2,
  BarChart3,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Mail,
  X,
  FileText,
} from 'lucide-react';
import { demoDataService, Project, Client } from '../../services/demoData';
import { emailIntegrationService } from '../../services/emailIntegration';
import {
  emailIntelligenceService,
  EmailMessage,
} from '../../services/emailIntelligence';
import ProjectModal from './ProjectModal';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>(
    'grid'
  );
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [projectEmails, setProjectEmails] = useState<any[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProjectForModal, setSelectedProjectForModal] =
    useState<Project | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const projectsData = await demoDataService.getProjects();
        const clientsData = await demoDataService.getClients();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
      } catch (error) {
        console.error('Failed to load demo data:', error);
        setProjects([]);
        setClients([]);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('projectsStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    if (selectedProjectForModal) {
      // Get all email integrations for this project
      const integrations = emailIntegrationService
        .getIntegrations()
        .filter(i => i.projectId === `proj_${selectedProjectForModal.id}`);
      // Get all emails for these integrations
      const emailIds = integrations.map(i => i.emailId);
      const allEmails = emailIntelligenceService.getEmails();
      const relatedEmails = allEmails.filter(e => emailIds.includes(e.id));
      setProjectEmails(relatedEmails);
    } else {
      setProjectEmails([]);
    }
  }, [selectedProjectForModal]);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('projectsStatsExpanded', JSON.stringify(newState));
  };

  const filteredProjects = (projects || []).filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      statusFilter === 'all' ||
      project.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesPriority =
      priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesFilter && matchesPriority;
  });

  const getProjectStats = () => {
    const projectsArray = Array.isArray(projects) ? projects : [];
    const totalProjects = projectsArray.length;
    const activeProjects = projectsArray.filter(
      p => p.status === 'In Progress'
    ).length;
    const completedProjects = projectsArray.filter(
      p => p.status === 'Completed'
    ).length;
    const totalBudget = projectsArray.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projectsArray.reduce((sum, p) => sum + p.spent, 0);
    const avgProgress =
      projectsArray.length > 0
        ? Math.round(
            projectsArray.reduce((sum, p) => sum + p.progress, 0) /
              projectsArray.length
          )
        : 0;
    const overdueProjects = projectsArray.filter(p => {
      const endDate = new Date(p.endDate);
      const today = new Date();
      return endDate < today && p.status !== 'Completed';
    }).length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      totalSpent,
      avgProgress,
      overdueProjects,
    };
  };

  const stats = getProjectStats();

  const handleAddProject = (projectData: Partial<Project>) => {
    const selectedClient = (clients || []).find(
      c => c.id === Number(projectData.clientId)
    );
    const newProject: Project = {
      id: Date.now(),
      name: projectData.name || '',
      client: selectedClient?.name || '',
      clientId: Number(projectData.clientId) || 0,
      manager: projectData.manager || '',
      status: 'In Progress',
      progress: 0,
      budget: Number(projectData.budget) || 0,
      spent: 0,
      startDate:
        projectData.startDate || new Date().toISOString().split('T')[0],
      endDate:
        projectData.endDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      team: Number(projectData.team) || 1,
      tasks: 0,
      completedTasks: 0,
      description: projectData.description || '',
      priority: projectData.priority || 'Medium',
      isDemoData: false,
      createdAt: new Date().toISOString(),
      demoId: `project-${Date.now()}`,
    };

    const updatedProjects = [
      ...(Array.isArray(projects) ? projects : []),
      newProject,
    ];
    setProjects(updatedProjects);
    demoDataService.saveProjects(updatedProjects).catch(error => {
      console.error('Failed to save projects:', error);
    });
    setShowAddProject(false);
  };

  const handleUpdateProject = (projectData: Partial<Project>) => {
    if (!editingProject) return;

    const selectedClient = (clients || []).find(
      c => c.id === Number(projectData.clientId)
    );
    const updatedProjects = (Array.isArray(projects) ? projects : []).map(
      project =>
        project.id === editingProject.id
          ? {
              ...project,
              ...projectData,
              client: selectedClient?.name || project.client,
              clientId: Number(projectData.clientId) || project.clientId,
            }
          : project
    );

    setProjects(updatedProjects);
    demoDataService.saveProjects(updatedProjects).catch(error => {
      console.error('Failed to save projects:', error);
    });
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = (Array.isArray(projects) ? projects : []).filter(
        project => project.id !== projectId
      );
      setProjects(updatedProjects);
      demoDataService.saveProjects(updatedProjects).catch(error => {
        console.error('Failed to save projects:', error);
      });
      if (selectedProject === projectId) {
        setSelectedProject(null);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'bg-archer-neon/20 text-archer-neon border border-archer-neon/30';
      case 'behind schedule':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'nearly complete':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'completed':
        return 'bg-archer-neon/20 text-archer-neon border border-archer-neon/30';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'Low':
        return 'bg-archer-neon/20 text-archer-neon border border-archer-neon/30';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const isOverdue = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    return end < today;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const ProjectForm: React.FC<{
    project?: Project;
    onSave: (data: Partial<Project>) => void;
    onCancel: () => void;
  }> = ({ project, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: project?.name || '',
      clientId: project?.clientId || '',
      manager: project?.manager || '',
      description: project?.description || '',
      budget: project?.budget || 0,
      startDate: project?.startDate || new Date().toISOString().split('T')[0],
      endDate:
        project?.endDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      team: project?.team || 1,
      priority: project?.priority || 'Medium',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        clientId: Number(formData.clientId),
      });
    };

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
          <h3 className='text-xl font-semibold text-gray-900 mb-6'>
            {project ? 'Edit Project' : 'Add New Project'}
            {project?.isDemoData && (
              <span className='ml-2 text-xs bg-archer-neon text-black px-2 py-1 rounded'>
                DEMO DATA
              </span>
            )}
          </h3>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Project Name
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                required
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Client
                </label>
                <select
                  value={formData.clientId}
                  onChange={e =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  required
                >
                  <option value=''>Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Project Manager
                </label>
                <input
                  type='text'
                  value={formData.manager}
                  onChange={e =>
                    setFormData({ ...formData, manager: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Budget
                </label>
                <input
                  type='number'
                  value={formData.budget}
                  onChange={e =>
                    setFormData({ ...formData, budget: Number(e.target.value) })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  min='0'
                  step='1000'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Team Size
                </label>
                <input
                  type='number'
                  value={formData.team}
                  onChange={e =>
                    setFormData({ ...formData, team: Number(e.target.value) })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  min='1'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Start Date
                </label>
                <input
                  type='date'
                  value={formData.startDate}
                  onChange={e =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  End Date
                </label>
                <input
                  type='date'
                  value={formData.endDate}
                  onChange={e =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as 'Low' | 'Medium' | 'High',
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                >
                  <option value='Low'>Low</option>
                  <option value='Medium'>Medium</option>
                  <option value='High'>High</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                rows={3}
              />
            </div>

            <div className='flex space-x-3 pt-4'>
              <button
                type='submit'
                className='flex-1 bg-archer-neon text-black py-2 px-4 rounded-lg hover:bg-archer-green transition-colors font-medium'
              >
                {project ? 'Update Project' : 'Add Project'}
              </button>
              <button
                type='button'
                onClick={onCancel}
                className='flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTimelineView = () => (
    <div className='space-y-6'>
      {filteredProjects.map(project => (
        <div
          key={project.id}
          className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'
        >
          <div className='flex items-start justify-between mb-4'>
            <div className='flex items-start space-x-4'>
              <div className='w-12 h-12 bg-archer-grey rounded-lg flex items-center justify-center'>
                <Building2 className='h-6 w-6 text-archer-neon' />
              </div>
              <div>
                <div className='flex items-center space-x-2'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {project.name}
                  </h3>
                  {project.isDemoData && (
                    <span className='text-xs bg-archer-neon text-black px-2 py-1 rounded'>
                      DEMO
                    </span>
                  )}
                </div>
                <p className='text-sm text-gray-600'>{project.client}</p>
                <div className='flex items-center space-x-4 mt-2'>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}
                  >
                    {project.status}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}
                  >
                    {project.priority}
                  </span>
                </div>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setEditingProject(project)}
                className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
              >
                <Edit2 className='h-4 w-4' />
              </button>
              <button
                onClick={() => handleDeleteProject(project.id)}
                className='p-2 text-gray-400 hover:text-red-600 transition-colors'
              >
                <Trash2 className='h-4 w-4' />
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
            <div className='flex items-center space-x-2'>
              <Users className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-600'>{project.manager}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Calendar className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-600'>
                {new Date(project.startDate).toLocaleDateString()} -{' '}
                {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <PoundSterling className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-600'>
                {formatCurrency(project.spent)} /{' '}
                {formatCurrency(project.budget)}
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <Progress className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-600'>
                {project.progress}% complete
              </span>
            </div>
          </div>

          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-archer-neon h-2 rounded-full transition-all duration-300'
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>

          {project.description && (
            <p className='text-sm text-gray-600 mt-4'>{project.description}</p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Project Management
          </h1>
          <p className='text-gray-600'>
            Manage and track all your construction projects
          </p>
        </div>
        <button
          onClick={() => setShowAddProject(true)}
          className='bg-archer-neon text-black px-4 py-2 rounded-lg hover:bg-archer-green transition-colors duration-200 flex items-center space-x-2'
        >
          <Plus className='h-4 w-4' />
          <span>New Project</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className='mt-4'>
        <button
          onClick={toggleStats}
          className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors mb-4'
        >
          {statsExpanded ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
          Project Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-archer-grey rounded-lg flex items-center justify-center'>
                  <Building2 className='h-5 w-5 text-archer-neon' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Active Projects</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.activeProjects}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Completed</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.completedProjects}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <PoundSterling className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Total Budget</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {formatCurrency(stats.totalBudget)}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center'>
                  <Progress className='h-5 w-5 text-orange-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Avg Progress</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stats.avgProgress}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <div className='flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4'>
          <div className='flex-1 relative w-full lg:w-auto'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search projects...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
          >
            <option value='all'>All Status</option>
            <option value='progress'>In Progress</option>
            <option value='schedule'>Behind Schedule</option>
            <option value='complete'>Nearly Complete</option>
            <option value='completed'>Completed</option>
            <option value='hold'>On Hold</option>
          </select>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
          >
            <option value='all'>All Priorities</option>
            <option value='High'>High</option>
            <option value='Medium'>Medium</option>
            <option value='Low'>Low</option>
          </select>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-archer-neon text-black' : 'bg-gray-100 text-gray-600'}`}
            >
              <div className='w-4 h-4 grid grid-cols-2 gap-0.5'>
                <div className='bg-current rounded-sm'></div>
                <div className='bg-current rounded-sm'></div>
                <div className='bg-current rounded-sm'></div>
                <div className='bg-current rounded-sm'></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-archer-neon text-black' : 'bg-gray-100 text-gray-600'}`}
            >
              <div className='w-4 h-4 space-y-0.5'>
                <div className='bg-current rounded-sm h-0.5'></div>
                <div className='bg-current rounded-sm h-0.5'></div>
                <div className='bg-current rounded-sm h-0.5'></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-archer-neon text-black' : 'bg-gray-100 text-gray-600'}`}
            >
              <BarChart3 className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Projects View */}
      {viewMode === 'timeline' ? (
        renderTimelineView()
      ) : viewMode === 'list' ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Project
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Client
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Manager
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Progress
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Budget
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Timeline
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredProjects.map(project => (
                  <tr key={project.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {project.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {project.description}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {project.client}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {project.manager}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center space-x-2'>
                        <div className='w-16 bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-archer-neon h-2 rounded-full'
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className='text-sm text-gray-900'>
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {formatCurrency(project.spent)}
                      </div>
                      <div className='text-sm text-gray-500'>
                        of {formatCurrency(project.budget)}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {isOverdue(project.endDate) ? (
                          <span className='text-red-500'>Overdue</span>
                        ) : (
                          <span>
                            {getDaysRemaining(project.endDate)} days left
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => setEditingProject(project)}
                          className='text-blue-600 hover:text-blue-900'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className='text-red-600 hover:text-red-900'
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer'
              onClick={() => {
                setSelectedProjectForModal(project);
                setShowProjectModal(true);
              }}
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-start space-x-3'>
                  <div className='w-10 h-10 bg-archer-grey rounded-lg flex items-center justify-center'>
                    <Building2 className='h-5 w-5 text-archer-neon' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      {project.name}
                    </h3>
                    <p className='text-sm text-gray-600'>{project.client}</p>
                  </div>
                </div>
                <div className='flex items-center space-x-1'>
                  {project.isDemoData && (
                    <span className='text-xs bg-archer-neon text-black px-2 py-1 rounded'>
                      DEMO
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}
                  >
                    {project.status}
                  </span>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center text-sm text-gray-600'>
                  <Users className='h-4 w-4 mr-2' />
                  <span>{project.manager}</span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Progress</span>
                  <span className='text-sm font-semibold text-gray-900'>
                    {project.progress}%
                  </span>
                </div>

                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-archer-neon h-2 rounded-full transition-all duration-300'
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Budget</span>
                  <span className='text-sm font-semibold text-archer-neon'>
                    {formatCurrency(project.spent)}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Team</span>
                  <span className='text-sm text-gray-900'>
                    {project.team} members
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Timeline</span>
                  <div className='text-right'>
                    <div className='text-sm text-gray-900'>
                      {new Date(project.endDate).toLocaleDateString()}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {isOverdue(project.endDate) ? (
                        <span className='text-red-500'>Overdue</span>
                      ) : (
                        <span>
                          {getDaysRemaining(project.endDate)} days left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddProject && (
        <ProjectForm
          onSave={handleAddProject}
          onCancel={() => setShowAddProject(false)}
        />
      )}

      {editingProject && (
        <ProjectForm
          project={editingProject}
          onSave={handleUpdateProject}
          onCancel={() => setEditingProject(null)}
        />
      )}

      {/* Project Details Modal */}
      {showProjectModal && selectedProjectForModal && (
        <ProjectModal
          project={selectedProjectForModal}
          onClose={() => {
            setShowProjectModal(false);
            setSelectedProjectForModal(null);
          }}
        />
      )}
    </div>
  );
};

export default Projects;
