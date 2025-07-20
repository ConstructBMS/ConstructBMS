import React, { useState } from 'react';
import {
  HardHat,
  ShieldCheck,
  Wrench,
  Users,
  FileText,
  MessageSquare,
  MapPin,
  BarChart3,
  Plus,
  Search,
  Filter,
  Settings,
  Play,
  CheckCircle,
  AlertTriangle,
  Truck,
  ClipboardList,
  Camera,
  Calendar,
  Target,
  Zap,
  BookOpen,
  Phone,
  Mail,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  UserCheck,
  X,
} from 'lucide-react';

// Tool Categories
interface ToolCategory {
  color: string;
  description: string;
  icon: React.ReactNode;
  id: string;
  name: string;
}

const toolCategories: ToolCategory[] = [
  {
    id: 'safety',
    name: 'Safety & Compliance',
    description: 'Safety inspections, incident reporting, compliance tracking',
    icon: <ShieldCheck className='h-6 w-6' />,
    color: 'text-red-500',
  },
  {
    id: 'equipment',
    name: 'Equipment Management',
    description: 'Equipment tracking, maintenance schedules, utilization',
    icon: <Wrench className='h-6 w-6' />,
    color: 'text-blue-500',
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Team messaging, announcements, emergency alerts',
    icon: <MessageSquare className='h-6 w-6' />,
    color: 'text-green-500',
  },
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Daily logs, progress reports, photo documentation',
    icon: <FileText className='h-6 w-6' />,
    color: 'text-purple-500',
  },
  {
    id: 'planning',
    name: 'Planning & Scheduling',
    description: 'Task management, crew scheduling, timeline tracking',
    icon: <Calendar className='h-6 w-6' />,
    color: 'text-orange-500',
  },
  {
    id: 'analytics',
    name: 'Analytics & Reporting',
    description: 'Performance metrics, productivity tracking, insights',
    icon: <BarChart3 className='h-6 w-6' />,
    color: 'text-indigo-500',
  },
];

// Individual Tools
interface Tool {
  category: string;
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
  description: string;
  estimatedTime: string;
  features: string[];
  icon: React.ReactNode;
  id: string;
  isActive: boolean;
  name: string;
  rating: number;
  usageCount: number;
}

