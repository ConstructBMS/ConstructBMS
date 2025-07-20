import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical, Edit3, Trash2, Settings, Eye, ChevronLeft, ChevronRight, X, Filter, Search, Calendar, User, Tag, BarChart3, CheckCircle, Clock, AlertTriangle, List, Grid, RefreshCw } from 'lucide-react';
import TaskForm from './TaskForm';
import { demoDataService } from '../../services/demoDataService';
import type { DemoTask, DemoProject, DemoCustomer } from '../../services/demoDataService';

interface Task {
  actualHours?: number;
  assignee?: string;
  createdAt: string;
  customerId?: string;
  description?: string;
  dueDate?: string;
  estimatedHours?: number;
  id: string;
  opportunityId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  project?: string;
  projectId?: string;
  status: string;
  tags?: string[];
  title: string;
  type?: string;
  updatedAt: string;
}

interface TaskColumn {
  color?: string;
  id: string;
  name: string;
  tasks: Task[];
}

interface DragState {
  draggedItem: { id: string; sourceColumn: string; sourceIndex: number 
} | null;
  dropTarget: { columnId: string; index: number } | null;
  isDragging: boolean;
}

interface TasksProps {
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
}

const initialColumns: TaskColumn[] = [
  {
    id: 'todo',
    name: 'To Do',
    color: '#3B82F6',
    tasks: [
      {
        id: 'task1',
        title: 'Review project requirements',
        description: 'Review and validate all project requirements with stakeholders',
        status: 'todo',
        assignee: 'John Smith',
        dueDate: '2024-06-15',
        priority: 'high',
        project: 'Website Redesign',
        projectId: 'proj-1',
        tags: ['Review', 'Planning'],
        estimatedHours: 4,
        actualHours: 0,
        createdAt: '2024-06-01',
        updatedAt: '2024-06-01',
        type: 'task'
      },
      {
        id: 'task2',
        title: 'Create wireframes',
        description: 'Design wireframes for the new website layout',
        status: 'todo',
        assignee: 'Sarah Johnson',
        dueDate: '2024-06-20',
        priority: 'medium',
        project: 'Website Redesign',
        projectId: 'proj-1',
        tags: ['Design', 'Wireframes'],
        estimatedHours: 8,
        actualHours: 0,
        createdAt: '2024-06-02',
        updatedAt: '2024-06-02',
        type: 'task'
      },
      {
        id: 'task3',
        title: 'Set up development environment',
        description: 'Configure development tools and environment for the team',
        status: 'todo',
        assignee: 'Mike Wilson',
        dueDate: '2024-06-10',
        priority: 'low',
        project: 'Website Redesign',
        projectId: 'proj-1',
        tags: ['Setup', 'Development'],
        estimatedHours: 2,
        actualHours: 0,
        createdAt: '2024-06-03',
        updatedAt: '2024-06-03',
        type: 'task'
      }
    ]
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    color: '#F59E0B',
    tasks: [
      {
        id: 'task4',
        title: 'Database schema design',
        description: 'Design and implement the database schema for the new system',
        status: 'in-progress',
        assignee: 'David Brown',
        dueDate: '2024-06-25',
        priority: 'high',
        project: 'Website Redesign',
        projectId: 'proj-1',
        tags: ['Database', 'Backend'],
        estimatedHours: 12,
        actualHours: 6,
        createdAt: '2024-06-01',
        updatedAt: '2024-06-05',
        type: 'task'
      },
      {
        id: 'task5',
        title: 'Frontend component development',
        description: 'Build reusable React components for the user interface',
        status: 'in-progress',
        assignee: 'Lisa Thompson',
        dueDate: '2024-06-30',
        priority: 'medium',
        project: 'Website Redesign',
        projectId: 'proj-1',
        tags: ['Frontend', 'React'],
        estimatedHours: 16,
        actualHours: 8,
        createdAt: '2024-06-02',
        updatedAt: '2024-06-06',
        type: 'task'
      }
    ]
  },
  {
    id: 'review',
    name: 'Review',
    color: '#8B5CF6',
    tasks: [
      {
        id: 'task6',
        title: 'Code review for authentication module',
        description: 'Review the authentication and authorization implementation',
        status: 'review',
        assignee: 'Alex Chen',
        dueDate: '2024-06-18',
        priority: 'high',
        project: 'Website Redesign',
        projectId: 'proj-1',
        tags: ['Review', 'Security'],
        estimatedHours: 3,
        actualHours: 0,
        createdAt: '2024-06-04',
        updatedAt: '2024-06-04',
        type: 'task'
      }
    ]
  },
  {
    id: 'completed',
    name: 'Completed',
    color: '#10B981',
    tasks: [
      {
        id: 'task7',
        title: 'Project kickoff meeting',
        description: 'Conduct initial project kickoff meeting with all stakeholders',
        status: 'completed',
        assignee: 'Jane Doe',
        dueDate: '2024-06-01',
        priority: 'medium',
        project: 'Website Redesign',
        projectId: 'proj-1',
        tags: ['Meeting', 'Planning'],
        estimatedHours: 2,
        actualHours: 2,
        createdAt: '2024-05-30',
        updatedAt: '2024-06-01',
        type: 'task'
      },
      {
        id: 'task8',
        title: 'Requirements gathering',
        description: 'Complete requirements gathering phase with client',
        status: 'completed',
        assignee: 'John Smith',
        dueDate: '2024-06-05',
        priority: 'high',
        project: 'Website Redesign',
        projectId: 'proj-1',
        tags: ['Requirements', 'Analysis'],
        estimatedHours: 6,
        actualHours: 5,
        createdAt: '2024-05-28',
        updatedAt: '2024-06-05',
        type: 'task'
      }
    ]
  }
];

