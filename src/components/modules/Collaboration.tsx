import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageCircle,
  CheckCircle,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const demoCollaborations = [
  {
    id: 1,
    name: 'Project Alpha Team',
    members: 8,
    status: 'active',
    lastActivity: '2024-01-25',
  },
  {
    id: 2,
    name: 'Design Review Group',
    members: 5,
    status: 'active',
    lastActivity: '2024-01-24',
  },
  {
    id: 3,
    name: 'Client Feedback',
    members: 3,
    status: 'inactive',
    lastActivity: '2024-01-20',
  },
];

const Collaboration: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('collaborationStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem(
      'collaborationStatsExpanded',
      JSON.stringify(newState)
    );
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Team Collaboration</h1>
        <p className='text-gray-600'>
          Manage team collaboration and communication
        </p>
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
          Collaboration Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Users className='h-8 w-8 text-archer-neon mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Teams</p>
                <p className='text-2xl font-bold'>
                  {demoCollaborations.length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Active</p>
                <p className='text-2xl font-bold'>
                  {demoCollaborations.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <MessageCircle className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Members</p>
                <p className='text-2xl font-bold'>
                  {demoCollaborations.reduce((sum, c) => sum + c.members, 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Collaboration Teams</h2>
          <button className='flex items-center px-4 py-2 bg-archer-neon text-black rounded-lg text-sm font-medium hover:bg-archer-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Team
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Team Name
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Members
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Last Activity
              </th>
            </tr>
          </thead>
          <tbody>
            {demoCollaborations.map(team => (
              <tr key={team.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{team.name}</td>
                <td className='px-4 py-2'>{team.members}</td>
                <td className='px-4 py-2 capitalize'>{team.status}</td>
                <td className='px-4 py-2'>{team.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Collaboration;
