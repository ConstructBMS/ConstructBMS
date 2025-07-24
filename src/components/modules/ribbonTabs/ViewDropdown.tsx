import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import type { View, ViewConfig } from '../../../services/viewService';

interface ViewDropdownProps {
  activeView: View | null;
  disabled?: boolean;
  loading?: boolean;
  onApplyView: (view: View) => void;
  views: View[];
}

const ViewDropdown: React.FC<ViewDropdownProps> = ({
  views,
  activeView,
  onApplyView,
  disabled = false,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { canAccess } = usePermissions();

  const canView = canAccess('programme.view');
  const isDisabled = disabled || !canView || loading;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewSelect = (view: View) => {
    if (!isDisabled) {
      onApplyView(view);
      setIsOpen(false);
    }
  };

  // System views (built-in)
  const systemViews: View[] = [
    {
      id: 'weekly',
      name: 'Weekly View',
      type: 'system',
      config: {
        filters: [],
        visibleFields: ['name', 'startDate', 'finishDate', 'duration', 'percentComplete'],
        zoomLevel: 'week',
        timelineRange: { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        floatOptions: { total: false, free: false, highlightNegative: false }
      },
      createdBy: 'System',
      shared: true
    },
    {
      id: 'monthly',
      name: 'Monthly View',
      type: 'system',
      config: {
        filters: [],
        visibleFields: ['name', 'startDate', 'finishDate', 'duration', 'percentComplete'],
        zoomLevel: 'month',
        timelineRange: { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        floatOptions: { total: false, free: false, highlightNegative: false }
      },
      createdBy: 'System',
      shared: true
    },
    {
      id: 'milestones',
      name: 'Milestones Only',
      type: 'system',
      config: {
        filters: [{ field: 'isMilestone', operator: 'equals', value: true }],
        visibleFields: ['name', 'startDate', 'finishDate', 'percentComplete'],
        zoomLevel: 'month',
        timelineRange: { start: new Date(), end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
        floatOptions: { total: true, free: false, highlightNegative: true }
      },
      createdBy: 'System',
      shared: true
    },
    {
      id: 'summary',
      name: 'Summary Tasks',
      type: 'system',
      config: {
        filters: [{ field: 'isSummary', operator: 'equals', value: true }],
        visibleFields: ['name', 'startDate', 'finishDate', 'duration', 'percentComplete'],
        zoomLevel: 'week',
        timelineRange: { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        floatOptions: { total: true, free: false, highlightNegative: false }
      },
      createdBy: 'System',
      shared: true
    },
    {
      id: 'critical-path',
      name: 'Critical Path',
      type: 'system',
      config: {
        filters: [{ field: 'isCritical', operator: 'equals', value: true }],
        visibleFields: ['name', 'startDate', 'finishDate', 'duration', 'percentComplete', 'slack'],
        zoomLevel: 'week',
        timelineRange: { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        floatOptions: { total: true, free: true, highlightNegative: true }
      },
      createdBy: 'System',
      shared: true
    }
  ];

  const userViews = views.filter(v => v.type === 'custom');
  const allViews = [...systemViews, ...userViews];

  const getViewDisplayName = () => {
    if (activeView) {
      return activeView.name;
    }
    return 'Change View';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center w-12 h-12
          border border-gray-300 bg-white hover:bg-gray-50
          transition-colors duration-200 rounded
          ${activeView ? 'bg-blue-50 border-blue-300' : ''}
          ${isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-gray-400'
          }
          ${loading ? 'animate-pulse' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        `}
        title="Apply a saved or system-defined view"
      >
        <EyeIcon className={`w-5 h-5 ${activeView ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-700'}`} />
        <div className="flex items-center">
          <span className={`text-xs font-medium mt-1 ${activeView ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
            {getViewDisplayName()}
          </span>
          <ChevronDownIcon className={`w-3 h-3 ml-1 ${activeView ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {/* System Views */}
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">System Views</div>
            </div>
            {systemViews.map((view) => (
              <button
                key={view.id}
                onClick={() => handleViewSelect(view)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                  activeView?.id === view.id ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <div className="flex items-center">
                  <EyeIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">{view.name}</span>
                </div>
                {activeView?.id === view.id && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}

            {/* User Views */}
            {userViews.length > 0 && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <div className="px-3 py-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">My Views</div>
                </div>
                {userViews.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => handleViewSelect(view)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                      activeView?.id === view.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{view.name}</span>
                      {view.demo && (
                        <span className="ml-2 px-1 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                          Demo
                        </span>
                      )}
                    </div>
                    {activeView?.id === view.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                ))}
              </>
            )}

            {userViews.length === 0 && (
              <div className="px-4 py-2 text-sm text-gray-500">
                No custom views yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDropdown; 