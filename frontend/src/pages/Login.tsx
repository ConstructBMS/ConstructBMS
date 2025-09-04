import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'
      style={{ backgroundColor: '#1e293b' }}
    >
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-lg'>C</span>
          </div>
          <h2
            className='mt-6 text-center text-3xl font-extrabold'
            style={{ color: '#f9fafb' }}
          >
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className='mt-2 text-center text-sm' style={{ color: '#e5e7eb' }}>
            {isSignUp
              ? 'Join ConstructBMS today'
              : 'Welcome back to ConstructBMS'}
          </p>

          {isDemoMode && (
            <div
              className='mt-4 p-3 rounded-md'
              style={{ backgroundColor: '#3b82f6', borderColor: '#60a5fa' }}
            >
              <p className='text-sm' style={{ color: '#f9fafb' }}>
                🎭 <strong>Demo Mode:</strong> Supabase not configured. You can
                sign in with any email/password.
              </p>
            </div>
          )}
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            {isSignUp && (
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium'
                  style={{ color: '#f9fafb' }}
                >
                  Full Name
                </label>
                <input
                  id='name'
                  name='name'
                  type='text'
                  required={isSignUp}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className='mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:z-10 sm:text-sm'
                  style={{
                    backgroundColor: '#4b5563',
                    borderColor: '#6b7280',
                    color: '#1f2937',
                    placeholderColor: '#9ca3af',
                  }}
                  placeholder='Enter your full name'
                />
              </div>
            )}

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium'
                style={{ color: '#f9fafb' }}
              >
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:z-10 sm:text-sm'
                style={{
                  backgroundColor: '#4b5563',
                  borderColor: '#6b7280',
                  color: '#1f2937',
                  placeholderColor: '#9ca3af',
                }}
                placeholder='Enter your email'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium'
                style={{ color: '#f9fafb' }}
              >
                Password
              </label>
              <div className='mt-1 relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='appearance-none relative block w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:z-10 sm:text-sm'
                  style={{
                    backgroundColor: '#4b5563',
                    borderColor: '#6b7280',
                    color: '#1f2937',
                    placeholderColor: '#9ca3af',
                  }}
                  placeholder='Enter your password'
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent border-none'
                  style={{ backgroundColor: 'transparent !important' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' style={{ color: '#9ca3af' }} />
                  ) : (
                    <Eye className='h-5 w-5' style={{ color: '#9ca3af' }} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div
              className='rounded-md p-4'
              style={{ backgroundColor: '#dc2626' }}
            >
              <div className='text-sm' style={{ color: '#f9fafb' }}>
                {error}
              </div>
            </div>
          )}

          <div>
            <button
              type='submit'
              disabled={loading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
              style={{ backgroundColor: '#2563eb !important' }}
            >
              {loading ? (
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className='text-center'>
            <button
              type='button'
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setEmail('');
                setPassword('');
                setName('');
              }}
              className='text-sm font-medium'
              style={{ color: '#60a5fa' }}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
