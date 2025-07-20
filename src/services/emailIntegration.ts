import { supabase } from './supabaseAuth';

export interface EmailProvider {
  email: string;
  id: string;
  isConnected: boolean;
  isDefault: boolean;
  name: string;
    oAuthClientId?: string;
    oAuthClientSecret?: string;
  settings?: {
    smtpHost?: string;
    smtpPassword?: string;
    smtpPort?: number;
    smtpUser?: string;
    useOAuth?: boolean;
};
  type: 'gmail' | 'outlook' | 'google_workspace' | 'microsoft365' | 'custom';
}

export interface EmailIntegration {
  connectProvider: (provider: Partial<EmailProvider>) => Promise<boolean>;
  disconnectProvider: (providerId: string) => Promise<boolean>;
  getConnectedProviders: () => Promise<EmailProvider[]>;
  sendEmail: (to: string, subject: string, body: string) => Promise<boolean>;
  setDefaultProvider: (providerId: string) => Promise<boolean>;
}

export class EmailIntegrationService {
  /**
   * Send email using the user's connected email providers
   */
  static async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's connected email providers
      const providers = await this.getConnectedProviders();
      const defaultProvider = providers.find(p => p.isDefault && p.isConnected);
      
      if (!defaultProvider) {
        console.warn('No default email provider found for 2FA');
        return false;
      }

      // Send email based on provider type
      switch (defaultProvider.type) {
        case 'gmail':
        case 'google_workspace':
          return await this.sendViaGmail(to, subject, body, defaultProvider);
        case 'outlook':
        case 'microsoft365':
          return await this.sendViaOutlook(to, subject, body, defaultProvider);
        case 'custom':
          return await this.sendViaSMTP(to, subject, body, defaultProvider);
        default:
          console.warn(`Unsupported email provider type: ${defaultProvider.type}`);
          return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Get all connected email providers for the current user
   */
  static async getConnectedProviders(): Promise<EmailProvider[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_email_providers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('Error fetching email providers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting email providers:', error);
      return [];
    }
  }

  /**
   * Connect a new email provider
   */
  static async connectProvider(provider: Partial<EmailProvider>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_email_providers')
        .upsert({
          user_id: user.id,
          name: provider.name,
          type: provider.type,
          email: provider.email,
          is_connected: true,
          is_default: provider.isDefault || false,
          settings: provider.settings || {},
        });

      if (error) {
        console.error('Error connecting email provider:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error connecting provider:', error);
      return false;
    }
  }

  /**
   * Disconnect an email provider
   */
  static async disconnectProvider(providerId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_email_providers')
        .update({ is_connected: false })
        .eq('id', providerId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error disconnecting email provider:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error disconnecting provider:', error);
      return false;
    }
  }

  /**
   * Set a provider as default
   */
  static async setDefaultProvider(providerId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, unset all providers as default
      await supabase
        .from('user_email_providers')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the specified provider as default
      const { error } = await supabase
        .from('user_email_providers')
        .update({ is_default: true })
        .eq('id', providerId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error setting default provider:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error setting default provider:', error);
      return false;
    }
  }

  // Private methods for different email sending strategies
  private static async sendViaGmail(to: string, subject: string, body: string, provider: EmailProvider): Promise<boolean> {
    // TODO: Implement Gmail API integration
    // For now, log the email
    console.log(`[Gmail] Sending to ${to}: ${subject}`);
    console.log(`[Gmail] Body: ${body}`);
    return true;
  }

  private static async sendViaOutlook(to: string, subject: string, body: string, provider: EmailProvider): Promise<boolean> {
    // TODO: Implement Microsoft Graph API integration
    // For now, log the email
    console.log(`[Outlook] Sending to ${to}: ${subject}`);
    console.log(`[Outlook] Body: ${body}`);
    return true;
  }

  private static async sendViaSMTP(to: string, subject: string, body: string, provider: EmailProvider): Promise<boolean> {
    // TODO: Implement SMTP sending
    // For now, log the email
    console.log(`[SMTP] Sending to ${to}: ${subject}`);
    console.log(`[SMTP] Body: ${body}`);
    return true;
  }
}

// Export the service instance
export const emailIntegration = EmailIntegrationService;
