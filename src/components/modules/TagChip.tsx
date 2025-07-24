import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ProjectTag } from '../services/taskTagsService';

interface TagChipProps {
  tag: ProjectTag;
  onRemove?: (tagId: string) => void;
  showRemoveButton?: boolean;
  isDemoMode?: boolean;
  disabled?: boolean;
}

const TagChip: React.FC<TagChipProps> = ({
  tag,
  onRemove,
  showRemoveButton = false,
  isDemoMode = false,
  disabled = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove && !disabled) {
      onRemove(tag.id);
    }
  };

  return (
    <div className="relative inline-block">
      <span
        className={`
          inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium
          transition-all duration-200 cursor-default
          ${disabled ? 'opacity-50' : 'hover:scale-105'}
        `}
        style={{ 
          backgroundColor: tag.color.startsWith('bg-') ? '' : tag.color,
          color: tag.color.startsWith('bg-') ? 'white' : 'white'
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className={tag.color.startsWith('bg-') ? tag.color : ''}>
          {tag.name}
          {isDemoMode && tag.demo && (
            <span className="ml-1 opacity-75">DEMO</span>
          )}
        </span>
        
        {showRemoveButton && onRemove && !disabled && (
          <button
            onClick={handleRemove}
            className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors duration-200"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap">
          <div className="text-center">
            <div className="font-medium">{tag.name}</div>
            <div className="text-gray-300">
              {tag.color.startsWith('bg-') ? 'Tailwind Class' : 'Custom Color'}
            </div>
            {isDemoMode && tag.demo && (
              <div className="text-yellow-400 font-medium">DEMO TAG</div>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default TagChip; 