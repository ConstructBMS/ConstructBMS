import React, { useState } from 'react';
import { 
  ScissorsIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  DocumentPlusIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { useProjectView } from '../../../contexts/ProjectViewContext';

export const EditTab: React.FC = () => {
  const { canAccess } = usePermissions();
  const { state } = useProjectView();
  const { selectedTasks } = state;
  
  // Mock tasks and updateTask for now - these should come from your task service
  const tasks: any[] = []; // Replace with actual task service
  const updateTask = (taskId: string, updates: any) => {
    console.log('Update task:', taskId, updates);
    // Replace with actual task update logic
  };
  
  // Modal and state management
  const [modal, setModal] = useState('');
  const [clipboard, setClipboard] = useState<any[]>([]);
  const [clipboardMode, setClipboardMode] = useState<'copy' | 'cut' | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const can = (key: string) => canAccess(`gantt.edit.${key}`);

  // Event handlers
  const handleEditAction = (action: string, payload?: any) => {
    if (!selectedTasks.length && !['new-task', 'undo', 'redo'].includes(action)) {
      console.log('No tasks selected');
      return;
    }

    switch (action) {
      case 'cut-tasks':
        const cutTasks = tasks?.filter(t => selectedTasks.includes(t.id)) || [];
        setClipboard(cutTasks);
        setClipboardMode('cut');
        // Mark tasks for deletion after paste
        console.log('Cut tasks:', cutTasks.map(t => t.name));
        break;
        
      case 'copy-tasks':
        const copyTasks = tasks?.filter(t => selectedTasks.includes(t.id)) || [];
        setClipboard(copyTasks);
        setClipboardMode('copy');
        console.log('Copied tasks:', copyTasks.map(t => t.name));
        break;
        
      case 'paste-tasks':
        if (clipboard.length > 0) {
          const parentId = selectedTasks.length === 1 ? selectedTasks[0] : null;
          clipboard.forEach(task => {
            const newTask = {
              ...task,
              id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              parentId: parentId,
              name: `${task.name} (Copy)`
            };
            // Add to history
            addToHistory('add', newTask);
            console.log('Pasted task:', newTask.name);
          });
          
          if (clipboardMode === 'cut') {
            // Remove original tasks
            selectedTasks.forEach(taskId => {
              addToHistory('delete', tasks?.find(t => t.id === taskId));
            });
            setClipboard([]);
            setClipboardMode(null);
          }
        }
        break;
        
      case 'insert-task':
        const newTask = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: 'New Task',
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
          duration: 1,
          percentComplete: 0,
          status: 'not-started',
          level: 0,
          parentId: selectedTasks.length === 1 ? selectedTasks[0] : null,
          position: 0,
          taskType: 'normal',
          priority: 'medium',
          assignedTo: '',
          dependencies: [],
          predecessors: [],
          successors: [],
          resources: [],
          cost: 0,
          notes: ''
        };
        addToHistory('add', newTask);
        console.log('Inserted new task:', newTask.name);
        break;
        
      case 'indent-task':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task && task.level < 5) {
            const updatedTask = { ...task, level: task.level + 1 };
            addToHistory('update', updatedTask);
            console.log('Indented task:', task.name);
          }
        });
        break;
        
      case 'outdent-task':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task && task.level > 0) {
            const updatedTask = { ...task, level: task.level - 1 };
            addToHistory('update', updatedTask);
            console.log('Outdented task:', task.name);
          }
        });
        break;
        
      case 'delete-task':
        selectedTasks.forEach(taskId => {
          const task = tasks?.find(t => t.id === taskId);
          if (task) {
            addToHistory('delete', task);
            console.log('Deleted task:', task.name);
          }
        });
        break;
        
      case 'edit-task':
        if (selectedTasks.length === 1) {
          openModal('task-editor');
        } else {
          console.log('Select exactly one task to edit');
        }
        break;
        
      case 'undo':
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          const action = history[newIndex];
          console.log('Undo:', action);
          // Apply undo logic here
        }
        break;
        
      case 'redo':
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          const action = history[newIndex];
          console.log('Redo:', action);
          // Apply redo logic here
        }
        break;
        
      case 'duplicate-task':
        if (selectedTasks.length === 1) {
          const originalTask = tasks?.find(t => t.id === selectedTasks[0]);
          if (originalTask) {
            const duplicatedTask = {
              ...originalTask,
              id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: `${originalTask.name} (Copy)`,
              startDate: new Date(originalTask.startDate.getTime() + 24 * 60 * 60 * 1000), // 1 day later
              endDate: new Date(originalTask.endDate.getTime() + 24 * 60 * 60 * 1000)
            };
            addToHistory('add', duplicatedTask);
            console.log('Duplicated task:', duplicatedTask.name);
          }
        }
        break;
        
      case 'clear-clipboard':
        setClipboard([]);
        setClipboardMode(null);
        console.log('Cleared clipboard');
        break;
    }
  };

  const addToHistory = (action: string, task: any) => {
    const historyEntry = {
      action,
      task,
      timestamp: Date.now()
    };
    
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(historyEntry);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const openModal = (id: string) => setModal(id);

  const getEditInfo = () => {
    return {
      selectedCount: selectedTasks.length,
      clipboardCount: clipboard.length,
      clipboardMode,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1
    };
  };

  const editInfo = getEditInfo();

  return (
    <>
      <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
        {/* Clipboard */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleEditAction('cut-tasks')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-orange-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Cut Selected Tasks"
            >
              <ScissorsIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Cut</span>
            </button>
            <button
              onClick={() => handleEditAction('copy-tasks')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy Selected Tasks"
            >
              <DocumentDuplicateIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Copy</span>
            </button>
            <button
              onClick={() => handleEditAction('paste-tasks')}
              disabled={!clipboard.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Paste Tasks"
            >
              <ClipboardDocumentIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Paste</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Clipboard</div>
        </div>

        {/* Insert/Delete */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleEditAction('insert-task')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-green-50 rounded transition-colors"
              title="Insert New Task"
            >
              <PlusIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Insert</span>
            </button>
            <button
              onClick={() => handleEditAction('delete-task')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete Selected Tasks"
            >
              <TrashIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Delete</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Tasks</div>
        </div>

        {/* Indentation */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleEditAction('indent-task')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Indent Selected Tasks"
            >
              <ArrowUturnRightIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Indent</span>
            </button>
            <button
              onClick={() => handleEditAction('outdent-task')}
              disabled={!selectedTasks.length}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Outdent Selected Tasks"
            >
              <ArrowUturnLeftIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Outdent</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Structure</div>
        </div>

        {/* History Section */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleEditAction('undo')}
              disabled={!editInfo.canUndo}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-yellow-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo Last Action"
            >
              <ArrowUturnLeftIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Undo</span>
            </button>
            <button
              onClick={() => handleEditAction('redo')}
              disabled={!editInfo.canRedo}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-yellow-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo Last Action"
            >
              <ArrowUturnRightIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Redo</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">History</div>
        </div>

        {/* Additional Tools */}
        <div className="flex flex-col">
          <div className="flex space-x-1 mb-2">
            <button
              onClick={() => handleEditAction('duplicate-task')}
              disabled={selectedTasks.length !== 1}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-purple-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Duplicate Selected Task"
            >
              <DocumentPlusIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Duplicate</span>
            </button>
            <button
              onClick={() => openModal('edit-manager')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-indigo-50 rounded transition-colors"
              title="Edit Manager"
            >
              <Cog6ToothIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Manage</span>
            </button>
          </div>
          <div className="text-xs text-gray-600 font-medium">Tools</div>
        </div>

        {/* Status Display */}
        <div className="flex flex-col justify-end ml-auto">
          <div className="text-xs text-gray-500">
            Selected: {editInfo.selectedCount} task{editInfo.selectedCount !== 1 ? 's' : ''}
          </div>
          {editInfo.clipboardCount > 0 && (
            <div className="text-xs text-gray-500">
              Clipboard: {editInfo.clipboardCount} ({editInfo.clipboardMode})
            </div>
          )}
          <div className="text-xs text-gray-500">
            History: {editInfo.canUndo ? 'Can undo' : 'No undo'} / {editInfo.canRedo ? 'Can redo' : 'No redo'}
          </div>
        </div>
      </div>

      {/* Modal System */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 capitalize">
                {modal.replace(/([A-Z])/g, ' $1').replace('-', ' ').trim()}
              </h2>
              <button
                onClick={() => setModal('')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Task Editor Modal */}
            {modal === 'task-editor' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <PencilIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Task Editor</h3>
                    <p className="text-sm text-blue-700">Edit task properties and settings</p>
                  </div>
                </div>

                {selectedTasks.length === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                      <input
                        type="text"
                        defaultValue={tasks?.find(t => t.id === selectedTasks[0])?.name || ''}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="Enter task name..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          defaultValue={tasks?.find(t => t.id === selectedTasks[0])?.startDate?.toISOString().split('T')[0] || ''}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                        <input
                          type="number"
                          defaultValue={tasks?.find(t => t.id === selectedTasks[0])?.duration || 1}
                          min="1"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="delayed">Delayed</option>
                        <option value="on-hold">On Hold</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        rows={3}
                        defaultValue={tasks?.find(t => t.id === selectedTasks[0])?.notes || ''}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
                        placeholder="Add notes about this task..."
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={() => setModal('')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Edit Manager Modal */}
            {modal === 'edit-manager' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg">
                  <Cog6ToothIcon className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h3 className="font-medium text-indigo-900">Edit Manager</h3>
                    <p className="text-sm text-indigo-700">Manage editing operations and history</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Clipboard</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Items in clipboard</span>
                        <span className="text-sm font-medium">{clipboard.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Clipboard mode</span>
                        <span className="text-sm font-medium">{clipboardMode || 'None'}</span>
                      </div>
                      <button
                        onClick={() => handleEditAction('clear-clipboard')}
                        disabled={!clipboard.length}
                        className="w-full px-3 py-2 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50"
                      >
                        Clear Clipboard
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">History</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Actions recorded</span>
                        <span className="text-sm font-medium">{history.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Current position</span>
                        <span className="text-sm font-medium">{historyIndex + 1}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAction('undo')}
                          disabled={!editInfo.canUndo}
                          className="flex-1 px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 disabled:opacity-50"
                        >
                          Undo
                        </button>
                        <button
                          onClick={() => handleEditAction('redo')}
                          disabled={!editInfo.canRedo}
                          className="flex-1 px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 disabled:opacity-50"
                        >
                          Redo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Edit Operations</span>
                  </div>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Cut/Copy operations store tasks in clipboard</li>
                    <li>• Paste creates new tasks with unique IDs</li>
                    <li>• Delete operations can be undone</li>
                    <li>• History tracks all edit operations</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button onClick={() => setModal('')} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 