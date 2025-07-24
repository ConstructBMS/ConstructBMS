import React, { useState, useEffect, useRef } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface InlineEditCellProps {
  className?: string;
  disabled?: boolean;
  onCancel: () => void;
  onSave: (value: any) => void;
  options?: Array<{ color?: string, id: string; name: string; }>;
  placeholder?: string;
  type: 'text' | 'date' | 'select' | 'multiselect' | 'readonly';
  value: any;
}

const InlineEditCell: React.FC<InlineEditCellProps> = ({
  value,
  type,
  options = [],
  onSave,
  onCancel,
  placeholder = '',
  disabled = false,
  className = ''
}) => {
  const [editValue, setEditValue] = useState<any>(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (disabled || type === 'readonly') return;
    setIsEditing(true);
  };

  const handleSave = () => {
    if (type === 'multiselect') {
      onSave(editValue);
    } else {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Small delay to allow for button clicks
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 100);
  };

  // Text input
  if (type === 'text' && isEditing) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-100 rounded"
        >
          <CheckIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:bg-red-100 rounded"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Date input
  if (type === 'date' && isEditing) {
    const dateValue = editValue instanceof Date 
      ? editValue.toISOString().split('T')[0]
      : typeof editValue === 'string' 
        ? editValue 
        : '';
    
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <input
          ref={inputRef}
          type="date"
          value={dateValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-100 rounded"
        >
          <CheckIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:bg-red-100 rounded"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Select dropdown
  if (type === 'select' && isEditing) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <select
          ref={selectRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-100 rounded"
        >
          <CheckIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:bg-red-100 rounded"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Multiselect
  if (type === 'multiselect' && isEditing) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-wrap gap-1 mb-2">
          {options.map(option => (
            <label key={option.id} className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={editValue.includes(option.id)}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...editValue, option.id]
                    : editValue.filter((id: string) => id !== option.id);
                  setEditValue(newValue);
                }}
                className="rounded"
              />
              <span className="text-xs">{option.name}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleSave}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Display mode
  return (
    <div 
      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded ${className}`}
      onClick={handleStartEdit}
    >
      {type === 'select' && (
        <div className="flex items-center space-x-2">
          {options.find(opt => opt.id === value) && (
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: options.find(opt => opt.id === value)?.color || '#gray' }}
            />
          )}
          <span>{options.find(opt => opt.id === value)?.name || 'Unknown'}</span>
        </div>
      )}
      
      {type === 'multiselect' && (
        <div className="flex flex-wrap gap-1">
          {editValue.length > 0 ? (
            editValue.map((tagId: string) => {
              const tag = options.find(t => t.id === tagId);
              return tag ? (
                <span
                  key={tagId}
                  className="px-2 py-1 rounded text-xs"
                  style={{ 
                    backgroundColor: tag.color,
                    color: 'white'
                  }}
                >
                  {tag.name}
                </span>
              ) : null;
            })
          ) : (
            <span className="text-gray-400 text-xs">No tags</span>
          )}
        </div>
      )}
      
      {type === 'date' && (
        <span>{editValue instanceof Date ? editValue.toLocaleDateString() : editValue}</span>
      )}
      
      {type === 'text' && (
        <span>{editValue || placeholder}</span>
      )}
      
      {type === 'readonly' && (
        <span className="text-gray-500">{editValue}</span>
      )}
    </div>
  );
};

export default InlineEditCell; 