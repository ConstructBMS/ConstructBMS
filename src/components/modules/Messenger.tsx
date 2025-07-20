import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  CheckCircle,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const demoMessages = [
  {
    id: 1,
    sender: 'John Smith',
    message: 'Project update needed',
    time: '10:30 AM',
    status: 'read',
  },
  {
    id: 2,
    sender: 'Sarah Johnson',
    message: 'Meeting scheduled for tomorrow',
    time: '09:15 AM',
    status: 'unread',
  },
  {
    id: 3,
    sender: 'Mike Wilson',
    message: 'Document review complete',
    time: 'Yesterday',
    status: 'read',
  },
];

const Messenger: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('messengerStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('messengerStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Messenger & Communications
        </h1>
        <p className='text-gray-600'>
          Manage messaging and team communications
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
          Messenger Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <MessageCircle className='h-8 w-8 text-constructbms-blue mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Messages</p>
                <p className='text-2xl font-bold'>{demoMessages.length}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Read</p>
                <p className='text-2xl font-bold'>
                  {demoMessages.filter(m => m.status === 'read').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Send className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Unread</p>
                <p className='text-2xl font-bold'>
                  {demoMessages.filter(m => m.status === 'unread').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Recent Messages</h2>
          <button className='flex items-center px-4 py-2 bg-constructbms-blue text-black rounded-lg text-sm font-medium hover:bg-constructbms-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Message
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Sender
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Message
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Time
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {demoMessages.map(msg => (
              <tr key={msg.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{msg.sender}</td>
                <td className='px-4 py-2'>{msg.message}</td>
                <td className='px-4 py-2'>{msg.time}</td>
                <td className='px-4 py-2 capitalize'>{msg.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Messenger;
