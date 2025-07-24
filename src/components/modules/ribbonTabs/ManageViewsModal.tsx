import React, { useState } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon, StarIcon, UserIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { View } from '../../../services/viewService';

interface ManageViewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  views: View[];
  onUpdateView: (view: View) => void;
  onDeleteView: (viewId: string) => void;
  onSetDefault: (viewId: string) => void;
  isDemoMode?: boolean;
}

const ManageViewsModal: React.FC<ManageViewsModalProps> = ({
  isOpen,
  onClose,
  views,
  onUpdateView,
  onDeleteView,
  onSetDefault,
  isDemoMode = false
}) => {
  const [editingView, setEditingView] = useState<View | null>(null);
  const [editName, setEditName] = useState('');
  const { canAccess } = usePermissions();

  const canEdit = canAccess('programme.edit');
  const isSuperAdmin = canAccess('admin'); // Assuming superadmin permission

  const handleEditView = (view: View) => {
    setEditingView(view);
    setEditName(view.name);
  };

  const handleSaveEdit = () => {
    if (!editingView || !editName.trim()) return;

    const updatedView = {
      ...editingView,
      name: editName.trim()
    };

    onUpdateView(updatedView);
    setEditingView(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingView(null);
    setEditName('');
  };

  const handleDeleteView = (viewId: string, viewName: string) => {
    if (confirm(`Are you sure you want to delete the view "${viewName}"?`)) {
      onDeleteView(viewId);
    }
  };

  const canEditView = (view: View) => {
    if (view.type === 'system') return false;
    if (isSuperAdmin) return true;
    if (view.demo && isDemoMode) return true;
    if (!view.demo && !isDemoMode) return true;
    return false;
  };

  const canDeleteView = (view: View) => {
    if (view.type === 'system') return false;
    if (isSuperAdmin) return true;
    if (view.demo && isDemoMode) return true;
    if (!view.demo && !isDemoMode) return true;
    return false;
  };

  if (!isOpen) return null;

  const userViews = views.filter(v => v.type === 'custom');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Views</h2>
              <p className="text-sm text-gray-500">Edit or delete saved views</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {/* System Views */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">System Views</h3>
              <div className="space-y-2">
                {views.filter(v => v.type === 'system').map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center">
                      <EyeIcon className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{view.name}</div>
                        <div className="text-sm text-gray-500">System view - cannot be modified</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSetDefault(view.id)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-600"
                        title="Set as default"
                      >
                        <StarIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Views */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">My Views</h3>
              {userViews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No custom views yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userViews.map((view) => (
                    <div
                      key={view.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        {view.shared ? (
                          <GlobeAltIcon className="w-5 h-5 mr-3 text-blue-500" />
                        ) : (
                          <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {editingView?.id === view.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit();
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                autoFocus
                              />
                            ) : (
                              view.name
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {view.shared ? 'Shared with project' : 'Private view'}
                            {view.demo && ' • Demo'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {editingView?.id === view.id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 hover:bg-green-100 rounded text-green-600"
                              title="Save changes"
                            >
                              <div className="w-4 h-4 text-center">✓</div>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Cancel edit"
                            >
                              <div className="w-4 h-4 text-center">✕</div>
                            </button>
                          </>
                        ) : (
                          <>
                            {canEditView(view) && (
                              <button
                                onClick={() => handleEditView(view)}
                                className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                title="Edit view"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onSetDefault(view.id)}
                              className="p-1 hover:bg-gray-200 rounded text-gray-600"
                              title="Set as default"
                            >
                              <StarIcon className="w-4 h-4" />
                            </button>
                            {canDeleteView(view) && (
                              <button
                                onClick={() => handleDeleteView(view.id, view.name)}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                title="Delete view"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Demo Mode Warning */}
            {isDemoMode && (
              <div className="bg-yellow-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Demo Mode</h4>
                <p className="text-sm text-yellow-800">
                  Views created in demo mode will be reset when switching to live mode.
                  Only demo views can be edited or deleted in demo mode.
                </p>
              </div>
            )}

            {/* Permission Notice */}
            {!canEdit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  You don't have permission to manage views.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
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

export default ManageViewsModal; 