import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface Resource {
  id: string;
  name: string;
  type: 'labour' | 'material' | 'cost';
  availability: number;
  cost: number;
  unit: string;
}

interface AssignedResource {
  resourceId: string;
  type: 'labour' | 'material' | 'cost';
  quantity: number;
  unit: string;
  rate: number;
  fromDate: Date;
  toDate: Date;
}

interface AssignResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignments: AssignedResource[]) => void;
  selectedTaskId?: string;
  disabled?: boolean;
}

const AssignResourceModal: React.FC<AssignResourceModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  selectedTaskId,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [assignments, setAssignments] = useState<AssignedResource[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  const canEdit = canAccess('programme.resource.edit');
  const isDisabled = disabled || !canEdit;

  // Mock available resources - in real app this would come from service
  const availableResources: Resource[] = [
    { id: 'labour-1', name: 'Project Manager', type: 'labour', availability: 100, cost: 75, unit: 'hrs' },
    { id: 'labour-2', name: 'Site Engineer', type: 'labour', availability: 100, cost: 45, unit: 'hrs' },
    { id: 'labour-3', name: 'Carpenter', type: 'labour', availability: 100, cost: 35, unit: 'hrs' },
    { id: 'labour-4', name: 'Electrician', type: 'labour', availability: 100, cost: 40, unit: 'hrs' },
    { id: 'material-1', name: 'Concrete (m³)', type: 'material', availability: 1000, cost: 120, unit: 'm³' },
    { id: 'material-2', name: 'Steel Reinforcement', type: 'material', availability: 500, cost: 850, unit: 'ton' },
    { id: 'material-3', name: 'Bricks', type: 'material', availability: 10000, cost: 0.5, unit: 'piece' },
    { id: 'cost-1', name: 'Equipment Rental', type: 'cost', availability: 100, cost: 200, unit: 'day' },
    { id: 'cost-2', name: 'Site Security', type: 'cost', availability: 100, cost: 150, unit: 'day' }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'labour': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'material': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'cost': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'labour': return '👷';
      case 'material': return '🏗️';
      case 'cost': return '💰';
      default: return '📋';
    }
  };

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleAddAssignment = () => {
    const newAssignments = selectedResources.map(resourceId => {
      const resource = availableResources.find(r => r.id === resourceId);
      if (!resource) return null;

      return {
        resourceId,
        type: resource.type,
        quantity: 1,
        unit: resource.unit,
        rate: resource.cost,
        fromDate: new Date(),
        toDate: new Date()
      };
    }).filter(Boolean) as AssignedResource[];

    setAssignments(prev => [...prev, ...newAssignments]);
    setSelectedResources([]);
  };

  const handleRemoveAssignment = (index: number) => {
    setAssignments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAssignmentChange = (index: number, field: keyof AssignedResource, value: any) => {
    setAssignments(prev => prev.map((assignment, i) => 
      i === index ? { ...assignment, [field]: value } : assignment
    ));
  };

  const handleAssign = () => {
    if (assignments.length > 0) {
      onAssign(assignments);
      onClose();
    }
  };

  const handleCancel = () => {
    setAssignments([]);
    setSelectedResources([]);
    onClose();
  };

  const groupedResources = availableResources.reduce((groups, resource) => {
    if (!groups[resource.type]) {
      groups[resource.type] = [];
    }
    groups[resource.type].push(resource);
    return groups;
  }, {} as Record<string, Resource[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <PlusIcon className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Assign Resources
            </h2>
            {selectedTaskId && (
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                Task ID: {selectedTaskId}
              </span>
            )}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Resources */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Available Resources
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(groupedResources).map(([type, resources]) => (
                  <div key={type}>
                    <div className={`text-xs font-medium uppercase tracking-wide mb-2 ${getTypeColor(type)} px-2 py-1 rounded`}>
                      {getTypeIcon(type)} {type}
                    </div>
                    {resources.map(resource => (
                      <label
                        key={resource.id}
                        className={`flex items-center p-2 rounded border cursor-pointer transition-colors ${
                          selectedResources.includes(resource.id)
                            ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                            : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedResources.includes(resource.id)}
                          onChange={() => handleResourceToggle(resource.id)}
                          disabled={isDisabled}
                          className="mr-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {resource.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            £{resource.cost}/{resource.unit} • {resource.availability}% available
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddAssignment}
                disabled={isDisabled || selectedResources.length === 0}
                className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Selected Resources
              </button>
            </div>

            {/* Assignment Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Assignment Details
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {assignments.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No resources assigned yet. Select resources from the left panel.
                  </p>
                ) : (
                  assignments.map((assignment, index) => {
                    const resource = availableResources.find(r => r.id === assignment.resourceId);
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded border ${getTypeColor(assignment.type)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="mr-2">{getTypeIcon(assignment.type)}</span>
                            <span className="font-medium">{resource?.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveAssignment(index)}
                            disabled={isDisabled}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={assignment.quantity}
                              onChange={(e) => handleAssignmentChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Rate (£)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={assignment.rate}
                              onChange={(e) => handleAssignmentChange(index, 'rate', parseFloat(e.target.value) || 0)}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                              From Date
                            </label>
                            <input
                              type="date"
                              value={assignment.fromDate.toISOString().split('T')[0]}
                              onChange={(e) => handleAssignmentChange(index, 'fromDate', new Date(e.target.value))}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                              To Date
                            </label>
                            <input
                              type="date"
                              value={assignment.toDate.toISOString().split('T')[0]}
                              onChange={(e) => handleAssignmentChange(index, 'toDate', new Date(e.target.value))}
                              disabled={isDisabled}
                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Total: £{(assignment.quantity * assignment.rate).toFixed(2)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
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
            onClick={handleAssign}
            disabled={isDisabled || assignments.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignResourceModal; 