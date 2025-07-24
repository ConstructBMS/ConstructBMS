import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  FlagIcon,
  XMarkIcon,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/outline';
import { flagService, type TaskFlag, type FlagType } from '../../services/flagService';
import { toastService } from './ToastNotification';

interface FlagEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  existingFlag?: TaskFlag | null;
  onSave?: (flag: TaskFlag) => void;
  className?: string;
}

const FlagEditorModal: React.FC<FlagEditorModalProps> = ({
  isOpen,
  onClose,
  taskId,
  existingFlag,
  onSave,
  className = ''
}) => {
  const [flagType, setFlagType] = useState<string>('info');
  const [flagColor, setFlagColor] = useState<string>('blue-600');
  const [flagIcon, setFlagIcon] = useState<string>('InformationCircleIcon');
  const [note, setNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(flagService.isInDemoMode());

  // Color options
  const colorOptions = [
    { value: 'red-600', label: 'Red', class: 'bg-red-600' },
    { value: 'orange-600', label: 'Orange', class: 'bg-orange-600' },
    { value: 'yellow-600', label: 'Yellow', class: 'bg-yellow-600' },
    { value: 'green-600', label: 'Green', class: 'bg-green-600' },
    { value: 'blue-600', label: 'Blue', class: 'bg-blue-600' },
    { value: 'purple-600', label: 'Purple', class: 'bg-purple-600' },
    { value: 'pink-600', label: 'Pink', class: 'bg-pink-600' },
    { value: 'gray-600', label: 'Gray', class: 'bg-gray-600' }
  ];

  // Initialize form with existing flag or defaults
  useEffect(() => {
    if (existingFlag) {
      setFlagType(existingFlag.type);
      setFlagColor(existingFlag.color);
      setFlagIcon(existingFlag.icon);
      setNote(existingFlag.note || '');
    } else {
      const defaultSettings = flagService.getDefaultFlagSettings('info');
      setFlagType('info');
      setFlagColor(defaultSettings.color);
      setFlagIcon(defaultSettings.icon);
      setNote('');
    }
  }, [existingFlag]);

  // Update color and icon when flag type changes
  useEffect(() => {
    const defaultSettings = flagService.getDefaultFlagSettings(flagType);
    setFlagColor(defaultSettings.color);
    setFlagIcon(defaultSettings.icon);
  }, [flagType]);

  // Get available flag types
  const availableFlagTypes = flagService.getFlagTypes();

  // Get demo mode configuration
  const demoConfig = flagService.getDemoModeConfig();

  // Handle save
  const handleSave = async () => {
    if (isSaving) return;

    // Validate note length in demo mode
    if (isDemoMode && note.length > demoConfig.maxNoteLength) {
      toastService.error('Error', `Note too long. Max ${demoConfig.maxNoteLength} characters in demo mode.`);
      return;
    }

    setIsSaving(true);
    try {
      const flagData = {
        taskId,
        type: flagType as any,
        color: flagColor,
        icon: flagIcon,
        note: note.trim() || null
      };

      const success = await flagService.addFlag(flagData);
      if (success) {
        toastService.success('Success', existingFlag ? 'Flag updated successfully' : 'Flag added successfully');
        if (onSave) {
          // Get the updated flag
          const updatedFlag = flagService.getFlagByTaskId(taskId);
          if (updatedFlag) {
            onSave(updatedFlag);
          }
        }
        onClose();
      } else {
        if (isDemoMode) {
          toastService.warning('Demo Mode', 'Upgrade to add more flags');
        } else {
          toastService.error('Error', 'Failed to save flag');
        }
      }
    } catch (error) {
      console.error('Error saving flag:', error);
      toastService.error('Error', 'Failed to save flag');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle remove
  const handleRemove = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const success = await flagService.removeFlag(taskId);
      if (success) {
        toastService.success('Success', 'Flag removed successfully');
        onClose();
      } else {
        toastService.error('Error', 'Failed to remove flag');
      }
    } catch (error) {
      console.error('Error removing flag:', error);
      toastService.error('Error', 'Failed to remove flag');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-96 max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <FlagIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {existingFlag ? 'Edit Flag' : 'Add Flag'}
            </h3>
            {isDemoMode && (
              <div className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs rounded-md">
                Demo
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Warning */}
        {isDemoMode && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800">
            <div className="flex items-center text-sm text-orange-700 dark:text-orange-300">
              <ExclamationTriangleIconSolid className="w-4 h-4 mr-2" />
              <span>Demo Mode: Max {demoConfig.maxFlagsPerProject} flags, {demoConfig.maxNoteLength} chars</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Flag Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Flag Type
            </label>
            <select
              value={flagType}
              onChange={(e) => setFlagType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {availableFlagTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setFlagColor(color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    flagColor === color.value
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                  } ${color.class}`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Icon Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon Preview
            </label>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className={`w-6 h-6 text-${flagColor} mr-3`}>
                {flagIcon === 'ExclamationTriangleIcon' && <ExclamationTriangleIcon className="w-full h-full" />}
                {flagIcon === 'ExclamationCircleIcon' && <ExclamationCircleIcon className="w-full h-full" />}
                {flagIcon === 'XCircleIcon' && <XCircleIcon className="w-full h-full" />}
                {flagIcon === 'InformationCircleIcon' && <InformationCircleIcon className="w-full h-full" />}
                {flagIcon === 'FlagIcon' && <FlagIcon className="w-full h-full" />}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {flagService.getFlagTypeByValue(flagType)?.label} flag
              </span>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={isDemoMode ? demoConfig.maxNoteLength : 200}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              placeholder="Add a note about this flag..."
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {note.length}/{isDemoMode ? demoConfig.maxNoteLength : 200} characters
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex justify-between">
            {existingFlag && (
              <button
                onClick={handleRemove}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Remove Flag
              </button>
            )}
            <div className="flex space-x-2 ml-auto">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md"
              >
                {isSaving ? 'Saving...' : (existingFlag ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlagEditorModal; 