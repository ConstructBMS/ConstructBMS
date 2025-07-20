import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  ChartBarIcon,
  FolderOpenIcon,
  CurrencyPoundIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  BoltIcon,
  UserCircleIcon,
  PaperClipIcon,
  PencilSquareIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  UserIcon,
  DocumentChartBarIcon,
  CubeIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import type { Project, Task as DemoTask } from '../../services/demoData';
import { demoDataService } from '../../services/demoData';
import { demoModeService } from '../../services/demoModeService';
// Gantt chart imports
import { Gantt, ViewMode } from 'gantt-task-react';
import type { Task as GanttTask } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import AdvancedGanttTab from './AdvancedGanttTab';
import BIMIntegrationTab from './BIMIntegrationTab';
import TaskDetailModal from './TaskDetailModal';


import { documentService } from '../../services/documentService';
import type { Document } from '../../services/documentService';

// Helper function to convert numeric project ID to UUID format
const convertProjectIdToUUID = (projectId: number): string => {
  // Convert numeric ID to UUID format: 00000000-0000-0000-0000-00000000000X
  const paddedId = projectId.toString().padStart(12, '0');
  return `00000000-0000-0000-0000-${paddedId}`;
};

// Helper function to convert demo task to component task
const convertDemoTaskToTask = (demoTask: DemoTask): Task => ({
  id: demoTask.id.toString(),
  project_id: demoTask.projectId.toString(),
  title: demoTask.title,
  description: demoTask.description,
  status:
    demoTask.status === 'completed'
      ? 'Completed'
      : demoTask.status === 'in-progress'
        ? 'In Progress'
        : 'To Do',
  assignee: demoTask.assignee,
  due_date: demoTask.dueDate,
  priority: demoTask.priority,
  created_at: demoTask.createdAt,
  updated_at: demoTask.createdAt,
  position: demoTask.id,
  type: 'task',
  tags: demoTask.tags,
  estimatedHours: demoTask.estimatedHours,
  actualHours: demoTask.actualHours,
});

// Type definition for component Task
// eslint-disable-next-line typescript-sort-keys/interface
interface Task {
  actualHours?: number;
  assignee?: string;
  client_visible?: boolean;
  created_at?: string;
  customer_id?: string;
  description?: string;
  due_date?: string;
  estimatedHours?: number;
  id: string;
  opportunity_id?: string;
  position?: number;
  priority?: string;
  project_id: string;
  status: string;
  tags?: string[];
  title: string;
  type?: string;
  updated_at?: string;
}

interface ProjectModalProps {
  onClose: () => void;
  project: Project;
}

