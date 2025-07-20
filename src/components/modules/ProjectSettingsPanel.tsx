import React, { useState, useEffect } from 'react';
import { 
  CogIcon, 
  XMarkIcon, 
  CheckIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  TagIcon,
  CalendarIcon,
  PrinterIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGuard from './PermissionGuard';
import { Card } from '../ui';
import { supabase } from '../../services/supabase';

interface ProjectSettings {
  id: string;
  name: string;
  description: string;
  language: string;
  currency: string;
  tags: string[];
  default_calendar: string;
  print_profile: string;
  constraint_settings: {
    allow_negative_float: boolean;
    respect_calendars: boolean;
    auto_level_resources: boolean;
    critical_path_method: 'forward' | 'backward' | 'both';
    default_lag: number;
  };
  created_at: string;
  updated_at: string;
}

interface ProjectSettingsPanelProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: ProjectSettings) => void;
}

const ProjectSettingsPanel: React.FC<ProjectSettingsPanelProps> = ({
  projectId,
  isOpen,
  onClose,
  onSave
}) => {
  const { hasPermission, currentRole } = usePermissions();
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  // Check permissions
  const canEditSettings = hasPermission('edit_settings') || hasPermission('edit_projects');
  const canViewSettings = hasPermission('view_settings') || hasPermission('view_projects');

  // Language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' }
  ];

  // Currency options
  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'CHF', label: 'Swiss Franc (CHF)' },
    { value: 'CNY', label: 'Chinese Yuan (¥)' },
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'BRL', label: 'Brazilian Real (R$)' }
  ];

  // Calendar options
  const calendarOptions = [
    { value: 'standard', label: 'Standard (8h/day, 5d/week)' },
    { value: 'extended', label: 'Extended (10h/day, 6d/week)' },
    { value: '24h', label: '24 Hour (24h/day, 7d/week)' },
    { value: 'custom', label: 'Custom Calendar' }
  ];

  // Print profile options
  const printProfileOptions = [
    { value: 'default', label: 'Default Profile' },
    { value: 'executive', label: 'Executive Summary' },
    { value: 'detailed', label: 'Detailed Report' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'custom', label: 'Custom Profile' }
  ];

  // Load project settings
  useEffect(() => {
    if (isOpen && projectId) {
      loadProjectSettings();
    }
  }, [isOpen, projectId]);

  const loadProjectSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('asta_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to settings format
      const projectSettings: ProjectSettings = {
        id: data.id,
        name: data.name || '',
        description: data.description || '',
        language: data.language || 'en',
        currency: data.currency || 'USD',
        tags: data.tags || [],
        default_calendar: data.default_calendar || 'standard',
        print_profile: data.print_profile || 'default',
        constraint_settings: data.constraint_settings || {
          allow_negative_float: false,
          respect_calendars: true,
          auto_level_resources: false,
          critical_path_method: 'forward',
          default_lag: 0
        },
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setSettings(projectSettings);
    } catch (err) {
      console.error('Failed to load project settings:', err);
      setError('Failed to load project settings');
      
      // Create default settings for demo
      setSettings({
        id: projectId,
        name: 'Demo Project',
        description: 'This is a demo project for testing settings.',
        language: 'en',
        currency: 'USD',
        tags: ['demo', 'test'],
        default_calendar: 'standard',
        print_profile: 'default',
        constraint_settings: {
          allow_negative_float: false,
          respect_calendars: true,
          auto_level_resources: false,
          critical_path_method: 'forward',
          default_lag: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings || !canEditSettings) return;

    try {
      setSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('asta_projects')
        .update({
          name: settings.name,
          description: settings.description,
          language: settings.language,
          currency: settings.currency,
          tags: settings.tags,
          default_calendar: settings.default_calendar,
          print_profile: settings.print_profile,
          constraint_settings: settings.constraint_settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (updateError) {
        throw updateError;
      }

      onSave?.(settings);
    } catch (err) {
      console.error('Failed to save project settings:', err);
      setError('Failed to save project settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && settings) {
      const tag = newTag.trim().toLowerCase();
      if (!settings.tags.includes(tag)) {
        setSettings({
          ...settings,
          tags: [...settings.tags, tag]
        });
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (settings) {
      setSettings({
        ...settings,
        tags: settings.tags.filter(tag => tag !== tagToRemove)
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  if (!canViewSettings) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <LockClosedIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have permission to view project settings.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CogIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Project Settings
            </h2>
            {currentRole && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                {currentRole.replace('_', ' ')}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : settings ? (
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 dark:text-red-200">{error}</span>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        disabled={!canEditSettings}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="Enter project name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        disabled={!canEditSettings}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        {languageOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={settings.description}
                        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                        disabled={!canEditSettings}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="Enter project description"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Financial Settings */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Financial Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        disabled={!canEditSettings}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        {currencyOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tags */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Tags
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={!canEditSettings}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="Add a tag"
                      />
                      <button
                        onClick={handleAddTag}
                        disabled={!canEditSettings || !newTag.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm"
                        >
                          {tag}
                          {canEditSettings && (
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Calendar & Print Settings */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Calendar & Print Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default Calendar
                      </label>
                      <select
                        value={settings.default_calendar}
                        onChange={(e) => setSettings({ ...settings, default_calendar: e.target.value })}
                        disabled={!canEditSettings}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        {calendarOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Print Profile
                      </label>
                      <select
                        value={settings.print_profile}
                        onChange={(e) => setSettings({ ...settings, print_profile: e.target.value })}
                        disabled={!canEditSettings}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        {printProfileOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Constraint Settings */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Constraint Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="allow_negative_float"
                          checked={settings.constraint_settings.allow_negative_float}
                          onChange={(e) => setSettings({
                            ...settings,
                            constraint_settings: {
                              ...settings.constraint_settings,
                              allow_negative_float: e.target.checked
                            }
                          })}
                          disabled={!canEditSettings}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <label htmlFor="allow_negative_float" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Allow Negative Float
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="respect_calendars"
                          checked={settings.constraint_settings.respect_calendars}
                          onChange={(e) => setSettings({
                            ...settings,
                            constraint_settings: {
                              ...settings.constraint_settings,
                              respect_calendars: e.target.checked
                            }
                          })}
                          disabled={!canEditSettings}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <label htmlFor="respect_calendars" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Respect Calendars
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="auto_level_resources"
                          checked={settings.constraint_settings.auto_level_resources}
                          onChange={(e) => setSettings({
                            ...settings,
                            constraint_settings: {
                              ...settings.constraint_settings,
                              auto_level_resources: e.target.checked
                            }
                          })}
                          disabled={!canEditSettings}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <label htmlFor="auto_level_resources" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Auto-Level Resources
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Critical Path Method
                        </label>
                        <select
                          value={settings.constraint_settings.critical_path_method}
                          onChange={(e) => setSettings({
                            ...settings,
                            constraint_settings: {
                              ...settings.constraint_settings,
                              critical_path_method: e.target.value as 'forward' | 'backward' | 'both'
                            }
                          })}
                          disabled={!canEditSettings}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                        >
                          <option value="forward">Forward Pass</option>
                          <option value="backward">Backward Pass</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Default Lag (days)
                        </label>
                        <input
                          type="number"
                          value={settings.constraint_settings.default_lag}
                          onChange={(e) => setSettings({
                            ...settings,
                            constraint_settings: {
                              ...settings.constraint_settings,
                              default_lag: parseInt(e.target.value) || 0
                            }
                          })}
                          disabled={!canEditSettings}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Failed to load project settings
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {settings && (
              <>
                Last updated: {new Date(settings.updated_at).toLocaleString()}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <PermissionGuard permission="edit_settings" projectId={projectId}>
              <button
                onClick={handleSave}
                disabled={!canEditSettings || saving || !settings}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsPanel; 