import {
  ChevronDown,
  LogOut,
  Settings,
  Shield,
  User,
  UserCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Temporarily disabled to test modal clicks
    // document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = () => {
    const role = user?.app_metadata?.role;
    switch (role) {
      case 'super_admin':
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Administrator';
      case 'user':
        return 'User';
      default:
        return 'User';
    }
  };

  const getRoleIcon = () => {
    const role = user?.app_metadata?.role;
    if (role === 'super_admin' || role === 'superadmin' || role === 'admin') {
      return <Shield className='h-3 w-3' />;
    }
    return <User className='h-3 w-3' />;
  };

  if (!user) {
    return (
      <Button
        variant='outline'
        onClick={() => navigate('/login')}
        className='flex items-center space-x-2'
      >
        <User className='h-4 w-4' />
        <span>Sign In</span>
      </Button>
    );
  }

  return (
    <div className='relative' ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 hover:bg-accent rounded-md p-1 transition-colors'
      >
        {/* Avatar */}
        <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center'>
          <span className='text-sm font-medium text-primary-foreground'>
            {getUserInitials()}
          </span>
        </div>

        {/* User Info */}
        <div className='hidden sm:block text-left'>
          <div className='text-sm font-medium'>{getUserDisplayName()}</div>
          <div className='text-xs text-muted-foreground flex items-center space-x-1'>
            {getRoleIcon()}
            <span>{getRoleDisplayName()}</span>
          </div>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className='absolute top-full right-0 mt-2 w-64 bg-popover border rounded-md shadow-lg z-50'>
          {/* User Info Header */}
          <div className='p-4 border-b'>
            <div className='flex items-center space-x-3'>
              <div className='h-10 w-10 rounded-full bg-primary flex items-center justify-center'>
                <span className='text-sm font-medium text-primary-foreground'>
                  {getUserInitials()}
                </span>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-medium truncate'>
                  {getUserDisplayName()}
                </div>
                <div className='text-xs text-muted-foreground truncate'>
                  {user.email}
                </div>
                <div className='text-xs text-muted-foreground flex items-center space-x-1 mt-1'>
                  {getRoleIcon()}
                  <span>{getRoleDisplayName()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className='p-2'>
            <button
              onClick={handleProfileClick}
              className='w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors'
            >
              <UserCircle className='h-4 w-4' />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={handleProfileClick}
              className='w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors'
            >
              <Settings className='h-4 w-4' />
              <span>Account Settings</span>
            </button>

            <div className='border-t my-2' />

            <button
              onClick={handleSignOut}
              className='w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-destructive hover:text-destructive'
            >
              <LogOut className='h-4 w-4' />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
