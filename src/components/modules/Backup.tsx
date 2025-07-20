import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const demoBackups = [
  { id: 1, type: 'auto', date: '2024-01-25', status: 'success' },
  { id: 2, type: 'manual', date: '2024-01-20', status: 'success' },
  { id: 3, type: 'auto', date: '2024-01-15', status: 'failed' },
];

const Backup: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('backupStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('backupStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Backup & Recovery</h1>
        <p className='text-gray-600'>Manage backups and restore points</p>
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
          Backup Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <RefreshCw className='h-8 w-8 text-constructbms-blue mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Backups</p>
                <p className='text-2xl font-bold'>{demoBackups.length}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Success</p>
                <p className='text-2xl font-bold'>
                  {demoBackups.filter(b => b.status === 'success').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <AlertCircle className='h-8 w-8 text-red-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Failed</p>
                <p className='text-2xl font-bold'>
                  {demoBackups.filter(b => b.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Backup History</h2>
          <button className='flex items-center px-4 py-2 bg-constructbms-blue text-black rounded-lg text-sm font-medium hover:bg-constructbms-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Backup
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Type
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Date
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {demoBackups.map(b => (
              <tr key={b.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2 capitalize'>{b.type}</td>
                <td className='px-4 py-2'>{b.date}</td>
                <td className='px-4 py-2 capitalize'>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Backup;
