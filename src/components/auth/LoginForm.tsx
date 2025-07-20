import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import ForgotPasswordForm from './ForgotPasswordForm';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedRememberMe = localStorage.getItem('remember_me') === 'true';

    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  // Show forgot password form if requested
  if (showForgotPassword) {
    return <ForgotPasswordForm onBackToLogin={handleBackToLogin} />;
  }

  // If already authenticated, this shouldn't render, but just in case
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 bg-white rounded-xl shadow border border-gray-100 p-8'>
        <div className='flex flex-col items-center mb-4'>
          {/* Archer Logo SVG */}
          <svg
            width='48'
            height='48'
            viewBox='0 0 36 36'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='mb-2'
          >
            <rect width='36' height='36' rx='8' fill='#00FF85' />
            <path
              d='M10 26L18 10L26 26H22.5L18 17.5L13.5 26H10Z'
              fill='black'
            />
          </svg>
          <h2 className='text-2xl font-extrabold text-black tracking-tight'>
            Sign in to Archer
          </h2>
        </div>

        <form className='space-y-4' onSubmit={handleSubmit}>
          {error && (
            <div className='rounded-md bg-red-50 p-4 border border-red-200'>
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
              <label htmlFor='email' className='block text-gray-700 mb-1'>
                Email address
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-constructbms-blue focus:border-constructbms-blue'
                  placeholder='Enter your email'
                />
              </div>
            </div>

            <div>
              <label htmlFor='password' className='block text-gray-700 mb-1'>
                Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-constructbms-blue focus:border-constructbms-blue'
                  placeholder='Enter your password'
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
          </div>

          {/* Remember Me Checkbox */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className='h-4 w-4 text-constructbms-blue focus:ring-constructbms-blue border-gray-300 rounded'
              />
              <label
                htmlFor='remember-me'
                className='ml-2 block text-sm text-gray-700'
              >
                Remember me
              </label>
            </div>
            <div className='text-sm'>
              <button
                type='button'
                onClick={handleForgotPassword}
                className='font-medium text-constructbms-blue hover:text-constructbms-black'
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading || authLoading}
            className={`w-full py-2 px-4 border border-transparent text-lg font-bold rounded transition-colors ${
              isLoading || authLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-constructbms-blue text-black hover:bg-black hover:text-white'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-constructbms-blue shadow`}
          >
            {isLoading || authLoading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block'></div>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className='text-center mt-4'>
          <span className='text-sm text-gray-600'>Don't have an account? </span>
          <Link
            to='/signup'
            className='text-constructbms-blue hover:text-constructbms-black font-medium'
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
