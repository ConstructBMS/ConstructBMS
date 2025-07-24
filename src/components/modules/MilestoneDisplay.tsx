import React, { useState } from 'react';
import { 
  FlagIcon,
  CalendarIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { type Milestone } from '../../services/milestoneService';
import { usePermissions } from '../../hooks/usePermissions';

interface MilestoneDisplayProps {
  milestone: Milestone;
  dayWidth: number;
  projectStartDate: Date;
  rowHeight: number;
  isSelected: boolean;
  onMilestoneClick: (milestoneId: string) => void;
  onMilestoneEdit: (milestoneId: string) => void;
  onMilestoneDelete: (milestoneId: string) => void;
}

const MilestoneDisplay: React.FC<MilestoneDisplayProps> = ({
  milestone,
  dayWidth,
  projectStartDate,
  rowHeight,
  isSelected,
  onMilestoneClick,
  onMilestoneEdit,
  onMilestoneDelete
}) => {
  const { canAccess } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(milestone.name);
  const [showTooltip, setShowTooltip] = useState(false);

  const canEdit = canAccess('programme.task.edit');
  const canView = canAccess('programme.task.view');

  // Calculate milestone position
  const calculatePosition = () => {
    const daysFromStart = Math.floor((milestone.startDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const left = daysFromStart * dayWidth;
    return { left };
  };

  const { left } = calculatePosition();

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canView) {
      onMilestoneClick(milestone.id);
    }
  };

  // Handle edit click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canEdit) {
      onMilestoneEdit(milestone.id);
    }
  };

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canEdit) {
      onMilestoneDelete(milestone.id);
    }
  };

  // Handle inline edit save
  const handleInlineSave = () => {
    // This would typically call the milestone service to update
    setIsEditing(false);
    // For now, just close the edit mode
  };

  // Handle inline edit cancel
  const handleInlineCancel = () => {
    setEditName(milestone.name);
    setIsEditing(false);
  };

  // Get status icon and color
  const getStatusInfo = () => {
    switch (milestone.status) {
      case 'completed':
        return { icon: CheckCircleIcon, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'in-progress':
        return { icon: ClockIcon, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'on-hold':
        return { icon: XMarkIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'cancelled':
        return { icon: XMarkIcon, color: 'text-red-600', bgColor: 'bg-red-100' };
      default:
        return { icon: ClockIcon, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Get milestone color
  const getMilestoneColor = () => {
    if (milestone.demo || milestone.demoMode) {
      return '#ec4899'; // Pink for demo
    }
    if (milestone.isCritical || milestone.critical) {
      return '#ef4444'; // Red for critical
    }
    return '#3b82f6'; // Blue for normal
  };

  const milestoneColor = getMilestoneColor();

  return (
    <div
      className={`milestone-display relative cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Milestone diamond */}
      <div
        className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4"
        style={{ left: `${left}px` }}
      >
        <div
          className="w-full h-full transform rotate-45"
          style={{ backgroundColor: milestoneColor }}
        />
      </div>

      {/* Milestone content */}
      <div className="ml-6 flex items-center justify-between">
        {/* Left side - Name and details */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInlineSave();
                  if (e.key === 'Escape') handleInlineCancel();
                }}
              />
              <button
                onClick={handleInlineSave}
                className="p-1 text-green-600 hover:text-green-700"
              >
                <CheckCircleIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleInlineCancel}
                className="p-1 text-gray-600 hover:text-gray-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {milestone.name}
              </h4>
              
              {/* Demo mode indicator */}
              {(milestone.demo || milestone.demoMode) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-200">
                  DEMO
                </span>
              )}

              {/* Critical indicator */}
              {(milestone.isCritical || milestone.critical) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  Critical
                </span>
              )}

              {/* Status indicator */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {milestone.status?.replace('-', ' ')}
              </span>
            </div>
          )}

          {/* Secondary info */}
          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-3 h-3" />
              <span>{milestone.startDate.toLocaleDateString()}</span>
            </div>
            
            {milestone.tag && (
              <div className="flex items-center space-x-1">
                <TagIcon className="w-3 h-3" />
                <span>{milestone.tag}</span>
              </div>
            )}
          </div>

          {/* Notes preview */}
          {milestone.notes && (
            <p className="text-xs text-gray-600 dark:text-gray-500 mt-1 truncate">
              {milestone.notes}
            </p>
          )}
        </div>

        {/* Right side - Actions */}
        {canEdit && !isEditing && (
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={handleEditClick}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit milestone"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete milestone"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="font-medium">{milestone.name}</div>
          <div className="text-xs text-gray-300">
            Date: {milestone.startDate.toLocaleDateString()}
          </div>
          {milestone.tag && (
            <div className="text-xs text-gray-300">
              Tag: {milestone.tag}
            </div>
          )}
          {(milestone.demo || milestone.demoMode) && (
            <div className="text-xs text-pink-300 font-medium">
              {/* milestoneService.getDemoModeConfig().watermark */}
            </div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default MilestoneDisplay; 