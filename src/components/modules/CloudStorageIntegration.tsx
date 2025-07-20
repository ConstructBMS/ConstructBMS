import React, { useState, useEffect } from 'react';
import {
  CloudIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CogIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  FolderIcon,
  HardDriveIcon,
  DatabaseIcon,
} from 'lucide-react';
import { cloudStorageService, type CloudStorageProvider, type SyncSettings } from '../../services/cloudStorageService';
import { useAuth } from '../../contexts/AuthContext';

interface CloudStorageIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloudStorageIntegration: React.FC<CloudStorageIntegrationProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<CloudStorageProvider[]>([]);
  const [connectedProviders, setConnectedProviders] = useState<CloudStorageProvider[]>([]);
  const [syncSettings, setSyncSettings] = useState<SyncSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<Record<string, string>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [providersData, connectedData, settingsData] = await Promise.all([
        cloudStorageService.getProviders(),
        cloudStorageService.getConnectedProviders(),
        cloudStorageService.getSyncSettings(),
      ]);

      setProviders(providersData);
      setConnectedProviders(connectedData);
      setSyncSettings(settingsData);
    } catch (error) {
      console.error('Error loading cloud storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectProvider = async (providerId: string) => {
    setConnectingProvider(providerId);
    try {
      const result = await cloudStorageService.connectProvider(providerId);
      if (result.success) {
        // The OAuth flow will be handled by the popup
        // We'll need to listen for the callback
        console.log('OAuth flow initiated');
      } else {
        console.error('Failed to connect:', result.message);
      }
    } catch (error) {
      console.error('Error connecting to provider:', error);
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnectProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to disconnect this provider? This will stop syncing documents.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await cloudStorageService.disconnectProvider(providerId);
      if (result.success) {
        await loadData(); // Reload data to update UI
      } else {
        console.error('Failed to disconnect:', result.message);
      }
    } catch (error) {
      console.error('Error disconnecting from provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async (providerId: string) => {
    setSyncStatus(prev => ({ ...prev, [providerId]: 'syncing' }));
    try {
      const result = await cloudStorageService.syncAllDocuments(providerId, 'bidirectional');
      if (result.success) {
        setSyncStatus(prev => ({ ...prev, [providerId]: 'completed' }));
        setTimeout(() => {
          setSyncStatus(prev => ({ ...prev, [providerId]: 'idle' }));
        }, 3000);
      } else {
        setSyncStatus(prev => ({ ...prev, [providerId]: 'error' }));
      }
    } catch (error) {
      console.error('Error syncing documents:', error);
      setSyncStatus(prev => ({ ...prev, [providerId]: 'error' }));
    }
  };

  const handleUpdateSyncSettings = async (newSettings: Partial<SyncSettings>) => {
    if (!syncSettings) return;

    setLoading(true);
    try {
      const result = await cloudStorageService.updateSyncSettings(newSettings);
      if (result.success) {
        setSyncSettings(prev => prev ? { ...prev, ...newSettings } : null);
      } else {
        console.error('Failed to update settings:', result.message);
      }
    } catch (error) {
      console.error('Error updating sync settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSyncHistory = async (providerId?: string) => {
    try {
      const history = await cloudStorageService.getSyncHistory(providerId);
      setSyncHistory(history);
    } catch (error) {
      console.error('Error loading sync history:', error);
    }
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google_drive':
        return <HardDriveIcon className="h-6 w-6 text-green-600" />;
      case 'onedrive':
        return <DatabaseIcon className="h-6 w-6 text-blue-600" />;
      case 'dropbox':
        return <FolderIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <CloudIcon className="h-6 w-6" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'syncing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <CloudIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Cloud Storage Integration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center p-8">
            <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">Loading...</span>
          </div>
        )}

        {!loading && (
          <div className="p-6 space-y-6">
            {/* Connected Providers */}
            {connectedProviders.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Connected Providers
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {connectedProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getProviderIcon(provider.id)}
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {provider.displayName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Connected
                            </p>
                          </div>
                        </div>
                        {getStatusIcon(syncStatus[provider.id] || 'idle')}
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleSyncAll(provider.id)}
                          disabled={syncStatus[provider.id] === 'syncing'}
                          className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          title="Sync All Documents"
                        >
                          {syncStatus[provider.id] === 'syncing' ? 'Syncing...' : 'Sync Now'}
                        </button>
                        <button
                          onClick={() => handleDisconnectProvider(provider.id)}
                          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                          title="Disconnect Provider"
                        >
                          Disconnect
                        </button>
                      </div>

                      {provider.lastSync && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Last sync: {new Date(provider.lastSync).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Providers */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Available Providers
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {providers
                  .filter((provider) => !connectedProviders.some((cp) => cp.id === provider.id))
                  .map((provider) => (
                    <div
                      key={provider.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        {getProviderIcon(provider.id)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {provider.displayName}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {provider.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleConnectProvider(provider.id)}
                        disabled={connectingProvider === provider.id}
                        className="w-full px-3 py-2 bg-constructbms-blue text-black rounded-md hover:bg-constructbms-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        title={`Connect to ${provider.displayName}`}
                      >
                        {connectingProvider === provider.id ? 'Connecting...' : 'Connect'}
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Sync Settings */}
            {syncSettings && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Sync Settings
                  </h3>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                    title="Configure Sync Settings"
                  >
                    <CogIcon className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </div>

                {showSettings && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default Storage Location
                      </label>
                      <select
                        value={syncSettings.defaultStorage}
                        onChange={(e) => handleUpdateSyncSettings({ defaultStorage: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="local">Local Dashboard</option>
                        <option value="google_drive">Google Drive</option>
                        <option value="onedrive">OneDrive</option>
                        <option value="dropbox">Dropbox</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Auto Sync
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={syncSettings.autoSync}
                            onChange={(e) => handleUpdateSyncSettings({ autoSync: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Enable automatic syncing
                          </span>
                        </label>
                      </div>
                    </div>

                    {syncSettings.autoSync && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Sync Interval
                        </label>
                        <select
                          value={syncSettings.syncInterval}
                          onChange={(e) => handleUpdateSyncSettings({ syncInterval: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="manual">Manual Only</option>
                          <option value="hourly">Every Hour</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sync Direction
                      </label>
                      <select
                        value={syncSettings.syncDirection}
                        onChange={(e) => handleUpdateSyncSettings({ syncDirection: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="upload">Upload Only (Local → Cloud)</option>
                        <option value="download">Download Only (Cloud → Local)</option>
                        <option value="bidirectional">Bidirectional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Conflict Resolution
                      </label>
                      <select
                        value={syncSettings.conflictResolution}
                        onChange={(e) => handleUpdateSyncSettings({ conflictResolution: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="ask_user">Ask User</option>
                        <option value="local_wins">Local Version Wins</option>
                        <option value="remote_wins">Cloud Version Wins</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sync History */}
            {connectedProviders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Sync History
                  </h3>
                  <button
                    onClick={() => loadSyncHistory()}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                    title="Refresh Sync History"
                  >
                    Refresh
                  </button>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {syncHistory.length > 0 ? (
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Provider
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Direction
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {syncHistory.slice(0, 10).map((sync, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {sync.provider_id}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                                {sync.direction}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    sync.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : sync.status === 'failed'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {sync.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                                {new Date(sync.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No sync history available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Cloud Storage Integration
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Connect your cloud storage providers to automatically sync documents, templates, and files. 
                    Documents will be stored in your connected cloud storage by default when integrations are active.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloudStorageIntegration; 
