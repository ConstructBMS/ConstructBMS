import React, { useState, useMemo } from 'react';
import { XMarkIcon, TableCellsIcon, FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { ConstraintType } from './SetConstraintModal';

export interface ConstrainedTask {
  id: string;
  name: string;
  constraintType: ConstraintType;
  constraintDate: string;
  startDate?: string;
  finishDate?: string;
  isInfluenced: boolean;
  demo?: boolean;
}

interface ConstraintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  constrainedTasks: ConstrainedTask[];
  isDemoMode?: boolean;
}

type SortField = 'name' | 'constraintType' | 'constraintDate' | 'startDate' | 'finishDate';
type SortDirection = 'asc' | 'desc';

const ConstraintReportModal: React.FC<ConstraintReportModalProps> = ({
  isOpen,
  onClose,
  constrainedTasks,
  isDemoMode = false
}) => {
  const [filterType, setFilterType] = useState<ConstraintType | 'all'>('all');
  const [filterInfluenced, setFilterInfluenced] = useState<'all' | 'influenced' | 'not-influenced'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { canAccess } = usePermissions();

  const canView = canAccess('programme.view');

  const constraintTypeLabels = {
    SNET: 'Start No Earlier Than',
    SNLT: 'Start No Later Than',
    FNET: 'Finish No Earlier Than',
    FNLT: 'Finish No Later Than',
    MSO: 'Must Start On',
    MFO: 'Must Finish On'
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = constrainedTasks;

    // Filter by constraint type
    if (filterType !== 'all') {
      filtered = filtered.filter(task => task.constraintType === filterType);
    }

    // Filter by influence
    if (filterInfluenced === 'influenced') {
      filtered = filtered.filter(task => task.isInfluenced);
    } else if (filterInfluenced === 'not-influenced') {
      filtered = filtered.filter(task => !task.isInfluenced);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'constraintType':
          aValue = constraintTypeLabels[a.constraintType];
          bValue = constraintTypeLabels[b.constraintType];
          break;
        case 'constraintDate':
          aValue = new Date(a.constraintDate).getTime();
          bValue = new Date(b.constraintDate).getTime();
          break;
        case 'startDate':
          aValue = a.startDate ? new Date(a.startDate).getTime() : 0;
          bValue = b.startDate ? new Date(b.startDate).getTime() : 0;
          break;
        case 'finishDate':
          aValue = a.finishDate ? new Date(a.finishDate).getTime() : 0;
          bValue = b.finishDate ? new Date(b.finishDate).getTime() : 0;
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [constrainedTasks, filterType, filterInfluenced, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return (
      <ArrowsUpDownIcon 
        className={`w-4 h-4 ml-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} 
      />
    );
  };

  const getConstraintTypeColor = (type: ConstraintType) => {
    const colors = {
      SNET: 'bg-blue-100 text-blue-800',
      SNLT: 'bg-yellow-100 text-yellow-800',
      FNET: 'bg-green-100 text-green-800',
      FNLT: 'bg-red-100 text-red-800',
      MSO: 'bg-purple-100 text-purple-800',
      MFO: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <TableCellsIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Constraint Report</h2>
              <p className="text-sm text-gray-500">
                {constrainedTasks.length} task{constrainedTasks.length !== 1 ? 's' : ''} with constraints
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

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            {/* Constraint Type Filter */}
            <div>
              <label className="text-xs text-gray-600 mr-2">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ConstraintType | 'all')}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Types</option>
                {Object.entries(constraintTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Influence Filter */}
            <div>
              <label className="text-xs text-gray-600 mr-2">Influence:</label>
              <select
                value={filterInfluenced}
                onChange={(e) => setFilterInfluenced(e.target.value as 'all' | 'influenced' | 'not-influenced')}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Tasks</option>
                <option value="influenced">Influenced</option>
                <option value="not-influenced">Not Influenced</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-xs text-gray-500">
              Showing {filteredAndSortedTasks.length} of {constrainedTasks.length} tasks
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {!canView ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">You don't have permission to view constraint reports.</p>
            </div>
          ) : filteredAndSortedTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <TableCellsIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No constraints found matching the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Task Name
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('constraintType')}
                    >
                      <div className="flex items-center">
                        Constraint Type
                        {getSortIcon('constraintType')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('constraintDate')}
                    >
                      <div className="flex items-center">
                        Constraint Date
                        {getSortIcon('constraintDate')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('startDate')}
                    >
                      <div className="flex items-center">
                        Start Date
                        {getSortIcon('startDate')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('finishDate')}
                    >
                      <div className="flex items-center">
                        Finish Date
                        {getSortIcon('finishDate')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Influence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {task.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConstraintTypeColor(task.constraintType)}`}>
                          {constraintTypeLabels[task.constraintType]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(task.constraintDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.startDate ? new Date(task.startDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.finishDate ? new Date(task.finishDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          task.isInfluenced 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.isInfluenced ? 'Influenced' : 'Not Influenced'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.demo && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Demo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {filteredAndSortedTasks.length} task{filteredAndSortedTasks.length !== 1 ? 's' : ''} shown
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

export default ConstraintReportModal; 