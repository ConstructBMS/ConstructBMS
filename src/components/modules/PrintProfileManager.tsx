import React, { useState, useEffect, useRef } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CogIcon,
  CalendarIcon,
  ViewColumnsIcon,
  DocumentTextIcon,
  PhotoIcon,
  PrinterIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  FolderIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { printProfileService } from '../../services/printProfileService';
import type { PrintProfile, PrintSettings, PaperSize, PaperSizeOption } from '../../services/printProfileService';

interface PrintProfileManagerProps {
  projectId?: string;
  userId?: string;
  userRole: string;
  onProfileChange?: (profile: PrintProfile) => void;
  onExport?: (format: 'pdf' | 'png' | 'jpg') => void;
  selectedProfileId?: string;
}

interface ProfileEditState {
  profileId: string | null;
  name: string;
  description: string;
  settings: PrintSettings;
}

const PrintProfileManager: React.FC<PrintProfileManagerProps> = ({
  projectId,
  userId,
  userRole,
  onProfileChange,
  onExport,
  selectedProfileId
}) => {
  const [profiles, setProfiles] = useState<PrintProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editState, setEditState] = useState<ProfileEditState>({
    profileId: null,
    name: '',
    description: '',
    settings: printProfileService.getDefaultSettings()
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [currentSettings, setCurrentSettings] = useState<PrintSettings>(printProfileService.getDefaultSettings());

  const canEdit = userRole !== 'viewer';
  const paperSizeOptions = printProfileService.getPaperSizeOptions();

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, [userId, projectId]);

  // Update current settings when selected profile changes
  useEffect(() => {
    if (selectedProfileId) {
      const selectedProfile = profiles.find(p => p.id === selectedProfileId);
      if (selectedProfile) {
        setCurrentSettings(selectedProfile.settings);
      }
    }
  }, [selectedProfileId, profiles]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const userProfiles = await printProfileService.getPrintProfiles(userId, projectId);
      setProfiles(userProfiles);
      
      // Set first profile as selected if none selected
      if (!selectedProfileId && userProfiles.length > 0) {
        const defaultProfile = userProfiles.find(p => p.is_default) || userProfiles[0];
        if (onProfileChange) {
          onProfileChange(defaultProfile);
        }
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle profile selection
  const handleProfileSelect = (profile: PrintProfile) => {
    setCurrentSettings(profile.settings);
    if (onProfileChange) {
      onProfileChange(profile);
    }
  };

  // Handle profile creation
  const handleCreateProfile = async () => {
    const newProfile = await printProfileService.createPrintProfile({
      name: editState.name,
      description: editState.description,
      user_id: userId,
      project_id: projectId,
      settings: editState.settings,
      is_default: false,
      is_shared: false
    });

    if (newProfile) {
      setProfiles(prev => [...prev, newProfile]);
      setShowEditModal(false);
      resetEditState();
      
      if (onProfileChange) {
        onProfileChange(newProfile);
      }
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!editState.profileId) return;

    const updatedProfile = await printProfileService.updatePrintProfile(editState.profileId, {
      name: editState.name,
      description: editState.description,
      settings: editState.settings
    });

    if (updatedProfile) {
      setProfiles(prev => prev.map(p => p.id === editState.profileId ? updatedProfile : p));
      setShowEditModal(false);
      resetEditState();
      
      if (onProfileChange) {
        onProfileChange(updatedProfile);
      }
    }
  };

  // Handle profile deletion
  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    const success = await printProfileService.deletePrintProfile(profileId);
    if (success) {
      setProfiles(prev => prev.filter(p => p.id !== profileId));
    }
  };

  // Handle setting default profile
  const handleSetDefault = async (profileId: string) => {
    if (!userId) return;
    
    const success = await printProfileService.setDefaultPrintProfile(userId, profileId);
    if (success) {
      setProfiles(prev => prev.map(p => ({
        ...p,
        is_default: p.id === profileId
      })));
    }
  };

  // Handle export
  const handleExport = async (format: 'pdf' | 'png' | 'jpg') => {
    try {
      let result: string | null = null;
      
      if (format === 'pdf') {
        result = await printProfileService.exportToPDF(currentSettings, {});
      } else {
        result = await printProfileService.exportToImage(currentSettings, {}, format);
      }

      if (result) {
        // Create download link
        const link = document.createElement('a');
        link.href = result;
        link.download = `print-export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Open edit modal
  const openEditModal = (profile?: PrintProfile) => {
    if (profile) {
      setEditState({
        profileId: profile.id,
        name: profile.name,
        description: profile.description || '',
        settings: profile.settings
      });
    } else {
      resetEditState();
    }
    setShowEditModal(true);
  };

  // Reset edit state
  const resetEditState = () => {
    setEditState({
      profileId: null,
      name: '',
      description: '',
      settings: printProfileService.getDefaultSettings()
    });
  };

  // Update settings in edit state
  const updateEditSettings = (updates: Partial<PrintSettings>) => {
    setEditState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  // Validate current settings
  const validateSettings = (settings: PrintSettings): string[] => {
    return printProfileService.validatePrintSettings(settings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);
  const validationErrors = validateSettings(currentSettings);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <PrinterIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Print Profile Manager</h3>
          <span className="text-sm text-gray-500">({profiles.length} profiles)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            {showPreview ? <EyeSlashIcon className="w-4 h-4 mr-1" /> : <EyeIcon className="w-4 h-4 mr-1" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
            Export
          </button>
          
          {canEdit && (
            <button
              onClick={() => openEditModal()}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
        {/* Left Panel: Profile List */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900">Print Profiles</h4>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {profiles.map((profile) => {
              const isSelected = selectedProfileId === profile.id;
              const errors = validateSettings(profile.settings);

              return (
                <div
                  key={profile.id}
                  className={`border rounded-lg transition-all duration-200 cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
                  } ${errors.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                  onClick={() => handleProfileSelect(profile)}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <PrinterIcon className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold">{profile.name}</span>
                          {profile.is_default && (
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                          )}
                          {profile.is_shared && (
                            <FolderIcon className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(profile.id);
                            }}
                            className={`p-1 rounded ${
                              profile.is_default 
                                ? 'text-yellow-600 hover:text-yellow-700' 
                                : 'text-gray-400 hover:text-yellow-600'
                            }`}
                            title={profile.is_default ? 'Default profile' : 'Set as default'}
                          >
                            {profile.is_default ? <StarIcon className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(profile);
                            }}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            title="Edit profile"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProfile(profile.id);
                            }}
                            className="p-1 text-gray-600 hover:text-red-600"
                            title="Delete profile"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {profile.description && (
                      <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{profile.settings.paperSize} {profile.settings.orientation}</span>
                      <span>{errors.length > 0 ? `${errors.length} issues` : 'Valid'}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {profiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <PrinterIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No print profiles configured</p>
                {canEdit && (
                  <button
                    onClick={() => openEditModal()}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Create your first profile
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900">Print Settings</h4>
          
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-800">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span className="font-medium">Validation Issues:</span>
              </div>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Paper Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Paper Settings</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
                <select
                  value={currentSettings.paperSize}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, paperSize: e.target.value as PaperSize }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paperSizeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.width}×{option.height}mm)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
                <select
                  value={currentSettings.orientation}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, orientation: e.target.value as 'portrait' | 'landscape' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Content Settings</h5>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentSettings.includeTimeline}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, includeTimeline: e.target.checked }))}
                  className="mr-2"
                />
                <CalendarIcon className="w-4 h-4 mr-2 text-gray-600" />
                Include Timeline
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentSettings.includeTaskTable}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, includeTaskTable: e.target.checked }))}
                  className="mr-2"
                />
                <ViewColumnsIcon className="w-4 h-4 mr-2 text-gray-600" />
                Include Task Table
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentSettings.includeNotes}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, includeNotes: e.target.checked }))}
                  className="mr-2"
                />
                <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-600" />
                Include Notes
              </label>
            </div>
          </div>

          {/* Style Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Style Settings</h5>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentSettings.border}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, border: e.target.checked }))}
                  className="mr-2"
                />
                Border
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentSettings.frame}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, frame: e.target.checked }))}
                  className="mr-2"
                />
                Frame
              </label>
            </div>
          </div>

          {/* Save As Profile Button */}
          {canEdit && (
            <button
              onClick={() => {
                setEditState(prev => ({ ...prev, settings: currentSettings }));
                setShowEditModal(true);
              }}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              Save As Profile
            </button>
          )}
        </div>
      </div>

      {/* Print Preview */}
      {showPreview && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Print Preview</h4>
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
            <div 
              className="mx-auto bg-white shadow-lg"
              dangerouslySetInnerHTML={{ 
                __html: printProfileService.generatePrintPreview(currentSettings, {}) 
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editState.profileId ? 'Edit Profile' : 'Add Profile'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Name *
                </label>
                <input
                  type="text"
                  value={editState.name}
                  onChange={(e) => setEditState(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter profile name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editState.description}
                  onChange={(e) => setEditState(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter profile description"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  onClick={editState.profileId ? handleUpdateProfile : handleCreateProfile}
                  disabled={!editState.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {editState.profileId ? 'Update Profile' : 'Create Profile'}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditState();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <DocumentArrowDownIcon className="w-8 h-8 text-red-600 mb-2" />
                  <span className="text-sm font-medium">PDF</span>
                </button>
                
                <button
                  onClick={() => handleExport('png')}
                  className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <PhotoIcon className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">PNG</span>
                </button>
                
                <button
                  onClick={() => handleExport('jpg')}
                  className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <PhotoIcon className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium">JPG</span>
                </button>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintProfileManager; 