const availableTools: Tool[] = [
  // Safety & Compliance Tools
  {
    id: 'safety-inspection',
    name: 'Safety Inspection Checklist',
    description: 'Comprehensive site safety inspection with digital sign-off',
    category: 'safety',
    icon: <ShieldCheck className='h-5 w-5' />,
    complexity: 'Basic',
    estimatedTime: '15-30 min',
    features: [
      'Digital checklists',
      'Photo documentation',
      'Sign-off tracking',
      'Compliance reporting',
    ],
    usageCount: 156,
    rating: 4.8,
    isActive: true,
  },
  {
    id: 'incident-reporting',
    name: 'Incident Reporting System',
    description:
      'Report and track safety incidents with investigation workflow',
    category: 'safety',
    icon: <AlertTriangle className='h-5 w-5' />,
    complexity: 'Intermediate',
    estimatedTime: '10-20 min',
    features: [
      'Incident forms',
      'Investigation tracking',
      'Corrective actions',
      'Regulatory reporting',
    ],
    usageCount: 23,
    rating: 4.6,
    isActive: true,
  },
  {
    id: 'ppe-tracking',
    name: 'PPE Tracking & Compliance',
    description: 'Track personal protective equipment usage and compliance',
    category: 'safety',
    icon: <UserCheck className='h-5 w-5' />,
    complexity: 'Basic',
    estimatedTime: '5-10 min',
    features: [
      'PPE inventory',
      'Usage tracking',
      'Expiry alerts',
      'Compliance reports',
    ],
    usageCount: 89,
    rating: 4.4,
    isActive: true,
  },

  // Equipment Management Tools
  {
    id: 'equipment-tracker',
    name: 'Equipment Tracker',
    description: 'Real-time equipment location and status tracking',
    category: 'equipment',
    icon: <Wrench className='h-5 w-5' />,
    complexity: 'Intermediate',
    estimatedTime: '5-15 min',
    features: [
      'Location tracking',
      'Status updates',
      'Maintenance alerts',
      'Utilization reports',
    ],
    usageCount: 234,
    rating: 4.7,
    isActive: true,
  },
  {
    id: 'maintenance-scheduler',
    name: 'Maintenance Scheduler',
    description: 'Schedule and track equipment maintenance activities',
    category: 'equipment',
    icon: <Settings className='h-5 w-5' />,
    complexity: 'Intermediate',
    estimatedTime: '10-20 min',
    features: [
      'Maintenance calendar',
      'Service history',
      'Parts tracking',
      'Cost analysis',
    ],
    usageCount: 67,
    rating: 4.5,
    isActive: true,
  },
  {
    id: 'fuel-monitor',
    name: 'Fuel & Resource Monitor',
    description: 'Track fuel consumption and resource usage across equipment',
    category: 'equipment',
    icon: <Zap className='h-5 w-5' />,
    complexity: 'Advanced',
    estimatedTime: '15-30 min',
    features: [
      'Fuel tracking',
      'Consumption analytics',
      'Cost optimization',
      'Efficiency reports',
    ],
    usageCount: 34,
    rating: 4.3,
    isActive: true,
  },

  // Communication Tools
  {
    id: 'team-messenger',
    name: 'Team Messenger',
    description: 'Real-time messaging and communication for site teams',
    category: 'communication',
    icon: <MessageSquare className='h-5 w-5' />,
    complexity: 'Basic',
    estimatedTime: '2-5 min',
    features: [
      'Group chats',
      'File sharing',
      'Voice messages',
      'Message history',
    ],
    usageCount: 445,
    rating: 4.9,
    isActive: true,
  },
  {
    id: 'emergency-alerts',
    name: 'Emergency Alert System',
    description: 'Send emergency notifications to all site personnel',
    category: 'communication',
    icon: <AlertTriangle className='h-5 w-5' />,
    complexity: 'Basic',
    estimatedTime: '1-2 min',
    features: [
      'Emergency broadcasts',
      'Acknowledgment tracking',
      'Escalation rules',
      'Audit trail',
    ],
    usageCount: 12,
    rating: 4.8,
    isActive: true,
  },
  {
    id: 'announcement-board',
    name: 'Digital Announcement Board',
    description: 'Post and manage site announcements and updates',
    category: 'communication',
    icon: <BookOpen className='h-5 w-5' />,
    complexity: 'Basic',
    estimatedTime: '3-8 min',
    features: [
      'Announcement creation',
      'Scheduling',
      'Read receipts',
      'Archive system',
    ],
    usageCount: 178,
    rating: 4.6,
    isActive: true,
  },

  // Documentation Tools
  {
    id: 'daily-log',
    name: 'Daily Site Log',
    description:
      'Digital daily log with photo documentation and progress tracking',
    category: 'documentation',
    icon: <FileText className='h-5 w-5' />,
    complexity: 'Basic',
    estimatedTime: '10-20 min',
    features: [
      'Progress tracking',
      'Photo uploads',
      'Weather logging',
      'Issue documentation',
    ],
    usageCount: 567,
    rating: 4.8,
    isActive: true,
  },
  {
    id: 'photo-documentation',
    name: 'Photo Documentation',
    description: 'Capture and organize site photos with metadata',
    category: 'documentation',
    icon: <Camera className='h-5 w-5' />,
    complexity: 'Basic',
    estimatedTime: '5-15 min',
    features: [
      'Photo capture',
      'Metadata tagging',
      'Organization',
      'Search functionality',
    ],
    usageCount: 289,
    rating: 4.7,
    isActive: true,
  },
  {
    id: 'progress-reporter',
    name: 'Progress Reporter',
    description: 'Generate detailed progress reports with analytics',
    category: 'documentation',
    icon: <BarChart3 className='h-5 w-5' />,
    complexity: 'Intermediate',
    estimatedTime: '15-30 min',
    features: [
      'Report templates',
      'Data visualization',
      'Export options',
      'Scheduled reports',
    ],
    usageCount: 123,
    rating: 4.5,
    isActive: true,
  },

  // Planning & Scheduling Tools
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Assign and track tasks across crews and projects',
    category: 'planning',
    icon: <Target className='h-5 w-5' />,
    complexity: 'Intermediate',
    estimatedTime: '10-20 min',
    features: [
      'Task assignment',
      'Progress tracking',
      'Deadline management',
      'Priority levels',
    ],
    usageCount: 334,
    rating: 4.6,
    isActive: true,
  },
  {
    id: 'crew-scheduler',
    name: 'Crew Scheduler',
    description: 'Schedule crew assignments and track availability',
    category: 'planning',
    icon: <Users className='h-5 w-5' />,
    complexity: 'Intermediate',
    estimatedTime: '15-25 min',
    features: [
      'Crew management',
      'Availability tracking',
      'Shift scheduling',
      'Overtime monitoring',
    ],
    usageCount: 156,
    rating: 4.4,
    isActive: true,
  },
  {
    id: 'timeline-tracker',
    name: 'Timeline Tracker',
    description: 'Track project milestones and critical path analysis',
    category: 'planning',
    icon: <Calendar className='h-5 w-5' />,
    complexity: 'Advanced',
    estimatedTime: '20-40 min',
    features: [
      'Milestone tracking',
      'Critical path',
      'Delay alerts',
      'Resource allocation',
    ],
    usageCount: 78,
    rating: 4.3,
    isActive: true,
  },

  // Analytics & Reporting Tools
  {
    id: 'productivity-analytics',
    name: 'Productivity Analytics',
    description: 'Track and analyze team and equipment productivity',
    category: 'analytics',
    icon: <BarChart3 className='h-5 w-5' />,
    complexity: 'Advanced',
    estimatedTime: '20-30 min',
    features: [
      'Performance metrics',
      'Trend analysis',
      'Benchmarking',
      'Predictive insights',
    ],
    usageCount: 45,
    rating: 4.2,
    isActive: true,
  },
  {
    id: 'cost-tracker',
    name: 'Cost Tracker',
    description: 'Track project costs and budget management',
    category: 'analytics',
    icon: <BarChart3 className='h-5 w-5' />,
    complexity: 'Intermediate',
    estimatedTime: '15-25 min',
    features: [
      'Cost tracking',
      'Budget monitoring',
      'Variance analysis',
      'Forecasting',
    ],
    usageCount: 89,
    rating: 4.4,
    isActive: true,
  },
  {
    id: 'quality-control',
    name: 'Quality Control Dashboard',
    description: 'Monitor quality metrics and compliance standards',
    category: 'analytics',
    icon: <CheckCircle className='h-5 w-5' />,
    complexity: 'Intermediate',
    estimatedTime: '10-20 min',
    features: [
      'Quality metrics',
      'Compliance tracking',
      'Defect management',
      'Improvement tracking',
    ],
    usageCount: 67,
    rating: 4.5,
    isActive: true,
  },
];

