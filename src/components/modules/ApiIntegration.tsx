import React, { useState, useEffect } from 'react';
import {
  Link,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Download,
  Upload,
  ArrowLeftRight,
  Clock,
  Zap,
  Shield,
  Globe,
  Cloud,
  MessageSquare,
  Trello,
  Database,
  Users,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Copy,
  TestTube,
} from 'lucide-react';
import {
  apiIntegration,
  type ApiIntegration as ApiIntegrationType,
  type IntegrationConnection,
  type SyncResult,
  type DocumentSync,
} from '../../services/apiIntegration';
import { useAuth } from '../../contexts/AuthContext';

interface IntegrationCardProps {
  integration: ApiIntegrationType;
  onConnect: (serviceName: string) => void;
  onDisconnect: (serviceName: string) => void;
  onSettings: (serviceName: string) => void;
  onTest: (serviceName: string) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConnect,
  onDisconnect,
  onTest,
  onSettings,
}) => {
  const getServiceIcon = (serviceName: string) => {
    const icons: Record<string, React.ReactNode> = {
      google_drive: <Cloud className='h-6 w-6' />,
      dropbox: <Cloud className='h-6 w-6' />,
      slack: <MessageSquare className='h-6 w-6' />,
      microsoft_teams: <Users className='h-6 w-6' />,
      notion: <Database className='h-6 w-6' />,
      trello: <Trello className='h-6 w-6' />,
      salesforce: <Database className='h-6 w-6' />,
      hubspot: <Database className='h-6 w-6' />,
    };
    return icons[serviceName] || <Globe className='h-6 w-6' />;
  };

  const getServiceTypeIcon = (serviceType: string) => {
    const icons: Record<string, React.ReactNode> = {
      cloud_storage: <Cloud className='h-4 w-4' />,
      communication: <MessageSquare className='h-4 w-4' />,
      project_management: <Trello className='h-4 w-4' />,
      crm: <Database className='h-4 w-4' />,
    };
    return icons[serviceType] || <Globe className='h-4 w-4' />;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow border-2 transition-all duration-200 ${
        integration.is_connected
          ? 'border-green-200 dark:border-green-800'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <div className={`p-3 rounded-lg ${integration.color} text-white`}>
              {getServiceIcon(integration.service_name)}
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                {integration.display_name}
              </h3>
              <div className='flex items-center gap-2 mt-1'>
                {getServiceTypeIcon(integration.service_type)}
                <span className='text-sm text-gray-500 dark:text-gray-400 capitalize'>
                  {integration.service_type.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {integration.is_connected ? (
              <div className='flex items-center gap-1 text-green-600 dark:text-green-400'>
                <CheckCircle className='h-4 w-4' />
                <span className='text-sm font-medium'>Connected</span>
              </div>
            ) : (
              <div className='flex items-center gap-1 text-gray-500 dark:text-gray-400'>
                <XCircle className='h-4 w-4' />
                <span className='text-sm font-medium'>Not Connected</span>
              </div>
            )}
          </div>
        </div>

        <p className='text-gray-600 dark:text-gray-300 mb-4'>
          {integration.description}
        </p>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {integration.is_connected && (
              <>
                <button
                  onClick={() => onTest(integration.service_name)}
                  className='flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors'
                >
                  <TestTube className='h-4 w-4' />
                  Test
                </button>
                <button
                  onClick={() => onSettings(integration.service_name)}
                  className='flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                >
                  <Settings className='h-4 w-4' />
                  Settings
                </button>
              </>
            )}
          </div>

          <div className='flex items-center gap-2'>
            {integration.is_connected ? (
              <button
                onClick={() => onDisconnect(integration.service_name)}
                className='flex items-center gap-2 px-4 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors'
              >
                <Trash2 className='h-4 w-4' />
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => onConnect(integration.service_name)}
                className='flex items-center gap-2 px-4 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors'
              >
                <Plus className='h-4 w-4' />
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ApiIntegration: React.FC = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<ApiIntegrationType[]>([]);
  const [connectedIntegrations, setConnectedIntegrations] = useState<
    IntegrationConnection[]
  >([]);
  const [syncHistory, setSyncHistory] = useState<DocumentSync[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<
    'integrations' | 'sync' | 'settings'
  >('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null
  );
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [testResult, setTestResult] = useState<SyncResult | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const [integrationsData, connectedData, syncData] = await Promise.all([
        apiIntegration.getIntegrations(),
        apiIntegration.getConnectedIntegrations(),
        apiIntegration.getSyncHistory(),
      ]);

      setIntegrations(integrationsData);
      setConnectedIntegrations(connectedData);
      setSyncHistory(syncData);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (serviceName: string) => {
    setSelectedIntegration(serviceName);
    setShowConnectModal(true);
  };

  const handleDisconnect = async (serviceName: string) => {
    try {
      const result = await apiIntegration.disconnectIntegration(serviceName);
      if (result.success) {
        await loadIntegrations();
        alert(`Successfully disconnected from ${serviceName}`);
      } else {
        alert(`Failed to disconnect: ${result.error}`);
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      alert('Failed to disconnect integration');
    }
  };

  const handleTest = async (serviceName: string) => {
    try {
      const result = await apiIntegration.testConnection(serviceName);
      setTestResult(result);

      if (result.success) {
        alert(`Connection test successful: ${result.message}`);
      } else {
        alert(`Connection test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('Failed to test connection');
    }
  };

  const handleSettings = (serviceName: string) => {
    setSelectedIntegration(serviceName);
    setShowSettingsModal(true);
  };

  const handleConnectSubmit = async (connectionData: Record<string, any>) => {
    if (!selectedIntegration) return;

    try {
      const result = await apiIntegration.connectIntegration(
        selectedIntegration,
        connectionData
      );
      if (result.success) {
        await loadIntegrations();
        setShowConnectModal(false);
        alert(`Successfully connected to ${selectedIntegration}`);
      } else {
        alert(`Failed to connect: ${result.error}`);
      }
    } catch (error) {
      console.error('Error connecting integration:', error);
      alert('Failed to connect integration');
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'failed':
        return <XCircle className='h-4 w-4 text-red-600' />;
      case 'in_progress':
        return <RefreshCw className='h-4 w-4 text-blue-600 animate-spin' />;
      default:
        return <Clock className='h-4 w-4 text-gray-600' />;
    }
  };

  const getSyncDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'upload':
        return <Upload className='h-4 w-4' />;
      case 'download':
        return <Download className='h-4 w-4' />;
      case 'bidirectional':
        return <ArrowLeftRight className='h-4 w-4' />;
      default:
        return <ArrowLeftRight className='h-4 w-4' />;
    }
  };

  if (loading) {
    return (
      <div className='h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <RefreshCw className='h-8 w-8 text-gray-400 animate-spin mx-auto mb-4' />
          <p className='text-gray-600 dark:text-gray-400'>
            Loading integrations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full bg-gray-50 dark:bg-gray-900 flex flex-col'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <h1 className='text-xl lg:text-2xl font-bold text-gray-900 dark:text-white'>
              API Integrations
            </h1>
            <p className='text-sm lg:text-base text-gray-600 dark:text-gray-400'>
              Connect your documents with third-party services
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={loadIntegrations}
              className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
            >
              <RefreshCw className='h-4 w-4' />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex space-x-8 px-4 lg:px-6 overflow-x-auto'>
          <button
            onClick={() => setSelectedView('integrations')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              selectedView === 'integrations'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Link className='h-4 w-4 lg:h-5 lg:w-5 inline mr-2' />
            Integrations
          </button>
          <button
            onClick={() => setSelectedView('sync')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              selectedView === 'sync'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <ArrowLeftRight className='h-4 w-4 lg:h-5 lg:w-5 inline mr-2' />
            Sync History
          </button>
          <button
            onClick={() => setSelectedView('settings')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              selectedView === 'settings'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Settings className='h-4 w-4 lg:h-5 lg:w-5 inline mr-2' />
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 lg:p-6'>
        {selectedView === 'integrations' && (
          <div className='space-y-6'>
            {/* Connected Integrations */}
            {connectedIntegrations.length > 0 && (
              <div>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                  Connected Services ({connectedIntegrations.length})
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {integrations
                    .filter(integration => integration.is_connected)
                    .map(integration => (
                      <IntegrationCard
                        key={integration.service_name}
                        integration={integration}
                        onConnect={handleConnect}
                        onDisconnect={handleDisconnect}
                        onTest={handleTest}
                        onSettings={handleSettings}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Available Integrations */}
            <div>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                <Plus className='h-5 w-5' />
                Available Integrations
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {integrations
                  .filter(integration => !integration.is_connected)
                  .map(integration => (
                    <IntegrationCard
                      key={integration.service_name}
                      integration={integration}
                      onConnect={handleConnect}
                      onDisconnect={handleDisconnect}
                      onTest={handleTest}
                      onSettings={handleSettings}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'sync' && (
          <div className='space-y-6'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                <ArrowLeftRight className='h-5 w-5' />
                Sync History
              </h2>

              {syncHistory.length === 0 ? (
                <div className='text-center py-8'>
                  <ArrowLeftRight className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-600 dark:text-gray-400'>
                    No sync history available
                  </p>
                  <p className='text-sm text-gray-500 dark:text-gray-500'>
                    Connect integrations and sync documents to see history here
                  </p>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-200 dark:border-gray-700'>
                        <th className='text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Service
                        </th>
                        <th className='text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Document
                        </th>
                        <th className='text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Direction
                        </th>
                        <th className='text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Status
                        </th>
                        <th className='text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Last Sync
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {syncHistory.slice(0, 20).map(sync => (
                        <tr
                          key={sync.id}
                          className='border-b border-gray-100 dark:border-gray-800'
                        >
                          <td className='py-3 px-4'>
                            <div className='flex items-center gap-2'>
                              <span className='text-sm font-medium text-gray-900 dark:text-white capitalize'>
                                {sync.integration_id.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className='py-3 px-4'>
                            <span className='text-sm text-gray-700 dark:text-gray-300'>
                              {(sync as any).documents?.title ||
                                'Unknown Document'}
                            </span>
                          </td>
                          <td className='py-3 px-4'>
                            <div className='flex items-center gap-1'>
                              {getSyncDirectionIcon(sync.sync_direction)}
                              <span className='text-sm text-gray-700 dark:text-gray-300 capitalize'>
                                {sync.sync_direction}
                              </span>
                            </div>
                          </td>
                          <td className='py-3 px-4'>
                            <div className='flex items-center gap-1'>
                              {getSyncStatusIcon(sync.sync_status)}
                              <span
                                className={`text-sm font-medium capitalize ${
                                  sync.sync_status === 'completed'
                                    ? 'text-green-600'
                                    : sync.sync_status === 'failed'
                                      ? 'text-red-600'
                                      : sync.sync_status === 'in_progress'
                                        ? 'text-blue-600'
                                        : 'text-gray-600'
                                }`}
                              >
                                {sync.sync_status.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className='py-3 px-4'>
                            <span className='text-sm text-gray-500 dark:text-gray-400'>
                              {new Date(sync.last_sync).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedView === 'settings' && (
          <div className='space-y-6'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                Integration Settings
              </h2>

              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                  <div>
                    <h3 className='font-medium text-gray-900 dark:text-white'>
                      Auto-sync
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Automatically sync documents when they are updated
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      className='sr-only peer'
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                  <div>
                    <h3 className='font-medium text-gray-900 dark:text-white'>
                      Sync Notifications
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Receive notifications when sync operations complete
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      className='sr-only peer'
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                  <div>
                    <h3 className='font-medium text-gray-900 dark:text-white'>
                      Error Logging
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Log detailed error information for debugging
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input type='checkbox' className='sr-only peer' />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && selectedIntegration && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Connect to {selectedIntegration.replace('_', ' ')}
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4'>
              This will open the authentication flow for{' '}
              {selectedIntegration.replace('_', ' ')}.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => handleConnectSubmit({})}
                className='flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors'
              >
                Connect
              </button>
              <button
                onClick={() => setShowConnectModal(false)}
                className='flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && selectedIntegration && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              {selectedIntegration.replace('_', ' ')} Settings
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Sync Frequency
                </label>
                <select className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'>
                  <option value='manual'>Manual</option>
                  <option value='hourly'>Hourly</option>
                  <option value='daily'>Daily</option>
                  <option value='weekly'>Weekly</option>
                </select>
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className='flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors'
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className='flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors'
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

export default ApiIntegration;
