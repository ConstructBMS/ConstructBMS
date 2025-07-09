import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  CheckCircle,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { getPendingUserCount } from '../../services/userService';

const demoUsers = [
  {
    id: 1,
    name: 'Tom Harvey',
    role: 'Admin',
    status: 'active',
    email: 'tom@archer.com',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Manager',
    status: 'active',
    email: 'sarah@archer.com',
  },
  {
    id: 3,
    name: 'Mike Wilson',
    role: 'User',
    status: 'inactive',
    email: 'mike@archer.com',
  },
];

const UsersRoles: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('usersStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    async function fetchPending() {
      try {
        setPendingCount(await getPendingUserCount());
      } catch {}
    }
    fetchPending();
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('usersStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
          Users & Role Management
          {pendingCount > 0 && (
            <span className='ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5'>
              {pendingCount}
            </span>
          )}
        </h1>
        <p className='text-gray-600'>Manage users, roles, and permissions</p>
      </div>

      {/* Stats Cards */}
      <div className='mt-4'>
        <button
          onClick={toggleStats}
          className='flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors mb-4'
        >
          {statsExpanded ? (
            <ChevronUp className='h-4 w-4' />
          ) : (
            <ChevronDown className='h-4 w-4' />
          )}
          User Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Users className='h-8 w-8 text-archer-neon mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Users</p>
                <p className='text-2xl font-bold'>{demoUsers.length}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Active</p>
                <p className='text-2xl font-bold'>
                  {demoUsers.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Shield className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Roles</p>
                <p className='text-2xl font-bold'>
                  {[...new Set(demoUsers.map(u => u.role))].length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Users</h2>
          <button className='flex items-center px-4 py-2 bg-archer-neon text-black rounded-lg text-sm font-medium hover:bg-archer-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New User
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Name
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Role
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {demoUsers.map(user => (
              <tr key={user.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{user.name}</td>
                <td className='px-4 py-2'>{user.role}</td>
                <td className='px-4 py-2 capitalize'>{user.status}</td>
                <td className='px-4 py-2'>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersRoles;
