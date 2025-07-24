import React, { useState } from 'react';
import { XMarkIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface TimelineZone {
  color: string;
  endDate: string;
  id?: string;
  name: string;
  startDate: string;
  tag?: string;
}

interface AddZoneModalProps {
  disabled?: boolean;
  isOpen: boolean;
  onAddZone: (zone: TimelineZone) => void;
  onClose: () => void;
}

const AddZoneModal: React.FC<AddZoneModalProps> = ({
  isOpen,
  onClose,
  onAddZone,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [zone, setZone] = useState<TimelineZone>({
    name: '',
    startDate: '',
    endDate: '',
    color: '#3B82F6',
    tag: ''
  });

  const canEdit = canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const handleInputChange = (field: keyof TimelineZone, value: string) => {
    setZone(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDisabled && zone.name && zone.startDate && zone.endDate) {
      onAddZone(zone);
      setZone({
        name: '',
        startDate: '',
        endDate: '',
        color: '#3B82F6',
        tag: ''
      });
      onClose();
    }
  };

  const handleCancel = () => {
    setZone({
      name: '',
      startDate: '',
      endDate: '',
      color: '#3B82F6',
      tag: ''
    });
    onClose();
  };

  const isFormValid = zone.name.trim() && zone.startDate && zone.endDate && zone.color;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <PlusCircleIcon className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Add Timeline Zone
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Zone Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zone Name *
              </label>
              <input
                type="text"
                value={zone.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="e.g., Holiday Period, Phase 1"
                required
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={zone.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  disabled={isDisabled}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={zone.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  disabled={isDisabled}
                  min={zone.startDate}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zone Color *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={zone.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  disabled={isDisabled}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={zone.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  disabled={isDisabled}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tag (Optional)
              </label>
              <input
                type="text"
                value={zone.tag}
                onChange={(e) => handleInputChange('tag', e.target.value)}
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="e.g., Holiday, Phase, Risk"
              />
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-700">
                <div
                  className="h-8 rounded flex items-center justify-between px-3 text-white text-sm font-medium"
                  style={{ backgroundColor: zone.color }}
                >
                  <span>{zone.name || 'Zone Name'}</span>
                  {zone.tag && (
                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                      {zone.tag}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {zone.startDate && zone.endDate 
                    ? `${zone.startDate} to ${zone.endDate}`
                    : 'Select date range'
                  }
                </div>
              </div>
            </div>
          </div>
        </form>

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
            onClick={handleSubmit}
            disabled={isDisabled || !isFormValid}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Zone
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddZoneModal; 