import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle, Plus, ChevronUp, ChevronDown } from 'lucide-react';

const demoSprints = [
  {
    id: 1,
    name: 'Sprint 1',
    status: 'completed',
    tasks: 12,
    endDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Sprint 2',
    status: 'active',
    tasks: 8,
    endDate: '2024-01-29',
  },
  {
    id: 3,
    name: 'Sprint 3',
    status: 'planned',
    tasks: 10,
    endDate: '2024-02-12',
  },
];

const Agile: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('agileStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('agileStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Agile Projects</h1>
        <p className='text-gray-600'>Manage agile sprints and iterations</p>
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
          Agile Metrics
        </button>
        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Zap className='h-8 w-8 text-constructbms-blue mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Sprints</p>
                <p className='text-2xl font-bold'>{demoSprints.length}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Completed</p>
                <p className='text-2xl font-bold'>
                  {demoSprints.filter(s => s.status === 'completed').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Zap className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Active</p>
                <p className='text-2xl font-bold'>
                  {demoSprints.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Sprints</h2>
          <button className='flex items-center px-4 py-2 bg-constructbms-blue text-black rounded-lg text-sm font-medium hover:bg-constructbms-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Sprint
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Name
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Tasks
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                End Date
              </th>
            </tr>
          </thead>
          <tbody>
            {demoSprints.map(sprint => (
              <tr key={sprint.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{sprint.name}</td>
                <td className='px-4 py-2 capitalize'>{sprint.status}</td>
                <td className='px-4 py-2'>{sprint.tasks}</td>
                <td className='px-4 py-2'>{sprint.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Agile;
