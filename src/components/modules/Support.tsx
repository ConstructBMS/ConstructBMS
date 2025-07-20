import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  CheckCircle,
  Clock,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const demoTickets = [
  {
    id: 1,
    title: 'Login Issue',
    status: 'open',
    priority: 'high',
    created: '2024-01-25',
  },
  {
    id: 2,
    title: 'Feature Request',
    status: 'closed',
    priority: 'medium',
    created: '2024-01-24',
  },
  {
    id: 3,
    title: 'Bug Report',
    status: 'open',
    priority: 'low',
    created: '2024-01-23',
  },
];

const Support: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('supportStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('supportStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Support Center</h1>
        <p className='text-gray-600'>
          Manage support tickets and customer inquiries
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
          Support Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <MessageSquare className='h-8 w-8 text-constructbms-blue mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Tickets</p>
                <p className='text-2xl font-bold'>{demoTickets.length}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Closed</p>
                <p className='text-2xl font-bold'>
                  {demoTickets.filter(t => t.status === 'closed').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Clock className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Open</p>
                <p className='text-2xl font-bold'>
                  {demoTickets.filter(t => t.status === 'open').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='bg-white rounded-xl border p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Support Tickets</h2>
          <button className='flex items-center px-4 py-2 bg-constructbms-blue text-black rounded-lg text-sm font-medium hover:bg-constructbms-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Ticket
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Title
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Priority
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {demoTickets.map(ticket => (
              <tr key={ticket.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{ticket.title}</td>
                <td className='px-4 py-2 capitalize'>{ticket.status}</td>
                <td className='px-4 py-2 capitalize'>{ticket.priority}</td>
                <td className='px-4 py-2'>{ticket.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Support;
