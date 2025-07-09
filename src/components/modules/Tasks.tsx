import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  Tag,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  List,
  Grid,
  RefreshCw,
} from 'lucide-react';
import SortableTaskCard from './SortableTaskCard';
import TaskForm from './TaskForm';
import {
  demoDataService,
  Task as DemoTask,
  Project as DemoProject,
  Client as DemoClient,
} from '../../services/demoData';

// Type definitions for the component
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

interface Project {
  id: string;
  name: string;
  status?: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
}

interface Opportunity {
  id: string;
  name: string;
  status?: string;
}

const STATUS_COLUMNS = ['To Do', 'In Progress', 'Needs Approval', 'Completed'];

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

// Helper function to convert demo project to component project
const convertDemoProjectToProject = (demoProject: DemoProject): Project => ({
  id: demoProject.id.toString(),
  name: demoProject.name,
  status: demoProject.status,
});

// Helper function to convert demo client to component customer
const convertDemoClientToCustomer = (demoClient: DemoClient): Customer => ({
  id: demoClient.id.toString(),
  name: demoClient.name,
  email: demoClient.email,
});

// Helper function to convert component task back to demo task format
const convertTaskToDemoTask = (task: Task, projects: Project[]): DemoTask => ({
  id: parseInt(task.id),
  title: task.title,
  description: task.description || '',
  project: projects.find(p => p.id === task.project_id)?.name || '',
  projectId: parseInt(task.project_id),
  assignee: task.assignee || '',
  priority: (task.priority as 'low' | 'medium' | 'high') || 'medium',
  status:
    task.status === 'Completed'
      ? 'completed'
      : task.status === 'In Progress'
        ? 'in-progress'
        : 'pending',
  dueDate: task.due_date || '',
  tags: [],
  estimatedHours: 0,
  actualHours: 0,
  isDemoData: true,
  createdAt: task.created_at || new Date().toISOString(),
  demoId: `task-${task.id}`,
});

