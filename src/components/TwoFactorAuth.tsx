import React, { useState, useEffect } from 'react';
import {
  Shield,
  Smartphone,
  Mail,
  Key,
  Check,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Download,
  Lock,
  Unlock,
} from 'lucide-react';
import { TwoFactorAuthService } from '../services/twoFactorAuth';
import type { TwoFactorAuthStatus } from '../services/twoFactorAuth';
import { useAuth } from '../contexts/AuthContext';

interface TwoFactorAuthProps {
  onStatusChange?: (enabled: boolean) => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ onStatusChange }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<TwoFactorAuthStatus>({
    enabled: false,
    method: null,
    backupCodes: [],
  });
  const [loading, setLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<'initial' | 'method' | 'verification' | 'complete'>('initial');
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms' | 'email' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [setupData, setSetupData] = useState<{ otpauthUrl?: string, qrCodeDataUrl?: string; secret: string; } | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const currentStatus = await TwoFactorAuthService.getStatus();
      setStatus(currentStatus);
      onStatusChange?.(currentStatus.enabled);
    } catch (error) {
      console.error('Error loading 2FA status:', error);
      setError('Failed to load 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async () => {
    if (!selectedMethod) {
      setError('Please select a 2FA method');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (selectedMethod === 'totp') {
        // For TOTP, we need to generate a secret and show it to the user
        const setup = await TwoFactorAuthService.startSetup(selectedMethod);
        setSetupData({
          secret: setup.secret,
          ...(setup.qrCodeDataUrl && { qrCodeDataUrl: setup.qrCodeDataUrl }),
          ...(setup.otpauthUrl && { otpauthUrl: setup.otpauthUrl }),
        });
        setSetupStep('verification');
        setSuccess('Scan the QR code with your authenticator app, or use manual entry');
      } else {
        // For email/SMS, send verification code
        await TwoFactorAuthService.sendVerificationCode(selectedMethod);
        setSetupStep('verification');
        setSuccess(`Verification code sent to your ${selectedMethod}`);
      }
    } catch (error) {
      console.error('Error starting 2FA setup:', error);
      setError('Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let isValid = false;

      if (selectedMethod === 'totp') {
        isValid = await TwoFactorAuthService.completeSetup(verificationCode);
      } else {
        isValid = await TwoFactorAuthService.verifyEmailSMSCode(verificationCode);
        if (isValid) {
          // Complete the setup
          isValid = await TwoFactorAuthService.completeSetup(verificationCode);
        }
      }

      if (isValid) {
        setSetupStep('complete');
        setSuccess('Two-factor authentication enabled successfully!');
        await loadStatus();
        setTimeout(() => {
          setSetupStep('initial');
          setVerificationCode('');
          setSelectedMethod(null);
        }, 3000);
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setError('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await TwoFactorAuthService.disable();
      setSuccess('Two-factor authentication disabled');
      await loadStatus();
      setShowDisableConfirm(false);
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setError('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newCodes = await TwoFactorAuthService.generateNewBackupCodes();
      setStatus(prev => ({ ...prev, backupCodes: newCodes }));
      setSuccess('New backup codes generated');
    } catch (error) {
      console.error('Error generating backup codes:', error);
      setError('Failed to generate backup codes');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
    setTimeout(() => setSuccess(null), 2000);
  };

  const downloadBackupCodes = () => {
    const codes = status.backupCodes.join('\n');
    const blob = new Blob([codes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'totp':
        return <Smartphone className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'sms':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Key className="w-5 h-5" />;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'totp':
        return 'Authenticator App';
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-constructbms-blue" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Display */}
      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-3">
          {status.enabled ? (
            <Shield className="w-6 h-6 text-green-600" />
          ) : (
            <Shield className="w-6 h-6 text-gray-400" />
          )}
          <div>
            <h4 className="font-medium text-gray-900">
              Two-Factor Authentication
            </h4>
            <p className="text-sm text-gray-600">
              {status.enabled 
                ? `Enabled via ${getMethodName(status.method || '')}`
                : 'Add an extra layer of security to your account'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {status.enabled ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Check className="w-3 h-3 mr-1" />
              Enabled
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Disabled
            </span>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800">{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

                {/* Setup Flow */}
          {!status.enabled && setupStep === 'initial' && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900">Choose 2FA Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button
                onClick={() => setSelectedMethod('totp')}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedMethod === 'totp'
                    ? 'border-constructbms-blue bg-constructbms-blue/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-5 h-5 text-constructbms-blue mb-1" />
                <h4 className="font-medium text-gray-900 text-sm">Authenticator App</h4>
                <p className="text-xs text-gray-600">
                  Use Google Authenticator, Authy, or similar apps
                </p>
              </button>

                          <button
                onClick={() => setSelectedMethod('email')}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedMethod === 'email'
                    ? 'border-constructbms-blue bg-constructbms-blue/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mail className="w-5 h-5 text-constructbms-blue mb-1" />
                <h4 className="font-medium text-gray-900 text-sm">Email</h4>
                <p className="text-xs text-gray-600">
                  Receive codes via email
                </p>
              </button>

                          <button
                onClick={() => setSelectedMethod('sms')}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedMethod === 'sms'
                    ? 'border-constructbms-blue bg-constructbms-blue/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-5 h-5 text-constructbms-blue mb-1" />
                <h4 className="font-medium text-gray-900 text-sm">SMS</h4>
                <p className="text-xs text-gray-600">
                  Receive codes via text message
                </p>
              </button>
          </div>

          {selectedMethod && (
            <button
              onClick={handleStartSetup}
              disabled={loading}
              className="w-full md:w-auto px-6 py-2 bg-constructbms-blue text-white rounded-lg hover:bg-constructbms-blue/90 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Continue'}
            </button>
          )}
        </div>
      )}

      {/* Verification Step */}
      {!status.enabled && setupStep === 'verification' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Verify Setup</h3>
          
          {/* TOTP Setup with QR Code */}
          {selectedMethod === 'totp' && setupData && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">Scan QR Code</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Open your authenticator app and scan this QR code
                </p>
                {setupData.qrCodeDataUrl ? (
                  <div className="flex justify-center">
                    <img 
                      src={setupData.qrCodeDataUrl} 
                      alt="QR Code for authenticator app"
                      className="border border-gray-200 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      QR code generation failed. Please use manual entry below.
                    </p>
                  </div>
                )}
              </div>

              {/* Manual Entry Fallback */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="text-constructbms-blue hover:text-constructbms-blue/80 text-sm font-medium"
                >
                  {showManualEntry ? 'Hide' : 'Show'} manual entry
                </button>
                
                {showManualEntry && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Manual Entry</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      If QR code doesn't work, manually add this to your authenticator app:
                    </p>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Account Name
                        </label>
                        <input
                          type="text"
                          value={`ConstructBMS (${user?.email || 'user'})`}
                          readOnly
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Secret Key
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={setupData.secret}
                            readOnly
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white font-mono"
                          />
                          <button
                            onClick={() => copyToClipboard(setupData.secret)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Code Input */}
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter verification code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-constructbms-blue focus:border-transparent"
              maxLength={6}
            />
            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleVerifyCode}
                disabled={loading || !verificationCode.trim()}
                className="px-4 py-2 bg-constructbms-blue text-white rounded-lg hover:bg-constructbms-blue/90 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
              <button
                onClick={() => {
                  setSetupStep('initial');
                  setVerificationCode('');
                  setSelectedMethod(null);
                  setSetupData(null);
                  setShowManualEntry(false);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

                {/* Enabled 2FA Management */}
          {status.enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">2FA Settings</h3>
            <button
              onClick={() => setShowDisableConfirm(true)}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
            >
              <Unlock className="w-4 h-4 inline mr-2" />
              Disable 2FA
            </button>
          </div>

                        {/* Current Method */}
              <div className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getMethodIcon(status.method || '')}
                <div>
                  <h4 className="font-medium text-gray-900">
                    Current Method: {getMethodName(status.method || '')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Last used: {status.lastUsed ? new Date(status.lastUsed).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>

                        {/* Backup Codes */}
              <div className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">Backup Codes</h4>
                <p className="text-sm text-gray-600">
                  Use these codes if you lose access to your 2FA method
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  {showBackupCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleGenerateBackupCodes}
                  disabled={loading}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadBackupCodes}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showBackupCodes && status.backupCodes.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {status.backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <code className="text-sm font-mono">{code}</code>
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {status.backupCodes.length === 0 && (
              <p className="text-sm text-gray-500">No backup codes available</p>
            )}
          </div>
        </div>
      )}

      {/* Disable Confirmation Modal */}
      {showDisableConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Disable 2FA</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to disable two-factor authentication? This will make your account less secure.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDisable}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
              <button
                onClick={() => setShowDisableConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth; 
