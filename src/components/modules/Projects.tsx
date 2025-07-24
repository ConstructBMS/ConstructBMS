import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Settings,
  MoreVertical,
  Grid,
  List,
  Trello
} from 'lucide-react';
import { demoDataService } from '../../services/demoData';
import type { Project, Client } from '../../services/demoData';

import {
  emailIntelligenceService,
} from '../../services/emailIntelligence';
import type { EmailMessage } from '../../services/emailIntelligence';
import ProjectModal from './ProjectModal';

interface ProjectColumn {
  color?: string;
  id: string;
  name: string;
  projects: Project[];
}

interface DragState {
  draggedItem: { id: number; sourceColumn: string; sourceIndex: number 
} | null;
  dropTarget: { columnId: string; index: number } | null;
  isDragging: boolean;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [columns, setColumns] = useState<ProjectColumn[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    dropTarget: null,
    isDragging: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline' | 'kanban'>('grid');
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [projectEmails, setProjectEmails] = useState<any[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<Project | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [showColumnRename, setShowColumnRename] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [cardSettings, setCardSettings] = useState({
    showClient: true,
    showManager: true,
    showBudget: true,
    showProgress: true,
    showDueDate: true,
    showPriority: true,
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const dragStartTime = useRef<number>(0);
  const hasDragged = useRef<boolean>(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // Initialize columns when projects change
  useEffect(() => {
    const projectColumns: ProjectColumn[] = [
      {
        id: 'in-progress',
        name: 'In Progress',
        color: '#F59E0B',
        projects: projects.filter(p => p.status === 'In Progress')
      },
      {
        id: 'behind-schedule',
        name: 'Behind Schedule',
        color: '#EF4444',
        projects: projects.filter(p => p.status === 'Behind Schedule')
      },
      {
        id: 'nearly-complete',
        name: 'Nearly Complete',
        color: '#8B5CF6',
        projects: projects.filter(p => p.status === 'Nearly Complete')
      },
      {
        id: 'completed',
        name: 'Completed',
        color: '#10B981',
        projects: projects.filter(p => p.status === 'Completed')
      },
      {
        id: 'on-hold',
        name: 'On Hold',
        color: '#6B7280',
        projects: projects.filter(p => p.status === 'On Hold')
      }
    ];
    setColumns(projectColumns);
  }, [projects]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollLeft = () => {
    const container = document.querySelector('.projects-kanban');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector('.projects-kanban');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleDragStart = (e: React.DragEvent, projectId: number, sourceColumn: string, sourceIndex: number) => {
    dragStartTime.current = Date.now();
    hasDragged.current = true;
    setDragState({
      draggedItem: { id: projectId, sourceColumn, sourceIndex },
      dropTarget: null,
      isDragging: true,
    });
    e.dataTransfer.effectAllowed = 'move';
    
    // Add dragging class to body for global styles
    document.body.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!dragState.draggedItem) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const cardHeight = 140; // Approximate card height with margin
    const containerPadding = 16; // Padding from container
    const adjustedY = y - containerPadding;
    
    // Calculate the correct index based on mouse position
    let index = Math.floor(adjustedY / cardHeight);
    index = Math.max(0, Math.min(index, columns.find(col => col.id === columnId)?.projects.length || 0));
    
    setDragState(prev => ({
      ...prev,
      dropTarget: { columnId, index }
    }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drop target if we're actually leaving the container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragState(prev => ({
        ...prev,
        dropTarget: null
      }));
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    if (!dragState.draggedItem || !dragState.dropTarget) return;

    const { id: projectId, sourceColumn, sourceIndex } = dragState.draggedItem;
    const { index: targetIndex } = dragState.dropTarget;
    
    setProjects(prevProjects => {
      const newProjects = [...prevProjects];
      const projectIndex = newProjects.findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        newProjects[projectIndex] = {
          ...newProjects[projectIndex],
          status: targetColumn === 'in-progress' ? 'In Progress' :
                  targetColumn === 'behind-schedule' ? 'Behind Schedule' :
                  targetColumn === 'nearly-complete' ? 'Nearly Complete' :
                  targetColumn === 'completed' ? 'Completed' :
                  targetColumn === 'on-hold' ? 'On Hold' : 'In Progress'
        };
      }
      return newProjects;
    });
    
    setDragState({
      draggedItem: null,
      dropTarget: null,
      isDragging: false,
    });
    
    // Remove dragging class from body
    document.body.classList.remove('dragging');
  };

  const handleDragEnd = () => {
    setDragState({
      draggedItem: null,
      dropTarget: null,
      isDragging: false,
    });
    
    // Remove dragging class from body
    document.body.classList.remove('dragging');
    
    // Reset drag flag after a short delay to allow click to register
    setTimeout(() => {
      hasDragged.current = false;
    }, 100);
  };

  const handleColumnAction = (action: string, columnId: string) => {
    setShowColumnMenu(null);
    
    switch (action) {
      case 'rename':
        setShowColumnRename(columnId);
        const column = columns.find(col => col.id === columnId);
        setEditingColumnName(column?.name || '');
        break;
      case 'delete':
        setShowDeleteConfirm(columnId);
        break;
      case 'settings':
        // TODO: Implement column settings functionality
        console.log('Column settings:', columnId);
        break;
    }
  };

  const handleProjectClick = (project: Project) => {
    if (hasDragged.current) return;
    
    setSelectedProjectForModal(project);
    setShowProjectModal(true);
  };

  const handleUserClick = (e: React.MouseEvent, userName: string) => {
    e.stopPropagation();
    const user = {
      name: userName,
              email: `${userName.toLowerCase().replace(' ', '.')}@constructbms.com`,
      role: 'Project Manager',
      department: 'Project Management',
      avatar: `/avatars/${userName.toLowerCase().replace(' ', '')}.jpg`,
      status: 'Active'
    };
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCustomerClick = (e: React.MouseEvent, customerName: string) => {
    e.stopPropagation();
    const customer = clients.find(c => c.name === customerName);
    if (customer) {
      setSelectedCustomer(customer);
      setShowCustomerModal(true);
    }
  };

  const handleCardSettingsToggle = (setting: keyof typeof cardSettings) => {
    setCardSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleColumnRename = (columnId: string, newName: string) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const columnIndex = newColumns.findIndex(col => col.id === columnId);
      if (columnIndex !== -1 && newColumns[columnIndex]) {
        newColumns[columnIndex].name = newName;
      }
      return newColumns;
    });
    setShowColumnRename(null);
  };

  const handleColumnDelete = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return;

    // Move all projects to the first column
    setProjects(prevProjects => {
      const newProjects = [...prevProjects];
      newProjects.forEach(project => {
        if (project.status === column.name) {
          project.status = 'In Progress';
        }
      });
      return newProjects;
    });
    setShowDeleteConfirm(null);
  };

  const renderProjectCard = (project: Project, index: number, columnId: string) => {
    const isDropTarget = dragState.dropTarget?.columnId === columnId && dragState.dropTarget?.index === index;
    const isDragging = dragState.draggedItem?.id === project.id;

    return (
      <React.Fragment key={project.id}>
        {isDropTarget && (
          <div className="drop-zone-space h-4 mb-2">
            <div className="h-full border-2 border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Drop here</span>
            </div>
          </div>
        )}
        
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, project.id, columnId, index)}
          onDragEnd={handleDragEnd}
          onClick={() => handleProjectClick(project)}
          className={`kanban-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
            isDragging ? 'opacity-50' : ''
          }`}
          style={{ minHeight: '120px' }}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
              {project.name}
            </h3>
            <div className="flex items-center space-x-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                project.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {project.priority}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {cardSettings.showClient && project.client && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Building2 className="h-3 w-3" />
                <span 
                  className="cursor-pointer hover:text-constructbms-blue hover:underline transition-colors"
                  onClick={(e) => handleCustomerClick(e, project.client)}
                >
                  {project.client}
                </span>
              </div>
            )}

