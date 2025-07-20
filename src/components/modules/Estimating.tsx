import React, { useState, useEffect } from 'react';
import {
  FileText,
  PoundSterling,
  CheckCircle,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const demoEstimates = [
  {
    id: 1,
    title: 'Office Renovation',
    client: 'Acme Corp',
    amount: 25000,
    status: 'approved',
    created: '2024-01-10',
  },
  {
    id: 2,
    title: 'Warehouse Expansion',
    client: 'LogiX',
    amount: 48000,
    status: 'pending',
    created: '2024-01-15',
  },
  {
    id: 3,
    title: 'Retail Fitout',
    client: 'ShopSmart',
    amount: 12000,
    status: 'rejected',
    created: '2024-01-20',
  },
];

const Estimating: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('estimatingStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('estimatingStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Estimating & Proposals
        </h1>
        <p className='text-gray-600'>
          Manage estimates, proposals, and cost breakdowns
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
          Estimating Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <PoundSterling className='h-8 w-8 text-constructbms-blue mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Estimates</p>
                <p className='text-2xl font-bold'>{demoEstimates.length}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Approved</p>
                <p className='text-2xl font-bold'>
                  {demoEstimates.filter(e => e.status === 'approved').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <FileText className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Pending</p>
                <p className='text-2xl font-bold'>
                  {demoEstimates.filter(e => e.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Recent Estimates</h2>
          <button className='flex items-center px-4 py-2 bg-constructbms-blue text-black rounded-lg text-sm font-medium hover:bg-constructbms-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Estimate
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Title
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Client
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Amount
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {demoEstimates.map(est => (
              <tr key={est.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{est.title}</td>
                <td className='px-4 py-2'>{est.client}</td>
                <td className='px-4 py-2'>£{est.amount.toLocaleString()}</td>
                <td className='px-4 py-2 capitalize'>{est.status}</td>
                <td className='px-4 py-2'>{est.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Estimating;
