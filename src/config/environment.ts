/**
 * Environment Configuration
 * Centralized environment variable management for enterprise deployment
 */

export interface EnvironmentConfig {
  // Supabase Configuration
    anonKey: string;
    // Application Configuration
  app: {
    apiTimeout: number;
    debug: boolean;
    environment: 'development' | 'staging' | 'production';
    maxRetries: number;
    name: string;
    version: string;
  };
  // Feature Flags
  features: {
    analytics: boolean;
    chat: boolean;
    emailIntegration: boolean;
    pwa: boolean;
    realtime: boolean;
  };

  // Performance Configuration
  performance: {
    cacheMaxAge: number;
    enableCaching: boolean;
    enableCompression: boolean;
    enableGzip: boolean;
  };

  // Security Configuration
  security: {
    enableCors: boolean;
    enableRateLimiting: boolean;
    maxLoginAttempts: number;
    passwordMinLength: number;
    sessionTimeout: number;
  };

  serviceRoleKey?: string;

  supabase: {
    url: string;
};
}

/**
 * Load environment configuration with validation
 */
function loadEnvironmentConfig(): EnvironmentConfig {
  const environment = import.meta.env.MODE || 'development';

  // Validate required environment variables
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL!,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
      serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    },

    app: {
      name: 'ConstructBMS Business Management',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: environment as 'development' | 'staging' | 'production',
      debug: environment === 'development',
      apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      maxRetries: parseInt(import.meta.env.VITE_MAX_RETRIES || '3'),
    },

    features: {
      chat: import.meta.env.VITE_FEATURE_CHAT !== 'false',
      emailIntegration: import.meta.env.VITE_FEATURE_EMAIL !== 'false',
      analytics: import.meta.env.VITE_FEATURE_ANALYTICS !== 'false',
      pwa: import.meta.env.VITE_FEATURE_PWA !== 'false',
      realtime: import.meta.env.VITE_FEATURE_REALTIME !== 'false',
    },

    security: {
      sessionTimeout: parseInt(
        import.meta.env.VITE_SESSION_TIMEOUT || '3600000'
      ),
      maxLoginAttempts: parseInt(
        import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5'
      ),
      passwordMinLength: parseInt(
        import.meta.env.VITE_PASSWORD_MIN_LENGTH || '8'
      ),
      enableCors: import.meta.env.VITE_ENABLE_CORS !== 'false',
      enableRateLimiting: import.meta.env.VITE_ENABLE_RATE_LIMITING !== 'false',
    },

    performance: {
      enableCompression: import.meta.env.VITE_ENABLE_COMPRESSION !== 'false',
      enableCaching: import.meta.env.VITE_ENABLE_CACHING !== 'false',
      cacheMaxAge: parseInt(import.meta.env.VITE_CACHE_MAX_AGE || '86400'),
      enableGzip: import.meta.env.VITE_ENABLE_GZIP !== 'false',
    },
  };
}

/**
 * Global environment configuration instance
 */
export const env = loadEnvironmentConfig();

/**
 * Environment-specific utilities
 */
export const isDevelopment = env.app.environment === 'development';
export const isProduction = env.app.environment === 'production';
export const isStaging = env.app.environment === 'staging';

/**
 * Feature flag utilities
 */
export const isFeatureEnabled = (
  feature: keyof EnvironmentConfig['features']
) => {
  return env.features[feature];
};

/**
 * Security utilities
 */
export const getSecurityConfig = () => env.security;
export const getPerformanceConfig = () => env.performance;

/**
 * Validation utilities
 */
export const validateEnvironment = (): void => {
  if (!env.supabase.url || !env.supabase.anonKey) {
    throw new Error('Invalid Supabase configuration');
  }

  if (env.app.apiTimeout < 1000) {
    throw new Error('API timeout must be at least 1000ms');
  }

  if (env.security.passwordMinLength < 6) {
    throw new Error('Password minimum length must be at least 6 characters');
  }
};

// Validate environment on module load
validateEnvironment();
