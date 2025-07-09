import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        // Handle specific error types
        if (error.message.includes('invalid')) {
          setError(
            'Please enter a valid email address. Some domains may be restricted for security reasons. Try using a common domain like gmail.com, outlook.com, or yahoo.com.'
          );
        } else if (error.message.includes('password')) {
          setError('Password must be at least 6 characters long.');
        } else if (error.message.includes('rate limit')) {
          setError('Too many sign-up attempts. Please try again later.');
        } else if (error.message.includes('already registered')) {
          setError(
            'An account with this email already exists. Please try logging in instead.'
          );
        } else {
          setError(`Sign-up failed: ${error.message}`);
        }
      } else {
        // User created successfully, now create user record and assign default role
        if (data.user) {
          try {
            await createUserRecordAndAssignDefaultRole(data.user);
            setSuccess(true);
          } catch (userError) {
            console.error('Error creating user record:', userError);
            // Still show success since auth user was created
            setSuccess(true);
          }
        } else {
          setSuccess(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createUserRecordAndAssignDefaultRole = async (authUser: any) => {
    try {
      // Get organization (assuming single organization for now)
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('name', 'Archer Build Ltd')
        .single();

      if (orgError) {
        console.error('Organization not found:', orgError);
        throw new Error('Organization not found');
      }

      // Get default role
      const { data: defaultRole, error: roleError } = await supabase
        .from('roles')
        .select('*')
        .eq('name', 'default')
        .eq('organization_id', org.id)
        .single();

      if (roleError) {
        console.error('Default role not found:', roleError);
        throw new Error(
          'Default role not found. Please run setupDefaultRole() first.'
        );
      }

      // Create user record
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
          organization_id: org.id,
          is_active: true,
          password_hash: '', // Not needed for Supabase auth
          avatar_url: authUser.user_metadata?.avatar_url || null,
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user record:', userError);
        throw userError;
      }

      // Assign default role
      const { error: roleAssignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authUser.id,
          role_id: defaultRole.id,
        });

      if (roleAssignError) {
        console.error('Error assigning default role:', roleAssignError);
        throw roleAssignError;
      }

      console.log(
        '✅ User record created and default role assigned successfully'
      );
    } catch (error) {
      console.error('Error in createUserRecordAndAssignDefaultRole:', error);
      throw error;
    }
  };

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
            Sign Up for Archer
          </h2>
        </div>

        {success ? (
          <div className='text-green-600 text-center mb-4'>
            Account created successfully! Please check your email to confirm
            your account.
            <br />
            <span className='text-gray-700 text-sm block mt-2'>
              You have been assigned the default role. An admin can change your
              role later.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className='space-y-4'>
            <div>
              <label className='block text-gray-700 mb-1'>Email</label>
              <input
                type='email'
                className='w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-archer-neon focus:border-archer-neon'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete='email'
                placeholder='Enter your email address'
              />
            </div>
            <div>
              <label className='block text-gray-700 mb-1'>Password</label>
              <input
                type='password'
                className='w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-archer-neon focus:border-archer-neon'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete='new-password'
                minLength={6}
                placeholder='Enter your password (min 6 characters)'
              />
            </div>
            {error && (
              <div className='text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200'>
                {error}
              </div>
            )}
            <button
              type='submit'
              className='w-full bg-archer-neon text-black py-2 rounded font-bold hover:bg-black hover:text-white transition-colors text-lg shadow'
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        )}
        {/* Placeholder for admin notification */}
        {success && (
          <div className='mt-6 text-sm text-black bg-archer-neon bg-opacity-20 p-3 rounded'>
            <strong>Admin notification:</strong> A new user has signed up with
            the default role.
            <br />
            (In production, trigger an email or dashboard notification to
            admin.)
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpForm;
