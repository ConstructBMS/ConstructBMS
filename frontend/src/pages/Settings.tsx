import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getIconStrict } from '@/design/icons';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          Settings
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mt-2'>
          Manage your account and system settings
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              {getIconStrict('user')}
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your personal account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <div className='font-medium'>Name</div>
                <div className='text-sm text-gray-500'>{user?.name}</div>
              </div>
              <div>
                <div className='font-medium'>Email</div>
                <div className='text-sm text-gray-500'>{user?.email}</div>
              </div>
              <div>
                <div className='font-medium'>Role</div>
                <Badge
                  variant={
                    user?.role === 'super_admin' ? 'default' : 'secondary'
                  }
                >
                  {user?.role}
                </Badge>
              </div>
              <Button variant='outline' className='w-full'>
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users & Roles Management */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              {getIconStrict('users')}
              Users & Roles
            </CardTitle>
            <CardDescription>
              Manage users, roles, and permissions for the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <div className='font-medium'>Access Level</div>
                <div className='text-sm text-gray-500'>
                  {user?.role === 'super_admin'
                    ? 'Full Access'
                    : user?.role === 'admin'
                      ? 'Administrative Access'
                      : 'Limited Access'}
                </div>
              </div>
              <div>
                <div className='font-medium'>Permissions</div>
                <div className='text-sm text-gray-500'>
                  {user?.role === 'super_admin'
                    ? 'All permissions including overrides'
                    : user?.role === 'admin'
                      ? 'User and role management'
                      : 'Basic system access'}
                </div>
              </div>
              <Button
                variant='outline'
                className='w-full'
                onClick={() =>
                  (window.location.href = '/settings/users-and-roles')
                }
              >
                Manage Users & Roles
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              {getIconStrict('settings')}
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system-wide settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <div className='font-medium'>Environment</div>
                <div className='text-sm text-gray-500'>Development</div>
              </div>
              <div>
                <div className='font-medium'>Version</div>
                <div className='text-sm text-gray-500'>1.0.0</div>
              </div>
              <Button variant='outline' className='w-full' disabled>
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              {getIconStrict('shield')}
              Security
            </CardTitle>
            <CardDescription>
              Manage security settings and authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <div className='font-medium'>Authentication</div>
                <div className='text-sm text-gray-500'>JWT Token</div>
              </div>
              <div>
                <div className='font-medium'>Session</div>
                <div className='text-sm text-gray-500'>Active</div>
              </div>
              <Button variant='outline' className='w-full'>
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              {getIconStrict('bell')}
              Notifications
            </CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <div className='font-medium'>Email Notifications</div>
                <div className='text-sm text-gray-500'>Enabled</div>
              </div>
              <div>
                <div className='font-medium'>System Alerts</div>
                <div className='text-sm text-gray-500'>Enabled</div>
              </div>
              <Button variant='outline' className='w-full'>
                Notification Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              {getIconStrict('database')}
              Data & Privacy
            </CardTitle>
            <CardDescription>
              Manage data retention and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <div className='font-medium'>Data Retention</div>
                <div className='text-sm text-gray-500'>7 years</div>
              </div>
              <div>
                <div className='font-medium'>Backup Frequency</div>
                <div className='text-sm text-gray-500'>Daily</div>
              </div>
              <Button variant='outline' className='w-full'>
                Data Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