            {cardSettings.showManager && project.manager && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Users className="h-3 w-3" />
                <span 
                  className="cursor-pointer hover:text-constructbms-blue hover:underline transition-colors"
                  onClick={(e) => handleUserClick(e, project.manager)}
                >
                  {project.manager}
                </span>
              </div>
            )}

            {cardSettings.showBudget && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <PoundSterling className="h-3 w-3" />
                <span>£{project.budget.toLocaleString()}</span>
              </div>
            )}

            {cardSettings.showProgress && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Progress className="h-3 w-3" />
                <span>{Math.round(project.progress * 100) / 100}%</span>
              </div>
            )}

            {cardSettings.showDueDate && project.endDate && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  };

  const filteredColumns = columns.map(column => ({
    ...column,
    projects: column.projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.manager.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status.toLowerCase().includes(statusFilter.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
  }));

  const renderKanbanView = () => (
    <div className="relative max-w-full overflow-hidden">
        {/* Scroll Controls */}
        <button
          onClick={scrollLeft}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 scroll-control bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg hover:shadow-xl"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          onClick={scrollRight}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 scroll-control bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 shadow-lg hover:shadow-xl"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

      <div className="overflow-x-auto">
        <div className="flex space-x-6 p-6 min-w-max">
          {filteredColumns.map((column) => (
            <div
              key={column.id}
              className="kanban-column flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{column.name}</h3>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
                    {column.projects.length}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowColumnMenu(showColumnMenu === column.id ? null : column.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {showColumnMenu === column.id && (
                    <div
                      ref={columnMenuRef}
                      className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20"
                    >
                      <button
                        onClick={() => handleColumnAction('rename', column.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit2 className="h-4 w-4 inline mr-2" />
                        Rename
                      </button>
                      <button
                        onClick={() => handleColumnAction('delete', column.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4 inline mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Column Rename Input */}
              {showColumnRename === column.id && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={editingColumnName}
                    onChange={(e) => setEditingColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleColumnRename(column.id, editingColumnName);
                      } else if (e.key === 'Escape') {
                        setShowColumnRename(null);
                      }
                    }}
                    onBlur={() => handleColumnRename(column.id, editingColumnName)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    autoFocus
                  />
                </div>
              )}

              {/* Project Cards */}
              <div className="space-y-2">
                {column.projects.map((project, index) => renderProjectCard(project, index, column.id))}
                
                {/* Drop zone at the end */}
                {dragState.dropTarget?.columnId === column.id && dragState.dropTarget?.index === column.projects.length && (
                  <div className="drop-zone-space h-4 mt-2">
                    <div className="h-full border-2 border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">Drop here</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if demo data was just cleared
        const wasJustCleared = sessionStorage.getItem('demo_data_just_cleared');
        if (wasJustCleared === 'true') {
          console.log('🚫 Demo data was just cleared, skipping initialization');
          setProjects([]);
          setClients([]);
          return;
        }
        
        // Load demo data
        await demoDataService.ensureDemoDataExists();
        const projectsData = await demoDataService.getProjects();
        const clientsData = await demoDataService.getCustomers();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setProjects([]);
        setClients([]);
      }
    };

    loadData();
  }, []);

  // Listen for demo data refresh events
  useEffect(() => {
    const handleDemoDataRefresh = async () => {
      console.log('🔄 Projects: Demo data refresh event received');
      try {
        const projectsData = await demoDataService.getProjects();
        const clientsData = await demoDataService.getCustomers();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
  
      } catch (error) {
        console.warn('Failed to refresh projects data:', error);
        setProjects([]);
        setClients([]);
      }
    };

    window.addEventListener('demoDataRefreshed', handleDemoDataRefresh);
    
    return () => {
      window.removeEventListener('demoDataRefreshed', handleDemoDataRefresh);
    };
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('projectsStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    if (selectedProjectForModal) {
      // Get all emails for this project
      const allEmails = emailIntelligenceService.getEmails();
      const relatedEmails = allEmails.filter(
        e => e.projectId === `proj_${selectedProjectForModal.id}`
      );
      setProjectEmails(relatedEmails);
    } else {
      setProjectEmails([]);
    }
  }, [selectedProjectForModal]);

  // Check for stored project data to open specific project
  useEffect(() => {
    const storedProject = sessionStorage.getItem('openProject');
    if (storedProject && projects.length > 0) {
      try {
        const projectData = JSON.parse(storedProject);
        
        // Find the actual project in our projects array
        const actualProject = projects.find(p => p.id === projectData.id || p.name === projectData.name);
        if (actualProject) {
          setSelectedProjectForModal(actualProject);
          setShowProjectModal(true);
        }
        // Clear the stored data
        sessionStorage.removeItem('openProject');
      } catch (error) {
        console.error('Error parsing stored project data:', error);
        sessionStorage.removeItem('openProject');
      }
    }
  }, [projects]);

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
        projectData.startDate || new Date().toISOString().split('T')[0] || '',
      endDate:
        projectData.endDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0] || '',
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
        return 'bg-constructbms-blue/20 text-constructbms-blue border border-constructbms-blue/30';
      case 'behind schedule':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'nearly complete':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'completed':
        return 'bg-constructbms-blue/20 text-constructbms-blue border border-constructbms-blue/30';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'Active';
      case 'behind schedule':
        return 'Behind';
      case 'nearly complete':
        return 'Near';
      case 'on hold':
        return 'Hold';
      case 'completed':
        return 'Done';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'Low':
        return 'bg-constructbms-blue/20 text-constructbms-blue border border-constructbms-blue/30';
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
    onCancel: () => void;
    onSave: (data: Partial<Project>) => void;
    project?: Project;
  }> = ({ project, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: project?.name || '',
      clientId: project?.clientId || '',
      manager: project?.manager || '',
      description: project?.description || '',
      budget: project?.budget || 0,
      startDate: project?.startDate || new Date().toISOString().split('T')[0] || '',
      endDate:
        project?.endDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0] || '',
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
              <span className='ml-2 text-xs bg-constructbms-blue text-black px-2 py-1 rounded'>
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
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
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
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                rows={3}
              />
            </div>

            <div className='flex space-x-3 pt-4'>
              <button
                type='submit'
                className='flex-1 bg-constructbms-blue text-black py-2 px-4 rounded-lg hover:bg-constructbms-green transition-colors font-medium'
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
          className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600'
        >
          <div className='flex items-start justify-between mb-4'>
            <div className='flex items-start space-x-4'>
              <div className='w-12 h-12 bg-constructbms-grey rounded-lg flex items-center justify-center'>
                <Building2 className='h-6 w-6 text-constructbms-blue' />
              </div>
              <div>
                <div className='flex items-center space-x-2'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {project.name}
                  </h3>
                  {project.isDemoData && (
                    <span className='text-xs bg-constructbms-blue text-black px-2 py-1 rounded'>
                      DEMO
                    </span>
                  )}
                </div>
                <p className='text-sm text-gray-600'>{project.client}</p>
                <div className='flex items-center space-x-4 mt-2'>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(project.status)}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPriorityColor(project.priority)}`}
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
                {Math.round(project.progress * 100) / 100}% complete
              </span>
            </div>
          </div>

          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-constructbms-blue h-2 rounded-full transition-all duration-300'
              style={{ width: `${Math.round(project.progress * 100) / 100}%` }}
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
    <div className='space-y-6 projects-container'>
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
          className='bg-constructbms-blue text-black px-4 py-2 rounded-lg hover:bg-constructbms-green transition-colors duration-200 flex items-center space-x-2'
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
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-constructbms-grey rounded-lg flex items-center justify-center'>
                  <Building2 className='h-5 w-5 text-constructbms-blue' />
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>Active Projects</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.activeProjects}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>Completed</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.completedProjects}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <PoundSterling className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>Total Budget</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {formatCurrency(stats.totalBudget)}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center'>
                  <Progress className='h-5 w-5 text-orange-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>Avg Progress</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.avgProgress}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600'>
        <div className='flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4'>
          <div className='flex-1 relative w-full lg:w-auto'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search projects...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent bg-white dark:bg-gray-800'
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent bg-white dark:bg-gray-800'
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
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent bg-white dark:bg-gray-800'
          >
            <option value='all'>All Priorities</option>
            <option value='High'>High</option>
            <option value='Medium'>Medium</option>
            <option value='Low'>Low</option>
          </select>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-constructbms-blue text-black' : 'bg-gray-100 text-gray-600'}`}
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
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-constructbms-blue text-black' : 'bg-gray-100 text-gray-600'}`}
            >
              <div className='w-4 h-4 space-y-0.5'>
                <div className='bg-current rounded-sm h-0.5'></div>
                <div className='bg-current rounded-sm h-0.5'></div>
                <div className='bg-current rounded-sm h-0.5'></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-constructbms-blue text-black' : 'bg-gray-100 text-gray-600'}`}
            >
              <BarChart3 className='h-4 w-4' />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-constructbms-blue text-black' : 'bg-gray-100 text-gray-600'}`}
            >
              <Trello className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Projects View */}
      {viewMode === 'timeline' ? (
        renderTimelineView()
      ) : viewMode === 'list' ? (
        <div className='w-full'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600'>
          <div className='overflow-x-auto'>
              <table className='min-w-max'>
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
                        className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(project.status)}`}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center space-x-2'>
                        <div className='w-16 bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-constructbms-blue h-2 rounded-full'
                            style={{ width: `${Math.round(project.progress * 100) / 100}%` }}
                          ></div>
                        </div>
                        <span className='text-sm text-gray-900'>
                          {Math.round(project.progress * 100) / 100}%
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
        </div>
      ) : viewMode === 'kanban' ? (
        <div className='w-full'>
          {renderKanbanView()}
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer'
              onClick={() => {
                setSelectedProjectForModal(project);
                setShowProjectModal(true);
              }}
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-start space-x-3'>
                  <div className='w-10 h-10 bg-constructbms-grey rounded-lg flex items-center justify-center'>
                    <Building2 className='h-5 w-5 text-constructbms-blue' />
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
                    <span className='text-xs bg-constructbms-blue text-black px-2 py-1 rounded'>
                      DEMO
                    </span>
                  )}
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
                    {Math.round(project.progress * 100) / 100}%
                  </span>
                </div>

                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-constructbms-blue h-2 rounded-full transition-all duration-300'
                    style={{ width: `${Math.round(project.progress * 100) / 100}%` }}
                  ></div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Budget</span>
                  <span className='text-sm font-semibold text-constructbms-blue'>
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
              
              <div className='flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-600'>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(project.status)}`}
                >
                  {getStatusLabel(project.status)}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPriorityColor(project.priority)}`}
                >
                  {project.priority}
                </span>
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

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-100 dark:border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Details
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-constructbms-blue rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedUser.role}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedUser.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedUser.department}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedUser.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-100 dark:border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Customer Details
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-constructbms-blue rounded-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedCustomer.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedCustomer.company}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedCustomer.contact}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedCustomer.location}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedCustomer.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
