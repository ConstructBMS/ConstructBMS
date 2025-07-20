import { supabase } from './supabaseAuth';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { emailIntegration } from './emailIntegration';

export interface TwoFactorAuthStatus {
  backupCodes: string[];
  enabled: boolean;
  lastUsed?: string;
  method: 'totp' | 'sms' | 'email' | null;
}

export interface TwoFactorSetup {
  backupCodes: string[];
  otpauthUrl?: string;
  qrCodeDataUrl?: string;
  secret: string;
}

export class TwoFactorAuthService {
  /**
   * Check if 2FA is enabled for the current user
   */
  static async isEnabled(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data, error } = await supabase
        .from('user_settings')
        .select('two_factor_enabled')
        .eq('user_id', user.id)
        .single();
      if (error) return false;
      return data?.two_factor_enabled || false;
    } catch {
      return false;
    }
  }

  /**
   * Get current 2FA status and method
   */
  static async getStatus(): Promise<TwoFactorAuthStatus> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('user_settings')
        .select('two_factor_enabled, two_factor_method, backup_codes, last_2fa_used')
        .eq('user_id', user.id)
        .single();
      if (error) {
        return { enabled: false, method: null, backupCodes: [] };
      }
      return {
        enabled: data?.two_factor_enabled || false,
        method: data?.two_factor_method || null,
        backupCodes: data?.backup_codes || [],
        lastUsed: data?.last_2fa_used,
      };
    } catch {
      return { enabled: false, method: null, backupCodes: [] };
    }
  }

  /**
   * Start 2FA setup process
   */
  static async startSetup(method: 'totp' | 'sms' | 'email'): Promise<TwoFactorSetup> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    let secret = '';
    let otpauthUrl = '';
    let qrCodeDataUrl = '';
    
    if (method === 'totp') {
      secret = authenticator.generateSecret();
      otpauthUrl = authenticator.keyuri(user.email || '', 'Napwood', secret);
      // Generate QR code
      try {
        qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      } catch (error) {
        console.warn('Failed to generate QR code:', error);
      }
    } else {
      secret = this.generateSecret();
    }
    
    const backupCodes = this.generateBackupCodes();
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        two_factor_setup_secret: secret,
        two_factor_setup_backup_codes: backupCodes,
        two_factor_setup_method: method,
        two_factor_setup_timestamp: new Date().toISOString(),
      });
    if (error) throw new Error('Failed to store 2FA setup data');
    return { secret, backupCodes, otpauthUrl, qrCodeDataUrl };
  }

  /**
   * Complete 2FA setup with verification code
   */
  static async completeSetup(verificationCode: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data: setupData, error: setupError } = await supabase
      .from('user_settings')
      .select('two_factor_setup_secret, two_factor_setup_method, two_factor_setup_backup_codes')
      .eq('user_id', user.id)
      .single();
    if (setupError || !setupData) throw new Error('No 2FA setup data found');
    let isValid = false;
    if (setupData.two_factor_setup_method === 'totp') {
      isValid = authenticator.check(verificationCode, setupData.two_factor_setup_secret);
    } else {
      isValid = await this.verifyEmailSMSCode(verificationCode);
    }
    if (!isValid) throw new Error('Invalid verification code');
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        two_factor_enabled: true,
        two_factor_method: setupData.two_factor_setup_method,
        backup_codes: setupData.two_factor_setup_backup_codes,
        two_factor_setup_secret: null,
        two_factor_setup_backup_codes: null,
        two_factor_setup_method: null,
        two_factor_setup_timestamp: null,
      });
    if (error) throw new Error('Failed to enable 2FA');
    return true;
  }

  /**
   * Disable 2FA
   */
  static async disable(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        two_factor_enabled: false,
        two_factor_method: null,
        backup_codes: null,
      });
    if (error) throw new Error('Failed to disable 2FA');
    return true;
  }

  /**
   * Verify 2FA code during login
   */
  static async verifyCode(code: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('user_settings')
      .select('two_factor_method, backup_codes, two_factor_setup_secret')
      .eq('user_id', user.id)
      .single();
    if (error || !data) throw new Error('2FA settings not found');
    if (data.backup_codes && data.backup_codes.includes(code)) {
      const updatedBackupCodes = data.backup_codes.filter((c: string) => c !== code);
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          backup_codes: updatedBackupCodes,
          last_2fa_used: new Date().toISOString(),
        });
      return true;
    }
    if (data.two_factor_method === 'totp') {
      return authenticator.check(code, data.two_factor_setup_secret);
    }
    return false;
  }

  /**
   * Generate new backup codes
   */
  static async generateNewBackupCodes(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const newBackupCodes = this.generateBackupCodes();
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        backup_codes: newBackupCodes,
      });
    if (error) throw new Error('Failed to generate new backup codes');
    return newBackupCodes;
  }

  /**
   * Send verification code via email or SMS
   */
  static async sendVerificationCode(method: 'email' | 'sms'): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        verification_code: code,
        verification_code_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
    if (error) throw new Error('Failed to store verification code');
    
    if (method === 'email') {
      // Try to use connected email provider first
      const emailSent = await emailIntegration.sendEmail(
        user.email || '',
        'Napwood 2FA Verification Code',
        `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`
      );
      
      if (!emailSent) {
        // Fallback to console log if no email provider is connected
        console.log(`[2FA] Email code for ${user.email}: ${code}`);
        console.log(`[2FA] To enable real email delivery, connect your email provider in Settings > Integrations`);
      }
    } else {
      // Use your SMS provider here
      console.log(`[2FA] SMS code for ${user.phone}: ${code}`);
    }
    return true;
  }

  /**
   * Verify email/SMS code
   */
  static async verifyEmailSMSCode(code: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('user_settings')
      .select('verification_code, verification_code_expires')
      .eq('user_id', user.id)
      .single();
    if (error || !data) return false;
    if (new Date(data.verification_code_expires) < new Date()) return false;
    const isValid = data.verification_code === code;
    if (isValid) {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          verification_code: null,
          verification_code_expires: null,
        });
    }
    return isValid;
  }

  // Helper methods
  private static generateSecret(): string {
    // Fallback secret generator for non-TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  private static generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.floor(10000000 + Math.random() * 90000000).toString();
      codes.push(code);
    }
    return codes;
  }
} 
