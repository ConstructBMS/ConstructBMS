import { supabase } from './supabase';

export interface ApiIntegration {
  color: string;
  connection_details?: Record<string, any>;
  created_at?: string;
  description: string;
  display_name: string;
  icon: string;
  id?: string;
  is_connected: boolean;
  last_sync?: string;
  service_name: string;
  service_type: 'cloud_storage' | 'communication' | 'project_management' | 'crm' | 'other';
  sync_frequency?: 'manual' | 'hourly' | 'daily' | 'weekly';
  updated_at?: string;
}

export interface IntegrationConnection {
  access_token?: string;
  connection_data: Record<string, any>;
  created_at?: string;
  expires_at?: string;
  id?: string;
  integration_id: string;
  is_active: boolean;
  refresh_token?: string;
  updated_at?: string;
  user_id: string;
}

export interface SyncResult {
  data?: any;
  error?: string;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface DocumentSync {
  created_at?: string;
  document_id: string;
  error_message?: string;
  external_id: string;
  external_url?: string;
  id?: string;
  integration_id: string;
  last_sync: string;
  sync_direction: 'upload' | 'download' | 'bidirectional';
  sync_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  updated_at?: string;
}

class ApiIntegrationService {
  private integrations: ApiIntegration[] = [
    {
      service_name: 'google_drive',
      service_type: 'cloud_storage',
      display_name: 'Google Drive',
      description:
        'Sync documents with Google Drive for cloud storage and collaboration',
      icon: 'GoogleDriveIcon',
      color: 'bg-blue-500',
      is_connected: false,
    },
    {
      service_name: 'dropbox',
      service_type: 'cloud_storage',
      display_name: 'Dropbox',
      description: 'Backup and sync documents with Dropbox',
      icon: 'DropboxIcon',
      color: 'bg-blue-600',
      is_connected: false,
    },
    {
      service_name: 'slack',
      service_type: 'communication',
      display_name: 'Slack',
      description: 'Share documents and receive notifications in Slack',
      icon: 'SlackIcon',
      color: 'bg-purple-500',
      is_connected: false,
    },
    {
      service_name: 'microsoft_teams',
      service_type: 'communication',
      display_name: 'Microsoft Teams',
      description: 'Integrate with Microsoft Teams for document sharing',
      icon: 'TeamsIcon',
      color: 'bg-blue-700',
      is_connected: false,
    },
    {
      service_name: 'notion',
      service_type: 'project_management',
      display_name: 'Notion',
      description: 'Sync documents with Notion workspaces',
      icon: 'NotionIcon',
      color: 'bg-black',
      is_connected: false,
    },
    {
      service_name: 'trello',
      service_type: 'project_management',
      display_name: 'Trello',
      description: 'Attach documents to Trello cards',
      icon: 'TrelloIcon',
      color: 'bg-blue-400',
      is_connected: false,
    },
    {
      service_name: 'salesforce',
      service_type: 'crm',
      display_name: 'Salesforce',
      description: 'Link documents to Salesforce records',
      icon: 'SalesforceIcon',
      color: 'bg-blue-600',
      is_connected: false,
    },
    {
      service_name: 'hubspot',
      service_type: 'crm',
      display_name: 'HubSpot',
      description: 'Integrate documents with HubSpot CRM',
      icon: 'HubSpotIcon',
      color: 'bg-orange-500',
      is_connected: false,
    },
  ];

  // Get all available integrations
  async getIntegrations(): Promise<ApiIntegration[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return this.integrations;

      // Get user's connection status for each integration
      const { data: connections } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Update integration status based on connections
      return this.integrations.map(integration => ({
        ...integration,
        is_connected:
          connections?.some(
            conn => conn.integration_id === integration.service_name
          ) || false,
      }));
    } catch (error) {
      console.error('Error fetching integrations:', error);
      return this.integrations;
    }
  }

