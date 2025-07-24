import React from 'react';
import { taskTagsService, type ProgrammeTag } from '../../services/taskTagsService';

interface TagPillProps {
  tag: ProgrammeTag;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const TagPill: React.FC<TagPillProps> = ({
  tag,
  size = 'md',
  showLabel = true,
  className = '',
  onClick,
  disabled = false
}) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const baseClasses = `
    inline-flex items-center space-x-1 rounded-full text-white font-medium
    ${sizeClasses[size]}
    ${onClick && !disabled ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  return (
    <span
      className={baseClasses}
      style={{ backgroundColor: tag.color }}
      onClick={handleClick}
      title={tag.demo ? `${tag.label} (Demo tag)` : tag.label}
    >
      <div
        className="w-2 h-2 rounded-full bg-white bg-opacity-20"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
      ></div>
      {showLabel && (
        <span className="truncate">
          {tag.label}
          {tag.demo && (
            <span className="ml-1 opacity-75">(D)</span>
          )}
        </span>
      )}
    </span>
  );
};

export default TagPill; 