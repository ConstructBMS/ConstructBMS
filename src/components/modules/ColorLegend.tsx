import React, { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { taskBarColorService, TaskColorRule, TaskStatus, TaskTag } from '../services/taskBarColorService';

interface ColorLegendProps {
  isOpen: boolean;
  onClose: () => void;
  taskStatuses: TaskStatus[];
  taskTags: TaskTag[];
}

interface LegendItemProps {
  rule: TaskColorRule;
  isDemoMode: boolean;
}

const LegendItem: React.FC<LegendItemProps> = ({ rule, isDemoMode }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Color Swatch */}
      <div
        className={`w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600 ${rule.color}`}
        title={taskBarColorService.getColorDescription(rule.color)}
      />
      
      {/* Rule Info */}
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900 dark:text-white">
            {rule.label}
          </span>
          {isDemoMode && rule.type === 'tag' && (
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded">
              DEMO
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {rule.description}
        </p>
      </div>
      
      {/* Priority Badge */}
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">Priority</span>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
          {rule.priority}
        </span>
      </div>
    </div>
  );
};

const ColorLegend: React.FC<ColorLegendProps> = ({
  isOpen,
  onClose,
  taskStatuses,
  taskTags
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [colorRules, setColorRules] = useState<TaskColorRule[]>([]);

  const canView = canAccess('programme.task.view');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Update color rules when data changes
  useEffect(() => {
    const rules = taskBarColorService.getAllColorRules(taskStatuses, taskTags);
    setColorRules(rules);
  }, [taskStatuses, taskTags]);

  if (!isOpen || !canView) {
    return null;
  }

  const priorityDescription = taskBarColorService.getColorPriorityDescription();
  const demoRestrictions = taskBarColorService.getDemoModeRestrictions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Task Bar Color Legend
            </h2>
            {isDemoMode && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-md font-medium">
                DEMO MODE
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Priority Rules Explanation */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
              Color Priority Rules
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">
              {priorityDescription}
            </div>
          </div>

          {/* Demo Mode Restrictions */}
          {isDemoMode && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Demo Mode Restrictions
              </h3>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                {demoRestrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Color Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Available Colors ({colorRules.length})
            </h3>
            
            <div className="grid gap-4">
              {colorRules.map(rule => (
                <LegendItem
                  key={rule.id}
                  rule={rule}
                  isDemoMode={isDemoMode}
                />
              ))}
            </div>
          </div>

          {/* Color Examples */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Color Examples
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Task Types */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-slate-400 rounded border border-gray-300"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Task</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-fuchsia-500 rounded border border-gray-300"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Milestone</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-700 rounded border border-gray-300"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Phase</span>
                  </div>
                </div>
              </div>

              {/* Status Colors */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-400 rounded border border-gray-300"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Not Started</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded border border-gray-300"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded border border-gray-300"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded border border-gray-300"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">On Hold</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded border border-gray-300"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
                  </div>
                </div>
              </div>

              {/* Tag Colors */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tag Colors</h4>
                <div className="space-y-2">
                  {taskTags.slice(0, 4).map(tag => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{tag.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: '#6366f1' }}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Custom Hex</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-indigo-600 rounded border border-gray-300"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tailwind Class</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Notes */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Usage Notes
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Colors are applied automatically based on priority rules</li>
              <li>• Custom colors override all other color rules</li>
              <li>• Tag colors take precedence over status colors</li>
              <li>• Status colors override default type colors</li>
              <li>• Baseline bars use lighter shades of task colors</li>
              {isDemoMode && (
                <li>• Demo mode restricts custom colors and colored tags</li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorLegend; 