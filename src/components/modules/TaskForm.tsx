import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  demoDataService,
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

interface TaskFormProps {
  task?: Task;
  onSave: (task: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

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

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSave,
  onCancel,
  isOpen,
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    project_id: '',
    customer_id: '',
    opportunity_id: '',
    type: 'general',
    assignee: '',
    priority: 'medium',
    status: 'To Do',
    due_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project_id: task.project_id || '',
        customer_id: task.customer_id || '',
        opportunity_id: task.opportunity_id || '',
        type: task.type || 'general',
        assignee: task.assignee || '',
        priority: task.priority || 'medium',
        status: task.status || 'To Do',
        due_date: task.due_date || '',
      });
    }
  }, [task]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use demo data instead of database calls
        const demoProjectsData = await demoDataService.getProjects();
        const demoCustomersData = await demoDataService.getCustomers();

        // Convert demo data to component format
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

        setProjects(projectsData);
        setCustomers(customersData);
        setOpportunities(opportunitiesData);
      } catch (error) {
        console.error('Error loading form data:', error);
        // Set empty arrays as fallback
        setProjects([]);
        setCustomers([]);
        setOpportunities([]);
      }
    };
    loadData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.project_id) {
      newErrors.project_id = 'Project is required';
    }
    if (!formData.assignee?.trim()) {
      newErrors.assignee = 'Assignee is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      case 'medium':
        return <Clock className='h-4 w-4 text-yellow-500' />;
      case 'low':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      default:
        return <Clock className='h-4 w-4 text-gray-500' />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onCancel}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Title */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Task Title *
            </label>
            <input
              type='text'
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder='Enter task title'
            />
            {errors.title && (
              <p className='mt-1 text-sm text-red-600'>{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              rows={3}
              placeholder='Enter task description'
            />
          </div>

          {/* Project and Type */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Project *
              </label>
              <select
                value={formData.project_id}
                onChange={e =>
                  setFormData({ ...formData, project_id: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.project_id
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value=''>Select Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className='mt-1 text-sm text-red-600'>{errors.project_id}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Type
              </label>
              <select
                value={formData.type}
                onChange={e =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='general'>General</option>
                <option value='project'>Project</option>
                <option value='customer'>Customer</option>
                <option value='opportunity'>Opportunity</option>
                <option value='document'>Document</option>
                <option value='calendar'>Calendar</option>
              </select>
            </div>
          </div>

          {/* Customer and Opportunity */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Customer
              </label>
              <select
                value={formData.customer_id}
                onChange={e =>
                  setFormData({ ...formData, customer_id: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Opportunity
              </label>
              <select
                value={formData.opportunity_id}
                onChange={e =>
                  setFormData({ ...formData, opportunity_id: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Select Opportunity</option>
                {opportunities.map(opportunity => (
                  <option key={opportunity.id} value={opportunity.id}>
                    {opportunity.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee and Priority */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Assignee *
              </label>
              <input
                type='text'
                value={formData.assignee}
                onChange={e =>
                  setFormData({ ...formData, assignee: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.assignee
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder='Enter assignee name'
              />
              {errors.assignee && (
                <p className='mt-1 text-sm text-red-600'>{errors.assignee}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Priority
              </label>
              <div className='relative'>
                <select
                  value={formData.priority}
                  onChange={e =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className='w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value='low'>Low</option>
                  <option value='medium'>Medium</option>
                  <option value='high'>High</option>
                </select>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  {getPriorityIcon(formData.priority || 'medium')}
                </div>
              </div>
            </div>
          </div>

          {/* Status and Due Date */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Status
              </label>
              <select
                value={formData.status}
                onChange={e =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='To Do'>To Do</option>
                <option value='In Progress'>In Progress</option>
                <option value='Needs Approval'>Needs Approval</option>
                <option value='Completed'>Completed</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Due Date
              </label>
              <input
                type='date'
                value={formData.due_date}
                onChange={e =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
            <button
              type='button'
              onClick={onCancel}
              className='px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2'
            >
              <Save className='h-4 w-4' />
              <span>
                {loading ? 'Saving...' : task ? 'Update Task' : 'Add Task'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
