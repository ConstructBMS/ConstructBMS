import React, { useState } from 'react';
import { XMarkIcon, FolderIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Baseline } from './SetBaselineModal';

interface ManageBaselinesModalProps {
  baselines: Baseline[];
  isDemoMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (baselineId: string) => void;
  onRename: (baselineId: string, newName: string) => void;
  onView: (baseline: Baseline) => void;
}

const ManageBaselinesModal: React.FC<ManageBaselinesModalProps> = ({
  isOpen,
  onClose,
  baselines,
  onDelete,
  onRename,
  onView,
  isDemoMode = false
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');
  const canView = canAccess('programme.view');

  const handleEdit = (baseline: Baseline) => {
    setEditingId(baseline.id);
    setEditName(baseline.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    setIsLoading(true);
    try {
      await onRename(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
    } catch (error) {
      console.error('Failed to rename baseline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (baselineId: string) => {
    if (!canEdit) return;

    const confirmed = window.confirm('Are you sure you want to delete this baseline? This action cannot be undone.');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await onDelete(baselineId);
    } catch (error) {
      console.error('Failed to delete baseline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FolderIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Baselines</h2>
              <p className="text-sm text-gray-500">
                {baselines.length} baseline{baselines.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isDemoMode && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                Demo Mode
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!canView ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">You don't have permission to view baselines.</p>
            </div>
          ) : baselines.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FolderIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No baselines available</p>
              <p className="text-xs mt-1">Create a baseline first using the Set Baseline button</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {baselines.map((baseline) => (
                  <div
                    key={baseline.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingId === baseline.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                              autoFocus
                            />
                            <button
                              onClick={handleSaveEdit}
                              disabled={isLoading || !editName.trim()}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {baseline.name}
                            </h3>
                            {baseline.demo && (
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                Demo Baseline
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-2 text-sm text-gray-600">
                          <div>Created: {formatDate(baseline.createdAt)}</div>
                          <div>By: {baseline.createdBy}</div>
                          <div>Tasks: {baseline.snapshot?.length || 0} tasks captured</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {canView && (
                          <button
                            onClick={() => onView(baseline)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View baseline details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        {canEdit && editingId !== baseline.id && (
                          <>
                            <button
                              onClick={() => handleEdit(baseline)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Rename baseline"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(baseline.id)}
                              disabled={isLoading}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Delete baseline"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {baselines.length} baseline{baselines.length !== 1 ? 's' : ''} total
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBaselinesModal; 