const Tasks: React.FC = () => {
  const sensors = useSensors(useSensor(PointerSensor));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<'due_date' | 'priority'>('due_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'grid'>(
    'kanban'
  );
  const [filters, setFilters] = useState({
    project_id: '',
    customer_id: '',
    opportunity_id: '',
    type: '',
    status: '',
    assignee: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use demo data instead of database calls
      const demoTasksData = await demoDataService.getTasks();
      const demoProjectsData = await demoDataService.getProjects();
      const demoCustomersData = await demoDataService.getCustomers();

      // Convert demo data to component format
      const tasksData = Array.isArray(demoTasksData)
        ? demoTasksData.map(convertDemoTaskToTask)
        : [];
      const projectsData = Array.isArray(demoProjectsData)
        ? demoProjectsData.map(convertDemoProjectToProject)
        : [];
      const customersData = Array.isArray(demoCustomersData)
        ? demoCustomersData.map(convertDemoClientToCustomer)
        : [];

      // Create demo opportunities
      const opportunitiesData = [
        { id: '1', name: 'Website Redesign', status: 'active' },
        { id: '2', name: 'Mobile App Development', status: 'active' },
        { id: '3', name: 'Marketing Campaign', status: 'pending' },
      ];

      // Extract assignees from tasks
      const assigneesData = Array.from(
        new Set(
          tasksData.map(task => task.assignee).filter(Boolean) as string[]
        )
      );

      setTasks(tasksData);
      setProjects(projectsData);
      setCustomers(customersData);
      setOpportunities(opportunitiesData);
      setAssignees(assigneesData);
    } catch (e: any) {
      setError(e.message);
      // Set empty arrays as fallback
      setTasks([]);
      setProjects([]);
      setCustomers([]);
      setOpportunities([]);
      setAssignees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  // Filtering and sorting
  const filteredTasks = (Array.isArray(tasks) ? tasks : [])
    .filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (task.assignee || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sort === 'due_date') {
        const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
        return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sort === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityA =
          priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const priorityB =
          priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return sortDir === 'asc'
          ? priorityA - priorityB
          : priorityB - priorityA;
      }
      return 0;
    });

  // DnD handlers
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = (Array.isArray(tasks) ? tasks : []).find(
      task => task.id === active.id
    );
    const overTask = (Array.isArray(tasks) ? tasks : []).find(
      task => task.id === over.id
    );

    if (!activeTask || !overTask) return;

    // If dropping on a different status column
    if (overTask.status !== activeTask.status) {
      try {
        // Update task status locally
        const updatedTasks = (Array.isArray(tasks) ? tasks : []).map(task =>
          task.id === activeTask.id
            ? { ...task, status: overTask.status }
            : task
        );
        setTasks(updatedTasks);

        // Convert back to demo format and save
        const demoTasks = updatedTasks.map(task =>
          convertTaskToDemoTask(task, projects)
        );
        await demoDataService.saveTasks(demoTasks);
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  // CRUD handlers
  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      const newTask: Task = {
        id: Date.now().toString(),
        project_id: taskData.project_id || '',
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'To Do',
        assignee: taskData.assignee || '',
        due_date: taskData.due_date || '',
        priority: taskData.priority || 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        position: (Array.isArray(tasks) ? tasks : []).length + 1,
      };

      const updatedTasks = [...(Array.isArray(tasks) ? tasks : []), newTask];
      setTasks(updatedTasks);

      // Convert back to demo format and save
      const demoTasks = updatedTasks.map(task =>
        convertTaskToDemoTask(task, projects)
      );
      await demoDataService.saveTasks(demoTasks);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;
    try {
      const updatedTasks = (Array.isArray(tasks) ? tasks : []).map(task =>
        task.id === editingTask.id
          ? { ...task, ...taskData, updated_at: new Date().toISOString() }
          : task
      );
      setTasks(updatedTasks);

      // Convert back to demo format and save
      const demoTasks = updatedTasks.map(task =>
        convertTaskToDemoTask(task, projects)
      );
      await demoDataService.saveTasks(demoTasks);
      setEditingTask(null);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const task = (Array.isArray(tasks) ? tasks : []).find(t => t.id === taskId);
    if (!task) return;

    try {
      const updatedTasks = (Array.isArray(tasks) ? tasks : []).filter(
        t => t.id !== taskId
      );
      setTasks(updatedTasks);

      // Convert back to demo format and save
      const demoTasks = updatedTasks.map(task =>
        convertTaskToDemoTask(task, projects)
      );
      await demoDataService.saveTasks(demoTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const updatedTasks = (Array.isArray(tasks) ? tasks : []).map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
          : task
      );
      setTasks(updatedTasks);

      // Convert back to demo format and save
      const demoTasks = updatedTasks.map(task =>
        convertTaskToDemoTask(task, projects)
      );
      await demoDataService.saveTasks(demoTasks);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const getTaskStats = () => {
    const tasksArray = Array.isArray(tasks) ? tasks : [];
    const total = tasksArray.length;
    const completed = tasksArray.filter(t => t.status === 'Completed').length;
    const inProgress = tasksArray.filter(
      t => t.status === 'In Progress'
    ).length;
    const overdue = tasksArray.filter(t => {
      if (!t.due_date || t.status === 'Completed') return false;
      const due = new Date(t.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due < today;
    }).length;
    const highPriority = tasksArray.filter(t => t.priority === 'high').length;

    return { total, completed, inProgress, overdue, highPriority };
  };

  const stats = getTaskStats();

  const renderKanbanView = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {STATUS_COLUMNS.map(status => {
          const statusTasks = filteredTasks.filter(t => t.status === status);
          return (
            <div
              key={status}
              className='bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-gray-900 dark:text-white'>
                  {status}
                </h3>
                <span className='bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-sm'>
                  {statusTasks.length}
                </span>
              </div>
              <SortableContext
                items={statusTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className='space-y-3 min-h-[200px]'>
                  {statusTasks.map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
    </DndContext>
  );

  const renderListView = () => (
    <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 dark:bg-gray-700'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Task
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Assignee
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Priority
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Due Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
            {filteredTasks.map(task => (
              <tr
                key={task.id}
                className='hover:bg-gray-50 dark:hover:bg-gray-700'
              >
                <td className='px-6 py-4'>
                  <div>
                    <div className='text-sm font-medium text-gray-900 dark:text-white'>
                      {task.title}
                    </div>
                    {task.description && (
                      <div className='text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs'>
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className='px-6 py-4 text-sm text-gray-900 dark:text-white'>
                  {task.assignee}
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'Completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : task.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : task.status === 'Needs Approval'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className='px-6 py-4 text-sm text-gray-900 dark:text-white'>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : '-'}
                </td>
                <td className='px-6 py-4 text-sm font-medium'>
                  <button
                    onClick={() => handleEditTask(task)}
                    className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
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
  );

  return (
    <div className='max-w-7xl mx-auto p-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Task Management
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage and track all your tasks across projects
          </p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
        >
          <Plus className='h-4 w-4' />
          <span>Add Task</span>
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
              <BarChart3 className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Total
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
              <CheckCircle className='h-6 w-6 text-green-600 dark:text-green-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Completed
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.completed}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
              <Clock className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                In Progress
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.inProgress}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-red-100 dark:bg-red-900 rounded-lg'>
              <AlertTriangle className='h-6 w-6 text-red-600 dark:text-red-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Overdue
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.overdue}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <div className='p-2 bg-orange-100 dark:bg-orange-900 rounded-lg'>
              <AlertTriangle className='h-6 w-6 text-orange-600 dark:text-orange-400' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                High Priority
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {stats.highPriority}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          {/* Search */}
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search tasks...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
            />
          </div>

          {/* View Mode */}
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
            >
              <BarChart3 className='h-4 w-4' />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
            >
              <List className='h-4 w-4' />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
            >
              <Grid className='h-4 w-4' />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
          >
            <Filter className='h-4 w-4' />
            <span>Filters</span>
          </button>

          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className='flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50'
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
              <select
                value={filters.project_id}
                onChange={e =>
                  setFilters(f => ({ ...f, project_id: e.target.value }))
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              >
                <option value=''>All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.customer_id}
                onChange={e =>
                  setFilters(f => ({ ...f, customer_id: e.target.value }))
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              >
                <option value=''>All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.opportunity_id}
                onChange={e =>
                  setFilters(f => ({ ...f, opportunity_id: e.target.value }))
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              >
                <option value=''>All Opportunities</option>
                {opportunities.map(opportunity => (
                  <option key={opportunity.id} value={opportunity.id}>
                    {opportunity.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.type}
                onChange={e =>
                  setFilters(f => ({ ...f, type: e.target.value }))
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              >
                <option value=''>All Types</option>
                <option value='general'>General</option>
                <option value='project'>Project</option>
                <option value='customer'>Customer</option>
                <option value='opportunity'>Opportunity</option>
                <option value='document'>Document</option>
                <option value='calendar'>Calendar</option>
              </select>

              <select
                value={filters.status}
                onChange={e =>
                  setFilters(f => ({ ...f, status: e.target.value }))
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              >
                <option value=''>All Statuses</option>
                {STATUS_COLUMNS.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={filters.assignee}
                onChange={e =>
                  setFilters(f => ({ ...f, assignee: e.target.value }))
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              >
                <option value=''>All Assignees</option>
                {assignees.map(assignee => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className='flex items-center space-x-4 mt-4'>
              <select
                value={sort}
                onChange={e =>
                  setSort(e.target.value as 'due_date' | 'priority')
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
              >
                <option value='due_date'>Due Date</option>
                <option value='priority'>Priority</option>
              </select>
              <button
                onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              >
                {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-400'>
            Loading tasks...
          </p>
        </div>
      ) : error ? (
        <div className='text-center py-12'>
          <p className='text-red-600 dark:text-red-400'>{error}</p>
          <button
            onClick={loadData}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Retry
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-600 dark:text-gray-400'>No tasks found</p>
          <button
            onClick={() => setShowTaskForm(true)}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Add your first task
          </button>
        </div>
      ) : (
        <div>
          {viewMode === 'kanban' && renderKanbanView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'grid' && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredTasks.map(task => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask || undefined}
        onSave={editingTask ? handleUpdateTask : handleAddTask}
        onCancel={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        isOpen={showTaskForm}
      />
    </div>
  );
};

export default Tasks;
