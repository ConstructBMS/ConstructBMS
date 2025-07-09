import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPasswordForm: React.FC = () => {
  console.log('ResetPasswordForm component loaded');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Check if we have the necessary parameters for password reset
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');

  useEffect(() => {
    // Debug: Log all URL parameters
    console.log('ResetPasswordForm - URL Parameters:', {
      accessToken: accessToken,
      refreshToken: refreshToken,
      type: type,
      allParams: Object.fromEntries(searchParams.entries()),
      currentUrl: window.location.href,
    });
  }, [accessToken, refreshToken, type, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Check if Supabase is configured
      const isSupabaseConfigured = () => {
        const url = import.meta.env.VITE_SUPABASE_URL || '';
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        return (
          url &&
          key &&
          url !== 'https://your-project.supabase.co' &&
          url !== 'https://localhost' &&
          key !== 'your-anon-key-here' &&
          key !== 'disabled-for-local-dev' &&
          !url.includes('your-project') &&
          !key.includes('your-anon-key')
        );
      };

      if (isSupabaseConfigured()) {
        // Use the main Supabase client but get the session immediately
        const { supabase } = await import('../../services/supabase');

        // Get the current session immediately before AuthContext can interfere
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log('Password reset - checking current session:', {
          hasSession: !!session,
          sessionError: sessionError,
          userEmail: session?.user?.email,
        });

        if (sessionError) {
          console.error('Error getting current session:', sessionError);
          throw new Error('Failed to get current session');
        }

        if (!session) {
          throw new Error(
            'No valid session found. Please request a new password reset.'
          );
        }

        // Validate the session has required data
        if (!session.user || !session.access_token) {
          throw new Error(
            'Invalid session data. Please request a new password reset.'
          );
        }

        // Now try to update the password immediately
        console.log(
          'Attempting to update password for user:',
          session.user?.email
        );
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          console.error('Password update error:', updateError);
          throw new Error(updateError.message);
        }

        console.log('Password updated successfully');

        // Clear any stored session
        localStorage.removeItem('password_reset_session');

        // Sign out to force re-login
        await supabase.auth.signOut();
      } else {
        // Demo mode - simulate password reset
        console.log('Demo mode: Simulating password reset');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setIsSuccess(true);

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div>
            <div className='mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
              Password Reset Successful
            </h2>
            <p className='mt-2 text-center text-sm text-gray-600'>
              Your password has been updated successfully. You'll be redirected
              to the login page shortly.
            </p>
          </div>

          <div className='bg-green-50 border border-green-200 rounded-md p-4'>
            <h4 className='text-sm font-medium text-green-800 mb-2'>
              What's next?
            </h4>
            <div className='text-xs text-green-700 space-y-1'>
              <div>• Your password has been updated</div>
              <div>• You can now sign in with your new password</div>
              <div>• Redirecting to login page...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-archer-neon'>
            <Shield className='h-8 w-8 text-black' />
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Set New Password
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your new password below
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='rounded-md bg-red-50 p-4'>
              <div className='flex'>
                <AlertCircle className='h-5 w-5 text-red-400' />
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-red-800'>{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                New Password
              </label>
              <div className='mt-1 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-archer-neon focus:border-archer-neon sm:text-sm'
                  placeholder='Enter your new password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700'
              >
                Confirm New Password
              </label>
              <div className='mt-1 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className='appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-archer-neon focus:border-archer-neon sm:text-sm'
                  placeholder='Confirm your new password'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-archer-neon hover:bg-archer-black text-black hover:text-white'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-archer-neon transition-colors`}
            >
              {isLoading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Updating password...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
