import React, { useState, useEffect } from 'react';
import { XMarkIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface BarStyle {
  borderColor: string;
  fillColor: string;
  fontSize: number;
  height: number;
  icon?: string;
}

interface TaskTypeStyle {
  critical: BarStyle;
  custom: BarStyle;
  milestone: BarStyle;
  standard: BarStyle;
  summary: BarStyle;
}

interface EditBarStylesModalProps {
  currentStyles: TaskTypeStyle;
  disabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (styles: TaskTypeStyle) => void;
}

const EditBarStylesModal: React.FC<EditBarStylesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentStyles,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [activeTab, setActiveTab] = useState<keyof TaskTypeStyle>('standard');
  const [styles, setStyles] = useState<TaskTypeStyle>(currentStyles);
  const [previewTask, setPreviewTask] = useState<string>('Sample Task');

  const canEdit = canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  useEffect(() => {
    if (isOpen) {
      setStyles(currentStyles);
      setActiveTab('standard');
    }
  }, [isOpen, currentStyles]);

  const handleStyleChange = (taskType: keyof TaskTypeStyle, property: keyof BarStyle, value: string | number) => {
    setStyles(prev => ({
      ...prev,
      [taskType]: {
        ...prev[taskType],
        [property]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(styles);
    onClose();
  };

  const handleCancel = () => {
    setStyles(currentStyles);
    onClose();
  };

  const renderStyleEditor = (taskType: keyof TaskTypeStyle) => {
    const style = styles[taskType];
    const taskTypeLabels = {
      standard: 'Standard Tasks',
      summary: 'Summary Tasks',
      milestone: 'Milestones',
      critical: 'Critical Path',
      custom: 'Custom Tasks'
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {taskTypeLabels[taskType]}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Preview:</span>
            <input
              type="text"
              value={previewTask}
              onChange={(e) => setPreviewTask(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              placeholder="Task name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Color Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Colors</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fill Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={style.fillColor}
                  onChange={(e) => handleStyleChange(taskType, 'fillColor', e.target.value)}
                  disabled={isDisabled}
                  className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={style.fillColor}
                  onChange={(e) => handleStyleChange(taskType, 'fillColor', e.target.value)}
                  disabled={isDisabled}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Border Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={style.borderColor}
                  onChange={(e) => handleStyleChange(taskType, 'borderColor', e.target.value)}
                  disabled={isDisabled}
                  className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={style.borderColor}
                  onChange={(e) => handleStyleChange(taskType, 'borderColor', e.target.value)}
                  disabled={isDisabled}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Size Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Dimensions</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bar Height (px)
              </label>
              <input
                type="range"
                min="12"
                max="32"
                value={style.height}
                onChange={(e) => handleStyleChange(taskType, 'height', parseInt(e.target.value))}
                disabled={isDisabled}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>12px</span>
                <span>{style.height}px</span>
                <span>32px</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Size (px)
              </label>
              <input
                type="range"
                min="10"
                max="18"
                value={style.fontSize}
                onChange={(e) => handleStyleChange(taskType, 'fontSize', parseInt(e.target.value))}
                disabled={isDisabled}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>10px</span>
                <span>{style.fontSize}px</span>
                <span>18px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Preview</h4>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div
              className="inline-block px-3 py-1 rounded text-white font-medium"
              style={{
                backgroundColor: style.fillColor,
                border: `2px solid ${style.borderColor}`,
                height: `${style.height}px`,
                fontSize: `${style.fontSize}px`,
                lineHeight: `${style.height}px`
              }}
            >
              {previewTask}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs: Array<{ icon?: string, key: keyof TaskTypeStyle; label: string; }> = [
    { key: 'standard', label: 'Standard' },
    { key: 'summary', label: 'Summary' },
    { key: 'milestone', label: 'Milestone' },
    { key: 'critical', label: 'Critical' },
    { key: 'custom', label: 'Custom' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <PaintBrushIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Edit Bar Styles
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {renderStyleEditor(activeTab)}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Styles
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBarStylesModal; 