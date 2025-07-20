import React, { useState, useRef, useEffect } from 'react';
import { useAutoSaveField } from '../../contexts/AutoSaveContext';

interface AutoSaveInputProps {
  tableName: string;
  recordId: string;
  fieldName: string;
  initialValue: string;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel';
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  onValueChange?: (value: string) => void;
  onSave?: (value: string) => void;
  validate?: (value: string) => string | null;
}

const AutoSaveInput: React.FC<AutoSaveInputProps> = ({
  tableName,
  recordId,
  fieldName,
  initialValue,
  placeholder,
  className = '',
  type = 'text',
  required = false,
  disabled = false,
  maxLength,
  minLength,
  pattern,
  onValueChange,
  onSave,
  validate
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleFieldChange, handleBlur } = useAutoSaveField(tableName, recordId);

  // Update local value when initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const validateValue = (val: string): string | null => {
    if (required && val.trim().length === 0) {
      return 'This field is required';
    }
    
    if (minLength && val.length < minLength) {
      return `Minimum length is ${minLength} characters`;
    }
    
    if (maxLength && val.length > maxLength) {
      return `Maximum length is ${maxLength} characters`;
    }
    
    if (pattern && !new RegExp(pattern).test(val)) {
      return 'Invalid format';
    }
    
    if (validate) {
      return validate(val);
    }
    
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
    
    // Call external change handler
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlurEvent = () => {
    setIsFocused(false);
    
    // Validate value
    const validationError = validateValue(value);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Only save if value has changed
    if (value !== initialValue) {
      handleBlur(fieldName, value);
      
      // Call external save handler
      if (onSave) {
        onSave(value);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    
    if (e.key === 'Escape') {
      setValue(initialValue);
      setError(null);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlurEvent}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        className={`
          w-full px-3 py-2 border rounded-md transition-colors
          ${disabled 
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
            : 'bg-white text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
          }
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : isFocused 
              ? 'border-blue-300' 
              : 'border-gray-300'
          }
          ${className}
        `}
      />
      
      {error && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-600">
          {error}
        </div>
      )}
      
      {value !== initialValue && !error && (
        <div className="absolute top-full right-0 mt-1 text-xs text-blue-600">
          Unsaved
        </div>
      )}
    </div>
  );
};

export default AutoSaveInput; 