const Tasks: React.FC<TasksProps> = ({ onNavigateToModule }) => {
  const [columns, setColumns] = useState<TaskColumn[]>(initialColumns);
  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    dropTarget: null,
    isDragging: false,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [showColumnRename, setShowColumnRename] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [cardSettings, setCardSettings] = useState({
    showAssignee: true,
    showDueDate: true,
    showPriority: true,
    showProject: true,
    showTags: true,
    showProgress: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');

  const dragStartTime = useRef<number>(0);
  const hasDragged = useRef<boolean>(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check for stored task data to open specific task
  useEffect(() => {
    const storedTask = sessionStorage.getItem('openTask');
    if (storedTask && columns.length > 0) {
      try {
        const taskData = JSON.parse(storedTask);
        
        // Find the actual task in our columns
        let foundTask: Task | null = null;
        for (const column of columns) {
          const task = column.tasks.find(t => t.id === taskData.id || t.title === taskData.title);
          if (task) {
            foundTask = task;
            break;
          }
        }
        if (foundTask) {
          setSelectedTask(foundTask);
          setShowTaskModal(true);
        }
        // Clear the stored data
        sessionStorage.removeItem('openTask');
      } catch (error) {
        console.error('Error parsing stored task data:', error);
        sessionStorage.removeItem('openTask');
      }
    }
  }, [columns]);

  const scrollLeft = () => {
    const container = document.querySelector('.tasks-kanban');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector('.tasks-kanban');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string, sourceColumn: string, sourceIndex: number) => {
    dragStartTime.current = Date.now();
    hasDragged.current = true;
    setDragState({
      draggedItem: { id: taskId, sourceColumn, sourceIndex },
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
    index = Math.max(0, Math.min(index, columns.find(col => col.id === columnId)?.tasks.length || 0));
    
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

    const { id: taskId, sourceColumn, sourceIndex } = dragState.draggedItem;
    const { index: targetIndex } = dragState.dropTarget;
    
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      
      // Find source and target columns
      const sourceColIndex = newColumns.findIndex(col => col.id === sourceColumn);
      const targetColIndex = newColumns.findIndex(col => col.id === targetColumn);
      
      if (sourceColIndex === -1 || targetColIndex === -1) return prevColumns;
      
      const sourceCol = newColumns[sourceColIndex];
      const targetCol = newColumns[targetColIndex];
      
      if (!sourceCol || !targetCol) return prevColumns;
      
      // Find the task in source column
      const taskIndex = sourceCol.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return prevColumns;
      
      // Remove from source column
      const tasks = sourceCol.tasks.splice(taskIndex, 1);
      const task = tasks[0];
      
      if (!task) return prevColumns;
      
      // Update task status
      task.status = targetCol.id;
      
      // Add to target column at the correct position
      const finalTargetIndex = Math.min(targetIndex, targetCol.tasks.length);
      targetCol.tasks.splice(finalTargetIndex, 0, task);
      
      return newColumns;
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

  const handleAddTask = () => {
    const newTask: Task = {
      id: `task${Date.now()}`,
      title: 'New Task',
      description: 'Task description...',
      status: 'todo',
      assignee: 'Current User',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      project: 'Default Project',
      projectId: 'proj-1',
      tags: ['New'],
      estimatedHours: 4,
      actualHours: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'task'
    };

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      if (newColumns[0]) {
        newColumns[0].tasks.unshift(newTask);
      }
      return newColumns;
    });
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

  const handleTaskClick = (task: Task) => {
    if (hasDragged.current) return;
    
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const columnIndex = newColumns.findIndex(col => col.id === updatedTask.status);
      if (columnIndex !== -1 && newColumns[columnIndex]) {
        const taskIndex = newColumns[columnIndex].tasks.findIndex(task => task.id === updatedTask.id);
        if (taskIndex !== -1) {
          newColumns[columnIndex].tasks[taskIndex] = updatedTask;
        }
      }
      return newColumns;
    });
  };

  const handleTaskDelete = (id: string) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      newColumns.forEach(col => {
        col.tasks = col.tasks.filter(task => task.id !== id);
      });
      return newColumns;
    });
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
      if (columnIndex !== -1) {
        newColumns[columnIndex].name = newName;
      }
      return newColumns;
    });
    setShowColumnRename(null);
  };

  const handleColumnDelete = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return;

    // Move all tasks to the first column
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const columnIndex = newColumns.findIndex(col => col.id === columnId);
      if (columnIndex !== -1 && columnIndex > 0) {
        const tasksToMove = [...newColumns[columnIndex].tasks];
        newColumns[0].tasks.push(...tasksToMove);
        newColumns.splice(columnIndex, 1);
      }
      return newColumns;
    });
    setShowDeleteConfirm(null);
  };

  const renderTaskCard = (task: Task, index: number, columnId: string) => {
    const isDropTarget = dragState.dropTarget?.columnId === columnId && dragState.dropTarget?.index === index;
    const isDragging = dragState.draggedItem?.id === task.id;

    return (
      <React.Fragment key={task.id}>
        {isDropTarget && (
          <div className="drop-zone-space h-4 mb-2">
            <div className="h-full border-2 border-dashed border-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Drop here</span>
            </div>
          </div>
        )}
        
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, task.id, columnId, index)}
          onDragEnd={handleDragEnd}
          onClick={() => handleTaskClick(task)}
          className={`kanban-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
            isDragging ? 'opacity-50' : ''
          }`}
          style={{ minHeight: '120px' }}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
              {task.title}
            </h3>
            <div className="flex items-center space-x-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                task.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {task.priority}
              </span>
            </div>
          </div>

          {task.description && (
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="space-y-2">
            {cardSettings.showAssignee && task.assignee && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <User className="h-3 w-3" />
                <span>{task.assignee}</span>
              </div>
            )}

            {cardSettings.showDueDate && task.dueDate && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}

            {cardSettings.showProject && task.project && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Tag className="h-3 w-3" />
                <span>{task.project}</span>
              </div>
            )}

            {cardSettings.showProgress && task.estimatedHours && (
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <BarChart3 className="h-3 w-3" />
                <span>{task.actualHours || 0}/{task.estimatedHours}h</span>
              </div>
            )}

            {cardSettings.showTags && task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  };

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignee?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    })
  }));

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage and track project tasks
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCardSettings(!showCardSettings)}
                className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Card Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={handleAddTask}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="assignee">Sort by Assignee</option>
              <option value="created">Sort by Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card Settings Panel */}
      {showCardSettings && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Card Display Settings</h3>
            <button
              onClick={() => setShowCardSettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(cardSettings).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleCardSettingsToggle(key as keyof typeof cardSettings)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <div className="relative h-full">
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

          {/* Kanban Columns */}
          <div className="tasks-kanban flex space-x-6 p-6 overflow-x-auto h-full">
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
                      {column.tasks.length}
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
                          <Edit3 className="h-4 w-4 inline mr-2" />
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

                {/* Task Cards */}
                <div className="space-y-2">
                  {column.tasks.map((task, index) => renderTaskCard(task, index, column.id))}
                  
                  {/* Drop zone at the end */}
                  {dragState.dropTarget?.columnId === column.id && dragState.dropTarget?.index === column.tasks.length && (
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

      {/* Task Modal */}
      {showTaskModal && selectedTask && (
        <TaskForm
          task={selectedTask}
          onSave={handleTaskUpdate}
          onDelete={handleTaskDelete}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Column
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this column? All tasks will be moved to the first column.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleColumnDelete(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
