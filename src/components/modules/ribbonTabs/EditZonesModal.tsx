import React, { useState } from 'react';
import { XMarkIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { TimelineZone } from './AddZoneModal';

interface EditZonesModalProps {
  disabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onDeleteZone: (zoneId: string) => void;
  onUpdateZone: (zone: TimelineZone) => void;
  zones: TimelineZone[];
}

const EditZonesModal: React.FC<EditZonesModalProps> = ({
  isOpen,
  onClose,
  zones,
  onUpdateZone,
  onDeleteZone,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [editingZone, setEditingZone] = useState<TimelineZone | null>(null);
  const [editForm, setEditForm] = useState<TimelineZone>({
    name: '',
    startDate: '',
    endDate: '',
    color: '#3B82F6',
    tag: ''
  });

  const canEdit = canAccess('programme.format.edit');
  const isDisabled = disabled || !canEdit;

  const handleEditZone = (zone: TimelineZone) => {
    setEditingZone(zone);
    setEditForm({
      name: zone.name,
      startDate: zone.startDate,
      endDate: zone.endDate,
      color: zone.color,
      tag: zone.tag || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingZone && editForm.name && editForm.startDate && editForm.endDate) {
      onUpdateZone({
        ...editingZone,
        ...editForm
      });
      setEditingZone(null);
      setEditForm({
        name: '',
        startDate: '',
        endDate: '',
        color: '#3B82F6',
        tag: ''
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingZone(null);
    setEditForm({
      name: '',
      startDate: '',
      endDate: '',
      color: '#3B82F6',
      tag: ''
    });
  };

  const handleDeleteZone = (zoneId: string) => {
    if (window.confirm('Are you sure you want to delete this zone?')) {
      onDeleteZone(zoneId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <PencilSquareIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Edit Timeline Zones
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {zones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No timeline zones found.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Use the "Add Zone" button to create your first timeline zone.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  {editingZone?.id === zone.id ? (
                    // Edit Form
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Zone Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            disabled={isDisabled}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tag
                          </label>
                          <input
                            type="text"
                            value={editForm.tag}
                            onChange={(e) => setEditForm(prev => ({ ...prev, tag: e.target.value }))}
                            disabled={isDisabled}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={editForm.startDate}
                            onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                            disabled={isDisabled}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={editForm.endDate}
                            onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                            disabled={isDisabled}
                            min={editForm.startDate}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Color
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={editForm.color}
                              onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                              disabled={isDisabled}
                              className="w-10 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer disabled:opacity-50"
                            />
                            <input
                              type="text"
                              value={editForm.color}
                              onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                              disabled={isDisabled}
                              className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          disabled={isDisabled}
                          className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={isDisabled || !editForm.name || !editForm.startDate || !editForm.endDate}
                          className="px-3 py-1 text-sm text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: zone.color }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {zone.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {zone.startDate} to {zone.endDate}
                            {zone.tag && ` • ${zone.tag}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditZone(zone)}
                          disabled={isDisabled}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
                          title="Edit zone"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteZone(zone.id!)}
                          disabled={isDisabled}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                          title="Delete zone"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditZonesModal; 