import { EmailProvider, EmailConfiguration } from '../types/email';

// Auto-detection and configuration for email providers
export interface EmailProviderConfig {
  color: string;
  domains: string[];
    host: string;
  icon: string;
  imapSettings: {
    port: number;
    secure: boolean;
};
  name: string;
  oauthSupported: boolean;
  provider: EmailProvider;
  setupSteps: string[];
  smtpSettings: {
    host: string;
    port: number;
    secure: boolean;
  };
}

// Pre-configured email providers
export const EMAIL_PROVIDERS: EmailProviderConfig[] = [
  {
    provider: 'gmail',
    name: 'Gmail',
    icon: '📧',
    color: '#EA4335',
    domains: ['gmail.com', 'googlemail.com'],
    imapSettings: {
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
    },
    smtpSettings: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: true,
    },
    oauthSupported: true,
    setupSteps: [
      'Enter your Gmail address and password',
      'Enable "Less secure app access" in your Google Account settings',
      'Or use an App Password for enhanced security',
    ],
  },
  {
    provider: 'microsoft365',
    name: 'Microsoft 365',
    icon: '📧',
    color: '#0078D4',
    domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
    imapSettings: {
      host: 'outlook.office365.com',
      port: 993,
      secure: true,
    },
    smtpSettings: {
      host: 'smtp.office365.com',
      port: 587,
      secure: true,
    },
    oauthSupported: true,
    setupSteps: [
      'Enter your Microsoft 365 email and password',
      'Enable IMAP in your Outlook settings',
      'Allow access to less secure apps if prompted',
    ],
  },
  {
    provider: 'yahoo',
    name: 'Yahoo Mail',
    icon: '📧',
    color: '#720E9E',
    domains: ['yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.com.au'],
    imapSettings: {
      host: 'imap.mail.yahoo.com',
      port: 993,
      secure: true,
    },
    smtpSettings: {
      host: 'smtp.mail.yahoo.com',
      port: 587,
      secure: true,
    },
    oauthSupported: false,
    setupSteps: [
      'Enter your Yahoo email and password',
      'Generate an App Password in your Yahoo Account Security settings',
      'Use the App Password instead of your regular password',
    ],
  },
  {
    provider: 'icloud',
    name: 'iCloud Mail',
    icon: '📧',
    color: '#007AFF',
    domains: ['icloud.com', 'me.com', 'mac.com'],
    imapSettings: {
      host: 'imap.mail.me.com',
      port: 993,
      secure: true,
    },
    smtpSettings: {
      host: 'smtp.mail.me.com',
      port: 587,
      secure: true,
    },
    oauthSupported: false,
    setupSteps: [
      'Enter your iCloud email and password',
      'Enable two-factor authentication on your Apple ID',
      'Generate an App-Specific Password for this application',
    ],
  },
  {
    provider: 'protonmail',
    name: 'ProtonMail',
    icon: '📧',
    color: '#6D4AFF',
    domains: ['protonmail.com', 'proton.me'],
    imapSettings: {
      host: '127.0.0.1',
      port: 1143,
      secure: false,
    },
    smtpSettings: {
      host: '127.0.0.1',
      port: 1025,
      secure: false,
    },
    oauthSupported: false,
    setupSteps: [
      'ProtonMail requires Bridge application for IMAP/SMTP access',
      'Download and install ProtonMail Bridge',
      'Configure Bridge with your ProtonMail credentials',
      'Use Bridge settings for IMAP/SMTP configuration',
    ],
  },
];

// Auto-detect provider from email address
export function detectEmailProvider(email: string): EmailProviderConfig | null {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;

  return (
    EMAIL_PROVIDERS.find(provider =>
      provider.domains.some(d => domain === d || domain.endsWith('.' + d))
    ) || null
  );
}

// Get provider configuration
export function getProviderConfig(
  provider: EmailProvider
): EmailProviderConfig | null {
  return EMAIL_PROVIDERS.find(p => p.provider === provider) || null;
}

// Auto-configure email settings
export function autoConfigureEmail(
  email: string,
  password: string
): EmailConfiguration | null {
  const providerConfig = detectEmailProvider(email);
  if (!providerConfig) return null;

  return {
    provider: providerConfig.provider,
    username: email,
    password: password,
    imapHost: providerConfig.imapSettings.host,
    imapPort: providerConfig.imapSettings.port,
    imapSecure: providerConfig.imapSettings.secure,
    smtpHost: providerConfig.smtpSettings.host,
    smtpPort: providerConfig.smtpSettings.port,
    smtpSecure: providerConfig.smtpSettings.secure,
  };
}

