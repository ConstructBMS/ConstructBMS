import React, { useState } from 'react';
import HomeTabWithClipboard from './ribbonTabs/HomeTabWithClipboard';
import ProjectTab from './ribbonTabs/ProjectTab';
import ViewTab from './ribbonTabs/ViewTab';
import { ClipboardProvider } from '../../contexts/ClipboardContext';
import { UndoRedoProvider } from '../../contexts/UndoRedoContext';
import { usePermissions } from '../../hooks/usePermissions';
import type { TaskData } from './ribbonTabs/TaskEditModal';

const ClipboardDemo: React.FC = () => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([
    { 
      id: '1', 
      name: 'Project Planning', 
      duration: 5,
      startDate: new Date(),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      notes: 'Initial project planning phase',
      demo: true,
      level: 0,
      isSummary: false
    },
    { 
      id: '2', 
      name: 'Design Phase', 
      duration: 10,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: 'UI/UX design and architecture',
      demo: true,
      level: 0,
      isSummary: false
    },
    { 
      id: '3', 
      name: 'Development', 
      duration: 20,
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 34 * 24 * 60 * 60 * 1000),
      notes: 'Core development work',
      demo: true,
      level: 0,
      isSummary: false
    },
    { 
      id: '4', 
      name: 'Testing', 
      duration: 7,
      startDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 41 * 24 * 60 * 60 * 1000),
      notes: 'Quality assurance and testing',
      demo: true,
      level: 0,
      isSummary: false
    },
    { 
      id: '5', 
      name: 'Deployment', 
      duration: 3,
      startDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000),
      notes: 'Production deployment',
      demo: true,
      level: 0,
      isSummary: false
    }
  ]);
  const [activeRibbonTab, setActiveRibbonTab] = useState('home');
  const [canEdit, setCanEdit] = useState(true);
  const [userRole, setUserRole] = useState('admin');

  const handleTaskOperation = (operation: any) => {
    console.log('Task operation:', operation);
    
    switch (operation.type) {
      case 'cut':
        if (operation.data?.taskIds) {
          // Remove tasks from the list
          setTasks(prev => prev.filter(task => !operation.data.taskIds.includes(task.id)));
          setSelectedTasks([]);
        }
        break;
      case 'copy':
        // Copy operation - tasks remain in the list
        console.log('Copied tasks:', operation.data?.taskIds);
        break;
      case 'paste':
        if (operation.data?.tasks) {
          // Add pasted tasks to the list
          const newTasks = operation.data.tasks.map((task: any) => ({
            id: task.id,
            name: task.name,
            status: 'not-started'
          }));
          setTasks(prev => [...prev, ...newTasks]);
        }
        break;
      case 'delete':
        if (operation.data?.action === 'delete') {
          setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
          setSelectedTasks([]);
        }
        break;
      case 'add':
        if (operation.data?.action === 'new') {
          const newTask: TaskData = {
            id: `task-${Date.now()}`,
            name: `New Task ${tasks.length + 1}`,
            duration: 1,
            startDate: new Date(),
            endDate: new Date(),
            notes: '',
            demo: true,
            level: 0,
            isSummary: false
          };
          setTasks(prev => [...prev, newTask]);
        } else if (operation.data?.action === 'summary') {
          console.log('Summary operation completed for tasks:', operation.data.taskIds);
        } else if (operation.data?.action === 'lag') {
          console.log('Lag operation completed for dependency:', operation.data.dependency);
        } else if (operation.data?.action === 'reschedule') {
          console.log('Reschedule action completed:', operation.data.result);
        } else if (operation.data?.action === 'progress_toggle') {
          console.log('Progress toggle action completed:', operation.data.isVisible);
        } else if (operation.data?.action === 'undo') {
          console.log('Undo action completed');
        } else if (operation.data?.action === 'redo') {
          console.log('Redo action completed');
        } else if (operation.data?.action === 'expand_all') {
          console.log('Expand all action completed:', operation.data.result);
        } else if (operation.data?.action === 'collapse_all') {
          console.log('Collapse all action completed:', operation.data.result);
        } else if (operation.data?.action === 'toggle_summary_bars') {
          console.log('Toggle summary bars action completed:', operation.data.showSummaryBars);
        } else if (operation.data?.action === 'toggle_field') {
          console.log('Toggle field action completed:', operation.data.fieldId);
          console.log('Updated fields config:', operation.data.fields);
        } else if (operation.data?.action === 'recalculate_slack') {
          console.log('Recalculate slack action completed for', operation.data.tasks?.length, 'tasks');
        } else if (operation.data?.action === 'clear_constraints') {
          console.log('Clear constraints action completed for', operation.data.tasksCleared, 'tasks');
        } else if (operation.data?.action === 'validate_logic') {
          console.log('Validate logic action completed with', operation.data.issues?.length, 'issues');
        } else if (operation.data?.action === 'auto_fix_issues') {
          console.log('Auto-fix issues action completed:', operation.data.fixedCount, 'issues fixed');
        } else if (operation.data?.action === 'update_project_details') {
          console.log('Update project details action completed:', operation.data.details);
        } else if (operation.data?.action === 'update_project_notes') {
          console.log('Update project notes action completed:', operation.data.notes);
        } else if (operation.data?.action === 'change_project_status') {
          console.log('Change project status action completed:', operation.data.status);
        } else if (operation.data?.action === 'update_project_calendar') {
          console.log('Update project calendar action completed:', operation.data.calendar);
        } else if (operation.data?.action === 'save_calendar') {
          console.log('Save calendar action completed:', operation.data.calendar);
        } else if (operation.data?.action === 'delete_calendar') {
          console.log('Delete calendar action completed:', operation.data.calendarId);
        } else if (operation.data?.action === 'clone_calendar') {
          console.log('Clone calendar action completed:', operation.data.calendar);
        } else if (operation.data?.action === 'apply_calendar_to_project') {
          console.log('Apply calendar to project action completed:', operation.data.calendar);
        } else if (operation.data?.action === 'apply_calendar_to_tasks') {
          console.log('Apply calendar to tasks action completed:', operation.data.calendarId, operation.data.tasksUpdated, 'tasks updated');
        } else if (operation.data?.action === 'set_constraint') {
          console.log('Set constraint action completed:', operation.data.constraint, operation.data.tasksUpdated, 'tasks updated');
        } else if (operation.data?.action === 'clear_constraint') {
          console.log('Clear constraint action completed:', operation.data.tasksUpdated, 'tasks updated');
        } else if (operation.data?.action === 'create_baseline') {
          console.log('Create baseline action completed:', operation.data.baseline.name);
        } else if (operation.data?.action === 'delete_baseline') {
          console.log('Delete baseline action completed:', operation.data.baselineId);
        } else if (operation.data?.action === 'rename_baseline') {
          console.log('Rename baseline action completed:', operation.data.baselineId, 'to', operation.data.newName);
        } else if (operation.data?.action === 'compare_baseline') {
          console.log('Compare baseline action completed:', operation.data.baselineId);
        } else if (operation.data?.action === 'clear_baseline_comparison') {
          console.log('Clear baseline comparison action completed');
        } else if (operation.data?.action === 'save_custom_fields') {
          console.log('Save custom fields action completed:', operation.data.fields.length, 'fields');
        } else if (operation.data?.action === 'save_field_template') {
          console.log('Save field template action completed:', operation.data.template.name);
        } else if (operation.data?.action === 'update_field_value') {
          console.log('Update field value action completed:', operation.data.taskId, operation.data.fieldId, operation.data.value);
        } else if (operation.data?.action === 'apply_field_template') {
          console.log('Apply field template action completed:', operation.data.template);
        }
        break;
      case 'indent':
        console.log('Indent operation completed for tasks:', operation.data?.taskIds);
        break;
      case 'outdent':
        console.log('Outdent operation completed for tasks:', operation.data?.taskIds);
        break;
      case 'link':
        console.log('Link operation completed for tasks:', operation.data?.taskIds);
        console.log('New dependencies created:', operation.data?.dependencies);
        break;
      case 'unlink':
        console.log('Unlink operation completed for tasks:', operation.data?.taskIds);
        console.log('Removed dependencies:', operation.data?.removedDependencies);
        break;
      case 'reschedule':
        console.log('Reschedule operation completed');
        console.log('Reschedule result:', operation.data?.result);
        break;
      case 'progress_toggle':
        console.log('Progress line toggled:', operation.data?.isVisible);
        break;
      case 'undo':
        console.log('Undo operation completed');
        break;
      case 'redo':
        console.log('Redo operation completed');
        break;
      case 'expand_all':
        console.log('Expand all operation completed');
        console.log('Expand result:', operation.data?.result);
        break;
      case 'collapse_all':
        console.log('Collapse all operation completed');
        console.log('Collapse result:', operation.data?.result);
        break;
      case 'toggle_summary_bars':
        console.log('Summary bars toggled:', operation.data?.showSummaryBars);
        break;
      case 'toggle_field':
        console.log('Field toggled:', operation.data?.fieldId);
        console.log('Updated fields:', operation.data?.fields);
        break;
      case 'recalculate_slack':
        console.log('Slack recalculated for tasks:', operation.data?.tasks?.length);
        break;
      case 'clear_constraints':
        console.log('Constraints cleared from tasks:', operation.data?.tasksCleared);
        break;
      case 'validate_logic':
        console.log('Logic validation completed:', operation.data?.issues?.length, 'issues found');
        break;
      case 'auto_fix_issues':
        console.log('Auto-fix completed:', operation.data?.fixedCount, 'issues fixed');
        break;
      case 'update_project_details':
        console.log('Project details updated:', operation.data?.details);
        break;
      case 'update_project_notes':
        console.log('Project notes updated:', operation.data?.notes);
        break;
      case 'change_project_status':
        console.log('Project status changed to:', operation.data?.status);
        console.log('Status history:', operation.data?.statusHistory);
        break;
      case 'update_project_calendar':
        console.log('Project calendar updated:', operation.data?.calendar);
        break;
      case 'save_calendar':
        console.log('Calendar saved:', operation.data?.calendar);
        break;
      case 'delete_calendar':
        console.log('Calendar deleted:', operation.data?.calendarId);
        break;
      case 'clone_calendar':
        console.log('Calendar cloned:', operation.data?.calendar);
        break;
      case 'apply_calendar_to_project':
        console.log('Calendar applied to project:', operation.data?.calendar);
        break;
      case 'apply_calendar_to_tasks':
        console.log('Calendar applied to tasks:', operation.data?.calendarId, operation.data?.tasksUpdated, 'tasks updated');
        break;
      case 'set_constraint':
        console.log('Constraint set:', operation.data?.constraint, operation.data?.tasksUpdated, 'tasks updated');
        break;
      case 'clear_constraint':
        console.log('Constraints cleared from', operation.data?.tasksUpdated, 'tasks');
        break;
      default:
        console.log('Unhandled operation:', operation);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  return (
          <ClipboardProvider>
        <UndoRedoProvider projectId="demo">
          <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 text-white px-6 py-4">
              <h1 className="text-2xl font-bold">Programme Manager - Clipboard Demo</h1>
              <p className="text-gray-300 mt-1">Testing the Clipboard section of the Home ribbon tab</p>
            </div>

            {/* Controls */}
            <div className="bg-gray-100 px-6 py-4 border-b">
              <div className="flex items-center space-x-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                  <select 
                    value={userRole} 
                    onChange={(e) => setUserRole(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="scheduler">Scheduler</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Can Edit</label>
                  <input 
                    type="checkbox" 
                    checked={canEdit} 
                    onChange={(e) => setCanEdit(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Enable editing</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Active Tab</label>
                  <select 
                    value={activeRibbonTab} 
                    onChange={(e) => setActiveRibbonTab(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="home">Home</option>
                    <option value="view">View</option>
                    <option value="project">Project</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ribbon */}
            {activeRibbonTab === 'home' && (
              <HomeTabWithClipboard
                canEdit={canEdit}
                onTaskOperation={handleTaskOperation}
                selectedTasks={selectedTasks}
                userRole={userRole}
                activeRibbonTab={activeRibbonTab}
                tasks={tasks}
                onTasksUpdate={setTasks}
                projectId="demo-project"
              />
            )}
            
            {activeRibbonTab === 'project' && (
              <ProjectTab
                canEdit={canEdit}
                onTaskOperation={handleTaskOperation}
                selectedTasks={selectedTasks}
                userRole={userRole}
                activeRibbonTab={activeRibbonTab}
              />
            )}

            {activeRibbonTab === 'view' && (
              <ViewTab
                canEdit={canEdit}
                onTaskOperation={handleTaskOperation}
                selectedTasks={selectedTasks}
                userRole={userRole}
                activeRibbonTab={activeRibbonTab}
              />
            )}

            {/* Task List */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h2>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTasks.includes(task.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => toggleTaskSelection(task.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {/* Indentation indicator */}
                        <div className="flex mr-2">
                          {Array.from({ length: task.level || 0 }).map((_, i) => (
                            <div key={i} className="w-2 h-4 border-l-2 border-gray-300 mr-1"></div>
                          ))}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{task.name}</span>
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {task.duration} day{task.duration !== 1 ? 's' : ''}
                          </span>
                          {task.demo && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Demo
                            </span>
                          )}
                          {task.isSummary && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              Summary
                            </span>
                          )}
                          {task.children && task.children.length > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {task.children.length} child{task.children.length !== 1 ? 'ren' : ''}
                            </span>
                          )}
                          {task.dependencies && task.dependencies.length > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                              {task.dependencies.length} dep{task.dependencies.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {task.isSummary && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                              Summary
                            </span>
                          )}
                                                    {task.isCollapsed && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              Collapsed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {task.id} | Level: {task.level || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No tasks available. Use "Add Task" to create new tasks.
                </div>
              )}
            </div>

            {/* Status */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <span className="font-medium">Selected:</span> {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
                </div>
                <div>
                  <span className="font-medium">Total Tasks:</span> {tasks.length}
                </div>
                <div>
                  <span className="font-medium">User Role:</span> {userRole}
                </div>
              </div>
            </div>
          </div>
                  </div>
        </div>
        </UndoRedoProvider>
      </ClipboardProvider>
  );
};

export default ClipboardDemo; 