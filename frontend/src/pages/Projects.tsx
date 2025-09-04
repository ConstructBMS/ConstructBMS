import {
  Calendar,
  CheckSquare,
  Clock,
  Edit,
  Eye,
  FileText,
  FolderOpen,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  progress: number;
  client: string;
  contractor: string;
  consultant: string;
  budget: number;
  manager: string;
  team: string[];
  tags: string[];
  notes: number;
  documents: number;
  tasks: number;
}

const Projects: React.FC = () => {
  const [viewMode, setViewMode] = useState<'card' | 'grid' | 'kanban' | 'list'>(
    'card'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Sample data for demonstration
  const projects: Project[] = [
    {
      id: '1',
      name: 'Office Building Renovation',
      description:
        'Complete renovation of 5-story office building including HVAC, electrical, and interior finishes',
      status: 'in_progress',
      priority: 'high',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      progress: 65,
      client: 'ABC Corporation',
      contractor: 'BuildRight Construction',
      consultant: 'Design Associates Ltd',
      budget: 2500000,
      manager: 'John Smith',
      team: ['Sarah Johnson', 'Mike Wilson', 'Lisa Brown'],
      tags: ['Renovation', 'Office', 'Commercial'],
      notes: 12,
      documents: 45,
      tasks: 28,
    },
    {
      id: '2',
      name: 'Residential Complex Development',
      description:
        'New construction of 50-unit residential complex with amenities and parking',
      status: 'planning',
      priority: 'medium',
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      progress: 25,
      client: 'XYZ Developers',
      contractor: 'Urban Builders',
      consultant: 'City Planning Group',
      budget: 8500000,
      manager: 'Emma Davis',
      team: ['Tom Anderson', 'Rachel Green'],
      tags: ['Residential', 'New Construction', 'Multi-family'],
      notes: 8,
      documents: 23,
      tasks: 15,
    },
    {
      id: '3',
      name: 'Shopping Center Expansion',
      description:
        'Expansion of existing shopping center including new wing and parking structure',
      status: 'completed',
      priority: 'low',
      startDate: '2023-09-01',
      endDate: '2024-01-30',
      progress: 100,
      client: 'Retail Group Ltd',
      contractor: 'Commercial Builders Inc',
      consultant: 'Retail Design Studio',
      budget: 4200000,
      manager: 'David Wilson',
      team: ['Amy Chen', 'Robert Taylor'],
      tags: ['Commercial', 'Retail', 'Expansion'],
      notes: 25,
      documents: 67,
      tasks: 42,
    },
    {
      id: '4',
      name: 'Hospital Wing Addition',
      description:
        'New emergency wing addition with state-of-the-art medical facilities',
      status: 'in_progress',
      priority: 'critical',
      startDate: '2024-02-01',
      endDate: '2025-03-31',
      progress: 35,
      client: 'City General Hospital',
      contractor: 'Healthcare Construction Co',
      consultant: 'Medical Architecture Partners',
      budget: 15000000,
      manager: 'Dr. Sarah Miller',
      team: ['Dr. James Wilson', 'Nurse Lisa Brown', 'Admin Mike Davis'],
      tags: ['Healthcare', 'Emergency', 'Medical'],
      notes: 18,
      documents: 89,
      tasks: 56,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'planning':
        return 'text-yellow-600 bg-yellow-100';
      case 'on_hold':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const renderCardView = () => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {filteredProjects.map(project => (
        <div
          key={project.id}
          className='card hover:shadow-lg transition-shadow'
        >
          <div className='p-6'>
            {/* Header */}
            <div className='flex items-start justify-between mb-4'>
              <div className='flex-1'>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  {project.name}
                </h3>
                <p className='text-sm text-gray-600 line-clamp-2'>
                  {project.description}
                </p>
              </div>
              <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg'>
                <MoreHorizontal className='w-4 h-4' />
              </button>
            </div>

            {/* Status and Priority */}
            <div className='flex items-center space-x-2 mb-4'>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
              >
                {project.status.replace('_', ' ')}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}
              >
                {project.priority}
              </span>
            </div>

            {/* Progress */}
            <div className='mb-4'>
              <div className='flex justify-between text-sm text-gray-600 mb-1'>
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-primary-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Key Info */}
            <div className='space-y-2 mb-4 text-sm'>
              <div className='flex items-center text-gray-600'>
                <Users className='w-4 h-4 mr-2' />
                <span>{project.client}</span>
              </div>
              <div className='flex items-center text-gray-600'>
                <Calendar className='w-4 h-4 mr-2' />
                <span>
                  {project.startDate} - {project.endDate}
                </span>
              </div>
              <div className='flex items-center text-gray-600'>
                <Clock className='w-4 h-4 mr-2' />
                <span>£{project.budget.toLocaleString()}</span>
              </div>
            </div>

            {/* Integration Stats */}
            <div className='flex items-center justify-between text-xs text-gray-500 border-t pt-3'>
              <div className='flex items-center space-x-4'>
                <span className='flex items-center'>
                  <FileText className='w-3 h-3 mr-1' />
                  {project.documents}
                </span>
                <span className='flex items-center'>
                  <CheckSquare className='w-3 h-3 mr-1' />
                  {project.tasks}
                </span>
                <span className='flex items-center'>
                  <Edit className='w-3 h-3 mr-1' />
                  {project.notes}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className='flex items-center justify-between mt-4 pt-3 border-t'>
              <button className='flex items-center px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg'>
                <Eye className='w-4 h-4 mr-1' />
                View
              </button>
              <div className='flex space-x-2'>
                <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg'>
                  <Edit className='w-4 h-4' />
                </button>
                <button className='p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg'>
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {filteredProjects.map(project => (
        <div
          key={project.id}
          className='card text-center hover:shadow-lg transition-shadow'
        >
          <div className='p-4'>
            <div className='w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3'>
              <FolderOpen className='w-8 h-8 text-primary-600' />
            </div>
            <h3 className='font-semibold text-gray-900 mb-2 line-clamp-2'>
              {project.name}
            </h3>
            <div className='space-y-2 text-sm'>
              <div
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
              >
                {project.status.replace('_', ' ')}
              </div>
              <div className='text-gray-600'>{project.client}</div>
              <div className='text-gray-500'>{project.progress}% Complete</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderKanbanView = () => {
    const statuses = ['planning', 'in_progress', 'on_hold', 'completed'];

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {statuses.map(status => (
          <div key={status} className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold text-gray-900 capitalize'>
                {status.replace('_', ' ')}
              </h3>
              <span className='px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm'>
                {filteredProjects.filter(p => p.status === status).length}
              </span>
            </div>

            <div className='space-y-3'>
              {filteredProjects
                .filter(project => project.status === status)
                .map(project => (
                  <div
                    key={project.id}
                    className='card p-4 cursor-pointer hover:shadow-md transition-shadow'
                  >
                    <h4 className='font-medium text-gray-900 mb-2 line-clamp-2'>
                      {project.name}
                    </h4>
                    <div className='flex items-center justify-between text-sm text-gray-600 mb-2'>
                      <span>{project.client}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}
                      >
                        {project.priority}
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-primary-600 h-2 rounded-full'
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className='text-xs text-gray-500 mt-2'>
                      {project.progress}%
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => (
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead>
          <tr className='border-b border-gray-200'>
            <th className='text-left py-3 px-4 font-medium text-gray-900'>
              Project
            </th>
            <th className='text-left py-3 px-4 font-medium text-gray-900'>
              Client
            </th>
            <th className='text-left py-3 px-4 font-medium text-gray-900'>
              Status
            </th>
            <th className='text-left py-3 px-4 font-medium text-gray-900'>
              Priority
            </th>
            <th className='text-left py-3 px-4 font-medium text-gray-900'>
              Progress
            </th>
            <th className='text-left py-3 px-4 font-medium text-gray-900'>
              Timeline
            </th>
            <th className='text-left py-3 px-4 font-medium text-gray-900'>
              Budget
            </th>
            <th className='text-left py-3 px-4 font-medium text-gray-900'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map(project => (
            <tr
              key={project.id}
              className='border-b border-gray-100 hover:bg-gray-50'
            >
              <td className='py-3 px-4'>
                <div>
                  <div className='font-medium text-gray-900'>
                    {project.name}
                  </div>
                  <div className='text-sm text-gray-500 line-clamp-1'>
                    {project.description}
                  </div>
                </div>
              </td>
              <td className='py-3 px-4 text-sm text-gray-600'>
                {project.client}
              </td>
              <td className='py-3 px-4'>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                >
                  {project.status.replace('_', ' ')}
                </span>
              </td>
              <td className='py-3 px-4'>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}
                >
                  {project.priority}
                </span>
              </td>
              <td className='py-3 px-4'>
                <div className='flex items-center space-x-2'>
                  <div className='w-20 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-primary-600 h-2 rounded-full'
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className='text-sm text-gray-600'>
                    {project.progress}%
                  </span>
                </div>
              </td>
              <td className='py-3 px-4 text-sm text-gray-600'>
                {project.startDate} - {project.endDate}
              </td>
              <td className='py-3 px-4 text-sm text-gray-600'>
                £{project.budget.toLocaleString()}
              </td>
              <td className='py-3 px-4'>
                <div className='flex space-x-2'>
                  <button className='p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'>
                    <Eye className='w-4 h-4' />
                  </button>
                  <button className='p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'>
                    <Edit className='w-4 h-4' />
                  </button>
                  <button className='p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded'>
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Projects</h1>
          <p className='text-gray-600'>
            Manage your construction projects and track progress
          </p>
        </div>
        <button className='flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700'>
          <Plus className='w-4 h-4 mr-2' />
          New Project
        </button>
      </div>

      {/* Controls */}
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Search */}
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              type='text'
              placeholder='Search projects...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Filters */}
        <div className='flex gap-2'>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          >
            <option value='all'>All Statuses</option>
            <option value='planning'>Planning</option>
            <option value='in_progress'>In Progress</option>
            <option value='on_hold'>On Hold</option>
            <option value='completed'>Completed</option>
            <option value='cancelled'>Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          >
            <option value='all'>All Priorities</option>
            <option value='critical'>Critical</option>
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </select>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className='flex items-center space-x-1 bg-gray-100 p-1 rounded-lg w-fit'>
        <button
          onClick={() => setViewMode('card')}
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'card'
              ? 'bg-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Grid3X3 className='w-4 h-4' />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'grid'
              ? 'bg-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Grid3X3 className='w-4 h-4' />
        </button>
        <button
          onClick={() => setViewMode('kanban')}
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'kanban'
              ? 'bg-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Grid3X3 className='w-4 h-4' />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'list'
              ? 'bg-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List className='w-4 h-4' />
        </button>
      </div>

      {/* Content */}
      <div className='min-h-[600px]'>
        {viewMode === 'card' && renderCardView()}
        {viewMode === 'grid' && renderGridView()}
        {viewMode === 'kanban' && renderKanbanView()}
        {viewMode === 'list' && renderListView()}
      </div>
    </div>
  );
};

export default Projects;
