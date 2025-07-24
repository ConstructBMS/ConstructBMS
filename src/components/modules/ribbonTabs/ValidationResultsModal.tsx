import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface ValidationIssue {
  taskId: string;
  taskName: string;
  issue: string;
  fixable: boolean;
  severity: 'error' | 'warning' | 'info';
  suggestedFix?: string;
}

interface ValidationResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: ValidationIssue[];
  onAutoFix: (issueIds: string[]) => void;
  isDemoMode?: boolean;
}

const ValidationResultsModal: React.FC<ValidationResultsModalProps> = ({
  isOpen,
  onClose,
  issues,
  onAutoFix,
  isDemoMode = false
}) => {
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleSelectIssue = (issueId: string) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(issueId)) {
      newSelected.delete(issueId);
    } else {
      newSelected.add(issueId);
    }
    setSelectedIssues(newSelected);
  };

  const handleSelectAll = () => {
    const fixableIssues = issues.filter(issue => issue.fixable).map(issue => issue.taskId);
    setSelectedIssues(new Set(fixableIssues));
  };

  const handleClearSelection = () => {
    setSelectedIssues(new Set());
  };

  const handleAutoFix = () => {
    onAutoFix(Array.from(selectedIssues));
    setSelectedIssues(new Set());
  };

  const getSeverityIcon = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  const warningCount = issues.filter(issue => issue.severity === 'warning').length;
  const infoCount = issues.filter(issue => issue.severity === 'info').length;
  const fixableCount = issues.filter(issue => issue.fixable).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Logic Validation Results</h2>
              <p className="text-sm text-gray-500">
                {issues.length} issue{issues.length !== 1 ? 's' : ''} found
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

        {/* Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
              <span className="text-red-700">{errorCount} Error{errorCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-700">{warningCount} Warning{warningCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-blue-500" />
              <span className="text-blue-700">{infoCount} Info</span>
            </div>
            {fixableCount > 0 && (
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-green-700">{fixableCount} Auto-fixable</span>
              </div>
            )}
          </div>
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto p-6">
          {issues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
              <p className="text-gray-500">Your project logic appears to be valid.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.taskId}
                  className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSeverityIcon(issue.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {issue.taskName}
                        </h4>
                        {issue.fixable && (
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedIssues.has(issue.taskId)}
                              onChange={() => handleSelectIssue(issue.taskId)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-500">Auto-fix</span>
                          </label>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{issue.issue}</p>
                      {issue.suggestedFix && (
                        <p className="text-xs text-gray-600 mt-2">
                          <span className="font-medium">Suggested fix:</span> {issue.suggestedFix}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {fixableCount > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Select All Fixable
                </button>
                <button
                  onClick={handleClearSelection}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
              <button
                onClick={handleAutoFix}
                disabled={selectedIssues.size === 0}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedIssues.size === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                Auto-fix Selected ({selectedIssues.size})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationResultsModal; 