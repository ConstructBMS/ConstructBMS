import React from 'react';
import { 
  ScissorsIcon, 
  DocumentDuplicateIcon, 
  ClipboardDocumentIcon,
  TrashIcon,
  PlusIcon,
  FolderIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  LinkIcon,
  NoSymbolIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';

interface HomeRibbonTabProps {
  selectedTasks: string[];
  onAction: (action: string, taskIds?: string[]) => void;
}

import { usePermissions } from '../../../hooks/usePermissions';

export const HomeRibbonTab: React.FC<HomeRibbonTabProps> = ({ selectedTasks, onAction }) => {
  const { canAccess } = usePermissions();
  const projectView = useProjectView();

  const can = (tool: string) => canAccess('gantt.home.' + tool);

  const isActionDisabled = (action: string): boolean => {
    switch (action) {
      case 'cut-tasks':
      case 'copy-tasks':
      case 'delete-task':
      case 'indent-task':
      case 'outdent-task':
      case 'link-task':
      case 'unlink-task':
        return selectedTasks.length === 0;
      case 'paste-tasks':
        return false; // Always enabled for paste
      default:
        return false;
    }
  };

  const handleAction = (action: string) => {
    if (isActionDisabled(action)) return;
    onAction(action, selectedTasks);
  };

  return (
    <div className="flex flex-wrap gap-6 p-4 bg-white border-b border-gray-200">
      {/* Edit Group */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('cut') && (
            <button
              onClick={() => handleAction('cut-tasks')}
              disabled={isActionDisabled('cut-tasks')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Cut selected tasks"
            >
              <ScissorsIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Cut</span>
            </button>
          )}
          
          {can('copy') && (
            <button
              onClick={() => handleAction('copy-tasks')}
              disabled={isActionDisabled('copy-tasks')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Copy selected tasks"
            >
              <DocumentDuplicateIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Copy</span>
            </button>
          )}
          
          {can('paste') && (
            <button
              onClick={() => handleAction('paste-tasks')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Paste tasks"
            >
              <ClipboardDocumentIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Paste</span>
            </button>
          )}
          
          {can('delete') && (
            <button
              onClick={() => handleAction('delete-task')}
              disabled={isActionDisabled('delete-task')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Delete selected tasks"
            >
              <TrashIcon className="h-5 w-5 mb-1 text-red-600" />
              <span className="text-xs text-red-600">Delete</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Edit</div>
      </div>

      {/* Insert Group */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('insert-task') && (
            <button
              onClick={() => handleAction('insert-task')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Insert new task"
            >
              <PlusIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Task</span>
            </button>
          )}
          
          {can('insert-summary') && (
            <button
              onClick={() => handleAction('insert-summary')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Insert summary task"
            >
              <FolderIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Summary</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Insert</div>
      </div>

      {/* Structure Group */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('indent') && (
            <button
              onClick={() => handleAction('indent-task')}
              disabled={isActionDisabled('indent-task')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Indent selected tasks"
            >
              <ChevronRightIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Indent</span>
            </button>
          )}
          
          {can('outdent') && (
            <button
              onClick={() => handleAction('outdent-task')}
              disabled={isActionDisabled('outdent-task')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Outdent selected tasks"
            >
              <ChevronLeftIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Outdent</span>
            </button>
          )}
          
          {can('link') && (
            <button
              onClick={() => handleAction('link-task')}
              disabled={isActionDisabled('link-task')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Link selected tasks"
            >
              <LinkIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Link</span>
            </button>
          )}
          
          {can('unlink') && (
            <button
              onClick={() => handleAction('unlink-task')}
              disabled={isActionDisabled('unlink-task')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              title="Unlink selected tasks"
            >
              <NoSymbolIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Unlink</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Structure</div>
      </div>

      {/* View Settings Group */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('zoom') && (
            <div className="flex flex-col items-center justify-center px-3 py-2 w-20 h-16 border border-gray-300 bg-white rounded">
              <div className="flex items-center space-x-1 mb-1">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-700" />
                <span className="text-xs text-gray-700">Zoom</span>
              </div>
              <select
                value={projectView.state.layoutSettings.zoomLevel}
                onChange={(e) =>
                  projectView.updateLayoutSettings({ zoomLevel: e.target.value as 'day' | 'week' | 'month' })
                }
                className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Select zoom level"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">View Settings</div>
      </div>

      {/* Visibility Group */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('expand') && (
            <button
              onClick={() => handleAction('expand-all')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Expand all tasks"
            >
              <ChevronDownIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Expand All</span>
            </button>
          )}
          
          {can('collapse') && (
            <button
              onClick={() => handleAction('collapse-all')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Collapse all tasks"
            >
              <ChevronUpIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Collapse All</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">Visibility</div>
      </div>

      {/* History Group */}
      <div className="flex flex-col">
        <div className="flex space-x-1 mb-2">
          {can('undo') && (
            <button
              onClick={() => handleAction('undo')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Undo last action"
            >
              <ArrowUturnLeftIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Undo</span>
            </button>
          )}
          
          {can('redo') && (
            <button
              onClick={() => handleAction('redo')}
              className="flex flex-col items-center justify-center px-3 py-2 w-16 h-16 border border-gray-300 bg-white hover:bg-blue-50 rounded transition-colors"
              title="Redo last action"
            >
              <ArrowUturnRightIcon className="h-5 w-5 mb-1 text-gray-700" />
              <span className="text-xs text-gray-700">Redo</span>
            </button>
          )}
        </div>
        <div className="text-xs text-gray-600 font-medium">History</div>
      </div>

      {/* Selection Info */}
      <div className="flex flex-col justify-end ml-auto">
        <div className="text-xs text-gray-500">
          {selectedTasks.length > 0 ? `${selectedTasks.length} task(s) selected` : 'No tasks selected'}
        </div>
      </div>
    </div>
  );
}; 