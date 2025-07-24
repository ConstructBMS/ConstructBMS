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
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useProjectView } from '../../../contexts/ProjectViewContext';
import { usePermissions } from '../../../hooks/usePermissions';

interface HomeRibbonTabProps {
  onAction: (action: string, taskIds?: string[]) => void;
  selectedTasks: string[];
}

export const HomeRibbonTab: React.FC<HomeRibbonTabProps> = ({
  selectedTasks,
  onAction,
}) => {
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
    <div className='ribbon-tab-content'>
      {/* Edit Group */}
      <div className='ribbon-section'>
        <div className='ribbon-section-header'>Edit</div>
        <div className='ribbon-section-content'>
          {can('cut') && (
            <button
              onClick={() => handleAction('cut-tasks')}
              disabled={isActionDisabled('cut-tasks')}
              className='ribbon-button flex items-center space-x-1'
              title='Cut selected tasks'
            >
              <ScissorsIcon className='w-4 h-4' />
              <span>Cut</span>
            </button>
          )}

          {can('copy') && (
            <button
              onClick={() => handleAction('copy-tasks')}
              disabled={isActionDisabled('copy-tasks')}
              className='ribbon-button flex items-center space-x-1'
              title='Copy selected tasks'
            >
              <DocumentDuplicateIcon className='w-4 h-4' />
              <span>Copy</span>
            </button>
          )}

          {can('paste') && (
            <button
              onClick={() => handleAction('paste-tasks')}
              className='ribbon-button flex items-center space-x-1'
              title='Paste tasks'
            >
              <ClipboardDocumentIcon className='w-4 h-4' />
              <span>Paste</span>
            </button>
          )}

          {can('delete') && (
            <button
              onClick={() => handleAction('delete-task')}
              disabled={isActionDisabled('delete-task')}
              className='ribbon-button ribbon-button-danger flex items-center space-x-1'
              title='Delete selected tasks'
            >
              <TrashIcon className='w-4 h-4' />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Insert Group */}
      <div className='ribbon-section'>
        <div className='ribbon-section-header'>Insert</div>
        <div className='ribbon-section-content'>
          {can('insert-task') && (
            <button
              onClick={() => handleAction('insert-task')}
              className='ribbon-button flex items-center space-x-1'
              title='Insert new task'
            >
              <PlusIcon className='w-4 h-4' />
              <span>Task</span>
            </button>
          )}

          {can('insert-summary') && (
            <button
              onClick={() => handleAction('insert-summary')}
              className='ribbon-button flex items-center space-x-1'
              title='Insert summary task'
            >
              <FolderIcon className='w-4 h-4' />
              <span>Summary</span>
            </button>
          )}
        </div>
      </div>

      {/* Structure Group */}
      <div className='ribbon-section'>
        <div className='ribbon-section-header'>Structure</div>
        <div className='ribbon-section-content'>
          {can('indent') && (
            <button
              onClick={() => handleAction('indent-task')}
              disabled={isActionDisabled('indent-task')}
              className='ribbon-button flex items-center space-x-1'
              title='Indent selected tasks'
            >
              <ChevronRightIcon className='w-4 h-4' />
              <span>Indent</span>
            </button>
          )}

          {can('outdent') && (
            <button
              onClick={() => handleAction('outdent-task')}
              disabled={isActionDisabled('outdent-task')}
              className='ribbon-button flex items-center space-x-1'
              title='Outdent selected tasks'
            >
              <ChevronLeftIcon className='w-4 h-4' />
              <span>Outdent</span>
            </button>
          )}

          {can('link') && (
            <button
              onClick={() => handleAction('link-task')}
              disabled={isActionDisabled('link-task')}
              className='ribbon-button flex items-center space-x-1'
              title='Link selected tasks'
            >
              <LinkIcon className='w-4 h-4' />
              <span>Link</span>
            </button>
          )}

          {can('unlink') && (
            <button
              onClick={() => handleAction('unlink-task')}
              disabled={isActionDisabled('unlink-task')}
              className='ribbon-button flex items-center space-x-1'
              title='Unlink selected tasks'
            >
              <NoSymbolIcon className='w-4 h-4' />
              <span>Unlink</span>
            </button>
          )}
        </div>
      </div>

      {/* View Settings Group */}
      <div className='ribbon-section'>
        <div className='ribbon-section-header'>View Settings</div>
        <div className='ribbon-section-content'>
          {can('zoom') && (
            <div className='flex items-center space-x-2'>
              <div className='flex items-center space-x-1'>
                <MagnifyingGlassIcon className='w-4 h-4 text-gray-600' />
                <span className='text-sm text-gray-700'>Zoom:</span>
              </div>
              <select
                value={projectView.state.layoutSettings.zoomLevel}
                onChange={e =>
                  projectView.updateLayoutSettings({
                    zoomLevel: e.target.value as 'day' | 'week' | 'month',
                  })
                }
                className='border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400'
                title='Select zoom level'
              >
                <option value='day'>Day</option>
                <option value='week'>Week</option>
                <option value='month'>Month</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Visibility Group */}
      <div className='ribbon-section'>
        <div className='ribbon-section-header'>Visibility</div>
        <div className='ribbon-section-content'>
          {can('expand') && (
            <button
              onClick={() => handleAction('expand-all')}
              className='ribbon-button flex items-center space-x-1'
              title='Expand all tasks'
            >
              <ChevronDownIcon className='w-4 h-4' />
              <span>Expand All</span>
            </button>
          )}

          {can('collapse') && (
            <button
              onClick={() => handleAction('collapse-all')}
              className='ribbon-button flex items-center space-x-1'
              title='Collapse all tasks'
            >
              <ChevronUpIcon className='w-4 h-4' />
              <span>Collapse All</span>
            </button>
          )}
        </div>
      </div>

      {/* History Group */}
      <div className='ribbon-section'>
        <div className='ribbon-section-header'>History</div>
        <div className='ribbon-section-content'>
          {can('undo') && (
            <button
              onClick={() => handleAction('undo')}
              className='ribbon-button flex items-center space-x-1'
              title='Undo last action'
            >
              <ArrowUturnLeftIcon className='w-4 h-4' />
              <span>Undo</span>
            </button>
          )}

          {can('redo') && (
            <button
              onClick={() => handleAction('redo')}
              className='ribbon-button flex items-center space-x-1'
              title='Redo last action'
            >
              <ArrowUturnRightIcon className='w-4 h-4' />
              <span>Redo</span>
            </button>
          )}
        </div>
      </div>

      {/* Selection Info */}
      <div className='flex flex-col justify-end ml-auto'>
        <div className='text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded'>
          {selectedTasks.length > 0
            ? `${selectedTasks.length} task(s) selected`
            : 'No tasks selected'}
        </div>
      </div>
    </div>
  );
};
