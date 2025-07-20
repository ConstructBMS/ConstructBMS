import { supabase } from './supabase';

export interface CloudStorageProvider {
  apiVersion: string;
  authUrl: string;
  color: string;
  description: string;
  displayName: string;
  icon: string;
  id: string;
  isConnected: boolean;
  lastSync?: string;
  name: string;
  scopes: string[];
  syncStatus: 'idle' | 'syncing' | 'error';
}

export interface CloudStorageFile {
  createdTime: string;
  downloadUrl?: string;
  id: string;
  isFolder: boolean;
  mimeType: string;
  modifiedTime: string;
  name: string;
  parents?: string[];
  path: string;
  size: number;
  thumbnailLink?: string;
  webViewLink?: string;
}

export interface CloudStorageFolder {
  createdTime: string;
  id: string;
  modifiedTime: string;
  name: string;
  parentId?: string;
  path: string;
}

export interface SyncSettings {
  autoSync: boolean;
  conflictResolution: 'local_wins' | 'remote_wins' | 'ask_user';
  defaultStorage: 'local' | 'google_drive' | 'onedrive' | 'dropbox';
  folderStructure: 'flat' | 'hierarchical';
  syncDirection: 'upload' | 'download' | 'bidirectional';
  syncInterval: 'manual' | 'hourly' | 'daily' | 'weekly';
}

export interface SyncResult {
  data?: any;
  error?: string;
  filesFailed?: number;
  filesProcessed?: number;
  filesSkipped?: number;
  message: string;
  success: boolean;
  timestamp: string;
}