// Project Interface
interface Project {
  assignedTools: string[];
  id: string;
  name: string;
  status: 'Active' | 'Planning' | 'Completed' | 'On Hold';
}

const demoProjects: Project[] = [
  {
    id: 'project-alpha',
    name: 'Project Alpha',
    status: 'Active',
    assignedTools: ['safety-inspection', 'daily-log', 'team-messenger'],
  },
  {
    id: 'project-beta',
    name: 'Project Beta',
    status: 'Active',
    assignedTools: ['equipment-tracker', 'task-manager', 'photo-documentation'],
  },
  {
    id: 'project-gamma',
    name: 'Project Gamma',
    status: 'Planning',
    assignedTools: ['crew-scheduler', 'timeline-tracker'],
  },
];

const SiteTools: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showToolConfig, setShowToolConfig] = useState(false);
  const [showProjectAssignment, setShowProjectAssignment] = useState(false);
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [toolConfig, setToolConfig] = useState({
    name: '',
    description: '',
    settings: {},
  });

  // Filter tools based on search and filters
  const filteredTools = availableTools.filter(tool => {
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesComplexity =
      complexityFilter === 'all' || tool.complexity === complexityFilter;

    return matchesCategory && matchesSearch && matchesComplexity;
  });

  // Handle tool selection
  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setToolConfig({
      name: tool.name,
      description: tool.description,
      settings: {},
    });
    setShowToolConfig(true);
  };

  // Handle tool assignment to project
  const handleAssignTool = () => {
    if (selectedProject && selectedTool) {
      setProjects(
        projects.map(project =>
          project.id === selectedProject
            ? {
                ...project,
                assignedTools: [...project.assignedTools, selectedTool.id],
              }
            : project
        )
      );
      setShowProjectAssignment(false);
      setShowToolConfig(false);
      setSelectedProject('');
      setSelectedTool(null);
    }
  };

  // Get tools assigned to a project
  const getProjectTools = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project
      ? availableTools.filter(tool => project.assignedTools.includes(tool.id))
      : [];
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='bg-white rounded-xl border p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Site Tools Library
            </h1>
            <p className='text-gray-600 mt-1'>
              Browse, select, and assign tools to your projects
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <div className='text-sm text-gray-500'>Active Projects</div>
              <div className='text-2xl font-bold text-constructbms-blue'>
                {projects.filter(p => p.status === 'Active').length}
              </div>
            </div>
            <div className='text-right'>
              <div className='text-sm text-gray-500'>Assigned Tools</div>
              <div className='text-2xl font-bold text-constructbms-blue'>
                {projects.reduce(
                  (total, project) => total + project.assignedTools.length,
                  0
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className='flex flex-wrap gap-4 mb-6'>
          <div className='flex-1 min-w-64'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <input
                type='text'
                placeholder='Search tools...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
              />
            </div>
          </div>
          <select
            value={complexityFilter}
            onChange={e => setComplexityFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
          >
            <option value='all'>All Complexity</option>
            <option value='Basic'>Basic</option>
            <option value='Intermediate'>Intermediate</option>
            <option value='Advanced'>Advanced</option>
          </select>
        </div>
      </div>

      {/* Category Navigation */}
      <div className='bg-white rounded-xl border p-6'>
        <h2 className='text-lg font-semibold mb-4'>Tool Categories</h2>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedCategory === 'all'
                ? 'border-constructbms-blue bg-constructbms-blue bg-opacity-10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className='text-center'>
              <HardHat className='h-8 w-8 text-constructbms-blue mx-auto mb-2' />
              <div className='font-medium text-sm'>All Tools</div>
              <div className='text-xs text-gray-500'>
                {availableTools.length} tools
              </div>
            </div>
          </button>
          {toolCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedCategory === category.id
                  ? 'border-constructbms-blue bg-constructbms-blue bg-opacity-10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className='text-center'>
                <div className={`h-8 w-8 mx-auto mb-2 ${category.color}`}>
                  {category.icon}
                </div>
                <div className='font-medium text-sm'>{category.name}</div>
                <div className='text-xs text-gray-500'>
                  {
                    availableTools.filter(t => t.category === category.id)
                      .length
                  }{' '}
                  tools
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className='bg-white rounded-xl border p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-lg font-semibold'>
            {selectedCategory === 'all'
              ? 'All Tools'
              : toolCategories.find(c => c.id === selectedCategory)?.name}
            <span className='text-gray-500 font-normal ml-2'>
              ({filteredTools.length})
            </span>
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              className='border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer'
              onClick={() => handleToolSelect(tool)}
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='text-constructbms-blue'>{tool.icon}</div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>{tool.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tool.complexity === 'Basic'
                          ? 'bg-green-100 text-green-700'
                          : tool.complexity === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {tool.complexity}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-1 text-yellow-500'>
                  <Star className='h-4 w-4 fill-current' />
                  <span className='text-sm font-medium'>{tool.rating}</span>
                </div>
              </div>

              <p className='text-gray-600 text-sm mb-4'>{tool.description}</p>

              <div className='space-y-3'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-500'>Estimated Time:</span>
                  <span className='font-medium'>{tool.estimatedTime}</span>
                </div>

                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-500'>Usage Count:</span>
                  <span className='font-medium'>{tool.usageCount}</span>
                </div>

                <div className='flex flex-wrap gap-1'>
                  {tool.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded'
                    >
                      {feature}
                    </span>
                  ))}
                  {tool.features.length > 3 && (
                    <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded'>
                      +{tool.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className='mt-4 pt-4 border-t border-gray-100'>
                <button 
                  className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-constructbms-blue text-black rounded-lg font-medium hover:bg-constructbms-black hover:text-white transition-colors'
                  title='Use Tool'
                >
                  <Play className='h-4 w-4' />
                  Use Tool
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Assignments */}
      <div className='bg-white rounded-xl border p-6'>
        <h2 className='text-lg font-semibold mb-4'>Project Tool Assignments</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {projects.map(project => (
            <div
              key={project.id}
              className='border border-gray-200 rounded-lg p-4'
            >
              <div className='flex items-center justify-between mb-3'>
                <h3 className='font-semibold'>{project.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : project.status === 'Planning'
                        ? 'bg-blue-100 text-blue-700'
                        : project.status === 'Completed'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <div className='space-y-2'>
                <div className='text-sm text-gray-500'>
                  Assigned Tools: {project.assignedTools.length}
                </div>
                <div className='flex flex-wrap gap-1'>
                  {getProjectTools(project.id).map(tool => (
                    <span
                      key={tool.id}
                      className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded flex items-center gap-1'
                    >
                      {tool.icon}
                      {tool.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Configuration Modal */}
      {showToolConfig && selectedTool && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
          <div className='bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>
                Configure {selectedTool.name}
              </h3>
              <button
                onClick={() => setShowToolConfig(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='h-6 w-6' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tool Name
                </label>
                <input
                  type='text'
                  value={toolConfig.name}
                  onChange={e =>
                    setToolConfig({ ...toolConfig, name: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Description
                </label>
                <textarea
                  value={toolConfig.description}
                  onChange={e =>
                    setToolConfig({
                      ...toolConfig,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                />
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h4 className='font-medium mb-2'>Tool Features:</h4>
                <div className='grid grid-cols-2 gap-2'>
                  {selectedTool.features.map((feature, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-2 text-sm'
                    >
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex gap-2 justify-end mt-6'>
              <button
                onClick={() => setShowToolConfig(false)}
                className='px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'
                title='Cancel'
              >
                Cancel
              </button>
              <button
                onClick={() => setShowProjectAssignment(true)}
                className='px-4 py-2 rounded-lg bg-constructbms-blue text-black font-semibold hover:bg-constructbms-black hover:text-white'
                title='Assign to Project'
              >
                Assign to Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Assignment Modal */}
      {showProjectAssignment && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md shadow-xl'>
            <h3 className='text-lg font-semibold mb-4'>
              Assign Tool to Project
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Select Project
                </label>
                <select
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent'
                >
                  <option value=''>Choose a project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.status})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject && (
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h4 className='font-medium mb-2'>Project Details:</h4>
                  <div className='text-sm text-gray-600'>
                    <p>
                      <strong>Project:</strong>{' '}
                      {projects.find(p => p.id === selectedProject)?.name}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      {projects.find(p => p.id === selectedProject)?.status}
                    </p>
                    <p>
                      <strong>Current Tools:</strong>{' '}
                      {
                        projects.find(p => p.id === selectedProject)
                          ?.assignedTools.length
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className='flex gap-2 justify-end mt-6'>
              <button
                onClick={() => setShowProjectAssignment(false)}
                className='px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'
                title='Cancel'
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTool}
                disabled={!selectedProject}
                className='px-4 py-2 rounded-lg bg-constructbms-blue text-black font-semibold hover:bg-constructbms-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                title={selectedProject ? 'Assign Tool' : 'Select a project first'}
              >
                Assign Tool
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteTools;
