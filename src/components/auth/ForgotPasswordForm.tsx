import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield,
  Mail,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send reset email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div>
            <div className='mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
              Check your email
            </h2>
            <p className='mt-2 text-center text-sm text-gray-600'>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>

          <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
            <h4 className='text-sm font-medium text-blue-800 mb-2'>
              What's next?
            </h4>
            <div className='text-xs text-blue-700 space-y-1'>
              <div>• Check your email for a password reset link</div>
              <div>• Click the link to set a new password</div>
              <div>• Return here to sign in with your new password</div>
            </div>
          </div>

          <div className='space-y-4'>
            <button
              onClick={onBackToLogin}
              className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-constructbms-blue'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-constructbms-blue'>
            <Shield className='h-8 w-8 text-black' />
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Reset your password
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your email address and we'll send you a link to reset your
            password
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

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Email address
            </label>
            <div className='mt-1 relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-constructbms-blue focus:border-constructbms-blue sm:text-sm'
                placeholder='Enter your email'
              />
            </div>
          </div>

          <div className='space-y-4'>
            <button
              type='submit'
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-constructbms-blue hover:bg-constructbms-black text-black hover:text-white'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-constructbms-blue transition-colors`}
            >
              {isLoading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Sending reset link...
                </>
              ) : (
                'Send reset link'
              )}
            </button>

            <button
              type='button'
              onClick={onBackToLogin}
              className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-constructbms-blue'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