class CloudStorageService {
  private providers: CloudStorageProvider[] = [
    {
      id: 'google_drive',
      name: 'Google Drive',
      displayName: 'Google Drive',
      description: 'Sync documents with Google Drive for cloud storage and collaboration',
      icon: 'GoogleDriveIcon',
      color: 'bg-blue-500',
      authUrl: 'https://accounts.google.com/oauth/authorize',
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
      ],
      apiVersion: 'v3',
      isConnected: false,
      syncStatus: 'idle'
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      displayName: 'OneDrive',
      description: 'Sync documents with Microsoft OneDrive for Business',
      icon: 'OneDriveIcon',
      color: 'bg-blue-600',
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      scopes: [
        'Files.ReadWrite',
        'Files.ReadWrite.All',
        'Sites.ReadWrite.All'
      ],
      apiVersion: 'v1.0',
      isConnected: false,
      syncStatus: 'idle'
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      displayName: 'Dropbox',
      description: 'Backup and sync documents with Dropbox',
      icon: 'DropboxIcon',
      color: 'bg-blue-700',
      authUrl: 'https://www.dropbox.com/oauth2/authorize',
      scopes: ['files.content.write', 'files.content.read'],
      apiVersion: '2',
      isConnected: false,
      syncStatus: 'idle'
    }
  ];

  // Get all available cloud storage providers
  async getProviders(): Promise<CloudStorageProvider[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return this.providers;

      // Get user's connection status for each provider
      const { data: connections } = await supabase
        .from('cloud_storage_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Update provider status based on connections
      return this.providers.map(provider => ({
        ...provider,
        isConnected: connections?.some(
          conn => conn.provider_id === provider.id
        ) || false,
        lastSync: connections?.find(
          conn => conn.provider_id === provider.id
        )?.last_sync
      }));
    } catch (error) {
      console.error('Error fetching cloud storage providers:', error);
      return this.providers;
    }
  }

  // Get user's connected cloud storage providers
  async getConnectedProviders(): Promise<CloudStorageProvider[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: connections } = await supabase
        .from('cloud_storage_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (!connections) return [];

      return this.providers
        .filter(provider => 
          connections.some(conn => conn.provider_id === provider.id)
        )
        .map(provider => ({
          ...provider,
          isConnected: true,
          lastSync: connections.find(
            conn => conn.provider_id === provider.id
          )?.last_sync
        }));
    } catch (error) {
      console.error('Error fetching connected providers:', error);
      return [];
    }
  }

  // Connect to a cloud storage provider
  async connectProvider(providerId: string): Promise<SyncResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const provider = this.providers.find(p => p.id === providerId);
      if (!provider) {
        throw new Error('Provider not found');
      }

      // Generate OAuth URL for the provider
      const authUrl = this.generateAuthUrl(provider);
      
      // Open OAuth flow in a popup or redirect
      window.open(authUrl, 'cloud-storage-auth', 'width=600,height=700');

      return {
        success: true,
        message: `Redirecting to ${provider.displayName} for authorization...`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error connecting to provider:', error);
      return {
        success: false,
        message: 'Failed to connect to provider',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Handle OAuth callback
  async handleAuthCallback(providerId: string, authCode: string): Promise<SyncResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const provider = this.providers.find(p => p.id === providerId);
      if (!provider) {
        throw new Error('Provider not found');
      }

      // Exchange auth code for access token
      const tokens = await this.exchangeAuthCode(provider, authCode);

      // Store connection in database
      const { error } = await supabase
        .from('cloud_storage_connections')
        .upsert({
          user_id: user.id,
          provider_id: providerId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          connection_data: {
            scope: tokens.scope,
            token_type: tokens.token_type
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return {
        success: true,
        message: `Successfully connected to ${provider.displayName}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error handling auth callback:', error);
      return {
        success: false,
        message: 'Failed to complete authentication',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Disconnect from a cloud storage provider
  async disconnectProvider(providerId: string): Promise<SyncResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Deactivate connection in database
      const { error } = await supabase
        .from('cloud_storage_connections')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('provider_id', providerId);

      if (error) throw error;

      return {
        success: true,
        message: 'Successfully disconnected from cloud storage provider',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error disconnecting from provider:', error);
      return {
        success: false,
        message: 'Failed to disconnect from provider',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get sync settings
  async getSyncSettings(): Promise<SyncSettings> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return this.getDefaultSyncSettings();
      }

      const { data, error } = await supabase
        .from('cloud_storage_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return this.getDefaultSyncSettings();
      }

      return data.settings as SyncSettings;
    } catch (error) {
      console.error('Error fetching sync settings:', error);
      return this.getDefaultSyncSettings();
    }
  }

  // Update sync settings
  async updateSyncSettings(settings: Partial<SyncSettings>): Promise<SyncResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const currentSettings = await this.getSyncSettings();
      const updatedSettings = { ...currentSettings, ...settings };

      const { error } = await supabase
        .from('cloud_storage_settings')
        .upsert({
          user_id: user.id,
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return {
        success: true,
        message: 'Sync settings updated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating sync settings:', error);
      return {
        success: false,
        message: 'Failed to update sync settings',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Upload document to cloud storage
  async uploadDocument(
    providerId: string,
    document: any,
    folderPath?: string
  ): Promise<SyncResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get connection details
      const { data: connection } = await supabase
        .from('cloud_storage_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider_id', providerId)
        .eq('is_active', true)
        .single();

      if (!connection) {
        throw new Error('No active connection found for this provider');
      }

      // Upload based on provider
      let uploadResult;
      switch (providerId) {
        case 'google_drive':
          uploadResult = await this.uploadToGoogleDrive(connection, document, folderPath);
          break;
        case 'onedrive':
          uploadResult = await this.uploadToOneDrive(connection, document, folderPath);
          break;
        case 'dropbox':
          uploadResult = await this.uploadToDropbox(connection, document, folderPath);
          break;
        default:
          throw new Error('Unsupported provider');
      }

      // Record sync in database
      await this.recordSync(providerId, document.id, 'upload', 'completed');

      return {
        success: true,
        message: `Document uploaded to ${this.getProviderName(providerId)} successfully`,
        data: uploadResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      await this.recordSync(providerId, document.id, 'upload', 'failed', error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        message: 'Failed to upload document',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Download document from cloud storage
  async downloadDocument(
    providerId: string,
    documentId: string,
    cloudFileId: string
  ): Promise<SyncResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get connection details
      const { data: connection } = await supabase
        .from('cloud_storage_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider_id', providerId)
        .eq('is_active', true)
        .single();

      if (!connection) {
        throw new Error('No active connection found for this provider');
      }

      // Download based on provider
      let downloadResult;
      switch (providerId) {
        case 'google_drive':
          downloadResult = await this.downloadFromGoogleDrive(connection, cloudFileId);
          break;
        case 'onedrive':
          downloadResult = await this.downloadFromOneDrive(connection, cloudFileId);
          break;
        case 'dropbox':
          downloadResult = await this.downloadFromDropbox(connection, cloudFileId);
          break;
        default:
          throw new Error('Unsupported provider');
      }

      // Record sync in database
      await this.recordSync(providerId, documentId, 'download', 'completed');

      return {
        success: true,
        message: `Document downloaded from ${this.getProviderName(providerId)} successfully`,
        data: downloadResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error downloading document:', error);
      await this.recordSync(providerId, documentId, 'download', 'failed', error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        message: 'Failed to download document',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Sync all documents with cloud storage
  async syncAllDocuments(providerId: string, direction: 'upload' | 'download' | 'bidirectional'): Promise<SyncResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get all documents
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);

      if (!documents) {
        return {
          success: true,
          message: 'No documents to sync',
          timestamp: new Date().toISOString()
        };
      }

      let filesProcessed = 0;
      let filesSkipped = 0;
      let filesFailed = 0;

      for (const document of documents) {
        try {
          if (direction === 'upload' || direction === 'bidirectional') {
            const result = await this.uploadDocument(providerId, document);
            if (result.success) {
              filesProcessed++;
            } else {
              filesFailed++;
            }
          }
          
          if (direction === 'download' || direction === 'bidirectional') {
            // Check if document exists in cloud storage
            const cloudFile = await this.findCloudFile(providerId, document.id);
            if (cloudFile) {
              const result = await this.downloadDocument(providerId, document.id, cloudFile.id);
              if (result.success) {
                filesProcessed++;
              } else {
                filesFailed++;
              }
            } else {
              filesSkipped++;
            }
          }
        } catch (error) {
          filesFailed++;
          console.error(`Error syncing document ${document.id}:`, error);
        }
      }

      return {
        success: true,
        message: `Sync completed. Processed: ${filesProcessed}, Skipped: ${filesSkipped}, Failed: ${filesFailed}`,
        timestamp: new Date().toISOString(),
        filesProcessed,
        filesSkipped,
        filesFailed
      };
    } catch (error) {
      console.error('Error syncing all documents:', error);
      return {
        success: false,
        message: 'Failed to sync documents',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get sync history
  async getSyncHistory(providerId?: string): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('cloud_storage_syncs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching sync history:', error);
      return [];
    }
  }

  // Private helper methods
  private generateAuthUrl(provider: CloudStorageProvider): string {
    const clientId = this.getClientId(provider.id);
    const redirectUri = `${window.location.origin}/auth/callback/${provider.id}`;
    const scope = provider.scopes.join(' ');
    const state = this.generateState();

    switch (provider.id) {
      case 'google_drive':
        return `${provider.authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}&access_type=offline&prompt=consent`;
      case 'onedrive':
        return `${provider.authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}`;
      case 'dropbox':
        return `${provider.authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
      default:
        throw new Error('Unsupported provider');
    }
  }

  private async exchangeAuthCode(provider: CloudStorageProvider, authCode: string): Promise<any> {
    const clientId = this.getClientId(provider.id);
    const clientSecret = this.getClientSecret(provider.id);
    const redirectUri = `${window.location.origin}/auth/callback/${provider.id}`;

    const response = await fetch('/api/cloud-storage/exchange-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: provider.id,
        clientId,
        clientSecret,
        authCode,
        redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange auth code for tokens');
    }

    return await response.json();
  }

  private async uploadToGoogleDrive(connection: any, document: any, folderPath?: string): Promise<any> {
    // Implementation for Google Drive upload
    // This would use the Google Drive API
    console.log('Uploading to Google Drive:', document.name);
    return { fileId: 'mock-google-drive-file-id' };
  }

  private async uploadToOneDrive(connection: any, document: any, folderPath?: string): Promise<any> {
    // Implementation for OneDrive upload
    // This would use the Microsoft Graph API
    console.log('Uploading to OneDrive:', document.name);
    return { fileId: 'mock-onedrive-file-id' };
  }

  private async uploadToDropbox(connection: any, document: any, folderPath?: string): Promise<any> {
    // Implementation for Dropbox upload
    // This would use the Dropbox API
    console.log('Uploading to Dropbox:', document.name);
    return { fileId: 'mock-dropbox-file-id' };
  }

  private async downloadFromGoogleDrive(connection: any, cloudFileId: string): Promise<any> {
    // Implementation for Google Drive download
    console.log('Downloading from Google Drive:', cloudFileId);
    return { content: 'mock-file-content' };
  }

  private async downloadFromOneDrive(connection: any, cloudFileId: string): Promise<any> {
    // Implementation for OneDrive download
    console.log('Downloading from OneDrive:', cloudFileId);
    return { content: 'mock-file-content' };
  }

  private async downloadFromDropbox(connection: any, cloudFileId: string): Promise<any> {
    // Implementation for Dropbox download
    console.log('Downloading from Dropbox:', cloudFileId);
    return { content: 'mock-file-content' };
  }

  private async findCloudFile(providerId: string, documentId: string): Promise<CloudStorageFile | null> {
    // Implementation to find a file in cloud storage
    // This would search the cloud storage for a file with matching metadata
    return null;
  }

  private async recordSync(
    providerId: string,
    documentId: string,
    direction: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('cloud_storage_syncs')
        .insert({
          user_id: user.id,
          provider_id: providerId,
          document_id: documentId,
          direction,
          status,
          error_message: errorMessage,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording sync:', error);
    }
  }

  private getDefaultSyncSettings(): SyncSettings {
    return {
      defaultStorage: 'local',
      autoSync: false,
      syncInterval: 'manual',
      syncDirection: 'bidirectional',
      folderStructure: 'hierarchical',
      conflictResolution: 'ask_user'
    };
  }

  private getClientId(providerId: string): string {
    // In a real implementation, these would come from environment variables
    const clientIds: Record<string, string> = {
      google_drive: process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID || 'mock-google-client-id',
      onedrive: process.env.REACT_APP_ONEDRIVE_CLIENT_ID || 'mock-onedrive-client-id',
      dropbox: process.env.REACT_APP_DROPBOX_CLIENT_ID || 'mock-dropbox-client-id'
    };
    return clientIds[providerId] || '';
  }

  private getClientSecret(providerId: string): string {
    // In a real implementation, these would come from environment variables
    const clientSecrets: Record<string, string> = {
      google_drive: process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_SECRET || 'mock-google-client-secret',
      onedrive: process.env.REACT_APP_ONEDRIVE_CLIENT_SECRET || 'mock-onedrive-client-secret',
      dropbox: process.env.REACT_APP_DROPBOX_CLIENT_SECRET || 'mock-dropbox-client-secret'
    };
    return clientSecrets[providerId] || '';
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private getProviderName(providerId: string): string {
    const provider = this.providers.find(p => p.id === providerId);
    return provider?.displayName || providerId;
  }
}

export const cloudStorageService = new CloudStorageService(); 
