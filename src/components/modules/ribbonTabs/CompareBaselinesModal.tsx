import React, { useState } from 'react';
import { XMarkIcon, ChartBarIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Baseline } from './SetBaselineModal';

interface CompareBaselinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  baselines: Baseline[];
  activeBaselineId?: string;
  onCompare: (baselineId: string) => void;
  onClearComparison: () => void;
  isDemoMode?: boolean;
}

const CompareBaselinesModal: React.FC<CompareBaselinesModalProps> = ({
  isOpen,
  onClose,
  baselines,
  activeBaselineId,
  onCompare,
  onClearComparison,
  isDemoMode = false
}) => {
  const [selectedBaselineId, setSelectedBaselineId] = useState<string>(activeBaselineId || '');
  const { canAccess } = usePermissions();

  const canView = canAccess('programme.view');

  const handleCompare = () => {
    if (selectedBaselineId) {
      onCompare(selectedBaselineId);
      onClose();
    }
  };

  const handleClearComparison = () => {
    onClearComparison();
    setSelectedBaselineId('');
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSelectedBaseline = () => {
    return baselines.find(b => b.id === selectedBaselineId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Compare Baselines</h2>
              <p className="text-sm text-gray-500">Overlay a baseline on the live schedule</p>
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
        <div className="p-6">
          {!canView ? (
            <div className="text-center text-gray-500">
              <p className="text-sm">You don't have permission to compare baselines.</p>
            </div>
          ) : baselines.length === 0 ? (
            <div className="text-center text-gray-500">
              <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No baselines available for comparison</p>
              <p className="text-xs mt-1">Create a baseline first using the Set Baseline button</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Status */}
              {activeBaselineId && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Currently Comparing</h4>
                      <p className="text-sm text-blue-800">
                        {baselines.find(b => b.id === activeBaselineId)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Baseline Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Baseline to Compare
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {baselines.map((baseline) => (
                    <div
                      key={baseline.id}
                      className={`
                        border rounded-lg p-3 cursor-pointer transition-colors
                        ${selectedBaselineId === baseline.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => setSelectedBaselineId(baseline.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{baseline.name}</h4>
                            {baseline.demo && (
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                Demo
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Created: {formatDate(baseline.createdAt)} • {baseline.snapshot?.length || 0} tasks
                          </div>
                        </div>
                        {selectedBaselineId === baseline.id && (
                          <div className="text-blue-600">
                            <EyeIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Preview */}
              {selectedBaselineId && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Comparison Preview</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Baseline bars will be shown in a secondary color</div>
                    <div>• Current schedule bars will remain in primary color</div>
                    <div>• Slippage will be highlighted where dates differ</div>
                    <div>• You can toggle the comparison on/off</div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-yellow-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">How it works</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <div>• Select a baseline to overlay on the current schedule</div>
                  <div>• The Gantt chart will show both baseline and current bars</div>
                  <div>• Use this to identify schedule changes and slippage</div>
                  <div>• Clear the comparison to return to normal view</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {activeBaselineId && (
                <button
                  onClick={handleClearComparison}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <EyeSlashIcon className="w-4 h-4 inline mr-1" />
                  Clear Comparison
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              {canView && selectedBaselineId && (
                <button
                  onClick={handleCompare}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <EyeIcon className="w-4 h-4 inline mr-1" />
                  Compare Baseline
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareBaselinesModal; 