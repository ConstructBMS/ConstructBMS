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
} from '@heroicons/react/24/outline';
import type { Project } from '../../services/demoData';
import { demoDataService, Task as DemoTask } from '../../services/demoData';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Document, documentService } from '../../services/documentService';

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
});

// Type definition for component Task
interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  assignee?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  priority?: string;
  position?: number;
  client_visible?: boolean;
  customer_id?: string;
  opportunity_id?: string;
  type?: string;
}

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
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
  {
    key: 'work-structure',
    label: 'Work Structure',
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
}

function getPriorityColor(priority: string) {
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

const ProjectDashboardTab: React.FC<{
  project: Project;
  onMarkChanged?: () => void;
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
      {/* Hero Section - Archer Banner with Direct Metrics */}
      <div className='relative bg-gradient-to-r from-archer-neon via-[#00c4b4] to-green-800 rounded-2xl p-8 text-black overflow-hidden flex flex-col gap-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-3xl font-bold mb-2'>
              {project?.name || 'Project Dashboard'}
            </h2>
            <p className='text-black/80 text-lg'>
              {project?.client} • {project?.status}
            </p>
          </div>
          <button className='bg-black/10 text-black px-4 py-2 rounded-lg font-medium hover:bg-black/20 transition-colors'>
            Edit Project
          </button>
        </div>
        {/* Metrics Row - No Containers */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='text-2xl font-bold'>{metrics.progress}%</span>
            <span className='text-black/80'>Progress</span>
            <div className='w-full bg-black/10 rounded-full h-2 mt-2'>
              <div
                className='bg-black h-2 rounded-full transition-all duration-1000'
                style={{ width: `${metrics.progress}%` }}
              ></div>
            </div>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='text-2xl font-bold'>
              {formatCurrency(metrics.spent)}
            </span>
            <span className='text-black/80'>Budget Used</span>
            <div className='w-full bg-black/10 rounded-full h-2 mt-2'>
              <div
                className='bg-black h-2 rounded-full transition-all duration-1000'
                style={{
                  width: `${metrics.budget ? (metrics.spent / metrics.budget) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='text-2xl font-bold'>{metrics.tasks}</span>
            <span className='text-black/80'>Active Tasks</span>
            <div className='w-full bg-black/10 rounded-full h-2 mt-2'>
              <div
                className='bg-black h-2 rounded-full transition-all duration-1000'
                style={{
                  width: `${metrics.tasks ? (metrics.completedTasks / metrics.tasks) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='text-2xl font-bold'>{metrics.team}</span>
            <span className='text-black/80'>Team Members</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Recent Activity */}
        <div className='lg:col-span-2'>
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-archer-neon'
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
                <div className='text-gray-500'>No recent activity.</div>
              )}
              {recentActivity.map((item, idx) => (
                <div
                  key={idx}
                  className='flex items-center space-x-4 p-3 bg-gradient-to-r from-archer-neon/10 to-[#00c4b4]/20 rounded-lg border-l-4 border-archer-neon'
                >
                  <div className='w-10 h-10 bg-archer-neon rounded-full flex items-center justify-center'>
                    {/* Icon based on type */}
                    {item.type === 'task' ? (
                      <svg
                        className='w-5 h-5 text-black'
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
                        className='w-5 h-5 text-black'
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
                    <div className='font-medium text-gray-900'>
                      {item.type === 'task'
                        ? `Task "${item.title}" ${item.status === 'Completed' ? 'completed' : 'updated'}`
                        : `New document uploaded`}
                    </div>
                    <div className='text-sm text-gray-600'>
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
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-archer-neon'
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
              <button className='w-full bg-gradient-to-r from-archer-neon to-[#00c4b4] text-black px-4 py-3 rounded-lg hover:from-[#00c4b4] hover:to-green-700 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-md'>
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
              <button className='w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-md'>
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
              <button className='w-full bg-gradient-to-r from-archer-neon to-[#00c4b4] text-black px-4 py-3 rounded-lg hover:from-[#00c4b4] hover:to-green-700 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-md'>
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
              <button className='w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-3 rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-200 transform hover:scale-105 shadow-md'>
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

          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-archer-neon'
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
                  <span className='font-medium'>Timeline</span>
                  <span className='text-green-600 font-semibold'>On Track</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className='bg-gradient-to-r from-archer-neon to-[#00c4b4] h-3 rounded-full transition-all duration-1000'
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className='flex justify-between text-sm mb-2'>
                  <span className='font-medium'>Budget</span>
                  <span className='text-gray-600 font-semibold'>75% Used</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className='bg-gradient-to-r from-gray-600 to-gray-700 h-3 rounded-full transition-all duration-1000'
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className='flex justify-between text-sm mb-2'>
                  <span className='font-medium'>Quality</span>
                  <span className='text-archer-neon font-semibold'>
                    Excellent
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className='bg-gradient-to-r from-archer-neon to-[#00c4b4] h-3 rounded-full transition-all duration-1000'
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

const TasksTab: React.FC<{ project: Project; onMarkChanged?: () => void }> = ({
  project,
  onMarkChanged,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'list' | 'assignee'>('kanban');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const demoTasks = await demoDataService.getTasks();
      const projectTasks = Array.isArray(demoTasks)
        ? demoTasks
            .filter(t => t.projectId === project.id)
            .map(convertDemoTaskToTask)
        : [];
      setTasks(projectTasks);

      // Extract assignees from tasks
      const taskAssignees = Array.from(
        new Set(
          projectTasks.map(task => task.assignee).filter(Boolean) as string[]
        )
      );
      setAssignees(taskAssignees);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
      setTasks([]);
      setAssignees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [project.id]);

  const handleAddTask = async (task: Partial<Task>) => {
    try {
      const newTask: Task = {
        id: Date.now().toString(),
        project_id: project.id.toString(),
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'To Do',
        assignee: task.assignee || '',
        due_date: task.due_date || '',
        priority: task.priority || 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        position: tasks.length + 1,
      };

      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);

      // Convert back to demo format and save
      const allDemoTasks = await demoDataService.getTasks();
      const demoTasks = Array.isArray(allDemoTasks) ? allDemoTasks : [];
      const newDemoTask: DemoTask = {
        id: parseInt(newTask.id),
        title: newTask.title,
        description: newTask.description || '',
        project: project.name,
        projectId: project.id,
        assignee: newTask.assignee || '',
        priority: (newTask.priority as 'low' | 'medium' | 'high') || 'medium',
        status: (newTask.status === 'Completed'
          ? 'completed'
          : newTask.status === 'In Progress'
            ? 'in-progress'
            : 'pending') as 'completed' | 'pending' | 'in-progress',
        dueDate: newTask.due_date || '',
        tags: [],
        estimatedHours: 0,
        actualHours: 0,
        isDemoData: true,
        createdAt: newTask.created_at || new Date().toISOString(),
        demoId: `task-${newTask.id}`,
      };

      demoTasks.push(newDemoTask);
      await demoDataService.saveTasks(demoTasks);
      setShowAddTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTasks = tasks.map(task =>
        task.id === taskId
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      );
      setTasks(updatedTasks);

      // Convert back to demo format and save
      const allDemoTasks = await demoDataService.getTasks();
      const demoTasks = Array.isArray(allDemoTasks) ? allDemoTasks : [];
      const updatedDemoTasks = demoTasks.map(demoTask => {
        if (demoTask.id.toString() === taskId) {
          return {
            ...demoTask,
            title: updates.title || demoTask.title,
            description: updates.description || demoTask.description,
            assignee: updates.assignee || demoTask.assignee,
            priority:
              (updates.priority as 'low' | 'medium' | 'high') ||
              demoTask.priority,
            status:
              updates.status === 'Completed'
                ? 'completed'
                : updates.status === 'In Progress'
                  ? 'in-progress'
                  : 'pending',
            dueDate: updates.due_date || demoTask.dueDate,
          };
        }
        return demoTask;
      });

      await demoDataService.saveTasks(updatedDemoTasks);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      setTasks(updatedTasks);

      // Convert back to demo format and save
      const allDemoTasks = await demoDataService.getTasks();
      const demoTasks = Array.isArray(allDemoTasks)
        ? allDemoTasks.filter(t => t.id.toString() !== taskId)
        : [];
      await demoDataService.saveTasks(demoTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className='max-w-6xl mx-auto'>
      {/* Banner - Archer Gradient with Direct Metrics */}
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black mb-8 shadow-lg flex flex-col gap-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
              <ClipboardDocumentListIcon className='w-6 h-6 text-black' />
            </div>
            <h3 className='text-3xl font-bold'>Project Tasks</h3>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className='bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md'
          >
            <div className='flex items-center gap-2'>
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
        </div>
        {/* Metrics Row - No Containers, with Icons */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {tasks.filter(t => t.status === 'To Do').length}
            </span>
            <span className='text-black/80'>To Do</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {tasks.filter(t => t.status === 'In Progress').length}
            </span>
            <span className='text-black/80'>In Progress</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {tasks.filter(t => t.status === 'Needs Approval').length}
            </span>
            <span className='text-black/80'>Review</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CheckCircleIcon className='w-5 h-5 text-black' />
              {tasks.filter(t => t.status === 'Completed').length}
            </span>
            <span className='text-black/80'>Completed</span>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className='flex items-center gap-4 mb-6 bg-white rounded-xl p-4 shadow-lg border border-gray-100'>
        <button
          onClick={() => setView('kanban')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            view === 'kanban'
              ? 'bg-gradient-to-r from-archer-neon to-[#00c4b4] text-black shadow-md transform scale-105'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className='flex items-center gap-2'>
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
              />
            </svg>
            Kanban
          </div>
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            view === 'list'
              ? 'bg-gradient-to-r from-archer-neon to-[#00c4b4] text-black shadow-md transform scale-105'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className='flex items-center gap-2'>
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 10h16M4 14h16M4 18h16'
              />
            </svg>
            List
          </div>
        </button>
        <button
          onClick={() => setView('assignee')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            view === 'assignee'
              ? 'bg-gradient-to-r from-archer-neon to-[#00c4b4] text-black shadow-md transform scale-105'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className='flex items-center gap-2'>
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
            By Assignee
          </div>
        </button>
      </div>
      {loading && (
        <div className='text-center text-gray-500 py-8'>Loading tasks...</div>
      )}
      {error && <div className='text-center text-red-500 py-4'>{error}</div>}
      {!loading && !error && view === 'kanban' && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          {[
            {
              status: 'To Do',
              color: 'from-gray-600 to-gray-700',
              icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            },
            {
              status: 'In Progress',
              color: 'from-archer-neon to-[#00c4b4]',
              icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            },
            {
              status: 'Needs Approval',
              color: 'from-gray-700 to-gray-800',
              icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            },
            {
              status: 'Completed',
              color: 'from-archer-neon to-[#00c4b4]',
              icon: 'M5 13l4 4L19 7',
            },
          ].map(({ status, color, icon }) => (
            <div
              key={status}
              className='bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col'
            >
              <div
                className={`bg-gradient-to-r ${color} text-white p-4 rounded-t-xl`}
              >
                <div className='flex items-center gap-2'>
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
                      d={icon}
                    />
                  </svg>
                  <h5 className='font-semibold'>{status}</h5>
                  <span className='ml-auto bg-white/20 px-2 py-1 rounded-full text-xs'>
                    {tasks.filter(t => t.status === status).length}
                  </span>
                </div>
              </div>
              <div className='flex-1 p-4 space-y-3'>
                {tasks
                  .filter(t => t.status === status)
                  .map(task => (
                    <div
                      key={task.id}
                      className='bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border border-gray-200 transition-all duration-200 hover:shadow-md'
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <span className='font-medium text-gray-900'>
                          {task.title}
                        </span>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className='text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors'
                        >
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        </button>
                      </div>
                      <div className='text-sm text-gray-600 mb-3'>
                        <div className='flex items-center gap-1'>
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                            />
                          </svg>
                          {task.assignee || 'Unassigned'}
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        {status === 'To Do' && (
                          <button
                            onClick={() =>
                              handleUpdateTask(task.id, {
                                status: 'In Progress',
                              })
                            }
                            className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors'
                          >
                            Start
                          </button>
                        )}
                        {status === 'In Progress' && (
                          <button
                            onClick={() =>
                              handleUpdateTask(task.id, {
                                status: 'Needs Approval',
                              })
                            }
                            className='bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors'
                          >
                            Review
                          </button>
                        )}
                        {status === 'Needs Approval' && (
                          <button
                            onClick={() =>
                              handleUpdateTask(task.id, { status: 'Completed' })
                            }
                            className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors'
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && view === 'list' && (
        <table className='min-w-full bg-white dark:bg-gray-800 rounded-xl shadow'>
          <thead>
            <tr>
              <th className='px-4 py-2 text-left'>Title</th>
              <th className='px-4 py-2 text-left'>Status</th>
              <th className='px-4 py-2 text-left'>Assignee</th>
              <th className='px-4 py-2 text-left'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className='border-t'>
                <td className='px-4 py-2'>{task.title}</td>
                <td className='px-4 py-2'>{task.status}</td>
                <td className='px-4 py-2'>{task.assignee}</td>
                <td className='px-4 py-2'>
                  <button
                    onClick={() =>
                      handleUpdateTask(task.id, { status: 'Completed' })
                    }
                    className='text-green-500 mr-2'
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className='text-red-500'
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && !error && view === 'assignee' && (
        <div className='space-y-6'>
          {assignees.map(assignee => (
            <div key={assignee}>
              <h5 className='font-semibold text-gray-900 dark:text-white mb-2'>
                {assignee}
              </h5>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {tasks
                  .filter(t => t.assignee === assignee)
                  .map(task => (
                    <div
                      key={task.id}
                      className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex flex-col gap-2'
                    >
                      <span className='font-medium text-gray-900 dark:text-white'>
                        {task.title}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {task.status}
                      </span>
                      <div className='flex gap-2'>
                        <button
                          onClick={() =>
                            handleUpdateTask(task.id, { status: 'Completed' })
                          }
                          className='text-green-500'
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className='text-red-500'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GanttTab: React.FC<{ project: Project; onMarkChanged?: () => void }> = ({
  project,
  onMarkChanged,
}) => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const demoTasks = await demoDataService.getTasks();
      const projectTasks = Array.isArray(demoTasks)
        ? demoTasks
            .filter(t => t.projectId === project.id)
            .map(convertDemoTaskToTask)
        : [];

      // Convert to Gantt format
      const ganttTasks: GanttTask[] = projectTasks.map(task => ({
        id: task.id,
        name: task.title,
        start: new Date(task.created_at || new Date()),
        end: new Date(
          task.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ),
        progress:
          task.status === 'Completed'
            ? 100
            : task.status === 'In Progress'
              ? 50
              : 0,
        type: 'task',
        hideChildren: false,
        styles: {
          backgroundColor:
            task.priority === 'high'
              ? '#ef4444'
              : task.priority === 'medium'
                ? '#f59e0b'
                : '#10b981',
        },
      }));

      setTasks(ganttTasks);
    } catch (error) {
      console.error('Error loading tasks for Gantt:', error);
      setError('Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadTasks();
    // eslint-disable-next-line
  }, [project.id]);

  const handleTaskChange = async (task: GanttTask) => {
    setLoading(true);
    try {
      // Update task in Supabase
      await updateTask(task.id, {
        due_date: task.end.toISOString(),
        status: task.progress === 100 ? 'Completed' : 'In Progress',
      });
      await loadTasks();
      onMarkChanged?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black mb-8 shadow-lg flex flex-col gap-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
              <ChartBarIcon className='w-6 h-6 text-black' />
            </div>
            <h3 className='text-3xl font-bold'>Project Gantt Chart</h3>
          </div>
        </div>
      </div>
      {loading && (
        <div className='text-center text-gray-500 py-8'>
          Loading Gantt chart...
        </div>
      )}
      {error && <div className='text-center text-red-500 py-4'>{error}</div>}
      {!loading && !error && (
        <Gantt
          tasks={tasks}
          viewMode={view}
          onDateChange={handleTaskChange}
          onProgressChange={handleTaskChange}
          onDoubleClick={handleTaskChange}
        />
      )}
    </div>
  );
};

const WorkStructureTab: React.FC = () => {
  const [workPackages, setWorkPackages] = useState([
    {
      id: 1,
      name: 'Design Phase',
      status: 'Completed',
      progress: 100,
      budget: 15000,
      actual: 14500,
    },
    {
      id: 2,
      name: 'Development Phase',
      status: 'In Progress',
      progress: 65,
      budget: 45000,
      actual: 32000,
    },
    {
      id: 3,
      name: 'Testing Phase',
      status: 'Not Started',
      progress: 0,
      budget: 20000,
      actual: 0,
    },
    {
      id: 4,
      name: 'Deployment Phase',
      status: 'Not Started',
      progress: 0,
      budget: 10000,
      actual: 0,
    },
  ]);

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Banner - Archer Gradient with Direct Metrics */}
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black shadow-lg flex flex-col gap-6'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
            <ClipboardDocumentListIcon className='w-6 h-6 text-black' />
          </div>
          <h4 className='text-3xl font-bold'>Work Breakdown Structure</h4>
        </div>
        {/* Metrics Row - No Containers, with Icons */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {workPackages.length}
            </span>
            <span className='text-black/80'>Total Phases</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CheckCircleIcon className='w-5 h-5 text-black' />
              {workPackages.filter(wp => wp.status === 'Completed').length}
            </span>
            <span className='text-black/80'>Completed</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {workPackages.filter(wp => wp.status === 'In Progress').length}
            </span>
            <span className='text-black/80'>In Progress</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CurrencyPoundIcon className='w-5 h-5 text-black' />
              {formatCurrency(
                workPackages.reduce((sum, wp) => sum + wp.budget, 0)
              )}
            </span>
            <span className='text-black/80'>Total Budget</span>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
        <div className='space-y-4'>
          {workPackages.map(wp => (
            <div
              key={wp.id}
              className='border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-gray-50 to-white'
            >
              <div className='flex items-center justify-between mb-4'>
                <h5 className='font-semibold text-gray-900 text-lg'>
                  {wp.name}
                </h5>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(wp.status)}`}
                >
                  {wp.status}
                </span>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='bg-white rounded-lg p-4 border border-gray-100'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Progress
                  </label>
                  <div className='flex items-center gap-3'>
                    <div className='flex-1 bg-gray-200 rounded-full h-3'>
                      <div
                        className='bg-gradient-to-r from-archer-neon to-[#00c4b4] h-3 rounded-full transition-all duration-1000'
                        style={{ width: `${wp.progress}%` }}
                      ></div>
                    </div>
                    <span className='text-lg font-bold text-gray-900'>
                      {wp.progress}%
                    </span>
                  </div>
                </div>
                <div className='bg-white rounded-lg p-4 border border-gray-100'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Budget
                  </label>
                  <p className='text-lg font-bold text-gray-900'>
                    {formatCurrency(wp.budget)}
                  </p>
                </div>
                <div className='bg-white rounded-lg p-4 border border-gray-100'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Actual
                  </label>
                  <p className='text-lg font-bold text-gray-900'>
                    {formatCurrency(wp.actual)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DocumentsTab: React.FC<{
  project: Project;
  onMarkChanged?: () => void;
}> = ({ project, onMarkChanged }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Document | null>(
    null
  );

  useEffect(() => {
    loadProjectDocuments();
    loadTemplates();
  }, [project.id]);

  const loadProjectDocuments = async () => {
    try {
      const projectDocs = await documentService.getDocuments({
        assignedToProject: String(project.id),
      });
      setDocuments(projectDocs);
    } catch (error) {
      console.error('Error loading project documents:', error);
      // Fallback to demo data
      setDocuments([
        {
          id: '1',
          title: 'Project Charter',
          description: 'Project charter document',
          category: 'contracts',
          content: '',
          tags: ['charter', 'project'],
          is_template: false,
          created_at: '2024-01-15',
          updated_at: '2024-01-15',
          version: 1,
          created_by: 'user@example.com',
          is_archived: false,
          assigned_projects: [String(project.id)],
          permissions: { can_edit: [], can_view: [], can_delete: [] },
        },
        {
          id: '2',
          title: 'Technical Specifications',
          description: 'Technical specs document',
          category: 'reports',
          content: '',
          tags: ['technical', 'specs'],
          is_template: false,
          created_at: '2024-01-20',
          updated_at: '2024-01-20',
          version: 1,
          created_by: 'user@example.com',
          is_archived: false,
          assigned_projects: [String(project.id)],
          permissions: { can_edit: [], can_view: [], can_delete: [] },
        },
        {
          id: '3',
          title: 'Design Mockups',
          description: 'Design mockups and wireframes',
          category: 'files',
          content: '',
          tags: ['design', 'mockups'],
          is_template: false,
          created_at: '2024-01-25',
          updated_at: '2024-01-25',
          version: 1,
          created_by: 'user@example.com',
          is_archived: false,
          assigned_projects: [String(project.id)],
          permissions: { can_edit: [], can_view: [], can_delete: [] },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const allTemplates = await documentService.getDocuments({
        isTemplate: true,
      });
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to demo templates
      setTemplates([
        {
          id: 't1',
          title: 'Project Proposal Template',
          description: 'Standard project proposal template',
          category: 'proposals',
          content: '',
          tags: ['proposal', 'template'],
          is_template: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          version: 1,
          created_by: 'user@example.com',
          is_archived: false,
          assigned_projects: [],
          permissions: { can_edit: [], can_view: [], can_delete: [] },
        },
        {
          id: 't2',
          title: 'Contract Template',
          description: 'Standard contract template',
          category: 'contracts',
          content: '',
          tags: ['contract', 'template'],
          is_template: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          version: 1,
          created_by: 'user@example.com',
          is_archived: false,
          assigned_projects: [],
          permissions: { can_edit: [], can_view: [], can_delete: [] },
        },
        {
          id: 't3',
          title: 'Meeting Minutes Template',
          description: 'Meeting minutes template',
          category: 'reports',
          content: '',
          tags: ['meeting', 'minutes', 'template'],
          is_template: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          version: 1,
          created_by: 'user@example.com',
          is_archived: false,
          assigned_projects: [],
          permissions: { can_edit: [], can_view: [], can_delete: [] },
        },
      ]);
    }
  };

  const handleUseTemplate = async (template: Document) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleCreateFromTemplate = async (
    template: Document,
    title: string
  ) => {
    try {
      const newDocument = {
        title: title,
        description: `Created from template: ${template.title}`,
        category: template.category,
        content: template.content,
        tags: [...template.tags, 'project-doc'],
        is_template: false,
        permissions: {
          can_edit: [],
          can_view: [],
          can_delete: [],
        },
      };

      const createdDocument = await documentService.createDocument(newDocument);
      await documentService.assignToProject(
        createdDocument.id,
        String(project.id)
      );
      await loadProjectDocuments();
      onMarkChanged?.();
      setShowTemplateModal(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error creating document from template:', error);
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-archer-neon/20 text-archer-neon border border-archer-neon/30';
      case 'In Review':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'Pending':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className='max-w-6xl mx-auto space-y-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='animate-pulse'>
            <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
            <div className='space-y-3'>
              <div className='h-4 bg-gray-200 rounded'></div>
              <div className='h-4 bg-gray-200 rounded w-5/6'></div>
              <div className='h-4 bg-gray-200 rounded w-4/6'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Banner - Archer Gradient with Direct Metrics */}
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black shadow-lg flex flex-col gap-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
              <DocumentTextIcon className='w-6 h-6 text-black' />
            </div>
            <h3 className='text-3xl font-bold'>Project Documents</h3>
          </div>
        </div>
        {/* Metrics Row - No Containers, with Icons */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <DocumentTextIcon className='w-5 h-5 text-black' />
              {documents.length}
            </span>
            <span className='text-black/80'>Documents</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {templates.length}
            </span>
            <span className='text-black/80'>Templates</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <DocumentTextIcon className='w-5 h-5 text-black' />
              {documents.filter(d => d.category === 'contracts').length}
            </span>
            <span className='text-black/80'>Contracts</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <DocumentTextIcon className='w-5 h-5 text-black' />
              {documents.filter(d => d.category === 'reports').length}
            </span>
            <span className='text-black/80'>Reports</span>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
        <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
          <DocumentTextIcon className='h-5 w-5 text-archer-neon' />
          Document Templates
        </h4>
        <p className='text-sm text-gray-600 mb-4'>
          Use these templates to quickly create project documents
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {templates.map(template => (
            <div
              key={template.id}
              className='group border border-gray-200 rounded-xl p-6 hover:border-archer-neon hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-white'
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-gradient-to-br from-archer-neon to-[#00c4b4] rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-black'
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
                </div>
                <h5 className='font-semibold text-gray-900 text-lg'>
                  {template.title}
                </h5>
              </div>
              <p className='text-sm text-gray-600 mb-4'>
                {template.description}
              </p>
              <div className='flex flex-wrap gap-2 mb-4'>
                {template.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className='px-3 py-1 bg-archer-neon/10 text-archer-neon text-xs rounded-full font-medium'
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleUseTemplate(template)}
                className='w-full bg-gradient-to-r from-archer-neon to-[#00c4b4] text-black px-4 py-3 rounded-lg font-medium hover:from-[#00c4b4] hover:to-green-700 hover:text-white transition-all duration-200 transform hover:scale-105 shadow-md'
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Project Documents */}
      <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
        <h4 className='font-semibold text-gray-900 mb-6 flex items-center gap-2'>
          <DocumentTextIcon className='h-5 w-5 text-archer-neon' />
          Project Documents
        </h4>
        {documents.length === 0 ? (
          <div className='text-center py-8'>
            <DocumentTextIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-600'>
              No documents created yet. Use a template above to get started.
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Document
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Category
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Created
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Tags
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {documents.map(doc => (
                  <tr key={doc.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {doc.title}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {doc.description}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-gray-500'>
                        {doc.category}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='text-sm text-gray-500'>
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex flex-wrap gap-1'>
                        {doc.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'
                          >
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 3 && (
                          <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>
                            +{doc.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button className='text-archer-neon hover:text-archer-neon/80 mr-3'>
                        Edit
                      </button>
                      <button className='text-blue-600 hover:text-blue-900 mr-3'>
                        View
                      </button>
                      <button className='text-red-600 hover:text-red-900'>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Template Modal */}
      {showTemplateModal && selectedTemplate && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Create Document from Template
            </h3>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Document Title
              </label>
              <input
                type='text'
                placeholder={`${selectedTemplate.title} - ${project.name}`}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                id='document-title'
              />
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  const title =
                    (
                      document.getElementById(
                        'document-title'
                      ) as HTMLInputElement
                    )?.value || `${selectedTemplate.title} - ${project.name}`;
                  handleCreateFromTemplate(selectedTemplate, title);
                }}
                className='flex-1 bg-archer-neon text-black px-4 py-2 rounded-lg font-medium hover:bg-archer-neon/90 transition-colors'
              >
                Create Document
              </button>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplate(null);
                }}
                className='flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FinanceTab: React.FC<{
  project: Project;
  onMarkChanged?: () => void;
}> = ({ project, onMarkChanged }) => {
  const [financials, setFinancials] = useState({
    budget: project.budget,
    spent: 46500,
    remaining: project.budget - 46500,
    invoiced: 35000,
    received: 28000,
    outstanding: 7000,
  });

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      category: 'Development',
      amount: 25000,
      date: '2024-01-15',
      description: 'Frontend development costs',
    },
    {
      id: 2,
      category: 'Design',
      amount: 8000,
      date: '2024-01-20',
      description: 'UI/UX design work',
    },
    {
      id: 3,
      category: 'Testing',
      amount: 5000,
      date: '2024-01-25',
      description: 'QA and testing services',
    },
    {
      id: 4,
      category: 'Infrastructure',
      amount: 8500,
      date: '2024-01-30',
      description: 'Server and hosting costs',
    },
  ]);

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Banner - Archer Gradient with Direct Metrics */}
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black shadow-lg flex flex-col gap-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
              <CurrencyPoundIcon className='w-6 h-6 text-black' />
            </div>
            <h3 className='text-3xl font-bold'>Project Finance</h3>
          </div>
        </div>
        {/* Metrics Row - No Containers, with Icons */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CurrencyPoundIcon className='w-5 h-5 text-black' />
              {formatCurrency(financials.budget)}
            </span>
            <span className='text-black/80'>Total Budget</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CurrencyPoundIcon className='w-5 h-5 text-black' />
              {formatCurrency(financials.spent)}
            </span>
            <span className='text-black/80'>Spent</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CurrencyPoundIcon className='w-5 h-5 text-black' />
              {formatCurrency(financials.remaining)}
            </span>
            <span className='text-black/80'>Remaining</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CurrencyPoundIcon className='w-5 h-5 text-black' />
              {formatCurrency(financials.invoiced)}
            </span>
            <span className='text-black/80'>Invoiced</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CurrencyPoundIcon className='w-5 h-5 text-black' />
              {formatCurrency(financials.received)}
            </span>
            <span className='text-black/80'>Received</span>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
          <h4 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-archer-neon to-[#00c4b4] rounded-lg flex items-center justify-center'>
              <svg
                className='w-4 h-4 text-black'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
            </div>
            Budget Overview
          </h4>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Total Budget
              </span>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {formatCurrency(financials.budget)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Spent
              </span>
              <span className='font-semibold text-red-600'>
                {formatCurrency(financials.spent)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Remaining
              </span>
              <span className='font-semibold text-green-600'>
                {formatCurrency(financials.remaining)}
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-gradient-to-r from-archer-neon to-[#00c4b4] h-2 rounded-full transition-all duration-1000'
                style={{
                  width: `${(financials.spent / financials.budget) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow'>
          <h4 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
            <CurrencyPoundIcon className='h-5 w-5 text-green-500' />
            Revenue
          </h4>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Invoiced
              </span>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {formatCurrency(financials.invoiced)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Received
              </span>
              <span className='font-semibold text-green-600'>
                {formatCurrency(financials.received)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Outstanding
              </span>
              <span className='font-semibold text-orange-600'>
                {formatCurrency(financials.outstanding)}
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow'>
          <h4 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
            <CurrencyPoundIcon className='h-5 w-5 text-purple-500' />
            Profitability
          </h4>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Gross Profit
              </span>
              <span className='font-semibold text-green-600'>
                {formatCurrency(financials.invoiced - financials.spent)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Margin
              </span>
              <span className='font-semibold text-gray-900 dark:text-white'>
                {(
                  ((financials.invoiced - financials.spent) /
                    financials.invoiced) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow'>
        <h4 className='font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2'>
          <CurrencyPoundIcon className='h-5 w-5 text-blue-500' />
          Expense Breakdown
        </h4>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 dark:bg-gray-700'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Category
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Amount
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Description
                </th>
              </tr>
            </thead>
            <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
              {expenses.map(expense => (
                <tr
                  key={expense.id}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-sm font-medium text-gray-900 dark:text-white'>
                      {expense.category}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      {formatCurrency(expense.amount)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-sm text-gray-500 dark:text-gray-400'>
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <span className='text-sm text-gray-500 dark:text-gray-400'>
                      {expense.description}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TeamTab: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Project Manager',
      email: 'sarah.johnson@archer.com',
      status: 'Active',
      avatar: 'SJ',
    },
    {
      id: 2,
      name: 'Mike Wilson',
      role: 'Lead Developer',
      email: 'mike.wilson@archer.com',
      status: 'Active',
      avatar: 'MW',
    },
    {
      id: 3,
      name: 'Emma Davis',
      role: 'UI/UX Designer',
      email: 'emma.davis@archer.com',
      status: 'Active',
      avatar: 'ED',
    },
    {
      id: 4,
      name: 'Tom Brown',
      role: 'QA Engineer',
      email: 'tom.brown@archer.com',
      status: 'On Leave',
      avatar: 'TB',
    },
    {
      id: 5,
      name: 'Lisa Chen',
      role: 'DevOps Engineer',
      email: 'lisa.chen@archer.com',
      status: 'Active',
      avatar: 'LC',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-700';
      case 'Inactive':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Banner - Archer Gradient with Direct Metrics */}
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black shadow-lg flex flex-col gap-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
              <UserIcon className='w-6 h-6 text-black' />
            </div>
            <h3 className='text-3xl font-bold'>Project Team</h3>
          </div>
        </div>
        {/* Metrics Row - No Containers, with Icons */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <UserIcon className='w-5 h-5 text-black' />
              {teamMembers.length}
            </span>
            <span className='text-black/80'>Team Members</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CheckCircleIcon className='w-5 h-5 text-black' />
              {teamMembers.filter(m => m.status === 'Active').length}
            </span>
            <span className='text-black/80'>Active</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CalendarIcon className='w-5 h-5 text-black' />
              {teamMembers.filter(m => m.status === 'On Leave').length}
            </span>
            <span className='text-black/80'>On Leave</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <UserIcon className='w-5 h-5 text-black' />
              {teamMembers.filter(m => m.role.includes('Lead')).length}
            </span>
            <span className='text-black/80'>Leads</span>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
        <h4 className='font-semibold text-gray-900 mb-6 flex items-center gap-2'>
          <div className='w-8 h-8 bg-gradient-to-br from-archer-neon to-[#00c4b4] rounded-lg flex items-center justify-center'>
            <svg
              className='w-4 h-4 text-black'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
          </div>
          Team Members
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {teamMembers.map(member => (
            <div
              key={member.id}
              className='border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-white'
            >
              <div className='flex items-center space-x-4 mb-4'>
                <div className='w-12 h-12 bg-gradient-to-br from-archer-neon to-[#00c4b4] rounded-full flex items-center justify-center text-black font-bold text-lg'>
                  {member.avatar}
                </div>
                <div>
                  <h5 className='font-medium text-gray-900 dark:text-white'>
                    {member.name}
                  </h5>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {member.role}
                  </p>
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
                  <span className='w-16'>Email:</span>
                  <span>{member.email}</span>
                </div>
                <div className='flex items-center'>
                  <span className='text-sm text-gray-600 dark:text-gray-400 w-16'>
                    Status:
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
              <div className='mt-4 flex space-x-2'>
                <button className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm'>
                  Message
                </button>
                <button className='text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm'>
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EventsTab: React.FC = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Project Kickoff Meeting',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Meeting',
      attendees: ['Sarah Johnson', 'Mike Wilson', 'Emma Davis'],
    },
    {
      id: 2,
      title: 'Design Review',
      date: '2024-01-20',
      time: '2:00 PM',
      type: 'Review',
      attendees: ['Emma Davis', 'Sarah Johnson'],
    },
    {
      id: 3,
      title: 'Client Presentation',
      date: '2024-01-25',
      time: '11:00 AM',
      type: 'Presentation',
      attendees: ['Sarah Johnson', 'Mike Wilson'],
    },
    {
      id: 4,
      title: 'Sprint Planning',
      date: '2024-01-30',
      time: '9:00 AM',
      type: 'Planning',
      attendees: ['Mike Wilson', 'Tom Brown', 'Lisa Chen'],
    },
  ]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Meeting':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'Review':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'Presentation':
        return 'bg-gradient-to-r from-archer-neon to-green-600 text-black';
      case 'Planning':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Banner - Archer Gradient with Direct Metrics */}
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black shadow-lg flex flex-col gap-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
              <CalendarIcon className='w-6 h-6 text-black' />
            </div>
            <h3 className='text-3xl font-bold'>Project Events</h3>
          </div>
        </div>
        {/* Metrics Row - No Containers, with Icons */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CalendarIcon className='w-5 h-5 text-black' />
              {events.length}
            </span>
            <span className='text-black/80'>Scheduled Events</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <UserIcon className='w-5 h-5 text-black' />
              {events.filter(e => e.type === 'Meeting').length}
            </span>
            <span className='text-black/80'>Meetings</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {events.filter(e => e.type === 'Review').length}
            </span>
            <span className='text-black/80'>Reviews</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <DocumentTextIcon className='w-5 h-5 text-black' />
              {events.filter(e => e.type === 'Presentation').length}
            </span>
            <span className='text-black/80'>Presentations</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {events.filter(e => e.type === 'Planning').length}
            </span>
            <span className='text-black/80'>Planning</span>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between mb-6'>
          <h4 className='text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-br from-archer-neon to-green-600 rounded-lg flex items-center justify-center'>
              <CalendarIcon className='h-4 w-4 text-black' />
            </div>
            Upcoming Events & Meetings
          </h4>
          <button className='bg-gradient-to-r from-archer-neon to-green-600 text-black px-4 py-2 rounded-lg font-medium hover:from-green-500 hover:to-green-700 transition-all duration-200 shadow-md'>
            Schedule Event
          </button>
        </div>
        <div className='space-y-4'>
          {events.map(event => (
            <div
              key={event.id}
              className='group bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]'
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <h5 className='text-lg font-bold text-gray-900 dark:text-white mb-2'>
                    {event.title}
                  </h5>
                  <div className='flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400'>
                    <div className='flex items-center gap-1'>
                      <svg
                        className='w-4 h-4'
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
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className='flex items-center gap-1'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      {event.time}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${getEventTypeColor(event.type)}`}
                >
                  {event.type}
                </span>
              </div>
              <div className='mb-4'>
                <div className='flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2'>
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                  <span className='font-medium'>Attendees:</span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {event.attendees.map((attendee, index) => (
                    <span
                      key={index}
                      className='bg-white dark:bg-gray-600 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500'
                    >
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>
              <div className='flex space-x-3'>
                <button className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md'>
                  Join Meeting
                </button>
                <button className='bg-gradient-to-r from-archer-neon to-green-600 text-black px-4 py-2 rounded-lg text-sm font-medium hover:from-green-500 hover:to-green-700 transition-all duration-200 shadow-md'>
                  Reschedule
                </button>
                <button className='bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md'>
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FilesTab: React.FC = () => {
  const [files, setFiles] = useState([
    {
      id: 1,
      name: 'design-mockups.zip',
      type: 'ZIP',
      size: '15.2 MB',
      uploaded: '2024-01-15',
      uploadedBy: 'Emma Davis',
    },
    {
      id: 2,
      name: 'technical-specs.pdf',
      type: 'PDF',
      size: '2.1 MB',
      uploaded: '2024-01-18',
      uploadedBy: 'Mike Wilson',
    },
    {
      id: 3,
      name: 'project-logo.svg',
      type: 'SVG',
      size: '45 KB',
      uploaded: '2024-01-20',
      uploadedBy: 'Emma Davis',
    },
    {
      id: 4,
      name: 'database-schema.sql',
      type: 'SQL',
      size: '1.2 MB',
      uploaded: '2024-01-22',
      uploadedBy: 'Lisa Chen',
    },
  ]);

  const getFileTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'zip':
        return '📦';
      case 'svg':
        return '🎨';
      case 'sql':
        return '🗄️';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📈';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📁';
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'zip':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'svg':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'sql':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'doc':
      case 'docx':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'xls':
      case 'xlsx':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'ppt':
      case 'pptx':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'bg-gradient-to-r from-pink-500 to-pink-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Banner - Archer Gradient with Direct Metrics */}
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black shadow-lg flex flex-col gap-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
              <DocumentTextIcon className='w-6 h-6 text-black' />
            </div>
            <h3 className='text-3xl font-bold'>Project Files</h3>
          </div>
        </div>
        {/* Metrics Row - No Containers, with Icons */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <DocumentTextIcon className='w-5 h-5 text-black' />
              {files.length}
            </span>
            <span className='text-black/80'>Total Files</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <DocumentTextIcon className='w-5 h-5 text-black' />
              {files.filter(f => f.type === 'PDF').length}
            </span>
            <span className='text-black/80'>Documents</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {files.filter(f => f.type === 'ZIP').length}
            </span>
            <span className='text-black/80'>Archives</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <DocumentTextIcon className='w-5 h-5 text-black' />
              {files.filter(f => f.type === 'SVG').length}
            </span>
            <span className='text-black/80'>Graphics</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {files.filter(f => f.type === 'SQL').length}
            </span>
            <span className='text-black/80'>Database</span>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between mb-6'>
          <h4 className='text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-br from-archer-neon to-green-600 rounded-lg flex items-center justify-center'>
              <PaperClipIcon className='h-4 w-4 text-black' />
            </div>
            File Management
          </h4>
          <button className='bg-gradient-to-r from-archer-neon to-green-600 text-black px-4 py-2 rounded-lg font-medium hover:from-green-500 hover:to-green-700 transition-all duration-200 shadow-md'>
            Upload Files
          </button>
        </div>
        <div className='space-y-4'>
          {files.map(file => (
            <div
              key={file.id}
              className='group bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center text-2xl'>
                    {getFileTypeIcon(file.type)}
                  </div>
                  <div>
                    <h5 className='text-lg font-bold text-gray-900 dark:text-white mb-1'>
                      {file.name}
                    </h5>
                    <div className='flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${getFileTypeColor(file.type)}`}
                      >
                        {file.type}
                      </span>
                      <span>{file.size}</span>
                      <span>Uploaded by {file.uploadedBy}</span>
                      <span>
                        {new Date(file.uploaded).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex space-x-3'>
                  <button className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md'>
                    Download
                  </button>
                  <button className='bg-gradient-to-r from-archer-neon to-green-600 text-black px-4 py-2 rounded-lg text-sm font-medium hover:from-green-500 hover:to-green-700 transition-all duration-200 shadow-md'>
                    Share
                  </button>
                  <button className='bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md'>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NotesTab: React.FC<{ project: Project; onMarkChanged?: () => void }> = ({
  project,
  onMarkChanged,
}) => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Client Requirements Notes',
      content:
        'Client emphasized the importance of mobile responsiveness and fast loading times.',
      author: 'Sarah Johnson',
      date: '2024-01-15',
      tags: ['requirements', 'client'],
    },
    {
      id: 2,
      title: 'Technical Architecture Decisions',
      content:
        'Decided to use React for frontend and Node.js for backend. Database will be PostgreSQL.',
      author: 'Mike Wilson',
      date: '2024-01-18',
      tags: ['architecture', 'technical'],
    },
    {
      id: 3,
      title: 'Design Feedback',
      content:
        'Client liked the modern design approach but requested more blue tones in the color scheme.',
      author: 'Emma Davis',
      date: '2024-01-20',
      tags: ['design', 'feedback'],
    },
  ]);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note = {
        id: Date.now(),
        title: newNote.title,
        content: newNote.content,
        author: 'Current User',
        date: new Date().toISOString().split('T')[0],
        tags: newNote.tags,
      };
      setNotes([...notes, note]);
      setNewNote({ title: '', content: '', tags: [] });
      setShowAddForm(false);
      onMarkChanged?.();
    }
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
    onMarkChanged?.();
  };

  const getTagColor = (tag: string) => {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      'bg-gradient-to-r from-archer-neon to-green-600 text-black',
      'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
      'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
    ];
    return colors[tag.length % colors.length];
  };

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Banner - Archer Gradient with Direct Metrics */}
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black shadow-lg flex flex-col gap-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
              <DocumentTextIcon className='w-6 h-6 text-black' />
            </div>
            <h3 className='text-3xl font-bold'>Project Notes</h3>
          </div>
        </div>
        {/* Metrics Row - No Containers, with Icons */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <DocumentTextIcon className='w-5 h-5 text-black' />
              {notes.length}
            </span>
            <span className='text-black/80'>Total Notes</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {notes.filter(n => n.tags.includes('requirements')).length}
            </span>
            <span className='text-black/80'>Requirements</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {notes.filter(n => n.tags.includes('technical')).length}
            </span>
            <span className='text-black/80'>Technical</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {notes.filter(n => n.tags.includes('design')).length}
            </span>
            <span className='text-black/80'>Design</span>
          </div>
        </div>
      </div>

      {/* Notes Management */}
      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between mb-6'>
          <h4 className='text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-br from-archer-neon to-green-600 rounded-lg flex items-center justify-center'>
              <PencilSquareIcon className='h-4 w-4 text-black' />
            </div>
            Notes & Documentation
          </h4>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className='bg-gradient-to-r from-archer-neon to-green-600 text-black px-4 py-2 rounded-lg font-medium hover:from-green-500 hover:to-green-700 transition-all duration-200 shadow-md'
          >
            {showAddForm ? 'Cancel' : 'Add Note'}
          </button>
        </div>

        {showAddForm && (
          <div className='mb-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600'>
            <div className='space-y-4'>
              <input
                type='text'
                placeholder='Note title...'
                value={newNote.title}
                onChange={e =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
                className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              />
              <textarea
                placeholder='Note content...'
                value={newNote.content}
                onChange={e =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                rows={4}
                className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              />
              <div className='flex gap-3'>
                <button
                  onClick={handleAddNote}
                  className='bg-gradient-to-r from-archer-neon to-green-600 text-black px-6 py-3 rounded-lg font-medium hover:from-green-500 hover:to-green-700 transition-all duration-200 shadow-md'
                >
                  Save Note
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors bg-white'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className='space-y-4'>
          {notes.map(note => (
            <div
              key={note.id}
              className='group bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]'
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <h5 className='text-lg font-bold text-gray-900 dark:text-white mb-2'>
                    {note.title}
                  </h5>
                  <div className='flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3'>
                    <div className='flex items-center gap-1'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
                      {note.author}
                    </div>
                    <div className='flex items-center gap-1'>
                      <svg
                        className='w-4 h-4'
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
                      {new Date(note.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className='flex space-x-3'>
                  <button className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md'>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className='bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md'
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className='text-gray-700 dark:text-gray-300 mb-4 leading-relaxed'>
                {note.content}
              </p>
              <div className='flex flex-wrap gap-2'>
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${getTagColor(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ClientPortalTab: React.FC = () => {
  const [clientAccess, setClientAccess] = useState({
    enabled: true,
    url: 'https://client.archerbuild.com/project/123',
    lastLogin: '2024-01-25 14:30',
    permissions: ['view_dashboard', 'view_documents', 'view_progress'],
  });

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Banner - Archer Gradient with Direct Metrics */}
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black shadow-lg flex flex-col gap-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
              <UserCircleIcon className='w-6 h-6 text-black' />
            </div>
            <h3 className='text-3xl font-bold'>Client Portal</h3>
          </div>
        </div>
        {/* Metrics Row - No Containers, with Icons */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <UserIcon className='w-5 h-5 text-black' />
              {clientAccess.enabled ? '1' : '0'}
            </span>
            <span className='text-black/80'>Active Users</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ClipboardDocumentListIcon className='w-5 h-5 text-black' />
              {clientAccess.permissions.length}
            </span>
            <span className='text-black/80'>Permissions</span>
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow'>
        <h4 className='font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2'>
          <UserCircleIcon className='h-5 w-5 text-blue-500' />
          Client Portal Access
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h5 className='font-medium text-gray-900 dark:text-white mb-4'>
              Access Information
            </h5>
            <div className='space-y-3'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Portal URL
                </label>
                <div className='flex items-center space-x-2'>
                  <input
                    type='text'
                    value={clientAccess.url}
                    readOnly
                    className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                  />
                  <button className='px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Last Login
                </label>
                <p className='text-gray-900 dark:text-white'>
                  {clientAccess.lastLogin}
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    clientAccess.enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {clientAccess.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h5 className='font-medium text-gray-900 dark:text-white mb-4'>
              Permissions
            </h5>
            <div className='space-y-2'>
              {clientAccess.permissions.map((permission, index) => (
                <div key={index} className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={true}
                    readOnly
                    className='h-4 w-4 text-blue-600 border-gray-300 rounded'
                  />
                  <label className='ml-2 text-sm text-gray-700 dark:text-gray-300'>
                    {permission
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatTab: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: 'Sarah Johnson',
      content: 'Good morning team! How is everyone doing with their tasks?',
      timestamp: '2024-01-25 09:00',
      type: 'message',
    },
    {
      id: 2,
      author: 'Mike Wilson',
      content:
        'Frontend development is progressing well. Should have the dashboard ready by Friday.',
      timestamp: '2024-01-25 09:05',
      type: 'message',
    },
    {
      id: 3,
      author: 'Emma Davis',
      content: 'Design mockups are complete and ready for review.',
      timestamp: '2024-01-25 09:10',
      type: 'message',
    },
    {
      id: 4,
      author: 'System',
      content: 'Tom Brown joined the chat',
      timestamp: '2024-01-25 09:15',
      type: 'system',
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        author: 'Current User',
        content: newMessage,
        timestamp: new Date().toLocaleString(),
        type: 'message' as const,
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get unique participants (excluding system messages)
  const uniqueParticipants = new Set(
    messages.filter(m => m.type !== 'system').map(m => m.author)
  ).size;

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Banner - Archer Gradient with Direct Metrics */}
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black shadow-lg flex flex-col gap-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
              <ChatBubbleLeftRightIcon className='w-6 h-6 text-black' />
            </div>
            <h3 className='text-3xl font-bold'>Project Chat</h3>
          </div>
        </div>
        {/* Metrics Row - No Containers, with Icons */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <ChatBubbleLeftRightIcon className='w-5 h-5 text-black' />
              {messages.filter(m => m.type === 'message').length}
            </span>
            <span className='text-black/80'>Total Messages</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <UserIcon className='w-5 h-5 text-black' />
              {uniqueParticipants}
            </span>
            <span className='text-black/80'>Participants</span>
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow'>
        <h4 className='font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2'>
          <ChatBubbleLeftRightIcon className='h-5 w-5 text-blue-500' />
          Project Chat
        </h4>
        <div className='h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4'>
          {messages.map(message => (
            <div
              key={message.id}
              className={`mb-4 ${message.type === 'system' ? 'text-center' : ''}`}
            >
              {message.type === 'system' ? (
                <div className='text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1 inline-block'>
                  {message.content}
                </div>
              ) : (
                <div className='flex items-start space-x-3'>
                  <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold'>
                    {message.author.charAt(0)}
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <span className='font-medium text-gray-900 dark:text-white'>
                        {message.author}
                      </span>
                      <span className='text-sm text-gray-500 dark:text-gray-400'>
                        {message.timestamp}
                      </span>
                    </div>
                    <p className='text-gray-700 dark:text-gray-300'>
                      {message.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className='flex space-x-2'>
          <input
            type='text'
            placeholder='Type your message...'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <button
            onClick={handleSendMessage}
            className='px-4 py-2 bg-archer-neon text-black rounded-lg font-medium hover:bg-archer-neon/90 transition-colors'
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const AutomationTab: React.FC = () => {
  const [automations, setAutomations] = useState([
    {
      id: 1,
      name: 'Daily Progress Report',
      type: 'Email',
      status: 'Active',
      schedule: 'Daily at 9:00 AM',
      lastRun: '2024-01-25 09:00',
    },
    {
      id: 2,
      name: 'Task Deadline Reminders',
      type: 'Notification',
      status: 'Active',
      schedule: 'Daily at 8:00 AM',
      lastRun: '2024-01-25 08:00',
    },
    {
      id: 3,
      name: 'Weekly Client Update',
      type: 'Email',
      status: 'Inactive',
      schedule: 'Weekly on Monday',
      lastRun: '2024-01-22 10:00',
    },
    {
      id: 4,
      name: 'Budget Alert',
      type: 'Notification',
      status: 'Active',
      schedule: 'When threshold reached',
      lastRun: '2024-01-24 15:30',
    },
  ]);

  const handleToggleAutomation = (id: number) => {
    setAutomations(
      automations.map(auto =>
        auto.id === id
          ? {
              ...auto,
              status: auto.status === 'Active' ? 'Inactive' : 'Active',
            }
          : auto
      )
    );
  };

  const handleDeleteAutomation = (id: number) => {
    setAutomations(automations.filter(auto => auto.id !== id));
  };

  const getAutomationStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Inactive':
        return 'bg-gray-100 text-gray-700';
      case 'Error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const activeAutomations = automations.filter(
    auto => auto.status === 'Active'
  ).length;
  const inactiveAutomations = automations.filter(
    auto => auto.status === 'Inactive'
  ).length;

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Banner - Archer Gradient with Direct Metrics */}
      <div className='bg-gradient-to-br from-archer-neon via-[#00c4b4] to-green-800 rounded-xl p-6 text-black shadow-lg flex flex-col gap-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center'>
              <BoltIcon className='w-6 h-6 text-black' />
            </div>
            <h3 className='text-3xl font-bold'>Project Automation</h3>
          </div>
        </div>
        {/* Metrics Row - No Containers, with Icons */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 w-full'>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <BoltIcon className='w-5 h-5 text-black' />
              {automations.length}
            </span>
            <span className='text-black/80'>Total Automations</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <CheckCircleIcon className='w-5 h-5 text-black' />
              {activeAutomations}
            </span>
            <span className='text-black/80'>Active</span>
          </div>
          <div className='flex-1 flex flex-col items-center md:items-start'>
            <span className='flex items-center gap-2 text-2xl font-bold'>
              <XMarkIcon className='w-5 h-5 text-black' />
              {inactiveAutomations}
            </span>
            <span className='text-black/80'>Inactive</span>
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow'>
        <h4 className='font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2'>
          <BoltIcon className='h-5 w-5 text-blue-500' />
          Project Automations
        </h4>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 dark:bg-gray-700'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Automation
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Schedule
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Last Run
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
              {automations.map(automation => (
                <tr
                  key={automation.id}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900 dark:text-white'>
                      {automation.name}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-sm text-gray-500 dark:text-gray-400'>
                      {automation.type}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAutomationStatusColor(automation.status)}`}
                    >
                      {automation.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-sm text-gray-500 dark:text-gray-400'>
                      {automation.schedule}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='text-sm text-gray-500 dark:text-gray-400'>
                      {automation.lastRun}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() => handleToggleAutomation(automation.id)}
                      className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3'
                    >
                      {automation.status === 'Active' ? 'Disable' : 'Enable'}
                    </button>
                    <button className='text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3'>
                      Run Now
                    </button>
                    <button
                      onClick={() => handleDeleteAutomation(automation.id)}
                      className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialTab = params.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const modalRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);

  // Auto-save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] =
    useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the modal content
      const target = event.target as Element;
      const modalContent = target?.closest('.modal-content');
      if (!modalContent) {
        handleClose();
      }
    };

    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkScrollButtons = () => {
      if (tabsContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } =
          tabsContainerRef.current;
        setShowScrollLeft(scrollLeft > 0);
        setShowScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    params.set('tab', tabKey);
    navigate({ search: params.toString() }, { replace: true });
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        tabsContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      tabsContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleTabHover = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 100;
      const newScrollLeft =
        tabsContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      tabsContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  // Auto-save functions
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  };

  const saveChanges = async () => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Save changes for each tab that has modifications
      // This is where you would implement the actual save logic for each tab

      // For now, we'll simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));

      setHasUnsavedChanges(false);
      setSaveStatus('saved');

      // Clear saved status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving changes:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedChangesDialog(true);
      setPendingClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedChangesDialog(false);
    setPendingClose(false);
    onClose();
  };

  const handleSaveAndClose = async () => {
    await saveChanges();
    if (saveStatus !== 'error') {
      setShowUnsavedChangesDialog(false);
      setPendingClose(false);
      onClose();
    }
  };

  const handleCancelClose = () => {
    setShowUnsavedChangesDialog(false);
    setPendingClose(false);
  };

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && !isSaving) {
      const timeoutId = setTimeout(() => {
        saveChanges();
      }, 3000); // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, isSaving]);

  return (
    <>
      <div className='fixed top-8 left-4 right-4 bottom-4 z-50 bg-white flex flex-col shadow-2xl rounded-xl modal-content'>
        {/* Modal Header */}
        <div className='flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-white'>
          <div className='flex items-center gap-2 sm:gap-4 min-w-0'>
            <h2 className='text-lg sm:text-2xl font-bold text-gray-900 truncate'>
              {project?.name || 'Project'}
            </h2>
            <span className='text-xs sm:text-sm text-gray-500 hidden sm:block'>
              {project?.client}
            </span>
            {hasUnsavedChanges && (
              <span className='text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full border border-yellow-200'>
                Unsaved changes
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200'>
                Saved
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200 flex items-center gap-1'>
                <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700'></div>
                Saving...
              </span>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {hasUnsavedChanges && (
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className='flex items-center gap-2 px-3 py-2 bg-archer-neon text-black rounded-lg font-medium hover:bg-archer-neon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSaving ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-black'></div>
                    <span className='hidden sm:inline'>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'
                      />
                    </svg>
                    <span className='hidden sm:inline'>Save</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleClose}
              className='rounded-lg p-2 hover:bg-gray-100 transition-colors flex-shrink-0'
              aria-label='Close'
            >
              <XMarkIcon className='h-5 w-5 sm:h-6 sm:w-6 text-gray-600' />
            </button>
          </div>
        </div>

        {/* Tab Navigation with Auto-scroll */}
        <div className='relative border-b border-gray-200 bg-white'>
          <div className='flex items-center'>
            {/* Left scroll button */}
            {showScrollLeft && (
              <button
                onClick={() => scrollTabs('left')}
                onMouseEnter={() => handleTabHover('left')}
                className='absolute left-0 z-10 bg-white border-r border-gray-200 p-2 hover:bg-gray-50 transition-colors'
              >
                <ChevronLeftIcon className='h-5 w-5 text-gray-600' />
              </button>
            )}

            {/* Tabs container */}
            <div
              ref={tabsContainerRef}
              className='flex gap-2 px-4 sm:px-8 pt-4 pb-2 overflow-x-auto scrollbar-hide'
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={() => {
                if (tabsContainerRef.current) {
                  const { scrollLeft, scrollWidth, clientWidth } =
                    tabsContainerRef.current;
                  setShowScrollLeft(scrollLeft > 0);
                  setShowScrollRight(
                    scrollLeft < scrollWidth - clientWidth - 1
                  );
                }
              }}
            >
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.key
                      ? 'bg-archer-neon text-black border border-archer-neon shadow-md transform scale-105'
                      : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
                  }`}
                >
                  {tab.icon}
                  <span className='hidden sm:inline'>{tab.label}</span>
                  <span className='sm:hidden'>{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Right scroll button */}
            {showScrollRight && (
              <button
                onClick={() => scrollTabs('right')}
                onMouseEnter={() => handleTabHover('right')}
                className='absolute right-0 z-10 bg-white border-l border-gray-200 p-2 hover:bg-gray-50 transition-colors'
              >
                <ChevronRightIcon className='h-5 w-5 text-gray-600' />
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className='flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8'>
          {activeTab === 'dashboard' && (
            <ProjectDashboardTab
              project={project}
              onMarkChanged={markAsChanged}
            />
          )}
          {activeTab === 'tasks' && (
            <TasksTab project={project} onMarkChanged={markAsChanged} />
          )}
          {activeTab === 'gantt' && (
            <GanttTab project={project} onMarkChanged={markAsChanged} />
          )}
          {activeTab === 'work-structure' && <WorkStructureTab />}
          {activeTab === 'documents' && (
            <DocumentsTab project={project} onMarkChanged={markAsChanged} />
          )}
          {activeTab === 'finance' && (
            <FinanceTab project={project} onMarkChanged={markAsChanged} />
          )}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'files' && <FilesTab />}
          {activeTab === 'notes' && (
            <NotesTab project={project} onMarkChanged={markAsChanged} />
          )}
          {activeTab === 'client-portal' && <ClientPortalTab />}
          {activeTab === 'chat' && <ChatTab />}
          {activeTab === 'automation' && <AutomationTab />}
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      {showUnsavedChangesDialog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60'>
          <div className='bg-white rounded-xl p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Unsaved Changes
            </h3>
            <p className='text-gray-600 mb-6'>
              You have unsaved changes. Would you like to save them before
              closing?
            </p>
            <div className='flex gap-3'>
              <button
                onClick={handleCancelClose}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClose}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Close Without Saving
              </button>
              <button
                onClick={handleSaveAndClose}
                disabled={isSaving}
                className='flex-1 px-4 py-2 bg-archer-neon text-black rounded-lg font-medium hover:bg-archer-neon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isSaving ? 'Saving...' : 'Save & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectModal;
