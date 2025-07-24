import React from 'react';
import { 
  ChevronRightIcon, 
  ChevronLeftIcon, 
  FolderIcon 
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';

interface StructureButtonProps {
  type: 'indent' | 'outdent' | 'summary';
  disabled?: boolean;
  onClick: () => void;
  selectedTasksCount?: number;
  canIndent?: boolean;
  canOutdent?: boolean;
  canMakeSummary?: boolean;
}

const StructureButton: React.FC<StructureButtonProps> = ({
  type,
  disabled = false,
  onClick,
  selectedTasksCount = 0,
  canIndent = true,
  canOutdent = true,
  canMakeSummary = true
}) => {
  const { canAccess } = usePermissions();

  // Check if user has permission
  const hasPermission = canAccess('programme.edit');

  // Determine if button should be disabled based on type and logic
  const getIsDisabled = () => {
    if (disabled || !hasPermission || selectedTasksCount === 0) {
      return true;
    }

    switch (type) {
      case 'indent':
        return !canIndent;
      case 'outdent':
        return !canOutdent;
      case 'summary':
        return !canMakeSummary;
      default:
        return false;
    }
  };

  const isDisabled = getIsDisabled();

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'indent':
        return ChevronRightIcon;
      case 'outdent':
        return ChevronLeftIcon;
      case 'summary':
        return FolderIcon;
      default:
        return ChevronRightIcon;
    }
  };

  // Get tooltip text
  const getTooltip = () => {
    if (selectedTasksCount === 0) {
      return 'Select task(s) to modify structure';
    }

    switch (type) {
      case 'indent':
        return selectedTasksCount > 1 
          ? `Indent ${selectedTasksCount} selected task(s) (make subtask)`
          : 'Move task right (make subtask)';
      case 'outdent':
        return selectedTasksCount > 1 
          ? `Outdent ${selectedTasksCount} selected task(s) (promote level)`
          : 'Move task left (promote level)';
      case 'summary':
        return selectedTasksCount > 1 
          ? `Convert ${selectedTasksCount} selected task(s) to summary tasks`
          : 'Convert to summary task (group tasks)';
      default:
        return '';
    }
  };

  // Get button label
  const getLabel = () => {
    switch (type) {
      case 'indent':
        return 'Indent';
      case 'outdent':
        return 'Outdent';
      case 'summary':
        return 'Summary';
      default:
        return '';
    }
  };

  const IconComponent = getIcon();

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        flex flex-col items-center justify-center w-12 h-12 
        border border-gray-300 bg-white hover:bg-gray-50 
        transition-colors duration-200 rounded
        ${isDisabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:border-gray-400'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      `}
      title={getTooltip()}
    >
      <IconComponent className="w-5 h-5 text-gray-700" />
      <span className="text-xs text-gray-600 mt-1 font-medium">
        {getLabel()}
      </span>
    </button>
  );
};

export default StructureButton; 