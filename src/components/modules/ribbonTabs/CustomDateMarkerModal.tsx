import React, { useState } from 'react';
import { XMarkIcon, CalendarIcon, TagIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface CustomDateMarker {
  color: string;
  date: Date;
  demo?: boolean;
  id: string;
  label: string;
  projectId: string;
  userId: string;
}

interface CustomDateMarkerModalProps {
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave: (marker: Omit<CustomDateMarker, 'id' | 'userId'>) => void;
  projectId: string;
}

const CustomDateMarkerModal: React.FC<CustomDateMarkerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectId,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const canEdit = canAccess('programme.format.edit');

  const colorOptions = [
    { value: '#3B82F6', label: 'Blue', bgColor: '#DBEAFE' },
    { value: '#10B981', label: 'Green', bgColor: '#D1FAE5' },
    { value: '#F59E0B', label: 'Orange', bgColor: '#FED7AA' },
    { value: '#EF4444', label: 'Red', bgColor: '#FEE2E2' },
    { value: '#8B5CF6', label: 'Purple', bgColor: '#EDE9FE' },
    { value: '#6B7280', label: 'Gray', bgColor: '#F3F4F6' }
  ];

  const handleSave = () => {
    if (!date || !label.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const marker: Omit<CustomDateMarker, 'id' | 'userId'> = {
      date: new Date(date),
      label: label.trim(),
      color,
      projectId
    };

    onSave(marker);
    handleClose();
  };

  const handleClose = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setLabel('');
    setColor('#3B82F6');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CalendarIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Add Custom Date Marker
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Label
              </label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Enter marker label..."
                  className="w-full pl-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!canEdit}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setColor(option.value)}
                    className={`
                      w-full h-10 rounded-md border-2 transition-all duration-200
                      ${color === option.value
                        ? 'border-gray-900 dark:border-gray-100 scale-105'
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      }
                    `}
                    style={{ backgroundColor: option.bgColor }}
                    disabled={!canEdit}
                    title={option.label}
                  >
                    <div
                      className="w-4 h-4 rounded-full mx-auto"
                      style={{ backgroundColor: option.value }}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Preview
              </h4>
              <div className="flex items-center space-x-3">
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {label || 'Marker Label'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {date ? new Date(date).toLocaleDateString() : 'Select date'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !canEdit || !date || !label.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Adding...' : 'Add Marker'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDateMarkerModal; 