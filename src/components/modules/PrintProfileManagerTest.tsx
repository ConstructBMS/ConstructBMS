import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon,
  PencilIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PhotoIcon,
  ComputerDesktopIcon,
  PrinterIcon,
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import PrintProfileManager from './PrintProfileManager';
import { printProfileService } from '../../services/printProfileService';
import type { PrintProfile, PrintSettings } from '../../services/printProfileService';

const PrintProfileManagerTest: React.FC = () => {
  const [projectId, setProjectId] = useState<string>('demo-project-1');
  const [userId, setUserId] = useState<string>('demo-user-1');
  const [userRole, setUserRole] = useState<string>('editor');
  const [loading, setLoading] = useState<boolean>(true);
  const [profiles, setProfiles] = useState<PrintProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showProfileDetails, setShowProfileDetails] = useState<boolean>(false);
  const [showSettingsEditor, setShowSettingsEditor] = useState<boolean>(false);
  const [currentSettings, setCurrentSettings] = useState<PrintSettings>(printProfileService.getDefaultSettings());

  // Load demo data on mount
  useEffect(() => {
    loadDemoData();
  }, [userId, projectId]);

  const loadDemoData = async () => {
    try {
      setLoading(true);
      const userProfiles = await printProfileService.getPrintProfiles(userId, projectId);
      setProfiles(userProfiles);
      
      // Set first profile as selected
      if (userProfiles.length > 0) {
        const defaultProfile = userProfiles.find(p => p.is_default) || userProfiles[0];
        setSelectedProfileId(defaultProfile.id);
        setCurrentSettings(defaultProfile.settings);
      }
      
      setLastUpdate('Demo data loaded');
    } catch (error) {
      console.error('Failed to load demo data:', error);
      setErrorMessage('Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (profile: PrintProfile) => {
    setSelectedProfileId(profile.id);
    setCurrentSettings(profile.settings);
    setLastUpdate(`Selected profile: ${profile.name}`);
  };

  const handleExport = (format: 'pdf' | 'png' | 'jpg') => {
    setLastUpdate(`Exporting to ${format.toUpperCase()}`);
    setInfoMessage(`Export to ${format.toUpperCase()} initiated`);
    setTimeout(() => setInfoMessage(null), 3000);
  };

  const handleCreateTestProfile = async () => {
    try {
      const newProfile = await printProfileService.createPrintProfile({
        name: 'Test Print Profile',
        description: 'A test print profile created from the test interface',
        user_id: userId,
        project_id: projectId,
        settings: {
          ...printProfileService.getDefaultSettings(),
          paperSize: 'A3',
          orientation: 'landscape',
          includeNotes: true,
          frame: true
        },
        is_default: false,
        is_shared: false
      });

      if (newProfile) {
        setProfiles(prev => [...prev, newProfile]);
        setLastUpdate('Test profile created');
        setInfoMessage('Test profile created successfully');
        setTimeout(() => setInfoMessage(null), 3000);
      }
    } catch (error) {
      console.error('Test profile creation failed:', error);
      setErrorMessage('Failed to create test profile');
    }
  };

  const handleDeleteAllProfiles = async () => {
    if (!confirm('Are you sure you want to delete all profiles?')) return;

    try {
      for (const profile of profiles) {
        await printProfileService.deletePrintProfile(profile.id);
      }
      setProfiles([]);
      setSelectedProfileId('');
      setLastUpdate('All profiles deleted');
      setInfoMessage('All profiles deleted successfully');
      setTimeout(() => setInfoMessage(null), 3000);
    } catch (error) {
      console.error('Delete all profiles failed:', error);
      setErrorMessage('Failed to delete all profiles');
    }
  };

  const handleValidateProfiles = async () => {
    try {
      const issues: string[] = [];

      // Check for duplicate names
      const names = profiles.map(p => p.name.toLowerCase());
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicates.length > 0) {
        issues.push(`Duplicate profile names: ${[...new Set(duplicates)].join(', ')}`);
      }

      // Check for multiple default profiles
      const defaultProfiles = profiles.filter(p => p.is_default);
      if (defaultProfiles.length > 1) {
        issues.push(`Multiple default profiles: ${defaultProfiles.map(p => p.name).join(', ')}`);
      }

      // Check for invalid settings
      for (const profile of profiles) {
        const errors = printProfileService.validatePrintSettings(profile.settings);
        if (errors.length > 0) {
          issues.push(`Invalid settings in "${profile.name}": ${errors.join(', ')}`);
        }
      }

      if (issues.length === 0) {
        setInfoMessage('All profiles are valid');
      } else {
        setErrorMessage(`Validation issues found:\n${issues.join('\n')}`);
      }
      setTimeout(() => {
        setInfoMessage(null);
        setErrorMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Profile validation failed:', error);
      setErrorMessage('Failed to validate profiles');
    }
  };

  const handleTestExport = async (format: 'pdf' | 'png' | 'jpg') => {
    try {
      setLastUpdate(`Testing ${format.toUpperCase()} export`);
      
      let result: string | null = null;
      if (format === 'pdf') {
        result = await printProfileService.exportToPDF(currentSettings, {});
      } else {
        result = await printProfileService.exportToImage(currentSettings, {}, format);
      }

      if (result) {
        setInfoMessage(`${format.toUpperCase()} export test successful`);
      } else {
        setErrorMessage(`${format.toUpperCase()} export test failed`);
      }
      setTimeout(() => {
        setInfoMessage(null);
        setErrorMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Export test failed:', error);
      setErrorMessage('Export test failed');
    }
  };

  const getProfileStats = () => {
    const paperSizes = profiles.reduce((acc, profile) => {
      acc[profile.settings.paperSize] = (acc[profile.settings.paperSize] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const orientations = profiles.reduce((acc, profile) => {
      acc[profile.settings.orientation] = (acc[profile.settings.orientation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: profiles.length,
      defaultCount: profiles.filter(p => p.is_default).length,
      sharedCount: profiles.filter(p => p.is_shared).length,
      paperSizes,
      orientations
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-constructbms-blue"></div>
      </div>
    );
  }

  const stats = getProfileStats();
  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Print Profile Manager Test</h1>
          <p className="text-gray-600">Test the Print Profile Manager system with comprehensive settings, profile management, and export functionality</p>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Role */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">User Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Project ID */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Project ID</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="demo-project-1">Demo Project 1</option>
                <option value="demo-project-2">Demo Project 2</option>
                <option value="demo-project-3">Demo Project 3</option>
              </select>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Actions</label>
              <div className="space-y-1">
                <button
                  onClick={loadDemoData}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <ArrowPathIcon className="w-4 h-4 inline mr-1" />
                  Reload Data
                </button>
                <button
                  onClick={handleCreateTestProfile}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4 inline mr-1" />
                  Add Test Profile
                </button>
              </div>
            </div>

            {/* Profile Operations */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Profile Operations</label>
              <div className="space-y-1">
                <button
                  onClick={handleValidateProfiles}
                  className="w-full px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
                >
                  <CheckIcon className="w-4 h-4 inline mr-1" />
                  Validate Profiles
                </button>
                <button
                  onClick={handleDeleteAllProfiles}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  <TrashIcon className="w-4 h-4 inline mr-1" />
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Profiles: <span className="font-medium text-gray-900">{stats.total}</span>
              </span>
              <span className="text-gray-600">
                Default: <span className="font-medium text-gray-900">{stats.defaultCount}</span>
              </span>
              <span className="text-gray-600">
                Shared: <span className="font-medium text-gray-900">{stats.sharedCount}</span>
              </span>
              <span className="text-gray-600">
                Project: <span className="font-medium text-blue-600">{projectId}</span>
              </span>
              <span className="text-gray-600">
                User Role: <span className="font-medium text-gray-900">{userRole}</span>
              </span>
              <span className="text-gray-600">
                Selected: <span className="font-medium text-gray-900">{selectedProfile?.name || 'None'}</span>
              </span>
            </div>
            {lastUpdate && (
              <span className="text-gray-500 text-xs">
                Last: {lastUpdate}
              </span>
            )}
          </div>
        </div>

        {/* Profile Statistics */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Profile Statistics</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowProfileDetails(!showProfileDetails)}
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                {showProfileDetails ? <EyeIcon className="w-4 h-4 mr-1" /> : <EyeIcon className="w-4 h-4 mr-1" />}
                {showProfileDetails ? 'Hide Details' : 'Show Details'}
              </button>
              <button
                onClick={() => setShowSettingsEditor(!showSettingsEditor)}
                className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                <CogIcon className="w-4 h-4 mr-1" />
                Settings Editor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-700">Total Profiles</div>
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm font-medium text-green-700">Default Profiles</div>
              <div className="text-2xl font-bold text-green-900">{stats.defaultCount}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm font-medium text-purple-700">Shared Profiles</div>
              <div className="text-2xl font-bold text-purple-900">{stats.sharedCount}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-sm font-medium text-orange-700">Paper Sizes</div>
              <div className="text-lg font-bold text-orange-900">{Object.keys(stats.paperSizes).length}</div>
            </div>
          </div>

          {/* Profile Details */}
          {showProfileDetails && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Paper Size Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(stats.paperSizes).map(([size, count]) => (
                    <div key={size} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{size}</span>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Orientation Distribution</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(stats.orientations).map(([orientation, count]) => (
                    <div key={orientation} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium capitalize">{orientation}</span>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Editor */}
          {showSettingsEditor && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current Settings Editor</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
                  <select
                    value={currentSettings.paperSize}
                    onChange={(e) => setCurrentSettings(prev => ({ ...prev, paperSize: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="A2">A2</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
                  <select
                    value={currentSettings.orientation}
                    onChange={(e) => setCurrentSettings(prev => ({ ...prev, orientation: e.target.value as 'portrait' | 'landscape' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Options</label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentSettings.includeTimeline}
                        onChange={(e) => setCurrentSettings(prev => ({ ...prev, includeTimeline: e.target.checked }))}
                        className="mr-2"
                      />
                      <ComputerDesktopIcon className="w-4 h-4 mr-1" />
                      Timeline
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentSettings.includeTaskTable}
                        onChange={(e) => setCurrentSettings(prev => ({ ...prev, includeTaskTable: e.target.checked }))}
                        className="mr-2"
                      />
                      <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1" />
                      Task Table
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentSettings.includeNotes}
                        onChange={(e) => setCurrentSettings(prev => ({ ...prev, includeNotes: e.target.checked }))}
                        className="mr-2"
                      />
                      <DocumentTextIcon className="w-4 h-4 mr-1" />
                      Notes
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Test Buttons */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Testing</h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleTestExport('pdf')}
              className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <DocumentArrowDownIcon className="w-8 h-8 text-red-600 mb-2" />
              <span className="text-sm font-medium">Test PDF Export</span>
            </button>
            <button
              onClick={() => handleTestExport('png')}
              className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <PhotoIcon className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Test PNG Export</span>
            </button>
            <button
              onClick={() => handleTestExport('jpg')}
              className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <PhotoIcon className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Test JPG Export</span>
            </button>
          </div>
        </div>

        {/* Print Profile Manager Component */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Print Profile Manager Interface</h3>
            <p className="text-sm text-gray-600 mt-1">
              Interactive print profile management with settings, preview, and export functionality
            </p>
          </div>
          
          <div className="p-4">
            <PrintProfileManager
              projectId={projectId}
              userId={userId}
              userRole={userRole}
              onProfileChange={handleProfileChange}
              onExport={handleExport}
              selectedProfileId={selectedProfileId}
            />
          </div>
        </div>

        {/* Selected Profile Details */}
        {selectedProfile && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Profile Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Name</label>
                <p className="text-gray-900 font-medium">{selectedProfile.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
                <p className="text-gray-900">{selectedProfile.settings.paperSize} {selectedProfile.settings.orientation}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Included</label>
                <div className="flex items-center space-x-4">
                  {selectedProfile.settings.includeTimeline && (
                    <span className="flex items-center text-sm text-gray-600">
                      <ComputerDesktopIcon className="w-4 h-4 mr-1" />
                      Timeline
                    </span>
                  )}
                  {selectedProfile.settings.includeTaskTable && (
                    <span className="flex items-center text-sm text-gray-600">
                      <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1" />
                      Task Table
                    </span>
                  )}
                  {selectedProfile.settings.includeNotes && (
                    <span className="flex items-center text-sm text-gray-600">
                      <DocumentTextIcon className="w-4 h-4 mr-1" />
                      Notes
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center space-x-2">
                  {selectedProfile.is_default ? (
                    <>
                      <ShareIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-900">Default Profile</span>
                    </>
                  ) : (
                    <>
                      <XMarkIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">Standard Profile</span>
                    </>
                  )}
                  {selectedProfile.is_shared && (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-900">Shared</span>
                    </>
                  )}
                </div>
              </div>
              {selectedProfile.description && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{selectedProfile.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">How to Use Print Profile Manager</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Create and manage print profiles with different settings</li>
                <li>• Configure paper size, orientation, and content options</li>
                <li>• Set default profiles for quick access</li>
                <li>• Preview print layouts before exporting</li>
                <li>• Export to PDF, PNG, or JPG formats</li>
                <li>• Share profiles with other users</li>
                <li>• Validate profile settings for errors</li>
                <li>• Customize margins, headers, and footers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              <div className="whitespace-pre-line">{errorMessage}</div>
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              {infoMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintProfileManagerTest; 