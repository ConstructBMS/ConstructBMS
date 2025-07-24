import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface TaskIfcLink {
  autoMatched: boolean;
  demo?: boolean;
  endDate: Date;
  id: string;
  ifcElementId: string;
  ifcElementName: string;
  ifcElementType: string;
  linkStatus: 'active' | 'broken';
  startDate: Date;
  taskId: string;
  taskName: string;
}

interface IfcElement {
  id: string;
  level: string;
  name: string;
  type: string;
}

interface LinkInspectorModalProps {
  disabled?: boolean;
  ifcElements: IfcElement[];
  isOpen: boolean;
  onClose: () => void;
  onEditLink: (linkId: string, newIfcElementId: string) => void;
  onRemoveLink: (linkId: string) => void;
  taskIfcLinks: TaskIfcLink[];
}

const LinkInspectorModal: React.FC<LinkInspectorModalProps> = ({
  isOpen,
  onClose,
  onEditLink,
  onRemoveLink,
  taskIfcLinks,
  ifcElements,
  disabled = false
}) => {
  const { canAccess } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingIfcElementId, setEditingIfcElementId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const canEdit = canAccess('programme.4d.edit');
  const isDisabled = disabled || !canEdit;

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setFilterStatus('all');
      setCurrentPage(1);
      setEditingLinkId(null);
    }
  }, [isOpen]);

  const filteredLinks = taskIfcLinks.filter(link => {
    const matchesSearch = 
      link.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.ifcElementName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.ifcElementType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || link.linkStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage);

  const handleEditStart = (link: TaskIfcLink) => {
    setEditingLinkId(link.id);
    setEditingIfcElementId(link.ifcElementId);
  };

  const handleEditSave = () => {
    if (editingLinkId && editingIfcElementId) {
      onEditLink(editingLinkId, editingIfcElementId);
      setEditingLinkId(null);
      setEditingIfcElementId('');
    }
  };

  const handleEditCancel = () => {
    setEditingLinkId(null);
    setEditingIfcElementId('');
  };

  const handleRemoveLink = (linkId: string) => {
    if (window.confirm('Are you sure you want to remove this link?')) {
      onRemoveLink(linkId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'broken': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

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
            <EyeDropperIcon className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Task-Model Link Inspector
            </h2>
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
              {taskIfcLinks.length} link(s) found
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks or IFC elements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="broken">Broken</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-900 dark:text-gray-100">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3">Task Name</th>
                  <th className="px-4 py-3">IFC Element</th>
                  <th className="px-4 py-3">Element Type</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLinks.map((link) => (
                  <tr key={link.id} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium">{link.taskName}</td>
                    <td className="px-4 py-3">
                      {editingLinkId === link.id ? (
                        <select
                          value={editingIfcElementId}
                          onChange={(e) => setEditingIfcElementId(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Select IFC Element</option>
                          {ifcElements.map(element => (
                            <option key={element.id} value={element.id}>
                              {element.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        link.ifcElementName
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(link.ifcElementType)}`}>
                        {link.ifcElementType}
                      </span>
                    </td>
                    <td className="px-4 py-3">{link.startDate.toLocaleDateString()}</td>
                    <td className="px-4 py-3">{link.endDate.toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(link.linkStatus)}`}>
                        {link.linkStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editingLinkId === link.id ? (
                        <div className="flex space-x-1">
                          <button
                            onClick={handleEditSave}
                            disabled={isDisabled}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditStart(link)}
                            disabled={isDisabled}
                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded disabled:opacity-50"
                            title="Change the linked IFC element"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveLink(link.id)}
                            disabled={isDisabled}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                            title="Unlink task from model component"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLinks.length)} of {filteredLinks.length} links
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkInspectorModal; 