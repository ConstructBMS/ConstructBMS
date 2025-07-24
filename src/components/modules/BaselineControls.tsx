import React, { useState, useEffect } from 'react';
import { ClockIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../hooks/usePermissions';
import { demoModeService } from '../services/demoModeService';
import { baselineService, Baseline } from '../services/baselineService';

interface BaselineControlsProps {
  projectId: string;
  showBaseline: boolean;
  onShowBaselineChange: (show: boolean) => void;
  onBaselineSelect: (baseline: Baseline | null) => void;
  onOpenBaselineManager: () => void;
}

const BaselineControls: React.FC<BaselineControlsProps> = ({
  projectId,
  showBaseline,
  onShowBaselineChange,
  onBaselineSelect,
  onOpenBaselineManager
}) => {
  const { canAccess } = usePermissions();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [baselines, setBaselines] = useState<Baseline[]>([]);
  const [activeBaseline, setActiveBaseline] = useState<Baseline | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const canView = canAccess('programme.baseline.view');
  const canCreate = canAccess('programme.baseline.create');
  const canManage = canAccess('programme.baseline.manage');

  // Check demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const isDemo = await demoModeService.isDemoMode();
      setIsDemoMode(isDemo);
    };
    checkDemoMode();
  }, []);

  // Load baselines
  useEffect(() => {
    loadBaselines();
  }, [projectId]);

  const loadBaselines = async () => {
    try {
      setLoading(true);
      const [projectBaselines, active] = await Promise.all([
        baselineService.getProjectBaselines(projectId),
        baselineService.getActiveBaseline(projectId)
      ]);
      setBaselines(projectBaselines);
      setActiveBaseline(active);
    } catch (error) {
      console.error('Error loading baselines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBaselineSelect = (baseline: Baseline | null) => {
    setActiveBaseline(baseline);
    onBaselineSelect(baseline);
    setShowDropdown(false);
  };

  const handleCreateBaseline = () => {
    if (isDemoMode && baselines.length >= 1) {
      // Show demo limit tooltip
      alert('DEMO LIMIT: Maximum 1 baseline allowed in demo mode');
      return;
    }
    onOpenBaselineManager();
  };

  if (!canView) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Show Baseline Toggle */}
      <button
        onClick={() => onShowBaselineChange(!showBaseline)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${
          showBaseline
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        title="Show baseline overlay"
      >
        <ClockIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Show Baseline</span>
      </button>

      {/* Baseline Selection Dropdown */}
      {showBaseline && canManage && (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            disabled={loading}
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {activeBaseline ? activeBaseline.name : 'Select Baseline'}
            </span>
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
              <div className="p-2">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Loading...</p>
                  </div>
                ) : baselines.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No baselines available</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {baselines.map(baseline => (
                      <button
                        key={baseline.id}
                        onClick={() => handleBaselineSelect(baseline)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                          activeBaseline?.id === baseline.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">
                            {baseline.name}
                            {isDemoMode && baseline.demo && (
                              <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">
                                DEMO
                              </span>
                            )}
                          </span>
                          {activeBaseline?.id === baseline.id && (
                            <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Create Baseline Option */}
                {canCreate && (
                  <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                    <button
                      onClick={handleCreateBaseline}
                      disabled={isDemoMode && baselines.length >= 1}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      + Create New Baseline
                      {isDemoMode && baselines.length >= 1 && (
                        <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">
                          (DEMO LIMIT)
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Manage Baselines Option */}
                {canManage && (
                  <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onOpenBaselineManager();
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Manage Baselines...
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Baseline Button (when no dropdown) */}
      {showBaseline && canCreate && !canManage && (
        <button
          onClick={handleCreateBaseline}
          disabled={isDemoMode && baselines.length >= 1}
          className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          title="Create baseline from current state"
        >
          <ClockIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Create Baseline</span>
        </button>
      )}

      {/* Demo Mode Indicator */}
      {isDemoMode && showBaseline && (
        <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded font-medium">
          DEMO
        </div>
      )}
    </div>
  );
};

export default BaselineControls; 