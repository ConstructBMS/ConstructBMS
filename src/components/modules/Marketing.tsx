import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  CheckCircle,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const demoCampaigns = [
  {
    id: 1,
    name: 'Q1 Brand Campaign',
    status: 'active',
    budget: 5000,
    startDate: '2024-01-01',
  },
  {
    id: 2,
    name: 'Social Media Push',
    status: 'completed',
    budget: 2000,
    startDate: '2023-12-01',
  },
  {
    id: 3,
    name: 'Email Newsletter',
    status: 'draft',
    budget: 500,
    startDate: '2024-02-01',
  },
];

const Marketing: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('marketingStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('marketingStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Marketing</h1>
        <p className='text-gray-600'>
          Manage marketing campaigns and strategies
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
          Marketing Metrics
        </button>
        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Megaphone className='h-8 w-8 text-constructbms-blue mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Campaigns</p>
                <p className='text-2xl font-bold'>{demoCampaigns.length}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Active</p>
                <p className='text-2xl font-bold'>
                  {demoCampaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <Megaphone className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Completed</p>
                <p className='text-2xl font-bold'>
                  {demoCampaigns.filter(c => c.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Campaigns</h2>
          <button className='flex items-center px-4 py-2 bg-constructbms-blue text-black rounded-lg text-sm font-medium hover:bg-constructbms-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Campaign
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
                Budget
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Start Date
              </th>
            </tr>
          </thead>
          <tbody>
            {demoCampaigns.map(campaign => (
              <tr key={campaign.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{campaign.name}</td>
                <td className='px-4 py-2 capitalize'>{campaign.status}</td>
                <td className='px-4 py-2'>
                  £{campaign.budget.toLocaleString()}
                </td>
                <td className='px-4 py-2'>{campaign.startDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Marketing;
