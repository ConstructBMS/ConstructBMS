import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const demoPayroll = [
  {
    id: 1,
    employee: 'John Smith',
    amount: 3500,
    status: 'paid',
    date: '2024-01-25',
  },
  {
    id: 2,
    employee: 'Sarah Johnson',
    amount: 2800,
    status: 'pending',
    date: '2024-01-25',
  },
  {
    id: 3,
    employee: 'Mike Wilson',
    amount: 3200,
    status: 'paid',
    date: '2024-01-20',
  },
];

const PAYE: React.FC = () => {
  const [statsExpanded, setStatsExpanded] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('payeStatsExpanded');
    if (savedState !== null) {
      setStatsExpanded(JSON.parse(savedState));
    }
  }, []);

  const toggleStats = () => {
    const newState = !statsExpanded;
    setStatsExpanded(newState);
    localStorage.setItem('payeStatsExpanded', JSON.stringify(newState));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>PAYE</h1>
        <p className='text-gray-600'>Manage payroll and tax deductions</p>
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
          Payroll Metrics
        </button>
        {statsExpanded && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200'>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CreditCard className='h-8 w-8 text-archer-neon mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Total Payroll</p>
                <p className='text-2xl font-bold'>{demoPayroll.length}</p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CheckCircle className='h-8 w-8 text-green-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Paid</p>
                <p className='text-2xl font-bold'>
                  {demoPayroll.filter(p => p.status === 'paid').length}
                </p>
              </div>
            </div>
            <div className='bg-white rounded-xl border p-6 flex items-center'>
              <CreditCard className='h-8 w-8 text-blue-500 mr-4' />
              <div>
                <p className='text-sm text-gray-500'>Pending</p>
                <p className='text-2xl font-bold'>
                  {demoPayroll.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='bg-white rounded-xl border p-6 mt-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Payroll</h2>
          <button className='flex items-center px-4 py-2 bg-archer-neon text-black rounded-lg text-sm font-medium hover:bg-archer-black hover:text-white transition-colors'>
            <Plus className='h-4 w-4 mr-2' /> New Payroll
          </button>
        </div>
        <table className='w-full'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Employee
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Amount
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Status
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {demoPayroll.map(payroll => (
              <tr key={payroll.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2'>{payroll.employee}</td>
                <td className='px-4 py-2'>
                  £{payroll.amount.toLocaleString()}
                </td>
                <td className='px-4 py-2 capitalize'>{payroll.status}</td>
                <td className='px-4 py-2'>{payroll.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PAYE;
