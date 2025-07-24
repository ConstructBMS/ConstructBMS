import React from 'react';
import { 
  ScissorsIcon, 
  DocumentDuplicateIcon, 
  ClipboardDocumentIcon 
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../../hooks/usePermissions';
import { useClipboard } from '../../../contexts/ClipboardContext';

interface ClipboardButtonProps {
  disabled?: boolean;
  hasClipboardContent?: boolean;
  onClick: () => void;
  selectedTasksCount?: number;
  type: 'cut' | 'copy' | 'paste';
}

const ClipboardButton: React.FC<ClipboardButtonProps> = ({
  type,
  disabled = false,
  onClick,
  selectedTasksCount = 0,
  hasClipboardContent = false
}) => {
  const { canAccess } = usePermissions();
  const { hasClipboardContent: contextHasContent } = useClipboard();

  // Get permission key based on type
  const getPermissionKey = () => {
    switch (type) {
      case 'cut':
        return 'programme.edit';
      case 'copy':
        return 'programme.view';
      case 'paste':
        return 'programme.edit';
      default:
        return 'programme.view';
    }
  };

  // Check if user has permission
  const hasPermission = canAccess(getPermissionKey());

  // Determine if button should be disabled
  const isDisabled = disabled || !hasPermission || 
    (type === 'cut' && selectedTasksCount === 0) ||
    (type === 'copy' && selectedTasksCount === 0) ||
    (type === 'paste' && !contextHasContent());

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'cut':
        return ScissorsIcon;
      case 'copy':
        return DocumentDuplicateIcon;
      case 'paste':
        return ClipboardDocumentIcon;
      default:
        return DocumentDuplicateIcon;
    }
  };

  // Get tooltip text
  const getTooltip = () => {
    switch (type) {
      case 'cut':
        return selectedTasksCount > 0 
          ? `Cut ${selectedTasksCount} selected task(s)` 
          : 'Cut selected task(s)';
      case 'copy':
        return selectedTasksCount > 0 
          ? `Copy ${selectedTasksCount} selected task(s)` 
          : 'Copy selected task(s)';
      case 'paste':
        return contextHasContent() 
          ? 'Paste task(s) at current location' 
          : 'No content in clipboard';
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
      <span className="text-xs text-gray-600 mt-1 font-medium capitalize">
        {type}
      </span>
    </button>
  );
};

export default ClipboardButton; 