  // Get user's connected integrations
  async getConnectedIntegrations(): Promise<IntegrationConnection[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching connected integrations:', error);
      return [];
    }
  }

  // Connect to an integration
  async connectIntegration(
    serviceName: string,
    connectionData: Record<string, any>
  ): Promise<SyncResult> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate integration exists
      const integration = this.integrations.find(
        i => i.service_name === serviceName
      );
      if (!integration) {
        throw new Error('Integration not found');
      }

      // Create or update connection
      const connection: IntegrationConnection = {
        integration_id: serviceName,
        user_id: user.id,
        connection_data: connectionData,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('integration_connections')
        .upsert([connection], { onConflict: 'integration_id,user_id' })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: `Successfully connected to ${integration.display_name}`,
        data: data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error connecting integration:', error);
      return {
        success: false,
        message: 'Failed to connect integration',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Disconnect from an integration
  async disconnectIntegration(serviceName: string): Promise<SyncResult> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('integration_connections')
        .update({ is_active: false })
        .eq('integration_id', serviceName)
        .eq('user_id', user.id);

      if (error) throw error;

      return {
        success: true,
        message: `Successfully disconnected from ${serviceName}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      return {
        success: false,
        message: 'Failed to disconnect integration',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Sync document with external service
  async syncDocument(
    documentId: string,
    integrationId: string,
    direction: 'upload' | 'download' | 'bidirectional'
  ): Promise<SyncResult> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if integration is connected
      const { data: connection } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('integration_id', integrationId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!connection) {
        throw new Error('Integration not connected');
      }

      // Create sync record
      const syncRecord: DocumentSync = {
        document_id: documentId,
        integration_id: integrationId,
        external_id: `ext_${Date.now()}`, // This would be the actual external ID
        sync_direction: direction,
        last_sync: new Date().toISOString(),
        sync_status: 'in_progress',
      };

      const { data: syncData, error: syncError } = await supabase
        .from('document_syncs')
        .insert([syncRecord])
        .select()
        .single();

      if (syncError) throw syncError;

      // Simulate sync process (in real implementation, this would call the actual API)
      await this.simulateSyncProcess(integrationId, direction);

      // Update sync status
      await supabase
        .from('document_syncs')
        .update({
          sync_status: 'completed',
          last_sync: new Date().toISOString(),
        })
        .eq('id', syncData.id);

      return {
        success: true,
        message: `Document synced successfully with ${integrationId}`,
        data: syncData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error syncing document:', error);
      return {
        success: false,
        message: 'Failed to sync document',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Get sync history for a document
  async getDocumentSyncHistory(documentId: string): Promise<DocumentSync[]> {
    try {
      const { data, error } = await supabase
        .from('document_syncs')
        .select('*')
        .eq('document_id', documentId)
        .order('last_sync', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sync history:', error);
      return [];
    }
  }

  // Get all sync history for user
  async getSyncHistory(): Promise<DocumentSync[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('document_syncs')
        .select(
          `
          *,
          documents(title),
          integration_connections(integration_id)
        `
        )
        .order('last_sync', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sync history:', error);
      return [];
    }
  }

  // Test integration connection
  async testConnection(serviceName: string): Promise<SyncResult> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if integration is connected
      const { data: connection } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('integration_id', serviceName)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!connection) {
        throw new Error('Integration not connected');
      }

      // Simulate API test (in real implementation, this would test the actual API)
      await this.simulateApiTest(serviceName);

      return {
        success: true,
        message: `Connection to ${serviceName} is working properly`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Get integration configuration
  getIntegrationConfig(serviceName: string): Record<string, any> {
    const configs: Record<string, any> = {
      google_drive: {
        scopes: ['https://www.googleapis.com/auth/drive.file'],
        authUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
      },
      dropbox: {
        scopes: ['files.content.write', 'files.content.read'],
        authUrl: 'https://www.dropbox.com/oauth2/authorize',
        tokenUrl: 'https://api.dropbox.com/oauth2/token',
      },
      slack: {
        scopes: ['files:read', 'files:write', 'chat:write'],
        authUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
      },
    };

    return configs[serviceName] || {};
  }

  // Private helper methods
  private async simulateSyncProcess(
    integrationId: string,
    direction: string
  ): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );
  }

  private async simulateApiTest(serviceName: string): Promise<void> {
    // Simulate API test delay
    await new Promise(resolve =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );
  }
}

// Create singleton instance
let apiIntegrationInstance: ApiIntegrationService | null = null;

const getApiIntegrationInstance = () => {
  if (!apiIntegrationInstance) {
    apiIntegrationInstance = new ApiIntegrationService();
  }
  return apiIntegrationInstance;
};

// Export functions that use the singleton
export const apiIntegration = {
  getIntegrations: () => getApiIntegrationInstance().getIntegrations(),
  getConnectedIntegrations: () =>
    getApiIntegrationInstance().getConnectedIntegrations(),
  connectIntegration: (
    serviceName: string,
    connectionData: Record<string, any>
  ) =>
    getApiIntegrationInstance().connectIntegration(serviceName, connectionData),
  disconnectIntegration: (serviceName: string) =>
    getApiIntegrationInstance().disconnectIntegration(serviceName),
  syncDocument: (
    documentId: string,
    integrationId: string,
    direction: 'upload' | 'download' | 'bidirectional'
  ) =>
    getApiIntegrationInstance().syncDocument(
      documentId,
      integrationId,
      direction
    ),
  getDocumentSyncHistory: (documentId: string) =>
    getApiIntegrationInstance().getDocumentSyncHistory(documentId),
  getSyncHistory: () => getApiIntegrationInstance().getSyncHistory(),
  testConnection: (serviceName: string) =>
    getApiIntegrationInstance().testConnection(serviceName),
  getIntegrationConfig: (serviceName: string) =>
    getApiIntegrationInstance().getIntegrationConfig(serviceName),
};