const TABS = [
  {
    key: 'dashboard',
    label: 'Project Dashboard',
    icon: <ClipboardDocumentListIcon className='h-5 w-5' />,
  },
  {
    key: 'tasks',
    label: 'Tasks',
    icon: <Squares2X2Icon className='h-5 w-5' />,
  },
  { key: 'gantt', label: 'Gantt', icon: <ChartBarIcon className='h-5 w-5' /> },
  { key: 'bim', label: '4D BIM', icon: <CubeIcon className='h-5 w-5' /> },
  {
    key: 'work-structure',
    label: 'Project Stages',
    icon: <FolderOpenIcon className='h-5 w-5' />,
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: <DocumentTextIcon className='h-5 w-5' />,
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: <CurrencyPoundIcon className='h-5 w-5' />,
  },
  { key: 'team', label: 'Team', icon: <UsersIcon className='h-5 w-5' /> },
  {
    key: 'events',
    label: 'Events',
    icon: <CalendarIcon className='h-5 w-5' />,
  },
  { key: 'files', label: 'Files', icon: <PaperClipIcon className='h-5 w-5' /> },
  {
    key: 'notes',
    label: 'Notes',
    icon: <PencilSquareIcon className='h-5 w-5' />,
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <DocumentChartBarIcon className='h-5 w-5' />,
  },
  {
    key: 'client-portal',
    label: 'Client Portal',
    icon: <UserCircleIcon className='h-5 w-5' />,
  },
  {
    key: 'chat',
    label: 'Project Chat',
    icon: <ChatBubbleLeftRightIcon className='h-5 w-5' />,
  },
  {
    key: 'automation',
    label: 'Automation',
    icon: <BoltIcon className='h-5 w-5' />,
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'bg-constructbms-blue/20 text-constructbms-blue border border-constructbms-blue/30';
    case 'behind schedule':
      return 'bg-red-50 text-red-700 border border-red-200';
    case 'nearly complete':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'on hold':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'completed':
      return 'bg-constructbms-blue/20 text-constructbms-blue border border-constructbms-blue/30';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'High':
      return 'bg-red-50 text-red-700 border border-red-200';
    case 'Medium':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Low':
      return 'bg-constructbms-blue/20 text-constructbms-blue border border-constructbms-blue/30';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
}

function isOverdue(endDate: string) {
  const end = new Date(endDate);
  const today = new Date();
  return end < today;
}

function getDaysRemaining(endDate: string) {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatProgress(progress: number): number {
  return Math.round(progress * 100) / 100;
}

const ProjectDashboardTab: React.FC<{
  onMarkChanged?: () => void;
  project: Project;
}> = ({ project, onMarkChanged }) => {
  const [metrics, setMetrics] = useState({
    progress: 0,
    spent: 0,
    budget: 0,
    tasks: 0,
    completedTasks: 0,
    team: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Fetch tasks using demo data
        const demoTasks = await demoDataService.getTasks();
        const tasks = Array.isArray(demoTasks)
          ? demoTasks
              .filter(t => t.projectId === project.id)
              .map(convertDemoTaskToTask)
          : [];
        const completedTasks = tasks.filter(
          t => t.status === 'Completed'
        ).length;

        // Fetch documents
        const docs = await documentService.getDocuments({
          assignedToProject: String(project.id),
        });

        setMetrics({
          progress: project.progress || 0,
          spent: project.spent || 0,
          budget: project.budget || 0,
          tasks: tasks.length,
          completedTasks,
          team: project.team || 0,
        });

        // Recent activity: combine tasks, docs, budget changes, etc.
        setRecentActivity([
          ...tasks.slice(-2).map(t => ({ type: 'task', ...t })),
          ...docs.slice(-1).map(d => ({ type: 'document', ...d })),
        ]);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        // Set default metrics
        setMetrics({
          progress: project.progress || 0,
          spent: project.spent || 0,
          budget: project.budget || 0,
          tasks: 0,
          completedTasks: 0,
          team: project.team || 0,
        });
        setRecentActivity([]);
      }
    }
    fetchMetrics();
  }, [project.id]);

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      {/* Hero Section - Professional Primary Color Banner */}
      <div className='relative bg-transparent rounded-2xl p-8 text-constructbms-dark-1 overflow-hidden flex flex-col gap-8 border border-white'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-3xl font-bold mb-2'>
              {project?.name || 'Project Dashboard'}
            </h2>
            <p className='text-constructbms-blue text-lg'>
              {project?.client} • {project?.status}
            </p>
          </div>
          <button className='bg-constructbms-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-constructbms-blue/90 transition-colors'>
            Edit Project
          </button>
        </div>
        {/* Metrics Row - No Containers */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='text-2xl font-bold'>{metrics.progress}%</span>
            <span className='text-constructbms-blue font-medium'>Progress</span>
            <div className='w-full bg-constructbms-dark-1/10 rounded-full h-2 mt-2'>
              <div
                className='bg-constructbms-dark-1 h-2 rounded-full transition-all duration-1000'
                style={{ width: `${metrics.progress}%` }}
              ></div>
            </div>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='text-2xl font-bold'>
              {formatCurrency(metrics.spent)}
            </span>
            <span className='text-constructbms-blue font-medium'>Budget Used</span>
            <div className='w-full bg-constructbms-dark-1/10 rounded-full h-2 mt-2'>
              <div
                className='bg-constructbms-dark-1 h-2 rounded-full transition-all duration-1000'
                style={{
                  width: `${metrics.budget ? (metrics.spent / metrics.budget) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='text-2xl font-bold'>{metrics.tasks}</span>
            <span className='text-constructbms-blue font-medium'>Active Tasks</span>
            <div className='w-full bg-constructbms-dark-1/10 rounded-full h-2 mt-2'>
              <div
                className='bg-constructbms-dark-1 h-2 rounded-full transition-all duration-1000'
                style={{
                  width: `${metrics.tasks ? (metrics.completedTasks / metrics.tasks) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='text-2xl font-bold'>{metrics.team}</span>
            <span className='text-constructbms-blue font-medium'>Team Members</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Recent Activity */}
        <div className='lg:col-span-2'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600'>
            <h3 className='text-xl font-bold text-white mb-6 flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-constructbms-blue'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
              Recent Activity
            </h3>
            <div className='space-y-4'>
              {recentActivity.length === 0 && (
                <div className='text-gray-500 dark:text-gray-400'>No recent activity.</div>
              )}
              {recentActivity.map((item, idx) => (
                <div
                  key={idx}
                  className='flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                >
                                      <div className='w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center'>
                                          {/* Icon based on type */}
                      {item.type === 'task' ? (
                        <svg
                          className='w-5 h-5 text-constructbms-blue'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      ) : (
                        <svg
                          className='w-5 h-5 text-constructbms-blue'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='font-medium text-constructbms-blue'>
                      {item.type === 'task'
                        ? `Task "${item.title}" ${item.status === 'Completed' ? 'completed' : 'updated'}`
                        : `New document uploaded`}
                    </div>
                    <div className='text-sm text-constructbms-dark-2'>
                      {item.type === 'task'
                        ? `by ${item.assignee || 'Unknown'} • ${item.due_date || ''}`
                        : `${item.title || ''} • ${item.updated_at || ''}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Health */}
        <div className='space-y-6'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600'>
            <h3 className='text-xl font-bold text-white mb-6 flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-constructbms-blue'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
              Quick Actions
            </h3>
            <div className='space-y-3'>
              <button className='w-full bg-constructbms-blue text-white px-4 py-3 rounded-lg hover:bg-constructbms-blue/90 transition-all duration-200 transform hover:scale-105 shadow-md'>
                <div className='flex items-center justify-center gap-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                    />
                  </svg>
                  Add Task
                </div>
              </button>
              <button 
                className='w-full bg-constructbms-blue/20 text-white border border-constructbms-blue/30 px-4 py-3 rounded-lg hover:bg-constructbms-blue/30 transition-all duration-200 transform hover:scale-105 shadow-md'
                title='Schedule Meeting'
              >
                <div className='flex items-center justify-center gap-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  Schedule Meeting
                </div>
              </button>
              <button 
                className='w-full bg-constructbms-blue/20 text-white border border-constructbms-blue/30 px-4 py-3 rounded-lg hover:bg-constructbms-blue/30 transition-all duration-200 transform hover:scale-105 shadow-md'
                title='Create Document'
              >
                <div className='flex items-center justify-center gap-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  Create Document
                </div>
              </button>
              <button className='w-full bg-constructbms-blue/20 text-white border border-constructbms-blue/30 px-4 py-3 rounded-lg hover:bg-constructbms-blue/30 transition-all duration-200 transform hover:scale-105 shadow-md'>
                <div className='flex items-center justify-center gap-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                  Update Status
                </div>
              </button>
            </div>
          </div>

          <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600'>
            <h3 className='text-xl font-bold text-white mb-6 flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-constructbms-blue'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
              Project Health
            </h3>
            <div className='space-y-6'>
              <div>
                <div className='flex justify-between text-sm mb-2'>
                  <span className='font-medium text-white'>Timeline</span>
                  <span className='text-green-600 font-semibold'>On Track</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className='bg-constructbms-blue h-3 rounded-full transition-all duration-1000'
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className='flex justify-between text-sm mb-2'>
                  <span className='font-medium text-white'>Budget</span>
                  <span className='text-gray-600 font-semibold'>75% Used</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className='bg-constructbms-blue h-3 rounded-full transition-all duration-1000'
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className='flex justify-between text-sm mb-2'>
                  <span className='font-medium'>Quality</span>
                  <span className='text-constructbms-blue font-semibold'>
                    Excellent
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className='bg-constructbms-blue h-3 rounded-full transition-all duration-1000'
                    style={{ width: '95%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ProjectModal Component
const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!project) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-7xl mx-4 h-[95vh] overflow-hidden border border-gray-100 shadow-2xl">
        {/* Simple Header */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
              <p className="text-gray-600">{project.client}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Simple Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-constructbms-blue text-constructbms-blue bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(95vh-120px)]">
          {activeTab === 'dashboard' && (
            <div className="p-6">
              <ProjectDashboardTab project={project} />
            </div>
          )}
          {activeTab === 'gantt' && (
            <div className="p-4">
              <AdvancedGanttTab project={project} />
            </div>
          )}
          {activeTab === 'bim' && (
            <div className="p-6">
              <BIMIntegrationTab project={project} />
            </div>
          )}
          {/* For other tabs, show a simple placeholder */}
          {activeTab !== 'dashboard' && activeTab !== 'gantt' && activeTab !== 'bim' && (
            <div className="p-8">
              <div className="text-center text-gray-500">
                <h3 className="text-lg font-medium mb-2">{TABS.find(t => t.key === activeTab)?.label}</h3>
                <p>This tab is under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
