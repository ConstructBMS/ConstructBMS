import React, { useState, useEffect } from 'react';
import { XMarkIcon, LinkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface IfcElement {
  id: string;
  level: string;
  material?: string;
  name: string;
  type: string;
}

interface TaskIfcMapping {
  autoMatched: boolean;
  ifcElementId: string;
  ifcElementName: string;
  taskId: string;
  taskName: string;
}

interface SyncTasksIfcModalProps {
  disabled?: boolean;
  ifcElements: IfcElement[];
  isOpen: boolean;
  onClose: () => void;
  onSync: (mappings: TaskIfcMapping[]) => void;
  tasks: any[];
}

const SyncTasksIfcModal: React.FC<SyncTasksIfcModalProps> = ({
  isOpen,
  onClose,
  onSync,
  tasks,
  ifcElements,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [mappings, setMappings] = useState<TaskIfcMapping[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [autoMatchEnabled, setAutoMatchEnabled] = useState(true);

  const canEdit = canAccess('programme.4d.edit');
  const isDisabled = disabled || !canEdit;

  useEffect(() => {
    if (isOpen) {
      generateInitialMappings();
    }
  }, [isOpen, tasks, ifcElements]);

  const generateInitialMappings = () => {
    const initialMappings: TaskIfcMapping[] = [];
    
    tasks.forEach(task => {
      // Try to auto-match based on task name keywords
      const matchedElement = autoMatchEnabled ? findMatchingElement(task.name) : null;
      
      initialMappings.push({
        taskId: task.id,
        taskName: task.name,
        ifcElementId: matchedElement?.id || '',
        ifcElementName: matchedElement?.name || '',
        autoMatched: !!matchedElement
      });
    });
    
    setMappings(initialMappings);
  };

  const findMatchingElement = (taskName: string): IfcElement | null => {
    const keywords = taskName.toLowerCase().split(' ');
    
    for (const element of ifcElements) {
      const elementName = element.name.toLowerCase();
      const elementType = element.type.toLowerCase();
      
      // Check if any keyword matches element name or type
      for (const keyword of keywords) {
        if (elementName.includes(keyword) || elementType.includes(keyword)) {
          return element;
        }
      }
    }
    
    return null;
  };

  const handleMappingChange = (taskId: string, ifcElementId: string) => {
    const element = ifcElements.find(e => e.id === ifcElementId);
    
    setMappings(prev => 
      prev.map(mapping => 
        mapping.taskId === taskId 
          ? { 
              ...mapping, 
              ifcElementId, 
              ifcElementName: element?.name || '',
              autoMatched: false 
            }
          : mapping
      )
    );
  };

  const handleAutoMatch = () => {
    const updatedMappings = mappings.map(mapping => {
      const matchedElement = findMatchingElement(mapping.taskName);
      return {
        ...mapping,
        ifcElementId: matchedElement?.id || mapping.ifcElementId,
        ifcElementName: matchedElement?.name || mapping.ifcElementName,
        autoMatched: !!matchedElement
      };
    });
    
    setMappings(updatedMappings);
  };

  const handleSync = () => {
    const validMappings = mappings.filter(m => m.ifcElementId);
    onSync(validMappings);
    onClose();
  };

  const handleCancel = () => {
    setMappings([]);
    setSearchTerm('');
    setFilterType('all');
    onClose();
  };

  const filteredElements = ifcElements.filter(element => {
    const matchesSearch = element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         element.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || element.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Wall': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'Floor': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'Column': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'Beam': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <LinkIcon className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sync Tasks to IFC
            </h2>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              {tasks.length} task(s), {ifcElements.length} IFC element(s)
            </span>
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
          {/* Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-match"
                    checked={autoMatchEnabled}
                    onChange={(e) => setAutoMatchEnabled(e.target.checked)}
                    disabled={isDisabled}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="auto-match" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Auto-Matching
                  </label>
                </div>
                <button
                  onClick={handleAutoMatch}
                  disabled={isDisabled || !autoMatchEnabled}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Auto-Match All
                </button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {mappings.filter(m => m.ifcElementId).length} of {mappings.length} tasks mapped
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search IFC elements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Types</option>
                <option value="Wall">Walls</option>
                <option value="Floor">Floors</option>
                <option value="Column">Columns</option>
                <option value="Beam">Beams</option>
              </select>
            </div>
          </div>

          {/* Mapping Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-900 dark:text-gray-100">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3">Task Name</th>
                  <th className="px-4 py-3">IFC Element</th>
                  <th className="px-4 py-3">Element Type</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping) => (
                  <tr key={mapping.taskId} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">{mapping.taskName}</td>
                    <td className="px-4 py-3">
                      <select
                        value={mapping.ifcElementId}
                        onChange={(e) => handleMappingChange(mapping.taskId, e.target.value)}
                        disabled={isDisabled}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select IFC Element</option>
                        {filteredElements.map(element => (
                          <option key={element.id} value={element.id}>
                            {element.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {mapping.ifcElementId && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(filteredElements.find(e => e.id === mapping.ifcElementId)?.type || '')}`}>
                          {filteredElements.find(e => e.id === mapping.ifcElementId)?.type || ''}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {mapping.ifcElementId && filteredElements.find(e => e.id === mapping.ifcElementId)?.level}
                    </td>
                    <td className="px-4 py-3">
                      {mapping.ifcElementId ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mapping.autoMatched 
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                            : 'text-green-600 bg-green-50 dark:bg-green-900/20'
                        }`}>
                          {mapping.autoMatched ? 'Auto-Matched' : 'Manual'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-50 dark:bg-gray-900/20">
                          Unmapped
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSync}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sync Mappings ({mappings.filter(m => m.ifcElementId).length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncTasksIfcModal; 