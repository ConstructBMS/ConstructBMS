import React, { useState } from 'react';
import { XMarkIcon, Bars3Icon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

export interface GridColumn {
  field: string;
  id: string;
  name: string;
  order: number;
  type: 'system' | 'custom';
  visible: boolean;
  width?: number;
}

interface ManageColumnsModalProps {
  columns: GridColumn[];
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onColumnsChange: (columns: GridColumn[]) => void;
  onSave: () => void;
}

const ManageColumnsModal: React.FC<ManageColumnsModalProps> = ({
  isOpen,
  onClose,
  columns,
  onColumnsChange,
  onSave,
  loading = false
}) => {
  const { canAccess } = usePermissions();
  const [localColumns, setLocalColumns] = useState<GridColumn[]>(columns);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const canEdit = canAccess('programme.format.edit');

  // Update local columns when props change
  React.useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleToggleVisibility = (columnId: string) => {
    const updatedColumns = localColumns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    setLocalColumns(updatedColumns);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const updatedColumns = [...localColumns];
    const draggedColumn = updatedColumns[draggedIndex];
    
    // Remove dragged item
    updatedColumns.splice(draggedIndex, 1);
    
    // Insert at new position
    updatedColumns.splice(dropIndex, 0, draggedColumn);
    
    // Update order numbers
    updatedColumns.forEach((col, index) => {
      col.order = index;
    });
    
    setLocalColumns(updatedColumns);
    setDraggedIndex(null);
  };

  const handleSave = () => {
    onColumnsChange(localColumns);
    onSave();
    onClose();
  };

  const handleCancel = () => {
    setLocalColumns(columns); // Reset to original
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Bars3Icon className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Manage Columns
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Drag to reorder columns and toggle visibility. Changes will be applied immediately.
          </p>
          
          <div className="space-y-2">
            {localColumns.map((column, index) => (
              <div
                key={column.id}
                draggable={canEdit}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md
                  ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}
                  ${canEdit ? 'cursor-move hover:bg-gray-50 dark:hover:bg-gray-700' : 'cursor-default'}
                  transition-all duration-200
                `}
              >
                <div className="flex items-center space-x-3">
                  {canEdit && (
                    <Bars3Icon className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {column.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {column.type === 'system' ? 'System Field' : 'Custom Field'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleVisibility(column.id)}
                    disabled={!canEdit}
                    className={`
                      p-1 rounded transition-colors duration-200
                      ${canEdit
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'opacity-50 cursor-not-allowed'
                      }
                    `}
                    title={column.visible ? 'Hide column' : 'Show column'}
                  >
                    {column.visible ? (
                      <EyeIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {localColumns.filter(col => col.visible).length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <EyeSlashIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No columns are visible. Please enable at least one column.</p>
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
            disabled={loading || !canEdit || localColumns.filter(col => col.visible).length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageColumnsModal; 