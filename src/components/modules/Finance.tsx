import React, { useState, useEffect } from 'react';
import {
  PoundSterling,
  CheckCircle,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const demoTransactions = [
  {
    id: 1,
    description: 'Invoice Payment',
    amount: 5000,
    type: 'income',
    date: '2024-01-25',
  },
  {
    id: 2,
    description: 'Material Purchase',
    amount: -1200,
    type: 'expense',
    date: '2024-01-24',
  },
  {
    id: 3,
    description: 'Consulting Fee',
    amount: 2000,
    type: 'income',
    date: '2024-01-20',
  },
];

const Finance: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('financeStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('financeStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Finance</h1>
        <p className='text-gray-600'>
          Manage financial transactions and reports
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
          Finance Metrics
        </button>

        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <PoundSterling className='h-8 w-8 text-constructbms-blue mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Transactions</p>
                <p className='text-2xl font-bold'>{demoTransactions.length}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Income</p>
                <p className='text-2xl font-bold'>
                  {demoTransactions.filter(t => t.type === 'income').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <PoundSterling className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Expense</p>
                <p className='text-2xl font-bold'>
                  {demoTransactions.filter(t => t.type === 'expense').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Transactions</h2>
          <button className='flex items-center px-4 py-2 bg-constructbms-blue text-black rounded-lg text-sm font-medium hover:bg-constructbms-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Transaction
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Description
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Amount
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Type
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {demoTransactions.map(tx => (
              <tr key={tx.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{tx.description}</td>
                <td className='px-4 py-2'>£{tx.amount.toLocaleString()}</td>
                <td className='px-4 py-2 capitalize'>{tx.type}</td>
                <td className='px-4 py-2'>{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Finance;
