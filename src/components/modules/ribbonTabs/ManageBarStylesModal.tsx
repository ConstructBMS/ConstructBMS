import React, { useState } from 'react';
import { XMarkIcon, SwatchIcon, PlusIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface BarStyle {
  id: string;
  name: string;
  fill: string;
  border: string;
  pattern: 'solid' | 'dashed' | 'dotted' | 'gradient';
  projectId: string;
  userId: string;
  demo?: boolean;
}

interface ManageBarStylesModalProps {
  isOpen: boolean;
  onClose: () => void;
  barStyles: BarStyle[];
  onBarStylesChange: (styles: BarStyle[]) => void;
  onSave: () => void;
  projectId: string;
  loading?: boolean;
}

const ManageBarStylesModal: React.FC<ManageBarStylesModalProps> = ({
  isOpen,
  onClose,
  barStyles,
  onBarStylesChange,
  onSave,
  projectId,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [localBarStyles, setLocalBarStyles] = useState<BarStyle[]>(barStyles);
  const [editingStyle, setEditingStyle] = useState<BarStyle | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const canEdit = canAccess('programme.format.edit');

  // Update local bar styles when props change
  React.useEffect(() => {
    setLocalBarStyles(barStyles);
  }, [barStyles]);

  const patternOptions = [
    { value: 'solid', label: 'Solid', description: 'Solid fill' },
    { value: 'dashed', label: 'Dashed', description: 'Dashed border pattern' },
    { value: 'dotted', label: 'Dotted', description: 'Dotted border pattern' },
    { value: 'gradient', label: 'Gradient', description: 'Gradient fill' }
  ];

  const colorOptions = [
    { value: '#3B82F6', label: 'Blue', bgColor: '#DBEAFE' },
    { value: '#10B981', label: 'Green', bgColor: '#D1FAE5' },
    { value: '#F59E0B', label: 'Orange', bgColor: '#FED7AA' },
    { value: '#EF4444', label: 'Red', bgColor: '#FEE2E2' },
    { value: '#8B5CF6', label: 'Purple', bgColor: '#EDE9FE' },
    { value: '#6B7280', label: 'Gray', bgColor: '#F3F4F6' },
    { value: '#F97316', label: 'Amber', bgColor: '#FED7AA' },
    { value: '#06B6D4', label: 'Cyan', bgColor: '#CFFAFE' }
  ];

  const handleAddStyle = () => {
    const newStyle: Omit<BarStyle, 'id' | 'userId'> = {
      name: '',
      fill: '#3B82F6',
      border: '#1E40AF',
      pattern: 'solid',
      projectId
    };

    setEditingStyle({
      ...newStyle,
      id: `style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current-user'
    });
    setShowAddForm(true);
  };

  const handleEditStyle = (style: BarStyle) => {
    setEditingStyle(style);
    setShowAddForm(true);
  };

  const handleDeleteStyle = (styleId: string) => {
    const updatedStyles = localBarStyles.filter(style => style.id !== styleId);
    setLocalBarStyles(updatedStyles);
  };

  const handleSaveStyle = (style: BarStyle) => {
    if (!style.name.trim()) {
      alert('Please enter a style name');
      return;
    }

    const existingIndex = localBarStyles.findIndex(s => s.id === style.id);
    let updatedStyles: BarStyle[];

    if (existingIndex >= 0) {
      // Update existing style
      updatedStyles = [...localBarStyles];
      updatedStyles[existingIndex] = style;
    } else {
      // Add new style
      updatedStyles = [...localBarStyles, style];
    }

    setLocalBarStyles(updatedStyles);
    setEditingStyle(null);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingStyle(null);
    setShowAddForm(false);
  };

  const handleSave = () => {
    onBarStylesChange(localBarStyles);
    onSave();
    onClose();
  };

  const handleCancel = () => {
    setLocalBarStyles(barStyles); // Reset to original
    setEditingStyle(null);
    setShowAddForm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <SwatchIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Manage Bar Styles
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex h-[calc(90vh-120px)]">
          {/* Bar Styles List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Bar Styles ({localBarStyles.length})
              </h3>
              {canEdit && (
                <button
                  onClick={handleAddStyle}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Style</span>
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {localBarStyles.map((style) => (
                <div
                  key={style.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    {/* Style Preview */}
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-4 rounded border"
                        style={{
                          backgroundColor: style.fill,
                          borderColor: style.border,
                          borderStyle: style.pattern === 'dashed' ? 'dashed' : 
                                     style.pattern === 'dotted' ? 'dotted' : 'solid'
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {style.name}
                      </span>
                    </div>
                    
                    {/* Style Details */}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {style.pattern} • {style.fill} • {style.border}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditStyle(style)}
                      disabled={!canEdit}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Edit style"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteStyle(style.id)}
                        disabled={loading}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Delete style"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {localBarStyles.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <SwatchIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No custom bar styles created yet.</p>
                  <p className="text-sm">Click "Add Style" to create your first custom bar style.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Edit Form */}
          {showAddForm && editingStyle && (
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                {editingStyle.id.startsWith('style_') ? 'Add New Style' : 'Edit Style'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Style Name
                  </label>
                  <input
                    type="text"
                    value={editingStyle.name}
                    onChange={(e) => setEditingStyle({ ...editingStyle, name: e.target.value })}
                    placeholder="Enter style name..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canEdit}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fill Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setEditingStyle({ ...editingStyle, fill: option.value })}
                        className={`
                          w-full h-10 rounded-md border-2 transition-all duration-200
                          ${editingStyle.fill === option.value
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Border Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setEditingStyle({ ...editingStyle, border: option.value })}
                        className={`
                          w-full h-10 rounded-md border-2 transition-all duration-200
                          ${editingStyle.border === option.value
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pattern
                  </label>
                  <select
                    value={editingStyle.pattern}
                    onChange={(e) => setEditingStyle({ ...editingStyle, pattern: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!canEdit}
                  >
                    {patternOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Preview */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Preview
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-16 h-8 rounded border"
                      style={{
                        backgroundColor: editingStyle.fill,
                        borderColor: editingStyle.border,
                        borderStyle: editingStyle.pattern === 'dashed' ? 'dashed' : 
                                   editingStyle.pattern === 'dotted' ? 'dotted' : 'solid'
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium">{editingStyle.name || 'Style Name'}</div>
                      <div className="text-xs text-gray-500">
                        {editingStyle.pattern} • {editingStyle.fill} • {editingStyle.border}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={handleSaveStyle}
                    disabled={!canEdit || loading || !editingStyle.name.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editingStyle.id.startsWith('style_') ? 'Add Style' : 'Update Style'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !canEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageBarStylesModal; 