// Validate email configuration
export async function validateEmailConfig(config: EmailConfiguration): Promise<{
  error?: string;
  provider?: EmailProviderConfig;
  success: boolean;
}> {
  try {
    // For demo purposes, simulate validation
    // In production, this would test actual IMAP/SMTP connections

    const providerConfig = getProviderConfig(config.provider);
    if (!providerConfig) {
      return { success: false, error: 'Unsupported email provider' };
    }

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Random success/failure for demo
    const success = Math.random() > 0.3; // 70% success rate for demo

    if (success) {
      return { success: true, provider: providerConfig };
    } else {
      return {
        success: false,
        error: 'Authentication failed. Please check your email and password.',
        provider: providerConfig,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

// Get setup instructions for provider
export function getSetupInstructions(provider: EmailProvider): {
  steps: string[];
  tips: string[];
  title: string;
  troubleshooting: string[];
} {
  const config = getProviderConfig(provider);
  if (!config) {
    return {
      title: 'Manual Setup',
      steps: ['Enter your email settings manually'],
      tips: ['Contact your email provider for IMAP/SMTP settings'],
      troubleshooting: ["Check your email provider's documentation"],
    };
  }

  const instructions = {
    gmail: {
      title: 'Gmail Setup Instructions',
      steps: [
        'Go to your Google Account settings',
        'Navigate to Security → 2-Step Verification',
        'Generate an App Password for this application',
        'Use the App Password instead of your regular password',
      ],
      tips: [
        'App passwords are more secure than regular passwords',
        'You can revoke app passwords anytime',
        'This works even with 2-factor authentication enabled',
      ],
      troubleshooting: [
        'If login fails, try using an App Password',
        'Enable "Less secure app access" as a fallback',
        'Check that IMAP is enabled in Gmail settings',
      ],
    },
    microsoft365: {
      title: 'Microsoft 365 Setup Instructions',
      steps: [
        'Go to Outlook.com settings',
        'Navigate to Mail → Sync email',
        'Enable IMAP access',
        'Use your regular password or generate an app password',
      ],
      tips: [
        'App passwords provide better security',
        'Works with both personal and business accounts',
        'Enable 2FA for enhanced security',
      ],
      troubleshooting: [
        'Check that IMAP is enabled in Outlook settings',
        'Try using an app password if regular password fails',
        'Ensure your account allows IMAP access',
      ],
    },
    yahoo: {
      title: 'Yahoo Mail Setup Instructions',
      steps: [
        'Go to Yahoo Account Security settings',
        'Enable 2-Step Verification',
        'Generate an App Password',
        'Use the App Password for this application',
      ],
      tips: [
        'App passwords are required for IMAP access',
        "Regular passwords won't work with 2FA enabled",
        'You can create multiple app passwords',
      ],
      troubleshooting: [
        'App passwords are required for IMAP access',
        'Check that 2-Step Verification is enabled',
        'Ensure IMAP is enabled in Yahoo settings',
      ],
    },
    icloud: {
      title: 'iCloud Mail Setup Instructions',
      steps: [
        'Enable 2-Factor Authentication on your Apple ID',
        'Go to Apple ID settings → App-Specific Passwords',
        'Generate a new app-specific password',
        'Use the app-specific password for this application',
      ],
      tips: [
        'App-specific passwords are required for IMAP access',
        "Regular Apple ID password won't work",
        'You can revoke app-specific passwords anytime',
      ],
      troubleshooting: [
        'App-specific passwords are required',
        'Ensure 2-Factor Authentication is enabled',
        'Check that iCloud Mail is enabled',
      ],
    },
    protonmail: {
      title: 'ProtonMail Setup Instructions',
      steps: [
        'Download ProtonMail Bridge from protonmail.com/bridge',
        'Install and configure Bridge with your ProtonMail account',
        'Bridge will provide local IMAP/SMTP servers',
        'Use Bridge settings for IMAP/SMTP configuration',
      ],
      tips: [
        'ProtonMail Bridge is required for IMAP/SMTP access',
        'Bridge runs locally on your computer',
        'Bridge provides end-to-end encryption',
      ],
      troubleshooting: [
        'ProtonMail Bridge is required for IMAP/SMTP',
        'Ensure Bridge is running and configured',
        'Check Bridge documentation for setup help',
      ],
    },
  };

  return (
    instructions[provider] || {
      title: `${config.name} Setup`,
      steps: config.setupSteps,
      tips: [
        "Check your email provider's documentation for specific instructions",
      ],
      troubleshooting: ["Contact your email provider's support"],
    }
  );
}

// Smart email validation
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Get common email providers for quick selection
export function getCommonProviders(): EmailProviderConfig[] {
  return EMAIL_PROVIDERS.filter(p =>
    ['gmail', 'microsoft365', 'yahoo'].includes(p.provider)
  );
}

// Get all providers for manual selection
export function getAllProviders(): EmailProviderConfig[] {
  return EMAIL_PROVIDERS;
}
