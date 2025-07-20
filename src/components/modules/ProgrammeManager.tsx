import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CogIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import AstaPowerProject from './AstaPowerProject';
import ViewTabTest from './ViewTabTest';
import ProjectTabTest from './ProjectTabTest';
import AllocationTabTest from './AllocationTabTest';
import FormatTabTest from './FormatTabTest';
import OutputTabTest from './OutputTabTest';
import GanttCanvasTest from './GanttCanvasTest';
import TaskTableTest from './TaskTableTest';
import TaskActivitiesTest from './TaskActivitiesTest';
import TaskLinkingTest from './TaskLinkingTest';
import TimelineBandTest from './TimelineBandTest';
import TabColouringTest from './TabColouringTest';
import PrintProfileManagerTest from './PrintProfileManagerTest';
import RescheduleEngineTest from './RescheduleEngineTest';
import AutoSaveTest from './AutoSaveTest';
import PermissionsTest from './PermissionsTest';
import ProjectSettingsTest from './ProjectSettingsTest';

interface ProgrammeManagerProps {
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
}

interface Project {
  id: string;
  name: string;
  client: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  manager: string;
  budget: number;
  actualCost: number;
}

const ProgrammeManager: React.FC<ProgrammeManagerProps> = ({ onNavigateToModule }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAstaPowerProject, setShowAstaPowerProject] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showViewTabTest, setShowViewTabTest] = useState(false);
  const [showProjectTabTest, setShowProjectTabTest] = useState(false);
  const [showAllocationTabTest, setShowAllocationTabTest] = useState(false);
  const [showFormatTabTest, setShowFormatTabTest] = useState(false);
  const [showOutputTabTest, setShowOutputTabTest] = useState(false);
  const [showGanttCanvasTest, setShowGanttCanvasTest] = useState(false);
  const [showTaskTableTest, setShowTaskTableTest] = useState(false);
  const [showTaskActivitiesTest, setShowTaskActivitiesTest] = useState(false);
  const [showTaskLinkingTest, setShowTaskLinkingTest] = useState(false);
  const [showTimelineBandTest, setShowTimelineBandTest] = useState(false);
  const [showTabColouringTest, setShowTabColouringTest] = useState(false);
  const [showPrintProfileManagerTest, setShowPrintProfileManagerTest] = useState(false);
  const [showRescheduleEngineTest, setShowRescheduleEngineTest] = useState(false);
  const [showAutoSaveTest, setShowAutoSaveTest] = useState(false);
  const [showPermissionsTest, setShowPermissionsTest] = useState(false);
  const [showProjectSettingsTest, setShowProjectSettingsTest] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // Load projects from demo data service
      const { demoDataService } = await import('../../services/demoDataService');
      
      // Ensure demo data exists
      await demoDataService.ensureDemoDataExists();
      
      const allProjects = await demoDataService.getDemoProjects();
      
      // Convert to Programme Manager format
      const programmeProjects = allProjects.map((project: any) => ({
        id: project.id.toString(),
        name: project.name,
        client: project.client,
        startDate: new Date(project.startDate),
        endDate: new Date(project.endDate),
        progress: project.progress || 0,
        status: project.status.toLowerCase().replace(' ', '-') as any,
        manager: project.manager || 'Unassigned',
        budget: project.budget || 0,
        actualCost: project.spent || 0
      }));

      setProjects(programmeProjects);
      
      // If we have projects, automatically open the first one in Asta PowerProject
      if (programmeProjects.length > 0) {
        setActiveProjectId(programmeProjects[0]?.id || null);
        setShowAstaPowerProject(true);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // Create sample data
      const sampleProjects = createSampleProjects();
      setProjects(sampleProjects);
      
      // Automatically open the first sample project in Asta PowerProject
      if (sampleProjects.length > 0) {
        setActiveProjectId(sampleProjects[0]?.id || null);
        setShowAstaPowerProject(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const createSampleProjects = (): Project[] => {
    return [
      {
        id: crypto.randomUUID(),
        name: 'Office Building Construction',
        client: 'ABC Corporation',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        progress: 35,
        status: 'active',
        manager: 'John Smith',
        budget: 2500000,
        actualCost: 875000
      },
      {
        id: crypto.randomUUID(),
        name: 'Residential Complex',
        client: 'XYZ Developers',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2025-06-30'),
        progress: 15,
        status: 'active',
        manager: 'Sarah Johnson',
        budget: 1800000,
        actualCost: 270000
      },
      {
        id: crypto.randomUUID(),
        name: 'Shopping Center Renovation',
        client: 'Metro Properties',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        progress: 60,
        status: 'active',
        manager: 'Mike Wilson',
        budget: 800000,
        actualCost: 480000
      },
      {
        id: crypto.randomUUID(),
        name: 'Hospital Extension',
        client: 'City Health Services',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2025-12-31'),
        progress: 0,
        status: 'planning',
        manager: 'Lisa Brown',
        budget: 3500000,
        actualCost: 0
      }
    ];
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = () => {
    // TODO: Implement project creation
    console.log('Create new project');
  };

  const handleOpenAstaPowerProject = (project: Project) => {
    setActiveProjectId(project.id);
    setShowAstaPowerProject(true);
  };

  const handleImportProject = () => {
    // TODO: Implement project import
    console.log('Import project');
  };

  const handleExportProject = () => {
    // TODO: Implement project export
    console.log('Export project');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (showProjectTabTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowProjectTabTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <ProjectTabTest />
        </div>
      </div>
    );
  }

  if (showViewTabTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowViewTabTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <ViewTabTest />
        </div>
      </div>
    );
  }

  if (showAllocationTabTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowAllocationTabTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <AllocationTabTest />
        </div>
      </div>
    );
  }

  if (showFormatTabTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowFormatTabTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <FormatTabTest />
        </div>
      </div>
    );
  }

  if (showOutputTabTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowOutputTabTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <OutputTabTest />
        </div>
      </div>
    );
  }

  if (showGanttCanvasTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowGanttCanvasTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <GanttCanvasTest />
        </div>
      </div>
    );
  }

  if (showTaskTableTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowTaskTableTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <TaskTableTest />
        </div>
      </div>
    );
  }

  if (showTaskActivitiesTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowTaskActivitiesTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <TaskActivitiesTest />
        </div>
      </div>
    );
  }

  if (showTaskLinkingTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowTaskLinkingTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <TaskLinkingTest />
        </div>
      </div>
    );
  }

  if (showTimelineBandTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowTimelineBandTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <TimelineBandTest />
        </div>
      </div>
    );
  }

  if (showTabColouringTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowTabColouringTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <TabColouringTest />
        </div>
      </div>
    );
  }

  if (showPrintProfileManagerTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowPrintProfileManagerTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <PrintProfileManagerTest />
        </div>
      </div>
    );
  }

  if (showRescheduleEngineTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowRescheduleEngineTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <RescheduleEngineTest />
        </div>
      </div>
    );
  }

  if (showAutoSaveTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowAutoSaveTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <AutoSaveTest />
        </div>
      </div>
    );
  }

  if (showPermissionsTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowPermissionsTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <PermissionsTest />
        </div>
      </div>
    );
  }

  if (showProjectSettingsTest) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <button
            onClick={() => setShowProjectSettingsTest(false)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Programme Manager
          </button>
          <ProjectSettingsTest />
        </div>
      </div>
    );
  }

  if (showAstaPowerProject) {
    return (
      <AstaPowerProject 
        projectId={activeProjectId || null}
        onNavigateToModule={onNavigateToModule || (() => {})}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-constructbms-blue"></div>
      </div>
    );
  }

  return (
    <div className="programme-manager p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Programme Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage project schedules, timelines, and resource allocation with Asta PowerProject
            </p>
          </div>
                      <div className="flex space-x-3">
              <button
                onClick={() => setShowProjectTabTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Project Tab
              </button>
              <button
                onClick={() => setShowViewTabTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test View Tab
              </button>
              <button
                onClick={() => setShowAllocationTabTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Allocation Tab
              </button>
              <button
                onClick={() => setShowFormatTabTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Format Tab
              </button>
              <button
                onClick={() => setShowOutputTabTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                Test Output Tab
              </button>
              <button
                onClick={() => setShowGanttCanvasTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <ChartBarIcon className="w-4 h-4" />
                Test Gantt Canvas
              </button>
              <button
                onClick={() => setShowTaskTableTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Task Table
              </button>
              <button
                onClick={() => setShowTaskActivitiesTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Task Activities
              </button>
              <button
                onClick={() => setShowTaskLinkingTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Task Linking
              </button>
              <button
                onClick={() => setShowTimelineBandTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Timeline Band
              </button>
              <button
                onClick={() => setShowTabColouringTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Tab Colouring
              </button>
              <button
                onClick={() => setShowPrintProfileManagerTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Print Profile Manager
              </button>
              <button
                onClick={() => setShowRescheduleEngineTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Reschedule Engine
              </button>
              <button
                onClick={() => setShowAutoSaveTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Auto Save
              </button>
              <button
                onClick={() => setShowPermissionsTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Permissions
              </button>
              <button
                onClick={() => setShowProjectSettingsTest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                Test Project Settings
              </button>
            <button
              onClick={handleImportProject}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <DocumentArrowUpIcon className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={handleExportProject}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-blue/90 transition-colors font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, clients, or managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <FunnelIcon className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {project.client}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>

            {/* Project Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {project.startDate.toLocaleDateString()} - {project.endDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <UserGroupIcon className="w-4 h-4" />
                <span>{project.manager}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <BuildingOfficeIcon className="w-4 h-4" />
                <span>£{(project.budget / 1000).toFixed(0)}k budget</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAstaPowerProject(project);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-blue/90 transition-colors text-sm font-medium"
              >
                <PlayIcon className="w-4 h-4" />
                Open Asta
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Open project details
                }}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first project'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-blue/90 transition-colors font-medium mx-auto"
            >
              <PlusIcon className="w-4 h-4" />
              Create First Project
            </button>
          )}
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedProject.name}
              </h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedProject.client}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Manager
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedProject.manager}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedProject.startDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedProject.endDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget
                  </label>
                  <p className="text-gray-900 dark:text-white">£{selectedProject.budget.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Actual Cost
                  </label>
                  <p className="text-gray-900 dark:text-white">£{selectedProject.actualCost.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    handleOpenAstaPowerProject(selectedProject);
                    setSelectedProject(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-constructbms-blue text-black rounded-lg hover:bg-constructbms-blue/90 transition-colors"
                >
                  <PlayIcon className="w-4 h-4" />
                  Open Asta PowerProject
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammeManager; 